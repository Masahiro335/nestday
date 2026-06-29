'use client';

import { useState } from 'react';
import { useTodoItems, createTodoItem } from '@/hooks/use-todo-items';
import { ApiTodoList } from '@/hooks/use-todo-lists';
import TodoItemRow from './TodoItemRow';

interface Member {
  id: string;
  name?: string;
  email: string;
}

interface Props {
  list: ApiTodoList;
  currentUserId?: string;
  members: Member[];
}

export default function TodoItemList({ list, currentUserId, members }: Props) {
  const { items, mutate } = useTodoItems(list.id);
  const [inputTitle, setInputTitle] = useState('');
  const [showDueDate, setShowDueDate] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const activeItems = items.filter((i) => !i.isCompleted);
  const completedItems = items.filter((i) => i.isCompleted);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inputTitle.trim()) return;
    setSubmitting(true);
    try {
      await createTodoItem({
        listId: list.id,
        title: inputTitle.trim(),
        dueDate: dueDate || undefined,
        assignedTo: assignedTo || undefined,
      });
      setInputTitle('');
      setDueDate('');
      setAssignedTo('');
      setShowDueDate(false);
      mutate();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Item list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeItems.length === 0 && completedItems.length === 0 && (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
            TODOがありません。下のフォームから追加してください。
          </div>
        )}

        {activeItems.map((item) => (
          <TodoItemRow
            key={item.id}
            item={item}
            listColor={list.color}
            currentUserId={currentUserId}
            members={members}
            onMutate={mutate}
          />
        ))}

        {completedItems.length > 0 && (
          <div>
            <button
              onClick={() => setShowCompleted((v) => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                width: '100%',
                padding: '10px 16px',
                background: '#f9fafb',
                border: 'none',
                borderBottom: '1px solid #f3f4f6',
                fontSize: 13,
                color: '#6b7280',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              <span style={{ fontSize: 10 }}>{showCompleted ? '▼' : '▶'}</span>
              完了済み ({completedItems.length})
            </button>
            {showCompleted &&
              completedItems.map((item) => (
                <TodoItemRow
                  key={item.id}
                  item={item}
                  listColor={list.color}
                  currentUserId={currentUserId}
                  members={members}
                  onMutate={mutate}
                />
              ))}
          </div>
        )}
      </div>

      {/* Quick add form */}
      <div
        style={{
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-bg)',
          padding: '8px 12px',
        }}
      >
        {showDueDate && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 2 }}>期限日</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 2 }}>担当者</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', background: '#fff' }}
              >
                <option value="">担当者なし</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name ?? m.email.split('@')[0]}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setShowDueDate((v) => !v)}
            title="期限日・担当者を設定"
            style={{
              flexShrink: 0,
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: `2px solid ${showDueDate ? list.color : '#d1d5db'}`,
              background: showDueDate ? `${list.color}20` : '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 16,
              padding: 0,
            }}
          >
            📅
          </button>
          <input
            value={inputTitle}
            onChange={(e) => setInputTitle(e.target.value)}
            placeholder="新しい項目"
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 24,
              border: '1px solid #d1d5db',
              fontSize: 15,
              outline: 'none',
              background: '#f9fafb',
            }}
          />
          <button
            type="submit"
            disabled={!inputTitle.trim() || submitting}
            style={{
              flexShrink: 0,
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: 'none',
              background: inputTitle.trim() ? list.color : '#d1d5db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputTitle.trim() ? 'pointer' : 'default',
              padding: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
