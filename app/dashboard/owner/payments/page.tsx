import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { EarningsChart } from '@/components/dashboard/earnings-chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default async function PaymentsPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/sign-in');
  }

  // Fetch owner's payments
  const { data: payments } = await supabase
    .from('payments')
    .select(`
      *,
      bookings (
        properties (name),
        tenants (full_name)
      )
    `)
    .eq('owner_id', session.user.id)
    .order('created_at', { ascending: false });

  // Calculate total earnings
  const totalEarnings = payments?.reduce((acc, payment) => acc + payment.amount, 0) || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground">
          Track your earnings and payments
        </p>
      </div>

      <div className="grid gap-6">
        {/* Earnings Overview */}
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Earnings Overview</h2>
            <div className="text-2xl font-bold">
              ${totalEarnings.toFixed(2)}
            </div>
          </div>
          <EarningsChart data={payments || []} />
        </div>

        {/* Payment History */}
        <div className="bg-card rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Payment History</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments?.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.bookings.properties.name}
                    </TableCell>
                    <TableCell>
                      {payment.bookings.tenants.full_name}
                    </TableCell>
                    <TableCell>${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      {format(new Date(payment.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
} 