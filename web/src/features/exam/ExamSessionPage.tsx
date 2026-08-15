// 모의고사 진행 화면.
//
// 🔒 시험 중에는 정답도 해설도 절대 화면에 없다. loadExpls() 를 부르지도
//    않는다 — 네트워크 탭에 해설 샤드가 뜨는 것 자체가 유출이다.
//    (정답 번호는 인덱스에 들어 있어 이미 메모리에 있지만, 화면에 그리지
//     않고 제출 순간에만 채점에 쓴다.)

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ItemBody, LightItem, SubjectId } from '../../types';
import { SUBJECT_NAMES } from '../../types';
import { loadIndex, loadItems } from '../../lib/dataLoader';
import { saveExamResult } from '../progress/api';
import QuestionView from '../practice/shared/QuestionView';
import { pickLights } from '../practice/shared/lights';
import { useSwipe } from '../practice/shared/useSwipe';
import {
  dropSession, persistSession, restoreSession, safeRecordAttempt, saveExamPaper,
  type ExamPaper, type ExamState,
} from '../practice/shared/session';
import { gradeExam, type ExamAnswer } from './scoring';

function mmss(ms: number): string {
  const t = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  const pad = (n: number): string => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export default function ExamSessionPage() {
  const { sid = '' } = useParams();
  const nav = useNavigate();

  const [state, setState] = useState<ExamState | null>(null);
  const [missing, setMissing] = useState(false);
  const [lights, setLights] = useState<Map<string, LightItem>>(new Map());
  const [bodies, setBodies] = useState<Map<string, ItemBody>>(new Map());
  const [omr, setOmr] = useState(false);
  const [now, setNow] = useState(Date.now());
  const submitting = useRef(false);
  const shownAt = useRef(Date.now());

  useEffect(() => {
    let alive = true;
    (async () => {
      const restored = await restoreSession<ExamState>(sid);
      if (!alive) return;
      if (!restored || !restored.slots?.length) { setMissing(true); return; }
      setState(restored);

      const index = await loadIndex();
      if (!alive) return;
      const ids = restored.slots.map((s) => s.itemId);
      setLights(pickLights(ids, index));
      const bs = await loadItems(ids, index);
      if (alive) setBodies(bs);
    })().catch(() => { if (alive) setMissing(true); });
    return () => { alive = false; };
  }, [sid]);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const slots = useMemo(() => state?.slots ?? [], [state]);
  const idx = state?.idx ?? 0;
  const slot = slots[idx];
  const light = slot ? lights.get(slot.itemId) : undefined;
  const answeredCount = state ? Object.keys(state.answers).length : 0;
  const remaining = state?.limitMs != null ? state.startedAt + state.limitMs - now : null;

  useEffect(() => { shownAt.current = Date.now(); }, [idx]);

  const submit = useCallback(async (auto: boolean) => {
    if (!state || submitting.current) return;
    submitting.current = true;

    const answers: ExamAnswer[] = state.slots.map((s) => ({
      itemId: s.itemId,
      subject: s.subject,
      chosen: state.answers[s.itemId] ?? null,
      answer: lights.get(s.itemId)?.a,
    }));
    const result = gradeExam(state.sid, answers);
    const elapsedMs = Date.now() - state.startedAt;

    // 답안지 사본을 먼저 남긴다 — 결과 화면이 이걸로 문항별 리뷰를 그린다.
    const paper: ExamPaper = {
      sid: state.sid, slots: state.slots, answers: state.answers, result, elapsedMs,
    };
    saveExamPaper(paper);
    try {
      await saveExamResult(result);
    } catch {
      /* 로컬 사본이 있으니 결과 화면은 뜬다 */
    }

    // 시험 중에는 답을 몇 번이고 고칠 수 있으므로 응답 기록은 제출 시점에
    // 문항당 한 번만 남긴다. (풀이 모드는 즉시 잠기니 즉시 기록한다.)
    const per = Math.round(elapsedMs / Math.max(1, state.slots.length));
    for (const a of answers) {
      if (a.chosen == null) continue;
      await safeRecordAttempt({
        sid: state.sid,
        itemId: a.itemId,
        ts: Date.now(),
        chosen: a.chosen,
        correct: a.answer != null && a.chosen === a.answer,
        mode: 'exam',
        elapsedMs: per,
      });
    }

    await dropSession(state.sid);
    nav(`/exam/r/${state.sid}${auto ? '?auto=1' : ''}`, { replace: true });
  }, [state, lights, nav]);

  // 시간 종료 → 자동 제출. 사용자가 폰을 놓고 있었어도 점수는 남는다.
  useEffect(() => {
    if (remaining != null && remaining <= 0 && state && !submitting.current) {
      void submit(true);
    }
  }, [remaining, state, submit]);

  // 저장은 상태 변화에 한 번만 반응한다(제출 뒤에는 상태가 안 바뀌므로 되살아나지 않는다).
  useEffect(() => {
    if (!state || submitting.current) return;
    void persistSession(sid, 'exam', state, {
      label: `모의고사 ${state.slots.length}문항`,
      total: state.slots.length,
      done: Object.keys(state.answers).length,
    });
  }, [sid, state]);

  const move = useCallback((delta: number) => {
    setState((s) => {
      if (!s) return s;
      const next = Math.min(Math.max(s.idx + delta, 0), s.slots.length - 1);
      return next === s.idx ? s : { ...s, idx: next };
    });
  }, []);

  const swipe = useSwipe(() => move(1), () => move(-1));

  function choose(n: number): void {
    if (!state || !slot) return;
    const answers = { ...state.answers };
    if (answers[slot.itemId] === n) delete answers[slot.itemId]; // 다시 누르면 표기 취소
    else answers[slot.itemId] = n;
    setState({ ...state, answers });
  }

  function jump(to: number): void {
    if (!state) return;
    setOmr(false);
    setState({ ...state, idx: to });
  }

  if (missing) {
    return (
      <div className="card">
        <p className="font-bold">시험 세션을 찾을 수 없다.</p>
        <button type="button" className="btn-primary mt-3" onClick={() => nav('/exam')}>
          모의고사로 돌아가기
        </button>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="space-y-3" role="status" aria-label="불러오는 중">
        <div className="skeleton h-6 w-1/3" />
        <div className="skeleton h-32 w-full" />
      </div>
    );
  }

  const urgent = remaining != null && remaining < 5 * 60_000;

  return (
    <div className="touch-pan-y pb-4" {...swipe}>
      {/* 상단 sticky — 남은 시간 + 100칸 진행 도트 */}
      <div className="sticky top-[44px] z-20 -mx-4 mb-3 border-b border-ink-700 bg-ink-900/95 px-4 py-2 backdrop-blur md:top-0 md:-mx-6 md:px-6">
        <div className="flex items-center gap-3">
          <span
            className={`font-mono text-lg font-bold tabular-nums ${urgent ? 'text-bad' : ''}`}
          >
            {remaining != null ? mmss(remaining) : mmss(now - state.startedAt)}
          </span>
          <span className="text-xs text-[color:var(--fg-dim)]">
            {remaining != null ? '남음' : '경과 · 무제한'}
          </span>
          <span className="ml-auto text-xs text-[color:var(--fg-dim)]">
            {answeredCount}/{slots.length} 표기
          </span>
        </div>
        <div className="mt-1.5 flex gap-px" aria-hidden>
          {slots.map((s, i) => (
            <span
              key={s.itemId}
              className={`h-1.5 min-w-0 flex-1 rounded-sm ${
                i === idx
                  ? 'bg-accent-soft'
                  : state.answers[s.itemId] != null
                    ? 'bg-accent/70'
                    : 'bg-ink-700'
              }`}
            />
          ))}
        </div>
      </div>

      {slot && light ? (
        <QuestionView
          light={light}
          body={bodies.get(slot.itemId)}
          chosen={state.answers[slot.itemId] ?? null}
          onChoose={choose}
          reveal={false}
          showMeta={false}
          number={idx + 1}
          total={slots.length}
        />
      ) : (
        <p className="card text-sm text-[color:var(--fg-dim)]">문항을 불러오는 중이다.</p>
      )}

      {/* 하단 조작 */}
      <div className="sticky bottom-[calc(var(--tabbar-h)+env(safe-area-inset-bottom))] z-20 -mx-4 mt-4 flex items-center gap-2 border-t border-ink-700 bg-ink-900/95 px-4 py-3 backdrop-blur md:bottom-0 md:-mx-6 md:px-6">
        <button type="button" className="btn-ghost px-3" disabled={idx === 0} onClick={() => move(-1)}>
          이전
        </button>
        <button type="button" className="btn-ghost flex-1" onClick={() => setOmr(true)}>
          OMR {slots.length - answeredCount > 0 && (
            <span className="text-bad">· 미표기 {slots.length - answeredCount}</span>
          )}
        </button>
        <button
          type="button"
          className="btn-primary px-3"
          disabled={idx === slots.length - 1}
          onClick={() => move(1)}
        >
          다음
        </button>
      </div>

      {omr && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end">
          <button
            type="button"
            aria-label="닫기"
            className="absolute inset-0 bg-black/60"
            onClick={() => setOmr(false)}
          />
          <div
            className="relative max-h-[75svh] overflow-y-auto rounded-t-2xl border-t border-ink-600 bg-ink-800 p-4"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
          >
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-sm font-bold">답안지</h2>
              <span className="text-xs text-[color:var(--fg-dim)]">
                미표기 {slots.length - answeredCount}문항
              </span>
              <button type="button" className="btn-ghost ml-auto px-3 text-sm" onClick={() => setOmr(false)}>
                닫기
              </button>
            </div>

            {groupBySubject(slots).map(([subject, range]) => (
              <section key={subject} className="mb-3">
                <h3 className="mb-1 text-xs font-bold text-[color:var(--fg-dim)]">
                  {SUBJECT_NAMES[subject]}
                </h3>
                <div className="grid grid-cols-10 gap-1">
                  {range.map((i) => {
                    const s = slots[i]!;
                    const marked = state.answers[s.itemId] != null;
                    return (
                      <button
                        key={s.itemId}
                        type="button"
                        onClick={() => jump(i)}
                        className={`aspect-square rounded-md border text-[11px] font-bold tabular-nums ${
                          i === idx
                            ? 'border-accent-soft bg-accent text-ink-900'
                            : marked
                              ? 'border-accent/60 bg-accent/20 text-accent-soft'
                              : 'border-ink-600 bg-ink-900 text-[color:var(--fg-dim)]'
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}

            <button
              type="button"
              className="btn-primary mt-2 w-full"
              onClick={() => { void submit(false); }}
            >
              제출하고 채점하기
            </button>
            <p className="mt-2 text-center text-xs text-[color:var(--fg-dim)]">
              제출하면 되돌릴 수 없다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/** 슬롯을 과목별 연속 구간으로 묶는다. OMR 을 과목 단위로 보여주기 위해서다. */
function groupBySubject(slots: { subject: SubjectId }[]): [SubjectId, number[]][] {
  const out: [SubjectId, number[]][] = [];
  slots.forEach((s, i) => {
    const last = out[out.length - 1];
    if (last && last[0] === s.subject) last[1].push(i);
    else out.push([s.subject, [i]]);
  });
  return out;
}
