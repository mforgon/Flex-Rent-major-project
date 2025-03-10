import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/format";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function BookingsPage() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/sign-in');
  }

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*, properties(*)')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bookings:', error);
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">My Bookings</h1>
        <p className="text-muted-foreground">Failed to load bookings.</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">My Bookings</h1>
      <div className="grid gap-4">
        {bookings?.map((booking) => (
          <Card key={booking.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{booking.properties.name}</CardTitle>
                <Badge
                  variant={
                    booking.status === 'confirmed'
                      ? 'default'
                      : booking.status === 'pending'
                      ? 'secondary'
                      : 'destructive'
                  }
                >
                  {booking.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Check-in:</span>
                  <span>{format(new Date(booking.start_date), "PPP")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Check-out:</span>
                  <span>{format(new Date(booking.end_date), "PPP")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="capitalize">{booking.duration}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Total Amount:</span>
                  <span>
                    {formatCurrency(
                      booking.properties[`${booking.duration}_rate`]
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {bookings?.length === 0 && (
          <p className="text-muted-foreground">No bookings found.</p>
        )}
      </div>
    </div>
  );
} 