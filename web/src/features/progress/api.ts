// 진도·기록 API 계약 (B3 소유 구현, B2/B4 가 호출).
//
// ⚠ 시그니처는 오케스트레이터가 고정했다. B3 는 **구현만** 채우고 시그니처를
// 바꾸지 않는다. 바꾸면 아직 목데이터로 개발 중인 B2 가 컴파일 실패한다.
//
// 구현 원칙: 이 파일은 얇은 파사드다. 스키마는 db.ts, 알고리즘은 srs.ts,
// 집계는 stats.ts, 백업은 backup.ts 에 있다.

import type { Attempt, ExamResult, Mode, Srs } from '../../types';
import { db } from './db';
import { initialSrs, nextSrs } from './srs';

/** 문항 하나를 풀 때마다 호출. attempts 가 유일한 진실 원천이다. */
export async function recordAttempt(a: Omit<Attempt, 'id'>): Promise<void> {
  // attempt 추가와 srs 갱신은 한 트랜잭션이다. 둘이 갈라지면 "기록은 있는데
  // 복습 큐에 안 뜨는" 문항이 생기고, 사용자는 그걸 영영 모른다.
  await db.transaction('rw', db.attempts, db.srs, async () => {
    await db.attempts.add(a as Attempt);
    const prev = (await db.srs.get(a.itemId)) ?? initialSrs(a.itemId);
    // now 로 a.ts 를 쓴다 → 나중에 attempts 를 replay 해도 똑같은 상태가 나온다.
    await db.srs.put(nextSrs(prev, a.correct, a.ts));
  });
}

/** 오늘 복습해야 할 문항 id (SRS due). */
export async function dueItemIds(now = Date.now()): Promise<string[]> {
  const rows = await db.srs.where('due').belowOrEqual(now).toArray();
  // 오래 밀린 것 먼저, 같은 due 면 많이 틀린 것 먼저.
  rows.sort((x, y) => x.due - y.due || y.lapses - x.lapses);
  return rows.map((r) => r.itemId);
}

/** 오답노트 = lapses > 0. */
export async function wrongItemIds(): Promise<string[]> {
  const rows = await db.srs.where('lapses').above(0).toArray();
  rows.sort((x, y) => y.lapses - x.lapses || x.due - y.due);
  return rows.map((r) => r.itemId);
}

export async function getSrs(itemId: string): Promise<Srs | undefined> {
  return db.srs.get(itemId);
}

/** 이미 푼 적 있는 문항 id 집합 — 모의고사에서 미풀이 우선 가중에 쓴다. */
export async function attemptedItemIds(): Promise<Set<string>> {
  // 전체 행을 읽지 않고 itemId 인덱스의 고유 키만 훑는다.
  const keys = (await db.attempts.orderBy('itemId').uniqueKeys()) as string[];
  return new Set(keys);
}

export async function saveExamResult(r: ExamResult): Promise<void> {
  await db.examResults.put(r);
}

export async function listExamResults(): Promise<ExamResult[]> {
  // 최신이 위로.
  return (await db.examResults.orderBy('ts').toArray()).reverse();
}

/** 진행 중 세션 자동 저장 — 폰에서 앱 전환·새로고침 시 복구용. */
export async function saveSession(sid: string, mode: Mode, state: unknown): Promise<void> {
  // 매 문항마다 불린다. put 한 방으로 끝내고 읽기·트랜잭션을 섞지 않는다.
  await db.sessions.put({ sid, mode, state, ts: Date.now() });
}

export async function loadSession<T>(sid: string): Promise<T | undefined> {
  const row = await db.sessions.get(sid);
  return row?.state as T | undefined;
}

export async function clearSession(sid: string): Promise<void> {
  await db.sessions.delete(sid);
}
