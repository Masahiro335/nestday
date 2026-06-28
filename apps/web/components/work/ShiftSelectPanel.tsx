'use client';

import { useState, useEffect } from 'react';
import type { Shift, ShiftPattern } from '@calendar-share/types';
import { assignShifts, removeShift } from '@/hooks/use-shifts';

interface ShiftSelectPanelProps {
  isOpen: boolean;
  date: string | null;
  myShifts: Shift[];
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
  myShifts,
  patterns,
  onClose,
  onUpdated,
}: ShiftSelectPanelProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set(myShifts.map((s) => s.shiftPatternId)));
    }
  }, [isOpen, myShifts]);

  if (!isOpen || !date) return null;

  function togglePattern(patternId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(patternId)) {
        next.delete(patternId);
      } else {
        next.add(patternId);
      }
      return next;
    });
  }

  async function handleSave() {
    if (!date) return;
    setSaving(true);
    try {
      await assignShifts(date, Array.from(selectedIds));
      onUpdated();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveAll() {
    if (!date) return;
    setSaving(true);
    try {
      await removeShift(date);
      onUpdated();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const hasChanges =
    selectedIds.size !== myShifts.length ||
    myShifts.some((s) => !selectedIds.has(s.shiftPatternId));

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
          maxHeight: '70vh',
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

        <p style={{ fontSize: 13, color: '#6b7280', padding: '0 16px 8px' }}>
          シフトを選択（複数可）
        </p>

        <div style={{ overflowY: 'auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          {patterns.length === 0 && (
            <p style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: '16px 0' }}>
              シフトパターンがありません
            </p>
          )}
          {patterns.map((pattern) => {
            const isSelected = selectedIds.has(pattern.id);
            return (
              <button
                key={pattern.id}
                onClick={() => togglePattern(pattern.id)}
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
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    border: isSelected ? '2px solid #3b82f6' : '2px solid #d1d5db',
                    background: isSelected ? '#3b82f6' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span
                  style={{
                    width: 12,
                    height: 12,
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
        </div>

        <div style={{ padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            style={{
              padding: '12px',
              borderRadius: 10,
              background: hasChanges && !saving ? '#3b82f6' : '#d1d5db',
              color: '#fff',
              fontSize: 15,
              fontWeight: 700,
              border: 'none',
              cursor: hasChanges && !saving ? 'pointer' : 'default',
            }}
          >
            {saving ? '保存中...' : '保存する'}
          </button>

          {myShifts.length > 0 && (
            <button
              onClick={handleRemoveAll}
              disabled={saving}
              style={{
                padding: '10px',
                border: '1px solid #fca5a5',
                borderRadius: 8,
                color: '#ef4444',
                fontSize: 14,
                background: '#fff',
              }}
            >
              この日のシフトを全て削除
            </button>
          )}
        </div>
      </div>
    </>
  );
}
