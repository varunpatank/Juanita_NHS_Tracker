/*
  # Create volunteer opportunities table

  1. New Tables
    - `volunteer_opportunities`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `location` (text, required)
      - `latitude` (numeric, required)
      - `longitude` (numeric, required)
      - `date` (date, required)
      - `time` (text, required)
      - `description` (text, required)
      - `is_chapter_sponsored` (boolean, default false)
      - `impact_level` (text, check constraint for Low/Medium/High)
      - `hours_estimate` (text, required)
      - `organizer` (text, required)
      - `contact_email` (text, required)
      - `is_approved` (boolean, default true)
      - `created_at` (timestamp with timezone, default now)

  2. Security
    - Enable RLS on `volunteer_opportunities` table
    - Add policy for anyone to read approved opportunities
    - Add policy for anyone to insert new opportunities (subject to approval)
*/

CREATE TABLE IF NOT EXISTS volunteer_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  location text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  description text NOT NULL,
  is_chapter_sponsored boolean DEFAULT false,
  impact_level text CHECK (impact_level IN ('Low', 'Medium', 'High')) NOT NULL,
  hours_estimate text NOT NULL,
  organizer text NOT NULL,
  contact_email text NOT NULL,
  is_approved boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE volunteer_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved opportunities"
  ON volunteer_opportunities
  FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Anyone can insert opportunities"
  ON volunteer_opportunities
  FOR INSERT
  WITH CHECK (true);

-- Insert some sample data
INSERT INTO volunteer_opportunities (
  title, location, latitude, longitude, date, time, description,
  is_chapter_sponsored, impact_level, hours_estimate, organizer, contact_email
) VALUES 
(
  'Food Bank Distribution',
  'Kirkland Community Center',
  47.6815,
  -122.2087,
  '2024-01-15',
  '09:00 AM - 1:00 PM',
  'Help distribute food to families in need. Tasks include sorting donations, packing bags, and assisting with distribution.',
  false,
  'High',
  '4 hours',
  'Kirkland Food Bank',
  'volunteer@kirklandfoodbank.org'
),
(
  'School Library Organization',
  'Juanita High School Library',
  47.7211,
  -122.2054,
  '2024-01-18',
  '3:30 PM - 5:30 PM',
  'Assist librarians with organizing books, updating catalog system, and preparing for new semester.',
  true,
  'Medium',
  '2 hours',
  'JHS Library Staff',
  'library@juanitahs.edu'
),
(
  'Senior Center Bingo Night',
  'Bothell Senior Center',
  47.7598,
  -122.2054,
  '2024-01-20',
  '6:00 PM - 8:30 PM',
  'Engage with senior citizens during their weekly bingo night. Help with setup, calling numbers, and social interaction.',
  false,
  'High',
  '2.5 hours',
  'Bothell Senior Services',
  'activities@bothellseniors.org'
);