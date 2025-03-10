import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { BookingHistory } from '@/components/dashboard/booking-history';

export default async function TenantBookingsPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/sign-in');
  }

  // Fetch tenant's bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      properties (name, address)
    `)
    .eq('tenant_id', session.user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground">
          View your booking history
        </p>
      </div>

      <div className="bg-card rounded-lg shadow-sm">
        <BookingHistory bookings={bookings || []} />
      </div>
    </div>
  );
} 