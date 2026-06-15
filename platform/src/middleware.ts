import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionTokenFromRequest, COOKIE_NAME as ADMIN_COOKIE } from '@/lib/cms/auth-edge';
import { verifyUserSessionFromRequest, USER_COOKIE } from '@/lib/user-auth-edge';

const PUBLIC_ADMIN_PATHS = ['/admin/login'];

const PUBLIC_USER_PATHS = ['/login', '/signup', '/lawyer-login', '/lawyer-signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    const valid = await verifySessionTokenFromRequest(token);

    if (PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
      if (valid) return NextResponse.redirect(new URL('/admin', request.url));
      return NextResponse.next();
    }

    if (!valid) {
      const login = new URL('/admin/login', request.url);
      login.searchParams.set('from', pathname);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  const isDashboard = pathname.startsWith('/dashboard');
  const isLawyerDashboard = pathname.startsWith('/lawyer-dashboard');

  if (!isDashboard && !isLawyerDashboard) {
    return NextResponse.next();
  }

  const userToken = request.cookies.get(USER_COOKIE)?.value;
  const session = await verifyUserSessionFromRequest(userToken);

  if (!session) {
    const loginPath = isLawyerDashboard ? '/lawyer-login' : '/login';
    const login = new URL(loginPath, request.url);
    login.searchParams.set('from', pathname);
    return NextResponse.redirect(login);
  }

  if (isDashboard && session.role !== 'client') {
    return NextResponse.redirect(new URL('/lawyer-dashboard', request.url));
  }

  if (isLawyerDashboard && session.role !== 'lawyer') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  return response;
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/dashboard', '/dashboard/:path*', '/lawyer-dashboard', '/lawyer-dashboard/:path*'],
};
