import api from './axios';
import { LeadFilters } from '../types';

// Auth
export const authApi = {
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  getMe: () => api.get('/auth/me'),
};

// Leads
export const leadsApi = {
  getAll: (filters: LeadFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.append(key, String(value));
    });
    return api.get(`/leads?${params.toString()}`);
  },

  getOne: (id: string) => api.get(`/leads/${id}`),

  create: (data: { name: string; email: string; status?: string; source: string }) =>
    api.post('/leads', data),

  update: (id: string, data: Partial<{ name: string; email: string; status: string; source: string }>) =>
    api.put(`/leads/${id}`, data),

  delete: (id: string) => api.delete(`/leads/${id}`),

  exportCSV: (filters: LeadFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.append(key, String(value));
    });
    return api.get(`/leads/export/csv?${params.toString()}`, { responseType: 'blob' });
  },
};
