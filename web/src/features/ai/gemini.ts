// Gemini streamGenerateContent(SSE) 클라이언트. 서버 없이 브라우저에서 바로 부른다.
// 네트워크에 닿는 부분과 순수 로직(요청 조립·SSE 파싱·오류 분류)을 분리해 두었다.
// 실제 키 없이도 뒤쪽 셋은 전부 테스트된다.

import { API_KEY_HEADER, GEMINI_MODEL, GENERATION_CONFIG, streamUrl } from './constants';
import type { BuiltPrompt } from './prompts';

// --- 요청 조립 -------------------------------------------------------------

export interface GeminiPart {
  text: string;
}
export interface GeminiRequest {
  systemInstruction: { parts: GeminiPart[] };
  contents: { role: 'user'; parts: GeminiPart[] }[];
  generationConfig: {
    temperature: number;
    topP: number;
    maxOutputTokens: number;
  };
}

export function buildRequestBody(p: BuiltPrompt): GeminiRequest {
  return {
    systemInstruction: { parts: [{ text: p.system }] },
    contents: [{ role: 'user', parts: [{ text: p.user }] }],
    generationConfig: { ...GENERATION_CONFIG },
  };
}

// --- SSE 파싱 --------------------------------------------------------------

/**
 * 청크가 줄 중간에서 끊겨도 되는 SSE 파서.
 * push() 는 그 청크로 완성된 이벤트의 data 문자열들만 돌려준다.
 */
export function createSseParser(): {
  push: (chunk: string) => string[];
  flush: () => string[];
} {
  let buf = '';
  let dataLines: string[] = [];

  const takeEvent = (out: string[]): void => {
    if (dataLines.length === 0) return;
    out.push(dataLines.join('\n'));
    dataLines = [];
  };

  const consumeLine = (raw: string, out: string[]): void => {
    const line = raw.replace(/\r$/, '');
    if (line === '') {
      takeEvent(out);
      return;
    }
    if (line.startsWith(':')) return; // 주석(keep-alive)
    const m = /^data:\s?(.*)$/.exec(line);
    if (m) dataLines.push(m[1]);
    // event:/id:/retry: 는 이 API 에서 쓰지 않는다
  };

  return {
    push(chunk: string): string[] {
      const out: string[] = [];
      buf += chunk;
      const lines = buf.split('\n');
      buf = lines.pop() ?? '';
      for (const l of lines) consumeLine(l, out);
      return out;
    },
    flush(): string[] {
      const out: string[] = [];
      if (buf) {
        consumeLine(buf, out);
        buf = '';
      }
      takeEvent(out);
      return out;
    },
  };
}

export interface GeminiEvent {
  text: string;
  finishReason?: string;
  blockReason?: string;
}

/** SSE data 한 덩어리에서 텍스트 조각을 뽑는다. 깨진 JSON 은 조용히 버린다. */
export function extractEvent(data: string): GeminiEvent | null {
  const trimmed = data.trim();
  if (!trimmed || trimmed === '[DONE]') return null;
  let json: unknown;
  try {
    json = JSON.parse(trimmed);
  } catch {
    return null;
  }
  const obj = json as {
    candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
    promptFeedback?: { blockReason?: string };
  };
  const cand = obj.candidates?.[0];
  const text = (cand?.content?.parts ?? []).map((p) => p.text ?? '').join('');
  return {
    text,
    finishReason: cand?.finishReason,
    blockReason: obj.promptFeedback?.blockReason,
  };
}

/** ReadableStream(SSE) → 텍스트 조각 스트림. 테스트에서는 가짜 스트림을 넣는다. */
export async function* streamText(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<string, void, void> {
  const reader = body.getReader();
  const dec = new TextDecoder();
  const parser = createSseParser();
  let finished: string | undefined;
  let blocked: string | undefined;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const data of parser.push(dec.decode(value, { stream: true }))) {
        const ev = extractEvent(data);
        if (!ev) continue;
        if (ev.blockReason) blocked = ev.blockReason;
        if (ev.finishReason) finished = ev.finishReason;
        if (ev.text) yield ev.text;
      }
    }
    for (const data of parser.flush()) {
      const ev = extractEvent(data);
      if (!ev) continue;
      if (ev.blockReason) blocked = ev.blockReason;
      if (ev.finishReason) finished = ev.finishReason;
      if (ev.text) yield ev.text;
    }
  } finally {
    reader.releaseLock();
  }

  if (blocked || (finished && finished !== 'STOP' && finished !== 'MAX_TOKENS')) {
    throw new AiError(
      'blocked',
      '모델이 이 요청에 답하지 않았어요',
      `안전 필터에 걸린 것 같습니다(사유: ${blocked ?? finished}). 개념 제목만 남기고 다시 시도해 보세요.`,
    );
  }
}

// --- 오류 분류 -------------------------------------------------------------

export type AiErrorKind =
  | 'no-key'
  | 'invalid-key'
  | 'forbidden'
  | 'quota'
  | 'bad-request'
  | 'server'
  | 'network'
  | 'aborted'
  | 'blocked'
  | 'empty'
  | 'unknown';

export class AiError extends Error {
  readonly kind: AiErrorKind;
  /** 다음에 뭘 하면 되는지 — 화면에 message 아래 작은 글씨로 붙는다 */
  readonly hint: string;
  readonly status?: number;

  constructor(kind: AiErrorKind, message: string, hint: string, status?: number) {
    super(message);
    this.name = 'AiError';
    this.kind = kind;
    this.hint = hint;
    this.status = status;
  }
}

