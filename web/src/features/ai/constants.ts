// Gemini 연동 상수. 모델을 바꾸려면 여기 한 줄만 고친다.

/** 최신 flash 계열 하나로 고정. 개념 설명은 추론량이 적어 flash 로 충분하다. */
export const GEMINI_MODEL = 'gemini-2.5-flash';

export const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

/** 키 발급 안내 링크 (BYOK — 서버가 없으므로 키는 각자 발급한다) */
export const GEMINI_KEY_URL = 'https://aistudio.google.com/app/apikey';

/** SSE 스트리밍 엔드포인트. alt=sse 를 빼면 JSON 배열이 통째로 와서 타이핑 효과가 안 난다. */
export function streamUrl(model: string = GEMINI_MODEL): string {
  return `${GEMINI_API_BASE}/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`;
}

/** 키는 헤더로 보낸다. 쿼리스트링에 실으면 로그·리퍼러에 남는다. */
export const API_KEY_HEADER = 'x-goog-api-key';

export const LS_KEY = 'gisa.ai.geminiKey';
export const LS_SEND_ITEMS = 'gisa.ai.sendItemText';

export const GENERATION_CONFIG = {
  temperature: 0.7,
  topP: 0.95,
  maxOutputTokens: 1024,
} as const;
