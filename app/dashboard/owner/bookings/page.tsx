import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { RecentBookings } from '@/components/dashboard/recent-bookings';

export default async function BookingsPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/sign-in');
  }

  // First get all properties owned by this user
  const { data: properties } = await supabase
    .from('properties')
    .select('id')
    .eq('owner_id', session.user.id);

  if (!properties?.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-muted-foreground">
            You don't have any properties listed yet.
          </p>
        </div>
      </div>
    );
  }

  // Then fetch bookings for all properties owned by this user
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      properties (
        id,
        name,
        daily_rate,
        weekly_rate,
        monthly_rate
      ),
      profiles:user_id (
        full_name,
        email
      )
    `)
    .in('property_id', properties.map(p => p.id))
    .order('created_at', { ascending: false });

  // Transform the data to match the expected format
  const transformedBookings = bookings?.map(booking => ({
    ...booking,
    tenants: {
      full_name: booking.profiles.full_name,
      email: booking.profiles.email
    }
  })) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Bookings</h1>
        <p className="text-muted-foreground">
          Manage your property bookings
        </p>
      </div>

      <div className="bg-card rounded-lg shadow-sm">
        <RecentBookings 
          bookings={transformedBookings} 
          isOwner={true}
        />
      </div>
    </div>
  );
} 