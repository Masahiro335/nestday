'use client';

import { useState, useEffect } from 'react';
import { useTodoLists } from '@/hooks/use-todo-lists';
import { createClient } from '@/lib/supabase';
import api from '@/lib/api';
import TodoListSelector from '@/components/todo/TodoListSelector';
import TodoItemList from '@/components/todo/TodoItemList';

interface ApiMember {
  id: string;
  email: string;
  name?: string;
}

export default function TodoPage() {
  const { lists, isLoading, mutate } = useTodoLists();
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [members, setMembers] = useState<ApiMember[]>([]);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await createClient().auth.getSession();
      setCurrentUserId(session?.user.id);
    }
    init();
    api.get<{ members: ApiMember[] }>('/groups/me')
      .then(({ data }) => setMembers(data.members))
      .catch(() => {});
  }, []);

  // Auto-select first list once loaded
  useEffect(() => {
    if (lists.length > 0 && !selectedListId) {
      setSelectedListId(lists[0].id);
    }
  }, [lists, selectedListId]);

  const selectedList = lists.find((l) => l.id === selectedListId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg)',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: selectedList?.color ?? 'var(--color-primary)' }}>
          {selectedList?.name ?? 'やることリスト'}
        </h1>
        <div style={{ display: 'flex', gap: 4 }}>
          {/* Placeholder icons matching the design */}
          <span style={{ fontSize: 20, padding: 4 }}>🏷️</span>
          <span style={{ fontSize: 20, padding: 4 }}>🎨</span>
          <span style={{ fontSize: 20, padding: 4 }}>☑️</span>
        </div>
      </div>

      {/* List selector tabs */}
      <TodoListSelector
        lists={lists}
        selectedListId={selectedListId}
        onSelect={setSelectedListId}
        onMutate={mutate}
        currentUserId={currentUserId}
      />

      {/* Main content */}
      {isLoading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
          読み込み中...
        </div>
      ) : lists.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
          <div style={{ fontSize: 48 }}>📋</div>
          <p style={{ margin: 0, color: '#6b7280', textAlign: 'center', fontSize: 14 }}>
            まだリストがありません。<br />「+ リスト追加」からはじめましょう。
          </p>
        </div>
      ) : selectedList ? (
        <TodoItemList
          list={selectedList}
          currentUserId={currentUserId}
          members={members}
        />
      ) : null}
    </div>
  );
}
