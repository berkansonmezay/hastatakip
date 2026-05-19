import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';

// Public routes that don't require authentication
const publicRoutes = ['/login'];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);
  
  // Allow system files, static files, and API routes to bypass
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.includes('.') ||
    path === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Decrypt the session from the cookie
  const cookie = request.cookies.get('session')?.value;
  const session = cookie ? decrypt(cookie) : null;

  // Check if session is expired
  const isExpired = session ? new Date(session.expiresAt) < new Date() : true;

  // Redirect to /login if not authenticated and trying to access a protected route
  if (!isPublicRoute && (!session || isExpired)) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  // Redirect to / (dashboard) if authenticated and trying to access /login
  if (isPublicRoute && session && !isExpired) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

  // Pass the current pathname to downstream Server Components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', path);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Run the proxy on all paths except static files, API routes, and common image formats
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
