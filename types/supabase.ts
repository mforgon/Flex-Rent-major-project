export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: 'owner' | 'tenant';
          full_name: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: 'owner' | 'tenant';
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: 'owner' | 'tenant';
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string;
          address: string;
          city: string;
          state: string;
          zip_code: string;
          price_per_day: number;
          price_per_week: number | null;
          price_per_month: number | null;
          status: 'available' | 'rented' | 'maintenance';
          images: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description: string;
          address: string;
          city: string;
          state: string;
          zip_code: string;
          price_per_day: number;
          price_per_week?: number | null;
          price_per_month?: number | null;
          status?: 'available' | 'rented' | 'maintenance';
          images?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          description?: string;
          address?: string;
          city?: string;
          state?: string;
          zip_code?: string;
          price_per_day?: number;
          price_per_week?: number | null;
          price_per_month?: number | null;
          status?: 'available' | 'rented' | 'maintenance';
          images?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          property_id: string;
          user_id: string;
          start_date: string;
          end_date: string;
          duration: number;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          total_amount: number;
          payment_intent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          user_id: string;
          start_date: string;
          end_date: string;
          duration: number;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          total_amount: number;
          payment_intent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          user_id?: string;
          start_date?: string;
          end_date?: string;
          duration?: number;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          total_amount?: number;
          payment_intent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
} 