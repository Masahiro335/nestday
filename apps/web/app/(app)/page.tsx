'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import DayDrawer from '@/components/calendar/DayDrawer';
import FAB from '@/components/ui/FAB';
import { useEvents } from '@/hooks/use-events';
import { createClient } from '@/lib/supabase';

function toMonthStr(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export default function PrivateCalendarPage() {
  const router = useRouter();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  useEffect(() => {
    createClient().auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user.id);
    });
  }, []);

  const monthStr = toMonthStr(year, month);
  const { events } = useEvents(monthStr);

  function handlePrev() {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  }

  function handleNext() {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  }

  const selectedEvents = selectedDate
    ? events.filter((ev) => {
        const ds = selectedDate;
        return ev.startAt.slice(0, 10) <= ds && ds <= ev.endAt.slice(0, 10);
      })
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <CalendarHeader year={year} month={month} onPrev={handlePrev} onNext={handleNext} />
      <CalendarGrid
        year={year}
        month={month}
        events={events}
        onSelectDate={setSelectedDate}
      />
      <DayDrawer
        isOpen={!!selectedDate}
        date={selectedDate}
        events={selectedEvents}
        onClose={() => setSelectedDate(null)}
        currentUserId={currentUserId}
      />
      <FAB onClick={() => router.push('/events/new')} />
    </div>
  );
}
