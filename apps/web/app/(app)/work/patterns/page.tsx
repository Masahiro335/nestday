'use client';

import { useShiftPatterns } from '@/hooks/use-shifts';
import ShiftPatternList from '@/components/work/ShiftPatternList';

export default function ShiftPatternListPage() {
  const { patterns, isLoading } = useShiftPatterns();

  if (isLoading) return <div style={{ padding: 24, color: '#6b7280' }}>読み込み中...</div>;

  return <ShiftPatternList patterns={patterns} />;
}
