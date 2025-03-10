import { config } from 'dotenv';
import { resolve } from 'path';
import Stripe from 'stripe';
import { SUBSCRIPTION_PLANS } from '../lib/stripe/types';

// Load environment variables from .env.local first
config({ path: resolve(process.cwd(), '.env.local') });

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY in .env.local');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

async function setupStripePrices() {
  try {
    // Create the Pro plan price
    const proPlan = SUBSCRIPTION_PLANS.find(plan => plan.id === 'pro');
    if (!proPlan) {
      throw new Error('Pro plan not found in SUBSCRIPTION_PLANS');
    }

    const price = await stripe.prices.create({
      currency: 'usd',
      unit_amount: Math.round(proPlan.price * 100), // Convert to cents
      recurring: {
        interval: proPlan.interval,
      },
      product_data: {
        name: `${proPlan.name} Plan`,
      },
    });

    console.log('Successfully created Stripe price:', price.id);
    console.log('Add this to your .env file:');
    console.log(`STRIPE_PRO_PRICE_ID=${price.id}`);
  } catch (error) {
    console.error('Error setting up Stripe prices:', error);
    process.exit(1);
  }
}

setupStripePrices(); 