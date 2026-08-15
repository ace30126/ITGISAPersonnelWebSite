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

let indexCache: LightItem[] | null = null;
let metaCache: Meta | null = null;
const bodyCache = new Map<string, Map<string, ItemBody>>();
const explCache = new Map<string, Map<string, ItemExpl>>();

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
}

function need(): { man: Manifest; k: CryptoKey } {
  if (!manifest || !key) throw new Error('잠금 해제되지 않았다. unlock() 을 먼저 부를 것.');
  return { man: manifest, k: key };
}

export async function loadIndex(): Promise<LightItem[]> {
  if (indexCache) return indexCache;
  const { man, k } = need();
  indexCache = await decryptJson<LightItem[]>(k, man, 'index/items.min.json');
  return indexCache;
}

export async function loadMeta(): Promise<Meta> {
  if (metaCache) return metaCache;
  const { man, k } = need();
  metaCache = await decryptJson<Meta>(k, man, 'meta.json');
  return metaCache;
}

/** 과목 샤드. 0 은 과목 미분류. */
export async function loadBodies(subject: SubjectId | 0): Promise<Map<string, ItemBody>> {
  const cached = bodyCache.get(String(subject));
  if (cached) return cached;
  const { man, k } = need();
  const rows = await decryptJson<ItemBody[]>(k, man, `items/subject-${subject}.json`);
  const map = new Map(rows.map((r) => [r.i, r]));
  bodyCache.set(String(subject), map);
  return map;
}

export async function loadExpls(subject: SubjectId | 0): Promise<Map<string, ItemExpl>> {
  const cached = explCache.get(String(subject));
  if (cached) return cached;
  const { man, k } = need();
  let rows: ItemExpl[] = [];
  try {
    rows = await decryptJson<ItemExpl[]>(k, man, `expl/subject-${subject}.json`);
  } catch {
    rows = [];
  }
  const map = new Map(rows.map((r) => [r.i, r]));
  explCache.set(String(subject), map);
  return map;
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

/** 보기가 통째로 이미지인 문항 — 텍스트 버튼 대신 PNG 를 렌더해야 한다. */
export function choicesAreImage(l: LightItem): boolean {
  return !!l.f?.includes('ci');
}

const assetUrls = new Map<string, string>();

/**
 * Block(type:'image').src 를 <img src> 에 넣을 수 있는 objectURL 로 바꾼다.
 * 자산도 암호화돼 있어 평범한 URL 로는 못 띄운다.
 */
export async function loadAsset(src: string): Promise<string> {
  const rel = 'assets/' + src.split('assets/').pop()!;
  const hit = assetUrls.get(rel);
  if (hit) return hit;
  const { man, k } = need();
  const bytes = await decryptBytes(k, man, rel);
  const url = URL.createObjectURL(new Blob([bytes], { type: 'image/png' }));
  assetUrls.set(rel, url);
  return url;
}
