import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import BottomNav from '@/components/ui/BottomNav';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

  // Supabase 未設定時（ローカル開発等）は認証チェックをスキップ
  if (!supabaseUrl.startsWith('http')) {
    return (
      <div style={{ paddingBottom: 'var(--bottom-nav-height)' }}>
        {children}
        <BottomNav />
      </div>
    );
  }

  const cookieStore = cookies();
  const supabase = createServerClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    },
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div style={{ paddingBottom: 'var(--bottom-nav-height)' }}>
      {children}
      <BottomNav />
    </div>
  );
}
