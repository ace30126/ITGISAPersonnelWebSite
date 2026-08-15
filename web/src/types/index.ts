// 공유 타입 계약 — 오케스트레이터만 수정한다.
// feature 에이전트는 여기서 import 만 하고 고치지 않는다.

export type SubjectId = 1 | 2 | 3 | 4 | 5;
export const SUBJECT_NAMES: Record<SubjectId, string> = {
  1: '소프트웨어 설계',
  2: '소프트웨어 개발',
  3: '데이터베이스 구축',
  4: '프로그래밍 언어 활용',
  5: '정보시스템 구축관리',
};

/** 경량 인덱스 1행. stem/choices 가 없다 — 이것만으로 필터·통계·문항선정이 된다. */
export interface LightItem {
  /** id */ i: string;
  /** subject (없으면 미분류) */ s?: SubjectId;
  /** answer 1..4 */ a?: number;
  /** variant group */ v: string;
  /** 출제 횟수 (재출제 포함) — 빈도 티어의 근거 */ c: number;
  /** year */ y?: number;
  /** 해설 보유 */ e?: 1;
  /** 이미지 블록 보유 */ g?: 1;
  /** flags: ci=보기가 이미지, si=지문 일부가 이미지, sd/sm=원본 결함 */ f?: string[];
  /** tags */ t?: string[];
}

export interface Block {
  type: 'text' | 'code' | 'image';
  value?: string;
  lang?: string;
  src?: string;
}

/** 풀바디. 세션 시작 시 해당 과목 샤드만 내려받는다. */
export interface ItemBody {
  i: string;
  stem: string;
  choices: string[];
  blocks: Block[];
}

export interface Explanation { b: string; a?: string | null }
export interface ItemExpl { i: string; e: Explanation[] }

/** 화면에서 쓰는 합본 */
export interface Item extends LightItem, Omit<ItemBody, 'i'> {}

export interface Meta {
  subjects: Record<string, string>;
  counts: Record<string, number>;
  tags: [string, number][];
  total: number;
  with_expl: number;
  with_image: number;
  /** 보기가 통째로 이미지라 텍스트 버튼으로 그리면 안 되는 문항 */
  choices_image: string[];
}

// --- 학습 기록 (Dexie) ------------------------------------------------------

export type Mode = 'practice' | 'exam' | 'review' | 'concept';

export interface Attempt {
  id?: number;
  itemId: string;
  ts: number;
  chosen: number | null;
  correct: boolean;
  mode: Mode;
  elapsedMs: number;
  /**
   * 소속 세션. 이게 없으면 "attempts 가 유일한 진실 원천"이 실제로 깨진다 —
   * 모의고사 결과를 attempts 만으로 재구성할 수 없어 별도 저장이 필요해지고,
   * 그러면 백업에서 빠져 기기 이전 시 이력이 사라진다.
   * 나중에 붙였으므로 optional 이다. 없는 기록은 세션 미상으로 취급한다.
   */
  sid?: string;
}

/** attempts 가 유일한 진실 원천. srs/통계는 전부 여기서 재계산 가능하다. */
export interface Srs {
  itemId: string;
  ease: number;
  interval: number;
  due: number;
  reps: number;
  lapses: number;
}

export interface ExamResult {
  sid: string;
  ts: number;
  perSubject: Record<SubjectId, { correct: number; total: number }>;
  totalCorrect: number;
  /** 한 과목이라도 40% 미만 */ failedSubjects: SubjectId[];
  /** 과락 없음 AND 전체 60문항 이상 */ passed: boolean;
  /** 출제된 문항 순서 — 결과 화면에서 문항별 리뷰에 쓴다 */
  itemIds?: string[];
  /** itemId → 고른 보기(1..4), 미표기는 null */
  answers?: Record<string, number | null>;
}

/** 진행 중 세션 목록("이어 풀기")을 만들기 위한 최소 메타 */
export interface SessionMeta {
  sid: string;
  mode: Mode;
  ts: number;
  label?: string;
  done?: number;
  total?: number;
}

// --- AI --------------------------------------------------------------------

export interface AiAnswer {
  key: string;          // `${templateId}:${conceptId}`
  body: string;
  ts: number;
  vote?: 1 | -1;
}
