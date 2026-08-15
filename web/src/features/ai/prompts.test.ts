import { describe, expect, it } from 'vitest';
import { SAMPLE_CONCEPTS } from '../concept/sample';
import {
  buildWhyPrompt,
  clipContext,
  CONTEXT_CHAR_LIMIT,
  ITEM_CHAR_LIMIT,
  ITEM_LIMIT,
  WHY_SYSTEM,
  WHY_TEMPLATE_ID,
} from './prompts';

const concept = SAMPLE_CONCEPTS[0]; // 정규화와 이상 현상 (3과목)

describe('why-v1 시스템 프롬프트', () => {
  it('다섯 부분을 순서대로 강제한다', () => {
    for (const part of ['①', '②', '③', '④', '⑤']) {
      expect(WHY_SYSTEM).toContain(part);
    }
    expect(WHY_SYSTEM.indexOf('①')).toBeLessThan(WHY_SYSTEM.indexOf('⑤'));
  });

  it('④ 비유가 깨지는 지점을 필수로 못 박는다 — 이 조항이 사라지면 실패다', () => {
    expect(WHY_SYSTEM).toContain('④ 이 비유가 깨지는 지점');
    expect(WHY_SYSTEM).toContain('실패한 답변입니다');
  });

  it('페르소나·말투·용어 풀이를 지정한다', () => {
    expect(WHY_SYSTEM).toContain('비전공자');
    expect(WHY_SYSTEM).toContain('존댓말');
    expect(WHY_SYSTEM).toContain('괄호');
  });

  it('한국 일상 소재 비유를 예시까지 준다', () => {
    for (const s of ['택배', '지하철', '카페 주문', '은행 창구']) {
      expect(WHY_SYSTEM).toContain(s);
    }
  });

  it('분량·마크다운 제약을 건다', () => {
    expect(WHY_SYSTEM).toContain('350~500자');
    expect(WHY_SYSTEM).toContain('### 이하만');
    expect(WHY_SYSTEM).toContain('코드블록');
  });
});

describe('buildWhyPrompt', () => {
  it('템플릿 id 를 고정해 돌려준다(캐시 키에 쓰인다)', () => {
    expect(buildWhyPrompt({ concept }).templateId).toBe('why-v1');
    expect(WHY_TEMPLATE_ID).toBe('why-v1');
  });

  it('과목명과 개념 제목을 머리에 싣는다', () => {
    const p = buildWhyPrompt({ concept });
    expect(p.user).toContain('[과목] 3과목 데이터베이스 구축');
    expect(p.user).toContain('[개념] 정규화와 이상 현상');
    expect(p.user).toContain('①~⑤');
  });

  it('본문은 800자까지만 싣는다', () => {
    const long = { ...concept, body: '가'.repeat(5000) };
    const p = buildWhyPrompt({ concept: long });
    expect(p.contextChars).toBe(CONTEXT_CHAR_LIMIT);
    expect(p.user).toContain('…');
    expect(p.user.length).toBeLessThan(CONTEXT_CHAR_LIMIT + 400);
  });

  it('마크다운 기호는 걷어내고 보낸다(토큰 낭비 방지)', () => {
    const p = buildWhyPrompt({ concept });
    const body = p.user.split('[개념 노트 발췌')[1];
    expect(body).not.toContain('**');
    expect(body).not.toContain('```');
  });

  it('기본은 기출 원문을 보내지 않고, 안 보냈다고 모델에 알린다', () => {
    const p = buildWhyPrompt({
      concept,
      items: [{ id: 'q:2022-1:050', stem: '정규화 과정에서 함수 종속이…' }],
    });
    expect(p.includedItems).toBe(0);
    expect(p.user).not.toContain('정규화 과정에서 함수 종속이');
    expect(p.user).toContain('저작권');
  });

  it('opt-in 일 때만 기출을 싣고, 개수와 길이를 제한한다', () => {
    const items = Array.from({ length: 10 }, (_, n) => ({
      id: `q:${n}`,
      stem: `${n}번 지문 ${'가'.repeat(500)}`,
    }));
    const p = buildWhyPrompt({ concept, includeItems: true, items });
    expect(p.includedItems).toBe(ITEM_LIMIT);
    expect(p.user).toContain('[관련 기출 지문 발췌]');
    expect(p.user).not.toContain('3번 지문');
    const line = p.user.split('\n').find((l) => l.startsWith('- 0번 지문'))!;
    expect(line.length).toBeLessThanOrEqual(ITEM_CHAR_LIMIT + 4);
  });

  it('빈 개념 본문에도 터지지 않는다', () => {
    const p = buildWhyPrompt({ concept: { ...concept, body: '' } });
    expect(p.contextChars).toBe(0);
    expect(p.user).toContain('[개념]');
  });
});

describe('clipContext', () => {
  it('짧으면 그대로', () => {
    expect(clipContext('짧은 글', 100)).toEqual({ text: '짧은 글', chars: 4, truncated: false });
  });
  it('길면 자르고 말줄임표 — 글자 수는 말줄임표를 빼고 센다', () => {
    expect(clipContext('가'.repeat(20), 5)).toEqual({
      text: '가가가가가…',
      chars: 5,
      truncated: true,
    });
  });
});
