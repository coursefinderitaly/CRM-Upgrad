import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye as EyeIcon } from 'lucide-react';
import { StudentRecord, INITIAL_STUDENTS } from '../services/studentsData';
import { ActionConfirmModal } from '../components/modals/ActionConfirmModal';

interface UniversityShortlistingViewProps {
  students?: StudentRecord[];
  onAdvanceStage?: (studentId: string, targetStageIdOrNumber?: any) => any;
  onForwardToApplications?: () => void;
  onNavigate?: (route: string) => void;
}
import {
  Search,
  Filter,
  RotateCcw,
  Plus,
  Eye,
  MoreVertical,
  X,
  Bookmark,
  Scale,
  Send,
  MapPin,
  Trophy,
  Landmark,
  Languages,
  Calendar,
  CreditCard,
  Euro,
  Clock,
  ExternalLink,
  ThumbsUp,
  User,
  Check,
  CheckCircle2,
  LayoutGrid,
  List,
  Sparkles,
  Lock,
  Star,
  Target,
  GraduationCap,
  ArrowRight,
} from 'lucide-react';

interface UniversityItem {
  id: string;
  name: string;
  logo: string;
  type: string;
  city: string;
  country: string;
  course: string;
  tuitionFee: string;
  tuitionFeeVal: number;
  appFee: string;
  deadline: string;
  eligibility: string;
  status: 'Shortlisted' | 'Recommended' | 'Comparing' | 'Ready' | 'Student Selected';
  selectedForCompare?: boolean;
  qsRank: string;
  languages: string;
  duration: string;
  intake: string;
  about: string;
}

const INITIAL_UNIVERSITIES: UniversityItem[] = [
  {
    id: 'padova',
    name: 'University of Padova',
    logo: '/logo_padova.png',
    type: 'Public University',
    city: 'Padova',
    country: 'Italy',
    course: 'MSc Computer Science',
    tuitionFee: '€2,400',
    tuitionFeeVal: 2400,
    appFee: '€30',
    deadline: '31 Mar 2026',
    eligibility: "Relevant Bachelor's",
    status: 'Shortlisted',
    selectedForCompare: false,
    qsRank: '#236 (2024)',
    languages: 'Italian / English',
    duration: '2 Years',
    intake: 'September 2026',
    about:
      'The University of Padova is one of the oldest and most prestigious universities in the world, known for its strong research culture and high-quality education. It offers a wide range of programs in science, technology and humanities, with a vibrant international student community.',
  },
  {
    id: 'torino',
    name: 'Politecnico di Torino',
    logo: '/logo_torino.png',
    type: 'Public University',
    city: 'Turin',
    country: 'Italy',
    course: 'MSc Computer Science',
    tuitionFee: '€3,900',
    tuitionFeeVal: 3900,
    appFee: '€50',
    deadline: '30 Apr 2026',
    eligibility: "Relevant Bachelor's",
    status: 'Recommended',
    selectedForCompare: false,
    qsRank: '#252 (2024)',
    languages: 'English',
    duration: '2 Years',
    intake: 'September 2026',
    about:
      'Politecnico di Torino is Italy’s oldest technical university, internationally renowned for engineering, architecture, and technology programs with direct industry placement partnerships.',
  },
  {
    id: 'bologna',
    name: 'University of Bologna',
    logo: '/logo_bologna.png',
    type: 'Public University',
    city: 'Bologna',
    country: 'Italy',
    course: 'MSc Computer Science',
    tuitionFee: '€3,000',
    tuitionFeeVal: 3000,
    appFee: '€50',
    deadline: '30 Apr 2026',
    eligibility: "Relevant Bachelor's",
    status: 'Comparing',
    selectedForCompare: true,
    qsRank: '#133 (2024)',
    languages: 'Italian / English',
    duration: '2 Years',
    intake: 'September 2026',
    about:
      'Founded in 1088, the University of Bologna is the oldest continuously operating university in the world, leading in computer science research and European academic prestige.',
  },
  {
    id: 'sapienza',
    name: 'Sapienza University of Rome',
    logo: '/logo_sapienza.png',
    type: 'Public University',
    city: 'Rome',
    country: 'Italy',
    course: 'MSc Computer Science',
    tuitionFee: '€2,800',
    tuitionFeeVal: 2800,
    appFee: '€50',
    deadline: '31 Mar 2026',
    eligibility: "Relevant Bachelor's",
    status: 'Comparing',
    selectedForCompare: true,
    qsRank: '#134 (2024)',
    languages: 'Italian / English',
    duration: '2 Years',
    intake: 'September 2026',
    about:
      'Sapienza University of Rome is one of the largest European universities, boasting top global faculty, extensive library networks, and specialized AI labs in the heart of Rome.',
  },
  {
    id: 'milan',
    name: 'University of Milan',
    logo: '/logo_milan.png',
    type: 'Public University',
    city: 'Milan',
    country: 'Italy',
    course: 'MSc Computer Science',
    tuitionFee: '€3,500',
    tuitionFeeVal: 3500,
    appFee: '€50',
    deadline: '30 Apr 2026',
    eligibility: "Relevant Bachelor's",
    status: 'Ready',
    selectedForCompare: false,
    qsRank: '#276 (2024)',
    languages: 'English',
    duration: '2 Years',
    intake: 'September 2026',
    about:
      'The University of Milan is a research-intensive institution located in Italy’s financial and tech capital, offering strong corporate ties and generous regional scholarship schemes.',
  },
];

