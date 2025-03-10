import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Property {
  id: string;
  name: string;
  address: string;
  status: 'available' | 'occupied' | 'maintenance';
  daily_rate: number;
  weekly_rate: number;
  monthly_rate: number;
  images: string[];
}

interface PropertyListProps {
  properties: Property[];
}

export function PropertyList({ properties }: PropertyListProps) {
  const getStatusColor = (status: Property['status']) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'occupied':
        return 'secondary';
      case 'maintenance':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (properties.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No properties found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Property</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Daily Rate</TableHead>
          <TableHead>Weekly Rate</TableHead>
          <TableHead>Monthly Rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {properties.map((property) => (
          <TableRow key={property.id}>
            <TableCell>
              <Link href={`/properties/${property.id}`} className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-md">
                  <Image
                    src={property.images[0] || "/placeholder-property.jpg"}
                    alt={property.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <span className="font-medium">{property.name}</span>
              </Link>
            </TableCell>
            <TableCell className="max-w-[200px] truncate">
              {property.address}
            </TableCell>
            <TableCell>
              <Badge variant={getStatusColor(property.status)}>
                {property.status}
              </Badge>
            </TableCell>
            <TableCell>${property.daily_rate.toFixed(2)}</TableCell>
            <TableCell>${property.weekly_rate.toFixed(2)}</TableCell>
            <TableCell>${property.monthly_rate.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 