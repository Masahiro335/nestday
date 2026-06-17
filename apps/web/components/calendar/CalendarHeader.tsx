'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

interface CalendarHeaderProps {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function CalendarHeader({ year, month, onPrev, onNext }: CalendarHeaderProps) {
  const pathname = usePathname();
  const isPrivate = pathname === '/';

  return (
    <div style={{ padding: '12px 8px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{year}</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{month}月</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            <Link
              href="/"
              style={{
                padding: '4px 10px',
                fontSize: 12,
                fontWeight: 600,
                background: isPrivate ? '#3b82f6' : '#fff',
                color: isPrivate ? '#fff' : '#6b7280',
              }}
            >
              P
            </Link>
            <Link
              href="/work"
              style={{
                padding: '4px 10px',
                fontSize: 12,
                fontWeight: 600,
                background: !isPrivate ? '#3b82f6' : '#fff',
                color: !isPrivate ? '#fff' : '#6b7280',
                borderLeft: '1px solid #e5e7eb',
              }}
            >
              W
            </Link>
          </div>

          <button onClick={onPrev} style={{ fontSize: 18, padding: '0 6px', color: '#374151' }}>
            ‹
          </button>
          <button onClick={onNext} style={{ fontSize: 18, padding: '0 6px', color: '#374151' }}>
            ›
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderTop: '1px solid #e5e7eb', borderLeft: '1px solid #e5e7eb' }}>
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            style={{
              textAlign: 'center',
              fontSize: 11,
              fontWeight: 600,
              padding: '4px 0',
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
