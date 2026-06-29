'use client';

import { useState } from 'react';
import { ApiTodoList, createTodoList, deleteTodoList } from '@/hooks/use-todo-lists';

interface Props {
  lists: ApiTodoList[];
  selectedListId: string | null;
  onSelect: (id: string) => void;
  onMutate: () => void;
  currentUserId?: string;
}

const LIST_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
];

export default function TodoListSelector({ lists, selectedListId, onSelect, onMutate, currentUserId }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(LIST_COLORS[0]);
  const [saving, setSaving] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const list = await createTodoList(name.trim(), color);
      onMutate();
      onSelect(list.id);
      setName('');
      setColor(LIST_COLORS[0]);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('このリストを削除しますか？\n含まれるTODOもすべて削除されます。')) return;
    await deleteTodoList(id);
    onMutate();
    if (selectedListId === id) onSelect(lists.find((l) => l.id !== id)?.id ?? '');
  }

  return (
    <div style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg)' }}>
      <div style={{ display: 'flex', overflowX: 'auto', padding: '8px 12px', gap: 8, alignItems: 'center' }}>
        {lists.map((list) => {
          const active = list.id === selectedListId;
          return (
            <div key={list.id} style={{ position: 'relative', flexShrink: 0 }}>
              <button
                onClick={() => onSelect(list.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 20,
                  border: `2px solid ${active ? list.color : 'transparent'}`,
                  background: active ? `${list.color}20` : '#f3f4f6',
                  color: active ? list.color : '#6b7280',
                  fontWeight: active ? 700 : 500,
                  fontSize: 13,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: list.color, display: 'inline-block' }} />
                {list.name}
                {list.createdBy === currentUserId && (
                  <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); handleDelete(list.id); }}
                    style={{ marginLeft: 2, fontSize: 11, color: '#9ca3af', cursor: 'pointer', lineHeight: 1 }}
                  >
                    ×
                  </span>
                )}
              </button>
            </div>
          );
        })}

        <button
          onClick={() => setShowForm(true)}
          style={{
            flexShrink: 0,
            padding: '6px 14px',
            borderRadius: 20,
            border: '2px dashed #d1d5db',
            background: 'transparent',
            color: '#9ca3af',
            fontSize: 13,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          + リスト追加
        </button>
      </div>

      {showForm && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50 }}
            onClick={() => setShowForm(false)}
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
              width: 'min(90vw, 360px)',
              zIndex: 51,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>新しいリスト</h3>
            <form onSubmit={handleCreate}>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="リスト名"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 15,
                  marginBottom: 12,
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {LIST_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: c,
                      border: color === c ? '3px solid #374151' : '3px solid transparent',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #d1d5db',
                    background: '#fff', fontSize: 14, cursor: 'pointer',
                  }}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={!name.trim() || saving}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 8, border: 'none',
                    background: color, color: '#fff', fontWeight: 700, fontSize: 14,
                    cursor: 'pointer', opacity: !name.trim() || saving ? 0.5 : 1,
                  }}
                >
                  作成
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
