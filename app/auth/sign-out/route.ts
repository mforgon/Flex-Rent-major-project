import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const supabase = createRouteHandlerClient({ cookies });

  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.redirect(
      `${requestUrl.origin}/sign-in?error=${error.message}`
    );
  }

  return NextResponse.redirect(requestUrl.origin);
} 