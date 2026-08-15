// AST → React. dangerouslySetInnerHTML 을 쓰지 않는다.
// 개념 노트뿐 아니라 Gemini 응답도 이 렌더러를 타므로, 모델이 태그를 뱉어도
// 그냥 글자로 보인다.

import { Fragment, type ReactNode } from 'react';
import { parseMarkdown, type Inline, type MdBlock } from './markdown';

function renderInline(nodes: Inline[], keyBase = 'i'): ReactNode {
  return nodes.map((n, idx) => {
    const k = `${keyBase}-${idx}`;
    switch (n.t) {
      case 'text':
        return <Fragment key={k}>{n.v}</Fragment>;
      case 'strong':
        return (
          <strong key={k} className="font-semibold text-accent-soft">
            {renderInline(n.c, k)}
          </strong>
        );
      case 'em':
        return (
          <em key={k} className="italic">
            {renderInline(n.c, k)}
          </em>
        );
      case 'code':
        return (
          <code key={k} className="rounded bg-ink-700/70 px-1 py-0.5 font-mono text-[0.9em]">
            {n.v}
          </code>
        );
      case 'link':
        return (
          <a
            key={k}
            href={n.href}
            target="_blank"
            rel="noreferrer noopener"
            className="text-accent underline underline-offset-2"
          >
            {renderInline(n.c, k)}
          </a>
        );
    }
  });
}

const H_CLASS: Record<number, string> = {
  1: 'text-xl font-bold mt-5 mb-2',
  2: 'text-lg font-bold mt-5 mb-2',
  3: 'text-base font-semibold mt-4 mb-1.5',
  4: 'text-sm font-semibold mt-3 mb-1',
  5: 'text-sm font-semibold mt-3 mb-1 opacity-80',
  6: 'text-xs font-semibold mt-3 mb-1 opacity-70',
};

const ALIGN_CLASS = { left: 'text-left', center: 'text-center', right: 'text-right' } as const;

function renderBlock(b: MdBlock, key: string): ReactNode {
  switch (b.t) {
    case 'h': {
      const Tag = `h${b.level}` as 'h1';
      return (
        <Tag key={key} className={H_CLASS[b.level]} style={{ wordBreak: 'keep-all' }}>
          {renderInline(b.c, key)}
        </Tag>
      );
    }
    case 'p':
      return (
        <p key={key} className="my-2 leading-relaxed" style={{ wordBreak: 'keep-all' }}>
          {renderInline(b.c, key)}
        </p>
      );
    case 'list': {
      const cls = 'my-2 space-y-1 pl-5 ' + (b.ordered ? 'list-decimal' : 'list-disc');
      const inner = b.items.map((it, idx) => (
        <li key={`${key}-${idx}`} className="leading-relaxed" style={{ wordBreak: 'keep-all' }}>
          {renderInline(it, `${key}-${idx}`)}
        </li>
      ));
      return b.ordered ? (
        <ol key={key} className={cls}>
          {inner}
        </ol>
      ) : (
        <ul key={key} className={cls}>
          {inner}
        </ul>
      );
    }
    case 'code':
      return (
        <pre
          key={key}
          className="my-3 overflow-x-auto rounded-lg bg-ink-900/80 p-3 text-xs leading-relaxed ring-1 ring-ink-600"
        >
          <code data-lang={b.lang} className="font-mono">
            {b.v}
          </code>
        </pre>
      );
    case 'quote':
      return (
        <blockquote
          key={key}
          className="my-3 border-l-2 border-accent/60 pl-3 text-sm opacity-90"
        >
          {b.c.map((x, idx) => renderBlock(x, `${key}-${idx}`))}
        </blockquote>
      );
    case 'hr':
      return <hr key={key} className="my-4 border-ink-600" />;
    case 'table':
      return (
        <div key={key} className="scroll-x my-3">
          <table className="w-full min-w-[20rem] border-collapse text-sm">
            <thead>
              <tr>
                {b.head.map((cell, idx) => (
                  <th
                    key={`${key}-h-${idx}`}
                    className={`border-b border-ink-600 px-2 py-1.5 font-semibold ${
                      ALIGN_CLASS[b.align[idx] ?? 'left']
                    }`}
                    style={{ wordBreak: 'keep-all' }}
                  >
                    {renderInline(cell, `${key}-h-${idx}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((row, r) => (
                <tr key={`${key}-r-${r}`} className="align-top">
                  {row.map((cell, cIdx) => (
                    <td
                      key={`${key}-r-${r}-${cIdx}`}
                      className={`border-b border-ink-700/60 px-2 py-1.5 ${
                        ALIGN_CLASS[b.align[cIdx] ?? 'left']
                      }`}
                      style={{ wordBreak: 'keep-all' }}
                    >
                      {renderInline(cell, `${key}-r-${r}-${cIdx}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export default function Markdown({ src, className }: { src: string; className?: string }) {
  const blocks = parseMarkdown(src);
  return <div className={className}>{blocks.map((b, i) => renderBlock(b, `b${i}`))}</div>;
}