export const UniversityShortlistingView: React.FC<UniversityShortlistingViewProps> = ({
  students,
  onAdvanceStage,
  onForwardToApplications,
  onNavigate,
}) => {
  const studentList = students && students.length > 0 ? students : INITIAL_STUDENTS;

  // Navigation State: Directory List vs Student Shortlist Profile
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  // Directory Filters & View Mode
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('matrix');
  const [dirSearchQuery, setDirSearchQuery] = useState('');
  const [dirCountryFilter, setDirCountryFilter] = useState('All');
  const [dirStatusFilter, setDirStatusFilter] = useState('All');
  const [dirTabFilter, setDirTabFilter] = useState<'All' | 'Approved' | 'Ready' | 'In Review' | 'Locked'>('All');
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
      if (hash.startsWith('#university-shortlisting') && hash.includes('?id=')) {
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
    window.location.hash = `university-shortlisting?id=${st.studentId}`;
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
    window.location.hash = 'university-shortlisting';
  };

  // Helper for student shortlisting status
  const getShortlistStatus = (st: StudentRecord) => {
    if (st.stageNumber >= 7) return { status: 'Final Locked', count: 5, color: 'bg-purple-50 text-purple-700 border-purple-200' };
    if (st.stageNumber >= 3) return { status: 'Approved by Student', count: 4, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (st.stageNumber === 2) return { status: 'Shortlist Ready', count: 4, color: 'bg-blue-50 text-[#087cf5] border-blue-200' };
    return { status: 'In Review', count: 2, color: 'bg-amber-50 text-amber-700 border-amber-200' };
  };

  // Helper for 3-tier university portfolio details
  const getStudentPortfolio = (st: StudentRecord) => {
    const gpa = parseFloat(st.academic.cgpa) || 8.0;
    const isHighGpa = gpa >= 8.2 || gpa >= 3.5;
    const stage = st.stageNumber;

    if (st.country === 'Italy') {
      return {
        dream: 'PoliMi (MSc AI)',
        target: ['Uni Padova (MSc CS)', 'Uni Bologna (MSc CS)'],
        safe: 'Sapienza Rome (MSc CS)',
        matchScore: isHighGpa ? '96%' : '88%',
        matchLabel: isHighGpa ? 'Strong Academic Fit' : 'Target Match',
        matchColor: isHighGpa ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-[#087cf5] border-blue-200',
        consentStatus: stage >= 3 ? 'Signed (Digital OTP)' : stage === 2 ? 'Awaiting Sign-off' : 'Drafting',
        consentBadge: stage >= 3 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200',
        deadline: '31 Mar (Padova)',
        daysLeft: 28,
        annualTuition: '€2,400 - €3,900',
        budgetFit: 'Well within budget',
      };
    }
    if (st.country === 'Germany') {
      return {
        dream: 'TU Munich (Informatics)',
        target: ['RWTH Aachen (CS)', 'TU Berlin (Data)'],
        safe: 'FAU Erlangen',
        matchScore: isHighGpa ? '94%' : '85%',
        matchLabel: isHighGpa ? 'Direct Admission Fit' : 'Conditional Match',
        matchColor: isHighGpa ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200',
        consentStatus: stage >= 4 ? 'Signed (Digital OTP)' : 'Awaiting Sign-off',
        consentBadge: stage >= 4 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200',
        deadline: '15 May (TUM)',
        daysLeft: 72,
        annualTuition: '€0 Tuition (Public)',
        budgetFit: 'Semester fee €350',
      };
    }
    if (st.country === 'UK') {
      return {
        dream: 'Univ. Manchester (Adv CS)',
        target: ["King's College London", 'Univ. Sheffield'],
        safe: 'Univ. Birmingham',
        matchScore: isHighGpa ? '92%' : '84%',
        matchLabel: 'Russell Group Fit',
        matchColor: 'bg-blue-50 text-[#087cf5] border-blue-200',
        consentStatus: stage >= 4 ? 'Signed (Digital OTP)' : 'Awaiting Sign-off',
        consentBadge: stage >= 4 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200',
        deadline: '15 Jun (Manchester)',
        daysLeft: 98,
        annualTuition: '£26,000/yr',
        budgetFit: 'Budget Approved',
      };
    }
    return {
      dream: 'Sorbonne University (Data)',
      target: ['Univ. Paris-Saclay', 'Univ. Strasbourg'],
      safe: 'Univ. Lille',
      matchScore: '90%',
      matchLabel: 'Campus France Fit',
      matchColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      consentStatus: stage >= 4 ? 'Signed (Digital OTP)' : 'Awaiting Sign-off',
      consentBadge: stage >= 4 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200',
      deadline: '30 Apr (Saclay)',
      daysLeft: 58,
      annualTuition: '€3,770/yr',
      budgetFit: 'Affordable Public',
    };
  };

  const dirFilteredStudents = studentList.filter((st) => {
    const info = getShortlistStatus(st);
    const matchesSearch =
      st.name.toLowerCase().includes(dirSearchQuery.toLowerCase()) ||
      st.studentId.toLowerCase().includes(dirSearchQuery.toLowerCase()) ||
      st.phone.includes(dirSearchQuery) ||
      st.preferredCourse.toLowerCase().includes(dirSearchQuery.toLowerCase()) ||
      st.targetUniversity.toLowerCase().includes(dirSearchQuery.toLowerCase());

    const matchesCountry = dirCountryFilter === 'All' || st.country === dirCountryFilter;
    const matchesStatus = dirStatusFilter === 'All' || info.status === dirStatusFilter;

    let matchesTab = true;
    if (dirTabFilter === 'Approved') matchesTab = info.status === 'Approved by Student';
    else if (dirTabFilter === 'Ready') matchesTab = info.status === 'Shortlist Ready';
    else if (dirTabFilter === 'In Review') matchesTab = info.status === 'In Review';
    else if (dirTabFilter === 'Locked') matchesTab = info.status === 'Final Locked';

    return matchesSearch && matchesCountry && matchesStatus && matchesTab;
  });

  const shortCounts = {
    All: studentList.length,
    Approved: studentList.filter((st) => getShortlistStatus(st).status === 'Approved by Student').length,
    Ready: studentList.filter((st) => getShortlistStatus(st).status === 'Shortlist Ready').length,
    InReview: studentList.filter((st) => getShortlistStatus(st).status === 'In Review').length,
    Locked: studentList.filter((st) => getShortlistStatus(st).status === 'Final Locked').length,
  };
  const [universities, setUniversities] = useState<UniversityItem[]>(INITIAL_UNIVERSITIES);
  const [selectedUniId, setSelectedUniId] = useState<string>('padova');
  const [activeSubTab, setActiveSubTab] = useState<
    'Overview' | 'Courses' | 'Admission Requirements' | 'Fees' | 'Deadlines' | 'Scholarships'
  >('Overview');

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('Italy');
  const [courseFilter, setCourseFilter] = useState('MSc Computer Science');
  const [feeFilter, setFeeFilter] = useState('Any');
  const [cityFilter, setCityFilter] = useState('Any');
  const [typeFilter, setTypeFilter] = useState('Public Universities');
  const [deadlineFilter, setDeadlineFilter] = useState('Any');
  const [onlyShortlisted, setOnlyShortlisted] = useState(false);

  // Compare & Modals state
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showAddUniModal, setShowAddUniModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedUni = universities.find((u) => u.id === selectedUniId) || universities[0];

  const compareList = universities.filter((u) => u.selectedForCompare);

  const handleToggleCompare = (id: string) => {
    setUniversities((prev) =>
      prev.map((u) => (u.id === id ? { ...u, selectedForCompare: !u.selectedForCompare } : u))
    );
  };

  const handleRemoveCompare = (id: string) => {
    setUniversities((prev) =>
      prev.map((u) => (u.id === id ? { ...u, selectedForCompare: false } : u))
    );
  };

  const handleToggleShortlist = (id: string) => {
    setUniversities((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextStatus = u.status === 'Shortlisted' ? 'Ready' : 'Shortlisted';
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
    showToast('University shortlist status updated');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered universities
  const filteredUniversities = universities.filter((u) => {
    if (onlyShortlisted && u.status !== 'Shortlisted') return false;
    if (searchQuery && !u.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (cityFilter !== 'Any' && u.city !== cityFilter) return false;
    return true;
  });

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setCountryFilter('Italy');
    setCourseFilter('MSc Computer Science');
    setFeeFilter('Any');
    setCityFilter('Any');
    setTypeFilter('Public Universities');
    setDeadlineFilter('Any');
    setOnlyShortlisted(false);
  };

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

      {/* ======================================================== */}
      {/* MODE 1: UNIVERSITY SHORTLISTING DIRECTORY (LIST VIEW)   */}
      {/* ======================================================== */}
      {!selectedStudent && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#087cf5] text-white flex items-center justify-center shadow-xs">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[17px] font-bold text-[#101d37] leading-tight">University Shortlisting Directory</h1>
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-[#087cf5] text-[10px] font-bold border border-blue-200">
                    <Sparkles className="w-3 h-3" /> 3-Tier Strategy Engine
                  </span>
                </div>
                <p className="text-[11.5px] text-[#64748b] leading-tight mt-0.5">
                  Portfolio balance: 🌟 1 Ambitious (Reach) • 🎯 2 Target (Solid Match) • 🛡️ 1 Safe (Guaranteed Backup)
                </p>
              </div>
            </div>

            <div className="text-[11.5px] text-[#64748b] hidden sm:inline">
              Home &gt; <span className="font-semibold text-[#101d37]">Shortlisting Directory</span>
            </div>
          </div>

          {/* 5 KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Total Portfolios</span>
              <div className="text-[19px] font-bold text-[#101d37] mt-0.5">{shortCounts.All}</div>
              <span className="text-[10px] text-[#087cf5] font-semibold">● Active Candidate Pool</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Student Consent Signed</span>
              <div className="text-[19px] font-bold text-emerald-600 mt-0.5">{shortCounts.Approved}</div>
              <span className="text-[10px] text-emerald-600 font-semibold">✓ Digital OTP Verified</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Shortlist Ready</span>
              <div className="text-[19px] font-bold text-[#087cf5] mt-0.5">{shortCounts.Ready}</div>
              <span className="text-[10px] text-[#64748b]">Awaiting Candidate</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">In Discussion</span>
              <div className="text-[19px] font-bold text-[#ea580c] mt-0.5">{shortCounts.InReview}</div>
              <span className="text-[10px] text-[#ea580c] font-medium">Re-evaluating options</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Final Locked</span>
              <div className="text-[19px] font-bold text-purple-600 mt-0.5">{shortCounts.Locked}</div>
              <span className="text-[10px] text-purple-600 font-medium">Ready for Applications</span>
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              {/* Quick Tab Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11.5px]">
                {[
                  { id: 'All', label: `All Portfolios (${shortCounts.All})` },
                  { id: 'Approved', label: `Consent Signed (${shortCounts.Approved})` },
                  { id: 'Ready', label: `Shortlist Ready (${shortCounts.Ready})` },
                  { id: 'In Review', label: `In Discussion (${shortCounts.InReview})` },
                  { id: 'Locked', label: `Final Locked (${shortCounts.Locked})` },
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
                    title="Shortlist Matrix View"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Matrix</span>
                  </button>
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-[5px] text-[11.5px] font-semibold transition-all ${
                      viewMode === 'cards' ? 'bg-white text-[#087cf5] shadow-xs' : 'text-[#64748b] hover:text-[#101d37]'
                    }`}
                    title="Portfolio Cards View"
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
                  <span>Sample Shortlist ({studentList[0]?.name || 'Rahul Sharma'})</span>
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
                  placeholder="Search student by name, ID, phone, target course, or university..."
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
                  <option value="All">All Approval Statuses</option>
                  <option value="Approved by Student">Approved by Student</option>
                  <option value="Shortlist Ready">Shortlist Ready</option>
                  <option value="In Review">In Review</option>
                  <option value="Final Locked">Final Locked</option>
                </select>
              </div>
            </div>
          </div>

          {/* Directory Content: Matrix Table or Portfolio Cards */}
          {viewMode === 'matrix' ? (
            <div className="bg-white rounded-[8px] border border-[#e5edf5] shadow-xs overflow-hidden flex flex-col">
              <div className="overflow-x-auto overflow-y-auto max-h-[640px] scrollbar-thin">
                <table className="w-full text-left text-[12px] border-collapse min-w-[1260px]">
                  <thead className="sticky top-0 bg-[#f8fafc] z-10 border-b border-[#e5edf5] shadow-2xs">
                    <tr className="text-[#52627a] font-bold text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-3 text-center w-12 shrink-0">#</th>
                      <th className="py-3 px-3 min-w-[270px]">Student & Academic Profile</th>
                      <th className="py-3 px-3 min-w-[210px]">Destination & Budget</th>
                      <th className="py-3 px-3 min-w-[340px]">3-Tier University Portfolio</th>
                      <th className="py-3 px-3 min-w-[160px] text-center">Academic Match</th>
                      <th className="py-3 px-3 min-w-[150px] text-center">Student Consent</th>
                      <th className="py-3 px-3 min-w-[150px] text-center">Earliest Deadline</th>
                      <th className="py-3 px-3 min-w-[130px] text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dirFilteredStudents.length > 0 ? (
                      dirFilteredStudents.map((st, idx) => {
                        const pf = getStudentPortfolio(st);
                        return (
                          <tr
                            key={st.id}
                            onClick={() => handleOpenStudent(st)}
                            className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
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
                                  {st.country === 'Italy' ? '🇮🇹' : st.country === 'Germany' ? '🇩🇪' : st.country === 'UK' ? '🇬🇧' : st.country === 'France' ? '🇫🇷' : '🇮🇪'}
                                </span>
                                <span>{st.country}</span>
                                <span className="text-[10.5px] text-slate-400 font-normal">({st.intake})</span>
                              </div>
                              <div className="text-[11px] text-[#64748b] mt-1 flex items-center gap-1.5 whitespace-nowrap">
                                <span className="font-medium text-slate-700">{pf.annualTuition}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-emerald-600 font-semibold">{pf.budgetFit}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 min-w-[340px] align-middle">
                              <div className="flex flex-col gap-1.5 py-0.5 max-w-[360px]">
                                <div className="flex items-center gap-2 text-[11.5px] whitespace-nowrap">
                                  <span className="w-[66px] shrink-0 text-center px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[9.5px] font-bold">
                                    🌟 Dream
                                  </span>
                                  <span className="font-semibold text-slate-800 truncate" title={pf.dream}>
                                    {pf.dream}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[11.5px] whitespace-nowrap">
                                  <span className="w-[66px] shrink-0 text-center px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[9.5px] font-bold">
                                    🎯 Target
                                  </span>
                                  <span className="text-slate-700 truncate font-medium" title={pf.target.join(' • ')}>
                                    {pf.target.join(' • ')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[11.5px] whitespace-nowrap">
                                  <span className="w-[66px] shrink-0 text-center px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9.5px] font-bold">
                                    🛡️ Safe
                                  </span>
                                  <span className="text-slate-600 truncate" title={pf.safe}>
                                    {pf.safe}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 min-w-[160px] text-center align-middle">
                              <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-[5px] text-[11px] font-semibold border whitespace-nowrap shadow-2xs ${pf.matchColor}`}>
                                {pf.matchScore} • {pf.matchLabel}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 min-w-[150px] text-center align-middle">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onNavigate) onNavigate(`student-approval?id=${st.studentId}`);
                                }}
                                title="Open Student Approval window for this candidate"
                                className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-[5px] text-[11px] font-semibold border whitespace-nowrap shadow-2xs hover:shadow transition-all cursor-pointer ${pf.consentBadge}`}
                              >
                                <span>{pf.consentStatus}</span>
                                <span className="text-[10px] font-bold">→</span>
                              </button>
                            </td>
                            <td className="py-3.5 px-3 min-w-[150px] text-center align-middle">
                              <div className="inline-flex flex-col items-center">
                                <div className="font-semibold text-slate-800 text-[11.5px] flex items-center justify-center gap-1.5 whitespace-nowrap">
                                  <Clock className="w-3.5 h-3.5 text-[#64748b] shrink-0" />
                                  <span>{pf.deadline}</span>
                                </div>
                                <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 inline-block mt-1 whitespace-nowrap shadow-2xs">
                                  {pf.daysLeft}d left
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 min-w-[130px] text-center align-middle">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenStudent(st);
                                }}
                                className="px-3 py-1.5 rounded-[5px] bg-blue-50 text-[#087cf5] hover:bg-[#087cf5] hover:text-white font-semibold text-[11px] transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-xs hover:shadow group/btn"
                              >
                                <span>View Shortlist</span>
                                <span className="transition-transform group-hover/btn:translate-x-0.5 font-bold">&gt;</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-[#64748b] text-xs">
                          No student shortlists found matching your search and filter criteria.
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
                    Showing <span className="font-bold text-[#087cf5]">{dirFilteredStudents.length}</span> of {studentList.length} candidate portfolios
                  </span>
                  <span className="hidden sm:inline text-slate-300">|</span>
                  <span className="hidden sm:inline text-[11px] text-slate-500">
                    Tier Legend: 🌟 Ambitious (Reach) • 🎯 Target (Strong Profile Match) • 🛡️ Safe (Guaranteed Backup)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    Portfolio live audit sync
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Portfolio Cards Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {dirFilteredStudents.map((st) => {
                const pf = getStudentPortfolio(st);
                return (
                  <div
                    key={st.id}
                    onClick={() => handleOpenStudent(st)}
                    className="bg-white border border-[#e5edf5] hover:border-blue-300 rounded-[9px] p-3.5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
                  >
                    <div>
                      {/* Card Top: Student Profile */}
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
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${pf.consentBadge}`}>
                          {pf.consentStatus}
                        </span>
                      </div>

                      {/* Academic Score Strip */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#52627a]">
                        <span>Academic Scores:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 font-bold text-slate-700">GPA {st.academic.cgpa}</span>
                          <span className="px-1.5 py-0.2 rounded bg-blue-50 font-bold text-[#087cf5]">{st.academic.englishTest}</span>
                          <span className={`px-1.5 py-0.2 rounded font-bold border ${pf.matchColor}`}>{pf.matchScore}</span>
                        </div>
                      </div>

                      {/* 3-Tier Portfolio Breakdown */}
                      <div className="mt-3 space-y-1.5 bg-[#f8fafc] p-2.5 rounded-[7px] border border-slate-200/70 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            🌟 Dream Option
                          </span>
                          <span className="font-semibold text-slate-800 truncate max-w-[190px]">{pf.dream}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                            🎯 Target Options
                          </span>
                          <span className="text-slate-700 truncate max-w-[190px]">{pf.target.join(', ')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            🛡️ Safe Option
                          </span>
                          <span className="text-slate-600 truncate max-w-[190px]">{pf.safe}</span>
                        </div>
                      </div>

                      {/* Deadline Proximity */}
                      <div className="mt-2.5 flex items-center justify-between text-[11px]">
                        <span className="text-[#64748b]">Next Cutoff:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-slate-700">{pf.deadline}</span>
                          <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                            {pf.daysLeft}d left
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[10.5px] text-[#64748b] truncate max-w-[150px]">{st.preferredCourse}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenStudent(st);
                        }}
                        className="px-3 py-1 rounded-[5px] bg-[#087cf5] hover:bg-[#006ee6] text-white text-[11.5px] font-semibold transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <span>Inspect Portfolio</span>
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
      {/* MODE 2: STUDENT SHORTLISTING PROFILE PREVIEW             */}
      {/* ======================================================== */}
      {selectedStudent && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Top Breadcrumbs & Back Button Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-0.5">
            <div className="flex items-center gap-2">
              <button
                onClick={handleBackToList}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#e2e8f0] bg-white hover:bg-slate-50 text-[12px] font-semibold text-[#101d37] shadow-xs transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← Back to Shortlisting Directory</span>
              </button>

              <span className="text-[12px] text-[#64748b] hidden sm:inline">
                Home &gt; Shortlisting &gt;{' '}
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
                <div className="flex items-center gap-2">
                  <span className="text-[14.5px] font-bold text-[#101d37]">{selectedStudent.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-semibold">
                    Active
                  </span>
                </div>
                <div className="text-[11px] text-[#64748b] mt-0.5">
                  Student ID:{' '}
                  <span className="text-[#101d37] font-medium">{selectedStudent.studentId}</span> • {selectedStudent.phone}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-[12px]">
              <div>
                <div className="text-[10px] text-[#64748b] font-medium uppercase tracking-wider">
                  Country Interest
                </div>
                <div className="font-semibold text-[#101d37] flex items-center gap-1.5 mt-0.5">
                  <span className="text-sm">
                    {selectedStudent.country === 'Italy' ? '🇮🇹' : selectedStudent.country === 'Germany' ? '🇩🇪' : selectedStudent.country === 'UK' ? '🇬🇧' : selectedStudent.country === 'France' ? '🇫🇷' : '🇮🇪'}
                  </span>{' '}
                  {selectedStudent.country}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-[#64748b] font-medium uppercase tracking-wider">
                  Preferred Course
                </div>
                <div className="font-semibold text-[#101d37] flex items-center gap-1.5 mt-0.5">
                  <Landmark className="w-3.5 h-3.5 text-[#087cf5]" /> {selectedStudent.preferredCourse}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-[#64748b] font-medium uppercase tracking-wider">
                  Intake
                </div>
                <div className="font-semibold text-[#101d37] flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-[#64748b]" /> {selectedStudent.intake}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-[#64748b] font-medium uppercase tracking-wider">
                  Budget
                </div>
                <div className="font-semibold text-[#101d37] flex items-center gap-1.5 mt-0.5">
                  <Euro className="w-3.5 h-3.5 text-amber-500" /> {selectedStudent.academic.budget}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-[#64748b] font-medium uppercase tracking-wider">
                  Counsellor
                </div>
                <div className="font-semibold text-[#101d37] flex items-center gap-1.5 mt-0.5">
                  <User className="w-3.5 h-3.5 text-purple-600" /> {selectedStudent.counsellor}
                </div>
              </div>
            </div>
          </div>

          {/* Student Consent & Stage Transition Action Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-[9px] p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#087cf5] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-[#101d37]">Student Portfolio Sign-Off & Consent Status</div>
                <div className="text-[11px] text-[#52627a]">
                  Candidate has approved shortlisted universities (1 Dream, 2 Target, 1 Safe) with signed digital consent.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast(`Sent complete shortlist PDF link to ${selectedStudent.name} via WhatsApp`)}
                className="px-3 py-1.5 rounded-[6px] bg-white border border-[#cbd5e1] hover:bg-slate-50 text-[#101d37] text-[11.5px] font-semibold flex items-center gap-1.5 shadow-2xs"
              >
                <Send className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Share on WhatsApp</span>
              </button>
              <button
                onClick={() => {
                  setConfirmModalData({
                    isOpen: true,
                    title: 'Lock Shortlist & Forward to Student Approval?',
                    studentName: selectedStudent.name,
                    studentId: selectedStudent.studentId,
                    studentAvatar: selectedStudent.avatar,
                    country: selectedStudent.country,
                    currentStageName: 'University Shortlisting (Stage 2)',
                    targetStageName: 'Student Approval (Stage 3)',
                    description: `Are you sure you want to lock the shortlist for ${selectedStudent.name} and forward it for Student Approval? The candidate will be notified to review and provide their official approval sign-off.`,
                    confirmLabel: 'Yes, Forward to Student Approval',
                    variant: 'primary',
                    onConfirm: () => {
                      if (onAdvanceStage) {
                        onAdvanceStage(selectedStudent.studentId || selectedStudent.id, 'student-approval');
                      }
                      showToast(`Shortlist Locked! Forwarded to Student Approval for final sign-off.`);
                      if (onNavigate) {
                        onNavigate(`student-approval?id=${selectedStudent.studentId}`);
                      } else if (onForwardToApplications) {
                        onForwardToApplications();
                      }
                    },
                  });
                }}
                className="px-3.5 py-1.5 rounded-[6px] bg-[#087cf5] hover:bg-[#006ee6] text-white text-[12px] font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Lock Shortlist & Forward to Student Approval (Stage 3)</span>
              </button>
            </div>
          </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#087cf5] text-white px-4 py-2.5 rounded-lg shadow-lg text-[13px] font-medium flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-[18px] font-bold text-[#101d37] leading-tight">
            University Shortlisting Module
          </h1>
          <p className="text-[11.5px] text-[#64748b] leading-tight mt-0.5">
            Compare, shortlist, and recommend the best universities for the student.
          </p>
        </div>

        <div className="text-[11.5px] text-[#64748b] hidden sm:inline">
          
          <span className="font-semibold text-[#101d37]">University Shortlisting</span>
        </div>
      </div>



      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Card 1: Shortlisted */}
        <div className="bg-[#f0f8ff] border border-[#d6ecff] rounded-[8px] p-2.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[#dbeafe] text-[#087cf5] flex items-center justify-center shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[19px] font-bold text-[#101d37]">5</div>
            <div className="text-[11px] text-[#52627a] font-medium leading-tight">
              Universities Shortlisted
            </div>
          </div>
        </div>

        {/* Card 2: Recommended */}
        <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-[8px] p-2.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[#dcfce7] text-[#16a34a] flex items-center justify-center shrink-0">
            <ThumbsUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[19px] font-bold text-[#101d37]">2</div>
            <div className="text-[11px] text-[#52627a] font-medium leading-tight">Recommended</div>
          </div>
        </div>

        {/* Card 3: Comparing */}
        <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-[8px] p-2.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[#fef3c7] text-[#ca8a04] flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[19px] font-bold text-[#101d37]">2</div>
            <div className="text-[11px] text-[#52627a] font-medium leading-tight">Comparing</div>
          </div>
        </div>

        {/* Card 4: Student Selected */}
        <div className="bg-[#faf5ff] border border-[#f3e8ff] rounded-[8px] p-2.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[#f3e8ff] text-[#9333ea] flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[19px] font-bold text-[#101d37]">0</div>
            <div className="text-[11px] text-[#52627a] font-medium leading-tight">
              Student Selected
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#e2e8f0] rounded-[9px] p-3 shadow-xs space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search University / Course */}
          <div>
            <label className="block text-[11px] font-medium text-[#64748b] mb-1">
              Search University / Course
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by university or course..."
                className="w-full pl-8 pr-3 py-1.5 text-[12px] border border-[#cbd5e1] rounded-[6px] focus:outline-hidden focus:ring-1 focus:ring-[#087cf5] bg-white placeholder-[#94a3b8]"
              />
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-[11px] font-medium text-[#64748b] mb-1">Country</label>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-[12px] border border-[#cbd5e1] rounded-[6px] focus:outline-hidden focus:ring-1 focus:ring-[#087cf5] bg-white text-[#101d37]"
            >
              <option value="Italy">🇮🇹 Italy</option>
              <option value="Germany">🇩🇪 Germany</option>
              <option value="France">🇫🇷 France</option>
              <option value="Ireland">🇮🇪 Ireland</option>
            </select>
          </div>

          {/* Course */}
          <div>
            <label className="block text-[11px] font-medium text-[#64748b] mb-1">Course</label>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-[12px] border border-[#cbd5e1] rounded-[6px] focus:outline-hidden focus:ring-1 focus:ring-[#087cf5] bg-white text-[#101d37]"
            >
              <option value="MSc Computer Science">MSc Computer Science</option>
              <option value="MSc Data Science">MSc Data Science</option>
              <option value="MSc Artificial Intelligence">MSc Artificial Intelligence</option>
            </select>
          </div>

          {/* Tuition Fee */}
          <div>
            <label className="block text-[11px] font-medium text-[#64748b] mb-1">
              Tuition Fee (per year)
            </label>
            <select
              value={feeFilter}
              onChange={(e) => setFeeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-[12px] border border-[#cbd5e1] rounded-[6px] focus:outline-hidden focus:ring-1 focus:ring-[#087cf5] bg-white text-[#101d37]"
            >
              <option value="Any">Any</option>
              <option value="< €3,000">Under €3,000</option>
              <option value="€3,000 - €5,000">€3,000 - €5,000</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 items-end">
          {/* City */}
          <div>
            <label className="block text-[11px] font-medium text-[#64748b] mb-1">City</label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-[12px] border border-[#cbd5e1] rounded-[6px] focus:outline-hidden focus:ring-1 focus:ring-[#087cf5] bg-white text-[#101d37]"
            >
              <option value="Any">Any</option>
              <option value="Padova">Padova</option>
              <option value="Turin">Turin</option>
              <option value="Bologna">Bologna</option>
              <option value="Rome">Rome</option>
              <option value="Milan">Milan</option>
            </select>
          </div>

          {/* University Type */}
          <div>
            <label className="block text-[11px] font-medium text-[#64748b] mb-1">
              University Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-[12px] border border-[#cbd5e1] rounded-[6px] focus:outline-hidden focus:ring-1 focus:ring-[#087cf5] bg-white text-[#101d37]"
            >
              <option value="Public Universities">Public Universities</option>
              <option value="Private Universities">Private Universities</option>
            </select>
          </div>

          {/* Application Deadline */}
          <div>
            <label className="block text-[11px] font-medium text-[#64748b] mb-1">
              Application Deadline
            </label>
            <select
              value={deadlineFilter}
              onChange={(e) => setDeadlineFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-[12px] border border-[#cbd5e1] rounded-[6px] focus:outline-hidden focus:ring-1 focus:ring-[#087cf5] bg-white text-[#101d37]"
            >
              <option value="Any">Any</option>
              <option value="March 2026">March 2026</option>
              <option value="April 2026">April 2026</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast('Filters applied successfully')}
              className="flex-1 px-3 py-1.5 bg-[#087cf5] hover:bg-[#076ed9] text-white rounded-[6px] text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
            <button
              onClick={handleResetFilters}
              className="px-3 py-1.5 border border-[#cbd5e1] hover:bg-slate-50 text-[#475569] rounded-[6px] text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Table & Right Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* Left Side: Universities Table (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white border border-[#e2e8f0] rounded-[9px] shadow-xs overflow-hidden">
            {/* Table Header controls */}
            <div className="p-3 border-b border-[#f1f5f9] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-baseline gap-1.5">
                <h3 className="text-[13.5px] font-bold text-[#101d37]">Universities</h3>
                <span className="text-[11.5px] text-[#64748b]">
                  ({filteredUniversities.length} results)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-[11.5px] text-[#64748b] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyShortlisted}
                    onChange={(e) => setOnlyShortlisted(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#087cf5] rounded border-[#cbd5e1]"
                  />
                  <span>Show only shortlisted</span>
                </label>

                <button
                  onClick={() => setShowAddUniModal(true)}
                  className="px-2.5 py-1 text-[11.5px] font-medium text-[#087cf5] hover:bg-[#eff6ff] rounded-[6px] border border-[#bfdbfe] flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add University Manually
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11.5px] border-collapse min-w-[1020px]">
                <thead>
                  <tr className="bg-[#f8fafc] text-[#64748b] font-medium border-b border-[#e2e8f0]">
                    <th className="py-2.5 px-2.5 w-8">
                      <span className="sr-only">Select</span>
                    </th>
                    <th className="py-2.5 px-2.5 min-w-[200px]">University</th>
                    <th className="py-2.5 px-2 min-w-[100px]">City</th>
                    <th className="py-2.5 px-2 min-w-[180px]">Course</th>
                    <th className="py-2.5 px-2 min-w-[140px] whitespace-nowrap">Tuition Fee (per year)</th>
                    <th className="py-2.5 px-2 min-w-[110px] whitespace-nowrap">Application Fee</th>
                    <th className="py-2.5 px-2 min-w-[110px] whitespace-nowrap">Deadline</th>
                    <th className="py-2.5 px-2 min-w-[120px]">Eligibility</th>
                    <th className="py-2.5 px-2 min-w-[100px] text-center">Status</th>
                    <th className="py-2.5 px-2 text-right min-w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {filteredUniversities.map((uni) => {
                    const isSelected = selectedUniId === uni.id;
                    return (
                      <tr
                        key={uni.id}
                        onClick={() => setSelectedUniId(uni.id)}
                        className={`hover:bg-[#f8fbff] transition-colors cursor-pointer ${
                          isSelected ? 'bg-[#f0f7ff]' : ''
                        }`}
                      >
                        <td className="py-2.5 px-2.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={!!uni.selectedForCompare}
                            onChange={() => handleToggleCompare(uni.id)}
                            className="w-3.5 h-3.5 text-[#087cf5] rounded border-[#cbd5e1] cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-2.5">
                          <div className="flex items-center gap-2">
                            <img
                              src={uni.logo}
                              alt={uni.name}
                              className="w-6 h-6 object-contain shrink-0"
                            />
                            <div>
                              <div className="font-semibold text-[#101d37] hover:text-[#087cf5] leading-tight">
                                {uni.name}
                              </div>
                              <div className="text-[10px] text-[#64748b] leading-tight mt-0.5">
                                {uni.type}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-[#475569]">{uni.city}</td>
                        <td className="py-2.5 px-2 text-[#475569]">{uni.course}</td>
                        <td className="py-2.5 px-2 font-medium text-[#101d37]">{uni.tuitionFee}</td>
                        <td className="py-2.5 px-2 text-[#475569]">{uni.appFee}</td>
                        <td className="py-2.5 px-2 text-[#475569] whitespace-nowrap">
                          {uni.deadline}
                        </td>
                        <td className="py-2.5 px-2 text-[#475569]">{uni.eligibility}</td>
                        <td className="py-2.5 px-2">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10.5px] font-semibold ${
                              uni.status === 'Shortlisted'
                                ? 'bg-[#dbeafe] text-[#1d4ed8]'
                                : uni.status === 'Recommended'
                                ? 'bg-[#dcfce7] text-[#15803d]'
                                : uni.status === 'Comparing'
                                ? 'bg-[#fef3c7] text-[#b45309]'
                                : 'bg-[#f3e8ff] text-[#7e22ce]'
                            }`}
                          >
                            {uni.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-right whitespace-nowrap">
                          <div
                            className="flex items-center justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => setSelectedUniId(uni.id)}
                              className="px-2 py-0.5 bg-white border border-[#cbd5e1] hover:bg-slate-50 text-[#087cf5] rounded-[5px] text-[11px] font-medium flex items-center gap-1 shadow-2xs"
                            >
                              <Eye className="w-3 h-3 text-[#087cf5]" /> View
                            </button>
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

          {/* Bottom Compare Bar */}
          <div className="bg-white border border-[#e2e8f0] rounded-[9px] p-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-[#eff6ff] text-[#087cf5] flex items-center justify-center shrink-0">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[12.5px] font-bold text-[#101d37]">Compare Universities</div>
                <div className="text-[10.5px] text-[#64748b]">
                  {compareList.length} universities added to compare
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {compareList.map((uni) => (
                <div
                  key={uni.id}
                  className="flex items-center gap-1.5 px-2 py-1 bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] text-[11px]"
                >
                  <img src={uni.logo} alt={uni.name} className="w-4 h-4 object-contain" />
                  <div>
                    <span className="font-semibold text-[#101d37]">{uni.name}</span>
                    <span className="text-[9.5px] text-[#64748b] ml-1">{uni.city}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveCompare(uni.id)}
                    className="ml-1 text-[#94a3b8] hover:text-rose-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              <button
                onClick={() => {
                  const unselected = universities.find((u) => !u.selectedForCompare);
                  if (unselected) handleToggleCompare(unselected.id);
                }}
                className="px-2.5 py-1 text-[11px] font-medium text-[#475569] hover:bg-slate-50 border border-[#cbd5e1] rounded-[6px] flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add More
              </button>

              <button
                onClick={() => setShowCompareModal(true)}
                disabled={compareList.length < 2}
                className={`px-3 py-1 rounded-[6px] text-[11.5px] font-semibold flex items-center gap-1.5 transition-colors ${
                  compareList.length >= 2
                    ? 'bg-[#087cf5] hover:bg-[#076ed9] text-white shadow-xs cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>Compare Selected ({compareList.length})</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Selected University Details (5 cols on desktop) */}
        <div className="lg:col-span-5 bg-white border border-[#e2e8f0] rounded-[9px] shadow-xs overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-[#f1f5f9] flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-[#101d37]">{selectedUni.name}</h3>
            <button
              onClick={() => setSelectedUniId(universities[0].id)}
              className="text-[#94a3b8] hover:text-[#475569] p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Crest & Campus Banner */}
          <div className="p-3 bg-gradient-to-r from-[#f8fafc] to-[#ffffff] border-b border-[#f1f5f9] grid grid-cols-2 gap-3 items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <img
                  src="/padova_crest.png"
                  alt="Padova Crest"
                  className="h-10 object-contain"
                />
              </div>
              <div className="text-[12.5px] font-bold text-[#101d37] mt-1">{selectedUni.name}</div>
              <div className="text-[10.5px] text-[#64748b]">{selectedUni.type}</div>
            </div>

            <div className="h-20 rounded-[6px] overflow-hidden border border-[#e2e8f0] shadow-2xs">
              <img
                src="/padova_campus.jpg"
                alt="University Campus"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Subtabs */}
          <div className="border-b border-[#e2e8f0] px-3 flex gap-4 overflow-x-auto text-[11.5px] font-medium bg-[#fafbfc]">
            {(
              [
                'Overview',
                'Courses',
                'Admission Requirements',
                'Fees',
                'Deadlines',
                'Scholarships',
              ] as const
            ).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`py-2 whitespace-nowrap border-b-2 transition-colors ${
                  activeSubTab === tab
                    ? 'border-[#087cf5] text-[#087cf5] font-semibold'
                    : 'border-transparent text-[#64748b] hover:text-[#101d37]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Subtab Content: Overview */}
          <div className="p-3 space-y-3">
            {activeSubTab === 'Overview' && (
              <>
                {/* 9 Specs Grid (3 x 3) */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-[#f8fafc] p-2 rounded-[6px] border border-[#f1f5f9]">
                    <div className="text-[10px] text-[#64748b] flex items-center gap-1 font-medium">
                      <MapPin className="w-3 h-3 text-[#087cf5]" /> Location
                    </div>
                    <div className="text-[11.5px] font-bold text-[#101d37] mt-0.5">
                      {selectedUni.city}, {selectedUni.country}
                    </div>
                  </div>

                  <div className="bg-[#f8fafc] p-2 rounded-[6px] border border-[#f1f5f9]">
                    <div className="text-[10px] text-[#64748b] flex items-center gap-1 font-medium">
                      <Trophy className="w-3 h-3 text-amber-500" /> QS World Ranking
                    </div>
                    <div className="text-[11.5px] font-bold text-[#101d37] mt-0.5">
                      {selectedUni.qsRank}
                    </div>
                  </div>

                  <div className="bg-[#f8fafc] p-2 rounded-[6px] border border-[#f1f5f9]">
                    <div className="text-[10px] text-[#64748b] flex items-center gap-1 font-medium">
                      <Landmark className="w-3 h-3 text-purple-600" /> Type
                    </div>
                    <div className="text-[11.5px] font-bold text-[#101d37] mt-0.5">
                      {selectedUni.type}
                    </div>
                  </div>

                  <div className="bg-[#f8fafc] p-2 rounded-[6px] border border-[#f1f5f9]">
                    <div className="text-[10px] text-[#64748b] flex items-center gap-1 font-medium">
                      <Languages className="w-3 h-3 text-[#087cf5]" /> Language of Instruction
                    </div>
                    <div className="text-[11.5px] font-bold text-[#101d37] mt-0.5">
                      {selectedUni.languages}
                    </div>
                  </div>

                  <div className="bg-[#f8fafc] p-2 rounded-[6px] border border-[#f1f5f9]">
                    <div className="text-[10px] text-[#64748b] flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3 text-rose-500" /> Application Deadline
                    </div>
                    <div className="text-[11.5px] font-bold text-[#101d37] mt-0.5">
                      {selectedUni.deadline}
                    </div>
                  </div>

                  <div className="bg-[#f8fafc] p-2 rounded-[6px] border border-[#f1f5f9]">
                    <div className="text-[10px] text-[#64748b] flex items-center gap-1 font-medium">
                      <CreditCard className="w-3 h-3 text-emerald-600" /> Application Fee
                    </div>
                    <div className="text-[11.5px] font-bold text-[#101d37] mt-0.5">
                      {selectedUni.appFee}
                    </div>
                  </div>

                  <div className="bg-[#f8fafc] p-2 rounded-[6px] border border-[#f1f5f9]">
                    <div className="text-[10px] text-[#64748b] flex items-center gap-1 font-medium">
                      <Euro className="w-3 h-3 text-amber-500" /> Tuition Fee (per year)
                    </div>
                    <div className="text-[11.5px] font-bold text-[#101d37] mt-0.5">
                      {selectedUni.tuitionFee} (approx.)
                    </div>
                  </div>

                  <div className="bg-[#f8fafc] p-2 rounded-[6px] border border-[#f1f5f9]">
                    <div className="text-[10px] text-[#64748b] flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-blue-500" /> Duration
                    </div>
                    <div className="text-[11.5px] font-bold text-[#101d37] mt-0.5">
                      {selectedUni.duration}
                    </div>
                  </div>

                  <div className="bg-[#f8fafc] p-2 rounded-[6px] border border-[#f1f5f9]">
                    <div className="text-[10px] text-[#64748b] flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3 text-purple-600" /> Intake
                    </div>
                    <div className="text-[11.5px] font-bold text-[#101d37] mt-0.5">
                      {selectedUni.intake}
                    </div>
                  </div>
                </div>

                {/* About University */}
                <div>
                  <h4 className="text-[12px] font-bold text-[#101d37] mb-1">About University</h4>
                  <p className="text-[11px] text-[#475569] leading-relaxed">
                    {selectedUni.about}
                  </p>
                </div>
              </>
            )}

            {activeSubTab === 'Courses' && (
              <div className="space-y-2 text-[11.5px]">
                <div className="p-2 border border-[#e2e8f0] rounded-[6px] bg-[#f8fafc]">
                  <div className="font-bold text-[#101d37]">MSc Computer Science</div>
                  <div className="text-[#64748b] text-[10.5px]">
                    2 Years • English • 120 ECTS • Software Engineering, AI & Cybersecurity tracks
                  </div>
                </div>
                <div className="p-2 border border-[#e2e8f0] rounded-[6px]">
                  <div className="font-bold text-[#101d37]">MSc Data Science</div>
                  <div className="text-[#64748b] text-[10.5px]">
                    2 Years • English • 120 ECTS • Big Data, Machine Learning & Analytics
                  </div>
                </div>
                <div className="p-2 border border-[#e2e8f0] rounded-[6px]">
                  <div className="font-bold text-[#101d37]">MSc Cybersecurity</div>
                  <div className="text-[#64748b] text-[10.5px]">
                    2 Years • English • 120 ECTS • Network Security, Cryptography
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'Admission Requirements' && (
              <div className="space-y-2 text-[11px] text-[#475569]">
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Bachelor’s degree in Computer Science, Engineering, or related technical discipline (Minimum 70% / 7.0 CGPA)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>English Proficiency: IELTS 6.5 (min 6.0 in all bands) or TOEFL iBT 80</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Curriculum Vitae (Europass format recommended) & Statement of Purpose</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Two Letters of Academic Recommendation (LOR)</span>
                </div>
              </div>
            )}

            {activeSubTab === 'Fees' && (
              <div className="space-y-2 text-[11.5px]">
                <div className="flex justify-between py-1.5 border-b border-[#f1f5f9]">
                  <span className="text-[#64748b]">Tuition Fee (EU & Non-EU)</span>
                  <span className="font-semibold text-[#101d37]">{selectedUni.tuitionFee} / year</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#f1f5f9]">
                  <span className="text-[#64748b]">Regional Tax (Veneto Region)</span>
                  <span className="font-semibold text-[#101d37]">€171</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#f1f5f9]">
                  <span className="text-[#64748b]">Application Fee</span>
                  <span className="font-semibold text-[#101d37]">{selectedUni.appFee} (Non-refundable)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#f1f5f9]">
                  <span className="text-[#64748b]">Estimated Living Expenses</span>
                  <span className="font-semibold text-[#101d37]">€700 - €900 / month</span>
                </div>
              </div>
            )}

            {activeSubTab === 'Deadlines' && (
              <div className="space-y-2 text-[11.5px]">
                <div className="p-2 border border-emerald-200 bg-emerald-50 rounded-[6px]">
                  <div className="font-bold text-emerald-800">Call 1: Non-EU Applicants with Visa requirement</div>
                  <div className="text-emerald-700 text-[10.5px]">
                    Opens: 07 Jan 2026 • Deadline: 31 Mar 2026
                  </div>
                </div>
                <div className="p-2 border border-[#e2e8f0] bg-[#f8fafc] rounded-[6px]">
                  <div className="font-bold text-[#101d37]">Call 2: EU and Equivalent Applicants</div>
                  <div className="text-[#64748b] text-[10.5px]">
                    Opens: 02 May 2026 • Deadline: 30 Jun 2026
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'Scholarships' && (
              <div className="space-y-2 text-[11px] text-[#475569]">
                <div className="p-2 border border-amber-200 bg-amber-50 rounded-[6px]">
                  <div className="font-bold text-amber-900">Padua International Excellence Scholarship</div>
                  <div className="text-amber-800 text-[10.5px] mt-0.5">
                    Covers 100% tuition waiver + €8,000 scholarship per academic year. Merit-based.
                  </div>
                </div>
                <div className="p-2 border border-[#e2e8f0] rounded-[6px]">
                  <div className="font-bold text-[#101d37]">Veneto Region Need-Based Scholarship (EDISU)</div>
                  <div className="text-[#64748b] text-[10.5px] mt-0.5">
                    Up to €7,000/year + free university canteen access based on ISEE Parificato documentation.
                  </div>
                </div>
              </div>
            )}

            {/* Bottom 3 Action Buttons */}
            <div className="pt-2 border-t border-[#f1f5f9] grid grid-cols-3 gap-2">
              <button
                onClick={() => handleToggleShortlist(selectedUni.id)}
                className={`px-2 py-1.5 rounded-[6px] text-[11.5px] font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs ${
                  selectedUni.status === 'Shortlisted'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#087cf5] hover:bg-[#076ed9] text-white'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                {selectedUni.status === 'Shortlisted' ? 'Shortlisted' : 'Shortlist'}
              </button>

              <button
                onClick={() => handleToggleCompare(selectedUni.id)}
                className="px-2 py-1.5 bg-white border border-[#cbd5e1] hover:bg-slate-50 text-[#101d37] rounded-[6px] text-[11.5px] font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Scale className="w-3.5 h-3.5 text-[#087cf5]" /> Add to Compare
              </button>

              <button
                onClick={() => showToast(`Sent ${selectedUni.name} recommendation to student via WhatsApp & Email`)}
                className="px-2 py-1.5 bg-white border border-[#cbd5e1] hover:bg-slate-50 text-[#101d37] rounded-[6px] text-[11.5px] font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-[#101d37]" /> Send to Student
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compare Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[10px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-[#e2e8f0] flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-[#101d37]">University Comparison</h3>
                <p className="text-[11.5px] text-[#64748b]">
                  Comparing {compareList.length} selected universities side by side
                </p>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="text-[#94a3b8] hover:text-[#475569] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-x-auto flex-1">
              <table className="w-full text-left text-[12px] border-collapse">
                <thead>
                  <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                    <th className="py-2.5 px-3 font-semibold text-[#64748b] w-40">Attribute</th>
                    {compareList.map((uni) => (
                      <th key={uni.id} className="py-2.5 px-3 font-bold text-[#101d37]">
                        <div className="flex items-center gap-2">
                          <img src={uni.logo} alt={uni.name} className="w-5 h-5 object-contain" />
                          <span>{uni.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-[#64748b]">City & Country</td>
                    {compareList.map((uni) => (
                      <td key={uni.id} className="py-2.5 px-3 font-semibold text-[#101d37]">
                        {uni.city}, {uni.country}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-[#64748b]">QS Ranking</td>
                    {compareList.map((uni) => (
                      <td key={uni.id} className="py-2.5 px-3 text-[#101d37]">
                        {uni.qsRank}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-[#64748b]">Tuition Fee / Year</td>
                    {compareList.map((uni) => (
                      <td key={uni.id} className="py-2.5 px-3 font-bold text-[#087cf5]">
                        {uni.tuitionFee}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-[#64748b]">Application Fee</td>
                    {compareList.map((uni) => (
                      <td key={uni.id} className="py-2.5 px-3 text-[#101d37]">
                        {uni.appFee}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-[#64748b]">Deadline</td>
                    {compareList.map((uni) => (
                      <td key={uni.id} className="py-2.5 px-3 text-[#101d37]">
                        {uni.deadline}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-[#64748b]">Language</td>
                    {compareList.map((uni) => (
                      <td key={uni.id} className="py-2.5 px-3 text-[#101d37]">
                        {uni.languages}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-[#64748b]">Eligibility</td>
                    {compareList.map((uni) => (
                      <td key={uni.id} className="py-2.5 px-3 text-[#101d37]">
                        {uni.eligibility}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-[#e2e8f0] flex justify-end gap-2 bg-[#f8fafc]">
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-4 py-2 border border-[#cbd5e1] hover:bg-slate-100 rounded-[6px] text-[12px] font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowCompareModal(false);
                  showToast('Comparison shared with student!');
                }}
                className="px-4 py-2 bg-[#087cf5] hover:bg-[#076ed9] text-white rounded-[6px] text-[12px] font-semibold"
              >
                Share Comparison with Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add University Manually Modal */}
      {showAddUniModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[10px] w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3 border-b border-[#f1f5f9] pb-2">
              <h3 className="text-[15px] font-bold text-[#101d37]">Add University Option</h3>
              <button onClick={() => setShowAddUniModal(false)}>
                <X className="w-4 h-4 text-[#94a3b8]" />
              </button>
            </div>
            <div className="space-y-3 text-[12px]">
              <div>
                <label className="block text-[#64748b] mb-1 font-medium">University Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ca' Foscari University of Venice"
                  className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-[6px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#64748b] mb-1 font-medium">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Venice"
                    className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-[6px]"
                  />
                </div>
                <div>
                  <label className="block text-[#64748b] mb-1 font-medium">Tuition Fee</label>
                  <input
                    type="text"
                    placeholder="e.g. €2,200"
                    className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-[6px]"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-[#f1f5f9]">
              <button
                onClick={() => setShowAddUniModal(false)}
                className="px-3 py-1.5 border border-[#cbd5e1] rounded-[6px] text-[12px]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAddUniModal(false);
                  showToast('New university option added successfully');
                }}
                className="px-4 py-1.5 bg-[#087cf5] text-white rounded-[6px] text-[12px] font-semibold"
              >
                Add Option
              </button>
            </div>
          </div>
        </div>
      )}
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
          variant={confirmModalData.variant}
        />
      )}
    </div>
  );
};
