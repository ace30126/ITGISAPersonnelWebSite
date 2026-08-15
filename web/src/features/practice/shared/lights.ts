// 세션이 쓰는 문항들의 경량 인덱스만 뽑아 둔다.
// 1,243행 전체를 화면 상태로 들고 있을 이유가 없다.

import type { LightItem } from '../../../types';

export function pickLights(
  ids: readonly string[], index: readonly LightItem[],
): Map<string, LightItem> {
  const byId = new Map(index.map((l) => [l.i, l] as const));
  const out = new Map<string, LightItem>();
  for (const id of ids) {
    const l = byId.get(id);
    if (l) out.set(id, l);
  }
  return out;
}
