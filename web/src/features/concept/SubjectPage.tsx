// 과목 홈 — 그 과목의 개념 목록과 출제 빈도 티어.
// 여기서는 **본문 샤드를 받지 않는다**(경량 인덱스 + meta 만). 폰에서 즉시 뜬다.

import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { loadIndex, loadMeta } from '../../lib/dataLoader';
import { SUBJECT_NAMES, type LightItem, type Meta, type SubjectId } from '../../types';
import { loadSubjectConcepts } from './data';
import { computeSubjectFreq, subjectItems, tagCounts, type ConceptFreq } from './freq';
import TierBadge, { freqTitle } from './TierBadge';
import type { Concept } from './types';

const TAG_LABEL: Record<string, string> = {
  'topic:keyword': '키워드 찾기',
  'topic:wrong': '틀린 설명 찾기',
  'topic:kinds': '종류·순서',
  'topic:code': '코드 해석',
  'topic:calc': '계산',
};

const LEVEL_LABEL: Record<NonNullable<Concept['level']>, string> = {
  core: '핵심',
  supporting: '보조',
  trivia: '지엽',
};

function isSubjectId(v: unknown): v is SubjectId {
  return v === 1 || v === 2 || v === 3 || v === 4 || v === 5;
}

export default function SubjectPage() {
  const params = useParams();
  const parsed = Number(params.s);
  const subject: SubjectId | null = isSubjectId(parsed) ? parsed : null;

  const [index, setIndex] = useState<LightItem[] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [concepts, setConcepts] = useState<Concept[] | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (subject === null) return;
    let alive = true;
    setError('');
    setIndex(null);
    Promise.all([loadIndex(), loadMeta(), loadSubjectConcepts(subject)])
      .then(([idx, m, cs]) => {
        if (!alive) return;
        setIndex(idx);
        setMeta(m);
        setConcepts(cs);
      })
      .catch((e: unknown) => {
        if (alive) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      alive = false;
    };
  }, [subject]);

  const stats = useMemo(() => {
    if (!index || subject === null) return null;
    const items = subjectItems(index, subject);
    return {
      items,
      count: items.length,
      withExpl: items.filter((l) => l.e === 1).length,
      withImage: items.filter((l) => l.g === 1).length,
      tags: tagCounts(items),
    };
  }, [index, subject]);

  const freqs = useMemo(() => {
    if (!index || !concepts || subject === null) return new Map<string, ConceptFreq>();
    return new Map(computeSubjectFreq(concepts, index, subject).map((f) => [f.conceptId, f]));
  }, [index, concepts, subject]);

  const ordered = useMemo(() => {
    if (!concepts) return [];
    return [...concepts].sort(
      (a, b) => (freqs.get(b.id)?.score ?? 0) - (freqs.get(a.id)?.score ?? 0),
    );
  }, [concepts, freqs]);

  if (subject === null) {
    return <p className="text-sm text-[color:var(--fg-dim)]">과목 번호가 올바르지 않습니다 (1~5).</p>;
  }
  if (error) {
    return (
      <div className="card text-sm">
        <p className="font-semibold text-bad">문항 데이터를 열지 못했습니다.</p>
        <p className="mt-1 text-[color:var(--fg-dim)]">{error}</p>
      </div>
    );
  }
  if (!stats || !concepts || !meta) {
    return <p className="text-sm text-[color:var(--fg-dim)]">불러오는 중…</p>;
  }

  return (
    <div>
      <header>
        <p className="text-xs opacity-60">{subject}과목</p>
        <h1 className="text-xl font-bold" style={{ wordBreak: 'keep-all' }}>
          {SUBJECT_NAMES[subject]}
        </h1>
        <p className="mt-1 text-xs text-[color:var(--fg-dim)]">
          기출 {stats.count}문항 · 해설 {stats.withExpl}개 · 그림 포함 {stats.withImage}개
          {' · 전체 '}
          {meta.total}문항
        </p>
      </header>

      <section className="mt-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-bold">개념</h2>
          <span className="text-[11px] opacity-55">티어는 과목 안에서 상대 평가</span>
        </div>

        {ordered.length === 0 ? (
          <div className="card mt-2">
            <p className="text-sm font-semibold">집필 예정</p>
            <p className="mt-1 text-xs leading-relaxed text-[color:var(--fg-dim)]">
              이 과목의 개념 노트는 아직 준비 중입니다. 그 전까지는 아래 유형별로 기출을
              바로 풀 수 있습니다.
            </p>
          </div>
        ) : (
          <ul className="mt-2 space-y-2">
            {ordered.map((c) => {
              const f = freqs.get(c.id);
              return (
                <li key={c.id}>
                  <Link
                    to={`/concepts/${c.id}`}
                    className="block rounded-2xl border border-ink-700 bg-ink-800/70 p-3 transition-colors hover:border-ink-600 active:border-accent"
                  >
                    <div className="flex items-start gap-2">
                      {f && <TierBadge freq={f} />}
                      <span
                        className="flex-1 text-sm font-semibold leading-snug"
                        style={{ wordBreak: 'keep-all' }}
                      >
                        {c.title}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[11px] opacity-60" title={f ? freqTitle(f) : ''}>
                      {c.level ? `${LEVEL_LABEL[c.level]} · ` : ''}연결 기출 {f?.pinned ?? c.items.length}개
                      {f && f.auto > 0 && ` (+자동 ${f.auto})`} · 퀴즈 {c.quiz.length}문항
                      {f && ` · 가중 출제 ${f.score.toFixed(1)}회`}
                    </p>
                    {f && f.missing.length > 0 && (
                      <p className="mt-1 text-[11px] text-bad/80">
                        연결 오류 {f.missing.length}건 (인덱스에 없는 문항 id)
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-6">
        <h2 className="text-base font-bold">유형별 기출 바로가기</h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {stats.tags.map(([tag, n]) => (
            <li key={tag}>
              <Link
                to={`/practice?subject=${subject}&tag=${encodeURIComponent(tag)}`}
                className="min-h-tap inline-flex items-center gap-1.5 rounded-full border border-ink-600 bg-ink-800 px-3 py-2 text-xs"
              >
                <span>{TAG_LABEL[tag] ?? tag}</span>
                <span className="opacity-55">{n}</span>
              </Link>
            </li>
          ))}
          <li>
            <Link
              to={`/practice?subject=${subject}`}
              className="min-h-tap inline-flex items-center rounded-full border border-accent/50 bg-accent/20 px-3 py-2 text-xs font-semibold text-accent-soft"
            >
              과목 전체 {stats.count}문항
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
