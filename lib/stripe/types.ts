import { Stripe } from 'stripe';

export interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

export interface CreateSubscriptionParams {
  customerId: string;
  priceId: string;
  metadata?: Record<string, string>;
}

export interface StripeWebhookEvent {
  type: Stripe.Event.Type;
  data: {
    object: Stripe.Event.Data.Object;
  };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: ['Up to 3 properties', 'Basic analytics'],
    stripePriceId: '', // Free plan doesn't need a Stripe price ID
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29.99,
    interval: 'month',
    features: [
      'Unlimited properties',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
    ],
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || '',
  },
]; 