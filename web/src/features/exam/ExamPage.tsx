// 모의고사 설정 화면. 인덱스만 읽고 문항을 고른 뒤 세션을 만든다.

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ExamResult, LightItem, SubjectId } from '../../types';
import { SUBJECT_NAMES } from '../../types';
import { loadIndex } from '../../lib/dataLoader';
import { attemptedItemIds, listExamResults } from '../progress/api';
import { newSid } from '../practice/shared/rng';
import {
  listSessions, persistSession, type ExamState, type SessionMeta,
} from '../practice/shared/session';
import { QUESTIONS_PER_SUBJECT, SUBJECT_IDS, summarize } from './scoring';
import { selectExam } from './select';

const DEFAULT_MINUTES = 150;

function Chip({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-tap rounded-xl border px-3 text-sm font-semibold transition-colors ${
        active
          ? 'border-accent bg-accent/20 text-accent-soft'
          : 'border-ink-700 bg-ink-800 text-[color:var(--fg-dim)]'
      }`}
    >
      {children}
    </button>
  );
}

export default function ExamPage() {
  const nav = useNavigate();
  const [index, setIndex] = useState<LightItem[] | null>(null);
  const [attempted, setAttempted] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<SubjectId[]>([...SUBJECT_IDS]);
  const [timed, setTimed] = useState(true);
  const [minutes, setMinutes] = useState(DEFAULT_MINUTES);
  const [preferUnattempted, setPreferUnattempted] = useState(true);
  const [past, setPast] = useState<ExamResult[]>([]);
  const [resumable, setResumable] = useState<SessionMeta[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const idx = await loadIndex();
        if (alive) setIndex(idx);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : String(e));
        return;
      }
      try {
        const [a, results] = await Promise.all([attemptedItemIds(), listExamResults()]);
        if (!alive) return;
        setAttempted(a);
        setPast(results);
      } catch {
        /* 기록 없이 진행 */
      }
    })();
    setResumable(listSessions().filter((m) => m.mode === 'exam' && (m.done ?? 0) < (m.total ?? 0)));
    return () => { alive = false; };
  }, []);

  /** 과목별 후보 수 — 20문항을 못 채우는 과목을 미리 알려준다. */
  const supply = useMemo(() => {
    const out = new Map<SubjectId, number>();
    for (const s of SUBJECT_IDS) out.set(s, 0);
    let unclassified = 0;
    for (const l of index ?? []) {
      if (l.a == null) continue;
      if (l.s == null) unclassified += 1;
      else out.set(l.s, (out.get(l.s) ?? 0) + 1);
    }
    return { bySubject: out, unclassified };
  }, [index]);

  const thin = subjects.filter((s) => (supply.bySubject.get(s) ?? 0) < QUESTIONS_PER_SUBJECT);
  const totalQuestions = subjects.length * QUESTIONS_PER_SUBJECT;

  async function start(): Promise<void> {
    if (!index || !subjects.length || busy) return;
    setBusy(true);
    const sid = newSid('e');
    const seed = `${sid}`;
    const sel = selectExam(index, { seed, subjects, attempted, preferUnattempted });
    const state: ExamState = {
      sid,
      slots: sel.slots,
      idx: 0,
      answers: {},
      startedAt: Date.now(),
      limitMs: timed ? minutes * 60_000 : null,
      subjects,
      seed,
    };
    await persistSession(sid, 'exam', state, {
      label: `모의고사 ${sel.slots.length}문항`,
      total: sel.slots.length,
      done: 0,
    });
    nav(`/exam/s/${sid}`);
  }

  if (error) {
    return (
      <div className="card">
        <p className="font-bold text-bad">문항을 불러오지 못했다.</p>
        <p className="mt-1 text-sm text-[color:var(--fg-dim)]">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {resumable.length > 0 && (
        <section className="card border-accent/40">
          <h2 className="text-sm font-bold">진행 중인 시험</h2>
          <ul className="mt-2 space-y-2">
            {resumable.slice(0, 2).map((m) => (
              <li key={m.sid}>
                <button
                  type="button"
                  onClick={() => nav(`/exam/s/${m.sid}`)}
                  className="btn-ghost w-full justify-between text-sm"
                >
                  <span>{m.label}</span>
                  <span className="text-xs text-[color:var(--fg-dim)]">
                    {m.done ?? 0}/{m.total ?? 0} 표기
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card space-y-3">
        <h2 className="text-sm font-bold">시간 제한</h2>
        <div className="flex flex-wrap gap-2">
          <Chip active={timed} onClick={() => setTimed(true)}>제한 있음</Chip>
          <Chip active={!timed} onClick={() => setTimed(false)}>연습 (무제한)</Chip>
        </div>
        {timed && (
          <div className="flex flex-wrap gap-2">
            {[150, 120, 90].map((m) => (
              <Chip key={m} active={minutes === m} onClick={() => setMinutes(m)}>
                {m}분
              </Chip>
            ))}
          </div>
        )}
        <p className="text-xs text-[color:var(--fg-dim)]">
          실제 시험은 100문항 150분이다. 시간이 다 되면 자동 제출된다.
        </p>
      </section>

      <section className="card space-y-3">
        <h2 className="text-sm font-bold">출제 범위</h2>
        <div className="flex flex-wrap gap-2">
          {SUBJECT_IDS.map((s) => (
            <Chip
              key={s}
              active={subjects.includes(s)}
              onClick={() =>
                setSubjects((prev) =>
                  prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s].sort((a, b) => a - b))}
            >
              {SUBJECT_NAMES[s]}
              <span className="ml-1 text-xs opacity-60">{supply.bySubject.get(s) ?? 0}</span>
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip active={preferUnattempted} onClick={() => setPreferUnattempted((v) => !v)}>
            안 푼 문항 우선
          </Chip>
        </div>
        {thin.length > 0 && (
          <p className="text-xs text-bad">
            {thin.map((s) => SUBJECT_NAMES[s]).join('·')} 과목은 후보가 20문항에 못 미친다.
            미분류 {supply.unclassified}문항과 다른 과목 문항으로 채운다.
          </p>
        )}
      </section>

      {past.length > 0 && (
        <section className="card">
          <h2 className="text-sm font-bold">지난 결과</h2>
          <ul className="mt-2 space-y-2">
            {past.slice(0, 5).map((r) => {
              const s = summarize(r);
              return (
                <li key={r.sid}>
                  <button
                    type="button"
                    className="btn-ghost w-full justify-between text-sm"
                    onClick={() => nav(`/exam/r/${r.sid}`)}
                  >
                    <span className="text-xs text-[color:var(--fg-dim)]">
                      {new Date(r.ts).toLocaleDateString('ko-KR')}
                    </span>
                    <span>
                      <b className={r.passed ? 'text-ok' : 'text-bad'}>
                        {r.passed ? '합격' : '불합격'}
                      </b>
                      <span className="ml-2">평균 {s.average}점</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="sticky bottom-[calc(var(--tabbar-h)+env(safe-area-inset-bottom))] z-20 -mx-4 border-t border-ink-700 bg-ink-900/95 px-4 py-3 backdrop-blur md:bottom-0 md:-mx-6 md:px-6">
        <button
          type="button"
          className="btn-primary w-full"
          disabled={!index || !subjects.length || busy}
          onClick={() => { void start(); }}
        >
          {subjects.length
            ? `${totalQuestions}문항 시험 시작${timed ? ` · ${minutes}분` : ''}`
            : '과목을 하나 이상 골라라'}
        </button>
      </div>
    </div>
  );
}
