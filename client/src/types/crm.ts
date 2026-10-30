export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
}

export interface Lead {
  id: string;
  leadId: string;
  studentName: string;
  phone: string;
  email: string;
  dob?: string;
  address?: string;
  nationality?: string;
  countryInterest: string;
  courseInterest: string;
  intake?: string;
  budget?: string;
  universityType?: string;
  preferredCity?: string;
  leadSource: string;
  lastActivity: string;
  nextFollowUp: string;
  nextFollowUpTime?: string;
  nextFollowUpTask?: string;
  status: string; // "New Lead" | "Contacted" | "Interested" | "Counselling" | "Enrolled" | "Follow-up" | "On Hold" | "Lost" | "Transferred"
  avatarUrl?: string;
  counsellorId?: string;
  counsellor?: User;
  notes?: string;

  // Academic details
  tenthBoard?: string;
  tenthPercentage?: string;
  tenthYear?: string;
  twelfthBoard?: string;
  twelfthPercentage?: string;
  twelfthYear?: string;
  graduationDegree?: string;
  graduationUniversity?: string;
  graduationCgpa?: string;
  graduationYear?: string;
  backlogs?: string;
  educationGaps?: string;

  // Test scores
  testType?: string;
  testOverallScore?: string;
  testDate?: string;
  testScoresDetails?: string;
  testResultStatus?: string;

  // Stage & Workflow
  currentStage: string;
  isEnrolled: boolean;
  isTransferredToDocs: boolean;
  enrolledAt?: string;
  transferredAt?: string;

  tasks?: Task[];
  followUps?: FollowUp[];
  counsellingSessions?: CounsellingSession[];
  documents?: DocumentItem[];
  applications?: ApplicationItem[];
  activityLogs?: ActivityLog[];

  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  id: string;
  studentId: string;
  leadId?: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  course: string;
  intake: string;
  stage: string;
  enrolledDate: string;
}

export interface Task {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  dueDate: string;
  dueStatus: 'Due Now' | 'Upcoming' | 'Completed' | 'Overdue';
  completed: boolean;
  priority: string;
  leadId?: string;
  lead?: {
    id: string;
    studentName: string;
    phone: string;
  };
}

export interface FollowUp {
  id: string;
  leadId: string;
  studentName: string;
  date: string;
  time: string;
  task: string;
  reminder: string;
  status: string;
  notes?: string;
}

export interface CounsellingSession {
  id: string;
  leadId: string;
  date: string;
  time: string;
  counsellorName: string;
  notes: string;
  recommendations?: string;
  concerns?: string;
  outcome?: string;
}

export interface DocumentItem {
  id: string;
  leadId: string;
  name: string;
  category: string;
  status: 'Pending' | 'Requested' | 'Received' | 'Under Verification' | 'Approved' | 'Rejected';
  fileUrl?: string;
  notes?: string;
  verifiedAt?: string;
}

export interface UniversityItem {
  id: string;
  name: string;
  country: string;
  city: string;
  ranking?: string;
  courses: string;
  intake: string;
  tuitionFee: string;
  universityType: string;
  requirements?: string;
}

export interface ApplicationItem {
  id: string;
  leadId: string;
  universityName: string;
  course: string;
  intake: string;
  status: string;
  referenceNo?: string;
  submissionDate?: string;
  offerType?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface AnalyticsData {
  kpis: {
    totalLeads: { value: number; label: string; growth: string };
    contacted: { value: number; label: string; growth: string };
    counsellingDone: { value: number; label: string; growth: string };
    enrolled: { value: number; label: string; growth: string };
    transferred: { value: number; label: string; growth: string };
    applicationInProcess: { value: number; label: string; growth: string };
    offerReceived: { value: number; label: string; growth: string };
  };
  counsellingSummary: Array<{ name: string; count: number; fill: string }>;
  leadSources: Array<{ name: string; count: number; percentage: number; color: string }>;
  countryInterest: Array<{ country: string; count: number; flag: string; color: string }>;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'counselling' | 'followup' | 'visa' | 'deadline' | 'document';
  date: string; // YYYY-MM-DD
  time: string; // e.g. "11:00 AM"
  duration?: string;
  studentName: string;
  leadId?: string;
  phone?: string;
  countryInterest?: string;
  counsellor: string;
  mode: 'Phone Call' | 'In-Person' | 'Google Meet / Zoom' | 'WhatsApp';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Scheduled' | 'Completed' | 'Pending';
  notes?: string;
}
