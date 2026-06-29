'use client';

import { useState } from 'react';
import { ApiTodoItem, deleteTodoItem, updateTodoItem } from '@/hooks/use-todo-items';

interface Props {
  item: ApiTodoItem;
  listColor: string;
  currentUserId?: string;
  members: { id: string; name?: string; email: string }[];
  onMutate: () => void;
}

function formatDueDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function displayName(user: { name?: string; email: string }) {
  return user.name ?? user.email.split('@')[0];
}

export default function TodoItemRow({ item, listColor, currentUserId, members, onMutate }: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [memo, setMemo] = useState(item.memo ?? '');
  const [dueDate, setDueDate] = useState(item.dueDate ? item.dueDate.slice(0, 10) : '');
  const [assignedTo, setAssignedTo] = useState(item.assignedTo ?? '');
  const [saving, setSaving] = useState(false);

  const isOwner = item.createdBy === currentUserId;

  async function toggleComplete() {
    await updateTodoItem(item.id, { isCompleted: !item.isCompleted });
    onMutate();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await updateTodoItem(item.id, {
        title: title.trim(),
        memo: memo || undefined,
        dueDate: dueDate || null,
        assignedTo: assignedTo || null,
      });
      onMutate();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('このTODOを削除しますか？')) return;
    await deleteTodoItem(item.id);
    onMutate();
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          padding: '12px 16px',
          borderBottom: '1px solid #f3f4f6',
          opacity: item.isCompleted ? 0.55 : 1,
        }}
      >
        {/* Checkbox */}
        <button
          onClick={toggleComplete}
          style={{
            flexShrink: 0,
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: `2px solid ${item.isCompleted ? listColor : '#d1d5db'}`,
            background: item.isCompleted ? listColor : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            marginTop: 1,
            padding: 0,
          }}
        >
          {item.isCompleted && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: '#111827',
              textDecoration: item.isCompleted ? 'line-through' : 'none',
              wordBreak: 'break-word',
            }}
          >
            {item.title}
          </div>
          {item.memo && (
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{item.memo}</div>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
            {item.dueDate && (
              <span style={{ fontSize: 12, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 2 }}>
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#3b82f6" strokeWidth="1.5" />
                  <path d="M8 4.5V8l2.5 2" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {formatDueDate(item.dueDate)}
              </span>
            )}
            <span style={{ fontSize: 11, color: '#9ca3af' }}>
              作成: {displayName(item.creator)}
            </span>
            {item.assignee && (
              <span style={{ fontSize: 11, color: '#9ca3af' }}>
                担当: {displayName(item.assignee)}
              </span>
            )}
          </div>
        </div>

        {/* Edit/Delete actions (creator only) */}
        {isOwner && (
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <button
              onClick={() => setEditing(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#9ca3af', fontSize: 14 }}
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#9ca3af', fontSize: 14 }}
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50 }}
            onClick={() => setEditing(false)}
          />
          <div
            style={{
              position: 'fixed',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#fff',
              borderRadius: 16,
              padding: 24,
              width: 'min(90vw, 400px)',
              zIndex: 51,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>TODOを編集</h3>
            <form onSubmit={handleSave}>
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="タイトル"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15, marginBottom: 10, boxSizing: 'border-box' }}
              />
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="メモ（任意）"
                rows={2}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, marginBottom: 10, boxSizing: 'border-box', resize: 'none' }}
              />
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>期限日</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>担当者</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', background: '#fff' }}
                >
                  <option value="">担当者なし</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name ?? m.email.split('@')[0]}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => setEditing(false)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', fontSize: 14, cursor: 'pointer' }}>
                  キャンセル
                </button>
                <button type="submit" disabled={!title.trim() || saving} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: listColor, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: !title.trim() || saving ? 0.5 : 1 }}>
                  保存
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}
