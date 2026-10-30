import { AnalyticsData, FollowUp, Lead, NotificationItem, Task, DocumentItem, CalendarEvent } from '../types/crm';
import { PORTAL_CONFIGS, UserRole } from '../types/auth';
import {
  CATALOG_PROFILES,
  CATALOG_LEADS,
  CATALOG_STUDENTS,
  CATALOG_TASKS,
  CATALOG_CALENDAR,
  CATALOG_AUDIT,
} from './studentProfilesCatalog';

const BASE_URL = (import.meta.env.VITE_API_URL as string) || '/api';

// Currently signed-in operator, used to attribute profile changes in the audit log
export function getAuditActor(): { name: string | null; email: string | null; role: string | null } {
  try {
    const stored = localStorage.getItem('crm_auth_user_v1');
    if (!stored) return { name: null, email: null, role: null };
    const u = JSON.parse(stored);
    return {
      name: u?.name || null,
      email: u?.email || null,
      role: u?.role || null,
    };
  } catch {
    return { name: null, email: null, role: null };
  }
}

function getAuditPortal(role: string | null): string | null {
  if (!role) return null;
  const cfg = (PORTAL_CONFIGS as Record<string, { title: string }>)[role];
  return cfg ? cfg.title : role;
}

function withAudit(body: Record<string, any>): Record<string, any> {
  const actor = getAuditActor();
  return { ...body, _actor: actor, _portal: getAuditPortal(actor.role) };
}

// Detect whether we are in a pure frontend deployment (like Vercel static) without a custom backend URL
const isProductionFrontendOnly =
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1' &&
  !import.meta.env.VITE_API_URL;

// Safe fetch wrapper: checks JSON content-type and parses safely inside try/catch
async function safeFetchJson<T>(url: string, options?: RequestInit, timeoutMs = 2000): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    // If the server returned HTML (e.g., an SPA index.html rewrite or 503 error), it is NOT valid JSON
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

// LocalStorage helpers for cache
const LEADS_STORAGE_KEY = 'crm_leads_v5';
const TASKS_STORAGE_KEY = 'crm_tasks_v5';
const VALID_DISK_STUDENTS = new Set(['Ananya Sharma', 'Arjun Verma', 'Kavya Iyer', 'Rohan Mehta']);

// Clean up any stale legacy caches with old dummy data
try {
  ['crm_leads_v1', 'crm_leads_v2', 'crm_leads_v3', 'crm_leads_v4', 'crm_tasks_v1', 'crm_tasks_v2', 'crm_tasks_v3', 'crm_tasks_v4'].forEach(
    (k) => localStorage.removeItem(k)
  );
} catch (e) {}

function getLocalLeads(): Lead[] {
  try {
    const stored = localStorage.getItem(LEADS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Enforce strictly only the 4 students matching the Hostinger student_profile disk folders
        const cleanLeads = parsed.filter((l) => VALID_DISK_STUDENTS.has(l.studentName));
        if (cleanLeads.length === 4) return cleanLeads;
      }
    }
  } catch (e) {
    console.error('Error reading crm_leads', e);
  }
  // Initialize ONLY the 4 disk student profiles & save
  saveLocalLeads(CATALOG_LEADS);
  return CATALOG_LEADS;
}

function saveLocalLeads(leads: Lead[]) {
  try {
    const cleanLeads = leads.filter((l) => VALID_DISK_STUDENTS.has(l.studentName));
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(cleanLeads.length > 0 ? cleanLeads : CATALOG_LEADS));
  } catch (e) {
    console.error('Error saving crm_leads', e);
  }
}

function getLocalTasks(): Task[] {
  try {
    const stored = localStorage.getItem(TASKS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading crm_tasks', e);
  }
  saveLocalTasks(CATALOG_TASKS);
  return CATALOG_TASKS;
}

function saveLocalTasks(tasks: Task[]) {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving crm_tasks', e);
  }
}

