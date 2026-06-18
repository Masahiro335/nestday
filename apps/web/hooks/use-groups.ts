import useSWR from 'swr';
import api from '@/lib/api';

export interface ApiGroupSummary {
  id: string;
  name: string;
  inviteToken: string;
  ownerId: string;
  members: Array<{ id: string; name?: string; email: string; memo?: string | null }>;
}

function fetcher(url: string) {
  return api.get<ApiGroupSummary[]>(url).then((r) => r.data);
}

export function useGroups() {
  const { data, error, isLoading, mutate } = useSWR<ApiGroupSummary[]>(
    '/groups',
    fetcher,
  );
  return { groups: data ?? [], isLoading, error, mutate };
}

const STORAGE_KEY = 'nestday_selected_group_id';

export function getStoredGroupId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setStoredGroupId(groupId: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, groupId);
}
