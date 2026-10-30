-- ===================================================================
-- ABROAD EDUCATION CRM - COMMON STUDENT PROFILE SQL DATABASE SCHEMA
-- Folder: student_profile/
-- Database: student_profile/students.db
-- Covers full student lifecycle from Counselling to Visa & Travel
-- Shared and updated across all 6 portals (Counsellor, Docs, Scholarship, Visa, UpGrad, Admin)
-- ===================================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = DELETE;

-- 1. Master Student Profiles (Core Identity, Target Country & Course)
CREATE TABLE IF NOT EXISTS student_profiles (
  id TEXT PRIMARY KEY,                       -- e.g. 'prof-rahul'
  student_id TEXT UNIQUE NOT NULL,           -- e.g. 'ITA-2027-001'
  lead_id TEXT,                              -- Cross-reference with Lead ID (e.g. 'L2025100501')
  name TEXT NOT NULL,
  avatar TEXT DEFAULT '/avatars/row_rahul.png',
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  dob TEXT,
  address TEXT,
  nationality TEXT DEFAULT 'Indian',
  country TEXT NOT NULL,                     -- Target Destination: Italy, Germany, UK, Canada, France
  country_code TEXT DEFAULT 'INT',           -- ITA, GER, UK, CAN, FRA
  target_university TEXT,
  preferred_course TEXT NOT NULL,
  alternative_courses TEXT,
  course_level TEXT DEFAULT 'Master',
  intake TEXT DEFAULT 'Sept 2026',
  budget TEXT DEFAULT '€ 8,000 – 15,000',
  counsellor_name TEXT DEFAULT 'Assigned Counsellor',
  enrollment_date TEXT,
  next_follow_up TEXT,
  overall_status TEXT DEFAULT 'Enrolled',    -- Counselling, Enrolled, Processing, Offer Received, Visa Process, Ready
  current_stage TEXT DEFAULT 'Counselling',
  stage_number INTEGER DEFAULT 1,            -- 1 to 12 in the Workflow Pipeline
  priority TEXT DEFAULT 'High',              -- High, Medium, Low
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Academic Qualification Records
CREATE TABLE IF NOT EXISTS academic_records (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  tenth_board TEXT,
  tenth_percentage TEXT,
  twelfth_board TEXT,
  twelfth_percentage TEXT,
  bachelor_degree TEXT,
  bachelor_university TEXT,
  bachelor_cgpa TEXT,
  bachelor_passing_year TEXT,
  backlogs TEXT DEFAULT '0',
  education_gaps TEXT DEFAULT 'None',
  work_experience TEXT DEFAULT 'None',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Language & Standardized Test Scores
CREATE TABLE IF NOT EXISTS test_scores (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL,                   -- IELTS, TOEFL, PTE, Duolingo, GRE, GMAT
  overall_score TEXT NOT NULL,
  reading TEXT,
  writing TEXT,
  listening TEXT,
  speaking TEXT,
  test_date TEXT,
  status TEXT DEFAULT 'Passed',              -- Passed, Scheduled, In Prep
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Counselling Assessment & Profile Evaluation
CREATE TABLE IF NOT EXISTS counselling_records (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  counsellor_name TEXT NOT NULL,
  session_date TEXT,
  preferred_countries TEXT,
  budget_bracket TEXT,
  notes TEXT,
  recommendations TEXT,
  outcome TEXT DEFAULT 'Eligible for Public Universities',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4b. Booked Counselling Sessions (one row per session booked by a counsellor)
CREATE TABLE IF NOT EXISTS counselling_sessions (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  lead_id TEXT,
  session_date TEXT NOT NULL,                 -- e.g. 10 Oct 2025
  session_time TEXT NOT NULL,                 -- e.g. 11:00 AM
  counsellor_name TEXT NOT NULL,
  session_type TEXT DEFAULT '1-on-1 Consultation',
  mode TEXT DEFAULT 'Video Call',             -- Video Call, Phone, In Person
  status TEXT DEFAULT 'Scheduled',            -- Scheduled, Completed, Cancelled
  notes TEXT,
  recommendations TEXT,
  concerns TEXT,
  outcome TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_counselling_sessions_student
  ON counselling_sessions(student_id, session_date);

-- 5. University Shortlisting (Portal & Program Options)
CREATE TABLE IF NOT EXISTS university_shortlists (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  university_name TEXT NOT NULL,
  program_name TEXT NOT NULL,
  country TEXT NOT NULL,
  tuition_fee TEXT,
  cfu_credits TEXT DEFAULT '120 ECTS',
  status TEXT DEFAULT 'Shortlisted',         -- Shortlisted, Applied, Approved, Rejected
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Student Agreement & Final Choices Approval
CREATE TABLE IF NOT EXISTS student_approvals (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  choice_1_university TEXT,
  choice_2_university TEXT,
  agreement_signed BOOLEAN DEFAULT 0,
  agreement_status TEXT DEFAULT 'Signed by Student',
  student_signature_note TEXT,
  service_package TEXT,
  total_fee TEXT,
  amount_paid TEXT,
  balance TEXT,
  payment_schedule TEXT,
  approved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Document Verification Checklist
CREATE TABLE IF NOT EXISTS documents_checklist (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,               -- Passport, 10th/12th/Degree Marks, SOP, LOR, Bank Statement
  category TEXT DEFAULT 'Academic',          -- Academic, Identity, Financial, Travel
  status TEXT DEFAULT 'Received',            -- Pending, Received, Verified, Approved, Needs Re-upload
  remarks TEXT,
  verified_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. University Applications Lodgement
CREATE TABLE IF NOT EXISTS university_applications (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  university_name TEXT NOT NULL,
  program_name TEXT NOT NULL,
  portal_application_id TEXT,
  submission_date TEXT,
  status TEXT DEFAULT 'Under Evaluation',    -- Submitted, Under Evaluation, Interview Scheduled, Accepted, Rejected
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Offer Letters & Seat Confirmation
CREATE TABLE IF NOT EXISTS offer_letters (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  university_name TEXT NOT NULL,
  offer_type TEXT DEFAULT 'Unconditional Offer', -- Conditional, Unconditional
  received_date TEXT,
  conditions TEXT,
  deposit_amount TEXT,
  deposit_deadline TEXT,
  seat_confirmed BOOLEAN DEFAULT 1,
  status TEXT DEFAULT 'Seat Secured',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. Regional & University Scholarships (DSU, ER.GO, LazioDisco, ALiSEO)
CREATE TABLE IF NOT EXISTS scholarships (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  scholarship_name TEXT DEFAULT 'DSU Regional Financial Aid',
  regional_authority TEXT DEFAULT 'Regional Directorate',
  isee_parificato_amount TEXT DEFAULT '€ 14,200',
  family_income_doc_status TEXT DEFAULT 'Verified',
  stipend_amount TEXT DEFAULT '€ 7,200 / yr',
  application_deadline TEXT,
  status TEXT DEFAULT 'Eligible & Lodged',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. Universitaly Pre-Enrolment (Italian Ministry Step)
CREATE TABLE IF NOT EXISTS pre_enrolments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  universitaly_summary_code TEXT DEFAULT 'UNIV-2026-IT8921',
  university_validation_status TEXT DEFAULT 'Validated by Italian Desk',
  status TEXT DEFAULT 'Summary Downloaded',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 12. DOV & CIMEA Legalization (Diploma Equivalency & MEA Apostille)
CREATE TABLE IF NOT EXISTS legalizations (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  process_type TEXT DEFAULT 'CIMEA Statement of Comparability', -- CIMEA, DOV
  cimea_diploma_ref TEXT DEFAULT 'CIMEA-IT-7721',
  status TEXT DEFAULT 'Issued & Certified',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 13. Visa Process & Consular Clearance (VFS / Embassy)
CREATE TABLE IF NOT EXISTS visa_processes (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  vfs_center TEXT DEFAULT 'VFS New Delhi',
  appointment_date TEXT DEFAULT '24 Oct 2025',
  appointment_time TEXT DEFAULT '10:30 AM',
  visa_type TEXT DEFAULT 'National Visa Type D (Study)',
  vfs_reference_no TEXT DEFAULT 'VFS-IT-9910',
  checklist_verification TEXT DEFAULT 'Complete (Funds, Insurance, Accommodation, Uni Offer)',
  financial_proof_amount TEXT DEFAULT '€ 6,500 in Student Bank Account',
  decision TEXT DEFAULT 'In Progress',       -- In Progress, Appointment Booked, Submitted, Approved, Rejected
  decision_date TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 14. Pre-Departure, Accommodation & Arrival Readiness
CREATE TABLE IF NOT EXISTS pre_departures (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  flight_booking_status TEXT DEFAULT 'Reserved',
  accommodation_status TEXT DEFAULT 'Confirmed in Rome',
  forex_card_status TEXT DEFAULT 'Loaded (€ 2,000)',
  status TEXT DEFAULT 'Arrival Ready',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 15. Cross-Portal Audit Trail & Activity Log
CREATE TABLE IF NOT EXISTS timeline_activities (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  portal_role TEXT DEFAULT 'system',         -- counsellor, docs, scholarship, visa, admin, upgrad
  operator_name TEXT DEFAULT 'Staff Operator',
  details TEXT,
  dot_color TEXT DEFAULT 'bg-blue-500',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 16. Central Profile Audit Log (database: student_profile/audit.db)
-- One row per field change / lifecycle event, shared by all 6 portals.
-- Shows who tweaked a student profile, which field, old → new value.
CREATE TABLE IF NOT EXISTS profile_audit (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,                 -- 'lead' | 'student-profile'
  entity_id TEXT NOT NULL,                   -- prisma id / profile id
  entity_code TEXT,                          -- human code: leadId (L2025…) / student_id (ITA-2027-…)
  student_name TEXT,
  action TEXT NOT NULL,                      -- 'created' | 'updated' | 'stage-changed'
  field TEXT,                                -- e.g. 'phone' (NULL for lifecycle events)
  old_value TEXT,
  new_value TEXT,
  actor_name TEXT,
  actor_email TEXT,
  actor_role TEXT,
  portal TEXT,                               -- portal workspace title
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 17. Student Payments & Installments Monitoring
CREATE TABLE IF NOT EXISTS student_payments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  plan_name TEXT DEFAULT 'Comprehensive Study Abroad Service',
  agreed_budget TEXT,                         -- Budget on which the student onboarded (e.g., € 18,000 / yr, ₹ 15,00,000)
  total_package_fee REAL DEFAULT 0,           -- Total agreed agency/service package fee
  total_paid REAL DEFAULT 0,                  -- Total amount paid so far
  balance_due REAL DEFAULT 0,                 -- Pending balance (total_package_fee - total_paid)
  installment_count INTEGER DEFAULT 2,        -- How many installments planned
  gst_included BOOLEAN DEFAULT 1,             -- Whether GST is included (1) or without GST (0)
  gst_percentage REAL DEFAULT 18.0,           -- 18% or 0%
  gst_amount REAL DEFAULT 0,                  -- Total GST component
  currency TEXT DEFAULT 'INR',                -- INR, EUR, USD, GBP
  payment_status TEXT DEFAULT 'Pending',      -- Paid, Partially Paid, Pending, Overdue
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_installments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  payment_id TEXT REFERENCES student_payments(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,        -- 1, 2, 3, etc.
  title TEXT NOT NULL,                        -- e.g., '1st Installment - Registration & Assessment'
  amount REAL NOT NULL,                       -- Base installment amount
  gst_rate REAL DEFAULT 18.0,
  gst_type TEXT DEFAULT 'With GST (18%)',     -- 'With GST (18%)' or 'Without GST'
  gst_amount REAL DEFAULT 0,
  total_amount REAL NOT NULL,                 -- Gross installment amount
  payment_date TEXT,                          -- Date payment was made
  due_date TEXT,                              -- Due date for installment
  payment_mode TEXT DEFAULT 'UPI',            -- UPI, Bank Transfer (NEFT/RTGS), Card, Cash, Cheque
  transaction_ref TEXT,                       -- UTR / Transaction reference
  receipt_no TEXT,                            -- Receipt / Invoice Number
  status TEXT DEFAULT 'Pending',              -- Paid, Pending, Overdue
  collected_by TEXT,                          -- Counsellor or Staff member
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_installments_student
  ON payment_installments(student_id, installment_number);

