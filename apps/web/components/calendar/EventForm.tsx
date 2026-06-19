'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ColorPicker from '@/components/ui/ColorPicker';
import api from '@/lib/api';
import { createClient } from '@/lib/supabase';

interface ApiEvent {
  id: string;
  calendarId: string;
  createdBy: string;
  title: string;
  memo?: string;
  location?: string;
  color?: string;
  startAt: string;
  endAt: string;
  isAllDay: boolean;
}

interface ApiCalendar {
  id: string;
  name: string;
  color: string;
}

interface ApiColorLabel {
  id: string;
  name: string;
  color: string;
}

interface EventFormProps {
  eventId?: string;
  groupId?: string;
}

const DEFAULT_COLOR = '#3b82f6';

export default function EventForm({ eventId, groupId }: EventFormProps) {
  const router = useRouter();
  const isEdit = !!eventId;

  const [calendarId, setCalendarId] = useState('');
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
  const [initializing, setInitializing] = useState(true);
  const [isOwner, setIsOwner] = useState(true);
  const [colorLabels, setColorLabels] = useState<ApiColorLabel[]>([]);

  useEffect(() => {
    async function init() {
      try {
        // カレンダー一覧取得。なければ「プライベート」を自動作成
        const calendarUrl = groupId ? `/calendars?groupId=${groupId}` : '/calendars';
        const [calendarRes, colorLabelRes] = await Promise.all([
          api.get<ApiCalendar[]>(calendarUrl),
          api.get<ApiColorLabel[]>('/color-labels'),
        ]);
        let calendars = calendarRes.data;
        if (calendars.length === 0) {
          const { data: created } = await api.post<ApiCalendar>('/calendars', {
            name: 'プライベート',
            color: '#3b82f6',
            ...(groupId ? { groupId } : {}),
          });
          calendars = [created];
        }
        setCalendarId(calendars[0].id);
        setColorLabels(colorLabelRes.data);

        if (eventId) {
          const [{ data }, { data: { session } }] = await Promise.all([
            api.get<ApiEvent>(`/events/${eventId}`),
            createClient().auth.getSession(),
          ]);
          setTitle(data.title);
          setStartAt(data.startAt.slice(0, 16));
          setEndAt(data.endAt.slice(0, 16));
          setIsAllDay(data.isAllDay);
          setColor(data.color ?? DEFAULT_COLOR);
          setLocation(data.location ?? '');
          setMemo(data.memo ?? '');
          if (data.location || data.memo) setShowDetail(true);
          setCalendarId(data.calendarId);
          setIsOwner(!!session && data.createdBy === session.user.id);
        }
      } catch {
        if (eventId) router.replace('/');
      } finally {
        setInitializing(false);
      }
    }
    init();
  }, [eventId, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // 終日イベントはローカル日付の 00:00:00 / 23:59:59 をそのまま ISO 文字列化（UTC 変換しない）
    function localDateToISO(dateStr: string, time: string) {
      return `${dateStr.slice(0, 10)}T${time}`;
    }

    const payload = {
      calendarId,
      title,
      startAt: isAllDay
        ? localDateToISO(startAt, '00:00:00')
        : new Date(startAt).toISOString(),
      endAt: isAllDay
        ? localDateToISO(endAt, '23:59:59')
        : new Date(endAt).toISOString(),
      isAllDay,
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

  const readOnly = isEdit && !isOwner;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', background: '#fff', minHeight: '100vh' }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
        <button type="button" onClick={() => router.back()} style={{ fontSize: 22, color: '#6b7280' }}>✕</button>
        <span style={{ fontWeight: 700, fontSize: 16 }}>
          {readOnly ? '予定詳細' : isEdit ? '予定編集' : '予定作成'}
        </span>
        {!readOnly && (
          <button
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            disabled={loading || !title}
            style={{ color: loading || !title ? '#9ca3af' : '#3b82f6', fontWeight: 700, fontSize: 16 }}
          >
            保存
          </button>
        )}
        {readOnly && (
          <span style={{ fontSize: 13, color: '#9ca3af' }}>閲覧のみ</span>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '0 16px' }}>
        {/* タイトル */}
        <input
          type="text"
          placeholder="予定名"
          value={title}
          onChange={(e) => !readOnly && setTitle(e.target.value)}
          readOnly={readOnly}
          required={!readOnly}
          style={{
            width: '100%',
            fontSize: 22,
            fontWeight: 600,
            padding: '16px 0',
            border: 'none',
            borderBottom: '1px solid #e5e7eb',
            outline: 'none',
            background: 'transparent',
            color: readOnly ? '#374151' : '#1a1a1a',
          }}
        />

        {/* 日時 */}
        <div style={{ padding: '16px 0', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <input
              type={isAllDay ? 'date' : 'datetime-local'}
              value={isAllDay ? startAt.slice(0, 10) : startAt}
              onChange={(e) => !readOnly && setStartAt(e.target.value)}
              readOnly={readOnly}
              style={inputStyle}
            />
            <span style={{ color: '#6b7280' }}>→</span>
            <input
              type={isAllDay ? 'date' : 'datetime-local'}
              value={isAllDay ? endAt.slice(0, 10) : endAt}
              onChange={(e) => !readOnly && setEndAt(e.target.value)}
              readOnly={readOnly}
              style={inputStyle}
            />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#6b7280' }}>
            <input
              type="checkbox"
              checked={isAllDay}
              onChange={(e) => !readOnly && setIsAllDay(e.target.checked)}
              disabled={readOnly}
            />
            終日
          </label>
        </div>

        {/* カラー */}
        <div style={{ padding: '16px 0', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <p style={{ fontSize: 13, color: '#6b7280' }}>カラー</p>
            {!readOnly && (
              <Link href="/color-labels" style={{ fontSize: 12, color: '#3b82f6', padding: '2px 8px', border: '1px solid #bfdbfe', borderRadius: 6 }}>
                カラー編集
              </Link>
            )}
          </div>
          {readOnly ? (
            <span style={{ display: 'inline-block', width: 24, height: 24, borderRadius: '50%', background: color }} />
          ) : (
            <>
              <ColorPicker value={color} onChange={setColor} />
              {colorLabels.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>マイカラー</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {colorLabels.map((label) => (
                      <button
                        key={label.id}
                        type="button"
                        onClick={() => setColor(label.color)}
                        title={label.name}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 3,
                          background: 'none',
                          padding: 0,
                          cursor: 'pointer',
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-block',
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: label.color,
                            border: color === label.color ? '3px solid #1a1a1a' : '2px solid transparent',
                            outline: color === label.color ? '2px solid #fff' : 'none',
                            outlineOffset: -4,
                          }}
                        />
                        <span style={{ fontSize: 10, color: '#6b7280', maxWidth: 40, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {label.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 詳細 */}
        <div style={{ padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
          {!readOnly && (
            <button
              type="button"
              onClick={() => setShowDetail((v) => !v)}
              style={{ color: '#3b82f6', fontSize: 14 }}
            >
              {showDetail ? '詳細を閉じる' : '詳細を表示'}
            </button>
          )}
          {(showDetail || readOnly) && (location || memo || !readOnly) && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(location || !readOnly) && (
                <input
                  type="text"
                  placeholder="📍 場所（最大200文字）"
                  value={location}
                  onChange={(e) => !readOnly && setLocation(e.target.value)}
                  readOnly={readOnly}
                  maxLength={200}
                  style={inputStyle}
                />
              )}
              {(memo || !readOnly) && (
                <textarea
                  placeholder="💬 メモ"
                  value={memo}
                  onChange={(e) => !readOnly && setMemo(e.target.value)}
                  readOnly={readOnly}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              )}
            </div>
          )}
        </div>

        {error && <p style={{ color: '#ef4444', fontSize: 14, padding: '12px 0' }}>{error}</p>}

        {/* 保存ボタン */}
        {!readOnly && (
          <button
            type="submit"
            disabled={loading || !title}
            style={{
              width: '100%', padding: '14px', marginTop: 24,
              background: loading || !title ? '#e5e7eb' : '#3b82f6',
              color: loading || !title ? '#9ca3af' : '#fff',
              fontSize: 16, fontWeight: 700, borderRadius: 8,
            }}
          >
            保存
          </button>
        )}

        {/* 削除ボタン（編集モード・作成者のみ） */}
        {isEdit && isOwner && (
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
  background: 'transparent',
};
