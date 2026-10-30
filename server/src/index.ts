import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import authRouter from './routes/auth';
import { connectMongoDB } from './db/mongodb';
import { initializeDefaultUsers } from './models/UserModel';
import {
  getAllProfiles,
  getProfileById,
  updateSection,
  logTimelineActivity,
  createStudentFolderAndDb,
  getStudentPhysicalDocuments,
  getStudentFolderName,
  createCounsellingSession,
  deleteCounsellingSession,
  deletePaymentInstallment,
  DB_DIR,
  logProfileAudit,
  getProfileAudit,
  getAllTasksFromDb,
  getTaskByIdFromDb,
  createTaskInDb,
  toggleTaskInDb,
  deleteTaskFromDb,
  getAllFollowUpsFromDb,
  createFollowUpInDb,
  deleteFollowUpFromDb,
  getAllCalendarEventsFromDb,
  createCalendarEventInDb,
  updateCalendarEventInDb,
  deleteCalendarEventFromDb,
  getSystemDatabasesStatus,
  SYSTEM_DB_DIR,
  HISTORY_DB_PATH,
  TASKS_DB_PATH,
  FOLLOWUPS_DB_PATH,
  CALENDAR_DB_PATH,
} from '../../student_profile/db';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Auth routes for 5 Portals with MongoDB integration
app.use('/api/auth', authRouter);

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// ==========================================
// PROFILE AUDIT (History section — who changed what, SQLite audit.db)
// ==========================================

interface AuditActor {
  name: string | null;
  email: string | null;
  role: string | null;
  portal: string | null;
}

function extractActor(body: any): AuditActor {
  const a = body?._actor || {};
  const role = a.role || body?.portalRole || 'counsellor';
  const rolePortal = role ? `${role.charAt(0).toUpperCase() + role.slice(1)} Portal` : null;
  return {
    name: a.name || body?.operatorName || 'Staff Operator',
    email: a.email || null,
    role,
    portal: a.portal || body?._portal || rolePortal || 'Counsellor Portal',
  };
}

// Relation / meta keys that must never be diffed or written to Prisma
const LEAD_SKIP_KEYS = new Set([
  'id', 'counsellor', 'tasks', 'followUps', 'counsellingSessions',
  'documents', 'applications', 'activityLogs', '_actor', '_portal',
  'createdAt', 'updatedAt',
]);

function fmtAuditValue(v: any): string | null {
  if (v === undefined || v === null) return null;
  const s = v instanceof Date ? v.toLocaleString('en-GB') : String(v);
  return s.length > 400 ? s.slice(0, 400) + '…' : s;
}

// Diff two records and write one audit row per changed scalar field
function diffAndLogLead(
  before: any,
  requested: Record<string, any>,
  actor: AuditActor,
  action = 'updated'
) {
  for (const key of Object.keys(requested)) {
    if (LEAD_SKIP_KEYS.has(key)) continue;
    const oldV = fmtAuditValue(before?.[key]);
    const newV = fmtAuditValue(requested[key]);
    if (oldV === newV) continue;
    logProfileAudit({
      entityType: 'lead',
      entityId: String(before?.id || requested.id || ''),
      entityCode: before?.leadId || null,
      studentName: before?.studentName || requested.studentName || null,
      action,
      field: key,
      oldValue: oldV,
      newValue: newV,
      actorName: actor.name,
      actorEmail: actor.email,
      actorRole: actor.role,
      portal: actor.portal,
    });
  }
}

