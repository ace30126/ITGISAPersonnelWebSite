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
  level?: 'core' | 'supporting' | 'trivia';
  /** 출제 빈도 티어. 파이프라인이 실제 출제량으로 계산해 넣는다. */
  tier?: Tier;
  tags: string[];
  /** 배정표의 개념명. 관련 기출 자동 연결의 키다. */
  keywords?: string[];
  /** 마크다운. SVG 는 떼어내고 `[[fig:n]]` 자리표시자가 남는다. */
  body: string;
  /** 수동 pin 된 문항 id */
  items: string[];
  /** kw 태그로 자동 연결된 문항 id. 같은 과목·고빈도 순으로 정렬돼 있다. */
  auto?: string[];
  quiz: ConceptQuiz[];
  diagrams?: ConceptDiagram[];
}

/** 출제 빈도 티어. 과목 내부 상대평가다. */
export type Tier = 'S' | 'A' | 'B' | 'C';
