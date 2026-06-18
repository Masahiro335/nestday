'use client';

import Link from 'next/link';
import api from '@/lib/api';

export interface ApiShiftPattern {
  id: string;
  name: string;
  color: string;
  startTime: string | null;
  endTime: string | null;
  breakMinutes: number;
  isDayOff: boolean;
  sortOrder: number;
}

interface ShiftPatternListProps {
  patterns: ApiShiftPattern[];
  onReordered: () => void;
}

function formatTime(pattern: ApiShiftPattern): string {
  if (pattern.isDayOff) return '休日';
  if (pattern.startTime && pattern.endTime) {
    return `${pattern.startTime} - ${pattern.endTime}`;
  }
  return '';
}

export default function ShiftPatternList({ patterns, onReordered }: ShiftPatternListProps) {
  async function handleMove(index: number, direction: 'up' | 'down') {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= patterns.length) return;

    const a = patterns[index];
    const b = patterns[swapIndex];

    await Promise.all([
      api.patch(`/shift-patterns/${a.id}`, { sortOrder: b.sortOrder }),
      api.patch(`/shift-patterns/${b.id}`, { sortOrder: a.sortOrder }),
    ]);
    onReordered();
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
        <Link href="/work" style={{ color: '#3b82f6', fontSize: 15 }}>‹ 戻る</Link>
        <span style={{ fontWeight: 700, fontSize: 16 }}>シフトパターン設定</span>
        <Link href="/work/patterns/new" style={{ color: '#3b82f6', fontSize: 20, fontWeight: 700 }}>＋</Link>
      </div>

      {patterns.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>
          <p>パターンがありません</p>
          <Link href="/work/patterns/new" style={{ color: '#3b82f6', fontSize: 14, marginTop: 8, display: 'inline-block' }}>
            最初のパターンを作成する
          </Link>
        </div>
      ) : (
        <div>
          {patterns.map((pattern, i) => (
            <div
              key={pattern.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 16px',
                borderBottom: '1px solid #f3f4f6',
              }}
            >
              {/* 上下ボタン */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => handleMove(i, 'up')}
                  disabled={i === 0}
                  style={{
                    width: 24, height: 22, fontSize: 12, lineHeight: 1,
                    border: '1px solid #e5e7eb', borderRadius: 4,
                    color: i === 0 ? '#d1d5db' : '#6b7280',
                    background: '#fff', cursor: i === 0 ? 'default' : 'pointer',
                  }}
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(i, 'down')}
                  disabled={i === patterns.length - 1}
                  style={{
                    width: 24, height: 22, fontSize: 12, lineHeight: 1,
                    border: '1px solid #e5e7eb', borderRadius: 4,
                    color: i === patterns.length - 1 ? '#d1d5db' : '#6b7280',
                    background: '#fff', cursor: i === patterns.length - 1 ? 'default' : 'pointer',
                  }}
                >
                  ▼
                </button>
              </div>

              {/* パターン行（タップで編集） */}
              <Link
                href={`/work/patterns/${pattern.id}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  flex: 1, minWidth: 0, padding: '4px 0',
                }}
              >
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: pattern.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontWeight: 600, color: pattern.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {pattern.name}
                </span>
                <span style={{ fontSize: 13, color: '#6b7280', flexShrink: 0 }}>{formatTime(pattern)}</span>
                <span style={{ color: '#d1d5db' }}>›</span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
