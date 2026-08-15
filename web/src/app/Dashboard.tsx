// 대시보드.
//
// 경량 인덱스(≈95KB)와 meta 만으로 그린다. 본문 샤드는 절대 건드리지 않는다 —
// 홈 화면을 열었다고 문제 지문 400KB 를 받아서는 안 된다.

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadIndex, loadMeta } from '../lib/dataLoader';
import { attemptedItemIds, dueItemIds } from '../features/progress/api';
import { SUBJECT_NAMES } from '../types';
import type { ReactElement } from 'react';
import type { LightItem, Meta, SubjectId } from '../types';
import type { IconProps } from '../layouts/icons';
import { ChevronIcon, ClockIcon, FlagIcon, BookIcon } from '../layouts/icons';

const SUBJECTS: SubjectId[] = [1, 2, 3, 4, 5];

interface Loaded {
  meta: Meta;
  index: LightItem[];
  due: number;
  attempted: Set<string>;
}

export default function Dashboard() {
  const [data, setData] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [meta, index, due, attempted] = await Promise.all([
          loadMeta(),
          loadIndex(),
          dueItemIds(),
          attemptedItemIds(),
        ]);
        if (!alive) return;
        setData({ meta, index, due: due.length, attempted });
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const rows = useMemo(() => {
    if (!data) return [];
    const { meta, index, attempted } = data;
    const done = new Map<number, number>();
    for (const l of index) {
      if (l.s && attempted.has(l.i)) done.set(l.s, (done.get(l.s) ?? 0) + 1);
    }
    return SUBJECTS.map((s) => {
      const total = meta.counts[String(s)] ?? index.filter((l) => l.s === s).length;
      const solved = done.get(s) ?? 0;
      return {
        s,
        name: meta.subjects?.[String(s)] ?? SUBJECT_NAMES[s],
        total,
        solved,
        pct: total ? Math.round((solved / total) * 100) : 0,
      };
    });
  }, [data]);

  const repeated = useMemo(
    () => (data ? data.index.filter((l) => l.c >= 2).length : 0),
    [data],
  );
  const unclassified = data?.meta.counts['0'] ?? 0;

  if (error) {
    return (
      <div className="card text-sm">
        <p className="font-semibold text-bad">자료를 불러오지 못했습니다.</p>
        <p className="mt-1 text-[color:var(--fg-dim)]">{error}</p>
        <button type="button" className="btn-ghost mt-4" onClick={() => location.reload()}>
          다시 시도
        </button>
      </div>
    );
  }

  if (!data) return <DashboardSkeleton />;

  const { meta, due } = data;

  return (
    <div className="space-y-6">
      {/* 요약 */}
      <section>
        <h2 className="text-lg font-bold">정보처리기사 필기</h2>
        <p className="mt-0.5 text-sm text-[color:var(--fg-dim)]">
          기출 <b className="text-[color:var(--fg)]">{meta.total.toLocaleString()}</b>문항을
          과목별로 정리했습니다.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat label="총 문항" value={meta.total} />
          <Stat label="해설 보유" value={meta.with_expl} />
          <Stat label="반복 출제" value={repeated} />
        </div>
      </section>

      {/* 오늘 복습 */}
      <section>
        <Link
          to="/review"
          className="card flex min-h-tap items-center gap-3 transition-colors hover:border-accent"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink-700 text-accent">
            <FlagIcon className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold">오늘 복습할 문항</span>
            <span className="block text-xs text-[color:var(--fg-dim)]">
              {due > 0 ? '간격 반복 일정이 도래했습니다' : '지금 복습할 문항이 없습니다'}
            </span>
          </span>
          <span className="shrink-0 text-xl font-extrabold tabular-nums text-accent">{due}</span>
          <ChevronIcon className="h-4 w-4 shrink-0 text-[color:var(--fg-dim)]" />
        </Link>
      </section>

      {/* 과목별 진도 */}
      <section>
        <SectionTitle title="과목별 학습" to="/subjects" />
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {rows.map((r) => (
            <Link
              key={r.s}
              to={`/subjects/${r.s}`}
              className="card flex min-h-tap items-center gap-3 transition-colors hover:border-accent"
            >
              <Ring pct={r.pct} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">
                  {r.s}과목 · {r.name}
                </span>
                <span className="block text-xs text-[color:var(--fg-dim)] tabular-nums">
                  {r.total}문항 · 푼 문항 {r.solved}
                </span>
              </span>
              <ChevronIcon className="h-4 w-4 shrink-0 text-[color:var(--fg-dim)]" />
            </Link>
          ))}
        </div>
        {unclassified > 0 && (
          <p className="mt-2 text-xs text-[color:var(--fg-dim)]">
            과목 미분류 {unclassified}문항은 전체 풀이에서 함께 출제됩니다.
          </p>
        )}
      </section>

      {/* 바로가기 */}
      <section>
        <h3 className="text-sm font-bold">바로가기</h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          <Shortcut
            to="/exam"
            title="모의고사 시작"
            desc="100문항 · 과락 판정"
            Icon={ClockIcon}
          />
          <Shortcut to="/review" title="오답노트" desc="틀린 문항 다시 풀기" Icon={FlagIcon} />
          <Shortcut to="/practice" title="문제 풀이" desc="과목·태그로 골라 풀기" Icon={BookIcon} />
        </div>
      </section>

      {/* 출제 빈도 상위 태그 */}
      {meta.tags?.length > 0 && (
        <section>
          <h3 className="text-sm font-bold">출제 빈도 상위 태그</h3>
          <ul className="mt-2 space-y-1.5">
            {meta.tags.slice(0, 8).map(([tag, n]) => (
              <li key={tag} className="flex items-center gap-3">
                <span className="w-28 shrink-0 truncate text-xs font-semibold">
                  {prettyTag(tag)}
                </span>
                <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-ink-700">
                  <span
                    className="block h-full rounded-full bg-accent"
                    style={{ width: `${Math.round((n / meta.tags[0][1]) * 100)}%` }}
                  />
                </span>
                <span className="w-10 shrink-0 text-right text-xs tabular-nums text-[color:var(--fg-dim)]">
                  {n}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

const TAG_LABELS: Record<string, string> = {
  keyword: '용어 정의',
  wrong: '틀린 것 고르기',
  kinds: '종류·분류',
  code: '코드 해석',
  calc: '계산',
};

function prettyTag(tag: string): string {
  const bare = tag.includes(':') ? tag.slice(tag.indexOf(':') + 1) : tag;
  return TAG_LABELS[bare] ?? bare;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-ink-700 bg-ink-800/70 px-3 py-2 text-center">
      <div className="text-lg font-extrabold tabular-nums">{value.toLocaleString()}</div>
      <div className="text-[11px] text-[color:var(--fg-dim)]">{label}</div>
    </div>
  );
}

function SectionTitle({ title, to }: { title: string; to: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <h3 className="text-sm font-bold">{title}</h3>
      <Link to={to} className="text-xs font-semibold text-accent">
        전체 보기
      </Link>
    </div>
  );
}

function Shortcut({
  to,
  title,
  desc,
  Icon,
}: {
  to: string;
  title: string;
  desc: string;
  Icon: (p: IconProps) => ReactElement;
}) {
  return (
    <Link
      to={to}
      className="card flex min-h-tap items-center gap-3 transition-colors hover:border-accent sm:flex-col sm:items-start"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink-700 text-accent">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold">{title}</span>
        <span className="block text-xs text-[color:var(--fg-dim)]">{desc}</span>
      </span>
    </Link>
  );
}

function Ring({ pct }: { pct: number }) {
  const r = 16;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative grid h-11 w-11 shrink-0 place-items-center">
      <svg viewBox="0 0 40 40" className="h-11 w-11 -rotate-90">
        <circle cx="20" cy="20" r={r} fill="none" stroke="#1b2547" strokeWidth="4" />
        <circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          stroke="#5b8cff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${(c * pct) / 100} ${c}`}
        />
      </svg>
      <span className="absolute text-[10px] font-bold tabular-nums">{pct}%</span>
    </span>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="대시보드 불러오는 중">
      <div className="skeleton h-6 w-1/2" />
      <div className="grid grid-cols-3 gap-2">
        <div className="skeleton h-16" />
        <div className="skeleton h-16" />
        <div className="skeleton h-16" />
      </div>
      <div className="skeleton h-20 w-full" />
      <div className="grid gap-2 sm:grid-cols-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-[68px] w-full" />
        ))}
      </div>
    </div>
  );
}
