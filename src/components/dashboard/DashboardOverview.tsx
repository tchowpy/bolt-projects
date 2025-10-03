import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Wallet, CreditCard, TrendingUp, CheckCircle, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalSavings: number;
  totalDeposits: number;
  activeLoans: number;
  totalLoanAmount: number;
  portfolioAtRisk: number;
  overdueLoans: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  amount: number;
  created_at: string;
  client_name: string;
}

export function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeClients: 0,
    totalSavings: 0,
    totalDeposits: 0,
    activeLoans: 0,
    totalLoanAmount: 0,
    portfolioAtRisk: 0,
    overdueLoans: 0,
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [clientsRes, savingsRes, loansRes, transactionsRes] = await Promise.all([
        supabase.from('clients').select('id, is_active', { count: 'exact' }),
        supabase.from('savings_accounts').select('balance'),
        supabase.from('loans').select('status, outstanding_balance, principal'),
        supabase.from('transactions').select('id, transaction_type, amount, created_at, clients(first_name, last_name)').order('created_at', { ascending: false }).limit(10),
      ]);

      const totalClients = clientsRes.count || 0;
      const activeClients = clientsRes.data?.filter(c => c.is_active).length || 0;

      const totalSavings = savingsRes.data?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0;

      const activeLoans = loansRes.data?.filter(l => l.status === 'active').length || 0;
      const overdueLoans = loansRes.data?.filter(l => l.status === 'overdue').length || 0;
      const totalLoans = loansRes.data?.length || 0;
      const totalLoanAmount = loansRes.data?.reduce((sum, l) => sum + Number(l.outstanding_balance || 0), 0) || 0;
      const portfolioAtRisk = totalLoans > 0 ? (overdueLoans / totalLoans) * 100 : 0;

      const recentActivities: RecentActivity[] = transactionsRes.data?.slice(0, 5).map(t => ({
        id: t.id,
        type: t.transaction_type,
        description: `${t.transaction_type.replace('_', ' ')} transaction`,
        amount: Number(t.amount),
        created_at: t.created_at,
        client_name: t.clients ? `${t.clients.first_name} ${t.clients.last_name}` : 'Unknown',
      })) || [];

      setStats({
        totalClients,
        activeClients,
        totalSavings,
        totalDeposits: totalSavings,
        activeLoans,
        totalLoanAmount,
        portfolioAtRisk,
        overdueLoans,
      });

      setActivities(recentActivities);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Clients',
      value: stats.totalClients.toLocaleString(),
      subtitle: `${stats.activeClients} active`,
      icon: Users,
      color: 'bg-blue-500',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Total Savings',
      value: `${Math.round(stats.totalSavings).toLocaleString()} CFA`,
      subtitle: 'All accounts',
      icon: Wallet,
      color: 'bg-green-500',
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Active Loans',
      value: stats.activeLoans.toLocaleString(),
      subtitle: `${Math.round(stats.totalLoanAmount).toLocaleString()} CFA`,
      icon: CreditCard,
      color: 'bg-orange-500',
      trend: '+5%',
      trendUp: true,
    },
    {
      title: 'Portfolio at Risk',
      value: `${stats.portfolioAtRisk.toFixed(1)}%`,
      subtitle: `${stats.overdueLoans} overdue loans`,
      icon: stats.portfolioAtRisk > 5 ? AlertCircle : TrendingUp,
      color: stats.portfolioAtRisk > 5 ? 'bg-red-500' : 'bg-green-500',
      trend: '-0.5%',
      trendUp: false,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          const TrendIcon = card.trendUp ? ArrowUpRight : ArrowDownRight;
          return (
            <div key={card.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className={`flex items-center gap-1 text-sm font-medium ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendIcon className="w-4 h-4" />
                  {card.trend}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
              <p className="text-xs text-gray-500">{card.subtitle}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  type={activity.type}
                  clientName={activity.client_name}
                  amount={activity.amount}
                  time={new Date(activity.created_at).toLocaleString()}
                />
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">No recent activity</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <QuickStat
              label="Avg Savings Balance"
              value={`${Math.round(stats.totalSavings / Math.max(stats.totalClients, 1)).toLocaleString()} CFA`}
              color="text-green-600"
            />
            <QuickStat
              label="Avg Loan Size"
              value={`${Math.round(stats.totalLoanAmount / Math.max(stats.activeLoans, 1)).toLocaleString()} CFA`}
              color="text-blue-600"
            />
            <QuickStat
              label="Client Activity Rate"
              value={`${Math.round((stats.activeClients / Math.max(stats.totalClients, 1)) * 100)}%`}
              color="text-orange-600"
            />
            <QuickStat
              label="Portfolio Health"
              value={stats.portfolioAtRisk < 5 ? "Excellent" : stats.portfolioAtRisk < 10 ? "Good" : "Needs Attention"}
              color={stats.portfolioAtRisk < 5 ? "text-green-600" : stats.portfolioAtRisk < 10 ? "text-yellow-600" : "text-red-600"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ type, clientName, amount, time }: { type: string; clientName: string; amount: number; time: string }) {
  const getIcon = () => {
    switch (type) {
      case 'deposit': return <ArrowDownRight className="w-5 h-5 text-green-600" />;
      case 'withdrawal': return <ArrowUpRight className="w-5 h-5 text-red-600" />;
      case 'loan_disbursement': return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'loan_repayment': return <CheckCircle className="w-5 h-5 text-green-600" />;
      default: return <TrendingUp className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      {getIcon()}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {type.replace('_', ' ')} - {clientName}
        </p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
      <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
        {Math.round(amount).toLocaleString()} CFA
      </span>
    </div>
  );
}

function QuickStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm font-semibold ${color}`}>{value}</span>
    </div>
  );
}
