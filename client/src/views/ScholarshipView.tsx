import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Award,
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
  Calculator,
  DollarSign,
  Landmark,
  FileCheck2,
} from 'lucide-react';
import { StudentRecord, INITIAL_STUDENTS } from '../services/studentsData';
import { WorkflowStageBanner } from '../components/workflow/WorkflowStageBanner';
import { getStageById } from '../context/WorkflowContext';
import { ActionConfirmModal } from '../components/modals/ActionConfirmModal';

interface ScholarshipViewProps {
  students?: StudentRecord[];
  onAdvanceStage?: (studentId: string) => any;
  onNavigate?: (route: string) => void;
  onOpenPhone?: (lead: any) => void;
  onOpenWhatsApp?: (lead: any) => void;
  onOpenEmail?: (lead: any) => void;
  onScheduleFollowUp?: (lead: any) => void;
}

interface ScholarshipData {
  schemeName: string;
  provider: string;
  type: string;
  maxGrantValue: string;
  stipendAmount: string;
  tuitionWaiver: string;
  mealsIncluded: boolean;
  accommodationPriority: boolean;
  portalUrl: string;
  applicationDeadline: string;
  daysLeft: number;
  status: 'Awarded & Disbursed' | 'Submitted to Portal' | 'Documents In Prep' | 'Eligible / Not Applied';
  portalRefId: string;
  iseeValue: string;
  householdIncomeInr: string;
  familyMembers: number;
  rankingPosition: string;
  disbursedAmount: string;
}

