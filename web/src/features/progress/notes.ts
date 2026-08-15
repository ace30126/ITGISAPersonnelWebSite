// 문항 메모. api.ts 계약에 없는 기능이라 별도 모듈로 둔다
// (계약 파일에 함수를 덧붙이면 B1/B2 가 읽는 "고정된 목록"이 흐려진다).

import { db, type Note } from './db';

export async function getNote(itemId: string): Promise<Note | undefined> {
  return db.notes.get(itemId);
}

/** 빈 내용은 저장하지 않고 지운다 — 빈 메모 행이 오답노트 화면을 어지럽힌다. */
export async function saveNote(itemId: string, body: string): Promise<void> {
  const trimmed = body.trim();
  if (!trimmed) {
    await db.notes.delete(itemId);
    return;
  }
  await db.notes.put({ itemId, body: trimmed, ts: Date.now() });
}

export async function listNotes(): Promise<Note[]> {
  return (await db.notes.orderBy('ts').toArray()).reverse();
}

export async function noteMap(itemIds: string[]): Promise<Map<string, Note>> {
  const rows = await db.notes.bulkGet(itemIds);
  const out = new Map<string, Note>();
  rows.forEach((r) => { if (r) out.set(r.itemId, r); });
  return out;
}
