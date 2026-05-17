import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import { Lead } from '../types';
import { leadsApi } from '../api';
import { StatusBadge } from '../components/ui/StatusBadge';
import LeadForm from '../components/leads/LeadForm';
import toast from 'react-hot-toast';

const LeadDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  const fetchLead = async () => {
    try {
      const res = await leadsApi.getOne(id!);
      setLead(res.data.data.lead);
    } catch {
      toast.error('Lead not found');
      navigate('/leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLead(); }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
    </div>
  );

  if (!lead) return null;

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold">Lead Details</h1>
        <button onClick={() => setShowEdit(true)} className="ml-auto btn-secondary flex items-center gap-2 text-sm">
          <Pencil size={15} /> Edit
        </button>
      </div>

      <div className="card p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">{lead.name}</h2>
            <p className="text-slate-500">{lead.email}</p>
          </div>
          <StatusBadge status={lead.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          {[
            { label: 'Source', value: lead.source },
            { label: 'Created By', value: lead.createdBy?.name || 'N/A' },
            { label: 'Created At', value: new Date(lead.createdAt).toLocaleString() },
            { label: 'Last Updated', value: new Date(lead.updatedAt).toLocaleString() },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</p>
              <p className="font-medium text-sm">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {showEdit && (
        <LeadForm
          lead={lead}
          onClose={() => setShowEdit(false)}
          onSuccess={fetchLead}
        />
      )}
    </div>
  );
};

export default LeadDetailPage;
