import { describe, expect, it } from 'vitest';
import type { Attempt, SubjectId } from '../../types';
import {
  avgSeconds, computeStreak, coverage, dailyBuckets, dayKey, modeTally, pct,
  recentTally, startOfDay, subjectTally,
} from './stats';

// 로컬 시각으로 만든다 — dayKey 가 로컬 자정 기준이라 UTC 로 만들면 TZ 에 따라 흔들린다.
const NOW = new Date(2026, 7, 15, 21, 30).getTime(); // 2026-08-15 21:30
const dayAgo = (n: number, h = 12) =>
  new Date(2026, 7, 15 - n, h, 0).getTime();

function a(o: Partial<Attempt> & { ts: number }): Attempt {
  return {
    itemId: o.itemId ?? 'q1', chosen: 1, correct: o.correct ?? true,
    mode: o.mode ?? 'practice', elapsedMs: o.elapsedMs ?? 10_000, ...o,
  };
}

describe('날짜 유틸', () => {
  it('dayKey 는 로컬 자정 기준이다 (새벽 공부가 전날로 안 밀린다)', () => {
    expect(dayKey(new Date(2026, 7, 15, 1, 30).getTime())).toBe('2026-08-15');
    expect(dayKey(new Date(2026, 7, 15, 23, 59).getTime())).toBe('2026-08-15');
    expect(startOfDay(NOW)).toBe(new Date(2026, 7, 15, 0, 0, 0, 0).getTime());
  });
});

describe('dailyBuckets', () => {
  it('빈 날도 0 으로 채우고 마지막 칸이 오늘이다', () => {
    const b = dailyBuckets([a({ ts: NOW }), a({ ts: dayAgo(2), correct: false })], 30, NOW);
    expect(b).toHaveLength(30);
    expect(b[29].key).toBe('2026-08-15');
    expect(b[29].total).toBe(1);
    expect(b[27].total).toBe(1);
    expect(b[27].correct).toBe(0);
    expect(b[28].total).toBe(0);
  });

  it('창 밖의 기록은 버린다', () => {
    const b = dailyBuckets([a({ ts: dayAgo(40) })], 30, NOW);
    expect(b.reduce((s, x) => s + x.total, 0)).toBe(0);
  });
});

describe('computeStreak', () => {
  it('오늘부터 연속으로 센다', () => {
    expect(computeStreak([a({ ts: NOW }), a({ ts: dayAgo(1) }), a({ ts: dayAgo(2) })], NOW))
      .toBe(3);
  });

  it('오늘 아직 안 풀었어도 어제까지 이어졌으면 유지된다', () => {
    expect(computeStreak([a({ ts: dayAgo(1) }), a({ ts: dayAgo(2) })], NOW)).toBe(2);
  });

  it('하루 비면 끊긴다', () => {
    expect(computeStreak([a({ ts: NOW }), a({ ts: dayAgo(2) })], NOW)).toBe(1);
  });

  it('이틀 이상 쉬면 0', () => {
    expect(computeStreak([a({ ts: dayAgo(2) }), a({ ts: dayAgo(3) })], NOW)).toBe(0);
  });

  it('기록이 없으면 0', () => {
    expect(computeStreak([], NOW)).toBe(0);
  });

  it('하루에 여러 번 풀어도 1일이다', () => {
    expect(computeStreak([a({ ts: dayAgo(0, 9) }), a({ ts: dayAgo(0, 20) })], NOW)).toBe(1);
  });
});

describe('집계', () => {
  const rows = [
    a({ itemId: 'q1', ts: NOW, correct: true }),
    a({ itemId: 'q2', ts: NOW, correct: false, mode: 'exam' }),
    a({ itemId: 'q1', ts: dayAgo(10), correct: false }),
    a({ itemId: 'q9', ts: dayAgo(10), correct: true }),
  ];

  it('subjectTally — 인덱스에 없는 문항은 미분류(0)로 모인다', () => {
    const subj = new Map<string, SubjectId>([['q1', 1], ['q2', 3]]);
    const t = subjectTally(rows, subj);
    expect(t.get(1)).toEqual({ total: 2, correct: 1 });
    expect(t.get(3)).toEqual({ total: 1, correct: 0 });
    expect(t.get(0)).toEqual({ total: 1, correct: 1 }); // q9
  });

  it('recentTally — 7일 창은 10일 전 기록을 뺀다', () => {
    expect(recentTally(rows, 7, NOW)).toEqual({ total: 2, correct: 1 });
    expect(recentTally(rows, 30, NOW)).toEqual({ total: 4, correct: 2 });
  });

  it('coverage / modeTally / pct', () => {
    expect(coverage(rows).touched).toBe(3);
    expect(modeTally(rows).get('exam')).toEqual({ total: 1, correct: 0 });
    expect(pct({ total: 4, correct: 2 })).toBe('50%');
    expect(pct({ total: 0, correct: 0 })).toBe('–');
  });

  it('avgSeconds — 30분 넘게 방치한 문항은 평균에서 뺀다', () => {
    expect(avgSeconds([{ elapsedMs: 10_000 }, { elapsedMs: 20_000 }])).toBe(15);
    expect(avgSeconds([{ elapsedMs: 10_000 }, { elapsedMs: 9_999_999 }])).toBe(10);
    expect(avgSeconds([])).toBe(0);
  });
});
