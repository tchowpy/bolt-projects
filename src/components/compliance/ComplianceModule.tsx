import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ComplianceCheck {
  id: string;
  check_type: string;
  status: string;
  score: number | null;
  checked_at: string;
  clients: {
    first_name: string;
    last_name: string;
    client_number: string;
  };
}

interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  is_read: boolean;
  resolved: boolean;
  created_at: string;
}

export function ComplianceModule() {
  const [checks, setChecks] = useState<ComplianceCheck[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('checks');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [checksResult, alertsResult] = await Promise.all([
        supabase
          .from('compliance_checks')
          .select('*, clients(first_name, last_name, client_number)')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('alerts')
          .select('*')
          .eq('resolved', false)
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      if (checksResult.error) throw checksResult.error;
      if (alertsResult.error) throw alertsResult.error;

      setChecks(checksResult.data || []);
      setAlerts(alertsResult.data || []);
    } catch (error) {
      console.error('Error loading compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalChecks: checks.length,
    passed: checks.filter(c => c.status === 'passed').length,
    failed: checks.filter(c => c.status === 'failed').length,
    pending: checks.filter(c => c.status === 'pending').length,
    criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Compliance & Risk Management</h2>
        <p className="text-gray-600 mt-1">Monitor KYC/AML compliance and system alerts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Total Checks"
          value={stats.totalChecks}
          icon={Shield}
          color="bg-blue-500"
        />
        <StatCard
          label="Passed"
          value={stats.passed}
          icon={CheckCircle}
          color="bg-green-500"
        />
        <StatCard
          label="Failed"
          value={stats.failed}
          icon={XCircle}
          color="bg-red-500"
        />
        <StatCard
          label="Critical Alerts"
          value={stats.criticalAlerts}
          icon={AlertTriangle}
          color="bg-orange-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 p-2">
            <TabButton
              active={activeTab === 'checks'}
              onClick={() => setActiveTab('checks')}
              label="Compliance Checks"
            />
            <TabButton
              active={activeTab === 'alerts'}
              onClick={() => setActiveTab('alerts')}
              label="System Alerts"
              badge={alerts.length}
            />
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'checks' && <ComplianceChecksTable checks={checks} onReload={loadData} />}
              {activeTab === 'alerts' && <AlertsTable alerts={alerts} onResolve={loadData} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{label}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function TabButton({ active, onClick, label, badge }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
        active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

function ComplianceChecksTable({ checks, onReload }: { checks: ComplianceCheck[]; onReload?: () => void }) {
  const handleApprove = async (checkId: string) => {
    try {
      const { error } = await supabase
        .from('compliance_checks')
        .update({ status: 'passed', checked_at: new Date().toISOString() })
        .eq('id', checkId);

      if (error) throw error;
      if (onReload) onReload();
    } catch (error) {
      console.error('Error approving check:', error);
    }
  };

  const handleReject = async (checkId: string) => {
    try {
      const { error } = await supabase
        .from('compliance_checks')
        .update({ status: 'failed', checked_at: new Date().toISOString() })
        .eq('id', checkId);

      if (error) throw error;
      if (onReload) onReload();
    } catch (error) {
      console.error('Error rejecting check:', error);
    }
  };
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Check Type</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Score</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {checks.map((check) => (
            <tr key={check.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4">
                <div className="font-medium text-gray-900">
                  {check.clients.first_name} {check.clients.last_name}
                </div>
                <div className="text-xs text-gray-500">{check.clients.client_number}</div>
              </td>
              <td className="py-3 px-4">
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium uppercase">
                  {check.check_type.replace('_', ' ')}
                </span>
              </td>
              <td className="py-3 px-4">
                {check.score !== null ? (
                  <span className="font-semibold text-gray-900">{check.score}/100</span>
                ) : (
                  <span className="text-gray-500">N/A</span>
                )}
              </td>
              <td className="py-3 px-4">
                <ComplianceStatusBadge status={check.status} />
              </td>
              <td className="py-3 px-4 text-gray-600 text-sm">
                {check.checked_at ? new Date(check.checked_at).toLocaleDateString() : 'Pending'}
              </td>
              <td className="py-3 px-4">
                {check.status === 'pending' || check.status === 'review_required' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(check.id)}
                      className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-xs font-medium transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(check.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs font-medium transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">Completed</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {checks.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No compliance checks found</p>
        </div>
      )}
    </div>
  );
}

function AlertsTable({ alerts, onResolve }: { alerts: Alert[]; onResolve: () => void }) {
  const handleResolve = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', alertId);

      if (error) throw error;
      onResolve();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`border-l-4 p-4 rounded-lg ${
            alert.severity === 'critical'
              ? 'border-red-500 bg-red-50'
              : alert.severity === 'high'
              ? 'border-orange-500 bg-orange-50'
              : alert.severity === 'medium'
              ? 'border-yellow-500 bg-yellow-50'
              : 'border-blue-500 bg-blue-50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <SeverityIcon severity={alert.severity} />
                <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                <span className="px-2 py-1 bg-white rounded text-xs font-medium uppercase">
                  {alert.alert_type.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
              <p className="text-xs text-gray-500">
                {new Date(alert.created_at).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => handleResolve(alert.id)}
              className="ml-4 px-3 py-1 bg-white hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Resolve
            </button>
          </div>
        </div>
      ))}

      {alerts.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-500">No active alerts</p>
        </div>
      )}
    </div>
  );
}

function ComplianceStatusBadge({ status }: { status: string }) {
  const configs: Record<string, any> = {
    passed: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
    failed: { color: 'bg-red-100 text-red-700', icon: XCircle },
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    review_required: { color: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3" />
      {status.replace('_', ' ').toUpperCase()}
    </span>
  );
}

function SeverityIcon({ severity }: { severity: string }) {
  const icons: Record<string, any> = {
    critical: <AlertTriangle className="w-5 h-5 text-red-600" />,
    high: <AlertTriangle className="w-5 h-5 text-orange-600" />,
    medium: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
    low: <AlertTriangle className="w-5 h-5 text-blue-600" />,
  };

  return icons[severity] || icons.low;
}
