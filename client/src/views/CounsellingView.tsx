import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  GraduationCap,
  Calendar,
  Clock,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  Search,
  Filter,
  Check,
  X,
  MessageSquare,
  Sparkles,
  ChevronDown,
  BookOpen,
  Award,
  FileText,
  Send,
  Plus,
  LayoutGrid,
  List,
  ShieldCheck,
  MapPin,
  UserCheck,
  Compass,
  Briefcase,
  Layers,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { StudentRecord } from '../services/studentsData';
import { StudentAvatar } from '../components/common/StudentAvatar';
import { PipelineStage, getStageById } from '../context/WorkflowContext';
import { ActionConfirmModal } from '../components/modals/ActionConfirmModal';

interface CounsellingViewProps {
  students?: StudentRecord[];
  onAdvanceStage?: (studentId: string, targetStageIdOrNumber?: any) => PipelineStage | null;
  onNavigate?: (route: string) => void;
}

interface CounsellingSession {
  id: string;
  studentId: string;
  title: string;
  date: string;
  time: string;
  counsellor: string;
  summary: string;
  type: 'In-Person' | 'Video Call' | 'Phone';
  status: 'Completed' | 'Scheduled' | 'Action Needed';
  tags: string[];
}

const DEFAULT_COUNSELLING_SESSIONS: Record<string, CounsellingSession[]> = {
  'ITA-2027-029': [
    {
      id: 'cs-1',
      studentId: 'ITA-2027-029',
      title: 'Initial Profile Evaluation & Destination Discovery',
      date: '10 Oct 2025',
      time: '02:30 PM',
      counsellor: 'Neha Jain',
      summary: 'Reviewed B.E. Electrical transcripts. Strong fit for Automation & Robotics in Italy. Evaluated University of Bologna and Politecnico di Torino.',
      type: 'Video Call',
      status: 'Completed',
      tags: ['Profile Evaluated', 'Italy Confirmed', 'Budget Viable'],
    },
    {
      id: 'cs-2',
      studentId: 'ITA-2027-029',
      title: 'Course Specialization & Scholarship Guidance',
      date: '12 Oct 2025',
      time: '04:00 PM',
      counsellor: 'Neha Jain',
      summary: 'Discussed MSc Automation Engineering curriculum vs Mechatronics. Explained ER.GO scholarship eligibility and proof of funds requirements.',
      type: 'Video Call',
      status: 'Completed',
      tags: ['Curriculum Aligned', 'Scholarship Discussed'],
    },
    {
      id: 'cs-3',
      studentId: 'ITA-2027-029',
      title: 'Parent Discussion & Final Destination Sign-Off',
      date: 'Today',
      time: '03:00 PM',
      counsellor: 'Neha Jain',
      summary: 'Scheduled 1-on-1 parent call to finalize Bologna roadmap and transition to documentation team for transcript collection.',
      type: 'Video Call',
      status: 'Scheduled',
      tags: ['Parent Call', 'Final Sign-Off'],
    },
  ],
  'GER-2026-033': [
    {
      id: 'cs-4',
      studentId: 'GER-2026-033',
      title: 'German APS & Academic Compatibility Check',
      date: '11 Oct 2025',
      time: '11:00 AM',
      counsellor: 'Amit Verma',
      summary: 'CGPA 8.7 in Automobile Engineering meets RWTH Aachen and TU Munich criteria. Advised on APS certificate turnaround timeline.',
      type: 'Video Call',
      status: 'Completed',
      tags: ['APS Prepared', 'Germany Public Uni'],
    },
    {
      id: 'cs-5',
      studentId: 'GER-2026-033',
      title: 'Language Test & TestAS Readiness',
      date: 'Today',
      time: '05:30 PM',
      counsellor: 'Amit Verma',
      summary: 'IELTS score 7.5 cleared. Checking English-taught credit hours requirement for RWTH Aachen winter intake.',
      type: 'Video Call',
      status: 'Scheduled',
      tags: ['IELTS Cleared', 'English Track'],
    },
  ],
  'ITA-2027-038': [
    {
      id: 'cs-6',
      studentId: 'ITA-2027-038',
      title: 'Italian Engineering Track Consultation',
      date: '08 Oct 2025',
      time: '03:30 PM',
      counsellor: 'Neha Jain',
      summary: 'Interested in PoliTo Computer Engineering. Evaluated bachelor math credits and syllabus mapping.',
      type: 'In-Person',
      status: 'Completed',
      tags: ['Syllabus Mapped', 'PoliTo Focus'],
    },
  ],
  'FRA-2026-058': [
    {
      id: 'cs-7',
      studentId: 'FRA-2026-058',
      title: 'France Campus France & Sorbonne Advisory',
      date: '09 Oct 2025',
      time: '01:00 PM',
      counsellor: 'Amit Verma',
      summary: 'B.Sc Maths background fits Sorbonne MSc Quantitative Economics. Walked through Etudes en France portal deadlines.',
      type: 'Video Call',
      status: 'Completed',
      tags: ['Campus France', 'Sorbonne'],
    },
  ],
  'ITA-2027-094': [
    {
      id: 'cs-8',
      studentId: 'ITA-2027-094',
      title: 'B.Arch Portfolio Review & UniFi Consultation',
      date: '10 Oct 2025',
      time: '05:00 PM',
      counsellor: 'Neha Jain',
      summary: 'Reviewed design portfolio for Florence architecture program. Portfolio cleared initial criteria.',
      type: 'Video Call',
      status: 'Completed',
      tags: ['Portfolio Cleared', 'Architecture'],
    },
  ],
};

