import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SUBJECT_NAMES, type Attempt, type ItemBody, type LightItem, type Srs } from '../../types';
import { loadIndex, loadItems } from '../../lib/dataLoader';
import { db, type Note } from './db';
import { saveNote } from './notes';
import { startOfDay } from './stats';

type Tab = 'due' | 'wrong';
const PAGE = 20;

function dday(due: number, now: number): string {
  const diff = Math.round((startOfDay(due) - startOfDay(now)) / 86_400_000);
  if (diff < 0) return `${-diff}일 지남`;
  if (diff === 0) return '오늘';
  return `D-${diff}`;
}

/** 최근 시도 O/X 를 오래된 것부터 5개까지. */
function History({ list }: { list: Attempt[] }) {
  const recent = list.slice(-5);
  if (recent.length === 0) return null;
  return (
    <span className="flex gap-1" aria-label="최근 시도">
      {recent.map((a) => (
        <span
          key={a.id ?? a.ts}
          title={new Date(a.ts).toLocaleString()}
          className={`h-1.5 w-1.5 rounded-full ${a.correct ? 'bg-ok' : 'bg-bad'}`}
        />
      ))}
    </span>
  );
}

export default function ReviewPage() {
  const [now] = useState(() => Date.now());
  const [tab, setTab] = useState<Tab>('due');
  const [limit, setLimit] = useState(PAGE);
  const [open, setOpen] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const rows = useLiveQuery(
    async () => {
      const list =
        tab === 'due'
          ? await db.srs.where('due').belowOrEqual(now).toArray()
          : await db.srs.where('lapses').above(0).toArray();
      // 많이 틀린 것부터, 같으면 오래 밀린 것부터.
      list.sort((a, b) => b.lapses - a.lapses || a.due - b.due);
      return list;
    },
    [tab, now],
    [] as Srs[],
  );
  const dueCount = useLiveQuery(
    () => db.srs.where('due').belowOrEqual(now).count(), [now], 0,
  );
  const wrongCount = useLiveQuery(() => db.srs.where('lapses').above(0).count(), [], 0);

  const visible = useMemo(() => rows.slice(0, limit), [rows, limit]);
  const ids = useMemo(() => visible.map((r) => r.itemId), [visible]);
  const idKey = ids.join(',');

  const notes = useLiveQuery(
    async () => new Map((await db.notes.toArray()).map((n) => [n.itemId, n])),
    [],
    new Map<string, Note>(),
  );
  const attemptsByItem = useLiveQuery(
    async () => {
      if (ids.length === 0) return new Map<string, Attempt[]>();
      const list = await db.attempts.where('itemId').anyOf(ids).toArray();
      list.sort((a, b) => a.ts - b.ts);
      const m = new Map<string, Attempt[]>();
      for (const a of list) {
        const arr = m.get(a.itemId);
        if (arr) arr.push(a); else m.set(a.itemId, [a]);
      }
      return m;
    },
    [idKey],
    new Map<string, Attempt[]>(),
  );

  // 지문·보기는 암호화 샤드라 잠금 해제가 필요하다. 못 받으면 id 만 보여준다.
  const [bodies, setBodies] = useState<Map<string, ItemBody>>(new Map());
  const [light, setLight] = useState<Map<string, LightItem>>(new Map());
  useEffect(() => {
    let alive = true;
    loadIndex()
      .then((idx) => { if (alive) setLight(new Map(idx.map((l) => [l.i, l]))); })
      .catch(() => undefined);
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    if (ids.length === 0) return;
    let alive = true;
    loadItems(ids)
      .then((m) => { if (alive) setBodies((prev) => new Map([...prev, ...m])); })
      .catch(() => undefined);
    return () => { alive = false; };
  }, [idKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const startHref = tab === 'due' ? '/practice?filter=review' : '/practice?filter=wrong';
  const empty = rows.length === 0;

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 pb-[calc(5rem+env(safe-area-inset-bottom))]">
      <h1 className="text-lg font-bold text-white">오답노트</h1>

      <div className="flex gap-2">
        {(
          [
            ['due', `복습 예정 ${dueCount}`],
            ['wrong', `틀린 문항 ${wrongCount}`],
          ] as [Tab, string][]
        ).map(([t, label]) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setLimit(PAGE); }}
            className={`min-h-tap flex-1 rounded-xl border px-3 text-sm font-medium ${
              tab === t
                ? 'border-accent bg-accent/15 text-accent-soft'
                : 'border-ink-700 bg-ink-800/60 text-white/60'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {!empty && (
        <Link
          to={startHref}
          className="flex min-h-tap items-center justify-center rounded-xl bg-accent px-4 text-sm font-semibold text-ink-900"
        >
          복습 시작 ({rows.length}문항)
        </Link>
      )}

      {empty ? (
        <p className="rounded-2xl border border-ink-700 bg-ink-800/60 p-4 text-sm text-white/60">
          {tab === 'due'
            ? '지금 복습할 문항이 없다. 새 문제를 풀면 일정이 잡힌다.'
            : '틀린 문항이 없다.'}
        </p>
      ) : (
        <ul className="space-y-2">
          {visible.map((r) => {
            const body = bodies.get(r.itemId);
            const l = light.get(r.itemId);
            const note = notes.get(r.itemId);
            const hist = attemptsByItem.get(r.itemId) ?? [];
            const last = hist[hist.length - 1];
            const isOpen = open === r.itemId;
            return (
              <li key={r.itemId} className="rounded-2xl border border-ink-700 bg-ink-800/60 p-3">
                <div className="flex items-center gap-2 text-[11px] text-white/40">
                  {l?.s ? <span>{SUBJECT_NAMES[l.s]}</span> : <span>미분류</span>}
                  {l?.y ? <span>· {l.y}년</span> : null}
                  <span className="ml-auto flex items-center gap-2">
                    <History list={hist} />
                    {r.lapses > 0 ? <span className="text-bad">오답 {r.lapses}</span> : null}
                    <span>{dday(r.due, now)}</span>
                  </span>
                </div>

                <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-white/85">
                  {body?.stem ?? r.itemId}
                </p>

                {body && l?.a ? (
                  <p className="mt-1 text-[11px] text-white/50">
                    정답 <span className="text-ok">{l.a}번</span>
                    {last && last.chosen != null && !last.correct ? (
                      <> · 내가 고른 답 <span className="text-bad">{last.chosen}번</span></>
                    ) : null}
                  </p>
                ) : null}

                {note && !isOpen ? (
                  <p className="mt-2 whitespace-pre-wrap rounded-xl bg-ink-900/60 p-2 text-xs text-white/70">
                    {note.body}
                  </p>
                ) : null}

                {isOpen ? (
                  <div className="mt-2">
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      rows={3}
                      placeholder="왜 틀렸는지, 뭘 헷갈렸는지 적어 둔다."
                      className="w-full rounded-xl border border-ink-600 bg-ink-900 p-2 text-sm text-white placeholder:text-white/30"
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={async () => { await saveNote(r.itemId, draft); setOpen(null); }}
                        className="min-h-tap rounded-xl bg-accent px-4 text-sm font-semibold text-ink-900"
                      >
                        저장
                      </button>
                      <button
                        type="button"
                        onClick={() => setOpen(null)}
                        className="min-h-tap rounded-xl border border-ink-600 px-4 text-sm text-white/70"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setOpen(r.itemId); setDraft(note?.body ?? ''); }}
                    className="mt-2 text-xs text-accent-soft"
                  >
                    {note ? '메모 수정' : '메모 쓰기'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {rows.length > limit && (
        <button
          type="button"
          onClick={() => setLimit((n) => n + PAGE)}
          className="min-h-tap w-full rounded-xl border border-ink-700 text-sm text-white/60"
        >
          더 보기 ({rows.length - limit}문항)
        </button>
      )}
    </div>
  );
}
