import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  Search,
  UserPlus,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  FolderCheck,
  AlertCircle,
  Phone,
  Mail,
  Layers,
  Lock,
} from 'lucide-react';
import { Lead } from '../../types/crm';
import { useWorkflow } from '../../context/WorkflowContext';
import { useAuth } from '../../context/AuthContext';
import {
  createLead,
  fetchGoogleSheetConfig,
  saveGoogleSheetConfig,
  recordGoogleSheetConverted,
  fetchGoogleSheetCsv,
} from '../../services/api';
import { StudentAvatar } from '../common/StudentAvatar';
import { countryFlag } from '../../utils/country';

interface GoogleSheetMetaLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadAdded?: (lead: Lead) => void;
  viewOnly?: boolean;
}

interface RawSheetLead {
  id: string;
  name: string;
  phone: string;
  email: string;
  country: string;
  course: string;
  intake: string;
  budget: string;
  campaign: string;
  city: string;
  date: string;
  rawRow: Record<string, string>;
}

interface ConvertedLeadRecord {
  studentId?: string;
  studentName?: string;
  counsellor?: string;
  convertedAt?: string;
}

const STORAGE_CONVERTED_KEY = 'crm_meta_sheet_converted_leads_v2';
const STORAGE_SHEET_URL_KEY = 'crm_meta_sheet_last_url';

function parseCsvData(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const nextCh = text[i + 1];
    if (ch === '"') {
      if (inQuotes && nextCh === '"') {
        currentLine += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && nextCh === '\n') i++;
      if (currentLine.trim()) lines.push(currentLine);
      currentLine = '';
    } else {
      currentLine += ch;
    }
  }
  if (currentLine.trim()) lines.push(currentLine);

  if (lines.length === 0) return { headers: [], rows: [] };

  const splitRow = (line: string): string[] => {
    const cells: string[] = [];
    let cell = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      const nextCh = line[i + 1];
      if (ch === '"') {
        if (inQ && nextCh === '"') {
          cell += '"';
          i++;
        } else {
          inQ = !inQ;
        }
      } else if ((ch === ',' || ch === '\t') && !inQ) {
        cells.push(cell.trim());
        cell = '';
      } else {
        cell += ch;
      }
    }
    cells.push(cell.trim());
    return cells;
  };

  const rawHeaders = splitRow(lines[0]);
  const headers = rawHeaders.map((h, idx) => h.replace(/^["']|["']$/g, '').trim() || `Col_${idx + 1}`);

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = splitRow(lines[i]);
    if (values.every((v) => !v)) continue;
    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = (values[idx] || '').replace(/^["']|["']$/g, '').trim();
    });
    rows.push(rowObj);
  }

  return { headers, rows };
}

function autoDetectFieldMapping(headers: string[]): Record<string, string> {
  const map: Record<string, string> = {
    name: '',
    phone: '',
    email: '',
    country: '',
    course: '',
    intake: '',
    budget: '',
    campaign: '',
    city: '',
    date: '',
  };

  headers.forEach((h) => {
    const lower = h.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!map.name && (lower.includes('name') || lower.includes('student') || lower.includes('full'))) {
      map.name = h;
    } else if (!map.phone && (lower.includes('phone') || lower.includes('mobile') || lower.includes('contact') || lower.includes('number'))) {
      map.phone = h;
    } else if (!map.email && (lower.includes('email') || lower.includes('mail'))) {
      map.email = h;
    } else if (!map.country && (lower.includes('country') || lower.includes('destination'))) {
      map.country = h;
    } else if (!map.course && (lower.includes('course') || lower.includes('program') || lower.includes('degree') || lower.includes('major'))) {
      map.course = h;
    } else if (!map.intake && (lower.includes('intake') || lower.includes('session') || lower.includes('term') || lower.includes('year'))) {
      map.intake = h;
    } else if (!map.budget && (lower.includes('budget') || lower.includes('fee') || lower.includes('finance') || lower.includes('cost'))) {
      map.budget = h;
    } else if (!map.campaign && (lower.includes('campaign') || lower.includes('adname') || lower.includes('adset') || lower.includes('source') || lower.includes('meta'))) {
      map.campaign = h;
    } else if (!map.city && (lower.includes('city') || lower.includes('state') || lower.includes('location'))) {
      map.city = h;
    } else if (!map.date && (lower.includes('date') || lower.includes('time') || lower.includes('created'))) {
      map.date = h;
    }
  });

  return map;
}

