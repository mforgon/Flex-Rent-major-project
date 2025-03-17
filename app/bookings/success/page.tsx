import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function BookingSuccessPage() {
  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <CardTitle>Booking Successful!</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Your payment has been processed successfully and your booking is confirmed.
              You can view your booking details in your dashboard.
            </p>
            <div className="flex space-x-4">
              <Button asChild>
                <Link href="/bookings">View Bookings</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/properties">Browse More Properties</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 