/*
  # Accounting and Compliance Schema
  
  ## New Tables
  - chart_of_accounts: Complete accounting chart
  - journal_entries: Double-entry accounting transactions
  - journal_entry_lines: Individual debit/credit lines
  - compliance_checks: KYC/AML compliance tracking
  - alerts: System alerts for risks and anomalies
  - notifications: User notifications (SMS, Email, Push)
  - system_settings: Global configuration
  
  ## Security
  - RLS enabled on all tables
  - Appropriate policies for each table
*/

CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_code text UNIQUE NOT NULL,
  account_name text NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  parent_account_id uuid REFERENCES chart_of_accounts(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chart of accounts"
  ON chart_of_accounts FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_number text UNIQUE NOT NULL,
  entry_date date NOT NULL,
  description text NOT NULL,
  reference_type text,
  reference_id uuid,
  agency_id uuid REFERENCES agencies(id),
  created_by uuid REFERENCES users(id),
  posted boolean DEFAULT false,
  posted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view journal entries in their agency"
  ON journal_entries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.agency_id = journal_entries.agency_id
    )
  );

CREATE TABLE IF NOT EXISTS journal_entry_lines (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_entry_id uuid REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id uuid REFERENCES chart_of_accounts(id),
  debit numeric(15,2) DEFAULT 0,
  credit numeric(15,2) DEFAULT 0,
  description text,
  created_at timestamptz DEFAULT now(),
  CHECK (debit >= 0 AND credit >= 0),
  CHECK (debit = 0 OR credit = 0)
);

ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view journal entry lines"
  ON journal_entry_lines FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM journal_entries je
      JOIN users u ON u.agency_id = je.agency_id
      WHERE u.id = auth.uid()
      AND je.id = journal_entry_lines.journal_entry_id
    )
  );

CREATE TABLE IF NOT EXISTS compliance_checks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  check_type text NOT NULL CHECK (check_type IN ('kyc', 'aml', 'credit_score', 'document_verification')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'passed', 'failed', 'review_required')),
  score integer,
  details jsonb,
  checked_by uuid REFERENCES users(id),
  checked_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE compliance_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view compliance checks in their agency"
  ON compliance_checks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients c
      JOIN users u ON u.agency_id = c.agency_id
      WHERE u.id = auth.uid()
      AND c.id = compliance_checks.client_id
    )
  );

CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_type text NOT NULL CHECK (alert_type IN ('overdue_loan', 'low_balance', 'kyc_expiry', 'suspicious_activity', 'limit_exceeded')),
  severity text DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title text NOT NULL,
  message text NOT NULL,
  entity_type text,
  entity_id uuid,
  agency_id uuid REFERENCES agencies(id),
  is_read boolean DEFAULT false,
  resolved boolean DEFAULT false,
  resolved_by uuid REFERENCES users(id),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view alerts in their agency"
  ON alerts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.agency_id = alerts.agency_id
    )
  );

CREATE POLICY "Users can update alerts in their agency"
  ON alerts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.agency_id = alerts.agency_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.agency_id = alerts.agency_id
    )
  );

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('sms', 'email', 'push', 'in_app')),
  title text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'read')),
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Clients can view their notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = notifications.client_id
    )
  );

CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  category text NOT NULL,
  description text,
  updated_by uuid REFERENCES users(id),
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view settings"
  ON system_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'super_admin')
    )
  );

CREATE INDEX IF NOT EXISTS idx_journal_entries_agency ON journal_entries(agency_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_client ON compliance_checks(client_id);
CREATE INDEX IF NOT EXISTS idx_alerts_agency ON alerts(agency_id);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_client ON notifications(client_id);

INSERT INTO chart_of_accounts (account_code, account_name, account_type) VALUES
  ('1000', 'Assets', 'asset'),
  ('1100', 'Cash and Bank', 'asset'),
  ('1200', 'Loans Receivable', 'asset'),
  ('1300', 'Interest Receivable', 'asset'),
  ('2000', 'Liabilities', 'liability'),
  ('2100', 'Client Deposits', 'liability'),
  ('2200', 'Accounts Payable', 'liability'),
  ('3000', 'Equity', 'equity'),
  ('3100', 'Capital', 'equity'),
  ('3200', 'Retained Earnings', 'equity'),
  ('4000', 'Revenue', 'revenue'),
  ('4100', 'Interest Income', 'revenue'),
  ('4200', 'Fee Income', 'revenue'),
  ('5000', 'Expenses', 'expense'),
  ('5100', 'Operating Expenses', 'expense'),
  ('5200', 'Interest Expense', 'expense')
ON CONFLICT (account_code) DO NOTHING;