/*
  # Create Groups and Group Members Tables

  1. New Tables
    - groups: Solidarity groups for group lending
    - group_members: Members of each group
    
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated access
*/

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_number text UNIQUE NOT NULL,
  name text NOT NULL,
  group_type text NOT NULL CHECK (group_type IN ('solidarity', 'village_banking', 'self_help')),
  meeting_day text NOT NULL,
  meeting_location text NOT NULL,
  leader_name text NOT NULL,
  leader_phone text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('leader', 'secretary', 'treasurer', 'member')),
  joined_at timestamptz DEFAULT now(),
  left_at timestamptz,
  UNIQUE(group_id, client_id)
);

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for groups
CREATE POLICY "Authenticated users can read all groups"
  ON groups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert groups"
  ON groups FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update groups"
  ON groups FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete groups"
  ON groups FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for group_members
CREATE POLICY "Authenticated users can read all group members"
  ON group_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert group members"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update group members"
  ON group_members FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete group members"
  ON group_members FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_groups_is_active ON groups(is_active);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_client ON group_members(client_id);