import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, DollarSign, Calendar } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  status: 'available' | 'occupied' | 'maintenance';
  daily_rate: number;
  weekly_rate: number;
  monthly_rate: number;
}

interface PropertyStatsProps {
  properties: Property[];
}

export function PropertyStats({ properties }: PropertyStatsProps) {
  const totalProperties = properties.length;
  const availableProperties = properties.filter(p => p.status === 'available').length;
  const occupiedProperties = properties.filter(p => p.status === 'occupied').length;
  const averageDailyRate = properties.reduce((acc, p) => acc + (p.daily_rate || 0), 0) / totalProperties || 0;

  const stats = [
    {
      title: 'Total Properties',
      value: totalProperties,
      icon: Building2,
      description: 'Properties in your portfolio'
    },
    {
      title: 'Available Properties',
      value: availableProperties,
      icon: Calendar,
      description: 'Ready for booking'
    },
    {
      title: 'Occupied Properties',
      value: occupiedProperties,
      icon: Users,
      description: 'Currently rented'
    },
    {
      title: 'Average Daily Rate',
      value: `$${averageDailyRate.toFixed(2)}`,
      icon: DollarSign,
      description: 'Per property'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 