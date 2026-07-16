import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  // Better-Auth sets a session token cookie. 
  // We check for both secure and non-secure variants depending on the environment.
  const sessionToken = 
    request.cookies.get('better-auth.session_token') || 
    request.cookies.get('__Secure-better-auth.session_token');

  const { pathname } = request.nextUrl;
  
  // Protect specific routes
  const isProtectedRoute = pathname.startsWith('/workouts') || pathname.startsWith('/exercises');

  if (isProtectedRoute && !sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Prevent logged-in users from accessing the login page
  if (pathname === '/login' && sessionToken) {
    return NextResponse.redirect(new URL('/workouts', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/workouts/:path*', '/exercises/:path*', '/login'],
};
