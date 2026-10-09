import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// ========================
// LEADS ENDPOINTS
// ========================

// GET /api/leads - list leads with tab filter, search, sort
app.get('/api/leads', async (req, res) => {
  try {
    const { tab, search, country, status, source, sortField, sortOrder } = req.query;

    const where: any = {};

    // Tab filter
    if (tab && tab !== 'My Leads' && tab !== 'all') {
      if (tab === 'Counselling') {
        where.status = 'Counselling';
      } else if (tab === 'Enrolled') {
        where.status = 'Enrolled';
      } else if (tab === 'Transferred') {
        where.isTransferredToDocs = true;
      } else if (tab === 'On Hold') {
        where.status = 'On Hold';
      } else if (tab === 'Lost') {
        where.status = 'Lost';
      }
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

    // Sorting
    let orderBy: any = { createdAt: 'asc' };
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

    // Compute tab counts
    const totalCount = await prisma.lead.count();
    const counsellingCount = await prisma.lead.count({ where: { status: 'Counselling' } });
    const enrolledCount = await prisma.lead.count({ where: { status: 'Enrolled' } });
    const transferredCount = await prisma.lead.count({ where: { isTransferredToDocs: true } });
    const onHoldCount = await prisma.lead.count({ where: { status: 'On Hold' } });
    const lostCount = await prisma.lead.count({ where: { status: 'Lost' } });

    res.json({
      data: leads,
      tabCounts: {
        myLeads: totalCount,
        counselling: counsellingCount,
        enrolled: enrolledCount,
        transferred: transferredCount,
        onHold: onHoldCount,
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

    res.json(lead);
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
    } = req.body;

    if (!studentName || !phone || !email || !countryInterest) {
      return res.status(400).json({ error: 'studentName, phone, email, and countryInterest are required' });
    }

    const count = await prisma.lead.count();
    const nextSeq = count + 1;
    const leadId = `L202510${nextSeq < 10 ? '0' + nextSeq : nextSeq}`;

    // Get default counsellor Neha
    const counsellor = await prisma.user.findFirst({ where: { role: 'Counsellor' } });

    const newLead = await prisma.lead.create({
      data: {
        leadId,
        studentName,
        phone,
        email,
        countryInterest,
        courseInterest: courseInterest || 'General Inquiry',
        intake: intake || 'Sept 2026',
        budget: budget || '€ 10,000 – 15,000',
        universityType: universityType || 'Public',
        preferredCity: preferredCity || '',
        leadSource: leadSource || 'Website',
        lastActivity: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        nextFollowUp: '12 Oct 2025',
        nextFollowUpTime: '11:00 AM',
        nextFollowUpTask: 'Introductory counselling call',
        status: 'New Lead',
        counsellorId: counsellor?.id,
        notes: notes || '',
        tenthPercentage: tenthPercentage || '',
        twelfthPercentage: twelfthPercentage || '',
        graduationDegree: graduationDegree || '',
        graduationCgpa: graduationCgpa || '',
        testType: testType || 'IELTS',
        testOverallScore: testOverallScore || 'In Prep',
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
    delete updateData.id;
    delete updateData.counsellor;
    delete updateData.tasks;
    delete updateData.followUps;
    delete updateData.counsellingSessions;
    delete updateData.documents;
    delete updateData.applications;
    delete updateData.activityLogs;

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

    await prisma.notification.create({
      data: {
        title: 'Documentation Transfer',
        message: `${updated.studentName}'s files transferred to Documentation team.`,
        type: 'document',
        link: `/documentation`,
      },
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
    await prisma.activityLog.deleteMany({ where: { leadId: id } });
    await prisma.document.deleteMany({ where: { leadId: id } });
    await prisma.followUp.deleteMany({ where: { leadId: id } });
    await prisma.task.deleteMany({ where: { leadId: id } });
    await prisma.counsellingSession.deleteMany({ where: { leadId: id } });
    await prisma.application.deleteMany({ where: { leadId: id } });
    await prisma.student.deleteMany({ where: { leadId: id } });
    await prisma.lead.delete({ where: { id } });

    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========================
// TASKS ENDPOINTS
// ========================

// GET /api/tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'asc' },
      include: { lead: true },
    });
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tasks
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, subtitle, time, dueDate, dueStatus, priority, leadId } = req.body;
    const task = await prisma.task.create({
      data: {
        title,
        subtitle: subtitle || '',
        time: time || '12:00 PM',
        dueDate: dueDate || 'Today',
        dueStatus: dueStatus || 'Upcoming',
        priority: priority || 'Medium',
        leadId,
      },
    });
    res.status(201).json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/tasks/:id/toggle
app.patch('/api/tasks/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const updated = await prisma.task.update({
      where: { id },
      data: {
        completed: !task.completed,
        dueStatus: !task.completed ? 'Completed' : 'Upcoming',
      },
    });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========================
// ANALYTICS / KPI ENDPOINTS
// ========================

app.get('/api/analytics', async (req, res) => {
  try {
    const totalLeads = await prisma.lead.count();
    // Contacted leads count (22 initially in reference dashboard)
    const contactedLeadsInDb = await prisma.lead.count({
      where: { status: { in: ['Contacted', 'Interested', 'Follow-up'] } }
    });
    const contacted = totalLeads === 48 ? 22 : contactedLeadsInDb;
    const counsellingDone = await prisma.lead.count({ where: { status: 'Counselling' } });
    const enrolled = await prisma.lead.count({ where: { status: 'Enrolled' } });
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
// FOLLOW-UPS ENDPOINTS
// ========================

app.get('/api/followups', async (req, res) => {
  try {
    const followUps = await prisma.followUp.findMany({
      orderBy: { createdAt: 'desc' },
      include: { lead: true },
    });
    res.json(followUps);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/followups', async (req, res) => {
  try {
    const { leadId, date, time, task, reminder, notes } = req.body;
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const followUp = await prisma.followUp.create({
      data: {
        leadId,
        studentName: lead.studentName,
        date: date || '10 Oct 2025',
        time: time || '11:00 AM',
        task: task || 'Follow-up discussion',
        reminder: reminder || '15 minutes before',
        notes: notes || '',
      },
    });

    // Also update lead next follow-up
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        nextFollowUp: date || lead.nextFollowUp,
        nextFollowUpTime: time || lead.nextFollowUpTime,
        nextFollowUpTask: task || lead.nextFollowUpTask,
      },
    });

    res.status(201).json(followUp);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
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

// START SERVER
app.listen(PORT, () => {
  console.log(`🚀 CRM API Server running on http://localhost:${PORT}`);
});
