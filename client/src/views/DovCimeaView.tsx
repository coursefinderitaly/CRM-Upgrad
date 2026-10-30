import React, { useState, useEffect, useMemo } from 'react';
import {
  Stamp,
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
  FileCheck2,
  QrCode,
  Award,
} from 'lucide-react';
import { StudentRecord } from '../services/studentsData';
import { WorkflowStageBanner } from '../components/workflow/WorkflowStageBanner';
import { getStageById } from '../context/WorkflowContext';
import { ActionConfirmModal } from '../components/modals/ActionConfirmModal';

interface DovCimeaViewProps {
  students?: StudentRecord[];
  onAdvanceStage?: (studentId: string) => any;
  onNavigate?: (route: string) => void;
  onOpenPhone?: (lead: any) => void;
  onOpenWhatsApp?: (lead: any) => void;
  onOpenEmail?: (lead: any) => void;
  onScheduleFollowUp?: (lead: any) => void;
}

interface LegalizationData {
  routeType: 'CIMEA DiploMe Fast-Track' | 'Italian Consular DOV' | 'Germany APS Certificate' | 'UK NARIC / Ecctis';
  dovOrCimeaNumber: string;
  meaApostilleStatus: 'MEA Apostille Stamped' | 'HRD In Progress' | 'Pending Attestation';
  meaTrackingCode: string;
  cimeaComparabilityStatus: 'Statement Issued & Validated' | 'Under Evaluation (DiploMe)' | 'Documents In Preparation';
  cimeaStatementCode: string;
  ectsCreditsApproved: number;
  issuingAuthority: string;
  expectedDate: string;
  isReadyForVisa: boolean;
}

const getLegalizationForStudent = (st: StudentRecord): LegalizationData => {
  const isComplete = st.stageNumber >= 11;
  const isInReview = st.stageNumber >= 6;

  if (st.country === 'Italy') {
    return {
      routeType: 'CIMEA DiploMe Fast-Track',
      dovOrCimeaNumber: `CIMEA-2027-${st.countryCode}-${st.studentId.slice(-3)}`,
      meaApostilleStatus: 'MEA Apostille Stamped',
      meaTrackingCode: `MEA-APOSTILLE-${st.studentId.slice(-3)}-IN`,
      cimeaComparabilityStatus: isComplete ? 'Statement Issued & Validated' : isInReview ? 'Under Evaluation (DiploMe)' : 'Documents In Preparation',
      cimeaStatementCode: `COMP-IT-2027-${st.studentId.slice(-3)}`,
      ectsCreditsApproved: 180,
      issuingAuthority: 'CIMEA - Centro di Informazione sulla Mobilità e le Equivalenze Accademiche',
      expectedDate: '25 May 2027',
      isReadyForVisa: isComplete || isInReview,
    };
  }

  if (st.country === 'Germany') {
    return {
      routeType: 'Germany APS Certificate',
      dovOrCimeaNumber: `APS-GER-2027-${st.studentId.slice(-3)}`,
      meaApostilleStatus: 'MEA Apostille Stamped',
      meaTrackingCode: `MEA-DELHI-GER-${st.studentId.slice(-3)}`,
      cimeaComparabilityStatus: isComplete ? 'Statement Issued & Validated' : isInReview ? 'Under Evaluation (DiploMe)' : 'Documents In Preparation',
      cimeaStatementCode: `APS-VERIF-${st.studentId.slice(-3)}`,
      ectsCreditsApproved: 210,
      issuingAuthority: 'Akademische Prüfstelle (APS) German Embassy New Delhi',
      expectedDate: '30 May 2027',
      isReadyForVisa: isComplete || isInReview,
    };
  }

  if (st.country === 'UK') {
    return {
      routeType: 'UK NARIC / Ecctis',
      dovOrCimeaNumber: `ECCTIS-UK-2027-${st.studentId.slice(-3)}`,
      meaApostilleStatus: 'MEA Apostille Stamped',
      meaTrackingCode: `MEA-MUMBAI-UK-${st.studentId.slice(-3)}`,
      cimeaComparabilityStatus: isComplete ? 'Statement Issued & Validated' : 'Documents In Preparation',
      cimeaStatementCode: `ECCTIS-COMP-${st.studentId.slice(-3)}`,
      ectsCreditsApproved: 180,
      issuingAuthority: 'Ecctis UK (UK ENIC Qualification Benchmark)',
      expectedDate: '15 Jun 2027',
      isReadyForVisa: isComplete || isInReview,
    };
  }

  return {
    routeType: 'Italian Consular DOV',
    dovOrCimeaNumber: `DOV-CONS-2027-${st.studentId.slice(-3)}`,
    meaApostilleStatus: 'MEA Apostille Stamped',
    meaTrackingCode: `MEA-APOSTILLE-${st.studentId.slice(-3)}`,
    cimeaComparabilityStatus: isComplete ? 'Statement Issued & Validated' : 'Under Evaluation (DiploMe)',
    cimeaStatementCode: `DOV-DIPL-${st.studentId.slice(-3)}`,
    ectsCreditsApproved: 180,
    issuingAuthority: 'Consular Office of Diplomatic Mission',
    expectedDate: '10 Jun 2027',
    isReadyForVisa: isComplete || isInReview,
  };
};

