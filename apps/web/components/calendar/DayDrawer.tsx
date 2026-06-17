'use client';

import Link from 'next/link';
import type { Event } from '@calendar-share/types';

interface DayDrawerProps {
  isOpen: boolean;
  date: string | null;
  events: Event[];
  onClose: () => void;
  currentUserId?: string;
}

function formatTime(ev: Event): string {
  if (ev.is_all_day) return '終日';
  return ev.start_at.slice(11, 16);
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const DOW = ['日', '月', '火', '水', '木', '金', '土'];
  return `${d.getMonth() + 1}月${d.getDate()}日（${DOW[d.getDay()]}）`;
}

export default function DayDrawer({ isOpen, date, events, onClose, currentUserId }: DayDrawerProps) {
  if (!isOpen || !date) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          zIndex: 40,
        }}
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
          maxHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.12)',
        }}
      >
        <div
          style={{
            width: 40,
            height: 4,
            background: '#d1d5db',
            borderRadius: 2,
            margin: '12px auto 0',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>{formatDateLabel(date)}</span>
          <button onClick={onClose} style={{ fontSize: 20, color: '#6b7280' }}>✕</button>
        </div>

        <div style={{ overflowY: 'auto', padding: '0 16px 16px' }}>
          {events.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
              予定なし
            </p>
          ) : (
            events.map((ev) => (
              <div
                key={ev.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 0',
                  borderBottom: '1px solid #f3f4f6',
                }}
              >
                <span style={{ color: '#6b7280', fontSize: 13, minWidth: 36 }}>
                  {formatTime(ev)}
                </span>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: ev.color ?? '#3b82f6',
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1, fontSize: 15 }}>{ev.title}</span>
                {currentUserId && ev.created_by === currentUserId && (
                  <Link
                    href={`/events/${ev.id}/edit`}
                    style={{ fontSize: 12, color: '#3b82f6' }}
                  >
                    編集
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
