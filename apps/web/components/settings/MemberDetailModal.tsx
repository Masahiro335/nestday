'use client';

import { useState } from 'react';
import api from '@/lib/api';

interface Member {
  id: string;
  email: string;
  name?: string;
  memo?: string | null;
}

interface MemberDetailModalProps {
  isOpen: boolean;
  member: Member | null;
  isOwner: boolean;
  isMe: boolean;
  isCurrentUserOwner: boolean;
  groupId: string | null;
  onClose: () => void;
  onMemoSaved?: (memo: string) => void;
  onMemberRemoved?: () => void;
}

type Step = 'detail' | 'confirm';

function AvatarLarge({ member }: { member: Member }) {
  const initial = (member.name ?? member.email).charAt(0).toUpperCase();
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const bg = colors[member.email.charCodeAt(0) % colors.length];

  return (
    <div
      style={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: bg,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 32,
        fontWeight: 700,
        flexShrink: 0,
        margin: '0 auto',
      }}
    >
      {initial}
    </div>
  );
}

export default function MemberDetailModal({
  isOpen,
  member,
  isOwner,
  isMe,
  isCurrentUserOwner,
  groupId,
  onClose,
  onMemoSaved,
  onMemberRemoved,
}: MemberDetailModalProps) {
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [step, setStep] = useState<Step>('detail');
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState('');

  const [lastMemberId, setLastMemberId] = useState<string | null>(null);
  if (member && member.id !== lastMemberId) {
    setLastMemberId(member.id);
    setMemo(member.memo ?? '');
    setSaveError('');
    setStep('detail');
    setRemoveError('');
  }

  if (!isOpen || !member) return null;

  const displayName = member.name ?? member.email.split('@')[0];
  // 本人（ただしグループオーナー自身は退会不可）またはグループオーナーが他メンバーを操作
  const canRemove = (isMe && !isOwner) || (isCurrentUserOwner && !isMe);

  function handleClose() {
    setStep('detail');
    onClose();
  }

  async function handleSaveMemo() {
    setSaving(true);
    setSaveError('');
    try {
      await api.patch('/users/me', { memo });
      onMemoSaved?.(memo);
      handleClose();
    } catch {
      setSaveError('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmRemove() {
    if (!member) return;
    const message = isMe
      ? 'グループから退会しますか？\nこの操作は取り消せません。'
      : `「${displayName}」をグループから退会させますか？\nこの操作は取り消せません。`;
    if (!confirm(message)) return;
    setRemoving(true);
    setRemoveError('');
    try {
      await api.delete(`/groups/${groupId}/members/${member.id}`);
      onMemberRemoved?.();
      handleClose();
    } catch {
      setRemoveError('退会処理に失敗しました');
      setRemoving(false);
    }
  }

  if (step === 'confirm') {
    return (
      <>
        <div
          onClick={handleClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }}
        />
        <div
          style={{
            position: 'fixed',
            bottom: 'var(--bottom-nav-height)',
            left: 0,
            right: 0,
            background: '#fff',
            borderRadius: '20px 20px 0 0',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
          }}
        >
          <div style={{ width: 40, height: 4, background: '#d1d5db', borderRadius: 2, margin: '12px auto 0' }} />

          {/* ヘッダー */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 8px' }}>
            <button
              type="button"
              onClick={() => setStep('detail')}
              style={{ fontSize: 14, color: '#3b82f6', background: 'none', padding: '4px 0' }}
            >
              ← 戻る
            </button>
            <span style={{ fontSize: 16, fontWeight: 700 }}>退会確認</span>
            <button type="button" onClick={handleClose} style={{ fontSize: 20, color: '#6b7280', background: 'none', padding: 4 }}>
              ✕
            </button>
          </div>

          {/* コンテンツ */}
          <div style={{ padding: '24px 24px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {/* 警告アイコン */}
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: '#fef2f2',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            }}>
              ⚠️
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>
                {isMe ? 'グループから退会しますか？' : `${displayName} をグループから退会させますか？`}
              </p>
              <p style={{ fontSize: 13, color: '#6b7280', marginTop: 8, lineHeight: 1.6 }}>
                退会後は、グループのカレンダーにアクセスできなくなります。
                招待リンクから再度参加することができます。
              </p>
            </div>

            {/* 対象メンバー情報 */}
            <div style={{
              width: '100%', background: '#f9fafb', borderRadius: 12,
              padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <AvatarLarge member={member} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 15, fontWeight: 600 }}>{displayName}</p>
                <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{member.email}</p>
              </div>
            </div>

            {removeError && (
              <p style={{ fontSize: 13, color: '#ef4444', textAlign: 'center' }}>{removeError}</p>
            )}

            {/* ボタン */}
            <button
              type="button"
              onClick={handleConfirmRemove}
              disabled={removing}
              style={{
                width: '100%', padding: '14px', borderRadius: 12,
                background: removing ? '#fca5a5' : '#ef4444', color: '#fff',
                fontSize: 16, fontWeight: 700,
              }}
            >
              {removing ? '処理中...' : '退会確定'}
            </button>
            <button
              type="button"
              onClick={() => setStep('detail')}
              style={{
                width: '100%', padding: '14px', borderRadius: 12,
                background: '#f3f4f6', color: '#374151',
                fontSize: 15, fontWeight: 600,
              }}
            >
              キャンセル
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        onClick={handleClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: 'var(--bottom-nav-height)',
          left: 0,
          right: 0,
          background: '#fff',
          borderRadius: '20px 20px 0 0',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: 40, height: 4, background: '#d1d5db', borderRadius: 2, margin: '12px auto 0', flexShrink: 0 }} />

        {/* ヘッダー */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 8px', flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>メンバー詳細</span>
          <button type="button" onClick={handleClose} style={{ fontSize: 20, color: '#6b7280', background: 'none', padding: 4 }}>
            ✕
          </button>
        </div>

        {/* コンテンツ */}
        <div style={{ padding: '16px 24px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <AvatarLarge member={member} />

          {/* 名前・バッジ */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{displayName}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 6 }}>
              {isOwner && (
                <span style={{ fontSize: 11, background: '#fef3c7', color: '#d97706', padding: '2px 10px', borderRadius: 12, fontWeight: 600 }}>
                  オーナー
                </span>
              )}
              {isMe && (
                <span style={{ fontSize: 11, background: '#eff6ff', color: '#3b82f6', padding: '2px 10px', borderRadius: 12, fontWeight: 600 }}>
                  自分
                </span>
              )}
            </div>
          </div>

          {/* 詳細情報 */}
          <div style={{ width: '100%', background: '#f9fafb', borderRadius: 12, overflow: 'hidden', marginTop: 4 }}>
            <InfoRow label="メールアドレス" value={member.email} />
            {member.name && <InfoRow label="表示名" value={member.name} last />}
          </div>

          {/* メモ欄 */}
          <div style={{ width: '100%', marginTop: 4 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              メモ
            </p>
            {isMe ? (
              <>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="自己紹介やひとことメモを入力..."
                  maxLength={200}
                  rows={4}
                  style={{
                    width: '100%', padding: '12px', borderRadius: 10,
                    border: '1px solid #e5e7eb', fontSize: 14, color: '#111827',
                    resize: 'none', outline: 'none', fontFamily: 'inherit',
                    background: '#fff', boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  <span style={{ fontSize: 11, color: saveError ? '#ef4444' : '#9ca3af' }}>
                    {saveError || `${memo.length} / 200`}
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveMemo}
                    disabled={saving}
                    style={{
                      padding: '8px 20px', borderRadius: 8,
                      background: saving ? '#93c5fd' : '#3b82f6',
                      color: '#fff', fontSize: 14, fontWeight: 600,
                    }}
                  >
                    {saving ? '保存中...' : '保存'}
                  </button>
                </div>
              </>
            ) : (
              <div style={{
                width: '100%', padding: '12px', borderRadius: 10,
                background: '#f9fafb', border: '1px solid #e5e7eb',
                fontSize: 14, color: member.memo ? '#111827' : '#9ca3af',
                minHeight: 64, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>
                {member.memo || 'メモなし'}
              </div>
            )}
          </div>

          {/* 退会ボタン（オーナーが他メンバーを見るときのみ表示） */}
          {canRemove && (
            <div style={{ width: '100%', marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setStep('confirm')}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12,
                  background: '#fff', color: '#ef4444',
                  fontSize: 15, fontWeight: 600,
                  border: '1px solid #fecaca',
                }}
              >
                {isMe ? 'グループから退会する' : 'グループから退会させる'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '12px 16px',
      borderBottom: last ? 'none' : '1px solid #e5e7eb', gap: 12,
    }}>
      <span style={{ fontSize: 13, color: '#6b7280', minWidth: 96, flexShrink: 0 }}>{label}</span>
      <span style={{
        fontSize: 14, color: '#111827', fontWeight: 500,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
      }}>
        {value}
      </span>
    </div>
  );
}
