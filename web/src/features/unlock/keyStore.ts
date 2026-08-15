// 패스프레이즈 보관소 — IndexedDB.
//
// localStorage 를 쓰지 않는 이유:
//  1) PWA 에서 저장소 계층을 하나로 맞춘다(학습기록도 IndexedDB/Dexie).
//  2) localStorage 는 동기 API 라 첫 페인트를 막고, 용량·격리 정책도 다르다.
//
// Dexie 를 쓰지 않고 raw IDB 를 쓰는 이유: 이 DB 는 B3 의 학습기록 DB 와
// 완전히 분리돼야 하고(잠금해제는 기록보다 먼저 필요하다), 의존성도 0 이면 좋다.

const DB_NAME = 'gisa-unlock';
const DB_VERSION = 1;
const STORE = 'kv';
const KEY = 'passphrase';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    let req: IDBOpenDBRequest;
    try {
      req = indexedDB.open(DB_NAME, DB_VERSION);
    } catch (e) {
      reject(e);
      return;
    }
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('IndexedDB 열기가 차단되었다'));
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

/** 저장된 패스프레이즈. 없거나 IndexedDB 를 못 쓰면 null(치명적이지 않다). */
export async function getStoredPassphrase(): Promise<string | null> {
  try {
    const v = await withStore<unknown>('readonly', (s) => s.get(KEY) as IDBRequest<unknown>);
    return typeof v === 'string' && v.length > 0 ? v : null;
  } catch {
    return null;
  }
}

/** 저장 실패는 무시한다 — 이번 세션은 이미 열려 있고, 다음에 다시 물으면 된다. */
export async function savePassphrase(pass: string): Promise<void> {
  try {
    await withStore('readwrite', (s) => s.put(pass, KEY) as IDBRequest<IDBValidKey>);
  } catch {
    /* private 모드 등 — 무시 */
  }
}

export async function clearPassphrase(): Promise<void> {
  try {
    await withStore('readwrite', (s) => s.delete(KEY) as IDBRequest<undefined>);
  } catch {
    /* 무시 */
  }
}
