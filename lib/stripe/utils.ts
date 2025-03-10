import { stripe } from './client';
import type { CreatePaymentIntentParams, CreateSubscriptionParams } from './types';

export async function createPaymentIntent({
  amount,
  currency,
  customerId,
  metadata,
}: CreatePaymentIntentParams) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    customer: customerId,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return paymentIntent;
}

export async function createSubscription({
  customerId,
  priceId,
  metadata,
}: CreateSubscriptionParams) {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    metadata,
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
  });

  return subscription;
}

export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId);
}

export async function updateSubscription(subscriptionId: string, priceId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: priceId,
      },
    ],
  });
}

export async function getCustomerSubscriptions(customerId: string) {
  return await stripe.subscriptions.list({
    customer: customerId,
    expand: ['data.default_payment_method'],
  });
}

export async function createCustomer(email: string, metadata?: Record<string, string>) {
  return await stripe.customers.create({
    email,
    metadata,
  });
} 