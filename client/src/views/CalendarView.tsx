import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  CalendarDays,
  Clock,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Phone,
  Mail,
  MessageSquare,
  Video,
  MapPin,
  User,
  GraduationCap,
  FileText,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  ArrowRight,
  Sparkles,
  Plane,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { Lead } from '../types/crm';
import { INITIAL_LEADS } from '../services/mockData';

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

export const STORAGE_KEY = 'crm-calendar-events-v2';

// Generate realistic default calendar events for current and adjacent months
export const getInitialEvents = (): CalendarEvent[] => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  const formatDate = (day: number) => {
    return `${year}-${month}-${String(day).padStart(2, '0')}`;
  };

  return [
    {
      id: 'evt-1',
      title: 'Call Rahul Sharma - Italy Public Univ Docs',
      type: 'followup',
      date: formatDate(10),
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
      date: formatDate(10),
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
      date: formatDate(10),
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
      date: formatDate(10),
      time: '04:00 PM',
      duration: 'Deadline',
      studentName: 'Sneha Patel',
      leadId: 'L2025100504',
      phone: '+91 99876 54321',
      countryInterest: 'UK',
      counsellor: 'Neha Sharma',
      mode: 'Phone Call',
      priority: 'High',
      status: 'Scheduled',
      notes: 'University of Manchester BSc Nursing conditional acceptance cutoff.',
    },
    {
      id: 'evt-5',
      title: 'Proposal & Shortlist - Rohit Verma',
      type: 'followup',
      date: formatDate(10),
      time: '05:00 PM',
      duration: '30 mins',
      studentName: 'Rohit Verma',
      leadId: 'L2025100205',
      phone: '+91 91234 56789',
      countryInterest: 'Australia',
      counsellor: 'Neha Sharma',
      mode: 'Google Meet / Zoom',
      priority: 'Low',
      status: 'Scheduled',
      notes: 'Share university shortlist for Melbourne and Sydney July intake.',
    },
    {
      id: 'evt-6',
      title: 'Politecnico di Torino Intake Review - Kunal Joshi',
      type: 'counselling',
      date: formatDate(12),
      time: '10:30 AM',
      duration: '45 mins',
      studentName: 'Kunal Joshi',
      leadId: 'L20251007',
      phone: '+91 98111 22334',
      countryInterest: 'Italy',
      counsellor: 'Amit Verma',
      mode: 'In-Person',
      priority: 'Medium',
      status: 'Scheduled',
      notes: 'MSc Mechanical Engineering syllabus mapping with Pune University.',
    },
    {
      id: 'evt-7',
      title: 'Winter Intake Portal Cutoff - Swati Pandey',
      type: 'deadline',
      date: formatDate(12),
      time: '03:00 PM',
      duration: 'Deadline',
      studentName: 'Swati Pandey',
      leadId: 'L20251022',
      phone: '+91 98444 55667',
      countryInterest: 'Germany',
      counsellor: 'Neha Sharma',
      mode: 'In-Person',
      priority: 'High',
      status: 'Scheduled',
      notes: 'Upload certified translations of degree marksheet before portal lock.',
    },
    {
      id: 'evt-8',
      title: 'Italy Embassy Pre-Enrolment Cutoff - Siddharth Jain',
      type: 'visa',
      date: formatDate(14),
      time: '11:00 AM',
      duration: '60 mins',
      studentName: 'Siddharth Jain',
      leadId: 'L20251013',
      phone: '+91 98999 11223',
      countryInterest: 'Italy',
      counsellor: 'Neha Sharma',
      mode: 'Phone Call',
      priority: 'High',
      status: 'Scheduled',
      notes: 'Universitaly portal pre-enrollment validation and DOV appointment.',
    },
    {
      id: 'evt-9',
      title: 'Canada PGWP & Fee Structure - Sanjay Reddy',
      type: 'counselling',
      date: formatDate(14),
      time: '02:30 PM',
      duration: '40 mins',
      studentName: 'Sanjay Reddy',
      leadId: 'L20251033',
      phone: '+91 98333 44556',
      countryInterest: 'Canada',
      counsellor: 'Amit Verma',
      mode: 'Google Meet / Zoom',
      priority: 'Medium',
      status: 'Scheduled',
      notes: 'MSc Cloud Computing work permit rules and post-graduation visa path.',
    },
    {
      id: 'evt-10',
      title: 'APS India Certificate Document Review - Nikhil Shinde',
      type: 'document',
      date: formatDate(15),
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
    {
      id: 'evt-11',
      title: 'UK Master in AI Program Discussion - Ashish Goel',
      type: 'counselling',
      date: formatDate(15),
      time: '01:00 PM',
      duration: '45 mins',
      studentName: 'Ashish Goel',
      leadId: 'L20251044',
      phone: '+91 96111 88990',
      countryInterest: 'UK',
      counsellor: 'Neha Sharma',
      mode: 'Phone Call',
      priority: 'Medium',
      status: 'Scheduled',
      notes: 'Review Edinburgh, Bristol, and Southampton MSc admission requirements.',
    },
    {
      id: 'evt-12',
      title: 'Architecture Portfolio Submission - Ritu Mehra',
      type: 'document',
      date: formatDate(18),
      time: '11:30 AM',
      duration: 'Deadline',
      studentName: 'Ritu Mehra',
      leadId: 'L20251012',
      phone: '+91 98888 77665',
      countryInterest: 'Italy',
      counsellor: 'Amit Verma',
      mode: 'WhatsApp',
      priority: 'Medium',
      status: 'Scheduled',
      notes: 'Politecnico di Milano architecture digital portfolio link dispatch.',
    },
    {
      id: 'evt-13',
      title: 'Campus France Interview Prep - Abhishek Pillai',
      type: 'counselling',
      date: formatDate(18),
      time: '04:00 PM',
      duration: '45 mins',
      studentName: 'Abhishek Pillai',
      leadId: 'L20251048',
      phone: '+91 98222 33114',
      countryInterest: 'France',
      counsellor: 'Neha Sharma',
      mode: 'Google Meet / Zoom',
      priority: 'Medium',
      status: 'Scheduled',
      notes: 'Mock interview for EEF Campus France oral test and visa dossier.',
    },
    {
      id: 'evt-14',
      title: 'DSU Regional Scholarship Review - Megha Sen',
      type: 'followup',
      date: formatDate(20),
      time: '02:00 PM',
      duration: '30 mins',
      studentName: 'Megha Sen',
      leadId: 'L20251018',
      phone: '+91 97777 66554',
      countryInterest: 'Italy',
      counsellor: 'Neha Sharma',
      mode: 'Phone Call',
      priority: 'High',
      status: 'Scheduled',
      notes: 'Verify family income certificate apostille and ISEE Parificato documentation.',
    },
    {
      id: 'evt-15',
      title: 'Canada Visa Biometrics Appointment - Girish Patil',
      type: 'visa',
      date: formatDate(22),
      time: '12:00 PM',
      duration: 'Appointment',
      studentName: 'Girish Patil',
      leadId: 'L20251035',
      phone: '+91 96555 44332',
      countryInterest: 'Canada',
      counsellor: 'Amit Verma',
      mode: 'In-Person',
      priority: 'High',
      status: 'Scheduled',
      notes: 'VFS Global Ahmedabad appointment confirmation and document pouch.',
    },
    {
      id: 'evt-16',
      title: 'New Zealand Application Cutoff - Prateek Somani',
      type: 'deadline',
      date: formatDate(25),
      time: '10:00 AM',
      duration: 'Deadline',
      studentName: 'Prateek Somani',
      leadId: 'L20251049',
      phone: '+91 95444 33221',
      countryInterest: 'New Zealand',
      counsellor: 'Neha Sharma',
      mode: 'Phone Call',
      priority: 'Medium',
      status: 'Scheduled',
      notes: 'University of Auckland Master of Construction Management round 1 deadline.',
    },
  ];
};

