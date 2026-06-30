import useSWR from 'swr';
import api from '@/lib/api';
import type { Shift, ShiftPattern } from '@nestday/types';

function fetcher<T>(url: string) {
  return api.get<T>(url).then((res) => res.data);
}

export function useShifts(month: string, groupId?: string | null) {
  const key = groupId
    ? `/shifts?month=${month}&groupId=${groupId}`
    : `/shifts?month=${month}`;
  const { data, error, isLoading, mutate } = useSWR<Shift[]>(key, fetcher<Shift[]>);
  return { shifts: data ?? [], isLoading, error, mutate };
}

export function useShiftPatterns() {
  const { data, error, isLoading } = useSWR<ShiftPattern[]>(
    '/shift-patterns',
    fetcher<ShiftPattern[]>,
  );
  return { patterns: data ?? [], isLoading, error };
}

export async function assignShifts(date: string, shiftPatternIds: string[]) {
  await api.put(`/shifts/${date}`, { shiftPatternIds });
}

export async function removeShift(date: string) {
  await api.delete(`/shifts/${date}`);
}
