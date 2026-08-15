import { describe, expect, it } from 'vitest';
import {
  DAY_MS, INITIAL_EASE, LADDER, MIN_EASE, initialSrs, nextSrs, replaySrs,
} from './srs';

const T0 = Date.UTC(2026, 7, 15, 9, 0, 0); // 고정 시각 — 시계에 의존하지 않는다

/** now + n일 */
const plus = (n: number) => T0 + n * DAY_MS;

describe('nextSrs — 첫 정답', () => {
  it('interval 1일, due 는 24시간 뒤, reps 1', () => {
    const s = nextSrs(initialSrs('a'), true, T0);
    expect(s.interval).toBe(1);
    expect(s.due).toBe(plus(1));
    expect(s.reps).toBe(1);
    expect(s.lapses).toBe(0);
    expect(s.ease).toBe(INITIAL_EASE); // 상한이라 더 안 오른다
  });
});

describe('nextSrs — 첫 오답', () => {
  it('당일 재출제(due=now), interval 0, ease -0.2, lapses 1', () => {
    const s = nextSrs(initialSrs('a'), false, T0);
    expect(s.interval).toBe(0);
    expect(s.due).toBe(T0); // now 이하 → dueItemIds 에 즉시 잡힌다
    expect(s.ease).toBeCloseTo(2.3, 10);
    expect(s.lapses).toBe(1);
    expect(s.reps).toBe(0);
  });
});

describe('nextSrs — 연속 정답 5회', () => {
  it('간격이 1 → 3 → 7 → 16 → 35 로 커진다', () => {
    let s = initialSrs('a');
    const got: number[] = [];
    for (let i = 0; i < 5; i++) {
      s = nextSrs(s, true, plus(i));
      got.push(s.interval);
    }
    expect(got).toEqual([...LADDER]);
    expect(s.reps).toBe(5);
    // 마지막 due 는 (4일째 + 35일)
    expect(s.due).toBe(plus(4) + 35 * DAY_MS);
  });

  it('사다리를 넘어가면 계속 늘어난다', () => {
    let s = initialSrs('a');
    let prev = 0;
    for (let i = 0; i < 8; i++) {
      s = nextSrs(s, true, T0);
      expect(s.interval).toBeGreaterThan(prev);
      prev = s.interval;
    }
    expect(s.interval).toBeGreaterThan(35);
  });
});

describe('nextSrs — ease 하한', () => {
  it('계속 틀려도 1.3 밑으로 안 내려간다', () => {
    let s = initialSrs('a');
    for (let i = 0; i < 20; i++) s = nextSrs(s, false, T0);
    expect(s.ease).toBe(MIN_EASE);
    expect(s.lapses).toBe(20);
  });

  it('부동소수 누적오차가 없다 (2.5 → 2.3 → 2.1 → 1.9)', () => {
    let s = initialSrs('a');
    const eases: number[] = [];
    for (let i = 0; i < 3; i++) {
      s = nextSrs(s, false, T0);
      eases.push(s.ease);
    }
    expect(eases).toEqual([2.3, 2.1, 1.9]);
  });
});

describe('nextSrs — 오답 후 회복', () => {
  it('reps 가 리셋되어 사다리를 처음부터 다시 오른다', () => {
    let s = initialSrs('a');
    s = nextSrs(s, true, T0);          // reps 1, interval 1
    s = nextSrs(s, true, plus(1));     // reps 2, interval 3
    expect(s.interval).toBe(3);
    s = nextSrs(s, false, plus(4));    // 오답
    expect(s.reps).toBe(0);
    expect(s.interval).toBe(0);
    s = nextSrs(s, true, plus(4));     // 다시 첫 정답
    expect(s.reps).toBe(1);
    expect(s.interval).toBe(1);
  });

  it('ease 는 정답마다 0.1 씩 상한까지 회복된다', () => {
    let s = initialSrs('a');
    s = nextSrs(s, false, T0);
    s = nextSrs(s, false, T0);
    expect(s.ease).toBeCloseTo(2.1, 10);
    s = nextSrs(s, true, T0);
    expect(s.ease).toBeCloseTo(2.2, 10);
    s = nextSrs(s, true, T0);
    expect(s.ease).toBeCloseTo(2.3, 10);
    for (let i = 0; i < 10; i++) s = nextSrs(s, true, T0);
    expect(s.ease).toBe(INITIAL_EASE); // 상한에서 멈춘다
  });

  it('ease 가 낮으면 같은 reps 라도 간격이 더 촘촘하다', () => {
    let low = initialSrs('a');
    for (let i = 0; i < 6; i++) low = nextSrs(low, false, T0); // ease 1.3
    expect(low.ease).toBe(MIN_EASE);
    low = nextSrs(low, true, T0);
    low = nextSrs(low, true, T0);
    low = nextSrs(low, true, T0); // reps 3 → 사다리 7일
    const fresh = nextSrs(nextSrs(nextSrs(initialSrs('b'), true, T0), true, T0), true, T0);
    expect(fresh.interval).toBe(7);
    expect(low.interval).toBeLessThan(fresh.interval);
    expect(low.interval).toBeGreaterThanOrEqual(1);
  });

  it('lapses 는 절대 줄지 않는다 (오답노트의 근거)', () => {
    let s = initialSrs('a');
    s = nextSrs(s, false, T0);
    for (let i = 0; i < 10; i++) s = nextSrs(s, true, T0);
    expect(s.lapses).toBe(1);
  });
});

describe('replaySrs', () => {
  it('같은 기록을 흘리면 순차 적용과 동일한 상태가 나온다', () => {
    const rows = [
      { itemId: 'a', correct: true, ts: plus(0) },
      { itemId: 'b', correct: false, ts: plus(0) },
      { itemId: 'a', correct: false, ts: plus(1) },
      { itemId: 'a', correct: true, ts: plus(2) },
    ];
    const map = replaySrs(rows);

    let a = initialSrs('a');
    a = nextSrs(a, true, plus(0));
    a = nextSrs(a, false, plus(1));
    a = nextSrs(a, true, plus(2));

    expect(map.get('a')).toEqual(a);
    expect(map.get('b')).toEqual(nextSrs(initialSrs('b'), false, plus(0)));
  });
});
