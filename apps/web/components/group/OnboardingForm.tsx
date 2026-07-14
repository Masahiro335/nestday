'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import InviteLinkCard from '@/components/group/InviteLinkCard';
import type { Group } from '@nestday/types';

const HAS_GROUP_COOKIE = 'has_group=true; path=/; max-age=2592000';

export default function OnboardingForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);
  useEffect(() => {
    api.get('/groups/me').then(() => {
      document.cookie = HAS_GROUP_COOKIE;
      router.replace('/');
    }).catch(() => {});
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data } = await api.post<Group>('/groups', { name });
      document.cookie = HAS_GROUP_COOKIE;
      setGroup(data);
    } catch {
      setError('グループの作成に失敗しました。もう一度お試しください');
    } finally {
      setLoading(false);
    }
  }

  if (group) {
    return (
      <div style={{ width: '100%', maxWidth: 400, padding: '0 24px' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
          「{group.name}」を作成しました！
        </h2>
        <InviteLinkCard inviteToken={group.inviteToken} groupId={group.id} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 400, padding: '0 24px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
        グループを作成してください
      </h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
        メンバーを招待してカレンダーを共有できます
      </p>

      <input
        type="text"
        placeholder="グループ名（例: 田中家）"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        style={{
          width: '100%',
          padding: '12px 16px',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          fontSize: 16,
          marginBottom: 12,
        }}
      />

      {error && (
        <p style={{ color: '#ef4444', fontSize: 14, marginBottom: 12 }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          background: '#3b82f6',
          color: '#fff',
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        {loading ? '作成中...' : '作成する'}
      </button>
    </form>
  );
}
