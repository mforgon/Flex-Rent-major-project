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

    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('property_id', params.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching expenses:', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error in expenses route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
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

    const body = await request.json();
    const { description, amount, date, category } = body;

    const { data: expense, error } = await supabase
      .from('expenses')
      .insert([
        {
          property_id: params.id,
          description,
          amount,
          date,
          category,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating expense:', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error in expenses route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 