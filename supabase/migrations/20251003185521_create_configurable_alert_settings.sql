/*
  # Create Configurable Alert Settings

  1. New Table
    - alert_settings: Store configurable thresholds
    
  2. Default Configuration
    - Large transaction threshold: 5,000,000 XOF
    - Large withdrawal threshold: 3,000,000 XOF
    - Rapid transaction count: 3 transactions
    - Rapid transaction period: 1 hour
    
  3. Security
    - RLS enabled for authenticated users
    - Only one settings row (singleton pattern)
*/

-- Create alert_settings table
CREATE TABLE IF NOT EXISTS alert_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  large_transaction_threshold numeric DEFAULT 5000000,
  large_withdrawal_threshold numeric DEFAULT 3000000,
  rapid_transaction_count integer DEFAULT 3,
  rapid_transaction_period_minutes integer DEFAULT 60,
  enable_large_transaction_alert boolean DEFAULT true,
  enable_large_withdrawal_alert boolean DEFAULT true,
  enable_rapid_transaction_alert boolean DEFAULT true,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES staff(id)
);

-- Enable RLS
ALTER TABLE alert_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view alert settings"
  ON alert_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update alert settings"
  ON alert_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default settings (singleton row)
INSERT INTO alert_settings (
  large_transaction_threshold,
  large_withdrawal_threshold,
  rapid_transaction_count,
  rapid_transaction_period_minutes
)
VALUES (
  5000000,
  3000000,
  3,
  60
)
ON CONFLICT DO NOTHING;

-- Function to get alert settings (with fallback to defaults)
CREATE OR REPLACE FUNCTION get_alert_settings()
RETURNS TABLE (
  large_transaction_threshold numeric,
  large_withdrawal_threshold numeric,
  rapid_transaction_count integer,
  rapid_transaction_period_minutes integer,
  enable_large_transaction_alert boolean,
  enable_large_withdrawal_alert boolean,
  enable_rapid_transaction_alert boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.large_transaction_threshold,
    s.large_withdrawal_threshold,
    s.rapid_transaction_count,
    s.rapid_transaction_period_minutes,
    s.enable_large_transaction_alert,
    s.enable_large_withdrawal_alert,
    s.enable_rapid_transaction_alert
  FROM alert_settings s
  LIMIT 1;
  
  -- If no settings exist, return defaults
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      5000000::numeric,
      3000000::numeric,
      3::integer,
      60::integer,
      true::boolean,
      true::boolean,
      true::boolean;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Update transaction alert trigger to use configurable settings
CREATE OR REPLACE FUNCTION auto_create_transaction_alerts()
RETURNS TRIGGER AS $$
DECLARE
  v_recent_count INTEGER;
  v_client_name TEXT;
  v_settings RECORD;
BEGIN
  -- Get alert settings
  SELECT * INTO v_settings FROM get_alert_settings() LIMIT 1;
  
  -- Get client name for alert message
  SELECT first_name || ' ' || last_name INTO v_client_name
  FROM clients WHERE id = NEW.client_id;
  
  -- Alert 1: Large transaction (configurable threshold)
  IF v_settings.enable_large_transaction_alert AND NEW.amount > v_settings.large_transaction_threshold THEN
    INSERT INTO alerts (
      alert_type, 
      severity, 
      title, 
      message,
      resolved,
      is_read
    )
    VALUES (
      'limit_exceeded',
      'high',
      'Large Transaction Detected',
      'Transaction ' || NEW.transaction_number || ' for ' || 
      COALESCE(v_client_name, 'Unknown Client') || 
      ' exceeds ' || (v_settings.large_transaction_threshold / 1000000) || 'M XOF (Amount: ' || NEW.amount || ')',
      false,
      false
    );
  END IF;
  
  -- Alert 2: Rapid transactions (configurable count and period)
  IF v_settings.enable_rapid_transaction_alert THEN
    SELECT COUNT(*) INTO v_recent_count
    FROM transactions
    WHERE client_id = NEW.client_id
      AND created_at > NOW() - (v_settings.rapid_transaction_period_minutes || ' minutes')::INTERVAL;
      
    IF v_recent_count >= v_settings.rapid_transaction_count THEN
      INSERT INTO alerts (
        alert_type,
        severity,
        title,
        message,
        resolved,
        is_read
      )
      VALUES (
        'suspicious_activity',
        'critical',
        'Rapid Transaction Pattern',
        COALESCE(v_client_name, 'Unknown Client') || 
        ' has made ' || v_recent_count || ' transactions in the last ' || 
        v_settings.rapid_transaction_period_minutes || ' minutes',
        false,
        false
      );
    END IF;
  END IF;
  
  -- Alert 3: Large withdrawal (configurable threshold)
  IF v_settings.enable_large_withdrawal_alert AND 
     NEW.transaction_type = 'withdrawal' AND 
     NEW.amount > v_settings.large_withdrawal_threshold THEN
    INSERT INTO alerts (
      alert_type,
      severity,
      title,
      message,
      resolved,
      is_read
    )
    VALUES (
      'suspicious_activity',
      'high',
      'Large Withdrawal Alert',
      'Large withdrawal of ' || NEW.amount || ' XOF by ' ||
      COALESCE(v_client_name, 'Unknown Client') ||
      ' (Threshold: ' || v_settings.large_withdrawal_threshold || ')',
      false,
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger with updated function
DROP TRIGGER IF EXISTS trigger_auto_transaction_alerts ON transactions;
CREATE TRIGGER trigger_auto_transaction_alerts
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_transaction_alerts();