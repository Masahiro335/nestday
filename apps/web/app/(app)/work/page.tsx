'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import WorkCalendarGrid from '@/components/work/WorkCalendarGrid';
import ShiftSelectPanel from '@/components/work/ShiftSelectPanel';
import GroupSheet from '@/components/ui/GroupSheet';
import MonthSlider from '@/components/ui/MonthSlider';
import { useShifts, useShiftPatterns } from '@/hooks/use-shifts';
import { useGroups, getStoredGroupId, setStoredGroupId } from '@/hooks/use-groups';
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
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showGroupSheet, setShowGroupSheet] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');

  const { groups } = useGroups();
  const monthStr = toMonthStr(year, month);
  const { shifts, mutate } = useShifts(monthStr, selectedGroupId);
  const { patterns } = useShiftPatterns();

  useEffect(() => {
    createClient().auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user.id);
    });
    const stored = getStoredGroupId();
    if (stored) setSelectedGroupId(stored);
  }, []);

  useEffect(() => {
    if (groups.length === 0) return;
    const stored = getStoredGroupId();
    const valid = stored && groups.some((g) => g.id === stored);
    if (!valid) {
      setSelectedGroupId(groups[0].id);
      setStoredGroupId(groups[0].id);
    }
  }, [groups]);

  function handleSelectGroup(groupId: string) {
    setSelectedGroupId(groupId);
    setStoredGroupId(groupId);
    setSelectedMemberId('');
  }

  function handlePrev() {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  }
  function handleNext() {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  }

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);
  const members = selectedGroup?.members ?? [];

  const filteredShifts = selectedMemberId
    ? shifts.filter((s) => s.userId === selectedMemberId)
    : shifts;

  const myShiftOnDate = selectedDate
    ? shifts.find((s) => s.date === selectedDate && s.userId === currentUserId)
    : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <CalendarHeader
        year={year}
        month={month}
        onPrev={handlePrev}
        onNext={handleNext}
        groupName={selectedGroup?.name}
        hasMultipleGroups={groups.length > 1}
        onGroupTap={() => setShowGroupSheet(true)}
        members={members}
        currentUserId={currentUserId}
        selectedMemberId={selectedMemberId}
        onMemberChange={setSelectedMemberId}
      />

      <MonthSlider year={year} month={month} onPrev={handlePrev} onNext={handleNext}>
        {(y, m, isCurrent) => (
          <WorkCalendarGrid
            year={y}
            month={m}
            shifts={isCurrent ? filteredShifts : []}
            onSelectDate={isCurrent ? setSelectedDate : () => {}}
          />
        )}
      </MonthSlider>

      <ShiftSelectPanel
        isOpen={!!selectedDate}
        date={selectedDate}
        myShift={myShiftOnDate}
        patterns={patterns}
        onClose={() => setSelectedDate(null)}
        onUpdated={() => mutate()}
      />

      <GroupSheet
        isOpen={showGroupSheet}
        groups={groups}
        selectedGroupId={selectedGroupId}
        onSelect={handleSelectGroup}
        onClose={() => setShowGroupSheet(false)}
      />

      {/* パターン管理ボタン（フッター上・右端） */}
      <Link
        href="/work/patterns"
        style={{
          position: 'fixed',
          bottom: 'calc(var(--bottom-nav-height) + 12px)',
          right: 16,
          fontSize: 13,
          color: '#6b7280',
          padding: '6px 10px',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          zIndex: 20,
        }}
      >
        🔧 パターン管理
      </Link>
    </div>
  );
}