const getScholarshipForStudent = (st: StudentRecord): ScholarshipData => {
  const isAwarded = st.stageNumber >= 11;
  const isSubmitted = st.stageNumber >= 6;

  if (st.country === 'Italy') {
    return {
      schemeName: 'DSU Regional Study Grant (Veneto / Toscana / ER.GO)',
      provider: 'Regional Authority for the Right to Higher Education (ALISEO / DSU)',
      type: 'Need-based Regional Grant',
      maxGrantValue: '€8,500 / year + Free Canteen',
      stipendAmount: '€7,200 (2 Installments)',
      tuitionWaiver: '100% Tuition Exemption',
      mealsIncluded: true,
      accommodationPriority: true,
      portalUrl: 'https://dsu.toscana.it',
      applicationDeadline: '31 Aug 2027',
      daysLeft: 45,
      status: isAwarded ? 'Awarded & Disbursed' : isSubmitted ? 'Submitted to Portal' : 'Documents In Prep',
      portalRefId: `DSU-2027-${st.countryCode}-${st.studentId.slice(-3)}`,
      iseeValue: '€14,250 (Eligible < €26,000)',
      householdIncomeInr: '₹ 6,80,000 / year',
      familyMembers: 4,
      rankingPosition: isAwarded ? 'Rank #38 (Eligible Beneficiary)' : 'Pending Ranking List',
      disbursedAmount: isAwarded ? '€3,600 (Installment 1 Received)' : '€0 (Pending)',
    };
  }

  if (st.country === 'Germany') {
    return {
      schemeName: 'DAAD Study Scholarship & Deutschlandstipendium',
      provider: 'German Academic Exchange Service (DAAD) & Federal Ministry (BMBF)',
      type: 'Merit & Need Hybrid Grant',
      maxGrantValue: '€934 / month (~€11,200 / year)',
      stipendAmount: '€11,200 / year',
      tuitionWaiver: 'Full (Public Tuition €0)',
      mealsIncluded: false,
      accommodationPriority: true,
      portalUrl: 'https://www.mydaad.de',
      applicationDeadline: '15 Jul 2027',
      daysLeft: 60,
      status: isAwarded ? 'Awarded & Disbursed' : isSubmitted ? 'Submitted to Portal' : 'Documents In Prep',
      portalRefId: `DAAD-GER-2027-${st.studentId.slice(-3)}`,
      iseeValue: 'N/A (BMBF Income Check Passed)',
      householdIncomeInr: '₹ 8,20,000 / year',
      familyMembers: 4,
      rankingPosition: isAwarded ? 'Beneficiary Selected' : 'Review Underway',
      disbursedAmount: isAwarded ? '€5,600 (First Semester Credited)' : '€0 (Pending)',
    };
  }

  if (st.country === 'UK') {
    return {
      schemeName: 'Commonwealth / GREAT Scholarship & Vice-Chancellor Merit Award',
      provider: 'British Council & University International Office',
      type: 'Merit-Based Tuition Discount',
      maxGrantValue: '£10,000 Tuition Waiver',
      stipendAmount: 'N/A (Direct Tuition Deduction)',
      tuitionWaiver: '35% - 50% Tuition Reduction',
      mealsIncluded: false,
      accommodationPriority: false,
      portalUrl: 'https://study-uk.britishcouncil.org',
      applicationDeadline: '30 Jun 2027',
      daysLeft: 50,
      status: isAwarded ? 'Awarded & Disbursed' : isSubmitted ? 'Submitted to Portal' : 'Documents In Prep',
      portalRefId: `UK-SCHOL-2027-${st.studentId.slice(-3)}`,
      iseeValue: 'N/A (Merit Evaluated: GPA >= 8.0)',
      householdIncomeInr: '₹ 12,50,000 / year',
      familyMembers: 3,
      rankingPosition: isAwarded ? 'Confirmed Fee Waiver' : 'Shortlisted for Panel Interview',
      disbursedAmount: isAwarded ? '£5,000 Deducted from Fee Invoice' : '£0',
    };
  }

  return {
    schemeName: 'Campus France Eiffel Excellence / Regional Master Grant',
    provider: 'French Ministry for Europe and Foreign Affairs',
    type: 'Government Excellence Grant',
    maxGrantValue: '€1,181 / month + Return Flight',
    stipendAmount: '€14,172 / year',
    tuitionWaiver: 'Full Registration Exemption',
    mealsIncluded: false,
    accommodationPriority: true,
    portalUrl: 'https://campusfrance.org',
    applicationDeadline: '15 Jul 2027',
    daysLeft: 65,
    status: isAwarded ? 'Awarded & Disbursed' : isSubmitted ? 'Submitted to Portal' : 'Documents In Prep',
    portalRefId: `EUR-SCHOL-2027-${st.studentId.slice(-3)}`,
    iseeValue: 'N/A (Academic Merit Evaluated)',
    householdIncomeInr: '₹ 7,50,000 / year',
    familyMembers: 4,
    rankingPosition: isAwarded ? 'Awarded' : 'Under Review',
    disbursedAmount: isAwarded ? '€4,500' : '€0',
  };
};

