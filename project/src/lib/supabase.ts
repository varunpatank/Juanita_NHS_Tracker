import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Add validation to prevent the Invalid URL error
if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here') {
  throw new Error('Missing VITE_SUPABASE_URL environment variable. Please set it in your .env file.');
}

if (!supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key_here') {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable. Please set it in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface VolunteerOpportunity {
  id: string;
  title: string;
  location: string;
  latitude: number;
  longitude: number;
  date: string;
  time: string;
  description: string;
  is_chapter_sponsored: boolean;
  impact_level: 'Low' | 'Medium' | 'High';
  hours_estimate: string;
  organizer: string;
  contact_email: string;
  created_at: string;
  is_approved: boolean;
}