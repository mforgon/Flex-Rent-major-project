import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/sign-in", "/sign-up"];
const OWNER_ROUTES = ["/dashboard/properties", "/dashboard/analytics"];
const TENANT_ROUTES = ["/dashboard/rentals", "/dashboard/payments"];

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = request.nextUrl.pathname;

  // Allow public routes
  if (PUBLIC_ROUTES.includes(path)) {
    return res;
  }

  // Check if user is authenticated
  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const userRole = session.user.user_metadata.role;

  // Check role-based access
  if (
    (userRole === "owner" && TENANT_ROUTES.includes(path)) ||
    (userRole === "tenant" && OWNER_ROUTES.includes(path))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}; 