'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import api from '@/lib/api';

interface LoginFormProps {
  redirectTo?: string;
}

export default function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 外部URLへのオープンリダイレクトを防ぐため、'/' 始まりの相対パスのみ許可
  const safeRedirect = redirectTo?.startsWith('/') ? redirectTo : undefined;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await createClient().auth.signInWithPassword({ email, password });

    if (authError) {
      setError('メールアドレスまたはパスワードが正しくありません');
      setLoading(false);
      return;
    }

    // 招待リンク経由の場合はそこへ戻る
    if (safeRedirect) {
      document.cookie = 'has_group=false; path=/';
      router.push(safeRedirect);
      return;
    }

    try {
      await api.get('/groups/me');
      document.cookie = 'has_group=true; path=/; max-age=2592000';
      router.push('/');
    } catch {
      document.cookie = 'has_group=false; path=/';
      router.push('/onboarding');
    }
  }

  // 新規登録リンクに redirect を引き継ぐ
  const registerHref = safeRedirect
    ? `/register?redirect=${encodeURIComponent(safeRedirect)}`
    : '/register';

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 360, padding: '0 24px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
        NestDay
      </h1>
      {safeRedirect && (
        <p style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 24 }}>
          ログインして招待を受け取ってください
        </p>
      )}
      {!safeRedirect && <div style={{ marginBottom: 32 }} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
      </div>

      {error && (
        <p style={{ color: '#ef4444', fontSize: 14, marginBottom: 12 }}>{error}</p>
      )}

      <button type="submit" disabled={loading} style={buttonStyle}>
        {loading ? 'ログイン中...' : 'ログイン'}
      </button>

      <p style={{ textAlign: 'center', fontSize: 14, color: '#6b7280', marginTop: 20 }}>
        アカウントをお持ちでない方は{' '}
        <Link href={registerHref} style={{ color: '#3b82f6' }}>新規登録</Link>
      </p>
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '12px 16px',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  fontSize: 16,
  outline: 'none',
  width: '100%',
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  background: '#3b82f6',
  color: '#fff',
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
};
