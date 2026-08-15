import { describe, expect, it } from 'vitest';
import type { LightItem, SubjectId } from '../../types';
import {
  computeSubjectFreq,
  conceptScore,
  matchItems,
  midRankPercentile,
  subjectWeight,
  tagCounts,
  tierFromPercentile,
  tierFromShare,
  TAG_WEIGHT,
} from './freq';
import type { Concept } from './types';
import { SAMPLE_CONCEPTS } from './sample';

const li = (i: string, s: SubjectId, c: number, t?: string[]): LightItem => ({
  i,
  s,
  v: `v-${i}`,
  c,
  ...(t ? { t } : {}),
});

const concept = (p: Partial<Concept> & { id: string; subject: SubjectId }): Concept => ({
  title: p.id,
  level: 'core',
  tags: [],
  body: '',
  items: [],
  quiz: [],
  ...p,
});

describe('matchItems', () => {
  const index = [
    li('a1', 3, 2, ['db:정규화']),
    li('a2', 3, 3),
    li('a3', 3, 1, ['db:정규화']),
    li('b1', 4, 5, ['db:정규화']), // 과목이 달라 자동 매칭에서 빠진다
  ];

  it('pin 은 과목이 달라도 인정하고, 자동 매칭은 같은 과목만 본다', () => {
    const c = concept({ id: 'x', subject: 3, tags: ['db:정규화'], items: ['a2', 'b1'] });
    const m = matchItems(c, index);
    expect(m.pinned.map((l) => l.i)).toEqual(['a2', 'b1']);
    expect(m.auto.map((l) => l.i)).toEqual(['a1', 'a3']);
    expect(m.missing).toEqual([]);
  });

  it('pin 된 문항은 자동 매칭에 중복으로 들어가지 않는다', () => {
    const c = concept({ id: 'x', subject: 3, tags: ['db:정규화'], items: ['a1'] });
    const m = matchItems(c, index);
    expect(m.auto.map((l) => l.i)).toEqual(['a3']);
  });

  it('인덱스에 없는 pin id 는 missing 으로 보고한다', () => {
    const c = concept({ id: 'x', subject: 3, items: ['a1', 'nope:1'] });
    expect(matchItems(c, index).missing).toEqual(['nope:1']);
  });

  it('태그가 없으면 자동 매칭을 아예 하지 않는다', () => {
    const c = concept({ id: 'x', subject: 3, items: [] });
    expect(matchItems(c, index).auto).toEqual([]);
  });
});

describe('conceptScore', () => {
  it('pin 은 c 그대로, 자동 매칭은 TAG_WEIGHT 만큼만 센다', () => {
    const m = { pinned: [li('p1', 3, 2), li('p2', 3, 3)], auto: [li('t1', 3, 4)] };
    expect(conceptScore(m)).toBeCloseTo(5 + 4 * TAG_WEIGHT, 6);
  });

  it('c 가 비정상이면 1회로 본다', () => {
    const broken = { i: 'z', s: 3 as SubjectId, v: 'v', c: 0 };
    expect(conceptScore({ pinned: [broken], auto: [] })).toBe(1);
  });
});

describe('midRankPercentile', () => {
  it('중간순위 백분위를 낸다', () => {
    const v = [1, 2, 3, 4];
    expect(midRankPercentile(v, 1)).toBe(12.5);
    expect(midRankPercentile(v, 4)).toBe(87.5);
  });

  it('동점은 같은 값을 받는다', () => {
    const v = [5, 5, 5, 5];
    expect(midRankPercentile(v, 5)).toBe(50);
  });

  it('빈 배열은 0', () => {
    expect(midRankPercentile([], 3)).toBe(0);
  });
});

describe('티어 컷', () => {
  it('백분위 컷 S85 / A60 / B30', () => {
    expect(tierFromPercentile(90)).toBe('S');
    expect(tierFromPercentile(85)).toBe('S');
    expect(tierFromPercentile(84.9)).toBe('A');
    expect(tierFromPercentile(60)).toBe('A');
    expect(tierFromPercentile(30)).toBe('B');
    expect(tierFromPercentile(29.9)).toBe('C');
  });

  it('점유율 컷 6% / 3% / 1.2%', () => {
    expect(tierFromShare(0.07)).toBe('S');
    expect(tierFromShare(0.045)).toBe('A');
    expect(tierFromShare(0.02)).toBe('B');
    expect(tierFromShare(0.005)).toBe('C');
  });
});