export const DovCimeaView: React.FC<DovCimeaViewProps> = ({
  students,
  onAdvanceStage,
  onNavigate,
  onOpenPhone,
  onOpenWhatsApp,
  onOpenEmail,
}) => {
  const studentList = students || [];

  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [tabFilter, setTabFilter] = useState<'All' | 'Issued' | 'InEval' | 'InPrep'>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [activeLeg, setActiveLeg] = useState<LegalizationData | null>(null);
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
      if (hash.includes('dov-cimea') && hash.includes('?id=')) {
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
    window.location.hash = `dov-cimea?id=${st.studentId}`;
    setActiveLeg(getLegalizationForStudent(st));
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
    window.location.hash = 'dov-cimea';
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Stats
  const stats = useMemo(() => {
    let issued = 0;
    let inEval = 0;
    let inPrep = 0;

    studentList.forEach((st) => {
      const leg = getLegalizationForStudent(st);
      if (leg.cimeaComparabilityStatus === 'Statement Issued & Validated') issued++;
      else if (leg.cimeaComparabilityStatus === 'Under Evaluation (DiploMe)') inEval++;
      else inPrep++;
    });

    return {
      total: studentList.length,
      issued,
      inEval,
      inPrep,
    };
  }, [studentList]);

  // Filtered List
  const filteredStudents = useMemo(() => {
    return studentList.filter((st) => {
      const leg = getLegalizationForStudent(st);

      if (tabFilter === 'Issued' && leg.cimeaComparabilityStatus !== 'Statement Issued & Validated') return false;
      if (tabFilter === 'InEval' && leg.cimeaComparabilityStatus !== 'Under Evaluation (DiploMe)') return false;
      if (tabFilter === 'InPrep' && leg.cimeaComparabilityStatus !== 'Documents In Preparation') return false;

      if (countryFilter !== 'All' && st.country !== countryFilter) return false;
      if (statusFilter !== 'All' && leg.cimeaComparabilityStatus !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          st.name.toLowerCase().includes(q) ||
          st.studentId.toLowerCase().includes(q) ||
          st.country.toLowerCase().includes(q) ||
          leg.dovOrCimeaNumber.toLowerCase().includes(q) ||
          leg.routeType.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [studentList, tabFilter, countryFilter, statusFilter, searchQuery]);

  return (
    <div className="p-3.5 pb-16 space-y-3 max-w-[1536px] mx-auto font-sans text-[#101d37] min-h-screen">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 right-5 z-50 bg-[#07182c] text-white text-xs px-4 py-2.5 rounded-lg shadow-xl border border-indigo-500/30 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-3 text-slate-400 hover:text-white font-bold">
            ×
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODE 1: DIRECTORY VIEW                                               */}
      {/* ==================================================================== */}
      {!selectedStudent && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Stamp className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[17px] font-bold text-[#101d37] leading-tight">
                    DOV & CIMEA Academic Legalization Management
                  </h1>
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                    <ShieldCheck className="w-3 h-3" /> Stage 10 • Qualification Equivalence & Apostille
                  </span>
                </div>
                <p className="text-[11.5px] text-[#64748b] leading-tight mt-0.5">
                  Degree comparability and consular legal verification: CIMEA DiploMe Fast-track, Italian Embassy DOV, German APS, and MEA Apostilles.
                </p>
              </div>
            </div>

            <div className="text-[11.5px] text-[#64748b] hidden sm:inline">
              Home &gt; <span className="font-semibold text-[#101d37]">DOV and CIMEA</span>
            </div>
          </div>

          {/* Workflow Stage Banner */}
          <WorkflowStageBanner
            stage={getStageById('dov-cimea')}
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
                  title: 'Forward to Visa Processing',
                  studentName: targetStudent.name,
                  studentId: targetStudent.studentId,
                  studentAvatar: targetStudent.avatar,
                  country: targetStudent.country,
                  currentStageName: 'Stage 10: DOV and CIMEA',
                  targetStageName: 'Stage 11: Visa',
                  description: `Advance ${targetStudent.name} to Stage 11 (Visa) to prepare VFS / Embassy appointment booking, financial proofs, and visa filing checklist.`,
                  confirmLabel: 'Confirm & Forward to Stage 11',
                  variant: 'primary',
                  onConfirm: () => {
                    if (onAdvanceStage) onAdvanceStage(id);
                    if (onNavigate) onNavigate(`visa-process?id=${targetStudent.studentId}`);
                  },
                });
              } else if (onAdvanceStage) {
                onAdvanceStage(id);
              }
            }}
            onEmptyAction={() => onNavigate && onNavigate('pre-enrolment')}
            emptyActionLabel="Go to Pre-Enrollment"
            emptyHint="No students have reached the DOV and CIMEA stage yet."
          />

          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Total In Legalization</span>
              <div className="text-[19px] font-bold text-[#101d37] mt-0.5">{stats.total}</div>
              <span className="text-[10px] text-[#087cf5] font-semibold">● Active Student Files</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Statements Issued & Validated</span>
              <div className="text-[19px] font-bold text-emerald-600 mt-0.5">{stats.issued}</div>
              <span className="text-[10px] text-emerald-600 font-semibold">✓ QR Code Certified</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Under Evaluation (DiploMe)</span>
              <div className="text-[19px] font-bold text-[#087cf5] mt-0.5">{stats.inEval}</div>
              <span className="text-[10px] text-[#087cf5] font-semibold">Awaiting Certificate Release</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Documents In Preparation</span>
              <div className="text-[19px] font-bold text-amber-600 mt-0.5">{stats.inPrep}</div>
              <span className="text-[10px] text-amber-600 font-medium">MEA Apostille / Translation</span>
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11.5px]">
                {[
                  { id: 'All', label: `All Portfolios (${stats.total})` },
                  { id: 'Issued', label: `Statements Issued (${stats.issued})` },
                  { id: 'InEval', label: `Under Evaluation (${stats.inEval})` },
                  { id: 'InPrep', label: `In Prep (${stats.inPrep})` },
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

              {studentList[0] && (
                <button
                  onClick={() => handleOpenStudent(studentList[0])}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[#087cf5] hover:bg-[#006ee6] text-white text-[12px] font-semibold transition-colors shadow-xs"
                >
                  <Stamp className="w-3.5 h-3.5 text-indigo-200" />
                  <span>Open Legalization Workspace ({studentList[0].name})</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2 pt-1 border-t border-slate-100">
              <div className="relative sm:col-span-2">
                <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search candidate by name, student ID, CIMEA reference, or MEA code..."
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] focus:bg-white rounded-[6px] pl-8 pr-3 py-1.5 text-[12px] text-[#101d37] outline-none transition-all"
                />
              </div>

              <div>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] rounded-[6px] px-2.5 py-1.5 text-[12px] text-[#101d37] outline-none"
                >
                  <option value="All">All Destination Tracks</option>
                  <option value="Italy">🇮🇹 Italy (CIMEA DiploMe / DOV)</option>
                  <option value="Germany">🇩🇪 Germany (APS Certificate)</option>
                  <option value="UK">🇬🇧 United Kingdom (Ecctis / UKVI)</option>
                </select>
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] rounded-[6px] px-2.5 py-1.5 text-[12px] text-[#101d37] outline-none"
                >
                  <option value="All">All Equivalence Statuses</option>
                  <option value="Statement Issued & Validated">Statement Issued & Validated</option>
                  <option value="Under Evaluation (DiploMe)">Under Evaluation (DiploMe)</option>
                  <option value="Documents In Preparation">Documents In Preparation</option>
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
                    <th className="py-3 px-3 min-w-[210px]">Target Destination</th>
                    <th className="py-3 px-3 min-w-[320px]">Equivalence Route & Tracking ID</th>
                    <th className="py-3 px-3 min-w-[170px] text-center">MEA Apostille Status</th>
                    <th className="py-3 px-3 min-w-[170px] text-center">Equivalence Statement</th>
                    <th className="py-3 px-3 min-w-[140px] text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((st, idx) => {
                      const leg = getLegalizationForStudent(st);

                      return (
                        <tr
                          key={st.id}
                          onClick={() => handleOpenStudent(st)}
                          className="hover:bg-indigo-50/30 cursor-pointer transition-colors group"
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
                                  (e.target as HTMLElement).style.visibility = 'hidden';
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
                                    {st.academic.highestQualification}
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
                              <span>{st.targetUniversity}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 min-w-[320px] align-middle">
                            <div className="flex flex-col gap-1">
                              <div className="font-bold text-slate-800 text-[12px] flex items-center gap-1.5 truncate">
                                <Stamp className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                <span>{leg.routeType}</span>
                              </div>
                              <div className="text-[11px] text-slate-600 flex items-center gap-2">
                                <span className="font-mono font-semibold text-indigo-700">{leg.dovOrCimeaNumber}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-emerald-700 font-semibold">{leg.ectsCreditsApproved} ECTS Certified</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 min-w-[170px] text-center align-middle">
                            <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-[5px] text-[11px] font-semibold border whitespace-nowrap bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{leg.meaApostilleStatus}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-3 min-w-[170px] text-center align-middle">
                            <span
                              className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-[5px] text-[11px] font-semibold border whitespace-nowrap shadow-2xs ${
                                leg.cimeaComparabilityStatus === 'Statement Issued & Validated'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {leg.cimeaComparabilityStatus === 'Statement Issued & Validated' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                              <span>{leg.cimeaComparabilityStatus}</span>
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
                              <span>Manage Legalization</span>
                              <span className="transition-transform group-hover/btn:translate-x-0.5 font-bold">&gt;</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#64748b] text-xs">
                        No qualification legalization records found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-3.5 py-2.5 bg-[#f8fafc] border-t border-[#e5edf5] flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-[#64748b]">
              <span>Showing <strong>{filteredStudents.length}</strong> academic legal equivalence files</span>
              <span className="text-indigo-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block" />
                DiploMe CIMEA & Consular Gateway Active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODE 2: WORKSPACE WINDOW                                             */}
      {/* ==================================================================== */}
      {selectedStudent && activeLeg && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-0.5">
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleBackToList}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#e2e8f0] bg-white hover:bg-slate-50 text-[12px] font-semibold text-[#101d37] shadow-xs transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#087cf5]" />
                <span>← Back to Legalization Directory</span>
              </button>

              <span className="text-[12px] text-[#64748b] hidden sm:inline">
                Home &gt; DOV and CIMEA &gt;{' '}
                <span className="font-bold text-[#101d37]">{selectedStudent.name}</span>{' '}
                <span className="text-[#64748b]">({selectedStudent.studentId})</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast('Statement of Comparability PDF exported')}
                className="px-2.5 py-1.5 rounded-[6px] border border-[#cbd5e1] bg-white hover:bg-slate-50 text-[#101d37] text-[11.5px] font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export Statement Certificate</span>
              </button>

              <button
                onClick={() => {
                  setConfirmModalData({
                    isOpen: true,
                    title: 'Forward to Visa Processing',
                    studentName: selectedStudent.name,
                    studentId: selectedStudent.studentId,
                    studentAvatar: selectedStudent.avatar,
                    country: selectedStudent.country,
                    currentStageName: 'Stage 10: DOV and CIMEA',
                    targetStageName: 'Stage 11: Visa',
                    description: `Forward ${selectedStudent.name} to Stage 11 (Visa) to initiate VFS / Embassy appointment booking, financial proofs review, and visa filing submission.`,
                    confirmLabel: 'Confirm & Forward to Stage 11',
                    variant: 'primary',
                    onConfirm: () => {
                      if (onAdvanceStage) onAdvanceStage(selectedStudent.studentId || selectedStudent.id);
                      if (onNavigate) onNavigate(`visa-process?id=${selectedStudent.studentId}`);
                    },
                  });
                }}
                className="px-3 py-1.5 rounded-[6px] bg-[#087cf5] hover:bg-[#006ee6] text-white text-[11.5px] font-bold flex items-center gap-1.5 shadow-xs"
              >
                <span>Proceed to Visa Processing (Stage 11)</span>
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
                    (e.target as HTMLElement).style.visibility = 'hidden';
                  }}
                  className="w-12 h-12 aspect-square rounded-full object-cover border-2 border-indigo-500/30 shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[16px] font-bold text-[#101d37] leading-tight">
                      {selectedStudent.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10.5px] font-mono font-bold">
                      {selectedStudent.studentId}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold flex items-center gap-1">
                      <Stamp className="w-3 h-3" /> {activeLeg.cimeaComparabilityStatus}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#64748b] mt-1">
                    <span>Qualification: <strong className="text-slate-800">{selectedStudent.academic.highestQualification}</strong></span>
                    <span>•</span>
                    <span>University: <strong className="text-slate-800">{selectedStudent.academic.university}</strong></span>
                    <span>•</span>
                    <span>Tracking: <strong className="font-mono text-indigo-700">{activeLeg.dovOrCimeaNumber}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-[6px] bg-indigo-50/70 border border-indigo-200 text-center">
                  <span className="text-[10px] text-indigo-800 font-semibold block">Apostille Code</span>
                  <span className="text-[12px] font-mono font-bold text-indigo-900">{activeLeg.meaTrackingCode}</span>
                </div>
                <div className="px-3 py-1.5 rounded-[6px] bg-emerald-50/70 border border-emerald-200 text-center">
                  <span className="text-[10px] text-emerald-800 font-semibold block">ECTS Certified</span>
                  <span className="text-[13px] font-bold text-emerald-900">{activeLeg.ectsCreditsApproved} ECTS</span>
                </div>
              </div>
            </div>

            {/* 4-Step Legalization Pipeline */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="p-1.5 rounded bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">✓</span>
                <div>
                  <span className="font-bold text-emerald-800 block text-[10.5px]">1. State HRD Attestation</span>
                  <span className="text-[9.5px] text-emerald-600">State Education Dept</span>
                </div>
              </div>

              <div className="p-1.5 rounded bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">✓</span>
                <div>
                  <span className="font-bold text-emerald-800 block text-[10.5px]">2. MEA Apostille</span>
                  <span className="text-[9.5px] text-emerald-600">The Hague Legalization</span>
                </div>
              </div>

              <div className="p-1.5 rounded bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">✓</span>
                <div>
                  <span className="font-bold text-emerald-800 block text-[10.5px]">3. Sworn Translation</span>
                  <span className="text-[9.5px] text-emerald-600">Court Certified Italian</span>
                </div>
              </div>

              <div className="p-1.5 rounded bg-indigo-50 border-2 border-indigo-600 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">4</span>
                <div>
                  <span className="font-bold text-indigo-700 block text-[10.5px]">4. Statement Issued</span>
                  <span className="text-[9.5px] text-indigo-600 font-semibold">CIMEA / DOV Ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2-Col Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            <div className="lg:col-span-8 space-y-3.5">
              {/* Certificate Vault & Digital QR */}
              <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs space-y-3">
                <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                  <h3 className="font-bold text-[14px] text-[#101d37] flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-indigo-600" />
                    Digital Statement of Comparability & Verification Vault
                  </h3>
                  <span className="font-mono text-[11px] text-indigo-700 font-semibold">
                    Code: {activeLeg.cimeaStatementCode}
                  </span>
                </div>

                <div className="p-3 bg-gradient-to-r from-indigo-50/40 to-blue-50/40 border border-indigo-200/80 rounded-[8px] flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10.5px] text-indigo-800 font-bold uppercase tracking-wider block">
                      Officially Validated Degree Equivalence
                    </span>
                    <strong className="text-[14px] text-slate-800 block">
                      Italian 2nd Cycle Degree Equivalent (Laurea Magistrale Match)
                    </strong>
                    <p className="text-[11px] text-slate-600">
                      Evaluated by {activeLeg.issuingAuthority}. Certified for enrollment and study visa issuance.
                    </p>
                  </div>

                  <div className="text-center p-2 rounded bg-white border border-indigo-200 shadow-2xs">
                    <div className="w-16 h-16 bg-slate-100 mx-auto rounded flex items-center justify-center text-indigo-600">
                      <QrCode className="w-12 h-12" />
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 mt-1 block">SCAN TO VERIFY</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11.5px]">
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10.5px] block">Duration Benchmark</span>
                    <strong className="text-slate-800 block mt-0.5">4-Year Bachelor of Technology</strong>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10.5px] block">University Accreditation</span>
                    <strong className="text-emerald-700 block mt-0.5">UGC & AICTE Accredited</strong>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10.5px] block">Legal Equivalency</span>
                    <strong className="text-indigo-700 block mt-0.5">180 ECTS Direct Match</strong>
                  </div>
                </div>
              </div>

              {/* Legal Checklist */}
              <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs space-y-2.5">
                <h3 className="font-bold text-[13.5px] text-[#101d37] flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  Legalized Documents Compliance Audit
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px]">
                  {[
                    { title: 'Bachelor Degree Original + MEA Apostille', status: 'Apostilled & Scanned' },
                    { title: 'Cumulative Marksheets (All Semesters)', status: 'Verified with University' },
                    { title: 'Official Italian/German Sworn Translation', status: 'Sworn Court Linguist Certified' },
                    { title: 'Diploma Supplement / Syllabus Course Outline', status: 'Attached (180 ECTS Certified)' },
                    { title: 'High School 12th Certificate (Apostilled)', status: 'MEA Stamped' },
                    { title: 'Passport Copy Signed & Notarized', status: 'Valid 2029' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-800 block">{item.title}</strong>
                        <span className="text-emerald-700 font-medium text-[10.5px]">{item.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 4 Cols */}
            <div className="lg:col-span-4 space-y-3.5">
              <div className="bg-white rounded-[9px] border-2 border-indigo-500/30 p-3.5 shadow-sm space-y-3">
                <h3 className="font-bold text-[13.5px] text-[#101d37] flex items-center gap-1.5">
                  <Stamp className="w-4 h-4 text-indigo-600" />
                  Equivalence Decision Actions
                </h3>

                <div className="space-y-2 text-[11.5px] text-slate-600">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Issuing Channel:</span>
                    <strong className="text-slate-800">{activeLeg.routeType}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Target Mission:</span>
                    <strong className="text-slate-800">{selectedStudent.country} Visa Section</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Status:</span>
                    <strong className="text-emerald-700">{activeLeg.cimeaComparabilityStatus}</strong>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setConfirmModalData({
                      isOpen: true,
                      title: 'Certify Statement of Comparability',
                      studentName: selectedStudent.name,
                      studentId: selectedStudent.studentId,
                      studentAvatar: selectedStudent.avatar,
                      country: selectedStudent.country,
                      currentStageName: 'Stage 10: DOV and CIMEA',
                      targetStageName: 'Stage 10: DOV and CIMEA',
                      description: `Confirm receipt and validation of the official degree equivalence statement (${activeLeg.routeType}) for ${selectedStudent.name}.`,
                      confirmLabel: 'Certify Statement',
                      variant: 'success',
                      onConfirm: () => {
                        showToast('Legalization Marked as Statement Issued & Validated!');
                        setActiveLeg((prev) => prev ? { ...prev, cimeaComparabilityStatus: 'Statement Issued & Validated', isReadyForVisa: true } : null);
                      },
                    });
                  }}
                  className="w-full py-2.5 px-3 rounded-[6px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12px] shadow-xs flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Statement Issued & Certified</span>
                </button>

                <button
                  onClick={() => {
                    setConfirmModalData({
                      isOpen: true,
                      title: 'Forward to Visa Processing',
                      studentName: selectedStudent.name,
                      studentId: selectedStudent.studentId,
                      studentAvatar: selectedStudent.avatar,
                      country: selectedStudent.country,
                      currentStageName: 'Stage 10: DOV and CIMEA',
                      targetStageName: 'Stage 11: Visa',
                      description: `Advance ${selectedStudent.name} to Stage 11 (Visa) to prepare VFS / Embassy appointment booking, financial proofs review, and visa filing submission.`,
                      confirmLabel: 'Confirm & Forward to Stage 11',
                      variant: 'primary',
                      onConfirm: () => {
                        if (onAdvanceStage) onAdvanceStage(selectedStudent.studentId || selectedStudent.id);
                        if (onNavigate) onNavigate(`visa-process?id=${selectedStudent.studentId}`);
                      },
                    });
                  }}
                  className="w-full py-2 px-3 rounded-[6px] bg-[#087cf5] hover:bg-[#006ee6] text-white font-bold text-[12px] shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>Advance to Visa Processing (Stage 11)</span>
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
