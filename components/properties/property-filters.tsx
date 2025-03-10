"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

export function PropertyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
    const queryString = createQueryString({ [key]: value });
    router.push(`/properties?${queryString}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by location..."
          className="pl-9"
          value={searchParams?.get("location") || ""}
          onChange={(e) => handleFilterChange("location", e.target.value)}
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
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Min Price"
          className="w-[120px]"
          value={searchParams?.get("minPrice") || ""}
          onChange={(e) => handleFilterChange("minPrice", e.target.value)}
        />
        <Input
          type="number"
          placeholder="Max Price"
          className="w-[120px]"
          value={searchParams?.get("maxPrice") || ""}
          onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
        />
      </div>
      <Button
        variant="outline"
        onClick={() => router.push("/properties")}
      >
        Reset
      </Button>
    </div>
  );
} 