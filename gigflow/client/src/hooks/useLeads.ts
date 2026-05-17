import { useState, useEffect, useCallback } from 'react';
import { Lead, LeadFilters, PaginationMeta } from '../types';
import { leadsApi } from '../api';
import { useDebounce } from './useDebounce';
import toast from 'react-hot-toast';

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<LeadFilters>({ sort: 'latest', page: 1, limit: 10 });

  const debouncedSearch = useDebounce(filters.search, 400);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await leadsApi.getAll({ ...filters, search: debouncedSearch });
      setLeads(res.data.data.leads);
      setMeta(res.data.meta);
    } catch {
      toast.error('Failed to fetch leads');
    } finally {
      setIsLoading(false);
    }
  }, [filters, debouncedSearch]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const updateFilter = (key: keyof LeadFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, page: key !== 'page' ? 1 : Number(value) }));
  };

  const deleteLead = async (id: string) => {
    try {
      await leadsApi.delete(id);
      toast.success('Lead deleted');
      fetchLeads();
    } catch {
      toast.error('Failed to delete lead');
    }
  };

  const exportCSV = async () => {
    try {
      const res = await leadsApi.exportCSV(filters);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'leads-export.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported!');
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  return { leads, meta, isLoading, filters, updateFilter, deleteLead, exportCSV, refetch: fetchLeads };
};
