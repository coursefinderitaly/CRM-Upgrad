import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Lead } from '../types/crm';
import { INITIAL_STUDENTS, StudentRecord } from '../services/studentsData';

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
    id: 'documentation',
    label: 'Documentation Completed',
    stageNumber: 2,
    route: 'documentation',
    status: 'Documentation',
    currentStage: 'Documentation Verification In Progress',
    badgeClass: 'bg-violet-50 text-violet-700 border-violet-200',
    dotClass: 'bg-violet-500',
  },
  {
    id: 'shortlisting',
    label: 'University Shortlisting',
    stageNumber: 3,
    route: 'university-shortlisting',
    status: 'Shortlisting',
    currentStage: 'University Shortlisting In Progress',
    badgeClass: 'bg-blue-50 text-[#087cf5] border-blue-200',
    dotClass: 'bg-[#087cf5]',
  },
  {
    id: 'student-approval',
    label: 'Student Approval',
    stageNumber: 4,
    route: 'student-approval',
    status: 'Approval',
    currentStage: 'Student Approval In Progress',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dotClass: 'bg-indigo-500',
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

/** Stage for a student currently sitting inside the active pipeline (undefined for later stages like Offers/Visa) */
export const getPipelineStageForStudent = (student: StudentRecord): PipelineStage | undefined =>
  PIPELINE_STAGES.find((s) => s.stageNumber === student.stageNumber);

/** Next pipeline stage after the one the student is on, if any */
export const getNextStageForStudent = (student: StudentRecord): PipelineStage | undefined => {
  const idx = PIPELINE_STAGES.findIndex((s) => s.stageNumber === student.stageNumber);
  if (idx < 0) return undefined;
  return PIPELINE_STAGES[idx + 1];
};

/** Students visible inside a given section workspace */
export const isStudentInSection = (student: StudentRecord, section: PipelineStageId): boolean => {
  switch (section) {
    case 'counselling':
      return true;
    case 'documentation':
      return student.stageNumber >= 2;
    case 'shortlisting':
      return student.stageNumber >= 3;
    case 'student-approval':
      return student.stageNumber >= 3;
    case 'applications':
      return student.stageNumber >= 4;
    case 'offer-letters':
      return student.stageNumber >= 5 || (student.offers && student.offers.length > 0);
    case 'final-university':
      return student.stageNumber >= 6 || (student.offers && student.offers.length > 0);
    case 'scholarship':
      return student.stageNumber >= 7;
    case 'pre-enrolment':
      return student.stageNumber >= 8;
    case 'dov-cimea':
      return student.stageNumber >= 8;
    case 'visa-process':
      return student.stageNumber >= 8;
    case 'pre-departure':
      return student.stageNumber >= 9;
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
  avatar: lead.avatarUrl || '/avatars/row_rahul.png',
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
  documents: DEFAULT_DOCUMENTS.map((name) => ({ name, status: 'Pending', date: '-' })),
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
  advanceStudentStage: (studentId: string) => PipelineStage | null;
  moveStudentToStage: (studentId: string, stageId: PipelineStageId) => void;
  getSectionStudents: (section: PipelineStageId) => StudentRecord[];
  getStudentById: (studentId: string) => StudentRecord | undefined;
  resetWorkflow: () => void;
}

const WorkflowContext = createContext<WorkflowContextValue | undefined>(undefined);

const STORAGE_KEY = 'crm-workflow-v6';

const loadInitialStudents = (): StudentRecord[] => {
  if (typeof window === 'undefined') return INITIAL_STUDENTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STUDENTS;
    const stored = JSON.parse(raw) as StudentRecord[];
    if (!Array.isArray(stored) || stored.length === 0) return INITIAL_STUDENTS;
    const byId = new Map<string, StudentRecord>();
    INITIAL_STUDENTS.forEach((s) => byId.set(s.id, s));
    // Persisted records always win over the seed, so stage moves survive reloads
    stored.forEach((s) => byId.set(s.id, s));
    return Array.from(byId.values());
  } catch {
    return INITIAL_STUDENTS;
  }
};

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<StudentRecord[]>(loadInitialStudents);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch {
      // Storage unavailable — workflow keeps working in-memory for the session.
    }
  }, [students]);

  const convertLeadToStudent = useCallback(
    (lead: Lead, stageId: PipelineStageId = 'counselling'): StudentRecord => {
      const stage = getStageById(stageId);
      const existing = students.find(
        (s) => s.leadId === lead.id || (lead.email && s.email.toLowerCase() === lead.email.toLowerCase())
      );
      if (existing) {
        // Idempotent conversion: keep the record, but surface it at the requested stage if it is still parked earlier.
        if (existing.stageNumber < stage.stageNumber) {
          setStudents((prev) =>
            prev.map((s) => (s.id === existing.id ? applyStage(s, stage, 'Re-routed from lead conversion') : s))
          );
          return applyStage(existing, stage, 'Re-routed from lead conversion');
        }
        return existing;
      }

      const sequence =
        students.filter((s) => countryPrefix(s.country) === countryPrefix(lead.countryInterest)).length + 1;
      const newStudent = buildStudentFromLead(lead, stage, sequence);
      setStudents((prev) => [newStudent, ...prev]);
      return newStudent;
    },
    [students]
  );

  const advanceStudentStage = useCallback(
    (studentId: string): PipelineStage | null => {
      // Accepts either the internal record id or the human-readable studentId (e.g. ITA-2027-001)
      const student = students.find((s) => s.id === studentId || s.studentId === studentId);
      if (!student) return null;
      const next = getNextStageForStudent(student);
      if (!next) return null;
      setStudents((prev) => prev.map((s) => (s.id === student.id ? applyStage(s, next) : s)));
      return next;
    },
    [students]
  );

  const moveStudentToStage = useCallback(
    (studentId: string, stageId: PipelineStageId) => {
      const stage = getStageById(stageId);
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId || s.studentId === studentId ? applyStage(s, stage) : s))
      );
    },
    []
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
    setStudents(INITIAL_STUDENTS);
  }, []);

  const value = useMemo<WorkflowContextValue>(
    () => ({
      students,
      convertLeadToStudent,
      advanceStudentStage,
      moveStudentToStage,
      getSectionStudents,
      getStudentById,
      resetWorkflow,
    }),
    [students, convertLeadToStudent, advanceStudentStage, moveStudentToStage, getSectionStudents, getStudentById, resetWorkflow]
  );

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>;
};

export const useWorkflow = (): WorkflowContextValue => {
  const ctx = useContext(WorkflowContext);
  if (!ctx) throw new Error('useWorkflow must be used inside <WorkflowProvider>');
  return ctx;
};
