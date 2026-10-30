import React, { useState, useEffect, useMemo } from 'react';
import {
  UserCheck,
  GraduationCap,
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
  Sparkles,
  Calendar,
  ChevronRight,
  Info,
  X,
  Award,
  Copy,
  ThumbsUp,
  MapPin,
  Landmark,
} from 'lucide-react';
import { StudentRecord } from '../services/studentsData';
import { countryFlag } from '../utils/country';
import { StudentAvatar } from '../components/common/StudentAvatar';
import { ActionConfirmModal } from '../components/modals/ActionConfirmModal';

interface StudentApprovalViewProps {
  students?: StudentRecord[];
  onAdvanceStage?: (studentId: string, targetStageIdOrNumber?: any) => any;
  onNavigate?: (route: string) => void;
  onOpenPhone?: (lead: any) => void;
  onOpenWhatsApp?: (lead: any) => void;
  onOpenEmail?: (lead: any) => void;
  onScheduleFollowUp?: (lead: any) => void;
}

interface UniversityChoice {
  id: string;
  name: string;
  tier: 'Dream' | 'Target' | 'Safe';
  city: string;
  country: string;
  flag: string;
  course: string;
  degreeLevel: string;
  tuitionFee: string;
  appFee: string;
  deadline: string;
  daysLeft: number;
  matchScore: string;
  approved: boolean;
  priority: number;
  rationale: string;
}

