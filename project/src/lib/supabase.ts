// Supabase is disabled - not being used for this project
export const supabase = null;

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