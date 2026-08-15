// 개념 노트 스키마 — 오케스트레이터가 고정한 형태 그대로다.
// Phase 5 에서 과목별 집필분이 JSON 으로 들어오면 sample.ts 만 갈아끼운다.

import type { SubjectId } from '../../types';

export interface ConceptQuiz {
  q: string;
  choices: string[];
  /** 정답 인덱스 (0-based) */
  a: number;
  why: string;
}

export interface ConceptDiagram {
  id: string;
  /** 빌드타임에 렌더된 인라인 SVG. stroke/fill 은 currentColor 로 쓴다. */
  svg: string;
}

export interface Concept {
  id: string;
  subject: SubjectId;
  title: string;
  level: 'core' | 'supporting' | 'trivia';
  tags: string[];
  /** 마크다운 */
  body: string;
  /** 수동 pin 된 문항 id */
  items: string[];
  quiz: ConceptQuiz[];
  diagrams?: ConceptDiagram[];
}

/** 출제 빈도 티어. 과목 내부 상대평가다. */
export type Tier = 'S' | 'A' | 'B' | 'C';
