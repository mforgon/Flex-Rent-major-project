'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface Booking {
  id: string;
  property_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  duration: 'daily' | 'weekly' | 'monthly';
  total_amount: number;
  is_paid: boolean;
  stripe_payment_intent_id?: string;
  created_at: string;
  tenant: {
    full_name: string;
    email: string;
    phone_number?: string;
  };
}

export function PropertyBookings({ propertyId }: { propertyId: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    loadBookings();
  }, [propertyId]);

  async function loadBookings() {
    try {
      const response = await fetch(`/api/properties/${propertyId}/bookings`);
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings
              .filter(booking => new Date(booking.start_date) >= new Date())
              .map(booking => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{booking.tenant.full_name}</h3>
                    <p className="text-sm text-gray-500">
                      {format(new Date(booking.start_date), 'MMM d, yyyy')} -{' '}
                      {format(new Date(booking.end_date), 'MMM d, yyyy')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {booking.duration.charAt(0).toUpperCase() + booking.duration.slice(1)} stay
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${booking.total_amount}</p>
                    <Badge variant={booking.is_paid ? 'default' : 'destructive'}>
                      {booking.is_paid ? 'Paid' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              ))}
            {bookings.filter(booking => new Date(booking.start_date) >= new Date()).length === 0 && (
              <p className="text-center text-gray-500">No upcoming bookings</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Booking Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>
    </div>
  );
} 