import { describe, expect, it } from 'vitest';
import type { LightItem, SubjectId } from '../../types';
import { keywordsOf, rankRelated } from './match';
import type { Concept } from './types';

const li = (i: string, s: SubjectId, c: number, t?: string[]): LightItem => ({
  i,
  s,
  v: `v-${i}`,
  c,
  ...(t ? { t } : {}),
});

const stack: Concept = {
  id: 'ds-stack-queue',
  subject: 2,
  title: '스택과 큐',
  level: 'core',
  tags: ['ds:스택', 'ds:큐'],
  body: '',
  items: ['pin1'],
  quiz: [],
};

describe('keywordsOf', () => {
  it('제목과 태그에서 접두어를 떼고 키워드를 만든다', () => {
    const kws = keywordsOf(stack);
    expect(kws).toContain('스택과');
    expect(kws).toContain('스택');
    expect(kws).toContain('큐');
  });
});

describe('rankRelated', () => {
  const index = [
    li('pin1', 2, 1),
    li('auto-strong', 2, 4),
    li('auto-weak', 2, 1),
    li('other-subject', 3, 9),
    li('unrelated', 2, 9),
  ];
  const stems = new Map([
    ['pin1', '스택에 대한 설명으로 틀린 것은?'],
    ['auto-strong', '스택과 큐의 차이를 고르시오'],
    ['auto-weak', '큐에 대한 설명으로 옳은 것은?'],
    ['other-subject', '스택 스택 스택'],
    ['unrelated', '데이터베이스 정규화란?'],
  ]);

  it('pin 이 항상 먼저 오고 source 로 구분된다', () => {
    const rows = rankRelated(stack, index, { stems });
    expect(rows[0].id).toBe('pin1');
    expect(rows[0].source).toBe('pinned');
    expect(rows.slice(1).every((r) => r.source === 'auto')).toBe(true);
  });

  it('키워드가 많이 걸린 쪽이 위로 온다', () => {
    const rows = rankRelated(stack, index, { stems });
    const auto = rows.filter((r) => r.source === 'auto').map((r) => r.id);
    expect(auto[0]).toBe('auto-strong');
    expect(auto).toContain('auto-weak');
  });

  it('다른 과목과 무관한 문항은 들어오지 않는다', () => {
    const ids = rankRelated(stack, index, { stems }).map((r) => r.id);
    expect(ids).not.toContain('other-subject');
    expect(ids).not.toContain('unrelated');
  });

  it('limit 을 지킨다', () => {
    expect(rankRelated(stack, index, { stems, limit: 2 })).toHaveLength(2);
  });

  it('지문이 없으면 태그 매칭만으로 채운다', () => {
    const tagged = [li('pin1', 2, 1), li('t1', 2, 2, ['ds:스택']), li('t2', 2, 2)];
    const rows = rankRelated(stack, tagged);
    expect(rows.map((r) => r.id)).toEqual(['pin1', 't1']);
    expect(rows[1].reason).toContain('태그');
  });

  it('자동 매칭에는 왜 걸렸는지 사유가 붙는다', () => {
    const rows = rankRelated(stack, index, { stems });
    expect(rows[1].reason).toContain('지문에');
  });
});
