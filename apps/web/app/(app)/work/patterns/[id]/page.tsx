import ShiftPatternForm from '@/components/work/ShiftPatternForm';

export default function ShiftPatternEditPage({ params }: { params: { id: string } }) {
  return <ShiftPatternForm patternId={params.id} />;
}
