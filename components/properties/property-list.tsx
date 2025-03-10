import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/format";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Property {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  status: "available" | "occupied" | "maintenance";
  daily_rate: number | null;
  weekly_rate: number | null;
  monthly_rate: number | null;
  images: string[];
}

interface PropertyListProps {
  properties: Property[];
}

export function PropertyList({ properties }: PropertyListProps) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No properties found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <Link key={property.id} href={`/properties/${property.id}`}>
          <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
            <div className="aspect-video relative">
              <Image
                src={property.images[0] || "/placeholder-property.jpg"}
                alt={property.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false}
                className="object-cover"
              />
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="line-clamp-1">{property.name}</CardTitle>
                  <CardDescription className="line-clamp-1">
                    {property.city}, {property.state}
                  </CardDescription>
                </div>
                <Badge variant={getStatusVariant(property.status)}>
                  {property.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground line-clamp-2">
                {property.description}
              </p>
            </CardContent>
            <CardFooter>
              <div className="w-full space-y-1">
                {property.daily_rate && (
                  <div className="flex justify-between text-sm">
                    <span>Daily rate:</span>
                    <span>{formatCurrency(property.daily_rate)}</span>
                  </div>
                )}
                {property.weekly_rate && (
                  <div className="flex justify-between text-sm">
                    <span>Weekly rate:</span>
                    <span>{formatCurrency(property.weekly_rate)}</span>
                  </div>
                )}
                {property.monthly_rate && (
                  <div className="flex justify-between text-sm font-medium">
                    <span>Monthly rate:</span>
                    <span>{formatCurrency(property.monthly_rate)}</span>
                  </div>
                )}
              </div>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function getStatusVariant(status: Property["status"]) {
  switch (status) {
    case "available":
      return "default" as const;
    case "occupied":
      return "secondary" as const;
    case "maintenance":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
} 