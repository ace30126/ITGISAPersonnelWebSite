// Dexie 통합 테스트. fake-indexeddb 를 **가장 먼저** 올려야 Dexie 가 진짜
// indexedDB 를 찾다가 실패하지 않는다 (import 순서가 의미를 갖는 드문 경우).
import 'fake-indexeddb/auto';

import { beforeEach, describe, expect, it } from 'vitest';
import type { Attempt, ExamResult, Srs } from '../../types';
import {
  attemptedItemIds, clearSession, dueItemIds, getSrs, listExamResults,
  loadSession, recordAttempt, saveExamResult, saveSession, wrongItemIds,
} from './api';
import { GisaDb, db } from './db';
import { exportBackup, importBackup, parseBackup, rebuildSrs, wipeAll } from './backup';
import { saveNote } from './notes';
import { DAY_MS } from './srs';

const T0 = Date.UTC(2026, 7, 15, 9, 0, 0);
const plus = (n: number) => T0 + n * DAY_MS;

function att(o: Partial<Attempt> & { itemId: string; correct: boolean; ts: number }): Omit<Attempt, 'id'> {
  return {
    chosen: o.correct ? 1 : 2,
    mode: 'practice',
    elapsedMs: 12_000,
    ...o,
  };
}

/** 비교용: id(자동증가, 기기마다 다름)를 뺀 srs 전량 */
async function srsRows(target: GisaDb): Promise<Srs[]> {
  const rows = await target.srs.toArray();
  return rows.sort((a, b) => a.itemId.localeCompare(b.itemId));
}

beforeEach(async () => {
  await wipeAll(db);
});

describe('recordAttempt', () => {
  it('attempt 와 srs 를 함께 남긴다', async () => {
    await recordAttempt(att({ itemId: 'q1', correct: true, ts: T0 }));
    expect(await db.attempts.count()).toBe(1);
    const s = await getSrs('q1');
    expect(s).toMatchObject({ itemId: 'q1', reps: 1, interval: 1, lapses: 0 });
    expect(s!.due).toBe(T0 + DAY_MS);
  });

  it('같은 문항을 여러 번 풀면 attempt 는 쌓이고 srs 는 하나다', async () => {
    await recordAttempt(att({ itemId: 'q1', correct: false, ts: T0 }));
    await recordAttempt(att({ itemId: 'q1', correct: true, ts: plus(1) }));
    expect(await db.attempts.count()).toBe(2);
    expect(await db.srs.count()).toBe(1);
    expect((await getSrs('q1'))!.lapses).toBe(1);
  });
});

describe('큐 조회', () => {
  beforeEach(async () => {
    // q1 정답(내일 due) / q2 오답(즉시 due) / q3 정답(내일 due)
    await recordAttempt(att({ itemId: 'q1', correct: true, ts: T0 }));
    await recordAttempt(att({ itemId: 'q2', correct: false, ts: T0, mode: 'exam' }));
    await recordAttempt(att({ itemId: 'q3', correct: true, ts: T0 }));
  });

  it('dueItemIds — 오답은 당일, 정답은 내일부터', async () => {
    expect(await dueItemIds(T0)).toEqual(['q2']);
    const tomorrow = plus(1);
    expect((await dueItemIds(tomorrow)).sort()).toEqual(['q1', 'q2', 'q3']);
  });

  it('wrongItemIds — lapses > 0 만', async () => {
    expect(await wrongItemIds()).toEqual(['q2']);
  });

  it('attemptedItemIds — 시도한 id 집합', async () => {
    const set = await attemptedItemIds();
    expect([...set].sort()).toEqual(['q1', 'q2', 'q3']);
    expect(set.has('q9')).toBe(false);
  });
});

describe('세션 자동 저장', () => {
  it('저장 → 복구 → 삭제', async () => {
    await saveSession('s1', 'practice', { i: 3, answers: [1, 2, null] });
    const got = await loadSession<{ i: number; answers: (number | null)[] }>('s1');
    expect(got?.i).toBe(3);
    expect(got?.answers).toEqual([1, 2, null]);

    await saveSession('s1', 'practice', { i: 4, answers: [1, 2, 3] });
    expect((await loadSession<{ i: number }>('s1'))?.i).toBe(4); // 덮어쓴다
    expect(await db.sessions.count()).toBe(1);

    await clearSession('s1');
    expect(await loadSession('s1')).toBeUndefined();
  });
});

describe('모의고사 결과', () => {
  it('저장하고 최신순으로 읽는다', async () => {
    const mk = (sid: string, ts: number, totalCorrect: number): ExamResult => ({
      sid, ts, totalCorrect,
      perSubject: {
        1: { correct: 12, total: 20 }, 2: { correct: 12, total: 20 },
        3: { correct: 12, total: 20 }, 4: { correct: 12, total: 20 },
        5: { correct: 12, total: 20 },
      },
      failedSubjects: [], passed: totalCorrect >= 60,
    });
    await saveExamResult(mk('e1', plus(0), 55));
    await saveExamResult(mk('e2', plus(1), 71));
    const list = await listExamResults();
    expect(list.map((r) => r.sid)).toEqual(['e2', 'e1']);
    expect(list[0].passed).toBe(true);
  });
});

