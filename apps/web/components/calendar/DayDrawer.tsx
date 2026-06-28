'use client';

import { useRouter } from 'next/navigation';
import type { ApiEvent } from '@/hooks/use-events';

interface DayDrawerProps {
  isOpen: boolean;
  date: string | null;
  events: ApiEvent[];
  onClose: () => void;
  currentUserId?: string;
  membersMap?: Record<string, string>;
}

function toHHMM(isoStr: string): string {
  const d = new Date(isoStr);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatTime(ev: ApiEvent): string {
  if (ev.isAllDay) return '終日';
  return `${toHHMM(ev.startAt)}〜${toHHMM(ev.endAt)}`;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const DOW = ['日', '月', '火', '水', '木', '金', '土'];
  return `${d.getMonth() + 1}月${d.getDate()}日（${DOW[d.getDay()]}）`;
}

function CreatorBadge({ name, isMe }: { name: string; isMe: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        fontSize: 11,
        color: isMe ? '#3b82f6' : '#6b7280',
        background: isMe ? '#eff6ff' : '#f3f4f6',
        padding: '1px 6px',
        borderRadius: 10,
        marginTop: 3,
        fontWeight: 500,
      }}
    >
      👤 {isMe ? `${name}（自分）` : name}
    </span>
  );
}

export default function DayDrawer({
  isOpen,
  date,
  events,
  onClose,
  currentUserId,
  membersMap = {},
}: DayDrawerProps) {
  const router = useRouter();

  if (!isOpen || !date) return null;

  function handleEventClick(ev: ApiEvent) {
    onClose();
    router.push(`/events/${ev.id}/edit`);
  }

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
          <button type="button" onClick={onClose} style={{ fontSize: 20, color: '#6b7280' }}>✕</button>
        </div>

        <div style={{ overflowY: 'auto', padding: '0 16px 16px' }}>
          {events.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
              予定なし
            </p>
          ) : (
            events.map((ev) => {
              const isOwner = !!currentUserId && ev.createdBy === currentUserId;
              const creatorName = membersMap[ev.createdBy];

              return (
                <div
                  key={ev.id}
                  onClick={() => handleEventClick(ev)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '12px 0',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ color: '#6b7280', fontSize: 13, minWidth: 100, paddingTop: 2 }}>
                    {formatTime(ev)}
                  </span>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: ev.color ?? '#3b82f6',
                      flexShrink: 0,
                      marginTop: 4,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
                      {ev.isSecret && <span style={{ fontSize: 13 }}>🔒</span>}
                      {ev.title}
                    </div>
                    {/* 作成者バッジ */}
                    {creatorName && (
                      <CreatorBadge name={creatorName} isMe={isOwner} />
                    )}
                    {ev.location && (
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        📍 {ev.location}
                      </div>
                    )}
                    {ev.memo && (
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        💬 {ev.memo}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: isOwner ? '#3b82f6' : '#d1d5db', paddingTop: 2, flexShrink: 0 }}>
                    {isOwner ? '編集 ›' : '›'}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