interface CalendarViewProps {
  leads?: Lead[];
  onNavigate?: (route: string) => void;
  onScheduleFollowUp?: (lead: Lead) => void;
  onOpenWhatsApp?: (lead: Lead) => void;
  onOpenPhone?: (lead: Lead) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  leads = INITIAL_LEADS,
  onNavigate,
  onOpenWhatsApp,
  onOpenPhone,
}) => {
  // Current view date
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');

  // Filter state
  const [typeFilter, setTypeFilter] = useState<'all' | 'counselling' | 'followup' | 'visa' | 'deadline' | 'document'>('all');
  const [countryFilter, setCountryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected date in month grid
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });

  // Events state with localStorage persistence
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem('crm-calendar-events-v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading calendar events', e);
    }
    return getInitialEvents();
  });

  const saveEvents = (updated: CalendarEvent[]) => {
    setEvents(updated);
    try {
      localStorage.setItem('crm-calendar-events-v2', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving calendar events', e);
    }
  };

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Add Event Form State
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<CalendarEvent['type']>('counselling');
  const [formDate, setFormDate] = useState(selectedDateStr);
  const [formTime, setFormTime] = useState('11:00 AM');
  const [formStudentName, setFormStudentName] = useState('');
  const [formStudentPhone, setFormStudentPhone] = useState('');
  const [formCountry, setFormCountry] = useState('Italy');
  const [formCounsellor, setFormCounsellor] = useState('Neha Sharma');
  const [formMode, setFormMode] = useState<CalendarEvent['mode']>('Phone Call');
  const [formPriority, setFormPriority] = useState<CalendarEvent['priority']>('High');
  const [formNotes, setFormNotes] = useState('');

  // Open add modal prepopulated for a specific day
  const handleOpenAddModal = (dateStr?: string) => {
    const targetDate = dateStr || selectedDateStr;
    setFormDate(targetDate);
    setFormTitle('');
    setFormType('counselling');
    setFormTime('11:00 AM');
    setFormStudentName(leads[0]?.studentName || 'Rahul Sharma');
    setFormStudentPhone(leads[0]?.phone || '+91 98765 43210');
    setFormCountry(leads[0]?.countryInterest || 'Italy');
    setFormCounsellor('Neha Sharma');
    setFormMode('Phone Call');
    setFormPriority('High');
    setFormNotes('');
    setIsAddModalOpen(true);
  };

  const handleSaveNewEvent = () => {
    if (!formTitle.trim()) {
      showToast('Please enter an event or meeting title.');
      return;
    }

    const newEvt: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: formTitle.trim(),
      type: formType,
      date: formDate,
      time: formTime,
      studentName: formStudentName,
      phone: formStudentPhone,
      countryInterest: formCountry,
      counsellor: formCounsellor,
      mode: formMode,
      priority: formPriority,
      status: 'Scheduled',
      notes: formNotes.trim() || undefined,
    };

    const updated = [newEvt, ...events];
    saveEvents(updated);
    setIsAddModalOpen(false);
    showToast(`Event "${newEvt.title}" scheduled successfully for ${newEvt.date}!`);
  };

  const handleDeleteEvent = (eventId: string) => {
    const match = events.find((e) => e.id === eventId);
    const updated = events.filter((e) => e.id !== eventId);
    saveEvents(updated);
    setSelectedEvent(null);
    showToast(`Event "${match?.title || 'Meeting'}" has been removed.`);
  };

  const handleToggleComplete = (eventId: string) => {
    const updated = events.map((e) =>
      e.id === eventId
        ? { ...e, status: (e.status === 'Completed' ? 'Scheduled' : 'Completed') as any }
        : e
    );
    saveEvents(updated);
    if (selectedEvent && selectedEvent.id === eventId) {
      setSelectedEvent((prev) => (prev ? { ...prev, status: prev.status === 'Completed' ? 'Scheduled' : 'Completed' } : null));
    }
    showToast('Event status updated.');
  };

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
  };

  // Month Grid Calculation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  // Adjust so Monday is column 0 (0: Mon, 1: Tue, ..., 6: Sun)
  const startOffset = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Filter events
  const filteredEvents = events.filter((evt) => {
    const matchesType = typeFilter === 'all' || evt.type === typeFilter;
    const matchesCountry = countryFilter === 'All' || evt.countryInterest === countryFilter;
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.phone && evt.phone.includes(searchQuery));
    return matchesType && matchesCountry && matchesSearch;
  });

  // Color & Badge config for event types
  const typeConfig: Record<CalendarEvent['type'], { label: string; badge: string; border: string; chip: string; dot: string }> = {
    counselling: {
      label: 'Counselling',
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      border: 'border-l-amber-500',
      chip: 'bg-amber-100/90 text-amber-900 border border-amber-200 hover:bg-amber-200',
      dot: 'bg-amber-500',
    },
    followup: {
      label: 'Follow-up Call',
      badge: 'bg-blue-50 text-blue-800 border-blue-200',
      border: 'border-l-blue-500',
      chip: 'bg-blue-100/90 text-blue-900 border border-blue-200 hover:bg-blue-200',
      dot: 'bg-blue-500',
    },
    visa: {
      label: 'Visa & Embassy',
      badge: 'bg-purple-50 text-purple-800 border-purple-200',
      border: 'border-l-purple-500',
      chip: 'bg-purple-100/90 text-purple-900 border border-purple-200 hover:bg-purple-200',
      dot: 'bg-purple-500',
    },
    deadline: {
      label: 'Admission Deadline',
      badge: 'bg-rose-50 text-rose-800 border-rose-200',
      border: 'border-l-rose-500',
      chip: 'bg-rose-100/90 text-rose-900 border border-rose-200 hover:bg-rose-200',
      dot: 'bg-rose-500',
    },
    document: {
      label: 'Document Cutoff',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      border: 'border-l-emerald-500',
      chip: 'bg-emerald-100/90 text-emerald-900 border border-emerald-200 hover:bg-emerald-200',
      dot: 'bg-emerald-500',
    },
  };

  // Metrics
  const counts = {
    total: events.length,
    counselling: events.filter((e) => e.type === 'counselling').length,
    followup: events.filter((e) => e.type === 'followup').length,
    deadlines: events.filter((e) => e.type === 'deadline' || e.type === 'document').length,
    visa: events.filter((e) => e.type === 'visa').length,
  };

  // Selected Day Events
  const selectedDayEvents = events.filter((e) => e.date === selectedDateStr);

  return (
    <div className="p-3.5 pb-20 space-y-3.5 max-w-[1536px] mx-auto font-sans text-[#101d37] min-h-screen">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 right-5 z-50 bg-[#07182c] text-white text-xs px-4 py-2.5 rounded-lg shadow-xl border border-blue-500/30 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-3 text-slate-400 hover:text-white font-bold">
            ×
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#087cf5] to-[#025ec2] text-white flex items-center justify-center shadow-sm">
            <CalendarDays className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[18px] font-bold text-[#101d37] leading-tight">
                Calendar & Admission Schedule
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#087cf5] border border-blue-200 text-[10.5px] font-bold">
                Counsellor Desk
              </span>
            </div>
            <p className="text-[11.5px] text-[#64748b] leading-tight mt-0.5">
              Plan counselling sessions, track visa appointments, follow-up calls, and university intake deadlines
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-white border border-[#e2e8f0] rounded-[7px] p-0.5 shadow-2xs">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-[5px] text-[11px] font-semibold transition-colors ${
                viewMode === 'month' ? 'bg-[#087cf5] text-white shadow-xs' : 'text-[#64748b] hover:text-[#101d37]'
              }`}
            >
              Month Grid
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1 rounded-[5px] text-[11px] font-semibold transition-colors ${
                viewMode === 'agenda' ? 'bg-[#087cf5] text-white shadow-xs' : 'text-[#64748b] hover:text-[#101d37]'
              }`}
            >
              Agenda Timeline
            </button>
          </div>

          <button
            onClick={() => handleOpenAddModal()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#087cf5] hover:bg-[#006ee6] text-white text-[12px] font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ New Event / Meeting</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <div
          onClick={() => setTypeFilter('all')}
          className={`p-3 rounded-[9px] border cursor-pointer transition-all ${
            typeFilter === 'all' ? 'bg-blue-50/70 border-blue-300 shadow-xs' : 'bg-white border-[#e5edf5] hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] text-[#64748b]">
            <span>Total Events</span>
            <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-[20px] font-bold text-[#101d37] mt-1">{counts.total}</div>
          <span className="text-[10px] text-blue-600 font-semibold">Scheduled Active</span>
        </div>

        <div
          onClick={() => setTypeFilter('counselling')}
          className={`p-3 rounded-[9px] border cursor-pointer transition-all ${
            typeFilter === 'counselling' ? 'bg-amber-50/70 border-amber-300 shadow-xs' : 'bg-white border-[#e5edf5] hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] text-[#64748b]">
            <span>Counselling</span>
            <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-[20px] font-bold text-amber-700 mt-1">{counts.counselling}</div>
          <span className="text-[10px] text-amber-600 font-semibold">1-on-1 Sessions</span>
        </div>

        <div
          onClick={() => setTypeFilter('followup')}
          className={`p-3 rounded-[9px] border cursor-pointer transition-all ${
            typeFilter === 'followup' ? 'bg-blue-50/70 border-blue-300 shadow-xs' : 'bg-white border-[#e5edf5] hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] text-[#64748b]">
            <span>Follow-up Calls</span>
            <Phone className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-[20px] font-bold text-blue-700 mt-1">{counts.followup}</div>
          <span className="text-[10px] text-blue-600 font-semibold">Student Inquiries</span>
        </div>

        <div
          onClick={() => setTypeFilter('visa')}
          className={`p-3 rounded-[9px] border cursor-pointer transition-all ${
            typeFilter === 'visa' ? 'bg-purple-50/70 border-purple-300 shadow-xs' : 'bg-white border-[#e5edf5] hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] text-[#64748b]">
            <span>Visa & Embassy</span>
            <Plane className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-[20px] font-bold text-purple-700 mt-1">{counts.visa}</div>
          <span className="text-[10px] text-purple-600 font-semibold">VFS Appointments</span>
        </div>

        <div
          onClick={() => setTypeFilter('deadline')}
          className={`p-3 rounded-[9px] border cursor-pointer transition-all col-span-2 sm:col-span-1 ${
            typeFilter === 'deadline' ? 'bg-rose-50/70 border-rose-300 shadow-xs' : 'bg-white border-[#e5edf5] hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] text-[#64748b]">
            <span>Cutoffs & Deadlines</span>
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-[20px] font-bold text-rose-700 mt-1">{counts.deadlines}</div>
          <span className="text-[10px] text-rose-600 font-semibold">Portal Deadlines</span>
        </div>
      </div>

      {/* Toolbar: Month Navigation & Filter Controls */}
      <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-[6px] p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-600 hover:text-[#101d37] hover:bg-white rounded transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleJumpToToday}
              className="px-2.5 py-1 text-[11.5px] font-bold text-slate-700 hover:bg-white rounded transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-600 hover:text-[#101d37] hover:bg-white rounded transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-[16px] font-bold text-[#101d37] ml-2">
            {monthName} {year}
          </h2>
        </div>

        {/* Search & Destination Country Filter */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-2.5 top-2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meetings, student name..."
              className="bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] focus:bg-white rounded-[6px] pl-7 pr-3 py-1 text-[11.5px] outline-none transition-all w-56"
            />
          </div>

          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] rounded-[6px] px-2.5 py-1 text-[11.5px] text-[#101d37] outline-none"
          >
            <option value="All">All Destinations</option>
            <option value="Italy">🇮🇹 Italy</option>
            <option value="Germany">🇩🇪 Germany</option>
            <option value="Canada">🇨🇦 Canada</option>
            <option value="UK">🇬🇧 UK</option>
            <option value="Australia">🇦🇺 Australia</option>
          </select>
        </div>
      </div>

      {/* Main Calendar View Body */}
      {viewMode === 'month' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
          {/* Left: Full Expanded Month Grid (9 cols) */}
          <div className="lg:col-span-9 bg-white rounded-[9px] border border-[#e5edf5] shadow-xs overflow-hidden">
            {/* Weekday Header */}
            <div className="grid grid-cols-7 bg-[#f8fafc] border-b border-[#e5edf5] text-center text-[11.5px] font-bold text-[#52627a] py-2">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span className="text-blue-600">Sat</span>
              <span className="text-rose-600">Sun</span>
            </div>

            {/* Month Day Cells Grid */}
            <div className="grid grid-cols-7 divide-x divide-y divide-[#f1f5f9] border-b border-[#e5edf5]">
              {/* Previous month filler cells */}
              {Array.from({ length: startOffset }).map((_, i) => {
                const prevDay = daysInPrevMonth - startOffset + i + 1;
                return (
                  <div key={`prev-${i}`} className="min-h-[110px] p-1.5 bg-slate-50/50 text-slate-300 select-none">
                    <span className="text-[11px] font-medium">{prevDay}</span>
                  </div>
                );
              })}

              {/* Current month day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const isSelected = dateStr === selectedDateStr;
                const isToday =
                  new Date().getDate() === dayNum &&
                  new Date().getMonth() === month &&
                  new Date().getFullYear() === year;

                // Day events
                const dayEvents = filteredEvents.filter((e) => e.date === dateStr);

                return (
                  <div
                    key={`day-${dayNum}`}
                    onClick={() => setSelectedDateStr(dateStr)}
                    className={`min-h-[115px] p-1.5 transition-all cursor-pointer relative group flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-50/40 ring-2 ring-inset ring-[#087cf5]'
                        : 'hover:bg-slate-50/70 bg-white'
                    }`}
                  >
                    <div>
                      {/* Day number header */}
                      <div className="flex items-center justify-between pb-1">
                        <span
                          className={`text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                            isToday
                              ? 'bg-[#087cf5] text-white shadow-xs'
                              : isSelected
                              ? 'text-[#087cf5] font-black'
                              : 'text-slate-700'
                          }`}
                        >
                          {dayNum}
                        </span>

                        {/* Quick Add button on hover */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAddModal(dateStr);
                          }}
                          className="opacity-0 group-hover:opacity-100 w-4 h-4 rounded bg-slate-200 hover:bg-[#087cf5] hover:text-white text-slate-600 flex items-center justify-center transition-opacity"
                          title={`Schedule on ${dateStr}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Event Chips List */}
                      <div className="space-y-1 mt-0.5">
                        {dayEvents.slice(0, 3).map((evt) => {
                          const cfg = typeConfig[evt.type] || typeConfig.counselling;
                          return (
                            <div
                              key={evt.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(evt);
                              }}
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium truncate cursor-pointer transition-colors ${cfg.chip}`}
                              title={`${evt.time} - ${evt.title}`}
                            >
                              <span className="font-bold mr-1">{evt.time.split(' ')[0]}</span>
                              <span>{evt.studentName.split(' ')[0]}: {evt.title}</span>
                            </div>
                          );
                        })}

                        {dayEvents.length > 3 && (
                          <div className="text-[9.5px] text-[#087cf5] font-bold px-1">
                            +{dayEvents.length - 3} more events
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom indicator dots if any events */}
                    {dayEvents.length > 0 && (
                      <div className="flex items-center gap-1 pt-1">
                        {dayEvents.map((evt, idx) => (
                          <span
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full ${typeConfig[evt.type]?.dot || 'bg-blue-500'}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Next month filler cells to complete grid */}
              {Array.from({ length: (7 - ((startOffset + daysInMonth) % 7)) % 7 }).map((_, i) => (
                <div key={`next-${i}`} className="min-h-[110px] p-1.5 bg-slate-50/50 text-slate-300 select-none">
                  <span className="text-[11px] font-medium">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Selected Day's Agenda & Actions (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            {/* Selected Date Card */}
            <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8496b0] tracking-wider block">
                    Day Agenda
                  </span>
                  <h3 className="font-bold text-[14px] text-[#101d37]">
                    {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-GB', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </h3>
                </div>
                <button
                  onClick={() => handleOpenAddModal(selectedDateStr)}
                  className="px-2 py-1 rounded bg-blue-50 hover:bg-[#087cf5] text-[#087cf5] hover:text-white font-bold text-xs transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>

              {/* Selected Day Agenda Items */}
              <div className="space-y-2 max-h-[460px] overflow-y-auto">
                {selectedDayEvents.length > 0 ? (
                  selectedDayEvents.map((evt) => {
                    const cfg = typeConfig[evt.type] || typeConfig.counselling;
                    return (
                      <div
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className={`p-2.5 rounded-[7px] border bg-[#f8fafc] hover:bg-blue-50/50 transition-colors cursor-pointer border-l-4 ${cfg.border} space-y-1`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold border ${cfg.badge}`}>
                            {cfg.label}
                          </span>
                          <span className="text-[10.5px] font-bold text-slate-700">{evt.time}</span>
                        </div>
                        <h4 className="font-bold text-[12px] text-[#101d37] leading-snug">{evt.title}</h4>
                        <div className="text-[11px] text-[#64748b] flex items-center justify-between pt-0.5">
                          <span>{evt.studentName} ({evt.countryInterest || 'Abroad'})</span>
                          <span className="text-[10px] text-slate-400">{evt.mode}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-slate-400 space-y-2">
                    <CalendarIcon className="w-7 h-7 mx-auto stroke-[1.5] text-slate-300" />
                    <p className="text-xs">No meetings or deadlines scheduled on this day.</p>
                    <button
                      onClick={() => handleOpenAddModal(selectedDateStr)}
                      className="text-xs text-[#087cf5] font-bold hover:underline"
                    >
                      + Schedule an appointment
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-gradient-to-br from-[#101d37] to-[#1e293b] text-white rounded-[9px] p-3.5 shadow-sm space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">Calendar Actions</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Click any event to inspect, join meeting, modify schedule, or remove.
              </p>
              <div className="pt-1 space-y-1.5">
                <button
                  onClick={() => handleOpenAddModal()}
                  className="w-full py-1.5 rounded bg-[#087cf5] hover:bg-[#006ee6] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Event</span>
                </button>
                <button
                  onClick={() => {
                    saveEvents(getInitialEvents());
                    showToast('Calendar reset to default study abroad master schedule.');
                  }}
                  className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] transition-colors"
                >
                  Reset Sample Master Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Agenda / Timeline View */
        <div className="bg-white rounded-[9px] border border-[#e5edf5] p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-[15px] text-[#101d37]">
              Chronological Agenda Schedule ({filteredEvents.length} items)
            </h3>
            <span className="text-xs text-slate-500 font-medium">Sorted by Upcoming Date & Time</span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredEvents.map((evt) => {
              const cfg = typeConfig[evt.type] || typeConfig.counselling;
              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="py-3 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50/70 p-2 rounded transition-colors cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 text-[#101d37] flex flex-col items-center justify-center shrink-0 border border-slate-200">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        {new Date(evt.date + 'T00:00:00').toLocaleDateString('en-GB', { month: 'short' })}
                      </span>
                      <span className="text-[13px] font-black text-[#101d37] leading-none">
                        {evt.date.split('-')[2]}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-[13px] text-[#101d37] group-hover:text-[#087cf5] transition-colors">
                          {evt.title}
                        </h4>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-bold border ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                        {evt.status === 'Completed' && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9.5px] font-bold">
                            ✓ Done
                          </span>
                        )}
                      </div>

                      <div className="text-[11.5px] text-[#64748b] mt-0.5 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="font-semibold text-slate-700">{evt.studentName}</span>
                          {evt.countryInterest && ` (${evt.countryInterest})`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {evt.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {evt.mode}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {evt.phone && (
                      <button
                        onClick={() => onOpenWhatsApp?.({ studentName: evt.studentName, phone: evt.phone } as any)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                        title="WhatsApp student"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedEvent(evt)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                    >
                      Inspect Details
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(evt.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                      title="Remove event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADD NEW EVENT / MEETING MODAL                   */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-3.5 bg-gradient-to-r from-blue-50 to-white border-b border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#087cf5] text-white flex items-center justify-center shadow-xs">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#101d37]">Schedule Event / Meeting</h3>
                  <p className="text-[11px] text-[#64748b]">Add a follow-up, counselling session, or intake cutoff</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 overflow-y-auto text-xs">
              {/* Event Title */}
              <div>
                <label className="block text-[11px] font-bold text-[#101d37] mb-1">
                  Meeting Title / Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Visa Appointment with Rahul Sharma, IELTS Plan"
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] focus:border-[#087cf5] focus:bg-white rounded-[6px] px-3 py-1.5 text-[12px] text-[#101d37] outline-none transition-all"
                />
              </div>

              {/* Event Type & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#101d37] mb-1">Event Category</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-[6px] px-3 py-1.5 text-[12px] text-[#101d37] outline-none focus:border-[#087cf5]"
                  >
                    <option value="counselling">Counselling Session</option>
                    <option value="followup">Follow-up Call</option>
                    <option value="visa">Visa & Embassy Appointment</option>
                    <option value="deadline">Admission Deadline</option>
                    <option value="document">Document Submission Cutoff</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#101d37] mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-[6px] px-3 py-1.5 text-[12px] text-[#101d37] outline-none focus:border-[#087cf5]"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#101d37] mb-1">
                    Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-[6px] px-3 py-1.5 text-[12px] text-[#101d37] outline-none focus:border-[#087cf5]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#101d37] mb-1">Time</label>
                  <input
                    type="text"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    placeholder="e.g. 11:00 AM, 03:30 PM"
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-[6px] px-3 py-1.5 text-[12px] text-[#101d37] outline-none focus:border-[#087cf5]"
                  />
                </div>
              </div>

              {/* Linked Student / Lead */}
              <div>
                <label className="block text-[11px] font-bold text-[#101d37] mb-1">Associated Student / Lead</label>
                <select
                  value={formStudentName}
                  onChange={(e) => {
                    const match = leads.find((l) => l.studentName === e.target.value);
                    setFormStudentName(e.target.value);
                    if (match) {
                      setFormStudentPhone(match.phone);
                      setFormCountry(match.countryInterest);
                    }
                  }}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-[6px] px-3 py-1.5 text-[12px] text-[#101d37] outline-none focus:border-[#087cf5]"
                >
                  {leads.map((l) => (
                    <option key={l.id} value={l.studentName}>
                      {l.studentName} ({l.countryInterest} • {l.phone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Mode & Counsellor */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#101d37] mb-1">Engagement Mode</label>
                  <select
                    value={formMode}
                    onChange={(e) => setFormMode(e.target.value as any)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-[6px] px-3 py-1.5 text-[12px] text-[#101d37] outline-none focus:border-[#087cf5]"
                  >
                    <option value="Phone Call">Phone Call</option>
                    <option value="Google Meet / Zoom">Google Meet / Zoom</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="In-Person">In-Person Meeting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#101d37] mb-1">Assigned Counsellor</label>
                  <select
                    value={formCounsellor}
                    onChange={(e) => setFormCounsellor(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-[6px] px-3 py-1.5 text-[12px] text-[#101d37] outline-none focus:border-[#087cf5]"
                  >
                    <option value="Neha Sharma">Neha Sharma (Senior Counsellor)</option>
                    <option value="Amit Verma">Amit Verma (Branch Head)</option>
                    <option value="Priya Singh">Priya Singh (Doc Officer)</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold text-[#101d37] mb-1">Agenda / Meeting Notes</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Add specific discussion points or document checklist notes..."
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-[6px] p-2.5 text-[12px] text-[#101d37] outline-none focus:border-[#087cf5]"
                />
              </div>
            </div>

            <div className="px-5 py-3 bg-[#f8fafc] border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1.5 rounded-[6px] border border-slate-200 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNewEvent}
                className="px-4 py-1.5 rounded-[6px] bg-[#087cf5] hover:bg-[#006ee6] text-white font-bold text-xs shadow-xs"
              >
                Schedule & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EVENT DETAILS & EDIT / DELETE MODAL             */}
      {/* ======================================================== */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold border ${typeConfig[selectedEvent.type]?.badge}`}>
                  {typeConfig[selectedEvent.type]?.label}
                </span>
                <span className="text-xs text-slate-400 font-medium">{selectedEvent.priority} Priority</span>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <h3 className="text-[16px] font-bold text-[#101d37] leading-tight">{selectedEvent.title}</h3>
                <div className="flex items-center gap-2 text-[#64748b] text-[11.5px] mt-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {selectedEvent.date} at {selectedEvent.time}
                  </span>
                  {selectedEvent.duration && <span className="text-slate-400">({selectedEvent.duration})</span>}
                </div>
              </div>

              {/* Student details strip */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-[11.5px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Student:</span>
                  <span className="font-bold text-[#101d37]">{selectedEvent.studentName}</span>
                </div>
                {selectedEvent.phone && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <span className="font-medium text-[#101d37]">{selectedEvent.phone}</span>
                  </div>
                )}
                {selectedEvent.countryInterest && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Country:</span>
                    <span className="font-medium text-[#101d37]">{selectedEvent.countryInterest}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Engagement Mode:</span>
                  <span className="font-semibold text-blue-600">{selectedEvent.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Counsellor:</span>
                  <span className="font-semibold text-[#101d37]">{selectedEvent.counsellor}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedEvent.notes && (
                <div className="p-2.5 rounded bg-blue-50/50 border border-blue-100 text-[11px] text-slate-700">
                  <span className="font-bold block text-blue-900 mb-0.5">Meeting Agenda / Remarks:</span>
                  {selectedEvent.notes}
                </div>
              )}
            </div>

            {/* Modal Footer with Actions */}
            <div className="px-5 py-3 bg-[#f8fafc] border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleDeleteEvent(selectedEvent.id)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded text-rose-600 hover:bg-rose-50 border border-rose-200 font-semibold text-xs transition-colors"
                title="Delete this event"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleComplete(selectedEvent.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                    selectedEvent.status === 'Completed'
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{selectedEvent.status === 'Completed' ? 'Mark Incomplete' : 'Mark Completed'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