// Helper to generate a realistic 3-tier shortlist for any student
const generateShortlistForStudent = (st: StudentRecord): UniversityChoice[] => {
  const isHighGpa = (parseFloat(st.academic.cgpa) || 8.0) >= 8.2;

  if (st.country === 'Italy') {
    return [
      {
        id: 'polimi',
        name: 'Politecnico di Milano (PoliMi)',
        tier: 'Dream',
        city: 'Milan',
        country: 'Italy',
        flag: '🇮🇹',
        course: st.preferredCourse || 'MSc Artificial Intelligence',
        degreeLevel: 'Master of Science',
        tuitionFee: '€3,890 / year',
        appFee: '€50',
        deadline: '15 Feb 2027',
        daysLeft: 18,
        matchScore: isHighGpa ? '94%' : '86%',
        approved: true,
        priority: 1,
        rationale: 'World-renowned engineering faculty with direct industry placements in Lombardy.',
      },
      {
        id: 'unipd',
        name: 'University of Padova',
        tier: 'Target',
        city: 'Padua',
        country: 'Italy',
        flag: '🇮🇹',
        course: st.preferredCourse || 'MSc Computer Engineering',
        degreeLevel: 'Master of Science',
        tuitionFee: '€2,600 / year',
        appFee: '€30',
        deadline: '31 Mar 2027',
        daysLeft: 28,
        matchScore: '96%',
        approved: true,
        priority: 2,
        rationale: 'Solid academic match. Veneto regional DSU scholarship eligible with 100% tuition waiver.',
      },
      {
        id: 'unibo',
        name: 'University of Bologna',
        tier: 'Target',
        city: 'Bologna',
        country: 'Italy',
        flag: '🇮🇹',
        course: st.alternativeCourses?.[0] || 'MSc Data Science & Analytics',
        degreeLevel: 'Master of Science',
        tuitionFee: '€2,900 / year',
        appFee: '€40',
        deadline: '15 Apr 2027',
        daysLeft: 42,
        matchScore: '92%',
        approved: true,
        priority: 3,
        rationale: 'Top 100 global university with vibrant international tech community.',
      },
      {
        id: 'sapienza',
        name: 'Sapienza University of Rome',
        tier: 'Safe',
        city: 'Rome',
        country: 'Italy',
        flag: '🇮🇹',
        course: 'MSc Computer Science',
        degreeLevel: 'Master of Science',
        tuitionFee: '€1,000 / year',
        appFee: '€30',
        deadline: '30 Apr 2027',
        daysLeft: 58,
        matchScore: '98%',
        approved: true,
        priority: 4,
        rationale: 'Guaranteed admission match with low public fees and strong European alumni network.',
      },
    ];
  }

  if (st.country === 'Germany') {
    return [
      {
        id: 'tum',
        name: 'Technical University of Munich (TUM)',
        tier: 'Dream',
        city: 'Munich',
        country: 'Germany',
        flag: '🇩🇪',
        course: st.preferredCourse || 'MSc Informatics',
        degreeLevel: 'Master of Science',
        tuitionFee: '€0 (Public University)',
        appFee: '€75 (Uni-Assist)',
        deadline: '15 May 2027',
        daysLeft: 72,
        matchScore: isHighGpa ? '94%' : '84%',
        approved: true,
        priority: 1,
        rationale: 'TU9 elite technical university. Excellent robotics and Bavarian tech hub ecosystem.',
      },
      {
        id: 'rwth',
        name: 'RWTH Aachen University',
        tier: 'Target',
        city: 'Aachen',
        country: 'Germany',
        flag: '🇩🇪',
        course: 'MSc Computer Science & Engineering',
        degreeLevel: 'Master of Science',
        tuitionFee: '€0 (Semester fee €320)',
        appFee: '€75 (Uni-Assist)',
        deadline: '15 Jul 2027',
        daysLeft: 120,
        matchScore: '96%',
        approved: true,
        priority: 2,
        rationale: 'Highest research funding per professor in Germany. 100% curriculum match.',
      },
      {
        id: 'tuberlin',
        name: 'TU Berlin',
        tier: 'Target',
        city: 'Berlin',
        country: 'Germany',
        flag: '🇩🇪',
        course: st.alternativeCourses?.[0] || 'MSc Data Engineering',
        degreeLevel: 'Master of Science',
        tuitionFee: '€0 (Semester fee €310)',
        appFee: '€75 (Uni-Assist)',
        deadline: '15 Jun 2027',
        daysLeft: 95,
        matchScore: '91%',
        approved: true,
        priority: 3,
        rationale: 'Dynamic startup ecosystem in Berlin with abundant working student (Werkstudent) roles.',
      },
      {
        id: 'fau',
        name: 'FAU Erlangen-Nürnberg',
        tier: 'Safe',
        city: 'Erlangen',
        country: 'Germany',
        flag: '🇩🇪',
        course: 'MSc Computational Engineering',
        degreeLevel: 'Master of Science',
        tuitionFee: '€0 (Semester fee €150)',
        appFee: '€0 (Direct Portal)',
        deadline: '15 Jul 2027',
        daysLeft: 125,
        matchScore: '98%',
        approved: true,
        priority: 4,
        rationale: 'Guaranteed admission match for high GPA with zero tuition and Siemens research synergy.',
      },
    ];
  }

  if (st.country === 'UK') {
    return [
      {
        id: 'manchester',
        name: 'University of Manchester',
        tier: 'Dream',
        city: 'Manchester',
        country: 'UK',
        flag: '🇬🇧',
        course: st.preferredCourse || 'MSc Advanced Computer Science',
        degreeLevel: 'Master of Science',
        tuitionFee: '£28,500 / year',
        appFee: '£60',
        deadline: '15 Jun 2027',
        daysLeft: 98,
        matchScore: isHighGpa ? '92%' : '82%',
        approved: true,
        priority: 1,
        rationale: 'Russell Group powerhouse with high graduate employability in UK fintech and AI.',
      },
      {
        id: 'kcl',
        name: "King's College London",
        tier: 'Target',
        city: 'London',
        country: 'UK',
        flag: '🇬🇧',
        course: 'MSc Artificial Intelligence',
        degreeLevel: 'Master of Science',
        tuitionFee: '£31,200 / year',
        appFee: '£75',
        deadline: '01 Jul 2027',
        daysLeft: 110,
        matchScore: '89%',
        approved: true,
        priority: 2,
        rationale: 'Central London campus with direct access to UK global corporate headquarters.',
      },
      {
        id: 'sheffield',
        name: 'University of Sheffield',
        tier: 'Target',
        city: 'Sheffield',
        country: 'UK',
        flag: '🇬🇧',
        course: st.alternativeCourses?.[0] || 'MSc Data Science',
        degreeLevel: 'Master of Science',
        tuitionFee: '£26,500 / year',
        appFee: '£0',
        deadline: '31 Jul 2027',
        daysLeft: 135,
        matchScore: '95%',
        approved: true,
        priority: 3,
        rationale: 'Russell Group member with £2,500 international merit scholarship pre-approved.',
      },
      {
        id: 'birmingham',
        name: 'University of Birmingham',
        tier: 'Safe',
        city: 'Birmingham',
        country: 'UK',
        flag: '🇬🇧',
        course: 'MSc Computer Science',
        degreeLevel: 'Master of Science',
        tuitionFee: '£25,800 / year',
        appFee: '£0',
        deadline: '15 Aug 2027',
        daysLeft: 148,
        matchScore: '98%',
        approved: true,
        priority: 4,
        rationale: 'Safe admit with quick turnaround offer letters and strong campus accommodation support.',
      },
    ];
  }

  // Default fallback (France / Ireland / Other)
  return [
    {
      id: 'sorbonne',
      name: 'Sorbonne University',
      tier: 'Dream',
      city: 'Paris',
      country: st.country,
      flag: '🇫🇷',
      course: st.preferredCourse || 'MSc Computer Science & Data',
      degreeLevel: 'Master of Science',
      tuitionFee: '€3,770 / year',
      appFee: '€50',
      deadline: '15 May 2027',
      daysLeft: 72,
      matchScore: '92%',
      approved: true,
      priority: 1,
      rationale: 'Premier French research institute in the heart of Paris.',
    },
    {
      id: 'saclay',
      name: 'Université Paris-Saclay',
      tier: 'Target',
      city: 'Paris',
      country: st.country,
      flag: '🇫🇷',
      course: 'MSc Applied Mathematics & CS',
      degreeLevel: 'Master of Science',
      tuitionFee: '€3,770 / year',
      appFee: '€50',
      deadline: '30 May 2027',
      daysLeft: 87,
      matchScore: '95%',
      approved: true,
      priority: 2,
      rationale: 'Ranked #1 worldwide in Mathematics, top-tier research facilities.',
    },
    {
      id: 'strasbourg',
      name: 'University of Strasbourg',
      tier: 'Target',
      city: 'Strasbourg',
      country: st.country,
      flag: '🇫🇷',
      course: 'MSc Informatics',
      degreeLevel: 'Master of Science',
      tuitionFee: '€2,500 / year',
      appFee: '€0',
      deadline: '15 Jun 2027',
      daysLeft: 98,
      matchScore: '94%',
      approved: true,
      priority: 3,
      rationale: 'Strong European cross-border tech incubator support.',
    },
    {
      id: 'lille',
      name: 'University of Lille',
      tier: 'Safe',
      city: 'Lille',
      country: st.country,
      flag: '🇫🇷',
      course: 'MSc Computer Engineering',
      degreeLevel: 'Master of Science',
      tuitionFee: '€1,800 / year',
      appFee: '€0',
      deadline: '30 Jun 2027',
      daysLeft: 112,
      matchScore: '99%',
      approved: true,
      priority: 4,
      rationale: 'High acceptance probability with affordable student cost of living.',
    },
  ];
};

