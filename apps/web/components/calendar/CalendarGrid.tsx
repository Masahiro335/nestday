'use client';

import type { Event } from '@calendar-share/types';
import DayCell from './DayCell';

interface CalendarGridProps {
  year: number;
  month: number;
  events: Event[];
  onSelectDate: (date: string) => void;
}

function getDaysInGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month - 1, 1);
  const startOffset = firstDay.getDay();
  const start = new Date(firstDay);
  start.setDate(1 - startOffset);

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function CalendarGrid({ year, month, events, onSelectDate }: CalendarGridProps) {
  const today = toDateStr(new Date());
  const days = getDaysInGrid(year, month);

  function eventsForDay(date: Date) {
    const ds = toDateStr(date);
    return events.filter((ev) => {
      const start = ev.start_at.slice(0, 10);
      const end = ev.end_at.slice(0, 10);
      return start <= ds && ds <= end;
    });
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        borderLeft: '1px solid #e5e7eb',
        flex: 1,
      }}
    >
      {days.map((date) => (
        <DayCell
          key={toDateStr(date)}
          date={date}
          events={eventsForDay(date)}
          isToday={toDateStr(date) === today}
          isCurrentMonth={date.getMonth() + 1 === month}
          onClick={() => onSelectDate(toDateStr(date))}
        />
      ))}
    </div>
  );
}
