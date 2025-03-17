import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return handleSignOut(request);
}

export async function GET(request: Request) {
  return handleSignOut(request);
}

async function handleSignOut(request: Request) {
  const requestUrl = new URL(request.url);
  const supabase = createRouteHandlerClient({ cookies });

  // Sign out from Supabase
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error);
    return NextResponse.redirect(
      `${requestUrl.origin}/sign-in?error=${error.message}`,
      { status: 303 }
    );
  }

  // Clear cookies and redirect to home page
  const response = NextResponse.redirect(new URL('/', requestUrl.origin), {
    status: 303
  });
  
  // Clear all Supabase-related cookies
  const cookieStore = cookies();
  for (const cookie of cookieStore.getAll()) {
    if (cookie.name.startsWith('sb-')) {
      response.cookies.delete(cookie.name);
    }
  }

  return response;
} 