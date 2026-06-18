'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', label: 'プライベート', icon: '🏠', match: (p: string) => p === '/' },
  { href: '/work', label: '仕事用', icon: '💼', match: (p: string) => p.startsWith('/work') },
  { href: '/settings', label: '設定', icon: '⚙️', match: (p: string) => p.startsWith('/settings') },
];

export default function BottomNav() {
  const pathname = usePathname();

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
    </nav>
  );
}
