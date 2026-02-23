/*
  # Hair Salon Booking System Schema

  ## Overview
  Complete database schema for a multi-salon booking platform where customers can book appointments 24/7 and salon owners can manage their bookings.

  ## New Tables
  
  ### `profiles`
  Extends auth.users with additional user information
  - `id` (uuid, primary key, references auth.users)
  - `email` (text)
  - `full_name` (text)
  - `phone` (text)
  - `role` (text) - 'customer' or 'salon_owner'
  - `avatar_url` (text, optional)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `salons`
  Stores hair salon information
  - `id` (uuid, primary key)
  - `owner_id` (uuid, references profiles) - salon owner
  - `name` (text) - salon name
  - `description` (text) - about the salon
  - `address` (text)
  - `phone` (text)
  - `email` (text)
  - `image_url` (text, optional) - salon photo
  - `opening_time` (time) - daily opening time
  - `closing_time` (time) - daily closing time
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `services`
  Services offered by each salon
  - `id` (uuid, primary key)
  - `salon_id` (uuid, references salons)
  - `name` (text) - service name (e.g., "Haircut", "Coloring")
  - `description` (text)
  - `duration_minutes` (integer) - how long the service takes
  - `price` (numeric) - service price
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `bookings`
  Customer appointment bookings
  - `id` (uuid, primary key)
  - `customer_id` (uuid, references profiles) - customer who booked
  - `salon_id` (uuid, references salons)
  - `service_id` (uuid, references services)
  - `booking_date` (date) - appointment date
  - `booking_time` (time) - appointment time
  - `status` (text) - 'pending', 'confirmed', 'cancelled', 'completed'
  - `notes` (text, optional) - customer notes
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  
  ### Row Level Security (RLS)
  All tables have RLS enabled with restrictive policies ensuring data access is properly controlled.

  ## Important Notes
  
  1. **Data Safety**: All operations use IF NOT EXISTS to prevent errors
  2. **Default Values**: Sensible defaults for timestamps, status fields
  3. **Foreign Keys**: Proper relationships with CASCADE deletes where appropriate
  4. **Indexes**: Added for performance on frequently queried columns
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  phone text DEFAULT '',
  role text DEFAULT 'customer' CHECK (role IN ('customer', 'salon_owner')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create salons table
CREATE TABLE IF NOT EXISTS salons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  address text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  image_url text,
  opening_time time DEFAULT '09:00:00',
  closing_time time DEFAULT '18:00:00',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE salons ENABLE ROW LEVEL SECURITY;

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid REFERENCES salons(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  duration_minutes integer DEFAULT 60,
  price numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  salon_id uuid REFERENCES salons(id) ON DELETE CASCADE NOT NULL,
  service_id uuid REFERENCES services(id) ON DELETE CASCADE NOT NULL,
  booking_date date NOT NULL,
  booking_time time NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_salons_owner ON salons(owner_id);
CREATE INDEX IF NOT EXISTS idx_services_salon ON services(salon_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_salon ON bookings(salon_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- RLS Policies for profiles
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for salons
CREATE POLICY "Anyone can view salons"
  ON salons FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Salon owners can create salons"
  ON salons FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = owner_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'salon_owner')
  );

CREATE POLICY "Salon owners can update own salons"
  ON salons FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Salon owners can delete own salons"
  ON salons FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- RLS Policies for services
CREATE POLICY "Anyone can view services"
  ON services FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Salon owners can create services for their salons"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM salons 
      WHERE salons.id = salon_id 
      AND salons.owner_id = auth.uid()
    )
  );

CREATE POLICY "Salon owners can update services for their salons"
  ON services FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM salons 
      WHERE salons.id = salon_id 
      AND salons.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM salons 
      WHERE salons.id = salon_id 
      AND salons.owner_id = auth.uid()
    )
  );

CREATE POLICY "Salon owners can delete services for their salons"
  ON services FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM salons 
      WHERE salons.id = salon_id 
      AND salons.owner_id = auth.uid()
    )
  );

-- RLS Policies for bookings
CREATE POLICY "Customers can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

CREATE POLICY "Salon owners can view bookings for their salons"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM salons 
      WHERE salons.id = salon_id 
      AND salons.owner_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update own pending bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = customer_id AND status = 'pending')
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Salon owners can update bookings for their salons"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM salons 
      WHERE salons.id = salon_id 
      AND salons.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM salons 
      WHERE salons.id = salon_id 
      AND salons.owner_id = auth.uid()
    )
  );

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_salons_updated_at ON salons;
CREATE TRIGGER update_salons_updated_at BEFORE UPDATE ON salons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();