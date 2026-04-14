import { NextRequest, NextResponse } from 'next/server';

const PROTECTED = ['/dashboard', '/transactions', '/accounts', '/import', '/profile'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Middleware runs on the edge — it cannot access sessionStorage.
  // The Zustand auth store writes a cookie ('finlysis_auth=1') whenever
  // setTokens() is called, and clears it on clearAuth(). We read that here.
  const authCookie = req.cookies.get('finlysis_auth');
  if (!authCookie?.value) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/transactions/:path*',
    '/accounts/:path*',
    '/import/:path*',
    '/profile/:path*',
  ],
};
