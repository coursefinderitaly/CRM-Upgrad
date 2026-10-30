import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  History as HistoryIcon,
  Search,
  RefreshCw,
  UserRound,
  ArrowRight,
  FilePlus2,
  PencilLine,
  Repeat,
  Trash2,
  Filter,
} from 'lucide-react';
import { fetchAudit, AuditEntry } from '../services/api';
import { PORTAL_CONFIGS } from '../types/auth';

// Friendly labels for raw field keys
const FIELD_LABELS: Record<string, string> = {
  studentName: 'Full Name',
  name: 'Full Name',
  phone: 'Mobile Number',
  email: 'Email Address',
  dob: 'Date of Birth',
  address: 'Address',
  nationality: 'Nationality',
  country: 'Country',
  countryInterest: 'Country Interest',
  courseInterest: 'Course Interest',
  preferred_course: 'Preferred Course',
  course_level: 'Course Level',
  intake: 'Target Intake',
  budget: 'Budget',
  budget_bracket: 'Budget Bracket',
  universityType: 'University Type',
  preferredCity: 'Preferred City',
  target_university: 'Target University',
  leadSource: 'Lead Source',
  lead_source: 'Lead Source',
  lastActivity: 'Last Activity',
  nextFollowUp: 'Next Follow-up',
  next_follow_up: 'Next Follow-up',
  nextFollowUpTime: 'Follow-up Time',
  nextFollowUpTask: 'Follow-up Task',
  status: 'Status',
  overall_status: 'Overall Status',
  currentStage: 'Pipeline Stage',
  current_stage: 'Current Stage',
  stage_number: 'Stage Number',
  priority: 'Priority',
  notes: 'Notes',
  tenthPercentage: '10th Percentage',
  tenth_board: '10th Board',
  tenth_percentage: '10th Percentage',
  twelfthPercentage: '12th Percentage',
  twelfth_board: '12th Board',
  twelfth_percentage: '12th Percentage',
  graduationDegree: 'Graduation Degree',
  bachelor_degree: 'Bachelor Degree',
  graduationCgpa: 'Graduation CGPA',
  bachelor_cgpa: 'Bachelor CGPA',
  testType: 'Test Type',
  testOverallScore: 'Test Overall Score',
  counsellor_name: 'Counsellor',
  counsellorName: 'Counsellor',
  // Payments & Installments
  plan_name: 'Payment Plan Name',
  agreed_budget: 'Agreed Budget',
  total_package_fee: 'Total Package Fee',
  total_paid: 'Total Paid Amount',
  balance_due: 'Balance Due',
  installment_count: 'Installment Count',
  gst_included: 'GST Included',
  gst_percentage: 'GST %',
  gst_amount: 'GST Amount',
  payment_status: 'Payment Status',
  installment: 'Payment Installment',
  installment_status: 'Installment Status',
  installment_amount: 'Installment Amount',
  installment_total_amount: 'Installment Total Amount',
  installment_due_date: 'Installment Due Date',
  installment_payment_date: 'Payment Received Date',
  installment_payment_mode: 'Payment Mode',
  installment_transaction_ref: 'Transaction Ref',
  installment_receipt_no: 'Receipt No.',
  service_package: 'Service Package',
  total_fee: 'Total Fee',
  amount_paid: 'Amount Paid',
  balance: 'Balance',
  payment_schedule: 'Payment Schedule',
  agreement_signed: 'Agreement Signed',
  agreement_status: 'Agreement Status',
  // Counselling sessions
  counselling_session: 'Counselling Session',
  counselling_status: 'Session Status',
  counselling_session_date: 'Session Date',
  counselling_session_time: 'Session Time',
  counselling_notes: 'Counselling Notes',
  counselling_recommendations: 'Session Recommendations',
  counselling_outcome: 'Session Outcome',
  // Visa & Stages
  vfs_center: 'VFS Center',
  visa_type: 'Visa Type',
  appointment_date: 'Visa Appointment Date',
  appointment_time: 'Visa Appointment Time',
  vfs_reference_no: 'VFS Ref No',
  visa_decision: 'Visa Decision',
  scholarship_name: 'Scholarship Name',
  scholarship_status: 'Scholarship Status',
};

