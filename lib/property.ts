import { supabase } from './supabase';

export interface Property {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  address: string;
  status: 'available' | 'occupied' | 'maintenance';
  daily_rate: number;
  weekly_rate: number;
  monthly_rate: number;
  images: string[];
  amenities: string[];
  created_at: string;
  updated_at: string;
}

export interface PropertyWithOwner extends Property {
  owner: {
    full_name: string;
    email: string;
    phone_number?: string;
  };
}

export async function getProperties(filters?: {
  status?: Property['status'];
  owner_id?: string;
  min_price?: number;
  max_price?: number;
  amenities?: string[];
}) {
  let query = supabase
    .from('properties')
    .select(`
      *,
      owner:users(full_name, email, phone_number)
    `)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.owner_id) {
    query = query.eq('owner_id', filters.owner_id);
  }

  if (filters?.min_price) {
    query = query.gte('daily_rate', filters.min_price);
  }

  if (filters?.max_price) {
    query = query.lte('daily_rate', filters.max_price);
  }

  if (filters?.amenities?.length) {
    query = query.contains('amenities', filters.amenities);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching properties:', error);
    return null;
  }

  return data as PropertyWithOwner[];
}

export async function getPropertyById(id: string) {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      owner:users(full_name, email, phone_number)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching property:', error);
    return null;
  }

  return data as PropertyWithOwner;
}

export async function createProperty(property: Omit<Property, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('properties')
    .insert([property])
    .select()
    .single();

  if (error) {
    console.error('Error creating property:', error);
    return null;
  }

  return data as Property;
}

export async function updateProperty(id: string, updates: Partial<Property>) {
  const { data, error } = await supabase
    .from('properties')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating property:', error);
    return null;
  }

  return data as Property;
}

export async function deleteProperty(id: string) {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting property:', error);
    return false;
  }

  return true;
}

export async function uploadPropertyImage(file: File, propertyId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${propertyId}/${Math.random()}.${fileExt}`;
  const filePath = `property-images/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('properties')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('properties')
    .getPublicUrl(filePath);

  return publicUrl;
} 