'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
      }}
    >
      <Link
        href="/"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          fontSize: 11,
          color: pathname === '/' ? 'var(--color-primary)' : 'var(--color-muted)',
        }}
      >
        <span style={{ fontSize: 20 }}>🏠</span>
        プライベート
      </Link>
      <Link
        href="/work"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          fontSize: 11,
          color: pathname.startsWith('/work') ? 'var(--color-primary)' : 'var(--color-muted)',
        }}
      >
        <span style={{ fontSize: 20 }}>💼</span>
        仕事用
      </Link>
    </nav>
  );
}
