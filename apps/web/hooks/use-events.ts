import useSWR from 'swr';
import api from '@/lib/api';

// API レスポンスは camelCase（Prisma デフォルト）
export interface ApiEvent {
  id: string;
  groupId: string;
  calendarId: string;
  createdBy: string;
  title: string;
  memo?: string;
  location?: string;
  color?: string;
  startAt: string;
  endAt: string;
  isAllDay: boolean;
  isSecret: boolean;
  createdAt: string;
  updatedAt: string;
}

function fetcher(url: string) {
  return api.get<ApiEvent[]>(url).then((res) => res.data);
}

export function useEvents(month: string, groupId?: string | null) {
  const key = groupId
    ? `/events?month=${month}&groupId=${groupId}`
    : `/events?month=${month}`;
  const { data, error, isLoading, mutate } = useSWR<ApiEvent[]>(key, fetcher);
  return { events: data ?? [], isLoading, error, mutate };
}
