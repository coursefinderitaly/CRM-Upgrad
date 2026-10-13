import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  Download,
  Upload,
  Send,
  Edit2,
  MoreVertical,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  Check,
  X,
  Eye,
  Search,
  Filter,
  ShieldCheck,
  FileCheck2,
  FolderOpen,
  LayoutGrid,
  List,
  MessageSquare,
  Sparkles,
  ChevronDown,
  User,
  GraduationCap,
  Calendar,
  AlertTriangle,
  RefreshCw,
  FilePlus,
  Paperclip,
  CheckCheck,
  Trash2,
  ExternalLink,
  FileUp,
} from 'lucide-react';
import { StudentRecord, INITIAL_STUDENTS } from '../services/studentsData';
import { ActionConfirmModal } from '../components/modals/ActionConfirmModal';

export interface DocumentItem {
  id: number;
  category: 'Identity' | 'Academic' | 'Language' | 'Statements' | 'Financial' | 'Other';
  name: string;
  status: 'Approved' | 'Under Review' | 'Received' | 'Re-upload Required' | 'Pending';
  submittedOn: string;
  verifiedBy: string;
  fileUrl: string;
  fileSize?: string;
  previewUrl?: string;
  notes?: string;
  required?: boolean;
}

interface DocumentationViewProps {
  students?: StudentRecord[];
  onAdvanceStage?: (studentId: string) => any;
  onForwardToApplications?: () => void;
  onNavigate?: (route: string) => void;
}

