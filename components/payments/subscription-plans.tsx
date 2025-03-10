'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  stripe_price_id: string;
}

const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for property owners just getting started',
    price: 9.99,
    features: [
      'Up to 3 properties',
      'Basic analytics',
      'Email support',
      'Standard booking management',
    ],
    stripe_price_id: 'price_basic',
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'Ideal for growing property management businesses',
    price: 29.99,
    features: [
      'Up to 10 properties',
      'Advanced analytics',
      'Priority support',
      'Advanced booking management',
      'Expense tracking',
      'Tenant screening',
    ],
    stripe_price_id: 'price_pro',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large-scale property management operations',
    price: 99.99,
    features: [
      'Unlimited properties',
      'Custom analytics',
      '24/7 support',
      'Full booking management',
      'Advanced expense tracking',
      'Tenant screening',
      'API access',
      'Custom integrations',
    ],
    stripe_price_id: 'price_enterprise',
  },
];

export function SubscriptionPlans() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubscribe(planId: string) {
    setLoading(true);
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating subscription:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {PLANS.map((plan) => (
        <Card
          key={plan.id}
          className={`relative ${
            selectedPlan === plan.id ? 'border-primary shadow-lg' : ''
          }`}
        >
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">${plan.price}</span>
              <span className="text-gray-500">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Subscribe'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 