import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";
import { toast } from "sonner";

type Booking = {
  id: string;
  start_date: string;
  end_date: string;
  status: "pending" | "confirmed" | "cancelled";
  duration: "daily" | "weekly" | "monthly";
  properties: {
    name: string;
    daily_rate?: number;
    weekly_rate?: number;
    monthly_rate?: number;
  };
  tenants: {
    full_name: string;
    email: string;
  };
  created_at: string;
};

interface RecentBookingsProps {
  bookings: Booking[];
  isOwner?: boolean;
}

export function RecentBookings({ bookings, isOwner = false }: RecentBookingsProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const handleStatusUpdate = async (bookingId: string, newStatus: "confirmed" | "cancelled") => {
    try {
      setUpdatingId(bookingId);
      
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      toast.success(`Booking ${newStatus} successfully`);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>{isOwner ? 'Tenant' : 'Your Details'}</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              {isOwner && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">
                  {booking.properties.name}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{booking.tenants.full_name}</span>
                    <span className="text-sm text-muted-foreground">
                      {booking.tenants.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(booking.start_date), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  {format(new Date(booking.end_date), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="capitalize">{booking.duration}</TableCell>
                <TableCell>
                  {formatCurrency(
                    booking.properties[`${booking.duration}_rate`] || 0
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      booking.status === "confirmed"
                        ? "default"
                        : booking.status === "pending"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {booking.status}
                  </Badge>
                </TableCell>
                {isOwner && (
                  <TableCell>
                    {booking.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(booking.id, "confirmed")}
                          disabled={updatingId === booking.id}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusUpdate(booking.id, "cancelled")}
                          disabled={updatingId === booking.id}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
            {bookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={isOwner ? 8 : 7} className="text-center h-24">
                  No bookings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 