// Default 12-item checklist generator tailored for student profiles
const generateDefaultChecklistForStudent = (student: StudentRecord): DocumentItem[] => {
  const isSneha = student.studentId === 'UK-2026-012' || student.name.toLowerCase().includes('sneha');
  const isRahul = student.studentId === 'GER-2025-001' || student.name.toLowerCase().includes('rahul');
  const isPriya = student.studentId === 'ITA-2025-004' || student.name.toLowerCase().includes('priya');
  const isRohit = student.studentId === 'IRE-2026-009' || student.name.toLowerCase().includes('rohit');
  const isAmit = student.studentId === 'FRA-2026-018' || student.name.toLowerCase().includes('amit');

  if (isSneha) {
    // Exactly matches 8/12 verified as shown in the dossier screenshot
    return [
      { id: 1, category: 'Identity', name: 'Passport (Bio & Address Pages)', status: 'Approved', submittedOn: '02 Oct 2025', verifiedBy: 'Priya Singh', fileUrl: 'passport_sneha_patel.pdf', fileSize: '1.8 MB' },
      { id: 2, category: 'Academic', name: '10th Secondary Marksheet', status: 'Approved', submittedOn: '03 Oct 2025', verifiedBy: 'Rohit Verma', fileUrl: '10th_marksheet_sneha.pdf', fileSize: '1.2 MB' },
      { id: 3, category: 'Academic', name: '12th Higher Secondary Marksheet', status: 'Approved', submittedOn: '04 Oct 2025', verifiedBy: 'Sneha Patel', fileUrl: '12th_marksheet_sneha.pdf', fileSize: '1.4 MB' },
      { id: 4, category: 'Academic', name: 'Bachelor Degree Certificate', status: 'Approved', submittedOn: '05 Oct 2025', verifiedBy: 'Priya Singh', fileUrl: 'bachelor_degree_sneha.pdf', fileSize: '2.1 MB' },
      { id: 5, category: 'Academic', name: 'Semester Transcripts (All Semesters)', status: 'Approved', submittedOn: '01 Oct 2025', verifiedBy: 'Amit Kumar', fileUrl: 'transcripts_all_semesters.pdf', fileSize: '4.2 MB' },
      { id: 6, category: 'Language', name: 'IELTS / PTE / TOEFL Score Report', status: 'Under Review', submittedOn: '06 Oct 2025', verifiedBy: 'Priya Singh', fileUrl: 'ielts_academic_report.pdf', fileSize: '850 KB' },
      { id: 7, category: 'Statements', name: 'Statement of Purpose (SOP - Final Draft)', status: 'Approved', submittedOn: '03 Oct 2025', verifiedBy: 'Sneha Patel', fileUrl: 'sop_uk_msc_data.docx', fileSize: '320 KB' },
      { id: 8, category: 'Statements', name: 'Letters of Recommendation (LOR - 2 Academic)', status: 'Pending', submittedOn: '-', verifiedBy: '-', fileUrl: '-' },
      { id: 9, category: 'Statements', name: 'Curriculum Vitae (CV - EuroPass/UK Format)', status: 'Approved', submittedOn: '02 Oct 2025', verifiedBy: 'Rohit Verma', fileUrl: 'cv_sneha_patel.pdf', fileSize: '450 KB' },
      { id: 10, category: 'Financial', name: 'Bank Solvency & Financial Statement', status: 'Re-upload Required', submittedOn: '07 Oct 2025', verifiedBy: 'Amit Kumar', fileUrl: 'bank_solvency_statement.pdf', fileSize: '1.9 MB', notes: 'Requires bank official seal and 28-day holding period proof' },
      { id: 11, category: 'Financial', name: 'Affidavit of Financial Support', status: 'Received', submittedOn: '08 Oct 2025', verifiedBy: 'Priya Singh', fileUrl: 'financial_affidavit_father.pdf', fileSize: '620 KB' },
      { id: 12, category: 'Academic', name: 'Medium of Instruction (MOI) Certificate', status: 'Approved', submittedOn: '05 Oct 2025', verifiedBy: 'Rohit Verma', fileUrl: 'moi_certificate_pune_univ.pdf', fileSize: '920 KB' },
    ];
  }

  if (isRahul) {
    // 11/12 verified (Germany APS)
    return [
      { id: 1, category: 'Identity', name: 'Passport (Bio & Address Pages)', status: 'Approved', submittedOn: '15 Sep 2025', verifiedBy: 'Priya Singh', fileUrl: 'passport_rahul_sharma.pdf', fileSize: '1.9 MB' },
      { id: 2, category: 'Academic', name: '10th Secondary Marksheet', status: 'Approved', submittedOn: '16 Sep 2025', verifiedBy: 'Rohit Verma', fileUrl: '10th_marksheet_rahul.pdf', fileSize: '1.1 MB' },
      { id: 3, category: 'Academic', name: '12th Higher Secondary Marksheet', status: 'Approved', submittedOn: '16 Sep 2025', verifiedBy: 'Rohit Verma', fileUrl: '12th_marksheet_rahul.pdf', fileSize: '1.3 MB' },
      { id: 4, category: 'Academic', name: 'Bachelor Degree Certificate', status: 'Approved', submittedOn: '17 Sep 2025', verifiedBy: 'Priya Singh', fileUrl: 'bachelor_degree_rahul.pdf', fileSize: '2.4 MB' },
      { id: 5, category: 'Academic', name: 'Semester Transcripts (All Semesters)', status: 'Approved', submittedOn: '18 Sep 2025', verifiedBy: 'Amit Kumar', fileUrl: 'transcripts_rahul_all.pdf', fileSize: '3.8 MB' },
      { id: 6, category: 'Language', name: 'IELTS / PTE / TOEFL Score Report', status: 'Approved', submittedOn: '20 Sep 2025', verifiedBy: 'Priya Singh', fileUrl: 'ielts_band7.5_rahul.pdf', fileSize: '890 KB' },
      { id: 7, category: 'Statements', name: 'Statement of Purpose (SOP - Final Draft)', status: 'Approved', submittedOn: '21 Sep 2025', verifiedBy: 'Priya Singh', fileUrl: 'sop_tu_munich_automotive.pdf', fileSize: '380 KB' },
      { id: 8, category: 'Statements', name: 'Letters of Recommendation (LOR - 2 Academic)', status: 'Approved', submittedOn: '22 Sep 2025', verifiedBy: 'Rohit Verma', fileUrl: 'lor_prof_rao_rahul.pdf', fileSize: '650 KB' },
      { id: 9, category: 'Statements', name: 'Curriculum Vitae (CV - EuroPass/UK Format)', status: 'Approved', submittedOn: '15 Sep 2025', verifiedBy: 'Rohit Verma', fileUrl: 'cv_rahul_sharma.pdf', fileSize: '420 KB' },
      { id: 10, category: 'Financial', name: 'German Blocked Account / Solvency Proof', status: 'Approved', submittedOn: '25 Sep 2025', verifiedBy: 'Amit Kumar', fileUrl: 'fintiba_blocked_acc_rahul.pdf', fileSize: '1.5 MB' },
      { id: 11, category: 'Financial', name: 'Affidavit of Financial Support', status: 'Approved', submittedOn: '26 Sep 2025', verifiedBy: 'Priya Singh', fileUrl: 'affidavit_support_rahul.pdf', fileSize: '510 KB' },
      { id: 12, category: 'Academic', name: 'APS India Certificate (Germany Mandatory)', status: 'Under Review', submittedOn: '28 Sep 2025', verifiedBy: 'Amit Kumar', fileUrl: 'aps_verification_app.pdf', fileSize: '1.2 MB' },
    ];
  }

  if (isPriya) {
    // 9/12 verified (Italy CIMEA)
    return [
      { id: 1, category: 'Identity', name: 'Passport (Bio & Address Pages)', status: 'Approved', submittedOn: '18 Sep 2025', verifiedBy: 'Priya Singh', fileUrl: 'passport_priya_singh.pdf', fileSize: '1.7 MB' },
      { id: 2, category: 'Academic', name: '10th Secondary Marksheet', status: 'Approved', submittedOn: '19 Sep 2025', verifiedBy: 'Rohit Verma', fileUrl: '10th_marksheet_priya.pdf', fileSize: '1.2 MB' },
      { id: 3, category: 'Academic', name: '12th Higher Secondary Marksheet', status: 'Approved', submittedOn: '19 Sep 2025', verifiedBy: 'Rohit Verma', fileUrl: '12th_marksheet_priya.pdf', fileSize: '1.3 MB' },
      { id: 4, category: 'Academic', name: 'Bachelor Degree Certificate', status: 'Approved', submittedOn: '20 Sep 2025', verifiedBy: 'Priya Singh', fileUrl: 'bachelor_degree_priya.pdf', fileSize: '2.0 MB' },
      { id: 5, category: 'Academic', name: 'Semester Transcripts (All Semesters)', status: 'Approved', submittedOn: '21 Sep 2025', verifiedBy: 'Amit Kumar', fileUrl: 'transcripts_priya_all.pdf', fileSize: '3.5 MB' },
      { id: 6, category: 'Language', name: 'IELTS / PTE / TOEFL Score Report', status: 'Approved', submittedOn: '22 Sep 2025', verifiedBy: 'Priya Singh', fileUrl: 'ielts_band7_priya.pdf', fileSize: '910 KB' },
      { id: 7, category: 'Statements', name: 'Statement of Purpose (SOP - Final Draft)', status: 'Approved', submittedOn: '23 Sep 2025', verifiedBy: 'Priya Singh', fileUrl: 'sop_polimi_design.pdf', fileSize: '340 KB' },
      { id: 8, category: 'Statements', name: 'Letters of Recommendation (LOR - 2 Academic)', status: 'Approved', submittedOn: '24 Sep 2025', verifiedBy: 'Rohit Verma', fileUrl: 'lor_priya_academic.pdf', fileSize: '700 KB' },
      { id: 9, category: 'Statements', name: 'Portfolio / Design Portfolio', status: 'Approved', submittedOn: '25 Sep 2025', verifiedBy: 'Rohit Verma', fileUrl: 'portfolio_priya_design.pdf', fileSize: '8.4 MB' },
      { id: 10, category: 'Financial', name: 'Bank Solvency & Financial Statement', status: 'Under Review', submittedOn: '28 Sep 2025', verifiedBy: 'Amit Kumar', fileUrl: 'bank_statement_priya.pdf', fileSize: '1.8 MB' },
      { id: 11, category: 'Financial', name: 'Affidavit of Financial Support', status: 'Pending', submittedOn: '-', verifiedBy: '-', fileUrl: '-' },
      { id: 12, category: 'Academic', name: 'CIMEA / Declaration of Value (Italy)', status: 'Pending', submittedOn: '-', verifiedBy: '-', fileUrl: '-' },
    ];
  }

  if (isRohit) {
    // 6/12 verified (Ireland)
    return [
      { id: 1, category: 'Identity', name: 'Passport (Bio & Address Pages)', status: 'Approved', submittedOn: '28 Sep 2025', verifiedBy: 'Priya Singh', fileUrl: 'passport_rohit_verma.pdf', fileSize: '1.6 MB' },
      { id: 2, category: 'Academic', name: '10th Secondary Marksheet', status: 'Approved', submittedOn: '29 Sep 2025', verifiedBy: 'Rohit Verma', fileUrl: '10th_marksheet_rohit.pdf', fileSize: '1.1 MB' },
      { id: 3, category: 'Academic', name: '12th Higher Secondary Marksheet', status: 'Approved', submittedOn: '29 Sep 2025', verifiedBy: 'Rohit Verma', fileUrl: '12th_marksheet_rohit.pdf', fileSize: '1.2 MB' },
      { id: 4, category: 'Academic', name: 'Bachelor Degree Certificate', status: 'Approved', submittedOn: '30 Sep 2025', verifiedBy: 'Priya Singh', fileUrl: 'bachelor_degree_rohit.pdf', fileSize: '1.9 MB' },
      { id: 5, category: 'Academic', name: 'Semester Transcripts (All Semesters)', status: 'Approved', submittedOn: '01 Oct 2025', verifiedBy: 'Amit Kumar', fileUrl: 'transcripts_rohit.pdf', fileSize: '3.1 MB' },
      { id: 6, category: 'Language', name: 'IELTS / PTE / TOEFL Score Report', status: 'Under Review', submittedOn: '02 Oct 2025', verifiedBy: 'Priya Singh', fileUrl: 'duolingo_english_score.pdf', fileSize: '650 KB' },
      { id: 7, category: 'Statements', name: 'Statement of Purpose (SOP - Final Draft)', status: 'Approved', submittedOn: '03 Oct 2025', verifiedBy: 'Priya Singh', fileUrl: 'sop_tcd_cloud_computing.pdf', fileSize: '310 KB' },
      { id: 8, category: 'Statements', name: 'Letters of Recommendation (LOR - 2 Academic)', status: 'Pending', submittedOn: '-', verifiedBy: '-', fileUrl: '-' },
      { id: 9, category: 'Statements', name: 'Curriculum Vitae (CV - EuroPass)', status: 'Under Review', submittedOn: '04 Oct 2025', verifiedBy: 'Rohit Verma', fileUrl: 'cv_rohit_verma.pdf', fileSize: '410 KB' },
      { id: 10, category: 'Financial', name: 'Bank Solvency & Financial Statement', status: 'Pending', submittedOn: '-', verifiedBy: '-', fileUrl: '-' },
      { id: 11, category: 'Financial', name: 'Affidavit of Financial Support', status: 'Pending', submittedOn: '-', verifiedBy: '-', fileUrl: '-' },
      { id: 12, category: 'Academic', name: 'Medium of Instruction (MOI) Certificate', status: 'Pending', submittedOn: '-', verifiedBy: '-', fileUrl: '-' },
    ];
  }

  if (isAmit) {
    // 4/12 verified (France)
    return [
      { id: 1, category: 'Identity', name: 'Passport (Bio & Address Pages)', status: 'Approved', submittedOn: '01 Oct 2025', verifiedBy: 'Priya Singh', fileUrl: 'passport_amit_kumar.pdf', fileSize: '1.7 MB' },
      { id: 2, category: 'Academic', name: '10th Secondary Marksheet', status: 'Approved', submittedOn: '02 Oct 2025', verifiedBy: 'Rohit Verma', fileUrl: '10th_marksheet_amit.pdf', fileSize: '1.2 MB' },
      { id: 3, category: 'Academic', name: '12th Higher Secondary Marksheet', status: 'Approved', submittedOn: '02 Oct 2025', verifiedBy: 'Rohit Verma', fileUrl: '12th_marksheet_amit.pdf', fileSize: '1.3 MB' },
      { id: 4, category: 'Academic', name: 'Bachelor Degree Certificate', status: 'Approved', submittedOn: '03 Oct 2025', verifiedBy: 'Priya Singh', fileUrl: 'bachelor_degree_amit.pdf', fileSize: '2.1 MB' },
      { id: 5, category: 'Academic', name: 'Semester Transcripts (All Semesters)', status: 'Re-upload Required', submittedOn: '04 Oct 2025', verifiedBy: 'Amit Kumar', fileUrl: 'transcripts_incomplete.pdf', fileSize: '1.8 MB', notes: 'Backside grading scale missing' },
      { id: 6, category: 'Language', name: 'IELTS / French Language Score', status: 'Pending', submittedOn: '-', verifiedBy: '-', fileUrl: '-' },
      { id: 7, category: 'Statements', name: 'Statement of Purpose (SOP - Final Draft)', status: 'Under Review', submittedOn: '05 Oct 2025', verifiedBy: 'Priya Singh', fileUrl: 'sop_essec_business.pdf', fileSize: '290 KB' },
      { id: 8, category: 'Statements', name: 'Letters of Recommendation (LOR - 2 Academic)', status: 'Pending', submittedOn: '-', verifiedBy: '-', fileUrl: '-' },
      { id: 9, category: 'Statements', name: 'Curriculum Vitae (CV - French/EuroPass)', status: 'Under Review', submittedOn: '05 Oct 2025', verifiedBy: 'Rohit Verma', fileUrl: 'cv_amit_kumar.pdf', fileSize: '390 KB' },
      { id: 10, category: 'Financial', name: 'Bank Solvency & Financial Statement', status: 'Re-upload Required', submittedOn: '06 Oct 2025', verifiedBy: 'Amit Kumar', fileUrl: 'bank_letter_rough.pdf', fileSize: '980 KB', notes: 'Bank seal not legible, submit original scan' },
      { id: 11, category: 'Financial', name: 'Affidavit of Financial Support', status: 'Pending', submittedOn: '-', verifiedBy: '-', fileUrl: '-' },
      { id: 12, category: 'Academic', name: 'Campus France EEF Application Number', status: 'Pending', submittedOn: '-', verifiedBy: '-', fileUrl: '-' },
    ];
  }

  // Generic fallback based on stage number
  const baseApproved = student.stageNumber >= 6 ? 11 : student.stageNumber >= 5 ? 8 : student.stageNumber >= 3 ? 6 : 4;
  return [
    { id: 1, category: 'Identity', name: 'Passport (Bio & Address Pages)', status: 'Approved', submittedOn: '02 Oct 2025', verifiedBy: 'Priya Singh', fileUrl: `passport_${student.name.toLowerCase().replace(/\s+/g, '_')}.pdf`, fileSize: '1.8 MB' },
    { id: 2, category: 'Academic', name: '10th Secondary Marksheet', status: 'Approved', submittedOn: '03 Oct 2025', verifiedBy: 'Rohit Verma', fileUrl: '10th_marksheet.pdf', fileSize: '1.2 MB' },
    { id: 3, category: 'Academic', name: '12th Higher Secondary Marksheet', status: 'Approved', submittedOn: '04 Oct 2025', verifiedBy: 'Sneha Patel', fileUrl: '12th_marksheet.pdf', fileSize: '1.4 MB' },
    { id: 4, category: 'Academic', name: 'Bachelor Degree Certificate', status: 'Approved', submittedOn: '05 Oct 2025', verifiedBy: 'Priya Singh', fileUrl: 'bachelor_degree.pdf', fileSize: '2.1 MB' },
    { id: 5, category: 'Academic', name: 'Semester Transcripts (All Semesters)', status: baseApproved >= 5 ? 'Approved' : 'Under Review', submittedOn: '01 Oct 2025', verifiedBy: 'Amit Kumar', fileUrl: 'transcripts_all.pdf', fileSize: '4.2 MB' },
    { id: 6, category: 'Language', name: 'IELTS / PTE / TOEFL Score Report', status: baseApproved >= 6 ? 'Approved' : 'Under Review', submittedOn: '06 Oct 2025', verifiedBy: 'Priya Singh', fileUrl: 'ielts_report.pdf', fileSize: '850 KB' },
    { id: 7, category: 'Statements', name: 'Statement of Purpose (SOP - Final Draft)', status: baseApproved >= 7 ? 'Approved' : 'Under Review', submittedOn: '03 Oct 2025', verifiedBy: 'Sneha Patel', fileUrl: 'sop_final.docx', fileSize: '320 KB' },
    { id: 8, category: 'Statements', name: 'Letters of Recommendation (LOR - 2 Academic)', status: baseApproved >= 8 ? 'Approved' : 'Pending', submittedOn: baseApproved >= 8 ? '04 Oct 2025' : '-', verifiedBy: baseApproved >= 8 ? 'Rohit Verma' : '-', fileUrl: baseApproved >= 8 ? 'lor_recommendation.pdf' : '-' },
    { id: 9, category: 'Statements', name: 'Curriculum Vitae (CV - EuroPass/UK Format)', status: baseApproved >= 9 ? 'Approved' : 'Under Review', submittedOn: '02 Oct 2025', verifiedBy: 'Rohit Verma', fileUrl: 'cv_europass.pdf', fileSize: '450 KB' },
    { id: 10, category: 'Financial', name: 'Bank Solvency & Financial Statement', status: baseApproved >= 10 ? 'Approved' : 'Pending', submittedOn: baseApproved >= 10 ? '07 Oct 2025' : '-', verifiedBy: baseApproved >= 10 ? 'Amit Kumar' : '-', fileUrl: baseApproved >= 10 ? 'bank_solvency.pdf' : '-' },
    { id: 11, category: 'Financial', name: 'Affidavit of Financial Support', status: baseApproved >= 11 ? 'Approved' : 'Pending', submittedOn: baseApproved >= 11 ? '08 Oct 2025' : '-', verifiedBy: baseApproved >= 11 ? 'Priya Singh' : '-', fileUrl: baseApproved >= 11 ? 'affidavit_support.pdf' : '-' },
    { id: 12, category: 'Academic', name: 'Medium of Instruction (MOI) Certificate', status: 'Approved', submittedOn: '05 Oct 2025', verifiedBy: 'Rohit Verma', fileUrl: 'moi_cert.pdf', fileSize: '920 KB' },
  ];
};

