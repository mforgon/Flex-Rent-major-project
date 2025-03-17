'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

interface PaymentFormProps {
  propertyId: string;
  durationType: string;
  amount: number;
}

export function PaymentForm({ propertyId, durationType, amount }: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!stripe || !elements) {
      const error = 'Stripe has not been initialized';
      console.error(error);
      setErrorMessage(error);
      return;
    }

    if (!startDate || !endDate) {
      setErrorMessage('Please select both check-in and check-out dates');
      return;
    }

    if (startDate >= endDate) {
      setErrorMessage('Check-out date must be after check-in date');
      return;
    }

    if (startDate < new Date()) {
      setErrorMessage('Check-in date cannot be in the past');
      return;
    }

    setIsLoading(true);

    try {
      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw new Error(`Authentication error: ${authError.message}`);
      }

      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Creating booking record...', {
        property_id: propertyId,
        tenant_id: user.id,
        duration: durationType,
        total_amount: amount,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'pending',
      });

      // Create booking record
      const { data: bookingData, error: bookingError } = await supabase.from('bookings').insert({
        property_id: propertyId,
        tenant_id: user.id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        duration: durationType,
        status: 'pending',
        total_amount: amount,
        payment_status: 'pending'
      }).select().single();

      if (bookingError) {
        console.error('Booking error:', bookingError);
        throw new Error(`Failed to create booking: ${bookingError.message}`);
      }

      if (!bookingData) {
        throw new Error('Failed to create booking: No booking data returned');
      }

      console.log('Processing payment...');

      // Get the payment element
      const paymentElement = elements.getElement('payment');
      if (!paymentElement) {
        throw new Error('Payment element not found');
      }

      // Confirm the payment with Stripe
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?booking_id=${bookingData.id}`,
          payment_method_data: {
            billing_details: {
              email: user.email,
            },
          },
        },
      });

      // If we get here, it means there was an immediate error (like card validation)
      // For successful payments, Stripe will redirect to return_url
      if (stripeError) {
        // If payment fails, update booking status to cancelled
        await supabase
          .from('bookings')
          .update({ status: 'cancelled', payment_status: 'failed' })
          .eq('id', bookingData.id);

        console.error('Stripe payment error:', stripeError);
        throw new Error(`Payment failed: ${stripeError.message}`);
      }

    } catch (error) {
      console.error('Payment process error:', error);
      let message = 'An unexpected error occurred during payment';
      
      if (error instanceof Error) {
        message = error.message;
      }
      
      setErrorMessage(message);
      toast({
        title: 'Payment Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Check-in Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !startDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Check-out Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !endDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                disabled={(date) => date <= (startDate || new Date())}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <PaymentElement />
      
      {errorMessage && (
        <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md mt-4">
          {errorMessage}
        </div>
      )}
      
      <Button
        type="submit"
        disabled={isLoading || !stripe || !elements || !startDate || !endDate}
        className="w-full"
      >
        {isLoading ? 'Processing...' : `Pay $${amount}`}
      </Button>
    </form>
  );
} 