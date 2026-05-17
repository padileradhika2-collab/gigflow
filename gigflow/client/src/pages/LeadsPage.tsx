import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Download, Trash2, Pencil, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useLeads } from '../hooks/useLeads';
import { useAuth } from '../context/AuthContext';
import { Lead, LeadStatus, LeadSource } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import LeadForm from '../components/leads/LeadForm';

const LeadsPage = () => {
  const { user } = useAuth();
  const { leads, meta, isLoading, filters, updateFilter, deleteLead, exportCSV, refetch } = useLeads();
  const [showForm, setShowForm] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  const handleDelete = async (id: string) => {
    await deleteLead(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-slate-500 text-sm">{meta?.total ?? 0} total leads</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 text-sm">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={() => { setEditLead(null); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Add Lead
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search by name or email..."
            value={filters.search || ''}
            onChange={e => updateFilter('search', e.target.value)}
          />
        </div>

        {/* Status filter */}
        <select
          className="input w-auto min-w-[130px]"
          value={filters.status || ''}
          onChange={e => updateFilter('status', e.target.value)}
        >
          <option value="">All Status</option>
          {(['New', 'Contacted', 'Qualified', 'Lost'] as LeadStatus[]).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Source filter */}
        <select
          className="input w-auto min-w-[130px]"
          value={filters.source || ''}
          onChange={e => updateFilter('source', e.target.value)}
        >
          <option value="">All Sources</option>
          {(['Website', 'Instagram', 'Referral'] as LeadSource[]).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          className="input w-auto min-w-[110px]"
          value={filters.sort || 'latest'}
          onChange={e => updateFilter('sort', e.target.value)}
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 text-lg">No leads found</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or add a new lead</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-50 dark:bg-slate-900/50">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Email</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Source</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Created</th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {leads.map(lead => (
                  <tr key={lead._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-sm">{lead.name}</td>
                    <td className="px-4 py-3 text-slate-500 text-sm">{lead.email}</td>
                    <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                    <td className="px-4 py-3 text-slate-500 text-sm">{lead.source}</td>
                    <td className="px-4 py-3 text-slate-500 text-sm">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/leads/${lead._id}`} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
                          <ExternalLink size={15} />
                        </Link>
                        <button onClick={() => { setEditLead(lead); setShowForm(true); }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
                          <Pencil size={15} />
                        </button>
                        {isAdmin && (
                          <button onClick={() => setDeleteConfirm(lead._id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-slate-500">
              Page {meta.page} of {meta.totalPages}
            </p>
            <div className="flex gap-2">
              <button disabled={!meta.hasPrevPage} onClick={() => updateFilter('page', meta.page - 1)}
                className="btn-secondary p-2 disabled:opacity-40">
                <ChevronLeft size={16} />
              </button>
              <button disabled={!meta.hasNextPage} onClick={() => updateFilter('page', meta.page + 1)}
                className="btn-secondary p-2 disabled:opacity-40">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lead Form Modal */}
      {showForm && (
        <LeadForm
          lead={editLead}
          onClose={() => { setShowForm(false); setEditLead(null); }}
          onSuccess={refetch}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative card p-6 w-full max-w-sm z-10">
            <h3 className="font-bold text-lg mb-2">Delete Lead?</h3>
            <p className="text-slate-500 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsPage;
