import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface RentPropertyButtonProps {
  propertyId: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  disabled?: boolean;
}

export function RentPropertyButton({
  propertyId,
  startDate,
  endDate,
  totalAmount,
  disabled,
}: RentPropertyButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRentProperty = async () => {
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
        throw new Error('Failed to create payment');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to process rental payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleRentProperty}
      disabled={disabled || loading}
      className="w-full"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        'Rent Property'
      )}
    </Button>
  );
} 