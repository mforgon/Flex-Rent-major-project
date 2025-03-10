"use client";

import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Home } from "lucide-react";

interface Property {
  id: string;
  name: string;
  description: string;
  address: string;
  status: "available" | "occupied" | "maintenance";
  daily_rate: number | null;
  weekly_rate: number | null;
  monthly_rate: number | null;
  images: string[];
  created_at: string;
}

interface PropertyDetailsProps {
  property: Property;
}

export function PropertyDetails({ property }: PropertyDetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{property.name}</h1>
        <div className="flex items-center gap-2 text-muted-foreground mt-2">
          <MapPin className="h-4 w-4" />
          <span>{property.address}</span>
        </div>
      </div>

      {property.images && property.images.length > 0 && (
        <div className="aspect-video rounded-lg overflow-hidden">
          <img
            src={property.images[0]}
            alt={property.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Description</h3>
              <p className="text-muted-foreground mt-1">
                {property.description}
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Rental Rates</h3>
              <div className="mt-2 space-y-2">
                {property.daily_rate && (
                  <div className="flex justify-between">
                    <span>Daily rate:</span>
                    <span>{formatCurrency(property.daily_rate)}</span>
                  </div>
                )}
                {property.weekly_rate && (
                  <div className="flex justify-between">
                    <span>Weekly rate:</span>
                    <span>{formatCurrency(property.weekly_rate)}</span>
                  </div>
                )}
                {property.monthly_rate && (
                  <div className="flex justify-between">
                    <span>Monthly rate:</span>
                    <span>{formatCurrency(property.monthly_rate)}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Property Images</h3>
              {property.images && property.images.length > 0 ? (
                <div className="mt-2 grid grid-cols-2 gap-4">
                  {property.images.map((image, index) => (
                    <div
                      key={index}
                      className="aspect-video rounded-md overflow-hidden"
                    >
                      <img
                        src={image}
                        alt={`${property.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground mt-1">No images available</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 