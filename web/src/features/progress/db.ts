// Dexie 스키마. 저장소는 여기 한 곳에서만 선언한다.
//
// 원칙: `attempts` 가 유일한 진실 원천이다.
//  - srs        = attempts 를 replay 하면 100% 복원된다 (파생 캐시)
//  - 통계       = attempts 집계 (저장하지 않는다)
//  - sessions   = 진행 중 세션 복구용 임시 상태 (끝나면 지운다)
//  - examResults= 모의고사 채점 스냅샷 (문항 구성이 바뀌어도 점수는 남아야 하므로 저장)
//  - notes      = 사람이 직접 쓴 것이라 재계산 불가 → 백업 대상

import Dexie, { type Table } from 'dexie';
import type { Attempt, ExamResult, Mode, Srs } from '../../types';

/** 진행 중 세션 자동 저장 1행. state 는 B2 가 정의하는 임의 구조라 unknown 이다. */
export interface SessionRow {
  sid: string;
  mode: Mode;
  state: unknown;
  ts: number;
}

/** 문항별 내 메모(오답노트). */
export interface Note {
  itemId: string;
  body: string;
  ts: number;
}

export const DB_NAME = 'gisa-study';

export class GisaDb extends Dexie {
  attempts!: Table<Attempt, number>;
  srs!: Table<Srs, string>;
  sessions!: Table<SessionRow, string>;
  examResults!: Table<ExamResult, string>;
  notes!: Table<Note, string>;

  constructor(name: string = DB_NAME) {
    super(name);
    this.version(1).stores({
      // ++id = 자동증가 PK. [itemId+ts] 복합 인덱스는 import 중복 판정에 쓴다.
      attempts: '++id, itemId, ts, mode, [itemId+ts]',
      srs: 'itemId, due, lapses',
      sessions: 'sid, mode, ts',
      examResults: 'sid, ts',
      notes: 'itemId, ts',
    });
  }
}

/** 앱 전역 인스턴스. 테스트는 `new GisaDb('별도이름')` 으로 격리한다. */
export const db = new GisaDb();

/**
 * 오래된 진행중 세션 잔해를 치운다.
 * clearSession 은 세션을 "끝냈을 때"만 불린다. 중간에 앱을 닫고 다시 안 돌아온
 * 세션은 영원히 남으므로 가끔 쓸어 준다. (통계 화면 진입 때 한 번 호출)
 */
export async function pruneSessions(
  maxAgeDays = 30,
  now: number = Date.now(),
): Promise<number> {
  return db.sessions.where('ts').below(now - maxAgeDays * 86_400_000).delete();
}
