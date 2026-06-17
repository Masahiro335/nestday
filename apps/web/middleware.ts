import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register'];
const GROUP_OPTIONAL_ROUTES = ['/onboarding', '/join'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  const isSupabaseConfigured = supabaseUrl.startsWith('http');

  // Supabase 未設定時（ローカル開発等）はミドルウェアをスキップ
  if (!isSupabaseConfigured) {
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthenticated = !!session;
  const hasGroup = request.cookies.get('has_group')?.value === 'true';
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isGroupOptionalRoute = GROUP_OPTIONAL_ROUTES.some((r) => pathname.startsWith(r));

  // 未認証 + 保護ルート → /login
  if (!isAuthenticated && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 認証済み + /login, /register → /
  if (isAuthenticated && isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // 認証済み + グループ未所属 + 保護ルート（/join 以外）→ /onboarding
  if (isAuthenticated && !hasGroup && !isGroupOptionalRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/onboarding';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
