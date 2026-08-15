import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useMemo, useState } from 'react';
import { SUBJECT_NAMES, type Attempt, type ExamResult, type SubjectId } from '../../types';
import { loadIndex } from '../../lib/dataLoader';
import { db, pruneSessions } from './db';
import { BarChart, LineChart, RateBar, type Bar } from './charts';
import {
  avgSeconds, coverage, dailyBuckets, computeStreak, modeTally, pct,
  recentTally, subjectTally, type Tally,
} from './stats';
import { BackupPanel } from './BackupPanel';

const MODE_NAMES: Record<string, string> = {
  practice: '문제 풀이',
  exam: '모의고사',
  review: '복습',
  concept: '개념',
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink-700 bg-ink-800/60 p-4">
      <h2 className="mb-3 text-sm font-semibold text-white/80">{title}</h2>
      {children}
    </section>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-800/60 p-3">
      <p className="text-xs text-white/50">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-white">{value}</p>
      {hint ? <p className="mt-0.5 text-[11px] text-white/40">{hint}</p> : null}
    </div>
  );
}

function fmtDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function StatsPage() {
  // 자정을 넘겨도 화면이 스스로 흔들리지 않게 기준 시각은 마운트 때 한 번 고정한다.
  const [now] = useState(() => Date.now());

  const attempts = useLiveQuery(() => db.attempts.toArray(), [], [] as Attempt[]);
  const exams = useLiveQuery(
    () => db.examResults.orderBy('ts').toArray(), [], [] as ExamResult[],
  );
  const dueCount = useLiveQuery(
    () => db.srs.where('due').belowOrEqual(now).count(), [now], 0,
  );
  const wrongCount = useLiveQuery(() => db.srs.where('lapses').above(0).count(), [], 0);

  // 과목은 경량 인덱스에만 있다. 잠겨 있으면 과목 통계만 접고 나머지는 그대로 보여준다.
  const [subjectOf, setSubjectOf] = useState<Map<string, SubjectId> | null>(null);
  const [itemTotal, setItemTotal] = useState(0);
  useEffect(() => {
    let alive = true;
    void pruneSessions(); // 중단된 세션 잔해 청소 — 여기가 유일한 호출 지점이다
    loadIndex()
      .then((idx) => {
        if (!alive) return;
        const m = new Map<string, SubjectId>();
        for (const l of idx) if (l.s) m.set(l.i, l.s);
        setSubjectOf(m);
        setItemTotal(idx.length);
      })
      .catch(() => { if (alive) setSubjectOf(null); });
    return () => { alive = false; };
  }, []);

  const d30 = useMemo(() => dailyBuckets(attempts, 30, now), [attempts, now]);
  const t7 = useMemo(() => recentTally(attempts, 7, now), [attempts, now]);
  const t30 = useMemo(() => recentTally(attempts, 30, now), [attempts, now]);
  const streak = useMemo(() => computeStreak(attempts, now), [attempts, now]);
  const all: Tally = useMemo(
    () => ({ total: attempts.length, correct: attempts.filter((a) => a.correct).length }),
    [attempts],
  );
  const touched = useMemo(() => coverage(attempts).touched, [attempts]);
  const perMode = useMemo(() => modeTally(attempts), [attempts]);
  const perSubject = useMemo(
    () => (subjectOf ? subjectTally(attempts, subjectOf) : null),
    [attempts, subjectOf],
  );
  const secs = useMemo(() => avgSeconds(attempts), [attempts]);

  const bars: Bar[] = d30.map((b) => ({
    key: b.key,
    value: b.total,
    good: b.correct,
    title: `${b.key} · ${b.total}문항 (정답 ${b.correct})`,
  }));

  if (attempts.length === 0) {
    return (
      <div className="mx-auto max-w-2xl p-4">
        <h1 className="mb-4 text-lg font-bold text-white">학습 통계</h1>
        <Card title="아직 기록이 없다">
          <p className="text-sm text-white/60">
            문제를 풀면 여기에 과목별 정답률·학습량·복습 예정이 쌓인다.
          </p>
        </Card>
        <div className="mt-4">
          <BackupPanel />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 pb-[calc(5rem+env(safe-area-inset-bottom))]">
      <h1 className="text-lg font-bold text-white">학습 통계</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="총 푼 문항"
          value={String(all.total)}
          hint={itemTotal ? `${touched} / ${itemTotal}문항 경험` : `${touched}문항 경험`}
        />
        <Stat label="누적 정답률" value={pct(all)} hint={`평균 ${secs.toFixed(0)}초`} />
        <Stat label="연속 학습일" value={`${streak}일`} hint={`최근 7일 ${t7.total}문항`} />
        <Stat label="복습 대기" value={String(dueCount)} hint={`오답노트 ${wrongCount}문항`} />
      </div>

      <Card title="최근 30일 학습량">
        <BarChart bars={bars} height={84} />
        <div className="mt-1 flex justify-between text-[11px] text-white/40">
          <span>{fmtDate(d30[0].ts)}</span>
          <span>오늘</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-ink-900/60 p-2">
            <p className="text-xs text-white/50">최근 7일</p>
            <p className="text-white">
              {t7.total}문항 · <span className="text-ok">{pct(t7)}</span>
            </p>
          </div>
          <div className="rounded-xl bg-ink-900/60 p-2">
            <p className="text-xs text-white/50">최근 30일</p>
            <p className="text-white">
              {t30.total}문항 · <span className="text-ok">{pct(t30)}</span>
            </p>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-white/40">
          막대의 <span className="text-ok">초록</span>이 정답,{' '}
          <span className="text-bad">빨강</span>이 오답이다.
        </p>
      </Card>

      <Card title="과목별 정답률 (누적)">
        {perSubject ? (
          <ul className="space-y-3">
            {([1, 2, 3, 4, 5] as SubjectId[]).map((s) => {
              const t = perSubject.get(s) ?? { total: 0, correct: 0 };
              return (
                <li key={s}>
                  <div className="mb-1 flex items-baseline justify-between text-sm">
                    <span className="text-white/80">
                      {s}. {SUBJECT_NAMES[s]}
                    </span>
                    <span className="tabular-nums text-white/60">
                      {pct(t)}{' '}
                      <span className="text-[11px] text-white/35">
                        ({t.correct}/{t.total})
                      </span>
                    </span>
                  </div>
                  <RateBar value={t.correct} total={t.total} />
                </li>
              );
            })}
            {(() => {
              const t = perSubject.get(0);
              return t ? (
                <li className="pt-1 text-[11px] text-white/40">
                  미분류 {t.correct}/{t.total}
                </li>
              ) : null;
            })()}
          </ul>
        ) : (
          <p className="text-sm text-white/50">
            문제 데이터가 잠겨 있어 과목을 알 수 없다. 잠금을 해제하면 표시된다.
          </p>
        )}
        <p className="mt-3 text-[11px] text-white/40">
          한 과목이라도 40% 미만이면 과락이다. 60% 아래는 빨간 막대로 표시했다.
        </p>
      </Card>

      <Card title="모드별">
        <ul className="grid grid-cols-2 gap-2 text-sm">
          {[...perMode.entries()].map(([m, t]) => (
            <li key={m} className="rounded-xl bg-ink-900/60 p-2">
              <p className="text-xs text-white/50">{MODE_NAMES[m] ?? m}</p>
              <p className="text-white">
                {t.total}문항 · {pct(t)}
              </p>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="모의고사 점수 추이">
        {exams.length === 0 ? (
          <p className="text-sm text-white/50">아직 응시 기록이 없다.</p>
        ) : (
          <>
            <LineChart
              points={exams.map((e) => ({
                key: e.sid,
                value: e.totalCorrect,
                title: `${fmtDate(e.ts)} · ${e.totalCorrect}점`,
              }))}
              min={0}
              max={100}
              threshold={60}
              height={110}
            />
            <ul className="mt-3 divide-y divide-ink-700 text-sm">
              {[...exams].reverse().map((e) => (
                <li key={e.sid} className="flex items-center justify-between py-2">
                  <span className="text-white/60">{fmtDate(e.ts)}</span>
                  <span className="tabular-nums text-white">{e.totalCorrect}점</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      e.passed ? 'bg-ok/15 text-ok' : 'bg-bad/15 text-bad'
                    }`}
                  >
                    {e.passed
                      ? '합격'
                      : e.failedSubjects.length
                        ? `과락 ${e.failedSubjects.join('·')}과목`
                        : '불합격'}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <BackupPanel />
    </div>
  );
}
