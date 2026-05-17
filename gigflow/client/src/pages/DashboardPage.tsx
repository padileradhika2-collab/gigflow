import React, { useEffect, useState } from 'react';
import { Users, TrendingUp, CheckCircle, XCircle, Phone } from 'lucide-react';
import { leadsApi } from '../api';
import { Lead } from '../types';
import { useAuth } from '../context/AuthContext';

interface Stats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  lost: number;
}

const StatCard = ({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-slate-500 text-sm">{label}</p>
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ total: 0, new: 0, contacted: 0, qualified: 0, lost: 0 });
  const [loading, setLoading] = useState(true);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await leadsApi.getAll({ limit: 100 });
        const leads: Lead[] = res.data.data.leads;
        setStats({
          total: res.data.meta.total,
          new: leads.filter(l => l.status === 'New').length,
          contacted: leads.filter(l => l.status === 'Contacted').length,
          qualified: leads.filter(l => l.status === 'Qualified').length,
          lost: leads.filter(l => l.status === 'Lost').length,
        });
        setRecentLeads(leads.slice(0, 5));
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back, {user?.name} 👋</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={stats.total} icon={Users} color="bg-sky-500" />
        <StatCard label="Qualified" value={stats.qualified} icon={CheckCircle} color="bg-green-500" />
        <StatCard label="Contacted" value={stats.contacted} icon={Phone} color="bg-yellow-500" />
        <StatCard label="Lost" value={stats.lost} icon={XCircle} color="bg-red-500" />
      </div>

      {/* Recent leads */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-sky-500" />
          <h2 className="font-semibold">Recent Leads</h2>
        </div>
        {recentLeads.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No leads yet. Add your first lead!</p>
        ) : (
          <div className="space-y-3">
            {recentLeads.map(lead => (
              <div key={lead._id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm">{lead.name}</p>
                  <p className="text-slate-500 text-xs">{lead.email}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium badge-${lead.status.toLowerCase()}`}>
                    {lead.status}
                  </span>
                  <p className="text-slate-400 text-xs mt-1">{lead.source}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
