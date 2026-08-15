// 시드 고정 난수. 같은 시드 → 항상 같은 결과.
// 모의고사 문항 선정이 재현 가능해야 하므로 Math.random() 은 쓰지 않는다.

/** 문자열/숫자 시드를 32bit 정수로 접는다 (FNV-1a). */
export function hashSeed(seed: string | number): number {
  const s = String(seed);
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 — 짧고 통계적으로 충분하며 결정적이다. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeRng(seed: string | number): () => number {
  return mulberry32(hashSeed(seed));
}

/** Fisher-Yates. 입력을 건드리지 않는다. */
export function shuffled<T>(arr: readonly T[], rand: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const a = out[i]!;
    const b = out[j]!;
    out[i] = b;
    out[j] = a;
  }
  return out;
}

/**
 * 가중 무작위 정렬 (A-Res). weight 가 클수록 앞에 올 확률이 높다.
 * rand() 호출 순서가 입력 순서에 고정돼 있어 결정적이다.
 */
export function weightedOrder<T>(
  items: readonly T[],
  weightOf: (item: T) => number,
  rand: () => number,
): T[] {
  const keyed = items.map((item, i) => {
    const w = Math.max(weightOf(item), 1e-6);
    const u = Math.max(rand(), 1e-12);
    return { item, i, key: Math.pow(u, 1 / w) };
  });
  keyed.sort((x, y) => (y.key - x.key) || (x.i - y.i));
  return keyed.map((k) => k.item);
}

/** 세션 id 생성. 시간 + 난수라 충돌하지 않는다. */
export function newSid(prefix: string): string {
  const t = Date.now().toString(36);
  const r = Math.floor(Math.random() * 1679616).toString(36).padStart(4, '0');
  return `${prefix}${t}${r}`;
}