describe('computeSubjectFreq', () => {
  // 과목3 에 20문항(각 c=1) → 과목 가중치 20
  const index: LightItem[] = Array.from({ length: 20 }, (_, n) => li(`i${n}`, 3, 1));

  it('개념이 5개 이상이면 과목 내부 백분위로 티어를 매긴다', () => {
    const concepts = [
      concept({ id: 'c1', subject: 3, items: ['i0', 'i1', 'i2', 'i3', 'i4'] }), // 5
      concept({ id: 'c2', subject: 3, items: ['i5', 'i6', 'i7'] }), // 3
      concept({ id: 'c3', subject: 3, items: ['i8', 'i9'] }), // 2
      concept({ id: 'c4', subject: 3, items: ['i10'] }), // 1
      concept({ id: 'c5', subject: 3, items: [] }), // 0
    ];
    const rows = computeSubjectFreq(concepts, index, 3);
    const byId = new Map(rows.map((r) => [r.conceptId, r]));
    expect(byId.get('c1')?.percentile).toBe(90);
    expect(byId.get('c1')?.tier).toBe('S');
    expect(byId.get('c2')?.tier).toBe('A');
    expect(byId.get('c5')?.tier).toBe('C');
    // 과목 가중치 20 중 5 → 25%
    expect(byId.get('c1')?.share).toBeCloseTo(0.25, 6);
  });

  it('개념이 적으면(<5) 백분위 대신 점유율 절대기준을 쓴다', () => {
    const concepts = [
      concept({ id: 'big', subject: 3, items: ['i0', 'i1'] }), // 2/20 = 10% → S
      concept({ id: 'small', subject: 3, items: ['i2'] }), // 1/20 = 5% → A
    ];
    const rows = computeSubjectFreq(concepts, index, 3);
    const byId = new Map(rows.map((r) => [r.conceptId, r]));
    expect(byId.get('big')?.percentile).toBeNull();
    expect(byId.get('big')?.tier).toBe('S');
    expect(byId.get('small')?.tier).toBe('A');
  });

  it('과목이 다른 개념은 섞이지 않는다', () => {
    const concepts = [
      concept({ id: 'here', subject: 3, items: ['i0'] }),
      concept({ id: 'there', subject: 4, items: ['i1'] }),
    ];
    expect(computeSubjectFreq(concepts, index, 3).map((r) => r.conceptId)).toEqual(['here']);
  });

  it('문항이 하나도 없는 과목이어도 0으로 나누지 않는다', () => {
    const rows = computeSubjectFreq([concept({ id: 'c', subject: 5 })], index, 5);
    expect(rows[0].share).toBe(0);
    expect(rows[0].tier).toBe('C');
  });
});

describe('보조 함수', () => {
  it('subjectWeight 는 c 의 합', () => {
    expect(subjectWeight([li('a', 1, 3), li('b', 1, 2)])).toBe(5);
  });

  it('tagCounts 는 빈도 내림차순', () => {
    const items = [li('a', 1, 1, ['x', 'y']), li('b', 1, 1, ['x']), li('c', 1, 1)];
    expect(tagCounts(items)).toEqual([
      ['x', 2],
      ['y', 1],
    ]);
  });
});

describe('샘플 개념 데이터 무결성', () => {
  it('id 가 유일하다', () => {
    const ids = SAMPLE_CONCEPTS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('pin 된 문항 id 에 중복이 없다', () => {
    for (const c of SAMPLE_CONCEPTS) {
      expect(new Set(c.items).size, c.id).toBe(c.items.length);
    }
  });

  it('퀴즈 정답 인덱스가 보기 범위 안에 있다', () => {
    for (const c of SAMPLE_CONCEPTS) {
      for (const q of c.quiz) {
        expect(q.a, `${c.id}: ${q.q}`).toBeGreaterThanOrEqual(0);
        expect(q.a, `${c.id}: ${q.q}`).toBeLessThan(q.choices.length);
        expect(q.why.length).toBeGreaterThan(10);
      }
    }
  });

  it('도식 SVG 는 currentColor 를 쓰고 고정 width 를 갖지 않는다', () => {
    for (const c of SAMPLE_CONCEPTS) {
      for (const d of c.diagrams ?? []) {
        expect(d.svg, c.id).toContain('currentColor');
        expect(d.svg, c.id).toContain('viewBox');
        expect(d.svg, c.id).not.toMatch(/<svg[^>]*\swidth="\d+"/);
      }
    }
  });
});
