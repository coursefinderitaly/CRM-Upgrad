import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
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
  Download,
  ExternalLink,
  Calendar,
  CreditCard,
  FileCheck2,
  Sparkles,
  Trophy,
  Landmark,
  BadgePercent,
  CheckCircle,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { StudentRecord } from '../services/studentsData';
import { WorkflowStageBanner } from '../components/workflow/WorkflowStageBanner';
import { getStageById } from '../context/WorkflowContext';
import { ActionConfirmModal } from '../components/modals/ActionConfirmModal';

interface FinalUniversityViewProps {
  students?: StudentRecord[];
  onAdvanceStage?: (studentId: string) => any;
  onNavigate?: (route: string) => void;
  onOpenPhone?: (lead: any) => void;
  onOpenWhatsApp?: (lead: any) => void;
  onOpenEmail?: (lead: any) => void;
  onScheduleFollowUp?: (lead: any) => void;
}

interface UniversityOption {
  id: string;
  name: string;
  country: string;
  course: string;
  intake: string;
  tuitionFee: string;
  scholarshipGrant: string;
  netPayable: string;
  depositAmount: string;
  deadline: string;
  isSelected: boolean;
}

interface FinalChoiceData {
  selectedUniversity: string;
  course: string;
  intake: string;
  depositStatus: 'Deposit Verified' | 'Pending Transfer' | 'Fee Waived';
  depositRef: string;
  options: UniversityOption[];
  isLocked: boolean;
}

const getFinalChoiceForStudent = (student: StudentRecord): FinalChoiceData | null => {
  const offers = Array.isArray(student.offers) ? student.offers : [];
  if (offers.length === 0) return null;

  const options: UniversityOption[] = offers.map((offer, index) => ({
    id: `offer-${index + 1}`,
    name: offer.university,
    country: student.country,
    course: student.preferredCourse || '-',
    intake: student.intake || '-',
    tuitionFee: '-',
    scholarshipGrant: '-',
    netPayable: '-',
    depositAmount: '-',
    deadline: '-',
    isSelected: index === 0,
  }));

  const selected = options[0];
  return {
    selectedUniversity: selected.name,
    course: student.preferredCourse || '-',
    intake: student.intake || '-',
    depositStatus: 'Pending Transfer',
    depositRef: '-',
    options,
    isLocked: student.stageNumber >= 8,
  };
};

