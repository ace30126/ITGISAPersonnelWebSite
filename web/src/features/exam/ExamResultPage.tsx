// 모의고사 결과 — 과목별 점수·과락·합격 판정 + 문항별 리뷰.
// 여기서는 정답과 해설을 보여도 된다. 시험이 끝났기 때문이다.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { ExamResult, ItemBody, ItemExpl, LightItem, SubjectId } from '../../types';
import { SUBJECT_NAMES } from '../../types';
import { loadExpls, loadIndex, loadItems } from '../../lib/dataLoader';
import { listExamResults } from '../progress/api';
import ExplList from '../practice/shared/ExplList';
import QuestionView from '../practice/shared/QuestionView';
import { pickLights } from '../practice/shared/lights';
import { loadExamPaper, type ExamPaper } from '../practice/shared/session';
import {
  PASS_TOTAL_CORRECT, SUBJECT_IDS, failThreshold, isSubjectFailed, subjectScore, summarize,
} from './scoring';

type Tab = 'all' | 'wrong' | 'blank';

export default function ExamResultPage() {
  const { sid = '' } = useParams();
  const [search] = useSearchParams();
  const nav = useNavigate();

  const [paper, setPaper] = useState<ExamPaper | null>(null);
  const [fallback, setFallback] = useState<ExamResult | null>(null);
  const [missing, setMissing] = useState(false);
  const [lights, setLights] = useState<Map<string, LightItem>>(new Map());
  const [bodies, setBodies] = useState<Map<string, ItemBody>>(new Map());
  const [expls, setExpls] = useState<Map<string, ItemExpl>>(new Map());
  const loadedSubjects = useRef<Set<number>>(new Set());
  const [tab, setTab] = useState<Tab>('wrong');
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    // 정본은 ExamResult(itemIds/answers 포함). 로컬 사본은 슬롯 정보와
    // 소요 시간만 더 얹는다 — 사본이 없어도 리뷰는 그려진다.
    const local = loadExamPaper(sid);
    if (local) setPaper(local);

    (async () => {
      const results = await listExamResults().catch(() => [] as ExamResult[]);
      const hit = results.find((r) => r.sid === sid);
      if (!alive) return;
      if (hit) setFallback(hit);
      else if (!local) { setMissing(true); return; }

      const ids = (hit?.itemIds?.length ? hit.itemIds : local?.slots.map((s) => s.itemId)) ?? [];
      if (!ids.length) return;
      const index = await loadIndex();
      if (!alive) return;
      setLights(pickLights(ids, index));
      const bs = await loadItems(ids, index);
      if (alive) setBodies(bs);
    })().catch(() => { if (alive) setMissing(true); });

    return () => { alive = false; };
  }, [sid]);

  const ensureExpl = useCallback(async (subject: SubjectId | 0) => {
    if (loadedSubjects.current.has(subject)) return;
    loadedSubjects.current.add(subject);
    try {
      const m = await loadExpls(subject);
      setExpls((prev) => new Map([...prev, ...m]));
    } catch {
      loadedSubjects.current.delete(subject);
    }
  }, []);

  const result = fallback ?? paper?.result ?? null;
  const sum = useMemo(() => (result ? summarize(result) : null), [result]);

  const rows = useMemo(() => {
    const ids = (result?.itemIds?.length ? result.itemIds : paper?.slots.map((s) => s.itemId)) ?? [];
    const slotOf = new Map((paper?.slots ?? []).map((s) => [s.itemId, s] as const));
    return ids.map((itemId, i) => {
      const light = lights.get(itemId);
      const chosen = result?.answers?.[itemId] ?? paper?.answers[itemId] ?? null;
      const correct = light?.a != null && chosen === light.a;
      return { i, itemId, slot: slotOf.get(itemId), light, chosen, correct };
    });
  }, [result, paper, lights]);

  const shown = rows.filter((r) => {
    if (tab === 'wrong') return !r.correct;
    if (tab === 'blank') return r.chosen == null;
    return true;
  });

  if (missing) {
    return (
      <div className="card">
        <p className="font-bold">결과를 찾을 수 없다.</p>
        <button type="button" className="btn-primary mt-3" onClick={() => nav('/exam')}>
          모의고사로
        </button>
      </div>
    );
  }

  if (!result || !sum) {
    return (
      <div className="space-y-3" role="status" aria-label="불러오는 중">
        <div className="skeleton h-24 w-full" />
        <div className="skeleton h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {search.get('auto') === '1' && (
        <p className="rounded-xl border border-bad/50 bg-bad/10 p-3 text-sm">
          시간이 다 되어 자동 제출되었다.
        </p>
      )}

      <section
        className={`card text-center ${result.passed ? 'border-ok/50 bg-ok/10' : 'border-bad/50 bg-bad/10'}`}
      >
        <p className={`text-2xl font-extrabold ${result.passed ? 'text-ok' : 'text-bad'}`}>
          {result.passed ? '합격' : '불합격'}
        </p>
        <p className="mt-1 text-sm text-[color:var(--fg-dim)]">
          {result.totalCorrect} / {sum.totalQuestions}문항 정답 · 평균 {sum.average}점
        </p>
        <p className="mt-1 text-xs text-[color:var(--fg-dim)]">
          {result.failedSubjects.length > 0
            ? `과락: ${result.failedSubjects.map((s) => SUBJECT_NAMES[s]).join(', ')}`
            : `과락 없음 · 합격선 ${PASS_TOTAL_CORRECT}문항`}
          {paper && ` · 소요 ${Math.round(paper.elapsedMs / 60000)}분`}
        </p>
      </section>

      <section className="card">
        <h2 className="mb-2 text-sm font-bold">과목별 점수</h2>
        <div className="scroll-x">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[color:var(--fg-dim)]">
                <th className="py-1">과목</th>
                <th className="py-1 text-right">정답</th>
                <th className="py-1 text-right">점수</th>
                <th className="py-1 text-right">판정</th>
              </tr>
            </thead>
            <tbody>
              {SUBJECT_IDS.map((s) => {
                const cell = result.perSubject[s];
                if (!cell || cell.total === 0) return null;
                const failed = isSubjectFailed(cell.correct, cell.total);
                return (
                  <tr key={s} className="border-t border-ink-700">
                    <td className="py-2">{SUBJECT_NAMES[s]}</td>
                    <td className="py-2 text-right tabular-nums">
                      {cell.correct}/{cell.total}
                    </td>
                    <td className="py-2 text-right tabular-nums">{subjectScore(cell.correct)}</td>
                    <td className={`py-2 text-right font-bold ${failed ? 'text-bad' : 'text-ok'}`}>
                      {failed ? `과락 (${failThreshold(cell.total)}문항 미만)` : '통과'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {rows.length === 0 ? (
        <p className="card text-sm text-[color:var(--fg-dim)]">
          이 결과에는 문항별 답안이 남아 있지 않다. 점수 기록만 볼 수 있다.
        </p>
      ) : (
        <section className="space-y-3">
          <div className="flex gap-2">
            {([['wrong', `틀린 문항 ${rows.filter((r) => !r.correct).length}`],
              ['blank', `미표기 ${rows.filter((r) => r.chosen == null).length}`],
              ['all', `전체 ${rows.length}`]] as [Tab, string][]).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`min-h-tap flex-1 rounded-xl border px-2 text-xs font-bold ${
                    tab === id
                      ? 'border-accent bg-accent/20 text-accent-soft'
                      : 'border-ink-700 bg-ink-800 text-[color:var(--fg-dim)]'
                  }`}
                >
                  {label}
                </button>
              ))}
          </div>

          {shown.length === 0 && (
            <p className="card text-center text-sm text-[color:var(--fg-dim)]">해당하는 문항이 없다.</p>
          )}

          <ul className="space-y-2">
            {shown.map((r) => {
              const isOpen = open === r.itemId;
              return (
                <li key={r.itemId} className="card p-0">
                  <button
                    type="button"
                    className="flex min-h-tap w-full items-center gap-2 px-4 py-3 text-left"
                    onClick={() => {
                      const next = isOpen ? null : r.itemId;
                      setOpen(next);
                      if (next && r.light) void ensureExpl((r.light.s ?? 0) as SubjectId | 0);
                    }}
                  >
                    <span className="w-10 shrink-0 text-xs font-bold tabular-nums">{r.i + 1}번</span>
                    <span
                      className={`shrink-0 text-xs font-bold ${r.correct ? 'text-ok' : 'text-bad'}`}
                    >
                      {r.correct ? '정답' : r.chosen == null ? '미표기' : '오답'}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs text-[color:var(--fg-dim)]">
                      {bodies.get(r.itemId)?.stem.slice(0, 40) ?? ''}
                    </span>
                    <span className="shrink-0 text-xs text-[color:var(--fg-dim)]">
                      {isOpen ? '접기' : '보기'}
                    </span>
                  </button>

                  {isOpen && r.light && (
                    <div className="border-t border-ink-700 px-4 py-3">
                      <QuestionView
                        light={r.light}
                        body={bodies.get(r.itemId)}
                        chosen={r.chosen}
                        reveal
                        locked
                        number={r.i + 1}
                      />
                      {r.slot?.filler && (
                        <p className="mt-2 text-xs text-[color:var(--fg-dim)]">
                          이 문항은 {SUBJECT_NAMES[r.slot.subject]} 슬롯을 채우려고 다른 범위에서
                          가져온 문항이다.
                        </p>
                      )}
                      <div className="mt-3">
                        <ExplList expls={expls.get(r.itemId)?.e ?? []} />
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="flex gap-2">
        <button type="button" className="btn-ghost flex-1" onClick={() => nav('/exam')}>
          모의고사 홈
        </button>
        <button type="button" className="btn-primary flex-1" onClick={() => nav('/stats')}>
          통계 보기
        </button>
      </div>
    </div>
  );
}
