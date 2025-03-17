import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new NextResponse('Webhook signature verification failed', { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Handle subscription payment
        if (session.mode === 'subscription') {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          
          await supabase
            .from('subscriptions')
            .upsert({
              user_id: session.metadata?.user_id || session.client_reference_id,
              stripe_subscription_id: subscription.id,
              stripe_customer_id: subscription.customer as string,
              stripe_price_id: subscription.items.data[0].price.id,
              status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000),
              cancel_at_period_end: subscription.cancel_at_period_end,
              is_premium: true,
            });

          // Update user's premium status
          await supabase
            .from('users')
            .update({ is_premium: true })
            .eq('id', session.metadata?.user_id || session.client_reference_id);
        }
        // Handle one-time payment for property rental
        else if (session.mode === 'payment') {
          await supabase
            .from('rental_payments')
            .insert({
              property_id: session.metadata?.propertyId,
              user_id: session.metadata?.userId,
              amount: session.amount_total! / 100,
              status: 'completed',
              start_date: session.metadata?.startDate,
              end_date: session.metadata?.endDate,
              stripe_payment_id: session.payment_intent as string,
            });

          // Update property status to rented
          await supabase
            .from('properties')
            .update({ status: 'rented' })
            .eq('id', session.metadata?.propertyId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Update subscription status
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000),
            cancel_at_period_end: subscription.cancel_at_period_end,
            is_premium: false,
          })
          .eq('stripe_subscription_id', subscription.id);

        // Update user's premium status
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (sub) {
          await supabase
            .from('users')
            .update({ is_premium: false })
            .eq('id', sub.user_id);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await supabase
          .from('subscriptions')
          .upsert({
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000),
            cancel_at_period_end: subscription.cancel_at_period_end,
            is_premium: subscription.status === 'active',
          });
        break;
      }
    }

    return new NextResponse('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Webhook error', { status: 500 });
  }
} 