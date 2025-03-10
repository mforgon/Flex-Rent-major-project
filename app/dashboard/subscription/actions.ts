'use server';

import { createClient } from "@/lib/supabase/server";
import { SUBSCRIPTION_PLANS } from "@/lib/stripe/types";
import { createCustomer, createSubscription, cancelSubscription as cancelStripeSubscription } from "@/lib/stripe/utils";
import { revalidatePath } from "next/cache";

export async function subscribeToPlan(planId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
  if (!plan) {
    throw new Error('Invalid plan');
  }

  // If it's the free plan, just update the database
  if (planId === 'free') {
    await supabase
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        plan_id: 'free',
        status: 'active',
      });
    revalidatePath('/dashboard/subscription');
    return;
  }

  // Get or create Stripe customer
  const { data: customer } = await supabase
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  let stripeCustomerId = customer?.stripe_customer_id;

  if (!stripeCustomerId) {
    const stripeCustomer = await createCustomer(user.email!);
    stripeCustomerId = stripeCustomer.id;

    await supabase
      .from('stripe_customers')
      .insert({
        user_id: user.id,
        stripe_customer_id: stripeCustomerId,
      });
  }

  // Create subscription
  const subscription = await createSubscription({
    customerId: stripeCustomerId,
    priceId: plan.stripePriceId,
    metadata: {
      userId: user.id,
      planId: plan.id,
    },
  });

  // Update database
  await supabase
    .from('subscriptions')
    .upsert({
      user_id: user.id,
      plan_id: plan.id,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    });

  revalidatePath('/dashboard/subscription');
  return subscription;
}

export async function cancelSubscription() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id')
    .eq('user_id', user.id)
    .single();

  if (!subscription?.stripe_subscription_id) {
    throw new Error('No active subscription found');
  }

  // Cancel subscription in Stripe
  await cancelStripeSubscription(subscription.stripe_subscription_id);

  // Update database
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      plan_id: 'free',
    })
    .eq('user_id', user.id);

  revalidatePath('/dashboard/subscription');
} 