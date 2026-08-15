// 풀이 세션 문항 선정 — 순수 함수. 경량 인덱스만 보고 거른다.
// 본문(ItemBody)은 세션이 실제로 시작될 때 loadItems() 로 받는다.

import type { LightItem, SubjectId } from '../../types';
import { makeRng, shuffled } from './shared/rng';

/** 0 = 과목 미분류 */
export type SubjectFilterId = SubjectId | 0;

export type SortMode = 'exam' | 'frequency' | 'random';

export interface PracticeFilter {
  /** 빈 배열 = 전 과목 (미분류 포함) */
  subjects: SubjectFilterId[];
  /** 빈 배열 = 연도 무관. 연도를 고르면 연도가 없는 문항은 빠진다. */
  years: number[];
  /** 빈 배열 = 태그 무관. 여러 개면 OR. */
  tags: string[];
  /** 오답노트만 */
  onlyWrong: boolean;
  /** 아직 안 푼 문항만 */
  onlyUnattempted: boolean;
  /** 출제 횟수 c 가 이 값 이상 (1 = 제한 없음) */
  minFrequency: number;
  /** 같은 variant_group 은 한 번만 */
  dedupeVariants: boolean;
  sort: SortMode;
  /** 0 이면 제한 없음 */
  limit: number;
  seed: string | number;
}

export interface FilterContext {
  wrong: ReadonlySet<string>;
  attempted: ReadonlySet<string>;
}

export const emptyContext: FilterContext = { wrong: new Set(), attempted: new Set() };

export function defaultFilter(seed: string | number = 'practice'): PracticeFilter {
  return {
    subjects: [],
    years: [],
    tags: [],
    onlyWrong: false,
    onlyUnattempted: false,
    minFrequency: 1,
    dedupeVariants: true,
    sort: 'exam',
    limit: 20,
    seed,
  };
}

const subjectOf = (l: LightItem): SubjectFilterId => (l.s ?? 0);

/** limit 을 적용하기 전, 조건에 맞는 전체 문항. 개수 미리보기에 쓴다. */
export function matchItems(
  index: readonly LightItem[],
  f: PracticeFilter,
  ctx: FilterContext = emptyContext,
): LightItem[] {
  return index.filter((l) => {
    if (f.subjects.length && !f.subjects.includes(subjectOf(l))) return false;
    if (f.years.length && (l.y == null || !f.years.includes(l.y))) return false;
    if (f.tags.length && !(l.t ?? []).some((t) => f.tags.includes(t))) return false;
    if (f.onlyWrong && !ctx.wrong.has(l.i)) return false;
    if (f.onlyUnattempted && ctx.attempted.has(l.i)) return false;
    if (f.minFrequency > 1 && (l.c ?? 1) < f.minFrequency) return false;
    return true;
  });
}

/**
 * 정렬 + variant 중복 제거 + 개수 제한까지 끝낸 최종 출제 목록.
 * variant 중복 제거는 정렬 뒤에 한다 — 'frequency' 정렬이면 같은 변형 중
 * 출제가 잦았던 쪽이 남는다.
 */
export function selectPractice(
  index: readonly LightItem[],
  f: PracticeFilter,
  ctx: FilterContext = emptyContext,
): LightItem[] {
  const matched = matchItems(index, f, ctx);

  let ordered: LightItem[];
  if (f.sort === 'random') {
    ordered = shuffled(matched, makeRng(f.seed));
  } else if (f.sort === 'frequency') {
    ordered = matched.slice().sort((a, b) => (b.c ?? 0) - (a.c ?? 0) || a.i.localeCompare(b.i));
  } else {
    ordered = matched.slice().sort((a, b) => a.i.localeCompare(b.i));
  }

  if (f.dedupeVariants) {
    const seen = new Set<string>();
    ordered = ordered.filter((l) => {
      if (!l.v) return true;
      if (seen.has(l.v)) return false;
      seen.add(l.v);
      return true;
    });
  }

  return f.limit > 0 ? ordered.slice(0, f.limit) : ordered;
}

/** 필터 화면에 띄우는 한 줄 요약 (세션 목록 라벨로도 쓴다). */
export function describeFilter(f: PracticeFilter, subjectNames: Record<number, string>): string {
  const parts: string[] = [];
  parts.push(f.subjects.length ? f.subjects.map((s) => subjectNames[s] ?? '미분류').join('·') : '전 과목');
  if (f.years.length) parts.push(`${f.years.join('·')}년`);
  if (f.tags.length) parts.push(f.tags.map((t) => t.replace(/^topic:/, '')).join('·'));
  if (f.onlyWrong) parts.push('오답만');
  if (f.onlyUnattempted) parts.push('미풀이만');
  if (f.minFrequency > 1) parts.push(`${f.minFrequency}회 이상`);
  return parts.join(' · ');
}