export const DocumentationView: React.FC<DocumentationViewProps> = ({
  students,
  onAdvanceStage,
  onForwardToApplications,
  onNavigate,
}) => {
  const studentList = students && students.length > 0 ? students : INITIAL_STUDENTS;

  // Navigation State: Directory List vs Student Document Profile
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  // Directory Filters & View Mode
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [tabFilter, setTabFilter] = useState<'All' | 'Verified' | 'In Review' | 'Pending' | 'Action Required'>('All');
  const [viewMode, setViewMode] = useState<'ledger' | 'cards'>('ledger');

  // Profile Detail States
  const [activeCategory, setActiveCategory] = useState<'All' | 'Academic' | 'Identity' | 'Language' | 'Statements' | 'Financial'>('All');
  const [newNoteInput, setNewNoteInput] = useState('');
  const [noteList, setNoteList] = useState([
    { id: 1, text: 'Passport and Degree certificates verified by Priya Singh', time: '10 Oct 2025, 02:30 PM', author: 'Priya Singh' },
    { id: 2, text: 'Bank solvency proof requires balance stamp from nationalized bank', time: '08 Oct 2025, 11:15 AM', author: 'Rohit Verma' },
  ]);
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

  // Per-student checklists store with persistence
  const [studentChecklists, setStudentChecklists] = useState<Record<string, DocumentItem[]>>(() => {
    try {
      const saved = localStorage.getItem('crm-student-documents-v3');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load documents from localStorage', e);
    }
    return {};
  });

  // Save to localStorage whenever studentChecklists change
  const saveChecklists = (updated: Record<string, DocumentItem[]>) => {
    setStudentChecklists(updated);
    try {
      localStorage.setItem('crm-student-documents-v3', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist documents to localStorage', e);
    }
  };

  // Helper to get active student's checklist
  const getCurrentChecklist = (st: StudentRecord): DocumentItem[] => {
    if (studentChecklists[st.studentId]) {
      return studentChecklists[st.studentId];
    }
    const defaults = generateDefaultChecklistForStudent(st);
    return defaults;
  };

  // Active student's checklist
  const currentChecklist = selectedStudent ? getCurrentChecklist(selectedStudent) : [];

  // Update active student's checklist
  const updateCurrentStudentChecklist = (newList: DocumentItem[]) => {
    if (!selectedStudent) return;
    const updated = {
      ...studentChecklists,
      [selectedStudent.studentId]: newList,
    };
    saveChecklists(updated);
  };

  // -------------------------------------------------------------
  // MODAL STATES: DOCUMENT UPLOAD & DOCUMENT PREVIEW
  // -------------------------------------------------------------
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTargetId, setUploadTargetId] = useState<number | 'new'>('new');
  const [uploadDocName, setUploadDocName] = useState('');
  const [uploadCategory, setUploadCategory] = useState<DocumentItem['category']>('Identity');
  const [uploadStatus, setUploadStatus] = useState<DocumentItem['status']>('Under Review');
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFilePreviewUrl, setUploadFilePreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Hidden file input for modal dropzone
  const modalFileInputRef = useRef<HTMLInputElement | null>(null);

  // Document Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  // Open Upload Modal
  const handleOpenUploadModal = (target: number | 'new') => {
    setUploadTargetId(target);
    setUploadFile(null);
    setUploadFilePreviewUrl(null);
    setUploadNotes('');
    setUploadError(null);

    if (target === 'new') {
      setUploadDocName('');
      setUploadCategory('Statements');
      setUploadStatus('Under Review');
    } else {
      const match = currentChecklist.find((item) => item.id === target);
      if (match) {
        setUploadDocName(match.name);
        setUploadCategory(match.category);
        setUploadStatus(match.status === 'Approved' ? 'Approved' : 'Under Review');
        if (match.notes) setUploadNotes(match.notes);
      }
    }

    setIsUploadModalOpen(true);
  };

  // Close Upload Modal
  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
    setUploadFile(null);
    setUploadFilePreviewUrl(null);
    setUploadError(null);
  };

  // Handle file chosen via picker or drop
  const processSelectedFile = (file: File) => {
    if (!file) return;

    // Validate size (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      setUploadError('File exceeds maximum allowable size of 25 MB.');
      return;
    }

    setUploadError(null);
    setUploadFile(file);

    // Create object URL for instant preview
    const objectUrl = URL.createObjectURL(file);
    setUploadFilePreviewUrl(objectUrl);

    // Auto-populate document name if empty
    if (!uploadDocName.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setUploadDocName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  // Modal Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '1.5 MB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Confirm and save upload
  const handleConfirmUpload = () => {
    if (!selectedStudent) return;
    if (!uploadFile) {
      setUploadError('Please choose or drag a file to upload.');
      return;
    }

    const docName = uploadDocName.trim() || uploadFile.name;
    const formattedSize = formatFileSize(uploadFile.size);
    const stamp = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const verifiedBy = uploadStatus === 'Approved' ? 'Priya Singh' : '-';

    let updatedList: DocumentItem[] = [];

    if (uploadTargetId === 'new') {
      const nextId = currentChecklist.length > 0 ? Math.max(...currentChecklist.map((c) => c.id)) + 1 : 1;
      const newItem: DocumentItem = {
        id: nextId,
        category: uploadCategory,
        name: docName,
        status: uploadStatus,
        submittedOn: stamp,
        verifiedBy: verifiedBy,
        fileUrl: uploadFile.name,
        fileSize: formattedSize,
        previewUrl: uploadFilePreviewUrl || undefined,
        notes: uploadNotes.trim() || undefined,
      };
      updatedList = [...currentChecklist, newItem];
      showToast(`Document "${docName}" added and uploaded for ${selectedStudent.name}`);
    } else {
      updatedList = currentChecklist.map((item) => {
        if (item.id === uploadTargetId) {
          return {
            ...item,
            name: docName,
            category: uploadCategory,
            status: uploadStatus,
            submittedOn: stamp,
            verifiedBy: verifiedBy,
            fileUrl: uploadFile.name,
            fileSize: formattedSize,
            previewUrl: uploadFilePreviewUrl || undefined,
            notes: uploadNotes.trim() || item.notes,
          };
        }
        return item;
      });
      showToast(`"${docName}" re-uploaded — status updated to ${uploadStatus}`);
    }

    updateCurrentStudentChecklist(updatedList);
    handleCloseUploadModal();
  };

  // Open Preview Modal
  const handleOpenPreview = (doc: DocumentItem) => {
    if (!doc.fileUrl || doc.fileUrl === '-') {
      showToast('No document file has been uploaded for this checklist item yet.');
      return;
    }
    setPreviewDoc(doc);
  };

  // Deep-linking support
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#documentation') && hash.includes('?id=')) {
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
    window.location.hash = `documentation?id=${st.studentId}`;
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
    window.location.hash = 'documentation';
  };

  const handleVerify = (id: number) => {
    if (!selectedStudent) return;
    const updated = currentChecklist.map((item) =>
      item.id === id ? { ...item, status: 'Approved' as const, verifiedBy: 'Priya Singh' } : item
    );
    updateCurrentStudentChecklist(updated);
    showToast('Document verified and stamped as Approved');
  };

  const handleRequestReupload = (id: number) => {
    if (!selectedStudent) return;
    const updated = currentChecklist.map((item) =>
      item.id === id ? { ...item, status: 'Re-upload Required' as const, verifiedBy: 'Priya Singh' } : item
    );
    updateCurrentStudentChecklist(updated);
    showToast('Document marked as Re-upload Required. Student notified via WhatsApp.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddNote = () => {
    if (!newNoteInput.trim()) return;
    setNoteList((prev) => [
      { id: Date.now(), text: newNoteInput.trim(), time: 'Just now', author: 'Current User' },
      ...prev,
    ]);
    setNewNoteInput('');
    showToast('Internal note saved to student file');
  };

  // Compute live student document summary (directory reactive)
  const getDocSummary = (st: StudentRecord) => {
    const list = getCurrentChecklist(st);
    const total = list.length;
    const verified = list.filter((item) => item.status === 'Approved').length;
    const inReview = list.filter((item) => item.status === 'Under Review').length;
    const actionRequired = list.filter((item) => item.status === 'Re-upload Required').length;
    const pct = total > 0 ? Math.round((verified / total) * 100) : 0;

    let status = 'Pending';
    let color = 'bg-amber-50 text-amber-700 border-amber-200';

    if (pct >= 90) {
      status = 'Verified';
      color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (actionRequired > 0) {
      status = 'Action Required';
      color = 'bg-rose-50 text-rose-700 border-rose-200';
    } else if (inReview > 0) {
      status = 'In Review';
      color = 'bg-blue-50 text-[#087cf5] border-blue-200';
    }

    const missingItem = list.find((item) => item.status !== 'Approved');

    return {
      verified,
      total,
      pct,
      status,
      color,
      missing: missingItem ? missingItem.name : 'All Complete',
      passport: list.some((i) => i.category === 'Identity' && i.status === 'Approved'),
      academic: list.some((i) => i.category === 'Academic' && i.status === 'Approved'),
      ielts: list.some((i) => i.category === 'Language' && i.status === 'Approved'),
      sop: list.some((i) => i.category === 'Statements' && i.status === 'Approved'),
      financial: list.some((i) => i.category === 'Financial' && i.status === 'Approved'),
    };
  };

  // Filter students for directory
  const filteredStudents = studentList.filter((st) => {
    const docInfo = getDocSummary(st);
    const matchesSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.phone.includes(searchQuery) ||
      st.preferredCourse.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.targetUniversity.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCountry = countryFilter === 'All' || st.country === countryFilter;
    const matchesStatus = statusFilter === 'All' || docInfo.status === statusFilter;

    let matchesTab = true;
    if (tabFilter === 'Verified') matchesTab = docInfo.status === 'Verified';
    else if (tabFilter === 'In Review') matchesTab = docInfo.status === 'In Review';
    else if (tabFilter === 'Pending') matchesTab = docInfo.status === 'Pending';
    else if (tabFilter === 'Action Required') matchesTab = docInfo.status === 'Action Required';

    return matchesSearch && matchesCountry && matchesStatus && matchesTab;
  });

  const docCounts = {
    All: studentList.length,
    Verified: studentList.filter((st) => getDocSummary(st).status === 'Verified').length,
    InReview: studentList.filter((st) => getDocSummary(st).status === 'In Review').length,
    Pending: studentList.filter((st) => getDocSummary(st).status === 'Pending').length,
    ActionRequired: studentList.filter((st) => getDocSummary(st).status === 'Action Required').length,
  };

  const verifiedCount = currentChecklist.filter((c) => c.status === 'Approved').length;
  const completionPct = currentChecklist.length > 0 ? Math.round((verifiedCount / currentChecklist.length) * 100) : 0;

  return (
    <div className="p-3.5 pb-20 space-y-3.5 max-w-[1536px] mx-auto font-sans text-[#101d37] min-h-screen">
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
      {/* MODE 1: DOCUMENTATION DIRECTORY (LIST & CARD MATRIX)    */}
      {/* ======================================================== */}
      {!selectedStudent && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#5b21b6] text-white flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[18px] font-bold text-[#101d37] leading-tight">
                    Document Verification & Student Files Hub
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-purple-50 text-[#7c3aed] border border-purple-200 text-[10.5px] font-bold">
                    Official Verification
                  </span>
                </div>
                <p className="text-[11.5px] text-[#64748b] leading-tight mt-0.5">
                  Verify academic credentials, manage mandatory checklists, and prepare embassy-ready student documents
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* View Switcher: Ledger vs Cards */}
              <div className="flex items-center bg-white border border-[#e2e8f0] rounded-[7px] p-0.5 shadow-2xs">
                <button
                  onClick={() => setViewMode('ledger')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-[5px] text-[11px] font-semibold transition-colors ${
                    viewMode === 'ledger' ? 'bg-[#7c3aed] text-white shadow-xs' : 'text-[#64748b] hover:text-[#101d37]'
                  }`}
                  title="Document Matrix Ledger"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Document Table</span>
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-[5px] text-[11px] font-semibold transition-colors ${
                    viewMode === 'cards' ? 'bg-[#7c3aed] text-white shadow-xs' : 'text-[#64748b] hover:text-[#101d37]'
                  }`}
                  title="Student Document Cards"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Document Cards</span>
                </button>
              </div>

              <div className="text-[11.5px] text-[#64748b] hidden sm:inline">
                Home &gt; <span className="font-semibold text-[#101d37]">Documentation Hub</span>
              </div>
            </div>
          </div>

          {/* Document Health & KPI Summary Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Left 4 KPI Cards (8 cols) */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-white border border-[#e5edf5] rounded-[9px] p-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#64748b] font-medium">Total Student Files</span>
                  <FolderOpen className="w-4 h-4 text-[#7c3aed]" />
                </div>
                <div className="text-[20px] font-bold text-[#101d37] mt-1">{docCounts.All}</div>
                <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 inline-block">● Active student files</span>
              </div>

              <div className="bg-white border border-[#e5edf5] rounded-[9px] p-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#64748b] font-medium">Fully Verified</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-[20px] font-bold text-emerald-600 mt-1">{docCounts.Verified}</div>
                <span className="text-[10px] text-[#64748b]">Ready for submission</span>
              </div>

              <div className="bg-white border border-[#e5edf5] rounded-[9px] p-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#64748b] font-medium">Under Review</span>
                  <Clock className="w-4 h-4 text-[#087cf5]" />
                </div>
                <div className="text-[20px] font-bold text-[#087cf5] mt-1">{docCounts.InReview}</div>
                <span className="text-[10px] text-[#64748b]">Officer reviewing</span>
              </div>

              <div className="bg-white border border-[#e5edf5] rounded-[9px] p-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#64748b] font-medium">Action Required</span>
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-[20px] font-bold text-rose-600 mt-1">{docCounts.ActionRequired}</div>
                <span className="text-[10px] text-rose-600 font-semibold">Re-upload requested</span>
              </div>
            </div>

            {/* Right Health Progress Meter (4 cols) */}
            <div className="lg:col-span-4 bg-gradient-to-br from-[#faf5ff] to-white border border-purple-100 rounded-[9px] p-3 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#7c3aed] uppercase tracking-wider">Overall Documents Health</span>
                  <span className="text-[13px] font-black text-[#7c3aed]">
                    {Math.round(
                      (studentList.reduce((acc, st) => acc + getDocSummary(st).pct, 0) / (studentList.length || 1))
                    )}% Stamped
                  </span>
                </div>
                {/* Segmented Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex mt-2">
                  <div style={{ width: '72%' }} className="bg-emerald-500 h-full" title="Verified" />
                  <div style={{ width: '16%' }} className="bg-[#087cf5] h-full" title="In Review" />
                  <div style={{ width: '8%' }} className="bg-amber-400 h-full" title="Pending Upload" />
                  <div style={{ width: '4%' }} className="bg-rose-500 h-full" title="Action Required" />
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#64748b] pt-1">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Verified</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#087cf5]" /> In Review</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Pending</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Urgent</span>
              </div>
            </div>
          </div>

          {/* Toolbar: Search, Filters, Subtabs */}
          <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3 shadow-xs space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              {/* Quick Tab Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11.5px]">
                {[
                  { id: 'All', label: `All Files (${docCounts.All})` },
                  { id: 'Verified', label: `Ready for Submission (${docCounts.Verified})` },
                  { id: 'In Review', label: `Verification Queue (${docCounts.InReview})` },
                  { id: 'Pending', label: `Pending Uploads (${docCounts.Pending})` },
                  { id: 'Action Required', label: `Urgent Action (${docCounts.ActionRequired})` },
                ].map((tb) => (
                  <button
                    key={tb.id}
                    onClick={() => setTabFilter(tb.id as any)}
                    className={`px-3 py-1.5 rounded-[6px] font-semibold transition-colors whitespace-nowrap ${
                      tabFilter === tb.id
                        ? 'bg-[#7c3aed] text-white shadow-xs'
                        : 'bg-slate-50 text-[#52627a] hover:bg-slate-100 hover:text-[#101d37]'
                    }`}
                  >
                    {tb.label}
                  </button>
                ))}
              </div>

              {/* View Sample Profile Button */}
              <button
                onClick={() => handleOpenStudent(studentList[0])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-[12px] font-semibold transition-colors shadow-xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Open Sample File ({studentList[0]?.name || 'Rahul Sharma'})</span>
              </button>
            </div>

            {/* Search Input & Select Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2 pt-1 border-t border-slate-100">
              <div className="relative sm:col-span-2">
                <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student file by name, student ID, mobile, course, university..."
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#7c3aed] focus:bg-white rounded-[6px] pl-8 pr-3 py-1.5 text-[12px] text-[#101d37] outline-none transition-all"
                />
              </div>

              <div>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#7c3aed] rounded-[6px] px-2.5 py-1.5 text-[12px] text-[#101d37] outline-none"
                >
                  <option value="All">All Destination Countries</option>
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
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#7c3aed] rounded-[6px] px-2.5 py-1.5 text-[12px] text-[#101d37] outline-none"
                >
                  <option value="All">All Verification Statuses</option>
                  <option value="Verified">Verified & Ready</option>
                  <option value="In Review">In Review Queue</option>
                  <option value="Pending">Pending Upload</option>
                  <option value="Action Required">Action Required</option>
                </select>
              </div>
            </div>
          </div>

          {/* VIEW MODE 1: MATRIX TABLE */}
          {viewMode === 'ledger' && (
            <div className="bg-white rounded-[9px] border border-[#e5edf5] shadow-xs overflow-hidden flex flex-col">
              <div className="overflow-x-auto overflow-y-auto max-h-[640px] scrollbar-thin">
                <table className="w-full text-left text-[12px] border-collapse min-w-[1080px]">
                  <thead className="sticky top-0 bg-[#f8fafc] z-10 border-b border-[#e5edf5] shadow-2xs">
                    <tr className="text-[#52627a] font-bold text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Student & File ID</th>
                      <th className="py-2.5 px-3">Destination & University</th>
                      <th className="py-2.5 px-3">Program</th>
                      <th className="py-2.5 px-3 text-center">Core Document Matrix</th>
                      <th className="py-2.5 px-3">Document Health</th>
                      <th className="py-2.5 px-3">Assigned Officer</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((st, idx) => {
                        const docInfo = getDocSummary(st);
                        return (
                          <tr
                            key={st.id}
                            onClick={() => handleOpenStudent(st)}
                            className="hover:bg-purple-50/30 cursor-pointer transition-colors group"
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
                                <div>
                                  <div className="font-bold text-[#101d37] group-hover:text-[#7c3aed] transition-colors">
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
                              <div className="font-medium text-[#101d37] truncate max-w-[150px]">{st.preferredCourse}</div>
                              <div className="text-[10px] text-[#64748b]">{st.intake}</div>
                            </td>

                            {/* CORE DOCUMENT MATRIX MINI PILLS */}
                            <td className="py-3 px-3">
                              <div className="flex items-center justify-center gap-1">
                                <span
                                  className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold border ${
                                    docInfo.passport ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                                  }`}
                                  title="Passport: Verified"
                                >
                                  P
                                </span>
                                <span
                                  className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold border ${
                                    docInfo.academic ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                                  }`}
                                  title="Academic Marksheets: Verified"
                                >
                                  M
                                </span>
                                <span
                                  className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold border ${
                                    docInfo.ielts ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                                  }`}
                                  title="English Test: Score Report"
                                >
                                  E
                                </span>
                                <span
                                  className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold border ${
                                    docInfo.sop ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                                  }`}
                                  title="SOP & CV: Draft Status"
                                >
                                  S
                                </span>
                                <span
                                  className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold border ${
                                    docInfo.financial ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                                  }`}
                                  title="Financial Solvency: Bank Statement"
                                >
                                  F
                                </span>
                              </div>
                            </td>

                            <td className="py-3 px-3">
                              <div className="w-28">
                                <div className="flex justify-between text-[10px] font-semibold text-[#101d37] mb-1">
                                  <span>{docInfo.verified}/{docInfo.total} Docs</span>
                                  <span className="text-[#7c3aed] font-bold">{docInfo.pct}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-[#7c3aed] h-full rounded-full transition-all"
                                    style={{ width: `${docInfo.pct}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-3 font-medium text-[#101d37] whitespace-nowrap">
                              {st.counsellor}
                            </td>

                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded-[4px] text-[10.5px] font-semibold border ${docInfo.color}`}>
                                {docInfo.status}
                              </span>
                            </td>

                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => handleOpenStudent(st)}
                                  className="px-2.5 py-1 rounded-[5px] bg-purple-50 text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white font-semibold text-[11px] transition-colors shadow-2xs"
                                >
                                  Open Student File
                                </button>
                                <button
                                  onClick={() => showToast(`WhatsApp document checklist link shared with ${st.name}`)}
                                  className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                                  title="Send WhatsApp Doc Checklist"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-[#64748b] text-xs">
                          No student files found matching your search and filter criteria.
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
                    Showing <span className="font-bold text-[#7c3aed]">{filteredStudents.length}</span> of {studentList.length} student files
                  </span>
                  <span className="hidden sm:inline text-slate-300">|</span>
                  <span className="hidden sm:inline text-[11px] text-slate-500">
                    Matrix legend: [P] Passport • [M] Marksheets • [E] English Test • [S] SOP & CV • [F] Financials
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    Live Document Tracking
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* VIEW MODE 2: CARDS GRID */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredStudents.map((st) => {
                const docInfo = getDocSummary(st);
                return (
                  <div
                    key={st.id}
                    onClick={() => handleOpenStudent(st)}
                    className="bg-white border border-[#e5edf5] hover:border-[#7c3aed] rounded-[9px] p-3.5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
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
                            <h3 className="font-bold text-[13.5px] text-[#101d37] group-hover:text-[#7c3aed] transition-colors">
                              {st.name}
                            </h3>
                            <div className="text-[10.5px] text-[#64748b]">
                              {st.studentId} • {st.country === 'Italy' ? '🇮🇹 Italy' : st.country === 'Germany' ? '🇩🇪 Germany' : st.country === 'UK' ? '🇬🇧 UK' : '🇫🇷 France'}
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-semibold border ${docInfo.color}`}>
                          {docInfo.status}
                        </span>
                      </div>

                      <div className="py-2.5 space-y-2 text-[11.5px]">
                        <div>
                          <span className="text-[#64748b] block text-[10px]">Target Program & University</span>
                          <span className="font-semibold text-[#101d37]">{st.preferredCourse}</span>
                          <span className="text-[10.5px] text-[#64748b] block truncate">{st.targetUniversity}</span>
                        </div>

                        {/* Progress bar */}
                        <div>
                          <div className="flex justify-between text-[11px] font-semibold text-[#101d37] mb-1">
                            <span className="text-[#64748b]">Documents Completion</span>
                            <span className="text-[#7c3aed] font-bold">{docInfo.verified}/{docInfo.total} ({docInfo.pct}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-[#7c3aed] h-full rounded-full" style={{ width: `${docInfo.pct}%` }} />
                          </div>
                        </div>

                        {/* Missing item warning */}
                        {docInfo.pct < 90 && (
                          <div className="p-2 rounded-[6px] bg-rose-50/70 border border-rose-100 text-[10.5px] text-rose-700 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                            <span className="truncate">Action: {docInfo.missing}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-[#64748b]">Officer: <span className="font-semibold text-[#101d37]">{st.counsellor}</span></span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenStudent(st);
                        }}
                        className="px-2.5 py-1 rounded-[5px] bg-purple-50 text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white font-semibold transition-colors"
                      >
                        Inspect Student File &gt;
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
      {/* MODE 2: STUDENT DOCUMENTATION PROFILE PREVIEW            */}
      {/* ======================================================== */}
      {selectedStudent && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          {/* Top Breadcrumb & Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-0.5">
            <div className="flex items-center gap-2">
              <button
                onClick={handleBackToList}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#e2e8f0] bg-white hover:bg-slate-50 text-[12px] font-semibold text-[#101d37] shadow-xs transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Documentation Directory</span>
              </button>

              <span className="text-[12px] text-[#64748b] hidden sm:inline">
                Home &gt; Documentation &gt;{' '}
                <span className="font-bold text-[#101d37]">{selectedStudent.name}</span>{' '}
                <span className="text-[#64748b]">({selectedStudent.studentId})</span>
              </span>
            </div>

            {/* Quick Switcher dropdown & Prominent Upload Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenUploadModal('new')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-[12px] font-bold shadow-xs transition-all"
              >
                <FileUp className="w-3.5 h-3.5 stroke-[2.3]" />
                <span>+ Upload Document</span>
              </button>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[#64748b] hidden md:inline">Switch Student:</span>
                <select
                  value={selectedStudent.studentId}
                  onChange={(e) => {
                    const target = studentList.find((s) => s.studentId === e.target.value);
                    if (target) handleOpenStudent(target);
                  }}
                  className="bg-white border border-[#e2e8f0] rounded-[5px] px-2.5 py-1 text-[11.5px] font-semibold text-[#101d37] outline-none"
                >
                  {studentList.map((st) => (
                    <option key={st.studentId} value={st.studentId}>
                      {st.name} ({st.studentId})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Student Dossier Banner */}
          <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
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
                  <span className="text-[16px] font-bold text-[#101d37]">{selectedStudent.name}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10.5px] font-bold border border-emerald-200">
                    Active File
                  </span>
                </div>
                <div className="text-[11px] text-[#64748b] mt-0.5">
                  Student ID: <span className="font-semibold text-[#101d37]">{selectedStudent.studentId}</span> • Mobile: {selectedStudent.phone} • Email: {selectedStudent.email}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-[#52627a]">
              <div>
                <span className="text-[10px] text-[#8496b0] block uppercase font-medium">Destination</span>
                <span className="font-semibold text-[#101d37] flex items-center gap-1 mt-0.5">
                  <span>{selectedStudent.country === 'Italy' ? '🇮🇹' : selectedStudent.country === 'Germany' ? '🇩🇪' : selectedStudent.country === 'UK' ? '🇬🇧' : '🇫🇷'}</span>
                  <span>{selectedStudent.country}</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#8496b0] block uppercase font-medium">Target Program</span>
                <span className="font-semibold text-[#101d37] mt-0.5 block">{selectedStudent.preferredCourse}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8496b0] block uppercase font-medium">Target University</span>
                <span className="font-semibold text-[#101d37] mt-0.5 block">{selectedStudent.targetUniversity}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8496b0] block uppercase font-medium">Intake</span>
                <span className="font-semibold text-[#101d37] mt-0.5 block">{selectedStudent.intake}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8496b0] block uppercase font-medium">Assigned Officer</span>
                <span className="font-semibold text-[#7c3aed] mt-0.5 block">{selectedStudent.counsellor}</span>
              </div>
            </div>

            {/* Quick Upload CTA & Completion Bar */}
            <div className="w-full sm:w-56 flex flex-col items-end gap-1.5">
              <button
                onClick={() => handleOpenUploadModal('new')}
                className="w-full py-1.5 px-3 rounded-[6px] bg-purple-50 hover:bg-[#7c3aed] text-[#7c3aed] hover:text-white border border-purple-200 text-[11.5px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
              >
                <FilePlus className="w-3.5 h-3.5" />
                <span>Upload New Document</span>
              </button>

              <div className="w-full">
                <div className="flex justify-between text-[11px] font-bold text-[#101d37] mb-1">
                  <span className="text-slate-500 font-normal">Documents Completion</span>
                  <span className="text-[#7c3aed]">
                    {verifiedCount} / {currentChecklist.length} Verified
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#7c3aed] h-full rounded-full transition-all duration-300"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block text-right">
                  {completionPct}% complete
                </span>
              </div>
            </div>
          </div>

          {/* Category Filter Pills for Documents */}
          <div className="flex items-center gap-2 border-b border-[#e5edf5] pb-1 text-xs">
            {['All', 'Academic', 'Identity', 'Language', 'Statements', 'Financial'].map((cat: any) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 font-semibold transition-colors relative ${
                    isActive ? 'text-[#7c3aed]' : 'text-[#64748b] hover:text-[#101d37]'
                  }`}
                >
                  {cat}
                  {isActive && (
                    <span className="absolute left-0 right-0 -bottom-1 h-[2px] bg-[#7c3aed] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Main Dossier Workspace Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
            {/* Left Section: 12-Item Verification Checklist Table (8 cols) */}
            <div className="lg:col-span-8 space-y-3">
              <div className="bg-white rounded-[9px] border border-[#e5edf5] shadow-xs overflow-hidden">
                <div className="px-3.5 py-2.5 border-b border-[#e5edf5] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-[#7c3aed]" />
                    <h3 className="font-bold text-[13px] text-[#101d37]">
                      Mandatory Document Checklist ({currentChecklist.length})
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenUploadModal('new')}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Document</span>
                    </button>
                    <button
                      onClick={() => showToast(`Full archive for ${selectedStudent.name} downloaded successfully.`)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Download Archive</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full table-fixed text-left text-[11px]">
                    <colgroup>
                      <col className="w-7" />
                      <col />
                      <col className="w-[82px]" />
                      <col className="w-[92px]" />
                      <col className="w-[82px]" />
                      <col className="w-[70px]" />
                      <col className="w-[220px]" />
                    </colgroup>
                    <thead>
                      <tr className="bg-[#f8fafc] border-b border-[#e5edf5] text-[#52627a] font-bold text-[10px]">
                        <th className="px-2 py-2 w-6">#</th>
                        <th className="px-2 py-2">Document Name</th>
                        <th className="px-2 py-2">Category</th>
                        <th className="px-2 py-2">Status</th>
                        <th className="px-2 py-2">Submitted</th>
                        <th className="px-2 py-2">Verified By</th>
                        <th className="px-2 py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {currentChecklist
                        .filter((item) => activeCategory === 'All' || item.category === activeCategory)
                        .map((doc) => (
                          <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-2 py-2 text-slate-400 font-mono text-[10px]">{doc.id}</td>
                            <td className="px-2 py-2 font-medium text-[#101d37]">
                              <div className="font-semibold text-[11px] text-[#101d37] leading-snug">{doc.name}</div>
                              {doc.fileUrl !== '-' ? (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <button
                                    onClick={() => handleOpenPreview(doc)}
                                    className="text-[10px] text-[#7c3aed] hover:underline cursor-pointer flex items-center gap-1 font-mono truncate min-w-0"
                                    title="Click to preview file"
                                  >
                                    <Paperclip className="w-2.5 h-2.5 shrink-0" />
                                    <span className="truncate">{doc.fileUrl}</span>
                                  </button>
                                  {doc.fileSize && (
                                    <span className="text-[9px] text-slate-400 shrink-0">({doc.fileSize})</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[9.5px] text-slate-400 italic">No file attached</span>
                              )}
                              {doc.notes && (
                                <div className="text-[9.5px] text-amber-600 mt-0.5">Note: {doc.notes}</div>
                              )}
                            </td>
                            <td className="px-2 py-2 text-[#64748b] text-[10px]">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                                {doc.category}
                              </span>
                            </td>
                            <td className="px-2 py-2">
                              <span
                                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                  doc.status === 'Approved'
                                    ? 'bg-[#dcfce7] text-[#15803d]'
                                    : doc.status === 'Received'
                                    ? 'bg-[#e0f2fe] text-[#0284c7]'
                                    : doc.status === 'Under Review'
                                    ? 'bg-[#fef3c7] text-[#b45309]'
                                    : doc.status === 'Re-upload Required'
                                    ? 'bg-[#fee2e2] text-[#be123c]'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {doc.status === 'Approved' && <Check className="w-2.5 h-2.5 stroke-[2.5]" />}
                                {doc.status}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-slate-500 text-[10px] whitespace-nowrap">{doc.submittedOn}</td>
                            <td className="px-2 py-2 text-slate-700 text-[10px] font-medium">{doc.verifiedBy}</td>
                            <td className="px-2 py-2 text-right">
                              <div className="flex flex-nowrap items-center justify-end gap-1">
                                {/* Dedicated Upload / Re-upload button for this row */}
                                <button
                                  onClick={() => handleOpenUploadModal(doc.id)}
                                  className={`inline-flex items-center gap-1 px-1.5 py-1 rounded font-semibold text-[10px] transition-colors shadow-2xs whitespace-nowrap ${
                                    doc.status === 'Re-upload Required'
                                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                      : doc.fileUrl === '-'
                                      ? 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white'
                                      : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
                                  }`}
                                  title={`Upload / Replace file for ${doc.name}`}
                                >
                                  <Upload className="w-2.5 h-2.5" />
                                  <span>{doc.fileUrl === '-' ? 'Upload' : 'Replace'}</span>
                                </button>

                                {doc.status !== 'Approved' && doc.status !== 'Pending' && (
                                  <button
                                    onClick={() => handleVerify(doc.id)}
                                    className="px-1.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] transition-colors shadow-2xs whitespace-nowrap"
                                    title="Verify & mark Approved"
                                  >
                                    Verify
                                  </button>
                                )}

                                {doc.status !== 'Re-upload Required' && doc.status !== 'Pending' && (
                                  <button
                                    onClick={() => handleRequestReupload(doc.id)}
                                    className="px-1.5 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-[10px] transition-colors whitespace-nowrap"
                                    title="Request Re-upload from Student"
                                  >
                                    Re-upload
                                  </button>
                                )}

                                {doc.fileUrl !== '-' && (
                                  <button
                                    onClick={() => handleOpenPreview(doc)}
                                    className="p-1 text-slate-500 hover:text-[#7c3aed] hover:bg-slate-100 rounded transition-colors"
                                    title="Preview file"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Section: Dossier Actions & Notes (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              {/* Card 1: Forward to Application Team CTA */}
              <div className="bg-gradient-to-br from-[#7c3aed] to-[#5b21b6] text-white rounded-[9px] p-4 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-purple-200">Documents Clearance</span>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold leading-tight">Ready for University Applications</h4>
                  <p className="text-[11px] text-purple-100 mt-1 leading-snug">
                    Once all mandatory documents are stamped, forward this student file to the university application team.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (onForwardToApplications) {
                      onForwardToApplications();
                    } else if (onNavigate) {
                      onNavigate('applications');
                    }
                  }}
                  className="w-full py-2 px-3 rounded-[6px] bg-white hover:bg-slate-50 text-[#7c3aed] font-bold text-[12px] flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>Forward to Application Team</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Card 2: Student Academic Snapshot */}
              <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="font-bold text-[#101d37] text-[13px]">Academic Credentials</span>
                  <span className="text-[11px] text-[#7c3aed] font-semibold">{selectedStudent.studentId}</span>
                </div>
                <div className="space-y-1.5 text-[11.5px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target University:</span>
                    <span className="font-semibold text-[#101d37]">{selectedStudent.targetUniversity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Destination:</span>
                    <span className="font-semibold text-[#101d37]">{selectedStudent.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Highest Degree:</span>
                    <span className="font-semibold text-[#101d37]">{selectedStudent.academic.highestQualification}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">CGPA / Percentage:</span>
                    <span className="font-semibold text-emerald-600">{selectedStudent.academic.cgpa}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">English Test:</span>
                    <span className="font-semibold text-[#101d37]">{selectedStudent.academic.englishTest}</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Internal Notes & Follow-up Log */}
              <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="font-bold text-[#101d37] text-[13px]">Internal Document Notes</span>
                  <span className="text-[10px] text-slate-400">{noteList.length} notes</span>
                </div>

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newNoteInput}
                    onChange={(e) => setNewNoteInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    placeholder="Add documentation note..."
                    className="flex-1 bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#7c3aed] rounded-[6px] px-2.5 py-1 text-[11.5px] outline-none"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-2.5 py-1 bg-[#7c3aed] text-white rounded-[6px] font-semibold text-[11px]"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pt-1 divide-y divide-slate-50">
                  {noteList.map((nt) => (
                    <div key={nt.id} className="pt-1.5 text-[11px]">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-600">{nt.author}</span>
                        <span>{nt.time}</span>
                      </div>
                      <p className="text-slate-700 mt-0.5 leading-snug">{nt.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 4: Quick Actions */}
              <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3 shadow-xs space-y-2 text-xs">
                <div className="font-bold text-[#101d37] text-[13px]">Document Quick Actions</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleOpenUploadModal('new')}
                    className="col-span-2 py-2 px-2 rounded-[6px] bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <FileUp className="w-3.5 h-3.5" />
                    <span>Upload Student Document</span>
                  </button>

                  <button
                    onClick={() => showToast(`WhatsApp document checklist link sent to ${selectedStudent.name}`)}
                    className="py-2 px-2 rounded-[6px] bg-[#087cf5] hover:bg-[#006ee6] text-white font-semibold text-xs flex items-center justify-center gap-1 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>WhatsApp Checklist</span>
                  </button>
                  <button
                    onClick={() => {
                      const approved = currentChecklist.map((item) => ({ ...item, status: 'Approved' as const, verifiedBy: 'Priya Singh' }));
                      updateCurrentStudentChecklist(approved);
                      showToast('All checklist items stamped as Approved');
                    }}
                    className="py-2 px-2 rounded-[6px] bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold text-xs flex items-center justify-center gap-1 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve All Docs</span>
                  </button>

                  <button
                    onClick={() => {
                      setConfirmModalData({
                        isOpen: true,
                        title: 'Forward to University Shortlisting?',
                        studentName: selectedStudent.name,
                        studentId: selectedStudent.studentId,
                        studentAvatar: selectedStudent.avatar,
                        country: selectedStudent.country,
                        currentStageName: 'Documentation Completed (Stage 2)',
                        targetStageName: 'University Shortlisting (Stage 3)',
                        description: `Are you sure you want to approve documents and forward ${selectedStudent.name} to University Shortlisting? The shortlisting team will prepare customized university recommendations.`,
                        confirmLabel: 'Yes, Forward to University Shortlisting',
                        variant: 'primary',
                        onConfirm: () => {
                          if (onAdvanceStage) {
                            onAdvanceStage(selectedStudent.studentId || selectedStudent.id);
                          }
                          showToast(`Documents Approved! ${selectedStudent.name} moved to University Shortlisting.`);
                          if (onForwardToApplications) {
                            onForwardToApplications();
                          } else if (onNavigate) {
                            onNavigate(`university-shortlisting?id=${selectedStudent.studentId}`);
                          }
                        },
                      });
                    }}
                    className="col-span-2 py-2 px-2 rounded-[6px] bg-[#087cf5] hover:bg-[#006ee6] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Approve Documents & Forward to Shortlisting (Stage 3)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: RICH DOCUMENT UPLOAD DIALOG                     */}
      {/* ======================================================== */}
      {isUploadModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-purple-50 to-white border-b border-purple-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#7c3aed] text-white flex items-center justify-center shadow-xs">
                  <FileUp className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#101d37]">Upload Profile Document</h3>
                  <p className="text-[11px] text-[#64748b]">
                    Student: <span className="font-semibold text-[#101d37]">{selectedStudent.name}</span> ({selectedStudent.studentId})
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseUploadModal}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              {/* Target Checklist Selection */}
              <div>
                <label className="block text-[11px] font-bold text-[#101d37] mb-1">
                  Document Checklist Target
                </label>
                <select
                  value={uploadTargetId}
                  onChange={(e) => {
                    const val = e.target.value === 'new' ? 'new' : Number(e.target.value);
                    setUploadTargetId(val);
                    if (val === 'new') {
                      setUploadDocName('');
                      setUploadCategory('Statements');
                    } else {
                      const match = currentChecklist.find((c) => c.id === val);
                      if (match) {
                        setUploadDocName(match.name);
                        setUploadCategory(match.category);
                      }
                    }
                  }}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-[6px] px-3 py-2 text-[12px] text-[#101d37] outline-none focus:border-[#7c3aed]"
                >
                  <option value="new">+ Custom / Additional Document (Add to Checklist)</option>
                  {currentChecklist.map((item) => (
                    <option key={item.id} value={item.id}>
                      #{item.id}: {item.name} ({item.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#101d37] mb-1">
                    Document Title / Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={uploadDocName}
                    onChange={(e) => setUploadDocName(e.target.value)}
                    placeholder="e.g. Passport Bio Page, Degree Certificate"
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] focus:border-[#7c3aed] focus:bg-white rounded-[6px] px-3 py-1.5 text-[12px] text-[#101d37] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#101d37] mb-1">
                    Document Category
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as any)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-[6px] px-3 py-1.5 text-[12px] text-[#101d37] outline-none focus:border-[#7c3aed]"
                  >
                    <option value="Identity">Identity (Passport / ID)</option>
                    <option value="Academic">Academic (Marksheets / Degrees)</option>
                    <option value="Language">Language (IELTS / PTE / TOEFL)</option>
                    <option value="Statements">Statements (SOP / LOR / CV)</option>
                    <option value="Financial">Financial (Bank / Affidavit)</option>
                    <option value="Other">Other Document</option>
                  </select>
                </div>
              </div>

              {/* Drag & Drop File Zone */}
              <div>
                <label className="block text-[11px] font-bold text-[#101d37] mb-1">
                  File Attachment <span className="text-rose-500">*</span>
                </label>

                <input
                  ref={modalFileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      processSelectedFile(e.target.files[0]);
                    }
                  }}
                />

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => modalFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-[#7c3aed] bg-purple-50/70 scale-[1.01]'
                      : uploadFile
                      ? 'border-emerald-400 bg-emerald-50/40'
                      : 'border-slate-300 hover:border-[#7c3aed] hover:bg-slate-50'
                  }`}
                >
                  {uploadFile ? (
                    <div className="flex items-center justify-between text-left p-2 bg-white rounded-md border border-emerald-200">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-9 h-9 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-[#101d37] truncate">{uploadFile.name}</p>
                          <p className="text-[10.5px] text-[#64748b]">
                            {formatFileSize(uploadFile.size)} • Ready for upload
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadFile(null);
                          setUploadFilePreviewUrl(null);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-[#7c3aed] flex items-center justify-center mx-auto">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-[12.5px] text-[#101d37]">
                        Click to browse or drag and drop file here
                      </p>
                      <p className="text-[11px] text-[#64748b]">
                        Supported files: PDF, JPG, PNG, DOCX, XLSX (Up to 25 MB)
                      </p>
                    </div>
                  )}
                </div>

                {uploadError && (
                  <p className="text-[11px] text-rose-600 mt-1 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{uploadError}</span>
                  </p>
                )}
              </div>

              {/* Status and Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#101d37] mb-1">
                    Initial Verification Status
                  </label>
                  <select
                    value={uploadStatus}
                    onChange={(e) => setUploadStatus(e.target.value as any)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-[6px] px-3 py-1.5 text-[12px] text-[#101d37] outline-none focus:border-[#7c3aed]"
                  >
                    <option value="Under Review">Under Review (Requires Officer Check)</option>
                    <option value="Approved">Approved (Instant Stamp & Verify)</option>
                    <option value="Received">Received (Pending Review Queue)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#101d37] mb-1">
                    Officer Notes / Remarks (Optional)
                  </label>
                  <input
                    type="text"
                    value={uploadNotes}
                    onChange={(e) => setUploadNotes(e.target.value)}
                    placeholder="e.g. Validated with gazetted notary seal"
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] focus:border-[#7c3aed] focus:bg-white rounded-[6px] px-3 py-1.5 text-[12px] text-[#101d37] outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-[#f8fafc] border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={handleCloseUploadModal}
                className="px-3.5 py-1.5 rounded-[6px] border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmUpload}
                disabled={!uploadFile}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-[6px] font-bold text-xs text-white shadow-xs transition-all ${
                  uploadFile
                    ? 'bg-[#7c3aed] hover:bg-[#6d28d9] cursor-pointer'
                    : 'bg-slate-300 cursor-not-allowed opacity-70'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Confirm & Upload Document</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: INTERACTIVE DOCUMENT PREVIEW MODAL              */}
      {/* ======================================================== */}
      {previewDoc && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#7c3aed] text-white flex items-center justify-center shadow-xs">
                  <FileText className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#101d37]">{previewDoc.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="px-1.5 py-0.2 rounded bg-purple-50 text-[#7c3aed] border border-purple-200 text-[10px] font-bold">
                      {previewDoc.category}
                    </span>
                    <span className="text-[11px] text-[#64748b]">
                      Student: {selectedStudent.name} ({selectedStudent.studentId})
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              {/* Metadata strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Status</span>
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[10.5px] font-bold mt-0.5 ${
                      previewDoc.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : previewDoc.status === 'Re-upload Required'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {previewDoc.status}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">File Name</span>
                  <span className="font-semibold text-[#101d37] truncate block mt-0.5 font-mono">
                    {previewDoc.fileUrl}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Submitted On</span>
                  <span className="font-semibold text-[#101d37] block mt-0.5">{previewDoc.submittedOn}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Verified By</span>
                  <span className="font-semibold text-[#101d37] block mt-0.5">{previewDoc.verifiedBy}</span>
                </div>
              </div>

              {previewDoc.notes && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11.5px]">
                  <span className="font-bold">Officer Remarks: </span>
                  {previewDoc.notes}
                </div>
              )}

              {/* Document Visual Viewer */}
              <div className="border border-slate-200 rounded-lg p-6 bg-slate-100 flex flex-col items-center justify-center min-h-[260px] text-center relative overflow-hidden">
                {previewDoc.previewUrl ? (
                  <img
                    src={previewDoc.previewUrl}
                    alt={previewDoc.name}
                    className="max-h-[280px] max-w-full object-contain rounded shadow-md border border-slate-200"
                  />
                ) : (
                  <div className="space-y-3 max-w-md">
                    <div className="w-14 h-14 rounded-2xl bg-white text-[#7c3aed] flex items-center justify-center mx-auto shadow-md border border-slate-200">
                      <FileCheck2 className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full inline-block">
                        Official Verified Repository
                      </div>
                      <h4 className="font-bold text-[15px] text-[#101d37] mt-1.5">{previewDoc.name}</h4>
                      <p className="text-[11px] text-[#64748b] mt-0.5">
                        Attached File: <span className="font-mono text-slate-700">{previewDoc.fileUrl}</span> ({previewDoc.fileSize || '1.8 MB'})
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded border border-slate-200 text-left space-y-1 text-[11px] text-slate-600 shadow-2xs">
                      <div className="flex justify-between">
                        <span>Holder:</span>
                        <span className="font-semibold text-slate-800">{selectedStudent.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Destination University:</span>
                        <span className="font-semibold text-slate-800">{selectedStudent.targetUniversity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Checksum:</span>
                        <span className="font-mono text-[10px] text-slate-500">SHA256: 7f8a9e1c2b...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-[#f8fafc] border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const targetId = previewDoc.id;
                  setPreviewDoc(null);
                  handleOpenUploadModal(targetId);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Replace / Re-upload</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    showToast(`Downloading "${previewDoc.fileUrl}"...`);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>

                {previewDoc.status !== 'Approved' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleVerify(previewDoc.id);
                      setPreviewDoc((prev) => (prev ? { ...prev, status: 'Approved', verifiedBy: 'Priya Singh' } : null));
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Stamp as Approved</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-3 py-1.5 rounded-[6px] bg-[#101d37] hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Floating Action Confirmation Card */}
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
