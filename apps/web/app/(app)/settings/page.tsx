'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { useGroups, getStoredGroupId, setStoredGroupId } from '@/hooks/use-groups';
import GroupSheet from '@/components/ui/GroupSheet';

interface Member {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

function Avatar({ member }: { member: Member }) {
  const initial = (member.name ?? member.email).charAt(0).toUpperCase();
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const bg = colors[member.email.charCodeAt(0) % colors.length];

  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: bg,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [copied, setCopied] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showGroupSheet, setShowGroupSheet] = useState(false);

  const { groups, isLoading } = useGroups();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  useEffect(() => {
    createClient().auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user.id);
    });
    const stored = getStoredGroupId();
    if (stored) setSelectedGroupId(stored);
  }, []);

  useEffect(() => {
    if (groups.length === 0) return;
    const stored = getStoredGroupId();
    const valid = stored && groups.some((g) => g.id === stored);
    if (!valid) {
      setSelectedGroupId(groups[0].id);
      setStoredGroupId(groups[0].id);
    } else if (!selectedGroupId && stored) {
      setSelectedGroupId(stored);
    }
  }, [groups]);

  function handleSelectGroup(groupId: string) {
    setSelectedGroupId(groupId);
    setStoredGroupId(groupId);
  }

  async function handleCopy() {
    if (!group) return;
    await navigator.clipboard.writeText(`${appUrl}/join/${group.inviteToken}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleLogout() {
    if (!confirm('ログアウトしますか？')) return;
    setLoggingOut(true);
    await createClient().auth.signOut();
    document.cookie = 'has_group=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/login');
  }

  const group = groups.find((g) => g.id === selectedGroupId) ?? null;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: '#9ca3af' }}>
        読み込み中...
      </div>
    );
  }

  const inviteUrl = group ? `${appUrl}/join/${group.inviteToken}` : '';

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', paddingBottom: 'calc(var(--bottom-nav-height) + 16px)' }}>
      {/* ヘッダー */}
      <div style={{ background: '#fff', padding: '16px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, textAlign: 'center' }}>設定</h1>
      </div>

      {group ? (
        <>
          {/* グループ情報 */}
          <section style={{ margin: '16px 0 0' }}>
            <p style={sectionLabel}>グループ</p>
            <div style={card}>
              <button
                type="button"
                onClick={groups.length > 1 ? () => setShowGroupSheet(true) : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  width: '100%', background: 'none', textAlign: 'left',
                  cursor: groups.length > 1 ? 'pointer' : 'default',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: '#3b82f6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, color: '#fff', fontWeight: 700, flexShrink: 0,
                }}>
                  {group.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 17, fontWeight: 700 }}>{group.name}</p>
                  <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{group.members.length}人のメンバー</p>
                </div>
                {groups.length > 1 && (
                  <span style={{ fontSize: 12, color: '#6b7280', flexShrink: 0 }}>切替 ▼</span>
                )}
              </button>
            </div>
          </section>

          {/* 招待リンク */}
          <section style={{ margin: '16px 0 0' }}>
            <p style={sectionLabel}>招待リンク</p>
            <div style={card}>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 10 }}>
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
                    background: copied ? '#10b981' : '#3b82f6', color: '#fff',
                    flexShrink: 0, transition: 'background 0.2s',
                  }}
                >
                  {copied ? '✓ コピー済み' : 'コピー'}
                </button>
              </div>
            </div>
          </section>

          {/* メンバー一覧 */}
          <section style={{ margin: '16px 0 0' }}>
            <p style={sectionLabel}>メンバー（{group.members.length}人）</p>
            <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', marginInline: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              {group.members.map((member, i) => {
                const isOwner = member.id === group.ownerId;
                const isMe = member.id === currentUserId;
                return (
                  <div
                    key={member.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '14px 16px',
                      borderBottom: i < group.members.length - 1 ? '1px solid #f3f4f6' : 'none',
                    }}
                  >
                    <Avatar member={member} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {member.name ?? member.email.split('@')[0]}
                        </span>
                        {isOwner && (
                          <span style={{ fontSize: 10, background: '#fef3c7', color: '#d97706', padding: '1px 6px', borderRadius: 10, fontWeight: 600, flexShrink: 0 }}>
                            オーナー
                          </span>
                        )}
                        {isMe && (
                          <span style={{ fontSize: 10, background: '#eff6ff', color: '#3b82f6', padding: '1px 6px', borderRadius: 10, fontWeight: 600, flexShrink: 0 }}>
                            自分
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {member.email}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      ) : (
        <div style={{ margin: '32px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
          グループに所属していません
        </div>
      )}

      {/* グループを作成 */}
      <section style={{ margin: '16px 0 0' }}>
        <div style={{ marginInline: 16 }}>
          <Link
            href="/groups/new"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '14px', borderRadius: 12,
              background: '#fff', color: '#3b82f6',
              fontSize: 16, fontWeight: 600,
              border: '1px solid #bfdbfe',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              textDecoration: 'none',
            }}
          >
            ＋ グループを作成する
          </Link>
        </div>
      </section>

      {/* ログアウト */}
      <section style={{ margin: '16px 0 0' }}>
        <div style={{ marginInline: 16 }}>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              width: '100%', padding: '14px', borderRadius: 12,
              background: '#fff', color: '#ef4444',
              fontSize: 16, fontWeight: 600,
              border: '1px solid #fecaca',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            {loggingOut ? 'ログアウト中...' : 'ログアウト'}
          </button>
        </div>
      </section>

      <GroupSheet
        isOpen={showGroupSheet}
        groups={groups}
        selectedGroupId={selectedGroupId}
        onSelect={handleSelectGroup}
        onClose={() => setShowGroupSheet(false)}
      />
    </div>
  );
}

const sectionLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  padding: '0 16px',
  marginBottom: 8,
};

const card: React.CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  padding: '14px 16px',
  marginInline: 16,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};
