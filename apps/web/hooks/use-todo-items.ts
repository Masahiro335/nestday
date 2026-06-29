import useSWR from 'swr';
import api from '@/lib/api';

export interface ApiTodoUser {
  id: string;
  name?: string;
  email: string;
}

export interface ApiTodoItem {
  id: string;
  listId: string;
  groupId: string;
  title: string;
  memo?: string;
  dueDate?: string;
  createdBy: string;
  creator: ApiTodoUser;
  assignedTo?: string;
  assignee?: ApiTodoUser;
  isCompleted: boolean;
  completedAt?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

function fetcher(url: string) {
  return api.get<ApiTodoItem[]>(url).then((r) => r.data);
}

export function useTodoItems(listId: string | null) {
  const key = listId ? `/todo-items?listId=${listId}` : null;
  const { data, error, isLoading, mutate } = useSWR<ApiTodoItem[]>(key, fetcher);
  return { items: data ?? [], isLoading, error, mutate };
}

export async function createTodoItem(data: {
  listId: string;
  title: string;
  memo?: string;
  dueDate?: string;
  assignedTo?: string;
}) {
  const res = await api.post<ApiTodoItem>('/todo-items', data);
  return res.data;
}

export async function updateTodoItem(
  id: string,
  data: {
    title?: string;
    memo?: string;
    dueDate?: string | null;
    assignedTo?: string | null;
    isCompleted?: boolean;
  },
) {
  const res = await api.patch<ApiTodoItem>(`/todo-items/${id}`, data);
  return res.data;
}

export async function deleteTodoItem(id: string) {
  await api.delete(`/todo-items/${id}`);
}
