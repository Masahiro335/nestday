'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import api from '@/lib/api';

interface RegisterFormProps {
  redirectTo?: string;
}

export default function RegisterForm({ redirectTo }: RegisterFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 外部URLへのオープンリダイレクトを防ぐため、'/' 始まりの相対パスのみ許可
  const safeRedirect = redirectTo?.startsWith('/') ? redirectTo : undefined;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください');
      return;
    }

    setLoading(true);

    // API 経由で登録（service role key でメール確認不要）
    try {
      await api.post('/auth/register', { email, password, name: name || undefined });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      setError(
        status === 400
          ? 'このメールアドレスはすでに登録されています'
          : '登録に失敗しました。もう一度お試しください',
      );
      setLoading(false);
      return;
    }

    // 登録成功後、Supabase Auth でログインしてセッションを確立
    const { error: loginError } = await createClient().auth.signInWithPassword({ email, password });
    if (loginError) {
      setError('登録は完了しましたが、ログインに失敗しました。ログイン画面からログインしてください');
      setLoading(false);
      return;
    }

    document.cookie = 'has_group=false; path=/';

    // 招待リンク経由の場合はそこへ戻る、通常登録はオンボーディングへ
    router.push(safeRedirect ?? '/onboarding');
  }

  // ログインリンクに redirect を引き継ぐ
  const loginHref = safeRedirect
    ? `/login?redirect=${encodeURIComponent(safeRedirect)}`
    : '/login';

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 360, padding: '0 24px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
        NestDay
      </h1>
      {safeRedirect && (
        <p style={{ fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 24 }}>
          アカウントを作成して招待を受け取ってください
        </p>
      )}
      {!safeRedirect && <div style={{ marginBottom: 32 }} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="表示名"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
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
          placeholder="パスワード（8文字以上）"
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
        {loading ? '登録中...' : '登録する'}
      </button>

      <p style={{ textAlign: 'center', fontSize: 14, color: '#6b7280', marginTop: 20 }}>
        すでにアカウントをお持ちの方は{' '}
        <Link href={loginHref} style={{ color: '#3b82f6' }}>ログイン</Link>
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
