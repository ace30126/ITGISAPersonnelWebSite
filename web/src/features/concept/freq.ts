// 출제 빈도 → 티어 계산. 순수 함수만 둔다(테스트 가능해야 하므로).
//
// 근거 데이터는 경량 인덱스의 두 필드뿐이다.
//   - LightItem.c : 그 문항이 실제로 출제된 횟수(재출제 포함)
//   - LightItem.t : 태그
// 지금 인덱스의 태그는 topic:keyword / wrong / kinds / code / calc 다섯 개뿐이라
// **개념 단위 태그가 아니다**. 그래서 태그 매칭은 신호가 약하다고 보고 가중치를
// 낮게(TAG_WEIGHT) 잡는다. 개념 노트가 수동으로 pin 한 문항이 주된 근거다.

import type { LightItem, SubjectId } from '../../types';
import type { Concept, Tier } from './types';

/** 수동 pin 된 문항의 가중치. */
export const PIN_WEIGHT = 1;
/** 태그로만 걸린 문항의 가중치. 태그가 거칠어서 4분의 1만 인정한다. */
export const TAG_WEIGHT = 0.25;

/** 이 개수 미만이면 과목 내 percentile 이 의미가 없어 절대 기준으로 넘어간다. */
export const RANK_MIN_N = 5;

/** 과목 내부 percentile 컷. */
export const TIER_PERCENTILE: Record<Exclude<Tier, 'C'>, number> = { S: 85, A: 60, B: 30 };

/**
 * 표본이 적을 때 쓰는 절대 기준 — 과목 가중치 총합 대비 점유율.
 * 한 회차 과목당 20문항이므로 5% ≈ "매 회차에 한 문제". 그보다 잦으면 S.
 */
export const TIER_SHARE: Record<Exclude<Tier, 'C'>, number> = { S: 0.06, A: 0.03, B: 0.012 };

export interface ConceptFreq {
  conceptId: string;
  subject: SubjectId;
  /** 가중 출제 횟수 */
  score: number;
  /** pin 으로 걸린 문항 수 */
  pinned: number;
  /** 태그로만 걸린 문항 수 */
  auto: number;
  /** 과목 가중치 총합 대비 점유율 (0~1) */
  share: number;
  /** 과목 내부 백분위. 표본 부족으로 절대 기준을 쓴 경우 null */
  percentile: number | null;
  tier: Tier;
  /** 인덱스에 없는 pin id — 개념 노트 오타 잡는 용도 */
  missing: string[];
}

const cOf = (l: LightItem): number =>
  Number.isFinite(l.c) && (l.c as number) > 0 ? (l.c as number) : 1;

/** 과목 문항만 추린다. 미분류(s 없음)는 어떤 과목에도 넣지 않는다. */
export function subjectItems(index: LightItem[], subject: SubjectId): LightItem[] {
  return index.filter((l) => l.s === subject);
}

/** 과목의 가중치 총합 = Σ c. 점유율의 분모다. */
export function subjectWeight(items: LightItem[]): number {
  return items.reduce((n, l) => n + cOf(l), 0);
}

export interface MatchResult {
  pinned: LightItem[];
  auto: LightItem[];
  missing: string[];
}

/**
 * 개념에 걸리는 문항을 찾는다.
 * - pinned: concept.items 에 적힌 id (과목이 달라도 인정한다. 결합도처럼
 *   1과목·4과목에 걸쳐 나오는 개념이 실제로 있다)
 * - auto  : 같은 과목이면서 태그가 하나 이상 겹치는 문항
 */
export function matchItems(concept: Concept, index: LightItem[]): MatchResult {
  const byId = new Map(index.map((l) => [l.i, l]));
  const pinnedIds = new Set(concept.items);

  const pinned: LightItem[] = [];
  const missing: string[] = [];
  for (const id of concept.items) {
    const hit = byId.get(id);
    if (hit) pinned.push(hit);
    else missing.push(id);
  }

  const tags = new Set(concept.tags);
  const auto = tags.size
    ? index.filter(
        (l) =>
          !pinnedIds.has(l.i) &&
          l.s === concept.subject &&
          !!l.t?.some((t) => tags.has(t)),
      )
    : [];

  return { pinned, auto, missing };
}

