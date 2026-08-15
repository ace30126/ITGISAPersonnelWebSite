// 세션 자동 저장·복구.
//
// 폰에서 앱을 전환하거나 새로고침해도 풀던 자리로 돌아와야 한다. 그래서
// 저장을 두 겹으로 한다.
//   ① progress/api 의 saveSession (IndexedDB, B3 소유) — 정본
//   ② localStorage 미러 — IndexedDB 가 없거나(사파리 프라이빗) 느리거나
//      아직 구현 전이어도 복구가 되게 하는 안전망
// 어느 한쪽이 undefined/예외를 줘도 절대 화면을 죽이지 않는다.

import type { Attempt, ExamResult, Mode, SessionMeta, SubjectId } from '../../../types';
import type { ExamSlot } from '../../exam/select';
import {
  clearSession, loadSession, recordAttempt, saveSession,
} from '../../progress/api';

// 세션 목록("이어 풀기")은 공유 계약의 SessionMeta 를 그대로 쓴다.
export type { SessionMeta };

/** 풀이 세션의 전체 상태. 이 객체 하나만 있으면 화면이 복원된다. */
export interface PracticeState {
  sid: string;
  itemIds: string[];
  /** 현재 문항 위치. itemIds.length 면 요약 화면. */
  idx: number;
  /** itemId → 고른 번호. 즉시 채점이라 한 번 고르면 잠긴다. */
  answers: Record<string, number>;
  startedAt: number;
  label: string;
  /** 마지막 저장 시각. 정본(IndexedDB)과 미러(localStorage) 중 최신을 고르는 기준. */
  savedAt?: number;
}

/** 모의고사 세션 상태. */
export interface ExamState {
  sid: string;
  slots: ExamSlot[];
  idx: number;
  answers: Record<string, number>;
  startedAt: number;
  /** 제한시간(ms). null 이면 무제한. */
  limitMs: number | null;
  subjects: SubjectId[];
  seed: string;
  /** 마지막 저장 시각. 정본과 미러 중 최신을 고르는 기준. */
  savedAt?: number;
}

/** 결과 화면의 문항별 리뷰에 필요한 답안지 사본. */
export interface ExamPaper {
  sid: string;
  slots: ExamSlot[];
  answers: Record<string, number>;
  result: ExamResult;
  elapsedMs: number;
}

const PREFIX = 'gisa.session.';
const INDEX_KEY = 'gisa.sessions.v1';
const MAX_INDEX = 20;

function store(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readJson<T>(key: string): T | undefined {
  const s = store();
  if (!s) return undefined;
  try {
    const raw = s.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

function writeJson(key: string, value: unknown): void {
  const s = store();
  if (!s) return;
  try {
    s.setItem(key, JSON.stringify(value));
  } catch {
    // 용량 초과 등 — 저장 실패가 풀이를 막으면 안 된다.
  }
}

export function listSessions(): SessionMeta[] {
  return (readJson<SessionMeta[]>(INDEX_KEY) ?? []).filter((m) => m && m.sid);
}

function putMeta(meta: SessionMeta): void {
  const rest = listSessions().filter((m) => m.sid !== meta.sid);
  writeJson(INDEX_KEY, [meta, ...rest].slice(0, MAX_INDEX));
}

/** 매 응답마다 호출한다. 로컬 미러를 먼저 쓰고(동기) IndexedDB 는 뒤따른다. */
export async function persistSession<T extends object>(
  sid: string, mode: Mode, state: T, meta: { label: string; total: number; done: number },
): Promise<void> {
  const stamped = { ...state, savedAt: Date.now() };
  writeJson(PREFIX + sid, stamped);
  putMeta({ sid, mode, ts: Date.now(), ...meta });
  try {
    await saveSession(sid, mode, stamped);
  } catch {
    // 로컬 미러가 있으니 복구는 된다.
  }
}

/**
 * 정본과 미러 중 **더 최신** 을 고른다.
 * 🔥 "정본 우선" 으로 짰다가 실제로 답이 날아갔다: IndexedDB 쓰기가 아직
 * 커밋되지 않은 채 새로고침되면 정본은 한 세대 낡은 상태를 돌려주고,
 * 그게 방금 동기로 써 둔 미러를 덮어썼다. savedAt 으로 세대를 비교한다.
 */
export async function restoreSession<T extends object>(sid: string): Promise<T | undefined> {
  const local = readJson<T & { savedAt?: number }>(PREFIX + sid);
  let fromDb: (T & { savedAt?: number }) | undefined;
  try {
    fromDb = (await loadSession<T & { savedAt?: number }>(sid)) ?? undefined;
  } catch {
    fromDb = undefined;
  }
  if (!fromDb) return local;
  if (!local) return fromDb;
  return (local.savedAt ?? 0) > (fromDb.savedAt ?? 0) ? local : fromDb;
}

export async function dropSession(sid: string): Promise<void> {
  const s = store();
  try {
    s?.removeItem(PREFIX + sid);
  } catch {
    /* noop */
  }
  writeJson(INDEX_KEY, listSessions().filter((m) => m.sid !== sid));
  try {
    await clearSession(sid);
  } catch {
    /* noop */
  }
}

/** 기록 API 가 실패해도 풀이는 계속돼야 한다. */
export async function safeRecordAttempt(a: Omit<Attempt, 'id'>): Promise<void> {
  try {
    await recordAttempt(a);
  } catch {
    /* noop */
  }
}

// --- 모의고사 답안지 로컬 사본 ----------------------------------------------
// 문항별 답안 자체는 이제 ExamResult.itemIds/answers 로 정본에 들어간다.
// 여기 사본이 더 갖는 것은 슬롯 정보(어떤 문항이 어느 과목 슬롯을 메웠는지)와
// 소요 시간뿐이다. 정본이 있으면 결과 화면은 사본 없이도 그려진다.

const EXAM_PREFIX = 'gisa.exam.paper.';

export function saveExamPaper(paper: ExamPaper): void {
  writeJson(EXAM_PREFIX + paper.sid, paper);
}

export function loadExamPaper(sid: string): ExamPaper | undefined {
  return readJson<ExamPaper>(EXAM_PREFIX + sid);
}
