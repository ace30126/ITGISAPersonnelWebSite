import { describe, expect, it } from 'vitest';
import { parseInline, parseMarkdown, stripMarkdown, type MdBlock } from './markdown';

const text = (v: string) => ({ t: 'text', v });

describe('parseInline', () => {
  it('굵게·기울임·코드·링크를 나눈다', () => {
    expect(parseInline('보통 **굵게** 와 *기울임* 과 `code`')).toEqual([
      text('보통 '),
      { t: 'strong', c: [text('굵게')] },
      text(' 와 '),
      { t: 'em', c: [text('기울임')] },
      text(' 과 '),
      { t: 'code', v: 'code' },
    ]);
  });

  it('링크는 라벨과 href 를 분리한다', () => {
    expect(parseInline('[문서](https://a.b/c)')).toEqual([
      { t: 'link', href: 'https://a.b/c', c: [text('문서')] },
    ]);
  });

  it('코드 안의 별표는 강조로 먹지 않는다', () => {
    expect(parseInline('`a * b`')).toEqual([{ t: 'code', v: 'a * b' }]);
  });

  it('짝이 안 맞는 기호는 그냥 글자로 남는다', () => {
    expect(parseInline('2 * 3 = 6')).toEqual([text('2 * 3 = 6')]);
  });
});

describe('parseMarkdown', () => {
  it('제목 레벨을 읽는다', () => {
    expect(parseMarkdown('## 제목')).toEqual([{ t: 'h', level: 2, c: [text('제목')] }]);
  });

  it('문단은 빈 줄로 끊고 줄바꿈은 공백으로 잇는다', () => {
    const out = parseMarkdown('첫 줄\n이어짐\n\n다음 문단');
    expect(out).toEqual([
      { t: 'p', c: [text('첫 줄 이어짐')] },
      { t: 'p', c: [text('다음 문단')] },
    ]);
  });

  it('비순서 목록과 순서 목록을 구분하고 종류가 바뀌면 끊는다', () => {
    const out = parseMarkdown('- 하나\n- 둘\n1. 첫째\n2. 둘째');
    expect(out).toHaveLength(2);
    expect(out[0]).toMatchObject({ t: 'list', ordered: false });
    expect(out[1]).toMatchObject({ t: 'list', ordered: true });
    expect((out[0] as Extract<MdBlock, { t: 'list' }>).items).toHaveLength(2);
  });

  it('표를 헤더·정렬·행으로 나눈다', () => {
    const out = parseMarkdown('| 비유 | 개념 |\n| --- | ---: |\n| 택배 | 패킷 |\n| 송장 | 헤더 |');
    const table = out[0] as Extract<MdBlock, { t: 'table' }>;
    expect(table.t).toBe('table');
    expect(table.head).toHaveLength(2);
    expect(table.align).toEqual([null, 'right']);
    expect(table.rows).toHaveLength(2);
    expect(table.rows[1][0]).toEqual([text('송장')]);
  });

  it('코드펜스는 내용을 그대로 보존한다(들여쓰기 포함)', () => {
    const out = parseMarkdown('```c\nif (a) {\n  b();\n}\n```');
    expect(out[0]).toEqual({ t: 'code', lang: 'c', v: 'if (a) {\n  b();\n}' });
  });

  it('코드펜스 안의 # 은 제목이 아니다', () => {
    const out = parseMarkdown('```\n# not a heading\n```');
    expect(out).toHaveLength(1);
    expect(out[0].t).toBe('code');
  });

  it('인용은 안쪽을 다시 파싱한다', () => {
    const out = parseMarkdown('> 순서 암기: **도부이결**\n> 두 번째 줄');
    const q = out[0] as Extract<MdBlock, { t: 'quote' }>;
    expect(q.t).toBe('quote');
    expect(q.c).toHaveLength(1);
    expect(q.c[0].t).toBe('p');
  });

  it('구분선을 인식한다', () => {
    expect(parseMarkdown('---')).toEqual([{ t: 'hr' }]);
  });

  it('CRLF 를 처리한다', () => {
    expect(parseMarkdown('# 제목\r\n\r\n본문')).toEqual([
      { t: 'h', level: 1, c: [text('제목')] },
      { t: 'p', c: [text('본문')] },
    ]);
  });

  it('빈 입력은 빈 배열', () => {
    expect(parseMarkdown('')).toEqual([]);
  });

  it('HTML 이 들어와도 태그가 아니라 글자로 남는다(렌더러가 React 노드로 만든다)', () => {
    const out = parseMarkdown('<script>alert(1)</script>');
    expect(out).toEqual([{ t: 'p', c: [text('<script>alert(1)</script>')] }]);
  });
});

describe('stripMarkdown', () => {
  it('프롬프트에 실을 평문으로 눌러 준다', () => {
    const src = '## 제목\n\n- **굵은** 항목\n- `코드`\n\n| a | b |\n| --- | --- |\n\n```js\nx=1\n```';
    const out = stripMarkdown(src);
    expect(out).not.toContain('#');
    expect(out).not.toContain('**');
    expect(out).not.toContain('`');
    expect(out).not.toContain('|');
    expect(out).toContain('굵은 항목');
    expect(out).not.toContain('x=1');
  });
});
