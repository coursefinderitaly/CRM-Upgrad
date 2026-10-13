import React, { useState } from 'react';
import {
  Filter,
  Phone,
  Calendar,
  MoreVertical,
  ChevronDown,
  Check,
  Edit2,
  Trash2,
  UserCheck,
  FileText,
  Clock,
  ArrowUpDown,
} from 'lucide-react';
import { Lead } from '../../types/crm';

interface LeadManagementTableProps {
  leads: Lead[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabCounts: Record<string, number>;
  selectedLeadId: string;
  onSelectLead: (lead: Lead) => void;
  onOpenPhone: (lead: Lead) => void;
  onOpenWhatsApp: (lead: Lead) => void;
  onScheduleFollowUp: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onEnrollLead: (lead: Lead) => void;
  onTransferDocs: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
  viewMode: 'table' | 'kanban';
  onViewModeChange: (mode: 'table' | 'kanban') => void;
  onUpdateStatus?: (leadId: string, newStatus: string) => void;
}

export const LeadManagementTable: React.FC<LeadManagementTableProps> = ({
  leads,
  activeTab,
  onTabChange,
  tabCounts,
  selectedLeadId,
  onSelectLead,
  onOpenPhone,
  onOpenWhatsApp,
  onScheduleFollowUp,
  onEditLead,
  onEnrollLead,
  onTransferDocs,
  onDeleteLead,
  viewMode,
  onViewModeChange,
  onUpdateStatus,
}) => {
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const tabs = [
    { id: 'My Leads', label: 'My Leads', count: tabCounts.myLeads ?? 48 },
    { id: 'Counselling', label: 'Counselling', count: tabCounts.counselling ?? 15 },
    { id: 'Enrolled', label: 'Enrolled', count: tabCounts.enrolled ?? 8 },
    { id: 'Transferred', label: 'Transferred', count: tabCounts.transferred ?? 5 },
    { id: 'On Hold', label: 'On Hold', count: tabCounts.onHold ?? 6 },
    { id: 'Lost', label: 'Lost', count: tabCounts.lost ?? 3 },
  ];

  // Country Flags map
  const getFlag = (country: string) => {
    switch (country.toLowerCase()) {
      case 'italy':
        return '🇮🇹';
      case 'germany':
        return '🇩🇪';
      case 'canada':
        return '🇨🇦';
      case 'uk':
      case 'united kingdom':
        return '🇬🇧';
      case 'australia':
        return '🇦🇺';
      default:
        return '🌐';
    }
  };

  // Status badge styling matching reference screenshot
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New Lead':
        return (
          <span className="inline-block px-1.5 py-0.5 rounded-[4px] bg-[#dbeafe] text-[#1d4ed8] text-[10px] font-medium border border-[#bfdbfe]/50">
            New Lead
          </span>
        );
      case 'Counselling':
        return (
          <span className="inline-block px-1.5 py-0.5 rounded-[4px] bg-[#fef3c7] text-[#b45309] text-[10px] font-medium border border-[#fde68a]/50">
            Counselling
          </span>
        );
      case 'Interested':
        return (
          <span className="inline-block px-1.5 py-0.5 rounded-[4px] bg-[#ede9fe] text-[#6d28d9] text-[10px] font-medium border border-[#ddd6fe]/50">
            Interested
          </span>
        );
      case 'Enrolled':
        return (
          <span className="inline-block px-1.5 py-0.5 rounded-[4px] bg-[#dcfce7] text-[#15803d] text-[10px] font-medium border border-[#bbf7d0]/50">
            Enrolled
          </span>
        );
      case 'Follow-up':
        return (
          <span className="inline-block px-1.5 py-0.5 rounded-[4px] bg-[#ffe4e6] text-[#be123c] text-[10px] font-medium border border-[#fecdd3]/50">
            Follow-up
          </span>
        );
      case 'On Hold':
        return (
          <span className="inline-block px-1.5 py-0.5 rounded-[4px] bg-[#f1f5f9] text-[#475569] text-[10px] font-medium border border-[#e2e8f0]">
            On Hold
          </span>
        );
      case 'Lost':
        return (
          <span className="inline-block px-1.5 py-0.5 rounded-[4px] bg-[#fee2e2] text-[#b91c1c] text-[10px] font-medium border border-[#fecaca]/50">
            Lost
          </span>
        );
      default:
        return (
          <span className="inline-block px-1.5 py-0.5 rounded-[4px] bg-slate-100 text-slate-700 text-[11px] font-medium">
            {status}
          </span>
        );
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRowIds(new Set(leads.map((l) => l.id)));
    } else {
      setSelectedRowIds(new Set());
    }
  };

  const handleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedRowIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRowIds(next);
  };

  // Filtered leads
  const filteredLeads = leads.filter((l) => {
    if (countryFilter !== 'all' && l.countryInterest !== countryFilter) return false;
    if (sourceFilter !== 'all' && l.leadSource !== sourceFilter) return false;
    return true;
  });

  return (
    <div className="bg-white rounded-[8px] border border-[#e5edf5] shadow-crm-card mb-3.5">
      {/* Top Header / Tabs & Controls Row */}
      <div className="px-3 py-2 border-b border-[#e5edf5] flex items-center gap-2 overflow-x-auto scrollbar-none">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 shrink-0">
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-medium transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#087cf5] text-white font-semibold shadow-xs'
                    : 'bg-[#f4f8fc] text-[#52627a] hover:bg-[#eaf1f8] hover:text-[#101d37]'
                }`}
              >
                <span>{t.label}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-white text-[#087cf5]'
                      : 'bg-[#e2e8f0] text-[#475569]'
                  }`}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Divider right after 'Lost' */}
        <div className="h-4 w-[1px] bg-slate-200 mx-0.5 shrink-0" />

        {/* View Controls & Filter - shifted to upper line directly after 'Lost' */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onViewModeChange('table')}
            className={`px-2.5 py-1 rounded-[6px] text-[12px] font-medium transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'table'
                ? 'bg-[#087cf5] text-white font-semibold shadow-xs'
                : 'bg-white text-[#52627a] border border-[#e2e8f0] hover:bg-slate-50'
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => onViewModeChange('kanban')}
            className={`px-2.5 py-1 rounded-[6px] text-[12px] font-medium transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'kanban'
                ? 'bg-[#087cf5] text-white font-semibold shadow-xs'
                : 'bg-white text-[#52627a] border border-[#e2e8f0] hover:bg-slate-50'
            }`}
          >
            Kanban View
          </button>

          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-medium bg-white text-[#52627a] border border-[#e2e8f0] hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <Filter className="w-3.5 h-3.5 text-[#52627a]" />
              <span>Filter</span>
            </button>

            {/* Quick Filter Menu */}
            {showFilterDropdown && (
              <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 w-52 bg-white border border-[#e2e8f0] rounded-lg shadow-xl p-2.5 z-50 space-y-2">
                <div className="text-[11px] font-bold text-[#101d37]">Country</div>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="w-full text-xs p-1 border border-slate-200 rounded"
                >
                  <option value="all">All Countries</option>
                  <option value="Italy">Italy</option>
                  <option value="Germany">Germany</option>
                  <option value="Canada">Canada</option>
                  <option value="UK">UK</option>
                  <option value="Australia">Australia</option>
                </select>

                <div className="text-[11px] font-bold text-[#101d37] pt-1">Source</div>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-full text-xs p-1 border border-slate-200 rounded"
                >
                  <option value="all">All Sources</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="Website">Website</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Justdial">Justdial</option>
                  <option value="Referral">Referral</option>
                </select>

                <button
                  onClick={() => {
                    setCountryFilter('all');
                    setSourceFilter('all');
                    setShowFilterDropdown(false);
                  }}
                  className="w-full text-[11px] text-center text-[#087cf5] hover:underline pt-1"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content: Table View */}
      {viewMode === 'table' ? (
        <div className="overflow-y-auto max-h-[360px]">
          <table className="w-full table-fixed text-left border-collapse">
            <colgroup>
              <col className="w-[30px]" />
              <col className="w-[22px]" />
              <col className="w-[15%]" />
              <col className="w-[11%]" />
              <col className="w-[13%]" />
              <col className="w-[10%]" />
              <col className="w-[11%]" />
              <col className="w-[11%]" />
              <col className="w-[9%]" />
              <col className="w-[108px]" />
            </colgroup>
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f8fafc] border-b border-[#e5edf5] text-[10px] font-bold text-[#52627a] uppercase tracking-wide whitespace-nowrap">
                <th className="px-1.5 py-1.5 text-center">
                  <input
                    type="checkbox"
                    checked={selectedRowIds.size === leads.length && leads.length > 0}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-[#087cf5] focus:ring-0"
                  />
                </th>
                <th className="px-1 py-1.5 text-center text-[#8496b0]">#</th>
                <th className="px-1.5 py-1.5">Student Name</th>
                <th className="px-1.5 py-1.5">Country Interest</th>
                <th className="px-1.5 py-1.5">Course Interest</th>
                <th className="px-1.5 py-1.5">Lead Source</th>
                <th className="px-1.5 py-1.5">Last Activity</th>
                <th className="px-1.5 py-1.5">Next Follow-up</th>
                <th className="px-1.5 py-1.5">Status</th>
                <th className="px-1.5 py-1.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2f7] text-[11px] text-[#101d37]">
              {filteredLeads.map((lead, index) => {
                const isSelected = selectedLeadId === lead.id;
                const isChecked = selectedRowIds.has(lead.id);

                return (
                  <tr
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#f0f7ff]'
                        : 'hover:bg-[#f8fafc]'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-2 py-1.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        onClick={(e) => handleSelectRow(lead.id, e)}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-[#087cf5] focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Row Index */}
                    <td className="px-1 py-1.5 text-center text-[#8496b0] text-[11px]">
                      {index + 1}
                    </td>

                    {/* Student Name & Avatar & Phone */}
                    <td className="px-1.5 py-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <img
                          src={
                            lead.studentName === 'Rahul Sharma'
                              ? '/avatars/row_rahul.png'
                              : lead.studentName === 'Priya Singh'
                              ? '/avatars/priya.png'
                              : lead.studentName === 'Amit Kumar'
                              ? '/avatars/amit.png'
                              : lead.studentName === 'Sneha Patel'
                              ? '/avatars/sneha.png'
                              : lead.studentName === 'Rohit Verma'
                              ? '/avatars/rohit.png'
                              : lead.avatarUrl || '/avatars/row_rahul.png'
                          }
                          alt={lead.studentName}
                          className="w-5 h-5 aspect-square rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-[#101d37] leading-tight truncate">
                            {lead.studentName}
                          </div>
                          <div className="text-[10px] text-[#64748b] leading-tight mt-0.5 truncate">
                            {lead.phone}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Country Interest with flag */}
                    <td className="px-1.5 py-1.5 font-medium text-[#101d37]">
                      <span className="flex items-center min-w-0">
                        <span className="mr-1 text-sm shrink-0">{getFlag(lead.countryInterest)}</span>
                        <span className="truncate">{lead.countryInterest}</span>
                      </span>
                    </td>

                    {/* Course Interest */}
                    <td className="px-1.5 py-1.5 text-[#334155] truncate">
                      {lead.courseInterest}
                    </td>

                    {/* Lead Source */}
                    <td className="px-1.5 py-1.5 text-[#52627a] truncate">
                      {lead.leadSource}
                    </td>

                    {/* Last Activity */}
                    <td className="px-1.5 py-1.5 text-[#52627a] whitespace-nowrap">
                      {lead.lastActivity}
                    </td>

                    {/* Next Follow-up (red highlight matching screenshot) */}
                    <td className="px-1.5 py-1.5 text-[#e11d48] font-medium whitespace-nowrap">
                      {lead.nextFollowUp}
                    </td>

                    {/* Status Badge */}
                    <td className="px-1.5 py-1.5 whitespace-nowrap">
                      {getStatusBadge(lead.status)}
                    </td>

                    {/* Row Actions */}
                    <td className="px-1.5 py-1.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        {/* Green Call button */}
                        <button
                          onClick={() => onOpenPhone(lead)}
                          className="w-5 h-5 rounded bg-[#22c55e] hover:bg-[#16a34a] text-white flex items-center justify-center transition-colors shadow-xs"
                          title="Call Lead"
                        >
                          <Phone className="w-3 h-3" />
                        </button>

                        {/* WhatsApp button */}
                        <button
                          onClick={() => onOpenWhatsApp(lead)}
                          className="w-5 h-5 rounded bg-[#10b981]/15 hover:bg-[#10b981]/25 text-[#059669] flex items-center justify-center transition-colors"
                          title="Message on WhatsApp"
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                          </svg>
                        </button>

                        {/* Calendar button */}
                        <button
                          onClick={() => onScheduleFollowUp(lead)}
                          className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-[#52627a] flex items-center justify-center transition-colors"
                          title="Schedule Follow-up"
                        >
                          <Calendar className="w-3 h-3" />
                        </button>

                        {/* More 3-dots Menu */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveMenuId(activeMenuId === lead.id ? null : lead.id)
                            }
                            className="w-5 h-5 rounded hover:bg-slate-100 text-[#64748b] flex items-center justify-center transition-colors"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {activeMenuId === lead.id && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-[#e2e8f0] rounded-lg shadow-xl py-1 z-40 text-left">
                              <button
                                onClick={() => {
                                  onSelectLead(lead);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-[#101d37] hover:bg-slate-50 flex items-center gap-2"
                              >
                                <span>View Profile</span>
                              </button>
                              <button
                                onClick={() => {
                                  onEditLead(lead);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-[#101d37] hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Edit2 className="w-3 h-3 text-[#52627a]" />
                                <span>Edit Lead</span>
                              </button>
                              <button
                                onClick={() => {
                                  onEnrollLead(lead);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-[#15803d] hover:bg-green-50 flex items-center gap-2"
                              >
                                <UserCheck className="w-3 h-3 text-[#15803d]" />
                                <span>Convert to Student</span>
                              </button>
                              <button
                                onClick={() => {
                                  onTransferDocs(lead);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-[#7c3aed] hover:bg-purple-50 flex items-center gap-2"
                              >
                                <FileText className="w-3 h-3 text-[#7c3aed]" />
                                <span>Transfer to Docs</span>
                              </button>
                              <div className="border-t border-slate-100 my-1" />
                              <button
                                onClick={() => {
                                  onDeleteLead(lead);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-3 h-3 text-red-600" />
                                <span>Delete Lead</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Kanban Board View */
        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 overflow-x-auto min-h-[340px]">
          {['New Lead', 'Counselling', 'Enrolled', 'On Hold'].map((colStage) => {
            const colLeads = leads.filter((l) => l.status === colStage);
            return (
              <div
                key={colStage}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('bg-blue-50/50');
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('bg-blue-50/50');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('bg-blue-50/50');
                  const leadId = e.dataTransfer.getData('text/plain');
                  if (leadId && onUpdateStatus) {
                    onUpdateStatus(leadId, colStage);
                  }
                }}
                className="bg-[#f8fafc] rounded-lg p-2.5 border border-[#e2e8f0] flex flex-col transition-colors"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <span className="text-[12px] font-bold text-[#101d37]">{colStage}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
                    {colLeads.length}
                  </span>
                </div>
                <div className="space-y-2 flex-1">
                  {colLeads.map((item) => (
                    <div
                      key={item.id}
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', item.id);
                      }}
                      onClick={() => onSelectLead(item)}
                      className="bg-white p-2.5 rounded-md border border-[#e5edf5] shadow-xs hover:border-[#087cf5] cursor-grab active:cursor-grabbing transition-shadow hover:shadow-sm"
                    >
                      <div className="font-bold text-[12px] text-[#101d37]">{item.studentName}</div>
                      <div className="text-[10.5px] text-[#52627a] mt-0.5">
                        {item.countryInterest} • {item.courseInterest}
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                        <span className="text-[10px] text-red-500 font-medium">
                          {item.nextFollowUp}
                        </span>
                        {onUpdateStatus && (
                          <select
                            value={item.status}
                            onChange={(e) => onUpdateStatus(item.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] border border-slate-200 rounded px-1 py-0.5 bg-slate-50 cursor-pointer"
                          >
                            <option value="New Lead">New Lead</option>
                            <option value="Counselling">Counselling</option>
                            <option value="Enrolled">Enrolled</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Lost">Lost</option>
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                  {colLeads.length === 0 && (
                    <div className="h-20 border-2 border-dashed border-slate-200 rounded-md flex items-center justify-center text-[11px] text-slate-400">
                      Drop lead here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      )}
    </div>
  );
};
