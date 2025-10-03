import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Wallet, CreditCard, Percent } from 'lucide-react';

export function ProductManagement() {
  const [activeTab, setActiveTab] = useState('savings');
  const [savingsProducts, setSavingsProducts] = useState<any[]>([]);
  const [loanProducts, setLoanProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
          <p className="text-gray-600 mt-1">Configure savings and loan products</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
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
              {activeTab === 'savings' && <SavingsProductsList products={savingsProducts} />}
              {activeTab === 'loans' && <LoanProductsList products={loanProducts} />}
            </>
          )}
        </div>
      </div>
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

function SavingsProductsList({ products }: { products: any[] }) {
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
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {product.is_active ? 'Active' : 'Inactive'}
            </span>
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
              <span className="font-medium text-gray-900">{Number(product.minimum_opening_balance).toLocaleString()} CFA</span>
            </div>
          </div>

          <button className="w-full px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium">
            Edit Product
          </button>
        </div>
      ))}
    </div>
  );
}

function LoanProductsList({ products }: { products: any[] }) {
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
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {product.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Interest Rate:</span>
              <span className="font-medium text-orange-600">{product.interest_rate}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Amount Range:</span>
              <span className="font-medium text-gray-900">
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

          <button className="w-full px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium">
            Edit Product
          </button>
        </div>
      ))}
    </div>
  );
}
