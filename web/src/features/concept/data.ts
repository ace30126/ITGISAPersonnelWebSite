// 개념 데이터 접근층. 화면은 이 파일만 보고, 저장 위치는 몰라도 된다.
//
// Phase 5 집필분이 들어와 sample.ts 를 대체했다.
// 실제 출처는 암호화 샤드 `concepts/subject-{n}.json` 이며,
// pipeline/build/concepts.py 가 content/s{n}/*.md 를 컴파일해 만든다.

import type { SubjectId } from '../../types';
import { loadConceptShard } from '../../lib/dataLoader';
import type { Concept } from './types';
import { SAMPLE_CONCEPTS } from './sample';

const SUBJECTS: SubjectId[] = [1, 2, 3, 4, 5];

let cache: Promise<Concept[]> | null = null;

async function fetchAll(): Promise<Concept[]> {
  const shards = await Promise.all(
    SUBJECTS.map((s) => loadConceptShard<Concept>(s).catch(() => [] as Concept[])),
  );
  const all = shards.flat();
  // 집필 전이거나 복호화 전이면 샘플로 버틴다 — 빈 화면보다 낫다.
  return all.length ? all : SAMPLE_CONCEPTS;
}

export function loadConcepts(): Promise<Concept[]> {
  if (!cache) {
    cache = fetchAll().catch((e) => { cache = null; throw e; });
  }
  return cache;
}

export async function loadSubjectConcepts(subject: SubjectId): Promise<Concept[]> {
  const all = await loadConcepts();
  // 빈도 티어 순으로 보여 준다. 위에서부터 읽으면 그게 곧 우선순위다.
  const order: Record<string, number> = { S: 0, A: 1, B: 2, C: 3 };
  return all
    .filter((c) => c.subject === subject)
    .sort((a, b) => (order[a.tier ?? 'C'] ?? 3) - (order[b.tier ?? 'C'] ?? 3)
      || a.title.localeCompare(b.title, 'ko'));
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
