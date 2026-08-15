// [이건 왜 그럴까요?] — 개념 하나를 일상 비유로 풀어 주는 패널.
// 캐시가 있으면 호출하지 않고 즉시 보여준다.

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Concept } from '../concept/types';
import Markdown from '../concept/MarkdownView';
import AiSettings from './AiSettings';
import { answerKey, getAnswer, saveAnswer, setVote } from './cache';
import { AiError, classifyThrown, streamGemini } from './gemini';
import { getKey, getSendItemText, hasKey, setSendItemText } from './keyStore';
import { buildWhyPrompt, WHY_TEMPLATE_ID, type WhyPromptItem } from './prompts';

type Status = 'idle' | 'streaming' | 'done' | 'error';

export interface WhyPanelProps {
  concept: Concept;
  /** 관련 기출 지문. opt-in 토글이 켜져 있을 때만 프롬프트에 실린다. */
  itemStems?: WhyPromptItem[];
}

export default function WhyPanel({ concept, itemStems = [] }: WhyPanelProps) {
  const key = answerKey(WHY_TEMPLATE_ID, concept.id);

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [text, setText] = useState('');
  const [cached, setCached] = useState(false);
  const [err, setErr] = useState<AiError | null>(null);
  const [vote, setVoteState] = useState<1 | -1 | undefined>(undefined);
  const [sendItems, setSendItems] = useState(getSendItemText());
  const [keyReady, setKeyReady] = useState(hasKey());
  const [showSettings, setShowSettings] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  // 캐시 조회는 화면 진입 때 한 번.
  useEffect(() => {
    let alive = true;
    setStatus('idle');
    setText('');
    setErr(null);
    setCached(false);
    setVoteState(undefined);
    void getAnswer(key).then((row) => {
      if (!alive || !row) return;
      setText(row.body);
      setVoteState(row.vote);
      setCached(true);
      setStatus('done');
      setOpen(true);
    });
    return () => {
      alive = false;
    };
  }, [key]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const run = useCallback(async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setOpen(true);
    setStatus('streaming');
    setErr(null);
    setCached(false);
    setVoteState(undefined);
    setText('');

    const prompt = buildWhyPrompt({
      concept: {
        id: concept.id,
        title: concept.title,
        subject: concept.subject,
        body: concept.body,
      },
      includeItems: sendItems,
      items: itemStems,
    });

    let acc = '';
    try {
      for await (const chunk of streamGemini({ apiKey: getKey(), prompt, signal: ac.signal })) {
        acc += chunk;
        setText(acc);
      }
      await saveAnswer(key, acc);
      setStatus('done');
    } catch (e) {
      const ae = classifyThrown(e);
      // 중간까지 받은 글은 버리지 않는다 — 끊겨도 읽을 값은 있다.
      setErr(ae);
      setStatus(ae.kind === 'aborted' && acc ? 'done' : 'error');
    }
  }, [concept, itemStems, key, sendItems]);

  const onVote = useCallback(
    async (v: 1 | -1) => {
      const next = vote === v ? undefined : v;
      setVoteState(next);
      await setVote(key, next);
    },
    [key, vote],
  );

  const disabled = !keyReady || status === 'streaming';

  return (
    <section className="rounded-2xl border border-ink-700 bg-ink-800/70 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void run()}
          disabled={disabled}
          className="btn-primary text-sm disabled:cursor-not-allowed"
        >
          {status === 'streaming' ? '쓰는 중…' : '이건 왜 그럴까요?'}
        </button>
        {cached && status === 'done' && (
          <>
            <span className="text-xs opacity-60">저장된 답변</span>
            <button
              type="button"
              onClick={() => void run()}
              disabled={disabled}
              className="min-h-tap rounded-lg px-2 py-1 text-xs underline underline-offset-2 opacity-70"
            >
              다시 생성
            </button>
          </>
        )}
        {status === 'streaming' && (
          <button
            type="button"
            onClick={() => abortRef.current?.abort()}
            className="min-h-tap rounded-lg px-2 py-1 text-xs underline underline-offset-2 opacity-70"
          >
            중단
          </button>
        )}
      </div>

      {!keyReady && (
        <p className="mt-2 text-xs leading-relaxed opacity-75" style={{ wordBreak: 'keep-all' }}>
          이 기능은 각자 발급한 Gemini API 키로 동작합니다(무료 등급으로 충분합니다).
          키를 넣으면 버튼이 켜집니다.{' '}
          <button
            type="button"
            onClick={() => setShowSettings((v) => !v)}
            className="text-accent underline underline-offset-2"
          >
            {showSettings ? '설정 접기' : '키 넣기'}
          </button>
        </p>
      )}

      {showSettings && (
        <div className="mt-3">
          <AiSettings compact onKeyChange={(has) => setKeyReady(has)} />
        </div>
      )}

      {keyReady && itemStems.length > 0 && (
        <label className="mt-2 flex items-start gap-2 text-xs opacity-75">
          <input
            type="checkbox"
            checked={sendItems}
            onChange={(e) => {
              setSendItems(e.target.checked);
              setSendItemText(e.target.checked);
            }}
            className="mt-0.5"
          />
          <span style={{ wordBreak: 'keep-all' }}>
            기출 지문 원문도 함께 보내기 (기본 꺼짐 — 문제 원문은 저작물이라 외부로 보내지
            않는 것이 안전합니다)
          </span>
        </label>
      )}

      {open && (text || err) && (
        <div className="mt-3">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-ink-700 px-2 py-0.5 text-[11px] tracking-tight opacity-90">
              AI 생성 · 시험 근거 아님
            </span>
            <span className="text-[11px] opacity-50">why-v1 · Gemini</span>
          </div>

          {text && (
            <div className="text-sm">
              <Markdown src={text} />
              {status === 'streaming' && (
                <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-accent align-middle" />
              )}
            </div>
          )}

          {err && (
            <div className="mt-2 rounded-lg bg-bad/10 p-2.5 text-sm ring-1 ring-bad/40">
              <p className="font-semibold text-bad" style={{ wordBreak: 'keep-all' }}>
                {err.message}
              </p>
              <p className="mt-1 text-xs opacity-80" style={{ wordBreak: 'keep-all' }}>
                {err.hint}
              </p>
            </div>
          )}

          {status === 'done' && text && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs opacity-60">이 설명이 도움이 됐나요?</span>
              <button
                type="button"
                aria-pressed={vote === 1}
                onClick={() => void onVote(1)}
                className={`min-h-tap rounded-lg px-2 py-1 text-sm ring-1 ${
                  vote === 1 ? 'bg-ok/20 ring-ok' : 'ring-ink-600'
                }`}
              >
                👍
              </button>
              <button
                type="button"
                aria-pressed={vote === -1}
                onClick={() => void onVote(-1)}
                className={`min-h-tap rounded-lg px-2 py-1 text-sm ring-1 ${
                  vote === -1 ? 'bg-bad/20 ring-bad' : 'ring-ink-600'
                }`}
              >
                👎
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
