'use client';

import { useState, useEffect } from 'react';
import LoadingGameModal from '@/components/ui/LoadingGameModal';

export default function GamePreviewPage() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ background: '#eee', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <button onClick={() => setShow(true)} style={{ padding: '12px 24px', fontSize: 16 }}>
        ゲームを表示
      </button>
      <LoadingGameModal isVisible={show} />
    </div>
  );
}
