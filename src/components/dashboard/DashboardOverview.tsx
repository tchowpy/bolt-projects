import { Users, Wallet, CreditCard, TrendingUp, CheckCircle } from 'lucide-react';

export function DashboardOverview() {
  const statCards = [
    {
      title: 'Total Clients',
      value: '1,234',
      icon: Users,
      color: 'bg-blue-500',
      trend: '+12%',
    },
    {
      title: 'Total Savings',
      value: '25.8M CFA',
      icon: Wallet,
      color: 'bg-green-500',
      trend: '+8%',
    },
    {
      title: 'Active Loans',
      value: '450',
      icon: CreditCard,
      color: 'bg-orange-500',
      trend: '+5%',
    },
    {
      title: 'Portfolio at Risk',
      value: '2.8%',
      icon: TrendingUp,
      color: 'bg-red-500',
      trend: '-0.5%',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-green-600">{card.trend}</span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <ActivityItem
            icon={CheckCircle}
            color="text-green-600"
            title="New client registered"
            time="2 minutes ago"
          />
          <ActivityItem
            icon={TrendingUp}
            color="text-blue-600"
            title="Loan disbursement completed"
            time="15 minutes ago"
          />
          <ActivityItem
            icon={Wallet}
            color="text-green-600"
            title="Savings deposit received"
            time="1 hour ago"
          />
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ icon: Icon, color, title, time }: { icon: any; color: string; title: string; time: string }) {
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <Icon className={`w-5 h-5 ${color}`} />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
}
