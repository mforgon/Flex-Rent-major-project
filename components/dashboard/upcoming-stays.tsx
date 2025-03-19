import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Stay {
  id: string;
  start_date: string;
  end_date: string;
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
  stays?: Stay[];
}

export function UpcomingStays({ stays = [] }: UpcomingStaysProps) {
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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      console.error('Invalid date:', dateString);
      return 'Invalid date';
    }
  };

  if (!stays || stays.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Stays</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No upcoming stays</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Stays</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {stays.map((stay) => (
          <div key={stay.id} className="space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{stay.properties.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {stay.properties.address}
                </p>
              </div>
              <Badge variant={getStatusColor(stay.status)}>
                {stay.status}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Check In:</span>
              <span>{formatDate(stay.start_date)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Check Out:</span>
              <span>{formatDate(stay.end_date)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span>Total:</span>
              <span>${stay.total_amount.toFixed(2)}</span>
            </div>
            {stay.properties.images && stay.properties.images.length > 0 && (
              <img
                src={stay.properties.images[0]}
                alt={stay.properties.name}
                className="w-full h-32 object-cover rounded-md"
              />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
} 