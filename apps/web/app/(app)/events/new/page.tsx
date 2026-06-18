import EventForm from '@/components/calendar/EventForm';

export default function EventNewPage({
  searchParams,
}: {
  searchParams: { groupId?: string };
}) {
  return <EventForm groupId={searchParams.groupId} />;
}
