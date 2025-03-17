import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Calendar, CreditCard, Plus, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/format';

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

  // Fetch active bookings
  const { data: activeBookings } = await supabase
    .from('bookings')
    .select(`
      *,
      properties!inner (
        name,
        owner_id
      )
    `)
    .eq('properties.owner_id', session.user.id)
    .eq('status', 'confirmed')
    .gte('end_date', new Date().toISOString());

  // Fetch recent payments
  const { data: recentPayments } = await supabase
    .from('payments')
    .select(`
      *,
      bookings!inner (
        properties!inner (
          name,
          owner_id
        )
      )
    `)
    .eq('bookings.properties.owner_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Calculate total earnings
  const { data: totalEarnings } = await supabase
    .from('payments')
    .select(`
      amount,
      bookings!inner (
        properties!inner (
          owner_id
        )
      )
    `)
    .eq('bookings.properties.owner_id', session.user.id)
    .eq('status', 'completed');

  const totalAmount = totalEarnings?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

  // Get subscription status
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader
        title="Owner Dashboard"
        subtitle="Manage your properties and view insights"
        user={session.user}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Properties
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {subscription?.plan === 'premium' ? 'Unlimited' : `${properties?.length || 0}/3`} properties
            </p>
            {subscription?.plan !== 'premium' && properties?.length === 3 && (
              <Button variant="outline" size="sm" className="mt-2" asChild>
                <Link href="/dashboard/owner/subscription">Upgrade Plan</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBookings?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Current and upcoming stays
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Payments
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentPayments?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between mt-8">
        <h2 className="text-lg font-semibold">Your Properties</h2>
        <Button asChild>
          <Link href="/properties/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {properties?.map((property) => (
          <Link key={property.id} href={`/properties/${property.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="aspect-video relative">
                <img
                  src={property.images[0] || '/placeholder-property.jpg'}
                  alt={property.name}
                  className="object-cover w-full h-full rounded-t-lg"
                />
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-1">{property.name}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {property.address}
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm">
                  <span>Daily: {formatCurrency(property.daily_rate)}</span>
                  <span>Monthly: {formatCurrency(property.monthly_rate)}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {properties?.length === 0 && (
          <Card className="col-span-full p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold">No Properties Yet</h3>
              <p className="text-muted-foreground mt-1">
                Add your first property to start earning
              </p>
              <Button className="mt-4" asChild>
                <Link href="/properties/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Property
                </Link>
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
} 