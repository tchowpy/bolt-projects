/*
  # Restore Staff to Auth.Users Link

  1. Purpose
    - Restore FK constraint between staff.id and auth.users.id
    - Enable proper authentication for staff members
    
  2. Changes
    - Add back the foreign key constraint
    - Ensure staff.id references auth.users(id)
    
  3. Rationale
    - Staff members need to be able to login
    - Supabase Auth is used for authentication
    - staff.id must match auth.users.id for proper auth
*/

-- Add foreign key constraint linking staff.id to auth.users.id
ALTER TABLE staff
ADD CONSTRAINT staff_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;