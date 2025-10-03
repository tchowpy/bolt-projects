/*
  # Automatic Compliance & Alert Triggers

  1. Auto-Compliance Checks
    - New client → Auto-create KYC check
    - New loan → Auto-create credit check and AML screening
    
  2. Auto-Alerts
    - Large transaction → Alert if > 5,000,000 XOF
    - Rapid transactions → Alert if 3+ transactions in 1 hour
    - Suspicious pattern → Alert on specific conditions
    
  3. Security
    - Triggers run automatically
    - No manual intervention needed
*/

-- Function: Auto-create compliance checks on new client
CREATE OR REPLACE FUNCTION auto_create_client_compliance_checks()
RETURNS TRIGGER AS $$
BEGIN
  -- Create KYC verification check
  INSERT INTO compliance_checks (client_id, check_type, status, details)
  VALUES (
    NEW.id,
    'kyc',
    'pending',
    '{"note": "Automatic KYC check for new client", "auto_generated": true}'::jsonb
  );
  
  -- Create document verification check
  INSERT INTO compliance_checks (client_id, check_type, status, details)
  VALUES (
    NEW.id,
    'document_verification',
    'pending',
    '{"note": "Verify ID and address documents", "auto_generated": true}'::jsonb
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: On client insert
DROP TRIGGER IF EXISTS trigger_auto_client_compliance ON clients;
CREATE TRIGGER trigger_auto_client_compliance
  AFTER INSERT ON clients
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_client_compliance_checks();

-- Function: Auto-create compliance checks on new loan
CREATE OR REPLACE FUNCTION auto_create_loan_compliance_checks()
RETURNS TRIGGER AS $$
BEGIN
  -- Create AML screening check
  INSERT INTO compliance_checks (client_id, check_type, status, details)
  VALUES (
    NEW.client_id,
    'aml',
    'pending',
    jsonb_build_object(
      'note', 'Automatic AML screening for loan application',
      'loan_id', NEW.id,
      'loan_amount', NEW.principal,
      'auto_generated', true
    )
  );
  
  -- Create credit score check
  INSERT INTO compliance_checks (client_id, check_type, status, details)
  VALUES (
    NEW.client_id,
    'credit_score',
    'pending',
    jsonb_build_object(
      'note', 'Credit assessment for loan approval',
      'loan_id', NEW.id,
      'requested_amount', NEW.principal,
      'auto_generated', true
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: On loan insert
DROP TRIGGER IF EXISTS trigger_auto_loan_compliance ON loans;
CREATE TRIGGER trigger_auto_loan_compliance
  AFTER INSERT ON loans
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_loan_compliance_checks();

-- Function: Auto-create alerts on suspicious transactions
CREATE OR REPLACE FUNCTION auto_create_transaction_alerts()
RETURNS TRIGGER AS $$
DECLARE
  v_recent_count INTEGER;
  v_client_name TEXT;
BEGIN
  -- Get client name for alert message
  SELECT first_name || ' ' || last_name INTO v_client_name
  FROM clients WHERE id = NEW.client_id;
  
  -- Alert 1: Large transaction (> 5,000,000 XOF)
  IF NEW.amount > 5000000 THEN
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
      ' exceeds 5M XOF (Amount: ' || NEW.amount || ')',
      false,
      false
    );
  END IF;
  
  -- Alert 2: Rapid transactions (3+ in last hour)
  SELECT COUNT(*) INTO v_recent_count
  FROM transactions
  WHERE client_id = NEW.client_id
    AND created_at > NOW() - INTERVAL '1 hour';
    
  IF v_recent_count >= 3 THEN
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
      ' has made ' || v_recent_count || ' transactions in the last hour',
      false,
      false
    );
  END IF;
  
  -- Alert 3: Large withdrawal (> 3,000,000 XOF)
  IF NEW.transaction_type = 'withdrawal' AND NEW.amount > 3000000 THEN
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
      COALESCE(v_client_name, 'Unknown Client'),
      false,
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: On transaction insert
DROP TRIGGER IF EXISTS trigger_auto_transaction_alerts ON transactions;
CREATE TRIGGER trigger_auto_transaction_alerts
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_transaction_alerts();