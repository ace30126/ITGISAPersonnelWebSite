// 개념 본문 렌더 — 마크다운 사이사이에 도식을 끼워 넣는다.
//
// 파이프라인이 본문에서 SVG 를 떼어내 `diagrams` 로 옮기고 자리에는
// `[[fig:n]]` 자리표시자를 남긴다. 마크다운 렌더러가 원시 HTML 을 그리지
// 않기 때문인데, 안 떼면 화면에 아무것도 안 나오는 조용한 실패가 된다.

import { Fragment } from 'react';
import Markdown from './MarkdownView';
import type { ConceptDiagram } from './types';

const FIG_RE = /\[\[fig:(\d+)\]\]/g;

function Figure({ svg, label }: { svg: string; label: string }) {
  return (
    <figure
      className="my-4 overflow-x-auto rounded-lg border border-ink-600/50 bg-ink-800/40 p-3
                 text-ink-100 [&>svg]:mx-auto [&>svg]:h-auto [&>svg]:max-w-full"
      aria-label={label}
      // SVG 는 우리가 쓴 1차 저작물이고, pipeline/build/concepts.py 가
      // script·이벤트 핸들러·foreignObject 를 빌드 시점에 막는다.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export default function ConceptBody({
  body, diagrams = [], className,
}: { body: string; diagrams?: ConceptDiagram[]; className?: string }) {
  const parts: { text?: string; fig?: ConceptDiagram }[] = [];
  let last = 0;
  for (const m of body.matchAll(FIG_RE)) {
    const before = body.slice(last, m.index);
    if (before.trim()) parts.push({ text: before });
    const fig = diagrams[Number(m[1]) - 1];
    if (fig) parts.push({ fig });
    last = m.index + m[0].length;
  }
  const tail = body.slice(last);
  if (tail.trim()) parts.push({ text: tail });

  // 자리표시자가 없으면(도식 없는 노트) 그냥 통째로 렌더한다.
  if (!parts.length) return <Markdown src={body} className={className} />;

  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>
          {p.text ? <Markdown src={p.text} className={className} /> : null}
          {p.fig ? <Figure svg={p.fig.svg} label={`도식 ${p.fig.id}`} /> : null}
        </Fragment>
      ))}
    </>
  );
}
