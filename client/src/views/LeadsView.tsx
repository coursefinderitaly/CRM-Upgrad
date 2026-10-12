import React, { useState } from 'react';
import { Lead } from '../types/crm';
import {
  Plus,
  Download,
  Search,
  Filter,
  Phone,
  Calendar,
  MoreVertical,
  Edit2,
  UserCheck,
  Trash2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Mail,
  Send,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  GraduationCap,
  Award,
  Globe,
  MapPin,
  DollarSign,
  User,
  ExternalLink,
  BookOpen,
  Check,
  Building,
  CreditCard,
  Share2,
  Tag,
  Circle,
  TrendingUp,
} from 'lucide-react';

interface LeadsViewProps {
  leads: Lead[];
  onAddNewLead: () => void;
  onSelectLead?: (lead: Lead) => void;
  selectedLead?: Lead | null;
  onEditLead: (lead: Lead) => void;
  onEnrollLead: (lead: Lead) => void;
  onTransferDocs?: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
  onOpenPhone: (lead: Lead) => void;
  onOpenWhatsApp: (lead: Lead) => void;
  onOpenEmail?: (lead: Lead) => void;
  onScheduleFollowUp: (lead: Lead) => void;
  onUpdateStatus?: (leadId: string, status: string) => void;
  onAddNote?: (leadId: string, note: string) => void;
  initialStatusFilter?: string;
}