// GET /api/audit & /api/history - queryable change history for the History section (stored in SQLite history.db)
const handleGetAudit = (req: any, res: any) => {
  try {
    const { search, portal, action, entityId, limit, offset } = req.query;
    const result = getProfileAudit({
      search: search ? String(search) : undefined,
      portal: portal ? String(portal) : undefined,
      action: action ? String(action) : undefined,
      entityId: entityId ? String(entityId) : undefined,
      limit: limit ? parseInt(String(limit), 10) : undefined,
      offset: offset ? parseInt(String(offset), 10) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Error fetching profile history/audit:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

app.get('/api/audit', handleGetAudit);
app.get('/api/history', handleGetAudit);

// ==========================================
// COMMON STUDENT PROFILE ENDPOINTS (SQL DB)
// ==========================================

// Ensures any leads marked Enrolled or transferred to docs have a corresponding
// student record and physical SQLite profile folder in student_profile/
export async function ensureEnrolledLeadsSynced() {
  try {
    const enrolledLeads = await prisma.lead.findMany({
      where: {
        OR: [
          { status: 'Enrolled' },
          { isEnrolled: true },
          { isTransferredToDocs: true },
        ],
      },
      include: { counsellor: true },
    });

    for (const l of enrolledLeads) {
      let prof =
        getProfileById(l.id) ||
        getProfileById(l.leadId) ||
        (l.studentName ? getProfileById(l.studentName) : null);
      if (!prof && l.email) {
        const all = getAllProfiles();
        prof = all.find((p) => p.email && p.email.toLowerCase() === l.email.toLowerCase()) || null;
      }
      if (!prof) {
        let student = await prisma.student.findUnique({ where: { leadId: l.id } });
        if (!student) {
          const stuCount = await prisma.student.count();
          const studentId = `STU202510${stuCount + 1 < 10 ? '0' + (stuCount + 1) : stuCount + 1}`;
          student = await prisma.student.create({
            data: {
              studentId,
              leadId: l.id,
              name: l.studentName,
              email: l.email,
              phone: l.phone,
              country: l.countryInterest,
              course: l.courseInterest,
              intake: l.intake || 'Sept 2026',
              stage: l.isTransferredToDocs ? 'Documentation' : 'Enrolled',
              enrolledDate: l.enrolledAt || new Date(),
            },
          });
        }

        const countryCode = l.countryInterest ? l.countryInterest.slice(0, 3).toUpperCase() : 'ITA';
        createStudentFolderAndDb(
          {
            id: `prof-${(l.studentName || 'student').toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            student_id: student.studentId || l.leadId || `STU-2027-${Math.floor(100 + Math.random() * 900)}`,
            lead_id: l.id,
            name: l.studentName,
            avatar: l.avatarUrl || '',
            phone: l.phone,
            email: l.email || '',
            dob: l.dob || undefined,
            address: l.address || undefined,
            nationality: l.nationality || 'Indian',
            country: l.countryInterest || 'Italy',
            country_code: countryCode,
            target_university: 'To be shortlisted',
            preferred_course: l.courseInterest || 'Master Degree',
            course_level: l.courseInterest?.toLowerCase().includes('bachelor') ? 'Bachelor' : 'Master',
            intake: l.intake || 'Sept 2026',
            budget: l.budget || undefined,
            counsellor_name: l.counsellor?.name || 'Neha Sharma',
            enrollment_date: l.enrolledAt ? new Date(l.enrolledAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            next_follow_up: l.nextFollowUp || undefined,
            overall_status: l.status === 'Enrolled' || l.isEnrolled ? (l.isTransferredToDocs ? 'Documentation' : 'Enrolled') : l.status,
            current_stage: l.isTransferredToDocs ? 'Documentation Verification In Progress' : 'Enrolled Student',
            stage_number: l.isTransferredToDocs ? 4 : 1,
            priority: 'Medium',
          },
          false,
          'System Auto-Sync',
          'counsellor'
        );
      } else {
        const currentStageNum = prof.stage_number || 1;
        if ((l.status === 'Enrolled' || l.isEnrolled) && prof.overall_status !== 'Enrolled' && currentStageNum <= 1) {
          updateSection(
            prof.id,
            'profile',
            {
              overall_status: 'Enrolled',
              current_stage: 'Enrolled Student',
              stage_number: 1,
              enrollment_date:
                prof.enrollment_date ||
                (l.enrolledAt ? new Date(l.enrolledAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)),
            },
            'System Auto-Sync',
            'counsellor'
          );
        } else if (l.isTransferredToDocs && prof.overall_status !== 'Documentation' && currentStageNum < 4) {
          updateSection(
            prof.id,
            'profile',
            {
              overall_status: 'Documentation',
              current_stage: 'Documentation Verification In Progress',
              stage_number: 4,
            },
            'System Auto-Sync',
            'docs'
          );
        }
      }
    }
  } catch (err) {
    console.warn('Warning during ensureEnrolledLeadsSynced:', err);
  }
}

// GET /api/student-profiles - List all common student profiles
app.get('/api/student-profiles', async (req, res) => {
  try {
    await ensureEnrolledLeadsSynced();
    const profiles = getAllProfiles();
    res.json({ success: true, count: profiles.length, data: profiles });
  } catch (error: any) {
    console.error('Error fetching common student profiles:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/student-profiles/:id - Get single student profile with all 15 stages
app.get('/api/student-profiles/:id', (req, res) => {
  try {
    const { id } = req.params;
    const profile = getProfileById(id);
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Student profile not found' });
    }
    res.json({ success: true, data: profile });
  } catch (error: any) {
    console.error('Error fetching student profile by id:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/student-profiles/:id/counselling-sessions - Book a counselling session
app.post('/api/student-profiles/:id/counselling-sessions', (req, res) => {
  try {
    const { id } = req.params;
    const actor = extractActor(req.body);
    const sessionData = req.body.data || req.body;
    const updated = createCounsellingSession(
      id,
      sessionData,
      actor.name || 'Staff Operator',
      actor.role || 'counsellor',
      { email: actor.email, portal: actor.portal }
    );
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Student profile not found' });
    }
    res.status(201).json({ success: true, message: 'Counselling session booked', data: updated });
  } catch (error: any) {
    console.error('Error booking counselling session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/student-profiles/:id/counselling-sessions/:sessionId - Remove a booked session
app.delete('/api/student-profiles/:id/counselling-sessions/:sessionId', (req, res) => {
  try {
    const { id, sessionId } = req.params;
    const actor = extractActor(req.body);
    const updated = deleteCounsellingSession(
      id,
      sessionId,
      actor.name || 'Staff Operator',
      actor.role || 'counsellor',
      { email: actor.email, portal: actor.portal }
    );
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Student profile not found' });
    }
    res.json({ success: true, message: 'Counselling session removed', data: updated });
  } catch (error: any) {
    console.error('Error removing counselling session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/student-profiles/:id/payments - Get student payments & installments
app.get('/api/student-profiles/:id/payments', (req, res) => {
  try {
    const { id } = req.params;
    const profile = getProfileById(id);
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Student profile not found' });
    }
    res.json({
      success: true,
      data: {
        payments: profile.payments,
        installments: profile.installments,
      },
    });
  } catch (error: any) {
    console.error('Error fetching student payments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/student-profiles/:id/payments/plan - Update payment plan / agreed budget
app.post('/api/student-profiles/:id/payments/plan', async (req, res) => {
  try {
    const { id } = req.params;
    const actor = extractActor(req.body);
    const planData = req.body.data || req.body;
    const updated = updateSection(
      id,
      'payments',
      planData,
      actor.name || 'Staff Operator',
      actor.role || 'counsellor',
      { email: actor.email, portal: actor.portal }
    );
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Student profile not found' });
    }
    await syncProfileToLead(updated).catch(() => {});
    res.json({ success: true, message: 'Payment plan updated', data: updated });
  } catch (error: any) {
    console.error('Error updating payment plan:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/student-profiles/:id/payments/installments - Add or update payment installment
app.post('/api/student-profiles/:id/payments/installments', async (req, res) => {
  try {
    const { id } = req.params;
    const actor = extractActor(req.body);
    const installmentData = req.body.installment || req.body.data || req.body;
    const updated = updateSection(
      id,
      'payments',
      { installment: installmentData },
      actor.name || 'Staff Operator',
      actor.role || 'counsellor',
      { email: actor.email, portal: actor.portal }
    );
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Student profile not found' });
    }
    await syncProfileToLead(updated).catch(() => {});
    res.json({ success: true, message: 'Installment saved', data: updated });
  } catch (error: any) {
    console.error('Error saving payment installment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/student-profiles/:id/payments/installments/:installmentId - Delete payment installment
app.delete('/api/student-profiles/:id/payments/installments/:installmentId', async (req, res) => {
  try {
    const { id, installmentId } = req.params;
    const actor = extractActor(req.body);
    const updated = deletePaymentInstallment(
      id,
      installmentId,
      actor.name || 'Staff Operator',
      actor.role || 'counsellor',
      { email: actor.email, portal: actor.portal }
    );
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Student profile not found' });
    }
    await syncProfileToLead(updated).catch(() => {});
    res.json({ success: true, message: 'Installment deleted', data: updated });
  } catch (error: any) {
    console.error('Error deleting payment installment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/student-profiles/:id/section/:section - Update specific lifecycle section
app.put('/api/student-profiles/:id/section/:section', async (req, res) => {
  try {
    const { id, section } = req.params;
    const { data } = req.body;
    const actor = extractActor(req.body);
    const updated = updateSection(
      id,
      section,
      data || req.body,
      actor.name || 'Staff Operator',
      actor.role || 'counsellor',
      { email: actor.email, portal: actor.portal }
    );
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Student profile not found' });
    }
    // Keep the Prisma lead projection (My Students) aligned with the folder DB.
    await syncProfileToLead(updated).catch((err) =>
      console.warn('Warning: Failed to sync updated profile section to lead:', err)
    );
    res.json({ success: true, message: `Section '${section}' updated successfully`, data: updated });
  } catch (error: any) {
    console.error(`Error updating student profile section ${req.params.section}:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/student-profiles/:id/timeline - Add timeline event
app.post('/api/student-profiles/:id/timeline', (req, res) => {
  try {
    const { id } = req.params;
    const { action, details, actor, portalRole } = req.body;
    logTimelineActivity(id, action, details, actor, portalRole);
    const updated = getProfileById(id);
    res.json({ success: true, message: 'Timeline activity added', data: updated });
  } catch (error: any) {
    console.error('Error adding timeline activity:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const GOOGLE_SHEET_CONFIG_PATH = path.join(__dirname, 'db', 'google_sheet_config.json');

function getGoogleSheetConfig() {
  try {
    if (fs.existsSync(GOOGLE_SHEET_CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(GOOGLE_SHEET_CONFIG_PATH, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading google_sheet_config.json:', err);
  }
  return {
    sheetUrl: '',
    fieldMapping: {},
    visibleColumns: {
      name: true,
      phone: true,
      email: true,
      country: true,
      course: true,
      intake: true,
      budget: true,
      campaign: true,
      date: true,
    },
    convertedKeys: {},
    updatedAt: null,
  };
}

function saveGoogleSheetConfig(data: any) {
  try {
    const dir = path.dirname(GOOGLE_SHEET_CONFIG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(GOOGLE_SHEET_CONFIG_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving google_sheet_config.json:', err);
  }
}

// GET /api/google-sheet/config - Retrieve current Google Sheet settings and converted keys
app.get('/api/google-sheet/config', (req, res) => {
  res.json({ success: true, config: getGoogleSheetConfig() });
});

// POST /api/google-sheet/config - Admin saves the Google Sheet URL and column configuration
app.post('/api/google-sheet/config', (req, res) => {
  try {
    const current = getGoogleSheetConfig();
    const { sheetUrl, fieldMapping, visibleColumns } = req.body;
    const updated = {
      ...current,
      sheetUrl: sheetUrl !== undefined ? sheetUrl : current.sheetUrl,
      fieldMapping: fieldMapping || current.fieldMapping,
      visibleColumns: visibleColumns || current.visibleColumns,
      updatedAt: new Date().toISOString(),
    };
    saveGoogleSheetConfig(updated);
    res.json({ success: true, config: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/google-sheet/converted - Mark lead key as converted to eliminate duplicates
app.post('/api/google-sheet/converted', (req, res) => {
  try {
    const { key, studentId, studentName, counsellor } = req.body;
    if (!key) return res.status(400).json({ success: false, error: 'Key is required' });
    const current = getGoogleSheetConfig();
    current.convertedKeys = current.convertedKeys || {};
    current.convertedKeys[key] = {
      studentId: studentId || '',
      studentName: studentName || '',
      counsellor: counsellor || '',
      convertedAt: new Date().toISOString(),
    };
    saveGoogleSheetConfig(current);
    res.json({ success: true, config: current });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/google-sheet/fetch - Proxies and fetches Google Sheet CSV data without CORS issues
app.post('/api/google-sheet/fetch', async (req, res) => {
  try {
    const cfg = getGoogleSheetConfig();
    const sheetUrl = req.body.sheetUrl || cfg.sheetUrl;
    if (!sheetUrl) {
      return res.status(400).json({ success: false, error: 'No Google Sheet URL configured.' });
    }

    const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    const sheetId = match ? match[1] : sheetUrl.trim();
    const gidMatch = sheetUrl.match(/[#&]gid=([0-9]+)/);
    const gid = gidMatch ? gidMatch[1] : '0';

    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    let csvText = '';
    try {
      const response = await fetch(csvUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      if (response.ok) {
        csvText = await response.text();
      }
    } catch {
      // Ignore and try fallback
    }

    if (!csvText) {
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
      const altRes = await fetch(gvizUrl);
      if (altRes.ok) {
        csvText = await altRes.text();
      }
    }

    if (!csvText) {
      return res.status(400).json({
        success: false,
        error: 'Unable to fetch sheet data. Please ensure the Google Sheet is shared with "Anyone with the link can view".',
      });
    }

    res.json({ success: true, csvText, sheetId, config: cfg });
  } catch (error: any) {
    console.error('Error fetching Google Sheet:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post('/api/student-profiles', (req, res) => {
  try {
    const actor = extractActor(req.body);
    const profile = createStudentFolderAndDb(
      req.body,
      false,
      actor.name || 'Staff Operator',
      actor.role || 'counsellor',
      { email: actor.email, portal: actor.portal }
    );
    res.status(201).json({ success: true, message: 'Student folder, DB, and documents created', data: profile });
  } catch (error: any) {
    console.error('Error creating student profile folder/db:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/student-profiles/:id/documents - List physical files in documents folder
app.get('/api/student-profiles/:id/documents', (req, res) => {
  try {
    const { id } = req.params;
    const profile = getProfileById(id);
    if (!profile || !profile.folder_name) {
      return res.status(404).json({ success: false, error: 'Student profile not found' });
    }
    const docs = getStudentPhysicalDocuments(profile.folder_name);
    res.json({ success: true, folder: profile.documents_folder, count: docs.length, data: docs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// Helper: map a profile-folder record onto the Prisma Lead projection.
// The folder DB (student_profile/<Student>/<Student>.db) is the single source
// of truth; the Lead row only exists so the Leads/My Students screens can query it.
function buildLeadSyncData(p: any, existing?: any): Record<string, any> {
  const stage = Number(p.stage_number) || 1;
  const isEnrolled = p.overall_status === 'Enrolled' || stage >= 4;
  const isTransferredToDocs = stage >= 4;
  const test = Array.isArray(p.test_scores) ? p.test_scores[0] : null;
  const academic = p.academic || {};
  const profileStatus = typeof p.overall_status === 'string' ? p.overall_status.trim() : '';
  const status =
    profileStatus ||
    existing?.status ||
    (stage >= 4 ? 'Documentation' : stage >= 3 ? 'Approval' : stage >= 2 ? 'Shortlisting' : 'New Lead');

  const data: Record<string, any> = {
    studentName: p.name || existing?.studentName,
    phone: p.phone || existing?.phone,
    email: p.email || existing?.email,
    countryInterest: p.country || existing?.countryInterest,
    courseInterest: p.preferred_course || existing?.courseInterest,
    intake: p.intake || existing?.intake,
    budget: p.budget || existing?.budget,
    avatarUrl:
      p.avatar === undefined
        ? (existing?.avatarUrl ?? null)
        : (p.avatar || null),
    dob: p.dob ?? existing?.dob ?? null,
    address: p.address ?? existing?.address ?? null,
    nationality: p.nationality ?? existing?.nationality ?? null,
    nextFollowUp: p.next_follow_up || existing?.nextFollowUp || 'Tomorrow',
    status,
    currentStage: p.current_stage || existing?.currentStage || 'New Lead',
    isEnrolled,
    isTransferredToDocs,
    tenthBoard: academic.tenth_board ?? existing?.tenthBoard ?? null,
    tenthPercentage: academic.tenth_percentage ?? existing?.tenthPercentage ?? null,
    twelfthBoard: academic.twelfth_board ?? existing?.twelfthBoard ?? null,
    twelfthPercentage: academic.twelfth_percentage ?? existing?.twelfthPercentage ?? null,
    graduationDegree: academic.bachelor_degree ?? existing?.graduationDegree ?? null,
    graduationUniversity: academic.bachelor_university ?? existing?.graduationUniversity ?? null,
    graduationCgpa: academic.bachelor_cgpa ?? existing?.graduationCgpa ?? null,
    graduationYear: academic.bachelor_passing_year ?? existing?.graduationYear ?? null,
    backlogs: academic.backlogs ?? existing?.backlogs ?? null,
    educationGaps: academic.education_gaps ?? existing?.educationGaps ?? null,
    testType: test?.test_type ?? existing?.testType ?? null,
    testOverallScore: test?.overall_score ?? existing?.testOverallScore ?? null,
    testDate: test?.test_date ?? existing?.testDate ?? null,
    testScoresDetails:
      test?.reading || test?.listening || test?.writing || test?.speaking
        ? `L: ${test.listening || '-'}, R: ${test.reading || '-'}, W: ${test.writing || '-'}, S: ${test.speaking || '-'}`
        : existing?.testScoresDetails ?? null,
    testResultStatus: test?.status ?? existing?.testResultStatus ?? null,
  };

  if (isEnrolled && !existing?.enrolledAt) data.enrolledAt = new Date();
  if (isTransferredToDocs && !existing?.transferredAt) data.transferredAt = new Date();

  return data;
}

function hasLeadChanges(existing: any, data: Record<string, any>): boolean {
  return Object.entries(data).some(([key, value]) => {
    const current = existing?.[key];
    if (value instanceof Date) return !current || new Date(current).getTime() !== value.getTime();
    if (value === null) return current !== null && current !== undefined;
    return current !== value;
  });
}

/** Push the profile folder record back into its Prisma lead projection. */
async function syncProfileToLead(p: any): Promise<void> {
  if (!p) return;
  const last10 = (p.phone || '').replace(/[^0-9]/g, '').slice(-10);
  const existing = await prisma.lead.findFirst({
    where: {
      OR: [
        ...(p.lead_id ? [{ leadId: p.lead_id }] : []),
        ...(last10 ? [{ phone: { contains: last10 } }] : []),
        ...(p.email ? [{ email: p.email }] : []),
      ],
    },
  });
  if (!existing) return;
  const data = buildLeadSyncData(p, existing);
  if (hasLeadChanges(existing, data)) {
    await prisma.lead.update({ where: { id: existing.id }, data });
  }
}

// Helper: Auto-sync any student profile folder that exists in student_profile/ but is missing from Prisma leads table
async function syncStudentFoldersToPrismaLeads(): Promise<void> {
  try {
    const profiles = getAllProfiles();
    const counsellor = await prisma.user.findFirst({ where: { role: 'Counsellor' } });

    for (const p of profiles) {
      const last10 = (p.phone || '').replace(/[^0-9]/g, '').slice(-10);
      const existing = await prisma.lead.findFirst({
        where: {
          OR: [
            ...(p.lead_id ? [{ leadId: p.lead_id }] : []),
            ...(last10 ? [{ phone: { contains: last10 } }] : []),
            ...(p.email ? [{ email: p.email }] : []),
          ],
        },
      });

      if (existing) {
        const data = buildLeadSyncData(p, existing);
        if (hasLeadChanges(existing, data)) {
          await prisma.lead.update({ where: { id: existing.id }, data });
          console.log(`🔄 Synced profile folder into Prisma lead: ${p.name} (${p.phone})`);
        }
        continue;
      }

      const count = await prisma.lead.count();
      const nextSeq = count + 1;
      let leadId = p.lead_id || `L202510${nextSeq < 10 ? '0' + nextSeq : nextSeq}`;
      const idCollision = await prisma.lead.findFirst({ where: { leadId } });
      if (idCollision) {
        leadId = `L202510${nextSeq < 10 ? '0' + nextSeq : nextSeq}_${last10.slice(-4)}`;
      }
      const createData: any = {
        leadId,
        leadSource: 'Student Profile Onboarding',
        lastActivity: 'Just now',
        nextFollowUpTime: '11:00 AM',
        nextFollowUpTask: 'Introductory counselling call',
        counsellorId: counsellor?.id,
        notes: `Auto-synced from student profile folder: ${p.folder_name}`,
        ...buildLeadSyncData(p),
      };
      await prisma.lead.create({ data: createData });
      console.log(`🔄 Auto-synced profile folder into Prisma leads: ${p.name} (${p.phone})`);
    }
  } catch (err) {
    console.error('Error syncing student folders to prisma leads:', err);
  }
}


// GET /api/leads - list leads with tab filter, search, sort
app.get('/api/leads', async (req, res) => {
  try {
    // Ensure any new student profile folder is synchronized into leads table
    await syncStudentFoldersToPrismaLeads();

    const { tab, search, country, status, source, sortField, sortOrder } = req.query;

    const where: any = {};

    // Tab filter. "My Students" shows everyone still being worked on; once a
    // student is marked Enrolled they leave this list and appear only in the
    // Enrolled Students section. The status tabs let counsellors monitor each
    // individual funnel step.
    const tabStatusMap: Record<string, string> = {
      'New Leads': 'New Lead',
      'New Lead': 'New Lead',
      Contacted: 'Contacted',
      Counselling: 'Counselling',
      Interested: 'Interested',
      Enrolled: 'Enrolled',
      'On Hold': 'On Hold',
      Drop: 'Drop',
      Lost: 'Lost',
    };

    if (tab && tab !== 'My Leads' && tab !== 'all') {
      if (tab === 'Transferred') {
        where.isTransferredToDocs = true;
      } else if (tab === 'Enrolled') {
        // "Enrolled" includes every profile that has crossed the enrolment
        // boundary, even when its current status has moved on to Offers/Visa.
        where.OR = [{ status: 'Enrolled' }, { isEnrolled: true }];
      } else if (tabStatusMap[String(tab)]) {
        where.status = tabStatusMap[String(tab)];
        where.isEnrolled = false;
      }
    } else {
      // Default "My Students" list — anyone already enrolled is excluded,
      // regardless of their current downstream status (Offer Received, Visa…).
      where.status = { not: 'Enrolled' };
      where.isEnrolled = false;
    }

    // Direct status filter
    if (status) {
      where.status = String(status);
    }

    // Country filter
    if (country) {
      where.countryInterest = String(country);
    }

    // Source filter
    if (source) {
      where.leadSource = String(source);
    }

    // Search query
    if (search && String(search).trim() !== '') {
      const q = String(search).trim();
      where.OR = [
        { studentName: { contains: q } },
        { phone: { contains: q } },
        { email: { contains: q } },
        { leadId: { contains: q } },
        { courseInterest: { contains: q } },
      ];
    }

    // Sorting: default to newest first (createdAt: 'desc') so newly added leads always appear on top
    let orderBy: any = { createdAt: 'desc' };
    if (sortField) {
      const field = String(sortField);
      const order = sortOrder === 'asc' ? 'asc' : 'desc';
      orderBy = { [field]: order };
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy,
      include: {
        counsellor: true,
      },
    });

    // Attach counselling sessions that live inside each student's profile DB.
    // The student_profile SQLite table is the source of truth for booked sessions.
    let profileStudents: any[] = [];
    try {
      profileStudents = getAllProfiles();
    } catch (profileErr) {
      console.warn('Could not attach profile counselling sessions to leads:', profileErr);
    }
    const syncLast10 = (value?: string) => (value || '').replace(/[^0-9]/g, '').slice(-10);
    const leadsWithSessions = leads.map((lead) => {
      const profile = profileStudents.find((p) => {
        const sameLeadId = p.lead_id && lead.leadId && p.lead_id === lead.leadId;
        const sameEmail = p.email && lead.email && p.email.toLowerCase() === lead.email.toLowerCase();
        const samePhone = syncLast10(p.phone) && syncLast10(p.phone) === syncLast10(lead.phone);
        return sameLeadId || sameEmail || samePhone;
      });
      const sessions = Array.isArray(profile?.counselling_sessions) ? profile.counselling_sessions : [];
      return {
        ...lead,
        counsellingSessions: sessions.map((s: any) => ({
          id: s.id,
          leadId: lead.id,
          date: s.session_date,
          time: s.session_time,
          counsellorName: s.counsellor_name,
          notes: s.notes || '',
          recommendations: s.recommendations || undefined,
          concerns: s.concerns || undefined,
          outcome: s.outcome || undefined,
          sessionType: s.session_type || '1-on-1 Consultation',
          mode: s.mode || 'Video Call',
          status: s.status || 'Scheduled',
          createdAt: s.created_at,
        })),
      };
    });

    // Compute tab counts
    const [totalCount, newLeadCount, contactedCount, counsellingCount, interestedCount, enrolledCount, transferredCount, onHoldCount, dropCount, lostCount] =
      await Promise.all([
        prisma.lead.count(),
        prisma.lead.count({ where: { status: 'New Lead', isEnrolled: false } }),
        prisma.lead.count({ where: { status: 'Contacted', isEnrolled: false } }),
        prisma.lead.count({ where: { status: 'Counselling', isEnrolled: false } }),
        prisma.lead.count({ where: { status: 'Interested', isEnrolled: false } }),
        prisma.lead.count({ where: { OR: [{ status: 'Enrolled' }, { isEnrolled: true }] } }),
        prisma.lead.count({ where: { isTransferredToDocs: true } }),
        prisma.lead.count({ where: { status: 'On Hold', isEnrolled: false } }),
        prisma.lead.count({ where: { status: 'Drop', isEnrolled: false } }),
        prisma.lead.count({ where: { status: 'Lost', isEnrolled: false } }),
      ]);

    res.json({
      data: leadsWithSessions,
      tabCounts: {
        myLeads: totalCount - enrolledCount,
        total: totalCount,
        newLeads: newLeadCount,
        contacted: contactedCount,
        counselling: counsellingCount,
        interested: interestedCount,
        enrolled: enrolledCount,
        transferred: transferredCount,
        onHold: onHoldCount,
        drop: dropCount,
        lost: lostCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/leads/:id - get single lead with relations
app.get('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await prisma.lead.findFirst({
      where: {
        OR: [{ id }, { leadId: id }],
      },
      include: {
        counsellor: true,
        tasks: { orderBy: { createdAt: 'desc' } },
        followUps: { orderBy: { createdAt: 'desc' } },
        counsellingSessions: { orderBy: { createdAt: 'desc' } },
        documents: { orderBy: { createdAt: 'asc' } },
        applications: { orderBy: { createdAt: 'desc' } },
        activityLogs: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    let profileSessions: any[] = [];
    try {
      const profile = getProfileById(lead.leadId || lead.id);
      profileSessions = Array.isArray(profile?.counselling_sessions) ? profile!.counselling_sessions : [];
    } catch (profileErr) {
      console.warn('Could not load profile counselling sessions for lead:', lead.leadId, profileErr);
    }

    res.json({
      ...lead,
      counsellingSessions: profileSessions.map((s: any) => ({
        id: s.id,
        leadId: lead.id,
        date: s.session_date,
        time: s.session_time,
        counsellorName: s.counsellor_name,
        notes: s.notes || '',
        recommendations: s.recommendations || undefined,
        concerns: s.concerns || undefined,
        outcome: s.outcome || undefined,
        sessionType: s.session_type || '1-on-1 Consultation',
        mode: s.mode || 'Video Call',
        status: s.status || 'Scheduled',
        createdAt: s.created_at,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/leads - create new lead
app.post('/api/leads', async (req, res) => {
  try {
    const {
      studentName,
      phone,
      email,
      countryInterest,
      courseInterest,
      intake,
      budget,
      universityType,
      preferredCity,
      leadSource,
      notes,
      tenthPercentage,
      twelfthPercentage,
      graduationDegree,
      graduationCgpa,
      testType,
      testOverallScore,
      avatarUrl,
    } = req.body;

    if (!studentName || !phone || !email || !countryInterest) {
      return res.status(400).json({ error: 'studentName, phone, email, and countryInterest are required' });
    }

    const count = await prisma.lead.count();
    const nextSeq = count + 1;
    const leadId = `L202510${nextSeq < 10 ? '0' + nextSeq : nextSeq}`;

    // Get default counsellor Neha
    const counsellor = await prisma.user.findFirst({ where: { role: 'Counsellor' } });

    const finalAvatar = avatarUrl || req.body.avatar || null;

    const newLead = await prisma.lead.create({
      data: {
        leadId,
        studentName,
        phone,
        email,
        avatarUrl: finalAvatar,
        countryInterest,
        courseInterest: courseInterest || 'General Inquiry',
        intake: intake || 'Sept 2026',
        budget: budget || '',
        universityType: universityType || 'Public',
        preferredCity: preferredCity || '',
        leadSource: leadSource || 'Website',
        lastActivity: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        nextFollowUp: req.body.nextFollowUp || '12 Oct 2025',
        nextFollowUpTime: req.body.nextFollowUpTime || '11:00 AM',
        nextFollowUpTask: req.body.nextFollowUpTask || 'Introductory counselling call',
        status: 'New Lead',
        counsellorId: counsellor?.id,
        notes: notes || '',
        tenthBoard: req.body.tenthBoard || null,
        tenthPercentage: tenthPercentage || null,
        tenthYear: req.body.tenthYear || null,
        twelfthBoard: req.body.twelfthBoard || null,
        twelfthPercentage: twelfthPercentage || null,
        twelfthYear: req.body.twelfthYear || null,
        graduationDegree: graduationDegree || null,
        graduationUniversity: req.body.graduationUniversity || null,
        graduationCgpa: graduationCgpa || null,
        graduationYear: req.body.graduationYear || null,
        backlogs: req.body.backlogs || null,
        educationGaps: req.body.educationGaps || null,
        testType: testOverallScore ? (testType || 'IELTS') : null,
        testOverallScore: testOverallScore || null,
        testDate: req.body.testDate || null,
        testScoresDetails: req.body.testScoresDetails || null,
        testResultStatus: req.body.testResultStatus || (testOverallScore ? 'Reported' : null),
      },
      include: {
        counsellor: true,
      },
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        title: 'New Lead Added',
        message: `${studentName} created via ${leadSource || 'Manual Entry'}`,
        type: 'lead',
        link: `/leads/${newLead.leadId}`,
      },
    });

    // Activity Log
    await prisma.activityLog.create({
      data: {
        leadId: newLead.id,
        action: 'Lead Created',
        details: `Created by Neha Sharma for ${countryInterest}`,
      },
    });

    // Auto-create dedicated student profile folder, .db file, and EMPTY documents folder with registration info
    try {
      createStudentFolderAndDb({
        name: studentName,
        phone: phone,
        email: email,
        avatar: finalAvatar || null,
        country: countryInterest,
        preferred_course: courseInterest || 'General Inquiry',
        intake: intake || 'Sept 2026',
        budget: budget || '',
        lead_id: newLead.leadId,
        counsellor_name: counsellor?.name || 'Neha Sharma',
        dob: req.body.dob || null,
        address: req.body.address || req.body.preferredCity || null,
        nationality: req.body.nationality || (countryInterest ? `${countryInterest} Applicant` : null),
        academic: {
          tenth_board: req.body.tenthBoard || null,
          tenth_percentage: req.body.tenthPercentage || null,
          tenth_year: req.body.tenthYear || null,
          twelfth_board: req.body.twelfthBoard || null,
          twelfth_percentage: req.body.twelfthPercentage || null,
          twelfth_year: req.body.twelfthYear || null,
          bachelor_degree: req.body.graduationDegree || null,
          bachelor_university: req.body.graduationUniversity || null,
          bachelor_cgpa: req.body.graduationCgpa || null,
          bachelor_passing_year: req.body.graduationYear || null,
          backlogs: req.body.backlogs || null,
          education_gaps: req.body.educationGaps || null,
        },
        test_scores: req.body.testOverallScore ? [{
          test_type: req.body.testType || 'IELTS',
          overall_score: req.body.testOverallScore,
        }] : [],
        overall_status: newLead.status || 'New Lead',
        current_stage: newLead.currentStage || 'New Lead Registration',
        stage_number: 1,
        priority: req.body.priority || 'Medium',
      }, false);
      console.log(`📁 Auto-created dedicated student folder & DB for lead: ${studentName} (empty documents folder)`);
    } catch (dbErr) {
      console.warn('Warning: Failed to auto-create student profile folder/db:', dbErr);
    }

    res.status(201).json(newLead);
  } catch (error: any) {
    console.error('Error creating lead:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/leads/:id - update lead
app.put('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    const actor = extractActor(req.body);
    delete updateData.id;
    delete updateData.counsellor;
    delete updateData.tasks;
    delete updateData.followUps;
    delete updateData.counsellingSessions;
    delete updateData.documents;
    delete updateData.applications;
    delete updateData.activityLogs;
    delete updateData._actor;
    delete updateData._portal;

    const before = await prisma.lead.findUnique({ where: { id } });

    // Marking a lead "Enrolled" must move it to the Enrolled Students list only.
    // It must NOT silently promote the profile to the next pipeline stage.
    if (updateData.status === 'Enrolled') {
      updateData.isEnrolled = true;
      if (!updateData.enrolledAt) updateData.enrolledAt = new Date();
    } else if (updateData.status && updateData.status !== 'Enrolled' && updateData.isEnrolled === undefined) {
      updateData.isEnrolled = false;
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: updateData,
      include: { counsellor: true },
    });

    // Activity Log
    await prisma.activityLog.create({
      data: {
        leadId: id,
        action: 'Lead Updated',
        details: 'Profile details modified',
      },
    });

    // Profile audit: one row per changed field (History section)
    diffAndLogLead(before, updateData, actor, 'updated');

    // Sync only the fields that actually changed to the student's dedicated
    // SQLite profile folder database. Sending the whole lead payload would
    // overwrite stage fields (e.g. overall_status) that the profile owns.
    try {
      const changed = (key: string) => updateData[key] !== undefined && updateData[key] !== (before as any)?.[key];
      const profileUpdate: Record<string, any> = {};

      if (changed('studentName')) profileUpdate.name = updated.studentName;
      if (changed('phone')) profileUpdate.phone = updated.phone;
      if (changed('email')) profileUpdate.email = updated.email;
      if (changed('avatarUrl')) profileUpdate.avatar = updated.avatarUrl;
      if (changed('dob')) profileUpdate.dob = updated.dob;
      if (changed('address') || changed('preferredCity')) {
        profileUpdate.address = updated.address || updated.preferredCity;
      }
      if (changed('nationality')) profileUpdate.nationality = updated.nationality;
      if (changed('countryInterest')) profileUpdate.country = updated.countryInterest;
      if (changed('courseInterest')) profileUpdate.preferred_course = updated.courseInterest;
      if (changed('intake')) profileUpdate.intake = updated.intake;
      if (changed('budget')) profileUpdate.budget = updated.budget;
      if (changed('nextFollowUp')) profileUpdate.next_follow_up = updated.nextFollowUp;
      if (changed('status')) profileUpdate.overall_status = updated.status;

      if (Object.keys(profileUpdate).length > 0) {
        updateSection(
          updated.leadId || updated.id,
          'profile',
          profileUpdate,
          actor?.name || 'Staff Operator',
          actor?.portal || 'Counsellor Portal'
        );
      }

      const academicFields = [
        'tenthBoard',
        'tenthPercentage',
        'tenthYear',
        'twelfthBoard',
        'twelfthPercentage',
        'twelfthYear',
        'graduationDegree',
        'graduationUniversity',
        'graduationCgpa',
        'graduationYear',
        'backlogs',
        'educationGaps',
      ];
      if (academicFields.some(changed)) {
        updateSection(updated.leadId || updated.id, 'academic', {
          tenth_board: updated.tenthBoard,
          tenth_percentage: updated.tenthPercentage,
          tenth_year: updated.tenthYear,
          twelfth_board: updated.twelfthBoard,
          twelfth_percentage: updated.twelfthPercentage,
          twelfth_year: updated.twelfthYear,
          bachelor_degree: updated.graduationDegree,
          bachelor_university: updated.graduationUniversity,
          bachelor_cgpa: updated.graduationCgpa,
          bachelor_passing_year: updated.graduationYear,
          backlogs: updated.backlogs,
          education_gaps: updated.educationGaps,
        }, actor?.name || 'Staff Operator', actor?.portal || 'Counsellor Portal');
      }
      if (updated.isEnrolled || updated.status === 'Enrolled' || updated.isTransferredToDocs) {
        await ensureEnrolledLeadsSynced();
      }
    } catch (folderDbErr) {
      console.warn('Warning: Failed to sync updated lead to student SQLite folder DB:', folderDbErr);
    }

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/leads/:id/enroll - Enroll Student workflow
app.post('/api/leads/:id/enroll', async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await prisma.lead.findUnique({ where: { id } });

    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    // Update lead
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        status: 'Enrolled',
        currentStage: 'Enrolled',
        isEnrolled: true,
        enrolledAt: new Date(),
      },
    });

    // Create or find student
    let student = await prisma.student.findUnique({ where: { leadId: id } });
    if (!student) {
      const stuCount = await prisma.student.count();
      const studentId = `STU202510${stuCount + 1 < 10 ? '0' + (stuCount + 1) : stuCount + 1}`;

      student = await prisma.student.create({
        data: {
          studentId,
          leadId: id,
          name: lead.studentName,
          email: lead.email,
          phone: lead.phone,
          country: lead.countryInterest,
          course: lead.courseInterest,
          intake: lead.intake || 'Sept 2026',
          stage: 'Documentation',
          enrolledDate: new Date(),
        },
      });
    }

    // Automatically seed basic documents checklist if empty
    const existingDocs = await prisma.document.count({ where: { leadId: id } });
    if (existingDocs === 0) {
      await prisma.document.createMany({
        data: [
          { leadId: id, name: 'Passport', category: 'Identity', status: 'Pending' },
          { leadId: id, name: '10th Marksheet', category: 'Academic', status: 'Pending' },
          { leadId: id, name: '12th Marksheet', category: 'Academic', status: 'Pending' },
          { leadId: id, name: 'Graduation Degree & Transcripts', category: 'Academic', status: 'Pending' },
          { leadId: id, name: 'IELTS / PTE / TOEFL Score Card', category: 'Language', status: 'Pending' },
          { leadId: id, name: 'Statement of Purpose (SOP)', category: 'Academic', status: 'Pending' },
          { leadId: id, name: 'Letter of Recommendation (LOR)', category: 'Academic', status: 'Pending' },
        ],
      });
    }

    // Activity log
    await prisma.activityLog.create({
      data: {
        leadId: id,
        action: 'Student Enrolled',
        details: `Converted lead to Enrolled student (${student.studentId}). Documentation assignment triggered.`,
      },
    });

    // Reflect the enrolment on the student's own SQLite profile without
    // advancing the workflow stage. They now belong in the Enrolled section.
    try {
      await ensureEnrolledLeadsSynced();
      const profile = getProfileById(lead.leadId || id);
      if (profile) {
        updateSection(
          profile.id,
          'profile',
          { overall_status: 'Enrolled' },
          'Staff Operator',
          'counsellor'
        );
      }
    } catch (syncErr) {
      console.warn('Could not update student profile after enrolment:', syncErr);
    }

    // Profile audit: stage progress (History section)
    const enrollActor = extractActor(req.body);
    logProfileAudit({
      entityType: 'lead',
      entityId: id,
      entityCode: lead.leadId,
      studentName: lead.studentName,
      action: 'stage-changed',
      field: 'status',
      oldValue: lead.status,
      newValue: 'Enrolled',
      actorName: enrollActor.name,
      actorEmail: enrollActor.email,
      actorRole: enrollActor.role,
      portal: enrollActor.portal,
    });

    // Notification
    await prisma.notification.create({
      data: {
        title: 'Student Enrolled 🎉',
        message: `${lead.studentName} has been enrolled and transferred to documentation team.`,
        type: 'lead',
        link: `/students`,
      },
    });

    res.json({ lead: updatedLead, student });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/leads/:id/transfer-docs - Transfer to Documentation Team
app.post('/api/leads/:id/transfer-docs', async (req, res) => {
  try {
    const { id } = req.params;
    const transferActor = extractActor(req.body);
    const beforeTransfer = await prisma.lead.findUnique({ where: { id } });
    const updated = await prisma.lead.update({
      where: { id },
      data: {
        isTransferredToDocs: true,
        transferredAt: new Date(),
        currentStage: 'Documentation',
      },
    });

    await prisma.activityLog.create({
      data: {
        leadId: id,
        action: 'Transferred to Documentation',
        details: 'Dossier transferred to documentation verification team',
      },
    });

    // Keep the per-student SQLite profile in sync with the transfer, otherwise
    // the folder -> lead auto-sync would immediately undo the transfer.
    try {
      await ensureEnrolledLeadsSynced();
      const profile = getProfileById(beforeTransfer?.leadId || updated.leadId || id);
      if (profile) {
        updateSection(
          profile.id,
          'profile',
          {
            current_stage: 'Documentation Verification In Progress',
            stage_number: 4,
            overall_status: 'Documentation',
          },
          transferActor.name || 'Staff Operator',
          transferActor.portal || transferActor.role || 'counsellor'
        );
      }
    } catch (syncErr) {
      console.warn('Could not update student profile for documentation transfer:', syncErr);
    }

    await prisma.notification.create({
      data: {
        title: 'Documentation Transfer',
        message: `${updated.studentName}'s files transferred to Documentation team.`,
        type: 'document',
        link: `/documentation`,
      },
    });

    // Profile audit: stage progress (History section)
    logProfileAudit({
      entityType: 'lead',
      entityId: id,
      entityCode: beforeTransfer?.leadId || updated.leadId,
      studentName: updated.studentName,
      action: 'stage-changed',
      field: 'currentStage',
      oldValue: beforeTransfer?.currentStage || null,
      newValue: 'Documentation',
      actorName: transferActor.name,
      actorEmail: transferActor.email,
      actorRole: transferActor.role,
      portal: transferActor.portal,
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/leads/:id
app.delete('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const target = await prisma.lead.findUnique({ where: { id } });
    if (!target) return res.status(404).json({ error: 'Lead not found' });

    const actor = extractActor(req.body);
    await prisma.activityLog.deleteMany({ where: { leadId: id } });
    await prisma.document.deleteMany({ where: { leadId: id } });
    await prisma.followUp.deleteMany({ where: { leadId: id } });
    await prisma.task.deleteMany({ where: { leadId: id } });
    await prisma.counsellingSession.deleteMany({ where: { leadId: id } });
    await prisma.application.deleteMany({ where: { leadId: id } });
    await prisma.student.deleteMany({ where: { leadId: id } });
    await prisma.lead.delete({ where: { id } });

    // Remove the on-disk student profile folder as well — otherwise the
    // folder-to-lead auto-sync resurrects the deleted profile on next fetch.
    let folderRemoved: string | null = null;
    try {
      const candidates = new Set<string>();
      candidates.add(getStudentFolderName(target.studentName, target.phone));
      const last10 = (target.phone || '').replace(/[^0-9]/g, '').slice(-10);
      for (const p of getAllProfiles()) {
        if (!p.folder_name) continue;
        const sameLeadId = p.lead_id && target.leadId && p.lead_id === target.leadId;
        const sameEmail = p.email && target.email && p.email.toLowerCase() === target.email.toLowerCase();
        const pLast10 = (p.phone || '').replace(/[^0-9]/g, '').slice(-10);
        const samePhone = last10 && pLast10 && pLast10 === last10;
        if (sameLeadId || sameEmail || samePhone) candidates.add(p.folder_name);
      }
      for (const folder of candidates) {
        const full = path.join(DB_DIR, folder);
        if (fs.existsSync(full)) {
          fs.rmSync(full, { recursive: true, force: true });
          folderRemoved = folderRemoved ? `${folderRemoved}, ${folder}` : folder;
        }
      }
    } catch (fsErr) {
      console.error('Failed to remove student profile folder(s):', fsErr);
    }

    // Profile audit: record the deletion (History section)
    logProfileAudit({
      entityType: 'lead',
      entityId: id,
      entityCode: target.leadId,
      studentName: target.studentName,
      action: 'deleted',
      field: null,
      oldValue: null,
      newValue: folderRemoved ? `Profile + disk folder removed (${folderRemoved})` : 'Profile removed from CRM',
      actorName: actor.name,
      actorEmail: actor.email,
      actorRole: actor.role,
      portal: actor.portal,
    });

    res.json({ success: true, message: 'Lead deleted successfully', folderRemoved });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========================
// TASKS ENDPOINTS (SQLite tasks.db)
// ========================

// GET /api/tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = getAllTasksFromDb().map((t) => ({
      ...t,
      lead: t.leadId
        ? { id: t.leadId, studentName: t.studentName || '', phone: '' }
        : t.studentName
        ? { id: t.id, studentName: t.studentName, phone: '' }
        : undefined,
    }));
    res.json(tasks);
  } catch (error: any) {
    console.error('Error fetching tasks from SQLite tasks.db:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tasks
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, subtitle, time, dueDate, dueStatus, priority, leadId, studentName, assignedTo } = req.body;
    let sName = studentName;
    if (!sName && leadId) {
      try {
        const lead = await prisma.lead.findUnique({ where: { id: leadId } });
        if (lead) sName = lead.studentName;
      } catch (e) {}
    }

    const created = createTaskInDb({
      title,
      subtitle: subtitle || '',
      time: time || '12:00 PM',
      dueDate: dueDate || 'Today',
      dueStatus: dueStatus || 'Upcoming',
      priority: priority || 'Medium',
      leadId,
      studentName: sName,
      assignedTo: assignedTo || 'Assigned Counsellor',
    });

    // Also mirror to Prisma if possible
    try {
      await prisma.task.create({
        data: {
          id: created.id,
          title: created.title,
          subtitle: created.subtitle,
          time: created.time,
          dueDate: created.dueDate,
          dueStatus: created.dueStatus,
          priority: created.priority,
          leadId: leadId || undefined,
        },
      });
    } catch (e) {}

    logProfileAudit({
      entityType: 'task',
      entityId: created.id,
      studentName: created.studentName || created.title,
      action: 'create',
      field: 'task',
      newValue: created.title,
      actorRole: 'Counsellor',
      portal: 'Counsellor Portal',
    });

    res.status(201).json({
      ...created,
      lead: created.leadId
        ? { id: created.leadId, studentName: created.studentName || '', phone: '' }
        : undefined,
    });
  } catch (error: any) {
    console.error('Error creating task in SQLite tasks.db:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/tasks/:id/toggle
app.patch('/api/tasks/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const toggled = toggleTaskInDb(id);
    if (!toggled) return res.status(404).json({ error: 'Task not found in SQLite tasks.db' });

    try {
      await prisma.task.update({
        where: { id },
        data: {
          completed: toggled.completed,
          dueStatus: toggled.dueStatus,
        },
      });
    } catch (e) {}

    logProfileAudit({
      entityType: 'task',
      entityId: toggled.id,
      studentName: toggled.studentName || toggled.title,
      action: 'update',
      field: 'completed',
      oldValue: String(!toggled.completed),
      newValue: String(toggled.completed),
      actorRole: 'Counsellor',
      portal: 'Counsellor Portal',
    });

    res.json({
      ...toggled,
      lead: toggled.leadId
        ? { id: toggled.leadId, studentName: toggled.studentName || '', phone: '' }
        : undefined,
    });
  } catch (error: any) {
    console.error('Error toggling task in SQLite tasks.db:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/tasks/:id
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = deleteTaskFromDb(id);
    if (!deleted) return res.status(404).json({ error: 'Task not found in SQLite tasks.db' });

    try {
      await prisma.task.delete({ where: { id } });
    } catch (e) {}

    logProfileAudit({
      entityType: 'task',
      entityId: id,
      action: 'delete',
      field: 'task',
      actorRole: 'Counsellor',
      portal: 'Counsellor Portal',
    });

    res.json({ success: true, id });
  } catch (error: any) {
    console.error('Error deleting task from SQLite tasks.db:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========================
// ANALYTICS / KPI ENDPOINTS
// ========================

app.get('/api/analytics', async (req, res) => {
  try {
    const totalLeads = await prisma.lead.count();
    // Keep the funnel chart aligned with the KPI cards / My Students tab counts.
    // Enrolled students are counted by the enrolment flag so downstream stages
    // (Documentation, Visa…) still appear under "Enrolled".
    const contacted = await prisma.lead.count({
      where: { status: 'Contacted', isEnrolled: false },
    });
    const counsellingDone = await prisma.lead.count({
      where: { status: 'Counselling', isEnrolled: false },
    });
    const enrolled = await prisma.lead.count({
      where: { OR: [{ status: 'Enrolled' }, { isEnrolled: true }] },
    });
    const transferred = await prisma.lead.count({ where: { isTransferredToDocs: true } });
    const applicationInProcess = await prisma.application.count({
      where: { status: { in: ['Submitted', 'Under Review'] } },
    });
    const offerReceived = await prisma.application.count({
      where: { status: 'Offer Received' },
    });

    // Counselling Summary
    const counsellingSummary = [
      { name: 'Total Leads', count: totalLeads, fill: '#087cf5' },
      { name: 'Contacted', count: contacted, fill: '#16a34a' },
      { name: 'Counselling', count: counsellingDone, fill: '#ca8a04' },
      { name: 'Enrolled', count: enrolled, fill: '#e11d48' },
      { name: 'Transferred', count: transferred, fill: '#7c3aed' },
    ];

    // Lead Sources
    const sources = ['Google Ads', 'Website', 'Instagram', 'Justdial', 'Referral', 'Others'];
    const sourceColors: Record<string, string> = {
      'Google Ads': '#087cf5',
      'Website': '#06b6d4',
      'Instagram': '#eab308',
      'Justdial': '#f97316',
      'Referral': '#ec4899',
      'Others': '#94a3b8',
    };

    const leadSources = await Promise.all(
      sources.map(async (src) => {
        const count = await prisma.lead.count({ where: { leadSource: src } });
        const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
        return {
          name: src,
          count,
          percentage: pct,
          color: sourceColors[src] || '#94a3b8',
        };
      })
    );

    // Country Interest
    const countryFlags: Record<string, string> = {
      Italy: '🇮🇹',
      Germany: '🇩🇪',
      Canada: '🇨🇦',
      UK: '🇬🇧',
      Australia: '🇦🇺',
      Others: '🌐',
    };
    const countryColors: Record<string, string> = {
      Italy: '#087cf5',
      Germany: '#10b981',
      Canada: '#eab308',
      UK: '#ec4899',
      Australia: '#a855f7',
      Others: '#94a3b8',
    };

    const targetCountries = ['Italy', 'Germany', 'Canada', 'UK', 'Australia', 'Others'];
    const countryInterest = await Promise.all(
      targetCountries.map(async (c) => {
        let count = 0;
        if (c === 'Others') {
          count = await prisma.lead.count({
            where: { countryInterest: { notIn: ['Italy', 'Germany', 'Canada', 'UK', 'Australia'] } },
          });
        } else {
          count = await prisma.lead.count({ where: { countryInterest: c } });
        }
        return {
          country: c,
          count,
          flag: countryFlags[c],
          color: countryColors[c],
        };
      })
    );

    res.json({
      kpis: {
        totalLeads: { value: totalLeads, label: 'Total Leads', growth: '↑ 12%' },
        contacted: { value: contacted, label: 'Contacted', growth: '↑ 8%' },
        counsellingDone: { value: counsellingDone, label: 'Counselling Done', growth: '↑ 20%' },
        enrolled: { value: enrolled, label: 'Enrolled', growth: '↑ 14%' },
        transferred: { value: transferred, label: 'Transferred to Documentation', growth: '↑ 25%' },
        applicationInProcess: { value: applicationInProcess, label: 'Application in Process', growth: '—' },
        offerReceived: { value: offerReceived, label: 'Offer Received', growth: '—' },
      },
      counsellingSummary,
      leadSources,
      countryInterest,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========================
// NOTIFICATIONS ENDPOINTS
// ========================

app.get('/api/notifications', async (req, res) => {
  try {
    const list = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    const unreadCount = await prisma.notification.count({ where: { isRead: false } });
    res.json({ list, unreadCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notifications/read-all', async (req, res) => {
  try {
    await prisma.notification.updateMany({
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========================
// GLOBAL SEARCH ENDPOINT
// ========================

app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || String(q).trim() === '') {
      return res.json([]);
    }
    const query = String(q).trim();
    const results = await prisma.lead.findMany({
      where: {
        OR: [
          { studentName: { contains: query } },
          { phone: { contains: query } },
          { email: { contains: query } },
          { leadId: { contains: query } },
          { countryInterest: { contains: query } },
        ],
      },
      take: 8,
    });
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========================
// FOLLOW-UPS ENDPOINTS (SQLite followups.db)
// ========================

app.get('/api/followups', async (req, res) => {
  try {
    const followUps = getAllFollowUpsFromDb();
    res.json(followUps);
  } catch (error: any) {
    console.error('Error fetching follow-ups from SQLite followups.db:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/followups', async (req, res) => {
  try {
    const { leadId, studentId, studentName, date, time, task, reminder, notes } = req.body;
    let sName = studentName;
    if (!sName && leadId) {
      try {
        const lead = await prisma.lead.findUnique({ where: { id: leadId } });
        if (lead) sName = lead.studentName;
      } catch (e) {}
    }

    const created = createFollowUpInDb({
      leadId,
      studentId,
      studentName: sName || 'Student',
      date: date || '10 Oct 2025',
      time: time || '11:00 AM',
      task: task || 'Follow-up discussion',
      reminder: reminder || '15 minutes before',
      notes: notes || '',
    });

    // Mirror to Prisma and update lead next follow-up if leadId exists
    if (leadId) {
      try {
        await prisma.followUp.create({
          data: {
            id: created.id,
            leadId,
            studentName: created.studentName,
            date: created.date,
            time: created.time,
            task: created.task,
            reminder: created.reminder,
            notes: created.notes,
          },
        });
        await prisma.lead.update({
          where: { id: leadId },
          data: {
            nextFollowUp: date || undefined,
            nextFollowUpTime: time || undefined,
            nextFollowUpTask: task || undefined,
          },
        });
      } catch (e) {}
    }

    logProfileAudit({
      entityType: 'follow_up',
      entityId: created.id,
      studentName: created.studentName,
      action: 'create',
      field: 'follow_up',
      newValue: `${created.task} (${created.date} ${created.time})`,
      actorRole: 'Counsellor',
      portal: 'Counsellor Portal',
    });

    res.status(201).json(created);
  } catch (error: any) {
    console.error('Error creating follow-up in SQLite followups.db:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/followups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = deleteFollowUpFromDb(id);
    if (!deleted) return res.status(404).json({ error: 'Follow-up not found in SQLite followups.db' });

    try {
      await prisma.followUp.delete({ where: { id } });
    } catch (e) {}

    logProfileAudit({
      entityType: 'follow_up',
      entityId: id,
      action: 'delete',
      field: 'follow_up',
      actorRole: 'Counsellor',
      portal: 'Counsellor Portal',
    });

    res.json({ success: true, id });
  } catch (error: any) {
    console.error('Error deleting follow-up from SQLite followups.db:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========================
// CALENDAR EVENTS ENDPOINTS (SQLite calendar.db)
// ========================

// GET /api/calendar/events
app.get('/api/calendar/events', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const events = getAllCalendarEventsFromDb(
      startDate ? String(startDate) : undefined,
      endDate ? String(endDate) : undefined
    );
    res.json(events);
  } catch (error: any) {
    console.error('Error fetching calendar events from SQLite calendar.db:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/calendar/events
app.post('/api/calendar/events', async (req, res) => {
  try {
    const created = createCalendarEventInDb(req.body);
    logProfileAudit({
      entityType: 'calendar_event',
      entityId: created.id,
      studentName: created.studentName || created.title,
      action: 'create',
      field: 'calendar_event',
      newValue: `${created.title} (${created.date} ${created.time})`,
      actorRole: 'Counsellor',
      portal: 'Counsellor Portal',
    });
    res.status(201).json(created);
  } catch (error: any) {
    console.error('Error creating calendar event in SQLite calendar.db:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/calendar/events/:id
app.put('/api/calendar/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = updateCalendarEventInDb(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Calendar event not found in SQLite calendar.db' });

    logProfileAudit({
      entityType: 'calendar_event',
      entityId: updated.id,
      studentName: updated.studentName || updated.title,
      action: 'update',
      field: 'status',
      newValue: updated.status,
      actorRole: 'Counsellor',
      portal: 'Counsellor Portal',
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Error updating calendar event in SQLite calendar.db:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/calendar/events/:id
app.delete('/api/calendar/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = deleteCalendarEventFromDb(id);
    if (!deleted) return res.status(404).json({ error: 'Calendar event not found in SQLite calendar.db' });

    logProfileAudit({
      entityType: 'calendar_event',
      entityId: id,
      action: 'delete',
      field: 'calendar_event',
      actorRole: 'Counsellor',
      portal: 'Counsellor Portal',
    });

    res.json({ success: true, id });
  } catch (error: any) {
    console.error('Error deleting calendar event from SQLite calendar.db:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========================
// SYSTEM DATABASES STATUS
// ========================

// GET /api/system/databases
app.get('/api/system/databases', (req, res) => {
  try {
    const status = getSystemDatabasesStatus();
    res.json({ success: true, ...status });
  } catch (error: any) {
    console.error('Error fetching system database status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================
// COUNSELLING SESSIONS
// ========================

app.get('/api/counselling', async (req, res) => {
  try {
    const sessions = await prisma.counsellingSession.findMany({
      orderBy: { createdAt: 'desc' },
      include: { lead: true },
    });
    res.json(sessions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/counselling', async (req, res) => {
  try {
    const { leadId, date, time, notes, recommendations, concerns, outcome } = req.body;
    const session = await prisma.counsellingSession.create({
      data: {
        leadId,
        date: date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: time || '03:00 PM',
        counsellorName: 'Neha Sharma',
        notes: notes || 'Counselling session notes',
        recommendations,
        concerns,
        outcome: outcome || 'Interested',
      },
    });
    res.status(201).json(session);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========================
// STUDENTS ENDPOINTS
// ========================

app.get('/api/students', async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      orderBy: { enrolledDate: 'desc' },
    });
    res.json(students);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========================
// DOCUMENTS ENDPOINTS
// ========================

app.get('/api/documents', async (req, res) => {
  try {
    const docs = await prisma.document.findMany({
      include: { lead: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(docs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/documents/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const doc = await prisma.document.update({
      where: { id },
      data: {
        status,
        notes: notes !== undefined ? notes : undefined,
        verifiedAt: status === 'Approved' ? new Date() : undefined,
      },
    });
    res.json(doc);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========================
// UNIVERSITIES & APPLICATIONS
// ========================

app.get('/api/universities', async (req, res) => {
  try {
    const unis = await prisma.university.findMany();
    res.json(unis);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/applications', async (req, res) => {
  try {
    const apps = await prisma.application.findMany({
      include: { lead: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(apps);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========================
// COMMUNICATION LOGGING
// ========================

app.post('/api/communications/email', async (req, res) => {
  try {
    const { leadId, to, subject, message } = req.body;
    if (leadId) {
      await prisma.activityLog.create({
        data: {
          leadId,
          action: 'Email Sent',
          details: `Subject: ${subject} | To: ${to}`,
        },
      });
    }
    res.json({ success: true, message: 'Email sent successfully (logged)' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/communications/whatsapp', async (req, res) => {
  try {
    const { leadId, phone, message } = req.body;
    if (leadId) {
      await prisma.activityLog.create({
        data: {
          leadId,
          action: 'WhatsApp Message Sent',
          details: `To: ${phone} | Preview: ${message.slice(0, 50)}...`,
        },
      });
    }
    res.json({ success: true, message: 'WhatsApp message sent (logged)' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// SERVE THE BUILT FRONTEND (production / single-app deployment)
// In dev, Vite serves the client on :5173 and proxies /api here. In production
// this Express process serves both the API and client/dist so one Node app is enough.
const clientDistCandidates = [
  path.resolve(process.cwd(), 'client/dist'), // start from repo root (production)
  path.resolve(__dirname, '../../client/dist'), // dev: server/src -> repo/client/dist
  path.resolve(__dirname, '../../../../client/dist'), // compiled: server/dist/server/src -> repo/client/dist
];
const clientDist = clientDistCandidates.find((dir) => fs.existsSync(path.join(dir, 'index.html')));

if (clientDist) {
  console.log(`📦 Serving built frontend from ${clientDist}`);
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  console.warn('⚠️ client/dist not found. Checked:', clientDistCandidates);
  app.get('/', (req, res) => {
    res.status(200).send('<h1>CRM Server Running</h1><p>Frontend assets are compiling. Please wait a moment.</p>');
  });
}

// START SERVER
app.listen(PORT, async () => {
  console.log(`🚀 CRM API Server running on http://localhost:${PORT}`);
  try {
    await connectMongoDB();
    await initializeDefaultUsers();
    await syncStudentFoldersToPrismaLeads();
    await ensureEnrolledLeadsSynced();
  } catch (err) {
    console.warn('⚠️ Server startup initialization warning:', err);
  }
});
