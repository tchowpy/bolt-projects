import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { BarChart3, Download, FileText, TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';

export function ReportsModule() {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [generating, setGenerating] = useState<string>('');

  const reports = [
    {
      id: 'portfolio',
      title: 'Portfolio Performance',
      description: 'Overview of loan and savings portfolio',
      icon: TrendingUp,
      color: 'bg-blue-500',
    },
    {
      id: 'client_activity',
      title: 'Client Activity Report',
      description: 'Client transactions and account status',
      icon: Users,
      color: 'bg-green-500',
    },
    {
      id: 'par',
      title: 'PAR Report',
      description: 'Portfolio at Risk analysis',
      icon: BarChart3,
      color: 'bg-orange-500',
    },
    {
      id: 'financial',
      title: 'Financial Statements',
      description: 'Balance sheet and income statement',
      icon: DollarSign,
      color: 'bg-purple-500',
    },
    {
      id: 'transactions',
      title: 'Transaction Summary',
      description: 'Detailed transaction history',
      icon: FileText,
      color: 'bg-teal-500',
    },
    {
      id: 'aging',
      title: 'Aging Report',
      description: 'Overdue loans analysis',
      icon: Calendar,
      color: 'bg-red-500',
    },
  ];

  const handleGenerateReport = async (reportId: string) => {
    setGenerating(reportId);

    try {
      let data;
      let filename;

      switch (reportId) {
        case 'portfolio':
          data = await generatePortfolioReport();
          filename = 'portfolio_performance';
          break;
        case 'client_activity':
          data = await generateClientActivityReport();
          filename = 'client_activity';
          break;
        case 'par':
          data = await generatePARReport();
          filename = 'par_report';
          break;
        case 'financial':
          data = await generateFinancialReport();
          filename = 'financial_statements';
          break;
        case 'transactions':
          data = await generateTransactionReport();
          filename = 'transaction_summary';
          break;
        case 'aging':
          data = await generateAgingReport();
          filename = 'aging_report';
          break;
        default:
          data = [];
          filename = 'report';
      }

      downloadCSV(data, filename);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setGenerating('');
    }
  };

  const generatePortfolioReport = async () => {
    const [loansRes, savingsRes] = await Promise.all([
      supabase.from('loans').select('principal, outstanding_balance, status'),
      supabase.from('savings_accounts').select('balance'),
    ]);

    const totalLoans = loansRes.data?.reduce((sum, l) => sum + Number(l.principal), 0) || 0;
    const outstanding = loansRes.data?.reduce((sum, l) => sum + Number(l.outstanding_balance), 0) || 0;
    const activeLoans = loansRes.data?.filter(l => l.status === 'active').length || 0;
    const totalSavings = savingsRes.data?.reduce((sum, s) => sum + Number(s.balance), 0) || 0;

    return [
      { Metric: 'Total Loans Disbursed', Value: totalLoans, Unit: 'CFA' },
      { Metric: 'Outstanding Balance', Value: outstanding, Unit: 'CFA' },
      { Metric: 'Active Loans', Value: activeLoans, Unit: 'count' },
      { Metric: 'Total Savings', Value: totalSavings, Unit: 'CFA' },
      { Metric: 'Portfolio Health', Value: ((1 - outstanding/totalLoans) * 100).toFixed(2), Unit: '%' },
    ];
  };

  const generateClientActivityReport = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('client_number, first_name, last_name, is_active, created_at');

    if (error) throw error;

    return (data || []).map(c => ({
      'Client #': c.client_number,
      'Name': `${c.first_name} ${c.last_name}`,
      'Status': c.is_active ? 'Active' : 'Inactive',
      'Registered': new Date(c.created_at).toLocaleDateString(),
    }));
  };

  const generatePARReport = async () => {
    const { data, error } = await supabase
      .from('loans')
      .select('loan_number, outstanding_balance, status, disbursement_date')
      .in('status', ['active', 'overdue']);

    if (error) throw error;

    return (data || []).map(l => {
      const daysSince = l.disbursement_date
        ? Math.floor((Date.now() - new Date(l.disbursement_date).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        'Loan #': l.loan_number,
        'Outstanding': l.outstanding_balance,
        'Status': l.status,
        'Days Since Disbursement': daysSince,
        'Risk Level': daysSince > 90 ? 'High' : daysSince > 30 ? 'Medium' : 'Low',
      };
    });
  };

  const generateFinancialReport = async () => {
    const [loansRes, savingsRes, transRes] = await Promise.all([
      supabase.from('loans').select('principal, outstanding_balance'),
      supabase.from('savings_accounts').select('balance'),
      supabase.from('transactions').select('amount, transaction_type'),
    ]);

    const totalAssets = (savingsRes.data?.reduce((sum, s) => sum + Number(s.balance), 0) || 0);
    const loansReceivable = (loansRes.data?.reduce((sum, l) => sum + Number(l.outstanding_balance), 0) || 0);
    const deposits = transRes.data?.filter(t => t.transaction_type === 'deposit').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const withdrawals = transRes.data?.filter(t => t.transaction_type === 'withdrawal').reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    return [
      { Category: 'Assets', Item: 'Cash and Savings', Amount: totalAssets },
      { Category: 'Assets', Item: 'Loans Receivable', Amount: loansReceivable },
      { Category: 'Income', Item: 'Deposits', Amount: deposits },
      { Category: 'Expenses', Item: 'Withdrawals', Amount: withdrawals },
      { Category: 'Net', Item: 'Net Position', Amount: deposits - withdrawals },
    ];
  };

  const generateTransactionReport = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        transaction_number,
        transaction_type,
        amount,
        processed_at,
        clients (first_name, last_name)
      `)
      .gte('processed_at', dateRange.start)
      .lte('processed_at', dateRange.end)
      .order('processed_at', { ascending: false })
      .limit(1000);

    if (error) throw error;

    return (data || []).map(t => ({
      'Transaction #': t.transaction_number,
      'Date': new Date(t.processed_at).toLocaleDateString(),
      'Type': t.transaction_type,
      'Amount': t.amount,
      'Client': t.clients ? `${t.clients.first_name} ${t.clients.last_name}` : '-',
    }));
  };

  const generateAgingReport = async () => {
    const { data, error } = await supabase
      .from('loans')
      .select(`
        loan_number,
        outstanding_balance,
        disbursement_date,
        clients (first_name, last_name, client_number)
      `)
      .eq('status', 'active');

    if (error) throw error;

    return (data || []).map(l => {
      const daysSince = l.disbursement_date
        ? Math.floor((Date.now() - new Date(l.disbursement_date).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      let agingBucket = '0-30 days';
      if (daysSince > 90) agingBucket = '90+ days';
      else if (daysSince > 60) agingBucket = '60-90 days';
      else if (daysSince > 30) agingBucket = '30-60 days';

      return {
        'Loan #': l.loan_number,
        'Client': l.clients ? `${l.clients.first_name} ${l.clients.last_name}` : '-',
        'Client #': l.clients?.client_number || '-',
        'Outstanding': l.outstanding_balance,
        'Days Outstanding': daysSince,
        'Aging Bucket': agingBucket,
      };
    });
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('No data available for this report');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${row[h]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${dateRange.start}_to_${dateRange.end}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <p className="text-gray-600 mt-1">Generate and export financial reports</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Date Range</h3>
        <div className="grid grid-cols-2 gap-4 max-w-2xl">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          const isGenerating = generating === report.id;

          return (
            <div
              key={report.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className={`${report.color} p-3 rounded-lg inline-block mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{report.description}</p>
              <button
                onClick={() => handleGenerateReport(report.id)}
                disabled={isGenerating}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
