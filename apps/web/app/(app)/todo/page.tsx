'use client';

import { useState, useEffect } from 'react';
import { useTodoLists } from '@/hooks/use-todo-lists';
import { useGroups, getStoredGroupId, setStoredGroupId } from '@/hooks/use-groups';
import { createClient } from '@/lib/supabase';
import GroupSheet from '@/components/ui/GroupSheet';
import TodoListSelector from '@/components/todo/TodoListSelector';
import TodoItemList from '@/components/todo/TodoItemList';

export default function TodoPage() {
  const { groups } = useGroups();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showGroupSheet, setShowGroupSheet] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  const { lists, isLoading, mutate } = useTodoLists(selectedGroupId);

  // 初期化: ユーザー情報・選択グループを復元
  useEffect(() => {
    async function init() {
      const { data: { session } } = await createClient().auth.getSession();
      setCurrentUserId(session?.user.id);
    }
    init();
    const stored = getStoredGroupId();
    if (stored) setSelectedGroupId(stored);
  }, []);

  // グループ一覧取得後に初期選択を確定
  useEffect(() => {
    if (groups.length === 0) return;
    const stored = getStoredGroupId();
    const valid = stored && groups.some((g) => g.id === stored);
    if (!valid) {
      setSelectedGroupId(groups[0].id);
      setStoredGroupId(groups[0].id);
    }
  }, [groups]);

  // グループ変更時にリスト選択をリセット
  useEffect(() => {
    setSelectedListId(null);
  }, [selectedGroupId]);

  // リスト読み込み後に最初のリストを自動選択
  useEffect(() => {
    if (lists.length > 0 && !selectedListId) {
      setSelectedListId(lists[0].id);
    }
  }, [lists, selectedListId]);

  function handleSelectGroup(groupId: string) {
    setSelectedGroupId(groupId);
    setStoredGroupId(groupId);
  }

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);
  const selectedList = lists.find((l) => l.id === selectedListId);
  // useGroups が members を持っているのでそのまま利用
  const members = (selectedGroup?.members ?? []) as { id: string; name?: string; email: string }[];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div
        style={{
          padding: '10px 16px 8px',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg)',
        }}
      >
        {/* グループ名（複数グループ時はタップで切替） */}
        <div>
          {selectedGroup ? (
            <button
              type="button"
              onClick={groups.length > 1 ? () => setShowGroupSheet(true) : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 13,
                color: '#6b7280',
                fontWeight: 600,
                background: 'none',
                border: 'none',
                padding: '2px 0',
                cursor: groups.length > 1 ? 'pointer' : 'default',
              }}
            >
              {selectedGroup.name}
              {groups.length > 1 && <span style={{ fontSize: 10 }}>▼</span>}
            </button>
          ) : (
            <span style={{ fontSize: 13, color: '#d1d5db' }}>グループ未選択</span>
          )}
        </div>

        {/* リスト名 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              color: selectedList?.color ?? 'var(--color-primary)',
            }}
          >
            {selectedList?.name ?? 'やることリスト'}
          </h1>
        </div>
      </div>

      {/* リストタブ */}
      <TodoListSelector
        lists={lists}
        selectedListId={selectedListId}
        onSelect={setSelectedListId}
        onMutate={mutate}
        currentUserId={currentUserId}
        groupId={selectedGroupId ?? undefined}
      />

      {/* メインコンテンツ */}
      {isLoading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
          読み込み中...
        </div>
      ) : !selectedGroupId ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
          グループを選択してください
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

      {/* グループ選択シート */}
      <GroupSheet
        isOpen={showGroupSheet}
        groups={groups}
        selectedGroupId={selectedGroupId}
        onSelect={handleSelectGroup}
        onClose={() => setShowGroupSheet(false)}
      />
    </div>
  );
}
