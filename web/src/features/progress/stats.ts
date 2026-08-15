// 통계 — 전부 순수 함수. attempts 배열을 받아 집계만 한다.
//
// 저장하지 않는 이유: 집계값을 DB 에 두면 attempts 와 어긋나는 순간이 온다.
// 1,243문항 × 수천 attempt 규모에서는 매번 전량 집계해도 체감이 없다.

import type { Attempt, SubjectId } from '../../types';

export const DAY_MS = 86_400_000;

/** 로컬 자정 기준 'YYYY-MM-DD'. UTC 로 자르면 새벽 공부가 전날로 밀린다. */
export function dayKey(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** 로컬 자정의 epoch ms. */
export function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function addDays(ts: number, n: number): number {
  const d = new Date(ts);
  d.setDate(d.getDate() + n);
  return d.getTime();
}

export interface DayBucket {
  key: string;
  /** 그날 0시 epoch ms */
  ts: number;
  total: number;
  correct: number;
}

/** 오늘을 마지막 칸으로 두고 최근 n일 버킷을 만든다. 빈 날도 0 으로 채운다. */
export function dailyBuckets(
  attempts: Pick<Attempt, 'ts' | 'correct'>[],
  days: number,
  now: number = Date.now(),
): DayBucket[] {
  const today = startOfDay(now);
  const buckets: DayBucket[] = [];
  const index = new Map<string, DayBucket>();
  for (let i = days - 1; i >= 0; i--) {
    const ts = startOfDay(addDays(today, -i));
    const b: DayBucket = { key: dayKey(ts), ts, total: 0, correct: 0 };
    buckets.push(b);
    index.set(b.key, b);
  }
  for (const a of attempts) {
    const b = index.get(dayKey(a.ts));
    if (!b) continue;
    b.total++;
    if (a.correct) b.correct++;
  }
  return buckets;
}

/**
 * 연속 학습일수. 오늘 아직 안 풀었어도 어제까지 이어졌으면 유지된다
 * (자정 넘자마자 streak 0 으로 보이면 사람이 그만둔다).
 */
export function computeStreak(
  attempts: Pick<Attempt, 'ts'>[],
  now: number = Date.now(),
): number {
  if (attempts.length === 0) return 0;
  const days = new Set(attempts.map((a) => dayKey(a.ts)));
  const today = startOfDay(now);
  let cursor = days.has(dayKey(today)) ? today : startOfDay(addDays(today, -1));
  if (!days.has(dayKey(cursor))) return 0;
  let n = 0;
  while (days.has(dayKey(cursor))) {
    n++;
    cursor = startOfDay(addDays(cursor, -1));
  }
  return n;
}

export interface Tally {
  total: number;
  correct: number;
}

export function rate(t: Tally): number {
  return t.total === 0 ? 0 : t.correct / t.total;
}

export function pct(t: Tally): string {
  return t.total === 0 ? '–' : `${Math.round(rate(t) * 100)}%`;
}

/**
 * 과목별 누적 정답률. subjectOf 는 LightItem.s 로 만든 맵이고,
 * 과목 미분류(또는 인덱스에 없는 문항)는 0 번 칸에 모인다.
 */
export function subjectTally(
  attempts: Pick<Attempt, 'itemId' | 'correct'>[],
  subjectOf: Map<string, SubjectId>,
): Map<SubjectId | 0, Tally> {
  const out = new Map<SubjectId | 0, Tally>();
  for (const a of attempts) {
    const s: SubjectId | 0 = subjectOf.get(a.itemId) ?? 0;
    const t = out.get(s) ?? { total: 0, correct: 0 };
    t.total++;
    if (a.correct) t.correct++;
    out.set(s, t);
  }
  return out;
}

/** 문항별 누적 — 커버리지(몇 문항을 건드렸나) 계산용. */
export function coverage(
  attempts: Pick<Attempt, 'itemId'>[],
): { touched: number } {
  return { touched: new Set(attempts.map((a) => a.itemId)).size };
}

export function modeTally(
  attempts: Pick<Attempt, 'mode' | 'correct'>[],
): Map<string, Tally> {
  const out = new Map<string, Tally>();
  for (const a of attempts) {
    const t = out.get(a.mode) ?? { total: 0, correct: 0 };
    t.total++;
    if (a.correct) t.correct++;
    out.set(a.mode, t);
  }
  return out;
}

/** 최근 n일 합계. */
export function recentTally(
  attempts: Pick<Attempt, 'ts' | 'correct'>[],
  days: number,
  now: number = Date.now(),
): Tally {
  const from = startOfDay(addDays(startOfDay(now), -(days - 1)));
  const out: Tally = { total: 0, correct: 0 };
  for (const a of attempts) {
    if (a.ts < from) continue;
    out.total++;
    if (a.correct) out.correct++;
  }
  return out;
}

/** 평균 풀이 시간(초). 비정상치(30분 이상 방치)는 뺀다. */
export function avgSeconds(attempts: Pick<Attempt, 'elapsedMs'>[]): number {
  const xs = attempts.map((a) => a.elapsedMs).filter((m) => m > 0 && m < 30 * 60_000);
  if (xs.length === 0) return 0;
  return xs.reduce((s, m) => s + m, 0) / xs.length / 1000;
}
