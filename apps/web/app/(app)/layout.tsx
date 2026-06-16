import BottomNav from '@/components/ui/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ paddingBottom: 'var(--bottom-nav-height)' }}>
      {children}
      <BottomNav />
    </div>
  );
}
