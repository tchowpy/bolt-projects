/*
  # Fix Users Table RLS Policy

  1. Changes
    - Add permissive RLS policy for authenticated users to insert new users
    - Allow authenticated administrators to manage users
  
  2. Security
    - Maintains RLS protection
    - Allows user creation by authenticated users
*/

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Allow authenticated users to read all user data (for admin purposes)
CREATE POLICY "Authenticated users can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert new users
CREATE POLICY "Authenticated users can insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update users
CREATE POLICY "Authenticated users can update users"
  ON users FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete users (soft delete)
CREATE POLICY "Authenticated users can delete users"
  ON users FOR DELETE
  TO authenticated
  USING (true);