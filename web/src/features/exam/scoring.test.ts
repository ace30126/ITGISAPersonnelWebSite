import { describe, expect, it } from 'vitest';
import type { SubjectId } from '../../types';
import {
  PASS_TOTAL_CORRECT,
  QUESTIONS_PER_SUBJECT,
  SUBJECT_IDS,
  emptyTally,
  failThreshold,
  gradeExam,
  isCorrect,
  isSubjectFailed,
  subjectScore,
  summarize,
  tally,
  type ExamAnswer,
} from './scoring';

/** 과목별 정답 수를 주면 그대로 채점되는 100문항 답안을 만든다. */
function answersFor(correctPerSubject: Record<SubjectId, number>, total = QUESTIONS_PER_SUBJECT): ExamAnswer[] {
  const out: ExamAnswer[] = [];
  for (const s of SUBJECT_IDS) {
    const want = correctPerSubject[s];
    for (let n = 0; n < total; n += 1) {
      out.push({
        itemId: `s${s}-${n}`,
        subject: s,
        answer: 1,
        chosen: n < want ? 1 : 2,
      });
    }
  }
  return out;
}

const evenly = (n: number): Record<SubjectId, number> => ({ 1: n, 2: n, 3: n, 4: n, 5: n });

describe('isCorrect', () => {
  it('무응답은 오답', () => {
    expect(isCorrect(null, 3)).toBe(false);
  });
  it('정답 정보가 없는 문항은 오답 처리 (채점 불가)', () => {
    expect(isCorrect(3, undefined)).toBe(false);
  });
  it('번호가 같아야 정답', () => {
    expect(isCorrect(3, 3)).toBe(true);
    expect(isCorrect(2, 3)).toBe(false);
  });
});

describe('과목 점수·과락 임계', () => {
  it('과목 점수 = 정답수 × 5', () => {
    expect(subjectScore(0)).toBe(0);
    expect(subjectScore(8)).toBe(40);
    expect(subjectScore(20)).toBe(100);
  });

  it('20문항 과목의 과락 임계는 정확히 8', () => {
    expect(failThreshold(20)).toBe(8);
    expect(failThreshold()).toBe(8);
  });

  it('경계: 8문항은 과락 아님, 7문항은 과락', () => {
    expect(isSubjectFailed(8)).toBe(false);
    expect(isSubjectFailed(7)).toBe(true);
  });

  it('출제되지 않은 과목(total 0)은 과락으로 보지 않는다', () => {
    expect(isSubjectFailed(0, 0)).toBe(false);
  });

  it('문항 수가 20이 아니어도 40% 비율이 유지된다', () => {
    expect(failThreshold(10)).toBe(4);
    expect(isSubjectFailed(4, 10)).toBe(false);
    expect(isSubjectFailed(3, 10)).toBe(true);
  });
});

describe('tally', () => {
  it('알 수 없는 과목 슬롯은 무시하고 죽지 않는다', () => {
    const t = tally([{ itemId: 'x', subject: 9 as SubjectId, chosen: 1, answer: 1 }]);
    expect(t).toEqual(emptyTally());
  });
});

describe('gradeExam 경계값', () => {
  it('전체 60문항 정답 + 과락 없음 → 합격', () => {
    const r = gradeExam('sid', answersFor({ 1: 12, 2: 12, 3: 12, 4: 12, 5: 12 }));
    expect(r.totalCorrect).toBe(60);
    expect(r.failedSubjects).toEqual([]);
    expect(r.passed).toBe(true);
  });

  it('전체 59문항 → 불합격 (과락은 없어도 총점 미달)', () => {
    const r = gradeExam('sid', answersFor({ 1: 11, 2: 12, 3: 12, 4: 12, 5: 12 }));
    expect(r.totalCorrect).toBe(59);
    expect(r.totalCorrect).toBeLessThan(PASS_TOTAL_CORRECT);
    expect(r.failedSubjects).toEqual([]);
    expect(r.passed).toBe(false);
  });

  it('총점은 충분한데 한 과목 7문항 → 과락으로 불합격', () => {
    const r = gradeExam('sid', answersFor({ 1: 7, 2: 20, 3: 20, 4: 20, 5: 13 }));
    expect(r.totalCorrect).toBe(80);
    expect(r.failedSubjects).toEqual([1]);
    expect(r.passed).toBe(false);
  });

  it('한 과목 정확히 8문항이면 과락이 아니다 (총점 충족 시 합격)', () => {
    const r = gradeExam('sid', answersFor({ 1: 8, 2: 13, 3: 13, 4: 13, 5: 13 }));
    expect(r.totalCorrect).toBe(60);
    expect(r.failedSubjects).toEqual([]);
    expect(r.passed).toBe(true);
  });

  it('여러 과목 과락이면 전부 나열된다', () => {
    const r = gradeExam('sid', answersFor({ 1: 5, 2: 5, 3: 20, 4: 20, 5: 20 }));
    expect(r.failedSubjects).toEqual([1, 2]);
    expect(r.passed).toBe(false);
  });

  it('전 과목 만점 → 100문항 정답·합격', () => {
    const r = gradeExam('sid', answersFor(evenly(20)));
    expect(r.totalCorrect).toBe(100);
    expect(r.passed).toBe(true);
  });

  it('전부 무응답 → 5과목 모두 과락', () => {
    const answers = answersFor(evenly(0)).map((a) => ({ ...a, chosen: null }));
    const r = gradeExam('sid', answers);
    expect(r.totalCorrect).toBe(0);
    expect(r.failedSubjects).toEqual([1, 2, 3, 4, 5]);
    expect(r.passed).toBe(false);
  });

  it('sid·ts 를 그대로 싣는다', () => {
    const r = gradeExam('exam-1', answersFor(evenly(12)), 1234);
    expect(r.sid).toBe('exam-1');
    expect(r.ts).toBe(1234);
  });

  it('문항 순서와 답안을 결과에 함께 싣는다 (결과 화면 리뷰용)', () => {
    const r = gradeExam('sid', [
      { itemId: 'a', subject: 1, chosen: 1, answer: 1 },
      { itemId: 'b', subject: 1, chosen: null, answer: 2 },
    ]);
    expect(r.itemIds).toEqual(['a', 'b']);
    expect(r.answers).toEqual({ a: 1, b: null });
  });

  it('빈 답안도 죽지 않는다 (전 과목 total 0 → 과락 없음, 총점 미달)', () => {
    const r = gradeExam('sid', []);
    expect(r.failedSubjects).toEqual([]);
    expect(r.passed).toBe(false);
    expect(r.perSubject[3]).toEqual({ correct: 0, total: 0 });
  });
});

describe('summarize', () => {
  it('과목 점수와 100점 환산 평균', () => {
    const s = summarize(gradeExam('sid', answersFor({ 1: 20, 2: 15, 3: 10, 4: 8, 5: 7 })));
    expect(s.scores).toEqual({ 1: 100, 2: 75, 3: 50, 4: 40, 5: 35 });
    expect(s.totalQuestions).toBe(100);
    expect(s.average).toBe(60);
    expect(s.failedSubjects).toEqual([5]);
    expect(s.passed).toBe(false);
  });

  it('문항이 0개면 평균 0으로 나눗셈 사고를 내지 않는다', () => {
    const s = summarize(gradeExam('sid', []));
    expect(s.average).toBe(0);
  });
});
