// 채점 규칙 — 순수 함수. UI·저장소·네트워크에 의존하지 않는다.
//
// 규칙 (정보처리기사 필기)
//   과목별 점수 = 정답수 × 5           (과목당 20문항 = 100점 만점)
//   과락       = 어느 한 과목이라도 40% 미만 (20문항 기준 8문항 미만)
//   합격       = 과락 없음 AND 전체 정답 60문항 이상
//
// 과락 임계는 상수 8 이 아니라 ceil(total × 0.4) 로 계산한다.
// 20문항이면 정확히 8 이라 정식 규칙과 같고, 과목 범위를 좁혀 20문항이
// 아닌 연습 시험을 봐도 같은 비율이 적용된다.

import type { ExamResult, SubjectId } from '../../types';

export const SUBJECT_IDS: readonly SubjectId[] = [1, 2, 3, 4, 5];
export const QUESTIONS_PER_SUBJECT = 20;
export const POINTS_PER_CORRECT = 5;
export const SUBJECT_FAIL_RATIO = 0.4;
export const PASS_TOTAL_CORRECT = 60;

export interface ExamAnswer {
  itemId: string;
  /** 채점 기준이 되는 과목 슬롯. 미분류 문항이 채워 넣어졌어도 슬롯 과목으로 센다. */
  subject: SubjectId;
  /** 사용자가 고른 번호(1..4). 무응답은 null. */
  chosen: number | null;
  /** 정답 번호. 없으면 채점 불가 → 항상 오답 처리. */
  answer?: number;
}

export type Tally = Record<SubjectId, { correct: number; total: number }>;

export function isCorrect(chosen: number | null | undefined, answer: number | undefined): boolean {
  return chosen != null && answer != null && chosen === answer;
}

export function subjectScore(correct: number): number {
  return correct * POINTS_PER_CORRECT;
}

/** 과락을 면하는 최소 정답 수. 20문항 → 8. */
export function failThreshold(total: number = QUESTIONS_PER_SUBJECT): number {
  return Math.ceil(total * SUBJECT_FAIL_RATIO);
}

/**
 * 과락 여부. total 이 0 인 과목(시험 범위 밖)은 과락으로 보지 않는다 —
 * 출제되지도 않은 과목 때문에 불합격이 되면 안 된다.
 */
export function isSubjectFailed(correct: number, total: number = QUESTIONS_PER_SUBJECT): boolean {
  if (total <= 0) return false;
  return correct < failThreshold(total);
}

export function emptyTally(): Tally {
  return {
    1: { correct: 0, total: 0 },
    2: { correct: 0, total: 0 },
    3: { correct: 0, total: 0 },
    4: { correct: 0, total: 0 },
    5: { correct: 0, total: 0 },
  };
}

export function tally(answers: readonly ExamAnswer[]): Tally {
  const t = emptyTally();
  for (const a of answers) {
    const bucket = t[a.subject];
    if (!bucket) continue;
    bucket.total += 1;
    if (isCorrect(a.chosen, a.answer)) bucket.correct += 1;
  }
  return t;
}

export function failedSubjects(t: Tally): SubjectId[] {
  return SUBJECT_IDS.filter((s) => isSubjectFailed(t[s].correct, t[s].total));
}

export function gradeExam(
  sid: string,
  answers: readonly ExamAnswer[],
  ts: number = Date.now(),
): ExamResult {
  const perSubject = tally(answers);
  const totalCorrect = SUBJECT_IDS.reduce((n, s) => n + perSubject[s].correct, 0);
  const failed = failedSubjects(perSubject);
  // 문항 순서와 답안도 결과에 싣는다 — 결과 화면의 문항별 리뷰가 기기를
  // 옮겨도 살아남고, 백업에도 함께 실린다.
  const picked: Record<string, number | null> = {};
  for (const a of answers) picked[a.itemId] = a.chosen;
  return {
    sid,
    ts,
    perSubject,
    totalCorrect,
    failedSubjects: failed,
    passed: failed.length === 0 && totalCorrect >= PASS_TOTAL_CORRECT,
    itemIds: answers.map((a) => a.itemId),
    answers: picked,
  };
}

export interface ExamSummary {
  /** 과목별 점수(정답수 × 5) */
  scores: Record<SubjectId, number>;
  totalQuestions: number;
  /** 100점 환산 평균. 문항이 0개면 0. */
  average: number;
  passed: boolean;
  failedSubjects: SubjectId[];
}

export function summarize(r: ExamResult): ExamSummary {
  const scores = {} as Record<SubjectId, number>;
  let totalQuestions = 0;
  for (const s of SUBJECT_IDS) {
    scores[s] = subjectScore(r.perSubject[s].correct);
    totalQuestions += r.perSubject[s].total;
  }
  const average = totalQuestions === 0
    ? 0
    : Math.round((r.totalCorrect / totalQuestions) * 1000) / 10;
  return {
    scores,
    totalQuestions,
    average,
    passed: r.passed,
    failedSubjects: r.failedSubjects,
  };
}
