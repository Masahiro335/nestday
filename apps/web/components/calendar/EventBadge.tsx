import type { ApiEvent } from '@/hooks/use-events';

interface EventBadgeProps {
  event: ApiEvent;
}

export default function EventBadge({ event }: EventBadgeProps) {
  const color = event.color ?? '#3b82f6';
  return (
    <div
      style={{
        background: color,
        color: '#fff',
        fontSize: 10,
        padding: '1px 4px',
        borderRadius: 3,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        marginBottom: 1,
      }}
    >
      {event.title}
    </div>
  );
}
