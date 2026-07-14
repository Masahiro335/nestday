'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import ColorPicker from '@/components/ui/ColorPicker';
import { setStoredGroupId } from '@/hooks/use-groups';

interface ApiGroup {
  id: string;
  name: string;
  inviteToken: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');

export default function GroupNewPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<ApiGroup | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post<ApiGroup>('/groups', { name: name.trim() });
      document.cookie = 'has_group=true; path=/; max-age=2592000';
      setCreated(data);
    } catch {
      setError('グループの作成に失敗しました。もう一度お試しください');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!created) return;
    await navigator.clipboard.writeText(`${APP_URL}/join/${created.inviteToken}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  /* 作成完了画面 */
  if (created) {
    const inviteUrl = `${APP_URL}/join/${created.inviteToken}`;
    return (
      <div style={{ background: '#f9fafb', minHeight: '100vh', paddingBottom: 'calc(var(--bottom-nav-height) + 16px)' }}>
        <div style={{ background: '#fff', padding: '16px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 10 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, textAlign: 'center' }}>グループを作成しました</h1>
        </div>

        <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* 作成したグループ */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '20px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16, background: color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, color: '#fff', fontWeight: 700, margin: '0 auto 12px',
            }}>
              {created.name.charAt(0)}
            </div>
            <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>「{created.name}」</p>
            <p style={{ fontSize: 13, color: '#6b7280' }}>グループが作成されました ✓</p>
          </div>

          {/* 招待リンク */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>招待リンク</p>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
              このリンクを共有してメンバーを招待できます
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{
                flex: 1, padding: '10px 12px', background: '#f3f4f6',
                borderRadius: 8, fontSize: 12, color: '#374151',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {inviteUrl}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  padding: '10px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                  background: copied ? '#10b981' : '#3b82f6', color: '#fff', flexShrink: 0,
                }}
              >
                {copied ? '✓ コピー' : 'コピー'}
              </button>
            </div>
          </div>

          {/* アクション */}
          <button
            type="button"
            onClick={() => {
              setStoredGroupId(created.id);
              router.push('/');
            }}
            style={{ width: '100%', padding: '14px', background: '#3b82f6', color: '#fff', borderRadius: 12, fontSize: 16, fontWeight: 700 }}
          >
            カレンダーへ進む
          </button>
          <Link
            href="/groups-settings"
            style={{ display: 'block', textAlign: 'center', color: '#6b7280', fontSize: 14, padding: '8px' }}
          >
            設定に戻る
          </Link>
        </div>
      </div>
    );
  }

  /* 作成フォーム */
  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', paddingBottom: 'calc(var(--bottom-nav-height) + 16px)' }}>
      {/* ヘッダー */}
      <div style={{ background: '#fff', padding: '16px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center' }}>
        <Link href="/groups-settings" style={{ color: '#3b82f6', fontSize: 15, marginRight: 'auto' }}>‹ 戻る</Link>
        <h1 style={{ fontSize: 18, fontWeight: 700, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>グループを作成</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* グループ名 */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 8 }}>
            グループ名
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 田中家、開発チーム"
            required
            maxLength={50}
            style={{
              width: '100%', padding: '12px 0', fontSize: 18, fontWeight: 600,
              border: 'none', borderBottom: '1px solid #e5e7eb', outline: 'none', background: 'transparent',
            }}
          />
        </div>

        {/* グループカラー */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 12 }}>
            グループカラー
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, color: '#fff', fontWeight: 700, flexShrink: 0,
            }}>
              {name.charAt(0) || '?'}
            </div>
            <ColorPicker value={color} onChange={setColor} />
          </div>
        </div>

        {error && (
          <p style={{ color: '#ef4444', fontSize: 14, padding: '4px 0' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !name.trim()}
          style={{
            width: '100%', padding: '16px', borderRadius: 12, fontSize: 16, fontWeight: 700,
            background: loading || !name.trim() ? '#9ca3af' : '#3b82f6', color: '#fff',
            marginTop: 8,
          }}
        >
          {loading ? '作成中...' : '作成する'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/')}
          style={{
            width: '100%', padding: '16px', borderRadius: 12, fontSize: 16, fontWeight: 600,
            background: '#f3f4f6', color: '#374151',
          }}
        >
          キャンセル
        </button>
      </form>
    </div>
  );
}
