// 프롬프트 템플릿. 버전을 id 에 박아 두고(why-v1) 캐시 키에 그대로 쓴다.
// 문구를 고치면 반드시 id 를 올린다(why-v2). 안 그러면 옛 답변이 캐시에서 계속 나온다.

import { SUBJECT_NAMES, type SubjectId } from '../../types';
import { stripMarkdown } from '../concept/markdown';

export const WHY_TEMPLATE_ID = 'why-v1';

/** 개념 노트 본문은 앞 800자까지만 보낸다. 토큰비와 저작권 노출을 동시에 줄인다. */
export const CONTEXT_CHAR_LIMIT = 800;

/** 기출 원문을 opt-in 으로 실을 때도 이 개수·길이를 넘기지 않는다. */
export const ITEM_LIMIT = 3;
export const ITEM_CHAR_LIMIT = 160;

export const WHY_SYSTEM = `당신은 정보처리기사 필기를 준비하는 비전공자 친구 옆에 앉은 튜터입니다.
말투는 한국어, 다정한 존댓말입니다. 전문용어는 처음 나올 때 괄호로 짧게 풀이합니다.

다음 다섯 부분을 이 순서 그대로, 하나도 빠뜨리지 말고 씁니다.

① 한 줄 요약 — 개념을 한 문장으로.
② 비유 — 한국에서 매일 겪는 일상 소재 하나로 비유합니다. 택배, 지하철, 카페 주문, 은행 창구, 편의점, 아파트 관리실 같은 것 중에서 고르고, 비유는 하나만 씁니다.
③ 대응표 — 비유와 개념을 짝지은 마크다운 표를 3~5행 씁니다. 헤더는 정확히 | 비유 | 개념 | 왜 같나 | 로 합니다.
④ 이 비유가 깨지는 지점 — 비유를 그대로 믿으면 틀리게 되는 지점을 정확히 하나 씁니다. "…까지는 같지만, 실제로는 …" 형태로 씁니다. 이 항목이 없으면 실패한 답변입니다.
⑤ 시험에는 이렇게 나온다 — 1~2문장으로.

형식 규칙
- 전체 350~500자(공백 포함)로 씁니다. 폰에서 한 화면에 들어와야 합니다.
- 제목은 ### 이하만 씁니다. # 과 ## 는 쓰지 않습니다.
- 코드블록과 이미지는 쓰지 않습니다. 표는 ③에서만 씁니다.
- 각 부분은 "### ① 한 줄 요약" 처럼 번호와 제목을 붙여 시작합니다.
- 주어진 개념 노트에 없는 수치·연도·규격은 지어내지 않습니다.`;

export interface WhyPromptConcept {
  id: string;
  title: string;
  subject: SubjectId;
  body: string;
}

export interface WhyPromptItem {
  id: string;
  stem: string;
}

export interface WhyPromptInput {
  concept: WhyPromptConcept;
  /** 기출 원문 동봉 여부. 기본 false(저작권). */
  includeItems?: boolean;
  items?: WhyPromptItem[];
}

export interface BuiltPrompt {
  templateId: string;
  system: string;
  user: string;
  /** 실제로 실린 개념 본문 길이 */
  contextChars: number;
  /** 실제로 실린 기출 수 */
  includedItems: number;
}

export interface ClippedContext {
  text: string;
  /** 말줄임표를 뺀 실제 본문 글자 수 */
  chars: number;
  truncated: boolean;
}

/** 마크다운을 걷어낸 평문에서 앞 limit 자만. 잘리면 말줄임표를 붙인다. */
export function clipContext(body: string, limit = CONTEXT_CHAR_LIMIT): ClippedContext {
  const flat = stripMarkdown(body);
  if (flat.length <= limit) return { text: flat, chars: flat.length, truncated: false };
  return { text: `${flat.slice(0, limit)}…`, chars: limit, truncated: true };
}

export function buildWhyPrompt(input: WhyPromptInput): BuiltPrompt {
  const { concept } = input;
  const context = clipContext(concept.body);

  const lines: string[] = [
    `[과목] ${concept.subject}과목 ${SUBJECT_NAMES[concept.subject]}`,
    `[개념] ${concept.title}`,
    '',
    `[개념 노트 발췌 — 앞 ${CONTEXT_CHAR_LIMIT}자]`,
    context.text,
    '',
  ];

  const items = input.includeItems ? (input.items ?? []).slice(0, ITEM_LIMIT) : [];
  if (items.length > 0) {
    lines.push('[관련 기출 지문 발췌]');
    for (const it of items) {
      const stem = it.stem.replace(/\s+/g, ' ').trim();
      const clipped = stem.length > ITEM_CHAR_LIMIT ? `${stem.slice(0, ITEM_CHAR_LIMIT)}…` : stem;
      lines.push(`- ${clipped}`);
    }
    lines.push('');
  } else {
    lines.push('(기출 문항 원문은 저작권 때문에 보내지 않았습니다. 위 개념 노트만으로 설명해 주세요.)', '');
  }

  lines.push('위 개념을 ①~⑤ 형식으로 설명해 주세요. ④를 빠뜨리지 마세요.');

  return {
    templateId: WHY_TEMPLATE_ID,
    system: WHY_SYSTEM,
    user: lines.join('\n'),
    contextChars: context.chars,
    includedItems: items.length,
  };
}
