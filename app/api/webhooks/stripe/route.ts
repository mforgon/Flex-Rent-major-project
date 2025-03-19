import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      console.error('No stripe signature found');
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Webhook signature verification failed:', errorMessage);
      return NextResponse.json(
        { error: `Webhook Error: ${errorMessage}` },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          
          if (session.mode === 'subscription') {
            // Update user's subscription status
            await supabase
              .from('profiles')
              .update({
                subscription_status: 'active',
                subscription_id: session.subscription as string,
                stripe_customer_id: session.customer as string,
                subscription_updated_at: new Date().toISOString(),
              })
              .eq('id', session.metadata?.user_id);

            console.log('Updated subscription status for user:', session.metadata?.user_id);

            // Record the subscription event
            await supabase
              .from('subscription_events')
              .insert({
                user_id: session.metadata?.user_id,
                event_type: 'subscription_created',
                subscription_id: session.subscription,
                stripe_event_id: event.id,
              });

            console.log('Recorded subscription event');
          } else if (session.mode === 'payment') {
            // Handle rental payment
            const bookingId = session.metadata?.booking_id;
            if (bookingId) {
              await supabase
                .from('bookings')
                .update({
                  payment_status: 'paid',
                  stripe_payment_id: session.payment_intent as string,
                })
                .eq('id', bookingId);
            }
          }
          break;
        }

        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          
          await supabase
            .from('profiles')
            .update({
              subscription_status: subscription.status,
              subscription_updated_at: new Date().toISOString(),
            })
            .eq('subscription_id', subscription.id);

          console.log('Updated subscription status:', subscription.id);

          // Record the subscription event
          await supabase
            .from('subscription_events')
            .insert({
              user_id: subscription.metadata.user_id,
              event_type: 'subscription_updated',
              subscription_id: subscription.id,
              stripe_event_id: event.id,
            });

          console.log('Recorded subscription update event');
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          
          // Update user's subscription status
          await supabase
            .from('profiles')
            .update({
              subscription_status: 'inactive',
              subscription_id: null,
              subscription_updated_at: new Date().toISOString(),
            })
            .eq('subscription_id', subscription.id);

          console.log('Updated subscription status to inactive:', subscription.id);

          // Record the subscription event
          await supabase
            .from('subscription_events')
            .insert({
              user_id: subscription.metadata.user_id,
              event_type: 'subscription_cancelled',
              subscription_id: subscription.id,
              stripe_event_id: event.id,
            });

          console.log('Recorded subscription cancellation event');

          // Check if user has more than 3 properties
          const { count } = await supabase
            .from('properties')
            .select('*', { count: true })
            .eq('owner_id', subscription.metadata.user_id);

          if (count && count > 3) {
            // Update excess properties to inactive
            const { data: properties } = await supabase
              .from('properties')
              .select('id')
              .eq('owner_id', subscription.metadata.user_id)
              .order('created_at', { ascending: false })
              .range(3, count - 1);

            if (properties) {
              await supabase
                .from('properties')
                .update({ status: 'inactive' })
                .in('id', properties.map(p => p.id));

              console.log('Updated excess properties to inactive');
            }
          }
          break;
        }

        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          const bookingId = paymentIntent.metadata?.booking_id;
          
          if (bookingId) {
            // Update booking payment status
            await supabase
              .from('bookings')
              .update({
                payment_status: 'paid',
                stripe_payment_id: paymentIntent.id,
              })
              .eq('id', bookingId);

            // Get the booking details to calculate owner's share
            const { data: booking } = await supabase
              .from('bookings')
              .select('*, properties(*)')
              .eq('id', bookingId)
              .single();

            if (booking) {
              // Calculate platform fee (e.g., 10%)
              const platformFeePercentage = 0.1;
              const amount = paymentIntent.amount;
              const platformFee = Math.round(amount * platformFeePercentage);
              const ownerAmount = amount - platformFee;

              // Create a transfer to the property owner's connected Stripe account
              if (booking.properties.stripe_account_id) {
                await stripe.transfers.create({
                  amount: ownerAmount,
                  currency: 'usd',
                  destination: booking.properties.stripe_account_id,
                  transfer_group: bookingId,
                });
              }
            }
          }
          break;
        }

        default: {
          console.log(`Unhandled event type: ${event.type}`);
        }
      }

      return NextResponse.json({ received: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Webhook handler failed:', errorMessage);
      return NextResponse.json(
        { error: `Webhook handler failed: ${errorMessage}` },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Webhook error:', errorMessage);
    return NextResponse.json(
      { error: `Webhook error: ${errorMessage}` },
      { status: 500 }
    );
  }
} 