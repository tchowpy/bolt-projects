/*
  # Seed Permissions Data

  1. Purpose
    - Create comprehensive permission set for microfinance system
    - Define granular access control for all modules
    
  2. Permission Structure
    - Module-based organization (clients, loans, transactions, etc.)
    - CRUD actions (create, read, update, delete)
    - Special actions (approve, export, etc.)
    
  3. Modules Covered
    - Clients Management
    - Loans Management
    - Transactions
    - Savings/Deposits
    - Groups
    - Reports
    - Administration
    - Settings
*/

-- Create permissions for all system modules
INSERT INTO permissions (module, action, description) VALUES
  -- Clients Module
  ('clients', 'create', 'Create new clients'),
  ('clients', 'read', 'View client information'),
  ('clients', 'update', 'Edit client information'),
  ('clients', 'delete', 'Delete clients'),
  ('clients', 'export', 'Export client data'),
  
  -- Loans Module
  ('loans', 'create', 'Create new loans'),
  ('loans', 'read', 'View loan information'),
  ('loans', 'update', 'Edit loan details'),
  ('loans', 'delete', 'Delete loans'),
  ('loans', 'approve', 'Approve loan applications'),
  ('loans', 'disburse', 'Disburse approved loans'),
  ('loans', 'restructure', 'Restructure existing loans'),
  
  -- Transactions Module
  ('transactions', 'create', 'Create transactions'),
  ('transactions', 'read', 'View transactions'),
  ('transactions', 'update', 'Edit transactions'),
  ('transactions', 'delete', 'Delete transactions'),
  ('transactions', 'reverse', 'Reverse transactions'),
  
  -- Savings Module
  ('savings', 'create', 'Create savings accounts'),
  ('savings', 'read', 'View savings information'),
  ('savings', 'update', 'Edit savings accounts'),
  ('savings', 'delete', 'Delete savings accounts'),
  ('savings', 'deposit', 'Make deposits'),
  ('savings', 'withdraw', 'Make withdrawals'),
  
  -- Groups Module
  ('groups', 'create', 'Create client groups'),
  ('groups', 'read', 'View group information'),
  ('groups', 'update', 'Edit groups'),
  ('groups', 'delete', 'Delete groups'),
  ('groups', 'manage_members', 'Manage group members'),
  
  -- Reports Module
  ('reports', 'view_financial', 'View financial reports'),
  ('reports', 'view_operational', 'View operational reports'),
  ('reports', 'view_compliance', 'View compliance reports'),
  ('reports', 'export', 'Export reports'),
  ('reports', 'schedule', 'Schedule automated reports'),
  
  -- Administration Module
  ('admin', 'manage_users', 'Manage system users'),
  ('admin', 'manage_roles', 'Manage roles and permissions'),
  ('admin', 'manage_agencies', 'Manage branches/agencies'),
  ('admin', 'view_audit_log', 'View system audit logs'),
  ('admin', 'manage_products', 'Manage financial products'),
  
  -- Settings Module
  ('settings', 'view', 'View system settings'),
  ('settings', 'update', 'Update system settings'),
  ('settings', 'manage_currencies', 'Manage currencies'),
  ('settings', 'manage_notifications', 'Configure notifications'),
  
  -- Compliance Module
  ('compliance', 'view', 'View compliance data'),
  ('compliance', 'update', 'Update compliance information'),
  ('compliance', 'generate_reports', 'Generate compliance reports'),
  ('compliance', 'review', 'Review compliance cases')
ON CONFLICT DO NOTHING;

-- Assign default permissions to system roles

-- Super Admin: All permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  r.id,
  p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- Admin: Most permissions except super admin specific ones
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  r.id,
  p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
  AND p.action != 'delete'
ON CONFLICT DO NOTHING;

-- Manager: Read and update most, approve loans
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  r.id,
  p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'manager'
  AND p.action IN ('read', 'update', 'approve', 'view', 'view_financial', 'view_operational', 'export')
ON CONFLICT DO NOTHING;

-- Agent: Basic operations (create, read, update for clients, transactions, savings)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  r.id,
  p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'agent'
  AND p.module IN ('clients', 'transactions', 'savings', 'loans')
  AND p.action IN ('create', 'read', 'update', 'deposit', 'withdraw')
ON CONFLICT DO NOTHING;

-- Client: Read only their own data (handled separately in application logic)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  r.id,
  p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'client'
  AND p.action = 'read'
  AND p.module IN ('loans', 'savings', 'transactions')
ON CONFLICT DO NOTHING;