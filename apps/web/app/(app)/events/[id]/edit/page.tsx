import EventForm from '@/components/calendar/EventForm';

export default function EventEditPage({ params }: { params: { id: string } }) {
  return <EventForm eventId={params.id} />;
}
