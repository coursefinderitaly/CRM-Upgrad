import React, { useState, useEffect, useMemo } from 'react';
import {
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
  Download,
  ExternalLink,
  Building2,
  Calendar,
  CreditCard,
  FileCheck2,
  Sparkles,
  Trophy,
  Landmark,
  BadgePercent,
  CheckCircle,
  HelpCircle,
  XCircle,
} from 'lucide-react';
import { StudentRecord } from '../services/studentsData';
import { WorkflowStageBanner } from '../components/workflow/WorkflowStageBanner';
import { getStageById } from '../context/WorkflowContext';
import { ActionConfirmModal } from '../components/modals/ActionConfirmModal';

interface OfferLettersViewProps {
  students?: StudentRecord[];
  onAdvanceStage?: (studentId: string) => any;
  onNavigate?: (route: string) => void;
  onOpenPhone?: (lead: any) => void;
  onOpenWhatsApp?: (lead: any) => void;
  onOpenEmail?: (lead: any) => void;
  onScheduleFollowUp?: (lead: any) => void;
}

interface UniversityOfferDetail {
  university: string;
  country: string;
  course: string;
  intake: string;
  offerType: 'Unconditional' | 'Conditional' | 'Waitlist';
  offerDate: string;
  decisionDeadline: string;
  daysRemaining: number;
  tuitionFee: string;
  scholarshipIncluded: string;
  depositAmount: string;
  depositStatus: 'Paid & Verified' | 'Pending Payment' | 'Waived';
  letterReference: string;
  status: 'Admit Confirmed' | 'Under Verification' | 'Conditions Met' | 'Deposit Paid';
  conditions: Array<{ id: string; label: string; completed: boolean }>;
}

const getOfferDataForStudent = (student: StudentRecord): UniversityOfferDetail | null => {
  const rawOffer = student.offers && student.offers.length > 0 ? student.offers[0] : null;
  if (!rawOffer) return null;

  const offerType: UniversityOfferDetail['offerType'] =
    rawOffer.type === 'Unconditional'
      ? 'Unconditional'
      : rawOffer.type === 'Waitlist'
        ? 'Waitlist'
        : 'Conditional';

  const rawStatus = (rawOffer.status || '').toLowerCase();
  const status: UniversityOfferDetail['status'] = rawStatus.includes('confirm')
    ? 'Admit Confirmed'
    : rawStatus.includes('deposit')
      ? 'Deposit Paid'
      : rawStatus.includes('condition')
        ? 'Conditions Met'
        : 'Under Verification';

  return {
    university: rawOffer.university,
    country: student.country,
    course: student.preferredCourse || '-',
    intake: student.intake || '-',
    offerType,
    offerDate: rawOffer.date && rawOffer.date !== '-' ? rawOffer.date : '-',
    decisionDeadline: '-',
    daysRemaining: 0,
    tuitionFee: '-',
    scholarshipIncluded: '-',
    depositAmount: '-',
    depositStatus: 'Pending Payment',
    letterReference: '-',
    status,
    conditions: (rawOffer.conditions || []).filter(Boolean).map((condition, index) => ({
      id: `c${index + 1}`,
      label: condition,
      completed: false,
    })),
  };
};

