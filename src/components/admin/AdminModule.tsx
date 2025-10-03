import { useState } from 'react';
import { Building2, Users, Shield, Settings as SettingsIcon } from 'lucide-react';
import { AgencyManagement } from './AgencyManagement';
import { UserManagement } from './UserManagement';
import { RoleManagement } from './RoleManagement';
import { SystemSettings } from './SystemSettings';

export function AdminModule() {
  const [activeTab, setActiveTab] = useState('agencies');

  const tabs = [
    { id: 'agencies', label: 'Agencies', icon: Building2 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'roles', label: 'Roles & Permissions', icon: Shield },
    { id: 'settings', label: 'System Settings', icon: SettingsIcon },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Administration</h2>
        <p className="text-gray-600 mt-1">Manage system configuration and access control</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'agencies' && <AgencyManagement />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'roles' && <RoleManagement />}
          {activeTab === 'settings' && <SystemSettings />}
        </div>
      </div>
    </div>
  );
}
