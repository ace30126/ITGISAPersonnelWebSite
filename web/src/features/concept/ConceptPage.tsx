// 개념 페이지 — 본문 · 도식 · 미니 퀴즈 · 관련 기출 · AI 비유 설명.
//
// 개념 본문도 Phase 5 부터 암호화 샤드에서 온다(concepts/subject-{n}.json).
// 다만 기출(관련 문항)은 별도 샤드라 로딩·오류를 따로 관리한다 —
// 본문은 떴는데 기출만 못 여는 상태를 사용자에게 정확히 알려 주기 위해서다.

import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { loadBodies, loadExpls, loadIndex } from '../../lib/dataLoader';
import { SUBJECT_NAMES, type ItemBody, type ItemExpl, type LightItem } from '../../types';
import WhyPanel from '../ai/WhyPanel';
import { getConcept, loadSubjectConcepts } from './data';
import { computeSubjectFreq, type ConceptFreq } from './freq';
import ConceptBody from './ConceptBody';
import { rankRelated } from './match';
import Quiz from './Quiz';
import RelatedItems from './RelatedItems';
import TierBadge, { freqTitle } from './TierBadge';
import type { Concept } from './types';

/** 자동 매칭 행 상한(pin 은 전부 보여준다) */
const AUTO_RELATED_LIMIT = 5;
/** AI 프롬프트에 실을 기출 개수(opt-in 일 때만 실제로 전송) */
const AI_ITEM_LIMIT = 3;

interface ExamData {
  index: LightItem[];
  bodies: Map<string, ItemBody>;
  expls: Map<string, ItemExpl>;
}

export default function ConceptPage() {
  const { id = '' } = useParams();

  const [concept, setConcept] = useState<Concept | null | undefined>(undefined);
  const [siblings, setSiblings] = useState<Concept[]>([]);
  const [exam, setExam] = useState<ExamData | null>(null);
  const [examError, setExamError] = useState('');

  useEffect(() => {
    let alive = true;
    setConcept(undefined);
    void getConcept(id).then(async (c) => {
      if (!alive) return;
      setConcept(c ?? null);
      if (c) setSiblings(await loadSubjectConcepts(c.subject));
    });
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!concept) return;
    let alive = true;
    setExam(null);
    setExamError('');
    Promise.all([loadIndex(), loadBodies(concept.subject), loadExpls(concept.subject)])
      .then(([index, bodies, expls]) => {
        if (alive) setExam({ index, bodies, expls });
      })
      .catch((e: unknown) => {
        if (alive) setExamError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      alive = false;
    };
  }, [concept]);

  const freq: ConceptFreq | null = useMemo(() => {
    if (!concept || !exam) return null;
    return (
      computeSubjectFreq(siblings, exam.index, concept.subject).find(
        (f) => f.conceptId === concept.id,
      ) ?? null
    );
  }, [concept, siblings, exam]);

  const related = useMemo(() => {
    if (!concept || !exam) return [];
    const stems = new Map<string, string>();
    for (const [k, v] of exam.bodies) stems.set(k, v.stem);
    return rankRelated(concept, exam.index, { autoLimit: AUTO_RELATED_LIMIT, stems });
  }, [concept, exam]);

  const aiItems = useMemo(() => {
    if (!exam) return [];
    return related
      .filter((r) => r.source === 'pinned')
      .slice(0, AI_ITEM_LIMIT)
      .map((r) => ({ id: r.id, stem: exam.bodies.get(r.id)?.stem ?? '' }))
      .filter((x) => x.stem.length > 0);
  }, [related, exam]);

  if (concept === undefined) {
    return <p className="text-sm text-[color:var(--fg-dim)]">불러오는 중…</p>;
  }
  if (concept === null) {
    return (
      <div className="card text-sm">
        <p className="font-semibold">그런 개념이 없습니다.</p>
        <p className="mt-1 text-[color:var(--fg-dim)]">주소를 확인해 주세요. (id: {id})</p>
      </div>
    );
  }

  return (
    <article>
      <header>
        <Link to={`/subjects/${concept.subject}`} className="text-xs text-accent-soft">
          ← {concept.subject}과목 {SUBJECT_NAMES[concept.subject]}
        </Link>
        <div className="mt-1.5 flex items-start gap-2">
          {freq && <TierBadge freq={freq} />}
          <h1 className="flex-1 text-xl font-bold leading-snug" style={{ wordBreak: 'keep-all' }}>
            {concept.title}
          </h1>
        </div>
        {freq && (
          <p className="mt-1 text-[11px] opacity-55" title={freqTitle(freq)}>
            {freqTitle(freq)}
          </p>
        )}
      </header>

      <div className="mt-4">
        <WhyPanel concept={concept} itemStems={aiItems} />
      </div>

      <section className="mt-5">
        <ConceptBody
          body={concept.body}
          diagrams={concept.diagrams}
          className="text-sm"
        />
      </section>

      {/* 도식은 ConceptBody 가 본문의 [[fig:n]] 자리에 끼워 넣는다.
          여기서 또 그리면 같은 그림이 두 번 나온다 — 저자가 둔 위치가 맞다. */}

      {concept.quiz.length > 0 && (
        <section className="mt-6">
          <h2 className="text-base font-bold">확인 퀴즈</h2>
          <p className="mb-2 mt-0.5 text-[11px] opacity-55">
            개념 확인용입니다. 기출 기록(오답노트)에는 들어가지 않습니다.
          </p>
          <Quiz items={concept.quiz} />
        </section>
      )}

      <section className="mt-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-bold">관련 기출</h2>
          <span className="text-[11px] opacity-55">‘자동’ = 지문·태그로 자동 매칭</span>
        </div>
        <div className="mt-2">
          {examError ? (
            <p className="text-sm opacity-70" style={{ wordBreak: 'keep-all' }}>
              기출을 열지 못했습니다. {examError}
            </p>
          ) : !exam ? (
            <p className="text-sm opacity-60">기출 불러오는 중…</p>
          ) : (
            <RelatedItems rows={related} bodies={exam.bodies} expls={exam.expls} />
          )}
        </div>
      </section>
    </article>
  );
}
