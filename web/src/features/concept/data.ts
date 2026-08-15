// 개념 데이터 접근층. 화면은 이 파일만 보고, 저장 위치는 몰라도 된다.
//
// 지금은 sample.ts 를 그대로 돌려준다. Phase 5 에서 집필분이 나오면
// loadConcepts() 안을 `fetch(BASE + 'content/concepts.json')` 로 바꾸는 것으로 끝난다.
// (본문이 저작물이면 dataLoader 의 암호화 샤드로 옮겨도 시그니처는 그대로다)

import type { SubjectId } from '../../types';
import type { Concept } from './types';
import { SAMPLE_CONCEPTS } from './sample';

let cache: Concept[] | null = null;

export async function loadConcepts(): Promise<Concept[]> {
  cache ??= SAMPLE_CONCEPTS;
  return cache;
}

export async function loadSubjectConcepts(subject: SubjectId): Promise<Concept[]> {
  const all = await loadConcepts();
  return all.filter((c) => c.subject === subject);
}

export async function getConcept(id: string): Promise<Concept | undefined> {
  const all = await loadConcepts();
  return all.find((c) => c.id === id);
}

/** 집필이 끝난 과목 집합 — "집필 예정" 안내를 띄울지 판단한다. */
export async function subjectsWithConcepts(): Promise<Set<SubjectId>> {
  const all = await loadConcepts();
  return new Set(all.map((c) => c.subject));
}
