import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface SavingsAccount {
  id: string;
  account_number: string;
  balance: number;
  interest_earned: number;
  status: string;
  opened_date: string;
  clients: { first_name: string; last_name: string; client_number: string };
  savings_products: { name: string; interest_rate: number };
}

export function SavingsManagement() {
  const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<SavingsAccount | null>(null);

  useEffect(() => {
    loadSavingsAccounts();
  }, []);

  const loadSavingsAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('savings_accounts')
        .select(`*, clients(first_name, last_name, client_number), savings_products(name, interest_rate)`)
        .order('opened_date', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error loading savings accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  const totalInterest = accounts.reduce((sum, acc) => sum + Number(acc.interest_earned), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Savings Management</h2>
          <p className="text-gray-600 mt-1">Manage client savings accounts</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-5 h-5" />
          New Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="bg-green-100 p-3 rounded-lg inline-block mb-4">
            <Wallet className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total Balance</h3>
          <p className="text-2xl font-bold text-gray-900">{Math.round(totalBalance).toLocaleString()} CFA</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="bg-blue-100 p-3 rounded-lg inline-block mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total Interest Earned</h3>
          <p className="text-2xl font-bold text-gray-900">{Math.round(totalInterest).toLocaleString()} CFA</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="bg-orange-100 p-3 rounded-lg inline-block mb-4">
            <Wallet className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Active Accounts</h3>
          <p className="text-2xl font-bold text-gray-900">{accounts.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Savings Accounts</h3>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Account #</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Balance</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Interest</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Rate</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{account.account_number}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        {account.clients.first_name} {account.clients.last_name}
                      </div>
                      <div className="text-xs text-gray-500">{account.clients.client_number}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{account.savings_products.name}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {Math.round(Number(account.balance)).toLocaleString()} CFA
                    </td>
                    <td className="py-3 px-4 text-green-600">
                      {Math.round(Number(account.interest_earned)).toLocaleString()} CFA
                    </td>
                    <td className="py-3 px-4 text-gray-600">{account.savings_products.interest_rate}%</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSelectedAccount(account); setShowModal(true); }}
                          className="flex items-center gap-1 px-3 py-1 text-sm bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                        >
                          <TrendingUp className="w-4 h-4" />
                          Transaction
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {accounts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No savings accounts found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && selectedAccount && (
        <TransactionModal
          account={selectedAccount}
          onClose={() => { setShowModal(false); setSelectedAccount(null); }}
          onSuccess={loadSavingsAccounts}
        />
      )}
    </div>
  );
}

function TransactionModal({ account, onClose, onSuccess }: any) {
  const [type, setType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const transactionAmount = parseFloat(amount);
      const newBalance = type === 'deposit'
        ? Number(account.balance) + transactionAmount
        : Number(account.balance) - transactionAmount;

      if (type === 'withdrawal' && newBalance < 0) {
        alert('Insufficient balance');
        setLoading(false);
        return;
      }

      const { data: currencyData } = await supabase
        .from('currencies')
        .select('id')
        .eq('code', 'XOF')
        .single();

      const { error: txError } = await supabase.from('transactions').insert({
        transaction_number: `TXN${Date.now()}`,
        transaction_type: type,
        amount: transactionAmount,
        currency_id: currencyData?.id,
        client_id: account.clients?.id,
        savings_account_id: account.id,
        payment_method: 'cash',
        description,
      });

      if (txError) throw txError;

      const { error: updateError } = await supabase
        .from('savings_accounts')
        .update({ balance: newBalance })
        .eq('id', account.id);

      if (updateError) throw updateError;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error processing transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">New Transaction</h3>
          <p className="text-sm text-gray-600 mt-1">
            Account: {account.account_number} | Balance: {Math.round(Number(account.balance)).toLocaleString()} CFA
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('deposit')}
                className={`p-3 border-2 rounded-lg transition-all ${
                  type === 'deposit'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <TrendingUp className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm font-medium">Deposit</span>
              </button>
              <button
                type="button"
                onClick={() => setType('withdrawal')}
                className={`p-3 border-2 rounded-lg transition-all ${
                  type === 'withdrawal'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <TrendingDown className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm font-medium">Withdraw</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (CFA) *</label>
            <input
              type="number"
              required
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Optional transaction notes"
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
              className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                type === 'deposit'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {loading ? 'Processing...' : `Process ${type}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
