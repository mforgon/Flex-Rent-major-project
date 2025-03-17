import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { PropertyList } from "@/components/properties/property-list";
import { PropertyFilters } from "@/components/properties/property-filters";

interface PropertiesPageProps {
  searchParams: {
    duration?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
    propertyType?: string;
    bedrooms?: string;
    bathrooms?: string;
    amenities?: string;
    sortBy?: string;
  };
}

export default async function PropertiesPage({
  searchParams,
}: PropertiesPageProps) {
  const supabase = createServerComponentClient({ cookies });

  let query = supabase
    .from("properties")
    .select("*, owner:users(full_name, email)")
    .eq("status", "available");

  // Apply filters
  if (searchParams.search) {
    query = query.or(
      `name.ilike.%${searchParams.search}%,` +
      `address.ilike.%${searchParams.search}%,` +
      `city.ilike.%${searchParams.search}%,` +
      `country.ilike.%${searchParams.search}%`
    );
  }

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

  if (searchParams.propertyType) {
    query = query.eq("property_type", searchParams.propertyType);
  }

  if (searchParams.bedrooms) {
    query = query.eq("bedrooms", parseInt(searchParams.bedrooms));
  }

  if (searchParams.bathrooms) {
    query = query.eq("bathrooms", parseInt(searchParams.bathrooms));
  }

  if (searchParams.amenities) {
    const amenitiesList = searchParams.amenities.split(',');
    query = query.contains('amenities', amenitiesList);
  }

  // Apply sorting
  if (searchParams.sortBy) {
    const [column, order] = searchParams.sortBy.split('.');
    const validColumns = ['created_at', 'daily_rate', 'weekly_rate', 'monthly_rate'];
    if (validColumns.includes(column)) {
      query = query.order(column, { ascending: order === 'asc' });
    }
  } else {
    // Default sorting
    query = query.order("created_at", { ascending: false });
  }

  const { data: properties, error } = await query;

  if (error) {
    console.error('Error fetching properties:', error);
  }

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