'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

const settingsMenu = [
  { href: '/settings', label: 'グループ', icon: '👥' },
  { href: '/settings/profile', label: 'プロフィール', icon: '👤' },
  { href: '/settings/account', label: 'アカウント', icon: '🔐' },
];

const tabs = [
  { href: '/', label: 'プライベート', icon: '🏠', match: (p: string) => p === '/' },
  { href: '/work', label: '仕事用', icon: '💼', match: (p: string) => p.startsWith('/work') },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const isSettingsActive = pathname.startsWith('/settings');

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    }
    if (settingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [settingsOpen]);

  useEffect(() => {
    setSettingsOpen(false);
  }, [pathname]);

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'var(--bottom-nav-height)',
        display: 'flex',
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-bg)',
        zIndex: 30,
      }}
    >
      {tabs.map(({ href, label, icon, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              fontSize: 11,
              color: active ? 'var(--color-primary)' : 'var(--color-muted)',
              textDecoration: 'none',
            }}
          >
            <span style={{ fontSize: 20 }}>{icon}</span>
            {label}
          </Link>
        );
      })}

      {/* 設定ボタン（ドロップダウン） */}
      <div ref={settingsRef} style={{ flex: 1, position: 'relative' }}>
        <button
          type="button"
          onClick={() => setSettingsOpen((v) => !v)}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            fontSize: 11,
            color: isSettingsActive || settingsOpen ? 'var(--color-primary)' : 'var(--color-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <span style={{ fontSize: 20 }}>⚙️</span>
          設定
        </button>

        {settingsOpen && (
          <>
            {/* オーバーレイ（背景クリックで閉じる） */}
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 39,
              }}
              onClick={() => setSettingsOpen(false)}
            />
            {/* ドロップダウンメニュー */}
            <div
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                border: '1px solid #e5e7eb',
                minWidth: 160,
                overflow: 'hidden',
                zIndex: 40,
              }}
            >
              {settingsMenu.map(({ href, label, icon }, i) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '14px 16px',
                      fontSize: 15,
                      fontWeight: active ? 700 : 500,
                      color: active ? 'var(--color-primary, #3b82f6)' : '#374151',
                      textDecoration: 'none',
                      borderBottom: i < settingsMenu.length - 1 ? '1px solid #f3f4f6' : 'none',
                      background: active ? '#eff6ff' : 'transparent',
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{icon}</span>
                    {label}
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
