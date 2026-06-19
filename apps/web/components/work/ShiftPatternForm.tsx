'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ColorPicker from '@/components/ui/ColorPicker';
import api from '@/lib/api';

interface ApiShiftPatternResponse {
  id: string;
  name: string;
  color: string;
  startTime: string | null;
  endTime: string | null;
  breakMinutes: number;
  isDayOff: boolean;
  sortOrder: number;
}

const SHIFT_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
  '#6b7280', '#1a1a1a',
] as const;

interface ShiftPatternFormProps {
  patternId?: string;
}

function calcWorkingTime(startTime: string, endTime: string, breakMinutes: number): string {
  if (!startTime || !endTime) return '-';
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const totalMinutes = (eh * 60 + em) - (sh * 60 + sm) - breakMinutes;
  if (totalMinutes <= 0) return '-';
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}時間${m > 0 ? m + '分' : ''}`;
}

export default function ShiftPatternForm({ patternId }: ShiftPatternFormProps) {
  const router = useRouter();
  const isEdit = !!patternId;

  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(SHIFT_COLORS[5]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [breakMinutes, setBreakMinutes] = useState(60);
  const [isDayOff, setIsDayOff] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(isEdit);

  const workingTime = isDayOff ? '-' : calcWorkingTime(startTime, endTime, breakMinutes);

  const loadPattern = useCallback(async () => {
    try {
      const { data } = await api.get<ApiShiftPatternResponse>(`/shift-patterns/${patternId}`);
      setName(data.name);
      setColor(data.color);
      setStartTime(data.startTime ?? '09:00');
      setEndTime(data.endTime ?? '18:00');
      setBreakMinutes(data.breakMinutes ?? 0);
      setIsDayOff(data.isDayOff);
    } catch {
      router.replace('/work/patterns');
    } finally {
      setInitializing(false);
    }
  }, [patternId, router]);

  useEffect(() => {
    if (patternId) loadPattern();
  }, [patternId, loadPattern]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const payload = {
      name,
      color,
      startTime: isDayOff ? undefined : startTime,
      endTime: isDayOff ? undefined : endTime,
      breakMinutes: isDayOff ? 0 : breakMinutes,
      isDayOff,
    };
    try {
      if (isEdit) {
        await api.patch(`/shift-patterns/${patternId}`, payload);
      } else {
        await api.post('/shift-patterns', payload);
      }
      router.push('/work/patterns');
    } catch {
      setError('保存に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('このパターンを削除しますか？')) return;
    setLoading(true);
    try {
      await api.delete(`/shift-patterns/${patternId}`);
      router.push('/work/patterns');
    } catch {
      setError('削除に失敗しました');
      setLoading(false);
    }
  }

  if (initializing) return <div style={{ padding: 24, color: '#6b7280' }}>読み込み中...</div>;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', background: '#fff', minHeight: '100vh' }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
        <button type="button" onClick={() => router.push('/work/patterns')} style={{ color: '#3b82f6', fontSize: 15 }}>‹ 戻る</button>
        <span style={{ fontWeight: 700, fontSize: 16 }}>{isEdit ? 'パターン編集' : 'パターン作成'}</span>
        <button onClick={handleSubmit as unknown as React.MouseEventHandler} disabled={loading || !name} style={{ color: !name || loading ? '#9ca3af' : '#3b82f6', fontWeight: 700, fontSize: 16 }}>
          保存
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '0 16px' }}>
        {/* 表示名 */}
        <div style={{ padding: '16px 0', borderBottom: '1px solid #e5e7eb' }}>
          <label style={{ fontSize: 13, color: '#6b7280', display: 'block', marginBottom: 6 }}>表示名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="例: 早番"
            style={{ width: '100%', fontSize: 18, fontWeight: 600, padding: '8px 0', border: 'none', borderBottom: '1px solid #e5e7eb', outline: 'none' }}
          />
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 13, color: '#6b7280', display: 'block', marginBottom: 6 }}>表示色</label>
            <ColorPicker value={color} onChange={setColor} colors={SHIFT_COLORS} />
          </div>
        </div>

        {/* 休日フラグ */}
        <div style={{ padding: '14px 0', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15 }}>休日</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={isDayOff} onChange={(e) => setIsDayOff(e.target.checked)} style={{ width: 20, height: 20 }} />
          </label>
        </div>

        {/* 時間入力（isDayOff=false のとき表示）*/}
        {!isDayOff && (
          <div style={{ padding: '16px 0', borderBottom: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: '開始時間', value: startTime, setter: setStartTime },
              { label: '終了時間', value: endTime, setter: setEndTime },
            ].map(({ label, value, setter }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 15 }}>{label}</span>
                <input
                  type="time"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  style={{ fontSize: 15, border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 10px' }}
                />
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 15 }}>休憩時間（分）</span>
              <input
                type="number"
                value={breakMinutes}
                onChange={(e) => setBreakMinutes(Number(e.target.value))}
                min={0}
                step={15}
                style={{ width: 80, fontSize: 15, border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 10px', textAlign: 'right' }}
              />
            </div>
            {/* 勤務時間（自動計算）*/}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 15 }}>勤務時間</span>
              <span style={{ fontSize: 15, color: '#6b7280', fontWeight: 600 }}>{workingTime}</span>
            </div>
          </div>
        )}

        {error && <p style={{ color: '#ef4444', fontSize: 14, padding: '12px 0' }}>{error}</p>}

        {/* 保存ボタン */}
        <button
          type="submit"
          disabled={loading || !name}
          style={{ width: '100%', padding: '14px', background: !name || loading ? '#e5e7eb' : '#3b82f6', color: !name || loading ? '#9ca3af' : '#fff', fontSize: 16, fontWeight: 600, marginTop: 24, border: 'none', borderRadius: 8, cursor: !name || loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? '保存中...' : '保存'}
        </button>

        {/* 削除（編集モードのみ）*/}
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            style={{ width: '100%', padding: '14px', color: '#ef4444', fontSize: 16, fontWeight: 600, marginTop: 12, border: '1px solid #fca5a5', borderRadius: 8, background: '#fff', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            このパターンを削除
          </button>
        )}
      </form>
    </div>
  );
}
