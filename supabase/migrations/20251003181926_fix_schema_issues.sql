/*
  # Fix Schema Issues

  1. Changes
    - Add default UUID generation for users table ID
    - Add missing collateral columns to loans table
    - Add missing purpose column to loans table
    
  2. Security
    - Maintains existing RLS policies
*/

-- Fix users table - add default UUID for ID
ALTER TABLE users 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Add missing columns to loans table
DO $$ 
BEGIN
  -- Add purpose column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' AND column_name = 'purpose'
  ) THEN
    ALTER TABLE loans ADD COLUMN purpose text;
  END IF;

  -- Add collateral column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' AND column_name = 'collateral'
  ) THEN
    ALTER TABLE loans ADD COLUMN collateral text;
  END IF;

  -- Add rejection_reason column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE loans ADD COLUMN rejection_reason text;
  END IF;
END $$;