export const FinalUniversityView: React.FC<FinalUniversityViewProps> = ({
  students,
  onAdvanceStage,
  onNavigate,
  onOpenPhone,
  onOpenWhatsApp,
  onOpenEmail,
  onScheduleFollowUp,
}) => {
  const studentList = students || [];

  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [activeChoice, setActiveChoice] = useState<FinalChoiceData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    variant?: 'primary' | 'success' | 'warning';
    onConfirm: () => void;
  } | null>(null);

  // Hash Deep-linking
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.includes('final-university') && hash.includes('?id=')) {
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
    window.location.hash = `final-university?id=${st.studentId}`;
    setActiveChoice(getFinalChoiceForStudent(st));
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
    window.location.hash = 'final-university';
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Stats
  const stats = useMemo(() => {
    let lockedCount = 0;
    let depositVerifiedCount = 0;
    let pendingCount = 0;

    studentList.forEach((st) => {
      const choice = getFinalChoiceForStudent(st);
      if (!choice) return;
      if (choice.isLocked) lockedCount++;
      else pendingCount++;
      if (choice.depositStatus === 'Deposit Verified') depositVerifiedCount++;
    });

    return {
      total: studentList.filter((st) => getFinalChoiceForStudent(st)).length,
      locked: lockedCount,
      depositVerified: depositVerifiedCount,
      pending: pendingCount,
    };
  }, [studentList]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return studentList.filter((st) => {
      const choice = getFinalChoiceForStudent(st);
      if (!choice) return false;

      if (countryFilter !== 'All' && st.country !== countryFilter) return false;
      if (statusFilter !== 'All' && choice.depositStatus !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          st.name.toLowerCase().includes(q) ||
          st.studentId.toLowerCase().includes(q) ||
          st.country.toLowerCase().includes(q) ||
          choice.selectedUniversity.toLowerCase().includes(q) ||
          choice.course.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [studentList, countryFilter, statusFilter, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#087cf5] text-white px-4 py-2.5 rounded-lg shadow-lg text-[13px] font-medium flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Reusable Action Confirmation Floating Card */}
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

      {/* ======================================================== */}
      {/* MODE 1: DIRECTORY / TABLE VIEW                          */}
      {/* ======================================================== */}
      {!selectedStudent && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[17px] font-bold text-[#101d37] leading-tight">
                    Final University Decision & Seat Confirmation
                  </h1>
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                    <ShieldCheck className="w-3 h-3 text-purple-600" /> Stage 7 • Locked Institution & Seat Confirmation
                  </span>
                </div>
                <p className="text-[11.5px] text-[#64748b] leading-tight mt-0.5">
                  Compare student admission offers, lock the final institution choice, verify tuition deposit receipt, and advance the student file to Scholarship.
                </p>
              </div>
            </div>

            <div className="text-[11.5px] text-[#64748b] hidden sm:inline">
              Home &gt; <span className="font-semibold text-[#101d37]">Final University</span>
            </div>
          </div>

          {/* Workflow Stage Banner */}
          <WorkflowStageBanner
            stage={getStageById('final-university')}
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
                  title: 'Forward to Scholarship',
                  studentName: targetStudent.name,
                  studentId: targetStudent.studentId,
                  studentAvatar: targetStudent.avatar,
                  country: targetStudent.country,
                  currentStageName: 'Stage 7: Final University',
                  targetStageName: 'Stage 8: Scholarship',
                  description: `Advance ${targetStudent.name} to Stage 8 (Scholarship) to verify regional scholarship applications (DSU / ISEE / DAAD), submit income certificates, and track tuition waivers.`,
                  confirmLabel: 'Confirm & Forward to Stage 8',
                  variant: 'primary',
                  onConfirm: () => {
                    if (onAdvanceStage) onAdvanceStage(id);
                    if (onNavigate) onNavigate(`scholarship?id=${targetStudent.studentId}`);
                  },
                });
              } else if (onAdvanceStage) {
                onAdvanceStage(id);
              }
            }}
            onEmptyAction={() => onNavigate && onNavigate('offer-letters')}
            emptyActionLabel="Go to Offer Letters"
            emptyHint="No students have reached the Final University stage yet."
          />

          {/* 4 KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Total Students in Decision</span>
              <div className="text-[19px] font-bold text-[#101d37] mt-0.5">{stats.total}</div>
              <span className="text-[10px] text-[#087cf5] font-semibold">● Active Candidate Files</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Final Choice Locked</span>
              <div className="text-[19px] font-bold text-purple-600 mt-0.5">{stats.locked}</div>
              <span className="text-[10px] text-purple-600 font-semibold">🔒 Institution Locked</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Tuition Deposit Verified</span>
              <div className="text-[19px] font-bold text-emerald-600 mt-0.5">{stats.depositVerified}</div>
              <span className="text-[10px] text-emerald-600 font-semibold">✓ Seat Confirmed</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Awaiting Student Choice</span>
              <div className="text-[19px] font-bold text-amber-600 mt-0.5">{stats.pending}</div>
              <span className="text-[10px] text-amber-600 font-semibold">In Counsellor Discussion</span>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-[#101d37]">Active Student Candidates</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold">
                  Stage 7 Choice
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2 pt-1 border-t border-slate-100">
              <div className="relative sm:col-span-2">
                <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student by name, student ID, country, or selected university..."
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
                  <option value="Italy">Italy</option>
                  <option value="Germany">Germany</option>
                  <option value="UK">UK</option>
                  <option value="France">France</option>
                </select>
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] rounded-[6px] px-2.5 py-1.5 text-[12px] text-[#101d37] outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Deposit Verified">Deposit Verified</option>
                  <option value="Pending Transfer">Pending Transfer</option>
                </select>
              </div>
            </div>
          </div>

          {/* Directory Table */}
          <div className="bg-white rounded-[8px] border border-[#e5edf5] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px] border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] text-[#52627a] font-semibold border-b border-[#e5edf5]">
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Selected Final University</th>
                    <th className="py-2.5 px-3">Course & Intake</th>
                    <th className="py-2.5 px-3">Offers In Hand</th>
                    <th className="py-2.5 px-3">Tuition & Deposit</th>
                    <th className="py-2.5 px-3">Choice Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500 text-[12px]">
                        No student files found matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st) => {
                      const choice = getFinalChoiceForStudent(st);
                      if (!choice) return null;
                      return (
                        <tr key={st.id} className="hover:bg-[#f8fbff] transition-colors group">
                          {/* Student */}
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={st.avatar}
                                alt={st.name}
                                className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                              <div>
                                <div className="font-semibold text-[#101d37] leading-tight flex items-center gap-1">
                                  <span>{st.name}</span>
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-normal">
                                    {st.country}
                                  </span>
                                </div>
                                <div className="text-[10.5px] text-[#64748b] leading-tight mt-0.5">
                                  {st.studentId} • {st.counsellor}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Selected Final University */}
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-[#101d37] flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                              <span className="truncate max-w-[190px]">{choice.selectedUniversity}</span>
                            </div>
                            <div className="text-[10.5px] text-purple-700 font-medium mt-0.5">
                              🔒 Confirmed Final Choice
                            </div>
                          </td>

                          {/* Course & Intake */}
                          <td className="py-2.5 px-3">
                            <div className="text-[#101d37] font-medium truncate max-w-[180px]">
                              {choice.course}
                            </div>
                            <div className="text-[10.5px] text-slate-500 mt-0.5">
                              Intake: {choice.intake}
                            </div>
                          </td>

                          {/* Offers In Hand */}
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10.5px] font-bold border border-emerald-200">
                              <Trophy className="w-3 h-3 text-emerald-600" />
                              {choice.options.length} Official Offers
                            </span>
                          </td>

                          {/* Tuition & Deposit */}
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-800">
                              {choice.options[0]?.netPayable}
                            </div>
                            <div className="text-[10.5px] text-slate-500 mt-0.5">
                              Deposit: {choice.depositStatus}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-semibold ${
                                choice.depositStatus === 'Deposit Verified'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              ● {choice.depositStatus}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleOpenStudent(st)}
                              className="px-2.5 py-1 rounded-[5px] bg-[#087cf5] hover:bg-[#006ee6] text-white text-[11px] font-semibold transition-colors shadow-xs"
                            >
                              Open Decision File
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 2: STUDENT FINAL UNIVERSITY WORKSPACE WINDOW        */}
      {/* ======================================================== */}
      {selectedStudent && activeChoice && (
        <div className="space-y-3.5 animate-in fade-in duration-150">
          {/* Top Bar with Back Button */}
          <div className="flex items-center justify-between bg-white rounded-[8px] border border-[#e5edf5] p-2.5 shadow-xs">
            <button
              onClick={handleBackToList}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[5px] text-[#52627a] hover:text-[#101d37] hover:bg-slate-100 text-[12px] font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Final University Directory</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[11.5px] text-[#64748b]">Stage 7 Decision:</span>
              <span className="font-bold text-[#101d37] text-[12.5px]">{selectedStudent.name}</span>
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                Final Institution Confirmation
              </span>
            </div>
          </div>

          {/* Student Profile Card Header */}
          <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStudent.avatar}
                  alt={selectedStudent.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-purple-500 shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[16px] font-bold text-[#101d37] leading-tight">
                      {selectedStudent.name}
                    </h2>
                    <span className="px-2 py-0.5 bg-blue-50 text-[#087cf5] text-[10.5px] font-bold rounded-md border border-blue-200">
                      {selectedStudent.studentId}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10.5px] font-medium rounded-md">
                      {selectedStudent.country}
                    </span>
                  </div>
                  <div className="text-[11.5px] text-[#64748b] mt-0.5 flex flex-wrap items-center gap-3">
                    <span>📧 {selectedStudent.email}</span>
                    <span>📱 {selectedStudent.phone}</span>
                    <span>👤 Counsellor: {selectedStudent.counsellor}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenPhone?.(selectedStudent as any)}
                  className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 border border-slate-200"
                  title="Call candidate"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenWhatsApp?.(selectedStudent as any)}
                  className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-600 border border-emerald-200"
                  title="WhatsApp message"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenEmail?.(selectedStudent as any)}
                  className="p-1.5 rounded-md hover:bg-blue-50 text-[#087cf5] border border-blue-200"
                  title="Send email"
                >
                  <Mail className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onScheduleFollowUp?.(selectedStudent as any)}
                  className="p-1.5 rounded-md hover:bg-indigo-50 text-indigo-600 border border-indigo-200"
                  title="Schedule Follow-up"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Locked University Notification Banner */}
          <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 rounded-[9px] p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[14px] font-bold text-[#101d37] flex items-center gap-2">
                  <span>Selected Final Choice: {activeChoice.selectedUniversity}</span>
                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10.5px] font-bold border border-purple-300">
                    Confirmed Destination
                  </span>
                </div>
                <div className="text-[11.5px] text-[#52627a] mt-0.5">
                  Course: {activeChoice.course} • Term: {activeChoice.intake} • Verified and ready for scholarship and pre-enrollment processing.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  showToast('Seat acceptance letter & deposit receipt exported as PDF.');
                }}
                className="px-3 py-1.5 rounded-[6px] bg-white border border-[#cbd5e1] hover:bg-slate-50 text-[#101d37] text-[11.5px] font-semibold flex items-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export Final Choice Agreement</span>
              </button>
            </div>
          </div>

          {/* Main Grid: Left Comparison & Details (8 cols) & Right Actions (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-3.5">
              {/* Module 1: Received Offers Comparison Matrix */}
              <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
                  <h3 className="text-[13.5px] font-bold text-[#101d37] flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-emerald-600" />
                    Compare Received University Offers & Select Final
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    {activeChoice.options.length} Admission Offers Available
                  </span>
                </div>

                <div className="space-y-2.5">
                  {activeChoice.options.map((opt) => (
                    <div
                      key={opt.id}
                      className={`p-3 rounded-[8px] border transition-all ${
                        opt.name === activeChoice.selectedUniversity
                          ? 'border-purple-400 bg-purple-50/40 shadow-xs ring-1 ring-purple-300'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <input
                            type="radio"
                            name="finalChoice"
                            checked={opt.name === activeChoice.selectedUniversity}
                            onChange={() => {
                              setActiveChoice((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      selectedUniversity: opt.name,
                                      course: opt.course,
                                      options: prev.options.map((o) => ({
                                        ...o,
                                        isSelected: o.id === opt.id,
                                      })),
                                    }
                                  : null
                              );
                              showToast(`Selected ${opt.name} as final institution.`);
                            }}
                            className="mt-1 text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                          <div>
                            <div className="font-bold text-[13px] text-[#101d37] flex items-center gap-1.5">
                              <span>{opt.name}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-normal">
                                {opt.country}
                              </span>
                            </div>
                            <div className="text-[11.5px] text-slate-600 mt-0.5">{opt.course}</div>
                          </div>
                        </div>

                        {opt.name === activeChoice.selectedUniversity ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
                            Winning Choice
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveChoice((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      selectedUniversity: opt.name,
                                      course: opt.course,
                                      options: prev.options.map((o) => ({
                                        ...o,
                                        isSelected: o.id === opt.id,
                                      })),
                                    }
                                  : null
                              );
                              showToast(`Selected ${opt.name} as final choice.`);
                            }}
                            className="text-[11px] text-purple-600 hover:text-purple-800 font-semibold underline"
                          >
                            Set as Final
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 mt-2.5 border-t border-slate-100 text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Tuition Fee</span>
                          <strong className="text-slate-700">{opt.tuitionFee}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Financial Grant</span>
                          <strong className="text-emerald-700">{opt.scholarshipGrant}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Net Payable</span>
                          <strong className="text-purple-700">{opt.netPayable}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Deposit Deadline</span>
                          <strong className="text-amber-700">{opt.deadline}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Module 2: Seat Reservation & Tuition Deposit Receipt */}
              <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
                  <h3 className="text-[13.5px] font-bold text-[#101d37] flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    Seat Reservation & Tuition Deposit Receipt
                  </h3>
                  <span
                    className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                      activeChoice.depositStatus === 'Deposit Verified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {activeChoice.depositStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11.5px] mb-3">
                  <div className="p-2 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Deposit Amount</span>
                    <strong className="text-[13px] text-[#101d37]">
                      {activeChoice.options.find((o) => o.isSelected)?.depositAmount || '€ 1,500'}
                    </strong>
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Transfer Reference</span>
                    <strong className="text-purple-700">{activeChoice.depositRef}</strong>
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Seat Confirmation Status</span>
                    <strong className="text-emerald-700">Official Seat Confirmed</strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="text-[11px] text-slate-500">
                    Official swift payment receipt verified by accounts team.
                  </div>
                  <button
                    onClick={() => {
                      setActiveChoice((prev) =>
                        prev ? { ...prev, depositStatus: 'Deposit Verified', isLocked: true } : null
                      );
                      showToast('Tuition deposit recorded as Verified & Seat Confirmed!');
                    }}
                    className="px-3 py-1.5 rounded-[5px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11.5px] shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify Deposit & Confirm Seat</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Overview & Next Stage Action */}
            <div className="lg:col-span-4 space-y-3.5">
              {/* Overview Box */}
              <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs space-y-3">
                <h3 className="text-[13px] font-bold text-[#101d37] pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span>Final Choice Summary</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">
                    STAGE 7
                  </span>
                </h3>

                <div className="space-y-2 text-[11.5px] text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Locked University:</span>
                    <strong className="text-slate-800 text-right truncate max-w-[150px]">
                      {activeChoice.selectedUniversity}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Course Track:</span>
                    <strong className="text-slate-800 text-right truncate max-w-[150px]">
                      {activeChoice.course}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Deposit Status:</span>
                    <strong className="text-emerald-700">{activeChoice.depositStatus}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  {/* Forward to Next Stage Button with Floating Confirmation Card */}
                  <button
                    onClick={() => {
                      setConfirmModalData({
                        isOpen: true,
                        title: 'Forward Student to Scholarship Stage?',
                        studentName: selectedStudent.name,
                        studentId: selectedStudent.studentId,
                        studentAvatar: selectedStudent.avatar,
                        country: selectedStudent.country,
                        currentStageName: 'Final University (Stage 7)',
                        targetStageName: 'Scholarship (Stage 8)',
                        description: `Are you sure you want to forward ${selectedStudent.name} to the Scholarship stage with ${activeChoice.selectedUniversity} as their locked university? The Scholarship processing team will be notified to begin financial aid applications.`,
                        confirmLabel: 'Yes, Forward to Scholarship',
                        variant: 'primary',
                        onConfirm: () => {
                          if (onAdvanceStage) onAdvanceStage(selectedStudent.studentId || selectedStudent.id);
                          showToast(`Student file forwarded to Scholarship stage!`);
                          if (onNavigate) onNavigate(`scholarship?id=${selectedStudent.studentId}`);
                        },
                      });
                    }}
                    className="w-full py-2.5 px-3 rounded-[6px] bg-[#087cf5] hover:bg-[#006ee6] text-white font-bold text-[12px] shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Forward to Scholarship (Stage 8)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (onNavigate) onNavigate(`offer-letters?id=${selectedStudent.studentId}`);
                    }}
                    className="w-full py-2 px-3 rounded-[6px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11.5px] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Back to Offer Letters (Stage 6)</span>
                  </button>
                </div>
              </div>

              {/* Direct Communication Actions */}
              <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-600 block mb-2">
                  Contact Candidate:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => onOpenPhone?.(selectedStudent as any)}
                    className="py-1.5 px-2 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1 border border-slate-200"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call</span>
                  </button>
                  <button
                    onClick={() => onOpenWhatsApp?.(selectedStudent as any)}
                    className="py-1.5 px-2 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold flex items-center justify-center gap-1 border border-emerald-200"
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => onOpenEmail?.(selectedStudent as any)}
                    className="py-1.5 px-2 rounded bg-blue-50 hover:bg-blue-100 text-[#087cf5] text-[11px] font-semibold flex items-center justify-center gap-1 border border-blue-200"
                  >
                    <Mail className="w-3 h-3" />
                    <span>Email</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