function getLocalNotifs(): NotificationItem[] {
  try {
    const stored = localStorage.getItem('crm_notifs_v3');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const demoNotifIds = new Set(['notif-1', 'notif-2', 'notif-3']);
        return parsed.filter((n: NotificationItem) => !demoNotifIds.has(n.id));
      }
    }
  } catch (e) {
    console.error('Error reading crm_notifs_v3', e);
  }
  return [];
}

function saveLocalNotifs(notifs: NotificationItem[]) {
  try {
    localStorage.setItem('crm_notifs_v3', JSON.stringify(notifs));
  } catch (e) {
    console.error('Error saving crm_notifs_v3', e);
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
    kpis: {
      totalLeads: { value: total, label: 'Total Leads', growth: '—' },
      contacted: { value: contacted, label: 'Contacted', growth: '—' },
      counsellingDone: { value: counselling, label: 'Counselling Done', growth: '—' },
      enrolled: { value: enrolled, label: 'Enrolled', growth: '—' },
      transferred: { value: transferred, label: 'Transferred to Documentation', growth: '—' },
      applicationInProcess: { value: 0, label: 'Application in Process', growth: '—' },
      offerReceived: { value: 0, label: 'Offer Received', growth: '—' },
    },
    counsellingSummary: [
      { name: 'Total Leads', count: total, fill: '#087cf5' },
      { name: 'Contacted', count: contacted, fill: '#10b981' },
      { name: 'Counselling', count: counselling, fill: '#f59e0b' },
      { name: 'Enrolled', count: enrolled, fill: '#ec4899' },
      { name: 'Transferred', count: transferred, fill: '#8b5cf6' },
    ],
    leadSources: [],
    countryInterest: [],
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
      filtered = filtered.filter((l) => l.status === 'Counselling' && !l.isEnrolled);
    } else if (t === 'New Leads' || t === 'New Lead') {
      filtered = filtered.filter((l) => l.status === 'New Lead' && !l.isEnrolled);
    } else if (t === 'Contacted') {
      filtered = filtered.filter((l) => l.status === 'Contacted' && !l.isEnrolled);
    } else if (t === 'Interested') {
      filtered = filtered.filter((l) => l.status === 'Interested' && !l.isEnrolled);
    } else if (t === 'Enrolled') {
      filtered = filtered.filter((l) => l.status === 'Enrolled' || l.isEnrolled);
    } else if (t === 'Transferred') {
      filtered = filtered.filter((l) => l.isTransferredToDocs);
    } else if (t === 'On Hold') {
      filtered = filtered.filter((l) => l.status === 'On Hold' && !l.isEnrolled);
    } else if (t === 'Drop') {
      filtered = filtered.filter((l) => l.status === 'Drop' && !l.isEnrolled);
    } else if (t === 'Lost') {
      filtered = filtered.filter((l) => l.status === 'Lost' && !l.isEnrolled);
    }
  } else {
    // Enrolled students belong only to the Enrolled Students section, even if
    // their current status has advanced to Offer Received / Visa / etc.
    filtered = filtered.filter((l) => l.status !== 'Enrolled' && !l.isEnrolled);
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
    myLeads: allLeads.filter((l) => l.status !== 'Enrolled' && !l.isEnrolled).length,
    total: allLeads.length,
    newLeads: allLeads.filter((l) => l.status === 'New Lead' && !l.isEnrolled).length,
    contacted: allLeads.filter((l) => l.status === 'Contacted' && !l.isEnrolled).length,
    counselling: allLeads.filter((l) => l.status === 'Counselling' && !l.isEnrolled).length,
    interested: allLeads.filter((l) => l.status === 'Interested' && !l.isEnrolled).length,
    enrolled: allLeads.filter((l) => l.status === 'Enrolled' || l.isEnrolled).length,
    transferred: allLeads.filter((l) => l.isTransferredToDocs).length,
    onHold: allLeads.filter((l) => l.status === 'On Hold' && !l.isEnrolled).length,
    drop: allLeads.filter((l) => l.status === 'Drop' && !l.isEnrolled).length,
    lost: allLeads.filter((l) => l.status === 'Lost' && !l.isEnrolled).length,
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
    body: JSON.stringify(withAudit(leadData as Record<string, any>)),
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

export async function updateLead(id: string, updates: Partial<Lead> & Record<string, any>): Promise<Lead> {
  const remote = await safeFetchJson<Lead>(`${BASE_URL}/leads/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(withAudit(updates as Record<string, any>)),
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
    body: JSON.stringify(withAudit({})),
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
    body: JSON.stringify(withAudit({})),
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(withAudit({})),
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

export async function deleteTask(id: string): Promise<boolean> {
  await safeFetchJson(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
  });
  const tasks = getLocalTasks();
  const updated = tasks.filter((t) => t.id !== id);
  saveLocalTasks(updated);
  return true;
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

export async function fetchFollowUps(): Promise<FollowUp[]> {
  const remote = await safeFetchJson<FollowUp[]>(`${BASE_URL}/followups`);
  if (remote) return remote;
  const leads = getLocalLeads();
  const all: FollowUp[] = [];
  leads.forEach((l) => {
    if (l.followUps) all.push(...l.followUps);
  });
  return all;
}

export async function deleteFollowUp(id: string): Promise<boolean> {
  await safeFetchJson(`${BASE_URL}/followups/${id}`, { method: 'DELETE' });
  const leads = getLocalLeads();
  const updated = leads.map((l) => ({
    ...l,
    followUps: (l.followUps || []).filter((f) => f.id !== id),
  }));
  saveLocalLeads(updated);
  return true;
}

// ==========================================
// 5b. CALENDAR EVENTS (SQLite calendar.db)
// ==========================================
const CALENDAR_STORAGE_KEY = 'crm-calendar-events-v2';

export async function fetchCalendarEvents(startDate?: string, endDate?: string): Promise<CalendarEvent[]> {
  let url = `${BASE_URL}/calendar/events`;
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  if (params.toString()) url += `?${params.toString()}`;

  const remote = await safeFetchJson<CalendarEvent[]>(url);
  if (remote && Array.isArray(remote)) {
    try {
      localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(remote));
    } catch (e) {}
    return remote;
  }

  try {
    const cached = localStorage.getItem(CALENDAR_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return CATALOG_CALENDAR;
}

export async function createCalendarEvent(eventData: Partial<CalendarEvent>): Promise<CalendarEvent> {
  const remote = await safeFetchJson<CalendarEvent>(`${BASE_URL}/calendar/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });

  const created: CalendarEvent = remote || {
    id: `evt-${Date.now()}`,
    title: eventData.title || 'Meeting',
    type: eventData.type || 'followup',
    date: eventData.date || new Date().toISOString().slice(0, 10),
    time: eventData.time || '11:00 AM',
    duration: eventData.duration || '30 mins',
    studentName: eventData.studentName || '',
    leadId: eventData.leadId,
    phone: eventData.phone,
    countryInterest: eventData.countryInterest || 'Italy',
    counsellor: eventData.counsellor || 'Neha Sharma',
    mode: eventData.mode || 'Phone Call',
    priority: eventData.priority || 'Medium',
    status: eventData.status || 'Scheduled',
    notes: eventData.notes,
  };

  try {
    const cached = localStorage.getItem(CALENDAR_STORAGE_KEY);
    const list: CalendarEvent[] = cached ? JSON.parse(cached) : [];
    localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify([created, ...list]));
  } catch (e) {}

  return created;
}

