'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { EVENT_COLORS } from '@calendar-share/types';
import api from '@/lib/api';

interface ColorLabel {
  id: string;
  name: string;
  color: string;
  sortOrder: number;
}

const DEFAULT_ADD_COLOR = '#3b82f6';

export default function ColorLabelsPage() {
  const router = useRouter();
  const [labels, setLabels] = useState<ColorLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // デフォルトカラーの名称入力値 (hex → name)
  const [defaultNames, setDefaultNames] = useState<Record<string, string>>({});
  const [defaultSaving, setDefaultSaving] = useState<string | null>(null);

  // カスタムカラー追加フォーム
  const [addName, setAddName] = useState('');
  const [addColor, setAddColor] = useState(DEFAULT_ADD_COLOR);
  const [addSaving, setAddSaving] = useState(false);

  // カスタムカラーインライン編集
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState(DEFAULT_ADD_COLOR);
  const [editSaving, setEditSaving] = useState(false);

  const loadLabels = useCallback(async () => {
    try {
      const { data } = await api.get<ColorLabel[]>('/color-labels');
      setLabels(data);

      // デフォルトカラーの名称を初期化
      const names: Record<string, string> = {};
      EVENT_COLORS.forEach((color) => {
        const match = data.find((l) => l.color.toUpperCase() === color.toUpperCase());
        names[color] = match?.name ?? '';
      });
      setDefaultNames(names);
    } catch {
      setError('読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadLabels(); }, [loadLabels]);

  // デフォルトカラーのラベルを削除してフィールドをクリア
  async function handleDeleteDefaultLabel(id: string, color: string) {
    if (!confirm('このカラーの名称を削除しますか？')) return;
    setDefaultSaving(color);
    try {
      await api.delete(`/color-labels/${id}`);
      await loadLabels();
    } catch {
      setError('削除に失敗しました');
    } finally {
      setDefaultSaving(null);
    }
  }

  // デフォルトカラーの名称を保存（作成 / 更新 / 削除）
  async function handleSaveDefaultName(color: string) {
    const name = (defaultNames[color] ?? '').trim();
    setDefaultSaving(color);
    try {
      const existing = labels.find((l) => l.color.toUpperCase() === color.toUpperCase());
      if (existing) {
        if (!name) {
          await api.delete(`/color-labels/${existing.id}`);
        } else {
          await api.patch(`/color-labels/${existing.id}`, { name });
        }
      } else if (name) {
        await api.post('/color-labels', { name, color, sortOrder: labels.length });
      }
      await loadLabels();
    } catch {
      setError('保存に失敗しました');
    } finally {
      setDefaultSaving(null);
    }
  }

  // カスタムカラー追加
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addName.trim()) return;
    setAddSaving(true);
    try {
      await api.post('/color-labels', {
        name: addName.trim(),
        color: addColor,
        sortOrder: labels.length,
      });
      setAddName('');
      setAddColor(DEFAULT_ADD_COLOR);
      await loadLabels();
    } catch {
      setError('追加に失敗しました');
    } finally {
      setAddSaving(false);
    }
  }

  function startEdit(label: ColorLabel) {
    setEditId(label.id);
    setEditName(label.name);
    setEditColor(label.color);
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) return;
    setEditSaving(true);
    try {
      await api.patch(`/color-labels/${id}`, { name: editName.trim(), color: editColor });
      setEditId(null);
      await loadLabels();
    } catch {
      setError('更新に失敗しました');
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('このカラーを削除しますか？')) return;
    try {
      await api.delete(`/color-labels/${id}`);
      await loadLabels();
    } catch {
      setError('削除に失敗しました');
    }
  }

  // デフォルトカラーに該当しないラベルのみカスタムセクションに表示
  const defaultHexSet = new Set(EVENT_COLORS.map((c) => c.toUpperCase()));
  const customLabels = labels.filter((l) => !defaultHexSet.has(l.color.toUpperCase()));

  if (loading) return <div style={{ padding: 24, color: '#6b7280' }}>読み込み中...</div>;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', background: '#fff', minHeight: '100vh' }}>
      {/* ヘッダー */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: '1px solid #e5e7eb',
      }}>
        <button type="button" onClick={() => router.back()} style={{ color: '#3b82f6', fontSize: 15 }}>‹ 戻る</button>
        <span style={{ fontWeight: 700, fontSize: 16 }}>カラー編集</span>
        <span style={{ width: 48 }} />
      </div>

      {error && (
        <div style={{ padding: '8px 16px', background: '#fef2f2', color: '#ef4444', fontSize: 14 }}>
          {error}
          <button type="button" onClick={() => setError(null)} style={{ marginLeft: 8, color: '#6b7280' }}>✕</button>
        </div>
      )}

      {/* ─── デフォルトカラー ─── */}
      <div style={{ padding: '16px 16px 8px', borderBottom: '2px solid #e5e7eb' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>デフォルトカラー</p>
        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>
          名称を入力して保存すると、予定作成時に名前付きで表示されます
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {EVENT_COLORS.map((color) => {
            const isSaving = defaultSaving === color;
            const name = defaultNames[color] ?? '';
            const savedLabel = labels.find((l) => l.color.toUpperCase() === color.toUpperCase());
            return (
              <div key={color} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: color, flexShrink: 0,
                  border: '1px solid rgba(0,0,0,0.08)',
                }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setDefaultNames((prev) => ({ ...prev, [color]: e.target.value }))}
                  placeholder="名称を入力"
                  maxLength={30}
                  style={{ flex: 1, padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => handleSaveDefaultName(color)}
                  disabled={isSaving}
                  style={{
                    padding: '7px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, flexShrink: 0,
                    background: isSaving ? '#e5e7eb' : '#3b82f6',
                    color: isSaving ? '#9ca3af' : '#fff',
                  }}
                >
                  保存
                </button>
                {savedLabel && (
                  <button
                    type="button"
                    onClick={() => handleDeleteDefaultLabel(savedLabel.id, color)}
                    disabled={isSaving}
                    style={{
                      padding: '7px 10px', borderRadius: 8, fontSize: 13, flexShrink: 0,
                      color: '#ef4444', border: '1px solid #fca5a5',
                    }}
                  >
                    削除
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── カスタムカラー追加フォーム ─── */}
      <div style={{ padding: '16px', borderBottom: '2px solid #e5e7eb' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>カスタムカラーを追加</p>
        <form onSubmit={handleAdd}>
          <div style={{ marginBottom: 10 }}>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>カラー</p>
            <ColorSwatches value={addColor} onChange={setAddColor} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>名称</p>
            <input
              type="text"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder="例: 会議、趣味"
              maxLength={30}
              style={inputStyle}
            />
          </div>
          <button
            type="submit"
            disabled={!addName.trim() || addSaving}
            style={{
              width: '100%', padding: '10px', borderRadius: 8, fontWeight: 600, fontSize: 14,
              background: !addName.trim() || addSaving ? '#e5e7eb' : '#3b82f6',
              color: !addName.trim() || addSaving ? '#9ca3af' : '#fff',
            }}
          >
            追加
          </button>
        </form>
      </div>

      {/* ─── カスタムカラー一覧 ─── */}
      {customLabels.length > 0 && (
        <div>
          <p style={{ fontSize: 12, color: '#6b7280', padding: '10px 16px 4px', fontWeight: 600 }}>
            カスタムカラー一覧
          </p>
          {customLabels.map((label) => (
            <div key={label.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
              {editId === label.id ? (
                <div style={{ padding: '14px 16px', background: '#f9fafb' }}>
                  <div style={{ marginBottom: 8 }}>
                    <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>カラー</p>
                    <ColorSwatches value={editColor} onChange={setEditColor} />
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>名称</p>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      maxLength={30}
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setEditId(null)}
                      style={{ flex: 1, padding: '9px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, color: '#6b7280' }}
                    >
                      キャンセル
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdate(label.id)}
                      disabled={!editName.trim() || editSaving}
                      style={{
                        flex: 1, padding: '9px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                        background: !editName.trim() || editSaving ? '#e5e7eb' : '#3b82f6',
                        color: !editName.trim() || editSaving ? '#9ca3af' : '#fff',
                      }}
                    >
                      保存
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(label.id)}
                    disabled={editSaving}
                    style={{
                      width: '100%', marginTop: 8, padding: '9px', borderRadius: 8,
                      fontSize: 14, color: '#ef4444', border: '1px solid #fca5a5',
                    }}
                  >
                    削除する
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: label.color, flexShrink: 0, border: '1px solid rgba(0,0,0,0.08)' }} />
                  <span style={{ flex: 1, fontSize: 15, color: '#1a1a1a' }}>{label.name}</span>
                  <button
                    type="button"
                    onClick={() => startEdit(label)}
                    style={{ fontSize: 13, color: '#3b82f6', padding: '4px 10px', border: '1px solid #bfdbfe', borderRadius: 6 }}
                  >
                    編集
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(label.id)}
                    style={{ fontSize: 13, color: '#ef4444', padding: '4px 10px', border: '1px solid #fca5a5', borderRadius: 6 }}
                  >
                    削除
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const CUSTOM_PALETTE = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
  '#6b7280', '#1a1a1a',
] as const;

function ColorSwatches({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {CUSTOM_PALETTE.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          aria-label={color}
          style={{
            width: 28, height: 28, borderRadius: '50%', background: color, flexShrink: 0,
            border: value === color ? '3px solid #1a1a1a' : '2px solid transparent',
            outline: value === color ? '2px solid #fff' : 'none',
            outlineOffset: -4,
          }}
        />
      ))}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  fontSize: 15,
  outline: 'none',
  background: '#fff',
};
