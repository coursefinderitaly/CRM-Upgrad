import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Path to student_profile root directory.
// In development __dirname is <repo>/student_profile.
// In a compiled build __dirname is <repo>/server/dist/student_profile, so walk
// back to the real data folder instead of creating an empty one inside dist.
function resolveDbDir(): string {
  if (process.env.STUDENT_PROFILE_DIR) {
    return path.resolve(process.env.STUDENT_PROFILE_DIR);
  }
  const fromCwd = path.resolve(process.cwd(), 'student_profile');
  if (fs.existsSync(fromCwd) && fs.statSync(fromCwd).isDirectory()) {
    return fromCwd;
  }
  if (__dirname.includes(`${path.sep}dist${path.sep}`)) {
    const repoRoot = path.resolve(__dirname, '../../..');
    const candidate = path.join(repoRoot, 'student_profile');
    if (fs.existsSync(candidate)) return candidate;
  }
  return path.resolve(__dirname);
}

export const DB_DIR = resolveDbDir();
export const SCHEMA_PATH = path.join(DB_DIR, 'schema.sql');

// Dedicated folder inside student_profile for operational SQLite databases
export const SYSTEM_FOLDER_NAMES = new Set([
  'system_databases',
  'crm_system',
  'operations',
  'databases',
  'system_data',
  'shared_databases',
  'sqlite_databases',
  'system_db',
  'dbs',
]);

export function getSystemDbDir(): string {
  // Check known candidate folder names first
  for (const name of SYSTEM_FOLDER_NAMES) {
    const candidate = path.join(DB_DIR, name);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      return candidate;
    }
  }

  // Check if any existing subfolder in student_profile holds history.db, tasks.db, etc.
  try {
    const entries = fs.readdirSync(DB_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const candidate = path.join(DB_DIR, entry.name);
      if (
        fs.existsSync(path.join(candidate, 'history.db')) ||
        fs.existsSync(path.join(candidate, 'tasks.db')) ||
        fs.existsSync(path.join(candidate, 'calendar.db')) ||
        fs.existsSync(path.join(candidate, 'followups.db'))
      ) {
        return candidate;
      }
    }
  } catch (err) {}

  const defaultDir = path.join(DB_DIR, 'system_databases');
  if (!fs.existsSync(defaultDir)) {
    fs.mkdirSync(defaultDir, { recursive: true });
  }
  return defaultDir;
}

export const SYSTEM_DB_DIR = getSystemDbDir();
export const HISTORY_DB_PATH = path.join(SYSTEM_DB_DIR, 'history.db');
export const AUDIT_DB_PATH = HISTORY_DB_PATH;
export const TASKS_DB_PATH = path.join(SYSTEM_DB_DIR, 'tasks.db');
export const FOLLOWUPS_DB_PATH = path.join(SYSTEM_DB_DIR, 'followups.db');
export const CALENDAR_DB_PATH = path.join(SYSTEM_DB_DIR, 'calendar.db');

// Ensure existing history.db and other system databases are stored in the system_databases folder
export function ensureSystemDatabasesMigrated(): void {
  try {
    if (!fs.existsSync(SYSTEM_DB_DIR)) {
      fs.mkdirSync(SYSTEM_DB_DIR, { recursive: true });
    }
    const oldHistory = path.join(DB_DIR, 'history.db');
    if (fs.existsSync(oldHistory) && !fs.existsSync(HISTORY_DB_PATH)) {
      fs.copyFileSync(oldHistory, HISTORY_DB_PATH);
    }
    const oldAudit = path.join(DB_DIR, 'audit.db');
    if (fs.existsSync(oldAudit) && fs.statSync(oldAudit).size > 0 && !fs.existsSync(HISTORY_DB_PATH)) {
      fs.copyFileSync(oldAudit, HISTORY_DB_PATH);
    }
    const oldTasks = path.join(DB_DIR, 'tasks.db');
    if (fs.existsSync(oldTasks) && !fs.existsSync(TASKS_DB_PATH)) {
      fs.copyFileSync(oldTasks, TASKS_DB_PATH);
    }
    const oldFollowUps = path.join(DB_DIR, 'followups.db');
    if (fs.existsSync(oldFollowUps) && !fs.existsSync(FOLLOWUPS_DB_PATH)) {
      fs.copyFileSync(oldFollowUps, FOLLOWUPS_DB_PATH);
    }
    const oldCalendar = path.join(DB_DIR, 'calendar.db');
    if (fs.existsSync(oldCalendar) && !fs.existsSync(CALENDAR_DB_PATH)) {
      fs.copyFileSync(oldCalendar, CALENDAR_DB_PATH);
    }
  } catch (err) {
    console.warn('Could not migrate databases into system_databases folder:', err);
  }
}
ensureSystemDatabasesMigrated();

// Status helper returning linked SQLite databases summary
export function getSystemDatabasesStatus() {
  ensureSystemDatabasesMigrated();
  const getFileSize = (filePath: string) => {
    try {
      return fs.existsSync(filePath) ? fs.statSync(filePath).size : 0;
    } catch {
      return 0;
    }
  };

  const getRecordCount = (dbPath: string, table: string) => {
    try {
      if (!fs.existsSync(dbPath)) return 0;
      const db = getStudentDb(dbPath);
      const res = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as any;
      return res?.count ?? 0;
    } catch {
      return 0;
    }
  };

  return {
    directory: SYSTEM_DB_DIR,
    folderName: path.basename(SYSTEM_DB_DIR),
    databases: [
      {
        id: 'history',
        name: 'history.db',
        path: HISTORY_DB_PATH,
        sizeBytes: getFileSize(HISTORY_DB_PATH),
        table: 'history_events',
        count: getRecordCount(HISTORY_DB_PATH, 'history_events'),
        status: fs.existsSync(HISTORY_DB_PATH) ? 'connected' : 'missing',
      },
      {
        id: 'tasks',
        name: 'tasks.db',
        path: TASKS_DB_PATH,
        sizeBytes: getFileSize(TASKS_DB_PATH),
        table: 'tasks',
        count: getRecordCount(TASKS_DB_PATH, 'tasks'),
        status: fs.existsSync(TASKS_DB_PATH) ? 'connected' : 'missing',
      },
      {
        id: 'followups',
        name: 'followups.db',
        path: FOLLOWUPS_DB_PATH,
        sizeBytes: getFileSize(FOLLOWUPS_DB_PATH),
        table: 'follow_ups',
        count: getRecordCount(FOLLOWUPS_DB_PATH, 'follow_ups'),
        status: fs.existsSync(FOLLOWUPS_DB_PATH) ? 'connected' : 'missing',
      },
      {
        id: 'calendar',
        name: 'calendar.db',
        path: CALENDAR_DB_PATH,
        sizeBytes: getFileSize(CALENDAR_DB_PATH),
        table: 'calendar_events',
        count: getRecordCount(CALENDAR_DB_PATH, 'calendar_events'),
        status: fs.existsSync(CALENDAR_DB_PATH) ? 'connected' : 'missing',
      },
    ],
  };
}

// Map of open database connections by filepath
const dbCache = new Map<string, DatabaseSync>();

export interface PhysicalDocument {
  name: string;
  size: number;
  sizeFormatted: string;
  modified: string;
  relativePath: string;
}

export interface CommonStudentProfile {
  id: string;
  student_id: string;
  lead_id?: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  dob?: string;
  address?: string;
  nationality: string;
  country: string;
  country_code: string;
  target_university?: string;
  preferred_course: string;
  course_level: string;
  intake: string;
  budget?: string;
  counsellor_name: string;
  enrollment_date?: string;
  next_follow_up?: string;
  overall_status: string;
  current_stage: string;
  stage_number: number;
  priority: string;
  created_at: string;
  updated_at: string;
  // Physical folder metadata
  folder_name?: string;
  db_file?: string;
  documents_folder?: string;
  physical_documents?: PhysicalDocument[];
  // Relational stage sections
  academic?: any;
  test_scores?: any[];
  counselling?: any;
  counselling_sessions?: any[];
  shortlists?: any[];
  approval?: any;
  documents?: any[];
  applications?: any[];
  offers?: any[];
  scholarship?: any;
  pre_enrolment?: any;
  legalization?: any;
  visa?: any;
  pre_departure?: any;
  timeline?: any[];
  payments?: any;
  installments?: any[];
}

/**
 * Generates clean folder name: e.g. "Rahul_Sharma_9876543210"
 */
export function getStudentFolderName(name: string, phone: string): string {
  const cleanName = (name || 'Student')
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  const cleanPhone = (phone || '0000000000').replace(/[^0-9]/g, '').slice(-10) || '0000000000';
  return `${cleanName}_${cleanPhone}`;
}

/**
 * Adds the counselling session table to older student databases.
 * Called every time a student DB is opened, so existing profiles are repaired
 * automatically and newly created profiles get the table from schema.sql.
 */
export function ensureCounsellingSessionsTable(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS counselling_sessions (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
      lead_id TEXT,
      session_date TEXT NOT NULL,
      session_time TEXT NOT NULL,
      counsellor_name TEXT NOT NULL,
      session_type TEXT DEFAULT '1-on-1 Consultation',
      mode TEXT DEFAULT 'Video Call',
      status TEXT DEFAULT 'Scheduled',
      notes TEXT,
      recommendations TEXT,
      concerns TEXT,
      outcome TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_counselling_sessions_student
      ON counselling_sessions(student_id, session_date);
  `);
}

/**
 * Adds newer profile columns to databases that were created before those
 * columns existed. This keeps every student_profile/<Student>/*.db file
 * editable from the UI without a manual migration.
 */
export function ensureStudentProfileColumns(db: DatabaseSync): void {
  const addColumn = (table: string, column: string, definition: string) => {
    try {
      const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
      if (columns.length > 0 && !columns.some((c) => c.name === column)) {
        db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      }
    } catch (err) {
      console.warn(`Could not add ${table}.${column}:`, err);
    }
  };

  // Program preferences stored alongside the master profile
  addColumn('student_profiles', 'alternative_courses', 'TEXT');

  // Payment & agreement details live on the approval record
  addColumn('student_approvals', 'service_package', 'TEXT');
  addColumn('student_approvals', 'total_fee', 'TEXT');
  addColumn('student_approvals', 'amount_paid', 'TEXT');
  addColumn('student_approvals', 'balance', 'TEXT');
  addColumn('student_approvals', 'payment_schedule', 'TEXT');
}

/**
 * Creates payments and installments tables if not present in the student's SQLite file
 */
export function ensurePaymentsTable(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS student_payments (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
      plan_name TEXT DEFAULT 'Comprehensive Study Abroad Service Package',
      agreed_budget TEXT,
      total_package_fee REAL DEFAULT 0,
      total_paid REAL DEFAULT 0,
      balance_due REAL DEFAULT 0,
      installment_count INTEGER DEFAULT 2,
      gst_included BOOLEAN DEFAULT 1,
      gst_percentage REAL DEFAULT 18.0,
      gst_amount REAL DEFAULT 0,
      currency TEXT DEFAULT 'INR',
      payment_status TEXT DEFAULT 'Pending',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payment_installments (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
      payment_id TEXT,
      installment_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      gst_rate REAL DEFAULT 18.0,
      gst_type TEXT DEFAULT 'With GST (18%)',
      gst_amount REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      payment_date TEXT,
      due_date TEXT,
      payment_mode TEXT DEFAULT 'UPI',
      transaction_ref TEXT,
      receipt_no TEXT,
      status TEXT DEFAULT 'Pending',
      collected_by TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_payment_installments_student
      ON payment_installments(student_id, installment_number);
  `);
}

/**
 * Gets or opens SQLite database connection for a specific student .db file
 */
export function getStudentDb(dbPath: string): DatabaseSync {
  let db = dbCache.get(dbPath);
  if (!db) {
    db = new DatabaseSync(dbPath);
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec('PRAGMA journal_mode = DELETE;'); // DELETE mode avoids persistent -wal and -shm sidecar files
    dbCache.set(dbPath, db);
  }
  // Auto-migrate every existing profile .db file
  try {
    ensureCounsellingSessionsTable(db);
    ensureStudentProfileColumns(db);
    ensurePaymentsTable(db);
  } catch (err) {
    console.warn(`Could not ensure profile schema in ${dbPath}:`, err);
  }
  return db;
}

/**
 * Generates a valid minimal sample PDF binary string
 */
function createSamplePdfContent(title: string, studentName: string): string {
  const content = `BT /F1 16 Tf 50 720 Td (${title}) Tj /F1 11 Tf 0 -30 Td (Student: ${studentName}) Tj /F1 10 Tf 0 -25 Td (Verified and stored in Abroad Education CRM) Tj ET`;
  const streamLen = Buffer.byteLength(content);
  return `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length ${streamLen} >>
stream
${content}
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000244 00000 n 
0000000344 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
420
%%EOF`;
}

/**
 * Scans the student's physical documents/ folder
 */
