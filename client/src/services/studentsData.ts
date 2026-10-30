// Central Enrolled Students Models and Dataset for CRM
import { CATALOG_STUDENTS } from './studentProfilesCatalog';

export interface StudentRecord {
  id: string;
  studentId: string;
  leadId?: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  dob: string;
  address: string;
  nationality: string;
  country: string;
  countryCode: string;
  targetUniversity: string;
  preferredCourse: string;
  alternativeCourses: string[];
  courseLevel: string;
  intake: string;
  budget?: string;
  counsellor: string;
  enrollmentDate: string;
  nextFollowUp: string;
  overallStatus: string;
  priority: 'High' | 'Medium' | 'Low';
  currentStage: string;
  stageNumber: number; // 1 to 12
  /** Physical SQLite file backing this profile */
  folderName?: string;
  dbFile?: string;
  academic: {
    highestQualification: string;
    university: string;
    passingYear: string;
    cgpa: string;
    englishTest: string;
    workExperience: string;
    budget: string;
  };
  payment: {
    servicePackage: string;
    agreementStatus: string;
    totalFee: string;
    amountPaid: string;
    balance: string;
    schedule: string[];
  };
  applications: Array<{
    id: number;
    university: string;
    program: string;
    intake: string;
    date: string;
    status: string;
    statusColor: string;
  }>;
  offers: Array<{
    university: string;
    date: string;
    type: string;
    conditions: string[];
    status: string;
    statusColor: string;
  }>;
  documents: Array<{
    name: string;
    status: string;
    date: string;
  }>;
  scholarships: Array<{
    name: string;
    deadline: string;
    status: string;
    statusColor: string;
  }>;
  preEnrolment: Array<{
    step: string;
    status: string;
    date: string;
  }>;
  dov: {
    processType: string;
    status: string;
    requiredBy: string;
  };
  visa: {
    appointmentDate: string;
    status: string;
    visaType: string;
    vfsReference: string;
  };
  timeline: Array<{
    time: string;
    text: string;
    team: string;
    dotColor: string;
  }>;
}

// Student Directory Dataset — strictly the 4 profiles matching the student_profile/ disk folders
export const INITIAL_STUDENTS: StudentRecord[] = CATALOG_STUDENTS as StudentRecord[];
