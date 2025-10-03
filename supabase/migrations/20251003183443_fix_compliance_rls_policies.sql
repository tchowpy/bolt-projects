/*
  # Fix Compliance RLS Policies

  1. Changes
    - Drop restrictive policy on compliance_checks
    - Add permissive policy for authenticated users
    - Same for alerts table
    
  2. Security
    - Maintains authentication requirement
    - Allows viewing all compliance data
*/

-- Fix compliance_checks policies
DROP POLICY IF EXISTS "Users can view compliance checks in their agency" ON compliance_checks;

CREATE POLICY "Authenticated users can view all compliance checks"
  ON compliance_checks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update compliance checks"
  ON compliance_checks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert compliance checks"
  ON compliance_checks FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Fix alerts policies if needed
DROP POLICY IF EXISTS "Users can view alerts in their agency" ON alerts;

CREATE POLICY "Authenticated users can view all alerts"
  ON alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update alerts"
  ON alerts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert alerts"
  ON alerts FOR INSERT
  TO authenticated
  WITH CHECK (true);