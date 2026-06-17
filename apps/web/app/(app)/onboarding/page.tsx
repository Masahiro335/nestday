import OnboardingForm from '@/components/group/OnboardingForm';

export default function OnboardingPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <OnboardingForm />
    </main>
  );
}