/** 응답 본문에서 구글이 준 사유 문자열을 뽑는다(있으면 분류에 쓴다). */
export function reasonOf(bodyText: string): string {
  try {
    const j = JSON.parse(bodyText) as {
      error?: { status?: string; message?: string; details?: { reason?: string }[] };
    };
    return [j.error?.status, j.error?.details?.[0]?.reason, j.error?.message]
      .filter(Boolean)
      .join(' ');
  } catch {
    return bodyText.slice(0, 200);
  }
}

/** HTTP 실패를 사람이 뭘 해야 하는지로 바꾼다. 절대 한 문구로 뭉치지 않는다. */
export function classifyHttp(status: number, bodyText = ''): AiError {
  const reason = reasonOf(bodyText);

  if (status === 400 && /API_KEY_INVALID|API key not valid/i.test(reason)) {
    return new AiError(
      'invalid-key',
      'API 키가 올바르지 않습니다',
      'AI 설정에서 키를 다시 붙여넣어 주세요. 앞뒤 공백이나 따옴표가 섞이면 이 오류가 납니다.',
      status,
    );
  }
  if (status === 400) {
    return new AiError(
      'bad-request',
      '요청 형식이 거부되었습니다',
      `구글이 돌려준 사유: ${reason || '알 수 없음'}. 개념 본문이 지나치게 길지 않은지 확인해 주세요.`,
      status,
    );
  }
  if (status === 401 || status === 403) {
    const disabled = /SERVICE_DISABLED|has not been used|PERMISSION_DENIED/i.test(reason);
    return new AiError(
      'forbidden',
      '키에 권한이 없습니다',
      disabled
        ? 'Google AI Studio 에서 Generative Language API 가 켜져 있는지, 키에 건 제한(HTTP 리퍼러 등)이 이 사이트를 막고 있지 않은지 확인해 주세요.'
        : '키가 만료됐거나 삭제됐을 수 있습니다. AI 설정에서 새 키를 발급해 넣어 주세요.',
      status,
    );
  }
  if (status === 429) {
    return new AiError(
      'quota',
      '무료 한도를 넘었습니다',
      '분당·일일 요청 한도에 걸렸습니다. 1~2분 뒤에 다시 눌러 주세요. 이미 본 개념은 캐시에서 바로 나오니 한도를 쓰지 않습니다.',
      status,
    );
  }
  if (status >= 500) {
    return new AiError(
      'server',
      '구글 쪽 서버 오류입니다',
      `잠시 뒤 다시 시도해 주세요. (${status})`,
      status,
    );
  }
  return new AiError(
    'unknown',
    `예상 못 한 응답입니다 (${status})`,
    reason || '같은 증상이 반복되면 키를 새로 발급해 보세요.',
    status,
  );
}

/** fetch 자체가 던진 경우 — 오프라인·CORS·중단을 갈라 준다. */
export function classifyThrown(e: unknown): AiError {
  if (e instanceof AiError) return e;
  const name = (e as { name?: string } | null)?.name ?? '';
  if (name === 'AbortError') {
    return new AiError('aborted', '요청을 중단했습니다', '다시 물어보려면 버튼을 눌러 주세요.');
  }
  return new AiError(
    'network',
    '네트워크에 닿지 못했습니다',
    '오프라인이거나 방화벽이 generativelanguage.googleapis.com 을 막고 있을 수 있습니다. 연결을 확인하고 다시 시도해 주세요.',
  );
}

// --- 호출 ------------------------------------------------------------------

export interface StreamOptions {
  apiKey: string;
  prompt: BuiltPrompt;
  model?: string;
  signal?: AbortSignal;
  /** 테스트·모의용 주입구 */
  fetchImpl?: typeof fetch;
}

/** 실제 호출. 조각 단위로 yield 하므로 화면에서 그대로 타이핑 효과가 난다. */
export async function* streamGemini(opts: StreamOptions): AsyncGenerator<string, void, void> {
  if (!opts.apiKey.trim()) {
    throw new AiError(
      'no-key',
      'API 키가 없습니다',
      'AI 설정에서 Google AI Studio 키를 먼저 넣어 주세요.',
    );
  }

  const doFetch = opts.fetchImpl ?? fetch;
  let res: Response;
  try {
    res = await doFetch(streamUrl(opts.model ?? GEMINI_MODEL), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        [API_KEY_HEADER]: opts.apiKey.trim(),
      },
      body: JSON.stringify(buildRequestBody(opts.prompt)),
      signal: opts.signal,
    });
  } catch (e) {
    throw classifyThrown(e);
  }

  if (!res.ok) {
    let text = '';
    try {
      text = await res.text();
    } catch {
      text = '';
    }
    throw classifyHttp(res.status, text);
  }
  if (!res.body) {
    throw new AiError(
      'empty',
      '응답 본문이 비어 있습니다',
      '브라우저가 스트리밍을 지원하지 않는 것 같습니다. 최신 크롬·사파리에서 열어 주세요.',
    );
  }

  let got = false;
  for await (const chunk of streamText(res.body)) {
    got = true;
    yield chunk;
  }
  if (!got) {
    throw new AiError(
      'empty',
      '모델이 빈 답을 돌려줬습니다',
      '한 번 더 눌러 보세요. 반복되면 개념 노트 본문이 너무 짧지 않은지 확인해 주세요.',
    );
  }
}
