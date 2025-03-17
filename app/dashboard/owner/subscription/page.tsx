import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    features: [
      'Up to 3 properties',
      'Basic analytics',
      'Standard support',
      'Basic booking management',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Best for professional property owners',
    price: 29.99,
    features: [
      'Unlimited properties',
      'Advanced analytics',
      'Priority support',
      'Advanced booking management',
      'Custom branding',
      'API access',
      'Tenant screening',
      'Automated payments',
    ],
  },
];

export default async function SubscriptionPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/sign-in');
  }

  // Get current subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  // Get property count
  const { count } = await supabase
    .from('properties')
    .select('*', { count: true })
    .eq('owner_id', session.user.id);

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <p className="text-muted-foreground mt-2">
          Choose the plan that best fits your needs
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrentPlan = subscription?.plan_id === plan.id;
          const needsUpgrade = plan.id === 'premium' && count && count > 3;

          return (
            <Card
              key={plan.id}
              className={`relative ${
                isCurrentPlan ? 'border-primary shadow-lg' : ''
              }`}
            >
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Current Plan
                  </span>
                </div>
              )}

              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">
                    {formatCurrency(plan.price)}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  {isCurrentPlan ? (
                    <Button className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : plan.id === 'premium' ? (
                    <form action="/api/create-subscription" method="POST">
                      <input type="hidden" name="plan" value={plan.id} />
                      <Button
                        type="submit"
                        className="w-full"
                        variant={needsUpgrade ? 'destructive' : 'default'}
                      >
                        {needsUpgrade
                          ? 'Upgrade Required'
                          : `Upgrade to ${plan.name}`}
                      </Button>
                    </form>
                  ) : (
                    <form action="/api/downgrade-subscription" method="POST">
                      <Button type="submit" variant="outline" className="w-full">
                        Downgrade to Free
                      </Button>
                    </form>
                  )}
                </div>

                {needsUpgrade && plan.id === 'free' && (
                  <p className="mt-2 text-sm text-destructive text-center">
                    You have {count} properties. Upgrade to Premium to manage more
                    than 3 properties.
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Subscription FAQs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">What happens when I upgrade?</h3>
              <p className="text-muted-foreground">
                You'll immediately get access to all Premium features. Your card
                will be charged monthly on the date you upgrade.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Can I cancel anytime?</h3>
              <p className="text-muted-foreground">
                Yes, you can cancel your subscription at any time. You'll continue
                to have access to Premium features until the end of your billing
                period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards and debit cards.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 