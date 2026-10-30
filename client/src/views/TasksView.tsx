import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Phone,
  MessageSquare,
  Mail,
  Calendar,
  Clock,
  User,
  GraduationCap,
  FileText,
  Plane,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  X,
  Sparkles,
  Check,
  Video,
  MapPin,
  CalendarDays,
  Send,
} from 'lucide-react';
import { Task, Lead } from '../types/crm';
import { CalendarEvent, STORAGE_KEY, getInitialEvents } from './CalendarView';
import {
  fetchCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '../services/api';

interface TasksViewProps {
  tasks?: Task[];
  leads?: Lead[];
  onToggleTask?: (taskId: string) => void;
  onAddTask?: () => void;
  onOpenPhone?: (lead: Lead) => void;
  onOpenWhatsApp?: (lead: Lead) => void;
  onOpenEmail?: (lead: Lead) => void;
  onScheduleFollowUp?: (lead: Lead) => void;
  onNavigate?: (route: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks = [],
  leads = [],
  onToggleTask,
  onOpenPhone,
  onOpenWhatsApp,
  onOpenEmail,
  onScheduleFollowUp,
  onNavigate,
}) => {
  // Calendar tasks loaded from shared localStorage
  const [calendarTasks, setCalendarTasks] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      return getInitialEvents();
    } catch {
      return getInitialEvents();
    }
  });

  // Load calendar tasks from SQLite calendar.db on mount
  useEffect(() => {
    fetchCalendarEvents()
      .then((serverEvents) => {
        if (serverEvents && serverEvents.length > 0) {
          setCalendarTasks(serverEvents);
        }
      })
      .catch((err) => console.error('Failed to load events in TasksView:', err));
  }, []);

  // Filters & State
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'followup' | 'counselling' | 'visa' | 'deadline' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'name'>('date');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for new task
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<CalendarEvent['type']>('followup');
  const [formStudent, setFormStudent] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCountry, setFormCountry] = useState('Italy');
  const [formDate, setFormDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [formTime, setFormTime] = useState('11:00 AM');
  const [formMode, setFormMode] = useState<CalendarEvent['mode']>('Phone Call');
  const [formCounsellor, setFormCounsellor] = useState('Neha Sharma');
  const [formPriority, setFormPriority] = useState<CalendarEvent['priority']>('High');
  const [formNotes, setFormNotes] = useState('');

  // Persist calendar tasks to localStorage
  const saveEvents = (updated: CalendarEvent[]) => {
    setCalendarTasks(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  };

  // Date helpers
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // Category Configuration
  const typeConfig: Record<
    string,
    { label: string; badge: string; icon: React.ElementType; color: string; border: string; bg: string }
  > = {
    followup: {
      label: 'Follow-up Call',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: Phone,
      color: 'text-emerald-600',
      border: 'border-l-emerald-500',
      bg: 'bg-emerald-50/40',
    },
    counselling: {
      label: 'Counselling Session',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: GraduationCap,
      color: 'text-blue-600',
      border: 'border-l-blue-500',
      bg: 'bg-blue-50/40',
    },
    visa: {
      label: 'Visa & Embassy',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: Plane,
      color: 'text-purple-600',
      border: 'border-l-purple-500',
      bg: 'bg-purple-50/40',
    },
    deadline: {
      label: 'Application Deadline',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: AlertTriangle,
      color: 'text-rose-600',
      border: 'border-l-rose-500',
      bg: 'bg-rose-50/40',
    },
    document: {
      label: 'Document Collection',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: FileText,
      color: 'text-amber-600',
      border: 'border-l-amber-500',
      bg: 'bg-amber-50/40',
    },
  };

  // Toggle Task Completed
  const handleToggleComplete = (id: string) => {
    const match = calendarTasks.find((t) => t.id === id);
    const nextStatus = match?.status === 'Completed' ? ('Scheduled' as const) : ('Completed' as const);
    const updated = calendarTasks.map((t) =>
      t.id === id ? { ...t, status: nextStatus } : t
    );
    saveEvents(updated);
    updateCalendarEvent(id, { status: nextStatus }).catch((err) =>
      console.error('Failed to update task in calendar.db:', err)
    );
    if (onToggleTask) onToggleTask(id);
  };

  // Delete Task
  const handleDeleteTask = (id: string) => {
    if (window.confirm('Are you sure you want to remove this task?')) {
      const updated = calendarTasks.filter((t) => t.id !== id);
      saveEvents(updated);
      deleteCalendarEvent(id).catch((err) =>
        console.error('Failed to delete task from calendar.db:', err)
      );
    }
  };

  // Handle Create New Task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Please enter a task title');
      return;
    }

    const newTask: CalendarEvent = {
      id: `task-${Date.now()}`,
      title: formTitle.trim(),
      type: formType,
      date: formDate,
      time: formTime,
      duration: '30 mins',
      studentName: formStudent.trim() || 'Prospective Student',
      phone: formPhone.trim() || '+91 98765 43210',
      countryInterest: formCountry,
      counsellor: formCounsellor,
      mode: formMode,
      priority: formPriority,
      status: 'Scheduled',
      notes: formNotes.trim(),
    };

    saveEvents([newTask, ...calendarTasks]);
    createCalendarEvent(newTask).catch((err) =>
      console.error('Failed to persist task to calendar.db:', err)
    );
    setIsAddModalOpen(false);

    // Reset Form
    setFormTitle('');
    setFormStudent('');
    setFormPhone('');
    setFormNotes('');
  };

  // Quick Communication Trigger Helper
  const getTargetLead = (t: CalendarEvent): Lead => {
    const matched = leads.find(
      (l) => l.studentName.toLowerCase() === t.studentName.toLowerCase() || l.id === t.leadId
    );
    if (matched) return matched;
    return {
      id: t.leadId || `lead-${t.id}`,
      leadId: t.leadId || `L-${t.id}`,
      studentName: t.studentName,
      phone: t.phone || '+91 98765 43210',
      email: `${t.studentName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@example.com`,
      countryInterest: t.countryInterest || 'Italy',
      courseInterest: 'Higher Studies',
      status: 'Interested',
      leadSource: 'Portal',
      lastActivity: 'Today',
      nextFollowUp: t.date,
      nextFollowUpTime: t.time,
      counsellor: {
        id: 'c1',
        name: t.counsellor,
        email: 'counsellor@studyabroadcrm.com',
        role: 'Counsellor',
      },
      notes: t.notes || '',
      currentStage: 'Counselling',
      isEnrolled: false,
      isTransferredToDocs: false,
    };
  };

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return calendarTasks
      .filter((t) => {
        // Tab filter
        if (activeTab === 'today' && t.date !== todayStr) return false;
        if (activeTab === 'followup' && t.type !== 'followup') return false;
        if (activeTab === 'counselling' && t.type !== 'counselling') return false;
        if (activeTab === 'visa' && t.type !== 'visa') return false;
        if (activeTab === 'deadline' && t.type !== 'deadline' && t.type !== 'document') return false;
        if (activeTab === 'completed' && t.status !== 'Completed') return false;

        // Priority filter
        if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchStudent = t.studentName.toLowerCase().includes(q);
          const matchCounsellor = t.counsellor.toLowerCase().includes(q);
          const matchPhone = (t.phone || '').includes(q);
          const matchCountry = (t.countryInterest || '').toLowerCase().includes(q);
          if (!matchTitle && !matchStudent && !matchCounsellor && !matchPhone && !matchCountry) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          const score = { High: 3, Medium: 2, Low: 1 };
          return (score[b.priority] || 0) - (score[a.priority] || 0);
        }
        if (sortBy === 'name') {
          return a.studentName.localeCompare(b.studentName);
        }
        // Default sort by date
        return a.date.localeCompare(b.date);
      });
  }, [calendarTasks, activeTab, priorityFilter, searchQuery, sortBy, todayStr]);

  // Metric counts
  const totalCount = calendarTasks.length;
  const todayCount = calendarTasks.filter((t) => t.date === todayStr && t.status !== 'Completed').length;
  const followupCount = calendarTasks.filter((t) => t.type === 'followup' && t.status !== 'Completed').length;
  const counsellingCount = calendarTasks.filter((t) => t.type === 'counselling' && t.status !== 'Completed').length;
  const visaCount = calendarTasks.filter((t) => t.type === 'visa' && t.status !== 'Completed').length;
  const deadlineCount = calendarTasks.filter(
    (t) => (t.type === 'deadline' || t.type === 'document') && t.status !== 'Completed'
  ).length;
  const completedCount = calendarTasks.filter((t) => t.status === 'Completed').length;

  return (
    <div className="p-4 space-y-3.5 max-w-[1536px] mx-auto select-none">
      {/* ======================================================== */}
      {/* 1. Header Bar with Metrics & Action Buttons              */}
      {/* ======================================================== */}
      <div className="bg-white p-4 rounded-xl border border-[#e5edf5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#087cf5] flex items-center justify-center">
              <CheckSquare className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h1 className="text-[17px] font-bold text-[#101d37]">Tasks & Follow-ups Schedule</h1>
          </div>
          <p className="text-[12px] text-[#52627a] mt-1">
            Complete schedule of daily student follow-up calls, counselling sessions, visa filings, and deadlines
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {onNavigate && (
            <button
              onClick={() => onNavigate('calendar')}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-[#101d37] border border-slate-200 rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-[#087cf5]" />
              <span>Full Calendar Grid</span>
            </button>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#087cf5] hover:bg-[#006ee6] text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ New Task / Follow-up</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. KPI Summary Cards Strip                               */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* All Tasks */}
        <button
          onClick={() => setActiveTab('all')}
          className={`p-3 rounded-lg border text-left transition-all ${
            activeTab === 'all'
              ? 'bg-blue-50/80 border-[#087cf5] shadow-xs ring-1 ring-[#087cf5]'
              : 'bg-white border-[#e5edf5] hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-semibold text-[#52627a]">Total Tasks</div>
          <div className="text-[20px] font-bold text-[#101d37] mt-0.5">{totalCount}</div>
          <div className="text-[10px] text-blue-600 font-medium mt-0.5">Active Workspace</div>
        </button>

        {/* Due Today */}
        <button
          onClick={() => setActiveTab('today')}
          className={`p-3 rounded-lg border text-left transition-all ${
            activeTab === 'today'
              ? 'bg-red-50/80 border-red-500 shadow-xs ring-1 ring-red-500'
              : 'bg-white border-[#e5edf5] hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-semibold text-[#52627a]">Due Today</div>
          <div className="text-[20px] font-bold text-red-600 mt-0.5">{todayCount}</div>
          <div className="text-[10px] text-red-500 font-semibold mt-0.5">High Urgency</div>
        </button>

        {/* Follow-up Calls */}
        <button
          onClick={() => setActiveTab('followup')}
          className={`p-3 rounded-lg border text-left transition-all ${
            activeTab === 'followup'
              ? 'bg-emerald-50/80 border-emerald-500 shadow-xs ring-1 ring-emerald-500'
              : 'bg-white border-[#e5edf5] hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-semibold text-[#52627a]">Follow-up Calls</div>
          <div className="text-[20px] font-bold text-emerald-600 mt-0.5">{followupCount}</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Calls & Reminders</div>
        </button>

        {/* Counselling Sessions */}
        <button
          onClick={() => setActiveTab('counselling')}
          className={`p-3 rounded-lg border text-left transition-all ${
            activeTab === 'counselling'
              ? 'bg-blue-50/80 border-blue-500 shadow-xs ring-1 ring-blue-500'
              : 'bg-white border-[#e5edf5] hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-semibold text-[#52627a]">Counselling</div>
          <div className="text-[20px] font-bold text-blue-600 mt-0.5">{counsellingCount}</div>
          <div className="text-[10px] text-blue-600 font-medium mt-0.5">Video & In-Person</div>
        </button>

        {/* Visa & Embassy */}
        <button
          onClick={() => setActiveTab('visa')}
          className={`p-3 rounded-lg border text-left transition-all ${
            activeTab === 'visa'
              ? 'bg-purple-50/80 border-purple-500 shadow-xs ring-1 ring-purple-500'
              : 'bg-white border-[#e5edf5] hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-semibold text-[#52627a]">Visa & Embassy</div>
          <div className="text-[20px] font-bold text-purple-600 mt-0.5">{visaCount}</div>
          <div className="text-[10px] text-purple-600 font-medium mt-0.5">Biometrics & DOV</div>
        </button>

        {/* Completed */}
        <button
          onClick={() => setActiveTab('completed')}
          className={`p-3 rounded-lg border text-left transition-all ${
            activeTab === 'completed'
              ? 'bg-slate-100 border-slate-500 shadow-xs ring-1 ring-slate-500'
              : 'bg-white border-[#e5edf5] hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-semibold text-[#52627a]">Completed</div>
          <div className="text-[20px] font-bold text-slate-700 mt-0.5">{completedCount}</div>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5">Finished Tasks</div>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 3. Search & Filter Bar                                   */}
      {/* ======================================================== */}
      <div className="bg-white p-3 rounded-xl border border-[#e5edf5] shadow-xs flex flex-col md:flex-row items-center justify-between gap-2.5">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Tasks', count: totalCount },
            { id: 'today', label: "Today's Due", count: todayCount },
            { id: 'followup', label: 'Calls', count: followupCount },
            { id: 'counselling', label: 'Counselling', count: counsellingCount },
            { id: 'visa', label: 'Visa', count: visaCount },
            { id: 'deadline', label: 'Deadlines & Docs', count: deadlineCount },
            { id: 'completed', label: 'Completed', count: completedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[#087cf5] text-white shadow-xs'
                  : 'bg-slate-50 text-[#52627a] hover:bg-slate-100 hover:text-[#101d37]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id ? 'bg-white/25 text-white' : 'bg-slate-200 text-[#52627a]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Right Search & Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-60">
            <Search className="w-3.5 h-3.5 text-[#8ca0ba] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student, task, counsellor..."
              className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#101d37] outline-none focus:border-[#087cf5]"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="bg-[#f8fafc] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-[#52627a] font-medium outline-none focus:border-[#087cf5]"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#f8fafc] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-[#52627a] font-medium outline-none focus:border-[#087cf5]"
          >
            <option value="date">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
            <option value="name">Sort: Student Name</option>
          </select>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. Tasks & Follow-ups Card List                          */}
      {/* ======================================================== */}
      <div className="space-y-2.5">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((t) => {
            const cfg = typeConfig[t.type] || typeConfig.followup;
            const Icon = cfg.icon;
            const isCompleted = t.status === 'Completed';
            const isToday = t.date === todayStr;
            const isTomorrow = t.date === tomorrowStr;

            return (
              <div
                key={t.id}
                className={`bg-white rounded-xl border border-slate-200/90 shadow-xs p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-l-4 ${
                  cfg.border
                } transition-all ${
                  isCompleted ? 'opacity-65 bg-slate-50/60' : 'hover:shadow-md hover:border-slate-300'
                }`}
              >
                {/* Left: Checkbox + Title & Details */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Complete Checkbox */}
                  <button
                    type="button"
                    onClick={() => handleToggleComplete(t.id)}
                    className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-[#087cf5] bg-white'
                    }`}
                    title={isCompleted ? 'Mark Incomplete' : 'Mark Completed'}
                  >
                    {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 flex-1 space-y-1">
                    {/* Title + Badges row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`font-bold text-[13.5px] text-[#101d37] leading-snug ${
                          isCompleted ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {t.title}
                      </span>

                      {/* Type Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${cfg.badge}`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{cfg.label}</span>
                      </span>

                      {/* Priority */}
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          t.priority === 'High'
                            ? 'bg-rose-100 text-rose-700'
                            : t.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {t.priority}
                      </span>

                      {/* Relative urgency badge */}
                      {isToday && !isCompleted && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 animate-pulse">
                          Due Today
                        </span>
                      )}
                      {isTomorrow && !isCompleted && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          Due Tomorrow
                        </span>
                      )}
                    </div>

                    {/* Student & Schedule details */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11.5px] text-[#52627a]">
                      <div className="flex items-center gap-1 text-[#101d37] font-semibold">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.studentName}</span>
                        {t.countryInterest && (
                          <span className="text-[10.5px] font-normal text-slate-500">
                            ({t.countryInterest})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-[#101d37]">
                          {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : t.date}
                        </span>
                        <span className="text-slate-400">•</span>
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.time}</span>
                      </div>

                      <div className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.2 rounded font-medium text-[11px]">
                        <span>{t.mode}</span>
                      </div>

                      <div className="flex items-center gap-1 text-slate-500">
                        <span>Counsellor:</span>
                        <span className="font-semibold text-slate-700">{t.counsellor}</span>
                      </div>
                    </div>

                    {/* Agenda / remarks if any */}
                    {t.notes && (
                      <div className="text-[11px] text-[#52627a] bg-slate-50 border border-slate-100 rounded-md px-2.5 py-1 mt-1 max-w-2xl">
                        <span className="font-semibold text-[#101d37] mr-1">Remarks:</span>
                        {t.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Quick Communication & Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                  {/* Phone Call */}
                  {onOpenPhone && (
                    <button
                      onClick={() => onOpenPhone(getTargetLead(t))}
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-lg border border-emerald-200 transition-colors"
                      title={`Call ${t.studentName}`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* WhatsApp */}
                  {onOpenWhatsApp && (
                    <button
                      onClick={() => onOpenWhatsApp(getTargetLead(t))}
                      className="p-1.5 bg-green-50 hover:bg-green-600 text-green-600 hover:text-white rounded-lg border border-green-200 transition-colors"
                      title={`WhatsApp ${t.studentName}`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Email */}
                  {onOpenEmail && (
                    <button
                      onClick={() => onOpenEmail(getTargetLead(t))}
                      className="p-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg border border-blue-200 transition-colors"
                      title={`Email ${t.studentName}`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Toggle Status Button */}
                  <button
                    onClick={() => handleToggleComplete(t.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                      isCompleted
                        ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>{isCompleted ? 'Completed' : 'Mark Done'}</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteTask(t.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="text-[14px] font-bold text-[#101d37]">No tasks found</h3>
            <p className="text-xs text-[#52627a] max-w-sm mx-auto">
              {searchQuery
                ? `No tasks or follow-ups matched your search "${searchQuery}". Try adjusting your filters.`
                : 'There are no tasks in this category. Use the "+ New Task / Follow-up" button above to schedule one.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('all');
                  setPriorityFilter('All');
                }}
                className="mt-2 px-3 py-1.5 text-xs text-[#087cf5] font-semibold hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 5. Modal: Add New Task & Follow-up                       */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[#087cf5] text-white flex items-center justify-center">
                  <CheckSquare className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="text-sm font-bold text-[#101d37]">Schedule New Task & Follow-up</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-3.5 text-xs">
              {/* Task Title */}
              <div>
                <label className="block text-[11px] font-bold text-[#101d37] mb-1">
                  Task Title / Action Item <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Call Ananya Sharma regarding Italian Universitaly pre-enrolment"
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg p-2.5 text-xs text-[#101d37] outline-none focus:border-[#087cf5]"
                />
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#101d37] mb-1">Task Category</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg p-2 text-xs text-[#101d37] outline-none focus:border-[#087cf5]"
                  >
                    <option value="followup">Follow-up Call</option>
                    <option value="counselling">Counselling Session</option>
                    <option value="visa">Visa & Embassy</option>
                    <option value="deadline">Application Deadline</option>
                    <option value="document">Document Collection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#101d37] mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg p-2 text-xs text-[#101d37] outline-none focus:border-[#087cf5]"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              {/* Student Name & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#101d37] mb-1">Student Name</label>
                  <input
                    type="text"
                    value={formStudent}
                    onChange={(e) => setFormStudent(e.target.value)}
                    placeholder="e.g. Swati Pandey"
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg p-2 text-xs text-[#101d37] outline-none focus:border-[#087cf5]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#101d37] mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g. +91 98444 55667"
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg p-2 text-xs text-[#101d37] outline-none focus:border-[#087cf5]"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#101d37] mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg p-2 text-xs text-[#101d37] outline-none focus:border-[#087cf5]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#101d37] mb-1">Time</label>
                  <input
                    type="text"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    placeholder="e.g. 11:30 AM"
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg p-2 text-xs text-[#101d37] outline-none focus:border-[#087cf5]"
                  />
                </div>
              </div>

              {/* Engagement Mode & Counsellor */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#101d37] mb-1">Engagement Mode</label>
                  <select
                    value={formMode}
                    onChange={(e) => setFormMode(e.target.value as any)}
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg p-2 text-xs text-[#101d37] outline-none focus:border-[#087cf5]"
                  >
                    <option value="Phone Call">Phone Call</option>
                    <option value="Google Meet / Zoom">Google Meet / Zoom</option>
                    <option value="In-Person">In-Person Office Visit</option>
                    <option value="WhatsApp">WhatsApp Chat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#101d37] mb-1">Assigned Counsellor</label>
                  <select
                    value={formCounsellor}
                    onChange={(e) => setFormCounsellor(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg p-2 text-xs text-[#101d37] outline-none focus:border-[#087cf5]"
                  >
                    <option value="Neha Sharma">Neha Sharma (Senior Counsellor)</option>
                    <option value="Amit Verma">Amit Verma (Branch Head)</option>
                    <option value="Priya Singh">Priya Singh (Doc Officer)</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold text-[#101d37] mb-1">Task Notes / Discussion Points</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Specific follow-up requirements, document list, or counselling agenda..."
                  className="w-full bg-[#f8fafc] border border-slate-300 rounded-lg p-2 text-xs text-[#101d37] outline-none focus:border-[#087cf5]"
                />
              </div>

              {/* Form Footer */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#087cf5] hover:bg-[#006ee6] text-white font-bold shadow-xs"
                >
                  Save & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
