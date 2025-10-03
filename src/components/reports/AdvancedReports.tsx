import { useState } from 'react';
import { BarChart3, FileText, Download, Calendar, TrendingUp, DollarSign, Users, AlertCircle } from 'lucide-react';

export function AdvancedReports() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const reportCategories = [
    {
      title: 'Financial Reports',
      icon: DollarSign,
      reports: [
        { id: 'balance_sheet', name: 'Balance Sheet', description: 'Assets, liabilities, and equity' },
        { id: 'income_statement', name: 'Income Statement', description: 'Revenue and expenses' },
        { id: 'cash_flow', name: 'Cash Flow Statement', description: 'Cash movements and liquidity' },
        { id: 'trial_balance', name: 'Trial Balance', description: 'Account balances verification' },
      ],
    },
    {
      title: 'Portfolio Reports',
      icon: TrendingUp,
      reports: [
        { id: 'portfolio_overview', name: 'Portfolio Overview', description: 'Complete portfolio summary' },
        { id: 'par_analysis', name: 'PAR Analysis', description: 'Portfolio at Risk detailed analysis' },
        { id: 'loan_aging', name: 'Loan Aging Report', description: 'Aging analysis of loans' },
        { id: 'collection_report', name: 'Collection Report', description: 'Payment collection performance' },
      ],
    },
    {
      title: 'Client Reports',
      icon: Users,
      reports: [
        { id: 'client_list', name: 'Client List', description: 'Complete client directory' },
        { id: 'client_activity', name: 'Client Activity', description: 'Transaction history by client' },
        { id: 'client_balances', name: 'Client Balances', description: 'Savings and loan balances' },
        { id: 'dormant_accounts', name: 'Dormant Accounts', description: 'Inactive account analysis' },
      ],
    },
    {
      title: 'Operational Reports',
      icon: BarChart3,
      reports: [
        { id: 'daily_transactions', name: 'Daily Transactions', description: 'Daily activity summary' },
        { id: 'agent_performance', name: 'Agent Performance', description: 'Staff productivity metrics' },
        { id: 'branch_performance', name: 'Branch Performance', description: 'Agency-wise performance' },
        { id: 'exception_report', name: 'Exception Report', description: 'Anomalies and exceptions' },
      ],
    },
    {
      title: 'Regulatory Reports',
      icon: FileText,
      reports: [
        { id: 'central_bank', name: 'Central Bank Report', description: 'Regulatory submission' },
        { id: 'audit_trail', name: 'Audit Trail', description: 'Complete transaction log' },
        { id: 'kyc_compliance', name: 'KYC Compliance', description: 'Client verification status' },
        { id: 'aml_report', name: 'AML Report', description: 'Anti-money laundering checks' },
      ],
    },
  ];

  const handleGenerateReport = () => {
    alert(`Generating ${selectedReport} report for ${dateRange.start} to ${dateRange.end}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Advanced Reports</h2>
        <p className="text-gray-600 mt-1">Generate comprehensive financial and operational reports</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="space-y-6">
          {reportCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.title} className="border-b border-gray-200 pb-6 last:border-0">
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.reports.map((report) => (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReport(report.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedReport === report.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{report.name}</h4>
                        {selectedReport === report.id && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{report.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {selectedReport && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleGenerateReport}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                >
                  <FileText className="w-5 h-5" />
                  Generate Report
                </button>

                <div className="flex gap-2">
                  <button className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg transition-colors">
                    <Download className="w-5 h-5" />
                    PDF
                  </button>
                  <button className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg transition-colors">
                    <Download className="w-5 h-5" />
                    Excel
                  </button>
                  <button className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg transition-colors">
                    <Download className="w-5 h-5" />
                    CSV
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <Calendar className="w-4 h-4 inline mr-2" />
                {dateRange.start && dateRange.end
                  ? `${dateRange.start} to ${dateRange.end}`
                  : 'Select date range'}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          icon={TrendingUp}
          label="Total Portfolio"
          value="25.8M CFA"
          change="+12.5%"
          positive
        />
        <KPICard
          icon={Users}
          label="Active Clients"
          value="1,234"
          change="+8.2%"
          positive
        />
        <KPICard
          icon={AlertCircle}
          label="PAR 30"
          value="2.8%"
          change="-0.5%"
          positive
        />
      </div>
    </div>
  );
}

function KPICard({ icon: Icon, label, value, change, positive }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="bg-blue-100 p-3 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <span className={`text-sm font-medium ${positive ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{label}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
