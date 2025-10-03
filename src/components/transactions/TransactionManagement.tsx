import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowDownCircle, ArrowUpCircle, Calendar, Filter, Download } from 'lucide-react';

interface Transaction {
  id: string;
  transaction_number: string;
  transaction_type: string;
  amount: number;
  payment_method: string;
  description: string;
  processed_at: string;
  clients: {
    first_name: string;
    last_name: string;
    client_number: string;
  } | null;
}

export function TransactionManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          clients (first_name, last_name, client_number)
        `)
        .order('processed_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter !== 'all' && t.transaction_type !== filter) return false;
    return true;
  });

  const handleExport = () => {
    const csvData = filteredTransactions.map(t => ({
      'Transaction #': t.transaction_number,
      'Date': new Date(t.processed_at).toLocaleDateString(),
      'Type': t.transaction_type,
      'Client': t.clients ? `${t.clients.first_name} ${t.clients.last_name}` : '-',
      'Client #': t.clients?.client_number || '-',
      'Amount (CFA)': t.amount,
      'Method': t.payment_method,
      'Description': t.description || '-',
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => `"${row[h as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = {
    total: transactions.length,
    deposits: transactions.filter(t => t.transaction_type === 'deposit').reduce((sum, t) => sum + Number(t.amount), 0),
    withdrawals: transactions.filter(t => t.transaction_type === 'withdrawal').reduce((sum, t) => sum + Number(t.amount), 0),
    loanPayments: transactions.filter(t => t.transaction_type === 'loan_repayment').reduce((sum, t) => sum + Number(t.amount), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transaction Management</h2>
          <p className="text-gray-600 mt-1">Monitor and manage all financial transactions</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Total Deposits"
          value={`${stats.deposits.toLocaleString()} CFA`}
          icon={ArrowDownCircle}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          label="Total Withdrawals"
          value={`${stats.withdrawals.toLocaleString()} CFA`}
          icon={ArrowUpCircle}
          color="text-red-600"
          bgColor="bg-red-100"
        />
        <StatCard
          label="Loan Repayments"
          value={`${stats.loanPayments.toLocaleString()} CFA`}
          icon={ArrowDownCircle}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Transactions</option>
                  <option value="deposit">Deposits</option>
                  <option value="withdrawal">Withdrawals</option>
                  <option value="loan_disbursement">Loan Disbursements</option>
                  <option value="loan_repayment">Loan Repayments</option>
                  <option value="transfer">Transfers</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Transaction #</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Method</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {transaction.transaction_number}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(transaction.processed_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {transaction.clients ? (
                        <div>
                          <div className="font-medium text-gray-900">
                            {transaction.clients.first_name} {transaction.clients.last_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {transaction.clients.client_number}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <TransactionTypeBadge type={transaction.transaction_type} />
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${
                        ['deposit', 'loan_repayment'].includes(transaction.transaction_type)
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {['deposit', 'loan_repayment'].includes(transaction.transaction_type) ? '+' : '-'}
                        {Number(transaction.amount).toLocaleString()} CFA
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium capitalize">
                        {transaction.payment_method?.replace('_', ' ') || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {transaction.description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No transactions found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bgColor }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`${bgColor} p-3 rounded-lg`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{label}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function TransactionTypeBadge({ type }: { type: string }) {
  const configs: Record<string, { color: string; label: string }> = {
    deposit: { color: 'bg-green-100 text-green-700', label: 'Deposit' },
    withdrawal: { color: 'bg-red-100 text-red-700', label: 'Withdrawal' },
    loan_disbursement: { color: 'bg-blue-100 text-blue-700', label: 'Loan Disbursement' },
    loan_repayment: { color: 'bg-green-100 text-green-700', label: 'Loan Repayment' },
    transfer: { color: 'bg-purple-100 text-purple-700', label: 'Transfer' },
    fee: { color: 'bg-orange-100 text-orange-700', label: 'Fee' },
    interest: { color: 'bg-blue-100 text-blue-700', label: 'Interest' },
    penalty: { color: 'bg-red-100 text-red-700', label: 'Penalty' },
  };

  const config = configs[type] || { color: 'bg-gray-100 text-gray-700', label: type };

  return (
    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
