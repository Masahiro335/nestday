'use client';

import useSWR from 'swr';
import api from '@/lib/api';
import ShiftPatternList, { type ApiShiftPattern } from '@/components/work/ShiftPatternList';

function fetcher(url: string) {
  return api.get<ApiShiftPattern[]>(url).then((r) => r.data);
}

export default function ShiftPatternListPage() {
  const { data: patterns, isLoading, mutate } = useSWR<ApiShiftPattern[]>(
    '/shift-patterns',
    fetcher,
  );

  if (isLoading) return <div style={{ padding: 24, color: '#6b7280' }}>読み込み中...</div>;

  return <ShiftPatternList patterns={patterns ?? []} onReordered={() => mutate()} />;
}
