import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTE_ACCESS } from '@/shared/config/routeAccess';

function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect old localized auth URLs to clean ones
  if (pathname.includes('/auth/reset-password')) {
    const url = new URL('/reset-password', request.url);
    url.search = request.nextUrl.search;
    return NextResponse.redirect(url);
  }
  if (pathname.includes('/auth/confirm-email')) {
    const url = new URL('/confirm-email', request.url);
    url.search = request.nextUrl.search;
    return NextResponse.redirect(url);
  }
  
  // Retrieve the access token from secure HttpOnly cookies
  const accessToken = request.cookies.get('access_token')?.value;
  const decoded = accessToken ? decodeJwt(accessToken) : null;
  
  // Find matching route rule, sorting by specificity (longest path first)
  const matchedRoute = Object.keys(ROUTE_ACCESS)
    .sort((a, b) => b.length - a.length)
    .find((route) => {
      if (route === '/') return pathname === '/';
      return pathname === route || pathname.startsWith(route + '/');
    });
  
  const requiredRoles = matchedRoute ? ROUTE_ACCESS[matchedRoute] : [];
  
  // If the path is guarded (requires specific roles)
  if (requiredRoles.length > 0) {
    if (!decoded) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    const userRole = decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    const hasAccess = requiredRoles.includes(userRole);
    
    if (!hasAccess) {
      // Not authorized: redirect to root page
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  // If authenticated user tries to open login/register page, redirect to landing dashboard
  if (decoded && (pathname === '/login' || pathname === '/register')) {
    const userRole = decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    if (userRole === 'Admin' || userRole === 'Supervisor' || userRole === 'Supplier') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/marketer/products', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (BFF endpoints)
     * - _next/static (static content)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
