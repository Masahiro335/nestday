'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import WorkCalendarGrid from '@/components/work/WorkCalendarGrid';
import ShiftSelectPanel from '@/components/work/ShiftSelectPanel';
import { useShifts, useShiftPatterns } from '@/hooks/use-shifts';
import { createClient } from '@/lib/supabase';

function toMonthStr(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export default function WorkCalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  const monthStr = toMonthStr(year, month);
  const { shifts, mutate } = useShifts(monthStr);
  const { patterns } = useShiftPatterns();

  useEffect(() => {
    createClient().auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user.id);
    });
  }, []);

  function handlePrev() {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  }
  function handleNext() {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  }

  const myShiftOnDate = selectedDate
    ? shifts.find((s) => s.date === selectedDate && s.user_id === currentUserId)
    : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <CalendarHeader year={year} month={month} onPrev={handlePrev} onNext={handleNext} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '4px 12px' }}>
        <Link
          href="/work/patterns"
          style={{ fontSize: 13, color: '#6b7280', padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: 6 }}
        >
          🔧 パターン管理
        </Link>
      </div>

      <WorkCalendarGrid
        year={year}
        month={month}
        shifts={shifts}
        onSelectDate={setSelectedDate}
      />

      <ShiftSelectPanel
        isOpen={!!selectedDate}
        date={selectedDate}
        myShift={myShiftOnDate}
        patterns={patterns}
        onClose={() => setSelectedDate(null)}
        onUpdated={() => mutate()}
      />
    </div>
  );
}
