import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UpgradeSubscriptionButtonProps {
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost';
  children?: React.ReactNode;
}

export function UpgradeSubscriptionButton({
  disabled,
  variant = 'default',
  children,
}: UpgradeSubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to start upgrade process. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleUpgrade}
      disabled={disabled || loading}
      variant={variant}
      className="w-full"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        children || 'Upgrade Plan'
      )}
    </Button>
  );
} 