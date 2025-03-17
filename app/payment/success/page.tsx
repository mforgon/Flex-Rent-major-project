'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const updateBookingStatus = async () => {
      const bookingId = searchParams.get('booking_id');
      
      if (bookingId) {
        try {
          const { error } = await supabase
            .from('bookings')
            .update({ 
              status: 'confirmed',
              payment_status: 'paid'
            })
            .eq('id', bookingId);

          if (error) throw error;

          toast({
            title: 'Booking Confirmed',
            description: 'Your payment was successful and your booking has been confirmed.',
          });
        } catch (error) {
          console.error('Error updating booking status:', error);
          toast({
            title: 'Error',
            description: 'There was a problem confirming your booking. Please contact support.',
            variant: 'destructive',
          });
        }
      }
    };

    updateBookingStatus();
  }, [searchParams, supabase, toast]);

  const handleReturnClick = () => {
    router.push('/dashboard/tenant/bookings');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-24 w-24 text-green-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Payment Successful!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your booking has been confirmed and you will receive a confirmation email shortly.
          </p>
        </div>
        <div className="mt-8">
          <Button
            onClick={handleReturnClick}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            View My Bookings
          </Button>
        </div>
      </div>
    </div>
  );
} 