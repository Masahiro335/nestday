'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useGroups, getStoredGroupId, setStoredGroupId } from '@/hooks/use-groups';
import GroupSheet from '@/components/ui/GroupSheet';
import MemberDetailModal from '@/components/settings/MemberDetailModal';
import api from '@/lib/api';

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

type DissolveStep = 'idle' | 'confirm';

export default function SettingsPage() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [copied, setCopied] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showGroupSheet, setShowGroupSheet] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [dissolveStep, setDissolveStep] = useState<DissolveStep>('idle');
  const [dissolving, setDissolving] = useState(false);
  const [dissolveError, setDissolveError] = useState('');

  const { groups, isLoading, mutate } = useGroups();

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

  async function handleDissolve() {
    if (!group) return;
    setDissolving(true);
    setDissolveError('');
    try {
      await api.delete(`/groups/${group.id}`);
      setDissolveStep('idle');
      mutate();
      router.push('/');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setDissolveError(msg ?? 'グループの解散に失敗しました');
      setDissolving(false);
    }
  }

  async function handleCopy() {
    if (!group) return;
    await navigator.clipboard.writeText(`${appUrl}/join/${group.inviteToken}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const group = groups.find((g) => g.id === selectedGroupId) ?? null;
  const isOwner = !!group && currentUserId === group.ownerId;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: '#9ca3af' }}>
        読み込み中...
      </div>
    );
  }

  const inviteUrl = group ? `${appUrl}/join/${group.inviteToken}` : '';

  if (dissolveStep === 'confirm' && group) {
    return (
      <div style={{ background: '#f9fafb', minHeight: '100vh', paddingBottom: 'calc(var(--bottom-nav-height) + 16px)' }}>
        <div style={{ background: '#fff', padding: '16px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={() => { setDissolveStep('idle'); setDissolveError(''); }}
            style={{ background: 'none', fontSize: 20, color: '#374151', padding: '0 4px', flexShrink: 0 }}
          >
            ←
          </button>
          <h1 style={{ fontSize: 18, fontWeight: 700, flex: 1, textAlign: 'center', marginRight: 28 }}>グループ解散の確認</h1>
        </div>

        <div style={{ padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', background: '#fef2f2',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
          }}>
            ⚠️
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 12 }}>
              「{group.name}」を解散しますか？
            </p>
            <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8, textAlign: 'left' }}>
              <p>解散すると以下のデータがすべて削除されます：</p>
              <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <li>グループのメンバーシップ（{group.members.length}人）</li>
                <li>グループ内の全カレンダー</li>
                <li>グループ内の全イベント</li>
                <li>グループ内の全シフト</li>
              </ul>
              <p style={{ marginTop: 12, color: '#ef4444', fontWeight: 600 }}>
                この操作は取り消せません。
              </p>
            </div>
          </div>

          {dissolveError && (
            <p style={{ fontSize: 13, color: '#ef4444', textAlign: 'center', background: '#fef2f2', padding: '12px 16px', borderRadius: 8, width: '100%', boxSizing: 'border-box' }}>
              {dissolveError}
            </p>
          )}

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            <button
              type="button"
              onClick={handleDissolve}
              disabled={dissolving}
              style={{
                width: '100%', padding: '16px', borderRadius: 12,
                background: dissolving ? '#fca5a5' : '#ef4444', color: '#fff',
                fontSize: 16, fontWeight: 700,
              }}
            >
              {dissolving ? '処理中...' : '解散確定'}
            </button>
            <button
              type="button"
              onClick={() => { setDissolveStep('idle'); setDissolveError(''); }}
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
      <div style={{ background: '#fff', padding: '16px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, textAlign: 'center' }}>グループ設定</h1>
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
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setSelectedMember(member)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '14px 16px', width: '100%',
                      background: 'none', textAlign: 'left', cursor: 'pointer',
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
                    <span style={{ fontSize: 14, color: '#d1d5db', flexShrink: 0 }}>›</span>
                  </button>
                );
              })}
            </div>
          </section>
          {/* グループ解散（オーナーのみ） */}
          {isOwner && (
            <section style={{ margin: '16px 0 0' }}>
              <p style={sectionLabel}>危険な操作</p>
              <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', marginInline: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <button
                  type="button"
                  onClick={() => setDissolveStep('confirm')}
                  style={{
                    width: '100%', padding: '16px', textAlign: 'center',
                    fontSize: 16, fontWeight: 600, color: '#ef4444',
                    background: 'none',
                  }}
                >
                  グループを解散する
                </button>
              </div>
              <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 8, paddingInline: 20 }}>
                グループ内の全データを削除します。この操作は取り消せません。
              </p>
            </section>
          )}
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

      <GroupSheet
        isOpen={showGroupSheet}
        groups={groups}
        selectedGroupId={selectedGroupId}
        onSelect={handleSelectGroup}
        onClose={() => setShowGroupSheet(false)}
      />

      <MemberDetailModal
        isOpen={selectedMember !== null}
        member={selectedMember}
        isOwner={selectedMember?.id === group?.ownerId}
        isMe={selectedMember?.id === currentUserId}
        isCurrentUserOwner={currentUserId === group?.ownerId}
        groupId={group?.id ?? null}
        onClose={() => setSelectedMember(null)}
        onMemoSaved={() => mutate()}
        onMemberRemoved={() => { setSelectedMember(null); mutate(); }}
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
