// AI 응답 캐시. (templateId, conceptId) 하나당 한 번만 호출하면 되게 만든다.
// 무료 키의 분당 한도가 좁아서, 캐시가 곧 기능이다.
//
// 진도 DB(B3 소유)와 섞이지 않게 별도 IndexedDB 이름을 쓴다.

import Dexie, { type Table } from 'dexie';
import type { AiAnswer } from '../../types';

export const AI_DB_NAME = 'gisa-ai';

class AiDb extends Dexie {
  answers!: Table<AiAnswer, string>;

  constructor(name = AI_DB_NAME) {
    super(name);
    this.version(1).stores({ answers: 'key, ts' });
  }
}

let instance: AiDb | null = null;

function db(): AiDb | null {
  try {
    instance ??= new AiDb();
    return instance;
  } catch {
    // IndexedDB 가 아예 없는 환경(구형 사파리 프라이빗 등) — 캐시 없이 동작한다
    return null;
  }
}

export function answerKey(templateId: string, conceptId: string): string {
  return `${templateId}:${conceptId}`;
}

export async function getAnswer(key: string): Promise<AiAnswer | undefined> {
  try {
    return await db()?.answers.get(key);
  } catch {
    return undefined;
  }
}

export async function saveAnswer(key: string, body: string): Promise<AiAnswer | undefined> {
  const row: AiAnswer = { key, body, ts: Date.now() };
  try {
    // 다시 생성한 답변은 이전 투표를 승계하지 않는다(내용이 달라졌으므로).
    await db()?.answers.put(row);
    return row;
  } catch {
    return undefined;
  }
}

export async function setVote(key: string, vote: 1 | -1 | undefined): Promise<void> {
  try {
    const d = db();
    if (!d) return;
    const cur = await d.answers.get(key);
    if (!cur) return;
    const next: AiAnswer = { ...cur };
    if (vote === undefined) delete next.vote;
    else next.vote = vote;
    await d.answers.put(next);
  } catch {
    /* 캐시 실패는 화면을 막지 않는다 */
  }
}

export async function listAnswers(): Promise<AiAnswer[]> {
  try {
    return (await db()?.answers.toArray()) ?? [];
  } catch {
    return [];
  }
}

export async function clearAnswers(): Promise<void> {
  try {
    await db()?.answers.clear();
  } catch {
    /* noop */
  }
}
