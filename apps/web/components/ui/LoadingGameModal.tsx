'use client';

import { useCallback, useEffect, useState } from 'react';
import DinoGame from './DinoGame';

interface Props {
  isVisible: boolean;
}

export default function LoadingGameModal({ isVisible }: Props) {
  const [gameKey, setGameKey] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    if (isVisible) {
      setGameKey((k) => k + 1);
    }
  }, [isVisible]);

  const handleGameOver = useCallback((score: number) => {
    setBestScore((prev) => Math.max(prev, score));
    const t = setTimeout(() => setGameKey((k) => k + 1), 1500);
    return () => clearTimeout(t);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          padding: '24px',
          width: '100%',
          maxWidth: '640px',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '20px' }}>🦕</span>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '16px', color: '#333' }}>
              通信中... ゲームで待とう！
            </p>
            <LoadingDots />
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
            レスポンスが届いたら自動的に閉じます
          </p>
        </div>

        {/* Game */}
        <div
          style={{
            border: '2px solid #e0e0e0',
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: '#f5f5f5',
          }}
        >
          <DinoGame key={gameKey} isActive={isVisible} onGameOver={handleGameOver} />
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
            スペースキー / タップ でジャンプ
          </p>
          {bestScore > 0 && (
            <p style={{ margin: 0, fontSize: '12px', color: '#666', fontWeight: 600 }}>
              ベスト: {bestScore}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#2196f3',
            display: 'inline-block',
            animation: 'loadingBounce 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes loadingBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </span>
  );
}
