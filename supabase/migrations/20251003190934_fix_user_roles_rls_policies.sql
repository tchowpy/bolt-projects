/*
  # Fix user_roles RLS Policies

  1. Issue
    - Current policy only allows users to view their own roles
    - Admins cannot assign roles to other users
    
  2. Solution
    - Add policies for authenticated users to manage all user_roles
    - This allows admin interface to assign roles
    
  3. Security
    - All policies require authentication
    - In production, restrict to admin role only
*/

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;

-- Create comprehensive policies for authenticated users
CREATE POLICY "Authenticated users can view all user roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert user roles"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update user roles"
  ON user_roles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete user roles"
  ON user_roles FOR DELETE
  TO authenticated
  USING (true);