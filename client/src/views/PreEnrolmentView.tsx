import React, { useState, useEffect, useMemo } from 'react';
import {
  ClipboardCheck,
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
  Landmark,
  FileCheck2,
  Globe,
  Upload,
} from 'lucide-react';
import { StudentRecord } from '../services/studentsData';
import { WorkflowStageBanner } from '../components/workflow/WorkflowStageBanner';
import { getStageById } from '../context/WorkflowContext';
import { ActionConfirmModal } from '../components/modals/ActionConfirmModal';

interface PreEnrolmentViewProps {
  students?: StudentRecord[];
  onAdvanceStage?: (studentId: string) => any;
  onNavigate?: (route: string) => void;
  onOpenPhone?: (lead: any) => void;
  onOpenWhatsApp?: (lead: any) => void;
  onOpenEmail?: (lead: any) => void;
  onScheduleFollowUp?: (lead: any) => void;
}

interface PortalData {
  portalName: string;
  portalUrl: string;
  portalType: string;
  appRefNumber: string;
  diplomaticMission: string;
  courseTitle: string;
  degreeLevel: string;
  submissionDate: string;
  validationStatus: 'University Validated' | 'Summary Sheet Generated' | 'Submitted - Under Review' | 'Draft / In Preparation';
  summarySheetNumber: string;
  validationDate: string;
  visaClearanceReady: boolean;
}

const getPortalDataForStudent = (st: StudentRecord): PortalData => {
  const isAdvanced = st.stageNumber >= 9;
  const isSubmitted = st.stageNumber >= 6;

  if (st.country === 'Italy') {
    return {
      portalName: 'Universitaly Portal (universitaly.it)',
      portalUrl: 'https://www.universitaly.it',
      portalType: 'Mandatory Ministerial Pre-Enrolment Application',
      appRefNumber: `UNI-2027-${st.countryCode}-${st.studentId.slice(-3)}`,
      diplomaticMission: 'Embassy of Italy in New Delhi / Consular Visa Section',
      courseTitle: st.preferredCourse || 'MSc Computer Engineering',
      degreeLevel: 'Laurea Magistrale (Master of Science)',
      submissionDate: '14 May 2027',
      validationStatus: isAdvanced ? 'Summary Sheet Generated' : isSubmitted ? 'University Validated' : 'Draft / In Preparation',
      summarySheetNumber: `MOD-8D-2027-${st.studentId.slice(-3)}`,
      validationDate: isSubmitted ? '18 May 2027' : 'Pending',
      visaClearanceReady: isAdvanced,
    };
  }

  if (st.country === 'Germany') {
    return {
      portalName: 'Uni-Assist & APS Germany Portal',
      portalUrl: 'https://www.uni-assist.de',
      portalType: 'VPD (Vorprüfungsdokumentation) & APS Verification',
      appRefNumber: `VPD-GER-2027-${st.studentId.slice(-3)}`,
      diplomaticMission: 'German Embassy New Delhi / Consulate General Mumbai',
      courseTitle: st.preferredCourse || 'MSc Informatics',
      degreeLevel: 'Master of Science',
      submissionDate: '20 May 2027',
      validationStatus: isAdvanced ? 'Summary Sheet Generated' : isSubmitted ? 'University Validated' : 'Draft / In Preparation',
      summarySheetNumber: `APS-CERT-GER-${st.studentId.slice(-3)}`,
      validationDate: isSubmitted ? '25 May 2027' : 'Pending',
      visaClearanceReady: isAdvanced,
    };
  }

  if (st.country === 'UK') {
    return {
      portalName: 'UKVI SMS Portal & CAS Issuance',
      portalUrl: 'https://www.gov.uk/student-visa',
      portalType: 'Confirmation of Acceptance for Studies (CAS) & ATAS',
      appRefNumber: `CAS-REQ-2027-${st.studentId.slice(-3)}`,
      diplomaticMission: 'UK Visas and Immigration (UKVI) New Delhi',
      courseTitle: st.preferredCourse || 'MSc Advanced Computer Science',
      degreeLevel: 'Master of Science (RQF Level 7)',
      submissionDate: '10 Jun 2027',
      validationStatus: isAdvanced ? 'Summary Sheet Generated' : isSubmitted ? 'University Validated' : 'Draft / In Preparation',
      summarySheetNumber: `E4G8K2M9-${st.studentId.slice(-3)}`,
      validationDate: isSubmitted ? '15 Jun 2027' : 'Pending',
      visaClearanceReady: isAdvanced,
    };
  }

  return {
    portalName: 'Etudes en France (Campus France)',
    portalUrl: 'https://pastel.diplomatie.gouv.fr/etudesenfrance',
    portalType: 'EEF Pre-Consular Academic File',
    appRefNumber: `EEF-FR-2027-${st.studentId.slice(-3)}`,
    diplomaticMission: 'Consulate General of France in Mumbai / Bangalore',
    courseTitle: st.preferredCourse || 'MSc Data Science',
    degreeLevel: 'Master',
    submissionDate: '28 May 2027',
    validationStatus: isAdvanced ? 'Summary Sheet Generated' : isSubmitted ? 'University Validated' : 'Draft / In Preparation',
    summarySheetNumber: `EEF-ACC-2027-${st.studentId.slice(-3)}`,
    validationDate: isSubmitted ? '02 Jun 2027' : 'Pending',
    visaClearanceReady: isAdvanced,
  };
};

