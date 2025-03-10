import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Booking {
  id: string;
  check_in_date: string;
  check_out_date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  total_amount: number;
  properties: {
    name: string;
  };
  tenants: {
    full_name: string;
    email: string;
  };
}

interface RecentBookingsProps {
  bookings: Booking[];
}

export function RecentBookings({ bookings }: RecentBookingsProps) {
  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Property</TableHead>
          <TableHead>Tenant</TableHead>
          <TableHead>Check In</TableHead>
          <TableHead>Check Out</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow key={booking.id}>
            <TableCell className="font-medium">{booking.properties.name}</TableCell>
            <TableCell>
              <div>
                <div>{booking.tenants.full_name}</div>
                <div className="text-sm text-muted-foreground">
                  {booking.tenants.email}
                </div>
              </div>
            </TableCell>
            <TableCell>
              {format(new Date(booking.check_in_date), 'MMM d, yyyy')}
            </TableCell>
            <TableCell>
              {format(new Date(booking.check_out_date), 'MMM d, yyyy')}
            </TableCell>
            <TableCell>${booking.total_amount.toFixed(2)}</TableCell>
            <TableCell>
              <Badge variant={getStatusColor(booking.status)}>
                {booking.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 