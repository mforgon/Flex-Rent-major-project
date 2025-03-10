import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/header';
import { PropertyStats } from '@/components/dashboard/property-stats';
import { RecentBookings } from '@/components/dashboard/recent-bookings';
import { EarningsChart } from '@/components/dashboard/earnings-chart';
import { PropertyList } from '@/components/dashboard/property-list';

export default async function OwnerDashboard() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/sign-in');
  }

  // Fetch owner's properties
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('owner_id', session.user.id);

  // Fetch recent bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      properties (name),
      tenants (full_name, email)
    `)
    .eq('property_owner_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch earnings data for the chart
  const { data: earnings } = await supabase
    .from('payments')
    .select('amount, created_at')
    .eq('owner_id', session.user.id)
    .order('created_at', { ascending: true });

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader 
        title="Owner Dashboard"
        subtitle="Manage your properties and track your earnings"
        user={session.user}
      />

      <div className="grid gap-6 mt-8">
        {/* Property Stats */}
        <PropertyStats properties={properties || []} />

        {/* Earnings Chart */}
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Earnings Overview</h2>
          <EarningsChart data={earnings || []} />
        </div>

        {/* Recent Bookings */}
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Recent Bookings</h2>
          <RecentBookings bookings={bookings || []} />
        </div>

        {/* Property List */}
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Your Properties</h2>
            <a href="/properties/new" className="btn btn-primary">
              Add New Property
            </a>
          </div>
          <PropertyList properties={properties || []} />
        </div>
      </div>
    </div>
  );
} 