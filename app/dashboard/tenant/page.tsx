import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/header';
import { BookingHistory } from '@/components/dashboard/booking-history';
import { PaymentHistory } from '@/components/dashboard/payment-history';
import { UpcomingStays } from '@/components/dashboard/upcoming-stays';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Calendar, CreditCard, Search } from 'lucide-react';
import Link from 'next/link';

export default async function TenantDashboard() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/sign-in');
  }

  // Fetch tenant's active bookings
  const { data: activeBookings } = await supabase
    .from('bookings')
    .select(`
      *,
      properties (
        name,
        address,
        images,
        daily_rate,
        weekly_rate,
        monthly_rate
      )
    `)
    .eq('tenant_id', session.user.id)
    .eq('status', 'confirmed')
    .gte('end_date', new Date().toISOString())
    .order('start_date', { ascending: true });

  // Fetch tenant's payment history
  const { data: recentPayments } = await supabase
    .from('payments')
    .select(`
      *,
      bookings (
        properties (name)
      )
    `)
    .eq('tenant_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch tenant's favorite properties
  const { data: favoriteProperties } = await supabase
    .from('favorite_properties')
    .select(`
      properties (
        id,
        name,
        address,
        images,
        daily_rate,
        weekly_rate,
        monthly_rate
      )
    `)
    .eq('tenant_id', session.user.id)
    .limit(3);

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader
        title="Welcome back"
        subtitle="Manage your bookings and explore properties"
        user={session.user}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <Link href="/properties">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Find Properties
              </CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Browse</div>
              <p className="text-xs text-muted-foreground">
                Explore available properties
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/tenant/bookings">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Active Bookings
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeBookings?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Current and upcoming stays
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/tenant/payments">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Recent Payments
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recentPayments?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Payment history
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/tenant/favorites">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Saved Properties
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {favoriteProperties?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Your favorite listings
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Stays</CardTitle>
              <Button variant="outline" asChild>
                <Link href="/dashboard/tenant/bookings">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <UpcomingStays bookings={activeBookings || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Payments</CardTitle>
              <Button variant="outline" asChild>
                <Link href="/dashboard/tenant/payments">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <PaymentHistory payments={recentPayments || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 