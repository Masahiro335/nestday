'use client';

import type { Shift } from '@nestday/types';
import ShiftCell from './ShiftCell';

interface WorkCalendarGridProps {
  year: number;
  month: number;
  shifts: Shift[];
  onSelectDate: (date: string) => void;
}

function getDaysInGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month - 1, 1);
  const startOffset = firstDay.getDay();
  const start = new Date(firstDay);
  start.setDate(1 - startOffset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function WorkCalendarGrid({ year, month, shifts, onSelectDate }: WorkCalendarGridProps) {
  const today = toDateStr(new Date());
  const days = getDaysInGrid(year, month);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderLeft: '1px solid #e5e7eb', flex: 1 }}>
      {days.map((date) => {
        const ds = toDateStr(date);
        const dayShifts = shifts.filter((s) => s.date === ds);
        return (
          <ShiftCell
            key={ds}
            date={date}
            shifts={dayShifts}
            isToday={ds === today}
            isCurrentMonth={date.getMonth() + 1 === month}
            onClick={() => onSelectDate(ds)}
          />
        );
      })}
    </div>
  );
}
