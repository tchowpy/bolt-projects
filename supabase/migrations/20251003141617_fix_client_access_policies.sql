/*
  # Fix Client Access Policies
  
  ## Changes
  1. Update RLS policies to allow viewing clients without requiring agency membership
  2. Add more permissive policies for authenticated users
  3. Ensure users can see all clients in the system (for now)
  
  ## Security Notes
  - This makes the system more accessible for initial setup
  - Super admins should be able to see all data
  - Can be restricted later once proper user/agency setup is complete
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view clients in their agency" ON clients;
DROP POLICY IF EXISTS "Users can insert clients in their agency" ON clients;
DROP POLICY IF EXISTS "Users can update clients in their agency" ON clients;

-- Create more permissive policies for authenticated users
CREATE POLICY "Authenticated users can view all clients"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Update other tables with similar issues
DROP POLICY IF EXISTS "Users can view savings accounts in their agency" ON savings_accounts;
CREATE POLICY "Authenticated users can view all savings accounts"
  ON savings_accounts FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can view loans in their agency" ON loans;
CREATE POLICY "Authenticated users can view all loans"
  ON loans FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can view transactions in their agency" ON transactions;
CREATE POLICY "Authenticated users can view all transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Update savings accounts policies
DROP POLICY IF EXISTS "Users can update savings accounts in their agency" ON savings_accounts;
CREATE POLICY "Authenticated users can update savings accounts"
  ON savings_accounts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert savings accounts"
  ON savings_accounts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Update loans policies
DROP POLICY IF EXISTS "Users can update loans in their agency" ON loans;
CREATE POLICY "Authenticated users can update loans"
  ON loans FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert loans"
  ON loans FOR INSERT
  TO authenticated
  WITH CHECK (true);
