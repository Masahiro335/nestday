'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import type { GroupPreview } from '@nestday/types';

export default function JoinPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = params?.token ?? '';

  const [preview, setPreview] = useState<GroupPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!token) return;
    api
      .get<GroupPreview>(`/groups/join/${token}`)
      .then(({ data }) => setPreview(data))
      .catch((err) => {
        if (err.response?.status === 404) {
          setError('招待リンクが無効または期限切れです');
        } else {
          setError('グループ情報の取得に失敗しました');
        }
      });
  }, [token]);

  async function handleJoin() {
    setJoining(true);
    setError(null);
    try {
      await api.post(`/groups/join/${token}`);
      document.cookie = 'has_group=true; path=/; max-age=2592000';
      router.push('/');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 409) {
        setError('すでにグループに所属しています');
      } else {
        setError('グループへの参加に失敗しました');
      }
      setJoining(false);
    }
  }

  if (error && !preview) {
    return (
      <main style={centerStyle}>
        <div style={cardStyle}>
          <p style={{ color: '#ef4444', fontSize: 16, marginBottom: 20 }}>{error}</p>
          <Link href="/onboarding" style={linkStyle}>
            グループを作成する
          </Link>
        </div>
      </main>
    );
  }

  if (!preview) {
    return (
      <main style={centerStyle}>
        <p style={{ color: '#6b7280' }}>読み込み中...</p>
      </main>
    );
  }

  return (
    <main style={centerStyle}>
      <div style={cardStyle}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          「{preview.name}」に参加しますか？
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
          メンバー数: {preview.memberCount}人
        </p>

        {error && (
          <p style={{ color: '#ef4444', fontSize: 14, marginBottom: 16 }}>{error}</p>
        )}

        <button
          onClick={handleJoin}
          disabled={joining}
          style={{
            width: '100%',
            padding: '12px',
            background: '#3b82f6',
            color: '#fff',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          {joining ? '参加中...' : '参加する'}
        </button>

        <Link href="/onboarding" style={{ ...linkStyle, color: '#6b7280', background: '#f3f4f6' }}>
          キャンセル
        </Link>
      </div>
    </main>
  );
}

const centerStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 24px',
};

const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 400,
};

const linkStyle: React.CSSProperties = {
  display: 'block',
  textAlign: 'center',
  padding: '12px',
  background: '#1a1a1a',
  color: '#fff',
  borderRadius: 8,
  fontSize: 15,
  fontWeight: 600,
};
