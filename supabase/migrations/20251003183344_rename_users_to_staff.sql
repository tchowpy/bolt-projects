/*
  # Rename users table to staff

  1. Changes
    - Rename public.users to staff to avoid conflict with auth.users
    - Update all foreign key references
    - Update RLS policies
    
  2. Security
    - Maintains all existing RLS policies
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can read all users" ON users;
DROP POLICY IF EXISTS "Authenticated users can insert users" ON users;
DROP POLICY IF EXISTS "Authenticated users can update users" ON users;
DROP POLICY IF EXISTS "Authenticated users can delete users" ON users;

-- Rename table
ALTER TABLE IF EXISTS users RENAME TO staff;

-- Recreate policies on staff table
CREATE POLICY "Authenticated users can read all staff"
  ON staff FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert staff"
  ON staff FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update staff"
  ON staff FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete staff"
  ON staff FOR DELETE
  TO authenticated
  USING (true);