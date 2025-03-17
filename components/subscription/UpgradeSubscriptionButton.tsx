import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface UpgradeSubscriptionButtonProps {
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'secondary';
  children?: React.ReactNode;
}

export function UpgradeSubscriptionButton({
  disabled,
  variant = 'default',
  children,
}: UpgradeSubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = () => {
    setLoading(true);
    // Redirect to your Stripe payment link
    window.location.href = 'https://buy.stripe.com/test_6oE9DgezPgOl9LG8ww';
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