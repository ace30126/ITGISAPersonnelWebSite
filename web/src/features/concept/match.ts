// 관련 기출 랭킹. pin 은 무조건 위, 자동 매칭은 점수순으로 그 아래.
// 자동 매칭분은 화면에서 "자동" 배지를 달아 사람이 고른 것과 구분한다.

import type { LightItem } from '../../types';
import type { Concept } from './types';
import { matchItems } from './freq';

export interface RelatedItem {
  id: string;
  light: LightItem;
  source: 'pinned' | 'auto';
  score: number;
  /** 왜 걸렸는지 — 화면 툴팁에 그대로 쓴다 */
  reason: string;
}

/** 제목·태그에서 검색 키워드를 뽑는다. 'db:정규화' 같은 접두어는 떼고 쓴다. */
export function keywordsOf(concept: Concept): string[] {
  const raw = [concept.title, ...concept.tags.map((t) => t.split(':').pop() ?? t)];
  const out = new Set<string>();
  for (const r of raw) {
    for (const w of r.split(/[\s/·,()]+/)) {
      const s = w.trim();
      // 한 글자는 오탐이 너무 많다(예: '큐' 는 예외적으로 허용).
      if (s.length >= 2) out.add(s);
      else if (s.length === 1 && /[가-힣]/.test(s)) out.add(s);
    }
  }
  return [...out];
}

const cOf = (l: LightItem): number => (Number.isFinite(l.c) && l.c > 0 ? l.c : 1);

export interface RankOptions {
  limit?: number;
  /** 있으면 지문 텍스트로 키워드 매칭까지 한다(본문 샤드를 이미 받은 화면에서만). */
  stems?: Map<string, string>;
}

/**
 * 자동 매칭 점수
 *   태그 겹침 1개당 2점 + 지문 키워드 히트 1개당 3점 + 출제횟수 × 0.5
 * 지문 히트가 태그보다 센 이유: 현재 인덱스 태그는 개념이 아니라 문제 유형이라
 * 변별력이 거의 없다.
 */
export function rankRelated(
  concept: Concept,
  index: LightItem[],
  opts: RankOptions = {},
): RelatedItem[] {
  const limit = opts.limit ?? 8;
  const { pinned, auto } = matchItems(concept, index);
  const kws = keywordsOf(concept);

  const pinnedRows: RelatedItem[] = pinned.map((l) => ({
    id: l.i,
    light: l,
    source: 'pinned',
    score: Number.POSITIVE_INFINITY,
    reason: '개념 노트에 직접 연결된 문항',
  }));

  const stems = opts.stems;
  const pool: LightItem[] = stems
    ? // 지문을 볼 수 있으면 같은 과목 전체가 후보다(태그 없는 문항이 대부분이라
      // 태그로만 거르면 정작 핵심 문항이 다 빠진다).
      index.filter((l) => l.s === concept.subject && !concept.items.includes(l.i))
    : auto;

  const autoRows: RelatedItem[] = [];
  for (const l of pool) {
    const tagHits = (l.t ?? []).filter((t) => concept.tags.includes(t));
    const stem = stems?.get(l.i) ?? '';
    const kwHits = stem ? kws.filter((k) => stem.includes(k)) : [];
    if (tagHits.length === 0 && kwHits.length === 0) continue;
    // 지문을 볼 수 있는데 키워드가 하나도 안 걸리면 태그만으로는 넣지 않는다.
    if (stems && kwHits.length === 0) continue;

    const score = tagHits.length * 2 + kwHits.length * 3 + cOf(l) * 0.5;
    const why: string[] = [];
    if (kwHits.length) why.push(`지문에 '${kwHits.slice(0, 3).join("', '")}'`);
    if (tagHits.length) why.push(`태그 ${tagHits.join(', ')}`);
    autoRows.push({ id: l.i, light: l, source: 'auto', score, reason: why.join(' · ') });
  }

  autoRows.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return [...pinnedRows, ...autoRows].slice(0, limit);
}
