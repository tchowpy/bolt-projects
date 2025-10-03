import { BarChart3, Download, FileText, TrendingUp } from 'lucide-react';

export function ReportsModule() {
  const reports = [
    {
      title: 'Portfolio Performance',
      description: 'Overview of loan and savings portfolio',
      icon: TrendingUp,
      color: 'bg-blue-500',
    },
    {
      title: 'Client Activity Report',
      description: 'Client transactions and account status',
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      title: 'PAR Report',
      description: 'Portfolio at Risk analysis',
      icon: BarChart3,
      color: 'bg-orange-500',
    },
    {
      title: 'Financial Statements',
      description: 'Balance sheet and income statement',
      icon: FileText,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <p className="text-gray-600 mt-1">Generate and export financial reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <div
              key={report.title}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className={`${report.color} p-3 rounded-lg inline-block mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{report.description}</p>
              <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                <Download className="w-4 h-4" />
                Generate Report
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
