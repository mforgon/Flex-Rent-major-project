import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PATCH(
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
    const {
      name,
      description,
      address,
      daily_rate,
      weekly_rate,
      monthly_rate,
      status,
      amenities,
    } = body;

    // Check if the user is the owner of the property
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('owner_id')
      .eq('id', params.id)
      .single();

    if (propertyError) {
      console.error('Error fetching property:', propertyError);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    if (property.owner_id !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { data: updatedProperty, error: updateError } = await supabase
      .from('properties')
      .update({
        name,
        description,
        address,
        daily_rate,
        weekly_rate,
        monthly_rate,
        status,
        amenities,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating property:', updateError);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    return NextResponse.json(updatedProperty);
  } catch (error) {
    console.error('Error in property route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 