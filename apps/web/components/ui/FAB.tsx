'use client';

interface FABProps {
  onClick: () => void;
  label?: string;
}

export default function FAB({ onClick, label = '＋' }: FABProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        position: 'fixed',
        bottom: 'calc(var(--bottom-nav-height) + 16px)',
        right: 16,
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: 'var(--color-primary)',
        color: '#fff',
        fontSize: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      }}
    >
      {label}
    </button>
  );
}
