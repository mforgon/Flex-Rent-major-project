import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        tenant:users(full_name, avatar_url)
      `)
      .eq('property_id', params.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error in reviews route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 