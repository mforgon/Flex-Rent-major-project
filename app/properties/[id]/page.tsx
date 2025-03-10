import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { PropertyDetails } from './PropertyDetails';

export const revalidate = 3600; // Revalidate every hour

async function getProperty(id: string) {
  const supabase = createClient();
  
  const { data: property, error } = await supabase
    .from('properties')
    .select(`
      *,
      owner:owner_id (
        full_name,
        email
      )
    `)
    .eq('id', id)
    .single();

  if (error || !property) {
    return null;
  }

  return property;
}

export default async function PropertyPage({
  params,
}: {
  params: { id: string };
}) {
  const property = await getProperty(params.id);

  if (!property) {
    notFound();
  }

  return <PropertyDetails property={property} />;
} 