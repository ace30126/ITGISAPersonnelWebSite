// 풀이 필터 화면.
//
// 여기서는 경량 인덱스(≈95KB)만 읽는다. 본문 샤드는 세션을 실제로 시작할 때
// SessionPage 가 받는다 — 필터를 만지작거릴 때마다 400KB 를 받으면 안 된다.

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LightItem } from '../../types';
import { SUBJECT_NAMES } from '../../types';
import { loadIndex, loadMeta } from '../../lib/dataLoader';
import { attemptedItemIds, wrongItemIds } from '../progress/api';
import {
  defaultFilter, describeFilter, matchItems, selectPractice,
  type FilterContext, type PracticeFilter, type SortMode, type SubjectFilterId,
} from './filters';
import { newSid } from './shared/rng';
import { listSessions, persistSession, type PracticeState, type SessionMeta } from './shared/session';

const SUBJECT_CHIPS: { id: SubjectFilterId; label: string }[] = [
  { id: 1, label: SUBJECT_NAMES[1] },
  { id: 2, label: SUBJECT_NAMES[2] },
  { id: 3, label: SUBJECT_NAMES[3] },
  { id: 4, label: SUBJECT_NAMES[4] },
  { id: 5, label: SUBJECT_NAMES[5] },
  { id: 0, label: '미분류' },
];

const LIMITS = [10, 20, 30, 50, 0];
const SORTS: { id: SortMode; label: string }[] = [
  { id: 'exam', label: '기출 순' },
  { id: 'frequency', label: '출제 많은 순' },
  { id: 'random', label: '무작위' },
];

const SUBJECT_LABELS: Record<number, string> = { 0: '미분류', ...SUBJECT_NAMES };

function Chip({
  active, onClick, children, disabled,
}: {
  active: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`min-h-tap rounded-xl border px-3 text-sm font-semibold transition-colors disabled:opacity-40 ${
        active
          ? 'border-accent bg-accent/20 text-accent-soft'
          : 'border-ink-700 bg-ink-800 text-[color:var(--fg-dim)]'
      }`}
    >
      {children}
    </button>
  );
}

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

