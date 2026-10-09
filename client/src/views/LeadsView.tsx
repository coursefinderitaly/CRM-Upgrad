import React, { useState } from 'react';
import { Lead } from '../types/crm';
import { Plus, Download, Search, Filter, Phone, Calendar, MoreVertical, Edit2, UserCheck, Trash2 } from 'lucide-react';

interface LeadsViewProps {
  leads: Lead[];
  onAddNewLead: () => void;
  onSelectLead: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onEnrollLead: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
  onOpenPhone: (lead: Lead) => void;
  onOpenWhatsApp: (lead: Lead) => void;
  onScheduleFollowUp: (lead: Lead) => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({
  leads,
  onAddNewLead,
  onSelectLead,
  onEditLead,
  onEnrollLead,
  onDeleteLead,
  onOpenPhone,
  onOpenWhatsApp,
  onScheduleFollowUp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = leads.filter((l) => {
    if (countryFilter !== 'all' && l.countryInterest !== countryFilter) return false;
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        l.studentName.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.leadId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ['Lead ID,Name,Phone,Email,Country,Course,Source,Status,Last Activity,Next Follow-up'];
    const rows = filtered.map(
      (l) =>
        `"${l.leadId}","${l.studentName}","${l.phone}","${l.email}","${l.countryInterest}","${l.courseInterest}","${l.leadSource}","${l.status}","${l.lastActivity}","${l.nextFollowUp}"`
    );
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="p-4 space-y-4 max-w-[1536px] mx-auto select-none">
      {/* Page Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-[8px] border border-[#e5edf5]">
        <div>
          <h1 className="text-[16px] font-bold text-[#101d37]">Leads Directory</h1>
          <p className="text-[11.5px] text-[#52627a]">
            Managing {filtered.length} total student inquiries across all channels
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#e2e8f0] text-xs font-semibold text-[#52627a] hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onAddNewLead}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[#087cf5] hover:bg-[#006ee6] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Lead</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 rounded-[8px] border border-[#e5edf5] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-[#8496b0] absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by name, phone, email, lead ID..."
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-[6px] outline-none focus:border-[#087cf5]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="text-xs p-1.5 border border-slate-200 rounded-[6px] bg-white outline-none"
          >
            <option value="all">All Countries</option>
            <option value="Italy">Italy</option>
            <option value="Germany">Germany</option>
            <option value="Canada">Canada</option>
            <option value="UK">UK</option>
            <option value="Australia">Australia</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-1.5 border border-slate-200 rounded-[6px] bg-white outline-none"
          >
            <option value="all">All Stages</option>
            <option value="New Lead">New Lead</option>
            <option value="Counselling">Counselling</option>
            <option value="Interested">Interested</option>
            <option value="Enrolled">Enrolled</option>
            <option value="Follow-up">Follow-up</option>
            <option value="On Hold">On Hold</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[8px] border border-[#e5edf5] shadow-crm-card overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[#e5edf5] text-[#52627a] font-bold uppercase text-[11px]">
              <th className="px-3 py-2.5">Lead ID</th>
              <th className="px-3 py-2.5">Student Name</th>
              <th className="px-3 py-2.5">Country Interest</th>
              <th className="px-3 py-2.5">Course Interest</th>
              <th className="px-3 py-2.5">Source</th>
              <th className="px-3 py-2.5">Next Follow-up</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((l) => (
              <tr
                key={l.id}
                onClick={() => onSelectLead(l)}
                className="hover:bg-blue-50/40 cursor-pointer transition-colors"
              >
                <td className="px-3 py-2.5 font-medium text-slate-500">{l.leadId}</td>
                <td className="px-3 py-2.5">
                  <div className="font-semibold text-[#101d37]">{l.studentName}</div>
                  <div className="text-[10.5px] text-slate-500">{l.phone} • {l.email}</div>
                </td>
                <td className="px-3 py-2.5 font-medium">{l.countryInterest}</td>
                <td className="px-3 py-2.5 text-slate-600 truncate max-w-xs">{l.courseInterest}</td>
                <td className="px-3 py-2.5 text-slate-500">{l.leadSource}</td>
                <td className="px-3 py-2.5 text-red-600 font-medium whitespace-nowrap">{l.nextFollowUp}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                    {l.status}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onOpenPhone(l)}
                      className="p-1 rounded bg-green-500 hover:bg-green-600 text-white"
                      title="Call"
                    >
                      <Phone className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onScheduleFollowUp(l)}
                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
                      title="Follow-up"
                    >
                      <Calendar className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onEditLead(l)}
                      className="p-1 rounded hover:bg-slate-100 text-slate-500"
                      title="Edit"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeleteLead(l)}
                      className="p-1 rounded hover:bg-red-50 text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
