import useSWR from 'swr';
import api from '@/lib/api';
import type { Event } from '@calendar-share/types';

function fetcher(url: string) {
  return api.get<Event[]>(url).then((res) => res.data);
}

export function useEvents(month: string) {
  const { data, error, isLoading, mutate } = useSWR<Event[]>(
    `/events?month=${month}`,
    fetcher,
  );
  return { events: data ?? [], isLoading, error, mutate };
}
