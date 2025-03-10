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

  // Fetch owner's bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      properties (name),
      tenants (full_name, email)
    `)
    .eq('property_owner_id', session.user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Bookings</h1>
        <p className="text-muted-foreground">
          Manage your property bookings
        </p>
      </div>

      <div className="bg-card rounded-lg shadow-sm">
        <RecentBookings bookings={bookings || []} />
      </div>
    </div>
  );
} 