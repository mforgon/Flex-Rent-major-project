import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't need authentication
const publicRoutes = ['/sign-in', '/sign-up', '/', '/about', '/contact', '/properties'];

// Define role-specific routes
const roleSpecificRoutes = {
  owner: ['/dashboard/owner'],
  tenant: ['/dashboard/tenant'],
};

export async function middleware(request: NextRequest) {
  // Create a response object that we'll return eventually
  const res = NextResponse.next();
  
  // Create the Supabase middleware client
  const supabase = createMiddlewareClient({ req: request, res });

  // Get the user's session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = request.nextUrl.pathname;
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => path === route || path.startsWith(`${route}/`));
  
  // If there's no session and the user is trying to access a protected route
  if (!session && path.startsWith('/dashboard')) {
    const redirectUrl = new URL('/sign-in', request.url);
    // Add the original URL as a query parameter to redirect after login
    redirectUrl.searchParams.set('redirectTo', path);
    return NextResponse.redirect(redirectUrl);
  }

  // If there's a session and the user is trying to access auth pages
  if (session && (path.startsWith('/sign-in') || path.startsWith('/sign-up'))) {
    const role = session.user.user_metadata.role || 'tenant'; // Default to tenant if role not set
    return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
  }

  // Handle role-based access to dashboard routes
  if (session && path.startsWith('/dashboard')) {
    const role = session.user.user_metadata.role || 'tenant'; // Default to tenant if role not set
    
    // Check if user is trying to access a route not meant for their role
    const otherRoleRoutes = Object.entries(roleSpecificRoutes)
      .filter(([r]) => r !== role)
      .flatMap(([, routes]) => routes);
      
    const isAccessingOtherRoleRoute = otherRoleRoutes.some(route => 
      path === route || path.startsWith(`${route}/`)
    );
    
    if (isAccessingOtherRoleRoute) {
      // Redirect to the appropriate dashboard for their role
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    // Match all dashboard routes
    '/dashboard/:path*',
    // Match auth routes
    '/sign-in',
    '/sign-up',
    // Match API auth routes
    '/api/auth/:path*',
  ],
}; 