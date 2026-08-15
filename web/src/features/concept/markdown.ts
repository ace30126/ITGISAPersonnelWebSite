// 최소 마크다운 파서. 라이브러리를 추가하지 않는다(package.json 은 내 소유가 아니다).
//
// 지원 범위는 개념 노트와 AI 답변에 실제로 필요한 것까지만:
//   제목(#~######) / 순서·비순서 목록 / 표 / 코드펜스 / 인용 / 구분선 / 문단
//   인라인: **강조**, *기울임*, `코드`, [링크](url)
// 출력은 문자열 HTML 이 아니라 AST 다. 렌더러가 React 엘리먼트로 바꾸므로
// AI 가 뱉은 텍스트에 <script> 가 섞여 있어도 그냥 글자로 나온다.

export type Inline =
  | { t: 'text'; v: string }
  | { t: 'strong'; c: Inline[] }
  | { t: 'em'; c: Inline[] }
  | { t: 'code'; v: string }
  | { t: 'link'; href: string; c: Inline[] };

export type Align = 'left' | 'center' | 'right';

export type MdBlock =
  | { t: 'h'; level: 1 | 2 | 3 | 4 | 5 | 6; c: Inline[] }
  | { t: 'p'; c: Inline[] }
  | { t: 'list'; ordered: boolean; items: Inline[][] }
  | { t: 'code'; lang?: string; v: string }
  | { t: 'table'; head: Inline[][]; align: (Align | null)[]; rows: Inline[][][] }
  | { t: 'quote'; c: MdBlock[] }
  | { t: 'hr' };

// --- 인라인 ---------------------------------------------------------------

const INLINE_RE =
  /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\*[^*\n]+\*)|(\[[^\]\n]+\]\([^)\s]+\))/;

export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  let rest = src;

  while (rest.length > 0) {
    const m = INLINE_RE.exec(rest);
    if (!m || m.index === undefined) break;
    if (m.index > 0) out.push({ t: 'text', v: rest.slice(0, m.index) });
    const tok = m[0];

    if (tok.startsWith('`')) {
      out.push({ t: 'code', v: tok.slice(1, -1) });
    } else if (tok.startsWith('**')) {
      out.push({ t: 'strong', c: parseInline(tok.slice(2, -2)) });
    } else if (tok.startsWith('*')) {
      out.push({ t: 'em', c: parseInline(tok.slice(1, -1)) });
    } else {
      const cut = tok.indexOf('](');
      const label = tok.slice(1, cut);
      const href = tok.slice(cut + 2, -1);
      out.push({ t: 'link', href, c: parseInline(label) });
    }
    rest = rest.slice(m.index + tok.length);
  }

  if (rest.length > 0) out.push({ t: 'text', v: rest });
  return out;
}

// --- 블록 -----------------------------------------------------------------

const splitRow = (line: string): string[] =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());

const isDelimRow = (line: string): boolean =>
  /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);

function alignOf(cell: string): Align | null {
  const l = cell.startsWith(':');
  const r = cell.endsWith(':');
  if (l && r) return 'center';
  if (r) return 'right';
  if (l) return 'left';
  return null;
}

export function parseMarkdown(src: string): MdBlock[] {
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  const out: MdBlock[] = [];
  let i = 0;

  const flushPara = (buf: string[]): void => {
    if (buf.length === 0) return;
    out.push({ t: 'p', c: parseInline(buf.join(' ').trim()) });
    buf.length = 0;
  };

  const para: string[] = [];

  while (i < lines.length) {
    const line = lines[i];

    // 빈 줄
    if (line.trim() === '') {
      flushPara(para);
      i += 1;
      continue;
    }

    // 코드펜스
    const fence = /^\s*```\s*([\w+-]*)\s*$/.exec(line);
    if (fence) {
      flushPara(para);
      const lang = fence[1] || undefined;
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) {
        body.push(lines[i]);
        i += 1;
      }
      i += 1; // 닫는 펜스
      out.push({ t: 'code', lang, v: body.join('\n') });
      continue;
    }

    // 구분선
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      flushPara(para);
      out.push({ t: 'hr' });
      i += 1;
      continue;
    }

    // 제목
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      flushPara(para);
      out.push({
        t: 'h',
        level: h[1].length as 1 | 2 | 3 | 4 | 5 | 6,
        c: parseInline(h[2].trim()),
      });
      i += 1;
      continue;
    }

    // 인용 (연속된 > 줄을 모아 재귀 파싱)
    if (/^\s*>\s?/.test(line)) {
      flushPara(para);
      const body: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        body.push(lines[i].replace(/^\s*>\s?/, ''));
        i += 1;
      }
      out.push({ t: 'quote', c: parseMarkdown(body.join('\n')) });
      continue;
    }

    // 표 — 헤더 + 구분행이 붙어 있어야 표로 본다
    if (line.includes('|') && i + 1 < lines.length && isDelimRow(lines[i + 1])) {
      flushPara(para);
      const head = splitRow(line).map(parseInline);
      const align = splitRow(lines[i + 1]).map(alignOf);
      i += 2;
      const rows: Inline[][][] = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') {
        rows.push(splitRow(lines[i]).map(parseInline));
        i += 1;
      }
      out.push({ t: 'table', head, align, rows });
      continue;
    }

    // 목록 — 종류가 바뀌면 끊는다
    const li = /^\s*(?:([-*+])|(\d+)[.)])\s+(.*)$/.exec(line);
    if (li) {
      flushPara(para);
      const ordered = li[1] === undefined;
      const items: Inline[][] = [];
      while (i < lines.length) {
        const m = /^\s*(?:([-*+])|(\d+)[.)])\s+(.*)$/.exec(lines[i]);
        if (!m) break;
        if ((m[1] === undefined) !== ordered) break;
        items.push(parseInline(m[3].trim()));
        i += 1;
      }
      out.push({ t: 'list', ordered, items });
      continue;
    }

    para.push(line.trim());
    i += 1;
  }

  flushPara(para);
  return out;
}

/** 프롬프트에 실을 때처럼 마크다운을 평문으로 눌러야 할 때 쓴다. */
export function stripMarkdown(src: string): string {
  return src
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^\s*[#>]+\s*/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\|/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();
}