/** 가중 출제 횟수. pin 은 1배, 태그 매칭은 TAG_WEIGHT 배. */
export function conceptScore(m: Pick<MatchResult, 'pinned' | 'auto'>): number {
  const pin = m.pinned.reduce((n, l) => n + cOf(l), 0) * PIN_WEIGHT;
  const auto = m.auto.reduce((n, l) => n + cOf(l), 0) * TAG_WEIGHT;
  return pin + auto;
}

/**
 * 중간순위 백분위: (아래 개수 + 같은 값의 절반) / 전체 × 100.
 * 동점이 몰려도 한쪽으로 쏠리지 않는다.
 */
export function midRankPercentile(values: number[], v: number): number {
  if (values.length === 0) return 0;
  let below = 0;
  let equal = 0;
  for (const x of values) {
    if (x < v) below += 1;
    else if (x === v) equal += 1;
  }
  return ((below + equal / 2) / values.length) * 100;
}

export function tierFromPercentile(p: number): Tier {
  if (p >= TIER_PERCENTILE.S) return 'S';
  if (p >= TIER_PERCENTILE.A) return 'A';
  if (p >= TIER_PERCENTILE.B) return 'B';
  return 'C';
}

export function tierFromShare(share: number): Tier {
  if (share >= TIER_SHARE.S) return 'S';
  if (share >= TIER_SHARE.A) return 'A';
  if (share >= TIER_SHARE.B) return 'B';
  return 'C';
}

/**
 * 한 과목의 개념들에 티어를 매긴다.
 * 개념이 RANK_MIN_N 개 이상이면 과목 내부 백분위, 그 미만이면 점유율 절대 기준.
 * (집필 초기에 개념이 두세 개뿐일 때 백분위를 쓰면 무조건 C~A 로 눌려 버린다)
 */
export function computeSubjectFreq(
  concepts: Concept[],
  index: LightItem[],
  subject: SubjectId,
): ConceptFreq[] {
  const inSubject = concepts.filter((c) => c.subject === subject);
  const items = subjectItems(index, subject);
  const total = subjectWeight(items) || 1;

  const rows = inSubject.map((c) => {
    const m = matchItems(c, index);
    const score = conceptScore(m);
    return {
      conceptId: c.id,
      subject,
      score,
      pinned: m.pinned.length,
      auto: m.auto.length,
      share: score / total,
      missing: m.missing,
    };
  });

  const scores = rows.map((r) => r.score);
  const useRank = rows.length >= RANK_MIN_N;

  return rows.map((r) => {
    const percentile = useRank ? midRankPercentile(scores, r.score) : null;
    return {
      ...r,
      percentile,
      tier: percentile === null ? tierFromShare(r.share) : tierFromPercentile(percentile),
    };
  });
}

/** 여러 과목을 한 번에. 티어는 과목별로 따로 매겨진다. */
export function computeFreq(concepts: Concept[], index: LightItem[]): Map<string, ConceptFreq> {
  const out = new Map<string, ConceptFreq>();
  const subjects = new Set<SubjectId>(concepts.map((c) => c.subject));
  for (const s of subjects) {
    for (const row of computeSubjectFreq(concepts, index, s)) out.set(row.conceptId, row);
  }
  return out;
}

/** 과목별 태그 빈도 — 개념이 아직 없는 과목의 대체 내비게이션에 쓴다. */
export function tagCounts(items: LightItem[]): [string, number][] {
  const map = new Map<string, number>();
  for (const l of items) for (const t of l.t ?? []) map.set(t, (map.get(t) ?? 0) + 1);
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}
