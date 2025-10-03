import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Wallet, CreditCard, Edit2, X } from 'lucide-react';

export function ProductManagement() {
  const [activeTab, setActiveTab] = useState('savings');
  const [savingsProducts, setSavingsProducts] = useState<any[]>([]);
  const [loanProducts, setLoanProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const [savingsResult, loansResult] = await Promise.all([
        supabase.from('savings_products').select('*').order('created_at', { ascending: false }),
        supabase.from('loan_products').select('*').order('created_at', { ascending: false }),
      ]);

      if (savingsResult.error) throw savingsResult.error;
      if (loansResult.error) throw loansResult.error;

      setSavingsProducts(savingsResult.data || []);
      setLoanProducts(loansResult.data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    if (activeTab === 'savings') {
      setShowSavingsModal(true);
    } else {
      setShowLoanModal(true);
    }
  };

  const handleEditSavingsProduct = (product: any) => {
    setEditingProduct(product);
    setShowSavingsModal(true);
  };

  const handleEditLoanProduct = (product: any) => {
    setEditingProduct(product);
    setShowLoanModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
          <p className="text-gray-600 mt-1">Configure savings and loan products</p>
        </div>
        <button
          onClick={handleNewProduct}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 p-2">
            <TabButton
              active={activeTab === 'savings'}
              onClick={() => setActiveTab('savings')}
              icon={Wallet}
              label="Savings Products"
            />
            <TabButton
              active={activeTab === 'loans'}
              onClick={() => setActiveTab('loans')}
              icon={CreditCard}
              label="Loan Products"
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
              {activeTab === 'savings' && (
                <SavingsProductsList products={savingsProducts} onEdit={handleEditSavingsProduct} />
              )}
              {activeTab === 'loans' && (
                <LoanProductsList products={loanProducts} onEdit={handleEditLoanProduct} />
              )}
            </>
          )}
        </div>
      </div>

      {showSavingsModal && (
        <SavingsProductModal
          product={editingProduct}
          onClose={() => {
            setShowSavingsModal(false);
            setEditingProduct(null);
          }}
          onSuccess={loadProducts}
        />
      )}

      {showLoanModal && (
        <LoanProductModal
          product={editingProduct}
          onClose={() => {
            setShowLoanModal(false);
            setEditingProduct(null);
          }}
          onSuccess={loadProducts}
        />
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
        active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );
}

function SavingsProductsList({ products, onEdit }: { products: any[]; onEdit: (product: any) => void }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No savings products configured</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">{product.name}</h4>
              <p className="text-sm text-gray-500">Code: {product.code}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {product.is_active ? 'Active' : 'Inactive'}
              </span>
              <button
                onClick={() => onEdit(product)}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium text-gray-900 capitalize">{product.product_type}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Interest Rate:</span>
              <span className="font-medium text-green-600">{product.interest_rate}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Min Balance:</span>
              <span className="font-medium text-gray-900">{Number(product.minimum_balance).toLocaleString()} CFA</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Min Opening:</span>
              <span className="font-medium text-gray-900">
                {Number(product.minimum_opening_balance).toLocaleString()} CFA
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function LoanProductsList({ products, onEdit }: { products: any[]; onEdit: (product: any) => void }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No loan products configured</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">{product.name}</h4>
              <p className="text-sm text-gray-500">Code: {product.code}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {product.is_active ? 'Active' : 'Inactive'}
              </span>
              <button
                onClick={() => onEdit(product)}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Interest Rate:</span>
              <span className="font-medium text-orange-600">{product.interest_rate}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Amount Range:</span>
              <span className="font-medium text-gray-900 text-xs">
                {Number(product.min_principal).toLocaleString()} - {Number(product.max_principal).toLocaleString()} CFA
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium text-gray-900">
                {product.min_duration_months} - {product.max_duration_months} months
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Processing Fee:</span>
              <span className="font-medium text-gray-900">{product.processing_fee_percent}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SavingsProductModal({ product, onClose, onSuccess }: any) {
  const isEditing = !!product;
  const [formData, setFormData] = useState({
    name: product?.name || '',
    code: product?.code || '',
    product_type: product?.product_type || 'regular',
    interest_rate: product?.interest_rate || '',
    minimum_balance: product?.minimum_balance || '',
    minimum_opening_balance: product?.minimum_opening_balance || '',
    max_withdrawal_per_month: product?.max_withdrawal_per_month || '',
    interest_calculation_method: product?.interest_calculation_method || 'daily',
    is_active: product?.is_active ?? true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('savings_products')
          .update(formData)
          .eq('id', product.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('savings_products').insert(formData);

        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert(error.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Savings Product' : 'New Savings Product'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Type *</label>
              <select
                value={formData.product_type}
                onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="regular">Regular Savings</option>
                <option value="fixed">Fixed Deposit</option>
                <option value="planned">Planned Savings</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (%) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.interest_rate}
                onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Balance (CFA) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.minimum_balance}
                onChange={(e) => setFormData({ ...formData, minimum_balance: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Opening Balance (CFA) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.minimum_opening_balance}
                onChange={(e) => setFormData({ ...formData, minimum_opening_balance: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Withdrawals/Month</label>
              <input
                type="number"
                min="0"
                value={formData.max_withdrawal_per_month}
                onChange={(e) => setFormData({ ...formData, max_withdrawal_per_month: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Interest Calculation</label>
              <select
                value={formData.interest_calculation_method}
                onChange={(e) => setFormData({ ...formData, interest_calculation_method: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
              Active Product
            </label>
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
              {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LoanProductModal({ product, onClose, onSuccess }: any) {
  const isEditing = !!product;
  const [formData, setFormData] = useState({
    name: product?.name || '',
    code: product?.code || '',
    interest_rate: product?.interest_rate || '',
    min_principal: product?.min_principal || '',
    max_principal: product?.max_principal || '',
    min_duration_months: product?.min_duration_months || '',
    max_duration_months: product?.max_duration_months || '',
    processing_fee_percent: product?.processing_fee_percent || '',
    penalty_rate: product?.penalty_rate || '',
    interest_calculation_method: product?.interest_calculation_method || 'declining_balance',
    is_active: product?.is_active ?? true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('loan_products')
          .update(formData)
          .eq('id', product.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('loan_products').insert(formData);

        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert(error.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Loan Product' : 'New Loan Product'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (%) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.interest_rate}
                onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Penalty Rate (%)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.penalty_rate}
                onChange={(e) => setFormData({ ...formData, penalty_rate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Principal (CFA) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.min_principal}
                onChange={(e) => setFormData({ ...formData, min_principal: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Principal (CFA) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.max_principal}
                onChange={(e) => setFormData({ ...formData, max_principal: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Duration (months) *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.min_duration_months}
                onChange={(e) => setFormData({ ...formData, min_duration_months: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Duration (months) *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.max_duration_months}
                onChange={(e) => setFormData({ ...formData, max_duration_months: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Processing Fee (%)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.processing_fee_percent}
                onChange={(e) => setFormData({ ...formData, processing_fee_percent: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Calculation Method</label>
              <select
                value={formData.interest_calculation_method}
                onChange={(e) => setFormData({ ...formData, interest_calculation_method: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="declining_balance">Declining Balance</option>
                <option value="flat_rate">Flat Rate</option>
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active_loan"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active_loan" className="ml-2 text-sm font-medium text-gray-700">
              Active Product
            </label>
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
              {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