export const ScholarshipView: React.FC<ScholarshipViewProps> = ({
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
  const [tabFilter, setTabFilter] = useState<'All' | 'Awarded' | 'Submitted' | 'InPrep'>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
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

  // Workspace Interactive State
  const [activeScholarship, setActiveScholarship] = useState<ScholarshipData | null>(null);
  const [docsVerified, setDocsVerified] = useState({
    familyComp: true,
    incomeTax: true,
    bankStatement: true,
    propertyValuation: true,
    swornTranslation: true,
  });

  // Deep-linking hash reader
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.includes('scholarship') && hash.includes('?id=')) {
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
    window.location.hash = `scholarship?id=${st.studentId}`;
    setActiveScholarship(getScholarshipForStudent(st));
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
    window.location.hash = 'scholarship';
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // KPI Calculations
  const stats = useMemo(() => {
    let awarded = 0;
    let submitted = 0;
    let inPrep = 0;
    let totalSecuredEur = 0;

    studentList.forEach((st) => {
      const data = getScholarshipForStudent(st);
      if (data.status === 'Awarded & Disbursed') {
        awarded++;
        totalSecuredEur += 8500;
      } else if (data.status === 'Submitted to Portal') {
        submitted++;
      } else {
        inPrep++;
      }
    });

    return {
      total: studentList.length,
      awarded,
      submitted,
      inPrep,
      totalSecuredEur,
    };
  }, [studentList]);

  // Filtered List
  const filteredStudents = useMemo(() => {
    return studentList.filter((st) => {
      const data = getScholarshipForStudent(st);

      if (tabFilter === 'Awarded' && data.status !== 'Awarded & Disbursed') return false;
      if (tabFilter === 'Submitted' && data.status !== 'Submitted to Portal') return false;
      if (tabFilter === 'InPrep' && data.status !== 'Documents In Prep') return false;

      if (countryFilter !== 'All' && st.country !== countryFilter) return false;
      if (statusFilter !== 'All' && data.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          st.name.toLowerCase().includes(q) ||
          st.studentId.toLowerCase().includes(q) ||
          st.country.toLowerCase().includes(q) ||
          data.schemeName.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [studentList, tabFilter, countryFilter, statusFilter, searchQuery]);

  return (
    <div className="p-3.5 pb-16 space-y-3 max-w-[1536px] mx-auto font-sans text-[#101d37] min-h-screen">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 right-5 z-50 bg-[#07182c] text-white text-xs px-4 py-2.5 rounded-lg shadow-xl border border-amber-500/30 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-3 text-slate-400 hover:text-white font-bold">
            ×
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODE 1: SCHOLARSHIP DIRECTORY VIEW                                   */}
      {/* ==================================================================== */}
      {!selectedStudent && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[17px] font-bold text-[#101d37] leading-tight">
                    Scholarship & Financial Aid Management
                  </h1>
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                    <Award className="w-3 h-3 text-amber-600" /> Stage 8 • Regional Grants & Merit Waivers
                  </span>
                </div>
                <p className="text-[11.5px] text-[#64748b] leading-tight mt-0.5">
                  Track regional government grants (DSU / ER.GO), DAAD Germany, Commonwealth/Chevening UK, and university tuition merit waivers.
                </p>
              </div>
            </div>

            <div className="text-[11.5px] text-[#64748b] hidden sm:inline">
              Home &gt; <span className="font-semibold text-[#101d37]">Scholarships</span>
            </div>
          </div>

          {/* Workflow Stage Banner */}
          <WorkflowStageBanner
            stage={getStageById('scholarship')}
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
                  title: 'Forward to Pre-Enrollment',
                  studentName: targetStudent.name,
                  studentId: targetStudent.studentId,
                  studentAvatar: targetStudent.avatar,
                  country: targetStudent.country,
                  currentStageName: 'Stage 8: Scholarship',
                  targetStageName: 'Stage 9: Pre-Enrollment',
                  description: `Advance ${targetStudent.name} to Stage 9 (Pre-Enrollment) to initiate official Universitaly / Uni-Assist pre-enrolment validation and embassy notification.`,
                  confirmLabel: 'Confirm & Forward to Stage 9',
                  variant: 'primary',
                  onConfirm: () => {
                    if (onAdvanceStage) onAdvanceStage(id);
                    if (onNavigate) onNavigate(`pre-enrolment?id=${targetStudent.studentId}`);
                  },
                });
              } else if (onAdvanceStage) {
                onAdvanceStage(id);
              }
            }}
            onEmptyAction={() => onNavigate && onNavigate('final-university')}
            emptyActionLabel="Go to Final University"
            emptyHint="No students have reached the Scholarship stage yet."
          />

          {/* 5 KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Total Candidates</span>
              <div className="text-[19px] font-bold text-[#101d37] mt-0.5">{stats.total}</div>
              <span className="text-[10px] text-[#087cf5] font-semibold">● Eligible Applicants</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Grants Awarded</span>
              <div className="text-[19px] font-bold text-emerald-600 mt-0.5">{stats.awarded}</div>
              <span className="text-[10px] text-emerald-600 font-semibold">✓ 100% Waiver + Stipends</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Applications Submitted</span>
              <div className="text-[19px] font-bold text-[#087cf5] mt-0.5">{stats.submitted}</div>
              <span className="text-[10px] text-[#087cf5] font-semibold">Under Merit Evaluation</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Documents in Prep</span>
              <div className="text-[19px] font-bold text-amber-600 mt-0.5">{stats.inPrep}</div>
              <span className="text-[10px] text-amber-600 font-medium">ISEE / CA Docs Review</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Aid Secured Total</span>
              <div className="text-[19px] font-bold text-purple-600 mt-0.5">
                €{(stats.totalSecuredEur / 1000).toFixed(1)}k
              </div>
              <span className="text-[10px] text-purple-600 font-medium">~ ₹{(stats.totalSecuredEur * 92 / 100000).toFixed(1)} Lakhs Aid</span>
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11.5px]">
                {[
                  { id: 'All', label: `All Portfolios (${stats.total})` },
                  { id: 'Awarded', label: `Grants Awarded (${stats.awarded})` },
                  { id: 'Submitted', label: `Portal Submitted (${stats.submitted})` },
                  { id: 'InPrep', label: `Documents In Prep (${stats.inPrep})` },
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
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Open Sample Scholarship Workspace</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2 pt-1 border-t border-slate-100">
              <div className="relative sm:col-span-2">
                <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search candidate by name, student ID, country, or scholarship grant scheme..."
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] focus:bg-white rounded-[6px] pl-8 pr-3 py-1.5 text-[12px] text-[#101d37] outline-none transition-all"
                />
              </div>

              <div>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] rounded-[6px] px-2.5 py-1.5 text-[12px] text-[#101d37] outline-none"
                >
                  <option value="All">All Destination Countries</option>
                  <option value="Italy">🇮🇹 Italy (DSU / ER.GO)</option>
                  <option value="Germany">🇩🇪 Germany (DAAD)</option>
                  <option value="UK">🇬🇧 United Kingdom (Merit/Chevening)</option>
                  <option value="France">🇫🇷 France (Eiffel)</option>
                </select>
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] rounded-[6px] px-2.5 py-1.5 text-[12px] text-[#101d37] outline-none"
                >
                  <option value="All">All Grant Statuses</option>
                  <option value="Awarded & Disbursed">Awarded & Disbursed</option>
                  <option value="Submitted to Portal">Submitted to Portal</option>
                  <option value="Documents In Prep">Documents In Prep</option>
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
                    <th className="py-3 px-3 min-w-[320px]">Scholarship Scheme & Grant Value</th>
                    <th className="py-3 px-3 min-w-[170px] text-center">ISEE / Income Audit</th>
                    <th className="py-3 px-3 min-w-[160px] text-center">Grant Status</th>
                    <th className="py-3 px-3 min-w-[150px] text-center">Deadline Proximity</th>
                    <th className="py-3 px-3 min-w-[140px] text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((st, idx) => {
                      const sch = getScholarshipForStudent(st);

                      return (
                        <tr
                          key={st.id}
                          onClick={() => handleOpenStudent(st)}
                          className="hover:bg-amber-50/30 cursor-pointer transition-colors group"
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
                              <span>{st.targetUniversity}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 min-w-[320px] align-middle">
                            <div className="flex flex-col gap-1">
                              <div className="font-bold text-slate-800 text-[12px] flex items-center gap-1.5 truncate">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <span>{sch.schemeName}</span>
                              </div>
                              <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-2">
                                <span>Value: {sch.maxGrantValue}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-500 font-normal">{sch.tuitionWaiver}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 min-w-[170px] text-center align-middle">
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-[5px] text-[11px] font-semibold border whitespace-nowrap bg-slate-50 text-slate-700 border-slate-200 shadow-2xs">
                              {sch.iseeValue}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 min-w-[160px] text-center align-middle">
                            <span
                              className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-[5px] text-[11px] font-semibold border whitespace-nowrap shadow-2xs ${
                                sch.status === 'Awarded & Disbursed'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : sch.status === 'Submitted to Portal'
                                  ? 'bg-blue-50 text-[#087cf5] border-blue-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {sch.status === 'Awarded & Disbursed' && <CheckCircle2 className="w-3 h-3" />}
                              <span>{sch.status}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-3 min-w-[150px] text-center align-middle">
                            <div className="inline-flex flex-col items-center">
                              <div className="font-semibold text-slate-800 text-[11.5px] flex items-center justify-center gap-1.5 whitespace-nowrap">
                                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{sch.applicationDeadline}</span>
                              </div>
                              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 inline-block mt-1 whitespace-nowrap shadow-2xs">
                                {sch.daysLeft}d left
                              </span>
                            </div>
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
                              <span>Manage Scholarship</span>
                              <span className="transition-transform group-hover/btn:translate-x-0.5 font-bold">&gt;</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[#64748b] text-xs">
                        No scholarship records found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-3.5 py-2.5 bg-[#f8fafc] border-t border-[#e5edf5] flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-[#64748b]">
              <span>Showing <strong>{filteredStudents.length}</strong> candidates eligible for financial aid</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Live Grant Intake Sync 2026/27
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODE 2: STUDENT SCHOLARSHIP WORKSPACE WINDOW                        */}
      {/* ==================================================================== */}
      {selectedStudent && activeScholarship && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          {/* Top Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-0.5">
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleBackToList}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#e2e8f0] bg-white hover:bg-slate-50 text-[12px] font-semibold text-[#101d37] shadow-xs transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#087cf5]" />
                <span>← Back to Scholarship Directory</span>
              </button>

              <span className="text-[12px] text-[#64748b] hidden sm:inline">
                Home &gt; Scholarships &gt;{' '}
                <span className="font-bold text-[#101d37]">{selectedStudent.name}</span>{' '}
                <span className="text-[#64748b]">({selectedStudent.studentId})</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast('Scholarship application package downloaded')}
                className="px-2.5 py-1.5 rounded-[6px] border border-[#cbd5e1] bg-white hover:bg-slate-50 text-[#101d37] text-[11.5px] font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export Scholarship PDF</span>
              </button>

              <button
                onClick={() => {
                  setConfirmModalData({
                    isOpen: true,
                    title: 'Forward to Pre-Enrollment',
                    studentName: selectedStudent.name,
                    studentId: selectedStudent.studentId,
                    studentAvatar: selectedStudent.avatar,
                    country: selectedStudent.country,
                    currentStageName: 'Stage 8: Scholarship',
                    targetStageName: 'Stage 9: Pre-Enrollment',
                    description: `Forward ${selectedStudent.name} to Stage 9 (Pre-Enrollment) to initiate official Universitaly / Uni-Assist pre-enrolment validation and embassy notification.`,
                    confirmLabel: 'Confirm & Forward to Stage 9',
                    variant: 'primary',
                    onConfirm: () => {
                      if (onAdvanceStage) onAdvanceStage(selectedStudent.studentId || selectedStudent.id);
                      if (onNavigate) onNavigate(`pre-enrolment?id=${selectedStudent.studentId}`);
                    },
                  });
                }}
                className="px-3 py-1.5 rounded-[6px] bg-[#087cf5] hover:bg-[#006ee6] text-white text-[11.5px] font-bold flex items-center gap-1.5 shadow-xs"
              >
                <span>Proceed to Pre-Enrollment (Stage 9)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Student Profile Overview Card */}
          <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <img
                  src={selectedStudent.avatar}
                  alt={selectedStudent.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/avatars/rahul.png';
                  }}
                  className="w-12 h-12 aspect-square rounded-full object-cover border-2 border-amber-500/30 shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[16px] font-bold text-[#101d37] leading-tight">
                      {selectedStudent.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10.5px] font-mono font-bold">
                      {selectedStudent.studentId}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" /> {activeScholarship.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#64748b] mt-1">
                    <span>Target: <strong className="text-slate-800">{selectedStudent.targetUniversity}</strong> ({selectedStudent.country})</span>
                    <span>•</span>
                    <span>Intake: <strong className="text-slate-800">{selectedStudent.intake}</strong></span>
                    <span>•</span>
                    <span>Portal Ref: <strong className="font-mono text-[#087cf5]">{activeScholarship.portalRefId}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-[6px] bg-amber-50/70 border border-amber-200 text-center">
                  <span className="text-[10px] text-amber-800 font-semibold block">Max Grant Value</span>
                  <span className="text-[13px] font-bold text-amber-900">{activeScholarship.maxGrantValue}</span>
                </div>
                <div className="px-3 py-1.5 rounded-[6px] bg-emerald-50/70 border border-emerald-200 text-center">
                  <span className="text-[10px] text-emerald-800 font-semibold block">Disbursed Aid</span>
                  <span className="text-[13px] font-bold text-emerald-900">{activeScholarship.disbursedAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main 2-Col Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            {/* Left 8 Cols */}
            <div className="lg:col-span-8 space-y-3.5">
              {/* Grant Scheme Breakdown */}
              <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs space-y-3">
                <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                  <h3 className="font-bold text-[14px] text-[#101d37] flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    Assigned Grant Scheme: {activeScholarship.schemeName}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">Provider: {activeScholarship.provider}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-500 text-[11px] block">Tuition Waiver</span>
                    <strong className="text-emerald-700 text-[13px] block">{activeScholarship.tuitionWaiver}</strong>
                    <span className="text-[10.5px] text-slate-500">100% exemption on university regional tax</span>
                  </div>

                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-500 text-[11px] block">Cash Living Allowance</span>
                    <strong className="text-slate-800 text-[13px] block">{activeScholarship.stipendAmount}</strong>
                    <span className="text-[10.5px] text-slate-500">Credited directly to Italian/EU student bank account</span>
                  </div>

                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-500 text-[11px] block">University Canteen (Mensa)</span>
                    <strong className="text-slate-800 text-[13px] block">
                      {activeScholarship.mealsIncluded ? '✓ 2 Free Meals Daily' : 'Subsidized Student Rate'}
                    </strong>
                    <span className="text-[10.5px] text-slate-500">Free lunch and dinner in all campus facilities</span>
                  </div>

                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-500 text-[11px] block">Student Residence</span>
                    <strong className="text-slate-800 text-[13px] block">
                      {activeScholarship.accommodationPriority ? 'Priority Dorm Allocation' : 'Rent Subsidy Voucher'}
                    </strong>
                    <span className="text-[10.5px] text-slate-500">Guaranteed room in university halls</span>
                  </div>
                </div>
              </div>

              {/* ISEE Parificato / Financial Assessment */}
              <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs space-y-3">
                <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                  <h3 className="font-bold text-[13.5px] text-[#101d37] flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-[#087cf5]" />
                    ISEE Parificato & Family Income Evaluation
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10.5px] font-bold border border-emerald-200">
                    Calculated ISEE: {activeScholarship.iseeValue}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11.5px]">
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10.5px]">Gross Annual Income</span>
                    <strong className="text-slate-800 text-[13px] block mt-0.5">{activeScholarship.householdIncomeInr}</strong>
                    <span className="text-slate-500 text-[10.5px] mt-0.5 block">Based on parents ITR-V filing</span>
                  </div>

                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10.5px]">Household Members</span>
                    <strong className="text-slate-800 text-[13px] block mt-0.5">{activeScholarship.familyMembers} Persons</strong>
                    <span className="text-slate-500 text-[10.5px] mt-0.5 block">Scale parameter: 2.46</span>
                  </div>

                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10.5px]">Regional Threshold</span>
                    <strong className="text-emerald-700 text-[13px] block mt-0.5">&lt; €26,000 / year</strong>
                    <span className="text-emerald-600 font-semibold text-[10.5px] mt-0.5 block">✓ Maximum Tier Match</span>
                  </div>
                </div>
              </div>

              {/* Document Checklist */}
              <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs space-y-2.5">
                <h3 className="font-bold text-[13.5px] text-[#101d37] flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  Required Scholarship Legal Documents (Apostilled & Sworn Translated)
                </h3>

                <div className="space-y-1.5 text-[11.5px]">
                  {[
                    { key: 'familyComp', label: 'Family Composition Certificate (issued by Tehsildar/Revenue Officer & MEA Apostilled)' },
                    { key: 'incomeTax', label: 'Parents 3-Year Income Tax Returns (ITR-V) & Form 16 / Salary slips' },
                    { key: 'bankStatement', label: 'Bank Certificate showing account balances as of 31st December' },
                    { key: 'propertyValuation', label: 'CA Certificate of Immovable Property / Rent Deed evaluation' },
                    { key: 'swornTranslation', label: 'Official Sworn Translation into Italian/German with Consular Legalization' },
                  ].map((doc) => (
                    <label key={doc.key} className="flex items-center gap-2 p-2 rounded bg-slate-50 border border-slate-200/70 hover:bg-slate-100/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(docsVerified as any)[doc.key]}
                        onChange={(e) =>
                          setDocsVerified((prev) => ({ ...prev, [doc.key]: e.target.checked }))
                        }
                        className="w-4 h-4 text-[#087cf5] rounded border-slate-300"
                      />
                      <span className="text-slate-800 font-medium">{doc.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 4 Cols */}
            <div className="lg:col-span-4 space-y-3.5">
              {/* Status Action Card */}
              <div className="bg-white rounded-[9px] border-2 border-amber-500/30 p-3.5 shadow-sm space-y-3">
                <h3 className="font-bold text-[13.5px] text-[#101d37] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Grant Milestone Actions
                </h3>

                <div className="space-y-2 text-[11.5px] text-slate-600">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Application Portal:</span>
                    <a
                      href={activeScholarship.portalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#087cf5] font-semibold flex items-center gap-1 hover:underline"
                    >
                      <span>Regional Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Merit Position:</span>
                    <strong className="text-slate-800">{activeScholarship.rankingPosition}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Deadline:</span>
                    <strong className="text-amber-700">{activeScholarship.applicationDeadline}</strong>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setConfirmModalData({
                      isOpen: true,
                      title: 'Confirm Scholarship Award & Beneficiary',
                      studentName: selectedStudent.name,
                      studentId: selectedStudent.studentId,
                      studentAvatar: selectedStudent.avatar,
                      country: selectedStudent.country,
                      currentStageName: 'Stage 8: Scholarship',
                      targetStageName: 'Stage 8: Scholarship',
                      description: `Record official scholarship award grant and mark ${selectedStudent.name} as a confirmed scholarship beneficiary (${activeScholarship?.schemeName || 'Regional Grant'}).`,
                      confirmLabel: 'Confirm Award Status',
                      variant: 'success',
                      onConfirm: () => {
                        showToast('Scholarship marked as Awarded & Disbursed!');
                        setActiveScholarship((prev) => prev ? { ...prev, status: 'Awarded & Disbursed' } : null);
                      },
                    });
                  }}
                  className="w-full py-2.5 px-3 rounded-[6px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12px] shadow-xs flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark as Awarded & Beneficiary</span>
                </button>

                <button
                  onClick={() => {
                    setConfirmModalData({
                      isOpen: true,
                      title: 'Forward to Pre-Enrollment',
                      studentName: selectedStudent.name,
                      studentId: selectedStudent.studentId,
                      studentAvatar: selectedStudent.avatar,
                      country: selectedStudent.country,
                      currentStageName: 'Stage 8: Scholarship',
                      targetStageName: 'Stage 9: Pre-Enrollment',
                      description: `Advance ${selectedStudent.name} to Stage 9 (Pre-Enrollment) to initiate official Universitaly / Uni-Assist pre-enrolment validation and embassy notification.`,
                      confirmLabel: 'Confirm & Forward to Stage 9',
                      variant: 'primary',
                      onConfirm: () => {
                        if (onAdvanceStage) onAdvanceStage(selectedStudent.studentId || selectedStudent.id);
                        if (onNavigate) onNavigate(`pre-enrolment?id=${selectedStudent.studentId}`);
                      },
                    });
                  }}
                  className="w-full py-2 px-3 rounded-[6px] bg-[#087cf5] hover:bg-[#006ee6] text-white font-bold text-[12px] shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>Advance to Pre-Enrollment (Stage 9)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                  <span>Contact Student:</span>
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
