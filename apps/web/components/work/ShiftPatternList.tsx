'use client';

import Link from 'next/link';
import api from '@/lib/api';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface ApiShiftPattern {
  id: string;
  name: string;
  color: string;
  startTime: string | null;
  endTime: string | null;
  breakMinutes: number;
  isDayOff: boolean;
  sortOrder: number;
}

interface ShiftPatternListProps {
  patterns: ApiShiftPattern[];
  onReordered: () => void;
}

function formatTime(pattern: ApiShiftPattern): string {
  if (pattern.isDayOff) return '休日';
  if (pattern.startTime && pattern.endTime) {
    return `${pattern.startTime} - ${pattern.endTime}`;
  }
  return '';
}

function SortableItem({ pattern }: { pattern: ApiShiftPattern }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: pattern.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 16px',
        borderBottom: '1px solid #f3f4f6',
        background: isDragging ? '#f0f9ff' : '#fff',
        opacity: isDragging ? 0.8 : 1,
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : undefined,
        boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.12)' : undefined,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      {/* パターン行（タップで編集） */}
      <Link
        href={`/work/patterns/${pattern.id}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flex: 1,
          minWidth: 0,
          padding: '4px 0',
        }}
      >
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: pattern.color,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            flex: 1,
            fontWeight: 600,
            color: pattern.color,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {pattern.name}
        </span>
        <span style={{ fontSize: 13, color: '#6b7280', flexShrink: 0 }}>{formatTime(pattern)}</span>
        <span style={{ color: '#d1d5db' }}>›</span>
      </Link>
    </div>
  );
}

export default function ShiftPatternList({ patterns, onReordered }: ShiftPatternListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = patterns.findIndex((p) => p.id === active.id);
    const newIndex = patterns.findIndex((p) => p.id === over.id);
    const newOrder = arrayMove(patterns, oldIndex, newIndex);

    await Promise.all(
      newOrder.map((p, i) => api.patch(`/shift-patterns/${p.id}`, { sortOrder: i })),
    );
    onReordered();
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <Link href="/work" style={{ color: '#3b82f6', fontSize: 15 }}>
          ‹ 戻る
        </Link>
        <span style={{ fontWeight: 700, fontSize: 16 }}>シフトパターン設定</span>
        <Link href="/work/patterns/new" style={{ color: '#3b82f6', fontSize: 20, fontWeight: 700 }}>
          ＋
        </Link>
      </div>

      {patterns.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>
          <p>パターンがありません</p>
          <Link
            href="/work/patterns/new"
            style={{ color: '#3b82f6', fontSize: 14, marginTop: 8, display: 'inline-block' }}
          >
            最初のパターンを作成する
          </Link>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={patterns.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <div>
              {patterns.map((pattern) => (
                <SortableItem key={pattern.id} pattern={pattern} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
