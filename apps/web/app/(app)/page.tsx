'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import DayDrawer from '@/components/calendar/DayDrawer';
import FAB from '@/components/ui/FAB';
import GroupSheet from '@/components/ui/GroupSheet';
import { useEvents } from '@/hooks/use-events';
import { useGroups, getStoredGroupId, setStoredGroupId } from '@/hooks/use-groups';
import { createClient } from '@/lib/supabase';
import api from '@/lib/api';

interface ApiMember {
  id: string;
  email: string;
  name?: string;
}

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
  const [membersMap, setMembersMap] = useState<Record<string, string>>({});
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showGroupSheet, setShowGroupSheet] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');

  const { groups } = useGroups();
  const monthStr = toMonthStr(year, month);
  const { events } = useEvents(monthStr, selectedGroupId);

  // 初期化: ユーザー情報・グループ選択を復元
  useEffect(() => {
    async function init() {
      const { data: { session } } = await createClient().auth.getSession();
      setCurrentUserId(session?.user.id);
    }
    init();
    const stored = getStoredGroupId();
    if (stored) setSelectedGroupId(stored);
  }, []);

  // グループ一覧が取得されたら初期選択を設定
  useEffect(() => {
    if (groups.length === 0) return;
    const stored = getStoredGroupId();
    const valid = stored && groups.some((g) => g.id === stored);
    if (!valid) {
      setSelectedGroupId(groups[0].id);
      setStoredGroupId(groups[0].id);
    }
  }, [groups]);

  // 選択グループのメンバー一覧を取得
  useEffect(() => {
    if (!selectedGroupId) return;
    api.get<{ members: ApiMember[] }>(`/groups/me`)
      .then(({ data }) => {
        const map: Record<string, string> = {};
        data.members.forEach((m) => { map[m.id] = m.name ?? m.email.split('@')[0]; });
        setMembersMap(map);
      })
      .catch(() => {});
  }, [selectedGroupId]);

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

  const filteredEvents = selectedMemberId
    ? events.filter((ev) => ev.createdBy === selectedMemberId)
    : events;

  const selectedEvents = selectedDate
    ? filteredEvents.filter((ev) => {
        const ds = selectedDate;
        return ev.startAt.slice(0, 10) <= ds && ds <= ev.endAt.slice(0, 10);
      })
    : [];

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
      <CalendarGrid
        year={year}
        month={month}
        events={filteredEvents}
        onSelectDate={setSelectedDate}
      />
      <DayDrawer
        isOpen={!!selectedDate}
        date={selectedDate}
        events={selectedEvents}
        onClose={() => setSelectedDate(null)}
        currentUserId={currentUserId}
        membersMap={membersMap}
      />
      <GroupSheet
        isOpen={showGroupSheet}
        groups={groups}
        selectedGroupId={selectedGroupId}
        onSelect={handleSelectGroup}
        onClose={() => setShowGroupSheet(false)}
      />
      <FAB onClick={() => router.push(selectedGroupId ? `/events/new?groupId=${selectedGroupId}` : '/events/new')} />
    </div>
  );
}
