import { Lead, Task, NotificationItem, AnalyticsData } from '../types/crm';
import { CATALOG_LEADS, CATALOG_TASKS } from './studentProfilesCatalog';

export const INITIAL_LEADS: Lead[] = CATALOG_LEADS;
export const INITIAL_TASKS: Task[] = CATALOG_TASKS;

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'Lead',
    title: 'Student Profile Linked',
    message: 'Arjun Verma profile linked from disk folder Arjun_Verma_9811155667',
    isRead: false,
    createdAt: '10 mins ago',
  },
  {
    id: 'notif-2',
    type: 'Follow-up',
    title: 'Counselling Scheduled',
    message: 'Introductory counselling call with Ananya Sharma today at 11:00 AM',
    isRead: false,
    createdAt: '1 hour ago',
  },
  {
    id: 'notif-3',
    type: 'Application',
    title: 'Enrolment Dossier Ready',
    message: 'Kavya Iyer enrolment completed for University of Manchester',
    isRead: true,
    createdAt: '2 hours ago',
  },
];

export const INITIAL_ANALYTICS: AnalyticsData = {
  kpis: {
    totalLeads: { value: 4, label: 'Total Leads', growth: '+12%' },
    contacted: { value: 1, label: 'Contacted', growth: '+8%' },
    counsellingDone: { value: 1, label: 'Counselling Done', growth: '+15%' },
    enrolled: { value: 1, label: 'Enrolled', growth: '+25%' },
    transferred: { value: 2, label: 'Transferred to Documentation', growth: '+10%' },
    applicationInProcess: { value: 1, label: 'Application in Process', growth: '+5%' },
    offerReceived: { value: 0, label: 'Offer Received', growth: '—' },
  },
  counsellingSummary: [
    { name: 'Total Leads', count: 4, fill: '#087cf5' },
    { name: 'Contacted', count: 1, fill: '#10b981' },
    { name: 'Counselling', count: 1, fill: '#f59e0b' },
    { name: 'Interested', count: 1, fill: '#3b82f6' },
    { name: 'Enrolled', count: 1, fill: '#ec4899' },
  ],
  leadSources: [
    { name: 'Student Profile Folder', count: 4, percentage: 100, color: '#087cf5' },
  ],
  countryInterest: [
    { country: 'Italy', count: 1, flag: '🇮🇹', color: '#10b981' },
    { country: 'Canada', count: 1, flag: '🇨🇦', color: '#ef4444' },
    { country: 'Germany', count: 1, flag: '🇩🇪', color: '#f59e0b' },
    { country: 'France', count: 1, flag: '🇫🇷', color: '#3b82f6' },
  ],
};
