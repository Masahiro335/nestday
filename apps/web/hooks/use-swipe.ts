import { useRef } from 'react';
import type React from 'react';

export function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void, threshold = 50) {
  const startX = useRef<number | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (startX.current === null) return;
    const diff = startX.current - e.changedTouches[0].clientX;
    if (diff > threshold) onSwipeLeft();
    else if (diff < -threshold) onSwipeRight();
    startX.current = null;
  }

  return { onTouchStart, onTouchEnd };
}
