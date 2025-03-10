import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/header';
import { BookingHistory } from '@/components/dashboard/booking-history';
import { PaymentHistory } from '@/components/dashboard/payment-history';
import { UpcomingStays } from '@/components/dashboard/upcoming-stays';

export default async function TenantDashboard() {
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
      properties (name, address, images)
    `)
    .eq('tenant_id', session.user.id)
    .order('created_at', { ascending: false });

  // Fetch tenant's payments
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('tenant_id', session.user.id)
    .order('created_at', { ascending: false });

  // Fetch upcoming stays
  const { data: upcomingStays } = await supabase
    .from('bookings')
    .select(`
      *,
      properties (name, address, images)
    `)
    .eq('tenant_id', session.user.id)
    .gte('check_in_date', new Date().toISOString())
    .order('check_in_date', { ascending: true });

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader 
        title="Tenant Dashboard"
        subtitle="Manage your bookings and payments"
        user={session.user}
      />

      <div className="grid gap-6 mt-8">
        {/* Upcoming Stays */}
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Upcoming Stays</h2>
          <UpcomingStays stays={upcomingStays || []} />
        </div>

        {/* Booking History */}
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Booking History</h2>
          <BookingHistory bookings={bookings || []} />
        </div>

        {/* Payment History */}
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Payment History</h2>
          <PaymentHistory payments={payments || []} />
        </div>
      </div>
    </div>
  );
} 