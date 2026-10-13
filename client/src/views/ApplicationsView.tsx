import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye as EyeIcon, Search, Filter } from 'lucide-react';
import { StudentRecord, INITIAL_STUDENTS } from '../services/studentsData';
import { WorkflowStageBanner } from '../components/workflow/WorkflowStageBanner';
import { PipelineStage, getStageById } from '../context/WorkflowContext';
import { ActionConfirmModal } from '../components/modals/ActionConfirmModal';

interface ApplicationsViewProps {
  students?: StudentRecord[];
  onAdvanceStage?: (studentId: string, targetStageIdOrNumber?: any) => PipelineStage | null;
  onNavigate?: (route: string) => void;
}
import {
  FileText,
  Edit3,
  Send,
  Clock,
  User,
  GraduationCap,
  Calendar,
  Landmark,
  TrendingUp,
  ExternalLink,
  CheckCircle2,
  Check,
  Circle,
  MoreVertical,
  Plus,
  Upload,
  Users,
  Trophy,
  CreditCard,
  X,
  Eye,
  FileCheck,
  LayoutGrid,
  List,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface ApplicationRow {
  id: string;
  university: string;
  logo: string;
  country: string;
  course: string;
  deadline: string;
  appFee: string;
  status: 'Form Completed' | 'Draft' | 'Docs Uploaded' | 'Submitted' | 'Under Review' | 'Offer';
  executiveName: string;
  executiveAvatar: string;
  lastUpdatedDate: string;
  lastUpdatedTime: string;
  actionText: string;
  currentStepIndex: number; // 1 to 6
  qsRank: string;
  uniType: string;
}

const INITIAL_APPLICATIONS: ApplicationRow[] = [
  {
    id: 'padova',
    university: 'University of Padova',
    logo: '/logo_padova.png',
    country: 'Italy',
    course: 'MSc Computer Science',
    deadline: '15 Jan 2026',
    appFee: '€80',
    status: 'Form Completed',
    executiveName: 'Neha Kapoor',
    executiveAvatar: '/avatars/neha_kapoor.png',
    lastUpdatedDate: '12 Nov 2025',
    lastUpdatedTime: '10:30 AM',
    actionText: 'View',
    currentStepIndex: 2,
    qsRank: '#236',
    uniType: 'Public University',
  },
  {
    id: 'torino',
    university: 'Politecnico di Torino',
    logo: '/logo_torino.png',
    country: 'Italy',
    course: 'MSc Artificial Intelligence',
    deadline: '28 Feb 2026',
    appFee: '€100',
    status: 'Draft',
    executiveName: 'Amit Verma',
    executiveAvatar: '/avatars/amit_verma.png',
    lastUpdatedDate: '10 Nov 2025',
    lastUpdatedTime: '04:15 PM',
    actionText: 'Continue',
    currentStepIndex: 1,
    qsRank: '#252',
    uniType: 'Public University',
  },
  {
    id: 'bologna',
    university: 'University of Bologna',
    logo: '/logo_bologna.png',
    country: 'Italy',
    course: 'MSc Computer Science',
    deadline: '30 Jan 2026',
    appFee: '€80',
    status: 'Docs Uploaded',
    executiveName: 'Neha Kapoor',
    executiveAvatar: '/avatars/neha_kapoor.png',
    lastUpdatedDate: '11 Nov 2025',
    lastUpdatedTime: '02:20 PM',
    actionText: 'Submit',
    currentStepIndex: 3,
    qsRank: '#133',
    uniType: 'Public University',
  },
  {
    id: 'sapienza',
    university: 'Sapienza University of Rome',
    logo: '/logo_sapienza.png',
    country: 'Italy',
    course: 'MSc Data Science',
    deadline: '15 Mar 2026',
    appFee: '€80',
    status: 'Submitted',
    executiveName: 'Rohan Shetty',
    executiveAvatar: '/avatars/rohan_shetty.png',
    lastUpdatedDate: '09 Nov 2025',
    lastUpdatedTime: '11:10 AM',
    actionText: 'Track',
    currentStepIndex: 4,
    qsRank: '#134',
    uniType: 'Public University',
  },
  {
    id: 'milan',
    university: 'Università di Milano',
    logo: '/logo_milan.png',
    country: 'Italy',
    course: 'MSc Computer Science',
    deadline: '28 Feb 2026',
    appFee: '€100',
    status: 'Under Review',
    executiveName: 'Amit Verma',
    executiveAvatar: '/avatars/amit_verma.png',
    lastUpdatedDate: '08 Nov 2025',
    lastUpdatedTime: '03:45 PM',
    actionText: 'Track',
    currentStepIndex: 5,
    qsRank: '#276',
    uniType: 'Public University',
  },
];

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  students,
  onAdvanceStage,
  onNavigate,
}) => {
  // Workflow-sourced students for this stage (falls back to the full directory for the sample UI)
  const studentList = students && students.length > 0 ? students : INITIAL_STUDENTS;

  // Navigation State: Directory List vs Student Application Profile
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  // Directory Filters & View Mode
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('matrix');
  const [dirSearchQuery, setDirSearchQuery] = useState('');
  const [dirCountryFilter, setDirCountryFilter] = useState('All');
  const [dirStatusFilter, setDirStatusFilter] = useState('All');
  const [dirTabFilter, setDirTabFilter] = useState<'All' | 'Offers' | 'Submitted' | 'Draft'>('All');
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

  // Deep-linking support
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#applications') && hash.includes('?id=')) {
        const idParam = hash.split('?id=')[1];
        const match = studentList.find(
          (s) => s.studentId === idParam || s.id === idParam || s.name.toLowerCase().includes(idParam.toLowerCase())
        );
        if (match) setSelectedStudent(match);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [studentList]);

  const handleOpenStudent = (st: StudentRecord) => {
    setSelectedStudent(st);
    window.location.hash = `applications?id=${st.studentId}`;
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
    window.location.hash = 'applications';
  };

  // Helper for student application summary
  const getAppSummary = (st: StudentRecord) => {
    if (st.stageNumber >= 12) return { status: 'Enrolled', count: '4 Applied • Visa Issued', color: 'bg-purple-50 text-purple-700 border-purple-200' };
    if (st.stageNumber >= 6) return { status: 'Offer Received', count: `${st.applications.length || 3} Applied • ${st.offers.length || 1} Offer`, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (st.stageNumber >= 5) return { status: 'Submitted', count: `${st.applications.length || 2} In Review`, color: 'bg-blue-50 text-[#087cf5] border-blue-200' };
    return { status: 'In Draft', count: '1 Draft Form', color: 'bg-amber-50 text-amber-700 border-amber-200' };
  };

  // Helper for rich multi-portal submission tracker
  const getStudentPortalApplications = (st: StudentRecord) => {
    const stage = st.stageNumber;
    if (st.country === 'Italy') {
      return {
        portals: [
          { name: 'Uni Padova', ref: 'UP-2026-8941', status: 'Submitted', badge: 'bg-blue-50 text-[#087cf5] border-blue-200', fee: '€80 Paid', feeOk: true },
          { name: 'Uni Bologna', ref: 'UB-2026-1102', status: stage >= 6 ? 'Offer Issued 🎉' : 'Under Review', badge: stage >= 6 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200', fee: '€50 Paid', feeOk: true },
          { name: 'PoliMi', ref: 'POL-2026-4419', status: 'Under Review', badge: 'bg-purple-50 text-purple-700 border-purple-200', fee: '€100 Paid', feeOk: true },
        ],
        feeTotal: '€230 Paid',
        receiptsStatus: '3/3 Stamped',
        decisions: { offers: stage >= 6 ? 1 : 0, underReview: stage >= 6 ? 2 : 3, rejections: 0 },
        nextMilestone: stage >= 6 ? 'Accept Bologna Offer by 28 Feb' : 'Padova Decision: 15 Mar',
        daysLeft: 14,
        stageLabel: stage >= 12 ? 'Enrolled' : stage >= 6 ? 'Offer Received' : stage >= 5 ? 'Submitted' : 'Drafting',
        stageBadge: stage >= 6 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-[#087cf5] border-blue-200',
      };
    }
    if (st.country === 'Germany') {
      return {
        portals: [
          { name: 'Uni-Assist (TUM)', ref: 'UA-DE-5591', status: 'VPD Verified', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', fee: '€75 Paid', feeOk: true },
          { name: 'RWTH Direct', ref: 'RWTH-9941', status: 'Submitted', badge: 'bg-blue-50 text-[#087cf5] border-blue-200', fee: 'Free (€0)', feeOk: true },
        ],
        feeTotal: '€75 Paid',
        receiptsStatus: '1/1 Verified',
        decisions: { offers: 0, underReview: 2, rejections: 0 },
        nextMilestone: 'TUM Assessment on 25 Mar',
        daysLeft: 39,
        stageLabel: 'Under Review',
        stageBadge: 'bg-blue-50 text-[#087cf5] border-blue-200',
      };
    }
    if (st.country === 'UK') {
      return {
        portals: [
          { name: 'Univ. Manchester', ref: 'UK-MAN-2026', status: stage >= 6 ? 'Conditional Offer' : 'Under Review', badge: stage >= 6 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-[#087cf5] border-blue-200', fee: '£60 Paid', feeOk: true },
          { name: 'King’s College', ref: 'KCL-8812', status: 'Under Review', badge: 'bg-purple-50 text-purple-700 border-purple-200', fee: '£75 Paid', feeOk: true },
        ],
        feeTotal: '£135 Paid',
        receiptsStatus: '2/2 Stamped',
        decisions: { offers: stage >= 6 ? 1 : 0, underReview: 1, rejections: 0 },
        nextMilestone: 'Submit Degree Proof by 15 May',
        daysLeft: 64,
        stageLabel: stage >= 6 ? 'Conditional Offer' : 'Submitted',
        stageBadge: stage >= 6 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-[#087cf5] border-blue-200',
      };
    }
    return {
      portals: [
        { name: 'Etudes en France', ref: 'EEF-FR-3021', status: 'Submitted', badge: 'bg-blue-50 text-[#087cf5] border-blue-200', fee: '€100 Paid', feeOk: true },
        { name: 'Paris-Saclay', ref: 'UPS-9102', status: 'Under Review', badge: 'bg-purple-50 text-purple-700 border-purple-200', fee: '€50 Paid', feeOk: true },
      ],
      feeTotal: '€150 Paid',
      receiptsStatus: '2/2 Stamped',
      decisions: { offers: 0, underReview: 2, rejections: 0 },
      nextMilestone: 'Campus France Interview: 20 Mar',
      daysLeft: 22,
      stageLabel: 'In Evaluation',
      stageBadge: 'bg-blue-50 text-[#087cf5] border-blue-200',
    };
  };

  const dirFilteredStudents = studentList.filter((st) => {
    const info = getAppSummary(st);
    const matchesSearch =
      st.name.toLowerCase().includes(dirSearchQuery.toLowerCase()) ||
      st.studentId.toLowerCase().includes(dirSearchQuery.toLowerCase()) ||
      st.phone.includes(dirSearchQuery) ||
      st.preferredCourse.toLowerCase().includes(dirSearchQuery.toLowerCase()) ||
      st.targetUniversity.toLowerCase().includes(dirSearchQuery.toLowerCase());

    const matchesCountry = dirCountryFilter === 'All' || st.country === dirCountryFilter;
    const matchesStatus = dirStatusFilter === 'All' || info.status === dirStatusFilter;

    let matchesTab = true;
    if (dirTabFilter === 'Offers') matchesTab = info.status === 'Offer Received' || info.status === 'Enrolled';
    else if (dirTabFilter === 'Submitted') matchesTab = info.status === 'Submitted';
    else if (dirTabFilter === 'Draft') matchesTab = info.status === 'In Draft';

    return matchesSearch && matchesCountry && matchesStatus && matchesTab;
  });

  const appCounts = {
    All: studentList.length,
    Offers: studentList.filter((st) => getAppSummary(st).status === 'Offer Received' || getAppSummary(st).status === 'Enrolled').length,
    Submitted: studentList.filter((st) => getAppSummary(st).status === 'Submitted').length,
    Draft: studentList.filter((st) => getAppSummary(st).status === 'In Draft').length,
  };
  const [applications, setApplications] = useState<ApplicationRow[]>(INITIAL_APPLICATIONS);
  const [selectedAppId, setSelectedAppId] = useState<string>('padova');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [showStartAppModal, setShowStartAppModal] = useState(false);
  const [showUploadDocsModal, setShowUploadDocsModal] = useState(false);

  const selectedApp =
    applications.find((a) => a.id === selectedAppId) || applications[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const steps = [
    { num: 1, title: 'Draft' },
    { num: 2, title: 'Form Completed' },
    { num: 3, title: 'Documents Uploaded' },
    { num: 4, title: 'Submitted' },
    { num: 5, title: 'Under Review' },
    { num: 6, title: 'Offer' },
  ];

  const [requiredDocs, setRequiredDocs] = useState([
    { id: 1, name: 'Passport (Bio Page)', status: 'Uploaded' },
    { id: 2, name: 'Academic Transcripts', status: 'Verified' },
    { id: 3, name: 'Statement of Purpose (SOP)', status: 'Uploaded' },
    { id: 4, name: 'Letter of Recommendation (LOR)', status: 'Pending' },
    { id: 5, name: 'Curriculum Vitae (CV)', status: 'Uploaded' },
    { id: 6, name: 'IELTS Score Report', status: 'Pending' },
  ]);

  const handleToggleDocStatus = (id: number) => {
    setRequiredDocs((prev) =>
      prev.map((doc) => {
        if (doc.id === id) {
          const next = doc.status === 'Pending' ? 'Uploaded' : 'Pending';
          return { ...doc, status: next };
        }
        return doc;
      })
    );
  };

  const timelineEvents = [
    { time: '12 Nov 2025, 10:30 AM', event: 'University form completed', active: true },
    { time: '11 Nov 2025, 02:20 PM', event: 'SOP uploaded', active: true },
    { time: '10 Nov 2025, 04:15 PM', event: 'Application started', active: true },
    { time: '08 Nov 2025, 11:10 AM', event: 'Documents uploaded', active: true },
    { time: '08 Nov 2025, 10:00 AM', event: 'Waiting for review', active: false },
  ];

    return (
    <div className="p-3.5 pb-16 space-y-3 max-w-[1536px] mx-auto font-sans text-[#101d37] min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-5 z-50 bg-[#07182c] text-white text-xs px-4 py-2.5 rounded-lg shadow-xl border border-blue-500/30 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-3 text-slate-400 hover:text-white font-bold">
            ×
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 1: APPLICATIONS DIRECTORY (STUDENTS LIST)          */}
      {/* ======================================================== */}
      {!selectedStudent && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#087cf5] text-white flex items-center justify-center shadow-xs">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[17px] font-bold text-[#101d37] leading-tight">Applications & Submission Tracker</h1>
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Multi-Portal Sync
                  </span>
                </div>
                <p className="text-[11.5px] text-[#64748b] leading-tight mt-0.5">
                  Track official university submissions: 🏛️ UniPadova • 🏛️ Uni Bologna • 🏛️ PoliMi • 🏛️ Sapienza • Fees & Decision Ledger
                </p>
              </div>
            </div>

            <div className="text-[11.5px] text-[#64748b] hidden sm:inline">
              Home &gt; <span className="font-semibold text-[#101d37]">Applications Directory</span>
            </div>
          </div>

          {/* Workflow Pipeline — profiles that travelled here from University Shortlisting */}
          <WorkflowStageBanner
            stage={getStageById('applications')}
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
                  title: 'Forward to Offer Letter Received',
                  studentName: targetStudent.name,
                  studentId: targetStudent.studentId,
                  studentAvatar: targetStudent.avatar,
                  country: targetStudent.country,
                  currentStageName: 'Stage 5: Application',
                  targetStageName: 'Stage 6: Offer Letter Received',
                  description: `Advance ${targetStudent.name} from Applications to Stage 6 (Offer Letter Received) to log university decisions and acceptance terms.`,
                  confirmLabel: 'Confirm & Forward to Stage 6',
                  variant: 'success',
                  onConfirm: () => {
                    if (onAdvanceStage) onAdvanceStage(id, 'offer-letters');
                    if (onNavigate) onNavigate(`offer-letters?id=${targetStudent.studentId}`);
                  },
                });
              } else if (onAdvanceStage) {
                onAdvanceStage(id);
              }
            }}
            onEmptyAction={() => onNavigate && onNavigate('university-shortlisting')}
            emptyActionLabel="Go to Shortlisting"
            emptyHint="No students have reached the Applications stage yet."
          />

          {/* 5 KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Total Applicants</span>
              <div className="text-[19px] font-bold text-[#101d37] mt-0.5">{appCounts.All}</div>
              <span className="text-[10px] text-[#087cf5] font-semibold">● Active Applications</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Offers Issued</span>
              <div className="text-[19px] font-bold text-emerald-600 mt-0.5">{appCounts.Offers}</div>
              <span className="text-[10px] text-emerald-600 font-semibold">🎉 Admits Confirmed</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Submitted & Under Review</span>
              <div className="text-[19px] font-bold text-[#087cf5] mt-0.5">{appCounts.Submitted}</div>
              <span className="text-[10px] text-[#64748b]">Faculty evaluation</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Drafting & Portal Prep</span>
              <div className="text-[19px] font-bold text-[#ea580c] mt-0.5">{appCounts.Draft}</div>
              <span className="text-[10px] text-[#ea580c] font-medium">Form entry stage</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs col-span-2 sm:col-span-1">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Enrolled / Visa Ready</span>
              <div className="text-[19px] font-bold text-purple-600 mt-0.5">
                {studentList.filter((s) => s.stageNumber >= 10).length}
              </div>
              <span className="text-[10px] text-purple-600 font-medium">Deposit confirmed</span>
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              {/* Quick Tab Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11.5px]">
                {[
                  { id: 'All', label: `All Applicants (${appCounts.All})` },
                  { id: 'Offers', label: `Offers Issued (${appCounts.Offers})` },
                  { id: 'Submitted', label: `Under Review (${appCounts.Submitted})` },
                  { id: 'Draft', label: `In Draft (${appCounts.Draft})` },
                ].map((tb) => (
                  <button
                    key={tb.id}
                    onClick={() => setDirTabFilter(tb.id as any)}
                    className={`px-3 py-1.5 rounded-[5px] font-semibold transition-colors whitespace-nowrap ${
                      dirTabFilter === tb.id
                        ? 'bg-[#087cf5] text-white shadow-xs'
                        : 'bg-slate-50 text-[#52627a] hover:bg-slate-100 hover:text-[#101d37]'
                    }`}
                  >
                    {tb.label}
                  </button>
                ))}
              </div>

              {/* View Mode Switcher & Sample Profile */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-[#f1f5f9] p-0.5 rounded-[6px] border border-[#e2e8f0]">
                  <button
                    onClick={() => setViewMode('matrix')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-[5px] text-[11.5px] font-semibold transition-all ${
                      viewMode === 'matrix' ? 'bg-white text-[#087cf5] shadow-xs' : 'text-[#64748b] hover:text-[#101d37]'
                    }`}
                    title="Application Matrix View"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Matrix</span>
                  </button>
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-[5px] text-[11.5px] font-semibold transition-all ${
                      viewMode === 'cards' ? 'bg-white text-[#087cf5] shadow-xs' : 'text-[#64748b] hover:text-[#101d37]'
                    }`}
                    title="Tracker Cards View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Cards</span>
                  </button>
                </div>

                <button
                  onClick={() => handleOpenStudent(studentList[0])}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[#087cf5] hover:bg-[#006ee6] text-white text-[12px] font-semibold transition-colors shadow-xs"
                >
                  <EyeIcon className="w-3.5 h-3.5" />
                  <span>Sample Applications ({studentList[0]?.name || 'Rahul Sharma'})</span>
                </button>
              </div>
            </div>

            {/* Search Input & Select Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2 pt-1 border-t border-slate-100">
              <div className="relative sm:col-span-2">
                <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={dirSearchQuery}
                  onChange={(e) => setDirSearchQuery(e.target.value)}
                  placeholder="Search applicant by name, ID, phone, target course, or university..."
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] focus:bg-white rounded-[6px] pl-8 pr-3 py-1.5 text-[12px] text-[#101d37] outline-none transition-all"
                />
              </div>

              <div>
                <select
                  value={dirCountryFilter}
                  onChange={(e) => setDirCountryFilter(e.target.value)}
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
                  value={dirStatusFilter}
                  onChange={(e) => setDirStatusFilter(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] rounded-[6px] px-2.5 py-1.5 text-[12px] text-[#101d37] outline-none"
                >
                  <option value="All">All Application Statuses</option>
                  <option value="Offer Received">Offer Received</option>
                  <option value="Submitted">Submitted</option>
                  <option value="In Draft">In Draft</option>
                  <option value="Enrolled">Enrolled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Directory Content: Matrix Table or Tracker Cards */}
          {viewMode === 'matrix' ? (
            <div className="bg-white rounded-[8px] border border-[#e5edf5] shadow-xs overflow-hidden flex flex-col">
              <div className="overflow-x-auto overflow-y-auto max-h-[640px] scrollbar-thin">
                <table className="w-full text-left text-[12px] border-collapse min-w-[1100px]">
                  <thead className="sticky top-0 bg-[#f8fafc] z-10 border-b border-[#e5edf5] shadow-2xs">
                    <tr className="text-[#52627a] font-bold text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Applicant & Profile</th>
                      <th className="py-2.5 px-3">Destination & Program</th>
                      <th className="py-2.5 px-3">Multi-Portal Submissions & Reference IDs</th>
                      <th className="py-2.5 px-3">Portal Fees & Receipts</th>
                      <th className="py-2.5 px-3">Decision Ledger</th>
                      <th className="py-2.5 px-3">Next Critical Milestone</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dirFilteredStudents.length > 0 ? (
                      dirFilteredStudents.map((st, idx) => {
                        const appData = getStudentPortalApplications(st);
                        return (
                          <tr
                            key={st.id}
                            onClick={() => handleOpenStudent(st)}
                            className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
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
                                  className="w-9 h-9 aspect-square rounded-full object-cover border border-slate-200 shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="font-bold text-[#101d37] group-hover:text-[#087cf5] transition-colors whitespace-nowrap">
                                    {st.name}
                                  </div>
                                  <div className="text-[10px] text-[#64748b] font-medium mt-0.5 whitespace-nowrap">
                                    ID: {st.studentId}
                                  </div>
                                  <div className="text-[10px] text-[#64748b] font-medium whitespace-nowrap">
                                    {st.phone}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-medium text-[#101d37] flex items-center gap-1.5">
                                <span>
                                  {st.country === 'Italy' ? '🇮🇹' : st.country === 'Germany' ? '🇩🇪' : st.country === 'UK' ? '🇬🇧' : st.country === 'France' ? '🇫🇷' : '🇮🇪'}
                                </span>
                                <span className="font-semibold">{st.country}</span>
                                <span className="text-[10px] text-slate-400">({st.intake})</span>
                              </div>
                              <div className="text-[10.5px] text-[#64748b] truncate max-w-[170px] mt-0.5">
                                {st.preferredCourse}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex flex-col gap-1 py-0.5 max-w-[320px]">
                                {appData.portals.map((p, pIdx) => (
                                  <div key={pIdx} className="flex items-center justify-between gap-1.5 text-[11px] bg-[#f8fafc] px-2 py-0.5 rounded border border-slate-200/80">
                                    <div className="flex items-center gap-1 truncate">
                                      <Landmark className="w-3 h-3 text-[#087cf5] shrink-0" />
                                      <span className="font-bold text-slate-800">{p.name}</span>
                                      <span className="text-[10px] text-slate-400 font-mono">({p.ref})</span>
                                    </div>
                                    <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold border shrink-0 ${p.badge}`}>
                                      {p.status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-800 text-[11.5px] flex items-center gap-1">
                                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{appData.feeTotal}</span>
                              </div>
                              <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                                <Check className="w-3 h-3" />
                                <span>{appData.receiptsStatus}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1 text-[10.5px]">
                                {appData.decisions.offers > 0 ? (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                                    {appData.decisions.offers} Offer 🎉
                                  </span>
                                ) : null}
                                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[#087cf5] font-bold border border-blue-200">
                                  {appData.decisions.underReview} In Review
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-semibold text-slate-800 text-[11px] truncate max-w-[190px]">
                                {appData.nextMilestone}
                              </div>
                              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 inline-block mt-0.5">
                                ⏰ {appData.daysLeft}d remaining
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenStudent(st);
                                }}
                                className="px-2.5 py-1 rounded-[5px] bg-blue-50 text-[#087cf5] hover:bg-[#087cf5] hover:text-white font-semibold text-[11px] transition-colors inline-flex items-center gap-1 shadow-xs"
                              >
                                <span>Open Tracker</span>
                                <span>&gt;</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-[#64748b] text-xs">
                          No student application records found matching your search and filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="px-3.5 py-2.5 bg-[#f8fafc] border-t border-[#e5edf5] flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-[#64748b]">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#101d37]">
                    Showing <span className="font-bold text-[#087cf5]">{dirFilteredStudents.length}</span> of {studentList.length} applicant files
                  </span>
                  <span className="hidden sm:inline text-slate-300">|</span>
                  <span className="hidden sm:inline text-[11px] text-slate-500">
                    Live portal tracking connected to university admission servers
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    Portal API active
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Tracker Cards Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {dirFilteredStudents.map((st) => {
                const appData = getStudentPortalApplications(st);
                return (
                  <div
                    key={st.id}
                    onClick={() => handleOpenStudent(st)}
                    className="bg-white border border-[#e5edf5] hover:border-blue-300 rounded-[9px] p-3.5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
                  >
                    <div>
                      {/* Top: Student Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={st.avatar}
                            alt={st.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/avatars/rahul.png';
                            }}
                            className="w-10 h-10 aspect-square rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-[#101d37] text-[13px]">{st.name}</div>
                            <div className="text-[10.5px] text-[#64748b]">
                              ID: {st.studentId} • {st.country} {st.country === 'Italy' ? '🇮🇹' : st.country === 'Germany' ? '🇩🇪' : '🇬🇧'}
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${appData.stageBadge}`}>
                          {appData.stageLabel}
                        </span>
                      </div>

                      {/* Course & Executive */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#52627a]">
                        <span className="font-semibold text-slate-800 truncate max-w-[190px]">{st.preferredCourse}</span>
                        <span className="text-slate-500">{st.counsellor}</span>
                      </div>

                      {/* Portal List */}
                      <div className="mt-2.5 space-y-1.5 bg-[#f8fafc] p-2.5 rounded-[7px] border border-slate-200/70 text-[11px]">
                        {appData.portals.map((p, pIdx) => (
                          <div key={pIdx} className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 truncate max-w-[160px]">{p.name}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9.5px] text-slate-500">{p.fee}</span>
                              <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold border ${p.badge}`}>
                                {p.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Next Critical Milestone */}
                      <div className="mt-2.5 flex items-center justify-between text-[11px]">
                        <span className="text-[#64748b]">Milestone:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-slate-700 truncate max-w-[160px]">{appData.nextMilestone}</span>
                          <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200 shrink-0">
                            {appData.daysLeft}d
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[10.5px] text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> {appData.feeTotal} ({appData.receiptsStatus})
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenStudent(st);
                        }}
                        className="px-3 py-1 rounded-[5px] bg-[#087cf5] hover:bg-[#006ee6] text-white text-[11.5px] font-semibold transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <span>Open Tracker</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 2: STUDENT APPLICATIONS PROFILE PREVIEW            */}
      {/* ======================================================== */}
      {selectedStudent && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Top Breadcrumb & Back Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-0.5">
            <div className="flex items-center gap-2">
              <button
                onClick={handleBackToList}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#e2e8f0] bg-white hover:bg-slate-50 text-[12px] font-semibold text-[#101d37] shadow-xs transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← Back to Applications Directory</span>
              </button>

              <span className="text-[12px] text-[#64748b] hidden sm:inline">
                Home &gt; Applications &gt;{' '}
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
                  const target = studentList.find((s) => s.studentId === e.target.value);
                  if (target) handleOpenStudent(target);
                }}
                className="bg-white border border-[#e2e8f0] rounded-[5px] px-2 py-1 text-[11.5px] font-semibold text-[#101d37] outline-none"
              >
                {studentList.map((st) => (
                  <option key={st.studentId} value={st.studentId}>
                    {st.name} ({st.studentId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Student Banner */}
          <div className="bg-white border border-[#e2e8f0] rounded-[9px] p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={selectedStudent.avatar}
                alt={selectedStudent.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/avatars/rahul.png';
                }}
                className="w-14 h-14 aspect-square rounded-full object-cover border-2 border-slate-200 shadow-xs shrink-0"
              />
              <div>
                <div className="text-[14.5px] font-bold text-[#101d37]">{selectedStudent.name}</div>
                <div className="text-[11px] text-[#64748b] mt-0.5">
                  Student ID:{' '}
                  <span className="text-[#101d37] font-medium">{selectedStudent.studentId}</span> • {selectedStudent.phone}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-[12px]">
              <div>
                <div className="text-[10px] text-[#64748b] font-medium uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3 text-[#64748b]" /> Country
                </div>
                <div className="font-semibold text-[#101d37] flex items-center gap-1.5 mt-0.5">
                  <span className="text-sm">
                    {selectedStudent.country === 'Italy' ? '🇮🇹' : selectedStudent.country === 'Germany' ? '🇩🇪' : selectedStudent.country === 'UK' ? '🇬🇧' : selectedStudent.country === 'France' ? '🇫🇷' : '🇮🇪'}
                  </span>{' '}
                  {selectedStudent.country}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-[#64748b] font-medium uppercase tracking-wider flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-[#64748b]" /> Preferred Course
                </div>
                <div className="font-semibold text-[#101d37] mt-0.5">{selectedStudent.preferredCourse}</div>
              </div>

              <div>
                <div className="text-[10px] text-[#64748b] font-medium uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#64748b]" /> Intake
                </div>
                <div className="font-semibold text-[#101d37] mt-0.5">{selectedStudent.intake}</div>
              </div>

              <div>
                <div className="text-[10px] text-[#64748b] font-medium uppercase tracking-wider flex items-center gap-1">
                  <Landmark className="w-3 h-3 text-[#64748b]" /> Selected Universities
                </div>
                <div className="font-semibold text-[#101d37] mt-0.5 text-center">4</div>
              </div>

              <div>
                <div className="text-[10px] text-[#64748b] font-medium uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-[#087cf5]" /> Current Stage
                </div>
                <div className="mt-0.5">
                  <span className="px-2.5 py-0.5 bg-[#dbeafe] text-[#1d4ed8] rounded-full text-[11px] font-semibold">
                    {selectedStudent.currentStage}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Application Submission & Portal Review Status Banner */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border border-blue-200 rounded-[9px] p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#087cf5] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-[#101d37] flex items-center gap-2">
                  <span>Applications Submitted & Under Review</span>
                  <span className="px-2 py-0.2 rounded bg-blue-100 text-[#087cf5] text-[10px] font-bold border border-blue-300">
                    Stage 5 • Portal Sync
                  </span>
                </div>
                <div className="text-[11px] text-[#52627a] mt-0.5">
                  Application files submitted to target universities. Tracking faculty assessment, portal credentials, and awaiting official university decisions.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast(`Sent application submission proof to ${selectedStudent.name} on WhatsApp`)}
                className="px-3 py-1.5 rounded-[6px] bg-white border border-[#cbd5e1] hover:bg-slate-50 text-[#101d37] text-[11.5px] font-semibold flex items-center gap-1.5 shadow-2xs"
              >
                <Send className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Share Submission Proof</span>
              </button>
              <button
                onClick={() => {
                  setConfirmModalData({
                    isOpen: true,
                    title: 'Record Offer & Forward to Stage 6',
                    studentName: selectedStudent.name,
                    studentId: selectedStudent.studentId,
                    studentAvatar: selectedStudent.avatar,
                    country: selectedStudent.country,
                    currentStageName: 'Stage 5: Application',
                    targetStageName: 'Stage 6: Offer Letter Received',
                    description: `This records official admission offer(s) for ${selectedStudent.name} and forwards their file to Stage 6 (Offer Letter Received) to review conditions, scholarships, and acceptance deadlines.`,
                    confirmLabel: 'Confirm & Forward to Stage 6',
                    variant: 'success',
                    onConfirm: () => {
                      if (onAdvanceStage) {
                        onAdvanceStage(selectedStudent.studentId || selectedStudent.id, 'offer-letters');
                      }
                      showToast(`Offer recorded! Advancing ${selectedStudent.name} to Stage 6 (Offer Letters).`);
                      if (onNavigate) {
                        onNavigate(`offer-letters?id=${selectedStudent.studentId}`);
                      }
                    },
                  });
                }}
                className="px-3.5 py-1.5 rounded-[6px] bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Record Offer Received & Advance to Stage 6</span>
              </button>
            </div>
          </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#087cf5] text-white px-4 py-2.5 rounded-lg shadow-lg text-[13px] font-medium flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Top Breadcrumb & Page Title */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-[18px] font-bold text-[#101d37] leading-tight">
            Application Team Dashboard
          </h1>
          <p className="text-[11.5px] text-[#64748b] leading-tight mt-0.5">
            Manage student applications, submissions, and university decisions.
          </p>
        </div>

        <div className="text-[11.5px] text-[#64748b] hidden sm:inline">
          Home &gt; Applications &gt;{' '}
          <span className="font-semibold text-[#101d37]">Application Team Dashboard</span>
        </div>
      </div>



      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Card 1: Ready for Application */}
        <div className="bg-[#f0f8ff] border border-[#d6ecff] rounded-[8px] p-2.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[#dbeafe] text-[#087cf5] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#52627a] font-medium leading-tight">
              Ready for Application
            </div>
            <div className="text-[19px] font-bold text-[#101d37]">3</div>
          </div>
        </div>

        {/* Card 2: In Draft */}
        <div className="bg-[#fffdf5] border border-[#fef3c7] rounded-[8px] p-2.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[#fef3c7] text-[#ca8a04] flex items-center justify-center shrink-0">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#52627a] font-medium leading-tight">In Draft</div>
            <div className="text-[19px] font-bold text-[#101d37]">2</div>
          </div>
        </div>

        {/* Card 3: Submitted */}
        <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-[8px] p-2.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[#dcfce7] text-[#16a34a] flex items-center justify-center shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#52627a] font-medium leading-tight">Submitted</div>
            <div className="text-[19px] font-bold text-[#101d37]">4</div>
          </div>
        </div>

        {/* Card 4: Under Review */}
        <div className="bg-[#faf5ff] border border-[#f3e8ff] rounded-[8px] p-2.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[#f3e8ff] text-[#9333ea] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#52627a] font-medium leading-tight">Under Review</div>
            <div className="text-[19px] font-bold text-[#101d37]">3</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Applications Table (7 cols) & Right Application Detail Widgets (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* Left Section: Table & Quick Actions */}
        <div className="lg:col-span-8 space-y-3">
          {/* Applications Table Card */}
          <div className="bg-white border border-[#e2e8f0] rounded-[9px] shadow-xs overflow-hidden">
            <div className="p-3 border-b border-[#f1f5f9]">
              <h3 className="text-[13.5px] font-bold text-[#101d37]">
                University Applications ({selectedStudent.name})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11.5px] border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] text-[#64748b] font-medium border-b border-[#e2e8f0]">
                    <th className="py-2.5 px-3">University</th>
                    <th className="py-2.5 px-2.5">Course</th>
                    <th className="py-2.5 px-2.5">Deadline</th>
                    <th className="py-2.5 px-2.5">Application Fee</th>
                    <th className="py-2.5 px-2.5">Status</th>
                    <th className="py-2.5 px-2.5">Assigned Executive</th>
                    <th className="py-2.5 px-2.5">Last Updated</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {applications.map((app) => {
                    const isSelected = selectedAppId === app.id;
                    return (
                      <tr
                        key={app.id}
                        onClick={() => setSelectedAppId(app.id)}
                        className={`hover:bg-[#f8fbff] transition-colors cursor-pointer ${
                          isSelected ? 'bg-[#f0f7ff]' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={app.logo}
                              alt={app.university}
                              className="w-6 h-6 object-contain shrink-0"
                            />
                            <div>
                              <div className="font-semibold text-[#101d37] hover:text-[#087cf5]">
                                {app.university}
                              </div>
                              <div className="text-[10px] text-[#64748b]">{app.country}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-2.5 text-[#475569]">{app.course}</td>
                        <td className="py-2.5 px-2.5 text-[#475569] whitespace-nowrap">
                          {app.deadline}
                        </td>
                        <td className="py-2.5 px-2.5 font-medium text-[#101d37]">{app.appFee}</td>
                        <td className="py-2.5 px-2.5 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10.5px] font-semibold ${
                              app.status === 'Form Completed'
                                ? 'bg-[#e0f2fe] text-[#0284c7]'
                                : app.status === 'Draft'
                                ? 'bg-[#fef3c7] text-[#b45309]'
                                : app.status === 'Docs Uploaded'
                                ? 'bg-[#f3e8ff] text-[#7e22ce]'
                                : app.status === 'Submitted'
                                ? 'bg-[#dcfce7] text-[#15803d]'
                                : 'bg-[#ede9fe] text-[#6d28d9]'
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5">
                          <div className="flex items-center gap-1.5">
                            <img
                              src={app.executiveAvatar}
                              alt={app.executiveName}
                              className="w-5 h-5 aspect-square rounded-full object-cover shrink-0"
                            />
                            <span className="text-[#475569] whitespace-nowrap">
                              {app.executiveName}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2.5 whitespace-nowrap">
                          <div className="text-[#101d37] font-medium">{app.lastUpdatedDate}</div>
                          <div className="text-[10px] text-[#64748b]">{app.lastUpdatedTime}</div>
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <div
                            className="flex items-center justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {app.actionText === 'View' ? (
                              <button
                                onClick={() => setSelectedAppId(app.id)}
                                className="px-3 py-1 bg-[#087cf5] hover:bg-[#076ed9] text-white rounded-[5px] text-[11px] font-semibold shadow-2xs"
                              >
                                View
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedAppId(app.id);
                                  showToast(`Action '${app.actionText}' triggered for ${app.university}`);
                                }}
                                className="px-2.5 py-1 bg-white border border-[#bfdbfe] text-[#087cf5] hover:bg-[#eff6ff] rounded-[5px] text-[11px] font-semibold"
                              >
                                {app.actionText}
                              </button>
                            )}
                            <button className="p-1 text-[#94a3b8] hover:text-[#475569]">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="bg-white border border-[#e2e8f0] rounded-[9px] p-3 shadow-xs space-y-2">
            <h4 className="text-[12.5px] font-bold text-[#101d37]">Quick Actions</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setShowStartAppModal(true)}
                className="px-3 py-2 bg-[#087cf5] hover:bg-[#076ed9] text-white rounded-[6px] text-[12px] font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" /> Start Applications
              </button>

              <button
                onClick={() => setShowUploadDocsModal(true)}
                className="px-3 py-2 bg-[#eff6ff] border border-[#bfdbfe] text-[#087cf5] hover:bg-[#dbeafe] rounded-[6px] text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Upload className="w-4 h-4" /> Upload Documents
              </button>

              <button
                onClick={() => showToast(`Submitted application for ${selectedApp.university}`)}
                className="px-3 py-2 bg-[#dcfce7] border border-[#bbf7d0] text-[#15803d] hover:bg-[#bbf7d0] rounded-[6px] text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Send className="w-4 h-4" /> Submit Application
              </button>

              <button
                onClick={() => showToast(`Forwarded ${selectedApp.university} file to Offer Team`)}
                className="px-3 py-2 bg-[#f3e8ff] border border-[#e9d5ff] text-[#7e22ce] hover:bg-[#e9d5ff] rounded-[6px] text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Users className="w-4 h-4" /> Forward to Offer Team
              </button>
            </div>
          </div>
        </div>

        {/* Right Section: Selected Application Details, Required Docs & Activity Timeline */}
        <div className="lg:col-span-4 space-y-3">
          {/* Card 1: Selected Application Details */}
          <div className="bg-white border border-[#e2e8f0] rounded-[9px] p-3.5 shadow-xs space-y-3">
            <h3 className="text-[13px] font-bold text-[#101d37]">Selected Application Details</h3>

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={selectedApp.logo}
                  alt={selectedApp.university}
                  className="w-8 h-8 object-contain"
                />
                <div>
                  <div className="text-[13px] font-bold text-[#101d37]">
                    {selectedApp.university}
                  </div>
                  <div className="text-[11px] text-[#64748b]">
                    {selectedApp.university.includes('Padova') ? 'Padova' : selectedApp.country}, {selectedApp.country}
                  </div>
                </div>
              </div>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  showToast('Opening university profile modal...');
                }}
                className="text-[11px] text-[#087cf5] hover:underline flex items-center gap-1 font-medium"
              >
                View University Profile <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#475569] pt-1 border-t border-[#f1f5f9]">
              <div className="flex items-center gap-1">
                <Landmark className="w-3.5 h-3.5 text-[#64748b]" /> {selectedApp.uniType}
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-500" /> QS Rank: {selectedApp.qsRank}
              </div>
              <div className="flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Application Fee: {selectedApp.appFee}
              </div>
            </div>

            {/* 6-step Tracker */}
            <div className="pt-2">
              <div className="relative">
                {/* Horizontal line */}
                <div className="absolute top-2.5 left-4 right-4 h-0.5 bg-slate-200 z-0" />
                <div
                  className="absolute top-2.5 left-4 h-0.5 bg-[#087cf5] z-0 transition-all duration-300"
                  style={{
                    width: `${((selectedApp.currentStepIndex - 1) / (steps.length - 1)) * 92}%`,
                  }}
                />

                <div className="relative z-10 flex justify-between items-start text-center">
                  {steps.map((step) => {
                    const isDone = step.num <= selectedApp.currentStepIndex;
                    const isCurrent = step.num === selectedApp.currentStepIndex;
                    return (
                      <div key={step.num} className="flex flex-col items-center">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                            isCurrent
                              ? 'bg-[#087cf5] text-white ring-4 ring-blue-100'
                              : isDone
                              ? 'bg-[#087cf5] text-white'
                              : 'bg-white border-2 border-slate-300 text-slate-400'
                          }`}
                        >
                          {isDone ? <Check className="w-3 h-3" /> : step.num}
                        </div>
                        <div
                          className={`text-[9.5px] mt-1 max-w-[50px] leading-tight ${
                            isCurrent
                              ? 'font-bold text-[#087cf5]'
                              : isDone
                              ? 'font-medium text-[#101d37]'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.num}. {step.title}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Required Documents for Application */}
          <div className="bg-white border border-[#e2e8f0] rounded-[9px] p-3.5 shadow-xs space-y-2.5">
            <h3 className="text-[13px] font-bold text-[#101d37]">
              Required Documents for Application
            </h3>

            <div className="space-y-1.5 divide-y divide-[#f8fafc]">
              {requiredDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => handleToggleDocStatus(doc.id)}
                  className="pt-1.5 flex items-center justify-between text-[11.5px] cursor-pointer hover:bg-slate-50 px-1 rounded-sm"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#64748b]" />
                    <span className="text-[#334155]">{doc.name}</span>
                  </div>
                  <div>
                    {doc.status === 'Uploaded' && (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-100" /> Uploaded
                      </span>
                    )}
                    {doc.status === 'Verified' && (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-100" /> Verified
                      </span>
                    )}
                    {doc.status === 'Pending' && (
                      <span className="inline-flex items-center gap-1 text-slate-400 font-medium text-[11px]">
                        <Circle className="w-3.5 h-3.5 text-slate-300" /> Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Recent Activity Timeline */}
          <div className="bg-white border border-[#e2e8f0] rounded-[9px] p-3.5 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-[#101d37]">Recent Activity Timeline</h3>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  showToast('Viewing full application timeline logs');
                }}
                className="text-[11px] text-[#087cf5] hover:underline font-medium"
              >
                View All
              </a>
            </div>

            <div className="space-y-2.5 relative pl-2">
              {/* Vertical timeline line */}
              <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-slate-200" />

              {timelineEvents.map((ev, idx) => (
                <div key={idx} className="flex items-start gap-2.5 relative">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 z-10 ${
                      ev.active ? 'bg-[#087cf5]' : 'bg-slate-300'
                    }`}
                  />
                  <div className="flex-1 flex items-baseline justify-between gap-2 text-[11px]">
                    <span className="text-[#64748b] text-[10px] whitespace-nowrap">{ev.time}</span>
                    <span className="text-[#101d37] font-medium text-right">{ev.event}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Start Applications Modal */}
      {showStartAppModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[10px] w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3 border-b border-[#f1f5f9] pb-2">
              <h3 className="text-[15px] font-bold text-[#101d37]">Start New Application</h3>
              <button onClick={() => setShowStartAppModal(false)}>
                <X className="w-4 h-4 text-[#94a3b8]" />
              </button>
            </div>
            <div className="space-y-3 text-[12px]">
              <div>
                <label className="block text-[#64748b] mb-1 font-medium">Select University</label>
                <select className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-[6px]">
                  <option>University of Padova (Italy)</option>
                  <option>Politecnico di Torino (Italy)</option>
                  <option>University of Bologna (Italy)</option>
                  <option>Sapienza University of Rome (Italy)</option>
                </select>
              </div>
              <div>
                <label className="block text-[#64748b] mb-1 font-medium">Program / Course</label>
                <input
                  type="text"
                  defaultValue="MSc Computer Science"
                  className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-[6px]"
                />
              </div>
              <div>
                <label className="block text-[#64748b] mb-1 font-medium">Assign Executive</label>
                <select className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-[6px]">
                  <option>Neha Kapoor</option>
                  <option>Amit Verma</option>
                  <option>Rohan Shetty</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-[#f1f5f9]">
              <button
                onClick={() => setShowStartAppModal(false)}
                className="px-3 py-1.5 border border-[#cbd5e1] rounded-[6px] text-[12px]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowStartAppModal(false);
                  showToast('Application draft initialized successfully');
                }}
                className="px-4 py-1.5 bg-[#087cf5] text-white rounded-[6px] text-[12px] font-semibold"
              >
                Create Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Docs Modal */}
      {showUploadDocsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[10px] w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3 border-b border-[#f1f5f9] pb-2">
              <h3 className="text-[15px] font-bold text-[#101d37]">Upload Application Document</h3>
              <button onClick={() => setShowUploadDocsModal(false)}>
                <X className="w-4 h-4 text-[#94a3b8]" />
              </button>
            </div>
            <div className="space-y-3 text-[12px]">
              <div>
                <label className="block text-[#64748b] mb-1 font-medium">Document Type</label>
                <select className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-[6px]">
                  <option>Letter of Recommendation (LOR)</option>
                  <option>IELTS Score Report</option>
                  <option>Passport Copy</option>
                  <option>Graduation Certificate</option>
                </select>
              </div>
              <div className="border-2 border-dashed border-[#cbd5e1] rounded-[8px] p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-[#087cf5] mx-auto mb-2" />
                <div className="text-[13px] font-semibold text-[#101d37]">
                  Click to upload or drag & drop
                </div>
                <div className="text-[11px] text-[#64748b] mt-1">PDF, JPG or PNG (max 10MB)</div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-[#f1f5f9]">
              <button
                onClick={() => setShowUploadDocsModal(false)}
                className="px-3 py-1.5 border border-[#cbd5e1] rounded-[6px] text-[12px]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowUploadDocsModal(false);
                  showToast('Document uploaded and attached to application');
                }}
                className="px-4 py-1.5 bg-[#087cf5] text-white rounded-[6px] text-[12px] font-semibold"
              >
                Attach Document
              </button>
            </div>
          </div>
        </div>
      )}
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
