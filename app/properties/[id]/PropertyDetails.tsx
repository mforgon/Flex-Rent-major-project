'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface Property {
  id: string;
  name: string;
  description: string;
  images: string[];
  daily_rate: number;
  weekly_rate: number;
  monthly_rate: number;
  amenities: string[];
  address: string;
  city: string;
  country: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  square_meters: number;
  owner: {
    full_name: string;
    email: string;
  };
}

interface PropertyDetailsProps {
  property: Property;
}

export function PropertyDetails({ property }: PropertyDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const { user } = useAuth();
  const router = useRouter();

  const handleRentClick = () => {
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(`/properties/${property.id}`));
      return;
    }
    // Handle rental process for authenticated users
    router.push(`/properties/${property.id}/book`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={property.images[selectedImage] || "/placeholder-property.jpg"}
              alt={`${property.name} - Main Image`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder-property.jpg";
              }}
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {property.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative aspect-video overflow-hidden rounded-lg border-2 ${
                  selectedImage === index ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                <Image
                  src={image || "/placeholder-property.jpg"}
                  alt={`${property.name} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 25vw, 20vw"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-property.jpg";
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Property Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{property.name}</h1>
            <p className="text-gray-600">{property.address}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
            <div>
              <p className="text-sm text-gray-600">Daily Rate</p>
              <p className="text-xl font-semibold">${property.daily_rate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Weekly Rate</p>
              <p className="text-xl font-semibold">${property.weekly_rate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Monthly Rate</p>
              <p className="text-xl font-semibold">${property.monthly_rate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Property Type</p>
              <p className="text-xl font-semibold">{property.property_type}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Description</h2>
            <p className="text-gray-600">{property.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Bedrooms</h3>
              <p>{property.bedrooms}</p>
            </div>
            <div>
              <h3 className="font-semibold">Bathrooms</h3>
              <p>{property.bathrooms}</p>
            </div>
            <div>
              <h3 className="font-semibold">Area</h3>
              <p>{property.square_meters} m²</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Amenities</h2>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {property.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Owner</h2>
            <p className="text-gray-600">{property.owner.full_name}</p>
            <p className="text-gray-600">{property.owner.email}</p>
          </div>

          <button
            onClick={handleRentClick}
            className="w-full rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            {user ? 'Proceed to Booking' : 'Sign in to Book'}
          </button>
        </div>
      </div>
    </div>
  );
} 