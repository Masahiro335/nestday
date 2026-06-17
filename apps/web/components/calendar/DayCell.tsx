import type { ApiEvent } from '@/hooks/use-events';
import EventBadge from './EventBadge';

interface DayCellProps {
  date: Date;
  events: ApiEvent[];
  isToday: boolean;
  isCurrentMonth: boolean;
  onClick: () => void;
}

export default function DayCell({ date, events, isToday, isCurrentMonth, onClick }: DayCellProps) {
  const day = date.getDate();
  const dow = date.getDay();

  return (
    <div
      onClick={onClick}
      style={{
        minHeight: 64,
        padding: '2px 3px',
        borderRight: '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb',
        cursor: 'pointer',
        opacity: isCurrentMonth ? 1 : 0.35,
        background: 'transparent',
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 22,
          height: 22,
          borderRadius: '50%',
          fontSize: 12,
          fontWeight: isToday ? 700 : 400,
          background: isToday ? '#3b82f6' : 'transparent',
          color: isToday ? '#fff' : dow === 0 ? '#ef4444' : dow === 6 ? '#3b82f6' : '#1a1a1a',
          marginBottom: 2,
        }}
      >
        {day}
      </span>
      <div style={{ overflow: 'hidden' }}>
        {events.slice(0, 3).map((ev) => (
          <EventBadge key={ev.id} event={ev} />
        ))}
        {events.length > 3 && (
          <div style={{ fontSize: 9, color: '#6b7280' }}>+{events.length - 3}</div>
        )}
      </div>
    </div>
  );
}
