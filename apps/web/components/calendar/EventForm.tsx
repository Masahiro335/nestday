'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ColorPicker from '@/components/ui/ColorPicker';
import api from '@/lib/api';
import type { Event } from '@calendar-share/types';

interface EventFormProps {
  eventId?: string;
}

const DEFAULT_COLOR = '#3b82f6';

export default function EventForm({ eventId }: EventFormProps) {
  const router = useRouter();
  const isEdit = !!eventId;

  const [title, setTitle] = useState('');
  const [startAt, setStartAt] = useState(() => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    return now.toISOString().slice(0, 16);
  });
  const [endAt, setEndAt] = useState(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    return now.toISOString().slice(0, 16);
  });
  const [isAllDay, setIsAllDay] = useState(false);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [location, setLocation] = useState('');
  const [memo, setMemo] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(isEdit);

  useEffect(() => {
    if (!eventId) return;
    api
      .get<Event>(`/events/${eventId}`)
      .then(({ data }) => {
        setTitle(data.title);
        setStartAt(data.start_at.slice(0, 16));
        setEndAt(data.end_at.slice(0, 16));
        setIsAllDay(data.is_all_day);
        setColor(data.color ?? DEFAULT_COLOR);
        setLocation(data.location ?? '');
        setMemo(data.memo ?? '');
        if (data.location || data.memo) setShowDetail(true);
      })
      .catch(() => router.replace('/'))
      .finally(() => setInitializing(false));
  }, [eventId, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const payload = {
      title,
      start_at: isAllDay ? startAt.slice(0, 10) + 'T00:00:00Z' : new Date(startAt).toISOString(),
      end_at: isAllDay ? endAt.slice(0, 10) + 'T23:59:59Z' : new Date(endAt).toISOString(),
      is_all_day: isAllDay,
      color,
      location: location || undefined,
      memo: memo || undefined,
    };
    try {
      if (isEdit) {
        await api.patch(`/events/${eventId}`, payload);
      } else {
        await api.post('/events', payload);
      }
      router.push('/');
    } catch {
      setError('保存に失敗しました。もう一度お試しください');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('このイベントを削除しますか？')) return;
    setLoading(true);
    try {
      await api.delete(`/events/${eventId}`);
      router.push('/');
    } catch {
      setError('削除に失敗しました');
      setLoading(false);
    }
  }

  if (initializing) {
    return <div style={{ padding: 24, color: '#6b7280' }}>読み込み中...</div>;
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', background: '#fff', minHeight: '100vh' }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
        <button onClick={() => router.back()} style={{ fontSize: 22, color: '#6b7280' }}>✕</button>
        <span style={{ fontWeight: 700, fontSize: 16 }}>{isEdit ? '予定編集' : '予定作成'}</span>
        <button
          onClick={handleSubmit as unknown as React.MouseEventHandler}
          disabled={loading || !title}
          style={{ color: loading || !title ? '#9ca3af' : '#3b82f6', fontWeight: 700, fontSize: 16 }}
        >
          保存
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '0 16px' }}>
        {/* タイトル */}
        <input
          type="text"
          placeholder="予定名"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: '100%', fontSize: 22, fontWeight: 600, padding: '16px 0', border: 'none', borderBottom: '1px solid #e5e7eb', outline: 'none' }}
        />

        {/* 日時 */}
        <div style={{ padding: '16px 0', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <input
              type={isAllDay ? 'date' : 'datetime-local'}
              value={isAllDay ? startAt.slice(0, 10) : startAt}
              onChange={(e) => setStartAt(e.target.value)}
              style={inputStyle}
            />
            <span style={{ color: '#6b7280' }}>→</span>
            <input
              type={isAllDay ? 'date' : 'datetime-local'}
              value={isAllDay ? endAt.slice(0, 10) : endAt}
              onChange={(e) => setEndAt(e.target.value)}
              style={inputStyle}
            />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#6b7280' }}>
            <input type="checkbox" checked={isAllDay} onChange={(e) => setIsAllDay(e.target.checked)} />
            終日
          </label>
        </div>

        {/* カラー */}
        <div style={{ padding: '16px 0', borderBottom: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>カラー</p>
          <ColorPicker value={color} onChange={setColor} />
        </div>

        {/* 詳細 */}
        <div style={{ padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
          <button
            type="button"
            onClick={() => setShowDetail((v) => !v)}
            style={{ color: '#3b82f6', fontSize: 14 }}
          >
            {showDetail ? '詳細を閉じる' : '詳細を表示'}
          </button>
          {showDetail && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="text"
                placeholder="📍 場所（最大200文字）"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={200}
                style={inputStyle}
              />
              <textarea
                placeholder="💬 メモ"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          )}
        </div>

        {error && <p style={{ color: '#ef4444', fontSize: 14, padding: '12px 0' }}>{error}</p>}

        {/* 削除ボタン（編集モードのみ） */}
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            style={{ width: '100%', padding: '14px', color: '#ef4444', fontSize: 16, fontWeight: 600, marginTop: 24, border: '1px solid #fca5a5', borderRadius: 8 }}
          >
            削除する
          </button>
        )}
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  fontSize: 14,
  width: '100%',
  outline: 'none',
};