export const CounsellingView: React.FC<CounsellingViewProps> = ({
  students,
  onAdvanceStage,
  onNavigate,
}) => {
  // Workflow-sourced candidate list
  const candidateList = useMemo(() => {
    return students || [];
  }, [students]);

  // Selected student for Profile Preview
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  // Filters & View Mode
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [statusTab, setStatusTab] = useState<'All' | 'Today' | 'Cleared' | 'FollowUp' | 'Ready'>('All');
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('matrix');

  // Detail View Tabs
  const [activeTab, setActiveTab] = useState<'evaluation' | 'sessions' | 'roadmap'>('evaluation');

  // Session Notes state
  const [sessionsMap, setSessionsMap] = useState<Record<string, CounsellingSession[]>>(DEFAULT_COUNSELLING_SESSIONS);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteTag, setNewNoteTag] = useState('Counselling Note');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Floating confirmation modal for stage transitions
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
    confirmLabel?: string;
    variant?: 'primary' | 'success' | 'warning' | 'danger';
    onConfirm: () => void;
  } | null>(null);

  // Deep-link support: #counselling?id=<studentId>
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#counselling') && (hash.includes('?id=') || hash.includes('?student='))) {
        const idParam = hash.includes('?id=') ? hash.split('?id=')[1] : hash.split('?student=')[1];
        if (idParam) {
          const match = candidateList.find(
            (s) => s.studentId === idParam || s.id === idParam || s.name.toLowerCase().includes(idParam.toLowerCase())
          );
          if (match) setSelectedStudent(match);
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [candidateList]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleOpenStudent = (st: StudentRecord) => {
    setSelectedStudent(st);
    window.location.hash = `counselling?id=${st.studentId}`;
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
    window.location.hash = 'counselling';
  };

  // Stage Advancement Handler: Counselling -> University Shortlisting (Stage 2)
  const handleAdvanceToShortlisting = (st: StudentRecord) => {
    setConfirmModalData({
      isOpen: true,
      title: 'Advance to University Shortlisting',
      studentName: st.name,
      studentId: st.studentId,
      studentAvatar: st.avatar,
      country: st.country,
      currentStageName: 'Stage 1: Enrolled / Counselling',
      targetStageName: 'Stage 2: University Shortlisting',
      description: `This will complete counselling consultation for ${st.name} and advance their profile to Stage 2: University Shortlisting to curate university choices and programs.`,
      confirmLabel: 'Confirm & Forward to Stage 2',
      variant: 'primary',
      onConfirm: () => {
        if (onAdvanceStage) {
          onAdvanceStage(st.id, 'shortlisting');
        }
        showToast(`✅ ${st.name} successfully advanced to University Shortlisting stage!`);
        setTimeout(() => {
          if (onNavigate) {
            onNavigate(`university-shortlisting?id=${st.studentId}`);
          } else {
            window.location.hash = `university-shortlisting?id=${st.studentId}`;
          }
        }, 700);
      },
    });
  };

  // Filtered candidate list
  const filteredCandidates = useMemo(() => {
    return candidateList.filter((st) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        st.name.toLowerCase().includes(q) ||
        st.studentId.toLowerCase().includes(q) ||
        st.preferredCourse.toLowerCase().includes(q) ||
        st.country.toLowerCase().includes(q) ||
        st.counsellor.toLowerCase().includes(q);

      const matchCountry = countryFilter === 'All' || st.country.toLowerCase() === countryFilter.toLowerCase();

      let matchTab = true;
      if (statusTab === 'Today') {
        matchTab = st.nextFollowUp.toLowerCase().includes('today');
      } else if (statusTab === 'Cleared') {
        const cgpaVal = parseFloat(st.academic.cgpa) || 7.5;
        matchTab = cgpaVal >= 7.8;
      } else if (statusTab === 'FollowUp') {
        matchTab = st.priority === 'High' || st.nextFollowUp.toLowerCase().includes('tomorrow');
      } else if (statusTab === 'Ready') {
        matchTab = st.overallStatus === 'Counselling' || st.academic.englishTest.includes('Available') || parseFloat(st.academic.cgpa) >= 7.8;
      }

      return matchSearch && matchCountry && matchTab;
    });
  }, [candidateList, searchQuery, countryFilter, statusTab]);

  // Derived KPI statistics
  const kpis = useMemo(() => {
    const total = candidateList.length;
    const todayCount = candidateList.filter((s) => s.nextFollowUp.toLowerCase().includes('today')).length;
    const clearedCount = candidateList.filter((s) => {
      const gpa = parseFloat(s.academic.cgpa) || 7.5;
      return gpa >= 7.8;
    }).length;
    const followUpCount = candidateList.filter((s) => s.priority === 'High' || s.nextFollowUp.toLowerCase().includes('tomorrow')).length;
    const readyCount = candidateList.filter((s) => s.academic.englishTest.includes('IELTS') || parseFloat(s.academic.cgpa) >= 8.0).length;

    return { total, todayCount, clearedCount, followUpCount, readyCount };
  }, [candidateList]);

  // Active student's sessions
  const currentSessions = useMemo(() => {
    if (!selectedStudent) return [];
    return (
      sessionsMap[selectedStudent.studentId] || [
        {
          id: `cs-default-${selectedStudent.id}`,
          studentId: selectedStudent.studentId,
          title: 'Initial Intake Advisory Session',
          date: selectedStudent.enrollmentDate,
          time: '11:30 AM',
          counsellor: selectedStudent.counsellor,
          summary: `Profile intake complete for ${selectedStudent.preferredCourse}. Discussed requirements for ${selectedStudent.country}.`,
          type: 'Video Call',
          status: 'Completed',
          tags: ['Intake Completed', 'Profile Created'],
        },
      ]
    );
  }, [selectedStudent, sessionsMap]);

  const handleAddSessionNote = () => {
    if (!newNoteText.trim() || !selectedStudent) return;
    const newSession: CounsellingSession = {
      id: `cs-${Date.now()}`,
      studentId: selectedStudent.studentId,
      title: 'Advisory Consultation Update',
      date: 'Just now',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      counsellor: selectedStudent.counsellor || 'Senior Counsellor',
      summary: newNoteText.trim(),
      type: 'Video Call',
      status: 'Completed',
      tags: [newNoteTag],
    };

    setSessionsMap((prev) => ({
      ...prev,
      [selectedStudent.studentId]: [newSession, ...(prev[selectedStudent.studentId] || [])],
    }));
    setNewNoteText('');
    showToast('Session note recorded in counselling log!');
  };

  return (
    <div className="p-4 space-y-3.5 max-w-[1536px] mx-auto select-none font-sans text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#101d37] text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 border border-blue-500/30 animate-in fade-in slide-in-from-top-3 duration-200">
          <Sparkles className="w-4 h-4 text-[#087cf5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 1: COUNSELLING DIRECTORY LIST                       */}
      {/* ======================================================== */}
      {!selectedStudent && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          {/* Top Page Header */}
          <div className="bg-white p-4 rounded-[10px] border border-[#e2e8f0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-[17px] font-bold text-[#101d37]">Counselling & Advisory Desk</h1>
                  <p className="text-[12px] text-[#64748b]">
                    Stage 1 Workspace • Academic profile evaluation, destination selection & 1-on-1 counselor guidance
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>{candidateList.length} In Active Counselling</span>
              </span>
              <button
                onClick={() => onNavigate && onNavigate('leads')}
                className="px-3 py-1.5 rounded-[6px] bg-[#101d37] hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Convert New Lead</span>
              </button>
            </div>
          </div>

          {/* 5 KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Card 1 */}
            <div
              onClick={() => setStatusTab('All')}
              className={`p-3.5 rounded-[9px] border bg-white transition-all cursor-pointer shadow-xs ${
                statusTab === 'All' ? 'border-[#087cf5] ring-2 ring-[#087cf5]/10' : 'border-[#e2e8f0] hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Active Candidates</span>
                <span className="p-1 rounded bg-amber-50 text-amber-600">
                  <Compass className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-[#101d37]">{kpis.total}</div>
              <div className="mt-1 text-[11px] text-amber-600 font-medium">Stage 1 Active Pool</div>
            </div>

            {/* Card 2 */}
            <div
              onClick={() => setStatusTab('Today')}
              className={`p-3.5 rounded-[9px] border bg-white transition-all cursor-pointer shadow-xs ${
                statusTab === 'Today' ? 'border-[#087cf5] ring-2 ring-[#087cf5]/10' : 'border-[#e2e8f0] hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Sessions Today</span>
                <span className="p-1 rounded bg-blue-50 text-[#087cf5]">
                  <Calendar className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-[#087cf5]">{kpis.todayCount}</div>
              <div className="mt-1 text-[11px] text-slate-500 font-medium">Scheduled 1-on-1 calls</div>
            </div>

            {/* Card 3 */}
            <div
              onClick={() => setStatusTab('Cleared')}
              className={`p-3.5 rounded-[9px] border bg-white transition-all cursor-pointer shadow-xs ${
                statusTab === 'Cleared' ? 'border-[#087cf5] ring-2 ring-[#087cf5]/10' : 'border-[#e2e8f0] hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Evaluation Cleared</span>
                <span className="p-1 rounded bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-emerald-600">{kpis.clearedCount}</div>
              <div className="mt-1 text-[11px] text-slate-500 font-medium">CGPA & Degree Verified</div>
            </div>

            {/* Card 4 */}
            <div
              onClick={() => setStatusTab('FollowUp')}
              className={`p-3.5 rounded-[9px] border bg-white transition-all cursor-pointer shadow-xs ${
                statusTab === 'FollowUp' ? 'border-[#087cf5] ring-2 ring-[#087cf5]/10' : 'border-[#e2e8f0] hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Follow-Up Needed</span>
                <span className="p-1 rounded bg-rose-50 text-rose-600">
                  <Clock className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-rose-600">{kpis.followUpCount}</div>
              <div className="mt-1 text-[11px] text-slate-500 font-medium">Pending parent consult</div>
            </div>

            {/* Card 5 */}
            <div
              onClick={() => setStatusTab('Ready')}
              className={`p-3.5 rounded-[9px] border bg-white transition-all cursor-pointer shadow-xs ${
                statusTab === 'Ready' ? 'border-[#087cf5] ring-2 ring-[#087cf5]/10' : 'border-[#e2e8f0] hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Ready for Docs</span>
                <span className="p-1 rounded bg-violet-50 text-violet-600">
                  <FileText className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-violet-700">{kpis.readyCount}</div>
              <div className="mt-1 text-[11px] text-violet-600 font-medium">Can Advance to Stage 2</div>
            </div>
          </div>

          {/* Directory Toolbar with Search, Country & Tab Filter */}
          <div className="bg-white p-3 rounded-[9px] border border-[#e2e8f0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Left Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setStatusTab('All')}
                className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-colors ${
                  statusTab === 'All'
                    ? 'bg-[#101d37] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-[#52627a]'
                }`}
              >
                All Candidates ({kpis.total})
              </button>
              <button
                onClick={() => setStatusTab('Today')}
                className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-colors ${
                  statusTab === 'Today'
                    ? 'bg-[#087cf5] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-[#52627a]'
                }`}
              >
                Sessions Today ({kpis.todayCount})
              </button>
              <button
                onClick={() => setStatusTab('Cleared')}
                className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-colors ${
                  statusTab === 'Cleared'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-[#52627a]'
                }`}
              >
                Evaluation Cleared ({kpis.clearedCount})
              </button>
              <button
                onClick={() => setStatusTab('FollowUp')}
                className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-colors ${
                  statusTab === 'FollowUp'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-[#52627a]'
                }`}
              >
                Follow-up Needed ({kpis.followUpCount})
              </button>
              <button
                onClick={() => setStatusTab('Ready')}
                className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-colors ${
                  statusTab === 'Ready'
                    ? 'bg-violet-700 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-[#52627a]'
                }`}
              >
                Ready for Docs ({kpis.readyCount})
              </button>
            </div>

            {/* Right Controls: Search, Country, View Switcher */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search candidate, ID, country..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] focus:outline-none focus:border-[#087cf5] w-[190px] lg:w-[230px]"
                />
              </div>

              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="text-xs bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] px-2.5 py-1.5 text-[#52627a] font-medium focus:outline-none focus:border-[#087cf5]"
              >
                <option value="All">All Countries</option>
                <option value="Italy">Italy</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="UK">United Kingdom</option>
              </select>

              <div className="flex items-center border border-[#e2e8f0] rounded-[6px] p-0.5 bg-slate-100">
                <button
                  onClick={() => setViewMode('matrix')}
                  title="Counselling Matrix (Table)"
                  className={`p-1.5 rounded-[4px] transition-colors ${
                    viewMode === 'matrix' ? 'bg-white shadow-xs text-[#087cf5]' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  title="Advisory Cards (Grid)"
                  className={`p-1.5 rounded-[4px] transition-colors ${
                    viewMode === 'cards' ? 'bg-white shadow-xs text-[#087cf5]' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ============================================== */}
          {/* VIEW MODE 1: COUNSELLING MATRIX (TABLE)        */}
          {/* ============================================== */}
          {viewMode === 'matrix' && (
            <div className="bg-white rounded-[10px] border border-[#e2e8f0] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                      <th className="py-3 px-3.5"># Student ID</th>
                      <th className="py-3 px-3.5">Candidate & Contact</th>
                      <th className="py-3 px-3.5">Destination & Budget</th>
                      <th className="py-3 px-3.5">Course Focus & Track</th>
                      <th className="py-3 px-3.5">Session Schedule</th>
                      <th className="py-3 px-3.5">Eligibility Check</th>
                      <th className="py-3 px-3.5">Assigned Counsellor</th>
                      <th className="py-3 px-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0] text-xs">
                    {filteredCandidates.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-500">
                          <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm font-semibold text-slate-700">No students currently in Counselling stage</p>
                          <p className="text-xs text-slate-400 mt-1">Students enrolled for counselling will appear here automatically.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredCandidates.map((st) => {
                      const cgpaVal = parseFloat(st.academic.cgpa) || 7.5;
                      const isCleared = cgpaVal >= 7.8;
                      const hasSessionToday = st.nextFollowUp.toLowerCase().includes('today');

                      return (
                        <tr
                          key={st.id}
                          className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                          onClick={() => handleOpenStudent(st)}
                        >
                          {/* Student ID */}
                          <td className="py-3.5 px-3.5 font-bold text-[#101d37]">
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[11px]">
                              {st.studentId}
                            </span>
                          </td>

                          {/* Candidate & Contact */}
                          <td className="py-3.5 px-3.5">
                            <div className="flex items-center gap-2.5">
                              <StudentAvatar
                                name={st.name}
                                src={st.avatar}
                                className="w-9 h-9 aspect-square rounded-full object-cover border border-slate-200 shrink-0 text-[10px]"
                              />
                              <div>
                                <div className="font-bold text-[#101d37] group-hover:text-[#087cf5] transition-colors">
                                  {st.name}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {st.phone} • {st.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Destination & Budget */}
                          <td className="py-3.5 px-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#101d37]">{st.country}</span>
                              <span className="text-[10.5px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                                {st.intake}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                              Budget: {st.academic.budget || '€10,000/yr'}
                            </div>
                          </td>

                          {/* Course Track */}
                          <td className="py-3.5 px-3.5">
                            <div className="font-semibold text-slate-800 truncate max-w-[200px]">
                              {st.preferredCourse}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {st.courseLevel} • {st.academic.highestQualification}
                            </div>
                          </td>

                          {/* Session Schedule */}
                          <td className="py-3.5 px-3.5">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 ${
                                  hasSessionToday
                                    ? 'bg-blue-50 text-[#087cf5] border border-blue-200'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                <Clock className="w-3 h-3" />
                                <span>{st.nextFollowUp}</span>
                              </span>
                            </div>
                            <div className="text-[10.5px] text-slate-400 mt-0.5">1-on-1 Consultation</div>
                          </td>

                          {/* Eligibility Check */}
                          <td className="py-3.5 px-3.5">
                            {isCleared ? (
                              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Eligible (GPA {st.academic.cgpa})</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                <AlertCircle className="w-3 h-3" />
                                <span>Review Required</span>
                              </div>
                            )}
                            <div className="text-[10.5px] text-slate-500 mt-0.5">{st.academic.englishTest}</div>
                          </td>

                          {/* Counsellor */}
                          <td className="py-3.5 px-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">
                                {st.counsellor ? st.counsellor[0] : 'C'}
                              </span>
                              <span className="font-semibold text-slate-700">{st.counsellor}</span>
                            </div>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenStudent(st);
                                }}
                                className="px-2.5 py-1 rounded-[5px] bg-[#f1f5f9] hover:bg-slate-200 text-[#101d37] font-semibold text-xs transition-colors flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3 text-[#087cf5]" />
                                <span>Advisory Desk</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAdvanceToShortlisting(st);
                                }}
                                className="px-2.5 py-1 rounded-[5px] bg-[#087cf5] hover:bg-[#006ee6] text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs"
                                title="Complete Counselling & Forward to University Shortlisting (Stage 2)"
                              >
                                <span>To Shortlisting</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================== */}
          {/* VIEW MODE 2: ADVISORY CARDS (GRID)             */}
          {/* ============================================== */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredCandidates.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-[10px] border border-[#e2e8f0]">
                  <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No students currently in Counselling stage</p>
                  <p className="text-xs text-slate-400 mt-1">Students enrolled for counselling will appear here automatically.</p>
                </div>
              ) : (
                filteredCandidates.map((st) => {
                const cgpaVal = parseFloat(st.academic.cgpa) || 7.5;
                const isCleared = cgpaVal >= 7.8;

                return (
                  <div
                    key={st.id}
                    className="bg-white rounded-[10px] border border-[#e2e8f0] p-4 shadow-xs hover:border-[#087cf5]/50 transition-all space-y-3 cursor-pointer group"
                    onClick={() => handleOpenStudent(st)}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                        {st.studentId}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{st.nextFollowUp}</span>
                      </span>
                    </div>

                    {/* Candidate Identity */}
                    <div className="flex items-center gap-2.5">
                      <StudentAvatar
                        name={st.name}
                        src={st.avatar}
                        className="w-10 h-10 aspect-square rounded-full object-cover border border-slate-200 shrink-0 text-[11px]"
                      />
                      <div>
                        <div className="font-bold text-sm text-[#101d37] group-hover:text-[#087cf5] transition-colors">
                          {st.name}
                        </div>
                        <div className="text-[11px] text-slate-500">{st.email}</div>
                      </div>
                    </div>

                    {/* Destination & Target Box */}
                    <div className="bg-[#f8fafc] p-2.5 rounded-[7px] border border-slate-100 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Destination:</span>
                        <span className="font-bold text-slate-800">{st.country} ({st.intake})</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Target Track:</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[170px]">
                          {st.preferredCourse}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Academic Score:</span>
                        <span className="font-semibold text-slate-800">
                          {st.academic.cgpa} ({st.academic.highestQualification})
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Language:</span>
                        <span className="font-semibold text-slate-800">{st.academic.englishTest}</span>
                      </div>
                    </div>

                    {/* Eligibility Badge & Counsellor Tag */}
                    <div className="flex items-center justify-between text-xs pt-0.5">
                      {isCleared ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Eligibility Cleared</span>
                        </span>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-200 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Evaluation Review</span>
                        </span>
                      )}

                      <span className="text-slate-500 text-[11px] font-medium">
                        Advisor: <span className="text-slate-800 font-semibold">{st.counsellor}</span>
                      </span>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenStudent(st);
                        }}
                        className="flex-1 py-1.5 rounded-[5px] bg-slate-100 hover:bg-slate-200 text-[#101d37] text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#087cf5]" />
                        <span>Advisory Desk</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAdvanceToShortlisting(st);
                        }}
                        className="flex-1 py-1.5 rounded-[5px] bg-[#087cf5] hover:bg-[#006ee6] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1 shadow-xs"
                      >
                        <span>To Shortlisting</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 2: STUDENT COUNSELLING PROFILE PREVIEW              */}
      {/* ======================================================== */}
      {selectedStudent && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          {/* Top Breadcrumb & Switcher Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-[9px] border border-[#e2e8f0] shadow-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={handleBackToList}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#e2e8f0] bg-white hover:bg-slate-50 text-xs font-semibold text-[#101d37] shadow-xs transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← Back to Counselling Directory</span>
              </button>

              <span className="text-xs text-[#64748b] hidden sm:inline">
                Pipeline &gt; Stage 1 Counselling &gt;{' '}
                <span className="font-bold text-[#101d37]">{selectedStudent.name}</span>{' '}
                <span className="text-[#64748b]">({selectedStudent.studentId})</span>
              </span>
            </div>

            {/* Quick Switcher dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#64748b] hidden md:inline">Switch Candidate:</span>
              <select
                value={selectedStudent.studentId}
                onChange={(e) => {
                  const target = candidateList.find((s) => s.studentId === e.target.value);
                  if (target) handleOpenStudent(target);
                }}
                className="bg-white border border-[#e2e8f0] rounded-[6px] px-2.5 py-1 text-xs font-semibold text-[#101d37] outline-none"
              >
                {candidateList.map((st) => (
                  <option key={st.studentId} value={st.studentId}>
                    {st.name} ({st.studentId} - {st.country})
                  </option>
                ))}
              </select>

              <a
                href={`tel:${selectedStudent.phone.replace(/[^0-9+]/g, '')}`}
                className="p-1.5 rounded-[6px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                title="Call Candidate"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Candidate Profile Header Card */}
          <div className="bg-white p-4 rounded-[10px] border border-[#e2e8f0] shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <StudentAvatar
                  name={selectedStudent.name}
                  src={selectedStudent.avatar}
                  className="w-14 h-14 aspect-square rounded-full object-cover border-2 border-slate-200 shadow-xs shrink-0 text-base"
                />
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg font-bold text-[#101d37]">{selectedStudent.name}</h2>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      {selectedStudent.studentId}
                    </span>
                    <span className="text-[11px] font-semibold text-[#087cf5] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                      Stage 1: Counselling In Progress
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                    <span>📞 {selectedStudent.phone}</span>
                    <span>✉️ {selectedStudent.email}</span>
                    <span>📍 {selectedStudent.address}</span>
                    <span>🎓 Enrolled: {selectedStudent.enrollmentDate}</span>
                  </div>
                </div>
              </div>

              {/* Counsellor in charge */}
              <div className="bg-[#f8fafc] p-3 rounded-[8px] border border-slate-200 flex items-center gap-3 self-start md:self-auto">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-[#087cf5] flex items-center justify-center font-bold text-sm">
                  {selectedStudent.counsellor ? selectedStudent.counsellor[0] : 'C'}
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Senior Counsellor</div>
                  <div className="text-xs font-bold text-[#101d37]">{selectedStudent.counsellor}</div>
                  <div className="text-[10.5px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Active Advisory Lead</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STAGE ADVANCEMENT ACTION BANNER (The Linkage to Process) */}
          <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 rounded-[10px] p-4 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-wide">
                  Milestone Completed
                </span>
                <h3 className="text-sm font-bold text-white">Counselling Consultation Finalized</h3>
              </div>
              <p className="text-xs text-slate-200 max-w-2xl leading-relaxed">
                Academic eligibility cleared, destination finalized for <strong>{selectedStudent.country}</strong>, and program track confirmed for <strong>{selectedStudent.preferredCourse}</strong>. Advance this candidate to Stage 2 to begin university shortlisting.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleAdvanceToShortlisting(selectedStudent)}
                className="px-4 py-2.5 rounded-[7px] bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2"
              >
                <span>Complete Counselling & Advance to Shortlisting</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Advisory Workspace Tabs */}
          <div className="flex items-center gap-2 border-b border-[#e2e8f0] pb-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('evaluation')}
              className={`px-3 py-1.5 rounded-[6px] transition-colors flex items-center gap-1.5 ${
                activeTab === 'evaluation'
                  ? 'bg-[#101d37] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-[#e2e8f0]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>1. Profile & Eligibility Assessment</span>
            </button>

            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-3 py-1.5 rounded-[6px] transition-colors flex items-center gap-1.5 ${
                activeTab === 'sessions'
                  ? 'bg-[#101d37] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-[#e2e8f0]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>2. 1-on-1 Sessions & Advisory Log ({currentSessions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('roadmap')}
              className={`px-3 py-1.5 rounded-[6px] transition-colors flex items-center gap-1.5 ${
                activeTab === 'roadmap'
                  ? 'bg-[#101d37] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-[#e2e8f0]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>3. Target Destination & Program Roadmap</span>
            </button>
          </div>

          {/* TAB 1: ELIGIBILITY & ACADEMIC EVALUATION */}
          {activeTab === 'evaluation' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Left 2 Cols: Evaluation Checks */}
              <div className="md:col-span-2 space-y-3.5">
                <div className="bg-white p-4 rounded-[10px] border border-[#e2e8f0] shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="font-bold text-sm text-[#101d37] flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#087cf5]" />
                      <span>Academic Eligibility & Criteria Scorecard</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      Criteria Met
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Qualification */}
                    <div className="p-3 rounded-[8px] bg-slate-50 border border-slate-200/70 space-y-1">
                      <div className="text-slate-500 font-medium">Undergraduate Degree</div>
                      <div className="font-bold text-[#101d37]">{selectedStudent.academic.highestQualification}</div>
                      <div className="text-[11px] text-slate-500">{selectedStudent.academic.university} ({selectedStudent.academic.passingYear})</div>
                    </div>

                    {/* CGPA */}
                    <div className="p-3 rounded-[8px] bg-slate-50 border border-slate-200/70 space-y-1">
                      <div className="text-slate-500 font-medium">CGPA / Percentage Score</div>
                      <div className="font-bold text-emerald-700 text-sm flex items-center gap-1.5">
                        <span>{selectedStudent.academic.cgpa}</span>
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-100/60 px-1.5 py-0.2 rounded">
                          First Class
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">Above minimum university cutoff (7.0 / 10)</div>
                    </div>

                    {/* English Proficiency */}
                    <div className="p-3 rounded-[8px] bg-slate-50 border border-slate-200/70 space-y-1">
                      <div className="text-slate-500 font-medium">English Language Competency</div>
                      <div className="font-bold text-[#101d37]">{selectedStudent.academic.englishTest}</div>
                      <div className="text-[11px] text-emerald-600 font-medium">Waiver / Test Score Accepted</div>
                    </div>

                    {/* Work Experience */}
                    <div className="p-3 rounded-[8px] bg-slate-50 border border-slate-200/70 space-y-1">
                      <div className="text-slate-500 font-medium">Relevant Work Experience</div>
                      <div className="font-bold text-[#101d37]">{selectedStudent.academic.workExperience || 'Fresher'}</div>
                      <div className="text-[11px] text-slate-500">Technical project credits evaluated</div>
                    </div>
                  </div>

                  {/* 4 Essential Regulatory Verifications */}
                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-bold text-[#101d37]">Pre-Screening Verification Checklist</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2 p-2 rounded bg-emerald-50/60 border border-emerald-100 text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>15+ Years Education (Bologna Treaty Compatible)</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded bg-emerald-50/60 border border-emerald-100 text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Core Subject Credit Hours Verified</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded bg-emerald-50/60 border border-emerald-100 text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Proof of Funds Budget Viability Cleared</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded bg-emerald-50/60 border border-emerald-100 text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Regional Scholarship Eligibility Assessed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Col: Budget & Intake Overview */}
              <div className="space-y-3.5">
                <div className="bg-white p-4 rounded-[10px] border border-[#e2e8f0] shadow-xs space-y-3.5">
                  <div className="font-bold text-sm text-[#101d37] flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    <span>Financial & Budget Summary</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Annual Budget:</span>
                      <span className="font-bold text-slate-800">{selectedStudent.academic.budget || '€10,000 – €14,000'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Target Intake:</span>
                      <span className="font-bold text-[#087cf5]">{selectedStudent.intake}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Service Package:</span>
                      <span className="font-semibold text-slate-800">{selectedStudent.payment?.servicePackage || 'Comprehensive Study Abroad'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Agreement Status:</span>
                      <span className="font-bold text-emerald-600">{selectedStudent.payment?.agreementStatus || 'Signed'}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-[8px] bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Counsellor Advisory Note</span>
                    </div>
                    <p className="text-[11.5px] leading-relaxed text-amber-800">
                      Candidate is qualified for public university tuition waivers and regional stipend awards (up to €8,500/yr). Advised to prioritize applications within round 1 window.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COUNSELLING SESSIONS & LOG */}
          {activeTab === 'sessions' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Left 2 Cols: Session History */}
              <div className="md:col-span-2 space-y-3.5">
                <div className="bg-white p-4 rounded-[10px] border border-[#e2e8f0] shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="font-bold text-sm text-[#101d37] flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#087cf5]" />
                      <span>1-on-1 Consultation History & Notes</span>
                    </div>
                    <span className="text-xs text-slate-500">{currentSessions.length} Recorded Sessions</span>
                  </div>

                  <div className="space-y-3">
                    {currentSessions.map((cs) => (
                      <div
                        key={cs.id}
                        className="p-3.5 rounded-[8px] border border-slate-200 bg-[#f8fafc] space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-xs text-[#101d37]">{cs.title}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {cs.date} • {cs.time} • Conducted via {cs.type} by{' '}
                              <strong className="text-slate-700">{cs.counsellor}</strong>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                              cs.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-blue-50 text-[#087cf5] border border-blue-200'
                            }`}
                          >
                            {cs.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed bg-white p-2.5 rounded border border-slate-100">
                          {cs.summary}
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {cs.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200/80 text-slate-700"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Col: Add New Consultation Note */}
              <div className="space-y-3.5">
                <div className="bg-white p-4 rounded-[10px] border border-[#e2e8f0] shadow-xs space-y-3.5">
                  <div className="font-bold text-sm text-[#101d37] flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Plus className="w-4 h-4 text-[#087cf5]" />
                    <span>Add Counselling Note</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Category Tag
                      </label>
                      <select
                        value={newNoteTag}
                        onChange={(e) => setNewNoteTag(e.target.value)}
                        className="w-full text-xs p-2 bg-[#f8fafc] border border-slate-200 rounded-[6px] focus:outline-none focus:border-[#087cf5]"
                      >
                        <option value="Destination Finalized">Destination Finalized</option>
                        <option value="Parent Call Complete">Parent Call Complete</option>
                        <option value="Curriculum Aligned">Curriculum Aligned</option>
                        <option value="Budget Approved">Budget Approved</option>
                        <option value="Ready For Documentation">Ready For Documentation</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Consultation Summary / Action Item
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Enter key discussion points, student preferences, or next steps..."
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        className="w-full text-xs p-2.5 bg-[#f8fafc] border border-slate-200 rounded-[6px] focus:outline-none focus:border-[#087cf5]"
                      />
                    </div>

                    <button
                      onClick={handleAddSessionNote}
                      className="w-full py-2 rounded-[6px] bg-[#101d37] hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs"
                    >
                      Save Consultation Note
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TARGET ROADMAP */}
          {activeTab === 'roadmap' && (
            <div className="bg-white p-4 rounded-[10px] border border-[#e2e8f0] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="font-bold text-sm text-[#101d37] flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#087cf5]" />
                  <span>Agreed Destination & University Application Roadmap</span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-[#087cf5] rounded-full">
                  Destination: {selectedStudent.country}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                {/* Primary Destination */}
                <div className="p-3.5 rounded-[8px] bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Primary Country</span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">Tier 1 Preference</span>
                  </div>
                  <div className="font-bold text-[#101d37] text-sm">{selectedStudent.country}</div>
                  <p className="text-[11.5px] text-slate-600">
                    Target programs evaluated for {selectedStudent.intake} intake with English medium instruction.
                  </p>
                  <div className="pt-1 text-[11px] text-slate-500">
                    Target University: <strong className="text-slate-800">{selectedStudent.targetUniversity}</strong>
                  </div>
                </div>

                {/* Primary Program Track */}
                <div className="p-3.5 rounded-[8px] bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Preferred Track</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Specialization</span>
                  </div>
                  <div className="font-bold text-[#101d37] text-sm">{selectedStudent.preferredCourse}</div>
                  <p className="text-[11.5px] text-slate-600">
                    Level: {selectedStudent.courseLevel} Degree • 2 Years Full-Time.
                  </p>
                  <div className="pt-1 text-[11px] text-slate-500">
                    Backup Tracks: {selectedStudent.alternativeCourses.join(', ') || 'General Engineering'}
                  </div>
                </div>

                {/* Next Stage Readiness */}
                <div className="p-3.5 rounded-[8px] bg-blue-50/50 border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#087cf5]">Stage 2 Handoff</span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-[#087cf5] font-bold text-[10px]">Shortlisting</span>
                  </div>
                  <div className="font-bold text-[#101d37] text-sm">University Shortlisting</div>
                  <p className="text-[11.5px] text-slate-600">
                    Once advanced, the shortlisting team will curate target universities, match program eligibility, and evaluate grade cutoff criteria.
                  </p>
                  <button
                    onClick={() => handleAdvanceToShortlisting(selectedStudent)}
                    className="w-full mt-1 py-1.5 rounded-[5px] bg-[#087cf5] hover:bg-[#006ee6] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1 shadow-xs"
                  >
                    <span>Proceed to University Shortlisting</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Floating Modal Card */}
      {confirmModalData && (
        <ActionConfirmModal
          isOpen={confirmModalData.isOpen}
          onClose={() => setConfirmModalData(null)}
          onConfirm={() => {
            confirmModalData.onConfirm();
            setConfirmModalData(null);
          }}
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
        />
      )}
    </div>
  );
};
