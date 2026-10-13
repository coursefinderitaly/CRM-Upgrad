import React, { useState, useEffect, useMemo } from 'react';
import {
  Plane,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ArrowRight,
  Search,
  Filter,
  ShieldCheck,
  FileText,
  Send,
  Smartphone,
  Mail,
  Phone,
  AlertTriangle,
  Check,
  Lock,
  RefreshCw,
  Download,
  ExternalLink,
  Share2,
  Building2,
  Calendar,
  CreditCard,
  FileCheck2,
  Award,
} from 'lucide-react';
import { StudentRecord, INITIAL_STUDENTS } from '../services/studentsData';
import { WorkflowStageBanner } from '../components/workflow/WorkflowStageBanner';
import { getStageById } from '../context/WorkflowContext';
import { ActionConfirmModal } from '../components/modals/ActionConfirmModal';

interface VisaProcessViewProps {
  students?: StudentRecord[];
  onAdvanceStage?: (studentId: string) => any;
  onNavigate?: (route: string) => void;
  onOpenPhone?: (lead: any) => void;
  onOpenWhatsApp?: (lead: any) => void;
  onOpenEmail?: (lead: any) => void;
  onScheduleFollowUp?: (lead: any) => void;
}

interface VisaRecord {
  visaSubclass: string;
  vfsCenter: string;
  appointmentDate: string;
  appointmentTime: string;
  vfsRefBarcode: string;
  financialType: string;
  financialAmount: string;
  financialStatus: 'Verified & Funded' | 'In Process' | 'Pending Deposit';
  visaStatus: 'Visa Stamped & Approved' | 'Passport Submitted at VFS' | 'Appointment Booked' | 'Documents in Prep';
  visaNumber: string;
  validFrom: string;
  validUntil: string;
  entries: string;
  mockInterviewScore: string;
}

const getVisaForStudent = (st: StudentRecord): VisaRecord => {
  const isStamped = st.stageNumber >= 12;
  const isSubmitted = st.stageNumber >= 11;
  const isBooked = st.stageNumber >= 6;

  if (st.country === 'Italy') {
    return {
      visaSubclass: 'National Type D Long-Stay Study Visa (Studio/Immatricolazione)',
      vfsCenter: 'VFS Italy New Delhi (Shivaji Stadium)',
      appointmentDate: '18 Jul 2027',
      appointmentTime: '10:30 AM IST',
      vfsRefBarcode: `VFS-IT-DEL-2027-${st.studentId.slice(-3)}`,
      financialType: 'Family Bank Statement (₹14.5L 6-Month Hold) + Sponsor ITR',
      financialAmount: '₹ 14,50,000',
      financialStatus: 'Verified & Funded',
      visaStatus: isStamped ? 'Visa Stamped & Approved' : isSubmitted ? 'Passport Submitted at VFS' : isBooked ? 'Appointment Booked' : 'Documents in Prep',
      visaNumber: `IT-D-84920${st.studentId.slice(-3)}`,
      validFrom: '01 Sep 2027',
      validUntil: '31 Aug 2028',
      entries: 'MULT (Multiple Entries)',
      mockInterviewScore: '9.5 / 10 (Direct Fit)',
    };
  }

  if (st.country === 'Germany') {
    return {
      visaSubclass: 'German National Visa Category D (Study §16b AufenthG)',
      vfsCenter: 'VFS Germany Mumbai (Bandra Kurla Complex)',
      appointmentDate: '24 Jul 2027',
      appointmentTime: '09:00 AM IST',
      vfsRefBarcode: `VFS-GER-BOM-2027-${st.studentId.slice(-3)}`,
      financialType: 'Expatrio Blocked Account (€11,208 Funded) + TK Health Cover',
      financialAmount: '€11,208 (~₹10.3 Lakhs)',
      financialStatus: 'Verified & Funded',
      visaStatus: isStamped ? 'Visa Stamped & Approved' : isSubmitted ? 'Passport Submitted at VFS' : isBooked ? 'Appointment Booked' : 'Documents in Prep',
      visaNumber: `DE-D-93821${st.studentId.slice(-3)}`,
      validFrom: '01 Sep 2027',
      validUntil: '28 Feb 2028',
      entries: 'MULT (Multiple Entries)',
      mockInterviewScore: '9.2 / 10 (APS & B2 Cleared)',
    };
  }

  if (st.country === 'UK') {
    return {
      visaSubclass: 'UKVI Student Route Visa (Tier 4 General)',
      vfsCenter: 'VFS UK New Delhi / Bangalore',
      appointmentDate: '05 Aug 2027',
      appointmentTime: '11:15 AM IST',
      vfsRefBarcode: `GWF-UK-2027-${st.studentId.slice(-3)}`,
      financialType: '28-Day Holding Balance Rule (£18,500 Tuition + Maintenance)',
      financialAmount: '£ 18,500 (~₹19.5 Lakhs)',
      financialStatus: 'Verified & Funded',
      visaStatus: isStamped ? 'Visa Stamped & Approved' : isSubmitted ? 'Passport Submitted at VFS' : isBooked ? 'Appointment Booked' : 'Documents in Prep',
      visaNumber: `GB-STUDENT-${st.studentId.slice(-3)}`,
      validFrom: '15 Aug 2027',
      validUntil: '30 Dec 2028',
      entries: 'MULT (Multiple Entries)',
      mockInterviewScore: '9.8 / 10 (Credibility Passed)',
    };
  }

  return {
    visaSubclass: 'French Long-Stay Visa (VLS-TS Étudiant)',
    vfsCenter: 'VFS France New Delhi',
    appointmentDate: '12 Aug 2027',
    appointmentTime: '10:00 AM IST',
    vfsRefBarcode: `VFS-FRA-2027-${st.studentId.slice(-3)}`,
    financialType: 'Living Expenses Monthly Guarantee (€615 x 12 = €7,380)',
    financialAmount: '€ 7,380',
    financialStatus: 'Verified & Funded',
    visaStatus: isStamped ? 'Visa Stamped & Approved' : isSubmitted ? 'Passport Submitted at VFS' : 'Appointment Booked',
    visaNumber: `FR-VLSTS-${st.studentId.slice(-3)}`,
    validFrom: '01 Sep 2027',
    validUntil: '31 Aug 2028',
    entries: 'MULT',
    mockInterviewScore: '9.0 / 10',
  };
};

