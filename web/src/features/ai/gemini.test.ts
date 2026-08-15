import { describe, expect, it, vi } from 'vitest';
import { SAMPLE_CONCEPTS } from '../concept/sample';
import { API_KEY_HEADER, GEMINI_MODEL, streamUrl } from './constants';
import {
  AiError,
  buildRequestBody,
  classifyHttp,
  classifyThrown,
  createSseParser,
  extractEvent,
  streamGemini,
  streamText,
} from './gemini';
import { buildWhyPrompt } from './prompts';

const prompt = buildWhyPrompt({ concept: SAMPLE_CONCEPTS[0] });

/** 가짜 SSE 스트림. chunks 를 그대로 흘려보낸다(줄 중간에서 끊어도 된다). */
function fakeStream(chunks: string[]): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(c) {
      for (const s of chunks) c.enqueue(enc.encode(s));
      c.close();
    },
  });
}

const sse = (obj: unknown): string => `data: ${JSON.stringify(obj)}\n\n`;
const chunk = (text: string, finishReason?: string) =>
  sse({ candidates: [{ content: { parts: [{ text }] }, ...(finishReason ? { finishReason } : {}) }] });

// --- 요청 조립 -------------------------------------------------------------

describe('buildRequestBody', () => {
  it('systemInstruction 과 contents 를 Gemini 스키마대로 만든다', () => {
    const body = buildRequestBody(prompt);
    expect(body.systemInstruction.parts[0].text).toBe(prompt.system);
    expect(body.contents).toHaveLength(1);
    expect(body.contents[0].role).toBe('user');
    expect(body.contents[0].parts[0].text).toBe(prompt.user);
  });

  it('generationConfig 를 싣는다', () => {
    const body = buildRequestBody(prompt);
    expect(body.generationConfig.temperature).toBe(0.7);
    expect(body.generationConfig.maxOutputTokens).toBe(1024);
  });

  it('JSON 직렬화가 되고 프롬프트 본문이 그대로 들어간다', () => {
    const json = JSON.stringify(buildRequestBody(prompt));
    expect(JSON.parse(json).contents[0].parts[0].text).toContain('[개념] 정규화와 이상 현상');
  });
});

describe('streamUrl', () => {
  it('alt=sse 를 붙인다 (빼면 스트리밍이 아니라 배열이 통째로 온다)', () => {
    expect(streamUrl()).toContain(':streamGenerateContent?alt=sse');
    expect(streamUrl()).toContain(GEMINI_MODEL);
  });
});

// --- SSE 파싱 --------------------------------------------------------------

describe('createSseParser', () => {
  it('이벤트 단위로 data 를 꺼낸다', () => {
    const p = createSseParser();
    expect(p.push('data: {"a":1}\n\ndata: {"a":2}\n\n')).toEqual(['{"a":1}', '{"a":2}']);
  });

  it('청크가 줄 중간에서 끊겨도 이어 붙인다', () => {
    const p = createSseParser();
    expect(p.push('data: {"a":')).toEqual([]);
    expect(p.push('1}\n\n')).toEqual(['{"a":1}']);
  });

  it('주석(keep-alive)과 CRLF 를 무시한다', () => {
    const p = createSseParser();
    expect(p.push(': ping\r\ndata: {"a":1}\r\n\r\n')).toEqual(['{"a":1}']);
  });

  it('마지막 이벤트가 빈 줄로 안 끝나도 flush 로 회수한다', () => {
    const p = createSseParser();
    expect(p.push('data: {"a":1}')).toEqual([]);
    expect(p.flush()).toEqual(['{"a":1}']);
  });
});

describe('extractEvent', () => {
  it('candidates 에서 텍스트를 뽑는다', () => {
    expect(extractEvent('{"candidates":[{"content":{"parts":[{"text":"안녕"}]}}]}')?.text).toBe('안녕');
  });

  it('여러 part 는 이어 붙인다', () => {
    const e = extractEvent('{"candidates":[{"content":{"parts":[{"text":"가"},{"text":"나"}]}}]}');
    expect(e?.text).toBe('가나');
  });

  it('깨진 JSON 과 [DONE] 은 null', () => {
    expect(extractEvent('{oops')).toBeNull();
    expect(extractEvent('[DONE]')).toBeNull();
    expect(extractEvent('   ')).toBeNull();
  });

  it('finishReason 과 blockReason 을 읽는다', () => {
    expect(extractEvent('{"candidates":[{"finishReason":"SAFETY"}]}')?.finishReason).toBe('SAFETY');
    expect(extractEvent('{"promptFeedback":{"blockReason":"OTHER"}}')?.blockReason).toBe('OTHER');
  });
});