export default function PracticePage() {
  const nav = useNavigate();
  const [index, setIndex] = useState<LightItem[] | null>(null);
  const [tags, setTags] = useState<[string, number][]>([]);
  const [ctx, setCtx] = useState<FilterContext>({ wrong: new Set(), attempted: new Set() });
  const [filter, setFilter] = useState<PracticeFilter>(() => defaultFilter());
  const [error, setError] = useState<string | null>(null);
  const [resumable, setResumable] = useState<SessionMeta[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [idx, meta] = await Promise.all([loadIndex(), loadMeta()]);
        if (!alive) return;
        setIndex(idx);
        setTags(meta.tags);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : String(e));
        return;
      }
      // 기록은 없어도(B3 스텁·첫 실행) 필터가 동작해야 한다.
      try {
        const [wrong, attempted] = await Promise.all([wrongItemIds(), attemptedItemIds()]);
        if (alive) setCtx({ wrong: new Set(wrong), attempted });
      } catch {
        /* 기록 없이 진행 */
      }
    })();
    setResumable(listSessions().filter((m) => m.mode === 'practice' && (m.done ?? 0) < (m.total ?? 0)));
    return () => { alive = false; };
  }, []);

  const years = useMemo(() => {
    const set = new Set<number>();
    for (const l of index ?? []) if (l.y != null) set.add(l.y);
    return [...set].sort((a, b) => b - a);
  }, [index]);

  const matched = useMemo(
    () => (index ? matchItems(index, filter, ctx) : []),
    [index, filter, ctx],
  );
  const picked = useMemo(
    () => (index ? selectPractice(index, filter, ctx) : []),
    [index, filter, ctx],
  );

  const patch = (p: Partial<PracticeFilter>): void => setFilter((f) => ({ ...f, ...p }));

  async function start(): Promise<void> {
    if (!picked.length) return;
    const sid = newSid('p');
    const state: PracticeState = {
      sid,
      itemIds: picked.map((l) => l.i),
      idx: 0,
      answers: {},
      startedAt: Date.now(),
      label: describeFilter(filter, SUBJECT_LABELS),
    };
    await persistSession(sid, 'practice', state, {
      label: state.label, total: state.itemIds.length, done: 0,
    });
    nav(`/practice/s/${sid}`);
  }

  if (error) {
    return (
      <div className="card">
        <p className="font-bold text-bad">문항을 불러오지 못했다.</p>
        <p className="mt-1 text-sm text-[color:var(--fg-dim)]">{error}</p>
      </div>
    );
  }

  if (!index) {
    return (
      <div className="space-y-3" role="status" aria-label="불러오는 중">
        <div className="skeleton h-8 w-1/3" />
        <div className="skeleton h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {resumable.length > 0 && (
        <section className="card border-accent/40">
          <h2 className="text-sm font-bold">이어서 풀기</h2>
          <ul className="mt-2 space-y-2">
            {resumable.slice(0, 3).map((m) => (
              <li key={m.sid}>
                <button
                  type="button"
                  onClick={() => nav(`/practice/s/${m.sid}`)}
                  className="btn-ghost w-full justify-between text-sm"
                >
                  <span className="min-w-0 truncate">{m.label || '풀이 세션'}</span>
                  <span className="shrink-0 text-xs text-[color:var(--fg-dim)]">
                    {m.done ?? 0}/{m.total ?? 0}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card space-y-3">
        <h2 className="text-sm font-bold">과목</h2>
        <div className="flex flex-wrap gap-2">
          {SUBJECT_CHIPS.map((c) => (
            <Chip
              key={c.id}
              active={filter.subjects.includes(c.id)}
              onClick={() => patch({ subjects: toggle(filter.subjects, c.id) })}
            >
              {c.label}
            </Chip>
          ))}
        </div>
        <p className="text-xs text-[color:var(--fg-dim)]">
          아무것도 안 고르면 전 과목이다.
        </p>
      </section>

      <section className="card space-y-3">
        <h2 className="text-sm font-bold">연도</h2>
        <div className="flex flex-wrap gap-2">
          {years.map((y) => (
            <Chip
              key={y}
              active={filter.years.includes(y)}
              onClick={() => patch({ years: toggle(filter.years, y) })}
            >
              {y}
            </Chip>
          ))}
        </div>

        <h2 className="pt-1 text-sm font-bold">태그</h2>
        <div className="flex flex-wrap gap-2">
          {tags.map(([t, n]) => (
            <Chip
              key={t}
              active={filter.tags.includes(t)}
              onClick={() => patch({ tags: toggle(filter.tags, t) })}
            >
              {t.replace(/^topic:/, '')}
              <span className="ml-1 text-xs opacity-60">{n}</span>
            </Chip>
          ))}
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="text-sm font-bold">범위</h2>
        <div className="flex flex-wrap gap-2">
          <Chip
            active={filter.onlyWrong}
            disabled={ctx.wrong.size === 0 && !filter.onlyWrong}
            onClick={() => patch({ onlyWrong: !filter.onlyWrong })}
          >
            오답만 <span className="ml-1 text-xs opacity-60">{ctx.wrong.size}</span>
          </Chip>
          <Chip
            active={filter.onlyUnattempted}
            onClick={() => patch({ onlyUnattempted: !filter.onlyUnattempted })}
          >
            미풀이만
          </Chip>
          <Chip
            active={filter.dedupeVariants}
            onClick={() => patch({ dedupeVariants: !filter.dedupeVariants })}
          >
            중복 문항 제외
          </Chip>
        </div>

        <h2 className="pt-1 text-sm font-bold">출제 횟수</h2>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((n) => (
            <Chip
              key={n}
              active={filter.minFrequency === n}
              onClick={() => patch({ minFrequency: n })}
            >
              {n === 1 ? '전체' : `${n}회 이상`}
            </Chip>
          ))}
        </div>

        <h2 className="pt-1 text-sm font-bold">정렬</h2>
        <div className="flex flex-wrap gap-2">
          {SORTS.map((s) => (
            <Chip key={s.id} active={filter.sort === s.id} onClick={() => patch({ sort: s.id })}>
              {s.label}
            </Chip>
          ))}
        </div>

        <h2 className="pt-1 text-sm font-bold">문항 수</h2>
        <div className="flex flex-wrap gap-2">
          {LIMITS.map((n) => (
            <Chip key={n} active={filter.limit === n} onClick={() => patch({ limit: n })}>
              {n === 0 ? '전체' : `${n}문항`}
            </Chip>
          ))}
        </div>
      </section>

      <div className="sticky bottom-[calc(var(--tabbar-h)+env(safe-area-inset-bottom))] z-20 -mx-4 border-t border-ink-700 bg-ink-900/95 px-4 py-3 backdrop-blur md:bottom-0 md:-mx-6 md:px-6">
        <p className="mb-2 text-xs text-[color:var(--fg-dim)]">
          조건에 맞는 문항 <b className="text-[color:var(--fg)]">{matched.length}</b>개
          {' · '}이번 세션 <b className="text-[color:var(--fg)]">{picked.length}</b>문항
        </p>
        <button
          type="button"
          className="btn-primary w-full"
          disabled={picked.length === 0}
          onClick={() => { void start(); }}
        >
          {picked.length ? `${picked.length}문항 풀기 시작` : '조건에 맞는 문항이 없다'}
        </button>
      </div>
    </div>
  );
}
