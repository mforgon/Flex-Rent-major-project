'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SubscriptionPlansProps {
  isPremium: boolean;
}

export function SubscriptionPlans({ isPremium }: SubscriptionPlansProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleUpgrade = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to start upgrade process. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/subscriptions', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      toast.success('Your subscription has been cancelled. You will have access until the end of your billing period.');
      setShowCancelDialog(false);
      // Refresh the page to update the UI
      window.location.reload();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to cancel subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
        {/* Free Plan */}
        <Card className={!isPremium ? 'border-primary' : undefined}>
          <CardHeader>
            <CardTitle>Free Plan</CardTitle>
            <CardDescription>Perfect for getting started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Manage up to 3 properties</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Basic analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Standard support</span>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-2xl font-bold">$0</p>
              <p className="text-muted-foreground">Forever free</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant="outline"
              disabled
            >
              {isPremium ? 'Switch to Free' : 'Current Plan'}
            </Button>
          </CardFooter>
        </Card>

        {/* Premium Plan */}
        <Card className={isPremium ? 'border-primary' : undefined}>
          <CardHeader>
            <CardTitle>Premium Plan</CardTitle>
            <CardDescription>For growing businesses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Unlimited properties</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Advanced analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Priority support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Custom reports</span>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-2xl font-bold">$29</p>
              <p className="text-muted-foreground">per month</p>
            </div>
          </CardContent>
          <CardFooter>
            {isPremium ? (
              <Button 
                className="w-full" 
                variant="destructive"
                onClick={() => setShowCancelDialog(true)}
                disabled={isLoading}
              >
                Cancel Subscription
              </Button>
            ) : (
              <Button 
                className="w-full" 
                onClick={handleUpgrade}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Upgrade Now'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Cancellation Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Premium Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your Premium subscription? You will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Lose access to unlimited properties</li>
                <li>Be limited to 3 properties on the Free plan</li>
                <li>Lose access to advanced analytics and reports</li>
                <li>Still have access until the end of your current billing period</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setShowCancelDialog(false)}
              disabled={isLoading}
            >
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {isLoading ? 'Cancelling...' : 'Yes, Cancel Subscription'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 