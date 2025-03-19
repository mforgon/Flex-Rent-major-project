import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  createSubscription,
  cancelSubscription,
  updateSubscription,
  getCustomerSubscriptions,
} from '@/lib/stripe/utils';
import type { CreateSubscriptionParams } from '@/lib/stripe/types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile to check if they already have a subscription
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, subscription_status')
      .eq('id', session.user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    // If user doesn't have a Stripe customer ID, create one
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: {
          user_id: session.user.id,
        },
      });
      customerId = customer.id;

      // Save Stripe customer ID to user profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', session.user.id);
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Create a Stripe Checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard/owner/subscription?success=true`,
      cancel_url: `${baseUrl}/dashboard/owner/subscription?success=false`,
      metadata: {
        user_id: session.user.id,
      },
    });

    if (!checkoutSession.url) {
      throw new Error('Failed to create checkout session');
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the user's subscription from the database
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (subscriptionError) {
      console.error('Error fetching subscription:', subscriptionError);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    if (!subscription) {
      return new NextResponse('No active subscription found', { status: 404 });
    }

    // Cancel the subscription at the end of the current period
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    // Update the subscription in the database
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ cancel_at_period_end: true })
      .eq('id', subscription.id);

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in subscriptions route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { subscriptionId, priceId } = body;

    if (!subscriptionId || !priceId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const subscription = await updateSubscription(subscriptionId, priceId);
    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    return new NextResponse(
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the user's subscription from the database
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (subscriptionError) {
      console.error('Error fetching subscription:', subscriptionError);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error in subscriptions route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 