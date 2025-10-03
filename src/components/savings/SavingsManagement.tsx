import { Plus, Wallet } from 'lucide-react';

export function SavingsManagement() {
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
          <p className="text-2xl font-bold text-gray-900">25.8M CFA</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Savings Accounts</h3>
        <div className="text-center py-12">
          <p className="text-gray-500">No savings accounts found</p>
        </div>
      </div>
    </div>
  );
}
