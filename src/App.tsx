import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { ClientManagement } from './components/clients/ClientManagement';
import { SavingsManagement } from './components/savings/SavingsManagement';
import { LoanManagement } from './components/loans/LoanManagement';
import { LoanSimulator } from './components/loans/LoanSimulator';
import { ReportsModule } from './components/reports/ReportsModule';
import { AdvancedReports } from './components/reports/AdvancedReports';
import { TransactionManagement } from './components/transactions/TransactionManagement';
import { AdminModule } from './components/admin/AdminModule';
import { ProductManagement } from './components/products/ProductManagement';
import { ComplianceModule } from './components/compliance/ComplianceModule';
import { GroupManagement } from './components/groups/GroupManagement';
import { SettingsModule } from './components/settings/SettingsModule';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeModule, setActiveModule] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const moduleTitle = {
    dashboard: 'Dashboard',
    clients: 'Client Management',
    groups: 'Group Management',
    savings: 'Savings Management',
    loans: 'Loan Management',
    simulator: 'Loan Simulator',
    transactions: 'Transaction Management',
    reports: 'Reports & Analytics',
    advanced_reports: 'Advanced Reports',
    admin: 'Administration',
    products: 'Product Management',
    compliance: 'Compliance & Risk',
    settings: 'Settings',
  }[activeModule] || 'Dashboard';

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={moduleTitle} />

        <main className="flex-1 overflow-y-auto p-6">
          {activeModule === 'dashboard' && <DashboardOverview />}
          {activeModule === 'clients' && <ClientManagement />}
          {activeModule === 'savings' && <SavingsManagement />}
          {activeModule === 'loans' && <LoanManagement />}
          {activeModule === 'simulator' && <LoanSimulator />}
          {activeModule === 'transactions' && <TransactionManagement />}
          {activeModule === 'reports' && <ReportsModule />}
          {activeModule === 'advanced_reports' && <AdvancedReports />}
          {activeModule === 'admin' && <AdminModule />}
          {activeModule === 'products' && <ProductManagement />}
          {activeModule === 'compliance' && <ComplianceModule />}
          {activeModule === 'groups' && <GroupManagement />}
          {activeModule === 'settings' && <SettingsModule />}
        </main>
      </div>
    </div>
  );
}

function PlaceholderModule({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600">This module is under development</p>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
