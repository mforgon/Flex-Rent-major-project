'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { toast } from 'sonner';

interface SubscriptionPlansProps {
  isPremium: boolean;
}

export function SubscriptionPlans({ isPremium }: SubscriptionPlansProps) {
  const [isLoading, setIsLoading] = useState(false);

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

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
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

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Free Plan */}
      <Card className={!isPremium ? 'border-primary' : undefined}>
        <CardHeader>
          <CardTitle>Free Plan</CardTitle>
          <CardDescription>Perfect for getting started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">$0</div>
          <p className="text-sm text-muted-foreground">Forever free</p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span>Manage up to 3 properties</span>
            </div>
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span>Basic analytics</span>
            </div>
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span>Standard support</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            disabled={!isPremium}
          >
            {!isPremium ? 'Current Plan' : 'Downgrade'}
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
          <div className="text-3xl font-bold">$29</div>
          <p className="text-sm text-muted-foreground">per month</p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span>Unlimited properties</span>
            </div>
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span>Advanced analytics</span>
            </div>
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span>Priority support</span>
            </div>
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-primary" />
              <span>Custom branding</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleUpgrade}
            disabled={isPremium || isLoading}
            className="w-full"
          >
            {isPremium ? 'Current Plan' : 'Upgrade Now'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 