import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If there's no session and the user is trying to access a protected route
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // If there's a session and the user is trying to access auth pages
  if (session && (request.nextUrl.pathname.startsWith('/sign-in') || request.nextUrl.pathname.startsWith('/sign-up'))) {
    const role = session.user.user_metadata.role;
    return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
  }

  // Handle role-based access to dashboard routes
  if (session && request.nextUrl.pathname.startsWith('/dashboard')) {
    const role = session.user.user_metadata.role;
    const path = request.nextUrl.pathname;

    // Redirect owner trying to access tenant routes
    if (role === 'owner' && path.startsWith('/dashboard/tenant')) {
      return NextResponse.redirect(new URL('/dashboard/owner', request.url));
    }

    // Redirect tenant trying to access owner routes
    if (role === 'tenant' && path.startsWith('/dashboard/owner')) {
      return NextResponse.redirect(new URL('/dashboard/tenant', request.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/sign-in', '/sign-up'],
}; 