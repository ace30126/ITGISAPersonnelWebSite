// 해설. 한 문항에 작성자별로 여러 개가 붙는다(1,243문항 중 105개가 2개 이상).
// 첫 해설만 펼치고 나머지는 접는다 — 폰에서 스크롤이 끝없이 길어지지 않게.

import type { Explanation } from '../../../types';

export default function ExplList({ expls }: { expls: readonly Explanation[] }) {
  if (!expls.length) {
    return (
      <p className="rounded-xl border border-dashed border-ink-700 p-3 text-xs text-[color:var(--fg-dim)]">
        이 문항은 해설이 없다.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {expls.map((e, i) => (
        <details
          key={i}
          open={i === 0}
          className="rounded-xl border border-ink-700 bg-ink-800/70 px-3 py-2"
        >
          <summary className="min-h-tap cursor-pointer list-none py-1 text-sm font-bold text-accent-soft">
            해설 {i + 1}
            {e.a ? <span className="ml-2 font-normal text-[color:var(--fg-dim)]">{e.a}</span> : null}
            {expls.length > 1 && (
              <span className="ml-2 text-xs font-normal text-[color:var(--fg-dim)]">
                / 총 {expls.length}개
              </span>
            )}
          </summary>
          <div className="scroll-x">
            <p className="whitespace-pre-wrap pb-2 text-sm leading-relaxed">{e.b}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
