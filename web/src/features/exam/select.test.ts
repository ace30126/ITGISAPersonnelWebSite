import { describe, expect, it } from 'vitest';
import type { LightItem, SubjectId } from '../../types';
import { selectExam, slotItemIds } from './select';

/** 과목 s 에 n 개, 전부 서로 다른 variant. */
function makeItems(s: SubjectId | undefined, n: number, prefix: string): LightItem[] {
  return Array.from({ length: n }, (_, k) => {
    const l: LightItem = { i: `${prefix}-${k}`, v: `${prefix}-v${k}`, c: 1, a: 1 };
    if (s != null) l.s = s;
    return l;
  });
}

function fullIndex(perSubject = 40): LightItem[] {
  return ([1, 2, 3, 4, 5] as SubjectId[]).flatMap((s) => makeItems(s, perSubject, `s${s}`));
}

const bySubject = (slots: { subject: SubjectId }[]): Record<number, number> => {
  const out: Record<number, number> = {};
  for (const s of slots) out[s.subject] = (out[s.subject] ?? 0) + 1;
  return out;
};

describe('기본 선정', () => {
  it('과목당 20문항 · 전체 100문항', () => {
    const sel = selectExam(fullIndex(), { seed: 'a' });
    expect(sel.slots).toHaveLength(100);
    expect(bySubject(sel.slots)).toEqual({ 1: 20, 2: 20, 3: 20, 4: 20, 5: 20 });
    expect(sel.shortfall).toEqual([]);
  });

  it('문항 순서는 과목 순(1→5)으로 나온다', () => {
    const sel = selectExam(fullIndex(), { seed: 'a' });
    const subjects = sel.slots.map((s) => s.subject);
    expect(subjects).toEqual([...subjects].sort((a, b) => a - b));
  });

  it('중복 문항 없음', () => {
    const ids = slotItemIds(selectExam(fullIndex(), { seed: 'a' }));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('정답 정보가 없는 문항은 뽑지 않는다', () => {
    const idx = fullIndex().map((l, k) => (k % 2 === 0 ? { ...l, a: undefined } : l));
    const sel = selectExam(idx, { seed: 'a' });
    expect(sel.slots).toHaveLength(100);
    const ok = new Set(idx.filter((l) => l.a != null).map((l) => l.i));
    expect(slotItemIds(sel).every((id) => ok.has(id))).toBe(true);
  });

  it('과목 범위를 좁히면 그 과목만 나온다', () => {
    const sel = selectExam(fullIndex(), { seed: 'a', subjects: [2, 4] });
    expect(sel.slots).toHaveLength(40);
    expect(bySubject(sel.slots)).toEqual({ 2: 20, 4: 20 });
  });

  it('perSubject 를 줄이면 그만큼만 뽑는다', () => {
    const sel = selectExam(fullIndex(), { seed: 'a', perSubject: 5 });
    expect(sel.slots).toHaveLength(25);
  });
});

describe('variant_group 중복 금지', () => {
  it('같은 v 는 시험 전체에서 한 번만 나온다', () => {
    // 과목마다 v 가 10종뿐 → 각 과목 후보 40개지만 실질 10개
    const idx = ([1, 2, 3, 4, 5] as SubjectId[]).flatMap((s) =>
      Array.from({ length: 40 }, (_, k): LightItem => ({
        i: `s${s}-${k}`, s, v: `v${s}-${k % 10}`, c: 1, a: 1,
      })));
    const sel = selectExam(idx, { seed: 'x' });
    const vs = sel.slots.map((slot) => idx.find((l) => l.i === slot.itemId)!.v);
    expect(new Set(vs).size).toBe(vs.length);
  });

  it('과목이 달라도 같은 v 면 한 번만 — 두 번째 과목은 부족분을 메운다', () => {
    const shared: LightItem[] = Array.from({ length: 20 }, (_, k) => ({
      i: `a-${k}`, s: 1, v: `shared-${k}`, c: 1, a: 1,
    }));
    const twin: LightItem[] = Array.from({ length: 20 }, (_, k) => ({
      i: `b-${k}`, s: 2, v: `shared-${k}`, c: 1, a: 1,
    }));
    const spare = makeItems(undefined, 20, 'u'); // 미분류 예비
    const sel = selectExam([...shared, ...twin, ...spare], { seed: 'x', subjects: [1, 2] });
    const vs = sel.slots.map((slot) =>
      [...shared, ...twin, ...spare].find((l) => l.i === slot.itemId)!.v);
    expect(new Set(vs).size).toBe(vs.length);
    expect(sel.slots).toHaveLength(40);
    // 2과목은 자기 문항이 전부 v 중복이라 미분류로 채워졌다
    expect(sel.shortfall).toEqual([{ subject: 2, filled: 20, missing: 0 }]);
  });
});

describe('시드 재현성', () => {
  it('같은 시드 → 같은 문항 집합·같은 순서', () => {
    const a = slotItemIds(selectExam(fullIndex(), { seed: 'seed-1' }));
    const b = slotItemIds(selectExam(fullIndex(), { seed: 'seed-1' }));
    expect(a).toEqual(b);
  });

  it('숫자 시드와 문자열 시드가 같은 값이면 같은 결과', () => {
    const a = slotItemIds(selectExam(fullIndex(), { seed: 12345 }));
    const b = slotItemIds(selectExam(fullIndex(), { seed: '12345' }));
    expect(a).toEqual(b);
  });

  it('다른 시드 → 다른 문항 집합', () => {
    const a = slotItemIds(selectExam(fullIndex(), { seed: 'seed-1' }));
    const b = slotItemIds(selectExam(fullIndex(), { seed: 'seed-2' }));
    expect(a).not.toEqual(b);
  });

  it('풀이 기록이 달라지면 결과도 달라진다 (미풀이 우선의 부작용)', () => {
    const idx = fullIndex();
    const a = slotItemIds(selectExam(idx, { seed: 's' }));
    const attempted = new Set(idx.slice(0, 100).map((l) => l.i));
    const b = slotItemIds(selectExam(idx, { seed: 's', attempted }));
    expect(a).not.toEqual(b);
  });
});

describe('미풀이 우선', () => {
  it('미풀이가 충분하면 푼 문항은 한 개도 안 나온다', () => {
    const idx = fullIndex(40);
    // 과목마다 앞 20개는 이미 푼 문항
    const attempted = new Set(
      idx.filter((l) => Number(l.i.split('-')[1]) < 20).map((l) => l.i),
    );
    const sel = selectExam(idx, { seed: 'z', attempted });
    expect(slotItemIds(sel).some((id) => attempted.has(id))).toBe(false);
  });

  it('미풀이가 모자라면 푼 문항으로 나머지를 채운다', () => {
    const idx = fullIndex(40);
    const attempted = new Set(
      idx.filter((l) => Number(l.i.split('-')[1]) >= 5).map((l) => l.i),
    );
    const sel = selectExam(idx, { seed: 'z', attempted });
    expect(sel.slots).toHaveLength(100);
    const fresh = slotItemIds(sel).filter((id) => !attempted.has(id));
    expect(fresh).toHaveLength(25); // 과목당 미풀이 5개 전부 포함
  });

  it('preferUnattempted:false 면 티어를 나누지 않는다', () => {
    const idx = fullIndex(40);
    const attempted = new Set(
      idx.filter((l) => Number(l.i.split('-')[1]) < 20).map((l) => l.i),
    );
    const sel = selectExam(idx, { seed: 'z', attempted, preferUnattempted: false });
    expect(slotItemIds(sel).some((id) => attempted.has(id))).toBe(true);
  });
});

describe('출제 빈도 가중', () => {
  it('c 가 큰 문항이 더 많이 뽑힌다', () => {
    const hot = Array.from({ length: 20 }, (_, k): LightItem => ({
      i: `hot-${k}`, s: 1, v: `hv${k}`, c: 6, a: 1,
    }));
    const cold = Array.from({ length: 60 }, (_, k): LightItem => ({
      i: `cold-${k}`, s: 1, v: `cv${k}`, c: 1, a: 1,
    }));
    const sel = selectExam([...hot, ...cold], { seed: 'freq', subjects: [1] });
    const hotPicked = slotItemIds(sel).filter((id) => id.startsWith('hot-')).length;
    // 균등 추출이면 기대값 5개 — 가중이 걸리면 그보다 뚜렷하게 많다
    expect(hotPicked).toBeGreaterThan(8);
  });
});

describe('부족분 보충', () => {
  it('과목 후보가 모자라면 미분류 문항이 먼저 슬롯을 메운다', () => {
    const idx = [
      ...makeItems(1, 20, 's1'),
      ...makeItems(2, 5, 's2'),
      ...makeItems(3, 20, 's3'),
      ...makeItems(4, 20, 's4'),
      ...makeItems(5, 20, 's5'),
      ...makeItems(undefined, 27, 'u'), // 미분류 27개
    ];
    const sel = selectExam(idx, { seed: 'fill' });
    expect(sel.slots).toHaveLength(100);
    expect(bySubject(sel.slots)).toEqual({ 1: 20, 2: 20, 3: 20, 4: 20, 5: 20 });
    expect(sel.shortfall).toEqual([{ subject: 2, filled: 15, missing: 0 }]);

    const fillers = sel.slots.filter((s) => s.filler);
    expect(fillers).toHaveLength(15);
    expect(fillers.every((f) => f.subject === 2)).toBe(true);
    // 미분류에서 왔으므로 실제 과목이 없다
    expect(fillers.every((f) => f.sourceSubject === undefined)).toBe(true);
    expect(fillers.every((f) => f.itemId.startsWith('u-'))).toBe(true);
  });

  it('미분류가 바닥나면 다른 과목 잔여로 메우고 출처를 남긴다', () => {
    const idx = [
      ...makeItems(1, 40, 's1'),
      ...makeItems(2, 18, 's2'),
      ...makeItems(3, 20, 's3'),
      ...makeItems(4, 20, 's4'),
      ...makeItems(5, 20, 's5'),
      ...makeItems(undefined, 1, 'u'),
    ];
    const sel = selectExam(idx, { seed: 'fill2' });
    expect(sel.slots).toHaveLength(100);
    expect(sel.shortfall).toEqual([{ subject: 2, filled: 2, missing: 0 }]);
    const fillers = sel.slots.filter((s) => s.filler);
    expect(fillers).toHaveLength(2);
    // 하나는 미분류(u), 하나는 1과목 잔여
    expect(fillers.filter((f) => f.sourceSubject === 1)).toHaveLength(1);
    expect(fillers.filter((f) => f.sourceSubject === undefined)).toHaveLength(1);
  });

  it('전체 문항이 모자라면 없는 문항을 만들지 않고 missing 으로 보고한다', () => {
    const idx = [
      ...makeItems(1, 10, 's1'),
      ...makeItems(2, 20, 's2'),
      ...makeItems(3, 20, 's3'),
      ...makeItems(4, 20, 's4'),
      ...makeItems(5, 20, 's5'),
    ];
    const sel = selectExam(idx, { seed: 'short' });
    expect(sel.slots).toHaveLength(90);
    expect(sel.shortfall).toEqual([{ subject: 1, filled: 0, missing: 10 }]);
  });

  it('빈 인덱스에도 죽지 않는다', () => {
    const sel = selectExam([], { seed: 'empty' });
    expect(sel.slots).toEqual([]);
    expect(sel.shortfall).toHaveLength(5);
    expect(sel.shortfall.every((s) => s.missing === 20)).toBe(true);
  });
});
