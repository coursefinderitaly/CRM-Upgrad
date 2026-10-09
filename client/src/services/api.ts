import { AnalyticsData, FollowUp, Lead, NotificationItem, Task, DocumentItem } from '../types/crm';

const BASE_URL = '/api';

export async function fetchAnalytics(): Promise<AnalyticsData> {
  const res = await fetch(`${BASE_URL}/analytics`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

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
  const res = await fetch(`${BASE_URL}/leads?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch leads');
  return res.json();
}

export async function fetchLeadById(id: string): Promise<Lead> {
  const res = await fetch(`${BASE_URL}/leads/${id}`);
  if (!res.ok) throw new Error('Failed to fetch lead');
  return res.json();
}

export async function createLead(leadData: Partial<Lead>): Promise<Lead> {
  const res = await fetch(`${BASE_URL}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leadData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create lead');
  }
  return res.json();
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
  const res = await fetch(`${BASE_URL}/leads/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update lead');
  return res.json();
}

export async function enrollLead(id: string): Promise<{ lead: Lead; student: any }> {
  const res = await fetch(`${BASE_URL}/leads/${id}/enroll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to enroll lead');
  return res.json();
}

export async function transferToDocs(id: string): Promise<Lead> {
  const res = await fetch(`${BASE_URL}/leads/${id}/transfer-docs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to transfer to docs');
  return res.json();
}

export async function deleteLead(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/leads/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete lead');
}

export async function fetchTasks(): Promise<Task[]> {
  const res = await fetch(`${BASE_URL}/tasks`);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function toggleTask(id: string): Promise<Task> {
  const res = await fetch(`${BASE_URL}/tasks/${id}/toggle`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Failed to toggle task');
  return res.json();
}

export async function createTask(task: Partial<Task>): Promise<Task> {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
}

export async function fetchNotifications(): Promise<{ list: NotificationItem[]; unreadCount: number }> {
  const res = await fetch(`${BASE_URL}/notifications`);
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

export async function markNotificationRead(id: string): Promise<void> {
  await fetch(`${BASE_URL}/notifications/${id}/read`, { method: 'PATCH' });
}

export async function markAllNotificationsRead(): Promise<void> {
  await fetch(`${BASE_URL}/notifications/read-all`, { method: 'POST' });
}

export async function searchGlobal(q: string): Promise<Lead[]> {
  const res = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error('Failed to search');
  return res.json();
}

export async function scheduleFollowUp(data: {
  leadId: string;
  date: string;
  time: string;
  task: string;
  reminder?: string;
  notes?: string;
}): Promise<FollowUp> {
  const res = await fetch(`${BASE_URL}/followups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to schedule follow up');
  return res.json();
}

export async function sendEmail(data: { leadId?: string; to: string; subject: string; message: string }): Promise<void> {
  const res = await fetch(`${BASE_URL}/communications/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to send email');
}

export async function sendWhatsApp(data: { leadId?: string; phone: string; message: string }): Promise<void> {
  const res = await fetch(`${BASE_URL}/communications/whatsapp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to send WhatsApp message');
}

export async function fetchStudents(): Promise<any[]> {
  const res = await fetch(`${BASE_URL}/students`);
  if (!res.ok) throw new Error('Failed to fetch students');
  return res.json();
}

export async function fetchDocuments(): Promise<DocumentItem[]> {
  const res = await fetch(`${BASE_URL}/documents`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function updateDocumentStatus(id: string, status: string, notes?: string): Promise<DocumentItem> {
  const res = await fetch(`${BASE_URL}/documents/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, notes }),
  });
  if (!res.ok) throw new Error('Failed to update document');
  return res.json();
}

export async function fetchApplications(): Promise<any[]> {
  const res = await fetch(`${BASE_URL}/applications`);
  if (!res.ok) throw new Error('Failed to fetch applications');
  return res.json();
}

export async function fetchUniversities(): Promise<any[]> {
  const res = await fetch(`${BASE_URL}/universities`);
  if (!res.ok) throw new Error('Failed to fetch universities');
  return res.json();
}
