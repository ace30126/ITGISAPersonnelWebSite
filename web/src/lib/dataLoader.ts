// 데이터 로딩 계약 — 오케스트레이터만 수정한다.
//
// 설계 핵심: 경량 인덱스(≈95KB, gzip ≈27KB)만으로 필터·통계·SRS·모의고사
// 문항 선정이 **전부** 가능하다. 지문·보기는 세션을 실제로 시작할 때만 받는다.
// 해설은 또 별도 샤드라 시험 모드에서는 네트워크에 아예 뜨지 않는다.

import {
  checkKey, decryptBytes, decryptJson, deriveKey, loadManifest, type Manifest,
} from './crypto';
import type { ItemBody, ItemExpl, LightItem, Meta, SubjectId } from '../types';

let manifest: Manifest | null = null;
let key: CryptoKey | null = null;

// 캐시는 **값이 아니라 Promise** 를 담는다.
// 값만 담으면 캐시가 채워지기 전에 두 컴포넌트가 동시에 부를 때 같은 샤드를
// 두 번 받아 두 번 복호화한다(PBKDF2 이후라 복호화 자체도 싸지 않다).
let indexCache: Promise<LightItem[]> | null = null;
let metaCache: Promise<Meta> | null = null;
const bodyCache = new Map<string, Promise<Map<string, ItemBody>>>();
const explCache = new Map<string, Promise<Map<string, ItemExpl>>>();

export function isUnlocked(): boolean {
  return key !== null;
}

/** 패스프레이즈로 잠금 해제. 틀리면 false 를 돌려주고 아무것도 받지 않는다. */
export async function unlock(passphrase: string): Promise<boolean> {
  manifest ??= await loadManifest();
  const k = await deriveKey(passphrase, manifest);
  if (!(await checkKey(k, manifest))) return false;
  key = k;
  return true;
}

export function lock(): void {
  key = null;
  indexCache = null;
  metaCache = null;
  bodyCache.clear();
  explCache.clear();
  // objectURL 은 명시적으로 해제하지 않으면 문서가 살아 있는 한 남는다.
  // 자산이 208장이라 잠금·해제를 반복하면 누수가 유의미해진다.
  for (const url of assetUrls.values()) URL.revokeObjectURL(url);
  assetUrls.clear();
}

function need(): { man: Manifest; k: CryptoKey } {
  if (!manifest || !key) throw new Error('잠금 해제되지 않았다. unlock() 을 먼저 부를 것.');
  return { man: manifest, k: key };
}

export function loadIndex(): Promise<LightItem[]> {
  if (!indexCache) {
    const { man, k } = need();
    indexCache = decryptJson<LightItem[]>(k, man, 'index/items.min.json')
      .catch((e) => { indexCache = null; throw e; });   // 실패는 캐시하지 않는다
  }
  return indexCache;
}

export function loadMeta(): Promise<Meta> {
  if (!metaCache) {
    const { man, k } = need();
    metaCache = decryptJson<Meta>(k, man, 'meta.json')
      .catch((e) => { metaCache = null; throw e; });
  }
  return metaCache;
}

/** 과목 샤드. 0 은 과목 미분류. */
export function loadBodies(subject: SubjectId | 0): Promise<Map<string, ItemBody>> {
  const sk = String(subject);
  let p = bodyCache.get(sk);
  if (!p) {
    const { man, k } = need();
    p = decryptJson<ItemBody[]>(k, man, `items/subject-${subject}.json`)
      .then((rows) => new Map(rows.map((r) => [r.i, r])))
      .catch((e) => { bodyCache.delete(sk); throw e; });
    bodyCache.set(sk, p);
  }
  return p;
}

export function loadExpls(subject: SubjectId | 0): Promise<Map<string, ItemExpl>> {
  const sk = String(subject);
  let p = explCache.get(sk);
  if (!p) {
    const { man, k } = need();
    // 해설이 없는 과목 샤드는 파일 자체가 없을 수 있다 — 빈 맵으로 흡수한다.
    p = decryptJson<ItemExpl[]>(k, man, `expl/subject-${subject}.json`)
      .catch(() => [] as ItemExpl[])
      .then((rows) => new Map(rows.map((r) => [r.i, r])));
    explCache.set(sk, p);
  }
  return p;
}

/**
 * 임의의 id 목록에 대한 본문을 가져온다.
 * 필요한 샤드만 골라 **병렬로** 받는다. 모의고사는 최악의 경우 5개 샤드(≈440KB).
 */
export async function loadItems(
  ids: string[], index?: LightItem[],
): Promise<Map<string, ItemBody>> {
  const idx = index ?? (await loadIndex());
  const byId = new Map(idx.map((l) => [l.i, l]));
  const subjects = new Set<SubjectId | 0>();
  for (const id of ids) subjects.add((byId.get(id)?.s ?? 0) as SubjectId | 0);

  const maps = await Promise.all([...subjects].map((s) => loadBodies(s)));
  const out = new Map<string, ItemBody>();
  for (const id of ids) {
    for (const m of maps) {
      const b = m.get(id);
      if (b) { out.set(id, b); break; }
    }
  }
  return out;
}

/**
 * id 목록에 대한 해설. loadItems() 와 대칭이다.
 * 이게 없으면 "id → 과목 → 샤드" 매핑을 소비자마다 따로 구현하게 된다.
 */
export async function loadExplsFor(
  ids: string[], index?: LightItem[],
): Promise<Map<string, ItemExpl>> {
  const idx = index ?? (await loadIndex());
  const byId = new Map(idx.map((l) => [l.i, l]));
  const subjects = new Set<SubjectId | 0>();
  for (const id of ids) subjects.add((byId.get(id)?.s ?? 0) as SubjectId | 0);

  const maps = await Promise.all([...subjects].map((s) => loadExpls(s)));
  const out = new Map<string, ItemExpl>();
  for (const id of ids) {
    for (const m of maps) {
      const e = m.get(id);
      if (e) { out.set(id, e); break; }
    }
  }
  return out;
}

/** 보기가 통째로 이미지인 문항 — 텍스트 버튼 대신 PNG 를 렌더해야 한다. */
export function choicesAreImage(l: LightItem): boolean {
  return !!l.f?.includes('ci');
}

const assetUrls = new Map<string, string>();
const assetPending = new Map<string, Promise<string>>();

/**
 * Block(type:'image').src 를 <img src> 에 넣을 수 있는 objectURL 로 바꾼다.
 * 자산도 암호화돼 있어 평범한 URL 로는 못 띄운다.
 * 해제는 lock() 이 일괄로 한다.
 */
export function loadAsset(src: string): Promise<string> {
  const rel = 'assets/' + src.split('assets/').pop()!;
  const hit = assetUrls.get(rel);
  if (hit) return Promise.resolve(hit);

  let p = assetPending.get(rel);
  if (!p) {
    const { man, k } = need();
    p = decryptBytes(k, man, rel)
      .then((buf) => {
        const url = URL.createObjectURL(new Blob([buf], { type: 'image/png' }));
        assetUrls.set(rel, url);
        assetPending.delete(rel);
        return url;
      })
      .catch((e) => { assetPending.delete(rel); throw e; });
    assetPending.set(rel, p);
  }
  return p;
}
