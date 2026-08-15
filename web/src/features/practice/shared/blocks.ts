// 지문 렌더 계획 — 순수 함수.
//
// 원본 데이터에서 코드 블록은 blocks[] 에도 있고 stem 안에도 그대로 들어 있다
// (1,243문항 중 88문항, 그중 85문항이 완전 일치). 둘 다 그리면 같은 코드가
// 두 번 나오므로, stem 에서 코드와 겹치는 구간을 잘라내고 <pre> 로만 그린다.
// 잘라내기는 공백을 무시한 비교로 한다 — 원본과 블록의 들여쓰기가 다르다.

import type { Block } from '../../../types';

export interface StemPlan {
  /** 코드 중복을 걷어낸, 화면에 그릴 지문 */
  text: string;
  /** 그대로 그릴 블록들 (code / image) */
  blocks: Block[];
}

const isWs = (ch: string): boolean => /\s/.test(ch);

/**
 * stem 안에서 code 와 (공백 무시) 일치하는 구간을 제거한다.
 * 못 찾으면 null — 이때는 stem 을 건드리지 않는다.
 */
export function stripEmbedded(stem: string, code: string): string | null {
  const needle = code.replace(/\s+/g, '');
  if (needle.length < 8) return null;

  const map: number[] = [];
  let flat = '';
  for (let i = 0; i < stem.length; i += 1) {
    const ch = stem[i]!;
    if (!isWs(ch)) {
      flat += ch;
      map.push(i);
    }
  }

  const at = flat.indexOf(needle);
  if (at < 0) return null;

  const start = map[at]!;
  const end = map[at + needle.length - 1]! + 1;
  const head = stem.slice(0, start).replace(/\s+$/, '');
  const tail = stem.slice(end).replace(/^\s+/, '');
  return [head, tail].filter((s) => s.length > 0).join('\n');
}

export function planStem(stem: string, blocks: readonly Block[] = []): StemPlan {
  let text = stem ?? '';
  for (const b of blocks) {
    if (b.type !== 'code' || !b.value) continue;
    const stripped = stripEmbedded(text, b.value);
    if (stripped != null) text = stripped;
  }
  return { text, blocks: blocks.slice() };
}

export const CIRCLED = ['①', '②', '③', '④', '⑤'] as const;

export function circled(n: number): string {
  return CIRCLED[n - 1] ?? String(n);
}
