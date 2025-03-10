import { NextResponse } from 'next/server';
import { createPaymentIntent } from '@/lib/stripe/utils';
import type { CreatePaymentIntentParams } from '@/lib/stripe/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency, customerId, metadata } = body as CreatePaymentIntentParams;

    if (!amount || !currency) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const paymentIntent = await createPaymentIntent({
      amount,
      currency,
      customerId,
      metadata,
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return new NextResponse(
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 }
    );
  }
} 