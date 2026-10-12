import { AnalyticsData, FollowUp, Lead, NotificationItem, Task, DocumentItem } from '../types/crm';
import { INITIAL_LEADS, INITIAL_TASKS, INITIAL_NOTIFICATIONS, INITIAL_ANALYTICS } from './mockData';

const BASE_URL = (import.meta.env.VITE_API_URL as string) || '/api';

// Detect whether we are in a pure frontend deployment (like Vercel static) without a custom backend URL
const isProductionFrontendOnly =
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1' &&
  !import.meta.env.VITE_API_URL;

// Safe fetch wrapper: checks JSON content-type and parses safely inside try/catch
async function safeFetchJson<T>(url: string, options?: RequestInit, timeoutMs = 1200): Promise<T | null> {
  // If deployed in production without a custom API backend specified, immediately use mock data
  if (isProductionFrontendOnly) {
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    // If the server returned HTML (e.g., an SPA index.html rewrite), it is NOT valid JSON
    if (!contentType.includes('application/json')) {
      return null;
    }
    const data = await res.json();
    return data as T;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

// LocalStorage helpers for standalone/offline fallback store
function getLocalLeads(): Lead[] {
  try {
    const stored = localStorage.getItem('crm_leads_v2');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading crm_leads_v2', e);
  }
  return INITIAL_LEADS;
}

function saveLocalLeads(leads: Lead[]) {
  try {
    localStorage.setItem('crm_leads_v2', JSON.stringify(leads));
  } catch (e) {
    console.error('Error saving crm_leads_v2', e);
  }
}

function getLocalTasks(): Task[] {
  try {
    const stored = localStorage.getItem('crm_tasks_v2');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading crm_tasks_v2', e);
  }
  return INITIAL_TASKS;
}

function saveLocalTasks(tasks: Task[]) {
  try {
    localStorage.setItem('crm_tasks_v2', JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving crm_tasks_v2', e);
  }
}

function getLocalNotifs(): NotificationItem[] {
  try {
    const stored = localStorage.getItem('crm_notifs_v2');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading crm_notifs_v2', e);
  }
  return INITIAL_NOTIFICATIONS;
}

function saveLocalNotifs(notifs: NotificationItem[]) {
  try {
    localStorage.setItem('crm_notifs_v2', JSON.stringify(notifs));
  } catch (e) {
    console.error('Error saving crm_notifs_v2', e);
  }
}

// ==========================================
// 1. ANALYTICS
// ==========================================
export async function fetchAnalytics(): Promise<AnalyticsData> {
  const data = await safeFetchJson<AnalyticsData>(`${BASE_URL}/analytics`);
  if (data) return data;

  const leads = getLocalLeads();
  const total = leads.length;
  const contacted = leads.filter((l) =>
    ['Contacted', 'Interested', 'Counselling', 'Enrolled', 'Follow-up', 'Transferred'].includes(l.status)
  ).length;
  const counselling = leads.filter((l) => l.status === 'Counselling').length;
  const enrolled = leads.filter((l) => l.status === 'Enrolled' || l.isEnrolled).length;
  const transferred = leads.filter((l) => l.isTransferredToDocs).length;

  return {
    ...INITIAL_ANALYTICS,
    kpis: {
      ...INITIAL_ANALYTICS.kpis,
      totalLeads: { value: total, label: 'Total Leads', growth: '↑ 12%' },
      contacted: { value: contacted, label: 'Contacted', growth: '↑ 8%' },
      counsellingDone: { value: counselling, label: 'Counselling Done', growth: '↑ 20%' },
      enrolled: { value: enrolled, label: 'Enrolled', growth: '↑ 14%' },
      transferred: { value: transferred, label: 'Transferred to Documentation', growth: '↑ 25%' },
    },
  };
}

// ==========================================
// 2. LEADS
// ==========================================
export async function fetchLeads(params?: {
  tab?: string;
  search?: string;
  country?: string;
  status?: string;
  source?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<{ data: Lead[]; tabCounts: Record<string, number> }> {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
  }

  const remote = await safeFetchJson<{ data: Lead[]; tabCounts: Record<string, number> }>(
    `${BASE_URL}/leads?${query.toString()}`
  );
  if (remote) return remote;

  // Standalone / Offline fallback
  const allLeads = getLocalLeads();
  let filtered = [...allLeads];

  // Tab Filter
  if (params?.tab && params.tab !== 'My Leads' && params.tab !== 'all') {
    const t = params.tab;
    if (t === 'Counselling') {
      filtered = filtered.filter((l) => l.status === 'Counselling');
    } else if (t === 'Enrolled') {
      filtered = filtered.filter((l) => l.status === 'Enrolled' || l.isEnrolled);
    } else if (t === 'Transferred') {
      filtered = filtered.filter((l) => l.isTransferredToDocs);
    } else if (t === 'On Hold') {
      filtered = filtered.filter((l) => l.status === 'On Hold');
    } else if (t === 'Lost') {
      filtered = filtered.filter((l) => l.status === 'Lost');
    }
  }

  // Status Filter
  if (params?.status && params.status !== 'All') {
    filtered = filtered.filter((l) => l.status === params.status);
  }

  // Country Filter
  if (params?.country && params.country !== 'All') {
    filtered = filtered.filter((l) => l.countryInterest === params.country);
  }

  // Source Filter
  if (params?.source && params.source !== 'All') {
    filtered = filtered.filter((l) => l.leadSource === params.source);
  }

  // Search
  if (params?.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    filtered = filtered.filter(
      (l) =>
        l.studentName.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.leadId.toLowerCase().includes(q) ||
        l.courseInterest.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (params?.sortField) {
    const field = params.sortField as keyof Lead;
    const order = params.sortOrder === 'asc' ? 1 : -1;
    filtered.sort((a, b) => {
      const va = a[field] || '';
      const vb = b[field] || '';
      return va > vb ? order : va < vb ? -order : 0;
    });
  }

  const tabCounts = {
    myLeads: allLeads.length,
    counselling: allLeads.filter((l) => l.status === 'Counselling').length,
    enrolled: allLeads.filter((l) => l.status === 'Enrolled' || l.isEnrolled).length,
    transferred: allLeads.filter((l) => l.isTransferredToDocs).length,
    onHold: allLeads.filter((l) => l.status === 'On Hold').length,
    lost: allLeads.filter((l) => l.status === 'Lost').length,
  };

  return { data: filtered, tabCounts };
}

export async function fetchLeadById(id: string): Promise<Lead> {
  const remote = await safeFetchJson<Lead>(`${BASE_URL}/leads/${id}`);
  if (remote) return remote;

  const leads = getLocalLeads();
  const match = leads.find((l) => l.id === id || l.leadId === id);
  if (!match) throw new Error('Lead not found');
  return match;
}

export async function createLead(leadData: Partial<Lead>): Promise<Lead> {
  const remote = await safeFetchJson<Lead>(`${BASE_URL}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leadData),
  });
  if (remote) return remote;

  const leads = getLocalLeads();
  const nextIdNum = leads.length + 1;
  const newLead: Lead = {
    id: `lead-${Date.now()}`,
    leadId: `L202510${nextIdNum < 10 ? '0' + nextIdNum : nextIdNum}`,
    studentName: leadData.studentName || 'New Student',
    phone: leadData.phone || '+91 99999 99999',
    email: leadData.email || 'student@example.com',
    countryInterest: leadData.countryInterest || 'Italy',
    courseInterest: leadData.courseInterest || 'MSc Management',
    leadSource: leadData.leadSource || 'Website',
    lastActivity: 'Just now',
    nextFollowUp: leadData.nextFollowUp || 'Tomorrow',
    status: leadData.status || 'New Lead',
    currentStage: 'New Lead',
    isEnrolled: false,
    isTransferredToDocs: false,
    avatarUrl: '/avatars/rahul.png',
    counsellor: {
      id: 'counsellor-neha',
      name: 'Neha Sharma',
      email: 'neha.sharma@studyabroadcrm.com',
      role: 'Senior Counsellor',
      avatar: '/avatars/neha.png',
    },
    ...leadData,
  };

  const updated = [newLead, ...leads];
  saveLocalLeads(updated);
  return newLead;
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
  const remote = await safeFetchJson<Lead>(`${BASE_URL}/leads/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (remote) return remote;

  const leads = getLocalLeads();
  let updatedLead: Lead | null = null;
  const updated = leads.map((l) => {
    if (l.id === id || l.leadId === id) {
      updatedLead = { ...l, ...updates };
      return updatedLead;
    }
    return l;
  });

  saveLocalLeads(updated);
  return updatedLead || { ...leads[0], ...updates };
}

export async function enrollLead(id: string): Promise<{ lead: Lead; student: any }> {
  const remote = await safeFetchJson<{ lead: Lead; student: any }>(`${BASE_URL}/leads/${id}/enroll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (remote) return remote;

  const leads = getLocalLeads();
  const match = leads.find((l) => l.id === id || l.leadId === id);
  const enrolledLead: Lead = match
    ? {
        ...match,
        isEnrolled: true,
        status: 'Enrolled',
        currentStage: 'Enrolled',
        enrolledAt: new Date().toISOString().split('T')[0],
      }
    : { ...leads[0], isEnrolled: true, status: 'Enrolled' };

  const updated = leads.map((l) => (l.id === id || l.leadId === id ? enrolledLead : l));
  saveLocalLeads(updated);
  return {
    lead: enrolledLead,
    student: {
      studentId: `STU${Date.now()}`,
      name: enrolledLead.studentName,
    },
  };
}

export async function transferToDocs(id: string): Promise<Lead> {
  const remote = await safeFetchJson<Lead>(`${BASE_URL}/leads/${id}/transfer-docs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (remote) return remote;

  const leads = getLocalLeads();
  const match = leads.find((l) => l.id === id || l.leadId === id);
  const transferredLead: Lead = match
    ? {
        ...match,
        isTransferredToDocs: true,
        currentStage: 'Documentation',
        status: 'Transferred',
        transferredAt: new Date().toISOString().split('T')[0],
      }
    : { ...leads[0], isTransferredToDocs: true, status: 'Transferred' };

  const updated = leads.map((l) => (l.id === id || l.leadId === id ? transferredLead : l));
  saveLocalLeads(updated);
  return transferredLead;
}

export async function deleteLead(id: string): Promise<void> {
  await safeFetchJson(`${BASE_URL}/leads/${id}`, {
    method: 'DELETE',
  });

  const leads = getLocalLeads();
  const updated = leads.filter((l) => l.id !== id && l.leadId !== id);
  saveLocalLeads(updated);
}

// ==========================================
// 3. TASKS
// ==========================================
export async function fetchTasks(): Promise<Task[]> {
  const remote = await safeFetchJson<Task[]>(`${BASE_URL}/tasks`);
  if (remote) return remote;
  return getLocalTasks();
}

export async function toggleTask(id: string): Promise<Task> {
  const remote = await safeFetchJson<Task>(`${BASE_URL}/tasks/${id}/toggle`, {
    method: 'PATCH',
  });
  if (remote) return remote;

  const tasks = getLocalTasks();
  let updatedTask: Task | null = null;
  const updated = tasks.map((t) => {
    if (t.id === id) {
      updatedTask = {
        ...t,
        completed: !t.completed,
        dueStatus: !t.completed ? ('Completed' as const) : ('Upcoming' as const),
      };
      return updatedTask;
    }
    return t;
  });

  saveLocalTasks(updated);
  return updatedTask || tasks[0];
}

export async function createTask(task: Partial<Task>): Promise<Task> {
  const remote = await safeFetchJson<Task>(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  if (remote) return remote;

  const tasks = getLocalTasks();
  const newTask: Task = {
    id: `task-${Date.now()}`,
    title: task.title || 'New Task',
    subtitle: task.subtitle || 'Scheduled reminder',
    time: task.time || '10:00 AM',
    dueDate: task.dueDate || 'Today',
    dueStatus: 'Upcoming',
    completed: false,
    priority: task.priority || 'Medium',
    leadId: task.leadId,
    lead: task.lead,
  };

  const updated = [newTask, ...tasks];
  saveLocalTasks(updated);
  return newTask;
}

// ==========================================
// 4. NOTIFICATIONS
// ==========================================
export async function fetchNotifications(): Promise<{ list: NotificationItem[]; unreadCount: number }> {
  const remote = await safeFetchJson<{ list: NotificationItem[]; unreadCount: number }>(`${BASE_URL}/notifications`);
  if (remote) return remote;

  const list = getLocalNotifs();
  const unreadCount = list.filter((n) => !n.isRead).length;
  return { list, unreadCount };
}

export async function markNotificationRead(id: string): Promise<void> {
  await safeFetchJson(`${BASE_URL}/notifications/${id}/read`, { method: 'PATCH' });

  const notifs = getLocalNotifs();
  const updated = notifs.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  saveLocalNotifs(updated);
}

export async function markAllNotificationsRead(): Promise<void> {
  await safeFetchJson(`${BASE_URL}/notifications/read-all`, { method: 'POST' });

  const notifs = getLocalNotifs();
  const updated = notifs.map((n) => ({ ...n, isRead: true }));
  saveLocalNotifs(updated);
}

// ==========================================
// 5. GLOBAL SEARCH & FOLLOW-UPS & COMMUNICATIONS
// ==========================================
export async function searchGlobal(q: string): Promise<Lead[]> {
  const remote = await safeFetchJson<Lead[]>(`${BASE_URL}/search?q=${encodeURIComponent(q)}`);
  if (remote) return remote;

  const leads = getLocalLeads();
  const query = q.toLowerCase().trim();
  return leads.filter(
    (l) =>
      l.studentName.toLowerCase().includes(query) ||
      l.phone.includes(query) ||
      l.email.toLowerCase().includes(query) ||
      l.leadId.toLowerCase().includes(query) ||
      l.courseInterest.toLowerCase().includes(query)
  );
}

export async function scheduleFollowUp(data: {
  leadId: string;
  date: string;
  time: string;
  task: string;
  reminder?: string;
  notes?: string;
}): Promise<FollowUp> {
  const remote = await safeFetchJson<FollowUp>(`${BASE_URL}/followups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (remote) return remote;

  const leads = getLocalLeads();
  const match = leads.find((l) => l.id === data.leadId || l.leadId === data.leadId);
  const newFu: FollowUp = {
    id: `fu-${Date.now()}`,
    leadId: data.leadId,
    studentName: match?.studentName || 'Student',
    date: data.date,
    time: data.time,
    task: data.task,
    reminder: data.reminder || '15 minutes before',
    status: 'Scheduled',
    notes: data.notes,
  };

  if (match) {
    const updated = leads.map((l) =>
      l.id === match.id
        ? {
            ...l,
            nextFollowUp: data.date,
            nextFollowUpTime: data.time,
            nextFollowUpTask: data.task,
            followUps: [newFu, ...(l.followUps || [])],
          }
        : l
    );
    saveLocalLeads(updated);
  }

  return newFu;
}

export async function sendEmail(data: { leadId?: string; to: string; subject: string; message: string }): Promise<void> {
  await safeFetchJson(`${BASE_URL}/communications/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function sendWhatsApp(data: { leadId?: string; phone: string; message: string }): Promise<void> {
  await safeFetchJson(`${BASE_URL}/communications/whatsapp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

// ==========================================
// 6. STUDENTS & OTHER ENTITIES
// ==========================================
export async function fetchStudents(): Promise<any[]> {
  const remote = await safeFetchJson<any[]>(`${BASE_URL}/students`);
  if (remote) return remote;
  return [];
}

export async function fetchDocuments(): Promise<DocumentItem[]> {
  const remote = await safeFetchJson<DocumentItem[]>(`${BASE_URL}/documents`);
  if (remote) return remote;
  return [];
}

export async function updateDocumentStatus(id: string, status: string, notes?: string): Promise<DocumentItem> {
  const remote = await safeFetchJson<DocumentItem>(`${BASE_URL}/documents/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, notes }),
  });
  if (remote) return remote;
  return { id, leadId: 'lead-1', name: 'Document', category: 'Academic', status: status as any, notes };
}

export async function fetchApplications(): Promise<any[]> {
  const remote = await safeFetchJson<any[]>(`${BASE_URL}/applications`);
  if (remote) return remote;
  return [];
}

export async function fetchUniversities(): Promise<any[]> {
  const remote = await safeFetchJson<any[]>(`${BASE_URL}/universities`);
  if (remote) return remote;
  return [];
}
