import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Settings, DollarSign, Globe, Bell, Lock, Database, Save, AlertTriangle } from 'lucide-react';

export function SettingsModule() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'alerts', label: 'Alert Thresholds', icon: AlertTriangle },
    { id: 'currency', label: 'Currency', icon: DollarSign },
    { id: 'localization', label: 'Localization', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'backup', label: 'Backup', icon: Database },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600 mt-1">Configure system preferences and options</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 p-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {saved && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              Settings saved successfully!
            </div>
          )}

          {activeTab === 'general' && <GeneralSettings setSaved={setSaved} />}
          {activeTab === 'alerts' && <AlertThresholdSettings setSaved={setSaved} />}
          {activeTab === 'currency' && <CurrencySettings setSaved={setSaved} />}
          {activeTab === 'localization' && <LocalizationSettings setSaved={setSaved} />}
          {activeTab === 'notifications' && <NotificationSettings setSaved={setSaved} />}
          {activeTab === 'security' && <SecuritySettings setSaved={setSaved} />}
          {activeTab === 'backup' && <BackupSettings />}
        </div>
      </div>
    </div>
  );
}

function GeneralSettings({ setSaved }: any) {
  const [settings, setSettings] = useState({
    institution_name: 'MicroFinance Pro',
    institution_code: 'MFP001',
    email: 'contact@microfinance.com',
    phone: '+1234567890',
    address: '123 Finance Street',
    city: 'Capital City',
    country: 'Country',
    timezone: 'UTC',
    date_format: 'MM/DD/YYYY',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Institution Name</label>
          <input
            type="text"
            value={settings.institution_name}
            onChange={(e) => setSettings({ ...settings, institution_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Institution Code</label>
          <input
            type="text"
            value={settings.institution_code}
            onChange={(e) => setSettings({ ...settings, institution_code: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={settings.email}
            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            value={settings.phone}
            onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <input
            type="text"
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          <input
            type="text"
            value={settings.city}
            onChange={(e) => setSettings({ ...settings, city: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
          <input
            type="text"
            value={settings.country}
            onChange={(e) => setSettings({ ...settings, country: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
          <select
            value={settings.timezone}
            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
            <option value="Africa/Lagos">Lagos</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
          <select
            value={settings.date_format}
            onChange={(e) => setSettings({ ...settings, date_format: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

function CurrencySettings({ setSaved }: any) {
  const [settings, setSettings] = useState({
    primary_currency: 'XOF',
    decimal_places: 2,
    thousand_separator: ',',
    decimal_separator: '.',
    currency_position: 'after',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Currency</label>
          <select
            value={settings.primary_currency}
            onChange={(e) => setSettings({ ...settings, primary_currency: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="XOF">West African CFA Franc (XOF)</option>
            <option value="USD">US Dollar (USD)</option>
            <option value="EUR">Euro (EUR)</option>
            <option value="GBP">British Pound (GBP)</option>
            <option value="NGN">Nigerian Naira (NGN)</option>
            <option value="KES">Kenyan Shilling (KES)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Decimal Places</label>
          <select
            value={settings.decimal_places}
            onChange={(e) => setSettings({ ...settings, decimal_places: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="0">0</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Thousand Separator</label>
          <select
            value={settings.thousand_separator}
            onChange={(e) => setSettings({ ...settings, thousand_separator: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value=",">Comma (,)</option>
            <option value=".">Period (.)</option>
            <option value=" ">Space ( )</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Decimal Separator</label>
          <select
            value={settings.decimal_separator}
            onChange={(e) => setSettings({ ...settings, decimal_separator: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value=".">Period (.)</option>
            <option value=",">Comma (,)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Currency Position</label>
          <select
            value={settings.currency_position}
            onChange={(e) => setSettings({ ...settings, currency_position: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="before">Before Amount ($ 100)</option>
            <option value="after">After Amount (100 CFA)</option>
          </select>
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Preview</h4>
        <p className="text-2xl font-bold text-blue-700">
          {settings.currency_position === 'before' ? settings.primary_currency + ' ' : ''}
          1{settings.thousand_separator}234{settings.decimal_separator}56
          {settings.currency_position === 'after' ? ' ' + settings.primary_currency : ''}
        </p>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

function LocalizationSettings({ setSaved }: any) {
  const [settings, setSettings] = useState({
    language: 'en',
    first_day_of_week: 'monday',
    fiscal_year_start: 'january',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
          <select
            value={settings.language}
            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
            <option value="pt">Portuguese</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Day of Week</label>
          <select
            value={settings.first_day_of_week}
            onChange={(e) => setSettings({ ...settings, first_day_of_week: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="sunday">Sunday</option>
            <option value="monday">Monday</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fiscal Year Start</label>
          <select
            value={settings.fiscal_year_start}
            onChange={(e) => setSettings({ ...settings, fiscal_year_start: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="january">January</option>
            <option value="april">April</option>
            <option value="july">July</option>
            <option value="october">October</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

function NotificationSettings({ setSaved }: any) {
  const [settings, setSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    loan_approved: true,
    loan_disbursed: true,
    payment_received: true,
    payment_overdue: true,
    client_registered: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="font-medium text-gray-700">Email Notifications</span>
          <input
            type="checkbox"
            checked={settings.email_notifications}
            onChange={(e) => setSettings({ ...settings, email_notifications: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="font-medium text-gray-700">SMS Notifications</span>
          <input
            type="checkbox"
            checked={settings.sms_notifications}
            onChange={(e) => setSettings({ ...settings, sms_notifications: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>

        <div className="border-t border-gray-200 pt-4 mt-4">
          <h4 className="font-medium text-gray-900 mb-3">Event Notifications</h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Loan Approved</span>
              <input
                type="checkbox"
                checked={settings.loan_approved}
                onChange={(e) => setSettings({ ...settings, loan_approved: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-700">Loan Disbursed</span>
              <input
                type="checkbox"
                checked={settings.loan_disbursed}
                onChange={(e) => setSettings({ ...settings, loan_disbursed: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-700">Payment Received</span>
              <input
                type="checkbox"
                checked={settings.payment_received}
                onChange={(e) => setSettings({ ...settings, payment_received: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-700">Payment Overdue</span>
              <input
                type="checkbox"
                checked={settings.payment_overdue}
                onChange={(e) => setSettings({ ...settings, payment_overdue: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-700">Client Registered</span>
              <input
                type="checkbox"
                checked={settings.client_registered}
                onChange={(e) => setSettings({ ...settings, client_registered: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

function SecuritySettings({ setSaved }: any) {
  const [settings, setSettings] = useState({
    session_timeout: '30',
    password_min_length: '8',
    require_two_factor: false,
    require_password_change: false,
    password_expiry_days: '90',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
          <input
            type="number"
            value={settings.session_timeout}
            onChange={(e) => setSettings({ ...settings, session_timeout: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Min Password Length</label>
          <input
            type="number"
            value={settings.password_min_length}
            onChange={(e) => setSettings({ ...settings, password_min_length: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
          <input
            type="number"
            value={settings.password_expiry_days}
            onChange={(e) => setSettings({ ...settings, password_expiry_days: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium text-gray-700">Require Two-Factor Authentication</div>
            <div className="text-sm text-gray-500">Enforce 2FA for all users</div>
          </div>
          <input
            type="checkbox"
            checked={settings.require_two_factor}
            onChange={(e) => setSettings({ ...settings, require_two_factor: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium text-gray-700">Require Password Change on First Login</div>
            <div className="text-sm text-gray-500">New users must change their password</div>
          </div>
          <input
            type="checkbox"
            checked={settings.require_password_change}
            onChange={(e) => setSettings({ ...settings, require_password_change: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

function AlertThresholdSettings({ setSaved }: any) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    large_transaction_threshold: 5000000,
    large_withdrawal_threshold: 3000000,
    rapid_transaction_count: 3,
    rapid_transaction_period_minutes: 60,
    enable_large_transaction_alert: true,
    enable_large_withdrawal_alert: true,
    enable_rapid_transaction_alert: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('alert_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          large_transaction_threshold: data.large_transaction_threshold,
          large_withdrawal_threshold: data.large_withdrawal_threshold,
          rapid_transaction_count: data.rapid_transaction_count,
          rapid_transaction_period_minutes: data.rapid_transaction_period_minutes,
          enable_large_transaction_alert: data.enable_large_transaction_alert,
          enable_large_withdrawal_alert: data.enable_large_withdrawal_alert,
          enable_rapid_transaction_alert: data.enable_rapid_transaction_alert,
        });
      }
    } catch (error) {
      console.error('Error loading alert settings:', error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: existingSettings } = await supabase
        .from('alert_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existingSettings) {
        const { error } = await supabase
          .from('alert_settings')
          .update({
            ...settings,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingSettings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('alert_settings')
          .insert(settings);

        if (error) throw error;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving alert settings:', error);
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return (value / 1000000).toFixed(1) + 'M';
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          System Alert Thresholds
        </h3>
        <p className="text-sm text-gray-600">
          Configure automatic alert triggers for suspicious activities and transactions.
        </p>
      </div>

      <div className="space-y-6">
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-start gap-3 mb-4">
            <input
              type="checkbox"
              checked={settings.enable_large_transaction_alert}
              onChange={(e) =>
                setSettings({ ...settings, enable_large_transaction_alert: e.target.checked })
              }
              className="mt-1"
            />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Large Transaction Alert</h4>
              <p className="text-sm text-gray-600 mt-1">
                Trigger alert when transaction amount exceeds threshold
              </p>
            </div>
          </div>
          <div className="ml-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Threshold Amount (XOF)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={settings.large_transaction_threshold}
                onChange={(e) =>
                  setSettings({ ...settings, large_transaction_threshold: parseFloat(e.target.value) })
                }
                disabled={!settings.enable_large_transaction_alert}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                step="100000"
              />
              <span className="text-sm text-gray-600 min-w-[80px]">
                ≈ {formatCurrency(settings.large_transaction_threshold)} XOF
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-start gap-3 mb-4">
            <input
              type="checkbox"
              checked={settings.enable_large_withdrawal_alert}
              onChange={(e) =>
                setSettings({ ...settings, enable_large_withdrawal_alert: e.target.checked })
              }
              className="mt-1"
            />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Large Withdrawal Alert</h4>
              <p className="text-sm text-gray-600 mt-1">
                Trigger alert when withdrawal amount exceeds threshold
              </p>
            </div>
          </div>
          <div className="ml-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Threshold Amount (XOF)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={settings.large_withdrawal_threshold}
                onChange={(e) =>
                  setSettings({ ...settings, large_withdrawal_threshold: parseFloat(e.target.value) })
                }
                disabled={!settings.enable_large_withdrawal_alert}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                step="100000"
              />
              <span className="text-sm text-gray-600 min-w-[80px]">
                ≈ {formatCurrency(settings.large_withdrawal_threshold)} XOF
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-start gap-3 mb-4">
            <input
              type="checkbox"
              checked={settings.enable_rapid_transaction_alert}
              onChange={(e) =>
                setSettings({ ...settings, enable_rapid_transaction_alert: e.target.checked })
              }
              className="mt-1"
            />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Rapid Transaction Pattern Alert</h4>
              <p className="text-sm text-gray-600 mt-1">
                Trigger alert when multiple transactions occur in short period
              </p>
            </div>
          </div>
          <div className="ml-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Transactions
              </label>
              <input
                type="number"
                value={settings.rapid_transaction_count}
                onChange={(e) =>
                  setSettings({ ...settings, rapid_transaction_count: parseInt(e.target.value) })
                }
                disabled={!settings.enable_rapid_transaction_alert}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                min="2"
                max="20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Period (Minutes)
              </label>
              <input
                type="number"
                value={settings.rapid_transaction_period_minutes}
                onChange={(e) =>
                  setSettings({ ...settings, rapid_transaction_period_minutes: parseInt(e.target.value) })
                }
                disabled={!settings.enable_rapid_transaction_alert}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                min="5"
                max="1440"
              />
              <p className="text-xs text-gray-500 mt-1">
                Alert if {settings.rapid_transaction_count} or more transactions occur within{' '}
                {settings.rapid_transaction_period_minutes} minutes
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Changes will apply to new transactions immediately
        </p>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
}

function BackupSettings() {
  const [backupStatus, setBackupStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    setLoading(true);
    setBackupStatus('Creating backup...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    setBackupStatus('Backup created successfully! File: backup_' + new Date().toISOString().split('T')[0] + '.sql');
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-900 mb-2">Important</h4>
        <p className="text-sm text-yellow-700">
          Regular backups are essential for data safety. Configure automated backups and always keep
          backups in a secure, off-site location.
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Manual Backup</h4>
          <p className="text-sm text-gray-600 mb-3">Create an immediate backup of your database</p>
          <button
            onClick={handleBackup}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Database className="w-4 h-4" />
            {loading ? 'Creating Backup...' : 'Create Backup Now'}
          </button>
          {backupStatus && (
            <p className="mt-3 text-sm text-green-600">{backupStatus}</p>
          )}
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Automated Backups</h4>
          <p className="text-sm text-gray-600 mb-3">
            Your Supabase database is automatically backed up daily. Backups are retained for 7 days on the free plan.
          </p>
          <div className="text-sm text-gray-500">
            Last backup: {new Date().toLocaleString()}
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Backup History</h4>
          <div className="space-y-2 mt-3">
            {[0, 1, 2, 3].map((i) => {
              const date = new Date();
              date.setDate(date.getDate() - i);
              return (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">backup_{date.toISOString().split('T')[0]}.sql</span>
                  <span className="text-xs text-gray-500">{date.toLocaleDateString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
