import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string;
          role: 'customer' | 'salon_owner';
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      salons: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string;
          address: string;
          phone: string;
          email: string;
          image_url: string | null;
          opening_time: string;
          closing_time: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['salons']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['salons']['Insert']>;
      };
      services: {
        Row: {
          id: string;
          salon_id: string;
          name: string;
          description: string;
          duration_minutes: number;
          price: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['services']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['services']['Insert']>;
      };
      bookings: {
        Row: {
          id: string;
          customer_id: string;
          salon_id: string;
          service_id: string;
          booking_date: string;
          booking_time: string;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
      };
    };
  };
};
