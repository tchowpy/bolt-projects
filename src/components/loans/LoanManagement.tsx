import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, CreditCard, Check, X, DollarSign, FileText, AlertCircle } from 'lucide-react';

interface Loan {
  id: string;
  loan_number: string;
  client_id: string;
  product_id: string;
  principal: number;
  interest_rate: number;
  duration_months: number;
  monthly_payment: number;
  outstanding_balance: number;
  status: string;
  disbursement_date: string | null;
  created_at: string;
  clients: {
    first_name: string;
    last_name: string;
    client_number: string;
  } | null;
  loan_products: {
    name: string;
  } | null;
}

export function LoanManagement() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewLoanModal, setShowNewLoanModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select(`
          *,
          clients (first_name, last_name, client_number),
          loan_products (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLoans(data || []);
    } catch (error) {
      console.error('Error loading loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (loan: Loan) => {
    if (!confirm(`Approve loan ${loan.loan_number}?`)) return;

    try {
      const { error } = await supabase
        .from('loans')
        .update({ status: 'approved' })
        .eq('id', loan.id);

      if (error) throw error;
      loadLoans();
    } catch (error) {
      console.error('Error approving loan:', error);
      alert('Failed to approve loan');
    }
  };

  const handleReject = (loan: Loan) => {
    setSelectedLoan(loan);
    setShowRejectModal(true);
  };

  const handleDisburse = async (loan: Loan) => {
    if (!confirm(`Disburse loan ${loan.loan_number}?`)) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      const { error: loanError } = await supabase
        .from('loans')
        .update({
          status: 'disbursed',
          disbursement_date: today
        })
        .eq('id', loan.id);

      if (loanError) throw loanError;

      const { data: currencyData } = await supabase
        .from('currencies')
        .select('id')
        .eq('code', 'XOF')
        .single();

      await supabase.from('transactions').insert({
        transaction_number: `TXN${Date.now()}`,
        transaction_type: 'loan_disbursement',
        amount: loan.principal,
        currency_id: currencyData?.id,
        client_id: loan.client_id,
        payment_method: 'bank_transfer',
        description: `Loan disbursement for ${loan.loan_number}`,
      });

      loadLoans();
    } catch (error) {
      console.error('Error disbursing loan:', error);
      alert('Failed to disburse loan');
    }
  };

  const handleRecordPayment = (loan: Loan) => {
    setSelectedLoan(loan);
    setShowPaymentModal(true);
  };

  const filteredLoans = statusFilter === 'all'
    ? loans
    : loans.filter(l => l.status === statusFilter);

  const stats = {
    total: loans.length,
    active: loans.filter(l => l.status === 'active').length,
    pending: loans.filter(l => l.status === 'pending').length,
    totalAmount: loans.reduce((sum, l) => sum + Number(l.outstanding_balance || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Loan Management</h2>
          <p className="text-gray-600 mt-1">Manage loan applications and repayments</p>
        </div>
        <button
          onClick={() => setShowNewLoanModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Loan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Loans" value={stats.total.toString()} icon={CreditCard} color="bg-blue-500" />
        <StatCard label="Active Loans" value={stats.active.toString()} icon={Check} color="bg-green-500" />
        <StatCard label="Pending" value={stats.pending.toString()} icon={AlertCircle} color="bg-yellow-500" />
        <StatCard
          label="Outstanding"
          value={`${Math.round(stats.totalAmount).toLocaleString()} CFA`}
          icon={DollarSign}
          color="bg-orange-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Loans</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="disbursed">Disbursed</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="rejected">Rejected</option>
          </select>
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
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Loan #</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Principal</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Balance</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Monthly</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.map((loan) => (
                  <tr key={loan.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{loan.loan_number}</td>
                    <td className="py-3 px-4">
                      {loan.clients ? (
                        <div>
                          <div className="font-medium text-gray-900">
                            {loan.clients.first_name} {loan.clients.last_name}
                          </div>
                          <div className="text-xs text-gray-500">{loan.clients.client_number}</div>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {loan.loan_products?.name || '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-900 font-medium">
                      {Math.round(loan.principal).toLocaleString()} CFA
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {Math.round(loan.outstanding_balance).toLocaleString()} CFA
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {Math.round(loan.monthly_payment).toLocaleString()} CFA
                    </td>
                    <td className="py-3 px-4">
                      <LoanStatusBadge status={loan.status} />
                    </td>
                    <td className="py-3 px-4">
                      <LoanActions
                        loan={loan}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onDisburse={handleDisburse}
                        onPayment={handleRecordPayment}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredLoans.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No loans found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showNewLoanModal && (
        <NewLoanModal onClose={() => setShowNewLoanModal(false)} onSuccess={loadLoans} />
      )}

      {showPaymentModal && selectedLoan && (
        <PaymentModal
          loan={selectedLoan}
          onClose={() => { setShowPaymentModal(false); setSelectedLoan(null); }}
          onSuccess={loadLoans}
        />
      )}

      {showRejectModal && selectedLoan && (
        <RejectModal
          loan={selectedLoan}
          onClose={() => { setShowRejectModal(false); setSelectedLoan(null); }}
          onSuccess={loadLoans}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className={`${color} p-3 rounded-lg inline-block mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{label}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function LoanStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { color: string; label: string }> = {
    pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
    approved: { color: 'bg-blue-100 text-blue-700', label: 'Approved' },
    disbursed: { color: 'bg-green-100 text-green-700', label: 'Disbursed' },
    active: { color: 'bg-green-100 text-green-700', label: 'Active' },
    closed: { color: 'bg-gray-100 text-gray-700', label: 'Closed' },
    rejected: { color: 'bg-red-100 text-red-700', label: 'Rejected' },
    overdue: { color: 'bg-red-100 text-red-700', label: 'Overdue' },
  };

  const config = configs[status] || configs.pending;

  return (
    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

function LoanActions({ loan, onApprove, onReject, onDisburse, onPayment }: any) {
  if (loan.status === 'pending') {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onApprove(loan)}
          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="Approve"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={() => onReject(loan)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Reject"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (loan.status === 'approved') {
    return (
      <button
        onClick={() => onDisburse(loan)}
        className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        Disburse
      </button>
    );
  }

  if (loan.status === 'disbursed' || loan.status === 'active') {
    return (
      <button
        onClick={() => onPayment(loan)}
        className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
      >
        Payment
      </button>
    );
  }

  return <span className="text-gray-400 text-sm">No actions</span>;
}

function NewLoanModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    client_id: '',
    product_id: '',
    principal: '',
    duration_months: '',
    purpose: '',
    collateral: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [clientsRes, productsRes] = await Promise.all([
      supabase.from('clients').select('id, client_number, first_name, last_name').eq('is_active', true).order('first_name'),
      supabase.from('loan_products').select('*').eq('is_active', true),
    ]);
    setClients(clientsRes.data || []);
    setProducts(productsRes.data || []);
  };

  const selectedProduct = products.find(p => p.id === formData.product_id);

  const calculateLoan = () => {
    if (!selectedProduct || !formData.principal || !formData.duration_months) return null;

    const principal = parseFloat(formData.principal);
    const rate = selectedProduct.interest_rate / 100 / 12;
    const months = parseInt(formData.duration_months);

    const monthlyPayment = principal * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    const totalAmount = monthlyPayment * months;
    const totalInterest = totalAmount - principal;

    return { monthlyPayment, totalAmount, totalInterest };
  };

  const calc = calculateLoan();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const loanNumber = `LON${Date.now()}`;
      const principal = parseFloat(formData.principal);
      const duration = parseInt(formData.duration_months);

      const { error } = await supabase.from('loans').insert({
        loan_number: loanNumber,
        client_id: formData.client_id,
        product_id: formData.product_id,
        principal,
        interest_rate: selectedProduct.interest_rate,
        duration_months: duration,
        monthly_payment: calc?.monthlyPayment || 0,
        outstanding_balance: principal,
        status: 'pending',
        purpose: formData.purpose,
        collateral: formData.collateral,
      });

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating loan:', error);
      alert(error.message || 'Failed to create loan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">New Loan Application</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Client *</label>
              <select
                required
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.client_number} - {client.first_name} {client.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Loan Product *</label>
              <select
                required
                value={formData.product_id}
                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.interest_rate}% - {product.min_duration_months}-{product.max_duration_months} months)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Principal Amount (CFA) *</label>
              <input
                type="number"
                required
                min="0"
                step="1000"
                value={formData.principal}
                onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (months) *</label>
              <input
                type="number"
                required
                min="1"
                max="60"
                value={formData.duration_months}
                onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
              <input
                type="text"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Business expansion, education, etc."
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Collateral</label>
              <textarea
                value={formData.collateral}
                onChange={(e) => setFormData({ ...formData, collateral: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="Description of collateral or guarantors"
              />
            </div>
          </div>

          {calc && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Loan Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Payment:</span>
                  <span className="font-semibold text-gray-900">{Math.round(calc.monthlyPayment).toLocaleString()} CFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Interest:</span>
                  <span className="font-semibold text-gray-900">{Math.round(calc.totalInterest).toLocaleString()} CFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Repayment:</span>
                  <span className="font-semibold text-gray-900">{Math.round(calc.totalAmount).toLocaleString()} CFA</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PaymentModal({ loan, onClose, onSuccess }: any) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const paymentAmount = parseFloat(amount);
      const newBalance = loan.outstanding_balance - paymentAmount;

      const { error: loanError } = await supabase
        .from('loans')
        .update({
          outstanding_balance: Math.max(0, newBalance),
          status: newBalance <= 0 ? 'closed' : 'active'
        })
        .eq('id', loan.id);

      if (loanError) throw loanError;

      const { data: currencyData } = await supabase
        .from('currencies')
        .select('id')
        .eq('code', 'XOF')
        .single();

      await supabase.from('transactions').insert({
        transaction_number: `TXN${Date.now()}`,
        transaction_type: 'loan_repayment',
        amount: paymentAmount,
        currency_id: currencyData?.id,
        client_id: loan.client_id,
        payment_method: 'cash',
        description: `Loan repayment for ${loan.loan_number}`,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error recording payment:', error);
      alert(error.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Record Payment</h3>
          <p className="text-sm text-gray-600 mt-1">Loan: {loan.loan_number}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Outstanding Balance:</span>
              <span className="font-semibold text-gray-900">
                {Math.round(loan.outstanding_balance).toLocaleString()} CFA
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Monthly Payment:</span>
              <span className="font-semibold text-gray-900">
                {Math.round(loan.monthly_payment).toLocaleString()} CFA
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount (CFA) *</label>
            <input
              type="number"
              required
              min="1"
              max={loan.outstanding_balance}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter payment amount"
            />
          </div>

          {amount && parseFloat(amount) > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm font-medium text-green-800">
                New balance: {Math.round(loan.outstanding_balance - parseFloat(amount)).toLocaleString()} CFA
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RejectModal({ loan, onClose, onSuccess }: any) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('loans')
        .update({
          status: 'rejected',
          rejection_reason: reason
        })
        .eq('id', loan.id);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error rejecting loan:', error);
      alert(error.message || 'Failed to reject loan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Reject Loan</h3>
          <p className="text-sm text-gray-600 mt-1">Loan: {loan.loan_number}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Rejection *</label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Enter reason for rejecting this loan application"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Rejecting...' : 'Reject Loan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
