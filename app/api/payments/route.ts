import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { propertyId, amount, startDate, endDate, duration, paymentMethodData } = body;

    // Get the property details
    const { error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (propertyError) {
      console.error('Error fetching property:', propertyError);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    // Get the user's Stripe customer ID from the database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', session.user.id)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    let customerId = user.stripe_customer_id;

    // If the user doesn't have a Stripe customer ID, create one
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: {
          user_id: session.user.id,
        },
      });

      customerId = customer.id;

      // Update the user with their Stripe customer ID
      const { error: updateError } = await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', session.user.id);

      if (updateError) {
        console.error('Error updating user:', updateError);
        return new NextResponse('Internal Server Error', { status: 500 });
      }
    }

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      customer: customerId,
      payment_method_types: ['card'],
      metadata: {
        property_id: propertyId,
        start_date: startDate,
        end_date: endDate,
        duration,
      },
    });

    // Create a payment method
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: paymentMethodData.cardNumber,
        exp_month: parseInt(paymentMethodData.expiry.split('/')[0]),
        exp_year: parseInt(paymentMethodData.expiry.split('/')[1]),
        cvc: paymentMethodData.cvc,
      },
      billing_details: {
        email: session.user.email,
      },
    });

    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: customerId,
    });

    // Set the payment method as the default
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    });

    // Confirm the payment
    const confirmedPayment = await stripe.paymentIntents.confirm(paymentIntent.id);

    if (confirmedPayment.status === 'succeeded') {
      // Create a rental record in the database
      const { error: rentalError } = await supabase
        .from('rentals')
        .insert([
          {
            property_id: propertyId,
            tenant_id: session.user.id,
            start_date: startDate,
            end_date: endDate,
            duration,
            total_amount: amount,
            is_paid: true,
            stripe_payment_intent_id: paymentIntent.id,
          },
        ]);

      if (rentalError) {
        console.error('Error creating rental:', rentalError);
        return new NextResponse('Internal Server Error', { status: 500 });
      }

      // Update the property status
      const { error: propertyUpdateError } = await supabase
        .from('properties')
        .update({ status: 'occupied' })
        .eq('id', propertyId);

      if (propertyUpdateError) {
        console.error('Error updating property:', propertyUpdateError);
        return new NextResponse('Internal Server Error', { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return new NextResponse('Payment failed', { status: 400 });
  } catch (error) {
    console.error('Error in payments route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 