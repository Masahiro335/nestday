import type { Shift } from '@nestday/types';

interface ShiftCellProps {
  date: Date;
  shifts: Shift[];
  isCurrentMonth: boolean;
  isToday: boolean;
  onClick: () => void;
}

export default function ShiftCell({ date, shifts, isCurrentMonth, isToday, onClick }: ShiftCellProps) {
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {shifts.slice(0, 3).map((shift) => (
          <div
            key={shift.id}
            style={{
              background: shift.shiftPattern?.color ?? '#6b7280',
              color: '#fff',
              fontSize: 9,
              padding: '1px 3px',
              borderRadius: 3,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {shift.shiftPattern?.name ?? ''}
          </div>
        ))}
        {shifts.length > 3 && (
          <div style={{ fontSize: 9, color: '#6b7280' }}>+{shifts.length - 3}</div>
        )}
      </div>
    </div>
  );
}