export async function updateCalendarEvent(id: string, data: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
  const remote = await safeFetchJson<CalendarEvent>(`${BASE_URL}/calendar/events/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  try {
    const cached = localStorage.getItem(CALENDAR_STORAGE_KEY);
    if (cached) {
      const list: CalendarEvent[] = JSON.parse(cached);
      const updated = list.map((e) => (e.id === id ? { ...e, ...data, ...(remote || {}) } : e));
      localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (e) {}

  return remote;
}

export async function deleteCalendarEvent(id: string): Promise<boolean> {
  await safeFetchJson(`${BASE_URL}/calendar/events/${id}`, { method: 'DELETE' });

  try {
    const cached = localStorage.getItem(CALENDAR_STORAGE_KEY);
    if (cached) {
      const list: CalendarEvent[] = JSON.parse(cached);
      localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(list.filter((e) => e.id !== id)));
    }
  } catch (e) {}

  return true;
}

// System operational databases status
export async function fetchSystemDatabases(): Promise<any> {
  return await safeFetchJson(`${BASE_URL}/system/databases`);
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
  if (remote && Array.isArray(remote) && remote.length > 0) return remote;
  return CATALOG_STUDENTS;
}

export async function fetchDocuments(): Promise<DocumentItem[]> {
  const remote = await safeFetchJson<DocumentItem[]>(`${BASE_URL}/documents`);
  if (remote && Array.isArray(remote) && remote.length > 0) return remote;
  const leads = getLocalLeads();
  const docs: DocumentItem[] = [];
  leads.forEach((l) => {
    if (l.documents) docs.push(...l.documents);
  });
  return docs;
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

// ==========================================
// 7. COMMON STUDENT PROFILE (SQL DATABASE)
// ==========================================

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
  alternative_courses?: string;
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
  folder_name?: string;
  db_file?: string;
  documents_folder?: string;
  physical_documents?: Array<{
    name: string;
    size: number;
    sizeFormatted: string;
    modified: string;
    relativePath: string;
  }>;
  academic?: {
    id?: string;
    tenth_board?: string;
    tenth_percentage?: string;
    twelfth_board?: string;
    twelfth_percentage?: string;
    bachelor_degree?: string;
    bachelor_university?: string;
    bachelor_cgpa?: string;
    bachelor_passing_year?: string;
    backlogs?: string;
    education_gaps?: string;
    work_experience?: string;
  };
  test_scores?: Array<{
    id: string;
    test_type: string;
    overall_score: string;
    reading: string;
    writing: string;
    listening: string;
    speaking: string;
    test_date: string;
    status: string;
  }>;
  counselling?: {
    counsellor_name?: string;
    session_date?: string;
    preferred_countries?: string;
    budget_bracket?: string;
    notes?: string;
    recommendations?: string;
    outcome?: string;
  };
  counselling_sessions?: Array<{
    id: string;
    student_id: string;
    lead_id?: string;
    session_date: string;
    session_time: string;
    counsellor_name: string;
    session_type?: string;
    mode?: string;
    status?: string;
    notes?: string;
    recommendations?: string;
    concerns?: string;
    outcome?: string;
    created_at?: string;
  }>;
  shortlists?: Array<{
    id: string;
    university_name: string;
    program_name: string;
    country: string;
    tuition_fee: string;
    cfu_credits: string;
    status: string;
  }>;
  approval?: {
    choice_1_university?: string;
    choice_2_university?: string;
    agreement_signed?: boolean | number;
    agreement_status?: string;
    student_signature_note?: string;
    service_package?: string;
    total_fee?: string;
    amount_paid?: string;
    balance?: string;
    payment_schedule?: string;
  };
  documents?: Array<{
    id: string;
    document_name: string;
    category: string;
    status: string;
    remarks: string;
    verified_by: string;
  }>;
  applications?: Array<{
    id: string;
    university_name: string;
    program_name: string;
    portal_application_id: string;
    submission_date: string;
    status: string;
  }>;
  offers?: Array<{
    id: string;
    university_name: string;
    offer_type: string;
    received_date: string;
    conditions: string;
    deposit_amount: string;
    seat_confirmed: boolean | number;
    status: string;
  }>;
  scholarship?: {
    scholarship_name?: string;
    isee_parificato_amount?: string;
    stipend_amount?: string;
    status?: string;
  };
  pre_enrolment?: {
    universitaly_summary_code?: string;
    university_validation_status?: string;
    status?: string;
  };
  legalization?: {
    process_type?: string;
    cimea_diploma_ref?: string;
    status?: string;
  };
  visa?: {
    vfs_center?: string;
    appointment_date?: string;
    appointment_time?: string;
    visa_type?: string;
    vfs_reference_no?: string;
    checklist_verification?: string;
    financial_proof_amount?: string;
    decision?: string;
    decision_date?: string;
  };
  pre_departure?: {
    flight_booking_status?: string;
    accommodation_status?: string;
    forex_card_status?: string;
    status?: string;
  };
  timeline?: Array<{
    id: string;
    action: string;
    portal_role: string;
    operator_name: string;
    details: string;
    dot_color: string;
    created_at: string;
  }>;
}

export async function fetchCommonProfiles(): Promise<CommonStudentProfile[]> {
  const remote = await safeFetchJson<{ success: boolean; data: CommonStudentProfile[] }>(`${BASE_URL}/student-profiles`);
  if (remote && remote.data && remote.data.length > 0) return remote.data;
  return CATALOG_PROFILES;
}

export async function fetchCommonProfileById(id: string): Promise<CommonStudentProfile | null> {
  const remote = await safeFetchJson<{ success: boolean; data: CommonStudentProfile }>(`${BASE_URL}/student-profiles/${encodeURIComponent(id)}`);
  if (remote && remote.data) return remote.data;
  const found = CATALOG_PROFILES.find(
    (p) =>
      p.id === id ||
      p.student_id === id ||
      p.lead_id === id ||
      (p.folder_name && p.folder_name.toLowerCase() === id.toLowerCase()) ||
      p.phone.includes(id)
  );
  return found || null;
}

export async function createCommonProfile(profileData: Partial<CommonStudentProfile>): Promise<CommonStudentProfile | null> {
  const remote = await safeFetchJson<{ success: boolean; data: CommonStudentProfile }>(
    `${BASE_URL}/student-profiles`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    }
  );
  if (remote && remote.data) return remote.data;
  return null;
}

export async function updateCommonProfileSection(
  studentId: string,
  section: string,
  data: any,
  operatorName = 'Staff Operator',
  portalRole = 'counsellor',
  actorDetails?: { email?: string; portal?: string }
): Promise<CommonStudentProfile | null> {
  const remote = await safeFetchJson<{ success: boolean; data: CommonStudentProfile }>(
    `${BASE_URL}/student-profiles/${encodeURIComponent(studentId)}/section/${encodeURIComponent(section)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data,
        operatorName,
        portalRole,
        _actor: {
          name: operatorName,
          email: actorDetails?.email || null,
          role: portalRole,
          portal: actorDetails?.portal || null,
        },
        _portal: actorDetails?.portal || null,
      }),
    }
  );
  if (remote && remote.data) return remote.data;
  return null;
}

