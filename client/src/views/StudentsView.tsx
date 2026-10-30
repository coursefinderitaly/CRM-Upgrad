import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  FileSpreadsheet,
} from 'lucide-react';
import { Lead } from '../types/crm';

import { StudentRecord } from '../services/studentsData';
import { countryFlag } from '../utils/country';
import { LEAD_STATUS_OPTIONS } from '../utils/statuses';
import { StudentAvatar } from '../components/common/StudentAvatar';
import {
  useWorkflow,
  getPipelineStageForStudent,
  getNextStageForStudent,
} from '../context/WorkflowContext';
import { ActionConfirmModal } from '../components/modals/ActionConfirmModal';
import { ProfileEditModal, ProfileEditField } from '../components/modals/ProfileEditModal';
import {
  CommonStudentProfile,
  fetchCommonProfileById,
  updateCommonProfileSection,
  getAuditActor,
  fetchAudit,
  AuditEntry,
} from '../services/api';
export type { StudentRecord };

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
  const { students: workflowStudents, advanceStudentStage, refreshFromProfiles } = useWorkflow();

  // Navigation State: Directory List vs Profile Detail Window
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  // Full live row set from the student's own SQLite database
  const [profileDetail, setProfileDetail] = useState<CommonStudentProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileAudits, setProfileAudits] = useState<AuditEntry[]>([]);

  // Profile Detail Tabs
  const [activeSubTab, setActiveSubTab] = useState('Overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [pendingProfileStatus, setPendingProfileStatus] = useState<string | null>(null);

  // Generic section editor — every save writes to the student's SQLite file
  const [editConfig, setEditConfig] = useState<{
    section: string;
    title: string;
    subtitle?: string;
    fields: ProfileEditField[];
    values: Record<string, any>;
  } | null>(null);
  const [savingSection, setSavingSection] = useState(false);

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

  /** Reloads the exact SQLite-backed row set and live audit trail for the open student. */
  const loadProfileDetail = useCallback(async (student: StudentRecord | null) => {
    if (!student) {
      setProfileDetail(null);
      setProfileAudits([]);
      return;
    }
    setProfileLoading(true);
    try {
      const [detail, auditRes] = await Promise.all([
        fetchCommonProfileById(student.id),
        fetchAudit({ entityId: student.id, limit: 50 }).catch(() => ({ total: 0, entries: [] })),
      ]);
      setProfileDetail(detail);
      setProfileAudits(auditRes.entries || []);
    } catch (err) {
      console.warn('Could not load live profile rows from SQLite:', err);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedStudent) {
      setProfileDetail(null);
      setProfileAudits([]);
      return;
    }
    loadProfileDetail(selectedStudent);
  }, [selectedStudent?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Enrolled Students only shows students who crossed the counselling funnel.
  // New leads / contacted / counselling / interested profiles stay in their
  // own My Students sections until their status becomes Enrolled.
  const enrolledRoster = useMemo(
    () =>
      workflowStudents.filter((st) => {
        const status = (st.overallStatus || '').trim().toLowerCase();
        return !['new lead', 'contacted', 'counselling', 'interested'].includes(status);
      }),
    [workflowStudents]
  );

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
    id === 'All' ? enrolledRoster.length : enrolledRoster.filter(TAB_FILTERS[id]).length;

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
    leads: {
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
    const list = enrolledRoster.filter((st) => {
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
    return list;
  }, [enrolledRoster, searchQuery, countryFilter, statusFilter, tabFilter, currentStageFilter]);

  // Convert student record to Lead type for reusable modals
  const studentAsLead = (st: StudentRecord): Lead => ({
    id: st.id,
    leadId: st.leadId || st.studentId,
    studentName: st.name,
    phone: st.phone,
    email: st.email,
    dob: st.dob,
    address: st.address,
    nationality: st.nationality,
    countryInterest: st.country,
    courseInterest: st.preferredCourse,
    intake: st.intake,
    budget: st.budget,
    leadSource: 'Student Enrolment',
    lastActivity: st.enrollmentDate,
    nextFollowUp: st.nextFollowUp,
    status: st.overallStatus,
    currentStage: st.currentStage,
    isEnrolled: st.overallStatus === 'Enrolled' || st.stageNumber >= 1,
    isTransferredToDocs: st.stageNumber >= 4,
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

  // -------------------------------------------------------------------
  // LIVE SQLITE DATA
  // Everything rendered below comes from the student's own database file:
  // student_profile/<folder>/<folder>.db
  // -------------------------------------------------------------------
  const rawProfile = profileDetail;
  const rawAcademic = rawProfile?.academic || {};
  const rawApproval = rawProfile?.approval || {};
  const rawCounselling = rawProfile?.counselling || {};
  const rawScholarship = rawProfile?.scholarship || {};
  const rawPreEnrolment = rawProfile?.pre_enrolment || {};
  const rawLegalization = rawProfile?.legalization || {};
  const rawVisa = rawProfile?.visa || {};

  const currentDbFolder = rawProfile?.folder_name || activeStudent?.folderName || '';
  const currentDbFile = rawProfile?.db_file || activeStudent?.dbFile || (currentDbFolder ? `${currentDbFolder}.db` : '');
  const currentDbSource = currentDbFile ? `student_profile/${currentDbFolder}/${currentDbFile}` : 'student_profile/';

  const formatDbDate = (value?: string | null): string => {
    if (!value) return '-';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const alternativeCourseList = (() => {
    const raw = rawProfile?.alternative_courses;
    if (rawProfile) {
      if (Array.isArray(raw)) return raw as string[];
      if (raw) return String(raw).split(/[,;\n]/).map((c) => c.trim()).filter(Boolean);
      return [];
    }
    return activeStudent?.alternativeCourses || [];
  })();

  const passportDocument = rawProfile?.documents?.find((doc) =>
    /passport/i.test(doc.document_name || '')
  );
  const passportStatus = passportDocument
    ? `${passportDocument.status}${passportDocument.verified_by ? ` (${passportDocument.verified_by})` : ''}`
    : 'Pending document upload';

  const paymentSchedule = (() => {
    const raw = rawApproval.payment_schedule;
    if (!raw) return [] as string[];
    return String(raw).split(/\n|;/).map((s) => s.trim()).filter(Boolean);
  })();

  const applicationStatusClass = (status?: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('accept') || s.includes('offer') || s.includes('approved')) return 'bg-[#dcfce7] text-[#15803d]';
    if (s.includes('reject')) return 'bg-[#fee2e2] text-[#dc2626]';
    if (s.includes('draft')) return 'bg-[#f1f5f9] text-[#64748b]';
    return 'bg-[#e0f2fe] text-[#0284c7]';
  };

  const displayApplications = rawProfile?.applications?.length
    ? rawProfile.applications.map((app, idx) => ({
        id: app.id || String(idx + 1),
        university: app.university_name || 'University',
        program: app.program_name || 'Program',
        intake: activeStudent?.intake || '-',
        date: app.submission_date || '-',
        status: app.status || 'Draft',
        statusColor: applicationStatusClass(app.status),
      }))
    : activeStudent?.applications || [];

  const displayOffers = rawProfile?.offers?.length
    ? rawProfile.offers.map((offer) => ({
        id: offer.id,
        university: offer.university_name || 'University',
        date: offer.received_date || '-',
        type: offer.offer_type || 'Conditional',
        conditions: offer.conditions ? [String(offer.conditions)] : [],
        status: offer.status || 'Received',
        statusColor: applicationStatusClass(offer.status),
      }))
    : (activeStudent?.offers || []).map((offer) => ({ ...offer, id: undefined as string | undefined }));

  const displayDocuments = rawProfile?.documents?.length
    ? rawProfile.documents.map((doc) => ({
        id: doc.id,
        name: doc.document_name || 'Document',
        status: doc.status || 'Pending',
        date: formatDbDate((doc as any).created_at || (doc as any).updated_at),
        remarks: doc.remarks || '',
        verifiedBy: doc.verified_by || '',
      }))
    : (activeStudent?.documents || []).map((doc) => ({
        id: undefined as string | undefined,
        name: doc.name,
        status: doc.status,
        date: doc.date,
        remarks: '',
        verifiedBy: '',
      }));

  const displayTimeline = activeStudent?.timeline || [];

  // -------------------------------------------------------------------
  // SECTION EDITORS (all writes go to the student's SQLite file)
  // -------------------------------------------------------------------
  const openPersonalEdit = () =>
    setEditConfig({
      section: 'profile',
      title: 'Edit Personal Details',
      subtitle: 'Updates the student_profiles table.',
      fields: [
        { key: 'name', label: 'Full Name' },
        { key: 'phone', label: 'Mobile' },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'dob', label: 'Date of Birth', placeholder: 'DD/MM/YYYY' },
        { key: 'nationality', label: 'Nationality' },
        { key: 'address', label: 'Address', type: 'textarea', fullWidth: true },
        { key: 'enrollment_date', label: 'Enrollment Date' },
        { key: 'next_follow_up', label: 'Next Follow-up' },
        { key: 'priority', label: 'Priority', type: 'select', options: ['High', 'Medium', 'Low'] },
      ],
      values: {
        name: rawProfile?.name || activeStudent?.name,
        phone: rawProfile?.phone || activeStudent?.phone,
        email: rawProfile?.email || activeStudent?.email,
        dob: rawProfile?.dob || activeStudent?.dob,
        nationality: rawProfile?.nationality || activeStudent?.nationality,
        address: rawProfile?.address || activeStudent?.address,
        enrollment_date: rawProfile?.enrollment_date || activeStudent?.enrollmentDate,
        next_follow_up: rawProfile?.next_follow_up || activeStudent?.nextFollowUp,
        priority: rawProfile?.priority || activeStudent?.priority,
      },
    });

  const openAcademicEdit = () =>
    setEditConfig({
      section: 'academic',
      title: 'Edit Academic Details',
      subtitle: 'Updates the academic_records table.',
      fields: [
        { key: 'tenth_board', label: '10th Board' },
        { key: 'tenth_percentage', label: '10th Percentage / CGPA' },
        { key: 'twelfth_board', label: '12th Board' },
        { key: 'twelfth_percentage', label: '12th Percentage / CGPA' },
        { key: 'bachelor_degree', label: 'Bachelor Degree' },
        { key: 'bachelor_university', label: 'University' },
        { key: 'bachelor_cgpa', label: 'CGPA' },
        { key: 'bachelor_passing_year', label: 'Passing Year' },
        { key: 'backlogs', label: 'Backlogs' },
        { key: 'education_gaps', label: 'Education Gaps' },
        { key: 'work_experience', label: 'Work Experience' },
      ],
      values: {
        tenth_board: rawAcademic.tenth_board,
        tenth_percentage: rawAcademic.tenth_percentage,
        twelfth_board: rawAcademic.twelfth_board,
        twelfth_percentage: rawAcademic.twelfth_percentage,
        bachelor_degree: rawAcademic.bachelor_degree,
        bachelor_university: rawAcademic.bachelor_university,
        bachelor_cgpa: rawAcademic.bachelor_cgpa,
        bachelor_passing_year: rawAcademic.bachelor_passing_year,
        backlogs: rawAcademic.backlogs,
        education_gaps: rawAcademic.education_gaps,
        work_experience: rawAcademic.work_experience,
      },
    });

  const openTestScoreEdit = () => {
    const test: any = rawProfile?.test_scores?.[0] || {};
    setEditConfig({
      section: 'test_scores',
      title: 'Edit English / Standardized Test',
      subtitle: 'Updates the test_scores table.',
      fields: [
        { key: 'test_type', label: 'Test Type', type: 'select', options: ['IELTS', 'TOEFL', 'PTE', 'Duolingo', 'GRE', 'GMAT'] },
        { key: 'overall_score', label: 'Overall Score' },
        { key: 'reading', label: 'Reading' },
        { key: 'writing', label: 'Writing' },
        { key: 'listening', label: 'Listening' },
        { key: 'speaking', label: 'Speaking' },
        { key: 'test_date', label: 'Test Date' },
        { key: 'status', label: 'Status', type: 'select', options: ['Passed', 'Reported', 'Scheduled', 'In Prep'] },
      ],
      values: {
        test_type: test.test_type || 'IELTS',
        overall_score: test.overall_score,
        reading: test.reading,
        writing: test.writing,
        listening: test.listening,
        speaking: test.speaking,
        test_date: test.test_date,
        status: test.status,
      },
    });
  };

  const openProgramEdit = () =>
    setEditConfig({
      section: 'profile',
      title: 'Edit Program Preferences',
      subtitle: 'Updates the student_profiles table.',
      fields: [
        { key: 'country', label: 'Target Country' },
        { key: 'course_level', label: 'Course Level', type: 'select', options: ['Bachelor', 'Master', 'PhD', 'Diploma'] },
        { key: 'preferred_course', label: 'Preferred Course' },
        { key: 'alternative_courses', label: 'Alternative Courses (comma separated)', type: 'textarea', fullWidth: true },
        { key: 'target_university', label: 'Target University' },
        { key: 'intake', label: 'Target Intake' },
        { key: 'budget', label: 'Budget' },
      ],
      values: {
        country: rawProfile?.country || activeStudent?.country,
        course_level: rawProfile?.course_level || activeStudent?.courseLevel,
        preferred_course: rawProfile?.preferred_course || activeStudent?.preferredCourse,
        alternative_courses: alternativeCourseList.join(', '),
        target_university: rawProfile?.target_university || activeStudent?.targetUniversity,
        intake: rawProfile?.intake || activeStudent?.intake,
        budget: rawProfile?.budget || '',
      },
    });

  const openCounsellingNotesEdit = () =>
    setEditConfig({
      section: 'counselling',
      title: 'Edit Counselling Notes',
      subtitle: 'Updates the counselling_records table.',
      fields: [
        { key: 'counsellor_name', label: 'Counsellor' },
        { key: 'session_date', label: 'Session Date' },
        { key: 'preferred_countries', label: 'Preferred Countries' },
        { key: 'budget_bracket', label: 'Budget Bracket' },
        { key: 'outcome', label: 'Outcome' },
        { key: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
        { key: 'recommendations', label: 'Recommendations', type: 'textarea', fullWidth: true },
      ],
      values: {
        counsellor_name: (rawCounselling as any).counsellor_name || activeStudent?.counsellor,
        session_date: (rawCounselling as any).session_date,
        preferred_countries: (rawCounselling as any).preferred_countries,
        budget_bracket: (rawCounselling as any).budget_bracket,
        outcome: (rawCounselling as any).outcome,
        notes: (rawCounselling as any).notes,
        recommendations: (rawCounselling as any).recommendations,
      },
    });

  const openPaymentEdit = () =>
    setEditConfig({
      section: 'payment',
      title: 'Edit Payment & Agreement',
      subtitle: 'Updates the student_approvals table.',
      fields: [
        {
          key: 'agreement_status',
          label: 'Agreement Status',
          type: 'select',
          options: ['Pending', 'Signed by Student', 'Signed', 'Not Signed'],
        },
        { key: 'service_package', label: 'Service Package' },
        { key: 'total_fee', label: 'Total Fee' },
        { key: 'amount_paid', label: 'Amount Paid' },
        { key: 'balance', label: 'Balance' },
        {
          key: 'payment_schedule',
          label: 'Payment Schedule (one instalment per line)',
          type: 'textarea',
          fullWidth: true,
        },
        { key: 'choice_1_university', label: 'Choice 1 University' },
        { key: 'choice_2_university', label: 'Choice 2 University' },
      ],
      values: {
        agreement_status: rawApproval.agreement_status || (rawApproval.agreement_signed ? 'Signed' : 'Pending'),
        service_package: rawApproval.service_package,
        total_fee: rawApproval.total_fee,
        amount_paid: rawApproval.amount_paid,
        balance: rawApproval.balance,
        payment_schedule: rawApproval.payment_schedule || paymentSchedule.join('\n'),
        choice_1_university: rawApproval.choice_1_university,
        choice_2_university: rawApproval.choice_2_university,
      },
    });

  const openDocumentEdit = (doc: { id?: string; name: string; status: string; remarks: string; verifiedBy: string }) =>
    setEditConfig({
      section: 'documents',
      title: `Edit Document — ${doc.name}`,
      subtitle: 'Updates the documents_checklist table.',
      fields: [
        { key: 'document_name', label: 'Document Name' },
        { key: 'status', label: 'Status', type: 'select', options: ['Pending', 'Received', 'Verified', 'Approved', 'Needs Re-upload'] },
        { key: 'verified_by', label: 'Verified By' },
        { key: 'remarks', label: 'Remarks', type: 'textarea', fullWidth: true },
      ],
      values: {
        id: doc.id,
        document_name: doc.name,
        status: doc.status,
        verified_by: doc.verifiedBy,
        remarks: doc.remarks,
      },
    });

  const openApplicationEdit = (app?: {
    id?: string | number;
    university: string;
    program: string;
    date: string;
    status: string;
  }) =>
    setEditConfig({
      section: 'applications',
      title: app?.id ? 'Edit University Application' : 'Add University Application',
      subtitle: 'Updates the university_applications table.',
      fields: [
        { key: 'university_name', label: 'University Name' },
        { key: 'program_name', label: 'Program' },
        { key: 'portal_application_id', label: 'Portal Application ID' },
        { key: 'submission_date', label: 'Application Date' },
        {
          key: 'status',
          label: 'Status',
          type: 'select',
          options: ['Draft', 'Submitted', 'Under Evaluation', 'Interview Scheduled', 'Accepted', 'Rejected'],
        },
      ],
      values: {
        // Local numeric mock ids are not SQLite row ids — only pass real UUIDs.
        id: typeof app?.id === 'string' ? app.id : undefined,
        university_name: app?.university || '',
        program_name: app?.program || '',
        portal_application_id: '',
        submission_date: app?.date && app.date !== '-' ? app.date : '',
        status: app?.status || 'Submitted',
      },
    });

  const openOfferEdit = (offer?: {
    id?: string;
    university: string;
    date: string;
    type: string;
    conditions: string[];
    status: string;
  }) =>
    setEditConfig({
      section: 'offers',
      title: offer?.university ? 'Edit Offer Letter' : 'Add Offer Letter',
      subtitle: 'Updates the offer_letters table.',
      fields: [
        { key: 'university_name', label: 'University Name' },
        { key: 'offer_type', label: 'Offer Type', type: 'select', options: ['Conditional Offer', 'Unconditional Offer'] },
        { key: 'received_date', label: 'Offer Date' },
        { key: 'conditions', label: 'Conditions', type: 'textarea', fullWidth: true },
        { key: 'deposit_amount', label: 'Deposit Amount' },
        { key: 'status', label: 'Status', type: 'select', options: ['Received', 'Seat Secured', 'Under Verification', 'Accepted', 'Declined'] },
      ],
      values: {
        id: offer?.id,
        university_name: offer?.university || '',
        offer_type: offer?.type || 'Conditional Offer',
        received_date: offer?.date && offer.date !== '-' ? offer.date : '',
        conditions: (offer?.conditions || []).join('\n'),
        deposit_amount: '',
        status: offer?.status || 'Received',
      },
    });

  const openScholarshipEdit = () =>
    setEditConfig({
      section: 'scholarship',
      title: 'Edit Scholarship Process',
      subtitle: 'Updates the scholarships table.',
      fields: [
        { key: 'scholarship_name', label: 'Scholarship Name' },
        { key: 'regional_authority', label: 'Regional Authority' },
        { key: 'isee_parificato_amount', label: 'ISEE Parificato Amount' },
        { key: 'stipend_amount', label: 'Stipend Amount' },
        { key: 'application_deadline', label: 'Application Deadline' },
        { key: 'family_income_doc_status', label: 'Family Income Doc Status' },
        { key: 'status', label: 'Status' },
      ],
      values: {
        scholarship_name: rawScholarship.scholarship_name,
        regional_authority: (rawScholarship as any).regional_authority,
        isee_parificato_amount: rawScholarship.isee_parificato_amount,
        stipend_amount: rawScholarship.stipend_amount,
        application_deadline: (rawScholarship as any).application_deadline,
        family_income_doc_status: (rawScholarship as any).family_income_doc_status,
        status: rawScholarship.status,
      },
    });

  const openPreEnrolmentEdit = () =>
    setEditConfig({
      section: 'pre-enrolment',
      title: 'Edit Pre-Enrolment (Universitaly)',
      subtitle: 'Updates the pre_enrolments table.',
      fields: [
        { key: 'universitaly_summary_code', label: 'Universitaly Summary Code' },
        { key: 'university_validation_status', label: 'University Validation Status' },
        { key: 'status', label: 'Status' },
      ],
      values: {
        universitaly_summary_code: rawPreEnrolment.universitaly_summary_code,
        university_validation_status: rawPreEnrolment.university_validation_status,
        status: rawPreEnrolment.status,
      },
    });

  const openDovEdit = () =>
    setEditConfig({
      section: 'dov',
      title: 'Edit DoV / CIMEA Process',
      subtitle: 'Updates the legalizations table.',
      fields: [
        { key: 'process_type', label: 'Process Type', type: 'select', options: ['DoV', 'CIMEA Statement of Comparability'] },
        { key: 'cimea_diploma_ref', label: 'CIMEA / DoV Reference' },
        { key: 'status', label: 'Status' },
      ],
      values: {
        process_type: rawLegalization.process_type,
        cimea_diploma_ref: rawLegalization.cimea_diploma_ref,
        status: rawLegalization.status,
      },
    });

  const openVisaEdit = () =>
    setEditConfig({
      section: 'visa',
      title: 'Edit Visa Process',
      subtitle: 'Updates the visa_processes table.',
      fields: [
        { key: 'vfs_center', label: 'VFS Center' },
        { key: 'appointment_date', label: 'Appointment Date' },
        { key: 'appointment_time', label: 'Appointment Time' },
        { key: 'visa_type', label: 'Visa Type' },
        { key: 'vfs_reference_no', label: 'VFS Reference No.' },
        { key: 'checklist_verification', label: 'Checklist Verification' },
        { key: 'financial_proof_amount', label: 'Financial Proof Amount' },
        {
          key: 'decision',
          label: 'Decision',
          type: 'select',
          options: ['Not Started', 'In Progress', 'Appointment Booked', 'Submitted', 'Approved', 'Rejected'],
        },
      ],
      values: {
        vfs_center: rawVisa.vfs_center,
        appointment_date: rawVisa.appointment_date,
        appointment_time: rawVisa.appointment_time,
        visa_type: rawVisa.visa_type,
        vfs_reference_no: rawVisa.vfs_reference_no,
        checklist_verification: rawVisa.checklist_verification,
        financial_proof_amount: rawVisa.financial_proof_amount,
        decision: rawVisa.decision,
      },
    });

  const handleSaveSection = async (values: Record<string, any>) => {
    if (!editConfig || !activeStudent) return;
    setSavingSection(true);
    try {
      const actor = getAuditActor();
      const result = await updateCommonProfileSection(
        activeStudent.id,
        editConfig.section,
        values,
        actor.name || 'Staff Operator',
        actor.role || 'counsellor',
        { email: actor.email || undefined, portal: 'Counsellor Portal' }
      );
      if (!result) throw new Error('The server did not confirm the SQLite update.');
      await refreshFromProfiles();
      const fresh = await fetchCommonProfileById(activeStudent.id);
      setProfileDetail(fresh);
      setToastMessage(`${editConfig.title} saved to ${currentDbSource}`);
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setSavingSection(false);
    }
  };

  const applyProfileStatusChange = async (newStatus: string) => {
    if (!activeStudent || statusSaving || newStatus === activeStudent.overallStatus) return;
    setStatusSaving(true);
    try {
      const actor = getAuditActor();
      const result = await updateCommonProfileSection(
        activeStudent.id,
        'profile',
        { overall_status: newStatus },
        actor.name || 'Staff Operator',
        actor.role || 'counsellor',
        { email: actor.email || undefined, portal: 'Counsellor Portal' }
      );
      if (!result) throw new Error('Could not update status in the SQLite profile.');
      await refreshFromProfiles();
      const fresh = await fetchCommonProfileById(activeStudent.id);
      setProfileDetail(fresh);
      setSelectedStudent((prev) => (prev ? { ...prev, overallStatus: newStatus } : prev));
      setToastMessage(
        newStatus === 'Enrolled'
          ? `${activeStudent.name} is now in Enrolled Students — stage was not advanced.`
          : `Status updated to ${newStatus}`
      );
      setTimeout(() => setToastMessage(null), 3500);
      // Enrolled students move exclusively to the Enrolled Students section.
      if (newStatus === 'Enrolled' && onNavigate) onNavigate('students');
    } catch (err: any) {
      setToastMessage(err?.message || 'Could not update status');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setStatusSaving(false);
    }
  };

  const handleProfileStatusChange = (newStatus: string) => {
    if (!activeStudent || statusSaving || newStatus === activeStudent.overallStatus) return;
    setPendingProfileStatus(newStatus);
  };

  const focusSection = (tab: string, elementId?: string) => {
    setActiveSubTab(tab);
    if (elementId) {
      setTimeout(() => {
        document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  };

  const handleProfileTabClick = (tab: string) => {
    // Only redirect to workspaces that actually exist inside the counsellor
    // portal. Downstream work stays inside this profile page instead of
    // sending the counsellor to a blank route owned by another portal.
    if (tab === 'Enrolment') {
      onNavigate?.('enrolment');
      return;
    }
    if (tab === 'University Shortlisting') {
      onNavigate?.('university-shortlisting');
      return;
    }
    if (tab === 'Student Approval') {
      onNavigate?.('student-approval');
      return;
    }

    const anchors: Record<string, string> = {
      Overview: 'profile-overview',
      Documents: 'profile-documents',
      Applications: 'profile-applications',
      'Offer Letters': 'profile-offers',
      'Final University': 'profile-offers',
      Scholarship: 'profile-scholarship',
      'Pre-Enrolment': 'profile-preenrolment',
      'DoV / CIMEA': 'profile-dov',
      Visa: 'profile-visa',
      'Pre-Departure': 'profile-overview',
      Timeline: 'profile-timeline',
    };
    focusSection(tab, anchors[tab] || 'profile-overview');
  };


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
            // The counsellor portal only owns the early stages. Once the
            // student crosses into Documentation/Application territory, stay
            // in a real counsellor section instead of opening a blank route.
            const counsellorRoutes = new Set([
              'students',
              'leads',
              'counselling',
              'enrolment',
              'university-shortlisting',
              'student-approval',
            ]);
            const targetRoute = counsellorRoutes.has(next.route) ? next.route : 'students';
            onNavigate(`${targetRoute}?id=${activeStudent.studentId}`);
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

      {/* Status change confirmation — required from every update entry point */}
      {pendingProfileStatus && activeStudent && (
        <ActionConfirmModal
          isOpen
          onClose={() => setPendingProfileStatus(null)}
          onConfirm={() => {
            const next = pendingProfileStatus;
            setPendingProfileStatus(null);
            if (next) applyProfileStatusChange(next);
          }}
          title={`Change status to "${pendingProfileStatus}"?`}
          studentName={activeStudent.name}
          studentId={activeStudent.studentId}
          studentAvatar={activeStudent.avatar}
          country={activeStudent.country}
          currentStageName={activeStudent.overallStatus}
          targetStageName={pendingProfileStatus}
          description={`Are you sure you want to change ${activeStudent.name}'s status from "${activeStudent.overallStatus}" to "${pendingProfileStatus}"? This will update the student's SQLite profile.`}
          confirmLabel={`Yes, change to ${pendingProfileStatus}`}
          variant={
            pendingProfileStatus === 'Enrolled'
              ? 'success'
              : pendingProfileStatus === 'Drop' || pendingProfileStatus === 'Lost'
                ? 'danger'
                : pendingProfileStatus === 'On Hold'
                  ? 'warning'
                  : 'primary'
          }
        />
      )}

      {/* SQLite-backed section editor (personal, academic, payment, docs, etc.) */}
      <ProfileEditModal
        isOpen={Boolean(editConfig)}
        title={editConfig?.title || 'Edit Profile Section'}
        subtitle={editConfig?.subtitle}
        studentName={activeStudent?.name}
        fields={editConfig?.fields || []}
        initialValues={editConfig?.values || {}}
        onClose={() => setEditConfig(null)}
        onSave={handleSaveSection}
      />

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
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-meta-sheet-modal', { detail: { viewOnly: true } }))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 shadow-2xs transition-all cursor-pointer"
                title="View Meta Ads inquiries from Google Sheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Meta Ads Leads (View Only)</span>
              </button>
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
              <div className="text-[20px] font-bold text-[#101d37] mt-0.5">{enrolledRoster.length}</div>
              <span className="text-[10px] text-[#15803d] font-semibold mt-0.5 inline-block">
                ● {enrolledRoster.filter((st) => st.overallStatus !== 'Lost').length} Active
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
                            <StudentAvatar
                              name={st.name}
                              src={st.avatar}
                              className="w-8 h-8 aspect-square rounded-full object-cover border border-slate-200 shrink-0 text-[10px]"
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
                              {countryFlag(st.country)}
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
                            <span>View</span>
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
                  Showing <span className="font-bold text-[#087cf5]">{filteredStudents.length}</span> of {enrolledRoster.length} enrolled students
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
                  <StudentAvatar
                    name={selectedStudent.name}
                    src={selectedStudent.avatar}
                    className="w-14 h-14 aspect-square rounded-full object-cover border-2 border-slate-200 shadow-xs shrink-0 text-base"
                  />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h1 className="text-[17px] font-bold text-[#101d37] leading-tight">
                      {rawProfile?.name || selectedStudent.name}
                    </h1>
                    <span className="px-2 py-0.2 rounded-full bg-[#15803d] text-white text-[10.5px] font-bold leading-normal">
                      Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#64748b]">Student ID:</span>
                      <span className="font-medium text-[#101d37]">{rawProfile?.student_id || selectedStudent.studentId}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#64748b]">Counsellor:</span>
                      <span className="font-medium text-[#101d37]">{rawProfile?.counsellor_name || selectedStudent.counsellor}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#64748b]">Mobile:</span>
                      <span className="font-medium text-[#101d37]">{rawProfile?.phone || selectedStudent.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#64748b]">Email:</span>
                      <span className="font-medium text-[#101d37]">{rawProfile?.email || selectedStudent.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Block: Country & Course Details */}
              <div className="border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-4 space-y-0.5 text-[11px]">
                <div className="flex items-center gap-1.5 pb-0.5">
                  {/* Flag of Destination Country */}
                  <span className="text-base">
                    {countryFlag(rawProfile?.country || selectedStudent.country)}
                  </span>
                  <span className="font-bold text-[12.5px] text-[#101d37]">
                    {rawProfile?.country || selectedStudent.country}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#64748b]">Intake:</span>
                  <span className="font-medium text-[#101d37]">{rawProfile?.intake || selectedStudent.intake}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#64748b]">Course Level:</span>
                  <span className="font-medium text-[#101d37]">{rawProfile?.course_level || selectedStudent.courseLevel}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#64748b]">Preferred Course:</span>
                  <span className="font-medium text-[#101d37]">{rawProfile?.preferred_course || selectedStudent.preferredCourse}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#64748b]">Target University:</span>
                  <span className="font-medium text-[#101d37]">{rawProfile?.target_university || selectedStudent.targetUniversity}</span>
                </div>
              </div>

              {/* Right Block: Enrollment Date, Follow-up, Overall Status, Priority */}
              <div className="border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-4 flex flex-wrap items-center gap-2.5">
                {/* Enrollment Date Card */}
                <div className="space-y-1">
                  <div className="text-[10px] text-[#64748b] font-medium">Enrollment Date</div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] border border-[#e2e8f0] bg-white text-[11.5px] font-medium text-[#101d37]">
                    <Calendar className="w-3.5 h-3.5 text-[#64748b]" />
                    <span>{formatDbDate(rawProfile?.enrollment_date) !== '-' ? formatDbDate(rawProfile?.enrollment_date) : selectedStudent.enrollmentDate}</span>
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
                    <span>{rawProfile?.next_follow_up || selectedStudent.nextFollowUp}</span>
                  </button>
                </div>

                {/* Overall Status Dropdown — updates the SQLite profile only */}
                <div className="space-y-1">
                  <div className="text-[10px] text-[#64748b] font-medium">Overall Status</div>
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] font-semibold text-[11.5px] ${
                      rawProfile?.overall_status === 'On Hold' || rawProfile?.overall_status === 'Drop'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-[#e0f2fe] text-[#0284c7]'
                    }`}
                  >
                    <select
                      value={rawProfile?.overall_status || selectedStudent.overallStatus}
                      onChange={(e) => handleProfileStatusChange(e.target.value)}
                      disabled={statusSaving}
                      className={`bg-transparent outline-none text-[11.5px] font-semibold cursor-pointer disabled:opacity-60 ${
                        rawProfile?.overall_status === 'On Hold' || rawProfile?.overall_status === 'Drop'
                          ? 'text-rose-700'
                          : 'text-[#0284c7]'
                      }`}
                      title="Changing to Enrolled moves the student to Enrolled Students without advancing the pipeline stage"
                    >
                      {LEAD_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
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
              <div className="flex flex-wrap items-center justify-end gap-2">
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
            </div>
          )}

          {/* 2. Horizontal Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[12px] scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeSubTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => handleProfileTabClick(tab)}
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
          <div id="profile-overview" className="space-y-3">
            {/* ROW 1: 4 Cards (Personal Details, Academic Details, Program Preferences, Payment & Agreement) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 items-stretch">
              {/* Card 1: Personal Details */}
              <div id="profile-personal" className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold text-[#101d37] text-[12.5px]">
                      <FileText className="w-3.5 h-3.5 text-[#087cf5]" />
                      <span>Personal Details</span>
                    </div>
                    <button
                      onClick={openPersonalEdit}
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
                      <span className="font-medium text-[#101d37]">{rawProfile?.name || selectedStudent.name}</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 text-[#64748b] shrink-0">Date of Birth</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">{rawProfile?.dob || selectedStudent.dob}</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 text-[#64748b] shrink-0">Nationality</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">{rawProfile?.nationality || selectedStudent.nationality}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-[#64748b] shrink-0">Mobile</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37] flex items-center gap-1">
                        {rawProfile?.phone || selectedStudent.phone}
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
                      <span className="font-medium text-[#101d37] truncate">{rawProfile?.email || selectedStudent.email}</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 text-[#64748b] shrink-0">Address</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">{rawProfile?.address || selectedStudent.address}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-[#64748b] shrink-0">Passport</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span
                        className={`font-medium flex items-center gap-1 ${
                          passportDocument ? 'text-[#15803d]' : 'text-[#d97706]'
                        }`}
                      >
                        {passportStatus}
                        {passportDocument && <CheckCircle2 className="w-3.5 h-3.5 fill-[#15803d] text-white" />}
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
                      onClick={openAcademicEdit}
                      className="flex items-center gap-1 text-[11px] text-[#087cf5] hover:underline font-semibold"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="pt-2 space-y-1.5 text-[11px]">
                    <div className="flex">
                      <span className="w-32 text-[#64748b] shrink-0">10th Standard</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">
                        {rawAcademic.tenth_percentage || '-'}
                        {rawAcademic.tenth_board ? ` (${rawAcademic.tenth_board})` : ''}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-[#64748b] shrink-0">12th Standard</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">
                        {rawAcademic.twelfth_percentage || '-'}
                        {rawAcademic.twelfth_board ? ` (${rawAcademic.twelfth_board})` : ''}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-[#64748b] shrink-0">Highest Qualification</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">
                        {rawAcademic.bachelor_degree || '-'}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-[#64748b] shrink-0">University</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">
                        {rawAcademic.bachelor_university || '-'}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-[#64748b] shrink-0">Passing Year</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">
                        {rawAcademic.bachelor_passing_year || '-'}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-[#64748b] shrink-0">CGPA</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">
                        {rawAcademic.bachelor_cgpa || '-'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-32 text-[#64748b] shrink-0">English Test</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">
                        {rawProfile?.test_scores?.[0]
                          ? `${rawProfile.test_scores[0].test_type} ${rawProfile.test_scores[0].overall_score}`
                          : selectedStudent.academic.englishTest}
                      </span>
                      <button
                        onClick={openTestScoreEdit}
                        className="ml-1 text-[#087cf5] hover:underline"
                        title="Edit test scores in SQLite"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-[#64748b] shrink-0">Work Experience</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">
                        {rawAcademic.work_experience || '-'}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-[#64748b] shrink-0">Backlogs / Gaps</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">
                        {rawAcademic.backlogs || '0'} / {rawAcademic.education_gaps || 'None'}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-[#64748b] shrink-0">Budget</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">
                        {rawProfile?.budget || selectedStudent.academic.budget}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Program Preferences */}
              <div id="profile-program" className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold text-[#101d37] text-[12.5px]">
                      <MapPin className="w-3.5 h-3.5 text-[#087cf5]" />
                      <span>Program Preferences</span>
                    </div>
                    <button
                      onClick={openProgramEdit}
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
                      <span className="font-medium text-[#101d37]">{rawProfile?.country || selectedStudent.country}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-[#64748b] shrink-0">Course Level</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">{rawProfile?.course_level || selectedStudent.courseLevel}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-[#64748b] shrink-0">Preferred Course</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">{rawProfile?.preferred_course || selectedStudent.preferredCourse}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-[#64748b] shrink-0">Alternative Courses</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <div className="font-medium text-[#101d37]">
                        {alternativeCourseList.length > 0
                          ? alternativeCourseList.map((c, i) => <div key={i}>{c}</div>)
                          : '-'}
                      </div>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-[#64748b] shrink-0">Target University</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">{rawProfile?.target_university || selectedStudent.targetUniversity}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-[#64748b] shrink-0">Target Intake</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">{rawProfile?.intake || selectedStudent.intake}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-[#64748b] shrink-0">Budget</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">{rawProfile?.budget || '-'}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="w-28 text-[#64748b] shrink-0">Notes</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37] flex-1">
                        {(rawCounselling as any).notes || '-'}
                      </span>
                      <button
                        onClick={openCounsellingNotesEdit}
                        className="ml-1 text-[#087cf5] hover:underline"
                        title="Edit counselling notes in SQLite"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Payment & Agreement */}
              <div id="profile-payment" className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold text-[#101d37] text-[12.5px]">
                      <CreditCard className="w-3.5 h-3.5 text-[#087cf5]" />
                      <span>Payment & Agreement</span>
                    </div>
                    <button
                      onClick={openPaymentEdit}
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
                        {rawApproval.service_package || 'Standard Counselling Package'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-28 text-[#64748b] shrink-0">Agreement Status</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span
                        className={`px-1.5 py-0.2 rounded font-semibold text-[10px] ${
                          rawApproval.agreement_signed || /signed/i.test(rawApproval.agreement_status || '')
                            ? 'bg-[#dcfce7] text-[#15803d]'
                            : 'bg-[#fef3c7] text-[#d97706]'
                        }`}
                      >
                        {rawApproval.agreement_status || (rawApproval.agreement_signed ? 'Signed' : 'Pending')}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-[#64748b] shrink-0">Total Fee</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-bold text-[#101d37]">
                        {rawApproval.total_fee || '-'}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-[#64748b] shrink-0">Amount Paid</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-bold text-[#15803d]">
                        {rawApproval.amount_paid || '-'}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-[#64748b] shrink-0">Balance</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-bold text-[#dc2626]">
                        {rawApproval.balance || '-'}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-[#64748b] shrink-0">Payment Schedule</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <div className="font-medium text-[#101d37] space-y-0.5">
                        {paymentSchedule.length > 0
                          ? paymentSchedule.map((item, idx) => <div key={idx}>{item}</div>)
                          : '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2: 2 Cards (University Applications & Offer Letters) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
              {/* Left Table: University Applications (7 cols) */}
              <div id="profile-applications" className="lg:col-span-7 bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold text-[#101d37] text-[12.5px]">
                      <GraduationCap className="w-3.5 h-3.5 text-[#087cf5]" />
                      <span>University Applications</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => focusSection('Applications', 'profile-applications')}
                        className="text-[11px] text-[#087cf5] hover:underline font-semibold"
                      >
                        View All
                      </button>
                      <button
                        onClick={() => openApplicationEdit()}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-[5px] bg-[#087cf5] hover:bg-[#006ee6] text-white text-[11px] font-semibold transition-colors shadow-xs"
                      >
                        <Plus className="w-3 h-3 stroke-[2.5]" />
                        <span>Add Application</span>
                      </button>
                    </div>
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
                        {displayApplications.length > 0 ? (
                          displayApplications.map((app, idx) => (
                            <tr key={app.id || idx} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-2 px-2 text-[#64748b]">{idx + 1}</td>
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
                                  onClick={() =>
                                    openApplicationEdit({
                                      id: app.id,
                                      university: app.university,
                                      program: app.program,
                                      date: app.date,
                                      status: app.status,
                                    })
                                  }
                                  className="text-[#087cf5] hover:underline font-semibold"
                                >
                                  Edit
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-4 text-center text-[#64748b]">
                              No applications in university_applications yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Table: Offer Letters (5 cols) */}
              <div id="profile-offers" className="lg:col-span-5 bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold text-[#101d37] text-[12.5px]">
                      <Mail className="w-3.5 h-3.5 text-[#087cf5]" />
                      <span>Offer Letters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openOfferEdit()}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#087cf5] hover:bg-[#006ee6] text-white text-[10.5px] font-semibold transition-colors"
                      >
                        <Plus className="w-3 h-3 stroke-[2.5]" />
                        <span>Add Offer</span>
                      </button>
                    </div>
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
                        {displayOffers.length > 0 ? (
                          displayOffers.map((off, idx) => (
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
                                  onClick={() =>
                                    openOfferEdit({
                                      id: off.id,
                                      university: off.university,
                                      date: off.date,
                                      type: off.type,
                                      conditions: off.conditions,
                                      status: off.status,
                                    })
                                  }
                                  className="text-[#087cf5] hover:underline font-semibold"
                                >
                                  Edit
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-4 text-center text-[#64748b]">
                              No offers in offer_letters yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 3: 4 Columns (Document Checklist, Scholarship & Pre-Enrolment, DoV & Visa, Recent Activities / Timeline) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 items-start">
              {/* Col 1: Document Checklist */}
              <div id="profile-documents" className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 font-bold text-[#101d37] text-[12.5px]">
                    <FileText className="w-3.5 h-3.5 text-[#087cf5]" />
                    <span>Document Checklist</span>
                  </div>
                  <button
                    onClick={() => focusSection('Documents', 'profile-documents')}
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
                      {displayDocuments.length > 0 ? (
                        displayDocuments.map((row, idx) => (
                          <tr key={row.id || idx} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-1.5 px-1.5 font-medium text-[#101d37]">{row.name}</td>
                            <td className="py-1.5 px-1.5">
                              <span
                                className={`px-1.5 py-0.2 rounded font-semibold text-[10px] ${
                                  /verified|approved|received/i.test(row.status)
                                    ? 'bg-[#dcfce7] text-[#15803d]'
                                    : /re-upload|pending/i.test(row.status)
                                      ? 'bg-[#fef3c7] text-[#d97706]'
                                      : 'bg-[#f1f5f9] text-[#64748b]'
                                }`}
                              >
                                {row.status}
                              </span>
                            </td>
                            <td className="py-1.5 px-1.5 text-[#52627a]">{row.date}</td>
                            <td className="py-1.5 px-1.5 text-right">
                              <button
                                onClick={() => openDocumentEdit(row)}
                                className="text-[#087cf5] hover:underline font-semibold"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-[#64748b]">
                            No documents in documents_checklist yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Col 2: Stacked Cards (Scholarship Process & Pre-Enrolment Universitaly) */}
              <div className="space-y-3">
                {/* Top: Scholarship Process */}
                <div id="profile-scholarship" className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold text-[#101d37] text-[12.5px]">
                      <Lightbulb className="w-3.5 h-3.5 text-[#087cf5]" />
                      <span>Scholarship Process</span>
                    </div>
                    <button
                      onClick={openScholarshipEdit}
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
                        {rawScholarship.scholarship_name ? (
                          <tr className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-1.5 px-1.5 font-medium text-[#101d37]">{rawScholarship.scholarship_name}</td>
                            <td className="py-1.5 px-1.5 text-[#52627a]">
                              {(rawScholarship as any).application_deadline || '-'}
                            </td>
                            <td className="py-1.5 px-1.5 text-right">
                              <span className="px-1.5 py-0.2 rounded font-semibold text-[10px] bg-[#fef3c7] text-[#d97706]">
                                {rawScholarship.status || 'Not Started'}
                              </span>
                            </td>
                          </tr>
                        ) : (
                          <tr>
                            <td colSpan={3} className="py-4 text-center text-[#64748b]">
                              No scholarship row in scholarships table yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bottom: Pre-Enrolment (Universitaly) */}
                <div id="profile-preenrolment" className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold text-[#101d37] text-[12.5px]">
                      <Monitor className="w-3.5 h-3.5 text-[#087cf5]" />
                      <span>Pre-Enrolment (Universitaly)</span>
                    </div>
                    <button
                      onClick={openPreEnrolmentEdit}
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
                        {rawPreEnrolment.universitaly_summary_code || rawPreEnrolment.status ? (
                          <tr className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-1.5 px-1.5 font-medium text-[#101d37]">
                              {rawPreEnrolment.universitaly_summary_code
                                ? `Summary ${rawPreEnrolment.universitaly_summary_code}`
                                : 'Universitaly Verification'}
                            </td>
                            <td className="py-1.5 px-1.5">
                              <span
                                className={`px-1.5 py-0.2 rounded font-semibold text-[10px] ${
                                  /validated|issued|complete/i.test(rawPreEnrolment.status || '')
                                    ? 'bg-[#dcfce7] text-[#15803d]'
                                    : 'bg-[#fef3c7] text-[#d97706]'
                                }`}
                              >
                                {rawPreEnrolment.status || 'Not Started'}
                              </span>
                            </td>
                            <td className="py-1.5 px-1.5 text-[#52627a]">
                              {formatDbDate((rawPreEnrolment as any).updated_at)}
                            </td>
                            <td className="py-1.5 px-1.5 text-right">
                              <button
                                onClick={openPreEnrolmentEdit}
                                className="text-[#087cf5] hover:underline font-semibold"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-[#64748b]">
                              No pre-enrolment row in pre_enrolments yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Col 3: Stacked Cards (DoV / CIMEA & Visa Process) */}
              <div className="space-y-3">
                {/* Top: DoV / CIMEA */}
                <div id="profile-dov" className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold text-[#101d37] text-[12.5px]">
                      <FileText className="w-3.5 h-3.5 text-[#087cf5]" />
                      <span>DoV / CIMEA</span>
                    </div>
                    <button
                      onClick={openDovEdit}
                      className="text-[11px] text-[#087cf5] hover:underline font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  <div className="pt-2 space-y-1.5 text-[11px]">
                    <div className="flex items-center">
                      <span className="w-36 text-[#64748b] shrink-0">Process Type</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">{rawLegalization.process_type || '-'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-36 text-[#64748b] shrink-0">Status</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="px-1.5 py-0.2 rounded font-semibold text-[10px] bg-[#f1f5f9] text-[#64748b]">
                        {rawLegalization.status || 'Not Started'}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-36 text-[#64748b] shrink-0">CIMEA / DoV Ref</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">{rawLegalization.cimea_diploma_ref || '-'}</span>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={openDovEdit}
                        className="w-full py-1.5 rounded-[5px] bg-[#087cf5] hover:bg-[#006ee6] text-white text-[11.5px] font-semibold transition-colors shadow-xs"
                      >
                        {rawLegalization.status && rawLegalization.status !== 'Not Started'
                          ? 'Manage DoV Process'
                          : 'Start DoV Process'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom: Visa Process */}
                <div id="profile-visa" className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 font-bold text-[#101d37] text-[12.5px]">
                      <Plane className="w-3.5 h-3.5 text-[#087cf5]" />
                      <span>Visa Process</span>
                    </div>
                    <button
                      onClick={openVisaEdit}
                      className="text-[11px] text-[#087cf5] hover:underline font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  <div className="pt-2 space-y-1.5 text-[11px]">
                    <div className="flex items-center">
                      <span className="w-32 text-[#64748b] shrink-0">Appointment Date</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="text-[#64748b]">{rawVisa.appointment_date || '-'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-32 text-[#64748b] shrink-0">Application Status</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="px-1.5 py-0.2 rounded font-semibold text-[10px] bg-[#f1f5f9] text-[#64748b]">
                        {rawVisa.decision || 'Not Started'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-32 text-[#64748b] shrink-0">Visa Type</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="font-medium text-[#101d37]">{rawVisa.visa_type || '-'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-32 text-[#64748b] shrink-0">VFS Reference</span>
                      <span className="text-[#64748b] mr-1">:</span>
                      <span className="text-[#64748b]">{rawVisa.vfs_reference_no || '-'}</span>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={openVisaEdit}
                        className="w-full py-1.5 rounded-[5px] bg-[#087cf5] hover:bg-[#006ee6] text-white text-[11.5px] font-semibold transition-colors shadow-xs"
                      >
                        {rawVisa.decision && rawVisa.decision !== 'Not Started'
                          ? 'Manage Visa Process'
                          : 'Start Visa Process'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Col 4: Recent Activities / Timeline */}
              <div id="profile-timeline" className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 font-bold text-[#101d37] text-[12.5px]">
                    <Clock className="w-3.5 h-3.5 text-[#087cf5]" />
                    <span>Recent Activities & Audit Trail</span>
                  </div>
                  <button
                    onClick={() => onNavigate && onNavigate('history')}
                    className="text-[11px] text-[#087cf5] hover:underline font-semibold"
                  >
                    View All in History →
                  </button>
                </div>

                <div className="pt-2 space-y-2 text-[11px] max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
                  {profileAudits.length > 0 ? (
                    profileAudits.map((audit) => (
                      <div key={audit.id} className="p-1.5 rounded bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                        <div className="flex items-center justify-between gap-1 text-[10px] text-[#64748b]">
                          <span className="font-semibold text-[#087cf5]">
                            {audit.field ? audit.field.replace(/_/g, ' ') : audit.action}
                          </span>
                          <span>{audit.createdAt ? audit.createdAt.slice(0, 16) : ''}</span>
                        </div>
                        <div className="text-[#101d37] font-medium mt-0.5 leading-snug">
                          {audit.action === 'updated' ? (
                            <span>
                              Changed from <span className="line-through text-rose-500">{audit.oldValue || '(empty)'}</span> to <span className="text-emerald-600 font-semibold">{audit.newValue || '(empty)'}</span>
                            </span>
                          ) : audit.action === 'stage-changed' ? (
                            <span>
                              Stage/Status moved to <span className="text-violet-700 font-semibold">{audit.newValue}</span>
                            </span>
                          ) : (
                            <span>{audit.newValue || audit.action}</span>
                          )}
                        </div>
                        <div className="text-[9.5px] text-[#8496b0] mt-0.5 flex items-center justify-between">
                          <span>by {audit.actorName || 'Staff'}</span>
                          <span className="bg-slate-200/70 text-slate-700 px-1 rounded text-[9px]">{audit.portal || 'CRM'}</span>
                        </div>
                      </div>
                    ))
                  ) : displayTimeline.length > 0 ? (
                    displayTimeline.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className={`w-2 h-2 rounded-full ${item.dotColor} mt-1 shrink-0`} />
                        <div className="leading-snug">
                          <span className="text-[#64748b]">{item.time} : </span>
                          <span className="font-medium text-[#101d37]">{item.text} </span>
                          <span className="text-[#64748b]">(by: {item.team})</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-[#64748b] text-center py-4">No audit changes or activities recorded yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
