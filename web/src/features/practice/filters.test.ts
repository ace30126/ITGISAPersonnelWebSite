import { describe, expect, it } from 'vitest';
import type { LightItem } from '../../types';
import { defaultFilter, describeFilter, matchItems, selectPractice, type FilterContext } from './filters';
import { planStem, stripEmbedded } from './shared/blocks';

const idx: LightItem[] = [
  { i: 'q:2022-1:001', s: 1, a: 1, v: 'v1', c: 4, y: 2022, t: ['topic:wrong'] },
  { i: 'q:2022-1:002', s: 1, a: 2, v: 'v2', c: 1, y: 2022 },
  { i: 'q:2023-1:003', s: 2, a: 3, v: 'v3', c: 3, y: 2023, t: ['topic:code'] },
  { i: 'q:2023-1:004', s: 2, a: 4, v: 'v1', c: 2, y: 2023, t: ['topic:wrong', 'topic:calc'] },
  { i: 's:2020:005', a: 1, v: 'v5', c: 2 }, // 미분류·연도 없음
];

const ctx: FilterContext = {
  wrong: new Set(['q:2022-1:001', 'q:2023-1:004']),
  attempted: new Set(['q:2022-1:001', 'q:2022-1:002']),
};

const ids = (ls: LightItem[]): string[] => ls.map((l) => l.i);

describe('matchItems', () => {
  it('기본 필터는 전부 통과시킨다', () => {
    expect(matchItems(idx, defaultFilter(), ctx)).toHaveLength(5);
  });

  it('과목 필터 — 0 은 미분류', () => {
    expect(ids(matchItems(idx, { ...defaultFilter(), subjects: [0] }, ctx))).toEqual(['s:2020:005']);
    expect(matchItems(idx, { ...defaultFilter(), subjects: [1, 2] }, ctx)).toHaveLength(4);
  });

  it('연도를 고르면 연도 없는 문항은 빠진다', () => {
    expect(ids(matchItems(idx, { ...defaultFilter(), years: [2023] }, ctx)))
      .toEqual(['q:2023-1:003', 'q:2023-1:004']);
  });

  it('태그는 OR', () => {
    expect(matchItems(idx, { ...defaultFilter(), tags: ['topic:wrong', 'topic:code'] }, ctx))
      .toHaveLength(3);
  });

  it('오답만', () => {
    expect(ids(matchItems(idx, { ...defaultFilter(), onlyWrong: true }, ctx)))
      .toEqual(['q:2022-1:001', 'q:2023-1:004']);
  });

  it('미풀이만 = 푼 적 있는 문항의 여집합', () => {
    expect(ids(matchItems(idx, { ...defaultFilter(), onlyUnattempted: true }, ctx)))
      .toEqual(['q:2023-1:003', 'q:2023-1:004', 's:2020:005']);
  });

  it('출제 횟수 하한', () => {
    expect(ids(matchItems(idx, { ...defaultFilter(), minFrequency: 3 }, ctx)))
      .toEqual(['q:2022-1:001', 'q:2023-1:003']);
  });

  it('기록이 비어 있어도(B3 스텁 상태) 죽지 않는다', () => {
    expect(matchItems(idx, { ...defaultFilter(), onlyWrong: true })).toEqual([]);
    expect(matchItems(idx, { ...defaultFilter(), onlyUnattempted: true })).toHaveLength(5);
  });
});

describe('selectPractice', () => {
  it('variant 중복을 걷어낸다', () => {
    const out = selectPractice(idx, { ...defaultFilter(), limit: 0 }, ctx);
    expect(out).toHaveLength(4);
    expect(out.filter((l) => l.v === 'v1')).toHaveLength(1);
  });

  it('dedupeVariants 를 끄면 그대로 남는다', () => {
    expect(selectPractice(idx, { ...defaultFilter(), dedupeVariants: false, limit: 0 }, ctx))
      .toHaveLength(5);
  });

  it('빈도 정렬은 c 내림차순 — 같은 variant 중 잦은 쪽이 살아남는다', () => {
    const out = selectPractice(idx, { ...defaultFilter(), sort: 'frequency', limit: 0 }, ctx);
    expect(out[0]!.i).toBe('q:2022-1:001');
    expect(out.map((l) => l.c)).toEqual([4, 3, 2, 1]);
    expect(ids(out)).not.toContain('q:2023-1:004'); // v1 중복, c 가 작은 쪽
  });

  it('limit 만큼 자른다. 0 이면 제한 없음', () => {
    expect(selectPractice(idx, { ...defaultFilter(), limit: 2 }, ctx)).toHaveLength(2);
    expect(selectPractice(idx, { ...defaultFilter(), limit: 0 }, ctx)).toHaveLength(4);
  });

  it('random 정렬은 시드 고정으로 재현된다', () => {
    const f = { ...defaultFilter(), sort: 'random' as const, seed: 'k', limit: 0 };
    expect(ids(selectPractice(idx, f, ctx))).toEqual(ids(selectPractice(idx, f, ctx)));
    expect(ids(selectPractice(idx, f, ctx)))
      .not.toEqual(ids(selectPractice(idx, { ...f, seed: 'other' }, ctx)));
  });

  it('조건에 맞는 문항이 없으면 빈 배열', () => {
    expect(selectPractice(idx, { ...defaultFilter(), years: [1999] }, ctx)).toEqual([]);
  });
});

describe('describeFilter', () => {
  it('사람이 읽는 한 줄로 요약한다', () => {
    const label = describeFilter(
      { ...defaultFilter(), subjects: [1], onlyWrong: true, minFrequency: 3 },
      { 1: '소프트웨어 설계' },
    );
    expect(label).toBe('소프트웨어 설계 · 오답만 · 3회 이상');
  });
});

describe('planStem — 지문 안에 박힌 코드 제거', () => {
  it('공백이 달라도 코드 구간을 잘라낸다', () => {
    const code = 'int main() {\n    return 0;\n}';
    const stem = '다음 프로그램의 출력은?\nint main() {\nreturn 0;\n}';
    const plan = planStem(stem, [{ type: 'code', value: code }]);
    expect(plan.text).toBe('다음 프로그램의 출력은?');
    expect(plan.blocks).toHaveLength(1);
  });

  it('지문 뒤에 남는 문장은 보존한다', () => {
    const stem = '앞 문장\nint a = 1; printf("%d", a);\n뒤 문장';
    expect(planStem(stem, [{ type: 'code', value: 'int a = 1;\nprintf("%d", a);' }]).text)
      .toBe('앞 문장\n뒤 문장');
  });

  it('일치하지 않으면 지문을 건드리지 않는다', () => {
    const stem = '다음 SQL 의 결과는?';
    expect(planStem(stem, [{ type: 'code', value: 'SELECT * FROM T;' }]).text).toBe(stem);
    expect(stripEmbedded(stem, 'SELECT * FROM T;')).toBeNull();
  });

  it('이미지 블록은 지문에 손대지 않는다', () => {
    const plan = planStem('그림 참고', [{ type: 'image', src: 'assets/s/1/1.png' }]);
    expect(plan.text).toBe('그림 참고');
    expect(plan.blocks[0]!.type).toBe('image');
  });

  it('짧은 조각으로 지문을 망가뜨리지 않는다', () => {
    expect(stripEmbedded('가나다라마바사', '다라')).toBeNull();
  });

  it('블록이 없어도 죽지 않는다', () => {
    expect(planStem('지문만 있다').text).toBe('지문만 있다');
  });
});
