/*
  # Fix Staff Table - Remove auth.users FK Constraint

  1. Issue
    - staff.id has FK constraint to auth.users(id)
    - Prevents direct INSERT into staff without creating auth user first
    
  2. Solution
    - Remove FK constraint "users_id_fkey"
    - Allow staff table to be independent
    - ID will be auto-generated via gen_random_uuid()
    
  3. Rationale
    - Staff table doesn't need to be linked to auth.users
    - Application manages staff separately
    - Simpler user management without auth complexity
*/

-- Drop the FK constraint linking staff.id to auth.users.id
ALTER TABLE staff 
DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Ensure ID has proper default
ALTER TABLE staff 
ALTER COLUMN id SET DEFAULT gen_random_uuid();