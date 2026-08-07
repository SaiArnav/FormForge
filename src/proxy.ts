import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'formforge_super_secret_jwt_key_2026_stitch_synapse'
);

const COOKIE_NAME = 'formforge_admin_token';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes except /admin/login and /admin/register
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login') && !pathname.startsWith('/admin/register')) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (err) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already logged in and trying to go to /admin/login, redirect to /admin/dashboard
  if (pathname === '/admin/login') {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } catch {
        // Invalid token, allow access to login
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
