'use client';

import { useState } from 'react';
import api from '@/lib/api';
import InviteLinkCard from '@/components/group/InviteLinkCard';
import type { Group } from '@calendar-share/types';

export default function OnboardingForm() {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data } = await api.post<Group>('/groups', { name });
      document.cookie = 'has_group=true; path=/';
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
        <InviteLinkCard inviteToken={group.invite_token} />
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
