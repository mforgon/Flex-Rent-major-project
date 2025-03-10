'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Property, getPropertyById, updateProperty } from '@/lib/property';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PropertyBookings } from '@/components/properties/property-bookings';
import { PropertyExpenses } from '@/components/properties/property-expenses';
import { PropertyReviews } from '@/components/properties/property-reviews';
import { PropertySettings } from '@/components/properties/property-settings';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PropertyDetails() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadProperty();
    }
  }, [params.id]);

  async function loadProperty() {
    if (!params.id) return;
    
    const data = await getPropertyById(params.id as string);
    if (data) {
      setProperty(data);
    }
    setLoading(false);
  }

  async function handleStatusChange(newStatus: Property['status']) {
    if (!property) return;

    const updatedProperty = await updateProperty(property.id, {
      status: newStatus,
    });

    if (updatedProperty) {
      setProperty(updatedProperty);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Property Not Found</h2>
              <p className="text-gray-600 mb-4">The property you're looking for doesn't exist or you don't have access to it.</p>
              <Link href="/dashboard/properties">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Properties
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/properties">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{property.name}</h1>
            <p className="text-gray-600">{property.address}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={
            property.status === 'available' ? 'default' :
            property.status === 'occupied' ? 'secondary' :
            'destructive'
          }>
            {property.status}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Description</h3>
                    <p className="text-gray-600">{property.description}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Rates</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Daily</p>
                        <p className="font-medium">${property.daily_rate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Weekly</p>
                        <p className="font-medium">${property.weekly_rate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Monthly</p>
                        <p className="font-medium">${property.monthly_rate}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium">Amenities</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {property.amenities.map((amenity) => (
                        <Badge key={amenity} variant="secondary">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Property Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {property.images.map((image, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={image}
                        alt={`${property.name} - Image ${index + 1}`}
                        className="object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bookings">
          <PropertyBookings propertyId={property.id} />
        </TabsContent>

        <TabsContent value="expenses">
          <PropertyExpenses propertyId={property.id} />
        </TabsContent>

        <TabsContent value="reviews">
          <PropertyReviews propertyId={property.id} />
        </TabsContent>

        <TabsContent value="settings">
          <PropertySettings
            property={property}
            onUpdate={loadProperty}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 