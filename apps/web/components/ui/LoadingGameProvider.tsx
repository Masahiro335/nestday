'use client';

import { useEffect, useState } from 'react';
import { loadingGameStore } from '@/lib/loading-game-store';
import LoadingGameModal from './LoadingGameModal';

export default function LoadingGameProvider({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    return loadingGameStore.subscribe(setShow);
  }, []);

  return (
    <>
      {children}
      <LoadingGameModal isVisible={show} />
    </>
  );
}
