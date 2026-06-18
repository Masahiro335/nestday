'use client';

import type { Shift, ShiftPattern } from '@calendar-share/types';
import { assignShift, removeShift } from '@/hooks/use-shifts';

interface ShiftSelectPanelProps {
  isOpen: boolean;
  date: string | null;
  myShift: Shift | undefined;
  patterns: ShiftPattern[];
  onClose: () => void;
  onUpdated: () => void;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const DOW = ['日', '月', '火', '水', '木', '金', '土'];
  return `${d.getMonth() + 1}月${d.getDate()}日（${DOW[d.getDay()]}）`;
}

export default function ShiftSelectPanel({
  isOpen,
  date,
  myShift,
  patterns,
  onClose,
  onUpdated,
}: ShiftSelectPanelProps) {
  if (!isOpen || !date) return null;

  async function handleSelect(patternId: string) {
    if (!date) return;
    await assignShift(date, patternId);
    onUpdated();
    onClose();
  }

  async function handleRemove() {
    if (!date) return;
    await removeShift(date);
    onUpdated();
    onClose();
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 40 }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: 'var(--bottom-nav-height)',
          left: 0,
          right: 0,
          background: '#fff',
          borderRadius: '16px 16px 0 0',
          zIndex: 50,
          maxHeight: '65vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.12)',
        }}
      >
        <div style={{ width: 40, height: 4, background: '#d1d5db', borderRadius: 2, margin: '12px auto 0' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>{formatDateLabel(date)}</span>
          <button onClick={onClose} style={{ fontSize: 20, color: '#6b7280' }}>✕</button>
        </div>

        <p style={{ fontSize: 13, color: '#6b7280', padding: '0 16px 8px' }}>自分のシフトを選択</p>

        <div style={{ overflowY: 'auto', padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {patterns.length === 0 && (
            <p style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: '16px 0' }}>
              シフトパターンがありません
            </p>
          )}
          {patterns.map((pattern) => {
            const isSelected = myShift?.shiftPatternId === pattern.id;
            return (
              <button
                key={pattern.id}
                onClick={() => handleSelect(pattern.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  border: isSelected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  borderRadius: 10,
                  background: isSelected ? '#eff6ff' : '#fff',
                  textAlign: 'left',
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: pattern.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>{pattern.name}</span>
                <span style={{ fontSize: 12, color: '#6b7280' }}>
                  {pattern.isDayOff
                    ? '休日'
                    : pattern.startTime && pattern.endTime
                    ? `${pattern.startTime}〜${pattern.endTime}`
                    : ''}
                </span>
              </button>
            );
          })}

          {myShift && (
            <button
              onClick={handleRemove}
              style={{
                padding: '10px',
                border: '1px solid #fca5a5',
                borderRadius: 8,
                color: '#ef4444',
                fontSize: 14,
                marginTop: 4,
              }}
            >
              シフトを削除
            </button>
          )}
        </div>
      </div>
    </>
  );
}
