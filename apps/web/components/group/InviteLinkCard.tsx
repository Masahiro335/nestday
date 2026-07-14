'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setStoredGroupId } from '@/hooks/use-groups';

interface InviteLinkCardProps {
  inviteToken: string;
  groupId?: string;
}

export default function InviteLinkCard({ inviteToken, groupId }: InviteLinkCardProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/join/${inviteToken}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleGoToCalendar() {
    if (groupId) setStoredGroupId(groupId);
    router.push('/');
  }

  return (
    <div style={{ marginTop: 32 }}>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>
        招待リンクをメンバーに共有してください
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input
          readOnly
          value={inviteUrl}
          style={{
            flex: 1,
            padding: '10px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            fontSize: 13,
            color: '#374151',
            background: '#f9fafb',
          }}
        />
        <button
          type="button"
          onClick={handleCopy}
          style={{
            padding: '10px 16px',
            background: copied ? '#10b981' : '#3b82f6',
            color: '#fff',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          {copied ? 'コピー済み' : 'コピー'}
        </button>
      </div>

      <button
        type="button"
        onClick={handleGoToCalendar}
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'center',
          padding: '12px',
          background: '#1a1a1a',
          color: '#fff',
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        カレンダーへ進む
      </button>
    </div>
  );
}
