import React from 'react';
import { LeadStatus } from '../../types';

const statusStyles: Record<LeadStatus, string> = {
  New: 'badge-new',
  Contacted: 'badge-contacted',
  Qualified: 'badge-qualified',
  Lost: 'badge-lost',
};

export const StatusBadge = ({ status }: { status: LeadStatus }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
    {status}
  </span>
);
