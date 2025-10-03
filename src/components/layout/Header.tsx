import { useState, useEffect } from 'react';
import { Bell, Search, User, LogOut, Settings, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  title: string;
  onNavigate?: (module: string) => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  severity: string;
}

export function Header({ title, onNavigate }: HeaderProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      handleSearch();
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchTerm]);

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const notifs = (data || []).map(alert => ({
        id: alert.id,
        title: alert.title,
        message: alert.message,
        created_at: alert.created_at,
        is_read: alert.is_read || false,
        severity: alert.severity,
      }));

      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, client_number, first_name, last_name, phone')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,client_number.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .limit(5);

      const { data: loans, error: loansError } = await supabase
        .from('loans')
        .select('id, loan_number, status')
        .ilike('loan_number', `%${searchTerm}%`)
        .limit(5);

      const { data: savings, error: savingsError } = await supabase
        .from('savings_accounts')
        .select('id, account_number, balance')
        .ilike('account_number', `%${searchTerm}%`)
        .limit(5);

      const results = [
        ...(clients || []).map(c => ({
          type: 'Client',
          label: `${c.first_name} ${c.last_name}`,
          sublabel: c.client_number,
          id: c.id
        })),
        ...(loans || []).map(l => ({
          type: 'Loan',
          label: l.loan_number,
          sublabel: l.status,
          id: l.id
        })),
        ...(savings || []).map(s => ({
          type: 'Savings',
          label: s.account_number,
          sublabel: `${Number(s.balance).toLocaleString()} CFA`,
          id: s.id
        })),
      ];

      setSearchResults(results);
      setShowSearchResults(results.length > 0);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('id', notificationId);

      loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients, loans, accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
            />

            {showSearchResults && (
              <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-2">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setShowSearchResults(false);
                        setSearchTerm('');
                        if (onNavigate) {
                          if (result.type === 'Client') {
                            onNavigate('clients');
                          } else if (result.type === 'Loan') {
                            onNavigate('loans');
                          } else if (result.type === 'Savings') {
                            onNavigate('savings');
                          }
                        }
                      }}
                      className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{result.label}</div>
                          <div className="text-sm text-gray-500">{result.sublabel}</div>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {result.type}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[500px] overflow-y-auto">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          !notif.is_read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">{notif.title}</h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              notif.severity === 'critical'
                                ? 'bg-red-100 text-red-700'
                                : notif.severity === 'high'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {notif.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {new Date(notif.created_at).toLocaleString()}
                          </span>
                          {!notif.is_read && (
                            <button
                              onClick={() => markAsRead(notif.id)}
                              className="text-xs text-blue-600 hover:text-blue-700"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <User className="w-5 h-5" />
            </button>

            {showAccountMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="font-medium text-gray-900">{user?.email}</div>
                  <div className="text-sm text-gray-500">Administrator</div>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => {
                      setShowAccountMenu(false);
                      if (onNavigate) {
                        onNavigate('settings');
                      }
                    }}
                    className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
