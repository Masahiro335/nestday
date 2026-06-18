'use client';

import type { ApiGroupSummary } from '@/hooks/use-groups';

interface GroupSheetProps {
  isOpen: boolean;
  groups: ApiGroupSummary[];
  selectedGroupId: string | null;
  onSelect: (groupId: string) => void;
  onClose: () => void;
}

export default function GroupSheet({
  isOpen,
  groups,
  selectedGroupId,
  onSelect,
  onClose,
}: GroupSheetProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
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
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
        }}
      >
        {/* ドラッグハンドル */}
        <div style={{ width: 40, height: 4, background: '#d1d5db', borderRadius: 2, margin: '12px auto 0' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 8px' }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>グループを選択</span>
          <button type="button" onClick={onClose} style={{ fontSize: 20, color: '#6b7280' }}>✕</button>
        </div>

        <div style={{ overflowY: 'auto', padding: '0 16px 16px' }}>
          {groups.map((group) => {
            const isSelected = group.id === selectedGroupId;
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => { onSelect(group.id); onClose(); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 12px',
                  marginBottom: 8,
                  borderRadius: 12,
                  border: isSelected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  background: isSelected ? '#eff6ff' : '#fff',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: '#3b82f6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, color: '#fff', fontWeight: 700, flexShrink: 0,
                }}>
                  {group.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {group.name}
                  </p>
                  <p style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>
                    {group.members.length}人のメンバー
                  </p>
                </div>
                {isSelected && (
                  <span style={{ color: '#3b82f6', fontSize: 18 }}>✓</span>
                )}
              </button>
            );
          })}

        </div>
      </div>
    </>
  );
}
