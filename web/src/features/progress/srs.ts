// SM-2 lite — 순수 함수만. IndexedDB 도 Date.now() 도 여기서 부르지 않는다.
//
// 설계: attempts 가 유일한 진실 원천이므로 이 파일은 "상태 전이 함수"일 뿐이다.
// 같은 attempts 를 같은 순서로 replay 하면 언제나 같은 Srs 가 나온다
// (now 를 인자로 받고 내부에서 시계를 읽지 않는 이유). 그래서 알고리즘을
// 갈아엎어도 기록만 있으면 전체 재계산이 된다.

import type { Srs } from '../../types';

export const DAY_MS = 86_400_000;

/** 새 문항의 시작 ease. 동시에 ease 의 상한이기도 하다. */
export const INITIAL_EASE = 2.5;
/** ease 하한 — 이 밑으로는 안 내려간다. */
export const MIN_EASE = 1.3;
/** 오답 1회당 ease 감소폭 */
export const EASE_PENALTY = 0.2;
/** 정답 1회당 ease 회복폭 (상한 INITIAL_EASE 까지) */
export const EASE_REWARD = 0.1;

/** 연속 정답 n회째의 기준 간격(일). 1 → 3 → 7 → 16 → 35 */
export const LADDER = [1, 3, 7, 16, 35] as const;

/** 아직 한 번도 안 푼 문항의 초기 상태. due=0 이라 "당장 due" 로 잡힌다. */
export function initialSrs(itemId: string): Srs {
  return { itemId, ease: INITIAL_EASE, interval: 0, due: 0, reps: 0, lapses: 0 };
}

/** 부동소수 누적오차(2.3-0.2=2.0999…) 방지를 위해 소수 2자리로 고정한다. */
export function clampEase(ease: number): number {
  const r = Math.round(ease * 100) / 100;
  return Math.min(INITIAL_EASE, Math.max(MIN_EASE, r));
}

/**
 * 연속 정답 reps 회째의 기준 간격(ease 배수 적용 전).
 * 사다리를 다 오르면 그 뒤로는 기본 ease 로 기하급수 연장한다.
 */
export function baseInterval(reps: number): number {
  if (reps <= 0) return 0;
  if (reps <= LADDER.length) return LADDER[reps - 1];
  const last = LADDER[LADDER.length - 1];
  return last * Math.pow(INITIAL_EASE, reps - LADDER.length);
}

/**
 * 한 번의 채점 결과를 SRS 상태에 반영한다.
 *
 * - 오답 → interval 0, due=now (당일 재출제), ease -= 0.2 (하한 1.3), lapses++,
 *   reps 는 0 으로 리셋된다. 즉 `reps` 는 "연속 정답 횟수"다.
 * - 정답 → reps++, interval = 사다리값 × (ease / 2.5), due = now + interval일,
 *   ease += 0.1 (상한 2.5).
 *
 * ease 를 2.5 로 상한 두는 이유: 사다리(1·3·7·16·35)가 "가장 빠른 진행"이고
 * 틀린 문항만 그보다 촘촘해지도록 만들기 위해서다. 그래서 배수는 (0.52 ~ 1.0].
 */
export function nextSrs(prev: Srs, correct: boolean, now: number = Date.now()): Srs {
  if (!correct) {
    return {
      itemId: prev.itemId,
      ease: clampEase(prev.ease - EASE_PENALTY),
      interval: 0,
      due: now,
      reps: 0,
      lapses: prev.lapses + 1,
    };
  }

  const ease = clampEase(prev.ease + EASE_REWARD);
  const reps = prev.reps + 1;
  const interval = Math.max(1, Math.round(baseInterval(reps) * (ease / INITIAL_EASE)));

  return {
    itemId: prev.itemId,
    ease,
    interval,
    due: now + interval * DAY_MS,
    reps,
    lapses: prev.lapses,
  };
}

/** attempts 를 시간순으로 흘려 SRS 를 통째로 재계산한다. import/마이그레이션용. */
export function replaySrs(
  rows: { itemId: string; correct: boolean; ts: number }[],
): Map<string, Srs> {
  const out = new Map<string, Srs>();
  for (const r of rows) {
    const prev = out.get(r.itemId) ?? initialSrs(r.itemId);
    out.set(r.itemId, nextSrs(prev, r.correct, r.ts));
  }
  return out;
}
