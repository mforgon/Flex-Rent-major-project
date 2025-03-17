import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ProceedToBookingButtonProps {
  propertyId: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  disabled?: boolean;
}

export function ProceedToBookingButton({
  propertyId,
  startDate,
  endDate,
  totalAmount,
  disabled,
}: ProceedToBookingButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleProceedToBooking = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/create-rental-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId,
          startDate,
          endDate,
          totalAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Failed to create payment session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to process booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleProceedToBooking}
      disabled={disabled || loading}
      className="w-full"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        'Proceed to Booking'
      )}
    </Button>
  );
} 