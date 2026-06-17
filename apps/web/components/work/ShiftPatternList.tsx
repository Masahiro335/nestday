'use client';

import Link from 'next/link';
import type { ShiftPattern } from '@calendar-share/types';

interface ShiftPatternListProps {
  patterns: ShiftPattern[];
}

function formatTime(pattern: ShiftPattern): string {
  if (pattern.is_day_off) return '休日';
  if (pattern.start_time && pattern.end_time) {
    return `${pattern.start_time} - ${pattern.end_time}`;
  }
  return '';
}

export default function ShiftPatternList({ patterns }: ShiftPatternListProps) {
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
          {patterns.map((pattern) => (
            <Link
              key={pattern.id}
              href={`/work/patterns/${pattern.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                borderBottom: '1px solid #f3f4f6',
              }}
            >
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: pattern.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontWeight: 600, color: pattern.color }}>{pattern.name}</span>
              <span style={{ fontSize: 13, color: '#6b7280' }}>{formatTime(pattern)}</span>
              <span style={{ color: '#d1d5db' }}>›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
