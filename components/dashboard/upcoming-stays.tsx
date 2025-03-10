import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Stay {
  id: string;
  check_in_date: string;
  check_out_date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  total_amount: number;
  properties: {
    id: string;
    name: string;
    address: string;
    images: string[];
  };
}

interface UpcomingStaysProps {
  stays: Stay[];
}

export function UpcomingStays({ stays }: UpcomingStaysProps) {
  const getStatusColor = (status: Stay['status']) => {
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

  if (stays.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No upcoming stays</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stays.map((stay) => (
        <Link key={stay.id} href={`/properties/${stay.properties.id}`}>
          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video relative">
              <Image
                src={stay.properties.images[0] || "/placeholder-property.jpg"}
                alt={stay.properties.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="line-clamp-1">{stay.properties.name}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {stay.properties.address}
                  </p>
                </div>
                <Badge variant={getStatusColor(stay.status)}>
                  {stay.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Check In:</span>
                  <span>{format(new Date(stay.check_in_date), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Check Out:</span>
                  <span>{format(new Date(stay.check_out_date), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Total Amount:</span>
                  <span>${stay.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
} 