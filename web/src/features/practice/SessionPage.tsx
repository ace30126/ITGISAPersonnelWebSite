// 풀이 세션 — 한 문항씩, 즉시 채점, 해설 표시.
//
// 복구가 이 화면의 생명이다. 폰에서 앱을 전환했다 돌아오거나 새로고침해도
// 같은 문항, 같은 답, 같은 위치여야 한다. 매 응답마다 저장한다.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ItemBody, ItemExpl, LightItem, SubjectId } from '../../types';
import { loadExpls, loadIndex, loadItems } from '../../lib/dataLoader';
import ExplList from './shared/ExplList';
import { pickLights } from './shared/lights';
import QuestionView from './shared/QuestionView';
import { useSwipe } from './shared/useSwipe';
import {
  dropSession, persistSession, restoreSession, safeRecordAttempt, type PracticeState,
} from './shared/session';

export default function SessionPage() {
  const { sid = '' } = useParams();
  const nav = useNavigate();

  const [state, setState] = useState<PracticeState | null>(null);
  const [missing, setMissing] = useState(false);
  const [lights, setLights] = useState<Map<string, LightItem>>(new Map());
  const [bodies, setBodies] = useState<Map<string, ItemBody>>(new Map());
  const [expls, setExpls] = useState<Map<string, ItemExpl>>(new Map());
  const [explLoading, setExplLoading] = useState(false);
  const loadedExplSubjects = useRef<Set<number>>(new Set());
  const shownAt = useRef<number>(Date.now());

  // --- 복구 → 본문 로드 -----------------------------------------------------
  useEffect(() => {
    let alive = true;
    (async () => {
      const restored = await restoreSession<PracticeState>(sid);
      if (!alive) return;
      if (!restored || !restored.itemIds?.length) { setMissing(true); return; }
      setState(restored);

      const index = await loadIndex();
      if (!alive) return;
      setLights(pickLights(restored.itemIds, index));

      const bs = await loadItems(restored.itemIds, index);
      if (alive) setBodies(bs);
    })().catch(() => { if (alive) setMissing(true); });
    return () => { alive = false; };
  }, [sid]);

  const itemIds = state?.itemIds ?? [];
  const idx = state?.idx ?? 0;
  const finished = state != null && idx >= itemIds.length;
  const currentId = finished ? undefined : itemIds[idx];
  const light = currentId ? lights.get(currentId) : undefined;
  const chosen = currentId && state ? (state.answers[currentId] ?? null) : null;
  const answered = chosen != null;

  useEffect(() => { shownAt.current = Date.now(); }, [idx]);

  // --- 해설은 채점 후에만, 해당 과목 샤드만 ---------------------------------
  useEffect(() => {
    if (!answered || !light) return;
    const subject = (light.s ?? 0) as SubjectId | 0;
    if (loadedExplSubjects.current.has(subject)) return;
    loadedExplSubjects.current.add(subject);
    let alive = true;
    setExplLoading(true);
    loadExpls(subject)
      .then((m) => {
        if (!alive) return;
        setExpls((prev) => new Map([...prev, ...m]));
      })
      .catch(() => { loadedExplSubjects.current.delete(subject); })
      .finally(() => { if (alive) setExplLoading(false); });
    return () => { alive = false; };
  }, [answered, light]);

  const save = useCallback(async (next: PracticeState) => {
    setState(next);
    await persistSession(sid, 'practice', next, {
      label: next.label,
      total: next.itemIds.length,
      done: Object.keys(next.answers).length,
    });
  }, [sid]);

  const move = useCallback((delta: number) => {
    setState((s) => {
      if (!s) return s;
      const next = Math.min(Math.max(s.idx + delta, 0), s.itemIds.length);
      if (next === s.idx) return s;
      const updated = { ...s, idx: next };
      void persistSession(sid, 'practice', updated, {
        label: s.label, total: s.itemIds.length, done: Object.keys(s.answers).length,
      });
      return updated;
    });
  }, [sid]);

  const swipe = useSwipe(() => move(1), () => move(-1));

  async function choose(n: number): Promise<void> {
    if (!state || !currentId || !light || answered) return;
    const correct = light.a === n;
    const next: PracticeState = { ...state, answers: { ...state.answers, [currentId]: n } };
    await save(next);
    await safeRecordAttempt({
      sid,
      itemId: currentId,
      ts: Date.now(),
      chosen: n,
      correct,
      mode: 'practice',
      elapsedMs: Math.max(0, Date.now() - shownAt.current),
    });
  }

  const stats = useMemo(() => {
    if (!state) return { done: 0, correct: 0 };
    let correct = 0;
    for (const [id, pick] of Object.entries(state.answers)) {
      if (lights.get(id)?.a === pick) correct += 1;
    }
    return { done: Object.keys(state.answers).length, correct };
  }, [state, lights]);

  if (missing) {
    return (
      <div className="card">
        <p className="font-bold">세션을 찾을 수 없다.</p>
        <p className="mt-1 text-sm text-[color:var(--fg-dim)]">
          기록이 지워졌거나 다른 기기에서 만든 세션이다.
        </p>
        <button type="button" className="btn-primary mt-3" onClick={() => nav('/practice')}>
          필터로 돌아가기
        </button>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="space-y-3" role="status" aria-label="불러오는 중">
        <div className="skeleton h-6 w-1/3" />
        <div className="skeleton h-24 w-full" />
      </div>
    );
  }

  // --- 요약 -----------------------------------------------------------------
  if (finished) {
    const wrongIds = itemIds.filter((id) => state.answers[id] != null && lights.get(id)?.a !== state.answers[id]);
    const unanswered = itemIds.filter((id) => state.answers[id] == null);
    return (
      <div className="space-y-4">
        <section className="card text-center">
          <p className="text-sm text-[color:var(--fg-dim)]">{state.label}</p>
          <p className="mt-2 text-3xl font-extrabold">
            {stats.correct}
            <span className="text-lg text-[color:var(--fg-dim)]"> / {itemIds.length}</span>
          </p>
          <p className="mt-1 text-sm text-[color:var(--fg-dim)]">
            정답률 {itemIds.length ? Math.round((stats.correct / itemIds.length) * 100) : 0}%
            {unanswered.length > 0 && ` · 미응답 ${unanswered.length}문항`}
          </p>
        </section>

        {wrongIds.length > 0 && (
          <section className="card">
            <h2 className="text-sm font-bold text-bad">틀린 문항 {wrongIds.length}개</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {wrongIds.map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    className="btn-ghost px-3 text-xs"
                    onClick={() => void save({ ...state, idx: itemIds.indexOf(id) })}
                  >
                    {itemIds.indexOf(id) + 1}번
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => void save({ ...state, idx: 0 })}
          >
            처음부터 다시 보기
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => { void dropSession(sid).then(() => nav('/practice')); }}
          >
            세션 끝내기
          </button>
        </div>
      </div>
    );
  }

  const expl = currentId ? expls.get(currentId)?.e ?? [] : [];
  const body = currentId ? bodies.get(currentId) : undefined;

  return (
    <div className="pb-4" {...swipe}>
      {/* 진행 막대 */}
      <div className="mb-3 flex items-center gap-2 text-xs text-[color:var(--fg-dim)]">
        <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-ink-700">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${((idx + 1) / itemIds.length) * 100}%` }}
          />
        </div>
        <span className="shrink-0">{stats.correct}/{stats.done} 정답</span>
      </div>

      {light ? (
        <QuestionView
          light={light}
          body={body}
          chosen={chosen}
          onChoose={(n) => { void choose(n); }}
          reveal={answered}
          locked={answered}
          number={idx + 1}
          total={itemIds.length}
        />
      ) : (
        <p className="card text-sm text-[color:var(--fg-dim)]">
          이 문항을 인덱스에서 찾지 못했다. 다음 문항으로 넘어가라.
        </p>
      )}

      {answered && (
        <section className="mt-4 space-y-2">
          <p className={`text-sm font-bold ${light?.a === chosen ? 'text-ok' : 'text-bad'}`}>
            {light?.a === chosen ? '정답' : `오답 · 정답은 ${light?.a}번`}
          </p>
          {explLoading && !expl.length
            ? <div className="skeleton h-16 w-full" />
            : <ExplList expls={expl} />}
        </section>
      )}

      <div className="sticky bottom-[calc(var(--tabbar-h)+env(safe-area-inset-bottom))] z-20 -mx-4 mt-4 flex items-center gap-2 border-t border-ink-700 bg-ink-900/95 px-4 py-3 backdrop-blur md:bottom-0 md:-mx-6 md:px-6">
        <button
          type="button"
          className="btn-ghost flex-1"
          disabled={idx === 0}
          onClick={() => move(-1)}
        >
          이전
        </button>
        <button type="button" className="btn-primary flex-[2]" onClick={() => move(1)}>
          {idx + 1 === itemIds.length ? '결과 보기' : answered ? '다음' : '건너뛰기'}
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] text-[color:var(--fg-dim)]">
        좌우로 밀어서 문항을 넘길 수 있다.
      </p>
    </div>
  );
}