export const VisaProcessView: React.FC<VisaProcessViewProps> = ({
  students,
  onAdvanceStage,
  onNavigate,
  onOpenPhone,
  onOpenWhatsApp,
  onOpenEmail,
}) => {
  const studentList = students && students.length > 0 ? students : INITIAL_STUDENTS;

  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [tabFilter, setTabFilter] = useState<'All' | 'Stamped' | 'Submitted' | 'Booked'>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [activeVisa, setActiveVisa] = useState<VisaRecord | null>(null);
  const [confirmModalData, setConfirmModalData] = useState<{
    isOpen: boolean;
    title: string;
    studentName: string;
    studentId: string;
    studentAvatar?: string;
    country?: string;
    currentStageName: string;
    targetStageName: string;
    description: string;
    confirmLabel: string;
    variant?: 'primary' | 'success' | 'warning';
    onConfirm: () => void;
  } | null>(null);

  // Hash deep-linking
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.includes('visa') && hash.includes('?id=')) {
        const idParam = hash.split('?id=')[1];
        const match = studentList.find(
          (s) =>
            s.studentId.toLowerCase() === idParam.toLowerCase() ||
            s.id.toLowerCase() === idParam.toLowerCase() ||
            s.name.toLowerCase().includes(idParam.toLowerCase())
        );
        if (match) handleOpenStudent(match);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [studentList]);

  const handleOpenStudent = (st: StudentRecord) => {
    setSelectedStudent(st);
    window.location.hash = `visa-process?id=${st.studentId}`;
    setActiveVisa(getVisaForStudent(st));
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
    window.location.hash = 'visa-process';
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Stats
  const stats = useMemo(() => {
    let stamped = 0;
    let submitted = 0;
    let booked = 0;

    studentList.forEach((st) => {
      const v = getVisaForStudent(st);
      if (v.visaStatus === 'Visa Stamped & Approved') stamped++;
      else if (v.visaStatus === 'Passport Submitted at VFS') submitted++;
      else booked++;
    });

    return {
      total: studentList.length,
      stamped,
      submitted,
      booked,
    };
  }, [studentList]);

  // Filtered List
  const filteredStudents = useMemo(() => {
    return studentList.filter((st) => {
      const v = getVisaForStudent(st);

      if (tabFilter === 'Stamped' && v.visaStatus !== 'Visa Stamped & Approved') return false;
      if (tabFilter === 'Submitted' && v.visaStatus !== 'Passport Submitted at VFS') return false;
      if (tabFilter === 'Booked' && v.visaStatus !== 'Appointment Booked') return false;

      if (countryFilter !== 'All' && st.country !== countryFilter) return false;
      if (statusFilter !== 'All' && v.visaStatus !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          st.name.toLowerCase().includes(q) ||
          st.studentId.toLowerCase().includes(q) ||
          st.country.toLowerCase().includes(q) ||
          v.vfsRefBarcode.toLowerCase().includes(q) ||
          v.vfsCenter.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [studentList, tabFilter, countryFilter, statusFilter, searchQuery]);

  return (
    <div className="p-3.5 pb-16 space-y-3 max-w-[1536px] mx-auto font-sans text-[#101d37] min-h-screen">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 right-5 z-50 bg-[#07182c] text-white text-xs px-4 py-2.5 rounded-lg shadow-xl border border-emerald-500/30 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-3 text-slate-400 hover:text-white font-bold">
            ×
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODE 1: VISA DIRECTORY VIEW                                          */}
      {/* ==================================================================== */}
      {!selectedStudent && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[17px] font-bold text-[#101d37] leading-tight">
                    Visa Processing & Consular Clearance Management
                  </h1>
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" /> Stage 11 • National Type D / Tier 4 Study Visas
                  </span>
                </div>
                <p className="text-[11.5px] text-[#64748b] leading-tight mt-0.5">
                  VFS appointments, German blocked accounts, sponsor bank statements, mock interviews, and official passport visa stamping.
                </p>
              </div>
            </div>

            <div className="text-[11.5px] text-[#64748b] hidden sm:inline">
              Home &gt; <span className="font-semibold text-[#101d37]">Visa Processing</span>
            </div>
          </div>

          {/* Workflow Stage Banner */}
          <WorkflowStageBanner
            stage={getStageById('visa-process')}
            students={studentList}
            selectedId={null}
            onSelect={(id) => {
              const st = studentList.find((s) => s.id === id);
              if (st) handleOpenStudent(st);
            }}
            onAdvance={(id) => {
              const targetStudent = studentList.find((s) => s.id === id || s.studentId === id);
              if (targetStudent) {
                setConfirmModalData({
                  isOpen: true,
                  title: 'Forward to Pre-Departure & Arrival',
                  studentName: targetStudent.name,
                  studentId: targetStudent.studentId,
                  studentAvatar: targetStudent.avatar,
                  country: targetStudent.country,
                  currentStageName: 'Stage 11: Visa',
                  targetStageName: 'Stage 12: Pre-Departure & Arrival',
                  description: `Advance ${targetStudent.name} to Stage 12 (Pre-Departure & Arrival) to arrange flight booking, campus accommodation, forex card, and airport pickup.`,
                  confirmLabel: 'Confirm & Forward to Stage 12',
                  variant: 'primary',
                  onConfirm: () => {
                    if (onAdvanceStage) onAdvanceStage(id);
                    if (onNavigate) onNavigate(`pre-departure?id=${targetStudent.studentId}`);
                  },
                });
              } else if (onAdvanceStage) {
                onAdvanceStage(id);
              }
            }}
            onEmptyAction={() => onNavigate && onNavigate('dov-cimea')}
            emptyActionLabel="Go to DOV & CIMEA"
            emptyHint="No students have reached the Visa stage yet."
          />

          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Total in Visa Pipeline</span>
              <div className="text-[19px] font-bold text-[#101d37] mt-0.5">{stats.total}</div>
              <span className="text-[10px] text-[#087cf5] font-semibold">● Active Consular Files</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Visas Stamped & Approved</span>
              <div className="text-[19px] font-bold text-emerald-600 mt-0.5">{stats.stamped}</div>
              <span className="text-[10px] text-emerald-600 font-semibold">✓ 100% Success Rate</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Passport Submitted at VFS</span>
              <div className="text-[19px] font-bold text-[#087cf5] mt-0.5">{stats.submitted}</div>
              <span className="text-[10px] text-[#087cf5] font-semibold">Under Embassy Processing</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Appointments Booked</span>
              <div className="text-[19px] font-bold text-amber-600 mt-0.5">{stats.booked}</div>
              <span className="text-[10px] text-amber-600 font-medium">Mock Interviews Complete</span>
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11.5px]">
                {[
                  { id: 'All', label: `All Portfolios (${stats.total})` },
                  { id: 'Stamped', label: `Visas Stamped (${stats.stamped})` },
                  { id: 'Submitted', label: `Passport at VFS (${stats.submitted})` },
                  { id: 'Booked', label: `Appointments Booked (${stats.booked})` },
                ].map((tb) => (
                  <button
                    key={tb.id}
                    onClick={() => setTabFilter(tb.id as any)}
                    className={`px-3 py-1.5 rounded-[5px] font-semibold transition-colors whitespace-nowrap ${
                      tabFilter === tb.id
                        ? 'bg-[#087cf5] text-white shadow-xs'
                        : 'bg-slate-50 text-[#52627a] hover:bg-slate-100 hover:text-[#101d37]'
                    }`}
                  >
                    {tb.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleOpenStudent(studentList[0])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[#087cf5] hover:bg-[#006ee6] text-white text-[12px] font-semibold transition-colors shadow-xs"
              >
                <Plane className="w-3.5 h-3.5 text-emerald-200" />
                <span>Open Sample Visa Workspace</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2 pt-1 border-t border-slate-100">
              <div className="relative sm:col-span-2">
                <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search candidate by name, student ID, VFS barcode, or visa number..."
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] focus:bg-white rounded-[6px] pl-8 pr-3 py-1.5 text-[12px] text-[#101d37] outline-none transition-all"
                />
              </div>

              <div>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] rounded-[6px] px-2.5 py-1.5 text-[12px] text-[#101d37] outline-none"
                >
                  <option value="All">All Visa Missions</option>
                  <option value="Italy">🇮🇹 Italy (VFS New Delhi/Mumbai)</option>
                  <option value="Germany">🇩🇪 Germany (VFS Mumbai/Delhi)</option>
                  <option value="UK">🇬🇧 United Kingdom (VFS UKVI)</option>
                  <option value="France">🇫🇷 France (VFS France)</option>
                </select>
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] rounded-[6px] px-2.5 py-1.5 text-[12px] text-[#101d37] outline-none"
                >
                  <option value="All">All Visa Statuses</option>
                  <option value="Visa Stamped & Approved">Visa Stamped & Approved</option>
                  <option value="Passport Submitted at VFS">Passport Submitted at VFS</option>
                  <option value="Appointment Booked">Appointment Booked</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-[8px] border border-[#e5edf5] shadow-xs overflow-hidden flex flex-col">
            <div className="overflow-x-auto overflow-y-auto max-h-[640px] scrollbar-thin">
              <table className="w-full text-left text-[12px] border-collapse min-w-[1260px]">
                <thead className="sticky top-0 bg-[#f8fafc] z-10 border-b border-[#e5edf5] shadow-2xs">
                  <tr className="text-[#52627a] font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-3 text-center w-12 shrink-0">#</th>
                    <th className="py-3 px-3 min-w-[270px]">Student & Academic Profile</th>
                    <th className="py-3 px-3 min-w-[210px]">Target Mission & VFS Centre</th>
                    <th className="py-3 px-3 min-w-[320px]">Appointment Date & Tracking Ref</th>
                    <th className="py-3 px-3 min-w-[170px] text-center">Financials / Blocked Acc</th>
                    <th className="py-3 px-3 min-w-[170px] text-center">Visa Decision Status</th>
                    <th className="py-3 px-3 min-w-[140px] text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((st, idx) => {
                      const visa = getVisaForStudent(st);

                      return (
                        <tr
                          key={st.id}
                          onClick={() => handleOpenStudent(st)}
                          className="hover:bg-emerald-50/30 cursor-pointer transition-colors group"
                        >
                          <td className="py-3.5 px-3 text-center text-[#64748b] font-medium text-[11.5px] align-middle">
                            {idx + 1}
                          </td>

                          <td className="py-3.5 px-3 min-w-[270px] align-middle">
                            <div className="flex items-center gap-3">
                              <img
                                src={st.avatar}
                                alt={st.name}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/avatars/rahul.png';
                                }}
                                className="w-10 h-10 aspect-square rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs"
                              />
                              <div className="min-w-0">
                                <div className="font-bold text-[#101d37] group-hover:text-[#087cf5] transition-colors text-[13px] leading-snug whitespace-nowrap">
                                  {st.name}
                                </div>
                                <div className="text-[10.5px] text-[#64748b] font-medium flex items-center gap-1.5 mt-1 whitespace-nowrap">
                                  <span className="font-mono text-slate-500 font-semibold">ID: {st.studentId}</span>
                                  <span className="text-slate-300">•</span>
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 font-bold text-slate-700">
                                    GPA: {st.academic.cgpa}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-blue-50 font-bold text-[#087cf5] border border-blue-100">
                                    {st.academic.englishTest}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 min-w-[210px] align-middle">
                            <div className="font-semibold text-[#101d37] text-[12px] flex items-center gap-1.5 whitespace-nowrap">
                              <span className="text-sm">
                                {st.country === 'Italy' ? '🇮🇹' : st.country === 'Germany' ? '🇩🇪' : st.country === 'UK' ? '🇬🇧' : '🇫🇷'}
                              </span>
                              <span>{st.country}</span>
                              <span className="text-[10.5px] text-slate-400 font-normal">({st.intake})</span>
                            </div>
                            <div className="text-[11px] text-[#64748b] mt-1 flex items-center gap-1.5 whitespace-nowrap truncate max-w-[200px]">
                              <span>{visa.vfsCenter}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 min-w-[320px] align-middle">
                            <div className="flex flex-col gap-1">
                              <div className="font-bold text-slate-800 text-[12px] flex items-center gap-1.5 truncate">
                                <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{visa.appointmentDate} at {visa.appointmentTime}</span>
                              </div>
                              <div className="text-[11px] text-slate-600 flex items-center gap-2">
                                <span className="font-mono font-semibold text-emerald-700">{visa.vfsRefBarcode}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-500 font-medium">Mock: {visa.mockInterviewScore}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 min-w-[170px] text-center align-middle">
                            <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-[5px] text-[11px] font-semibold border whitespace-nowrap bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{visa.financialAmount}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-3 min-w-[170px] text-center align-middle">
                            <span
                              className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-[5px] text-[11px] font-semibold border whitespace-nowrap shadow-2xs ${
                                visa.visaStatus === 'Visa Stamped & Approved'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : visa.visaStatus === 'Passport Submitted at VFS'
                                  ? 'bg-blue-50 text-[#087cf5] border-blue-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {visa.visaStatus === 'Visa Stamped & Approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                              <span>{visa.visaStatus}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-3 min-w-[140px] text-center align-middle">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenStudent(st);
                              }}
                              className="px-3 py-1.5 rounded-[5px] bg-[#087cf5] text-white hover:bg-[#006ee6] font-semibold text-[11px] transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-xs hover:shadow group/btn"
                            >
                              <span>Manage Visa</span>
                              <span className="transition-transform group-hover/btn:translate-x-0.5 font-bold">&gt;</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#64748b] text-xs">
                        No visa applications found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-3.5 py-2.5 bg-[#f8fafc] border-t border-[#e5edf5] flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-[#64748b]">
              <span>Showing <strong>{filteredStudents.length}</strong> long-stay study visa portfolios</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                VFS Global & Embassy Teleport Active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODE 2: WORKSPACE WINDOW                                             */}
      {/* ==================================================================== */}
      {selectedStudent && activeVisa && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-0.5">
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleBackToList}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#e2e8f0] bg-white hover:bg-slate-50 text-[12px] font-semibold text-[#101d37] shadow-xs transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#087cf5]" />
                <span>← Back to Visa Directory</span>
              </button>

              <span className="text-[12px] text-[#64748b] hidden sm:inline">
                Home &gt; Visa Processing &gt;{' '}
                <span className="font-bold text-[#101d37]">{selectedStudent.name}</span>{' '}
                <span className="text-[#64748b]">({selectedStudent.studentId})</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast('VFS Visa Application File PDF exported')}
                className="px-2.5 py-1.5 rounded-[6px] border border-[#cbd5e1] bg-white hover:bg-slate-50 text-[#101d37] text-[11.5px] font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export VFS File Pack</span>
              </button>

              <button
                onClick={() => {
                  setConfirmModalData({
                    isOpen: true,
                    title: 'Forward to Pre-Departure & Arrival',
                    studentName: selectedStudent.name,
                    studentId: selectedStudent.studentId,
                    studentAvatar: selectedStudent.avatar,
                    country: selectedStudent.country,
                    currentStageName: 'Stage 11: Visa',
                    targetStageName: 'Stage 12: Pre-Departure & Arrival',
                    description: `Forward ${selectedStudent.name} to Stage 12 (Pre-Departure & Arrival) to arrange flight booking, campus accommodation, forex card, and airport pickup.`,
                    confirmLabel: 'Confirm & Forward to Stage 12',
                    variant: 'primary',
                    onConfirm: () => {
                      if (onAdvanceStage) onAdvanceStage(selectedStudent.studentId || selectedStudent.id);
                      if (onNavigate) onNavigate(`pre-departure?id=${selectedStudent.studentId}`);
                    },
                  });
                }}
                className="px-3 py-1.5 rounded-[6px] bg-[#087cf5] hover:bg-[#006ee6] text-white text-[11.5px] font-bold flex items-center gap-1.5 shadow-xs"
              >
                <span>Proceed to Pre-Departure & Arrival (Stage 12)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Student Banner */}
          <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <img
                  src={selectedStudent.avatar}
                  alt={selectedStudent.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/avatars/rahul.png';
                  }}
                  className="w-12 h-12 aspect-square rounded-full object-cover border-2 border-emerald-500/30 shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[16px] font-bold text-[#101d37] leading-tight">
                      {selectedStudent.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10.5px] font-mono font-bold">
                      {selectedStudent.studentId}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                      <Plane className="w-3 h-3 text-emerald-600" /> {activeVisa.visaStatus}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#64748b] mt-1">
                    <span>Mission: <strong className="text-slate-800">{activeVisa.vfsCenter}</strong></span>
                    <span>•</span>
                    <span>Subclass: <strong className="text-slate-800">{activeVisa.visaSubclass}</strong></span>
                    <span>•</span>
                    <span>VFS Tracking: <strong className="font-mono text-emerald-700">{activeVisa.vfsRefBarcode}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-[6px] bg-emerald-50/70 border border-emerald-200 text-center">
                  <span className="text-[10px] text-emerald-800 font-semibold block">Visa Number</span>
                  <span className="text-[12px] font-mono font-bold text-emerald-900">{activeVisa.visaNumber}</span>
                </div>
                <div className="px-3 py-1.5 rounded-[6px] bg-blue-50/70 border border-blue-200 text-center">
                  <span className="text-[10px] text-[#087cf5] font-semibold block">Mock Interview</span>
                  <span className="text-[13px] font-bold text-[#087cf5]">{activeVisa.mockInterviewScore}</span>
                </div>
              </div>
            </div>

            {/* Stepper */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
              <div className="p-1.5 rounded bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">✓</span>
                <div>
                  <span className="font-bold text-emerald-800 block text-[10.5px]">1. Financials</span>
                  <span className="text-[9.5px] text-emerald-600">Funded & Verified</span>
                </div>
              </div>

              <div className="p-1.5 rounded bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">✓</span>
                <div>
                  <span className="font-bold text-emerald-800 block text-[10.5px]">2. VFS Booked</span>
                  <span className="text-[9.5px] text-emerald-600">{activeVisa.appointmentDate}</span>
                </div>
              </div>

              <div className="p-1.5 rounded bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">✓</span>
                <div>
                  <span className="font-bold text-emerald-800 block text-[10.5px]">3. Biometrics</span>
                  <span className="text-[9.5px] text-emerald-600">VFS Submission</span>
                </div>
              </div>

              <div className="p-1.5 rounded bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">✓</span>
                <div>
                  <span className="font-bold text-emerald-800 block text-[10.5px]">4. Consulate</span>
                  <span className="text-[9.5px] text-emerald-600">Decision Dispatched</span>
                </div>
              </div>

              <div className="p-1.5 rounded bg-emerald-100 border-2 border-emerald-600 flex items-center gap-2 shadow-xs">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">✓</span>
                <div>
                  <span className="font-bold text-emerald-800 block text-[10.5px]">5. Visa Stamped!</span>
                  <span className="text-[9.5px] text-emerald-700 font-bold">Departure Ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2-Col Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            <div className="lg:col-span-8 space-y-3.5">
              {/* Visa Sticker Representation Card */}
              <div className="bg-gradient-to-r from-emerald-50/50 via-teal-50/40 to-blue-50/40 rounded-[9px] border-2 border-emerald-500/40 p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200/70 pb-2">
                  <div className="flex items-center gap-2">
                    <Plane className="w-5 h-5 text-emerald-700" />
                    <span className="font-bold text-[15px] text-slate-800 tracking-wide uppercase">
                      Official Visa Sticker Clearance Stamp
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono font-bold text-[10px]">
                    VALIDATED PASSPORT STICKER
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11.5px]">
                  <div className="bg-white/80 p-2 rounded border border-emerald-200/60">
                    <span className="text-slate-500 text-[10px] block">Visa Number</span>
                    <strong className="text-slate-800 font-mono text-[12.5px] block">{activeVisa.visaNumber}</strong>
                  </div>
                  <div className="bg-white/80 p-2 rounded border border-emerald-200/60">
                    <span className="text-slate-500 text-[10px] block">Valid From</span>
                    <strong className="text-slate-800 font-mono text-[12.5px] block">{activeVisa.validFrom}</strong>
                  </div>
                  <div className="bg-white/80 p-2 rounded border border-emerald-200/60">
                    <span className="text-slate-500 text-[10px] block">Valid Until</span>
                    <strong className="text-slate-800 font-mono text-[12.5px] block">{activeVisa.validUntil}</strong>
                  </div>
                  <div className="bg-white/80 p-2 rounded border border-emerald-200/60">
                    <span className="text-slate-500 text-[10px] block">Entries</span>
                    <strong className="text-emerald-700 font-mono text-[12.5px] block">{activeVisa.entries}</strong>
                  </div>
                </div>
              </div>

              {/* Financial Verification Card */}
              <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs space-y-2.5">
                <h3 className="font-bold text-[13.5px] text-[#101d37] flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#087cf5]" />
                  Proof of Financial Means & Solvency Audit
                </h3>

                <div className="p-3 bg-slate-50 rounded-[7px] border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[12px]">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Audit Method & Document Structure</span>
                    <strong className="text-slate-800 block mt-0.5">{activeVisa.financialType}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 text-[11px] block">Verified Liquid Assets</span>
                    <strong className="text-emerald-700 text-[14px] block font-bold">{activeVisa.financialAmount}</strong>
                  </div>
                </div>
              </div>

              {/* VFS Checklist */}
              <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs space-y-2.5">
                <h3 className="font-bold text-[13.5px] text-[#101d37] flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  Mandatory VFS File Submission Audit
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px]">
                  {[
                    { title: 'National Type D Visa Application Form (Signed)', status: 'Barcoded Form Generated' },
                    { title: 'Original Passport (Valid for > 18 Months)', status: 'Stamped & Scanned' },
                    { title: '2 Biometric Photos (35x45mm Schengen Spec)', status: 'Attached' },
                    { title: 'University Admission Letter + Universitaly 8/D / CAS', status: 'Official Seal Attached' },
                    { title: 'Travel & Medical Insurance (€30k Coverage)', status: 'Active 365 Days Cover' },
                    { title: 'Dummy Flight Ticket & Proof of Accommodation', status: 'Confirmed Booking' },
                  ].map((doc, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-800 block">{doc.title}</strong>
                        <span className="text-emerald-700 font-medium text-[10.5px]">{doc.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 4 Cols */}
            <div className="lg:col-span-4 space-y-3.5">
              <div className="bg-white rounded-[9px] border-2 border-emerald-500/30 p-3.5 shadow-sm space-y-3">
                <h3 className="font-bold text-[13.5px] text-[#101d37] flex items-center gap-1.5">
                  <Plane className="w-4 h-4 text-emerald-600" />
                  Consular Decision Actions
                </h3>

                <div className="space-y-2 text-[11.5px] text-slate-600">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Mission Center:</span>
                    <strong className="text-slate-800">{activeVisa.vfsCenter.split('(')[0]}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Appointment:</span>
                    <strong className="text-slate-800">{activeVisa.appointmentDate}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Visa Status:</span>
                    <strong className="text-emerald-700">{activeVisa.visaStatus}</strong>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setConfirmModalData({
                      isOpen: true,
                      title: 'Confirm Visa Stamped & Approved',
                      studentName: selectedStudent.name,
                      studentId: selectedStudent.studentId,
                      studentAvatar: selectedStudent.avatar,
                      country: selectedStudent.country,
                      currentStageName: 'Stage 11: Visa',
                      targetStageName: 'Stage 11: Visa',
                      description: `Confirm official passport sticker visa stamped and issued for ${selectedStudent.name} (${activeVisa?.visaSubclass || 'Type D Study Visa'}).`,
                      confirmLabel: 'Confirm Visa Stamping',
                      variant: 'success',
                      onConfirm: () => {
                        showToast('Visa Marked as Stamped & Approved!');
                        setActiveVisa((prev) => prev ? { ...prev, visaStatus: 'Visa Stamped & Approved' } : null);
                      },
                    });
                  }}
                  className="w-full py-2.5 px-3 rounded-[6px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12px] shadow-xs flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Visa Stamped & Approved</span>
                </button>

                <button
                  onClick={() => {
                    setConfirmModalData({
                      isOpen: true,
                      title: 'Forward to Pre-Departure & Arrival',
                      studentName: selectedStudent.name,
                      studentId: selectedStudent.studentId,
                      studentAvatar: selectedStudent.avatar,
                      country: selectedStudent.country,
                      currentStageName: 'Stage 11: Visa',
                      targetStageName: 'Stage 12: Pre-Departure & Arrival',
                      description: `Advance ${selectedStudent.name} to Stage 12 (Pre-Departure & Arrival) to arrange flight booking, campus accommodation, forex card, and airport pickup.`,
                      confirmLabel: 'Confirm & Forward to Stage 12',
                      variant: 'primary',
                      onConfirm: () => {
                        if (onAdvanceStage) onAdvanceStage(selectedStudent.studentId || selectedStudent.id);
                        if (onNavigate) onNavigate(`pre-departure?id=${selectedStudent.studentId}`);
                      },
                    });
                  }}
                  className="w-full py-2 px-3 rounded-[6px] bg-[#087cf5] hover:bg-[#006ee6] text-white font-bold text-[12px] shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>Advance to Pre-Departure (Stage 12)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                  <span>Contact Candidate:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenPhone?.(selectedStudent as any)}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenWhatsApp?.(selectedStudent as any)}
                      className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenEmail?.(selectedStudent as any)}
                      className="p-1.5 rounded hover:bg-blue-50 text-[#087cf5]"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Confirmation Floating Modal */}
      {confirmModalData && (
        <ActionConfirmModal
          isOpen={confirmModalData.isOpen}
          title={confirmModalData.title}
          studentName={confirmModalData.studentName}
          studentId={confirmModalData.studentId}
          studentAvatar={confirmModalData.studentAvatar}
          country={confirmModalData.country}
          currentStageName={confirmModalData.currentStageName}
          targetStageName={confirmModalData.targetStageName}
          description={confirmModalData.description}
          confirmLabel={confirmModalData.confirmLabel}
          variant={confirmModalData.variant}
          onConfirm={() => {
            confirmModalData.onConfirm();
            setConfirmModalData(null);
          }}
          onClose={() => setConfirmModalData(null)}
        />
      )}
    </div>
  );
};