export const LeadsView: React.FC<LeadsViewProps> = ({
  leads,
  onAddNewLead,
  onSelectLead,
  selectedLead: propSelectedLead,
  onEditLead,
  onEnrollLead,
  onTransferDocs,
  onDeleteLead,
  onOpenPhone,
  onOpenWhatsApp,
  onOpenEmail,
  onScheduleFollowUp,
  onUpdateStatus,
  onAddNote,
  initialStatusFilter = 'all',
}) => {
  // Navigation & View Mode
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'academic' | 'test' | 'counselling' | 'notes' | 'tasks' | 'activity'
  >('overview');

  // Sync with hash param or prop
  React.useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.includes('?id=')) {
        const targetId = hash.split('?id=')[1];
        const found = leads.find((l) => l.leadId === targetId || l.id === targetId);
        if (found) setActiveLead(found);
      } else if (hash === '#leads' || hash === 'leads') {
        setActiveLead(null);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [leads]);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);

  // Note creator state
  const [noteContent, setNoteContent] = useState('');
  const [noteTag, setNoteTag] = useState('Call Summary');
  const [localNotes, setLocalNotes] = useState<
    Array<{ id: string; author: string; time: string; tag: string; text: string }>
  >([
    {
      id: '1',
      author: 'Priya Singh (Counsellor)',
      time: '08 Jan 2025, 04:30 PM',
      tag: 'Call Summary',
      text: 'Student called to ask regarding tuition fee waivers and regional scholarships in Veneto (EDISU). Explained that 100% waiver is possible based on family income documentation (ISEE Parificato).',
    },
    {
      id: '2',
      author: 'Priya Singh (Counsellor)',
      time: '05 Jan 2025, 11:15 AM',
      tag: 'Parent Discussion',
      text: 'Father joined the Google Meet session. Confirmed total budget of €25,000 for 2-year living costs. Very supportive of Italy public university choices.',
    },
    {
      id: '3',
      author: 'Neha Sharma (Admin)',
      time: '02 Jan 2025, 02:40 PM',
      tag: 'General',
      text: 'Inquiry received via Google Ads campaign. Verified phone number and assigned to Senior Counsellor Priya Singh.',
    },
  ]);

  // Tasks state
  const [leadTasks, setLeadTasks] = useState([
    {
      id: 't1',
      title: 'Discuss university shortlists and application timeline',
      dueDate: '10 Jan 2025, 11:00 AM',
      priority: 'High',
      completed: false,
    },
    {
      id: 't2',
      title: 'Verify IELTS Test Report Form (TRF) on IDP portal',
      dueDate: '12 Jan 2025, 03:00 PM',
      priority: 'Medium',
      completed: true,
    },
    {
      id: 't3',
      title: 'Request updated semester 7 & 8 consolidated marksheets',
      dueDate: '15 Jan 2025, 05:00 PM',
      priority: 'High',
      completed: false,
    },
  ]);
  const [newTaskInput, setNewTaskInput] = useState('');

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filtered = leads.filter((l) => {
    if (countryFilter !== 'all' && l.countryInterest !== countryFilter) return false;
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        l.studentName.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.leadId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportCSV = () => {
    const headers = [
      'Lead ID,Name,Phone,Email,Country,Course,Source,Status,Last Activity,Next Follow-up',
    ];
    const rows = filtered.map(
      (l) =>
        `"${l.leadId}","${l.studentName}","${l.phone}","${l.email}","${l.countryInterest}","${l.courseInterest}","${l.leadSource}","${l.status}","${l.lastActivity}","${l.nextFollowUp}"`
    );
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // Open lead expanded view
  const handleOpenLead = (lead: Lead) => {
    setActiveLead(lead);
    window.location.hash = `leads?id=${lead.leadId}`;
    if (onSelectLead) onSelectLead(lead);
  };

  // Cycle leads
  const currentIndex = activeLead ? leads.findIndex((l) => l.id === activeLead.id) : -1;
  const handlePrevLead = () => {
    if (currentIndex > 0) {
      const prev = leads[currentIndex - 1];
      setActiveLead(prev);
      window.location.hash = `leads?id=${prev.leadId}`;
      if (onSelectLead) onSelectLead(prev);
    }
  };
  const handleNextLead = () => {
    if (currentIndex >= 0 && currentIndex < leads.length - 1) {
      const next = leads[currentIndex + 1];
      setActiveLead(next);
      window.location.hash = `leads?id=${next.leadId}`;
      if (onSelectLead) onSelectLead(next);
    }
  };

  const handleBackToDirectory = () => {
    setActiveLead(null);
    window.location.hash = 'leads';
  };

  // Add new note
  const handleCreateNote = () => {
    if (!noteContent.trim() || !activeLead) return;
    const newNote = {
      id: Date.now().toString(),
      author: 'Priya Singh (You)',
      time: 'Just now',
      tag: noteTag,
      text: noteContent.trim(),
    };
    setLocalNotes([newNote, ...localNotes]);
    if (onAddNote) onAddNote(activeLead.id, `[${noteTag}] ${noteContent.trim()}`);
    setNoteContent('');
    showToast('Note saved successfully');
  };

  // Add new task
  const handleCreateTask = () => {
    if (!newTaskInput.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      title: newTaskInput.trim(),
      dueDate: 'Upcoming',
      priority: 'Medium',
      completed: false,
    };
    setLeadTasks([newTask, ...leadTasks]);
    setNewTaskInput('');
    showToast('Task added to lead');
  };

  // Toggle task
  const handleToggleLeadTask = (id: string) => {
    setLeadTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  // Change status
  const handleStatusChange = (newStatus: string) => {
    if (!activeLead) return;
    const updated = { ...activeLead, status: newStatus };
    setActiveLead(updated);
    if (onUpdateStatus) onUpdateStatus(activeLead.id, newStatus);
    showToast(`Lead status updated to '${newStatus}'`);
  };

  // Workflow stages definition
  const stages = [
    { key: 'New Lead', label: '1. New Lead' },
    { key: 'Contacted', label: '2. Contacted' },
    { key: 'Counselling', label: '3. Counselling' },
    { key: 'Interested', label: '4. Interested' },
    { key: 'Enrolled', label: '5. Enrolled' },
    { key: 'Transferred', label: '6. Transferred to Docs' },
    { key: 'Application', label: '7. Application' },
  ];

  const getStageIndex = (stage: string) => {
    switch (stage) {
      case 'New Lead':
        return 0;
      case 'Contacted':
        return 1;
      case 'Counselling':
        return 2;
      case 'Interested':
      case 'Follow-up':
        return 3;
      case 'Enrolled':
        return 4;
      case 'Documentation':
      case 'Transferred':
        return 5;
      case 'Application':
      case 'Offer':
        return 6;
      default:
        return 1;
    }
  };

  // -------------------------------------------------------------
  // VIEW 1: EXPANDED LEAD DETAIL VIEW (When a lead is selected)
  // -------------------------------------------------------------
  if (activeLead) {
    const stageIdx = getStageIndex(activeLead.status);

    return (
      <div className="p-3.5 pb-12 space-y-3 max-w-[1536px] mx-auto select-none font-sans text-[#101d37]">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 bg-[#087cf5] text-white px-4 py-2.5 rounded-lg shadow-lg text-[13px] font-medium flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            {toastMessage}
          </div>
        )}

        {/* Top Navigation & Breadcrumb Bar */}
        <div className="bg-white border border-[#e2e8f0] rounded-[9px] p-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToDirectory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#f8fafc] hover:bg-[#eff6ff] text-[#087cf5] border border-[#cbd5e1] text-[12px] font-semibold transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Leads Directory</span>
            </button>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            <div className="text-[12px] text-[#64748b] hidden sm:flex items-center gap-1.5">
              <span>Leads Directory</span>
              <span>&gt;</span>
              <span className="font-bold text-[#101d37]">{activeLead.studentName}</span>
              <span className="text-[11px] font-mono bg-slate-100 text-[#475569] px-1.5 py-0.5 rounded">
                {activeLead.leadId}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Pagers */}
            <div className="flex items-center gap-1 bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] px-2 py-1 text-[11px] text-[#64748b]">
              <button
                onClick={handlePrevLead}
                disabled={currentIndex <= 0}
                className="hover:text-[#101d37] disabled:opacity-30 disabled:cursor-not-allowed p-0.5"
                title="Previous Lead"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-medium text-[#101d37]">
                {currentIndex + 1} of {leads.length}
              </span>
              <button
                onClick={handleNextLead}
                disabled={currentIndex >= leads.length - 1}
                className="hover:text-[#101d37] disabled:opacity-30 disabled:cursor-not-allowed p-0.5"
                title="Next Lead"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Actions */}
            <button
              onClick={() => onOpenPhone(activeLead)}
              className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-[6px] text-[11.5px] font-semibold flex items-center gap-1.5 transition-colors"
              title="Call Lead"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Call</span>
            </button>

            <button
              onClick={() => onOpenWhatsApp(activeLead)}
              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[6px] text-[11.5px] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
              title="Open WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            {onOpenEmail && (
              <button
                onClick={() => onOpenEmail(activeLead)}
                className="px-2.5 py-1.5 bg-[#eff6ff] hover:bg-[#dbeafe] text-[#087cf5] border border-[#bfdbfe] rounded-[6px] text-[11.5px] font-semibold flex items-center gap-1.5 transition-colors"
                title="Send Email"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </button>
            )}

            <button
              onClick={() => onScheduleFollowUp(activeLead)}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-[#475569] border border-[#cbd5e1] rounded-[6px] text-[11.5px] font-medium flex items-center gap-1.5 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>Schedule</span>
            </button>

            <button
              onClick={() => onEnrollLead(activeLead)}
              className="px-2.5 py-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-[6px] text-[11.5px] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Convert Student</span>
            </button>

            {onTransferDocs && (
              <button
                onClick={() => onTransferDocs(activeLead)}
                className="px-2.5 py-1.5 bg-[#087cf5] hover:bg-[#076ed9] text-white rounded-[6px] text-[11.5px] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Transfer Docs</span>
              </button>
            )}

            <button
              onClick={() => onEditLead(activeLead)}
              className="p-1.5 text-slate-500 hover:text-[#087cf5] hover:bg-slate-100 rounded-[6px] transition-colors"
              title="Edit Lead Info"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onDeleteLead(activeLead)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-[6px] transition-colors"
              title="Delete Lead"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Hero Student Banner */}
        <div className="bg-white border border-[#e2e8f0] rounded-[9px] p-4 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <img
                src={activeLead.avatarUrl || '/avatars/rahul.png'}
                alt={activeLead.studentName}
                className="w-14 h-14 aspect-square rounded-full object-cover border-2 border-slate-200 shadow-xs shrink-0"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[18px] font-bold text-[#101d37] leading-tight">
                    {activeLead.studentName}
                  </h1>
                  <span className="font-mono text-[11px] font-semibold bg-blue-50 text-[#087cf5] border border-blue-200 px-2 py-0.5 rounded-md">
                    {activeLead.leadId}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-medium text-[#64748b]">Status:</span>
                    <select
                      value={activeLead.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="text-[11.5px] font-semibold bg-slate-50 border border-[#cbd5e1] text-[#101d37] rounded-md px-2 py-0.5 outline-none focus:ring-1 focus:ring-[#087cf5] cursor-pointer"
                    >
                      <option value="New Lead">New Lead</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Counselling">Counselling</option>
                      <option value="Interested">Interested</option>
                      <option value="Enrolled">Enrolled</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Lost">Lost</option>
                      <option value="Transferred">Transferred</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11.5px] text-[#64748b] mt-1">
                  <span className="flex items-center gap-1 text-[#101d37] font-medium">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    {activeLead.phone}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[#101d37] font-medium">
                    <Mail className="w-3 h-3 text-[#087cf5]" />
                    {activeLead.email}
                  </span>
                  <span>•</span>
                  <span>
                    Source:{' '}
                    <span className="font-semibold text-[#101d37]">
                      {activeLead.leadSource || 'Google Ads'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-6 text-[12px]">
              <div>
                <div className="text-[10px] text-[#64748b] font-medium uppercase tracking-wider">
                  Target Country
                </div>
                <div className="font-semibold text-[#101d37] flex items-center gap-1.5 mt-0.5">
                  <span className="text-sm">🇮🇹</span> {activeLead.countryInterest}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-[#64748b] font-medium uppercase tracking-wider">
                  Target Course
                </div>
                <div className="font-semibold text-[#101d37] flex items-center gap-1.5 mt-0.5">
                  <GraduationCap className="w-3.5 h-3.5 text-[#087cf5]" />
                  {activeLead.courseInterest}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-[#64748b] font-medium uppercase tracking-wider">
                  Target Intake
                </div>
                <div className="font-semibold text-[#101d37] flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-[#64748b]" />
                  {activeLead.intake || 'Sept 2026'}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-[#64748b] font-medium uppercase tracking-wider">
                  Estimated Budget
                </div>
                <div className="font-semibold text-[#101d37] flex items-center gap-1.5 mt-0.5">
                  <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                  {activeLead.budget || '€20,000 – 30,000 / yr'}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-[#64748b] font-medium uppercase tracking-wider">
                  Next Follow-up
                </div>
                <div className="font-bold text-rose-600 flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  {activeLead.nextFollowUp}
                </div>
              </div>
            </div>
          </div>

          {/* Lifecycle / Stage Progress Stepper */}
          <div className="pt-2 border-t border-[#f1f5f9]">
            <div className="relative">
              {/* Connector line */}
              <div className="absolute top-3 left-4 right-4 h-0.5 bg-slate-200 z-0" />
              <div
                className="absolute top-3 left-4 h-0.5 bg-[#087cf5] z-0 transition-all duration-300"
                style={{
                  width: `${(stageIdx / (stages.length - 1)) * 94}%`,
                }}
              />

              <div className="relative z-10 flex justify-between items-start text-center">
                {stages.map((stg, idx) => {
                  const isDone = idx < stageIdx;
                  const isCurrent = idx === stageIdx;
                  return (
                    <div
                      key={stg.key}
                      onClick={() => handleStatusChange(stg.key)}
                      className="flex flex-col items-center cursor-pointer group"
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                          isCurrent
                            ? 'bg-[#087cf5] text-white ring-4 ring-blue-100 shadow-xs'
                            : isDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border-2 border-slate-300 text-slate-400 group-hover:border-slate-400'
                        }`}
                      >
                        {isDone ? <Check className="w-3 h-3" /> : idx + 1}
                      </div>
                      <div
                        className={`text-[10px] mt-1 max-w-[70px] leading-tight ${
                          isCurrent
                            ? 'font-bold text-[#087cf5]'
                            : isDone
                            ? 'font-semibold text-emerald-800'
                            : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      >
                        {stg.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 7-Tab Navigation Bar */}
        <div className="bg-white border border-[#e2e8f0] rounded-[9px] px-3 shadow-xs flex gap-5 overflow-x-auto text-[12px] font-medium">
          {[
            { id: 'overview', label: 'Overview & Contacts', icon: User },
            { id: 'academic', label: 'Academic Profile', icon: GraduationCap },
            { id: 'test', label: 'Test Scores (IELTS)', icon: Award },
            { id: 'counselling', label: 'Counselling Sessions', icon: BookOpen },
            { id: 'notes', label: `Notes (${localNotes.length})`, icon: FileText },
            { id: 'tasks', label: `Tasks (${leadTasks.length})`, icon: CheckCircle2 },
            { id: 'activity', label: 'Activity Timeline', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 whitespace-nowrap border-b-2 flex items-center gap-1.5 transition-colors ${
                  isActive
                    ? 'border-[#087cf5] text-[#087cf5] font-bold'
                    : 'border-transparent text-[#64748b] hover:text-[#101d37]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#087cf5]' : 'text-[#94a3b8]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Grid: 8 cols Left + 4 cols Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          {/* Left Column: Active Tab Content (8 cols) */}
          <div className="lg:col-span-8 space-y-3">
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-3">
                {/* Personal Information */}
                <div className="bg-white border border-[#e2e8f0] rounded-[9px] p-3.5 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-2">
                    <h3 className="text-[13px] font-bold text-[#101d37] flex items-center gap-1.5">
                      <User className="w-4 h-4 text-[#087cf5]" /> Personal Information
                    </h3>
                    <button
                      onClick={() => onEditLead(activeLead)}
                      className="text-[11px] text-[#087cf5] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Edit2 className="w-3 h-3" /> Edit Info
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11.5px]">
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Full Name</span>
                      <span className="font-semibold text-[#101d37]">{activeLead.studentName}</span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Date of Birth</span>
                      <span className="font-semibold text-[#101d37]">
                        {activeLead.dob || '15 Mar 2003 (22 years)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Gender</span>
                      <span className="font-semibold text-[#101d37]">Male</span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Nationality</span>
                      <span className="font-semibold text-[#101d37]">
                        {activeLead.nationality || 'Indian'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Passport Status</span>
                      <span className="inline-block px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold">
                        Applied (In Process)
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">City & State</span>
                      <span className="font-semibold text-[#101d37]">New Delhi, Delhi</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white border border-[#e2e8f0] rounded-[9px] p-3.5 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-2">
                    <h3 className="text-[13px] font-bold text-[#101d37] flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-emerald-600" /> Contact Details
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11.5px]">
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Primary Phone</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-semibold text-[#101d37]">{activeLead.phone}</span>
                        <button
                          onClick={() => onOpenWhatsApp(activeLead)}
                          className="text-emerald-600 hover:text-emerald-700"
                          title="WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Secondary / Parent Phone</span>
                      <span className="font-semibold text-[#101d37]">+91 98111 22334 (Father)</span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Email Address</span>
                      <span className="font-semibold text-[#087cf5] hover:underline cursor-pointer">
                        {activeLead.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Preferred Contact Time</span>
                      <span className="font-semibold text-[#101d37]">04:00 PM – 07:00 PM IST</span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Preferred Language</span>
                      <span className="font-semibold text-[#101d37]">English / Hindi</span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Permanent Address</span>
                      <span className="font-medium text-[#475569]">Sector 14, Rohini, New Delhi 110085</span>
                    </div>
                  </div>
                </div>

                {/* Study & Admission Preferences */}
                <div className="bg-white border border-[#e2e8f0] rounded-[9px] p-3.5 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-2">
                    <h3 className="text-[13px] font-bold text-[#101d37] flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-purple-600" /> Study & Financial Preferences
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11.5px]">
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Preferred Country</span>
                      <span className="font-semibold text-[#101d37]">🇮🇹 {activeLead.countryInterest}</span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Target Course / Major</span>
                      <span className="font-semibold text-[#101d37]">{activeLead.courseInterest}</span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Target Intake</span>
                      <span className="font-semibold text-[#101d37]">{activeLead.intake || 'Sept 2026'}</span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Preferred Cities</span>
                      <span className="font-semibold text-[#101d37]">Milan, Rome, Padova, Bologna</span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">University Type</span>
                      <span className="font-semibold text-[#101d37]">Public Universities</span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Estimated Budget</span>
                      <span className="font-semibold text-emerald-700">
                        {activeLead.budget || '€20,000 – 30,000 / year'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Scholarship Interest</span>
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                        Yes (Needs 100% Regional Waiver)
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Accommodation Preference</span>
                      <span className="font-semibold text-[#101d37]">On-Campus / Student Dorm</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ACADEMIC PROFILE */}
            {activeTab === 'academic' && (
              <div className="space-y-3">
                <div className="bg-white border border-[#e2e8f0] rounded-[9px] p-3.5 shadow-xs space-y-3">
                  <h3 className="text-[13px] font-bold text-[#101d37] flex items-center gap-1.5 border-b border-[#f1f5f9] pb-2">
                    <GraduationCap className="w-4 h-4 text-[#087cf5]" /> Educational Background
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* 10th */}
                    <div className="p-3 rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc] space-y-1">
                      <div className="text-[11px] font-bold text-[#101d37]">10th Standard (SSC)</div>
                      <div className="text-[18px] font-bold text-emerald-600">85.2%</div>
                      <div className="text-[11px] text-[#64748b]">Board: CBSE • Year: 2019</div>
                      <div className="text-[10.5px] text-[#475569]">Delhi Public School, R.K. Puram</div>
                    </div>

                    {/* 12th */}
                    <div className="p-3 rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc] space-y-1">
                      <div className="text-[11px] font-bold text-[#101d37]">12th Standard (HSC)</div>
                      <div className="text-[18px] font-bold text-emerald-600">82.6%</div>
                      <div className="text-[11px] text-[#64748b]">Stream: Science (PCM) • Year: 2021</div>
                      <div className="text-[10.5px] text-[#475569]">CBSE Board • Delhi</div>
                    </div>

                    {/* Bachelor */}
                    <div className="p-3 rounded-[8px] border border-[#bfdbfe] bg-[#eff6ff] space-y-1">
                      <div className="text-[11px] font-bold text-[#087cf5]">Undergraduate Degree</div>
                      <div className="text-[18px] font-bold text-[#087cf5]">8.1 CGPA</div>
                      <div className="text-[11px] text-[#1e40af] font-medium">B.Tech Computer Science</div>
                      <div className="text-[10.5px] text-[#475569]">
                        Delhi Technological University (2025)
                      </div>
                    </div>
                  </div>

                  {/* Academic Integrity & Flags */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#f1f5f9] text-[11.5px]">
                    <div className="bg-[#f0fdf4] p-2 rounded-[6px] border border-[#dcfce7]">
                      <div className="text-[10px] text-emerald-700 font-medium">Active Backlogs</div>
                      <div className="font-bold text-emerald-800 text-[13px]">0 (None)</div>
                    </div>
                    <div className="bg-[#f0fdf4] p-2 rounded-[6px] border border-[#dcfce7]">
                      <div className="text-[10px] text-emerald-700 font-medium">Historic Backlogs</div>
                      <div className="font-bold text-emerald-800 text-[13px]">0</div>
                    </div>
                    <div className="bg-[#f0fdf4] p-2 rounded-[6px] border border-[#dcfce7]">
                      <div className="text-[10px] text-emerald-700 font-medium">Education Gap</div>
                      <div className="font-bold text-emerald-800 text-[13px]">None (Direct Entry)</div>
                    </div>
                    <div className="bg-[#f8fafc] p-2 rounded-[6px] border border-[#e2e8f0]">
                      <div className="text-[10px] text-[#64748b] font-medium">Work Experience</div>
                      <div className="font-bold text-[#101d37] text-[13px]">6 Mos Internship</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TEST SCORES */}
            {activeTab === 'test' && (
              <div className="bg-white border border-[#e2e8f0] rounded-[9px] p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-2">
                  <h3 className="text-[13px] font-bold text-[#101d37] flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" /> English Proficiency & Tests
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    Official Score Verified ✓
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
                  <div className="sm:col-span-2 bg-[#f0fdf4] p-3 rounded-[8px] border border-[#dcfce7] text-center space-y-1">
                    <div className="text-[11px] font-bold text-emerald-900">IELTS Academic</div>
                    <div className="text-[28px] font-black text-emerald-600 leading-tight">7.0</div>
                    <div className="text-[10.5px] text-emerald-800 font-medium">Overall Band Score</div>
                    <div className="text-[10px] text-[#64748b] pt-1">
                      Test Date: 12 Jan 2025 • Valid till 12 Jan 2027
                    </div>
                  </div>

                  <div className="sm:col-span-3 grid grid-cols-4 gap-2 text-center">
                    <div className="bg-[#f8fafc] p-2 rounded-[6px] border border-[#e2e8f0]">
                      <div className="text-[10px] text-[#64748b] font-medium">Listening</div>
                      <div className="text-[15px] font-bold text-[#101d37]">7.5</div>
                    </div>
                    <div className="bg-[#f8fafc] p-2 rounded-[6px] border border-[#e2e8f0]">
                      <div className="text-[10px] text-[#64748b] font-medium">Reading</div>
                      <div className="text-[15px] font-bold text-[#101d37]">7.0</div>
                    </div>
                    <div className="bg-[#f8fafc] p-2 rounded-[6px] border border-[#e2e8f0]">
                      <div className="text-[10px] text-[#64748b] font-medium">Writing</div>
                      <div className="text-[15px] font-bold text-[#101d37]">6.5</div>
                    </div>
                    <div className="bg-[#f8fafc] p-2 rounded-[6px] border border-[#e2e8f0]">
                      <div className="text-[10px] text-[#64748b] font-medium">Speaking</div>
                      <div className="text-[15px] font-bold text-[#101d37]">7.0</div>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-[#f8fafc] rounded-[6px] border border-[#e2e8f0] flex items-center justify-between text-[11px]">
                  <div>
                    <span className="text-[#64748b]">TRF Number: </span>
                    <span className="font-mono font-bold text-[#101d37]">25IN001234SHARAH</span>
                  </div>
                  <div className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Accepted by Padova,
                    Torino, Bologna
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: COUNSELLING SESSIONS */}
            {activeTab === 'counselling' && (
              <div className="bg-white border border-[#e2e8f0] rounded-[9px] p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-2">
                  <h3 className="text-[13px] font-bold text-[#101d37] flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#087cf5]" /> Counselling & Advisory Sessions
                  </h3>
                  <button
                    onClick={() => onScheduleFollowUp(activeLead)}
                    className="px-2.5 py-1 bg-[#087cf5] text-white rounded-[5px] text-[11px] font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Book New Session
                  </button>
                </div>

                <div className="p-3 bg-[#f8fafc] rounded-[8px] border border-[#e2e8f0] space-y-2 text-[11.5px]">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-[#101d37]">Session 1: Initial Discovery & Course Fitment</div>
                    <span className="text-[10.5px] text-[#64748b]">08 Jan 2025 • 45 Mins</span>
                  </div>
                  <div className="text-[#475569] leading-relaxed">
                    Discussed course options for Computer Science in Italian public universities. Reviewed student's DTU B.Tech transcript (8.1 CGPA) and confirmed strong eligibility for English-taught Master's degrees at Padova and Politecnico di Torino.
                  </div>
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded-[5px] text-[11px] text-[#1e40af]">
                    <strong>Agreed Action Items:</strong> Student will share consolidated 6th semester marksheets. Counsellor will draft Italian pre-enrollment checklist.
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: NOTES */}
            {activeTab === 'notes' && (
              <div className="bg-white border border-[#e2e8f0] rounded-[9px] p-4 shadow-xs space-y-3">
                <h3 className="text-[13px] font-bold text-[#101d37] flex items-center gap-1.5 border-b border-[#f1f5f9] pb-2">
                  <FileText className="w-4 h-4 text-[#087cf5]" /> Internal Counsellor Notes & Observations
                </h3>

                {/* Add Note Form */}
                <div className="p-3 bg-[#f8fafc] rounded-[8px] border border-[#e2e8f0] space-y-2">
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Type an internal note regarding this student (e.g. parent discussion, eligibility query, document status)..."
                    className="w-full text-[12px] p-2 border border-[#cbd5e1] rounded-[6px] bg-white outline-none focus:ring-1 focus:ring-[#087cf5] min-h-[60px]"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-[#64748b]">Category:</span>
                      {['Call Summary', 'Parent Discussion', 'Financial', 'General'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setNoteTag(cat)}
                          className={`px-2 py-0.5 rounded-[4px] text-[10.5px] font-medium transition-colors ${
                            noteTag === cat
                              ? 'bg-[#087cf5] text-white font-semibold'
                              : 'bg-white border border-[#cbd5e1] text-[#475569] hover:bg-slate-50'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleCreateNote}
                      className="px-3 py-1.5 bg-[#087cf5] hover:bg-[#076ed9] text-white rounded-[6px] text-[11.5px] font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Save Note
                    </button>
                  </div>
                </div>

                {/* Notes History */}
                <div className="space-y-2.5 divide-y divide-[#f1f5f9]">
                  {localNotes.map((nt) => (
                    <div key={nt.id} className="pt-2.5 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[#101d37]">{nt.author}</span>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-[#475569] text-[10px] font-medium">
                            {nt.tag}
                          </span>
                          <span className="text-[#64748b]">{nt.time}</span>
                        </div>
                      </div>
                      <p className="text-[11.5px] text-[#334155] leading-relaxed">{nt.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: TASKS */}
            {activeTab === 'tasks' && (
              <div className="bg-white border border-[#e2e8f0] rounded-[9px] p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-2">
                  <h3 className="text-[13px] font-bold text-[#101d37] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#087cf5]" /> Tasks for {activeLead.studentName}
                  </h3>
                </div>

                {/* Quick Add Task */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTaskInput}
                    onChange={(e) => setNewTaskInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
                    placeholder="Add a new follow-up task or reminder..."
                    className="flex-1 text-[12px] px-3 py-1.5 border border-[#cbd5e1] rounded-[6px]"
                  />
                  <button
                    onClick={handleCreateTask}
                    className="px-3 py-1.5 bg-[#087cf5] text-white rounded-[6px] text-[12px] font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Task
                  </button>
                </div>

                {/* Tasks List */}
                <div className="space-y-2">
                  {leadTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleToggleLeadTask(t.id)}
                      className={`p-2.5 rounded-[6px] border flex items-center justify-between text-[11.5px] cursor-pointer transition-colors ${
                        t.completed ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-[#e2e8f0] hover:bg-blue-50/30'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={t.completed}
                          onChange={() => handleToggleLeadTask(t.id)}
                          className="w-4 h-4 text-[#087cf5] rounded border-[#cbd5e1]"
                        />
                        <span className={t.completed ? 'line-through text-[#64748b]' : 'font-medium text-[#101d37]'}>
                          {t.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            t.priority === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {t.priority}
                        </span>
                        <span className="text-[10.5px] text-[#64748b]">{t.dueDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 7: ACTIVITY TIMELINE */}
            {activeTab === 'activity' && (
              <div className="bg-white border border-[#e2e8f0] rounded-[9px] p-4 shadow-xs space-y-3">
                <h3 className="text-[13px] font-bold text-[#101d37] flex items-center gap-1.5 border-b border-[#f1f5f9] pb-2">
                  <Clock className="w-4 h-4 text-[#087cf5]" /> Full Communication & Activity Audit Log
                </h3>
                <div className="space-y-3 relative pl-2">
                  <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-slate-200" />
                  {[
                    { time: '08 Jan 2025, 04:30 PM', action: 'Note added by Priya Singh', icon: FileText, color: 'text-[#087cf5]' },
                    { time: '08 Jan 2025, 11:00 AM', action: 'Outbound phone call completed (Duration: 18 mins)', icon: Phone, color: 'text-emerald-600' },
                    { time: '07 Jan 2025, 05:15 PM', action: 'WhatsApp brochure sent for Italy public universities', icon: MessageSquare, color: 'text-emerald-600' },
                    { time: '05 Jan 2025, 02:40 PM', action: 'Student enrolled into Premium Counseling Package', icon: UserCheck, color: 'text-purple-600' },
                    { time: '02 Jan 2025, 10:15 AM', action: 'Lead created via Google Ads campaign', icon: Globe, color: 'text-amber-500' },
                  ].map((act, idx) => {
                    const ActIcon = act.icon;
                    return (
                      <div key={idx} className="flex items-start gap-3 relative">
                        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-[#087cf5] z-10" />
                        <div className="flex-1 flex items-baseline justify-between gap-2 text-[11.5px]">
                          <span className="font-medium text-[#101d37] flex items-center gap-1.5">
                            <ActIcon className={`w-3 h-3 ${act.color}`} />
                            {act.action}
                          </span>
                          <span className="text-[10.5px] text-[#64748b] whitespace-nowrap">{act.time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Profile Summary & Widgets (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            {/* Widget 1: Profile Completion Score */}
            <div className="bg-white border border-[#e2e8f0] rounded-[9px] p-3.5 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-[12.5px] font-bold text-[#101d37]">Profile Completion</h4>
                <span className="text-[14px] font-black text-emerald-600">85%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
              </div>
              <div className="space-y-1 pt-1 text-[11px] text-[#475569]">
                <div className="flex items-center justify-between">
                  <span>Personal & Contact Info</span>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Academic History (10th, 12th, Degree)</span>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span>English Test Scores (IELTS 7.0)</span>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Document Checklist Uploads</span>
                  <span className="font-semibold text-amber-600">6 / 10</span>
                </div>
              </div>
            </div>

            {/* Widget 2: Upcoming Follow-up */}
            <div className="bg-white border border-[#e2e8f0] rounded-[9px] p-3.5 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-[12.5px] font-bold text-[#101d37]">Upcoming Follow-up</h4>
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold">
                  Scheduled
                </span>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-[6px] bg-[#fff5f5] border border-rose-100">
                <div className="w-10 h-10 rounded-md bg-white border border-rose-200 text-rose-600 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[9px] font-bold uppercase">JAN</span>
                  <span className="text-[14px] font-black leading-none">10</span>
                </div>
                <div>
                  <div className="text-[11.5px] font-bold text-[#101d37]">Follow-up with student</div>
                  <div className="text-[10.5px] text-[#64748b] mt-0.5">
                    Discuss university shortlists and application timeline.
                  </div>
                  <div className="text-[10px] text-rose-600 font-semibold mt-1">11:00 AM IST</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => showToast('Follow-up marked as completed')}
                  className="px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[5px] text-[11px] font-semibold text-center"
                >
                  Mark Completed
                </button>
                <button
                  onClick={() => onScheduleFollowUp(activeLead)}
                  className="px-2 py-1.5 bg-white border border-[#cbd5e1] hover:bg-slate-50 text-[#101d37] rounded-[5px] text-[11px] font-medium text-center"
                >
                  Reschedule
                </button>
              </div>
            </div>

            {/* Widget 3: Assigned Counsellor */}
            <div className="bg-white border border-[#e2e8f0] rounded-[9px] p-3.5 shadow-xs space-y-2">
              <h4 className="text-[12.5px] font-bold text-[#101d37]">Assigned Counsellor</h4>
              <div className="flex items-center gap-3">
                <img
                  src="/avatars/priya.png"
                  alt="Priya Singh"
                  className="w-10 h-10 aspect-square rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <div className="font-bold text-[12px] text-[#101d37]">Priya Singh</div>
                  <div className="text-[10.5px] text-[#64748b]">Senior Study Abroad Counsellor</div>
                  <div className="text-[10.5px] text-[#087cf5] font-medium">+91 87654 32109</div>
                </div>
              </div>
            </div>

            {/* Widget 4: Package & Financial Snapshot */}
            <div className="bg-white border border-[#e2e8f0] rounded-[9px] p-3.5 shadow-xs space-y-2 text-[11.5px]">
              <h4 className="text-[12.5px] font-bold text-[#101d37]">Enrollment & Payments</h4>
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-[#64748b]">Service Package</span>
                <span className="font-semibold text-[#101d37]">Premium Package</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-[#64748b]">Total Fee</span>
                <span className="font-bold text-[#101d37]">₹ 1,50,000</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-[#64748b]">Paid Amount</span>
                <span className="font-bold text-emerald-600">₹ 75,000</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-[#64748b]">Balance Amount</span>
                <span className="font-bold text-rose-600">₹ 75,000</span>
              </div>
              <div className="flex justify-between py-1 items-center">
                <span className="text-[#64748b]">Payment Status</span>
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10.5px] font-semibold border border-amber-200">
                  Partially Paid
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: LEADS DIRECTORY TABLE VIEW (Default when no lead is open)
  // -------------------------------------------------------------
  return (
    <div className="p-3.5 pb-12 space-y-3 max-w-[1536px] mx-auto select-none font-sans text-[#101d37]">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#087cf5] text-white px-4 py-2.5 rounded-lg shadow-lg text-[13px] font-medium flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Page Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-[9px] border border-[#e2e8f0] shadow-xs">
        <div>
          <h1 className="text-[17px] font-bold text-[#101d37]">Leads Directory</h1>
          <p className="text-[11.5px] text-[#64748b]">
            Managing {filtered.length} total student inquiries across all channels
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#cbd5e1] text-xs font-semibold text-[#475569] hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onAddNewLead}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[#087cf5] hover:bg-[#076ed9] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Lead</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 rounded-[9px] border border-[#e2e8f0] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name, phone, email, lead ID..."
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-[#cbd5e1] rounded-[6px] outline-none focus:ring-1 focus:ring-[#087cf5] bg-white placeholder-[#94a3b8]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="text-xs p-1.5 border border-[#cbd5e1] rounded-[6px] bg-white text-[#101d37] outline-none"
          >
            <option value="all">All Countries</option>
            <option value="Italy">🇮🇹 Italy</option>
            <option value="Germany">🇩🇪 Germany</option>
            <option value="Canada">🇨🇦 Canada</option>
            <option value="UK">🇬🇧 UK</option>
            <option value="Australia">🇦🇺 Australia</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-1.5 border border-[#cbd5e1] rounded-[6px] bg-white text-[#101d37] outline-none"
          >
            <option value="all">All Stages</option>
            <option value="New Lead">New Lead</option>
            <option value="Contacted">Contacted</option>
            <option value="Counselling">Counselling</option>
            <option value="Interested">Interested</option>
            <option value="Enrolled">Enrolled</option>
            <option value="Follow-up">Follow-up</option>
            <option value="On Hold">On Hold</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-[9px] border border-[#e2e8f0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] font-bold uppercase text-[10.5px]">
                <th className="px-3 py-2.5">Lead ID</th>
                <th className="px-3 py-2.5">Student Name</th>
                <th className="px-3 py-2.5">Country Interest</th>
                <th className="px-3 py-2.5">Course Interest</th>
                <th className="px-3 py-2.5">Source</th>
                <th className="px-3 py-2.5">Next Follow-up</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filtered.map((l) => (
                <tr
                  key={l.id}
                  onClick={() => handleOpenLead(l)}
                  className="hover:bg-[#f0f7ff] cursor-pointer transition-colors"
                >
                  <td className="px-3 py-2.5 font-mono text-[11px] font-medium text-[#64748b]">
                    {l.leadId}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-semibold text-[#101d37] hover:text-[#087cf5]">
                      {l.studentName}
                    </div>
                    <div className="text-[10.5px] text-[#64748b]">
                      {l.phone} • {l.email}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 font-medium text-[#101d37]">
                    {l.countryInterest === 'Italy' && '🇮🇹 '}
                    {l.countryInterest === 'Germany' && '🇩🇪 '}
                    {l.countryInterest === 'Canada' && '🇨🇦 '}
                    {l.countryInterest === 'UK' && '🇬🇧 '}
                    {l.countryInterest}
                  </td>
                  <td className="px-3 py-2.5 text-[#475569] truncate max-w-xs">
                    {l.courseInterest}
                  </td>
                  <td className="px-3 py-2.5 text-[#64748b]">{l.leadSource}</td>
                  <td className="px-3 py-2.5 text-rose-600 font-semibold whitespace-nowrap">
                    {l.nextFollowUp}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10.5px] font-semibold ${
                        l.status === 'Enrolled'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : l.status === 'Counselling'
                          ? 'bg-blue-50 text-[#087cf5] border border-blue-200'
                          : l.status === 'New Lead'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td
                    className="px-3 py-2.5 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenLead(l)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-50 text-[#087cf5] border border-[#cbd5e1] rounded-[5px] text-[11px] font-semibold flex items-center gap-1 shadow-2xs"
                      >
                        <ExternalLink className="w-3 h-3" /> View Details
                      </button>
                      <button
                        onClick={() => onOpenPhone(l)}
                        className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200"
                        title="Call"
                      >
                        <Phone className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onOpenWhatsApp(l)}
                        className="p-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white"
                        title="WhatsApp"
                      >
                        <MessageSquare className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onScheduleFollowUp(l)}
                        className="p-1 rounded bg-white hover:bg-slate-50 text-amber-600 border border-[#cbd5e1]"
                        title="Schedule Follow-up"
                      >
                        <Calendar className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onEditLead(l)}
                        className="p-1 rounded hover:bg-slate-100 text-slate-500"
                        title="Edit"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDeleteLead(l)}
                        className="p-1 rounded hover:bg-rose-50 text-rose-500"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
