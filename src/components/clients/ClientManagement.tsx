import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Search, CreditCard as Edit, Eye, CheckCircle, XCircle, Trash2, X } from 'lucide-react';
import { User } from 'lucide-react';

interface Client {
  id: string;
  client_number: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  kyc_status: string;
  is_active: boolean;
  created_at: string;
  date_of_birth: string;
  gender: string;
  address: string;
  city: string;
  country: string;
  occupation: string;
  id_type: string;
  id_number: string;
}

export function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // 🔹 Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  useEffect(() => {
    loadClients();
  }, [page]);

  useEffect(() => {
    setPage(1);
    loadClients();
  }, [searchTerm, pageSize]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (searchTerm) {
        query = query.or(
          `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,client_number.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`
        );
      }

      const { data, error, count } = await query;

      if (error) throw error;
      setClients(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (client: Client) => {
    setSelectedClient(client);
    setShowViewModal(true);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setShowEditModal(true);
  };

  const handleDelete = async (client: Client) => {
    if (!confirm(`Are you sure you want to deactivate ${client.first_name} ${client.last_name}?`)) return;

    try {
      const { error } = await supabase
        .from('clients')
        .update({ is_active: false })
        .eq('id', client.id);

      if (error) throw error;
      loadClients();
    } catch (error) {
      console.error('Error deactivating client:', error);
      alert('Failed to deactivate client');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Client Management</h2>
          <p className="text-gray-600 mt-1">Manage your microfinance clients</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Client
        </button>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6 flex justify-between items-center">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients by name, number, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Page size selector */}
          <div className="ml-4 flex items-center gap-2">
            <label className="text-sm text-gray-600">Rows per page:</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Client #</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">City</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">KYC Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{client.client_number}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        {client.first_name} {client.last_name}
                      </div>
                      <div className="text-xs text-gray-500">{client.occupation}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{client.phone || '-'}</td>
                    <td className="py-3 px-4 text-gray-600">{client.email || '-'}</td>
                    <td className="py-3 px-4 text-gray-600">{client.city || '-'}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={client.kyc_status} />
                    </td>
                    <td className="py-3 px-4">
                      {client.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(client)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(client)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit client"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Deactivate client"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {clients.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No clients found</p>
              </div>
            )}

            {/* Pagination Controls */}
            {clients.length > 0 && (
              <div className="flex items-center justify-between mt-4 px-4">
                <p className="text-sm text-gray-600">
                  Page {page} sur {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  >
                    ← Précédent
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  >
                    Suivant →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddClientModal onClose={() => setShowAddModal(false)} onSuccess={loadClients} />
      )}

      {showViewModal && selectedClient && (
        <ViewClientModal client={selectedClient} onClose={() => { setShowViewModal(false); setSelectedClient(null); }} />
      )}

      {showEditModal && selectedClient && (
        <EditClientModal client={selectedClient} onClose={() => { setShowEditModal(false); setSelectedClient(null); }} onSuccess={loadClients} />
      )}
    </div>
  );
}

/* ========== Small Components ========== */

function StatusBadge({ status }: { status: string }) {
  const configs = {
    verified: { color: 'bg-green-100 text-green-700', label: 'Verified' },
    pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
    rejected: { color: 'bg-red-100 text-red-700', label: 'Rejected' },
  };
  const config = configs[status as keyof typeof configs] || configs.pending;
  return (
    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

// Composant badge réutilisable
function StatusBadgeView({ value, type }: { value: string; type: 'client' | 'kyc' }) {
  let color = 'bg-gray-200 text-gray-700';
  if (type === 'client') {
    color = value === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  } else if (type === 'kyc') {
    if (value === 'verified') color = 'bg-green-100 text-green-800';
    else if (value === 'pending') color = 'bg-yellow-100 text-yellow-800';
    else if (value === 'rejected') color = 'bg-red-100 text-red-800';
    else color = 'bg-gray-100 text-gray-700';
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
      {value}
    </span>
  );
}

// Carte résumé client
function ClientHeaderCard({ client }: { client: any }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4 mb-6">
      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
        {client.photo_url ? (
          <img
            src={client.photo_url}
            alt={`${client.first_name} ${client.last_name}`}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <User className="w-8 h-8" />
        )}
      </div>

      <div className="flex-1">
        <h2 className="text-lg font-bold text-gray-900">
          {client.first_name} {client.last_name}
        </h2>
        <p className="text-sm text-gray-500">{client.client_number}</p>

        <div className="flex gap-2 mt-2">
          <StatusBadgeView
            value={client.is_active ? 'Actif' : 'Inactif'}
            type="client"
          />
          <StatusBadgeView
            value={client.kyc_status || 'Non défini'}
            type="kyc"
          />
        </div>
      </div>
    </div>
  );
}

/* Les modales AddClientModal, ViewClientModal, EditClientModal restent identiques à ton code existant */

function ViewClientModal({ client, onClose }: { client: Client; onClose: () => void }) {
  const [savingsAccounts, setSavingsAccounts] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClientData();
  }, [client]);

  const loadClientData = async () => {
    setLoading(true);
    try {
      // Récupération des comptes d’épargne
      const { data: savings, error: savingsError } = await supabase
        .from('vw_savings_accounts')
        .select('*')
        .eq('client_id', client.id);

      if (savingsError) throw savingsError;

      // Récupération des prêts
      const { data: loansData, error: loansError } = await supabase
        .from('vw_loans')
        .select('*')
        .eq('client_id', client.id);

      if (loansError) throw loansError;

      setSavingsAccounts(savings || []);
      setLoans(loansData || []);
    } catch (error) {
      console.error('Error loading client data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">
            Client Overview – {client.first_name} {client.last_name}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="p-6 space-y-8">
            {/* Section 1 : Informations personnelles */}
            <section>
              <ClientHeaderCard client={client} />
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Informations du client</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                
                <InfoField label="Téléphone" value={client.phone || '-'} />
                <InfoField label="Email" value={client.email || '-'} />
                <InfoField label="Ville" value={client.city || '-'} />
                <InfoField label="Pays" value={client.country || '-'} />
                <InfoField label="Date de naissance" value={client.date_of_birth || '-'} />
                <InfoField label="Genre" value={client.gender || '-'} />
                <InfoField label="Profession" value={client.occupation || '-'} />
                <InfoField label="Type ID" value={client.id_type || '-'} />
                <InfoField label="N° ID" value={client.id_number || '-'} />
              </div>
            </section>

            {/* Section 2 : Comptes d’épargne */}
            <section>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Comptes d’épargne</h4>
              {savingsAccounts.length > 0 ? (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">#</th>
                        <th className="px-4 py-2 text-left">Produit</th>
                        <th className="px-4 py-2 text-left">N° Compte</th>
                        <th className="px-4 py-2 text-left">Solde</th>
                        <th className="px-4 py-2 text-left">Ouvert le</th>
                        <th className="px-4 py-2 text-left">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savingsAccounts.map((acc, i) => (
                        <tr key={acc.id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-2">{i + 1}</td>
                          <td className="px-4 py-2">{acc.savings_products?.name || '-'}</td>
                          <td className="px-4 py-2 font-medium">{acc.account_number}</td>
                          <td className="px-4 py-2">{acc.balance?.toLocaleString() || '0'}</td>
                          <td className="px-4 py-2">{new Date(acc.opened_date).toLocaleDateString()}</td>
                          <td className="px-4 py-2">{acc.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 italic">Aucun compte d’épargne trouvé.</p>
              )}
            </section>

            {/* Section 3 : Prêts */}
            <section>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Prêts</h4>
              {loans.length > 0 ? (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">#</th>
                        <th className="px-4 py-2 text-left">Produit</th>
                        <th className="px-4 py-2 text-left">Montant</th>
                        <th className="px-4 py-2 text-left">Solde restant</th>
                        <th className="px-4 py-2 text-left">Date de décaissement</th>
                        <th className="px-4 py-2 text-left">État</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loans.map((loan, i) => (
                        <tr key={loan.id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-2">{i + 1}</td>
                          <td className="px-4 py-2">{loan.loan_products?.name || '-'}</td>
                          <td className="px-4 py-2">{loan.principal?.toLocaleString() || '-'}</td>
                          <td className="px-4 py-2">{loan.outstanding_balance?.toLocaleString() || '-'}</td>
                          <td className="px-4 py-2">{loan.disbursement_date ? new Date(loan.disbursement_date).toLocaleDateString() : '-'}</td>
                          <td className="px-4 py-2">{loan.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 italic">Aucun prêt trouvé.</p>
              )}
            </section>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}


function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      <p className="text-sm text-gray-900">{value}</p>
    </div>
  );
}

function EditClientModal({ client, onClose, onSuccess }: { client: Client; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    first_name: client.first_name,
    last_name: client.last_name,
    phone: client.phone || '',
    email: client.email || '',
    date_of_birth: client.date_of_birth || '',
    gender: client.gender,
    address: client.address || '',
    city: client.city || '',
    country: client.country || '',
    id_type: client.id_type || '',
    id_number: client.id_number || '',
    occupation: client.occupation || '',
    kyc_status: client.kyc_status,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('clients')
        .update(formData)
        .eq('id', client.id);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating client:', error);
      alert(error.message || 'Failed to update client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Edit Client</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
              <input
                type="text"
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">KYC Status</label>
            <select
              value={formData.kyc_status}
              onChange={(e) => setFormData({ ...formData, kyc_status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddClientModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    date_of_birth: '',
    gender: 'M',
    address: '',
    city: '',
    country: '',
    id_type: '',
    id_number: '',
    occupation: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const clientNumber = `CLI${Date.now()}`;

      const { data: agencyData } = await supabase
        .from('agencies')
        .select('id')
        .limit(1)
        .single();

      const { error } = await supabase.from('clients').insert({
        ...formData,
        client_number: clientNumber,
        agency_id: agencyData?.id,
      });

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating client:', error);
      setError(error.message || 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Add New Client</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ID Type</label>
              <input
                type="text"
                value={formData.id_type}
                onChange={(e) => setFormData({ ...formData, id_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="CNI, Passport, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ID Number</label>
              <input
                type="text"
                value={formData.id_number}
                onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
            <input
              type="text"
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
              {loading ? 'Creating...' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
