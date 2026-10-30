export type UserRole = 'admin' | 'counsellor' | 'docs' | 'scholarship' | 'visa' | 'upgrad';

export type PortalId =
  | 'admin-portal'
  | 'counsellor-portal'
  | 'docs-portal'
  | 'scholarship-portal'
  | 'visa-portal'
  | 'upgrad-portal';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  portal: string;
  avatar?: string;
  phone?: string;
}

export interface PortalMeta {
  id: PortalId;
  role: UserRole;
  title: string;
  badge: string;
  color: string;
  accentHex: string;
  description: string;
  iconName: string;
  primaryRoutes: string[];
}

export const PORTAL_CONFIGS: Record<UserRole, PortalMeta> = {
  admin: {
    id: 'admin-portal',
    role: 'admin',
    title: 'Admin Portal',
    badge: 'Executive Command',
    color: 'from-amber-600 to-rose-700',
    accentHex: '#d97706',
    description: 'Global operations oversight, team credentials, lead distribution & CRM audit',
    iconName: 'ShieldCheck',
    primaryRoutes: ['dashboard', 'leads', 'students', 'reports', 'settings'],
  },
  counsellor: {
    id: 'counsellor-portal',
    role: 'counsellor',
    title: 'Counsellor Portal',
    badge: 'Student Onboarding',
    color: 'from-blue-600 to-indigo-700',
    accentHex: '#087cf5',
    description: 'Inbound lead qualification, university shortlisting, student consent & enrolment',
    iconName: 'GraduationCap',
    primaryRoutes: ['dashboard', 'leads', 'students', 'university-shortlisting', 'student-approval', 'tasks', 'calendar'],
  },
  docs: {
    id: 'docs-portal',
    role: 'docs',
    title: 'Document & Application Portal',
    badge: 'Processing & Verification',
    color: 'from-violet-600 to-purple-800',
    accentHex: '#8b5cf6',
    description: 'Academic dossier verification, university portal submissions & offer letters',
    iconName: 'FileCheck2',
    primaryRoutes: ['leads', 'students', 'documentation', 'applications', 'offer-letters', 'final-university', 'resources'],
  },
  scholarship: {
    id: 'scholarship-portal',
    role: 'scholarship',
    title: 'Scholarship Portal',
    badge: 'Grants & Financial Aid',
    color: 'from-emerald-600 to-teal-800',
    accentHex: '#10b981',
    description: 'DSU, ER.GO, ALiSEO regional grants, ISEE Parificato and stipend tracking',
    iconName: 'Sparkles',
    primaryRoutes: ['scholarship', 'students', 'resources', 'reports'],
  },
  visa: {
    id: 'visa-portal',
    role: 'visa',
    title: 'Visa & Pre-Departure Portal',
    badge: 'Legalization & Travel',
    color: 'from-cyan-600 to-blue-800',
    accentHex: '#06b6d4',
    description: 'Universitaly pre-enrolment, DOV / CIMEA legalization, VFS appointments & arrival',
    iconName: 'Plane',
    primaryRoutes: ['pre-enrolment', 'dov-cimea', 'visa-process', 'pre-departure', 'students'],
  },
  upgrad: {
    id: 'upgrad-portal',
    role: 'upgrad',
    title: 'UpGrad Portal',
    badge: 'Articulation & Cohorts',
    color: 'from-red-600 to-rose-700',
    accentHex: '#e21b22',
    description: 'UpGrad Global Degree tracks, credit articulation, hybrid cohorts & partner universities',
    iconName: 'GraduationCap',
    primaryRoutes: ['dashboard', 'leads', 'students', 'resources', 'reports'],
  },
};
