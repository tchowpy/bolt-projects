import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Shield, CheckCircle, XCircle } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  is_system: boolean;
}

interface Permission {
  id: string;
  module: string;
  action: string;
  description: string;
}

export function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rolesResult, permissionsResult] = await Promise.all([
        supabase.from('roles').select('*').order('name'),
        supabase.from('permissions').select('*').order('module, action'),
      ]);

      if (rolesResult.error) throw rolesResult.error;
      if (permissionsResult.error) throw permissionsResult.error;

      setRoles(rolesResult.data || []);
      setPermissions(permissionsResult.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Roles & Permissions</h3>
        <p className="text-sm text-gray-600">Configure role-based access control</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-4">Roles</h4>
            <div className="space-y-2">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedRole?.id === role.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <div>
                      <div className="font-medium">{role.name}</div>
                      <div className={`text-xs ${selectedRole?.id === role.id ? 'text-blue-100' : 'text-gray-500'}`}>
                        {role.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedRole ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  {selectedRole.name} Permissions
                </h4>
                <p className="text-sm text-gray-600">{selectedRole.description}</p>
                {selectedRole.is_system && (
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                    System Role - Cannot be modified
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([module, perms]) => (
                  <div key={module} className="border-b border-gray-200 pb-4 last:border-0">
                    <h5 className="font-semibold text-gray-900 mb-3 capitalize">{module}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {perms.map((perm) => (
                        <label
                          key={perm.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            defaultChecked={Math.random() > 0.5}
                            disabled={selectedRole.is_system}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm capitalize">
                              {perm.action}
                            </div>
                            <div className="text-xs text-gray-500">{perm.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {!selectedRole.is_system && (
                <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    Save Permissions
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select a role to view and manage permissions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
