// 문항 한 개 렌더. 풀이·모의고사·결과 리뷰가 모두 이 컴포넌트를 쓴다.
//
// 두 가지 함정을 여기서 흡수한다.
//  1) choicesAreImage 문항(8개)은 choices 가 ['','','',''] 이다. 텍스트 버튼으로
//     그리면 빈 버튼 4개가 나온다 → 보기 이미지를 띄우고 ①②③④ 라벨로 받는다.
//  2) 코드 블록은 <pre> 로만 그린다(워드랩 off·가로 스크롤은 전역 CSS).
//     지문에 같은 코드가 또 들어 있으므로 planStem 이 걷어낸다.

import type { ItemBody, LightItem } from '../../../types';
import { SUBJECT_NAMES } from '../../../types';
import { choicesAreImage } from '../../../lib/dataLoader';
import AssetImage from './AssetImage';
import { circled, planStem } from './blocks';

export interface QuestionViewProps {
  light: LightItem;
  body?: ItemBody;
  chosen: number | null;
  onChoose?: (n: number) => void;
  /** 정답/오답 색을 칠한다. 시험 중에는 반드시 false. */
  reveal?: boolean;
  /** 선택을 더 못 바꾼다. */
  locked?: boolean;
  /** 문항 번호 표시 */
  number?: number;
  total?: number;
  /** 과목·연도 배지 표시 (시험 중에는 숨긴다) */
  showMeta?: boolean;
}

const CHOICE_FALLBACK = 4;

export default function QuestionView({
  light, body, chosen, onChoose, reveal = false, locked = false,
  number, total, showMeta = true,
}: QuestionViewProps) {
  const imageChoices = choicesAreImage(light);
  const plan = body ? planStem(body.stem, body.blocks) : null;
  const count = imageChoices
    ? CHOICE_FALLBACK
    : Math.max(body?.choices.length ?? CHOICE_FALLBACK, 2);
  const answer = light.a;

  return (
    <article className="min-w-0">
      <header className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[color:var(--fg-dim)]">
        {number != null && (
          <span className="rounded-md bg-ink-700 px-2 py-0.5 font-bold text-[color:var(--fg)]">
            {number}{total ? ` / ${total}` : ''}
          </span>
        )}
        {showMeta && (
          <>
            <span>{light.s ? SUBJECT_NAMES[light.s] : '미분류'}</span>
            {light.y != null && <span>· {light.y}년</span>}
            {light.c > 1 && <span className="text-accent-soft">· {light.c}회 출제</span>}
          </>
        )}
      </header>

      {!body ? (
        <div className="space-y-2">
          <div className="skeleton h-5 w-4/5" />
          <div className="skeleton h-5 w-3/5" />
        </div>
      ) : (
        <>
          {plan!.text && (
            <p className="whitespace-pre-wrap text-[15px] font-medium leading-relaxed">
              {plan!.text}
            </p>
          )}

          {plan!.blocks.map((b, i) => {
            if (b.type === 'code' && b.value) {
              return (
                <pre
                  key={i}
                  className="scroll-x mt-3 rounded-xl border border-ink-700 bg-ink-900 p-3 text-[color:var(--fg)]"
                >
                  {b.value}
                </pre>
              );
            }
            if (b.type === 'image' && b.src) {
              return (
                <div key={i} className="mt-3">
                  <AssetImage src={b.src} alt={`문항 ${light.i} 이미지`} />
                </div>
              );
            }
            if (b.type === 'text' && b.value) {
              return (
                <p key={i} className="mt-3 whitespace-pre-wrap">{b.value}</p>
              );
            }
            return null;
          })}

          {imageChoices && (
            <p className="mt-2 text-xs text-accent-soft">
              보기가 이미지다. 위 그림의 ①②③④ 를 보고 아래에서 번호를 고른다.
            </p>
          )}
        </>
      )}

      <ul className={`mt-4 grid gap-2 ${imageChoices ? 'grid-cols-4' : 'grid-cols-1'}`}>
        {Array.from({ length: count }, (_, k) => {
          const n = k + 1;
          const picked = chosen === n;
          const isAnswer = reveal && answer === n;
          const isWrongPick = reveal && picked && answer !== n;

          const tone = isAnswer
            ? 'border-ok bg-ok/15 text-[color:var(--fg)]'
            : isWrongPick
              ? 'border-bad bg-bad/15 text-[color:var(--fg)]'
              : picked
                ? 'border-accent bg-accent/15'
                : 'border-ink-700 bg-ink-800 hover:border-ink-600';

          return (
            <li key={n} className="min-w-0">
              <button
                type="button"
                disabled={locked || !onChoose}
                onClick={() => onChoose?.(n)}
                aria-pressed={picked}
                className={`flex min-h-tap w-full min-w-0 items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors disabled:cursor-default ${tone} ${
                  imageChoices ? 'justify-center' : ''
                }`}
              >
                <span className="shrink-0 font-bold">{circled(n)}</span>
                {!imageChoices && (
                  <span className="min-w-0 flex-1 whitespace-pre-wrap break-words">
                    {body?.choices[k] ?? ''}
                  </span>
                )}
                {isAnswer && <span className="shrink-0 text-xs font-bold text-ok">정답</span>}
                {isWrongPick && <span className="shrink-0 text-xs font-bold text-bad">내 답</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
