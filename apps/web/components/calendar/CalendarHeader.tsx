'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

interface CalendarHeaderProps {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
  groupName?: string;
  hasMultipleGroups?: boolean;
  onGroupTap?: () => void;
}

export default function CalendarHeader({
  year,
  month,
  onPrev,
  onNext,
  groupName,
  hasMultipleGroups,
  onGroupTap,
}: CalendarHeaderProps) {
  const pathname = usePathname();
  const isPrivate = pathname === '/';

  return (
    <div style={{ padding: '12px 8px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        {/* グループ名（タップで切替） */}
        <div>
          {groupName ? (
            <button
              type="button"
              onClick={hasMultipleGroups ? onGroupTap : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 13, color: '#6b7280', fontWeight: 600,
                background: 'none', padding: '2px 0',
                cursor: hasMultipleGroups ? 'pointer' : 'default',
              }}
            >
              {groupName}
              {hasMultipleGroups && <span style={{ fontSize: 10 }}>▼</span>}
            </button>
          ) : (
            <span style={{ fontSize: 13, color: '#d1d5db' }}>グループ未選択</span>
          )}
          <div style={{ fontSize: 22, fontWeight: 700 }}>{month}月</div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>{year}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* カレンダー切替 */}
          <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            <Link
              href="/"
              style={{
                padding: '4px 10px', fontSize: 12, fontWeight: 600,
                background: isPrivate ? '#3b82f6' : '#fff',
                color: isPrivate ? '#fff' : '#6b7280',
              }}
            >
              P
            </Link>
            <Link
              href="/work"
              style={{
                padding: '4px 10px', fontSize: 12, fontWeight: 600,
                background: !isPrivate ? '#3b82f6' : '#fff',
                color: !isPrivate ? '#fff' : '#6b7280',
                borderLeft: '1px solid #e5e7eb',
              }}
            >
              W
            </Link>
          </div>

          <button type="button" onClick={onPrev} style={{ fontSize: 18, padding: '0 6px', color: '#374151' }}>‹</button>
          <button type="button" onClick={onNext} style={{ fontSize: 18, padding: '0 6px', color: '#374151' }}>›</button>
        </div>
      </div>

      {/* 曜日ヘッダー */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderTop: '1px solid #e5e7eb', borderLeft: '1px solid #e5e7eb' }}>
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            style={{
              textAlign: 'center', fontSize: 11, fontWeight: 600, padding: '4px 0',
              color: i === 0 ? '#ef4444' : i === 6 ? '#3b82f6' : '#6b7280',
              borderRight: '1px solid #e5e7eb',
            }}
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  );
}