export const PreEnrolmentView: React.FC<PreEnrolmentViewProps> = ({
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
  const [tabFilter, setTabFilter] = useState<'All' | 'Generated' | 'Validated' | 'InPrep'>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [activePortal, setActivePortal] = useState<PortalData | null>(null);
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
      if (hash.includes('pre-enrolment') && hash.includes('?id=')) {
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
    window.location.hash = `pre-enrolment?id=${st.studentId}`;
    setActivePortal(getPortalDataForStudent(st));
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
    window.location.hash = 'pre-enrolment';
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Stats
  const stats = useMemo(() => {
    let generated = 0;
    let validated = 0;
    let inPrep = 0;

    studentList.forEach((st) => {
      const p = getPortalDataForStudent(st);
      if (p.validationStatus === 'Summary Sheet Generated') generated++;
      else if (p.validationStatus === 'University Validated') validated++;
      else inPrep++;
    });

    return {
      total: studentList.length,
      generated,
      validated,
      inPrep,
    };
  }, [studentList]);

  // Filtered List
  const filteredStudents = useMemo(() => {
    return studentList.filter((st) => {
      const p = getPortalDataForStudent(st);

      if (tabFilter === 'Generated' && p.validationStatus !== 'Summary Sheet Generated') return false;
      if (tabFilter === 'Validated' && p.validationStatus !== 'University Validated') return false;
      if (tabFilter === 'InPrep' && p.validationStatus !== 'Draft / In Preparation') return false;

      if (countryFilter !== 'All' && st.country !== countryFilter) return false;
      if (statusFilter !== 'All' && p.validationStatus !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          st.name.toLowerCase().includes(q) ||
          st.studentId.toLowerCase().includes(q) ||
          st.country.toLowerCase().includes(q) ||
          p.appRefNumber.toLowerCase().includes(q) ||
          p.portalName.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [studentList, tabFilter, countryFilter, statusFilter, searchQuery]);

  return (
    <div className="p-3.5 pb-16 space-y-3 max-w-[1536px] mx-auto font-sans text-[#101d37] min-h-screen">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 right-5 z-50 bg-[#07182c] text-white text-xs px-4 py-2.5 rounded-lg shadow-xl border border-blue-500/30 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-3 text-slate-400 hover:text-white font-bold">
            ×
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODE 1: PRE-ENROLLMENT DIRECTORY                                     */}
      {/* ==================================================================== */}
      {!selectedStudent && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#087cf5] text-white flex items-center justify-center shadow-xs">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[17px] font-bold text-[#101d37] leading-tight">
                    Pre-Enrollment & Portal Clearance Management
                  </h1>
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-[#087cf5] text-[10px] font-bold border border-blue-200">
                    <Globe className="w-3 h-3" /> Stage 9 • Universitaly / Uni-Assist / CAS Portals
                  </span>
                </div>
                <p className="text-[11.5px] text-[#64748b] leading-tight mt-0.5">
                  Track ministerial pre-enrollment submissions: Universitaly Summary Sheets (Form 8/D), German Uni-Assist/APS, and UKVI CAS Letters.
                </p>
              </div>
            </div>

            <div className="text-[11.5px] text-[#64748b] hidden sm:inline">
              Home &gt; <span className="font-semibold text-[#101d37]">Pre-Enrollment</span>
            </div>
          </div>

          {/* Workflow Stage Banner */}
          <WorkflowStageBanner
            stage={getStageById('pre-enrolment')}
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
                  title: 'Forward to DOV & CIMEA',
                  studentName: targetStudent.name,
                  studentId: targetStudent.studentId,
                  studentAvatar: targetStudent.avatar,
                  country: targetStudent.country,
                  currentStageName: 'Stage 9: Pre-Enrollment',
                  targetStageName: 'Stage 10: DOV and CIMEA',
                  description: `Advance ${targetStudent.name} to Stage 10 (DOV and CIMEA) to manage official degree legalization, Apostille apostillization, and CIMEA Statement of Comparability.`,
                  confirmLabel: 'Confirm & Forward to Stage 10',
                  variant: 'primary',
                  onConfirm: () => {
                    if (onAdvanceStage) onAdvanceStage(id);
                    if (onNavigate) onNavigate(`dov-cimea?id=${targetStudent.studentId}`);
                  },
                });
              } else if (onAdvanceStage) {
                onAdvanceStage(id);
              }
            }}
            onEmptyAction={() => onNavigate && onNavigate('scholarship')}
            emptyActionLabel="Go to Scholarship"
            emptyHint="No students have reached the Pre-Enrollment stage yet."
          />

          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Total Pre-Enrollments</span>
              <div className="text-[19px] font-bold text-[#101d37] mt-0.5">{stats.total}</div>
              <span className="text-[10px] text-[#087cf5] font-semibold">● Active National Portals</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Summary Form / CAS Issued</span>
              <div className="text-[19px] font-bold text-emerald-600 mt-0.5">{stats.generated}</div>
              <span className="text-[10px] text-emerald-600 font-semibold">✓ Visa Clearance Form Ready</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">University Validated</span>
              <div className="text-[19px] font-bold text-[#087cf5] mt-0.5">{stats.validated}</div>
              <span className="text-[10px] text-[#087cf5] font-semibold">Awaiting Embassy Sheet</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Draft / In Preparation</span>
              <div className="text-[19px] font-bold text-amber-600 mt-0.5">{stats.inPrep}</div>
              <span className="text-[10px] text-amber-600 font-medium">Document Uploads Pending</span>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11.5px]">
                {[
                  { id: 'All', label: `All Portfolios (${stats.total})` },
                  { id: 'Generated', label: `Summary Sheet / CAS Issued (${stats.generated})` },
                  { id: 'Validated', label: `University Validated (${stats.validated})` },
                  { id: 'InPrep', label: `Draft / In Prep (${stats.inPrep})` },
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
                  <Globe className="w-3.5 h-3.5" />
                  <span>Open Pre-Enrollment Workspace ({studentList[0].name})</span>
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
                  placeholder="Search candidate by name, student ID, portal reference number..."
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] focus:bg-white rounded-[6px] pl-8 pr-3 py-1.5 text-[12px] text-[#101d37] outline-none transition-all"
                />
              </div>

              <div>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] rounded-[6px] px-2.5 py-1.5 text-[12px] text-[#101d37] outline-none"
                >
                  <option value="All">All Destination Portals</option>
                  <option value="Italy">🇮🇹 Universitaly (Italy)</option>
                  <option value="Germany">🇩🇪 Uni-Assist / APS (Germany)</option>
                  <option value="UK">🇬🇧 UKVI CAS (United Kingdom)</option>
                  <option value="France">🇫🇷 Campus France (France)</option>
                </select>
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] rounded-[6px] px-2.5 py-1.5 text-[12px] text-[#101d37] outline-none"
                >
                  <option value="All">All Pre-Enrollment Statuses</option>
                  <option value="Summary Sheet Generated">Summary Sheet Generated</option>
                  <option value="University Validated">University Validated</option>
                  <option value="Draft / In Preparation">Draft / In Preparation</option>
                </select>
              </div>
            </div>
          </div>

          {/* Directory Table */}
          <div className="bg-white rounded-[8px] border border-[#e5edf5] shadow-xs overflow-hidden flex flex-col">
            <div className="overflow-x-auto overflow-y-auto max-h-[640px] scrollbar-thin">
              <table className="w-full text-left text-[12px] border-collapse min-w-[1260px]">
                <thead className="sticky top-0 bg-[#f8fafc] z-10 border-b border-[#e5edf5] shadow-2xs">
                  <tr className="text-[#52627a] font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-3 text-center w-12 shrink-0">#</th>
                    <th className="py-3 px-3 min-w-[270px]">Student & Academic Profile</th>
                    <th className="py-3 px-3 min-w-[210px]">Target Destination</th>
                    <th className="py-3 px-3 min-w-[320px]">National Portal & Reference</th>
                    <th className="py-3 px-3 min-w-[170px] text-center">Academic Validation</th>
                    <th className="py-3 px-3 min-w-[170px] text-center">Embassy Clearance Sheet</th>
                    <th className="py-3 px-3 min-w-[140px] text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((st, idx) => {
                      const portal = getPortalDataForStudent(st);

                      return (
                        <tr
                          key={st.id}
                          onClick={() => handleOpenStudent(st)}
                          className="hover:bg-blue-50/30 cursor-pointer transition-colors group"
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
                              <span>{st.targetUniversity}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 min-w-[320px] align-middle">
                            <div className="flex flex-col gap-1">
                              <div className="font-bold text-slate-800 text-[12px] flex items-center gap-1.5 truncate">
                                <Globe className="w-3.5 h-3.5 text-[#087cf5] shrink-0" />
                                <span>{portal.portalName}</span>
                              </div>
                              <div className="text-[11px] text-slate-600 flex items-center gap-2">
                                <span className="font-mono font-semibold text-[#087cf5]">{portal.appRefNumber}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-500">{portal.diplomaticMission.split('/')[0]}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 min-w-[170px] text-center align-middle">
                            <span
                              className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-[5px] text-[11px] font-semibold border whitespace-nowrap shadow-2xs ${
                                portal.validationStatus === 'Summary Sheet Generated' || portal.validationStatus === 'University Validated'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {portal.validationStatus !== 'Draft / In Preparation' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                              <span>{portal.validationStatus}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-3 min-w-[170px] text-center align-middle">
                            <span
                              className={`inline-flex items-center justify-center px-2.5 py-1 rounded-[5px] text-[11px] font-semibold border whitespace-nowrap shadow-2xs ${
                                portal.visaClearanceReady
                                  ? 'bg-blue-50 text-[#087cf5] border-blue-200 font-mono font-bold'
                                  : 'bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                            >
                              {portal.visaClearanceReady ? portal.summarySheetNumber : 'Pending Clearance'}
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
                              <span>Manage Portal</span>
                              <span className="transition-transform group-hover/btn:translate-x-0.5 font-bold">&gt;</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#64748b] text-xs">
                        No pre-enrollment applications found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-3.5 py-2.5 bg-[#f8fafc] border-t border-[#e5edf5] flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-[#64748b]">
              <span>Showing <strong>{filteredStudents.length}</strong> pre-enrollment candidates</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Ministerial Gateway Active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODE 2: STUDENT PRE-ENROLLMENT WORKSPACE WINDOW                      */}
      {/* ==================================================================== */}
      {selectedStudent && activePortal && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-0.5">
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleBackToList}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#e2e8f0] bg-white hover:bg-slate-50 text-[12px] font-semibold text-[#101d37] shadow-xs transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#087cf5]" />
                <span>← Back to Pre-Enrollment Directory</span>
              </button>

              <span className="text-[12px] text-[#64748b] hidden sm:inline">
                Home &gt; Pre-Enrollment &gt;{' '}
                <span className="font-bold text-[#101d37]">{selectedStudent.name}</span>{' '}
                <span className="text-[#64748b]">({selectedStudent.studentId})</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast('Embassy Summary Sheet Form 8/D downloaded')}
                className="px-2.5 py-1.5 rounded-[6px] border border-[#cbd5e1] bg-white hover:bg-slate-50 text-[#101d37] text-[11.5px] font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export Summary Sheet (Form 8/D)</span>
              </button>

              <button
                onClick={() => {
                  setConfirmModalData({
                    isOpen: true,
                    title: 'Forward to DOV & CIMEA',
                    studentName: selectedStudent.name,
                    studentId: selectedStudent.studentId,
                    studentAvatar: selectedStudent.avatar,
                    country: selectedStudent.country,
                    currentStageName: 'Stage 9: Pre-Enrollment',
                    targetStageName: 'Stage 10: DOV and CIMEA',
                    description: `Forward ${selectedStudent.name} to Stage 10 (DOV and CIMEA) to manage official degree legalization, Apostille apostillization, and CIMEA Statement of Comparability.`,
                    confirmLabel: 'Confirm & Forward to Stage 10',
                    variant: 'primary',
                    onConfirm: () => {
                      if (onAdvanceStage) onAdvanceStage(selectedStudent.studentId || selectedStudent.id);
                      if (onNavigate) onNavigate(`dov-cimea?id=${selectedStudent.studentId}`);
                    },
                  });
                }}
                className="px-3 py-1.5 rounded-[6px] bg-[#087cf5] hover:bg-[#006ee6] text-white text-[11.5px] font-bold flex items-center gap-1.5 shadow-xs"
              >
                <span>Proceed to DOV & CIMEA (Stage 10)</span>
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
                  className="w-12 h-12 aspect-square rounded-full object-cover border-2 border-blue-500/30 shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[16px] font-bold text-[#101d37] leading-tight">
                      {selectedStudent.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10.5px] font-mono font-bold">
                      {selectedStudent.studentId}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#087cf5] border border-blue-200 text-[10px] font-bold flex items-center gap-1">
                      <Globe className="w-3 h-3" /> {activePortal.validationStatus}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#64748b] mt-1">
                    <span>Target University: <strong className="text-slate-800">{selectedStudent.targetUniversity}</strong></span>
                    <span>•</span>
                    <span>Course: <strong className="text-slate-800">{activePortal.courseTitle}</strong></span>
                    <span>•</span>
                    <span>Jurisdiction: <strong className="text-slate-800">{activePortal.diplomaticMission}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-[6px] bg-blue-50/70 border border-blue-200 text-center">
                  <span className="text-[10px] text-[#087cf5] font-semibold block">Portal Reference</span>
                  <span className="text-[13px] font-mono font-bold text-[#087cf5]">{activePortal.appRefNumber}</span>
                </div>
                <div className="px-3 py-1.5 rounded-[6px] bg-emerald-50/70 border border-emerald-200 text-center">
                  <span className="text-[10px] text-emerald-800 font-semibold block">Summary Sheet / CAS</span>
                  <span className="text-[13px] font-mono font-bold text-emerald-800">{activePortal.summarySheetNumber}</span>
                </div>
              </div>
            </div>

            {/* Stepper */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
              <div className="p-1.5 rounded bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">✓</span>
                <div>
                  <span className="font-bold text-emerald-800 block text-[10.5px]">1. Portal Account</span>
                  <span className="text-[9.5px] text-emerald-600">ID & Codice Fiscale</span>
                </div>
              </div>

              <div className="p-1.5 rounded bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">✓</span>
                <div>
                  <span className="font-bold text-emerald-800 block text-[10.5px]">2. Documents Upload</span>
                  <span className="text-[9.5px] text-emerald-600">6/6 Docs Uploaded</span>
                </div>
              </div>

              <div className="p-1.5 rounded bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">✓</span>
                <div>
                  <span className="font-bold text-emerald-800 block text-[10.5px]">3. Submitted</span>
                  <span className="text-[9.5px] text-emerald-600">Sent to University</span>
                </div>
              </div>

              <div className="p-1.5 rounded bg-blue-50 border-2 border-[#087cf5] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#087cf5] text-white font-bold text-[10px] flex items-center justify-center shrink-0">4</span>
                <div>
                  <span className="font-bold text-[#087cf5] block text-[10.5px]">4. Validated</span>
                  <span className="text-[9.5px] text-blue-700 font-semibold">University Approved</span>
                </div>
              </div>

              <div className="p-1.5 rounded bg-slate-50 border border-slate-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-300 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">5</span>
                <div>
                  <span className="font-bold text-slate-600 block text-[10.5px]">5. Form 8/D Cleared</span>
                  <span className="text-[9.5px] text-slate-400">Embassy Queue</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2-Col Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            <div className="lg:col-span-8 space-y-3.5">
              {/* Application Details */}
              <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs space-y-3">
                <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                  <h3 className="font-bold text-[14px] text-[#101d37] flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-[#087cf5]" />
                    {activePortal.portalName} — Application File Details
                  </h3>
                  <a
                    href={activePortal.portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-semibold text-[#087cf5] flex items-center gap-1 hover:underline"
                  >
                    <span>Open Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[12px]">
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[11px] block">Application Type</span>
                    <strong className="text-slate-800 block mt-0.5">{activePortal.portalType}</strong>
                  </div>

                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[11px] block">Chosen University Course</span>
                    <strong className="text-[#087cf5] block mt-0.5">{activePortal.courseTitle}</strong>
                  </div>

                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[11px] block">Embassy / Consulate Jurisdiction</span>
                    <strong className="text-slate-800 block mt-0.5">{activePortal.diplomaticMission}</strong>
                  </div>

                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[11px] block">Official Clearance Form</span>
                    <strong className="text-emerald-700 block mt-0.5 font-mono">{activePortal.summarySheetNumber}</strong>
                  </div>
                </div>
              </div>

              {/* Uploads Audit */}
              <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs space-y-2.5">
                <h3 className="font-bold text-[13.5px] text-[#101d37] flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  Ministerial Pre-Enrollment Document Audit
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px]">
                  {[
                    { title: 'University Official Admission Letter', status: 'Verified & Attached' },
                    { title: 'Bachelor Degree Certificate & Final Transcripts', status: 'Validated (CIMEA/DOV linked)' },
                    { title: 'English / Italian Proficiency Certificate', status: 'IELTS 7.5 Cleared' },
                    { title: 'Passport Valid for >= 18 Months', status: 'Valid Until 2029' },
                    { title: 'Curriculum Vitae (Europass Format)', status: 'Signed & Uploaded' },
                    { title: 'Passport Sized Biometric Photos', status: 'White Background 35x45mm' },
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
              <div className="bg-white rounded-[9px] border-2 border-blue-500/30 p-3.5 shadow-sm space-y-3">
                <h3 className="font-bold text-[13.5px] text-[#101d37] flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4 text-[#087cf5]" />
                  Pre-Enrollment Actions
                </h3>

                <p className="text-[11.5px] text-slate-600">
                  Once academic validation is complete, the university issues the Summary Sheet (Form 8/D) directly to the Italian Consulate/VFS for visa booking.
                </p>

                <button
                  onClick={() => {
                    setConfirmModalData({
                      isOpen: true,
                      title: 'Generate Summary Sheet (Form 8/D)',
                      studentName: selectedStudent.name,
                      studentId: selectedStudent.studentId,
                      studentAvatar: selectedStudent.avatar,
                      country: selectedStudent.country,
                      currentStageName: 'Stage 9: Pre-Enrollment',
                      targetStageName: 'Stage 9: Pre-Enrollment',
                      description: `Confirm academic validation and mark the Universitaly / Uni-Assist summary sheet as generated for ${selectedStudent.name}.`,
                      confirmLabel: 'Confirm Summary Sheet',
                      variant: 'success',
                      onConfirm: () => {
                        showToast('Pre-Enrollment marked as University Validated & Summary Sheet Generated!');
                        setActivePortal((prev) => prev ? { ...prev, validationStatus: 'Summary Sheet Generated', visaClearanceReady: true } : null);
                      },
                    });
                  }}
                  className="w-full py-2.5 px-3 rounded-[6px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12px] shadow-xs flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Generate Summary Sheet (Form 8/D)</span>
                </button>

                <button
                  onClick={() => {
                    setConfirmModalData({
                      isOpen: true,
                      title: 'Forward to DOV & CIMEA',
                      studentName: selectedStudent.name,
                      studentId: selectedStudent.studentId,
                      studentAvatar: selectedStudent.avatar,
                      country: selectedStudent.country,
                      currentStageName: 'Stage 9: Pre-Enrollment',
                      targetStageName: 'Stage 10: DOV and CIMEA',
                      description: `Advance ${selectedStudent.name} to Stage 10 (DOV and CIMEA) to manage official degree legalization, Apostille apostillization, and CIMEA Statement of Comparability.`,
                      confirmLabel: 'Confirm & Forward to Stage 10',
                      variant: 'primary',
                      onConfirm: () => {
                        if (onAdvanceStage) onAdvanceStage(selectedStudent.studentId || selectedStudent.id);
                        if (onNavigate) onNavigate(`dov-cimea?id=${selectedStudent.studentId}`);
                      },
                    });
                  }}
                  className="w-full py-2 px-3 rounded-[6px] bg-[#087cf5] hover:bg-[#006ee6] text-white font-bold text-[12px] shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>Advance to DOV & CIMEA (Stage 10)</span>
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
