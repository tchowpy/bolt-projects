import { Plus, CreditCard } from 'lucide-react';

export function LoanManagement() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Loan Management</h2>
          <p className="text-gray-600 mt-1">Manage loan applications and repayments</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-5 h-5" />
          New Loan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="bg-blue-500 p-3 rounded-lg inline-block mb-4">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">Total Loans</h3>
          <p className="text-2xl font-bold text-gray-900">450</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Portfolio</h3>
        <div className="text-center py-12">
          <p className="text-gray-500">No loans found</p>
        </div>
      </div>
    </div>
  );
}
