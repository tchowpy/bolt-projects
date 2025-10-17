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
  clients: { first_name: string; last_name: string; client_number: string } | null;
  savings_products: { name: string; interest_rate: number } | null;
}

export function SavingsManagement() {
  const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<SavingsAccount | null>(null);
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);

  useEffect(() => {
    loadSavingsAccounts();
  }, [page]);

  useEffect(() => {
    setPage(1);
    loadSavingsAccounts();
  }, [searchQuery, pageSize]);

  const loadSavingsAccounts = async () => {
    setLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
      .from('vw_savings_accounts')
      .select('*', { count: 'exact' })
      .order('opened_date', { ascending: false })
      .range(from, to);

      if (searchQuery.trim() !== '') {
        const q = `%${searchQuery.trim()}%`;
        query = query.or(
          `account_number.ilike.${q},clients->>first_name.ilike.${q},clients->>last_name.ilike.${q},clients->>client_number.ilike.${q},savings_products->>name.ilike.${q}`
        );
      }

      const { data, error, count } = await query;
      if (error) throw error;
      console.log('Fetched savings accounts:', data);
      setAccounts(data || []);
      setTotalCount(typeof count === 'number' ? count : 0);
    } catch (error) {
      console.error('Error loading savings accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  const totalInterest = accounts.reduce((sum, acc) => sum + Number(acc.interest_earned), 0);
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      {/* Header + stats */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Savings Management</h2>
          <p className="text-gray-600 mt-1">Manage client savings accounts</p>
        </div>
        <button
          onClick={() => setShowNewAccountModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" /> New Account
        </button>
      </div>

      {/* Stats */}
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Recherche et page size */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); }}
            placeholder="Search by account, client or product..."
            className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <div className="flex items-center gap-2">
            <label className="text-gray-700 text-sm">Rows per page:</label>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); }}
              className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
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
                          {account.clients?.first_name} {account.clients?.last_name}
                        </div>
                        <div className="text-xs text-gray-500">{account.clients?.client_number}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{account.savings_products?.name}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {Math.round(Number(account.balance)).toLocaleString()} CFA
                      </td>
                      <td className="py-3 px-4 text-green-600">
                        {Math.round(Number(account.interest_earned)).toLocaleString()} CFA
                      </td>
                      <td className="py-3 px-4 text-gray-600">{account.savings_products?.interest_rate}%</td>
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
            </div>

            {accounts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No savings accounts found</p>
              </div>
            )}

            {/* Pagination Controls */}
            {accounts.length > 0 && (
              <div className="flex items-center justify-between mt-4 px-4">
                <p className="text-sm text-gray-600">
                  Page {page} sur {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  >
                    ← Précédent
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  >
                    Suivant →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showModal && selectedAccount && (
        <TransactionModal
          account={selectedAccount}
          onClose={() => { setShowModal(false); setSelectedAccount(null); }}
          onSuccess={loadSavingsAccounts}
        />
      )}
      {showNewAccountModal && (
        <NewAccountModal
          onClose={() => setShowNewAccountModal(false)}
          onSuccess={loadSavingsAccounts}
        />
      )}
    </div>
  );
}

function NewAccountModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    client_id: '',
    product_id: '',
    initial_deposit: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClientsAndProducts();
  }, []);

  const loadClientsAndProducts = async () => {
    const [clientsRes, productsRes] = await Promise.all([
      supabase.from('clients').select('id, client_number, first_name, last_name').eq('is_active', true).order('first_name'),
      supabase.from('savings_products').select('*').eq('is_active', true),
    ]);
    setClients(clientsRes.data || []);
    setProducts(productsRes.data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const accountNumber = `SAV${Date.now()}`;
      const initialDeposit = parseFloat(formData.initial_deposit);

      const { error: accountError } = await supabase.from('savings_accounts').insert({
        account_number: accountNumber,
        client_id: formData.client_id,
        product_id: formData.product_id,
        balance: initialDeposit,
        interest_earned: 0,
        status: 'active',
        opened_date: new Date().toISOString().split('T')[0],
      });

      if (accountError) throw accountError;

      if (initialDeposit > 0) {
        const { data: currencyData } = await supabase.from('currencies').select('id').eq('code', 'XOF').single();
        await supabase.from('transactions').insert({
          transaction_number: `TXN${Date.now()}`,
          transaction_type: 'deposit',
          amount: initialDeposit,
          currency_id: currencyData?.id,
          client_id: formData.client_id,
          payment_method: 'cash',
          description: 'Initial deposit for new savings account',
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating account:', error);
      alert(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">New Savings Account</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Savings Product *</label>
            <select
              required
              value={formData.product_id}
              onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.interest_rate}% interest)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Initial Deposit (CFA) *</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.initial_deposit}
              onChange={(e) => setFormData({ ...formData, initial_deposit: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter initial deposit amount"
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
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
        client_id: account.client_id,
        agency_id: account.agency_id,
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