function prettyField(field: string | null): string {
  if (!field) return 'profile';
  if (FIELD_LABELS[field]) return FIELD_LABELS[field];
  return field
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const PORTAL_COLORS: Record<string, string> = Object.values(PORTAL_CONFIGS).reduce(
  (acc, p) => ({ ...acc, [p.title]: p.accentHex }),
  {} as Record<string, string>
);

function portalColor(portal: string | null): string {
  if (!portal) return '#64748b';
  return PORTAL_COLORS[portal] || '#64748b';
}

function initials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatTime(raw: string): string {
  try {
    const d = new Date(raw.replace(' ', 'T') + 'Z');
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return raw;
  }
}

function dayKey(raw: string): string {
  try {
    const d = new Date(raw.replace(' ', 'T') + 'Z');
    if (isNaN(d.getTime())) return 'Unknown date';
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return raw;
  }
}

function actionVerb(action: string, field: string | null): string {
  if (action === 'created') return field && field !== 'profile' ? 'added' : 'created the profile';
  if (action === 'stage-changed') return 'changed status / stage of';
  if (action === 'deleted') return 'removed';
  return 'updated';
}

function ActionIcon({ action }: { action: string }) {
  if (action === 'created') return <FilePlus2 className="w-3.5 h-3.5" />;
  if (action === 'stage-changed') return <Repeat className="w-3.5 h-3.5" />;
  if (action === 'deleted') return <Trash2 className="w-3.5 h-3.5" />;
  return <PencilLine className="w-3.5 h-3.5" />;
}

export const HistoryView: React.FC = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [serverDown, setServerDown] = useState(false);
  const [search, setSearch] = useState('');
  const [portal, setPortal] = useState('all');
  const [action, setAction] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAudit({
        search: search.trim() || undefined,
        portal: portal !== 'all' ? portal : undefined,
        action: action !== 'all' ? action : undefined,
        limit: 300,
      });
      setEntries(res.entries);
      setTotal(res.total);
      setServerDown(false);
    } catch {
      setServerDown(true);
    } finally {
      setLoading(false);
    }
  }, [search, portal, action]);

  useEffect(() => {
    const t = setTimeout(load, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [load]);

  const stats = useMemo(() => {
    const profiles = new Set(entries.map((e) => e.entityId)).size;
    const operators = new Set(entries.map((e) => e.actorName || 'Unknown')).size;
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayCount = entries.filter((e) => e.createdAt.slice(0, 10) === todayStr).length;
    return { profiles, operators, todayCount };
  }, [entries]);

  const grouped = useMemo(() => {
    const map = new Map<string, AuditEntry[]>();
    for (const e of entries) {
      const k = dayKey(e.createdAt);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(e);
    }
    return Array.from(map.entries());
  }, [entries]);

  const portalOptions = useMemo(() => Object.values(PORTAL_CONFIGS).map((p) => p.title), []);

  return (
    <div className="space-y-3 p-2.5 sm:p-4 max-w-[1536px] mx-auto select-none">
      {/* Header strip */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-950 rounded-xl p-3 sm:p-4 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
            <HistoryIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold leading-tight">Profile History</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white">
                Audit Trail
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Every tweak on every student profile — who changed what, where and when
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-white/10 rounded-lg px-2.5 py-1.5">
            <span className="text-[10px] text-slate-300 block">Changes</span>
            <span className="text-sm font-bold text-white">{loading ? '…' : total}</span>
          </div>
          <div className="bg-white/10 rounded-lg px-2.5 py-1.5">
            <span className="text-[10px] text-slate-300 block">Profiles</span>
            <span className="text-sm font-bold text-white">{loading ? '…' : stats.profiles}</span>
          </div>
          <div className="bg-white/10 rounded-lg px-2.5 py-1.5">
            <span className="text-[10px] text-slate-300 block">Operators</span>
            <span className="text-sm font-bold text-white">{loading ? '…' : stats.operators}</span>
          </div>
          <div className="bg-white/10 rounded-lg px-2.5 py-1.5">
            <span className="text-[10px] text-slate-300 block">Today</span>
            <span className="text-sm font-bold text-emerald-300">{loading ? '…' : stats.todayCount}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded-xl border border-[#e5edf5] shadow-xs flex flex-col sm:flex-row sm:items-center gap-2.5">
        <div className="relative flex-1 min-w-0">
          <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student, profile code, operator or field..."
            className="w-full text-xs pl-8 pr-3 py-2 border border-[#cbd5e1] rounded-lg outline-none focus:ring-1 focus:ring-[#087cf5] bg-white placeholder-[#94a3b8]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#94a3b8] shrink-0" />
          <select
            value={portal}
            onChange={(e) => setPortal(e.target.value)}
            className="text-xs px-2.5 py-2 border border-[#cbd5e1] rounded-lg outline-none focus:ring-1 focus:ring-[#087cf5] bg-white text-[#101d37]"
          >
            <option value="all">All Portals</option>
            {portalOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="text-xs px-2.5 py-2 border border-[#cbd5e1] rounded-lg outline-none focus:ring-1 focus:ring-[#087cf5] bg-white text-[#101d37]"
          >
            <option value="all">All Actions</option>
            <option value="created">Created / Added</option>
            <option value="updated">Updated</option>
            <option value="stage-changed">Stage / Status Changed</option>
            <option value="deleted">Deleted</option>
          </select>
          <button
            onClick={load}
            title="Refresh history"
            className="p-2 rounded-lg border border-[#cbd5e1] text-[#52627a] hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-[#e5edf5] shadow-xs p-3 sm:p-4">
        {loading ? (
          <div className="py-10 text-center text-xs text-[#8496b0]">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
            Loading change history...
          </div>
        ) : entries.length === 0 ? (
          <div className="py-10 text-center">
            <HistoryIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#101d37]">No history yet</p>
            <p className="text-xs text-[#8496b0] mt-1 max-w-md mx-auto">
              {serverDown
                ? 'Could not reach the CRM server, so no audit records could be loaded. Start the backend and make a profile change to see it appear here.'
                : 'No changes match these filters. Edit any student profile (name, phone, status…) and it will be recorded here with the operator and portal.'}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {grouped.map(([day, dayEntries]) => (
              <div key={day}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">{day}</span>
                  <span className="h-px flex-1 bg-slate-100" />
                  <span className="text-[10.5px] text-[#94a3b8] font-medium">
                    {dayEntries.length} change{dayEntries.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200" />
                  <div className="space-y-2">
                    {dayEntries.map((e) => (
                      <div
                        key={e.id}
                        className="relative flex gap-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors p-2.5 pl-1"
                      >
                        <div
                          className="ml-2 w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 ring-2 ring-white shadow-xs"
                          style={{ backgroundColor: portalColor(e.portal) }}
                          title={e.portal || 'Unknown portal'}
                        >
                          <ActionIcon action={e.action} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[12.5px] leading-snug">
                            <span className="inline-flex items-center gap-1 font-bold text-[#101d37]">
                              <UserRound className="w-3 h-3 text-slate-400" />
                              {e.actorName || 'Unknown operator'}
                            </span>
                            <span className="text-[#52627a]">{actionVerb(e.action, e.field)}</span>
                            {e.action !== 'created' && e.field && (
                              <span className="font-semibold text-[#087cf5] bg-blue-50 border border-blue-100 rounded px-1.5 py-px text-[11.5px]">
                                {prettyField(e.field)}
                              </span>
                            )}
                            <span className="text-[#52627a]">on</span>
                            <span className="font-bold text-[#101d37] truncate">
                              {e.studentName || 'Unnamed profile'}
                            </span>
                            {e.entityCode && (
                              <span className="font-mono text-[10.5px] text-slate-500 bg-slate-100 rounded px-1.5 py-px">
                                {e.entityCode}
                              </span>
                            )}
                          </div>

                          {e.action === 'updated' && (
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11.5px]">
                              <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 line-through decoration-rose-300 max-w-[280px] truncate">
                                {e.oldValue || '(empty)'}
                              </span>
                              <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium max-w-[280px] truncate">
                                {e.newValue || '(empty)'}
                              </span>
                            </div>
                          )}
                          {e.action === 'stage-changed' && (
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11.5px]">
                              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 max-w-[280px] truncate">
                                {e.oldValue || '(none)'}
                              </span>
                              <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="px-2 py-0.5 rounded bg-violet-50 border border-violet-200 text-violet-700 font-medium max-w-[280px] truncate">
                                {e.newValue || '(none)'}
                              </span>
                            </div>
                          )}
                          {e.action === 'deleted' && (
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11.5px]">
                              {e.oldValue && (
                                <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 line-through max-w-[320px] truncate">
                                  {e.oldValue}
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded bg-rose-100 border border-rose-300 text-rose-800 font-medium max-w-[320px] truncate">
                                {e.newValue || 'Deleted'}
                              </span>
                            </div>
                          )}
                          {e.action === 'created' && e.newValue && (
                            <div className="mt-1 text-[11.5px] text-[#52627a] bg-emerald-50/60 border border-emerald-200/60 rounded px-2 py-0.5 inline-block">
                              {e.newValue}
                            </div>
                          )}

                          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10.5px] text-[#8496b0]">
                            {e.portal && (
                              <span
                                className="font-semibold px-1.5 py-px rounded-full text-white"
                                style={{ backgroundColor: portalColor(e.portal) }}
                              >
                                {e.portal}
                              </span>
                            )}
                            <span>{formatTime(e.createdAt)}</span>
                            {e.actorEmail && <span className="truncate">{e.actorEmail}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
