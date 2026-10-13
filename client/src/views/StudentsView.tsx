import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Phone,
  Mail,
  Calendar,
  Edit2,
  Check,
  Plus,
  Clock,
  ExternalLink,
  ChevronDown,
  GraduationCap,
  MapPin,
  CreditCard,
  Send,
  Building2,
  Award,
  Lightbulb,
  Monitor,
  Plane,
  CheckCircle2,
  Search,
  Filter,
  ArrowLeft,
  Users,
  Download,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Lead } from '../types/crm';

import { StudentRecord, INITIAL_STUDENTS } from '../services/studentsData';
import {
  useWorkflow,
  getPipelineStageForStudent,
  getNextStageForStudent,
} from '../context/WorkflowContext';
import { ActionConfirmModal } from '../components/modals/ActionConfirmModal';
export type { StudentRecord };
export { INITIAL_STUDENTS };

interface StudentsViewProps {
  currentStageFilter?: string;
  onScheduleFollowUp?: (lead: Lead) => void;
  onOpenPhone?: (lead: Lead) => void;
  onOpenWhatsApp?: (lead: Lead) => void;
  onOpenEmail?: (lead: Lead) => void;
  onNavigate?: (route: string) => void;
  onEditLead?: (lead: Lead) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  currentStageFilter,
  onScheduleFollowUp,
  onOpenPhone,
  onOpenWhatsApp,
  onOpenEmail,
  onNavigate,
  onEditLead,
}) => {
  // Shared workflow store — single source of truth for every stage workspace
  const { students: workflowStudents, advanceStudentStage } = useWorkflow();

  // Navigation State: Directory List vs Profile Detail Window
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  // Profile Detail Tabs
  const [activeSubTab, setActiveSubTab] = useState('Overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Directory Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [tabFilter, setTabFilter] = useState<'All' | 'Applications' | 'Offers' | 'Visa' | 'Ready'>('All');

  // Keep the open profile in sync with the shared workflow store (stage moves, timeline updates)
  useEffect(() => {
    if (!selectedStudent) return;
    const fresh = workflowStudents.find((s) => s.id === selectedStudent.id);
    if (fresh && fresh !== selectedStudent) setSelectedStudent(fresh);
  }, [workflowStudents]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stage bands. Applications covers the whole active journey (stages 5-9,
  // including offer-stage files), Offers 6-9, Visa 10-11, Ready 12.
  const TAB_FILTERS: Record<Exclude<'All' | 'Applications' | 'Offers' | 'Visa' | 'Ready', 'All'>, (st: StudentRecord) => boolean> = {
    Applications: (st) => st.stageNumber >= 5 && st.stageNumber <= 9,
    Offers: (st) => st.stageNumber >= 6 && st.stageNumber <= 9,
    Visa: (st) => st.stageNumber >= 10 && st.stageNumber <= 11,
    Ready: (st) => st.stageNumber >= 12,
  };

  const studentTabs = [
    { id: 'All', label: 'All Students' },
    { id: 'Applications', label: 'Applications' },
    { id: 'Offers', label: 'Offers' },
    { id: 'Visa', label: 'Visa Stage' },
    { id: 'Ready', label: 'Ready' },
  ] as const;

  const tabCount = (id: 'All' | 'Applications' | 'Offers' | 'Visa' | 'Ready') =>
    id === 'All' ? workflowStudents.length : workflowStudents.filter(TAB_FILTERS[id]).length;

  // Check URL Hash for deep links like #students?id=ITA-2027-001 or #students?filter=Visa
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.includes('?id=')) {
        const idParam = hash.split('?id=')[1];
        const match = workflowStudents.find(
          (s) => s.studentId === idParam || s.id === idParam || s.name.toLowerCase().includes(idParam.toLowerCase())
        );
        if (match) {
          setSelectedStudent(match);
        }
      }
      if (hash.toLowerCase().includes('visa') || hash.toLowerCase().includes('dov')) {
        setTabFilter('Visa');
        setSelectedStudent(null);
      } else if (hash.toLowerCase().includes('offers')) {
        setTabFilter('Offers');
        setSelectedStudent(null);
      } else if (hash.toLowerCase().includes('applications')) {
        setTabFilter('Applications');
        setSelectedStudent(null);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [workflowStudents]);

  // Dynamic header based on active pipeline section
  const stageHeaderConfig: Record<string, { title: string; subtitle: string }> = {
    students: {
      title: 'Enrolled Students Directory',
      subtitle: 'Complete lifecycle tracking and detailed profiles of all enrolled students',
    },
    'student-approval': {
      title: 'Student Approval & Program Sign-off',
      subtitle: 'Review student program choices, signed undertakings, and counselor approvals',
    },
    scholarship: {
      title: 'Scholarship Applications & Grants',
      subtitle: 'Italian regional scholarships (DSU, EDISU, ALISEO, LAZIODISCO) and merit award filings',
    },
    'pre-enrolment': {
      title: 'Pre-Enrollment & Universitaly Verification',
      subtitle: 'Official Universitaly summary dispatch, embassy pre-enrolment receipts, and consular validation',
    },
    'dov-cimea': {
      title: 'DOV and CIMEA Verification',
      subtitle: 'Declaration of Value (DOV) appointments, apostilles, and CIMEA Statement of Comparability',
    },
    'visa-process': {
      title: 'Visa Applications & Embassy Appointments',
      subtitle: 'VFS Global slot bookings, financial proof documentation, and Italian national visa stamps',
    },
    visa: {
      title: 'Visa Applications & Embassy Appointments',
      subtitle: 'VFS Global slot bookings, financial proof documentation, and Italian national visa stamps',
    },
    'pre-departure': {
      title: 'Pre-Departure Briefing & Arrival Assistance',
      subtitle: 'Student housing, flight bookings, Italian tax code (Codice Fiscale), and Permesso di Soggiorno',
    },
  };

  useEffect(() => {
    if (currentStageFilter === 'visa-process' || currentStageFilter === 'visa') {
      setTabFilter('Visa');
    } else if (currentStageFilter === 'pre-departure') {
      setTabFilter('Ready');
    }
  }, [currentStageFilter]);

  // Filter students for the directory list
  const filteredStudents = useMemo(() => {
    const list = workflowStudents.filter((st) => {
      const matchesSearch =
        st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.phone.includes(searchQuery) ||
        st.preferredCourse.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.targetUniversity.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCountry = countryFilter === 'All' || st.country === countryFilter;
      const matchesStatus = statusFilter === 'All' || st.overallStatus === statusFilter;

      // Filter by pipeline stage if navigated to a specific section
      if (currentStageFilter && currentStageFilter !== 'students') {
        if (currentStageFilter === 'student-approval') {
          if (st.stageNumber !== 4 && !st.currentStage.toLowerCase().includes('approval') && st.stageNumber !== 3) {
            return false;
          }
        } else if (currentStageFilter === 'scholarship') {
          if (st.stageNumber !== 8 && (!st.scholarships || st.scholarships.length === 0)) {
            return false;
          }
        } else if (currentStageFilter === 'pre-enrolment') {
          if (st.stageNumber !== 9 && (!st.preEnrolment || st.preEnrolment.length === 0)) {
            return false;
          }
        } else if (currentStageFilter === 'dov-cimea') {
          if (st.stageNumber !== 10 && !st.dov?.status) {
            return false;
          }
        } else if (currentStageFilter === 'visa-process' || currentStageFilter === 'visa') {
          if (st.stageNumber < 10 && !st.visa?.status && !st.visa?.appointmentDate) {
            return false;
          }
        } else if (currentStageFilter === 'pre-departure') {
          if (st.stageNumber < 12) {
            return false;
          }
        }
      }

      const matchesTab = tabFilter === 'All' || TAB_FILTERS[tabFilter](st);

      return matchesSearch && matchesCountry && matchesStatus && matchesTab;
    });

    // Fallback: If zero matches on specific stage filter, show active students matching search so screen is never blank
    if (list.length === 0 && currentStageFilter && currentStageFilter !== 'students') {
      return workflowStudents.filter((st) => {
        const matchesSearch =
          st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          st.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          st.phone.includes(searchQuery);
        return matchesSearch;
      });
    }

    return list;
  }, [workflowStudents, searchQuery, countryFilter, statusFilter, tabFilter, currentStageFilter]);

  // Convert student record to Lead type for reusable modals
  const studentAsLead = (st: StudentRecord): Lead => ({
    id: st.id,
    leadId: st.studentId,
    studentName: st.name,
    phone: st.phone,
    email: st.email,
    countryInterest: st.country,
    courseInterest: st.preferredCourse,
    leadSource: 'Student Enrolment',
    lastActivity: st.enrollmentDate,
    nextFollowUp: st.nextFollowUp,
    status: st.overallStatus,
    currentStage: st.currentStage,
    isEnrolled: true,
    isTransferredToDocs: true,
  });

  const handleOpenStudentProfile = (st: StudentRecord) => {
    setSelectedStudent(st);
    setActiveSubTab('Overview');
    window.location.hash = `students?id=${st.studentId}`;
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
    window.location.hash = 'students';
  };

  // Keep open student profile synchronized with live workflow state
  const activeStudent = useMemo(() => {
    if (!selectedStudent) return null;
    return (
      workflowStudents.find(
        (s) => s.id === selectedStudent.id || s.studentId === selectedStudent.studentId
      ) || selectedStudent
    );
  }, [selectedStudent, workflowStudents]);

  // Pipeline (workflow) position for the open profile
  const selectedPipelineStage = activeStudent ? getPipelineStageForStudent(activeStudent) : undefined;
  const selectedNextStage = activeStudent ? getNextStageForStudent(activeStudent) : undefined;

  // Floating Confirmation Card State
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
    onConfirm: () => void;
  } | null>(null);

  const handleAdvanceStage = () => {
    if (!activeStudent || !selectedNextStage) return;
    setConfirmModalData({
      isOpen: true,
      title: `Forward to ${selectedNextStage.label}?`,
      studentName: activeStudent.name,
      studentId: activeStudent.studentId,
      studentAvatar: activeStudent.avatar,
      country: activeStudent.country,
      currentStageName: selectedPipelineStage?.label || 'Enrolled Students',
      targetStageName: selectedNextStage.label,
      description: `Are you sure you want to forward ${activeStudent.name} to "${selectedNextStage.label}"? This will advance the student profile to the next team in the pipeline.`,
      confirmLabel: `Yes, Forward to ${selectedNextStage.label}`,
      onConfirm: () => {
        const next = advanceStudentStage(activeStudent.id, selectedNextStage.id);
        if (next) {
          setSelectedStudent((prev) =>
            prev
              ? {
                  ...prev,
                  stageNumber: next.stageNumber,
                  currentStage: next.currentStage,
                  overallStatus: next.status,
                }
              : null
          );
          setToastMessage(`${activeStudent.name} moved to ${next.label}`);
          setTimeout(() => setToastMessage(null), 3000);
          if (onNavigate) {
            onNavigate(`${next.route}?id=${activeStudent.studentId}`);
          }
        }
      },
    });
  };

  const tabs = [
    'Overview',
    'Enrolment',
    'University Shortlisting',
    'Student Approval',
    'Documents',
    'Applications',
    'Offer Letters',
    'Final University',
    'Scholarship',
    'Pre-Enrolment',
    'DoV / CIMEA',
    'Visa',
    'Pre-Departure',
    'Timeline',
  ];

  // 12 Stepper stages dynamically computed based on student's actual stage in the pipeline
  const currentStageNum = activeStudent?.stageNumber || 1;
  const stepperStages = [
    { num: 1, title: 'Enrollment' },
    { num: 2, title: 'Shortlisting' },
    { num: 3, title: 'Student Approval' },
    { num: 4, title: 'Documentation' },
    { num: 5, title: 'Applications' },
    { num: 6, title: 'Offer Letter' },
    { num: 7, title: 'Final University' },
    { num: 8, title: 'Scholarship' },
    { num: 9, title: 'Pre-Enrolment' },
    { num: 10, title: 'DoV / CIMEA' },
    { num: 11, title: 'Visa Process' },
    { num: 12, title: 'Travel & Arrival', isLast: true },
  ].map((step) => {
    let status = 'Pending';
    let color = 'gray';
    let lineColor = 'gray';

    if (step.num < currentStageNum) {
      status = 'Completed';
      color = 'green';
      lineColor = 'green';
    } else if (step.num === currentStageNum) {
      status = 'In Progress';
      color = 'blue';
      lineColor = 'blue';
    } else if (step.num === currentStageNum + 1) {
      status = 'Next Stage';
      color = 'orange';
      lineColor = 'gray';
    }

    return {
      ...step,
      status,
      color,
      lineColor,
    };
  });

  return (
    <div className="p-3 sm:p-4 pb-16 space-y-3 font-sans text-[#101d37] max-w-[1600px] mx-auto min-h-screen">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-16 right-5 z-50 bg-[#07182c] text-white text-xs px-4 py-2.5 rounded-lg shadow-xl border border-blue-500/30 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-3 text-slate-400 hover:text-white font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Action Confirmation Floating Card */}
      {confirmModalData && (
        <ActionConfirmModal
          isOpen={confirmModalData.isOpen}
          onClose={() => setConfirmModalData(null)}
          onConfirm={confirmModalData.onConfirm}
          title={confirmModalData.title}
          studentName={confirmModalData.studentName}
          studentId={confirmModalData.studentId}
          studentAvatar={confirmModalData.studentAvatar}
          country={confirmModalData.country}
          currentStageName={confirmModalData.currentStageName}
          targetStageName={confirmModalData.targetStageName}
          description={confirmModalData.description}
          confirmLabel={confirmModalData.confirmLabel}
        />
      )}

      {/* ======================================================== */}
      {/* MODE 1: STUDENTS DIRECTORY (LIST VIEW)                  */}
      {/* ======================================================== */}
      {!selectedStudent && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Page Header */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#087cf5] text-white flex items-center justify-center shadow-xs">
                <svg
                  className="w-5 h-5 fill-none stroke-current"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <circle cx="12" cy="10" r="3" />
                  <path d="M7 17a5 5 0 0 1 10 0" />
                </svg>
              </div>
              <div>
                <h1 className="text-[18px] font-bold text-[#101d37] leading-tight">
                  {stageHeaderConfig[currentStageFilter || 'students']?.title || 'Enrolled Students Directory'}
                </h1>
                <p className="text-[11.5px] text-[#64748b] leading-tight mt-0.5">
                  {stageHeaderConfig[currentStageFilter || 'students']?.subtitle ||
                    'Manage enrolled students, track university applications, visa stages, and student files'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11.5px] text-[#64748b] hidden sm:inline">
                Home &gt;{' '}
                <span className="font-semibold text-[#101d37]">
                  {stageHeaderConfig[currentStageFilter || 'students']?.title || 'Enrolled Students Directory'}
                </span>
              </span>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            <div className="bg-white p-3 rounded-[8px] border border-[#e5edf5] shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Total Enrolled</span>
              <div className="text-[20px] font-bold text-[#101d37] mt-0.5">{workflowStudents.length}</div>
              <span className="text-[10px] text-[#15803d] font-semibold mt-0.5 inline-block">
                ● {workflowStudents.filter((st) => st.overallStatus !== 'Lost').length} Active
              </span>
            </div>
            <div className="bg-white p-3 rounded-[8px] border border-[#e5edf5] shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Applications In Progress</span>
              <div className="text-[20px] font-bold text-[#087cf5] mt-0.5">{tabCount('Applications')}</div>
              <span className="text-[10px] text-[#64748b]">Under university review</span>
            </div>
            <div className="bg-white p-3 rounded-[8px] border border-[#e5edf5] shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Offer Letters</span>
              <div className="text-[20px] font-bold text-[#15803d] mt-0.5">{tabCount('Offers')}</div>
              <span className="text-[10px] text-[#15803d] font-medium">Offers issued</span>
            </div>
            <div className="bg-white p-3 rounded-[8px] border border-[#e5edf5] shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Visa Processing</span>
              <div className="text-[20px] font-bold text-[#ea580c] mt-0.5">{tabCount('Visa')}</div>
              <span className="text-[10px] text-[#ea580c] font-medium">VFS / Embassy queue</span>
            </div>
            <div className="bg-white p-3 rounded-[8px] border border-[#e5edf5] shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Departure Ready</span>
              <div className="text-[20px] font-bold text-[#7c3aed] mt-0.5">{tabCount('Ready')}</div>
              <span className="text-[10px] text-[#7c3aed] font-medium">Pre-departure orientation</span>
            </div>
          </div>

          {/* Toolbar: Search, Filters, Subtabs */}
          <div className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              {/* Quick Tab Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11.5px]">
                {studentTabs.map((tb) => (
                  <button
                    key={tb.id}
                    onClick={() => setTabFilter(tb.id)}
                    className={`px-3 py-1.5 rounded-[5px] font-semibold transition-colors whitespace-nowrap ${
                      tabFilter === tb.id
                        ? 'bg-[#087cf5] text-white shadow-xs'
                        : 'bg-slate-50 text-[#52627a] hover:bg-slate-100 hover:text-[#101d37]'
                    }`}
                  >
                    {tb.label} ({tabCount(tb.id)})
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input & Select Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2 pt-1 border-t border-slate-100">
              <div className="relative sm:col-span-2">
                <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student by name, student ID, mobile, course, or university..."
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] focus:bg-white rounded-[6px] pl-8 pr-3 py-1.5 text-[12px] text-[#101d37] outline-none transition-all"
                />
              </div>

              <div>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] rounded-[6px] px-2.5 py-1.5 text-[12px] text-[#101d37] outline-none"
                >
                  <option value="All">All Countries</option>
                  <option value="Italy">🇮🇹 Italy</option>
                  <option value="Germany">🇩🇪 Germany</option>
                  <option value="UK">🇬🇧 United Kingdom</option>
                  <option value="Ireland">🇮🇪 Ireland</option>
                  <option value="France">🇫🇷 France</option>
                </select>
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] rounded-[6px] px-2.5 py-1.5 text-[12px] text-[#101d37] outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Processing">Processing</option>
                  <option value="Offer Received">Offer Received</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Visa Process">Visa Process</option>
                </select>
              </div>
            </div>
          </div>

          {/* Students Directory Table */}
          <div className="bg-white rounded-[8px] border border-[#e5edf5] shadow-xs overflow-hidden flex flex-col">
            <div className="overflow-x-auto overflow-y-auto max-h-[640px] scrollbar-thin">
              <table className="w-full text-left text-[12px] border-collapse min-w-[1020px]">
                <thead className="sticky top-0 bg-[#f8fafc] z-10 border-b border-[#e5edf5] shadow-2xs">
                  <tr className="text-[#52627a] font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Student Name & ID</th>
                    <th className="py-2.5 px-3">Country & Target University</th>
                    <th className="py-2.5 px-3">Program & Level</th>
                    <th className="py-2.5 px-3">Intake</th>
                    <th className="py-2.5 px-3">Counsellor</th>
                    <th className="py-2.5 px-3">Workflow Stage</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((st, idx) => (
                      <tr
                        key={st.id}
                        onClick={() => handleOpenStudentProfile(st)}
                        className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                      >
                        <td className="py-3 px-3 text-[#64748b]">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={st.avatar}
                              alt={st.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/avatars/rahul.png';
                              }}
                              className="w-8 h-8 aspect-square rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-[#101d37] group-hover:text-[#087cf5] transition-colors">
                                {st.name}
                              </div>
                              <div className="text-[10px] text-[#64748b] font-medium">
                                ID: <span className="font-semibold text-slate-700">{st.studentId}</span> • {st.phone}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-[#101d37] flex items-center gap-1.5">
                            <span>
                              {st.country === 'Italy' ? '🇮🇹' : st.country === 'Germany' ? '🇩🇪' : st.country === 'UK' ? '🇬🇧' : st.country === 'France' ? '🇫🇷' : '🇮🇪'}
                            </span>
                            <span>{st.country}</span>
                          </div>
                          <div className="text-[10.5px] text-[#64748b] truncate max-w-[160px]">
                            {st.targetUniversity}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-[#101d37]">{st.preferredCourse}</div>
                          <div className="text-[10px] text-[#64748b]">{st.courseLevel}</div>
                        </td>
                        <td className="py-3 px-3 font-medium text-[#52627a]">{st.intake}</td>
                        <td className="py-3 px-3 font-medium text-[#101d37]">{st.counsellor}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-[#087cf5] text-[10px] font-bold flex items-center justify-center shrink-0">
                              {st.stageNumber}
                            </span>
                            <span className="text-[11px] font-medium text-slate-700 truncate max-w-[140px]">
                              {st.currentStage}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-[4px] text-[10.5px] font-semibold ${
                              st.overallStatus === 'Offer Received'
                                ? 'bg-[#dcfce7] text-[#15803d]'
                                : st.overallStatus === 'Processing'
                                ? 'bg-[#e0f2fe] text-[#0284c7]'
                                : 'bg-[#fef3c7] text-[#d97706]'
                            }`}
                          >
                            {st.overallStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-[4px] text-[10px] font-semibold ${
                              st.priority === 'High'
                                ? 'bg-[#fee2e2] text-[#dc2626]'
                                : st.priority === 'Medium'
                                ? 'bg-[#fef3c7] text-[#d97706]'
                                : 'bg-[#f1f5f9] text-[#64748b]'
                            }`}
                          >
                            {st.priority}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenStudentProfile(st);
                            }}
                            className="px-2.5 py-1 rounded-[5px] bg-blue-50 text-[#087cf5] hover:bg-[#087cf5] hover:text-white font-semibold text-[11px] transition-colors inline-flex items-center gap-1 shadow-xs"
                          >
                            <span>View Profile</span>
                            <span>&gt;</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-[#64748b] text-xs">
                        No students found matching your search and filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Table Footer with Summary and Scroll Guidance */}
            <div className="px-3.5 py-2.5 bg-[#f8fafc] border-t border-[#e5edf5] flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-[#64748b]">
              <div className="flex items-center gap-2">
                <span className="font-medium text-[#101d37]">
                  Showing <span className="font-bold text-[#087cf5]">{filteredStudents.length}</span> of {workflowStudents.length} students
                </span>
                <span className="hidden sm:inline text-slate-300">|</span>
                <span className="hidden sm:inline text-[11px] text-slate-500">
                  Scroll table or page vertically to view all records
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  All records active
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 2: STUDENT PROFILE WINDOW (MATCHING DESIGN LAYOUT)  */}
      {/* ======================================================== */}
      {selectedStudent && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Breadcrumb Navigation Bar & Back Button */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-0.5">
            <div className="flex items-center gap-2">
              <button
                onClick={handleBackToList}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#e2e8f0] bg-white hover:bg-slate-50 text-[12px] font-semibold text-[#101d37] shadow-xs transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Students List</span>
              </button>

              <span className="text-[12px] text-[#64748b] hidden sm:inline">
                Home &gt; Students &gt;{' '}
                <span className="font-bold text-[#101d37]">{selectedStudent.name}</span>{' '}
                <span className="text-[#64748b]">({selectedStudent.studentId})</span>
              </span>
            </div>

            {/* Quick Switcher dropdown */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#64748b] hidden md:inline">Switch Student:</span>
              <select
                value={selectedStudent.studentId}
                onChange={(e) => {
                  const target = workflowStudents.find((s) => s.studentId === e.target.value);
                  if (target) handleOpenStudentProfile(target);
                }}
                className="bg-white border border-[#e2e8f0] rounded-[5px] px-2 py-1 text-[11.5px] font-semibold text-[#101d37] outline-none"
              >
                {workflowStudents.map((st) => (
                  <option key={st.studentId} value={st.studentId}>
                    {st.name} ({st.studentId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 1. Student Master Header Profile Card */}
          <div className="bg-white rounded-[8px] border border-[#e5edf5] p-3.5 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Left Block: Avatar + Name + Core Identifiers */}
              <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                  <img
                    src={selectedStudent.avatar}
                    alt={selectedStudent.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/avatars/rahul.png';
                    }}
                    className="w-14 h-14 aspect-square rounded-full object-cover border-2 border-slate-200 shadow-xs shrink-0"
                  />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h1 className="text-[17px] font-bold text-[#101d37] leading-tight">
                      {selectedStudent.name}
                    </h1>
                    <span className="px-2 py-0.2 rounded-full bg-[#15803d] text-white text-[10.5px] font-bold leading-normal">
                      Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#64748b]">Student ID:</span>
                      <span className="font-medium text-[#101d37]">{selectedStudent.studentId}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#64748b]">Counsellor:</span>
                      <span className="font-medium text-[#101d37]">{selectedStudent.counsellor}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#64748b]">Mobile:</span>
                      <span className="font-medium text-[#101d37]">{selectedStudent.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#64748b]">Email:</span>
                      <span className="font-medium text-[#101d37]">{selectedStudent.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Block: Country & Course Details */}
              <div className="border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-4 space-y-0.5 text-[11px]">
                <div className="flex items-center gap-1.5 pb-0.5">
                  {/* Flag of Destination Country */}
                  <span className="text-base">
                    {selectedStudent.country === 'Italy' ? '🇮🇹' : selectedStudent.country === 'Germany' ? '🇩🇪' : '🇬🇧'}
                  </span>
                  <span className="font-bold text-[12.5px] text-[#101d37]">
                    {selectedStudent.country}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#64748b]">Intake:</span>
                  <span className="font-medium text-[#101d37]">{selectedStudent.intake}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#64748b]">Course Level:</span>
                  <span className="font-medium text-[#101d37]">{selectedStudent.courseLevel}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#64748b]">Preferred Course:</span>
                  <span className="font-medium text-[#101d37]">{selectedStudent.preferredCourse}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#64748b]">Target University:</span>
                  <span className="font-medium text-[#101d37]">{selectedStudent.targetUniversity}</span>
                </div>
              </div>

              {/* Right Block: Enrollment Date, Follow-up, Overall Status, Priority */}
              <div className="border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-4 flex flex-wrap items-center gap-2.5">
                {/* Enrollment Date Card */}
                <div className="space-y-1">
                  <div className="text-[10px] text-[#64748b] font-medium">Enrollment Date</div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] border border-[#e2e8f0] bg-white text-[11.5px] font-medium text-[#101d37]">
                    <Calendar className="w-3.5 h-3.5 text-[#64748b]" />
                    <span>{selectedStudent.enrollmentDate}</span>
                  </div>
                </div>

                {/* Next Follow-up Card */}
                <div className="space-y-1">
                  <div className="text-[10px] text-[#64748b] font-medium">Next Follow-up</div>
                  <button
                    onClick={() => onScheduleFollowUp && onScheduleFollowUp(studentAsLead(selectedStudent))}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] border border-[#e2e8f0] bg-white hover:bg-slate-50 text-[11.5px] font-medium text-[#101d37] transition-colors"
                    title="Reschedule Follow-up"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#64748b]" />
                    <span>{selectedStudent.nextFollowUp}</span>
                  </button>
                </div>

                {/* Overall Status Pill */}
                <div className="space-y-1">
                  <div className="text-[10px] text-[#64748b] font-medium">Overall Status</div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-[5px] bg-[#e0f2fe] text-[#0284c7] font-semibold text-[11.5px]">
                    <span>{selectedStudent.overallStatus}</span>
                    <ChevronDown className="w-3 h-3" />
                  </div>
                </div>

                {/* Priority Pill */}
                <div className="space-y-1">
                  <div className="text-[10px] text-[#64748b] font-medium">Priority</div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-[5px] bg-[#fef3c7] text-[#d97706] font-semibold text-[11.5px]">
                    <span>{selectedStudent.priority}</span>
                    <ChevronDown className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>

            {/* 12-Step Progression Stepper */}
            <div className="mt-4 pt-3 border-t border-slate-100 overflow-x-auto pb-1">
              <div className="min-w-[980px] flex items-center justify-between px-1">
                {stepperStages.map((step) => {
                  let circleClass = '';
                  let textColorClass = '';

                  if (step.color === 'green') {
                    circleClass = 'bg-[#16a34a] text-white';
                    textColorClass = 'text-[#16a34a]';
                  } else if (step.color === 'blue') {
                    circleClass = 'bg-[#087cf5] text-white';
                    textColorClass = 'text-[#087cf5]';
                  } else if (step.color === 'orange') {
                    circleClass = 'bg-[#ea580c] text-white';
                    textColorClass = 'text-[#ea580c]';
                  } else {
                    circleClass = 'border-2 border-[#94a3b8] text-[#64748b] bg-white';
                    textColorClass = 'text-[#64748b]';
                  }

                  let lineClass = 'bg-[#cbd5e1]';
                  if (step.lineColor === 'green') lineClass = 'bg-[#16a34a]';
                  else if (step.lineColor === 'blue') lineClass = 'bg-[#087cf5]';
                  else if (step.lineColor === 'orange') lineClass = 'bg-[#ea580c]';

                  return (
                    <div key={step.num} className="flex-1 flex items-center last:flex-none">
                      <button
                        onClick={() => {
                          if (step.title === 'Enrollment') setActiveSubTab('Enrolment');
                          else if (step.title === 'Documentation') setActiveSubTab('Documents');
                          else if (step.title === 'Shortlisting') setActiveSubTab('University Shortlisting');
                          else if (step.title === 'Student Approval') setActiveSubTab('Student Approval');
                          else if (step.title === 'Applications') setActiveSubTab('Applications');
                          else if (step.title === 'Offer Letter') setActiveSubTab('Offer Letters');
                          else if (step.title === 'Final University') setActiveSubTab('Final University');
                          else if (step.title === 'Scholarship') setActiveSubTab('Scholarship');
                          else if (step.title === 'Pre-Enrolment') setActiveSubTab('Pre-Enrolment');
                          else if (step.title === 'DoV / CIMEA') setActiveSubTab('DoV / CIMEA');
                          else if (step.title === 'Visa Process') setActiveSubTab('Visa');
                          else if (step.title === 'Travel & Arrival') setActiveSubTab('Pre-Departure');
                        }}
                        className="flex flex-col items-center group cursor-pointer shrink-0 focus:outline-none"
                        title={`Click to view ${step.title}`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shadow-xs transition-transform group-hover:scale-105 ${circleClass}`}
                        >
                          {step.num}
                        </div>
                        <div className="text-[10px] font-semibold text-[#101d37] whitespace-nowrap mt-1 leading-tight text-center">
                          {step.title}
                        </div>
                        <div className={`text-[9px] font-semibold whitespace-nowrap leading-tight text-center ${textColorClass}`}>
                          {step.status}
                        </div>
                      </button>

                      {!step.isLast ? (
                        <div className={`flex-1 h-[2px] mx-1.5 self-center -mt-6 ${lineClass}`} />
                      ) : (
                        <div className="ml-1 self-center -mt-6 text-[#94a3b8] text-[11px]">
                          &gt;
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Workflow Pipeline Control — push this profile to the next stage workspace */}
          {selectedPipelineStage && (
            <div className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 text-[12px]">
                <span className="text-[#64748b]">Current pipeline stage:</span>
                <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${selectedPipelineStage.badgeClass}`}>
                  {selectedPipelineStage.label}
                </span>
                {selectedNextStage ? (
                  <>
                    <span className="text-[#94a3b8]">→</span>
                    <span className="text-[#64748b]">Next:</span>
                    <span className="font-semibold text-[#101d37]">{selectedNextStage.label}</span>
                  </>
                ) : (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    End of current pipeline
                  </span>
                )}
              </div>
              {selectedNextStage && (
                <button
                  onClick={handleAdvanceStage}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[#087cf5] hover:bg-[#006ee6] text-white text-[11.5px] font-semibold shadow-xs transition-colors"
                >
                  <span>Move to {selectedNextStage.label}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* 2. Horizontal Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[12px] scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeSubTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveSubTab(tab);
                    if (tab !== 'Overview' && onNavigate) {
                      if (tab === 'Documents') onNavigate('documentation');
                      else if (tab === 'University Shortlisting') onNavigate('university-shortlisting');
                      else if (tab === 'Student Approval') onNavigate('student-approval');
                      else if (tab === 'Applications') onNavigate('applications');
                      else if (tab === 'Offer Letters') onNavigate('offers');
                      else if (tab === 'Final University') onNavigate('final-university');
                      else if (tab === 'Scholarship') onNavigate('scholarship');
                      else if (tab === 'Pre-Enrolment') onNavigate('pre-enrolment');
                      else if (tab === 'DoV / CIMEA') onNavigate('dov-cimea');
                      else if (tab === 'Visa') onNavigate('visa-process');
                      else if (tab === 'Pre-Departure') onNavigate('pre-departure');
                      else if (tab === 'Timeline') onNavigate('dashboard');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-[5px] transition-all whitespace-nowrap font-medium ${
                    isActive
                      ? 'bg-[#087cf5] text-white font-semibold shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-[#52627a] border border-[#e2e8f0]'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* 3. Main Dashboard Content Grid */}
          <div className="space-y-3">
            {/* ROW 1: 4 Cards (Personal Details, Academic Details, Program Preferences, Payment & Agreement) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 items-stretch">
              {/* Card 1: Personal Details */}
              <div className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold text-[#101d37] text-[12.5px]">
                      <FileText className="w-3.5 h-3.5 text-[#087cf5]" />
                      <span>Personal Details</span>
                    </div>
                    <button
                      onClick={() => onEditLead && onEditLead(studentAsLead(selectedStudent))}
                      className="flex items-center gap-1 text-[11px] text-[#087cf5] hover:underline font-semibold"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="pt-2 space-y-1.5 text-[11px]">
                    <div className="flex">
                      <span className="w-24 text-[#64748b] shrink-0">Full Name</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">{selectedStudent.name}</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 text-[#64748b] shrink-0">Date of Birth</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">{selectedStudent.dob}</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 text-[#64748b] shrink-0">Nationality</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">{selectedStudent.nationality}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-[#64748b] shrink-0">Mobile</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37] flex items-center gap-1">
                        {selectedStudent.phone}
                        <button
                          onClick={() => onOpenWhatsApp && onOpenWhatsApp(studentAsLead(selectedStudent))}
                          title="Send WhatsApp"
                          className="text-[#22c55e] hover:opacity-80"
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.044-2.029-.533-1.428-.592-2.348-2.04-2.42-2.137-.071-.097-.58-.771-.58-1.469 0-.698.362-1.041.49-1.185.127-.143.281-.179.375-.179.094 0 .188.001.27.006.086.004.202-.033.315.241.119.287.406.994.442 1.066.035.072.059.156.012.25-.047.093-.071.152-.142.235-.07.083-.148.185-.212.249-.071.071-.145.148-.062.291.082.143.366.604.786.978.54.482.996.632 1.138.703.142.071.226.059.31-.036.084-.095.361-.421.457-.565.095-.144.19-.119.321-.072.131.048.832.392.975.464.143.071.238.107.273.167.036.059.036.345-.108.75z" />
                          </svg>
                        </button>
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-24 text-[#64748b] shrink-0">Email</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37] truncate">{selectedStudent.email}</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 text-[#64748b] shrink-0">Address</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">{selectedStudent.address}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-[#64748b] shrink-0">Passport</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#15803d] flex items-center gap-1">
                        Available (Valid till 2028)
                        <CheckCircle2 className="w-3.5 h-3.5 fill-[#15803d] text-white" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Academic Details */}
              <div className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold text-[#101d37] text-[12.5px]">
                      <GraduationCap className="w-3.5 h-3.5 text-[#087cf5]" />
                      <span>Academic Details</span>
                    </div>
                    <button
                      onClick={() => onEditLead && onEditLead(studentAsLead(selectedStudent))}
                      className="flex items-center gap-1 text-[11px] text-[#087cf5] hover:underline font-semibold"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="pt-2 space-y-1.5 text-[11px]">
                    <div className="flex">
                      <span className="w-32 text-[#64748b] shrink-0">Highest Qualification</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">
                        {selectedStudent.academic.highestQualification}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-[#64748b] shrink-0">University</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">
                        {selectedStudent.academic.university}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-[#64748b] shrink-0">Passing Year</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">
                        {selectedStudent.academic.passingYear}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-[#64748b] shrink-0">CGPA</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">
                        {selectedStudent.academic.cgpa}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-[#64748b] shrink-0">English Test</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">
                        {selectedStudent.academic.englishTest}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-[#64748b] shrink-0">Work Experience</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">
                        {selectedStudent.academic.workExperience}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-[#64748b] shrink-0">Budget</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">
                        {selectedStudent.academic.budget}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Program Preferences */}
              <div className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold text-[#101d37] text-[12.5px]">
                      <MapPin className="w-3.5 h-3.5 text-[#087cf5]" />
                      <span>Program Preferences</span>
                    </div>
                    <button
                      onClick={() => onEditLead && onEditLead(studentAsLead(selectedStudent))}
                      className="flex items-center gap-1 text-[11px] text-[#087cf5] hover:underline font-semibold"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="pt-2 space-y-1.5 text-[11px]">
                    <div className="flex">
                      <span className="w-28 text-[#64748b] shrink-0">Country</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">{selectedStudent.country}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-[#64748b] shrink-0">Course Level</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">{selectedStudent.courseLevel}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-[#64748b] shrink-0">Preferred Course</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">{selectedStudent.preferredCourse}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-[#64748b] shrink-0">Alternative Courses</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <div className="font-medium text-[#101d37]">
                        {selectedStudent.alternativeCourses.map((c, i) => (
                          <div key={i}>{c}</div>
                        ))}
                      </div>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-[#64748b] shrink-0">Target Intake</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">{selectedStudent.intake}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-[#64748b] shrink-0">Intake Deadline</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">Varies by University</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-[#64748b] shrink-0">Notes</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">Interested in scholarship</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Payment & Agreement */}
              <div className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold text-[#101d37] text-[12.5px]">
                      <CreditCard className="w-3.5 h-3.5 text-[#087cf5]" />
                      <span>Payment & Agreement</span>
                    </div>
                    <button
                      onClick={() => onEditLead && onEditLead(studentAsLead(selectedStudent))}
                      className="flex items-center gap-1 text-[11px] text-[#087cf5] hover:underline font-semibold"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="pt-2 space-y-1.5 text-[11px]">
                    <div className="flex">
                      <span className="w-28 text-[#64748b] shrink-0">Service Package</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">
                        {selectedStudent.payment.servicePackage}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-28 text-[#64748b] shrink-0">Agreement Status</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="px-1.5 py-0.2 rounded bg-[#dcfce7] text-[#15803d] font-semibold text-[10px]">
                        {selectedStudent.payment.agreementStatus}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-[#64748b] shrink-0">Total Fee</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-bold text-[#101d37]">
                        {selectedStudent.payment.totalFee}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-[#64748b] shrink-0">Amount Paid</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-bold text-[#15803d]">
                        {selectedStudent.payment.amountPaid}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-[#64748b] shrink-0">Balance</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-bold text-[#dc2626]">
                        {selectedStudent.payment.balance}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-[#64748b] shrink-0">Payment Schedule</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <div className="font-medium text-[#101d37] space-y-0.5">
                        {selectedStudent.payment.schedule.map((item, idx) => (
                          <div key={idx}>{item}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2: 2 Cards (University Applications & Offer Letters) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
              {/* Left Table: University Applications (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold text-[#101d37] text-[12.5px]">
                      <GraduationCap className="w-3.5 h-3.5 text-[#087cf5]" />
                      <span>University Applications</span>
                    </div>
                    <button
                      onClick={() => {
                        if (onNavigate) onNavigate('applications');
                        else setToastMessage('Redirecting to Application manager...');
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-[5px] bg-[#087cf5] hover:bg-[#006ee6] text-white text-[11px] font-semibold transition-colors shadow-xs"
                    >
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                      <span>Add Application</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto pt-1">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="border-b border-slate-100 text-[#64748b] font-semibold">
                          <th className="py-1.5 px-2">#</th>
                          <th className="py-1.5 px-2">University Name</th>
                          <th className="py-1.5 px-2">Program</th>
                          <th className="py-1.5 px-2">Intake</th>
                          <th className="py-1.5 px-2">Application Date</th>
                          <th className="py-1.5 px-2">Status</th>
                          <th className="py-1.5 px-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {selectedStudent.applications.map((app) => (
                          <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2 px-2 text-[#64748b]">{app.id}</td>
                            <td className="py-2 px-2 font-medium text-[#101d37]">{app.university}</td>
                            <td className="py-2 px-2 text-[#52627a]">{app.program}</td>
                            <td className="py-2 px-2 text-[#52627a]">{app.intake}</td>
                            <td className="py-2 px-2 text-[#52627a]">{app.date}</td>
                            <td className="py-2 px-2">
                              <span className={`px-2 py-0.5 rounded-[4px] font-semibold text-[10.5px] ${app.statusColor}`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-right">
                              <button
                                onClick={() => onNavigate && onNavigate('applications')}
                                className="text-[#087cf5] hover:underline font-semibold"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Table: Offer Letters (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold text-[#101d37] text-[12.5px]">
                      <Mail className="w-3.5 h-3.5 text-[#087cf5]" />
                      <span>Offer Letters</span>
                    </div>
                    <button
                      onClick={() => onNavigate && onNavigate('applications')}
                      className="text-[11px] text-[#087cf5] hover:underline font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  <div className="overflow-x-auto pt-1">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="border-b border-slate-100 text-[#64748b] font-semibold">
                          <th className="py-1.5 px-2">University</th>
                          <th className="py-1.5 px-2">Offer Date</th>
                          <th className="py-1.5 px-2">Offer Type</th>
                          <th className="py-1.5 px-2">Conditions</th>
                          <th className="py-1.5 px-2">Status</th>
                          <th className="py-1.5 px-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {selectedStudent.offers.map((off, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2 px-2 font-medium text-[#101d37]">{off.university}</td>
                            <td className="py-2 px-2 text-[#52627a]">{off.date}</td>
                            <td className="py-2 px-2 text-[#52627a]">{off.type}</td>
                            <td className="py-2 px-2 text-[#52627a] leading-tight">
                              {off.conditions.map((c, i) => (
                                <div key={i}>{c}</div>
                              ))}
                            </td>
                            <td className="py-2 px-2">
                              <span className={`px-2 py-0.5 rounded-[4px] font-semibold text-[10.5px] ${off.statusColor}`}>
                                {off.status}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-right">
                              <button
                                onClick={() => onNavigate && onNavigate('applications')}
                                className="text-[#087cf5] hover:underline font-semibold"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 3: 4 Columns (Document Checklist, Scholarship & Pre-Enrolment, DoV & Visa, Recent Activities / Timeline) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 items-start">
              {/* Col 1: Document Checklist */}
              <div className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 font-bold text-[#101d37] text-[12.5px]">
                    <FileText className="w-3.5 h-3.5 text-[#087cf5]" />
                    <span>Document Checklist</span>
                  </div>
                  <button
                    onClick={() => onNavigate && onNavigate('documentation')}
                    className="text-[11px] text-[#087cf5] hover:underline font-semibold"
                  >
                    View All
                  </button>
                </div>

                <div className="overflow-x-auto pt-1">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-[#64748b] font-semibold">
                        <th className="py-1 px-1.5">Document</th>
                        <th className="py-1 px-1.5">Status</th>
                        <th className="py-1 px-1.5">Upload Date</th>
                        <th className="py-1 px-1.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {selectedStudent.documents.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-1.5 px-1.5 font-medium text-[#101d37]">{row.name}</td>
                          <td className="py-1.5 px-1.5">
                            <span className="px-1.5 py-0.2 rounded bg-[#dcfce7] text-[#15803d] font-semibold text-[10px]">
                              {row.status}
                            </span>
                          </td>
                          <td className="py-1.5 px-1.5 text-[#52627a]">{row.date}</td>
                          <td className="py-1.5 px-1.5 text-right">
                            <button
                              onClick={() => onNavigate && onNavigate('documentation')}
                              className="text-[#087cf5] hover:underline font-semibold"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Col 2: Stacked Cards (Scholarship Process & Pre-Enrolment Universitaly) */}
              <div className="space-y-3">
                {/* Top: Scholarship Process */}
                <div className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold text-[#101d37] text-[12.5px]">
                      <Lightbulb className="w-3.5 h-3.5 text-[#087cf5]" />
                      <span>Scholarship Process</span>
                    </div>
                    <button
                      onClick={() => setToastMessage('Scholarship tracker opened')}
                      className="text-[11px] text-[#087cf5] hover:underline font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  <div className="overflow-x-auto pt-1">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="border-b border-slate-100 text-[#64748b] font-semibold">
                          <th className="py-1 px-1.5">Scholarship Name</th>
                          <th className="py-1 px-1.5">Deadline</th>
                          <th className="py-1 px-1.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {selectedStudent.scholarships.map((sch, i) => (
                          <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-1.5 px-1.5 font-medium text-[#101d37]">{sch.name}</td>
                            <td className="py-1.5 px-1.5 text-[#52627a]">{sch.deadline}</td>
                            <td className="py-1.5 px-1.5 text-right">
                              <span className={`px-1.5 py-0.2 rounded font-semibold text-[10px] ${sch.statusColor}`}>
                                {sch.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bottom: Pre-Enrolment (Universitaly) */}
                <div className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold text-[#101d37] text-[12.5px]">
                      <Monitor className="w-3.5 h-3.5 text-[#087cf5]" />
                      <span>Pre-Enrolment (Universitaly)</span>
                    </div>
                    <button
                      onClick={() => setToastMessage('Universitaly portal sync active')}
                      className="text-[11px] text-[#087cf5] hover:underline font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  <div className="overflow-x-auto pt-1">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="border-b border-slate-100 text-[#64748b] font-semibold">
                          <th className="py-1 px-1.5">Step</th>
                          <th className="py-1 px-1.5">Status</th>
                          <th className="py-1 px-1.5">Date</th>
                          <th className="py-1 px-1.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {selectedStudent.preEnrolment.map((pe, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-1.5 px-1.5 font-medium text-[#101d37]">{pe.step}</td>
                            <td className="py-1.5 px-1.5">
                              <span
                                className={`px-1.5 py-0.2 rounded font-semibold text-[10px] ${
                                  pe.status === 'Completed'
                                    ? 'bg-[#dcfce7] text-[#15803d]'
                                    : 'bg-[#fef3c7] text-[#d97706]'
                                }`}
                              >
                                {pe.status}
                              </span>
                            </td>
                            <td className="py-1.5 px-1.5 text-[#52627a]">{pe.date}</td>
                            <td className="py-1.5 px-1.5 text-right">
                              {pe.date !== '-' ? (
                                <button
                                  onClick={() => setToastMessage(`Viewing ${pe.step}`)}
                                  className="text-[#087cf5] hover:underline font-semibold"
                                >
                                  View
                                </button>
                              ) : (
                                <span className="text-[#64748b]">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Col 3: Stacked Cards (DoV / CIMEA & Visa Process) */}
              <div className="space-y-3">
                {/* Top: DoV / CIMEA */}
                <div className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold text-[#101d37] text-[12.5px]">
                      <FileText className="w-3.5 h-3.5 text-[#087cf5]" />
                      <span>DoV / CIMEA</span>
                    </div>
                    <button
                      onClick={() => setToastMessage('DoV verification ledger')}
                      className="text-[11px] text-[#087cf5] hover:underline font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  <div className="pt-2 space-y-1.5 text-[11px]">
                    <div className="flex items-center">
                      <span className="w-36 text-[#64748b] shrink-0">Process Type</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">{selectedStudent.dov.processType}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-36 text-[#64748b] shrink-0">Status</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="px-1.5 py-0.2 rounded font-semibold text-[10px] bg-[#f1f5f9] text-[#64748b]">
                        {selectedStudent.dov.status}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-36 text-[#64748b] shrink-0">Required By Documents</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">{selectedStudent.dov.requiredBy}</span>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => setToastMessage('DoV process initiated with Embassy.')}
                        className="w-full py-1.5 rounded-[5px] bg-[#087cf5] hover:bg-[#006ee6] text-white text-[11.5px] font-semibold transition-colors shadow-xs"
                      >
                        Start DoV Process
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom: Visa Process */}
                <div className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold text-[#101d37] text-[12.5px]">
                      <Plane className="w-3.5 h-3.5 text-[#087cf5]" />
                      <span>Visa Process</span>
                    </div>
                    <button
                      onClick={() => setToastMessage('Visa appointment console')}
                      className="text-[11px] text-[#087cf5] hover:underline font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  <div className="pt-2 space-y-1.5 text-[11px]">
                    <div className="flex items-center">
                      <span className="w-32 text-[#64748b] shrink-0">Appointment Date</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="text-[#64748b]">{selectedStudent.visa.appointmentDate}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-32 text-[#64748b] shrink-0">Application Status</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="px-1.5 py-0.2 rounded font-semibold text-[10px] bg-[#f1f5f9] text-[#64748b]">
                        {selectedStudent.visa.status}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-32 text-[#64748b] shrink-0">Visa Type</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">{selectedStudent.visa.visaType}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-32 text-[#64748b] shrink-0">VFS Reference</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="text-[#64748b]">{selectedStudent.visa.vfsReference}</span>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => setToastMessage('Visa booking pipeline opened with VFS.')}
                        className="w-full py-1.5 rounded-[5px] bg-[#087cf5] hover:bg-[#006ee6] text-white text-[11.5px] font-semibold transition-colors shadow-xs"
                      >
                        Start Visa Process
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Col 4: Recent Activities / Timeline */}
              <div className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 font-bold text-[#101d37] text-[12.5px]">
                    <Clock className="w-3.5 h-3.5 text-[#087cf5]" />
                    <span>Recent Activities / Timeline</span>
                  </div>
                  <button
                    onClick={() => onNavigate && onNavigate('dashboard')}
                    className="text-[11px] text-[#087cf5] hover:underline font-semibold"
                  >
                    View All
                  </button>
                </div>

                <div className="pt-2 space-y-3 text-[11px]">
                  {selectedStudent.timeline.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.dotColor} mt-1 shrink-0`} />
                      <div className="leading-snug">
                        <span className="text-[#64748b]">{item.time} : </span>
                        <span className="font-medium text-[#101d37]">{item.text} </span>
                        <span className="text-[#64748b]">(by: {item.team})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
