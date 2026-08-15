// 관련 기출 — 펼치면 지문·보기·정답·해설까지 그 자리에서 본다.
// 개념을 읽다가 "그래서 어떻게 나오는데?" 를 같은 화면에서 끝내는 게 목적이다.

import { useState } from 'react';
import { choicesAreImage } from '../../lib/dataLoader';
import type { ItemBody, ItemExpl } from '../../types';
import type { RelatedItem } from './match';

const LETTER = ['①', '②', '③', '④', '⑤'];

function yearLabel(id: string): string {
  const m = /^q:(\d{4})-(\d)/.exec(id);
  if (m) return `${m[1]}년 ${m[2]}회`;
  const s = /^s:(\d{4})(\d{2})(\d{2})/.exec(id);
  if (s) return `${s[1]}.${s[2]}`;
  const t = /^t:(\w+):/.exec(id);
  if (t) return `유형 ${t[1]}`;
  return id;
}

function Row({
  row,
  body,
  expl,
}: {
  row: RelatedItem;
  body?: ItemBody;
  expl?: ItemExpl;
}) {
  const [open, setOpen] = useState(false);
  const stem = body?.stem ?? '';
  const preview = stem ? stem.replace(/\s+/g, ' ').slice(0, 60) : '(지문은 문제 풀이에서 열립니다)';
  const hasImage = !!body?.blocks?.some((b) => b.type === 'image');

  return (
    <li className="rounded-2xl border border-ink-700 bg-ink-800/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="min-h-tap flex w-full items-start gap-2 px-3 py-2.5 text-left"
      >
        <span className="mt-0.5 shrink-0 text-[11px] opacity-60">{yearLabel(row.id)}</span>
        <span className="flex-1 text-sm leading-relaxed" style={{ wordBreak: 'keep-all' }}>
          {preview}
          {stem.length > 60 && '…'}
        </span>
        {row.source === 'auto' && (
          <span
            title={row.reason}
            className="mt-0.5 shrink-0 rounded-full bg-ink-700 px-1.5 py-0.5 text-[10px] opacity-80"
          >
            자동
          </span>
        )}
        <span className="mt-0.5 shrink-0 text-xs opacity-50">{open ? '−' : '+'}</span>
      </button>

      {open && body && (
        <div className="border-t border-ink-700 px-3 py-3 text-sm">
          <p className="leading-relaxed" style={{ wordBreak: 'keep-all' }}>
            {body.stem}
          </p>
          {hasImage && (
            <p className="mt-1 text-xs opacity-60">
              (그림이 포함된 문항입니다 — 이미지는 문제 풀이 화면에서 보입니다)
            </p>
          )}
          {choicesAreImage(row.light) ? (
            <p className="mt-2 text-xs opacity-60">보기가 이미지인 문항입니다.</p>
          ) : (
            <ol className="mt-2 space-y-1">
              {body.choices.map((c, i) => {
                const isAnswer = row.light.a === i + 1;
                return (
                  <li
                    key={i}
                    className={`flex gap-2 rounded px-1.5 py-1 ${
                      isAnswer ? 'bg-ok/10 font-semibold text-ok' : 'opacity-85'
                    }`}
                    style={{ wordBreak: 'keep-all' }}
                  >
                    <span className="shrink-0 opacity-70">{LETTER[i] ?? i + 1}</span>
                    <span>{c}</span>
                  </li>
                );
              })}
            </ol>
          )}
          {expl && expl.e.length > 0 && (
            <div className="mt-2 rounded-lg bg-ink-900/60 p-2 text-xs leading-relaxed opacity-85">
              {expl.e.map((e, i) => (
                <p key={i} style={{ wordBreak: 'keep-all' }}>
                  {e.a ? `${e.a}: ` : ''}
                  {e.b}
                </p>
              ))}
            </div>
          )}
          <p className="mt-2 text-[11px] opacity-45">{row.id}</p>
        </div>
      )}
    </li>
  );
}

export default function RelatedItems({
  rows,
  bodies,
  expls,
}: {
  rows: RelatedItem[];
  bodies: Map<string, ItemBody>;
  expls: Map<string, ItemExpl>;
}) {
  if (rows.length === 0) {
    return <p className="text-sm opacity-60">연결된 기출이 아직 없습니다.</p>;
  }
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <Row key={r.id} row={r} body={bodies.get(r.id)} expl={expls.get(r.id)} />
      ))}
    </ul>
  );
}
