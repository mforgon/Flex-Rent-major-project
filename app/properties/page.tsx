import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { PropertyList } from "@/components/properties/property-list";
import { PropertyFilters } from "@/components/properties/property-filters";

interface PropertiesPageProps {
  searchParams: {
    duration?: string;
    minPrice?: string;
    maxPrice?: string;
    location?: string;
  };
}

export default async function PropertiesPage({
  searchParams,
}: PropertiesPageProps) {
  const supabase = createServerComponentClient({ cookies });

  let query = supabase
    .from("properties")
    .select("*")
    .eq("status", "available");

  // Apply filters
  if (searchParams.duration && searchParams.duration !== 'any') {
    const priceColumn = `${searchParams.duration}_rate`;
    query = query.not(priceColumn, "is", null);
  }

  if (searchParams.minPrice) {
    const priceColumn = `${searchParams.duration || "daily"}_rate`;
    query = query.gte(priceColumn, Number(searchParams.minPrice));
  }

  if (searchParams.maxPrice) {
    const priceColumn = `${searchParams.duration || "daily"}_rate`;
    query = query.lte(priceColumn, Number(searchParams.maxPrice));
  }

  if (searchParams.location) {
    query = query.ilike("address", `%${searchParams.location}%`);
  }

  const { data: properties } = await query.order("created_at", { ascending: false });

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold">Available Properties</h1>
          <p className="text-muted-foreground mt-2">
            Find your perfect rental space with flexible durations
          </p>
        </div>

        <PropertyFilters />

        <PropertyList properties={properties || []} />
      </div>
    </div>
  );
} 