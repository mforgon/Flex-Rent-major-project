'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { SubscriptionPlans } from '@/components/payments/subscription-plans';

interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  stripe_price_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadSubscription();
    }
  }, [user?.id]);

  async function loadSubscription() {
    try {
      const response = await fetch('/api/subscriptions');
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelSubscription() {
    if (!subscription) return;

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'DELETE',
      });

      if (response.ok) {
        loadSubscription();
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Subscription</h1>
        <p className="text-gray-600">Manage your subscription and billing</p>
      </div>

      {subscription ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>
                  {subscription.stripe_price_id === 'price_basic'
                    ? 'Basic Plan'
                    : subscription.stripe_price_id === 'price_pro'
                    ? 'Professional Plan'
                    : 'Enterprise Plan'}
                </CardDescription>
              </div>
              <Badge variant={
                subscription.status === 'active' ? 'default' :
                subscription.status === 'past_due' ? 'destructive' :
                'secondary'
              }>
                {subscription.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Current Period:</span>
                <span className="font-medium">
                  {format(new Date(subscription.current_period_start), 'MMM d, yyyy')} -{' '}
                  {format(new Date(subscription.current_period_end), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Auto-renewal:</span>
                <span className="font-medium">
                  {subscription.cancel_at_period_end ? 'Off' : 'On'}
                </span>
              </div>
            </div>

            {subscription.cancel_at_period_end ? (
              <div className="mt-6">
                <p className="text-sm text-gray-500">
                  Your subscription will be canceled at the end of the current period.
                </p>
              </div>
            ) : (
              <div className="mt-6">
                <Button
                  variant="destructive"
                  onClick={handleCancelSubscription}
                >
                  Cancel Subscription
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Choose a Plan</CardTitle>
              <CardDescription>
                Select the plan that best fits your needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubscriptionPlans />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 