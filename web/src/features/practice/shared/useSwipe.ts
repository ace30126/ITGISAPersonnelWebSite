// 좌우 스와이프로 문항 이동. 세로 스크롤과 싸우지 않게 각도와 거리를 본다.

import { useRef } from 'react';
import type { TouchEvent } from 'react';

const MIN_X = 60;   // 이보다 짧으면 탭·흔들림으로 본다
const MAX_Y = 45;   // 세로가 크면 스크롤 의도다

export interface SwipeHandlers {
  onTouchStart: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
}

export function useSwipe(onLeft: () => void, onRight: () => void): SwipeHandlers {
  const start = useRef<{ x: number; y: number } | null>(null);

  return {
    onTouchStart: (e) => {
      const t = e.touches[0];
      start.current = t ? { x: t.clientX, y: t.clientY } : null;
    },
    onTouchEnd: (e) => {
      const s = start.current;
      const t = e.changedTouches[0];
      start.current = null;
      if (!s || !t) return;
      const dx = t.clientX - s.x;
      const dy = t.clientY - s.y;
      if (Math.abs(dx) < MIN_X || Math.abs(dy) > MAX_Y) return;
      if (dx < 0) onLeft(); else onRight();
    },
  };
}
