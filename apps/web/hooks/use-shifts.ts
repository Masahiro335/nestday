import useSWR from 'swr';
import api from '@/lib/api';
import type { Shift, ShiftPattern } from '@calendar-share/types';

function fetcher<T>(url: string) {
  return api.get<T>(url).then((res) => res.data);
}

export function useShifts(month: string) {
  const { data, error, isLoading, mutate } = useSWR<Shift[]>(
    `/shifts?month=${month}`,
    fetcher<Shift[]>,
  );
  return { shifts: data ?? [], isLoading, error, mutate };
}

export function useShiftPatterns() {
  const { data, error, isLoading } = useSWR<ShiftPattern[]>(
    '/shift-patterns',
    fetcher<ShiftPattern[]>,
  );
  return { patterns: data ?? [], isLoading, error };
}

export async function assignShift(date: string, shiftPatternId: string) {
  await api.put(`/shifts/${date}`, { shift_pattern_id: shiftPatternId });
}

export async function removeShift(date: string) {
  await api.delete(`/shifts/${date}`);
}
