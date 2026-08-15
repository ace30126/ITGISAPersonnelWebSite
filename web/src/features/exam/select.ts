// 모의고사 문항 선정 — 순수 함수. 경량 인덱스(LightItem)만 보고 고른다.
//
// 규칙
//  1) 과목당 20문항, 5과목 100문항
//  2) 같은 variant_group(v) 은 시험 전체에서 한 번만 — 사실상 같은 문항이
//     두 번 나오면 안 된다. 과목이 달라도 마찬가지다.
//  3) 미풀이 문항 우선 가중 (푼 적 없는 문항이 먼저 뽑힌다)
//  4) 시드 고정 → 같은 시드·같은 인덱스·같은 풀이기록이면 항상 같은 집합
//  5) 과목 후보가 20개에 못 미치면(미분류 27개처럼 과목이 안 붙은 문항이
//     있을 때) 아래 순서로 슬롯을 메운다.
//       ① 미분류(s 없음) 문항  ② 다른 과목의 남은 문항  ③ 그래도 모자라면
//       그 슬롯은 비운 채 shortfall 로 보고한다 (없는 문항을 만들어내지 않는다)
//     메운 문항도 슬롯 과목으로 채점된다 — 과목별 분모를 20으로 지키기 위해서다.

import type { LightItem, SubjectId } from '../../types';
import { makeRng, weightedOrder } from '../practice/shared/rng';
import { QUESTIONS_PER_SUBJECT, SUBJECT_IDS } from './scoring';

export interface ExamSlot {
  itemId: string;
  /** 채점 슬롯 과목 */
  subject: SubjectId;
  /** 문항의 실제 과목. 미분류면 undefined. 슬롯과 다르면 채워 넣은 문항이다. */
  sourceSubject?: SubjectId;
  /** 부족분을 메우려고 다른 과목/미분류에서 끌어온 문항 */
  filler: boolean;
}

export interface Shortfall {
  subject: SubjectId;
  /** 다른 데서 끌어와 메운 수 */
  filled: number;
  /** 끝내 채우지 못한 수 */
  missing: number;
}

export interface SelectExamOptions {
  seed: string | number;
  /** 출제 범위. 기본 5과목 전부. */
  subjects?: readonly SubjectId[];
  /** 과목당 문항 수. 기본 20. */
  perSubject?: number;
  /** 이미 푼 적 있는 문항 id — 미풀이 우선 가중에 쓴다. */
  attempted?: ReadonlySet<string>;
  /**
   * 미풀이 우선. 기본 true — 미풀이 문항을 먼저 다 쓰고 나서 푼 문항을 쓴다.
   * (확률 가중이 아니라 확정 우선순위다. "운 나쁘게 아는 문제만 100개" 가
   *  나오지 않고, 테스트로 성질을 검증할 수 있다.)
   */
  preferUnattempted?: boolean;
  /** 출제 빈도(c) 가중치 기울기. 0 이면 빈도를 무시한다. 기본 0.5. */
  frequencyWeight?: number;
}

export interface ExamSelection {
  slots: ExamSlot[];
  shortfall: Shortfall[];
}

/** 정답이 없는 문항은 채점이 불가능하니 애초에 뽑지 않는다. */
function eligible(l: LightItem): boolean {
  return l.a != null && l.a >= 1;
}

export function selectExam(
  index: readonly LightItem[],
  opts: SelectExamOptions,
): ExamSelection {
  const subjects = opts.subjects?.length ? [...opts.subjects] : [...SUBJECT_IDS];
  const perSubject = opts.perSubject ?? QUESTIONS_PER_SUBJECT;
  const attempted = opts.attempted ?? new Set<string>();
  const preferUnattempted = opts.preferUnattempted ?? true;
  const freqWeight = opts.frequencyWeight ?? 0.5;
  const rand = makeRng(opts.seed);

  const pool = index.filter(eligible);
  /** 출제가 잦았던 문항일수록 앞으로 — 같은 티어 안에서만 작동한다. */
  const weightOf = (l: LightItem): number =>
    1 + Math.max(0, (l.c ?? 1) - 1) * freqWeight;

  // 티어를 먼저 가르고 각 티어 안에서만 가중 정렬한다. rand() 소비 순서가
  // 입력 순서에 묶여 있어 시드가 같으면 결과가 항상 같다.
  const ranked = preferUnattempted
    ? [
      ...weightedOrder(pool.filter((l) => !attempted.has(l.i)), weightOf, rand),
      ...weightedOrder(pool.filter((l) => attempted.has(l.i)), weightOf, rand),
    ]
    : weightedOrder(pool, weightOf, rand);

  const usedIds = new Set<string>();
  const usedVariants = new Set<string>();
  const slots: ExamSlot[] = [];
  const shortfall: Shortfall[] = [];

  const take = (l: LightItem, slotSubject: SubjectId, filler: boolean): void => {
    usedIds.add(l.i);
    if (l.v) usedVariants.add(l.v);
    const slot: ExamSlot = { itemId: l.i, subject: slotSubject, filler };
    if (l.s != null) slot.sourceSubject = l.s;
    slots.push(slot);
  };

  const free = (l: LightItem): boolean =>
    !usedIds.has(l.i) && !(l.v && usedVariants.has(l.v));

  // 1차: 과목별로 자기 과목 문항을 채운다.
  const deficits = new Map<SubjectId, number>();
  for (const s of subjects) {
    let n = 0;
    for (const l of ranked) {
      if (n >= perSubject) break;
      if (l.s !== s || !free(l)) continue;
      take(l, s, false);
      n += 1;
    }
    if (n < perSubject) deficits.set(s, perSubject - n);
  }

  // 2차: 부족한 과목을 ① 미분류 ② 다른 과목 잔여 순으로 메운다.
  for (const [s, deficit] of deficits) {
    let filled = 0;
    for (const phase of [0, 1]) {
      for (const l of ranked) {
        if (filled >= deficit) break;
        if (!free(l)) continue;
        const isUnclassified = l.s == null;
        if (phase === 0 ? !isUnclassified : isUnclassified) continue;
        take(l, s, true);
        filled += 1;
      }
      if (filled >= deficit) break;
    }
    shortfall.push({ subject: s, filled, missing: deficit - filled });
  }

  // 과목 순서대로 정렬해 실제 시험지 순서를 만든다.
  const order = new Map(subjects.map((s, i) => [s, i]));
  slots.sort((a, b) => (order.get(a.subject)! - order.get(b.subject)!));

  return { slots, shortfall };
}

/** 선정 결과에서 id 만. loadItems() 에 그대로 넘긴다. */
export function slotItemIds(sel: ExamSelection): string[] {
  return sel.slots.map((s) => s.itemId);
}
