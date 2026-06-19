'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface UserProfile {
  id: string;
  email: string;
  name?: string | null;
  memo?: string | null;
}

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [memo, setMemo] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    api.get<UserProfile>('/users/me').then(({ data }) => {
      setProfile(data);
      setName(data.name ?? '');
      setEmail(data.email);
      setMemo(data.memo ?? '');
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const payload: Record<string, string> = {};
      if (name !== (profile?.name ?? '')) payload.name = name;
      if (email !== profile?.email) payload.email = email;
      if (password) payload.password = password;
      if (memo !== (profile?.memo ?? '')) payload.memo = memo;

      if (Object.keys(payload).length === 0) {
        setSaving(false);
        return;
      }

      const { data } = await api.patch<UserProfile>('/users/me', payload);
      setProfile(data);
      setPassword('');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e: unknown) {
      const raw = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      const msg = Array.isArray(raw) ? raw[0] : raw;
      setSaveError(msg ?? '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: '#9ca3af' }}>
        読み込み中...
      </div>
    );
  }

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', paddingBottom: 'calc(var(--bottom-nav-height) + 16px)' }}>
      {/* ヘッダー */}
      <div style={{ background: '#fff', padding: '16px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{ background: 'none', fontSize: 20, color: '#374151', padding: '0 4px', flexShrink: 0 }}
        >
          ←
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, flex: 1, textAlign: 'center', marginRight: 28 }}>プロフィール</h1>
      </div>

      <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* 表示名 */}
        <section>
          <p style={sectionLabel}>表示名</p>
          <div style={card}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="表示名を入力"
              maxLength={50}
              style={inputStyle}
            />
          </div>
        </section>

        {/* メールアドレス */}
        <section>
          <p style={sectionLabel}>メールアドレス</p>
          <div style={card}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレスを入力"
              style={inputStyle}
            />
          </div>
        </section>

        {/* パスワード */}
        <section>
          <p style={sectionLabel}>パスワード</p>
          <div style={card}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="新しいパスワード（変更する場合のみ）"
              minLength={8}
              maxLength={100}
              style={inputStyle}
            />
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>8文字以上。変更しない場合は空白のままにしてください。</p>
          </div>
        </section>

        {/* メモ */}
        <section>
          <p style={sectionLabel}>メモ</p>
          <div style={card}>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="自己紹介やひとことメモを入力..."
              maxLength={200}
              rows={4}
              style={{
                ...inputStyle,
                resize: 'none',
                fontFamily: 'inherit',
              }}
            />
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 8, textAlign: 'right' }}>{memo.length} / 200</p>
          </div>
        </section>

        {/* エラー・成功メッセージ */}
        {saveError && (
          <p style={{ fontSize: 13, color: '#ef4444', textAlign: 'center' }}>{saveError}</p>
        )}
        {saveSuccess && (
          <p style={{ fontSize: 13, color: '#10b981', textAlign: 'center' }}>保存しました</p>
        )}

        {/* 保存ボタン */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', padding: '16px', borderRadius: 12,
            background: saving ? '#93c5fd' : '#3b82f6', color: '#fff',
            fontSize: 16, fontWeight: 700,
          }}
        >
          {saving ? '保存中...' : '保存する'}
        </button>
      </div>
    </div>
  );
}

const sectionLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: 8,
};

const card: React.CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  padding: '14px 16px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 0',
  border: 'none',
  borderBottom: '1px solid #e5e7eb',
  fontSize: 15,
  color: '#111827',
  outline: 'none',
  background: 'transparent',
  boxSizing: 'border-box',
};
