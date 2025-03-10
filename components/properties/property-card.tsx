'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/lib/property';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { deleteProperty } from '@/lib/property';

interface PropertyCardProps {
  property: Property;
  onUpdate: () => void;
}

export function PropertyCard({ property, onUpdate }: PropertyCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this property?')) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteProperty(property.id);
      if (success) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting property:', error);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        {property.images[0] ? (
          <Image
            src={property.images[0]}
            alt={property.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="bg-white/80">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href={`/dashboard/properties/${property.id}/edit`}>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                className="text-red-600"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{property.name}</h3>
            <p className="text-sm text-gray-500">{property.address}</p>
          </div>
          <Badge variant={
            property.status === 'available' ? 'default' :
            property.status === 'occupied' ? 'secondary' :
            'destructive'
          }>
            {property.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Daily Rate:</span>
            <span className="font-medium">${property.daily_rate}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Weekly Rate:</span>
            <span className="font-medium">${property.weekly_rate}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Monthly Rate:</span>
            <span className="font-medium">${property.monthly_rate}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/dashboard/properties/${property.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 