'use client';

import { useRef, useEffect, type ReactNode } from 'react';

function adjacent(year: number, month: number, delta: -1 | 1) {
  if (delta === -1) return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}

interface MonthSliderProps {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
  children: (year: number, month: number, isCurrent: boolean) => ReactNode;
}

export default function MonthSlider({ year, month, onPrev, onNext, children }: MonthSliderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const busy = useRef(false);

  const prev = adjacent(year, month, -1);
  const next = adjacent(year, month, +1);

  const panels = [
    { year: prev.year, month: prev.month, isCurrent: false },
    { year, month, isCurrent: true },
    { year: next.year, month: next.month, isCurrent: false },
  ];

  // 月が変わったらスクロール位置を中央（現在月）にリセット
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.scrollBehavior = 'auto';
    el.scrollTop = el.clientHeight;
    requestAnimationFrame(() => {
      if (el) el.style.scrollBehavior = '';
    });
    busy.current = false;
  }, [year, month]);

  function onScroll() {
    if (busy.current) return;
    if (timer.current) clearTimeout(timer.current);
    // スクロールが止まってから判定（スナップアニメーション完了後）
    timer.current = setTimeout(() => {
      const el = ref.current;
      if (!el || busy.current) return;
      const h = el.clientHeight;
      if (el.scrollTop < h * 0.5) {
        busy.current = true;
        onPrev();
      } else if (el.scrollTop > h * 1.5) {
        busy.current = true;
        onNext();
      }
    }, 100);
  }

  return (
    <div style={{ flex: 1, overflow: 'hidden' }}>
      <div
        ref={ref}
        onScroll={onScroll}
        className="month-slider-inner"
        style={{
          height: '100%',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          scrollbarWidth: 'none',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          msOverflowStyle: 'none' as any,
        }}
      >
        {panels.map(({ year: y, month: m, isCurrent }) => (
          <div
            key={`${y}-${m}`}
            style={{
              height: '100%',
              scrollSnapAlign: 'start',
              scrollSnapStop: 'always',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {children(y, m, isCurrent)}
          </div>
        ))}
      </div>
    </div>
  );
}
