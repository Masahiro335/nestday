'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import api from '@/lib/api';

type Step = 'main' | 'confirm';

export default function AccountSettingsPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('main');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await createClient().auth.signOut();
    router.replace('/login');
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    setDeleteError('');
    try {
      await api.delete('/users/me');
      await createClient().auth.signOut();
      router.replace('/login');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setDeleteError(msg ?? 'アカウント削除に失敗しました');
      setDeleting(false);
    }
  }

  if (step === 'confirm') {
    return (
      <div style={{ background: '#f9fafb', minHeight: '100vh', paddingBottom: 'calc(var(--bottom-nav-height) + 16px)' }}>
        {/* ヘッダー */}
        <div style={{ background: '#fff', padding: '16px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={() => { setStep('main'); setDeleteError(''); }}
            style={{ background: 'none', fontSize: 20, color: '#374151', padding: '0 4px', flexShrink: 0 }}
          >
            ←
          </button>
          <h1 style={{ fontSize: 18, fontWeight: 700, flex: 1, textAlign: 'center', marginRight: 28 }}>アカウント削除の確認</h1>
        </div>

        <div style={{ padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          {/* 警告アイコン */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%', background: '#fef2f2',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
          }}>
            ⚠️
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 12 }}>
              本当にアカウントを削除しますか？
            </p>
            <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8, textAlign: 'left' }}>
              <p>アカウントを削除すると以下のデータが削除されます：</p>
              <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <li>アカウント情報（名前・メールアドレス・メモ）</li>
                <li>全グループのメンバーシップ</li>
              </ul>
              <p style={{ marginTop: 12, color: '#ef4444', fontWeight: 600 }}>
                この操作は取り消せません。
              </p>
              <p style={{ marginTop: 8 }}>
                ※グループのオーナーの場合はアカウントを削除できません。
              </p>
            </div>
          </div>

          {deleteError && (
            <p style={{ fontSize: 13, color: '#ef4444', textAlign: 'center', background: '#fef2f2', padding: '12px 16px', borderRadius: 8, width: '100%', boxSizing: 'border-box' }}>
              {deleteError}
            </p>
          )}

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleting}
              style={{
                width: '100%', padding: '16px', borderRadius: 12,
                background: deleting ? '#fca5a5' : '#ef4444', color: '#fff',
                fontSize: 16, fontWeight: 700,
              }}
            >
              {deleting ? '処理中...' : '削除を確定'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('main'); setDeleteError(''); }}
              style={{
                width: '100%', padding: '16px', borderRadius: 12,
                background: '#f3f4f6', color: '#374151',
                fontSize: 15, fontWeight: 600,
              }}
            >
              キャンセル
            </button>
          </div>
        </div>
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
        <h1 style={{ fontSize: 18, fontWeight: 700, flex: 1, textAlign: 'center', marginRight: 28 }}>アカウント</h1>
      </div>

      <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* ログアウト */}
        <section>
          <p style={sectionLabel}>セッション</p>
          <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              style={{
                width: '100%', padding: '16px', textAlign: 'center',
                fontSize: 16, fontWeight: 600, color: '#3b82f6',
                background: 'none',
              }}
            >
              {loggingOut ? 'ログアウト中...' : 'ログアウト'}
            </button>
          </div>
        </section>

        {/* アカウント削除 */}
        <section style={{ marginTop: 16 }}>
          <p style={sectionLabel}>危険な操作</p>
          <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <button
              type="button"
              onClick={() => setStep('confirm')}
              style={{
                width: '100%', padding: '16px', textAlign: 'center',
                fontSize: 16, fontWeight: 600, color: '#ef4444',
                background: 'none',
              }}
            >
              アカウント削除
            </button>
          </div>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 8, paddingInline: 4 }}>
            アカウントを削除します。この操作は取り消せません。
          </p>
        </section>
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