describe('export / import 왕복', () => {
  async function seed(): Promise<void> {
    await recordAttempt(att({ itemId: 'q1', correct: true, ts: T0 }));
    await recordAttempt(att({ itemId: 'q2', correct: false, ts: plus(0.5) }));
    await recordAttempt(att({ itemId: 'q3', correct: true, ts: plus(1), mode: 'review' }));
    await saveNote('q2', '조인 순서를 헷갈렸다');
  }

  it('새 DB 에 넣으면 attempts·srs·notes 가 동일하게 재현된다', async () => {
    await seed();
    const before = {
      due: await dueItemIds(plus(2)),
      wrong: await wrongItemIds(),
      srs: await srsRows(db),
    };

    // 실제 백업은 파일을 거치므로 JSON 직렬화까지 통과시킨다.
    const file = JSON.parse(JSON.stringify(await exportBackup(db))) as unknown;
    expect(parseBackup(file).attempts).toHaveLength(3);

    const fresh = new GisaDb('gisa-roundtrip');
    await fresh.delete();
    await fresh.open();
    const report = await importBackup(file, fresh);
    expect(report).toMatchObject({ attemptsAdded: 3, attemptsSkipped: 0, notesAdded: 1 });

    expect(await srsRows(fresh)).toEqual(before.srs);
    expect((await fresh.notes.get('q2'))?.body).toBe('조인 순서를 헷갈렸다');

    // 같은 질의를 새 DB 에 직접 걸어도 결과가 같다.
    const dueFresh = (await fresh.srs.where('due').belowOrEqual(plus(2)).toArray())
      .sort((a, b) => a.due - b.due || b.lapses - a.lapses).map((r) => r.itemId);
    const wrongFresh = (await fresh.srs.where('lapses').above(0).toArray()).map((r) => r.itemId);
    expect(dueFresh).toEqual(before.due);
    expect(wrongFresh).toEqual(before.wrong);

    await fresh.delete();
  });

  it('같은 파일을 두 번 넣어도 중복 attempt 가 생기지 않는다', async () => {
    await seed();
    const file = JSON.parse(JSON.stringify(await exportBackup(db))) as unknown;

    const again = await importBackup(file, db); // 자기 자신에게 다시 적용
    expect(again).toMatchObject({ attemptsAdded: 0, attemptsSkipped: 3 });
    expect(await db.attempts.count()).toBe(3);
    expect(await srsRows(db)).toEqual(await srsRows(db));
  });

  it('두 기기 기록을 합치면 겹치는 것만 걸러진다', async () => {
    await seed();
    const fileA = JSON.parse(JSON.stringify(await exportBackup(db))) as unknown;

    await wipeAll(db);
    await recordAttempt(att({ itemId: 'q1', correct: true, ts: T0 }));   // A 와 겹침
    await recordAttempt(att({ itemId: 'q9', correct: false, ts: plus(3) })); // B 고유

    const rep = await importBackup(fileA, db);
    expect(rep.attemptsAdded).toBe(2);   // q2, q3
    expect(rep.attemptsSkipped).toBe(1); // q1 은 동일 (itemId, ts)
    expect(await db.attempts.count()).toBe(4);
    expect((await wrongItemIds()).sort()).toEqual(['q2', 'q9']);
  });

  it('노트는 더 최신 ts 가 이긴다', async () => {
    await db.notes.put({ itemId: 'q1', body: '옛날 메모', ts: 100 });
    const older = { app: 'gisa-study', v: 1, exportedAt: 0, attempts: [], notes: [{ itemId: 'q1', body: '더 옛날', ts: 50 }] };
    expect((await importBackup(older, db)).notesSkipped).toBe(1);
    expect((await db.notes.get('q1'))?.body).toBe('옛날 메모');

    const newer = { app: 'gisa-study', v: 1, exportedAt: 0, attempts: [], notes: [{ itemId: 'q1', body: '새 메모', ts: 200 }] };
    expect((await importBackup(newer, db)).notesUpdated).toBe(1);
    expect((await db.notes.get('q1'))?.body).toBe('새 메모');
  });

  it('남의 파일·깨진 파일은 거부한다', async () => {
    expect(() => parseBackup(null)).toThrow();
    expect(() => parseBackup({ app: 'other' })).toThrow();
    expect(() => parseBackup({ app: 'gisa-study', v: 99 })).toThrow();
    // 행 단위로 망가진 것은 그 행만 버린다 (전량 실패보다 낫다)
    const partial = parseBackup({
      app: 'gisa-study', v: 1,
      attempts: [{ itemId: 'q1', ts: 1, correct: true, mode: 'practice' }, { itemId: 42 }],
      notes: [{ itemId: 'q1', body: 'ok', ts: 1 }, null],
    });
    expect(partial.attempts).toHaveLength(1);
    expect(partial.attempts[0].elapsedMs).toBe(0);
    expect(partial.notes).toHaveLength(1);
  });
});

describe('rebuildSrs', () => {
  it('srs 를 날려도 attempts 만으로 완전히 복원된다', async () => {
    await recordAttempt(att({ itemId: 'q1', correct: true, ts: T0 }));
    await recordAttempt(att({ itemId: 'q1', correct: false, ts: plus(1) }));
    await recordAttempt(att({ itemId: 'q2', correct: true, ts: plus(1) }));
    const before = await srsRows(db);

    await db.srs.clear();
    expect(await db.srs.count()).toBe(0);

    const n = await rebuildSrs(db);
    expect(n).toBe(2);
    expect(await srsRows(db)).toEqual(before);
  });
});
