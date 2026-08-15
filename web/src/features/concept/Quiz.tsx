// 미니 퀴즈 — 고르는 즉시 채점하고 해설을 편다.
// 기출이 아니라 개념 확인용이라 attempts(진도 DB)에는 기록하지 않는다.

import { useState } from 'react';
import type { ConceptQuiz } from './types';

const LETTER = ['①', '②', '③', '④', '⑤'];

function Question({ item, index }: { item: ConceptQuiz; index: number }) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const correct = picked === item.a;

  return (
    <li className="rounded-2xl border border-ink-700 bg-ink-800/70 p-3">
      <p className="text-sm font-semibold leading-relaxed" style={{ wordBreak: 'keep-all' }}>
        {index + 1}. {item.q}
      </p>
      <div className="mt-2 space-y-1.5">
        {item.choices.map((c, i) => {
          const isAnswer = i === item.a;
          const isPicked = i === picked;
          const tone = !answered
            ? 'ring-ink-600 hover:ring-accent/60'
            : isAnswer
              ? 'ring-ok bg-ok/10'
              : isPicked
                ? 'ring-bad bg-bad/10'
                : 'ring-ink-700 opacity-60';
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => setPicked(i)}
              className={`min-h-tap flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm ring-1 ${tone}`}
              style={{ wordBreak: 'keep-all' }}
            >
              <span className="shrink-0 opacity-70">{LETTER[i] ?? i + 1}</span>
              <span>{c}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-2 rounded-lg bg-ink-900/60 p-2.5 text-xs leading-relaxed">
          <p className={correct ? 'font-semibold text-ok' : 'font-semibold text-bad'}>
            {correct ? '정답입니다' : `오답 — 정답은 ${LETTER[item.a] ?? item.a + 1}번`}
          </p>
          <p className="mt-1 opacity-85" style={{ wordBreak: 'keep-all' }}>
            {item.why}
          </p>
          <button
            type="button"
            onClick={() => setPicked(null)}
            className="mt-2 rounded px-1 underline underline-offset-2 opacity-60"
          >
            다시 풀기
          </button>
        </div>
      )}
    </li>
  );
}

export default function Quiz({ items }: { items: ConceptQuiz[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="space-y-3">
      {items.map((q, i) => (
        <Question key={i} item={q} index={i} />
      ))}
    </ul>
  );
}