export const StudentApprovalView: React.FC<StudentApprovalViewProps> = ({
  students,
  onAdvanceStage,
  onNavigate,
  onOpenPhone,
  onOpenWhatsApp,
  onOpenEmail,
  onScheduleFollowUp,
}) => {
  const studentList = students || [];

  // Selected student for Mode 2 (Approval Workspace Window)
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  // Filters for Mode 1 (Approval Directory)
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [tabFilter, setTabFilter] = useState<'All' | 'Pending' | 'Approved' | 'Revisions' | 'Locked'>('All');

  // Interactive state inside Mode 2 (Approval Window)
  const [uniChoices, setUniChoices] = useState<UniversityChoice[]>([]);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [undertakingAgreed, setUndertakingAgreed] = useState(true);
  const [depositAgreed, setDepositAgreed] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLockedForApplications, setIsLockedForApplications] = useState(false);
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

  // Deep-linking support: reads `#student-approval?id=...`
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.includes('student-approval') && hash.includes('?id=')) {
        const idParam = hash.split('?id=')[1];
        const match = studentList.find(
          (s) =>
            s.studentId.toLowerCase() === idParam.toLowerCase() ||
            s.id.toLowerCase() === idParam.toLowerCase() ||
            s.name.toLowerCase().includes(idParam.toLowerCase())
        );
        if (match) {
          handleOpenStudent(match);
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [studentList]);

  // When a student is selected, initialize their shortlist & approval status
  const handleOpenStudent = (st: StudentRecord) => {
    setSelectedStudent(st);
    window.location.hash = `student-approval?id=${st.studentId}`;
    const initialChoices = generateShortlistForStudent(st);
    setUniChoices(initialChoices);
    const isAlreadyApproved = st.stageNumber >= 4;
    const isLocked = st.stageNumber >= 5;
    setOtpVerified(isAlreadyApproved);
    setIsLockedForApplications(isLocked);
    setOtpSent(false);
    setOtpCode(isAlreadyApproved ? '749210' : '');
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
    window.location.hash = 'student-approval';
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle university approval checkbox
  const handleToggleUni = (uniId: string) => {
    setUniChoices((prev) =>
      prev.map((u) => (u.id === uniId ? { ...u, approved: !u.approved } : u))
    );
  };

  // Change priority rank
  const handleChangePriority = (uniId: string, newPriority: number) => {
    setUniChoices((prev) =>
      prev.map((u) => (u.id === uniId ? { ...u, priority: newPriority } : u))
    );
  };

  // OTP Verification Simulator
  const handleSendOtp = () => {
    setOtpSent(true);
    setOtpCode('');
    showToast(`Digital OTP sent to ${selectedStudent?.phone} and ${selectedStudent?.email}`);
  };

  const handleVerifyOtp = () => {
    if (otpCode.trim().length >= 4 || otpCode === '123456' || otpCode === '749210') {
      setOtpVerified(true);
      showToast('✓ Student Identity & Digital Consent Authenticated successfully!');
    } else {
      showToast('⚠️ Please enter a valid 6-digit OTP code (e.g. 749210)');
    }
  };

  // Final Action: Approve & Advance to Applications (Stage 5)
  const handleApproveAndAdvance = () => {
    if (!selectedStudent) return;
    if (!otpVerified) {
      showToast('⚠️ Please verify the Student Digital OTP before finalizing approval.');
      return;
    }
    if (!undertakingAgreed) {
      showToast('⚠️ Student must accept the formal application undertaking terms.');
      return;
    }

    setConfirmModalData({
      isOpen: true,
      title: 'Approve & Forward to Documentation Completed',
      studentName: selectedStudent.name,
      studentId: selectedStudent.studentId,
      studentAvatar: selectedStudent.avatar,
      country: selectedStudent.country,
      currentStageName: 'Stage 3: Student Approval',
      targetStageName: 'Stage 4: Documentation Completed',
      description: `This locks student approval for ${selectedStudent.name} and forwards their approved university shortlist to Stage 4 (Documentation Completed) to collect and verify mandatory university documents.`,
      confirmLabel: 'Confirm & Forward to Stage 4',
      variant: 'success',
      onConfirm: () => {
        if (onAdvanceStage) {
          onAdvanceStage(selectedStudent.studentId || selectedStudent.id, 'documentation');
        }
        setIsLockedForApplications(true);
        setShowSuccessModal(true);
      },
    });
  };

  // Handle Revision Request
  const handleSubmitRevision = () => {
    setShowRevisionModal(false);
    showToast(`Shortlist revision note recorded. Forwarded back to Shortlisting team.`);
    if (onNavigate) {
      onNavigate(`university-shortlisting?id=${selectedStudent?.studentId}`);
    }
  };

  // Directory filter counts
  const dirCounts = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let revisions = 0;
    let locked = 0;

    studentList.forEach((st) => {
      if (st.stageNumber >= 5) locked++;
      else if (st.stageNumber === 4) approved++;
      else if (st.stageNumber === 3) pending++;
      else revisions++;
    });

    return {
      all: studentList.length,
      pending,
      approved,
      revisions,
      locked,
    };
  }, [studentList]);

  // Filtered students for Directory table
  const filteredStudents = useMemo(() => {
    return studentList.filter((st) => {
      // Tab filter
      if (tabFilter === 'Pending' && st.stageNumber !== 3) return false;
      if (tabFilter === 'Approved' && st.stageNumber !== 4) return false;
      if (tabFilter === 'Locked' && st.stageNumber < 5) return false;
      if (tabFilter === 'Revisions' && st.stageNumber > 2 && st.stageNumber < 5) return false;

      // Country filter
      if (countryFilter !== 'All' && st.country !== countryFilter) return false;

      // Status filter
      if (statusFilter !== 'All') {
        if (statusFilter === 'Pending Sign-Off' && st.stageNumber !== 3) return false;
        if (statusFilter === 'Signed & Verified' && st.stageNumber !== 4) return false;
        if (statusFilter === 'Locked for Applications' && st.stageNumber < 5) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          st.name.toLowerCase().includes(q) ||
          st.studentId.toLowerCase().includes(q) ||
          st.phone.toLowerCase().includes(q) ||
          st.country.toLowerCase().includes(q) ||
          st.preferredCourse.toLowerCase().includes(q);
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
      {/* MODE 1: STUDENT APPROVAL DIRECTORY (WHEN NO STUDENT IS SELECTED)     */}
      {/* ==================================================================== */}
      {!selectedStudent && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#087cf5] text-white flex items-center justify-center shadow-xs">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[17px] font-bold text-[#101d37] leading-tight">
                    Student Approval & Final Consent Directory
                  </h1>
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                    <ShieldCheck className="w-3 h-3" /> Stage 3 • Final Shortlist Sign-Off
                  </span>
                </div>
                <p className="text-[11.5px] text-[#64748b] leading-tight mt-0.5">
                  Candidate review, priority locking, and digital OTP consent following Stage 2 University Shortlisting before Stage 4 Documentation Completed.
                </p>
              </div>
            </div>

            <div className="text-[11.5px] text-[#64748b] hidden sm:inline">
              Home &gt; <span className="font-semibold text-[#101d37]">Student Approval Directory</span>
            </div>
          </div>

          {/* 5 KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Total For Approval</span>
              <div className="text-[19px] font-bold text-[#101d37] mt-0.5">{dirCounts.all}</div>
              <span className="text-[10px] text-[#087cf5] font-semibold">● Active Shortlisted Pool</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Signed via Digital OTP</span>
              <div className="text-[19px] font-bold text-emerald-600 mt-0.5">{dirCounts.approved}</div>
              <span className="text-[10px] text-emerald-600 font-semibold">✓ Ready to Lock & Apply</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Awaiting Student Sign-Off</span>
              <div className="text-[19px] font-bold text-amber-600 mt-0.5">{dirCounts.pending}</div>
              <span className="text-[10px] text-amber-600 font-medium">⏳ Sent for review</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Revisions Requested</span>
              <div className="text-[19px] font-bold text-orange-600 mt-0.5">{dirCounts.revisions}</div>
              <span className="text-[10px] text-orange-600 font-medium">⚠️ Swapping options</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Locked & Approved</span>
              <div className="text-[19px] font-bold text-purple-600 mt-0.5">{dirCounts.locked}</div>
              <span className="text-[10px] text-purple-600 font-medium">🔒 Transferred to Stage 4</span>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              {/* Quick Tab Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11.5px]">
                {[
                  { id: 'All', label: `All Candidates (${dirCounts.all})` },
                  { id: 'Pending', label: `Awaiting Sign-Off (${dirCounts.pending})` },
                  { id: 'Approved', label: `Signed & Approved (${dirCounts.approved})` },
                  { id: 'Locked', label: `Locked for Applications (${dirCounts.locked})` },
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

              {/* Sample Quick Open Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenStudent(studentList[0])}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[#087cf5] hover:bg-[#006ee6] text-white text-[12px] font-semibold transition-colors shadow-xs"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Sample Approval Window ({studentList[0]?.name || 'Ananya Sharma'})</span>
                </button>
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
                  placeholder="Search candidate by name, ID, mobile, course, or target university..."
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
                  <option value="All">All Approval Statuses</option>
                  <option value="Pending Sign-Off">⏳ Awaiting Sign-Off</option>
                  <option value="Signed & Verified">✓ Signed via Digital OTP</option>
                  <option value="Locked for Applications">🔒 Locked for Applications</option>
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
                    <th className="py-3 px-3 min-w-[210px]">Destination & Intake</th>
                    <th className="py-3 px-3 min-w-[340px]">Shortlisted Portfolio</th>
                    <th className="py-3 px-3 min-w-[170px] text-center">Approval Status</th>
                    <th className="py-3 px-3 min-w-[160px] text-center">Consent Verification</th>
                    <th className="py-3 px-3 min-w-[150px] text-center">Earliest Deadline</th>
                    <th className="py-3 px-3 min-w-[140px] text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((st, idx) => {
                      const shortlist = generateShortlistForStudent(st);
                      const isApproved = st.stageNumber >= 4;
                      const isLocked = st.stageNumber >= 5;

                      return (
                        <tr
                          key={st.id}
                          onClick={() => handleOpenStudent(st)}
                          className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                        >
                          {/* 1. Index */}
                          <td className="py-3.5 px-3 text-center text-[#64748b] font-medium text-[11.5px] align-middle">
                            {idx + 1}
                          </td>

                          {/* 2. Student & Profile */}
                          <td className="py-3.5 px-3 min-w-[270px] align-middle">
                            <div className="flex items-center gap-3">
                              <StudentAvatar
                                name={st.name}
                                src={st.avatar}
                                className="w-10 h-10 aspect-square rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs text-[11px]"
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

                          {/* 3. Destination & Intake */}
                          <td className="py-3.5 px-3 min-w-[210px] align-middle">
                            <div className="font-semibold text-[#101d37] text-[12px] flex items-center gap-1.5 whitespace-nowrap">
                              <span className="text-sm">
                                {countryFlag(st.country)}
                              </span>
                              <span>{st.country}</span>
                              <span className="text-[10.5px] text-slate-400 font-normal">({st.intake})</span>
                            </div>
                            <div className="text-[11px] text-[#64748b] mt-1 flex items-center gap-1.5 whitespace-nowrap truncate max-w-[200px]">
                              <span>{st.preferredCourse}</span>
                            </div>
                          </td>

                          {/* 4. Shortlisted Universities */}
                          <td className="py-3.5 px-3 min-w-[340px] align-middle">
                            <div className="flex flex-col gap-1.5 py-0.5 max-w-[360px]">
                              {shortlist.slice(0, 3).map((u, uIdx) => (
                                <div key={u.id} className="flex items-center gap-2 text-[11.5px] whitespace-nowrap">
                                  <span
                                    className={`w-[66px] shrink-0 text-center px-1.5 py-0.5 rounded text-[9.5px] font-bold border ${
                                      u.tier === 'Dream'
                                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                                        : u.tier === 'Target'
                                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    }`}
                                  >
                                    {u.tier === 'Dream' ? '🌟 Dream' : u.tier === 'Target' ? '🎯 Target' : '🛡️ Safe'}
                                  </span>
                                  <span className="font-semibold text-slate-800 truncate" title={u.name}>
                                    {u.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* 5. Approval Status */}
                          <td className="py-3.5 px-3 min-w-[170px] text-center align-middle">
                            {isLocked ? (
                              <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-[5px] text-[11px] font-semibold border whitespace-nowrap bg-purple-50 text-purple-700 border-purple-200 shadow-2xs">
                                <Lock className="w-3 h-3 text-purple-600" /> Locked for Applications
                              </span>
                            ) : isApproved ? (
                              <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-[5px] text-[11px] font-semibold border whitespace-nowrap bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Signed & Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-[5px] text-[11px] font-semibold border whitespace-nowrap bg-amber-50 text-amber-700 border-amber-200 shadow-2xs">
                                <Clock className="w-3 h-3 text-amber-600" /> Awaiting Sign-Off
                              </span>
                            )}
                          </td>

                          {/* 6. Consent Verification */}
                          <td className="py-3.5 px-3 min-w-[160px] text-center align-middle">
                            <span
                              className={`inline-flex items-center justify-center px-2.5 py-1 rounded-[5px] text-[11px] font-semibold border whitespace-nowrap shadow-2xs ${
                                isApproved
                                  ? 'bg-blue-50 text-[#087cf5] border-blue-200'
                                  : 'bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                            >
                              {isApproved ? '✓ Digital OTP Verified' : 'Portal Magic Link Sent'}
                            </span>
                          </td>

                          {/* 7. Earliest Deadline */}
                          <td className="py-3.5 px-3 min-w-[150px] text-center align-middle">
                            <div className="inline-flex flex-col items-center">
                              <div className="font-semibold text-slate-800 text-[11.5px] flex items-center justify-center gap-1.5 whitespace-nowrap">
                                <Clock className="w-3.5 h-3.5 text-[#64748b] shrink-0" />
                                <span>{shortlist[0]?.deadline || '31 Mar 2027'}</span>
                              </div>
                              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 inline-block mt-1 whitespace-nowrap shadow-2xs">
                                {shortlist[0]?.daysLeft || 28}d left
                              </span>
                            </div>
                          </td>

                          {/* 8. Action */}
                          <td className="py-3.5 px-3 min-w-[140px] text-center align-middle">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenStudent(st);
                              }}
                              className="px-3 py-1.5 rounded-[5px] bg-[#087cf5] text-white hover:bg-[#006ee6] font-semibold text-[11px] transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-xs hover:shadow group/btn"
                            >
                              <span>Open Approval</span>
                              <span className="transition-transform group-hover/btn:translate-x-0.5 font-bold">&gt;</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[#64748b] text-xs">
                        No student approval records found matching your filters.
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
                  Showing <span className="font-bold text-[#087cf5]">{filteredStudents.length}</span> of {studentList.length} candidate portfolios
                </span>
                <span className="hidden sm:inline text-slate-300">|</span>
                <span className="hidden sm:inline text-[11px] text-slate-500">
                  Click any row to open the complete Student Approval & Sign-Off Window
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  Digital Sign-off Engine active
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODE 2: STUDENT FINAL APPROVAL WORKSPACE / WINDOW                   */}
      {/* ==================================================================== */}
      {selectedStudent && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          {/* Top Breadcrumb & Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-0.5">
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleBackToList}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#e2e8f0] bg-white hover:bg-slate-50 text-[12px] font-semibold text-[#101d37] shadow-xs transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#087cf5]" />
                <span>← Back to Approval Directory</span>
              </button>

              <span className="text-[12px] text-[#64748b] hidden sm:inline">
                Home &gt; Student Approval &gt;{' '}
                <span className="font-bold text-[#101d37]">{selectedStudent.name}</span>{' '}
                <span className="text-[#64748b]">({selectedStudent.studentId})</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast('Approval summary document PDF downloaded')}
                className="px-2.5 py-1.5 rounded-[6px] border border-[#cbd5e1] bg-white hover:bg-slate-50 text-[#101d37] text-[11.5px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Download Approval Pack</span>
              </button>

              <button
                onClick={() => showToast('Magic Portal Link copied to clipboard')}
                className="px-2.5 py-1.5 rounded-[6px] border border-[#bfdbfe] bg-blue-50 hover:bg-blue-100 text-[#087cf5] text-[11.5px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Portal Link</span>
              </button>
            </div>
          </div>

          {/* Student Profile Overview Card */}
          <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <StudentAvatar
                  name={selectedStudent.name}
                  src={selectedStudent.avatar}
                  className="w-12 h-12 aspect-square rounded-full object-cover border-2 border-blue-500/30 shadow-xs text-sm"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[16px] font-bold text-[#101d37] leading-tight">
                      {selectedStudent.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10.5px] font-mono font-bold">
                      {selectedStudent.studentId}
                    </span>
                    {isLockedForApplications ? (
                      <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked for Applications
                      </span>
                    ) : otpVerified ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Signed & Approved via Digital OTP
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Awaiting Student Sign-Off
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#64748b] mt-1">
                    <span>
                      {countryFlag(selectedStudent.country)}{' '}
                      <strong className="text-slate-800">{selectedStudent.country}</strong> ({selectedStudent.intake})
                    </span>
                    <span>•</span>
                    <span>Course: <strong className="text-slate-800">{selectedStudent.preferredCourse}</strong></span>
                    <span>•</span>
                    <span>Counsellor: <strong className="text-[#087cf5]">{selectedStudent.counsellor}</strong></span>
                    <span>•</span>
                    <span>Phone: {selectedStudent.phone}</span>
                  </div>
                </div>
              </div>

              {/* Quick Academic Badges */}
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1.5 rounded-[6px] bg-[#f8fafc] border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 font-semibold block">CGPA</span>
                  <span className="text-[12.5px] font-bold text-slate-800">{selectedStudent.academic.cgpa}</span>
                </div>
                <div className="px-2.5 py-1.5 rounded-[6px] bg-blue-50/60 border border-blue-200 text-center">
                  <span className="text-[10px] text-[#087cf5] font-semibold block">English</span>
                  <span className="text-[12.5px] font-bold text-[#087cf5]">{selectedStudent.academic.englishTest}</span>
                </div>
                <div className="px-2.5 py-1.5 rounded-[6px] bg-emerald-50/60 border border-emerald-200 text-center">
                  <span className="text-[10px] text-emerald-700 font-semibold block">Budget Fit</span>
                  <span className="text-[12.5px] font-bold text-emerald-700">Verified</span>
                </div>
              </div>
            </div>

            {/* 5-Stage Visual Workflow Stepper */}
            <div className="mt-3.5 pt-3 border-t border-slate-100">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                <div className="p-1.5 rounded bg-emerald-50/70 border border-emerald-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    ✓
                  </span>
                  <div>
                    <span className="font-bold text-emerald-800 block text-[10.5px]">1. Enrolled</span>
                    <span className="text-[9.5px] text-emerald-600">Agreement signed</span>
                  </div>
                </div>

                <div className="p-1.5 rounded bg-emerald-50/70 border border-emerald-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    ✓
                  </span>
                  <div>
                    <span className="font-bold text-emerald-800 block text-[10.5px]">2. Shortlisting</span>
                    <span className="text-[9.5px] text-emerald-600">4 Unis ready</span>
                  </div>
                </div>

                <div className={`p-1.5 rounded flex items-center gap-2 shadow-2xs ${
                  isLockedForApplications
                    ? 'bg-emerald-50/70 border border-emerald-200'
                    : 'bg-blue-50 border-2 border-[#087cf5]'
                }`}>
                  <span className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 ${
                    isLockedForApplications
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#087cf5] text-white animate-pulse'
                  }`}>
                    {isLockedForApplications ? '✓' : '3'}
                  </span>
                  <div>
                    <span className={`font-bold block text-[10.5px] ${
                      isLockedForApplications ? 'text-emerald-800' : 'text-[#087cf5]'
                    }`}>3. Student Approval</span>
                    <span className={`text-[9.5px] ${
                      isLockedForApplications ? 'text-emerald-600' : 'text-blue-700 font-semibold'
                    }`}>{isLockedForApplications ? 'Consent Locked' : 'Active Sign-Off'}</span>
                  </div>
                </div>

                <div className={`p-1.5 rounded flex items-center gap-2 ${
                  isLockedForApplications
                    ? 'bg-blue-50 border-2 border-[#087cf5]'
                    : 'bg-slate-50 border border-slate-200'
                }`}>
                  <span className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 ${
                    isLockedForApplications
                      ? 'bg-[#087cf5] text-white animate-pulse'
                      : 'bg-slate-300 text-slate-700'
                  }`}>
                    4
                  </span>
                  <div>
                    <span className={`font-bold block text-[10.5px] ${
                      isLockedForApplications ? 'text-[#087cf5]' : 'text-slate-600'
                    }`}>4. Documentation</span>
                    <span className={`text-[9.5px] ${
                      isLockedForApplications ? 'text-blue-700 font-semibold' : 'text-slate-400'
                    }`}>{isLockedForApplications ? 'Ready to Verify' : 'Next Stage'}</span>
                  </div>
                </div>

                <div className="p-1.5 rounded bg-slate-50 border border-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-300 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                    5
                  </span>
                  <div>
                    <span className="font-bold text-slate-600 block text-[10.5px]">5. Applications</span>
                    <span className="text-[9.5px] text-slate-400">Submissions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Layout: Left Workspace (70%) + Right Decision Sidebar (30%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            {/* Left 8 Cols: Shortlist Review, Prerequisites & Digital Sign-off */}
            <div className="lg:col-span-8 space-y-3.5">
              {/* SECTION 1: 3-Tier Shortlist Selection & Priority Locking */}
              <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[14px] text-[#101d37]">
                        3-Tier University Shortlist Selection & Preference Locking
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#087cf5] font-bold text-[10px] border border-blue-200">
                        {uniChoices.filter((u) => u.approved).length} of {uniChoices.length} Approved
                      </span>
                    </div>
                    <p className="text-[11.5px] text-[#64748b] mt-0.5">
                      Verify candidate preference rankings (1st, 2nd, 3rd, 4th) and confirm which universities are approved to receive applications.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (onNavigate) onNavigate(`university-shortlisting?id=${selectedStudent.studentId}`);
                    }}
                    className="text-[11px] font-semibold text-[#087cf5] hover:underline flex items-center gap-1"
                  >
                    <span>Edit in Shortlisting View</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {/* University Choice Cards */}
                <div className="space-y-2.5">
                  {uniChoices.map((uni, idx) => (
                    <div
                      key={uni.id}
                      className={`border rounded-[8px] p-3 transition-all ${
                        uni.approved
                          ? 'bg-white border-[#cbd5e1] hover:border-blue-300 shadow-2xs'
                          : 'bg-slate-50/70 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={uni.approved}
                            onChange={() => handleToggleUni(uni.id)}
                            className="w-4 h-4 mt-0.5 text-[#087cf5] rounded border-slate-300 cursor-pointer"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold border ${
                                  uni.tier === 'Dream'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : uni.tier === 'Target'
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                }`}
                              >
                                {uni.tier === 'Dream' ? '🌟 Dream Option' : uni.tier === 'Target' ? '🎯 Target Match' : '🛡️ Safe Backup'}
                              </span>
                              <span className="text-[13px] font-bold text-[#101d37]">{uni.name}</span>
                              <span className="text-[11px] text-[#64748b]">
                                {uni.city}, {uni.country} {uni.flag}
                              </span>
                            </div>
                            <div className="text-[11.5px] text-slate-700 font-medium mt-1">
                              Program: <strong className="text-[#087cf5]">{uni.course}</strong> ({uni.degreeLevel})
                            </div>
                            <div className="text-[11px] text-slate-500 italic mt-0.5">
                              "{uni.rationale}"
                            </div>
                          </div>
                        </div>

                        {/* Priority Selector & Match Pill */}
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10.5px] font-bold">
                            Match: {uni.matchScore}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-[10.5px] text-slate-500 font-semibold">Priority:</span>
                            <select
                              value={uni.priority}
                              onChange={(e) => handleChangePriority(uni.id, parseInt(e.target.value))}
                              className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[11px] font-bold text-[#101d37]"
                            >
                              <option value={1}>1st Choice</option>
                              <option value={2}>2nd Choice</option>
                              <option value={3}>3rd Choice</option>
                              <option value={4}>4th Choice</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Fee and Deadline Strip */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#64748b]">
                        <div className="flex items-center gap-3">
                          <span>
                            Tuition: <strong className="text-slate-800 font-semibold">{uni.tuitionFee}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            App Fee: <strong className="text-slate-800 font-semibold">{uni.appFee}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Deadline: <strong className="text-slate-800">{uni.deadline}</strong></span>
                          <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px]">
                            {uni.daysLeft}d left
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financial Overview Banner */}
                <div className="p-3 bg-[#f8fafc] border border-slate-200 rounded-[7px] flex flex-wrap items-center justify-between gap-2 text-[11.5px]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#087cf5]" />
                    <span className="font-semibold text-slate-800">
                      Approved Application Portfolio: <strong>{uniChoices.filter((u) => u.approved).length} Universities</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <span>
                      Est. Total Application Fees: <strong className="text-slate-800">€160 (~₹14,500)</strong>
                    </span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">
                      Student funding & loan affidavit verified
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Prerequisites & Verification Audit Matrix */}
              <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs space-y-2.5">
                <h3 className="font-bold text-[13.5px] text-[#101d37] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Prerequisites & Document Readiness Compliance
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px]">
                  <div className="p-2.5 rounded-[6px] bg-slate-50 border border-slate-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800 block">Academic Equivalence Verified</strong>
                      <span className="text-slate-500 text-[11px]">
                        Bachelor Degree credits align with 180 ECTS minimum cutoff.
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-[6px] bg-slate-50 border border-slate-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800 block">English Language Cutoff Met</strong>
                      <span className="text-slate-500 text-[11px]">
                        Score ({selectedStudent.academic.englishTest}) meets all 4 university direct admission bars.
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-[6px] bg-slate-50 border border-slate-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800 block">Application Files Completed</strong>
                      <span className="text-slate-500 text-[11px]">
                        SOP, 2 LORs, CV, and verified transcripts ready for portal upload.
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-[6px] bg-slate-50 border border-slate-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800 block">Financial Proofs Confirmed</strong>
                      <span className="text-slate-500 text-[11px]">
                        Student & sponsor have signed off on estimated living and tuition expenses.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Formal Digital Consent & OTP Verification Engine */}
              <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-[13.5px] text-[#101d37] flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-[#087cf5]" />
                    Student Digital OTP Consent & Formal Sign-Off
                  </h3>
                  <span className="text-[11px] text-[#64748b]">
                    Security Protocol: 256-bit Digital Signature & OTP Audit
                  </span>
                </div>

                {/* Digital OTP Verification Box */}
                <div className="p-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/40 border border-blue-200/70 rounded-[8px] space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-[#087cf5]" />
                      <span className="font-semibold text-slate-800">
                        Registered Mobile: <span className="font-mono">{selectedStudent.phone}</span>
                      </span>
                      <span className="text-slate-300">|</span>
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-600">{selectedStudent.email}</span>
                    </div>

                    {otpVerified ? (
                      <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Digital OTP Verified (Ref: OTP-74921)
                      </span>
                    ) : (
                      <button
                        onClick={handleSendOtp}
                        className="px-3 py-1 rounded-[5px] bg-[#087cf5] hover:bg-[#006ee6] text-white font-bold text-[11px] shadow-xs transition-colors flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send 6-Digit OTP to Student</span>
                      </button>
                    )}
                  </div>

                  {/* OTP Verification Input (Visible if OTP not yet verified) */}
                  {!otpVerified && (
                    <div className="pt-2 border-t border-blue-200/50 flex flex-wrap items-center gap-2">
                      <span className="text-[11.5px] text-slate-700 font-medium">Enter 6-digit verification code:</span>
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="e.g. 749210"
                        className="w-28 bg-white border border-[#bfdbfe] focus:border-[#087cf5] rounded-[5px] px-2.5 py-1 text-center font-mono font-bold text-[13px] text-[#101d37] outline-none"
                      />
                      <button
                        onClick={handleVerifyOtp}
                        className="px-3 py-1 rounded-[5px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11.5px] shadow-xs transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Verify & Sign</span>
                      </button>
                      <span className="text-[11px] text-slate-400">
                        (Demo test code: 749210 or any 6 digits)
                      </span>
                    </div>
                  )}

                  {/* OTP Audit Trail Info */}
                  {otpVerified && (
                    <div className="text-[10.5px] text-slate-500 font-mono bg-white/70 p-2 rounded border border-blue-100 flex flex-wrap items-center justify-between gap-1">
                      <span>✓ Digital OTP Authenticated • IP: 103.24.112.18 • Timestamp: 12 Oct 2026, 14:32:08 IST</span>
                      <span className="text-emerald-700 font-bold">Tamper-Proof Audit Hash: #SHA256-8A7B9C</span>
                    </div>
                  )}
                </div>

                {/* Legal Declarations */}
                <div className="space-y-2 text-[11.5px] text-slate-700">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={undertakingAgreed}
                      onChange={(e) => setUndertakingAgreed(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-[#087cf5] rounded border-slate-300"
                    />
                    <span>
                      I, <strong>{selectedStudent.name}</strong>, have thoroughly evaluated the shortlisted universities, course specializations, and estimated fee structures above, and hereby give my official consent to proceed with formal university applications.
                    </span>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={depositAgreed}
                      onChange={(e) => setDepositAgreed(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-[#087cf5] rounded border-slate-300"
                    />
                    <span>
                      I confirm that university application fees are non-refundable once processed on institutional portals, and I agree to provide mandatory visa deposits within assigned deadlines.
                    </span>
                  </label>
                </div>

                {/* Digital Signature Rendering Display */}
                <div className="p-3 bg-amber-50/40 border border-amber-200/70 rounded-[8px] flex items-center justify-between">
                  <div>
                    <span className="text-[10.5px] text-amber-800 font-bold uppercase tracking-wider block">
                      Student Digital Signature
                    </span>
                    <div className="font-serif italic text-[20px] text-slate-800 mt-0.5 tracking-wide">
                      {selectedStudent.name}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Signed via Certified Electronic Verification • {selectedStudent.studentId}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="px-2.5 py-1 rounded bg-white border border-amber-300 text-amber-800 font-bold text-[10px] uppercase shadow-2xs inline-block">
                      VERIFIED DIGITAL SIGN-OFF
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                      Status: LEGALLY BINDING
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Decision Action Box, Counsellor Log & Direct Hand-off */}
            <div className="lg:col-span-4 space-y-3.5">
              {/* Decision Action Card */}
              <div className="bg-white rounded-[9px] border-2 border-blue-500/30 p-3.5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Award className="w-4 h-4 text-[#087cf5]" />
                  <h3 className="font-bold text-[13.5px] text-[#101d37]">Final Approval Decision</h3>
                </div>

                <div className="space-y-2 text-[11.5px] text-slate-600">
                  <p>
                    Final sign-off locks candidate choices and transitions the profile to <strong>Stage 4: Documentation Completed</strong> to verify mandatory university documents.
                  </p>
                </div>

                {/* Primary Button */}
                <button
                  onClick={handleApproveAndAdvance}
                  className={`w-full py-2.5 px-3.5 rounded-[6px] font-bold text-[12.5px] text-white shadow-xs transition-all flex items-center justify-center gap-2 ${
                    isLockedForApplications
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : otpVerified
                      ? 'bg-[#087cf5] hover:bg-[#006ee6] shadow-md hover:shadow-lg'
                      : 'bg-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isLockedForApplications
                      ? 'Approved & Locked (Stage 4 Active)'
                      : 'Approve & Advance to Documentation Completed (Stage 4)'}
                  </span>
                </button>

                {/* Go to Documentation Completed Button (if already approved/locked) */}
                {isLockedForApplications && (
                  <button
                    onClick={() => {
                      if (onNavigate) onNavigate(`documentation?id=${selectedStudent.studentId}`);
                    }}
                    className="w-full py-2 px-3 rounded-[6px] bg-purple-600 hover:bg-purple-700 font-bold text-[12px] text-white transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Go to Documentation Completed View</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {/* Secondary Button: Request Shortlist Revision */}
                <button
                  onClick={() => setShowRevisionModal(true)}
                  className="w-full py-2 px-3 rounded-[6px] border border-amber-300 bg-amber-50 hover:bg-amber-100 font-semibold text-[11.5px] text-amber-800 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Request Shortlist Revision</span>
                </button>

                {/* Fast Follow-up Options */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                  <span>Contact Candidate:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenPhone?.(selectedStudent as any)}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
                      title="Call"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenWhatsApp?.(selectedStudent as any)}
                      className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600"
                      title="WhatsApp"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenEmail?.(selectedStudent as any)}
                      className="p-1.5 rounded hover:bg-blue-50 text-[#087cf5]"
                      title="Email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Counsellor Log & Audit Details */}
              <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs space-y-2.5">
                <h4 className="font-bold text-[12.5px] text-[#101d37]">Counselling Case Owner</h4>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-[#087cf5] font-bold text-xs flex items-center justify-center">
                    {selectedStudent.counsellor.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-[12px] text-slate-800 block">
                      {selectedStudent.counsellor}
                    </span>
                    <span className="text-[10.5px] text-slate-500">
                      Senior Study Abroad Advisor
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Portfolio Drafted:</span>
                    <strong className="text-slate-800 font-semibold">10 Oct 2026</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Sent for Student Sign-off:</span>
                    <strong className="text-slate-800 font-semibold">12 Oct 2026</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Approval Method:</span>
                    <strong className="text-emerald-700 font-semibold">Digital OTP Verified</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: SUCCESS TRANSITION TO APPLICATIONS (STAGE 5)                 */}
      {/* ==================================================================== */}
      {showSuccessModal && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[12px] max-w-[480px] w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-[18px] font-bold text-[#101d37]">
                Shortlist Approved & Locked!
              </h3>
              <p className="text-[12.5px] text-slate-600 mt-1">
                <strong>{selectedStudent.name}</strong> ({selectedStudent.studentId}) has officially approved the 3-tier university portfolio. The profile has now advanced to <strong>Stage 4: Documentation Completed</strong>.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-[8px] border border-slate-200 text-left text-[11.5px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Destination:</span>
                <span className="font-semibold text-slate-800">{selectedStudent.country} ({selectedStudent.intake})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Approved Universities:</span>
                <span className="font-semibold text-slate-800">{uniChoices.filter((u) => u.approved).length} Universities</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Authentication:</span>
                <span className="font-semibold text-emerald-700">✓ Digital OTP & Legal Undertaking Verified</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-4 py-2 rounded-[6px] border border-slate-200 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
              >
                Stay on Approval Window
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  if (onNavigate) onNavigate(`documentation?id=${selectedStudent.studentId}`);
                }}
                className="px-4 py-2 rounded-[6px] bg-[#087cf5] hover:bg-[#006ee6] text-[12px] font-bold text-white flex items-center gap-1.5 shadow-xs"
              >
                <span>Proceed to Documentation Completed (Stage 4)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: REQUEST SHORTLIST REVISION                                   */}
      {/* ==================================================================== */}
      {showRevisionModal && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[12px] max-w-[480px] w-full p-5 shadow-2xl border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-[15px] text-[#101d37]">Request Shortlist Revision</h3>
              </div>
              <button onClick={() => setShowRevisionModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">
                ×
              </button>
            </div>

            <p className="text-[12px] text-slate-600">
              Provide feedback or notes regarding which university or course {selectedStudent.name} would like to swap. This case will be flagged for review in Stage 2 University Shortlisting.
            </p>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Student Revision Notes / Rationale:
              </label>
              <textarea
                rows={3}
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="e.g. Student requests replacing RWTH Aachen with TU Darmstadt due to strict German language requirements..."
                className="w-full bg-[#f8fafc] border border-slate-300 focus:border-[#087cf5] rounded-[6px] p-2.5 text-[12px] text-[#101d37] outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
              <button
                onClick={() => setShowRevisionModal(false)}
                className="px-3.5 py-1.5 rounded-[6px] border border-slate-200 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRevision}
                className="px-3.5 py-1.5 rounded-[6px] bg-amber-600 hover:bg-amber-700 text-white font-bold text-[12px] shadow-xs"
              >
                Submit Revision to Shortlisting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
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
