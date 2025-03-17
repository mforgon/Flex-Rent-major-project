"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const PROPERTY_TYPES = [
  "Apartment",
  "House",
  "Condo",
  "Villa",
  "Studio",
  "Room",
];

const AMENITIES = [
  "WiFi",
  "Air Conditioning",
  "Parking",
  "Swimming Pool",
  "Gym",
  "Security",
  "Furnished",
  "Balcony",
  "Garden",
  "Elevator",
];

const SORT_OPTIONS = [
  { label: "Newest First", value: "created_at.desc" },
  { label: "Oldest First", value: "created_at.asc" },
  { label: "Price: Low to High", value: "daily_rate.asc" },
  { label: "Price: High to Low", value: "daily_rate.desc" },
];

export function PropertyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("search") || "");

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString());

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value);
        }
      }

      return newSearchParams.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (key: string, value: string | null) => {
    // Convert "all" and "any" values to null to remove them from the query string
    const finalValue = value === "all" || value === "any" ? null : value;
    const queryString = createQueryString({ [key]: finalValue });
    router.push(`/properties?${queryString}`);
  };

  // Debounced search handler
  useEffect(() => {
    const timer = setTimeout(() => {
      const queryString = createQueryString({ search: searchQuery || null });
      router.push(`/properties?${queryString}`);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery, createQueryString, router]);

  const handleAmenitiesChange = (amenity: string) => {
    const currentAmenities = searchParams?.get("amenities")?.split(",") || [];
    let newAmenities: string[];

    if (currentAmenities.includes(amenity)) {
      newAmenities = currentAmenities.filter((a) => a !== amenity);
    } else {
      newAmenities = [...currentAmenities, amenity];
    }

    handleFilterChange(
      "amenities",
      newAmenities.length > 0 ? newAmenities.join(",") : null
    );
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or location..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Select
        value={searchParams?.get("duration") || ""}
        onValueChange={(value) => handleFilterChange("duration", value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Duration" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any Duration</SelectItem>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams?.get("sortBy") || ""}
        onValueChange={(value) => handleFilterChange("sortBy", value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            More Filters
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>
              Refine your property search with additional filters
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Price Range</h3>
              <div className="flex gap-4">
                <div>
                  <Label htmlFor="minPrice">Min Price</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    placeholder="0"
                    value={searchParams?.get("minPrice") || ""}
                    onChange={(e) =>
                      handleFilterChange("minPrice", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="maxPrice">Max Price</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    placeholder="Any"
                    value={searchParams?.get("maxPrice") || ""}
                    onChange={(e) =>
                      handleFilterChange("maxPrice", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Property Type</h3>
              <Select
                value={searchParams?.get("propertyType") || "all"}
                onValueChange={(value) => handleFilterChange("propertyType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any type</SelectItem>
                  {PROPERTY_TYPES.map((type) => (
                    <SelectItem key={type} value={type.toLowerCase()}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Rooms</h3>
              <div className="flex gap-4">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Select
                    value={searchParams?.get("bedrooms") || "any"}
                    onValueChange={(value) => handleFilterChange("bedrooms", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}+
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Select
                    value={searchParams?.get("bathrooms") || "any"}
                    onValueChange={(value) =>
                      handleFilterChange("bathrooms", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      {[1, 2, 3, 4].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}+
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Amenities</h3>
              <div className="grid grid-cols-2 gap-4">
                {AMENITIES.map((amenity) => {
                  const currentAmenities =
                    searchParams?.get("amenities")?.split(",") || [];
                  return (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={currentAmenities.includes(amenity)}
                        onCheckedChange={() => handleAmenitiesChange(amenity)}
                      />
                      <Label htmlFor={amenity}>{amenity}</Label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => router.push("/properties")}
            >
              Clear All Filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
} 