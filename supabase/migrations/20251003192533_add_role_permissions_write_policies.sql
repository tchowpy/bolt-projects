/*
  # Add Write Policies for Role Permissions Management

  1. Purpose
    - Allow authenticated users to manage role_permissions
    - Enable dynamic permission assignment through UI
    
  2. Changes
    - Add INSERT policy for role_permissions
    - Add UPDATE policy for role_permissions
    - Add DELETE policy for role_permissions
    
  3. Security
    - All operations require authentication
    - In production, restrict to admin role only
*/

-- Add policies for role_permissions table
CREATE POLICY "Authenticated users can insert role permissions"
  ON role_permissions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update role permissions"
  ON role_permissions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete role permissions"
  ON role_permissions FOR DELETE
  TO authenticated
  USING (true);