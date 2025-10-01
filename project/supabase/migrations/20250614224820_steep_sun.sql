/*
  # Fix volunteer opportunities table creation

  1. New Tables
    - `volunteer_opportunities` (if not exists)
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
    - Add policies only if they don't exist
    - Add sample data only if table is empty
*/

-- Create table if it doesn't exist
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

-- Enable RLS if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class 
    WHERE relname = 'volunteer_opportunities' 
    AND relrowsecurity = true
  ) THEN
    ALTER TABLE volunteer_opportunities ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies only if they don't exist
DO $$
BEGIN
  -- Check and create read policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'volunteer_opportunities' 
    AND policyname = 'Anyone can read approved opportunities'
  ) THEN
    CREATE POLICY "Anyone can read approved opportunities"
      ON volunteer_opportunities
      FOR SELECT
      TO public
      USING (is_approved = true);
  END IF;

  -- Check and create insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'volunteer_opportunities' 
    AND policyname = 'Anyone can insert opportunities'
  ) THEN
    CREATE POLICY "Anyone can insert opportunities"
      ON volunteer_opportunities
      FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;
END $$;

-- Insert sample data only if table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM volunteer_opportunities LIMIT 1) THEN
    INSERT INTO volunteer_opportunities (
      title, location, latitude, longitude, date, time, description,
      is_chapter_sponsored, impact_level, hours_estimate, organizer, contact_email
    ) VALUES 
    (
      'Food Bank Distribution',
      'Kirkland Community Center',
      47.6815,
      -122.2087,
      '2025-02-15',
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
      '2025-02-18',
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
      '2025-02-20',
      '6:00 PM - 8:30 PM',
      'Engage with senior citizens during their weekly bingo night. Help with setup, calling numbers, and social interaction.',
      false,
      'High',
      '2.5 hours',
      'Bothell Senior Services',
      'activities@bothellseniors.org'
    ),
    (
      'Beach Cleanup',
      'Juanita Beach Park',
      47.7089,
      -122.2087,
      '2025-02-22',
      '10:00 AM - 12:00 PM',
      'Join us for a community beach cleanup to protect our local waterways and wildlife. Gloves and bags provided.',
      true,
      'High',
      '2 hours',
      'Juanita NHS Environmental Club',
      'environmental@juanitahs.edu'
    ),
    (
      'Tutoring Elementary Students',
      'Rose Hill Elementary School',
      47.6789,
      -122.1987,
      '2025-02-25',
      '3:00 PM - 4:30 PM',
      'Provide one-on-one tutoring support for elementary students in math and reading. Great for future educators!',
      false,
      'Medium',
      '1.5 hours',
      'Rose Hill Elementary',
      'tutoring@rosehill.edu'
    );
  END IF;
END $$;