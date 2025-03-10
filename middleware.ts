import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If user is not signed in and the current path is not / or /sign-in or /sign-up or /forgot-password,
  // redirect the user to /sign-in
  if (!session && !['/', '/sign-in', '/sign-up', '/forgot-password'].includes(req.nextUrl.pathname)) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/sign-in';
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is signed in and the current path is /sign-in or /sign-up or /forgot-password,
  // redirect the user to /
  if (session && ['/sign-in', '/sign-up', '/forgot-password'].includes(req.nextUrl.pathname)) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  // If user is signed in, check their role and redirect accordingly
  if (session) {
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (user) {
      // Redirect owners to their dashboard
      if (user.role === 'owner' && req.nextUrl.pathname === '/') {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/dashboard/properties';
        return NextResponse.redirect(redirectUrl);
      }

      // Redirect tenants to property listings
      if (user.role === 'tenant' && req.nextUrl.pathname === '/') {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/properties';
        return NextResponse.redirect(redirectUrl);
      }

      // Protect owner-only routes
      if (user.role === 'tenant' && req.nextUrl.pathname.startsWith('/dashboard/properties')) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/properties';
        return NextResponse.redirect(redirectUrl);
      }

      // Protect tenant-only routes
      if (user.role === 'owner' && req.nextUrl.pathname.startsWith('/bookings')) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/dashboard/properties';
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 