export function getStudentPhysicalDocuments(studentFolder: string): PhysicalDocument[] {
  const docsDir = path.join(DB_DIR, studentFolder, 'documents');
  if (!fs.existsSync(docsDir)) return [];

  const files = fs.readdirSync(docsDir);
  return files.map((file) => {
    const fullPath = path.join(docsDir, file);
    try {
      const stat = fs.statSync(fullPath);
      const sizeKb = Math.round(stat.size / 1024) || 1;
      return {
        name: file,
        size: stat.size,
        sizeFormatted: `${sizeKb} KB`,
        modified: stat.mtime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        relativePath: `student_profile/${studentFolder}/documents/${file}`,
      };
    } catch {
      return {
        name: file,
        size: 0,
        sizeFormatted: '0 KB',
        modified: 'Recent',
        relativePath: `student_profile/${studentFolder}/documents/${file}`,
      };
    }
  });
}

/**
 * Initializes a dedicated folder, .db file, and documents/ folder for a student
 */
export function createStudentFolderAndDb(
  profileData: Partial<CommonStudentProfile>,
  isSeed = false,
  operatorName = 'Staff Operator',
  portalRole = 'counsellor',
  actorDetails?: AuditActorContext
): CommonStudentProfile {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const name = profileData.name || 'Student';
  const phone = profileData.phone || '0000000000';
  const folderName = profileData.folder_name || getStudentFolderName(name, phone);
  const studentDirPath = path.join(DB_DIR, folderName);
  const docsDirPath = path.join(studentDirPath, 'documents');
  const dbPath = path.join(studentDirPath, `${folderName}.db`);

  // 1. Create student directory and empty documents subfolder
  if (!fs.existsSync(docsDirPath)) {
    fs.mkdirSync(docsDirPath, { recursive: true });
  }

  // 2. Open / create individual SQLite database
  const db = getStudentDb(dbPath);

  // 3. Apply 15-table SQL schema
  if (fs.existsSync(SCHEMA_PATH)) {
    const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.exec(schemaSql);
  }

  const pid = profileData.id || `prof-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const studentId = profileData.student_id || `STU-2027-${Math.floor(100 + Math.random() * 900)}`;

  // 4. Insert or update student_profiles master row using registration data
  const existing = db.prepare(`SELECT id FROM student_profiles WHERE id = ? OR student_id = ? LIMIT 1`).get(pid, studentId) as any;
  if (!existing) {
    db.prepare(`
      INSERT INTO student_profiles (
        id, student_id, lead_id, name, avatar, phone, email, dob, address,
        nationality, country, country_code, target_university, preferred_course,
        course_level, intake, budget, counsellor_name, enrollment_date, next_follow_up,
        overall_status, current_stage, stage_number, priority
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      pid,
      studentId,
      profileData.lead_id || null,
      name,
      profileData.avatar || null,
      phone,
      profileData.email || '',
      profileData.dob || null,
      profileData.address || null,
      profileData.nationality || null,
      profileData.country || null,
      profileData.country_code || (profileData.country ? profileData.country.slice(0, 3).toUpperCase() : null),
      profileData.target_university || null,
      profileData.preferred_course || null,
      profileData.course_level || (profileData.preferred_course?.toLowerCase().includes('bachelor') ? 'Bachelor' : 'Master'),
      profileData.intake || null,
      profileData.budget || null,
      profileData.counsellor_name || null,
      profileData.enrollment_date || null,
      profileData.next_follow_up || null,
      profileData.overall_status || 'New Lead',
      profileData.current_stage || 'New Lead Registration',
      profileData.stage_number || 1,
      profileData.priority || 'Medium'
    );

    // Initial Academic Record (created for updates; populated with registration data if provided)
    db.prepare(`
      INSERT INTO academic_records (
        id, student_id, tenth_board, tenth_percentage, twelfth_board, twelfth_percentage,
        bachelor_degree, bachelor_university, bachelor_cgpa, bachelor_passing_year,
        backlogs, education_gaps, work_experience
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      crypto.randomUUID(),
      pid,
      profileData.academic?.tenth_board || null,
      profileData.academic?.tenth_percentage || null,
      profileData.academic?.twelfth_board || null,
      profileData.academic?.twelfth_percentage || null,
      profileData.academic?.bachelor_degree || null,
      profileData.academic?.bachelor_university || null,
      profileData.academic?.bachelor_cgpa || null,
      profileData.academic?.bachelor_passing_year || null,
      profileData.academic?.backlogs || '0',
      profileData.academic?.education_gaps || 'None',
      profileData.academic?.work_experience || null
    );

    // Initial Test Score if passed on registration
    if (profileData.test_scores && profileData.test_scores.length > 0) {
      for (const t of profileData.test_scores) {
        db.prepare(`
          INSERT INTO test_scores (id, student_id, test_type, overall_score, reading, writing, listening, speaking, test_date, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          crypto.randomUUID(),
          pid,
          t.test_type || 'IELTS',
          t.overall_score || '',
          t.reading || null,
          t.writing || null,
          t.listening || null,
          t.speaking || null,
          t.test_date || new Date().toISOString().slice(0, 10),
          t.status || 'Reported'
        );
      }
    }

    // Initial Counselling Record
    db.prepare(`
      INSERT INTO counselling_records (id, student_id, counsellor_name, session_date, preferred_countries, budget_bracket, notes, recommendations, outcome)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      crypto.randomUUID(),
      pid,
      profileData.counsellor_name || 'Unassigned',
      new Date().toISOString().slice(0, 10),
      profileData.country || null,
      profileData.budget || null,
      'Lead registered. Profile folder and database initialized with registration data.',
      null,
      'New Lead Registered'
    );

    // Initial Timeline Activity
    db.prepare(`
      INSERT INTO timeline_activities (id, student_id, action, portal_role, operator_name, details, dot_color)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      crypto.randomUUID(),
      pid,
      'Lead Registered & Profile Created',
      'system',
      profileData.counsellor_name || 'Registration Desk',
      `Created folder student_profile/${folderName} with ${folderName}.db and empty documents/ folder`,
      'bg-emerald-500'
    );

    // ONLY populate sample documents and downstream demo records for the initial 4 demo profiles (isSeed === true)
    if (isSeed) {
      // Seed Academic Details
      db.prepare(`
        UPDATE academic_records SET
          tenth_board = 'CBSE', tenth_percentage = '86%',
          twelfth_board = 'CBSE', twelfth_percentage = '84%',
          bachelor_degree = 'B.Tech / Bachelor Degree', bachelor_university = 'State University',
          bachelor_cgpa = '8.2 CGPA', bachelor_passing_year = '2023', work_experience = '1.5 yrs'
        WHERE student_id = ?
      `).run(pid);

      // Seed Test Score
      db.prepare(`
        INSERT INTO test_scores (id, student_id, test_type, overall_score, reading, writing, listening, speaking, test_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(crypto.randomUUID(), pid, 'IELTS', '7.5', '7.5', '7.0', '8.0', '7.5', '15 Jan 2025', 'Passed');

      // Seed Shortlist
      db.prepare(`
        INSERT INTO university_shortlists (id, student_id, university_name, program_name, country, tuition_fee, cfu_credits, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(crypto.randomUUID(), pid, profileData.target_university || 'Sapienza University of Rome', profileData.preferred_course || 'MSc Computer Science', profileData.country || 'Italy', '€ 2,500/yr', '120 ECTS', 'Shortlisted');

      // Seed Student Approval
      db.prepare(`
        INSERT INTO student_approvals (id, student_id, choice_1_university, choice_2_university, agreement_signed, agreement_status, student_signature_note)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(crypto.randomUUID(), pid, profileData.target_university || 'Sapienza University of Rome', 'Politecnico di Milano', 1, 'Signed by Student', 'Student confirmed agreement via portal');

      // Seed Documents Checklist and sample files
      const defaultDocs = [
        { name: 'Passport Copy (All Pages)', cat: 'Identity', file: 'Passport_Copy.pdf' },
        { name: '10th Standard Marksheet', cat: 'Academic', file: '10th_Standard_Marksheet.pdf' },
        { name: '12th Standard Marksheet', cat: 'Academic', file: '12th_Standard_Marksheet.pdf' },
        { name: 'Graduation Degree Certificate', cat: 'Academic', file: 'Graduation_Degree_Certificate.pdf' },
        { name: 'IELTS Official Scorecard', cat: 'Academic', file: 'IELTS_Official_Scorecard.pdf' },
        { name: 'Statement of Purpose (SOP)', cat: 'Academic', file: 'Statement_of_Purpose_SOP.pdf' },
        { name: 'Letter of Recommendation 1', cat: 'Academic', file: 'Letter_of_Recommendation_LOR1.pdf' },
        { name: 'Letter of Recommendation 2', cat: 'Academic', file: 'Letter_of_Recommendation_LOR2.pdf' },
        { name: 'Bank Financial Statement', cat: 'Financial', file: 'Bank_Financial_Statement.pdf' },
        { name: 'Curriculum Vitae (CV)', cat: 'Identity', file: 'CV_Resume.pdf' },
      ];

      for (const d of defaultDocs) {
        db.prepare(`
          INSERT INTO documents_checklist (id, student_id, document_name, category, status, remarks, verified_by)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(crypto.randomUUID(), pid, d.name, d.cat, 'Verified', `Physical file saved in documents/${d.file}`, 'Docs Team');

        const filePath = path.join(docsDirPath, d.file);
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, createSamplePdfContent(d.name, name));
        }
      }

      // Seed Application & Offer
      db.prepare(`
        INSERT INTO university_applications (id, student_id, university_name, program_name, portal_application_id, submission_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(crypto.randomUUID(), pid, profileData.target_university || 'Sapienza University of Rome', profileData.preferred_course || 'MSc Program', `APP-${Math.floor(10000 + Math.random() * 90000)}`, '25 Sept 2025', 'Submitted & Under Evaluation');

      db.prepare(`
        INSERT INTO offer_letters (id, student_id, university_name, offer_type, received_date, conditions, deposit_amount, seat_confirmed, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(crypto.randomUUID(), pid, profileData.target_university || 'Sapienza University of Rome', 'Unconditional Offer', '01 Oct 2025', 'Original Documents at Enrolment Desk', '€ 1,500 (Paid)', 1, 'Seat Secured');

      // Seed Scholarship
      db.prepare(`
        INSERT INTO scholarships (id, student_id, scholarship_name, regional_authority, isee_parificato_amount, stipend_amount, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(crypto.randomUUID(), pid, 'DSU Regional Aid (100% Tuition Exemption)', 'Regional Directorate', '€ 14,200', '€ 7,200 / yr', 'Eligible & Lodged');

      // Seed Pre-Enrolment
      db.prepare(`
        INSERT INTO pre_enrolments (id, student_id, universitaly_summary_code, university_validation_status, status)
        VALUES (?, ?, ?, ?, ?)
      `).run(crypto.randomUUID(), pid, `UNIV-2026-${Math.floor(1000 + Math.random() * 9000)}`, 'Validated by Italian Desk', 'Step D Summary Issued');

      // Seed Legalization
      db.prepare(`
        INSERT INTO legalizations (id, student_id, process_type, cimea_diploma_ref, status)
        VALUES (?, ?, ?, ?, ?)
      `).run(crypto.randomUUID(), pid, 'CIMEA Statement of Comparability', `CIMEA-IT-${Math.floor(1000 + Math.random() * 9000)}`, 'Issued & Certified');

      // Seed Visa Process
      db.prepare(`
        INSERT INTO visa_processes (id, student_id, vfs_center, appointment_date, appointment_time, visa_type, vfs_reference_no, checklist_verification, financial_proof_amount, decision)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(crypto.randomUUID(), pid, 'VFS New Delhi', '24 Oct 2025', '10:30 AM', 'National Visa Type D (Study)', `VFS-IT-${Math.floor(1000 + Math.random() * 9000)}`, 'Complete (Funds, Insurance, Accommodation, Uni Offer)', '€ 6,500 in Student Bank Account', 'Approved');

      // Seed Pre-Departure
      db.prepare(`
        INSERT INTO pre_departures (id, student_id, flight_booking_status, accommodation_status, forex_card_status, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(crypto.randomUUID(), pid, 'Reserved', 'Confirmed in Rome', 'Loaded (€ 2,000)', 'Arrival Ready');
    }
  }

  // 5. Query full profile
  const full = getProfileFromDb(db, pid, folderName);
  if (!isSeed) {
    const actorCtx: AuditActorContext = {
      name: (profileData as any)?._actor?.name || actorDetails?.name || operatorName,
      email: (profileData as any)?._actor?.email || actorDetails?.email || null,
      role: (profileData as any)?._actor?.role || actorDetails?.role || portalRole,
      portal:
        (profileData as any)?._actor?.portal ||
        (profileData as any)?._portal ||
        actorDetails?.portal ||
        (portalRole ? `${portalRole.charAt(0).toUpperCase() + portalRole.slice(1)} Portal` : 'Counsellor Portal'),
      skipAudit: actorDetails?.skipAudit ?? false,
    };
    diffAndLogStudentProfile(null, full, actorCtx);
  }
  return full;
}

/**
 * Attaches all 15 stages to a student profile from their SQLite database
 */
function getProfileFromDb(db: DatabaseSync, pid: string, folderName: string): CommonStudentProfile {
  const profile = db.prepare(`SELECT * FROM student_profiles WHERE id = ? LIMIT 1`).get(pid) as any;
  if (!profile) throw new Error(`Profile not found for pid ${pid}`);

  const academic = db.prepare(`SELECT * FROM academic_records WHERE student_id = ? LIMIT 1`).get(pid);
  const testScores = db.prepare(`SELECT * FROM test_scores WHERE student_id = ?`).all(pid);
  const counselling = db.prepare(`SELECT * FROM counselling_records WHERE student_id = ? LIMIT 1`).get(pid);
  const counsellingSessions = db
    .prepare(`SELECT * FROM counselling_sessions WHERE student_id = ? ORDER BY created_at DESC`)
    .all(pid);
  const shortlists = db.prepare(`SELECT * FROM university_shortlists WHERE student_id = ?`).all(pid);
  const approval = db.prepare(`SELECT * FROM student_approvals WHERE student_id = ? LIMIT 1`).get(pid);
  const documents = db.prepare(`SELECT * FROM documents_checklist WHERE student_id = ? ORDER BY id ASC`).all(pid);
  const applications = db.prepare(`SELECT * FROM university_applications WHERE student_id = ?`).all(pid);
  const offers = db.prepare(`SELECT * FROM offer_letters WHERE student_id = ?`).all(pid);
  const scholarship = db.prepare(`SELECT * FROM scholarships WHERE student_id = ? LIMIT 1`).get(pid);
  const preEnrolment = db.prepare(`SELECT * FROM pre_enrolments WHERE student_id = ? LIMIT 1`).get(pid);
  const legalization = db.prepare(`SELECT * FROM legalizations WHERE student_id = ? LIMIT 1`).get(pid);
  const visa = db.prepare(`SELECT * FROM visa_processes WHERE student_id = ? LIMIT 1`).get(pid);
  const preDeparture = db.prepare(`SELECT * FROM pre_departures WHERE student_id = ? LIMIT 1`).get(pid);
  const timeline = db.prepare(`SELECT * FROM timeline_activities WHERE student_id = ? ORDER BY created_at DESC`).all(pid);

  // Payments & Installments Monitoring
  let payments = db.prepare(`SELECT * FROM student_payments WHERE student_id = ? LIMIT 1`).get(pid) as any;
  let installments = db
    .prepare(`SELECT * FROM payment_installments WHERE student_id = ? ORDER BY installment_number ASC, created_at ASC`)
    .all(pid) as any[];

  // Auto-seed default payments plan if this is the first time payments are opened for this student
  if (!payments) {
    const defaultBudget = profile.budget || '€ 18,000 / yr';
    const initialPlanId = crypto.randomUUID();
    const defaultFee = 60000;
    const defaultGstRate = 18.0;
    const defaultGstAmount = (defaultFee * defaultGstRate) / 100;
    const defaultTotal = defaultFee + defaultGstAmount;

    try {
      db.prepare(`
        INSERT INTO student_payments (
          id, student_id, plan_name, agreed_budget, total_package_fee,
          total_paid, balance_due, installment_count, gst_included,
          gst_percentage, gst_amount, currency, payment_status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        initialPlanId,
        pid,
        'Comprehensive Study Abroad Service Package',
        defaultBudget,
        defaultTotal,
        0,
        defaultTotal,
        2,
        1,
        defaultGstRate,
        defaultGstAmount,
        'INR',
        'Pending',
        `Student onboarded with incoming target budget ${defaultBudget}`
      );

      const halfTotal = Math.round(defaultTotal / 2);
      const halfBase = Math.round(defaultFee / 2);
      const halfGst = Math.round(defaultGstAmount / 2);

      db.prepare(`
        INSERT INTO payment_installments (
          id, student_id, payment_id, installment_number, title, amount,
          gst_rate, gst_type, gst_amount, total_amount, payment_date,
          due_date, payment_mode, transaction_ref, receipt_no, status,
          collected_by, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        crypto.randomUUID(),
        pid,
        initialPlanId,
        1,
        '1st Installment - Registration & Assessment',
        halfBase,
        defaultGstRate,
        'With GST (18%)',
        halfGst,
        halfTotal,
        null,
        new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        'UPI',
        '',
        `REC-${new Date().getFullYear()}-001`,
        'Pending',
        profile.counsellor_name || 'Counsellor',
        'Initial onboarding installment'
      );

      db.prepare(`
        INSERT INTO payment_installments (
          id, student_id, payment_id, installment_number, title, amount,
          gst_rate, gst_type, gst_amount, total_amount, payment_date,
          due_date, payment_mode, transaction_ref, receipt_no, status,
          collected_by, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        crypto.randomUUID(),
        pid,
        initialPlanId,
        2,
        '2nd Installment - Application & Visa Lodgement',
        halfBase,
        defaultGstRate,
        'With GST (18%)',
        halfGst,
        halfTotal,
        null,
        new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        'Bank Transfer',
        '',
        `REC-${new Date().getFullYear()}-002`,
        'Pending',
        profile.counsellor_name || 'Counsellor',
        'Milestone installment upon application submission'
      );

      payments = db.prepare(`SELECT * FROM student_payments WHERE student_id = ? LIMIT 1`).get(pid) as any;
      installments = db
        .prepare(`SELECT * FROM payment_installments WHERE student_id = ? ORDER BY installment_number ASC, created_at ASC`)
        .all(pid) as any[];
    } catch (e) {
      console.warn('Could not auto-seed default student_payments:', e);
    }
  }

  // Scan physical files
  const physicalDocs = getStudentPhysicalDocuments(folderName);

  return {
    ...profile,
    folder_name: folderName,
    db_file: `${folderName}.db`,
    documents_folder: `student_profile/${folderName}/documents`,
    physical_documents: physicalDocs,
    academic,
    test_scores: testScores,
    counselling,
    counselling_sessions: counsellingSessions,
    shortlists,
    approval,
    documents,
    applications,
    offers,
    scholarship,
    pre_enrolment: preEnrolment,
    legalization,
    visa,
    pre_departure: preDeparture,
    timeline,
    payments: payments || null,
    installments: installments || [],
  };
}

/**
 * Returns all student profiles by scanning all student folders in student_profile/
 */
export function getAllProfiles(): CommonStudentProfile[] {
  ensureInitialSeeding();

  const entries = fs.readdirSync(DB_DIR, { withFileTypes: true });
  const profiles: CommonStudentProfile[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const folderName = entry.name;
    if (SYSTEM_FOLDER_NAMES.has(folderName)) continue;
    const studentDirPath = path.join(DB_DIR, folderName);

    // Skip if directory contains system operational databases
    if (
      fs.existsSync(path.join(studentDirPath, 'history.db')) ||
      fs.existsSync(path.join(studentDirPath, 'tasks.db')) ||
      fs.existsSync(path.join(studentDirPath, 'calendar.db')) ||
      fs.existsSync(path.join(studentDirPath, 'followups.db'))
    ) {
      continue;
    }

    // Look for .db file inside this folder
    const dbFiles = fs.readdirSync(studentDirPath).filter((f) => f.endsWith('.db') && !f.includes('-journal'));
    if (dbFiles.length === 0) continue;

    const dbPath = path.join(studentDirPath, dbFiles[0]);
    try {
      const db = getStudentDb(dbPath);
      // Confirm student_profiles table exists before querying
      const tableCheck = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='student_profiles'`).get() as any;
      if (!tableCheck) continue;

      const studentRow = db.prepare(`SELECT id FROM student_profiles LIMIT 1`).get() as any;
      if (studentRow && studentRow.id) {
        const full = getProfileFromDb(db, studentRow.id, folderName);
        profiles.push(full);
      }
    } catch (err) {
      console.error(`Error reading student db at ${dbPath}:`, err);
    }
  }

  // Sort by stage_number, then name
  return profiles.sort((a, b) => (a.stage_number || 1) - (b.stage_number || 1));
}

/**
 * Returns a single student profile by id, student_id, lead_id, or folder_name
 */
export function getProfileById(idOrCode: string): CommonStudentProfile | null {
  ensureInitialSeeding();
  if (!idOrCode) return null;

  const target = idOrCode.trim().toLowerCase();
  const all = getAllProfiles();

  return (
    all.find(
      (p) =>
        p.id.toLowerCase() === target ||
        p.student_id.toLowerCase() === target ||
        (p.lead_id && p.lead_id.toLowerCase() === target) ||
        (p.folder_name && p.folder_name.toLowerCase() === target) ||
        p.name.toLowerCase() === target
    ) || null
  );
}

/**
 * Updates a section in the student's individual database file
 */
export function updateSection(
  studentIdOrCode: string,
  section: string,
  data: Record<string, any>,
  operatorName = 'Staff Operator',
  portalRole = 'counsellor',
  actorDetails?: AuditActorContext
): CommonStudentProfile | null {
  const profile = getProfileById(studentIdOrCode);
  if (!profile || !profile.folder_name) return null;

  const folderName = profile.folder_name;
  const dbPath = path.join(DB_DIR, folderName, `${folderName}.db`);
  const db = getStudentDb(dbPath);
  const pid = profile.id;

  // Snapshot before
  const before = getProfileById(studentIdOrCode);

  /** Inserts a missing singleton child row so UPDATE statements always hit a row. */
  const ensureSingletonRow = (table: string, insertSql: string, insertValues: any[]) => {
    const row = db.prepare(`SELECT id FROM ${table} WHERE student_id = ? LIMIT 1`).get(pid);
    if (!row) db.prepare(insertSql).run(...insertValues);
  };

  switch (section.toLowerCase()) {
    case 'profile':
    case 'general': {
      if (data.avatarUrl && !data.avatar) {
        data.avatar = data.avatarUrl;
      }
      const fields = [
        'name', 'phone', 'email', 'avatar', 'dob', 'address', 'nationality', 'country',
        'preferred_course', 'alternative_courses', 'course_level', 'intake', 'budget', 'current_stage',
        'stage_number', 'overall_status', 'priority', 'target_university',
        'next_follow_up', 'enrollment_date'
      ];
      const updates: string[] = [];
      const values: any[] = [];
      for (const f of fields) {
        if (data[f] !== undefined) {
          updates.push(`${f} = ?`);
          values.push(data[f]);
        }
      }
      if (updates.length > 0) {
        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(pid);
        db.prepare(`UPDATE student_profiles SET ${updates.join(', ')} WHERE id = ?`).run(...values);
      }
      break;
    }

    case 'academic': {
      ensureSingletonRow(
        'academic_records',
        `INSERT INTO academic_records (id, student_id) VALUES (?, ?)`,
        [crypto.randomUUID(), pid]
      );
      db.prepare(`
        UPDATE academic_records SET
          tenth_board = COALESCE(?, tenth_board),
          tenth_percentage = COALESCE(?, tenth_percentage),
          twelfth_board = COALESCE(?, twelfth_board),
          twelfth_percentage = COALESCE(?, twelfth_percentage),
          bachelor_degree = COALESCE(?, bachelor_degree),
          bachelor_university = COALESCE(?, bachelor_university),
          bachelor_cgpa = COALESCE(?, bachelor_cgpa),
          bachelor_passing_year = COALESCE(?, bachelor_passing_year),
          backlogs = COALESCE(?, backlogs),
          education_gaps = COALESCE(?, education_gaps),
          work_experience = COALESCE(?, work_experience),
          updated_at = CURRENT_TIMESTAMP
        WHERE student_id = ?
      `).run(
        data.tenth_board ?? null,
        data.tenth_percentage ?? null,
        data.twelfth_board ?? null,
        data.twelfth_percentage ?? null,
        data.bachelor_degree ?? null,
        data.bachelor_university ?? null,
        data.bachelor_cgpa ?? null,
        data.bachelor_passing_year ?? null,
        data.backlogs ?? null,
        data.education_gaps ?? null,
        data.work_experience ?? null,
        pid
      );
      break;
    }

    case 'counselling': {
      ensureSingletonRow(
        'counselling_records',
        `INSERT INTO counselling_records (id, student_id, counsellor_name) VALUES (?, ?, ?)`,
        [crypto.randomUUID(), pid, data.counsellor_name || profile.counsellor_name || 'Assigned Counsellor']
      );
      db.prepare(`
        UPDATE counselling_records SET
          counsellor_name = COALESCE(?, counsellor_name),
          session_date = COALESCE(?, session_date),
          preferred_countries = COALESCE(?, preferred_countries),
          budget_bracket = COALESCE(?, budget_bracket),
          notes = COALESCE(?, notes),
          recommendations = COALESCE(?, recommendations),
          outcome = COALESCE(?, outcome),
          updated_at = CURRENT_TIMESTAMP
        WHERE student_id = ?
      `).run(
        data.counsellor_name ?? null,
        data.session_date ?? null,
        data.preferred_countries ?? null,
        data.budget_bracket ?? null,
        data.notes ?? null,
        data.recommendations ?? null,
        data.outcome ?? null,
        pid
      );
      break;
    }

    case 'scholarship': {
      ensureSingletonRow(
        'scholarships',
        `INSERT INTO scholarships (id, student_id) VALUES (?, ?)`,
        [crypto.randomUUID(), pid]
      );
      db.prepare(`
        UPDATE scholarships SET
          scholarship_name = COALESCE(?, scholarship_name),
          isee_parificato_amount = COALESCE(?, isee_parificato_amount),
          stipend_amount = COALESCE(?, stipend_amount),
          status = COALESCE(?, status),
          updated_at = CURRENT_TIMESTAMP
        WHERE student_id = ?
      `).run(
        data.scholarship_name ?? null,
        data.isee_parificato_amount ?? null,
        data.stipend_amount ?? null,
        data.status ?? null,
        pid
      );
      break;
    }

    case 'visa': {
      ensureSingletonRow(
        'visa_processes',
        `INSERT INTO visa_processes (id, student_id) VALUES (?, ?)`,
        [crypto.randomUUID(), pid]
      );
      db.prepare(`
        UPDATE visa_processes SET
          vfs_center = COALESCE(?, vfs_center),
          appointment_date = COALESCE(?, appointment_date),
          appointment_time = COALESCE(?, appointment_time),
          visa_type = COALESCE(?, visa_type),
          vfs_reference_no = COALESCE(?, vfs_reference_no),
          checklist_verification = COALESCE(?, checklist_verification),
          financial_proof_amount = COALESCE(?, financial_proof_amount),
          decision = COALESCE(?, decision),
          decision_date = COALESCE(?, decision_date),
          updated_at = CURRENT_TIMESTAMP
        WHERE student_id = ?
      `).run(
        data.vfs_center ?? null,
        data.appointment_date ?? null,
        data.appointment_time ?? null,
        data.visa_type ?? null,
        data.vfs_reference_no ?? null,
        data.checklist_verification ?? null,
        data.financial_proof_amount ?? null,
        data.decision ?? null,
        data.decision_date ?? null,
        pid
      );
      break;
    }

    case 'approval':
    case 'payment':
    case 'agreement': {
      ensureSingletonRow(
        'student_approvals',
        `INSERT INTO student_approvals (id, student_id) VALUES (?, ?)`,
        [crypto.randomUUID(), pid]
      );
      db.prepare(`
        UPDATE student_approvals SET
          choice_1_university = COALESCE(?, choice_1_university),
          choice_2_university = COALESCE(?, choice_2_university),
          agreement_signed = COALESCE(?, agreement_signed),
          agreement_status = COALESCE(?, agreement_status),
          student_signature_note = COALESCE(?, student_signature_note),
          service_package = COALESCE(?, service_package),
          total_fee = COALESCE(?, total_fee),
          amount_paid = COALESCE(?, amount_paid),
          balance = COALESCE(?, balance),
          payment_schedule = COALESCE(?, payment_schedule),
          updated_at = CURRENT_TIMESTAMP
        WHERE student_id = ?
      `).run(
        data.choice_1_university ?? null,
        data.choice_2_university ?? null,
        data.agreement_signed === undefined
          ? null
          : typeof data.agreement_signed === 'boolean'
            ? (data.agreement_signed ? 1 : 0)
            : data.agreement_signed,
        data.agreement_status ?? null,
        data.student_signature_note ?? null,
        data.service_package ?? null,
        data.total_fee ?? null,
        data.amount_paid ?? null,
        data.balance ?? null,
        data.payment_schedule ?? null,
        pid
      );
      break;
    }

    case 'documents':
    case 'document': {
      const docName = data.document_name || data.name;
      if (data.id) {
        db.prepare(`
          UPDATE documents_checklist SET
            document_name = COALESCE(?, document_name),
            category = COALESCE(?, category),
            status = COALESCE(?, status),
            remarks = COALESCE(?, remarks),
            verified_by = COALESCE(?, verified_by),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND student_id = ?
        `).run(
          docName ?? null,
          data.category ?? null,
          data.status ?? null,
          data.remarks ?? null,
          data.verified_by ?? null,
          data.id,
          pid
        );
      } else if (docName) {
        db.prepare(`
          INSERT INTO documents_checklist (id, student_id, document_name, category, status, remarks, verified_by)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          crypto.randomUUID(),
          pid,
          docName,
          data.category || 'Academic',
          data.status || 'Pending',
          data.remarks || null,
          data.verified_by || null
        );
      }
      break;
    }

    case 'applications':
    case 'application': {
      if (data.id) {
        db.prepare(`
          UPDATE university_applications SET
            university_name = COALESCE(?, university_name),
            program_name = COALESCE(?, program_name),
            portal_application_id = COALESCE(?, portal_application_id),
            submission_date = COALESCE(?, submission_date),
            status = COALESCE(?, status)
          WHERE id = ? AND student_id = ?
        `).run(
          data.university_name ?? data.university ?? null,
          data.program_name ?? data.program ?? null,
          data.portal_application_id ?? null,
          data.submission_date ?? data.date ?? null,
          data.status ?? null,
          data.id,
          pid
        );
      } else if (data.university_name || data.university) {
        db.prepare(`
          INSERT INTO university_applications
            (id, student_id, university_name, program_name, portal_application_id, submission_date, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          crypto.randomUUID(),
          pid,
          data.university_name || data.university,
          data.program_name || data.program || 'Program',
          data.portal_application_id || `APP-${Math.floor(10000 + Math.random() * 90000)}`,
          data.submission_date || data.date || new Date().toISOString().slice(0, 10),
          data.status || 'Submitted'
        );
      }
      break;
    }

    case 'offers':
    case 'offer':
    case 'offer-letters': {
      if (data.id) {
        db.prepare(`
          UPDATE offer_letters SET
            university_name = COALESCE(?, university_name),
            offer_type = COALESCE(?, offer_type),
            received_date = COALESCE(?, received_date),
            conditions = COALESCE(?, conditions),
            deposit_amount = COALESCE(?, deposit_amount),
            deposit_deadline = COALESCE(?, deposit_deadline),
            seat_confirmed = COALESCE(?, seat_confirmed),
            status = COALESCE(?, status),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND student_id = ?
        `).run(
          data.university_name ?? data.university ?? null,
          data.offer_type ?? data.type ?? null,
          data.received_date ?? data.date ?? null,
          data.conditions ?? null,
          data.deposit_amount ?? null,
          data.deposit_deadline ?? null,
          data.seat_confirmed === undefined ? null : (data.seat_confirmed ? 1 : 0),
          data.status ?? null,
          data.id,
          pid
        );
      } else if (data.university_name || data.university) {
        db.prepare(`
          INSERT INTO offer_letters
            (id, student_id, university_name, offer_type, received_date, conditions, deposit_amount, deposit_deadline, seat_confirmed, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          crypto.randomUUID(),
          pid,
          data.university_name || data.university,
          data.offer_type || data.type || 'Unconditional Offer',
          data.received_date || data.date || new Date().toISOString().slice(0, 10),
          data.conditions || null,
          data.deposit_amount || null,
          data.deposit_deadline || null,
          data.seat_confirmed === undefined ? 1 : (data.seat_confirmed ? 1 : 0),
          data.status || 'Received'
        );
      }
      break;
    }

    case 'shortlists':
    case 'shortlist': {
      if (data.id) {
        db.prepare(`
          UPDATE university_shortlists SET
            university_name = COALESCE(?, university_name),
            program_name = COALESCE(?, program_name),
            country = COALESCE(?, country),
            tuition_fee = COALESCE(?, tuition_fee),
            cfu_credits = COALESCE(?, cfu_credits),
            status = COALESCE(?, status)
          WHERE id = ? AND student_id = ?
        `).run(
          data.university_name ?? data.university ?? null,
          data.program_name ?? data.program ?? null,
          data.country ?? null,
          data.tuition_fee ?? null,
          data.cfu_credits ?? null,
          data.status ?? null,
          data.id,
          pid
        );
      } else if (data.university_name || data.university) {
        db.prepare(`
          INSERT INTO university_shortlists
            (id, student_id, university_name, program_name, country, tuition_fee, cfu_credits, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          crypto.randomUUID(),
          pid,
          data.university_name || data.university,
          data.program_name || data.program || 'Program',
          data.country || profile.country,
          data.tuition_fee || null,
          data.cfu_credits || '120 ECTS',
          data.status || 'Shortlisted'
        );
      }
      break;
    }

    case 'test_scores':
    case 'tests':
    case 'test': {
      if (data.id) {
        db.prepare(`
          UPDATE test_scores SET
            test_type = COALESCE(?, test_type),
            overall_score = COALESCE(?, overall_score),
            reading = COALESCE(?, reading),
            writing = COALESCE(?, writing),
            listening = COALESCE(?, listening),
            speaking = COALESCE(?, speaking),
            test_date = COALESCE(?, test_date),
            status = COALESCE(?, status)
          WHERE id = ? AND student_id = ?
        `).run(
          data.test_type ?? null,
          data.overall_score ?? null,
          data.reading ?? null,
          data.writing ?? null,
          data.listening ?? null,
          data.speaking ?? null,
          data.test_date ?? null,
          data.status ?? null,
          data.id,
          pid
        );
      } else if (data.test_type || data.overall_score) {
        db.prepare(`
          INSERT INTO test_scores
            (id, student_id, test_type, overall_score, reading, writing, listening, speaking, test_date, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          crypto.randomUUID(),
          pid,
          data.test_type || 'IELTS',
          data.overall_score || '',
          data.reading || null,
          data.writing || null,
          data.listening || null,
          data.speaking || null,
          data.test_date || new Date().toISOString().slice(0, 10),
          data.status || 'Reported'
        );
      }
      break;
    }

    case 'pre-enrolment':
    case 'pre_enrolment':
    case 'preenrolment': {
      ensureSingletonRow(
        'pre_enrolments',
        `INSERT INTO pre_enrolments (id, student_id) VALUES (?, ?)`,
        [crypto.randomUUID(), pid]
      );
      db.prepare(`
        UPDATE pre_enrolments SET
          universitaly_summary_code = COALESCE(?, universitaly_summary_code),
          university_validation_status = COALESCE(?, university_validation_status),
          status = COALESCE(?, status),
          updated_at = CURRENT_TIMESTAMP
        WHERE student_id = ?
      `).run(
        data.universitaly_summary_code ?? null,
        data.university_validation_status ?? null,
        data.status ?? null,
        pid
      );
      break;
    }

    case 'dov':
    case 'legalization':
    case 'legalisation':
    case 'dov-cimea': {
      ensureSingletonRow(
        'legalizations',
        `INSERT INTO legalizations (id, student_id) VALUES (?, ?)`,
        [crypto.randomUUID(), pid]
      );
      db.prepare(`
        UPDATE legalizations SET
          process_type = COALESCE(?, process_type),
          cimea_diploma_ref = COALESCE(?, cimea_diploma_ref),
          status = COALESCE(?, status),
          updated_at = CURRENT_TIMESTAMP
        WHERE student_id = ?
      `).run(
        data.process_type ?? null,
        data.cimea_diploma_ref ?? null,
        data.status ?? null,
        pid
      );
      break;
    }

    case 'pre-departure':
    case 'pre_departure':
    case 'predeparture': {
      ensureSingletonRow(
        'pre_departures',
        `INSERT INTO pre_departures (id, student_id) VALUES (?, ?)`,
        [crypto.randomUUID(), pid]
      );
      db.prepare(`
        UPDATE pre_departures SET
          flight_booking_status = COALESCE(?, flight_booking_status),
          accommodation_status = COALESCE(?, accommodation_status),
          forex_card_status = COALESCE(?, forex_card_status),
          status = COALESCE(?, status),
          updated_at = CURRENT_TIMESTAMP
        WHERE student_id = ?
      `).run(
        data.flight_booking_status ?? null,
        data.accommodation_status ?? null,
        data.forex_card_status ?? null,
        data.status ?? null,
        pid
      );
      break;
    }

    case 'payments':
    case 'payment': {
      ensureSingletonRow(
        'student_payments',
        `INSERT INTO student_payments (id, student_id, agreed_budget) VALUES (?, ?, ?)`,
        [crypto.randomUUID(), pid, profile.budget || '€ 18,000 / yr']
      );

      // 1. Update the parent payment plan if provided
      if (
        data.plan_name !== undefined ||
        data.agreed_budget !== undefined ||
        data.total_package_fee !== undefined ||
        data.installment_count !== undefined ||
        data.gst_included !== undefined ||
        data.gst_percentage !== undefined ||
        data.currency !== undefined ||
        data.payment_status !== undefined ||
        data.notes !== undefined
      ) {
        db.prepare(`
          UPDATE student_payments SET
            plan_name = COALESCE(?, plan_name),
            agreed_budget = COALESCE(?, agreed_budget),
            total_package_fee = COALESCE(?, total_package_fee),
            installment_count = COALESCE(?, installment_count),
            gst_included = COALESCE(?, gst_included),
            gst_percentage = COALESCE(?, gst_percentage),
            currency = COALESCE(?, currency),
            payment_status = COALESCE(?, payment_status),
            notes = COALESCE(?, notes),
            updated_at = CURRENT_TIMESTAMP
          WHERE student_id = ?
        `).run(
          data.plan_name ?? null,
          data.agreed_budget ?? null,
          data.total_package_fee !== undefined ? Number(data.total_package_fee) : null,
          data.installment_count !== undefined ? Number(data.installment_count) : null,
          data.gst_included !== undefined ? (data.gst_included ? 1 : 0) : null,
          data.gst_percentage !== undefined ? Number(data.gst_percentage) : null,
          data.currency ?? null,
          data.payment_status ?? null,
          data.notes ?? null,
          pid
        );

        if (data.agreed_budget) {
          db.prepare(`UPDATE student_profiles SET budget = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(data.agreed_budget, pid);
        }
      }

      // 2. Add or update installment transaction if provided in data
      if (data.installment) {
        const inst = data.installment;
        const instId = inst.id || crypto.randomUUID();
        const existingInst = db.prepare(`SELECT id FROM payment_installments WHERE id = ? AND student_id = ?`).get(instId, pid) as any;
        const gstRate = inst.gst_rate !== undefined ? Number(inst.gst_rate) : 18.0;
        const gstType = inst.gst_type || (gstRate > 0 ? `With GST (${gstRate}%)` : 'Without GST');
        const amount = Number(inst.amount || 0);
        const gstAmount = gstRate > 0 ? (amount * gstRate) / 100 : 0;
        const totalAmount = inst.total_amount !== undefined ? Number(inst.total_amount) : amount + gstAmount;

        if (existingInst) {
          const finalAmount = inst.amount !== undefined ? Number(inst.amount) : Number(existingInst.amount || 0);
          const finalGstRate = inst.gst_rate !== undefined ? Number(inst.gst_rate) : Number(existingInst.gst_rate ?? 18.0);
          const finalGstType = inst.gst_type || (finalGstRate > 0 ? `With GST (${finalGstRate}%)` : 'Without GST');
          const finalGstAmount = finalGstRate > 0 ? (finalAmount * finalGstRate) / 100 : 0;
          const finalTotalAmount = inst.total_amount !== undefined ? Number(inst.total_amount) : finalAmount + finalGstAmount;

          db.prepare(`
            UPDATE payment_installments SET
              title = COALESCE(?, title),
              installment_number = COALESCE(?, installment_number),
              amount = ?,
              gst_rate = ?,
              gst_type = ?,
              gst_amount = ?,
              total_amount = ?,
              payment_date = COALESCE(?, payment_date),
              due_date = COALESCE(?, due_date),
              payment_mode = COALESCE(?, payment_mode),
              transaction_ref = COALESCE(?, transaction_ref),
              receipt_no = COALESCE(?, receipt_no),
              status = COALESCE(?, status),
              collected_by = COALESCE(?, collected_by),
              notes = COALESCE(?, notes),
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND student_id = ?
          `).run(
            inst.title ?? null,
            inst.installment_number !== undefined ? Number(inst.installment_number) : null,
            finalAmount,
            finalGstRate,
            finalGstType,
            finalGstAmount,
            finalTotalAmount,
            inst.payment_date ?? null,
            inst.due_date ?? null,
            inst.payment_mode ?? null,
            inst.transaction_ref ?? null,
            inst.receipt_no ?? null,
            inst.status ?? null,
            inst.collected_by ?? operatorName,
            inst.notes ?? null,
            instId,
            pid
          );
        } else {
          const parentPayment = db.prepare(`SELECT id FROM student_payments WHERE student_id = ? LIMIT 1`).get(pid) as any;
          db.prepare(`
            INSERT INTO payment_installments (
              id, student_id, payment_id, installment_number, title, amount,
              gst_rate, gst_type, gst_amount, total_amount, payment_date,
              due_date, payment_mode, transaction_ref, receipt_no, status,
              collected_by, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            instId,
            pid,
            parentPayment?.id || null,
            inst.installment_number !== undefined ? Number(inst.installment_number) : 1,
            inst.title || `Installment ${inst.installment_number || 1}`,
            amount,
            gstRate,
            gstType,
            gstAmount,
            totalAmount,
            inst.payment_date || new Date().toISOString().slice(0, 10),
            inst.due_date || null,
            inst.payment_mode || 'UPI',
            inst.transaction_ref || '',
            inst.receipt_no || `REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
            inst.status || 'Paid',
            inst.collected_by || operatorName,
            inst.notes || null
          );
        }
      }

      // 3. Recalculate totals: total_paid, balance_due, and overall payment_status
      const paidRows = db.prepare(`SELECT SUM(total_amount) as sum_paid FROM payment_installments WHERE student_id = ? AND status = 'Paid'`).get(pid) as any;
      const totalPaid = Number(paidRows?.sum_paid || 0);

      const parentPlan = db.prepare(`SELECT total_package_fee FROM student_payments WHERE student_id = ?`).get(pid) as any;
      const totalPackageFee = Number(parentPlan?.total_package_fee || 0);
      const balanceDue = Math.max(0, totalPackageFee - totalPaid);

      let overallStatus = 'Pending';
      if (totalPaid >= totalPackageFee && totalPackageFee > 0) {
        overallStatus = 'Paid';
      } else if (totalPaid > 0) {
        overallStatus = 'Partially Paid';
      }

      db.prepare(`
        UPDATE student_payments SET
          total_paid = ?,
          balance_due = ?,
          payment_status = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE student_id = ?
      `).run(totalPaid, balanceDue, overallStatus, pid);

      break;
    }

    default:
      break;
  }

  // Log activity
  logTimelineActivity(
    studentIdOrCode,
    `Updated ${section.toUpperCase()} section`,
    `Modified by ${operatorName} (${portalRole} portal)`,
    operatorName,
    portalRole
  );

  const after = getProfileFromDb(db, pid, folderName);

  const actorCtx: AuditActorContext = {
    name: data?._actor?.name || actorDetails?.name || operatorName,
    email: data?._actor?.email || actorDetails?.email || null,
    role: data?._actor?.role || actorDetails?.role || portalRole,
    portal:
      data?._actor?.portal ||
      data?._portal ||
      actorDetails?.portal ||
      (portalRole ? `${portalRole.charAt(0).toUpperCase() + portalRole.slice(1)} Portal` : 'Counsellor Portal'),
    skipAudit: actorDetails?.skipAudit ?? data?._skipAudit ?? false,
  };

  diffAndLogStudentProfile(before, after, actorCtx);

  return after;
}

/**
 * Adds a booked counselling session row to the student's dedicated database.
 */
export function createCounsellingSession(
  studentIdOrCode: string,
  data: Record<string, any>,
  operatorName = 'Staff Operator',
  portalRole = 'counsellor',
  actorDetails?: AuditActorContext
): CommonStudentProfile | null {
  const before = getProfileById(studentIdOrCode);
  if (!before || !before.folder_name) return null;

  const folderName = before.folder_name;
  const dbPath = path.join(DB_DIR, folderName, `${folderName}.db`);
  const db = getStudentDb(dbPath);
  const id = crypto.randomUUID();
  const now = new Date();
  const fallbackDate = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const fallbackTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  db.prepare(`
    INSERT INTO counselling_sessions (
      id, student_id, lead_id, session_date, session_time, counsellor_name,
      session_type, mode, status, notes, recommendations, concerns, outcome
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    before.id,
    before.lead_id || null,
    data.session_date || data.date || fallbackDate,
    data.session_time || data.time || fallbackTime,
    data.counsellor_name || data.counsellorName || operatorName,
    data.session_type || data.sessionType || '1-on-1 Consultation',
    data.mode || 'Video Call',
    data.status || 'Scheduled',
    data.notes || '',
    data.recommendations || null,
    data.concerns || null,
    data.outcome || null
  );

  logTimelineActivity(
    studentIdOrCode,
    'Counselling session booked',
    `${data.session_date || data.date || fallbackDate} at ${data.session_time || data.time || fallbackTime} — ${data.session_type || '1-on-1 Consultation'} (${data.mode || 'Video Call'})`,
    operatorName,
    portalRole
  );

  const after = getProfileFromDb(db, before.id, folderName);

  const actorCtx: AuditActorContext = {
    name: data?._actor?.name || actorDetails?.name || operatorName,
    email: data?._actor?.email || actorDetails?.email || null,
    role: data?._actor?.role || actorDetails?.role || portalRole,
    portal:
      data?._actor?.portal ||
      data?._portal ||
      actorDetails?.portal ||
      (portalRole ? `${portalRole.charAt(0).toUpperCase() + portalRole.slice(1)} Portal` : 'Counsellor Portal'),
    skipAudit: actorDetails?.skipAudit ?? false,
  };

  diffAndLogStudentProfile(before, after, actorCtx);

  return after;
}

/**
 * Deletes a booked counselling session from the student's dedicated database.
 */
export function deleteCounsellingSession(
  studentIdOrCode: string,
  sessionId: string,
  operatorName = 'Staff Operator',
  portalRole = 'counsellor',
  actorDetails?: AuditActorContext
): CommonStudentProfile | null {
  const before = getProfileById(studentIdOrCode);
  if (!before || !before.folder_name) return null;

  const folderName = before.folder_name;
  const dbPath = path.join(DB_DIR, folderName, `${folderName}.db`);
  const db = getStudentDb(dbPath);
  db.prepare(`DELETE FROM counselling_sessions WHERE id = ? AND student_id = ?`).run(sessionId, before.id);

  logTimelineActivity(
    studentIdOrCode,
    'Counselling session removed',
    `Session ${sessionId} deleted`,
    operatorName,
    portalRole
  );

  const after = getProfileFromDb(db, before.id, folderName);

  const actorCtx: AuditActorContext = {
    name: actorDetails?.name || operatorName,
    email: actorDetails?.email || null,
    role: actorDetails?.role || portalRole,
    portal: actorDetails?.portal || (portalRole ? `${portalRole.charAt(0).toUpperCase() + portalRole.slice(1)} Portal` : 'Counsellor Portal'),
    skipAudit: actorDetails?.skipAudit ?? false,
  };

  diffAndLogStudentProfile(before, after, actorCtx);

  return after;
}

/**
 * Deletes a payment installment and recalculates totals
 */
export function deletePaymentInstallment(
  studentIdOrCode: string,
  installmentId: string,
  operatorName = 'Staff Operator',
  portalRole = 'counsellor',
  actorDetails?: AuditActorContext
): CommonStudentProfile | null {
  const before = getProfileById(studentIdOrCode);
  if (!before || !before.folder_name) return null;

  const folderName = before.folder_name;
  const dbPath = path.join(DB_DIR, folderName, `${folderName}.db`);
  const db = getStudentDb(dbPath);
  const pid = before.id;

  db.prepare(`DELETE FROM payment_installments WHERE id = ? AND student_id = ?`).run(installmentId, pid);

  // Recalculate totals
  const paidRows = db.prepare(`SELECT SUM(total_amount) as sum_paid FROM payment_installments WHERE student_id = ? AND status = 'Paid'`).get(pid) as any;
  const totalPaid = Number(paidRows?.sum_paid || 0);

  const parentPlan = db.prepare(`SELECT total_package_fee FROM student_payments WHERE student_id = ?`).get(pid) as any;
  const totalPackageFee = Number(parentPlan?.total_package_fee || 0);
  const balanceDue = Math.max(0, totalPackageFee - totalPaid);

  let overallStatus = 'Pending';
  if (totalPaid >= totalPackageFee && totalPackageFee > 0) {
    overallStatus = 'Paid';
  } else if (totalPaid > 0) {
    overallStatus = 'Partially Paid';
  }

  db.prepare(`
    UPDATE student_payments SET
      total_paid = ?,
      balance_due = ?,
      payment_status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE student_id = ?
  `).run(totalPaid, balanceDue, overallStatus, pid);

  logTimelineActivity(
    studentIdOrCode,
    'Payment installment removed',
    `Installment ${installmentId} deleted by ${operatorName}`,
    operatorName,
    portalRole
  );

  const after = getProfileFromDb(db, pid, folderName);

  const actorCtx: AuditActorContext = {
    name: actorDetails?.name || operatorName,
    email: actorDetails?.email || null,
    role: actorDetails?.role || portalRole,
    portal: actorDetails?.portal || (portalRole ? `${portalRole.charAt(0).toUpperCase() + portalRole.slice(1)} Portal` : 'Counsellor Portal'),
    skipAudit: actorDetails?.skipAudit ?? false,
  };

  diffAndLogStudentProfile(before, after, actorCtx);

  return after;
}


/**
 * Appends audit timeline activity to student's database
 */
export function logTimelineActivity(
  studentIdOrCode: string,
  action: string,
  details?: string,
  operatorName = 'Staff Operator',
  portalRole = 'counsellor'
): void {
  const profile = getProfileById(studentIdOrCode);
  if (!profile || !profile.folder_name) return;

  const dbPath = path.join(DB_DIR, profile.folder_name, `${profile.folder_name}.db`);
  const db = getStudentDb(dbPath);

  db.prepare(`
    INSERT INTO timeline_activities (id, student_id, action, portal_role, operator_name, details, dot_color)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    crypto.randomUUID(),
    profile.id,
    action,
    portalRole,
    operatorName,
    details || '',
    portalRole === 'visa' ? 'bg-cyan-500' : portalRole === 'scholarship' ? 'bg-amber-500' : 'bg-blue-500'
  );
}

/**
 * Ensures the initial 4 clean students have their dedicated folders, .db files, and documents
 */
let isSeeded = false;
export function ensureInitialSeeding(): void {
  if (isSeeded) return;
  isSeeded = true;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  // Remove old monolithic students.db files if they exist in the root of student_profile
  const rootOldFiles = ['students.db', 'students.db-shm', 'students.db-wal', 'db.js'];
  for (const f of rootOldFiles) {
    const p = path.join(DB_DIR, f);
    if (fs.existsSync(p)) {
      try {
        fs.unlinkSync(p);
      } catch {}
    }
  }

  // Check if student profile folders already exist.
  // If student profile folders already exist, NEVER auto-inject seed profiles.
  const existingEntries = fs.readdirSync(DB_DIR, { withFileTypes: true }).filter((e) => e.isDirectory());
  if (existingEntries.length > 0) {
    return;
  }

  const initialSeedData = [
    {
      id: 'prof-rahul',
      student_id: 'ITA-2027-001',
      lead_id: 'L2025100501',
      name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      email: 'rahul@gmail.com',
      dob: '12 May 2000',
      address: 'Indore, Madhya Pradesh',
      country: 'Italy',
      country_code: 'ITA',
      preferred_course: 'MSc Computer Science',
      target_university: 'Sapienza University of Rome',
      budget: '€ 8,000 – 15,000',
      counsellor_name: 'Neha Sharma',
      overall_status: 'University Matching',
      current_stage: 'University Matching & Qualification',
      stage_number: 2,
    },
    {
      id: 'prof-priya',
      student_id: 'GER-2026-004',
      lead_id: 'L2025100402',
      name: 'Priya Singh',
      phone: '+91 87654 32109',
      email: 'priya.singh@gmail.com',
      dob: '18 Aug 1999',
      address: 'Jaipur, Rajasthan',
      country: 'Germany',
      country_code: 'GER',
      preferred_course: 'Global MBA',
      target_university: 'Technical University of Munich',
      budget: '€ 10,000 – 20,000',
      counsellor_name: 'Neha Sharma',
      overall_status: 'Shortlisting',
      current_stage: 'University Shortlisting',
      stage_number: 2,
    },
    {
      id: 'prof-amit',
      student_id: 'CAN-2026-003',
      lead_id: 'L2025100303',
      name: 'Amit Kumar',
      phone: '+91 95432 16789',
      email: 'amit.kumar@gmail.com',
      dob: '04 Nov 2001',
      address: 'Chandigarh, Punjab',
      country: 'Canada',
      country_code: 'CAN',
      preferred_course: 'MSc Data Science',
      target_university: 'University of Toronto',
      budget: 'CAD 25,000 – 35,000',
      counsellor_name: 'Neha Sharma',
      overall_status: 'Approval',
      current_stage: 'Student Approval Pending',
      stage_number: 3,
    },
    {
      id: 'prof-sneha',
      student_id: 'UK-2026-012',
      lead_id: 'L2025100504',
      name: 'Sneha Patel',
      phone: '+91 99876 54321',
      email: 'sneha.patel@gmail.com',
      dob: '22 Mar 2003',
      address: 'Ahmedabad, Gujarat',
      country: 'United Kingdom',
      country_code: 'UK',
      preferred_course: 'BSc Nursing',
      target_university: 'University of Manchester',
      budget: '£ 20,000 – 28,000',
      counsellor_name: 'Neha Sharma',
      overall_status: 'Documentation',
      current_stage: 'Documentation Verified & Visa Prep',
      stage_number: 4,
    },
  ];

  for (const s of initialSeedData) {
    const folderName = getStudentFolderName(s.name, s.phone);
    const dbPath = path.join(DB_DIR, folderName, `${folderName}.db`);
    if (!fs.existsSync(dbPath)) {
      console.log(`📁 Auto-creating dedicated student profile folder & DB for: ${s.name} (${folderName})`);
      createStudentFolderAndDb(s, true);
    }
  }
}

// ===================================================================
// PROFILE AUDIT LOG — central change history shared by all 6 portals
// Stored in student_profile/system_databases/history.db (single SQLite file).
// Every row = one field change (or lifecycle event) on a student
// profile, with who made it, from which portal, and when.
// ===================================================================

export interface ProfileAuditEntry {
  id: string;
  entityType: string; // 'lead' | 'student-profile'
  entityId: string; // prisma id / profile id
  entityCode: string | null; // human code: leadId / student_id
  studentName: string | null;
  action: string; // 'created' | 'updated' | 'stage-changed' | ...
  field: string | null; // e.g. 'phone' (null for lifecycle events)
  oldValue: string | null;
  newValue: string | null;
  actorName: string | null;
  actorEmail: string | null;
  actorRole: string | null;
  portal: string | null;
  createdAt: string;
}

export interface LogProfileAuditInput {
  entityType: string;
  entityId: string;
  entityCode?: string | null;
  studentName?: string | null;
  action: string;
  field?: string | null;
  oldValue?: unknown;
  newValue?: unknown;
  actorName?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  portal?: string | null;
}

export interface AuditActorContext {
  name?: string | null;
  email?: string | null;
  role?: string | null;
  portal?: string | null;
  skipAudit?: boolean;
}

function toAuditString(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'object') {
    try {
      const s = JSON.stringify(v);
      return s.length > 400 ? s.slice(0, 400) + '…' : s;
    } catch {
      return String(v);
    }
  }
  const s = String(v).trim();
  if (s === '') return null;
  return s.length > 400 ? s.slice(0, 400) + '…' : s;
}

export function getAuditDb(): DatabaseSync {
  const db = getStudentDb(AUDIT_DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS profile_audit (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      entity_code TEXT,
      student_name TEXT,
      action TEXT NOT NULL,
      field TEXT,
      old_value TEXT,
      new_value TEXT,
      actor_name TEXT,
      actor_email TEXT,
      actor_role TEXT,
      portal TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_audit_entity ON profile_audit(entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS idx_audit_created ON profile_audit(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_portal ON profile_audit(portal);
  `);
  return db;
}

export function logProfileAudit(input: LogProfileAuditInput): void {
  try {
    const db = getAuditDb();
    db.prepare(`
      INSERT INTO profile_audit
        (id, entity_type, entity_id, entity_code, student_name, action, field,
         old_value, new_value, actor_name, actor_email, actor_role, portal)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      crypto.randomUUID(),
      input.entityType,
      String(input.entityId),
      input.entityCode ?? null,
      input.studentName ?? null,
      input.action,
      input.field ?? null,
      toAuditString(input.oldValue),
      toAuditString(input.newValue),
      input.actorName ?? null,
      input.actorEmail ?? null,
      input.actorRole ?? null,
      input.portal ?? null
    );
  } catch (err) {
    console.error('Failed to write profile audit entry:', err);
  }
}

/**
 * Deep-diffs before and after CommonStudentProfile snapshots and logs every changed field
 * to the SQLite history.db audit trail (student details, status, stages, payments, etc.)
 */
export function diffAndLogStudentProfile(
  before: CommonStudentProfile | null,
  after: CommonStudentProfile | null,
  actor: AuditActorContext = {}
): void {
  if (actor.skipAudit) return;
  if (!before && !after) return;

  const actorName = actor.name || 'Staff Operator';
  const actorRole = actor.role || 'counsellor';
  const rolePortal = actorRole ? `${actorRole.charAt(0).toUpperCase() + actorRole.slice(1)} Portal` : 'Counsellor Portal';
  const actorPortal = actor.portal || rolePortal;
  const actorEmail = actor.email || null;

  // Case 1: Newly created profile
  if (!before && after) {
    logProfileAudit({
      entityType: 'student-profile',
      entityId: after.id,
      entityCode: after.student_id,
      studentName: after.name,
      action: 'created',
      field: 'profile',
      newValue: `Created profile for ${after.name} (${after.student_id})`,
      actorName,
      actorEmail,
      actorRole,
      portal: actorPortal,
    });
    return;
  }

  // Case 2: Deleted profile
  if (before && !after) {
    logProfileAudit({
      entityType: 'student-profile',
      entityId: before.id,
      entityCode: before.student_id,
      studentName: before.name,
      action: 'deleted',
      field: 'profile',
      oldValue: `${before.name} (${before.student_id})`,
      newValue: 'Removed from CRM',
      actorName,
      actorEmail,
      actorRole,
      portal: actorPortal,
    });
    return;
  }

  const b = before!;
  const a = after!;
  const entityId = a.id || b.id;
  const entityCode = a.student_id || b.student_id;
  const studentName = a.name || b.name;

  const logChange = (field: string, oldV: any, newV: any, action = 'updated') => {
    const sOld = toAuditString(oldV);
    const sNew = toAuditString(newV);
    if (sOld === sNew) return;
    logProfileAudit({
      entityType: 'student-profile',
      entityId,
      entityCode,
      studentName,
      action,
      field,
      oldValue: sOld,
      newValue: sNew,
      actorName,
      actorEmail,
      actorRole,
      portal: actorPortal,
    });
  };

  // 1. Top-level profile fields
  const TOP_FIELDS: Array<{ key: keyof CommonStudentProfile; isStage?: boolean }> = [
    { key: 'name' },
    { key: 'phone' },
    { key: 'email' },
    { key: 'avatar' },
    { key: 'dob' },
    { key: 'address' },
    { key: 'nationality' },
    { key: 'country' },
    { key: 'target_university' },
    { key: 'preferred_course' },
    { key: 'course_level' },
    { key: 'intake' },
    { key: 'budget' },
    { key: 'counsellor_name' },
    { key: 'enrollment_date' },
    { key: 'next_follow_up' },
    { key: 'priority' },
    { key: 'overall_status', isStage: true },
    { key: 'current_stage', isStage: true },
    { key: 'stage_number', isStage: true },
  ];

  for (const { key, isStage } of TOP_FIELDS) {
    logChange(String(key), (b as any)[key], (a as any)[key], isStage ? 'stage-changed' : 'updated');
  }

  // 2. Academic details
  const ACADEMIC_FIELDS = [
    'tenth_board', 'tenth_percentage', 'tenth_year',
    'twelfth_board', 'twelfth_percentage', 'twelfth_year',
    'bachelor_degree', 'bachelor_university', 'bachelor_cgpa', 'bachelor_passing_year',
    'backlogs', 'education_gaps', 'work_experience'
  ];
  if (b.academic || a.academic) {
    for (const f of ACADEMIC_FIELDS) {
      logChange(f, b.academic?.[f], a.academic?.[f], 'updated');
    }
  }

  // 3. Counselling
  const COUNSELLING_FIELDS = [
    'counsellor_name', 'session_date', 'preferred_countries', 'budget_bracket', 'notes', 'recommendations', 'outcome'
  ];
  if (b.counselling || a.counselling) {
    for (const f of COUNSELLING_FIELDS) {
      logChange(f, b.counselling?.[f], a.counselling?.[f], 'updated');
    }
  }

  // 4. Approval & Agreement (student_approvals)
  const APPROVAL_FIELDS = [
    'choice_1_university', 'choice_2_university', 'agreement_signed', 'agreement_status',
    'student_signature_note', 'service_package', 'total_fee', 'amount_paid', 'balance', 'payment_schedule'
  ];
  if (b.approval || a.approval) {
    for (const f of APPROVAL_FIELDS) {
      logChange(f, b.approval?.[f], a.approval?.[f], 'updated');
    }
  }

  // 5. Payment Plan (student_payments)
  const PAYMENT_FIELDS = [
    'plan_name', 'agreed_budget', 'total_package_fee', 'total_paid', 'balance_due',
    'installment_count', 'gst_included', 'gst_percentage', 'gst_amount', 'currency', 'payment_status', 'notes'
  ];
  if (b.payments || a.payments) {
    for (const f of PAYMENT_FIELDS) {
      logChange(f, b.payments?.[f], a.payments?.[f], 'updated');
    }
  }

  // 6. Installments (payment_installments)
  const bInst: any[] = b.installments || [];
  const aInst: any[] = a.installments || [];
  const bInstMap = new Map<string, any>(bInst.map((i: any) => [String(i.id || i.installment_number), i]));
  const aInstMap = new Map<string, any>(aInst.map((i: any) => [String(i.id || i.installment_number), i]));

  for (const [k, inst] of aInstMap.entries()) {
    if (!bInstMap.has(k)) {
      logProfileAudit({
        entityType: 'student-profile',
        entityId,
        entityCode,
        studentName,
        action: 'created',
        field: 'installment',
        oldValue: null,
        newValue: `Installment #${inst.installment_number}: ${inst.title || 'Installment'} - ₹${inst.total_amount ?? inst.amount} (${inst.status || 'Pending'})`,
        actorName,
        actorEmail,
        actorRole,
        portal: actorPortal,
      });
    } else {
      const oldI = bInstMap.get(k);
      const instFields = ['status', 'amount', 'total_amount', 'due_date', 'payment_date', 'payment_mode', 'transaction_ref', 'receipt_no', 'notes'];
      for (const cf of instFields) {
        const fieldKey = cf === 'status' ? 'installment_status' : `installment_${cf}`;
        logChange(fieldKey, oldI[cf], inst[cf], 'updated');
      }
    }
  }

  for (const [k, inst] of bInstMap.entries()) {
    if (!aInstMap.has(k)) {
      logProfileAudit({
        entityType: 'student-profile',
        entityId,
        entityCode,
        studentName,
        action: 'deleted',
        field: 'installment',
        oldValue: `Installment #${inst.installment_number}: ${inst.title || 'Installment'} - ₹${inst.total_amount ?? inst.amount} (${inst.status || 'Pending'})`,
        newValue: 'Removed',
        actorName,
        actorEmail,
        actorRole,
        portal: actorPortal,
      });
    }
  }

  // 7. Counselling Sessions
  const bSessions: any[] = b.counselling_sessions || [];
  const aSessions: any[] = a.counselling_sessions || [];
  const bSessMap = new Map<string, any>(bSessions.map((s: any) => [String(s.id), s]));
  const aSessMap = new Map<string, any>(aSessions.map((s: any) => [String(s.id), s]));

  for (const [id, s] of aSessMap.entries()) {
    if (!bSessMap.has(id)) {
      logProfileAudit({
        entityType: 'student-profile',
        entityId,
        entityCode,
        studentName,
        action: 'created',
        field: 'counselling_session',
        oldValue: null,
        newValue: `${s.session_date} ${s.session_time} with ${s.counsellor_name} (${s.mode || s.session_type || 'Consultation'})`,
        actorName,
        actorEmail,
        actorRole,
        portal: actorPortal,
      });
    } else {
      const oldS = bSessMap.get(id);
      const sessFields = ['status', 'notes', 'recommendations', 'outcome', 'session_date', 'session_time'];
      for (const sf of sessFields) {
        logChange(`counselling_${sf}`, oldS[sf], s[sf], 'updated');
      }
    }
  }

  for (const [id, s] of bSessMap.entries()) {
    if (!aSessMap.has(id)) {
      logProfileAudit({
        entityType: 'student-profile',
        entityId,
        entityCode,
        studentName,
        action: 'deleted',
        field: 'counselling_session',
        oldValue: `${s.session_date} ${s.session_time} with ${s.counsellor_name}`,
        newValue: 'Removed',
        actorName,
        actorEmail,
        actorRole,
        portal: actorPortal,
      });
    }
  }

  // 8. Visa Process
  const VISA_FIELDS = [
    'vfs_center', 'appointment_date', 'appointment_time', 'visa_type',
    'vfs_reference_no', 'checklist_verification', 'financial_proof_amount', 'decision', 'decision_date'
  ];
  if (b.visa || a.visa) {
    for (const f of VISA_FIELDS) {
      logChange(f === 'decision' ? 'visa_decision' : f, b.visa?.[f], a.visa?.[f], f === 'decision' ? 'stage-changed' : 'updated');
    }
  }

  // 9. Scholarship
  const SCHOLARSHIP_FIELDS = ['scholarship_name', 'isee_parificato_amount', 'stipend_amount', 'status'];
  if (b.scholarship || a.scholarship) {
    for (const f of SCHOLARSHIP_FIELDS) {
      logChange(f === 'status' ? 'scholarship_status' : f, b.scholarship?.[f], a.scholarship?.[f], f === 'status' ? 'stage-changed' : 'updated');
    }
  }

  // 10. Pre-Enrolment
  const PRE_ENROLMENT_FIELDS = ['summary_submitted', 'submission_date', 'assigned_embassy', 'status'];
  if (b.pre_enrolment || a.pre_enrolment) {
    for (const f of PRE_ENROLMENT_FIELDS) {
      logChange(f, b.pre_enrolment?.[f], a.pre_enrolment?.[f], f === 'status' ? 'stage-changed' : 'updated');
    }
  }

  // 11. Legalization
  const LEGALIZATION_FIELDS = ['dov_applied', 'cimea_applied', 'apostille_done', 'translation_done', 'status'];
  if (b.legalization || a.legalization) {
    for (const f of LEGALIZATION_FIELDS) {
      logChange(f, b.legalization?.[f], a.legalization?.[f], f === 'status' ? 'stage-changed' : 'updated');
    }
  }

  // 12. Pre-Departure
  const PRE_DEPARTURE_FIELDS = ['accommodation_booked', 'flight_booked', 'forex_card', 'sim_card', 'insurance', 'status'];
  if (b.pre_departure || a.pre_departure) {
    for (const f of PRE_DEPARTURE_FIELDS) {
      logChange(f, b.pre_departure?.[f], a.pre_departure?.[f], f === 'status' ? 'stage-changed' : 'updated');
    }
  }

  // 13. Documents Checklist
  const bDocs: any[] = b.documents || [];
  const aDocs: any[] = a.documents || [];
  const bDocsMap = new Map<string, any>(bDocs.map((d: any) => [d.id || d.document_name, d]));
  for (const doc of aDocs) {
    const key = doc.id || doc.document_name;
    const oldDoc = bDocsMap.get(key);
    if (oldDoc) {
      if (oldDoc.status !== doc.status) {
        logChange(`${doc.document_name} Status`, oldDoc.status, doc.status, 'updated');
      }
      if (oldDoc.remarks !== doc.remarks && (doc.remarks || oldDoc.remarks)) {
        logChange(`${doc.document_name} Remarks`, oldDoc.remarks, doc.remarks, 'updated');
      }
    }
  }
}

export interface AuditFilters {
  search?: string;
  portal?: string;
  action?: string;
  entityId?: string;
  limit?: number;
  offset?: number;
}

export function getProfileAudit(filters: AuditFilters = {}): { total: number; entries: ProfileAuditEntry[] } {
  const db = getAuditDb();
  const where: string[] = [];
  const params: any[] = [];

  if (filters.search && filters.search.trim() !== '') {
    const q = `%${filters.search.trim()}%`;
    where.push(`(student_name LIKE ? OR entity_code LIKE ? OR actor_name LIKE ? OR field LIKE ? OR new_value LIKE ?)`);
    params.push(q, q, q, q, q);
  }
  if (filters.portal && filters.portal !== 'all') {
    where.push(`portal = ?`);
    params.push(filters.portal);
  }
  if (filters.action && filters.action !== 'all') {
    where.push(`action = ?`);
    params.push(filters.action);
  }
  if (filters.entityId) {
    where.push(`entity_id = ?`);
    params.push(filters.entityId);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
  const totalRow = db.prepare(`SELECT COUNT(*) as count FROM profile_audit ${whereSql}`).get(...params) as any;
  const limit = Math.min(Math.max(filters.limit ?? 200, 1), 1000);
  const offset = Math.max(filters.offset ?? 0, 0);

  const rows = db.prepare(
    `SELECT id, entity_type as entityType, entity_id as entityId, entity_code as entityCode,
            student_name as studentName, action, field,
            old_value as oldValue, new_value as newValue,
            actor_name as actorName, actor_email as actorEmail, actor_role as actorRole,
            portal, datetime(created_at) as createdAt
     FROM profile_audit ${whereSql}
     ORDER BY created_at DESC, rowid DESC
     LIMIT ? OFFSET ?`
  ).all(...params, limit, offset) as unknown as ProfileAuditEntry[];

  return { total: totalRow?.count ?? 0, entries: rows };
}

// ===================================================================
// 1. TASKS SQLITE STORE — student_profile/system_databases/tasks.db
// ===================================================================

export interface TaskRecord {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  dueDate: string;
  dueStatus: string;
  completed: boolean;
  priority: string;
  leadId: string | null;
  studentName: string | null;
  assignedTo: string | null;
  assignedToId: string | null;
  createdAt: string;
  updatedAt: string;
}

export function getTasksDb(): DatabaseSync {
  const db = getStudentDb(TASKS_DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT DEFAULT '',
      time TEXT DEFAULT '12:00 PM',
      due_date TEXT DEFAULT 'Today',
      due_status TEXT DEFAULT 'Upcoming',
      completed INTEGER DEFAULT 0,
      priority TEXT DEFAULT 'Medium',
      lead_id TEXT,
      student_name TEXT,
      assigned_to TEXT DEFAULT 'Assigned Counsellor',
      assigned_to_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date);
    CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
  `);
  return db;
}

function seedInitialTasksIfEmpty(db: DatabaseSync): void {
  const countRow = db.prepare(`SELECT COUNT(*) as count FROM tasks`).get() as any;
  if (countRow && countRow.count > 0) return;

  const initial = [
    {
      id: 'task-1',
      title: 'Call Rahul Sharma',
      subtitle: 'Discuss Politecnico di Milano Master in Mechanical Engineering',
      time: '11:00 AM',
      dueDate: 'Today',
      dueStatus: 'Due Now',
      completed: 0,
      priority: 'High',
      studentName: 'Rahul Sharma',
    },
    {
      id: 'task-2',
      title: 'Review SOP Draft',
      subtitle: 'Priya Patel - RWTH Aachen MSc Automotive Systems',
      time: '02:30 PM',
      dueDate: 'Today',
      dueStatus: 'Upcoming',
      completed: 0,
      priority: 'Medium',
      studentName: 'Priya Patel',
    },
    {
      id: 'task-3',
      title: 'Visa Document Verification',
      subtitle: 'Amit Kumar - Italy Student Visa checklist & apostilles',
      time: '04:00 PM',
      dueDate: 'Tomorrow',
      dueStatus: 'Upcoming',
      completed: 0,
      priority: 'High',
      studentName: 'Amit Kumar',
    },
    {
      id: 'task-4',
      title: 'IELTS Score Follow-up',
      subtitle: 'Check TRF certificate upload for Sneha Reddy',
      time: '05:30 PM',
      dueDate: 'Tomorrow',
      dueStatus: 'Upcoming',
      completed: 1,
      priority: 'Low',
      studentName: 'Sneha Reddy',
    },
  ];

  const now = new Date().toISOString();
  for (const t of initial) {
    db.prepare(`
      INSERT INTO tasks (id, title, subtitle, time, due_date, due_status, completed, priority, student_name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(t.id, t.title, t.subtitle, t.time, t.dueDate, t.dueStatus, t.completed, t.priority, t.studentName, now, now);
  }
}

export function getAllTasksFromDb(): TaskRecord[] {
  const db = getTasksDb();
  seedInitialTasksIfEmpty(db);
  const rows = db.prepare(`
    SELECT id, title, subtitle, time,
           due_date as dueDate, due_status as dueStatus,
           completed, priority, lead_id as leadId,
           student_name as studentName, assigned_to as assignedTo,
           assigned_to_id as assignedToId,
           datetime(created_at) as createdAt, datetime(updated_at) as updatedAt
    FROM tasks
    ORDER BY completed ASC, created_at DESC
  `).all() as any[];

  return rows.map((r) => ({
    ...r,
    completed: Boolean(r.completed),
  }));
}

export function getTaskByIdFromDb(id: string): TaskRecord | null {
  const db = getTasksDb();
  const r = db.prepare(`
    SELECT id, title, subtitle, time,
           due_date as dueDate, due_status as dueStatus,
           completed, priority, lead_id as leadId,
           student_name as studentName, assigned_to as assignedTo,
           assigned_to_id as assignedToId,
           datetime(created_at) as createdAt, datetime(updated_at) as updatedAt
    FROM tasks WHERE id = ? LIMIT 1
  `).get(id) as any;
  if (!r) return null;
  return { ...r, completed: Boolean(r.completed) };
}

export function createTaskInDb(data: Partial<TaskRecord>): TaskRecord {
  const db = getTasksDb();
  const id = data.id || `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO tasks (id, title, subtitle, time, due_date, due_status, completed, priority, lead_id, student_name, assigned_to, assigned_to_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.title || 'Follow-up Task',
    data.subtitle || '',
    data.time || '12:00 PM',
    data.dueDate || 'Today',
    data.dueStatus || 'Upcoming',
    data.completed ? 1 : 0,
    data.priority || 'Medium',
    data.leadId || null,
    data.studentName || null,
    data.assignedTo || 'Assigned Counsellor',
    data.assignedToId || null,
    now,
    now
  );
  return {
    id,
    title: data.title || 'Follow-up Task',
    subtitle: data.subtitle || '',
    time: data.time || '12:00 PM',
    dueDate: data.dueDate || 'Today',
    dueStatus: data.dueStatus || 'Upcoming',
    completed: Boolean(data.completed),
    priority: data.priority || 'Medium',
    leadId: data.leadId || null,
    studentName: data.studentName || null,
    assignedTo: data.assignedTo || 'Assigned Counsellor',
    assignedToId: data.assignedToId || null,
    createdAt: now,
    updatedAt: now,
  };
}

export function toggleTaskInDb(id: string): TaskRecord | null {
  const db = getTasksDb();
  const row = db.prepare(`SELECT * FROM tasks WHERE id = ? LIMIT 1`).get(id) as any;
  if (!row) return null;
  const newCompleted = row.completed ? 0 : 1;
  const newDueStatus = newCompleted ? 'Completed' : 'Upcoming';
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE tasks SET completed = ?, due_status = ?, updated_at = ? WHERE id = ?
  `).run(newCompleted, newDueStatus, now, id);

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    time: row.time,
    dueDate: row.due_date,
    dueStatus: newDueStatus,
    completed: Boolean(newCompleted),
    priority: row.priority,
    leadId: row.lead_id,
    studentName: row.student_name,
    assignedTo: row.assigned_to,
    assignedToId: row.assigned_to_id,
    createdAt: row.created_at,
    updatedAt: now,
  };
}

export function deleteTaskFromDb(id: string): boolean {
  const db = getTasksDb();
  const res = db.prepare(`DELETE FROM tasks WHERE id = ?`).run(id);
  return res.changes > 0;
}

// ===================================================================
// 2. FOLLOW-UPS SQLITE STORE — student_profile/system_databases/followups.db
// ===================================================================

export interface FollowUpRecord {
  id: string;
  leadId: string | null;
  studentId: string | null;
  studentName: string;
  date: string;
  time: string;
  task: string;
  reminder: string;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export function getFollowUpsDb(): DatabaseSync {
  const db = getStudentDb(FOLLOWUPS_DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS follow_ups (
      id TEXT PRIMARY KEY,
      lead_id TEXT,
      student_id TEXT,
      student_name TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      task TEXT DEFAULT 'Follow-up discussion',
      reminder TEXT DEFAULT '15 minutes before',
      status TEXT DEFAULT 'Scheduled',
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_followups_date ON follow_ups(date);
    CREATE INDEX IF NOT EXISTS idx_followups_lead ON follow_ups(lead_id);
  `);
  return db;
}

function seedInitialFollowUpsIfEmpty(db: DatabaseSync): void {
  const countRow = db.prepare(`SELECT COUNT(*) as count FROM follow_ups`).get() as any;
  if (countRow && countRow.count > 0) return;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const tomorrow = new Date(Date.now() + 86400000);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  const initial = [
    {
      id: 'fu-1',
      studentName: 'Rahul Sharma',
      date: todayStr,
      time: '11:00 AM',
      task: 'Check transcript apostille and CIMEA application status',
      reminder: '15 minutes before',
      status: 'Scheduled',
      notes: 'Applying for Sapienza University MSc Computer Science.',
    },
    {
      id: 'fu-2',
      studentName: 'Priya Singh',
      date: tomorrowStr,
      time: '02:00 PM',
      task: 'Discuss RWTH Aachen conditional offer response',
      reminder: '30 minutes before',
      status: 'Scheduled',
      notes: 'Requires notarized bachelor degree translation.',
    },
  ];

  const nowIso = new Date().toISOString();
  for (const f of initial) {
    db.prepare(`
      INSERT INTO follow_ups (id, student_name, date, time, task, reminder, status, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(f.id, f.studentName, f.date, f.time, f.task, f.reminder, f.status, f.notes, nowIso, nowIso);
  }
}

export function getAllFollowUpsFromDb(): FollowUpRecord[] {
  const db = getFollowUpsDb();
  seedInitialFollowUpsIfEmpty(db);
  const rows = db.prepare(`
    SELECT id, lead_id as leadId, student_id as studentId,
           student_name as studentName, date, time, task,
           reminder, status, notes,
           datetime(created_at) as createdAt, datetime(updated_at) as updatedAt
    FROM follow_ups
    ORDER BY date ASC, time ASC
  `).all() as any[];

  return rows as FollowUpRecord[];
}

export function createFollowUpInDb(data: Partial<FollowUpRecord>): FollowUpRecord {
  const db = getFollowUpsDb();
  const id = data.id || `fu-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO follow_ups (id, lead_id, student_id, student_name, date, time, task, reminder, status, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.leadId || null,
    data.studentId || null,
    data.studentName || 'Student',
    data.date || new Date().toISOString().slice(0, 10),
    data.time || '11:00 AM',
    data.task || 'Follow-up discussion',
    data.reminder || '15 minutes before',
    data.status || 'Scheduled',
    data.notes || '',
    now,
    now
  );
  return {
    id,
    leadId: data.leadId || null,
    studentId: data.studentId || null,
    studentName: data.studentName || 'Student',
    date: data.date || new Date().toISOString().slice(0, 10),
    time: data.time || '11:00 AM',
    task: data.task || 'Follow-up discussion',
    reminder: data.reminder || '15 minutes before',
    status: data.status || 'Scheduled',
    notes: data.notes || '',
    createdAt: now,
    updatedAt: now,
  };
}

export function deleteFollowUpFromDb(id: string): boolean {
  const db = getFollowUpsDb();
  const res = db.prepare(`DELETE FROM follow_ups WHERE id = ?`).run(id);
  return res.changes > 0;
}

// ===================================================================
// 3. CALENDAR EVENTS SQLITE STORE — student_profile/system_databases/calendar.db
// ===================================================================

export interface CalendarEventRecord {
  id: string;
  title: string;
  type: 'counselling' | 'followup' | 'visa' | 'deadline' | 'document';
  date: string;
  time: string;
  duration: string;
  studentName: string;
  leadId?: string | null;
  phone?: string | null;
  countryInterest?: string | null;
  counsellor: string;
  mode: 'Phone Call' | 'In-Person' | 'Google Meet / Zoom' | 'WhatsApp';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Scheduled' | 'Completed' | 'Pending';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export function getCalendarDb(): DatabaseSync {
  const db = getStudentDb(CALENDAR_DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS calendar_events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'followup',
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      duration TEXT DEFAULT '30 mins',
      student_name TEXT,
      lead_id TEXT,
      phone TEXT,
      country_interest TEXT,
      counsellor TEXT DEFAULT 'Neha Sharma',
      mode TEXT DEFAULT 'Phone Call',
      priority TEXT DEFAULT 'Medium',
      status TEXT DEFAULT 'Scheduled',
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_calendar_date ON calendar_events(date);
    CREATE INDEX IF NOT EXISTS idx_calendar_status ON calendar_events(status);
  `);
  return db;
}

function seedInitialCalendarEventsIfEmpty(db: DatabaseSync): void {
  const countRow = db.prepare(`SELECT COUNT(*) as count FROM calendar_events`).get() as any;
  if (countRow && countRow.count > 0) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const d = (day: number) => `${year}-${month}-${String(day).padStart(2, '0')}`;

  const initial = [
    {
      id: 'evt-1',
      title: 'Call Rahul Sharma - Italy Public Univ Docs',
      type: 'followup',
      date: d(10),
      time: '11:00 AM',
      duration: '30 mins',
      studentName: 'Rahul Sharma',
      leadId: 'L2025100501',
      phone: '+91 98765 43210',
      countryInterest: 'Italy',
      counsellor: 'Neha Sharma',
      mode: 'Phone Call',
      priority: 'High',
      status: 'Scheduled',
      notes: 'Review Sapienza and Politecnico di Milano transcript checklists.',
    },
    {
      id: 'evt-2',
      title: 'Counselling Session - Priya Singh',
      type: 'counselling',
      date: d(10),
      time: '12:30 PM',
      duration: '45 mins',
      studentName: 'Priya Singh',
      leadId: 'L2025100402',
      phone: '+91 87654 32109',
      countryInterest: 'Germany',
      counsellor: 'Neha Sharma',
      mode: 'Google Meet / Zoom',
      priority: 'High',
      status: 'Scheduled',
      notes: 'Evaluate TU Munich and RWTH Aachen MBA Innovation program details.',
    },
    {
      id: 'evt-3',
      title: 'IELTS Preparation Plan - Amit Kumar',
      type: 'followup',
      date: d(10),
      time: '02:00 PM',
      duration: '20 mins',
      studentName: 'Amit Kumar',
      leadId: 'L2025100303',
      phone: '+91 95432 16789',
      countryInterest: 'Canada',
      counsellor: 'Neha Sharma',
      mode: 'WhatsApp',
      priority: 'Medium',
      status: 'Scheduled',
      notes: 'Send November test slots and British Council study materials.',
    },
    {
      id: 'evt-4',
      title: 'Offer Acceptance Deadline - Sneha Patel',
      type: 'deadline',
      date: d(10),
      time: '04:00 PM',
      duration: 'Deadline',
      studentName: 'Sneha Patel',
      leadId: 'L2025100104',
      phone: '+91 98765 12345',
      countryInterest: 'UK',
      counsellor: 'Neha Sharma',
      mode: 'Phone Call',
      priority: 'High',
      status: 'Scheduled',
      notes: 'University of Manchester deposit payment cutoff.',
    },
    {
      id: 'evt-5',
      title: 'APS India Certificate Document Review - Nikhil Shinde',
      type: 'document',
      date: d(15),
      time: '10:00 AM',
      duration: '30 mins',
      studentName: 'Nikhil Shinde',
      leadId: 'L20251023',
      phone: '+91 97222 33445',
      countryInterest: 'Germany',
      counsellor: 'Neha Sharma',
      mode: 'In-Person',
      priority: 'High',
      status: 'Scheduled',
      notes: 'Check professor authorization letter and DigiLocker marksheet authentication.',
    },
  ];

  const nowIso = new Date().toISOString();
  for (const e of initial) {
    db.prepare(`
      INSERT INTO calendar_events (
        id, title, type, date, time, duration, student_name, lead_id, phone,
        country_interest, counsellor, mode, priority, status, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      e.id, e.title, e.type, e.date, e.time, e.duration, e.studentName, e.leadId, e.phone,
      e.countryInterest, e.counsellor, e.mode, e.priority, e.status, e.notes, nowIso, nowIso
    );
  }
}

export function getAllCalendarEventsFromDb(startDate?: string, endDate?: string): CalendarEventRecord[] {
  const db = getCalendarDb();
  seedInitialCalendarEventsIfEmpty(db);

  let sql = `
    SELECT id, title, type, date, time, duration,
           student_name as studentName, lead_id as leadId,
           phone, country_interest as countryInterest,
           counsellor, mode, priority, status, notes,
           datetime(created_at) as createdAt, datetime(updated_at) as updatedAt
    FROM calendar_events
  `;
  const params: any[] = [];
  if (startDate && endDate) {
    sql += ` WHERE date >= ? AND date <= ?`;
    params.push(startDate, endDate);
  } else if (startDate) {
    sql += ` WHERE date >= ?`;
    params.push(startDate);
  }
  sql += ` ORDER BY date ASC, time ASC`;

  return db.prepare(sql).all(...params) as unknown as CalendarEventRecord[];
}

export function createCalendarEventInDb(data: Partial<CalendarEventRecord>): CalendarEventRecord {
  const db = getCalendarDb();
  const id = data.id || `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO calendar_events (
      id, title, type, date, time, duration, student_name, lead_id,
      phone, country_interest, counsellor, mode, priority, status, notes,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.title || 'Meeting',
    data.type || 'followup',
    data.date || new Date().toISOString().slice(0, 10),
    data.time || '11:00 AM',
    data.duration || '30 mins',
    data.studentName || '',
    data.leadId || null,
    data.phone || '',
    data.countryInterest || 'Italy',
    data.counsellor || 'Neha Sharma',
    data.mode || 'Phone Call',
    data.priority || 'Medium',
    data.status || 'Scheduled',
    data.notes || '',
    now,
    now
  );
  return {
    id,
    title: data.title || 'Meeting',
    type: (data.type as any) || 'followup',
    date: data.date || new Date().toISOString().slice(0, 10),
    time: data.time || '11:00 AM',
    duration: data.duration || '30 mins',
    studentName: data.studentName || '',
    leadId: data.leadId,
    phone: data.phone,
    countryInterest: data.countryInterest,
    counsellor: data.counsellor || 'Neha Sharma',
    mode: (data.mode as any) || 'Phone Call',
    priority: (data.priority as any) || 'Medium',
    status: (data.status as any) || 'Scheduled',
    notes: data.notes || '',
    createdAt: now,
    updatedAt: now,
  };
}

export function updateCalendarEventInDb(id: string, data: Partial<CalendarEventRecord>): CalendarEventRecord | null {
  const db = getCalendarDb();
  const existing = db.prepare(`SELECT * FROM calendar_events WHERE id = ? LIMIT 1`).get(id) as any;
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated = {
    title: data.title ?? existing.title,
    type: data.type ?? existing.type,
    date: data.date ?? existing.date,
    time: data.time ?? existing.time,
    duration: data.duration ?? existing.duration,
    student_name: data.studentName ?? existing.student_name,
    lead_id: data.leadId !== undefined ? data.leadId : existing.lead_id,
    phone: data.phone ?? existing.phone,
    country_interest: data.countryInterest ?? existing.country_interest,
    counsellor: data.counsellor ?? existing.counsellor,
    mode: data.mode ?? existing.mode,
    priority: data.priority ?? existing.priority,
    status: data.status ?? existing.status,
    notes: data.notes ?? existing.notes,
  };

  db.prepare(`
    UPDATE calendar_events
    SET title = ?, type = ?, date = ?, time = ?, duration = ?,
        student_name = ?, lead_id = ?, phone = ?, country_interest = ?,
        counsellor = ?, mode = ?, priority = ?, status = ?, notes = ?,
        updated_at = ?
    WHERE id = ?
  `).run(
    updated.title, updated.type, updated.date, updated.time, updated.duration,
    updated.student_name, updated.lead_id, updated.phone, updated.country_interest,
    updated.counsellor, updated.mode, updated.priority, updated.status, updated.notes,
    now, id
  );

  return {
    id,
    title: updated.title,
    type: updated.type,
    date: updated.date,
    time: updated.time,
    duration: updated.duration,
    studentName: updated.student_name,
    leadId: updated.lead_id,
    phone: updated.phone,
    countryInterest: updated.country_interest,
    counsellor: updated.counsellor,
    mode: updated.mode,
    priority: updated.priority,
    status: updated.status,
    notes: updated.notes,
    createdAt: existing.created_at,
    updatedAt: now,
  };
}

export function deleteCalendarEventFromDb(id: string): boolean {
  const db = getCalendarDb();
  const res = db.prepare(`DELETE FROM calendar_events WHERE id = ?`).run(id);
  return res.changes > 0;
}
