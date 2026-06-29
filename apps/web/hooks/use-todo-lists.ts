import useSWR from 'swr';
import api from '@/lib/api';

export interface ApiTodoList {
  id: string;
  groupId: string;
  name: string;
  color: string;
  createdBy: string;
  creator: { id: string; name?: string; email: string };
  _count: { items: number };
  createdAt: string;
  updatedAt: string;
}

function fetcher(url: string) {
  return api.get<ApiTodoList[]>(url).then((r) => r.data);
}

export function useTodoLists(groupId: string | null) {
  const key = groupId ? `/todo-lists?groupId=${groupId}` : null;
  const { data, error, isLoading, mutate } = useSWR<ApiTodoList[]>(key, fetcher);
  return { lists: data ?? [], isLoading, error, mutate };
}

export async function createTodoList(name: string, color: string, groupId: string) {
  const res = await api.post<ApiTodoList>('/todo-lists', { name, color, groupId });
  return res.data;
}

export async function updateTodoList(id: string, data: { name?: string; color?: string }) {
  const res = await api.patch<ApiTodoList>(`/todo-lists/${id}`, data);
  return res.data;
}

export async function deleteTodoList(id: string) {
  await api.delete(`/todo-lists/${id}`);
}
