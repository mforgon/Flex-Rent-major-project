import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PaymentPageProps {
  searchParams: {
    session_id?: string;
  };
}

export default async function PaymentPage({
  searchParams,
}: PaymentPageProps) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/sign-in');
  }

  if (!searchParams.session_id) {
    redirect('/properties');
  }

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please complete your payment to confirm your booking.
            </p>
            <Button
              className="w-full"
              onClick={() => {
                // Redirect to Stripe Checkout
                window.location.href = `/api/checkout?session_id=${searchParams.session_id}`;
              }}
            >
              Pay Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 