export const GoogleSheetMetaLeadsModal: React.FC<GoogleSheetMetaLeadsModalProps> = ({
  isOpen,
  onClose,
  onLeadAdded,
  viewOnly = false,
}) => {
  const { convertLeadToStudent, students, refreshFromProfiles } = useWorkflow();
  const { user, activePortal } = useAuth();

  const isAdmin = activePortal?.role === 'admin' || user?.role === 'admin';

  // State
  const [sheetUrl, setSheetUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Raw Sheet Data & Mapping
  const [sheetHeaders, setSheetHeaders] = useState<string[]>([]);
  const [parsedLeads, setParsedLeads] = useState<RawSheetLead[]>([]);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({
    name: 'Full Name',
    phone: 'Phone Number',
    email: 'Email Address',
    country: 'Target Country',
    course: 'Target Course',
    intake: 'Intake',
    budget: 'Budget',
    campaign: 'Meta Campaign',
    city: 'City',
    date: 'Lead Date',
  });

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    name: true,
    phone: true,
    email: true,
    country: true,
    course: true,
    intake: true,
    budget: true,
    campaign: true,
    date: true,
  });

  const [showConfigPanel, setShowConfigPanel] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'converted' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [countryFilter, setCountryFilter] = useState<string>('All');
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [convertingIds, setConvertingIds] = useState<Set<string>>(new Set());

  // Converted Leads Tracking
  const [convertedRecords, setConvertedRecords] = useState<Record<string, ConvertedLeadRecord>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_CONVERTED_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Process CSV text into leads
  const processCsvText = useCallback(
    (csvText: string, customMapping?: Record<string, string>) => {
      const { headers, rows } = parseCsvData(csvText);
      if (headers.length === 0 || rows.length === 0) {
        setParsedLeads([]);
        return;
      }

      setSheetHeaders(headers);
      const mapping = customMapping && Object.keys(customMapping).length > 0 ? customMapping : autoDetectFieldMapping(headers);
      setFieldMapping(mapping);

      const items: RawSheetLead[] = rows.map((r, idx) => {
        const name = (mapping.name ? r[mapping.name] : '') || Object.values(r)[0] || `Lead #${idx + 1}`;
        const phone = (mapping.phone ? r[mapping.phone] : '') || Object.values(r)[1] || '';
        const email = (mapping.email ? r[mapping.email] : '') || Object.values(r)[2] || '';
        const country = (mapping.country ? r[mapping.country] : '') || 'Italy';
        const course = (mapping.course ? r[mapping.course] : '') || 'Master Program';
        const intake = (mapping.intake ? r[mapping.intake] : '') || 'Sept 2026';
        const budget = (mapping.budget ? r[mapping.budget] : '') || '€15,000 – 25,000 / yr';
        const campaign = (mapping.campaign ? r[mapping.campaign] : '') || 'Meta Campaign';
        const city = (mapping.city ? r[mapping.city] : '') || '';
        const date = (mapping.date ? r[mapping.date] : '') || new Date().toISOString().slice(0, 10);

        return {
          id: `sheet-${idx + 1}-${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          name,
          phone,
          email,
          country,
          course,
          intake,
          budget,
          campaign,
          city,
          date,
          rawRow: r,
        };
      });

      setParsedLeads(items);
    },
    []
  );

  // Load config & sync leads on modal open
  const loadSheetData = useCallback(async () => {
    setErrorMsg(null);
    setInitialLoading(true);
    try {
      const configRes = await fetchGoogleSheetConfig();
      let urlToUse = '';
      let mappingToUse: Record<string, string> | undefined;

      if (configRes.success && configRes.config) {
        const cfg = configRes.config;
        if (cfg.sheetUrl) {
          urlToUse = cfg.sheetUrl;
          setSheetUrl(cfg.sheetUrl);
        }
        if (cfg.fieldMapping && Object.keys(cfg.fieldMapping).length > 0) {
          mappingToUse = cfg.fieldMapping;
          setFieldMapping(cfg.fieldMapping);
        }
        if (cfg.visibleColumns) {
          setVisibleColumns((prev) => ({ ...prev, ...cfg.visibleColumns }));
        }
        if (cfg.convertedKeys) {
          setConvertedRecords((prev) => ({ ...prev, ...cfg.convertedKeys }));
        }
      }

      if (!urlToUse) {
        // Fallback to local storage if available
        try {
          const localUrl = localStorage.getItem(STORAGE_SHEET_URL_KEY);
          if (localUrl) {
            urlToUse = localUrl;
            setSheetUrl(localUrl);
          }
        } catch {
          // ignore
        }
      }

      if (urlToUse) {
        const fetchRes = await fetchGoogleSheetCsv(urlToUse);
        if (fetchRes.success && fetchRes.csvText) {
          processCsvText(fetchRes.csvText, mappingToUse);
        } else if (fetchRes.error) {
          setErrorMsg(fetchRes.error);
        }
      }
    } catch (err: any) {
      console.error('Error loading Google Sheet configuration:', err);
      setErrorMsg(err.message || 'Failed to connect to Google Sheet service.');
    } finally {
      setInitialLoading(false);
    }
  }, [processCsvText]);

  useEffect(() => {
    if (isOpen) {
      loadSheetData();
    }
  }, [isOpen, loadSheetData]);

  // Persist converted records in local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CONVERTED_KEY, JSON.stringify(convertedRecords));
    } catch {
      // ignore
    }
  }, [convertedRecords]);

  // Check if lead has been converted
  const isLeadConverted = (lead: RawSheetLead): boolean => {
    const keyByPhone = lead.phone.replace(/[^0-9]/g, '');
    const keyByEmail = lead.email.toLowerCase().trim();

    if (
      convertedRecords[lead.id] ||
      (keyByPhone && convertedRecords[keyByPhone]) ||
      (keyByEmail && convertedRecords[keyByEmail])
    ) {
      return true;
    }

    if (students && students.length > 0) {
      const existsInStudents = students.some((s) => {
        const sPhone = (s.phone || '').replace(/[^0-9]/g, '');
        const sEmail = (s.email || '').toLowerCase().trim();
        return (keyByPhone && sPhone && sPhone === keyByPhone) || (keyByEmail && sEmail && sEmail === keyByEmail);
      });
      if (existsInStudents) return true;
    }

    return false;
  };

  // Admin: Save sheet URL and sync
  const handleAdminSaveAndSync = async () => {
    if (!sheetUrl.trim()) {
      setErrorMsg('Please enter a valid Google Sheet URL or ID.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      try {
        localStorage.setItem(STORAGE_SHEET_URL_KEY, sheetUrl.trim());
      } catch {
        // ignore
      }

      const res = await fetchGoogleSheetCsv(sheetUrl.trim());
      if (!res.success || !res.csvText) {
        throw new Error(res.error || 'Failed to fetch CSV data from sheet.');
      }

      processCsvText(res.csvText);

      // Persist configuration to server
      await saveGoogleSheetConfig({
        sheetUrl: sheetUrl.trim(),
        fieldMapping,
        visibleColumns,
      });

      showToast('Google Sheet successfully synchronized and saved.');
    } catch (err: any) {
      console.error('Fetch Google Sheet error:', err);
      setErrorMsg(err.message || 'Unable to connect to Google Sheet. Ensure sharing is set to "Anyone with the link can view".');
    } finally {
      setLoading(false);
    }
  };

  // Counsellor / ViewOnly: Refresh leads from saved sheet
  const handleRefreshLeads = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetchGoogleSheetCsv(sheetUrl || undefined);
      if (!res.success || !res.csvText) {
        throw new Error(res.error || 'Failed to refresh leads from Google Sheet.');
      }
      processCsvText(res.csvText, fieldMapping);
      showToast('Leads refreshed.');
    } catch (err: any) {
      console.error('Refresh error:', err);
      setErrorMsg(err.message || 'Failed to refresh sheet data.');
    } finally {
      setLoading(false);
    }
  };

  // Convert Single Lead to "My Leads"
  const handleConvertToMyLeads = async (lead: RawSheetLead) => {
    const leadKey = lead.phone.replace(/[^0-9]/g, '') || lead.email.toLowerCase().trim() || lead.id;
    setConvertingIds((prev) => new Set(prev).add(lead.id));

    try {
      const counsellorName = user?.name || 'Neha Sharma';
      const counsellorUser: any = user
        ? {
            id: user.id || 'counsellor-1',
            name: user.name,
            email: user.email,
            role: user.role,
          }
        : {
            id: 'counsellor-1',
            name: 'Neha Sharma',
            email: 'neha.sharma@studyabroadcrm.com',
            role: 'counsellor',
          };

      // 1. Create Lead in CRM Leads table assigned to current counsellor
      const createdLead = await createLead({
        studentName: lead.name,
        phone: lead.phone,
        email: lead.email,
        countryInterest: lead.country || 'Italy',
        courseInterest: lead.course || 'Master Program',
        intake: lead.intake || 'Sept 2026',
        budget: lead.budget || '€20,000 / yr',
        leadSource: lead.campaign ? `Meta Ads: ${lead.campaign}` : 'Meta Ads',
        counsellor: counsellorUser,
        counsellorId: counsellorUser.id,
        status: 'New Lead',
      });

      // 2. Convert to Student in workflow
      const newStudent = convertLeadToStudent(createdLead, 'counselling');

      // 3. Persist conversion record on server to prevent duplicate conversion across portals
      await recordGoogleSheetConverted({
        key: leadKey,
        studentId: newStudent.studentId,
        studentName: lead.name,
        counsellor: counsellorName,
      });

      // 4. Update local converted ledger
      const recordData: ConvertedLeadRecord = {
        studentId: newStudent.studentId,
        studentName: lead.name,
        counsellor: counsellorName,
        convertedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      };

      setConvertedRecords((prev) => ({
        ...prev,
        [lead.id]: recordData,
        [leadKey]: recordData,
      }));

      // Remove from selected checkbox if selected
      setSelectedLeadIds((prev) => {
        const next = new Set(prev);
        next.delete(lead.id);
        return next;
      });

      if (onLeadAdded) onLeadAdded(createdLead);
      refreshFromProfiles();

      showToast(`Converted "${lead.name}" to My Leads.`);
    } catch (err: any) {
      console.error('Error converting lead:', err);
      showToast(`Failed to convert "${lead.name}": ${err.message || 'Error occurred'}`);
    } finally {
      setConvertingIds((prev) => {
        const next = new Set(prev);
        next.delete(lead.id);
        return next;
      });
    }
  };

  // Convert Multiple Selected Leads
  const handleBatchConvert = async () => {
    const targets = parsedLeads.filter((l) => selectedLeadIds.has(l.id) && !isLeadConverted(l));
    if (targets.length === 0) return;

    for (const lead of targets) {
      await handleConvertToMyLeads(lead);
    }
    showToast(`Converted ${targets.length} leads to My Leads.`);
    setSelectedLeadIds(new Set());
  };

  // Categorize leads
  const pendingLeads = useMemo(
    () => parsedLeads.filter((l) => !isLeadConverted(l)),
    [parsedLeads, convertedRecords, students]
  );

  const convertedLeads = useMemo(
    () => parsedLeads.filter((l) => isLeadConverted(l)),
    [parsedLeads, convertedRecords, students]
  );

  // Filtered Leads
  const displayedLeads = useMemo(() => {
    let list: RawSheetLead[] = [];
    if (activeTab === 'pending') list = pendingLeads;
    else if (activeTab === 'converted') list = convertedLeads;
    else list = parsedLeads;

    return list.filter((l) => {
      const matchesSearch =
        !searchQuery ||
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.phone.includes(searchQuery) ||
        l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.campaign.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.course.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCountry = countryFilter === 'All' || l.country === countryFilter;
      return matchesSearch && matchesCountry;
    });
  }, [activeTab, pendingLeads, convertedLeads, parsedLeads, searchQuery, countryFilter]);

  const totalLeadsCount = parsedLeads.length;
  const convertedCount = convertedLeads.length;
  const pendingCount = pendingLeads.length;
  const conversionRate = totalLeadsCount > 0 ? Math.round((convertedCount / totalLeadsCount) * 100) : 0;

  // Toggle selection
  const handleToggleSelectAll = () => {
    if (selectedLeadIds.size === pendingLeads.length) {
      setSelectedLeadIds(new Set());
    } else {
      setSelectedLeadIds(new Set(pendingLeads.map((l) => l.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-[3px] animate-fade-in font-sans">
      <div className="bg-white rounded-[14px] shadow-2xl border border-slate-200 w-full max-w-[1240px] max-h-[92vh] flex flex-col overflow-hidden">
        {/* Toast Alert */}
        {successToast && (
          <div className="absolute top-4 right-4 z-50 bg-[#087cf5] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Modal Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-[#101d37] to-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md -ml-2 border-2 border-slate-900">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-bold text-white tracking-tight">
                  Meta Ads Leads
                </h2>
                {viewOnly && (
                  <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                    View Only
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300">
                Inquiries synchronized from connected Meta campaign sheet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Close Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Monitoring Tracker KPIs Bar */}
        <div className="bg-[#f8fafc] border-b border-slate-200 px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="bg-white p-2.5 rounded-[8px] border border-slate-200 shadow-2xs">
            <span className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total Leads
            </span>
            <div className="text-[19px] font-bold text-[#101d37] mt-0.5">{totalLeadsCount}</div>
            <span className="text-[10.5px] text-slate-400">Campaign inquiries</span>
          </div>

          <div className="bg-white p-2.5 rounded-[8px] border border-emerald-200 shadow-2xs bg-emerald-50/30">
            <span className="text-[10.5px] font-semibold text-emerald-700 uppercase tracking-wider block flex items-center gap-1">
              <FolderCheck className="w-3 h-3 text-emerald-600" />
              Converted to My Leads
            </span>
            <div className="text-[19px] font-bold text-emerald-700 mt-0.5">{convertedCount}</div>
            <span className="text-[10.5px] text-emerald-600 font-medium">Added to CRM roster</span>
          </div>

          <div className="bg-white p-2.5 rounded-[8px] border border-blue-200 shadow-2xs bg-blue-50/30">
            <span className="text-[10.5px] font-semibold text-[#087cf5] uppercase tracking-wider block">
              Pending Leads
            </span>
            <div className="text-[19px] font-bold text-[#087cf5] mt-0.5">{pendingCount}</div>
            <span className="text-[10.5px] text-slate-500">Available to convert</span>
          </div>

          <div className="bg-white p-2.5 rounded-[8px] border border-purple-200 shadow-2xs bg-purple-50/20">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-semibold text-purple-700 uppercase tracking-wider block">
                Conversion Rate
              </span>
              <span className="text-[11px] font-bold text-purple-800">{conversionRate}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(conversionRate, 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              {convertedCount} of {totalLeadsCount} converted
            </span>
          </div>
        </div>

        {/* Role-Specific Configuration Toolbar */}
        {!viewOnly && isAdmin ? (
          /* Admin Configuration View */
          <div className="px-5 py-3 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex-1 min-w-[280px] max-w-[640px] flex items-center gap-2">
              <div className="relative flex-1">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="Google Sheet URL or Spreadsheet ID"
                  className="w-full pl-9 pr-3 py-1.5 text-[12px] bg-slate-50 border border-slate-300 focus:border-[#087cf5] focus:bg-white rounded-[6px] outline-none transition-all font-mono"
                />
              </div>
              <button
                onClick={handleAdminSaveAndSync}
                disabled={loading}
                className="px-3.5 py-1.5 rounded-[6px] bg-[#087cf5] hover:bg-[#076ed9] text-white text-[12px] font-semibold flex items-center gap-1.5 transition-colors shadow-2xs shrink-0 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Syncing...' : 'Save & Sync Sheet'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowConfigPanel(!showConfigPanel)}
                className={`px-3 py-1.5 rounded-[6px] border text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showConfigPanel
                    ? 'bg-blue-50 text-[#087cf5] border-blue-300'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Configure Columns</span>
                {showConfigPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        ) : !viewOnly ? (
          /* Counsellor Portal View: No paste URL input, clean status and Refresh button */
          <div className="px-5 py-2.5 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-700">Google Sheet Connected</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500">Configured by Administrator</span>
            </div>

            <button
              onClick={handleRefreshLeads}
              disabled={loading}
              className="px-3 py-1.5 rounded-[6px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh Leads'}</span>
            </button>
          </div>
        ) : (
          /* View Only Mode */
          <div className="px-5 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Read-only roster view of Meta Ads inquiries</span>
            </div>
            <button
              onClick={handleRefreshLeads}
              disabled={loading}
              className="px-2.5 py-1 rounded-[6px] bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300 disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        )}

        {/* Error notification if any */}
        {errorMsg && (
          <div className="px-5 py-2.5 bg-rose-50 border-b border-rose-200 text-rose-700 text-xs flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-800 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Collapsible Column Visibility & Mapping Customizer (Admin Only) */}
        {!viewOnly && isAdmin && showConfigPanel && (
          <div className="px-5 py-3.5 bg-slate-50/90 border-b border-slate-200 text-xs space-y-3 shrink-0">
            <div>
              <div className="font-bold text-[#101d37] mb-1.5">Visible Columns:</div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: 'name', label: 'Full Name' },
                  { key: 'phone', label: 'Phone Number' },
                  { key: 'email', label: 'Email Address' },
                  { key: 'country', label: 'Target Country' },
                  { key: 'course', label: 'Course Interest' },
                  { key: 'intake', label: 'Intake' },
                  { key: 'budget', label: 'Budget' },
                  { key: 'campaign', label: 'Meta Campaign' },
                  { key: 'date', label: 'Lead Date' },
                ].map((col) => (
                  <label
                    key={col.key}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] border cursor-pointer select-none transition-colors ${
                      visibleColumns[col.key]
                        ? 'bg-blue-50 border-blue-200 text-[#087cf5] font-semibold'
                        : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns[col.key]}
                      onChange={(e) =>
                        setVisibleColumns((prev) => ({ ...prev, [col.key]: e.target.checked }))
                      }
                      className="rounded text-[#087cf5] focus:ring-0"
                    />
                    <span>{col.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {sheetHeaders.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <div className="font-bold text-[#101d37] mb-1">Column Mappings:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                  {Object.entries(fieldMapping).map(([crmField, mappedHeader]) => (
                    <div key={crmField} className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                        {crmField}
                      </span>
                      <select
                        value={mappedHeader}
                        onChange={(e) =>
                          setFieldMapping((prev) => ({ ...prev, [crmField]: e.target.value }))
                        }
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[11px] font-medium outline-none"
                      >
                        <option value="">(None)</option>
                        {sheetHeaders.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Filters, Search & Batch Actions Bar */}
        <div className="px-5 py-2.5 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'pending'
                  ? 'bg-[#087cf5] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Pending Leads</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'pending' ? 'bg-white text-[#087cf5]' : 'bg-slate-200 text-slate-700'
              }`}>
                {pendingCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('converted')}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'converted'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FolderCheck className="w-3.5 h-3.5" />
              <span>Converted</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'converted' ? 'bg-white text-emerald-700' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {convertedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>All Leads</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                {totalLeadsCount}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads..."
                className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-[6px] text-xs outline-none focus:bg-white focus:border-[#087cf5] w-40 sm:w-48"
              />
            </div>

            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-[6px] px-2 py-1 text-xs outline-none text-[#101d37]"
            >
              <option value="All">All Countries</option>
              <option value="Italy">Italy</option>
              <option value="Germany">Germany</option>
              <option value="UK">UK</option>
              <option value="Canada">Canada</option>
            </select>

            {!viewOnly && activeTab === 'pending' && selectedLeadIds.size > 0 && (
              <button
                onClick={handleBatchConvert}
                className="px-3 py-1 rounded-[6px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Convert Selected ({selectedLeadIds.size}) to My Leads</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Leads Table View */}
        <div className="flex-1 overflow-y-auto overflow-x-auto min-h-[300px] scrollbar-thin">
          {initialLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-[#087cf5]" />
              <span className="text-xs font-medium">Loading leads...</span>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse min-w-[980px]">
              <thead className="sticky top-0 bg-[#f8fafc] z-10 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  {!viewOnly && activeTab === 'pending' && (
                    <th className="py-2.5 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={pendingLeads.length > 0 && selectedLeadIds.size === pendingLeads.length}
                        onChange={handleToggleSelectAll}
                        className="rounded text-[#087cf5] focus:ring-0 cursor-pointer"
                      />
                    </th>
                  )}
                  <th className="py-2.5 px-3">#</th>
                  {visibleColumns.name && <th className="py-2.5 px-3">Student Name</th>}
                  {visibleColumns.phone && <th className="py-2.5 px-3">Contact</th>}
                  {visibleColumns.country && <th className="py-2.5 px-3">Target Country</th>}
                  {visibleColumns.course && <th className="py-2.5 px-3">Program / Course</th>}
                  {visibleColumns.intake && <th className="py-2.5 px-3">Intake</th>}
                  {visibleColumns.budget && <th className="py-2.5 px-3">Budget</th>}
                  {visibleColumns.campaign && <th className="py-2.5 px-3">Meta Campaign</th>}
                  {visibleColumns.date && <th className="py-2.5 px-3">Lead Date</th>}
                  <th className="py-2.5 px-3 text-right">Action / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {displayedLeads.length > 0 ? (
                  displayedLeads.map((lead, idx) => {
                    const converted = isLeadConverted(lead);
                    const isConverting = convertingIds.has(lead.id);
                    const isSelected = selectedLeadIds.has(lead.id);
                    const record = convertedRecords[lead.id] || convertedRecords[lead.phone.replace(/[^0-9]/g, '')];

                    return (
                      <tr
                        key={lead.id}
                        className={`hover:bg-blue-50/40 transition-colors ${
                          converted ? 'bg-emerald-50/20' : isSelected ? 'bg-blue-50/60' : ''
                        }`}
                      >
                        {!viewOnly && activeTab === 'pending' && (
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(lead.id)}
                              className="rounded text-[#087cf5] focus:ring-0 cursor-pointer"
                            />
                          </td>
                        )}
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>

                        {visibleColumns.name && (
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <StudentAvatar
                                name={lead.name}
                                className="w-7 h-7 rounded-full text-[10px] shrink-0"
                              />
                              <div>
                                <div className="font-bold text-[#101d37]">{lead.name}</div>
                                {lead.city && <div className="text-[10px] text-slate-400">{lead.city}</div>}
                              </div>
                            </div>
                          </td>
                        )}

                        {visibleColumns.phone && (
                          <td className="py-2.5 px-3 font-medium">
                            <div className="flex items-center gap-1 text-slate-700">
                              <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{lead.phone}</span>
                            </div>
                            {visibleColumns.email && lead.email && (
                              <div className="flex items-center gap-1 text-[10.5px] text-slate-500 mt-0.5">
                                <Mail className="w-3 h-3 text-[#087cf5] shrink-0" />
                                <span className="truncate max-w-[150px]">{lead.email}</span>
                              </div>
                            )}
                          </td>
                        )}

                        {visibleColumns.country && (
                          <td className="py-2.5 px-3">
                            <div className="inline-flex items-center gap-1 font-semibold text-slate-800">
                              <span>{countryFlag(lead.country)}</span>
                              <span>{lead.country}</span>
                            </div>
                          </td>
                        )}

                        {visibleColumns.course && (
                          <td className="py-2.5 px-3 text-slate-700 max-w-[180px] truncate" title={lead.course}>
                            {lead.course}
                          </td>
                        )}

                        {visibleColumns.intake && (
                          <td className="py-2.5 px-3 text-slate-600 font-medium whitespace-nowrap">
                            {lead.intake}
                          </td>
                        )}

                        {visibleColumns.budget && (
                          <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                            {lead.budget}
                          </td>
                        )}

                        {visibleColumns.campaign && (
                          <td className="py-2.5 px-3 max-w-[190px]">
                            <span className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 truncate inline-block max-w-full" title={lead.campaign}>
                              {lead.campaign}
                            </span>
                          </td>
                        )}

                        {visibleColumns.date && (
                          <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap font-mono text-[10.5px]">
                            {lead.date}
                          </td>
                        )}

                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          {converted ? (
                            <div className="flex flex-col items-end gap-0.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Converted</span>
                              </span>
                              {record?.studentId && (
                                <span className="font-mono text-[10px] text-slate-500 font-semibold">
                                  {record.studentId}
                                </span>
                              )}
                            </div>
                          ) : viewOnly ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              Pending Lead
                            </span>
                          ) : (
                            <button
                              onClick={() => handleConvertToMyLeads(lead)}
                              disabled={isConverting}
                              className="px-3 py-1.5 rounded-[6px] bg-[#087cf5] hover:bg-[#076ed9] text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-all ml-auto disabled:opacity-50 cursor-pointer"
                            >
                              {isConverting ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Converting...</span>
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-3.5 h-3.5" />
                                  <span>Convert to My Leads</span>
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-400">
                      <div className="max-w-sm mx-auto space-y-2">
                        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                          <FileSpreadsheet className="w-6 h-6" />
                        </div>
                        <div className="text-sm font-bold text-slate-700">
                          {parsedLeads.length === 0
                            ? !isAdmin
                              ? 'No Meta Ads Google Sheet configured'
                              : 'No leads loaded'
                            : 'No leads found matching current filter'}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {parsedLeads.length === 0
                            ? !isAdmin
                              ? 'The administrator has not connected a Google Sheet yet. Please contact your administrator.'
                              : 'Enter your Google Sheet URL above and click "Save & Sync Sheet" to load leads.'
                            : activeTab === 'pending'
                            ? 'All leads from this sheet have been converted.'
                            : 'Try adjusting your search or country filter.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-2 text-[11.5px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              {parsedLeads.length > 0
                ? `${totalLeadsCount} total inquiries (${convertedCount} converted, ${pendingCount} pending)`
                : 'No active Google Sheet data loaded'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-[6px] bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-300 transition-colors shadow-2xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
