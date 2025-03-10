import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new NextResponse('Webhook signature verification failed', { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get the user ID from the customer metadata
        const customer = await stripe.customers.retrieve(customerId);
        const userId = customer.metadata.user_id;

        // Update the subscription in the database
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: customerId,
            stripe_price_id: subscription.items.data[0].price.id,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          });

        if (subscriptionError) {
          console.error('Error updating subscription:', subscriptionError);
          return new NextResponse('Internal Server Error', { status: 500 });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get the user ID from the customer metadata
        const customer = await stripe.customers.retrieve(customerId);
        const userId = customer.metadata.user_id;

        // Delete the subscription from the database
        const { error: deleteError } = await supabase
          .from('subscriptions')
          .delete()
          .eq('user_id', userId);

        if (deleteError) {
          console.error('Error deleting subscription:', deleteError);
          return new NextResponse('Internal Server Error', { status: 500 });
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { property_id, start_date, end_date, duration } = paymentIntent.metadata;

        // Update the rental record in the database
        const { error: rentalError } = await supabase
          .from('rentals')
          .update({
            is_paid: true,
            stripe_payment_intent_id: paymentIntent.id,
          })
          .eq('property_id', property_id)
          .eq('start_date', start_date)
          .eq('end_date', end_date)
          .eq('duration', duration);

        if (rentalError) {
          console.error('Error updating rental:', rentalError);
          return new NextResponse('Internal Server Error', { status: 500 });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { property_id, start_date, end_date, duration } = paymentIntent.metadata;

        // Update the rental record in the database
        const { error: rentalError } = await supabase
          .from('rentals')
          .update({
            is_paid: false,
            stripe_payment_intent_id: paymentIntent.id,
          })
          .eq('property_id', property_id)
          .eq('start_date', start_date)
          .eq('end_date', end_date)
          .eq('duration', duration);

        if (rentalError) {
          console.error('Error updating rental:', rentalError);
          return new NextResponse('Internal Server Error', { status: 500 });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error in webhook handler:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 