describe('streamText (가짜 스트림)', () => {
  it('조각을 순서대로 흘려준다', async () => {
    const got: string[] = [];
    for await (const t of streamText(fakeStream([chunk('### ① '), chunk('한 줄 요약'), chunk('입니다', 'STOP')]))) {
      got.push(t);
    }
    expect(got).toEqual(['### ① ', '한 줄 요약', '입니다']);
    expect(got.join('')).toBe('### ① 한 줄 요약입니다');
  });

  it('한 청크에 여러 이벤트가 들어와도, 이벤트가 두 청크에 걸쳐도 같다', async () => {
    const one = chunk('가') + chunk('나');
    const half = one.length - 3;
    const got: string[] = [];
    for await (const t of streamText(fakeStream([one.slice(0, half), one.slice(half)]))) got.push(t);
    expect(got.join('')).toBe('가나');
  });

  it('MAX_TOKENS 로 끊긴 건 오류가 아니다(받은 데까지 쓴다)', async () => {
    const got: string[] = [];
    for await (const t of streamText(fakeStream([chunk('잘린 답', 'MAX_TOKENS')]))) got.push(t);
    expect(got).toEqual(['잘린 답']);
  });

  it('안전 필터에 걸리면 blocked 오류를 던진다', async () => {
    const run = async () => {
      for await (const _t of streamText(fakeStream([sse({ promptFeedback: { blockReason: 'SAFETY' } })]))) {
        void _t;
      }
    };
    await expect(run()).rejects.toMatchObject({ kind: 'blocked' });
  });
});

// --- 오류 분류 -------------------------------------------------------------

describe('classifyHttp — 상황마다 다른 안내', () => {
  const invalidKey = JSON.stringify({
    error: { status: 'INVALID_ARGUMENT', message: 'API key not valid. Please pass a valid API key.' },
  });

  it('400 + API_KEY_INVALID → 잘못된 키', () => {
    const e = classifyHttp(400, invalidKey);
    expect(e.kind).toBe('invalid-key');
    expect(e.message).toContain('키');
    expect(e.hint).toContain('공백');
  });

  it('그 밖의 400 → 요청 형식 문제(키 문제와 구분한다)', () => {
    expect(classifyHttp(400, '{"error":{"message":"too many tokens"}}').kind).toBe('bad-request');
  });

  it('403 → 권한, 429 → 쿼터, 500 → 서버', () => {
    expect(classifyHttp(403, '{"error":{"status":"PERMISSION_DENIED"}}').kind).toBe('forbidden');
    expect(classifyHttp(429).kind).toBe('quota');
    expect(classifyHttp(503).kind).toBe('server');
  });

  it('네 가지 안내 문구가 서로 다르다 — 한 문장으로 뭉치지 않는다', () => {
    const msgs = [
      classifyHttp(400, invalidKey),
      classifyHttp(403),
      classifyHttp(429),
      classifyThrown(new TypeError('Failed to fetch')),
    ].map((e) => `${e.message}/${e.hint}`);
    expect(new Set(msgs).size).toBe(4);
  });
});

describe('classifyThrown', () => {
  it('중단은 오류로 취급하되 따로 구분한다', () => {
    const e = classifyThrown(Object.assign(new Error('aborted'), { name: 'AbortError' }));
    expect(e.kind).toBe('aborted');
  });

  it('fetch 실패는 네트워크로 본다', () => {
    const e = classifyThrown(new TypeError('Failed to fetch'));
    expect(e.kind).toBe('network');
    expect(e.hint).toContain('generativelanguage.googleapis.com');
  });

  it('AiError 는 그대로 통과시킨다', () => {
    const src = new AiError('quota', 'a', 'b');
    expect(classifyThrown(src)).toBe(src);
  });
});

// --- 호출 경로 (fetch 주입) -------------------------------------------------

describe('streamGemini', () => {
  it('키가 없으면 네트워크에 나가기 전에 막는다', async () => {
    const fetchImpl = vi.fn();
    const run = async () => {
      for await (const _t of streamGemini({ apiKey: '  ', prompt, fetchImpl: fetchImpl as never })) {
        void _t;
      }
    };
    await expect(run()).rejects.toMatchObject({ kind: 'no-key' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('키를 URL 이 아니라 헤더로 보낸다', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(fakeStream([chunk('네', 'STOP')]), { status: 200 }),
    );
    const got: string[] = [];
    for await (const t of streamGemini({
      apiKey: 'AIzaTESTKEY',
      prompt,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })) {
      got.push(t);
    }
    expect(got.join('')).toBe('네');

    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).not.toContain('AIzaTESTKEY');
    expect((init.headers as Record<string, string>)[API_KEY_HEADER]).toBe('AIzaTESTKEY');
    expect(JSON.parse(String(init.body)).contents[0].parts[0].text).toContain('[개념]');
  });

  it('HTTP 실패는 본문까지 읽어 분류한다', async () => {
    const fetchImpl = vi.fn(async () =>
      new Response('{"error":{"status":"RESOURCE_EXHAUSTED"}}', { status: 429 }),
    );
    const run = async () => {
      for await (const _t of streamGemini({
        apiKey: 'AIzaX',
        prompt,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      })) {
        void _t;
      }
    };
    await expect(run()).rejects.toMatchObject({ kind: 'quota', status: 429 });
  });

  it('200 인데 내용이 하나도 없으면 empty 로 알린다', async () => {
    const fetchImpl = vi.fn(async () => new Response(fakeStream([': ping\n\n']), { status: 200 }));
    const run = async () => {
      for await (const _t of streamGemini({
        apiKey: 'AIzaX',
        prompt,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      })) {
        void _t;
      }
    };
    await expect(run()).rejects.toMatchObject({ kind: 'empty' });
  });
});
