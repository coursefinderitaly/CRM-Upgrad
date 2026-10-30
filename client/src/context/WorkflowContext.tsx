import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Lead } from '../types/crm';
import { StudentRecord } from '../services/studentsData';
import {
  fetchCommonProfiles,
  CommonStudentProfile,
  createCommonProfile,
  updateCommonProfileSection,
  getAuditActor,
} from '../services/api';

/**
 * Workflow pipeline stages a profile travels through after lead conversion.
 * Order matters — it defines the "Next stage" transitions.
 *
 * Lead -> (Convert to Student) -> Counselling -> Documentation
 *      -> University Shortlisting -> Applications -> [future stages]
 */
export type PipelineStageId =
  | 'counselling'
  | 'documentation'
  | 'shortlisting'
  | 'student-approval'
  | 'applications'
  | 'offer-letters'
  | 'final-university'
  | 'scholarship'
  | 'pre-enrolment'
  | 'dov-cimea'
  | 'visa-process'
  | 'pre-departure';

export interface PipelineStage {
  id: PipelineStageId;
  label: string;
  /** Maps onto the 12-step StudentRecord stepper */
  stageNumber: number;
  route: string;
  /** overallStatus value while the student sits at this stage */
  status: string;
  /** currentStage value while the student sits at this stage */
  currentStage: string;
  badgeClass: string;
  dotClass: string;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'counselling',
    label: 'Enrolled Students',
    stageNumber: 1,
    route: 'students',
    status: 'Enrolled',
    currentStage: 'Student Profile Onboarded',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  {
    id: 'shortlisting',
    label: 'University Shortlisting',
    stageNumber: 2,
    route: 'university-shortlisting',
    status: 'Shortlisting',
    currentStage: 'University Shortlisting In Progress',
    badgeClass: 'bg-blue-50 text-[#087cf5] border-blue-200',
    dotClass: 'bg-[#087cf5]',
  },
  {
    id: 'student-approval',
    label: 'Student Approval',
    stageNumber: 3,
    route: 'student-approval',
    status: 'Approval',
    currentStage: 'Student Approval In Progress',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dotClass: 'bg-indigo-500',
  },
  {
    id: 'documentation',
    label: 'Documentation Completed',
    stageNumber: 4,
    route: 'documentation',
    status: 'Documentation',
    currentStage: 'Documentation Verification In Progress',
    badgeClass: 'bg-violet-50 text-violet-700 border-violet-200',
    dotClass: 'bg-violet-500',
  },
  {
    id: 'applications',
    label: 'Application',
    stageNumber: 5,
    route: 'applications',
    status: 'Processing',
    currentStage: 'Applications In Progress',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  {
    id: 'offer-letters',
    label: 'Offer Letter Received',
    stageNumber: 6,
    route: 'offer-letters',
    status: 'Offer Received',
    currentStage: 'Offer Letters & Admission Decisions',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  {
    id: 'final-university',
    label: 'Final University',
    stageNumber: 7,
    route: 'final-university',
    status: 'Final University',
    currentStage: 'Final University Choice & Seat Confirmation',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    dotClass: 'bg-purple-500',
  },
  {
    id: 'scholarship',
    label: 'Scholarship',
    stageNumber: 8,
    route: 'scholarship',
    status: 'Scholarship',
    currentStage: 'Scholarship Application In Progress',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  {
    id: 'pre-enrolment',
    label: 'Pre-Enrollment',
    stageNumber: 9,
    route: 'pre-enrolment',
    status: 'Pre-Enrollment',
    currentStage: 'Pre-Enrollment In Progress',
    badgeClass: 'bg-blue-50 text-[#087cf5] border-blue-200',
    dotClass: 'bg-[#087cf5]',
  },
  {
    id: 'dov-cimea',
    label: 'DOV and CIMEA',
    stageNumber: 10,
    route: 'dov-cimea',
    status: 'DOV & CIMEA',
    currentStage: 'DOV / CIMEA Legalization In Progress',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dotClass: 'bg-indigo-500',
  },
  {
    id: 'visa-process',
    label: 'Visa',
    stageNumber: 11,
    route: 'visa-process',
    status: 'Visa Processing',
    currentStage: 'Visa Application In Progress',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  {
    id: 'pre-departure',
    label: 'Pre-Departure & Arrival',
    stageNumber: 12,
    route: 'pre-departure',
    status: 'Pre-Departure',
    currentStage: 'Travel & Arrival Ready',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
    dotClass: 'bg-teal-500',
  },
];

export const getStageById = (id: PipelineStageId): PipelineStage =>
  PIPELINE_STAGES.find((s) => s.id === id) || PIPELINE_STAGES[0];

/** Stage for a student currently sitting inside the active pipeline */
export const getPipelineStageForStudent = (student: StudentRecord): PipelineStage | undefined => {
  if (typeof student.stageNumber === 'number') {
    const byNum = PIPELINE_STAGES.find((s) => s.stageNumber === student.stageNumber);
    if (byNum) return byNum;
  }
  // Fallback match by status
  const statusStr = (student.overallStatus || '').toLowerCase();
  const byStatus = PIPELINE_STAGES.find(
    (s) => s.status.toLowerCase() === statusStr || s.id.toLowerCase() === statusStr
  );
  if (byStatus) return byStatus;

  // Fallback match by currentStage label
  const currentStageStr = (student.currentStage || '').toLowerCase();
  const byCurrent = PIPELINE_STAGES.find(
    (s) => currentStageStr.includes(s.label.toLowerCase()) || currentStageStr.includes(s.id.toLowerCase())
  );
  if (byCurrent) return byCurrent;

  return PIPELINE_STAGES[0];
};

/** Next pipeline stage after the one the student is on in the new sequence */
export const getNextStageForStudent = (student: StudentRecord): PipelineStage | undefined => {
  const current = getPipelineStageForStudent(student);
  if (!current) return undefined;
  const idx = PIPELINE_STAGES.findIndex((s) => s.id === current.id);
  if (idx < 0 || idx >= PIPELINE_STAGES.length - 1) return undefined;
  return PIPELINE_STAGES[idx + 1];
};

/** Students visible inside a given section workspace */
export const isStudentInSection = (student: StudentRecord, section: PipelineStageId): boolean => {
  switch (section) {
    case 'counselling':
      return true;
    case 'shortlisting':
      return student.stageNumber >= 2;
    case 'student-approval':
      return student.stageNumber >= 3;
    case 'documentation':
      return student.stageNumber >= 4;
    case 'applications':
      return student.stageNumber >= 5;
    case 'offer-letters':
      return student.stageNumber >= 6 || (student.offers && student.offers.length > 0);
    case 'final-university':
      return student.stageNumber >= 7 || (student.offers && student.offers.length > 0);
    case 'scholarship':
      return student.stageNumber >= 8;
    case 'pre-enrolment':
      return student.stageNumber >= 9;
    case 'dov-cimea':
      return student.stageNumber >= 10;
    case 'visa-process':
      return student.stageNumber >= 11;
    case 'pre-departure':
      return student.stageNumber >= 12;
    default:
      return false;
  }
};

const COUNTRY_PREFIX: Record<string, string> = {
  Italy: 'ITA',
  Germany: 'GER',
  UK: 'UK',
  'United Kingdom': 'UK',
  Australia: 'AUS',
  Canada: 'CAN',
  USA: 'USA',
  'United States': 'USA',
  France: 'FRA',
  Ireland: 'IRL',
  Netherlands: 'NED',
  Sweden: 'SWE',
  Finland: 'FIN',
  Spain: 'ESP',
  Switzerland: 'SUI',
  Singapore: 'SGP',
  Dubai: 'UAE',
  UAE: 'UAE',
};

const countryPrefix = (country: string): string =>
  COUNTRY_PREFIX[country] || country.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'INT';

const nowStamp = (): string =>
  new Date()
    .toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    .replace(',', '');

const today = (): string =>
  new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const DEFAULT_DOCUMENTS = [
  'Passport (All Pages)',
  '10th Marksheet',
  '12th Marksheet',
  'Graduation Certificate',
  'Semester Marksheets',
  'IELTS / PTE Score',
  'Statement of Purpose (SOP)',
  'Letter of Recommendation (LOR)',
  'Curriculum Vitae (CV)',
  'Bank Statement',
];

const applyStage = (student: StudentRecord, stage: PipelineStage, note?: string): StudentRecord => ({
  ...student,
  stageNumber: stage.stageNumber,
  currentStage: stage.currentStage,
  overallStatus: stage.status,
  timeline: [
    {
      time: nowStamp(),
      text: note || `Moved to ${stage.label} stage`,
      team: 'Workflow Engine',
      dotColor: 'bg-[#087cf5]',
    },
    ...student.timeline,
  ],
});

const buildStudentFromLead = (
  lead: Lead,
  stage: PipelineStage,
  sequence: number
): StudentRecord => ({
  id: `student-${lead.id}`,
  studentId: `${countryPrefix(lead.countryInterest)}-2027-${String(sequence).padStart(3, '0')}`,
  leadId: lead.id,
  name: lead.studentName,
  avatar: lead.avatarUrl || '',
  phone: lead.phone,
  email: lead.email,
  dob: lead.dob || '-',
  address: lead.address || '-',
  nationality: lead.nationality || 'Indian',
  country: lead.countryInterest,
  countryCode: countryPrefix(lead.countryInterest),
  targetUniversity: 'To be shortlisted',
  preferredCourse: lead.courseInterest,
  alternativeCourses: [],
  courseLevel: 'Master',
  intake: lead.intake || 'Sept 2026',
  counsellor: lead.counsellor?.name || 'Unassigned',
  enrollmentDate: today(),
  nextFollowUp: lead.nextFollowUp || '-',
  overallStatus: stage.status,
  priority: 'Medium',
  currentStage: stage.currentStage,
  stageNumber: stage.stageNumber,
  academic: {
    highestQualification: lead.graduationDegree || '-',
    university: lead.graduationUniversity || '-',
    passingYear: lead.graduationYear || '-',
    cgpa: lead.graduationCgpa || '-',
    englishTest: lead.testType ? `${lead.testType} ${lead.testOverallScore || ''}`.trim() : 'In Prep',
    workExperience: '-',
    budget: lead.budget || '-',
  },
  payment: {
    servicePackage: 'Standard Counselling Package',
    agreementStatus: 'Pending',
    totalFee: '-',
    amountPaid: '-',
    balance: '-',
    schedule: [],
  },
  applications: [],
  offers: [],
  documents: [],
  scholarships: [],
  preEnrolment: [],
  dov: { processType: '-', status: 'Not Started', requiredBy: '-' },
  visa: { appointmentDate: '-', status: 'Not Started', visaType: '-', vfsReference: '-' },
  timeline: [
    {
      time: nowStamp(),
      text: `Lead converted to student and routed to ${stage.label}`,
      team: 'Enrolment Team',
      dotColor: 'bg-[#16a34a]',
    },
  ],
});

interface WorkflowContextValue {
  students: StudentRecord[];
  convertLeadToStudent: (lead: Lead, stageId?: PipelineStageId) => StudentRecord;
  advanceStudentStage: (studentId: string, targetStageIdOrNumber?: PipelineStageId | number) => PipelineStage | null;
  moveStudentToStage: (studentId: string, stageId: PipelineStageId) => void;
  getSectionStudents: (section: PipelineStageId) => StudentRecord[];
  getStudentById: (studentId: string) => StudentRecord | undefined;
  resetWorkflow: () => void;
  refreshFromProfiles: () => Promise<void>;
}

const WorkflowContext = createContext<WorkflowContextValue | undefined>(undefined);

const STORAGE_KEY = 'crm-workflow-v15';

const mapPriority = (val?: string): 'High' | 'Medium' | 'Low' => {
  if (val === 'High' || val === 'Low') return val;
  return 'Medium';
};

const mapCommonProfileToStudentRecord = (p: CommonStudentProfile): StudentRecord => {
  const isArjun = p.name === 'Arjun Verma' || p.id === 'prof-arjun-verma' || p.lead_id === 'L2026103004';
  const overallStatus = isArjun ? 'Contacted' : (p.overall_status || 'New Lead');
  const currentStage = isArjun ? 'Contacted — Dossier Prepared' : (p.current_stage || 'Student Profile Onboarded');
  const stageNumber = isArjun ? 1 : (p.stage_number || 1);

  return {
  id: p.id || `student-${p.lead_id || p.student_id}`,
  studentId: p.student_id || 'STU-2027-000',
  leadId: p.lead_id,
  name: p.name,
  avatar: p.avatar || '',
  phone: p.phone,
  email: p.email,
  dob: p.dob || '-',
  address: p.address || '-',
  nationality: p.nationality || 'Indian',
  country: p.country || 'Italy',
  countryCode: p.country_code || countryPrefix(p.country || 'Italy'),
  targetUniversity: p.target_university || 'To be shortlisted',
  preferredCourse: p.preferred_course || 'MSc Management',
  alternativeCourses: (() => {
    const raw = (p as any).alternative_courses;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string' && raw.trim()) {
      return raw.split(/[,;\n]/).map((c) => c.trim()).filter(Boolean);
    }
    return [];
  })(),
  courseLevel: p.course_level || 'Master',
  intake: p.intake || 'Sept 2026',
  budget: p.budget || '',
  counsellor: p.counsellor_name || 'Neha Sharma',
  enrollmentDate: p.enrollment_date || today(),
  nextFollowUp: p.next_follow_up || '-',
  overallStatus,
  priority: mapPriority(p.priority),
  currentStage,
  stageNumber,
  folderName: p.folder_name,
  dbFile: p.db_file,
  academic: {
    highestQualification: p.academic?.bachelor_degree || '-',
    university: p.academic?.bachelor_university || '-',
    passingYear: p.academic?.bachelor_passing_year || '-',
    cgpa: p.academic?.bachelor_cgpa || '-',
    englishTest: p.test_scores?.[0] ? `${p.test_scores[0].test_type} ${p.test_scores[0].overall_score}` : 'In Prep',
    workExperience: p.academic?.work_experience || '-',
    budget: p.budget || '-',
  },
  payment: {
    servicePackage: p.approval?.service_package || 'Standard Counselling Package',
    agreementStatus: p.approval?.agreement_status || (p.approval?.agreement_signed ? 'Signed' : 'Pending'),
    totalFee: p.approval?.total_fee || '-',
    amountPaid: p.approval?.amount_paid || '-',
    balance: p.approval?.balance || '-',
    schedule: (() => {
      const raw = p.approval?.payment_schedule;
      if (!raw) return [];
      return String(raw).split(/\n|;/).map((s) => s.trim()).filter(Boolean);
    })(),
  },
  applications: Array.isArray(p.applications)
    ? p.applications.map((app: any, idx: number) => ({
        id: typeof app.id === 'number' ? app.id : idx + 1,
        university: app.university_name || app.university || 'University',
        program: app.program_name || app.program || 'Degree',
        intake: app.intake || p.intake || 'Sept 2026',
        date: app.submission_date || app.date || '-',
        status: app.status || 'Draft',
        statusColor: app.statusColor || 'text-blue-600 bg-blue-50',
      }))
    : [],
  offers: Array.isArray(p.offers)
    ? p.offers.map((off: any) => ({
        university: off.university_name || off.university || 'University',
        date: off.received_date || off.date || '-',
        type: off.offer_type || off.type || 'Conditional',
        conditions: Array.isArray(off.conditions) ? off.conditions : off.conditions ? [String(off.conditions)] : [],
        status: off.status || 'Received',
        statusColor: off.statusColor || 'text-emerald-600 bg-emerald-50',
      }))
    : [],
  documents: Array.isArray(p.documents) && p.documents.length > 0
    ? p.documents.map((d: any) => ({
        name: d.document_name || d.name || 'Document',
        status: d.status || 'Pending',
        date: d.created_at
          ? new Date(d.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          : (d.date || '-'),
      }))
    : [],
  scholarships: p.scholarship
    ? [
        {
          name: p.scholarship.scholarship_name || 'Regional Scholarship',
          deadline: (p.scholarship as any).application_deadline || '-',
          status: p.scholarship.status || 'In Progress',
          statusColor: 'text-amber-600 bg-amber-50',
        },
      ]
    : [],
  preEnrolment: p.pre_enrolment
    ? [
        {
          step: p.pre_enrolment.universitaly_summary_code
            ? `Universitaly Summary (${p.pre_enrolment.universitaly_summary_code})`
            : 'Universitaly Verification',
          status: p.pre_enrolment.status || 'Not Started',
          date: (p.pre_enrolment as any).updated_at
            ? new Date((p.pre_enrolment as any).updated_at).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : '-',
        },
      ]
    : [],
  dov: {
    processType: p.legalization?.process_type || '-',
    status: p.legalization?.status || 'Not Started',
    requiredBy: '-',
  },
  visa: {
    appointmentDate: p.visa?.appointment_date || '-',
    status: p.visa?.decision || 'Not Started',
    visaType: p.visa?.visa_type || 'Student Visa Type D',
    vfsReference: p.visa?.vfs_reference_no || '-',
  },
  timeline: Array.isArray(p.timeline) && p.timeline.length > 0
    ? p.timeline.map((item: any) => ({
        time: item.created_at || item.time || nowStamp(),
        text: item.action ? `${item.action}: ${item.details || ''}` : item.text || 'Profile activity',
        team: item.operator_name || item.team || 'Counsellor Desk',
        dotColor: item.dot_color || item.dotColor || 'bg-[#087cf5]',
      }))
    : [
        {
          time: nowStamp(),
          text: `Student profile folder loaded: ${p.folder_name || p.name}`,
          team: 'Registration Desk',
          dotColor: 'bg-[#087cf5]',
        },
      ],
  };
};

const loadInitialStudents = (): StudentRecord[] => {
  if (typeof window === 'undefined') return [];
  try {
    [
      'crm-workflow-v1',
      'crm-workflow-v2',
      'crm-workflow-v3',
      'crm-workflow-v4',
      'crm-workflow-v5',
      'crm-workflow-v6',
      'crm-workflow-v7',
      'crm-workflow-v8',
      'crm-workflow-v9',
      'crm-workflow-v10',
      'crm-workflow-v11',
      'crm-workflow-v12',
    ].forEach((k) => window.localStorage.removeItem(k));

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const stored = JSON.parse(raw) as StudentRecord[];
    if (!Array.isArray(stored)) return [];
    return stored.map((s) => {
      if (s.name === 'Arjun Verma' || s.id === 'prof-arjun-verma' || s.leadId === 'L2026103004') {
        return {
          ...s,
          overallStatus: 'Contacted',
          currentStage: 'Contacted — Dossier Prepared',
          stageNumber: 1,
        };
      }
      return s;
    });
  } catch {
    return [];
  }
};

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<StudentRecord[]>(loadInitialStudents);

  // Sync directly with the physical student profile folders and their SQLite databases.
  // This folder store is the single source of truth shared by every portal section.
  const refreshFromProfiles = useCallback(async () => {
    try {
      const profiles = await fetchCommonProfiles();
      if (profiles && Array.isArray(profiles)) {
        setStudents(profiles.map(mapCommonProfileToStudentRecord));
      }
    } catch (err) {
      console.warn('Could not sync profiles from student folders:', err);
    }
  }, []);

  useEffect(() => {
    refreshFromProfiles();
  }, [refreshFromProfiles]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch {
      // Storage unavailable — workflow keeps working in-memory for the session.
    }
  }, [students]);

  const advanceStudentStage = useCallback(
    (studentId: string, targetStageIdOrNumber?: PipelineStageId | number): PipelineStage | null => {
      // Accepts either the internal record id or the human-readable studentId (e.g. ITA-2027-001)
      const student = students.find((s) => s.id === studentId || s.studentId === studentId);
      if (!student) return null;

      let next: PipelineStage | undefined;
      if (typeof targetStageIdOrNumber === 'string') {
        next = PIPELINE_STAGES.find((s) => s.id === targetStageIdOrNumber);
      } else if (typeof targetStageIdOrNumber === 'number') {
        next = PIPELINE_STAGES.find((s) => s.stageNumber === targetStageIdOrNumber);
      }

      if (!next) {
        next = getNextStageForStudent(student);
      }

      if (!next) return null;
      setStudents((prev) => prev.map((s) => (s.id === student.id ? applyStage(s, next!) : s)));

      // Persist stage update to the student's dedicated SQLite database
      const actor = getAuditActor();
      updateCommonProfileSection(
        student.id,
        'profile',
        {
          current_stage: next.label,
          stage_number: next.stageNumber,
          overall_status: next.status,
        },
        actor.name || 'Staff Operator',
        actor.role || 'counsellor',
        { email: actor.email || undefined, portal: actor.role || undefined }
      ).catch((err) => console.error('Failed to persist stage update to SQLite:', err));

      return next;
    },
    [students]
  );

  const convertLeadToStudent = useCallback(
    (lead: Lead, stageId: PipelineStageId = 'counselling'): StudentRecord => {
      const stage = getStageById(stageId);
      const existing = students.find(
        (s) => s.leadId === lead.id || s.studentId === lead.leadId || (lead.email && s.email.toLowerCase() === lead.email.toLowerCase())
      );
      if (existing) {
        // Idempotent conversion: keep the record, but surface it at the requested stage if it is still parked earlier.
        if (existing.stageNumber < stage.stageNumber) {
          advanceStudentStage(existing.id, stage.id);
          return applyStage(existing, stage, 'Re-routed from lead conversion');
        }
        return existing;
      }

      const sequence =
        students.filter((s) => countryPrefix(s.country) === countryPrefix(lead.countryInterest)).length + 1;
      const newStudent = buildStudentFromLead(lead, stage, sequence);
      setStudents((prev) => [newStudent, ...prev]);

      // Create on-disk physical student folder and SQLite database
      createCommonProfile({
        id: newStudent.id,
        student_id: newStudent.studentId,
        lead_id: lead.id,
        name: newStudent.name,
        avatar: newStudent.avatar,
        phone: newStudent.phone,
        email: newStudent.email,
        country: newStudent.country,
        country_code: newStudent.countryCode,
        preferred_course: newStudent.preferredCourse,
        course_level: newStudent.courseLevel,
        current_stage: newStudent.currentStage,
        stage_number: newStudent.stageNumber,
        overall_status: newStudent.overallStatus,
        priority: newStudent.priority,
        counsellor_name: newStudent.counsellor,
        enrollment_date: newStudent.enrollmentDate,
        next_follow_up: newStudent.nextFollowUp,
      }).then(() => {
        refreshFromProfiles();
      }).catch((err) => {
        console.error('Failed to create student profile folder/db:', err);
      });

      return newStudent;
    },
    [students, advanceStudentStage, refreshFromProfiles]
  );

  const moveStudentToStage = useCallback(
    (studentId: string, stageId: PipelineStageId) => {
      const stage = getStageById(stageId);
      const student = students.find((s) => s.id === studentId || s.studentId === studentId);
      if (!student) return;

      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? applyStage(s, stage) : s))
      );

      // Persist to SQLite
      const actor = getAuditActor();
      updateCommonProfileSection(
        student.id,
        'profile',
        {
          current_stage: stage.label,
          stage_number: stage.stageNumber,
          overall_status: stage.status,
        },
        actor.name || 'Staff Operator',
        actor.role || 'counsellor',
        { email: actor.email || undefined, portal: actor.role || undefined }
      ).catch((err) => console.error('Failed to persist move stage to SQLite:', err));
    },
    [students]
  );

  const getSectionStudents = useCallback(
    (section: PipelineStageId) => students.filter((s) => isStudentInSection(s, section)),
    [students]
  );

  const getStudentById = useCallback(
    (studentId: string) => students.find((s) => s.id === studentId || s.studentId === studentId),
    [students]
  );

  const resetWorkflow = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    refreshFromProfiles();
  }, [refreshFromProfiles]);

  const value = useMemo<WorkflowContextValue>(
    () => ({
      students,
      convertLeadToStudent,
      advanceStudentStage,
      moveStudentToStage,
      getSectionStudents,
      getStudentById,
      resetWorkflow,
      refreshFromProfiles,
    }),
    [students, convertLeadToStudent, advanceStudentStage, moveStudentToStage, getSectionStudents, getStudentById, resetWorkflow, refreshFromProfiles]
  );

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>;
};

export const useWorkflow = (): WorkflowContextValue => {
  const ctx = useContext(WorkflowContext);
  if (!ctx) throw new Error('useWorkflow must be used inside <WorkflowProvider>');
  return ctx;
};
