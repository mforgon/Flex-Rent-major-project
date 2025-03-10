import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PaymentHistory } from '@/components/dashboard/payment-history';

export default async function TenantPaymentsPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/sign-in');
  }

  // Fetch tenant's payments
  const { data: payments } = await supabase
    .from('payments')
    .select(`
      *,
      bookings (
        properties (name)
      )
    `)
    .eq('tenant_id', session.user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground">
          View your payment history
        </p>
      </div>

      <div className="bg-card rounded-lg shadow-sm">
        <PaymentHistory payments={payments || []} />
      </div>
    </div>
  );
} 