export async function bookCounsellingSession(
  studentIdOrCode: string,
  session: {
    session_date?: string;
    session_time?: string;
    counsellor_name?: string;
    session_type?: string;
    mode?: string;
    status?: string;
    notes?: string;
    recommendations?: string;
    concerns?: string;
    outcome?: string;
  },
  actorDetails?: { name?: string; email?: string; role?: string; portal?: string }
): Promise<CommonStudentProfile | null> {
  const actor = getAuditActor();
  const remote = await safeFetchJson<{ success: boolean; data: CommonStudentProfile }>(
    `${BASE_URL}/student-profiles/${encodeURIComponent(studentIdOrCode)}/counselling-sessions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: session,
        operatorName: actorDetails?.name || actor.name || 'Staff Operator',
        portalRole: actorDetails?.portal || actorDetails?.role || actor.role || 'counsellor',
        _actor: {
          name: actorDetails?.name || actor.name || null,
          email: actorDetails?.email || actor.email || null,
          role: actorDetails?.role || actor.role || null,
          portal: actorDetails?.portal || actor.role || null,
        },
      }),
    }
  );
  return remote?.data || null;
}

export async function removeCounsellingSession(
  studentIdOrCode: string,
  sessionId: string,
  actorDetails?: { name?: string; email?: string; role?: string; portal?: string }
): Promise<CommonStudentProfile | null> {
  const actor = getAuditActor();
  const remote = await safeFetchJson<{ success: boolean; data: CommonStudentProfile }>(
    `${BASE_URL}/student-profiles/${encodeURIComponent(studentIdOrCode)}/counselling-sessions/${encodeURIComponent(sessionId)}`,
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operatorName: actorDetails?.name || actor.name || 'Staff Operator',
        portalRole: actorDetails?.portal || actorDetails?.role || actor.role || 'counsellor',
        _actor: {
          name: actorDetails?.name || actor.name || null,
          email: actorDetails?.email || actor.email || null,
          role: actorDetails?.role || actor.role || null,
          portal: actorDetails?.portal || actor.role || null,
        },
      }),
    }
  );
  return remote?.data || null;
}

export async function addProfileTimelineActivity(
  studentId: string,
  action: string,
  details?: string,
  actor?: string,
  portalRole?: string
): Promise<CommonStudentProfile | null> {
  const remote = await safeFetchJson<{ success: boolean; data: CommonStudentProfile }>(
    `${BASE_URL}/student-profiles/${encodeURIComponent(studentId)}/timeline`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, details, actor, portalRole }),
    }
  );
  if (remote && remote.data) return remote.data;
  return null;
}

// ==========================================
// PROFILE AUDIT (History section)
// ==========================================

export interface AuditEntry {
  id: string;
  entityType: string;
  entityId: string;
  entityCode: string | null;
  studentName: string | null;
  action: string;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  actorName: string | null;
  actorEmail: string | null;
  actorRole: string | null;
  portal: string | null;
  createdAt: string;
}

export interface AuditFilters {
  search?: string;
  portal?: string;
  action?: string;
  entityId?: string;
  limit?: number;
  offset?: number;
}

export async function fetchAudit(filters: AuditFilters = {}): Promise<{ total: number; entries: AuditEntry[] }> {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.portal) params.set('portal', filters.portal);
  if (filters.action) params.set('action', filters.action);
  if (filters.entityId) params.set('entityId', filters.entityId);
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.offset) params.set('offset', String(filters.offset));

  const qs = params.toString();
  const remote = await safeFetchJson<{ success: boolean; total: number; entries: AuditEntry[] }>(
    `${BASE_URL}/audit${qs ? `?${qs}` : ''}`
  );
  if (remote && remote.entries && remote.entries.length > 0) return { total: remote.total || remote.entries.length, entries: remote.entries };
  return { total: CATALOG_AUDIT.length, entries: CATALOG_AUDIT };
}

export type HistoryRecord = AuditEntry;
export type HistoryFilters = AuditFilters;
export const fetchHistory = fetchAudit;

export async function fetchGoogleSheetConfig(): Promise<{ success: boolean; config?: any; error?: string }> {
  const remote = await safeFetchJson<{ success: boolean; config: any }>(`${BASE_URL}/google-sheet/config`);
  if (remote && remote.success) return remote;
  return { success: false, error: 'Failed to fetch Google Sheet configuration' };
}

export async function saveGoogleSheetConfig(data: { sheetUrl?: string; fieldMapping?: any; visibleColumns?: any }): Promise<{ success: boolean; config?: any; error?: string }> {
  const remote = await safeFetchJson<{ success: boolean; config: any }>(
    `${BASE_URL}/google-sheet/config`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
  if (remote && remote.success) return remote;
  return { success: false, error: 'Failed to save Google Sheet configuration' };
}

export async function recordGoogleSheetConverted(payload: { key: string; studentId: string; studentName: string; counsellor: string }): Promise<{ success: boolean; error?: string }> {
  const remote = await safeFetchJson<{ success: boolean }>(
    `${BASE_URL}/google-sheet/converted`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );
  if (remote && remote.success) return remote;
  return { success: false, error: 'Failed to record converted lead' };
}

export async function fetchGoogleSheetCsv(sheetUrl?: string): Promise<{ success: boolean; csvText?: string; config?: any; error?: string }> {
  const remote = await safeFetchJson<{ success: boolean; csvText: string; config?: any; error?: string }>(
    `${BASE_URL}/google-sheet/fetch`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sheetUrl: sheetUrl || undefined }),
    }
  );
  if (remote && remote.success) return remote;
  return { success: false, error: remote?.error || 'Failed to fetch Google Sheet data' };
}

export interface StudentPaymentPlan {
  id?: string;
  student_id?: string;
  plan_name?: string;
  agreed_budget?: string;
  total_package_fee?: number;
  total_paid?: number;
  balance_due?: number;
  installment_count?: number;
  gst_included?: boolean | number;
  gst_percentage?: number;
  gst_amount?: number;
  currency?: string;
  payment_status?: string;
  notes?: string;
}

export interface PaymentInstallment {
  id?: string;
  student_id?: string;
  payment_id?: string;
  installment_number: number;
  title: string;
  amount: number;
  gst_rate?: number;
  gst_type?: string;
  gst_amount?: number;
  total_amount?: number;
  payment_date?: string | null;
  due_date?: string | null;
  payment_mode?: string;
  transaction_ref?: string;
  receipt_no?: string;
  status?: string;
  collected_by?: string;
  notes?: string;
}

export async function fetchStudentPayments(studentIdOrLeadId: string): Promise<{ success: boolean; data?: { payments: StudentPaymentPlan; installments: PaymentInstallment[] }; error?: string }> {
  const remote = await safeFetchJson<{ success: boolean; data: { payments: StudentPaymentPlan; installments: PaymentInstallment[] } }>(
    `${BASE_URL}/student-profiles/${studentIdOrLeadId}/payments`
  );
  if (remote && remote.success) return remote;
  return { success: false, error: 'Failed to fetch student payments' };
}

export async function saveStudentPaymentPlan(studentIdOrLeadId: string, planData: Partial<StudentPaymentPlan>): Promise<{ success: boolean; data?: any; error?: string }> {
  const remote = await safeFetchJson<{ success: boolean; data: any }>(
    `${BASE_URL}/student-profiles/${studentIdOrLeadId}/payments/plan`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(withAudit({ data: planData })),
    }
  );
  if (remote && remote.success) return remote;
  return { success: false, error: 'Failed to update payment plan' };
}

export async function savePaymentInstallment(studentIdOrLeadId: string, installmentData: Partial<PaymentInstallment>): Promise<{ success: boolean; data?: any; error?: string }> {
  const remote = await safeFetchJson<{ success: boolean; data: any }>(
    `${BASE_URL}/student-profiles/${studentIdOrLeadId}/payments/installments`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(withAudit({ installment: installmentData })),
    }
  );
  if (remote && remote.success) return remote;
  return { success: false, error: 'Failed to save payment installment' };
}

export async function deletePaymentInstallment(studentIdOrLeadId: string, installmentId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  const remote = await safeFetchJson<{ success: boolean; data: any }>(
    `${BASE_URL}/student-profiles/${studentIdOrLeadId}/payments/installments/${installmentId}`,
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(withAudit({})),
    }
  );
  if (remote && remote.success) return remote;
  return { success: false, error: 'Failed to delete payment installment' };
}