export const OfferLettersView: React.FC<OfferLettersViewProps> = ({
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
  const [activeOffer, setActiveOffer] = useState<UniversityOfferDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [tabFilter, setTabFilter] = useState<'All' | 'Unconditional' | 'Conditional' | 'DepositPaid'>('All');
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

  // Hash Deep-linking
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.includes('offer-letters') && hash.includes('?id=')) {
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
    window.location.hash = `offer-letters?id=${st.studentId}`;
    setActiveOffer(getOfferDataForStudent(st));
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
    window.location.hash = 'offer-letters';
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Stats
  const stats = useMemo(() => {
    let unconditional = 0;
    let conditional = 0;
    let depositPaid = 0;

    studentList.forEach((st) => {
      const offer = getOfferDataForStudent(st);
      if (!offer) return;
      if (offer.offerType === 'Unconditional') unconditional++;
      else conditional++;
      if (offer.depositStatus === 'Paid & Verified') depositPaid++;
    });

    const total = studentList.filter((st) => getOfferDataForStudent(st)).length;
    return {
      total,
      unconditional,
      conditional,
      depositPaid,
    };
  }, [studentList]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return studentList.filter((st) => {
      const offer = getOfferDataForStudent(st);
      if (!offer) return false;

      if (tabFilter === 'Unconditional' && offer.offerType !== 'Unconditional') return false;
      if (tabFilter === 'Conditional' && offer.offerType !== 'Conditional') return false;
      if (tabFilter === 'DepositPaid' && offer.depositStatus !== 'Paid & Verified') return false;

      if (countryFilter !== 'All' && st.country !== countryFilter) return false;
      if (statusFilter !== 'All' && offer.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          st.name.toLowerCase().includes(q) ||
          st.studentId.toLowerCase().includes(q) ||
          st.country.toLowerCase().includes(q) ||
          offer.university.toLowerCase().includes(q) ||
          offer.course.toLowerCase().includes(q) ||
          offer.letterReference.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [studentList, tabFilter, countryFilter, statusFilter, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#087cf5] text-white px-4 py-2.5 rounded-lg shadow-lg text-[13px] font-medium flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 1: DIRECTORY / TABLE VIEW                          */}
      {/* ======================================================== */}
      {!selectedStudent && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[17px] font-bold text-[#101d37] leading-tight">
                    Offer Letters Received & Admission Decisions
                  </h1>
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Stage 6 • Official University Decisions
                  </span>
                </div>
                <p className="text-[11.5px] text-[#64748b] leading-tight mt-0.5">
                  Official university admission offers repository: Conditional & Unconditional letters, condition compliance, deposit verification, and seat confirmation.
                </p>
              </div>
            </div>

            <div className="text-[11.5px] text-[#64748b] hidden sm:inline">
              Home &gt; <span className="font-semibold text-[#101d37]">Offer Letter Received</span>
            </div>
          </div>

          {/* Workflow Pipeline Banner */}
          <WorkflowStageBanner
            stage={getStageById('offer-letters')}
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
                  title: 'Forward to Final University Choice',
                  studentName: targetStudent.name,
                  studentId: targetStudent.studentId,
                  studentAvatar: targetStudent.avatar,
                  country: targetStudent.country,
                  currentStageName: 'Stage 6: Offer Letter Received',
                  targetStageName: 'Stage 7: Final University Choice',
                  description: `Advance ${targetStudent.name} to Stage 7 (Final University Choice) to select their final admitting university, lock tuition deposit, and reserve their seat.`,
                  confirmLabel: 'Confirm & Forward to Stage 7',
                  variant: 'primary',
                  onConfirm: () => {
                    if (onAdvanceStage) onAdvanceStage(id);
                    if (onNavigate) onNavigate(`final-university?id=${targetStudent.studentId}`);
                  },
                });
              } else if (onAdvanceStage) {
                onAdvanceStage(id);
              }
            }}
            onEmptyAction={() => onNavigate && onNavigate('applications')}
            emptyActionLabel="Go to Applications"
            emptyHint="No students have reached the Offer Letter stage yet."
          />

          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Total Offers Received</span>
              <div className="text-[19px] font-bold text-[#101d37] mt-0.5">{stats.total}</div>
              <span className="text-[10px] text-[#087cf5] font-semibold">● Active Admissions</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Unconditional Admits</span>
              <div className="text-[19px] font-bold text-emerald-600 mt-0.5">{stats.unconditional}</div>
              <span className="text-[10px] text-emerald-600 font-semibold">🎉 Direct Seat Confirmation</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Conditional Offers</span>
              <div className="text-[19px] font-bold text-amber-600 mt-0.5">{stats.conditional}</div>
              <span className="text-[10px] text-amber-600 font-semibold">Pending Conditions / Docs</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Seat Confirmed & Deposit Paid</span>
              <div className="text-[19px] font-bold text-indigo-600 mt-0.5">{stats.depositPaid}</div>
              <span className="text-[10px] text-indigo-600 font-semibold">Ready for Scholarship & Enrolment</span>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11.5px]">
                {[
                  { id: 'All', label: `All Offers (${stats.total})` },
                  { id: 'Unconditional', label: `Unconditional (${stats.unconditional})` },
                  { id: 'Conditional', label: `Conditional (${stats.conditional})` },
                  { id: 'DepositPaid', label: `Deposit Paid (${stats.depositPaid})` },
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2 pt-1 border-t border-slate-100">
              <div className="relative sm:col-span-2">
                <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by student name, ID, university, course, or admission reference..."
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
                  <option value="Ireland">Ireland</option>
                </select>
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] rounded-[6px] px-2.5 py-1.5 text-[12px] text-[#101d37] outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Admit Confirmed">Admit Confirmed</option>
                  <option value="Under Verification">Under Verification</option>
                  <option value="Conditions Met">Conditions Met</option>
                  <option value="Deposit Paid">Deposit Paid</option>
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
                    <th className="py-2.5 px-3">University & Program</th>
                    <th className="py-2.5 px-3">Offer Type</th>
                    <th className="py-2.5 px-3">Conditions Summary</th>
                    <th className="py-2.5 px-3">Tuition & Scholarship</th>
                    <th className="py-2.5 px-3">Deposit & Deadline</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-500 text-[12px]">
                        No offer letters found matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st) => {
                      const offer = getOfferDataForStudent(st);
                      if (!offer) return null;
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

                          {/* University & Course */}
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-[#101d37] flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span className="truncate max-w-[190px]">{offer.university}</span>
                            </div>
                            <div className="text-[11px] text-[#52627a] truncate max-w-[190px] mt-0.5">
                              {offer.course}
                            </div>
                          </td>

                          {/* Offer Type */}
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold border ${
                                offer.offerType === 'Unconditional'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {offer.offerType === 'Unconditional' ? (
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <HelpCircle className="w-3 h-3 text-amber-600" />
                              )}
                              {offer.offerType} Offer
                            </span>
                          </td>

                          {/* Conditions Summary */}
                          <td className="py-2.5 px-3">
                            <div className="text-[11px] text-slate-700">
                              {offer.offerType === 'Unconditional' ? (
                                <span className="text-emerald-700 font-medium">✓ No Academic Conditions</span>
                              ) : (
                                <span>IELTS 6.5 • Final Degree Transcript</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Ref: {offer.letterReference}
                            </div>
                          </td>

                          {/* Tuition & Scholarship */}
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-[#101d37]">{offer.tuitionFee}</div>
                            <div className="text-[10.5px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                              <Sparkles className="w-3 h-3" />
                              <span className="truncate max-w-[160px]">{offer.scholarshipIncluded}</span>
                            </div>
                          </td>

                          {/* Deposit & Deadline */}
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-800">
                              {offer.depositAmount}
                            </div>
                            <div className="text-[10.5px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-amber-500" />
                              <span>Due: {offer.decisionDeadline}</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-semibold ${
                                offer.depositStatus === 'Paid & Verified'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-blue-50 text-[#087cf5]'
                              }`}
                            >
                              ● {offer.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleOpenStudent(st)}
                              className="px-2.5 py-1 rounded-[5px] bg-[#087cf5] hover:bg-[#006ee6] text-white text-[11px] font-semibold transition-colors shadow-xs"
                            >
                              Open Offer Letter
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
      {/* MODE 2: STUDENT OFFER LETTER WORKSPACE WINDOW            */}
      {/* ======================================================== */}
      {selectedStudent && activeOffer && (
        <div className="space-y-3.5 animate-in fade-in duration-150">
          {/* Top Bar with Back Button */}
          <div className="flex items-center justify-between bg-white rounded-[8px] border border-[#e5edf5] p-2.5 shadow-xs">
            <button
              onClick={handleBackToList}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[5px] text-[#52627a] hover:text-[#101d37] hover:bg-slate-100 text-[12px] font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Offer Letters Directory</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[11.5px] text-[#64748b]">Stage 6 Candidate:</span>
              <span className="font-bold text-[#101d37] text-[12.5px]">{selectedStudent.name}</span>
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {activeOffer.offerType} Offer Confirmed
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
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
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

          {/* Admission Offer Celebration Banner */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-[9px] p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[14px] font-bold text-[#101d37] flex items-center gap-2">
                  <span>🎉 Official Offer Letter Received from {activeOffer.university}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10.5px] font-bold border border-emerald-300">
                    {activeOffer.offerType} Admit
                  </span>
                </div>
                <div className="text-[11.5px] text-[#52627a] mt-0.5">
                  Admitted to {activeOffer.course} for {activeOffer.intake} intake. Official decision letter ref #{activeOffer.letterReference}.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  showToast(`Official offer letter shared with ${selectedStudent.name} on WhatsApp!`)
                }
                className="px-3 py-1.5 rounded-[6px] bg-white border border-[#cbd5e1] hover:bg-slate-50 text-[#101d37] text-[11.5px] font-semibold flex items-center gap-1.5 shadow-2xs"
              >
                <Send className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Share with Student</span>
              </button>
              <button
                onClick={() => {
                  showToast('Offer letter PDF downloaded successfully.');
                }}
                className="px-3 py-1.5 rounded-[6px] bg-white border border-[#cbd5e1] hover:bg-slate-50 text-[#101d37] text-[11.5px] font-semibold flex items-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Download PDF Letter</span>
              </button>
            </div>
          </div>

          {/* Main Grid: Left Offer Letter Modules (8 cols) & Right Action Summary (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-3.5">
              {/* Module 1: Offer Letter & Decision Details */}
              <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
                  <h3 className="text-[13.5px] font-bold text-[#101d37] flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    University Admission Offer Letter & Details
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Issued on: <strong>{activeOffer.offerDate}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
                  <div className="p-2.5 rounded-[6px] bg-slate-50 border border-slate-200">
                    <span className="text-[10.5px] text-slate-500 font-medium block">Admitting Institution</span>
                    <strong className="text-[13px] text-[#101d37] block mt-0.5">{activeOffer.university}</strong>
                    <span className="text-[10.5px] text-slate-600">Faculty of Engineering & Computer Science</span>
                  </div>

                  <div className="p-2.5 rounded-[6px] bg-slate-50 border border-slate-200">
                    <span className="text-[10.5px] text-slate-500 font-medium block">Course / Specialization</span>
                    <strong className="text-[13px] text-[#101d37] block mt-0.5">{activeOffer.course}</strong>
                    <span className="text-[10.5px] text-slate-600">Degree Level: Master of Science (120 ECTS)</span>
                  </div>

                  <div className="p-2.5 rounded-[6px] bg-slate-50 border border-slate-200">
                    <span className="text-[10.5px] text-slate-500 font-medium block">Intake & Academic Term</span>
                    <strong className="text-[#101d37] block mt-0.5">{activeOffer.intake} (Winter/Fall Semester)</strong>
                    <span className="text-[10.5px] text-slate-600">Classes Commence: -</span>
                  </div>

                  <div className="p-2.5 rounded-[6px] bg-slate-50 border border-slate-200">
                    <span className="text-[10.5px] text-slate-500 font-medium block">Tuition & Financial Grant</span>
                    <strong className="text-emerald-700 block mt-0.5">{activeOffer.tuitionFee}</strong>
                    <span className="text-[10.5px] text-emerald-600 font-medium">{activeOffer.scholarshipIncluded}</span>
                  </div>
                </div>
              </div>

              {/* Module 2: Offer Conditions Checklist */}
              <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
                  <h3 className="text-[13.5px] font-bold text-[#101d37] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#087cf5]" />
                    Conditions & Enrolment Requirements Checklist
                  </h3>
                  <span className="text-[11px] font-semibold text-emerald-600">
                    {activeOffer.conditions.filter((c) => c.completed).length} / {activeOffer.conditions.length} Requirements Met
                  </span>
                </div>

                <div className="space-y-2">
                  {activeOffer.conditions.map((cond, idx) => (
                    <div
                      key={cond.id}
                      className={`p-2.5 rounded-[6px] border flex items-start justify-between gap-2 transition-colors ${
                        cond.completed
                          ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                          : 'bg-amber-50/40 border-amber-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={cond.completed}
                          onChange={() => {
                            setActiveOffer((prev) => {
                              if (!prev) return null;
                              const updated = prev.conditions.map((c) =>
                                c.id === cond.id ? { ...c, completed: !c.completed } : c
                              );
                              return { ...prev, conditions: updated };
                            });
                            showToast(`Condition requirement status updated.`);
                          }}
                          className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div>
                          <div className="text-[12px] font-semibold leading-tight">
                            Condition #{idx + 1}: {cond.label}
                          </div>
                          <div className="text-[10.5px] text-slate-500 mt-0.5">
                            {cond.completed
                              ? 'Verified by admissions counsellor • Document stored in vault'
                              : 'Pending student submission or bank deposit confirmation'}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          cond.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {cond.completed ? 'COMPLETED' : 'PENDING'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Module 3: Seat Acceptance & Tuition Deposit Ledger */}
              <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
                  <h3 className="text-[13.5px] font-bold text-[#101d37] flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    Seat Acceptance & Tuition Deposit Ledger
                  </h3>
                  <span
                    className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                      activeOffer.depositStatus === 'Paid & Verified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {activeOffer.depositStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11.5px] mb-3">
                  <div className="p-2 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Required Deposit</span>
                    <strong className="text-[13px] text-[#101d37]">{activeOffer.depositAmount}</strong>
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Payment Deadline</span>
                    <strong className="text-amber-600">{activeOffer.decisionDeadline}</strong>
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Transfer Reference</span>
                    <strong className="text-slate-700">SWIFT-IT26B-9912</strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="text-[11px] text-slate-500">
                    Upload official payment challan or bank wire receipt to confirm seat reservation.
                  </div>
                  <button
                    onClick={() => {
                      setActiveOffer((prev) =>
                        prev ? { ...prev, depositStatus: 'Paid & Verified', status: 'Deposit Paid' } : null
                      );
                      showToast('Tuition deposit recorded as Paid & Verified!');
                    }}
                    className="px-3 py-1.5 rounded-[5px] bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11.5px] shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Record Deposit Payment Receipt</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Actions & Progression Widget */}
            <div className="lg:col-span-4 space-y-3.5">
              {/* Summary Card */}
              <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs space-y-3">
                <h3 className="text-[13px] font-bold text-[#101d37] pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span>Admission Overview</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    VERIFIED
                  </span>
                </h3>

                <div className="space-y-2 text-[11.5px] text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Institution:</span>
                    <strong className="text-slate-800 text-right truncate max-w-[150px]">
                      {activeOffer.university}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Offer Type:</span>
                    <strong className="text-emerald-700">{activeOffer.offerType}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tuition Fee:</span>
                    <strong className="text-slate-800">{activeOffer.tuitionFee}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Deposit Due:</span>
                    <strong className="text-amber-600">{activeOffer.decisionDeadline}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Deposit Status:</span>
                    <strong className="text-indigo-600">{activeOffer.depositStatus}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <button
                    onClick={() => {
                      setConfirmModalData({
                        isOpen: true,
                        title: 'Confirm Seat Acceptance Deposit',
                        studentName: selectedStudent.name,
                        studentId: selectedStudent.studentId,
                        studentAvatar: selectedStudent.avatar,
                        country: selectedStudent.country,
                        currentStageName: 'Stage 6: Offer Letter Received',
                        targetStageName: 'Stage 6: Offer Letter Received',
                        description: `Record deposit verification and mark official seat acceptance for ${selectedStudent.name} at ${activeOffer?.university || 'University'}.`,
                        confirmLabel: 'Confirm Seat Acceptance',
                        variant: 'success',
                        onConfirm: () => {
                          showToast('Official seat acceptance confirmed!');
                          setActiveOffer((prev) =>
                            prev ? { ...prev, status: 'Deposit Paid', depositStatus: 'Paid & Verified' } : null
                          );
                        },
                      });
                    }}
                    className="w-full py-2.5 px-3 rounded-[6px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12px] shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Seat Acceptance</span>
                  </button>

                  <button
                    onClick={() => {
                      setConfirmModalData({
                        isOpen: true,
                        title: 'Forward to Final University Choice',
                        studentName: selectedStudent.name,
                        studentId: selectedStudent.studentId,
                        studentAvatar: selectedStudent.avatar,
                        country: selectedStudent.country,
                        currentStageName: 'Stage 6: Offer Letter Received',
                        targetStageName: 'Stage 7: Final University Choice',
                        description: `Confirm admission offers and forward ${selectedStudent.name} to Stage 7 (Final University Choice) to select their final admitting university, lock tuition deposit, and reserve their seat.`,
                        confirmLabel: 'Confirm & Forward to Stage 7',
                        variant: 'primary',
                        onConfirm: () => {
                          if (onAdvanceStage) onAdvanceStage(selectedStudent.studentId || selectedStudent.id);
                          if (onNavigate) onNavigate(`final-university?id=${selectedStudent.studentId}`);
                        },
                      });
                    }}
                    className="w-full py-2 px-3 rounded-[6px] bg-[#087cf5] hover:bg-[#006ee6] text-white font-bold text-[12px] shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <span>Forward to Final University Choice (Stage 7)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (onNavigate) onNavigate(`scholarship?id=${selectedStudent.studentId}`);
                    }}
                    className="w-full py-2 px-3 rounded-[6px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11.5px] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Skip to Scholarship (Stage 8)</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Direct Communication Box */}
              <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-600 block mb-2">
                  Connect with Candidate:
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
