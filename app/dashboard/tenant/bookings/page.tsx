'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/components/ui/use-toast';
import { BookingHistory } from '@/components/dashboard/booking-history';

interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  total_amount: number;
  properties: {
    name: string;
    address: string;
  };
}

export default function BookingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Bookings</h1>
      <BookingHistoryContainer />
    </div>
  );
}

function BookingHistoryContainer() {
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('Not authenticated');
        }

        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            properties (
              name,
              address
            )
          `)
          .eq('tenant_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBookings(data || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your bookings.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [supabase, toast]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <BookingHistory bookings={bookings} />;
} 