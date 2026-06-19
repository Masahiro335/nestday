import { useRef } from 'react';
import type React from 'react';

export function useSwipe(onSwipeUp: () => void, onSwipeDown: () => void, threshold = 50) {
  const startY = useRef<number | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    startY.current = e.touches[0].clientY;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (startY.current === null) return;
    const diff = startY.current - e.changedTouches[0].clientY;
    if (diff > threshold) onSwipeUp();
    else if (diff < -threshold) onSwipeDown();
    startY.current = null;
  }

  return { onTouchStart, onTouchEnd };
}
