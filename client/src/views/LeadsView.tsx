import React, { useState } from 'react';
import { Lead } from '../types/crm';
import { LEAD_STATUS_OPTIONS } from '../utils/statuses';
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
  FileSpreadsheet,
  Receipt,
  Percent,
  X,
} from 'lucide-react';
import { ActionConfirmModal } from '../components/modals/ActionConfirmModal';
import {
  StudentPaymentPlan,
  PaymentInstallment,
  fetchStudentPayments,
  saveStudentPaymentPlan,
  savePaymentInstallment,
  deletePaymentInstallment,
} from '../services/api';

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
  onBookCounsellingSession?: (lead: Lead) => void;
  onUpdateStatus?: (leadId: string, status: string) => void;
  onAddNote?: (leadId: string, note: string) => void;
  initialStatusFilter?: string;
  statusCounts?: Record<string, number>;
  onNavigate?: (route: string) => void;
  showAddButton?: boolean;
  onOpenMetaSheetModal?: (options?: { viewOnly?: boolean }) => void;
  showConvertActions?: boolean;
  showFullPipeline?: boolean;
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
  onBookCounsellingSession,
  onUpdateStatus,
  onAddNote,
  initialStatusFilter = 'all',
  statusCounts,
  onNavigate,
  onOpenMetaSheetModal,
  showAddButton = true,
  showConvertActions = true,
  showFullPipeline = true,
}) => {
  // Navigation & View Mode
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'academic' | 'test' | 'counselling' | 'notes' | 'tasks' | 'activity' | 'payments'
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

  // Keep the open student in sync with refreshed lead data (e.g. a newly booked session)
  React.useEffect(() => {
    if (!activeLead) return;
    const fresh = leads.find((l) => l.id === activeLead.id || l.leadId === activeLead.leadId);
    if (fresh && fresh !== activeLead) setActiveLead(fresh);
  }, [leads]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);

  // Route-driven status sections (New Leads, Contacted, Counselling, Interested)
  // update the filter when the counsellor switches sidebar section.
  React.useEffect(() => {
    setStatusFilter(initialStatusFilter || 'all');
  }, [initialStatusFilter]);

  // Switching sections must also close any open student profile. Otherwise the
  // previous student stays on screen while the sidebar highlights the new section.
  React.useEffect(() => {
    setActiveLead(null);
  }, [initialStatusFilter]);

  // Note creator state
  const [noteContent, setNoteContent] = useState('');
  const [noteTag, setNoteTag] = useState('Call Summary');
  const [localNotes, setLocalNotes] = useState<
    Array<{ id: string; author: string; time: string; tag: string; text: string }>
  >([]);

  // Tasks state
  const [leadTasks, setLeadTasks] = useState<
    Array<{ id: string; title: string; dueDate: string; priority: string; completed: boolean }>
  >([]);
  const [newTaskInput, setNewTaskInput] = useState('');

  // Sync notes & tasks with activeLead
  React.useEffect(() => {
    if (activeLead) {
      if (activeLead.notes && activeLead.notes.trim()) {
        setLocalNotes([
          {
            id: 'note-reg',
            author: activeLead.counsellor?.name ? `${activeLead.counsellor.name} (Counsellor)` : 'Registration Desk',
            time: activeLead.lastActivity || 'Registration',
            tag: 'General',
            text: activeLead.notes,
          },
        ]);
      } else {
        setLocalNotes([]);
      }

      if (activeLead.tasks && activeLead.tasks.length > 0) {
        setLeadTasks(
          activeLead.tasks.map((t) => ({
            id: t.id,
            title: t.title,
            dueDate: t.dueDate || t.time || 'Upcoming',
            priority: t.priority || 'Medium',
            completed: t.completed,
          }))
        );
      } else {
        setLeadTasks([]);
      }
    } else {
      setLocalNotes([]);
      setLeadTasks([]);
    }
  }, [activeLead]);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Payments State & Handlers
  const [paymentPlan, setPaymentPlan] = useState<StudentPaymentPlan | null>(null);
  const [paymentInstallmentsList, setPaymentInstallmentsList] = useState<PaymentInstallment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [editingInstallment, setEditingInstallment] = useState<PaymentInstallment | null>(null);
  const [paymentToast, setPaymentToast] = useState<string | null>(null);

  const [installmentForm, setInstallmentForm] = useState({
    installment_number: 1,
    title: '',
    amount: '',
    gst_rate: 18,
    gst_type: 'With GST (18%)',
    payment_mode: 'UPI',
    transaction_ref: '',
    receipt_no: '',
    payment_date: new Date().toISOString().slice(0, 10),
    due_date: '',
    status: 'Paid',
    notes: '',
  });

  const [planForm, setPlanForm] = useState({
    plan_name: 'Comprehensive Study Abroad Service Package',
    agreed_budget: '',
    total_package_fee: '',
    installment_count: 2,
    gst_included: true,
    gst_percentage: 18,
    currency: 'INR',
    notes: '',
  });

  const loadPayments = React.useCallback(async (leadItem: Lead) => {
    if (!leadItem) return;
    setPaymentsLoading(true);
    try {
      const key = leadItem.leadId || leadItem.id;
      const res = await fetchStudentPayments(key);
      if (res.success && res.data) {
        setPaymentPlan(res.data.payments);
        setPaymentInstallmentsList(res.data.installments || []);
        if (res.data.payments) {
          setPlanForm({
            plan_name: res.data.payments.plan_name || 'Comprehensive Study Abroad Service Package',
            agreed_budget: res.data.payments.agreed_budget || leadItem.budget || '€ 18,000 / yr',
            total_package_fee: String(res.data.payments.total_package_fee || ''),
            installment_count: res.data.payments.installment_count || 2,
            gst_included: Boolean(res.data.payments.gst_included),
            gst_percentage: res.data.payments.gst_percentage || 18,
            currency: res.data.payments.currency || 'INR',
            notes: res.data.payments.notes || '',
          });
        }
      }
    } catch (err) {
      console.error('Error loading student payments:', err);
    } finally {
      setPaymentsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (activeLead) {
      loadPayments(activeLead);
    }
  }, [activeLead, loadPayments]);

  const handleOpenAddInstallment = () => {
    const nextNum = paymentInstallmentsList.length + 1;
    setEditingInstallment(null);
    setInstallmentForm({
      installment_number: nextNum,
      title: `${nextNum === 1 ? '1st' : nextNum === 2 ? '2nd' : nextNum === 3 ? '3rd' : `${nextNum}th`} Installment - Service Fee`,
      amount: '',
      gst_rate: 18,
      gst_type: 'With GST (18%)',
      payment_mode: 'UPI',
      transaction_ref: '',
      receipt_no: `REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      payment_date: new Date().toISOString().slice(0, 10),
      due_date: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      status: 'Paid',
      notes: '',
    });
    setShowAddPaymentModal(true);
  };

  const handleOpenEditInstallment = (inst: PaymentInstallment) => {
    setEditingInstallment(inst);
    setInstallmentForm({
      installment_number: inst.installment_number,
      title: inst.title,
      amount: String(inst.amount),
      gst_rate: inst.gst_rate ?? 18,
      gst_type: inst.gst_type || 'With GST (18%)',
      payment_mode: inst.payment_mode || 'UPI',
      transaction_ref: inst.transaction_ref || '',
      receipt_no: inst.receipt_no || '',
      payment_date: inst.payment_date || new Date().toISOString().slice(0, 10),
      due_date: inst.due_date || '',
      status: inst.status || 'Paid',
      notes: inst.notes || '',
    });
    setShowAddPaymentModal(true);
  };

  const handleOpenEditPlan = () => {
    if (paymentPlan) {
      setPlanForm({
        plan_name: paymentPlan.plan_name || 'Comprehensive Study Abroad Service Package',
        agreed_budget: paymentPlan.agreed_budget || activeLead?.budget || '€ 18,000 / yr',
        total_package_fee: String(paymentPlan.total_package_fee || ''),
        installment_count: paymentPlan.installment_count || 2,
        gst_included: Boolean(paymentPlan.gst_included),
        gst_percentage: paymentPlan.gst_percentage || 18,
        currency: paymentPlan.currency || 'INR',
        notes: paymentPlan.notes || '',
      });
    } else if (activeLead) {
      setPlanForm({
        plan_name: 'Comprehensive Study Abroad Service Package',
        agreed_budget: activeLead.budget || '€ 18,000 / yr',
        total_package_fee: '60000',
        installment_count: 2,
        gst_included: true,
        gst_percentage: 18,
        currency: 'INR',
        notes: `Student onboarded with budget ${activeLead.budget}`,
      });
    }
    setShowEditPlanModal(true);
  };

  const handleSaveInstallment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead) return;
    const key = activeLead.leadId || activeLead.id;
    const baseAmt = parseFloat(installmentForm.amount) || 0;
    const gstRate = installmentForm.gst_type.includes('With GST') ? Number(installmentForm.gst_rate) : 0;
    const gstAmount = gstRate > 0 ? (baseAmt * gstRate) / 100 : 0;
    const totalAmount = baseAmt + gstAmount;

    try {
      const payload: Partial<PaymentInstallment> = {
        id: editingInstallment ? editingInstallment.id : undefined,
        installment_number: Number(installmentForm.installment_number) || 1,
        title: installmentForm.title || `Installment ${installmentForm.installment_number}`,
        amount: baseAmt,
        gst_rate: gstRate,
        gst_type: installmentForm.gst_type,
        gst_amount: gstAmount,
        total_amount: totalAmount,
        payment_date: installmentForm.status === 'Paid' ? (installmentForm.payment_date || new Date().toISOString().slice(0, 10)) : null,
        due_date: installmentForm.due_date || null,
        payment_mode: installmentForm.payment_mode,
        transaction_ref: installmentForm.transaction_ref,
        receipt_no: installmentForm.receipt_no,
        status: installmentForm.status,
        collected_by: activeLead.counsellor?.name || 'Assigned Counsellor',
        notes: installmentForm.notes,
      };

      const res = await savePaymentInstallment(key, payload);
      if (res.success) {
        setPaymentToast('Payment installment recorded and saved in SQLite database.');
        setTimeout(() => setPaymentToast(null), 3500);
        setShowAddPaymentModal(false);
        setEditingInstallment(null);
        await loadPayments(activeLead);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save installment');
    }
  };

  const handleDeleteInstallment = async (installmentId: string) => {
    if (!activeLead) return;
    if (!window.confirm('Delete this installment record from SQLite database?')) return;
    const key = activeLead.leadId || activeLead.id;
    try {
      const res = await deletePaymentInstallment(key, installmentId);
      if (res.success) {
        setPaymentToast('Installment removed from database.');
        setTimeout(() => setPaymentToast(null), 3500);
        await loadPayments(activeLead);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete installment');
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead) return;
    const key = activeLead.leadId || activeLead.id;
    const fee = parseFloat(planForm.total_package_fee) || 0;
    const gstPct = planForm.gst_included ? Number(planForm.gst_percentage) : 0;
    const gstAmt = gstPct > 0 ? (fee * gstPct) / 100 : 0;

    try {
      const payload: Partial<StudentPaymentPlan> = {
        plan_name: planForm.plan_name,
        agreed_budget: planForm.agreed_budget || activeLead.budget || '€ 18,000 / yr',
        total_package_fee: fee,
        installment_count: Number(planForm.installment_count) || 2,
        gst_included: planForm.gst_included ? 1 : 0,
        gst_percentage: gstPct,
        gst_amount: gstAmt,
        currency: planForm.currency,
        notes: planForm.notes,
      };

      const res = await saveStudentPaymentPlan(key, payload);
      if (res.success) {
        setPaymentToast('Payment plan & incoming budget updated in SQLite database.');
        setTimeout(() => setPaymentToast(null), 3500);
        setShowEditPlanModal(false);
        await loadPayments(activeLead);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update payment plan');
    }
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

  // Status sections requested by the counsellor: New Leads, Contacted,
  // Counselling, Interested and Enrolled. Enrolled is a hand-off shortcut to
  // the dedicated Enrolled Students section.
  const statusTabs: Array<{ id: string; label: string; count?: number; route?: string }> = [
    { id: 'all', label: 'All Active', count: statusCounts?.myLeads ?? leads.length },
    { id: 'Contacted', label: 'Contacted', count: statusCounts?.contacted ?? leads.filter((l) => l.status === 'Contacted').length },
    { id: 'Counselling', label: 'Counselling', count: statusCounts?.counselling ?? leads.filter((l) => l.status === 'Counselling').length },
    { id: 'Interested', label: 'Interested', count: statusCounts?.interested ?? leads.filter((l) => l.status === 'Interested').length },
    { id: 'On Hold', label: 'On Hold', count: statusCounts?.onHold ?? leads.filter((l) => l.status === 'On Hold').length },
    { id: 'Drop', label: 'Drop', count: statusCounts?.drop ?? leads.filter((l) => l.status === 'Drop').length },
    { id: 'Enrolled', label: 'Enrolled', count: statusCounts?.enrolled, route: 'students' },
  ];

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

  // Status change confirmation modal state
  const [confirmModalData, setConfirmModalData] = useState<{
    isOpen: boolean;
    newStatus: string;
    title: string;
    description: string;
    variant: 'primary' | 'success' | 'warning' | 'danger';
    onConfirm: () => void;
  } | null>(null);

  // Change status
  const handleStatusChange = (newStatus: string) => {
    if (!activeLead || newStatus === activeLead.status) return;

    setConfirmModalData({
      isOpen: true,
      newStatus,
      title: `Update Lead Status to "${newStatus}"?`,
      description: `Are you sure you want to transition ${activeLead.studentName} from "${activeLead.status}" to "${newStatus}"? This will update the lead lifecycle stage across all counselor records.`,
      variant:
        newStatus === 'Enrolled'
          ? 'success'
          : newStatus === 'Drop' || newStatus === 'Lost'
            ? 'danger'
            : newStatus === 'On Hold'
              ? 'warning'
              : 'primary',
      onConfirm: () => {
        const updated = { ...activeLead, status: newStatus };
        setActiveLead(updated);
        if (onUpdateStatus) onUpdateStatus(activeLead.id, newStatus);
        showToast(`Lead status updated to '${newStatus}'`);
        setConfirmModalData(null);
      },
    });
  };

  // Workflow stages definition. On Hold / Drop are exception stages that only
  // appear when selected, and only the selected one is shown before Enrolled.
  const exceptionStage =
    activeLead?.status === 'On Hold'
      ? { key: 'On Hold', label: 'On Hold' }
      : activeLead?.status === 'Drop'
        ? { key: 'Drop', label: 'Drop' }
        : null;

  const fullStages = [
    { key: 'New Lead', label: 'New Lead' },
    { key: 'Contacted', label: 'Contacted' },
    { key: 'Counselling', label: 'Counselling' },
    { key: 'Interested', label: 'Interested' },
    ...(exceptionStage ? [exceptionStage] : []),
    { key: 'Enrolled', label: 'Enrolled' },
    { key: 'Transferred', label: 'Transferred to Docs' },
    { key: 'Application', label: 'Application' },
  ];

  const stages = (showFullPipeline ? fullStages : fullStages.slice(0, exceptionStage ? 6 : 5)).map(
    (stage, index) => ({ ...stage, label: `${index + 1}. ${stage.label}` })
  );

  const getStageIndex = (stage: string) => {
    const normalizedStage =
      stage === 'University Matching' || stage === 'Shortlisting' || stage === 'Follow-up'
        ? 'Interested'
        : stage === 'Approval'
          ? 'Enrolled'
          : stage === 'Documentation'
            ? 'Transferred'
            : stage === 'Offer'
              ? 'Application'
              : stage;
    const index = stages.findIndex((item) => item.key === normalizedStage);
    return index >= 0 ? index : 1;
  };

  // -------------------------------------------------------------
  // VIEW 1: EXPANDED LEAD DETAIL VIEW (When a lead is selected)
  // -------------------------------------------------------------
  if (activeLead) {
    const stageIdx = Math.min(getStageIndex(activeLead.status), stages.length - 1);

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
              <span>Back to My Students</span>
            </button>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            <div className="text-[12px] text-[#64748b] hidden sm:flex items-center gap-1.5">
              <span>My Students</span>
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

            {showConvertActions && (
              <button
                onClick={() => onEnrollLead(activeLead)}
                className="px-2.5 py-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-[6px] text-[11.5px] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Convert Student</span>
              </button>
            )}

            {showConvertActions && onTransferDocs && (
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
              {activeLead.avatarUrl ? (
                <img
                  src={activeLead.avatarUrl}
                  alt={activeLead.studentName}
                  onClick={() => onEditLead(activeLead)}
                  title="Click to edit profile picture"
                  className="w-14 h-14 aspect-square rounded-full object-cover border-2 border-slate-200 shadow-xs shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                />
              ) : (
                <div
                  onClick={() => onEditLead(activeLead)}
                  title="Click to upload profile picture"
                  className="w-14 h-14 aspect-square rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center text-[#087cf5] font-bold text-lg shadow-xs shrink-0 cursor-pointer hover:bg-blue-200/80 transition-colors"
                >
                  {activeLead.studentName ? activeLead.studentName.slice(0, 2).toUpperCase() : 'ST'}
                </div>
              )}
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
                      className={`text-[11.5px] font-semibold rounded-md px-2 py-0.5 outline-none focus:ring-1 focus:ring-[#087cf5] cursor-pointer border ${
                        activeLead.status === 'On Hold' || activeLead.status === 'Drop'
                          ? 'bg-rose-50 border-rose-200 text-rose-700'
                          : 'bg-slate-50 border-[#cbd5e1] text-[#101d37]'
                      }`}
                    >
                      {LEAD_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
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
              {/* Connector line — spans from the first circle center to the last */}
              <div className="absolute top-3 left-3 right-3 h-0.5 bg-slate-200 z-0" />
              <div
                className="absolute top-3 left-3 h-0.5 bg-[#087cf5] z-0 transition-all duration-300"
                style={{
                  width: `calc((100% - 24px) * ${stageIdx / Math.max(stages.length - 1, 1)})`,
                }}
              />

              <div className="relative z-10 flex justify-between items-start text-center">
                {stages.map((stg, idx) => {
                  const isDone = idx < stageIdx;
                  const isCurrent = idx === stageIdx;
                  const isExceptionStatus = stg.key === 'On Hold' || stg.key === 'Drop';
                  return (
                    <div
                      key={stg.key}
                      onClick={() => handleStatusChange(stg.key)}
                      className="flex flex-col items-center cursor-pointer group"
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                          isExceptionStatus
                            ? isCurrent
                              ? 'bg-rose-100 text-rose-700 border-2 border-rose-300 ring-4 ring-rose-100 shadow-xs'
                              : isDone
                                ? 'bg-rose-50 text-rose-600 border-2 border-rose-200'
                                : 'bg-rose-50/70 text-rose-500 border-2 border-rose-200 group-hover:border-rose-300'
                            : isCurrent
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
                          isExceptionStatus
                            ? isCurrent
                              ? 'font-bold text-rose-700'
                              : isDone
                                ? 'font-semibold text-rose-600'
                                : 'font-medium text-rose-600'
                            : isCurrent
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

        {/* 8-Tab Navigation Bar */}
        <div className="bg-white border border-[#e2e8f0] rounded-[9px] px-3 shadow-xs flex gap-5 overflow-x-auto text-[12px] font-medium">
          {[
            { id: 'overview', label: 'Overview & Contacts', icon: User },
            { id: 'academic', label: 'Academic Profile', icon: GraduationCap },
            { id: 'test', label: 'Test Scores (IELTS)', icon: Award },
            { id: 'counselling', label: 'Counselling Sessions', icon: BookOpen },
            { id: 'notes', label: `Notes (${localNotes.length})`, icon: FileText },
            { id: 'tasks', label: `Tasks (${leadTasks.length})`, icon: CheckCircle2 },
            { id: 'activity', label: 'Activity Timeline', icon: Clock },
            { id: 'payments', label: 'Payments', icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 whitespace-nowrap border-b-2 flex items-center gap-1.5 transition-colors ${isActive
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
                        {activeLead.dob || 'Not provided yet'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Gender</span>
                      <span className="font-semibold text-[#101d37]">
                        {activeLead.dob ? 'Recorded' : 'Not specified'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Nationality</span>
                      <span className="font-semibold text-[#101d37]">
                        {activeLead.nationality || 'Not specified'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Passport Status</span>
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-medium">
                        Pending Document Upload
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">City & State</span>
                      <span className="font-semibold text-[#101d37]">
                        {activeLead.preferredCity || activeLead.address || 'Not specified'}
                      </span>
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
                      <span className="font-medium text-[#64748b]">Not provided yet</span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Email Address</span>
                      <span className="font-semibold text-[#087cf5] hover:underline cursor-pointer">
                        {activeLead.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Preferred Contact Time</span>
                      <span className="font-semibold text-[#101d37]">
                        {activeLead.nextFollowUpTime ? `${activeLead.nextFollowUpTime} IST` : 'Anytime'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Preferred Language</span>
                      <span className="font-semibold text-[#101d37]">English</span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Permanent Address</span>
                      <span className="font-medium text-[#475569]">
                        {activeLead.address || activeLead.preferredCity || 'Not entered yet'}
                      </span>
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
                      <span className="font-semibold text-[#101d37]">{activeLead.countryInterest}</span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Target Course / Major</span>
                      <span className="font-semibold text-[#101d37]">{activeLead.courseInterest}</span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Target Intake</span>
                      <span className="font-semibold text-[#101d37]">{activeLead.intake || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Preferred Cities</span>
                      <span className="font-semibold text-[#101d37]">
                        {activeLead.preferredCity || 'Open to all cities'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">University Type</span>
                      <span className="font-semibold text-[#101d37]">
                        {activeLead.universityType || 'Public / Private'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Estimated Budget</span>
                      <span className="font-semibold text-emerald-700">
                        {activeLead.budget || 'Not specified'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Scholarship Interest</span>
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-[#475569] text-[10px] font-medium">
                        Assessment Pending
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748b] block text-[10.5px]">Accommodation Preference</span>
                      <span className="font-medium text-[#64748b]">To be finalized</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ACADEMIC PROFILE */}
            {activeTab === 'academic' && (
              <div className="space-y-3">
                <div className="bg-white border border-[#e2e8f0] rounded-[9px] p-3.5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-2">
                    <h3 className="text-[13px] font-bold text-[#101d37] flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-[#087cf5]" /> Educational Background
                    </h3>
                    <button
                      onClick={() => onEditLead(activeLead)}
                      className="text-[11px] text-[#087cf5] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Edit2 className="w-3 h-3" /> Edit Academic Info
                    </button>
                  </div>

                  {activeLead.tenthPercentage || activeLead.twelfthPercentage || activeLead.graduationDegree ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* 10th */}
                      <div className="p-3 rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc] space-y-1">
                        <div className="text-[11px] font-bold text-[#101d37]">10th Standard (SSC)</div>
                        <div className="text-[18px] font-bold text-emerald-600">
                          {activeLead.tenthPercentage || 'Pending'}
                        </div>
                        <div className="text-[11px] text-[#64748b]">
                          Board: {activeLead.tenthBoard || 'State / CBSE'} {activeLead.tenthYear ? `• Year: ${activeLead.tenthYear}` : ''}
                        </div>
                      </div>

                      {/* 12th */}
                      <div className="p-3 rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc] space-y-1">
                        <div className="text-[11px] font-bold text-[#101d37]">12th Standard (HSC)</div>
                        <div className="text-[18px] font-bold text-emerald-600">
                          {activeLead.twelfthPercentage || 'Pending'}
                        </div>
                        <div className="text-[11px] text-[#64748b]">
                          Board: {activeLead.twelfthBoard || 'State / CBSE'} {activeLead.twelfthYear ? `• Year: ${activeLead.twelfthYear}` : ''}
                        </div>
                      </div>

                      {/* Bachelor */}
                      <div className="p-3 rounded-[8px] border border-[#bfdbfe] bg-[#eff6ff] space-y-1">
                        <div className="text-[11px] font-bold text-[#087cf5]">Undergraduate Degree</div>
                        <div className="text-[18px] font-bold text-[#087cf5]">
                          {activeLead.graduationCgpa || 'Pending'}
                        </div>
                        <div className="text-[11px] text-[#1e40af] font-medium">
                          {activeLead.graduationDegree || 'Degree Details Pending'}
                        </div>
                        <div className="text-[10.5px] text-[#475569]">
                          {activeLead.graduationUniversity || ''} {activeLead.graduationYear ? `(${activeLead.graduationYear})` : ''}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-[#f8fafc] rounded-[8px] border border-dashed border-[#cbd5e1] space-y-2">
                      <GraduationCap className="w-8 h-8 text-[#94a3b8] mx-auto" />
                      <div className="text-[13px] font-bold text-[#101d37]">No Academic Records Entered Yet</div>
                      <p className="text-[11.5px] text-[#64748b] max-w-md mx-auto">
                        This student profile currently has no 10th, 12th, or graduation records entered. Other team portals (Documentation & University Shortlisting) will verify and populate academic records once transcripts are submitted.
                      </p>
                      <button
                        onClick={() => onEditLead(activeLead)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#087cf5] text-white rounded-[6px] text-[11px] font-semibold hover:bg-[#076ed9] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Academic Details
                      </button>
                    </div>
                  )}

                  {/* Academic Integrity & Flags */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#f1f5f9] text-[11.5px]">
                    <div className="bg-[#f8fafc] p-2 rounded-[6px] border border-[#e2e8f0]">
                      <div className="text-[10px] text-[#64748b] font-medium">Active Backlogs</div>
                      <div className="font-bold text-[#101d37] text-[13px]">
                        {activeLead.backlogs || 'None (0)'}
                      </div>
                    </div>
                    <div className="bg-[#f8fafc] p-2 rounded-[6px] border border-[#e2e8f0]">
                      <div className="text-[10px] text-[#64748b] font-medium">Historic Backlogs</div>
                      <div className="font-bold text-[#101d37] text-[13px]">
                        {activeLead.backlogs ? 'Reported' : '0'}
                      </div>
                    </div>
                    <div className="bg-[#f8fafc] p-2 rounded-[6px] border border-[#e2e8f0]">
                      <div className="text-[10px] text-[#64748b] font-medium">Education Gap</div>
                      <div className="font-bold text-[#101d37] text-[13px]">
                        {activeLead.educationGaps || 'None (Direct Entry)'}
                      </div>
                    </div>
                    <div className="bg-[#f8fafc] p-2 rounded-[6px] border border-[#e2e8f0]">
                      <div className="text-[10px] text-[#64748b] font-medium">Work Experience</div>
                      <div className="font-bold text-[#101d37] text-[13px]">
                        Pending Verification
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TEST SCORES (IELTS) */}
            {activeTab === 'test' && (
              <div className="space-y-3">
                <div className="bg-white border border-[#e2e8f0] rounded-[9px] p-3.5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-2">
                    <h3 className="text-[13px] font-bold text-[#101d37] flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#087cf5]" /> English Proficiency & Standardized Tests
                    </h3>
                    <button
                      onClick={() => onEditLead(activeLead)}
                      className="text-[11px] text-[#087cf5] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Edit2 className="w-3 h-3" /> {activeLead.testOverallScore || activeLead.testType ? 'Edit Test Scores' : '+ Add Test Scores'}
                    </button>
                  </div>

                  {activeLead.testOverallScore || activeLead.testType ? (
                    <div className="space-y-3">
                      {/* Hero Score Banner */}
                      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-slate-50 border border-blue-200 rounded-[8px] p-3.5 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-[#087cf5] text-white flex flex-col items-center justify-center font-bold shadow-xs shrink-0">
                            <span className="text-[16px] leading-tight font-black">{activeLead.testOverallScore || 'N/A'}</span>
                            <span className="text-[9px] uppercase tracking-wider opacity-90">Band</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[14px] text-[#101d37]">
                                {activeLead.testType || 'IELTS'} Academic
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                {activeLead.testResultStatus || 'Qualified'}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#64748b] mt-0.5 flex items-center gap-2">
                              <span>Exam Date: <strong className="text-[#101d37]">{activeLead.testDate || 'Recorded'}</strong></span>
                              <span>•</span>
                              <span>TRF Reference: <strong className="font-mono text-[#101d37]">IELTS-{activeLead.leadId?.replace(/\D/g, '') || '2026'}</strong></span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10.5px] text-[#64748b] block">Language Validity</span>
                          <span className="text-[11.5px] font-semibold text-emerald-600">Valid for 2026/27 Admissions</span>
                        </div>
                      </div>

                      {/* 4 Section Band Breakdown */}
                      <div>
                        <div className="text-[11.5px] font-bold text-[#101d37] mb-2 flex items-center justify-between">
                          <span>Component Band Breakdown</span>
                          <span className="text-[10.5px] font-normal text-[#64748b]">Minimum 6.0 recommended per sub-band</span>
                        </div>
                        {(() => {
                          const details = activeLead.testScoresDetails || '';
                          const getBand = (section: string, fallback: string) => {
                            const match = details.match(new RegExp(`${section}:?\\s*([0-9.]+)`, 'i'));
                            return match ? match[1] : fallback;
                          };
                          const listening = getBand('Listening', activeLead.testOverallScore || '7.5');
                          const reading = getBand('Reading', activeLead.testOverallScore || '7.0');
                          const writing = getBand('Writing', activeLead.testOverallScore || '6.5');
                          const speaking = getBand('Speaking', activeLead.testOverallScore || '7.0');

                          const sections = [
                            { name: 'Listening', score: listening },
                            { name: 'Reading', score: reading },
                            { name: 'Writing', score: writing },
                            { name: 'Speaking', score: speaking },
                          ];

                          return (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                              {sections.map((sec) => {
                                const num = parseFloat(sec.score) || 7.0;
                                const pct = Math.min(Math.round((num / 9.0) * 100), 100);
                                return (
                                  <div key={sec.name} className="p-2.5 rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc] space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-medium text-[#64748b]">{sec.name}</span>
                                      <span className="text-[13px] font-bold text-[#101d37]">{sec.score}</span>
                                    </div>
                                    <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all duration-300 ${num >= 7.0 ? 'bg-emerald-500' : num >= 6.0 ? 'bg-blue-500' : 'bg-amber-500'
                                          }`}
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                    <span className="text-[9.5px] text-[#64748b] block text-right font-medium">
                                      {num >= 6.5 ? 'Direct Admit' : 'Meets Threshold'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Destination Eligibility Evaluation */}
                      <div className="pt-2 border-t border-[#f1f5f9] space-y-2">
                        <div className="text-[11.5px] font-bold text-[#101d37]">Destination Eligibility Evaluation</div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                          <div className="p-2 rounded-[6px] border border-emerald-200 bg-emerald-50/50 flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <div>
                              <div className="font-bold text-[#101d37]">🇮🇹 Italy (Polimi, Sapienza, Padova)</div>
                              <div className="text-[10px] text-[#64748b] mt-0.5">Threshold: 6.0 • Meets English criteria for visa & university</div>
                            </div>
                          </div>
                          <div className="p-2 rounded-[6px] border border-emerald-200 bg-emerald-50/50 flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <div>
                              <div className="font-bold text-[#101d37]">🇩🇪 Germany (TUM, RWTH, Berlin)</div>
                              <div className="text-[10px] text-[#64748b] mt-0.5">Threshold: 6.5 • Direct English pathway eligible</div>
                            </div>
                          </div>
                          <div className="p-2 rounded-[6px] border border-blue-200 bg-blue-50/40 flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#087cf5] mt-0.5 shrink-0" />
                            <div>
                              <div className="font-bold text-[#101d37]">🇬🇧 United Kingdom & Ireland</div>
                              <div className="text-[10px] text-[#64748b] mt-0.5">Threshold: 6.5 overall • Ready for university shortlisting</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Clean empty state when candidate has no test scores recorded yet */
                    <div className="p-6 text-center bg-[#f8fafc] rounded-[8px] border border-dashed border-[#cbd5e1] space-y-3">
                      <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 text-[#087cf5] flex items-center justify-center mx-auto shadow-2xs">
                        <Award className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-[13px] font-bold text-[#101d37]">No English Proficiency Test Added Yet</div>
                        <p className="text-[11.5px] text-[#64748b] max-w-md mx-auto leading-relaxed">
                          This candidate has not recorded official scores for IELTS, TOEFL, PTE, or Duolingo yet. Most European universities require a minimum band of 6.0–6.5 or a Medium of Instruction (MOI) English certificate.
                        </p>
                      </div>

                      <div className="pt-1">
                        <button
                          onClick={() => onEditLead(activeLead)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#087cf5] text-white rounded-[6px] text-[11.5px] font-semibold hover:bg-[#076ed9] transition-colors shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" /> + Add Test Scores (IELTS / PTE / TOEFL)
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 max-w-2xl mx-auto text-left text-[11px]">
                        <div className="p-2.5 rounded-[6px] bg-white border border-[#e2e8f0]">
                          <div className="font-bold text-[#101d37]">IELTS Academic</div>
                          <div className="text-[10px] text-[#64748b] mt-0.5">Universal acceptance across Italy, Germany, UK & Ireland. Minimum 6.0 recommended.</div>
                        </div>
                        <div className="p-2.5 rounded-[6px] bg-white border border-[#e2e8f0]">
                          <div className="font-bold text-[#101d37]">MOI English Waiver</div>
                          <div className="text-[10px] text-[#64748b] mt-0.5">Accepted by select Italian universities if bachelor degree was taught 100% in English.</div>
                        </div>
                        <div className="p-2.5 rounded-[6px] bg-white border border-[#e2e8f0]">
                          <div className="font-bold text-[#101d37]">PTE / Duolingo / TOEFL</div>
                          <div className="text-[10px] text-[#64748b] mt-0.5">Fast-track computer-delivered alternatives accepted by hundreds of institutions.</div>
                        </div>
                      </div>
                    </div>
                  )}
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
                    onClick={() => (onBookCounsellingSession || onScheduleFollowUp)(activeLead)}
                    className="px-2.5 py-1 bg-[#087cf5] text-white rounded-[5px] text-[11px] font-semibold flex items-center gap-1 hover:bg-[#076ed9] transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Book New Session
                  </button>
                </div>

                {activeLead.counsellingSessions && activeLead.counsellingSessions.length > 0 ? (
                  <div className="space-y-2.5">
                    {activeLead.counsellingSessions.map((cs, idx) => (
                      <div key={cs.id || idx} className="p-3 bg-[#f8fafc] rounded-[8px] border border-[#e2e8f0] space-y-2 text-[11.5px]">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-[#101d37]">Session: {cs.counsellorName}</div>
                          <span className="text-[10.5px] text-[#64748b]">{cs.date} • {cs.time}</span>
                        </div>
                        <div className="text-[#475569] leading-relaxed">{cs.notes}</div>
                        {cs.recommendations && (
                          <div className="p-2 bg-blue-50 border border-blue-200 rounded-[5px] text-[11px] text-[#1e40af]">
                            <strong>Agreed Action Items:</strong> {cs.recommendations}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center bg-[#f8fafc] rounded-[8px] border border-dashed border-[#cbd5e1] space-y-2">
                    <BookOpen className="w-8 h-8 text-[#94a3b8] mx-auto" />
                    <div className="text-[13px] font-bold text-[#101d37]">No Counselling Sessions Recorded Yet</div>
                    <p className="text-[11.5px] text-[#64748b] max-w-md mx-auto">
                      Schedule an advisory session with {activeLead.studentName} to explore university options and discuss admission strategy.
                    </p>
                    <button
                      onClick={() => (onBookCounsellingSession || onScheduleFollowUp)(activeLead)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#087cf5] text-white rounded-[6px] text-[11px] font-semibold hover:bg-[#076ed9] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Book First Session
                    </button>
                  </div>
                )}
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
                          className={`px-2 py-0.5 rounded-[4px] text-[10.5px] font-medium transition-colors ${noteTag === cat
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
                {localNotes.length > 0 ? (
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
                ) : (
                  <div className="p-4 text-center text-[11.5px] text-[#64748b] bg-white rounded border border-dashed border-[#e2e8f0]">
                    No internal notes recorded yet for this profile.
                  </div>
                )}
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
                {leadTasks.length > 0 ? (
                  <div className="space-y-2">
                    {leadTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => handleToggleLeadTask(t.id)}
                        className={`p-2.5 rounded-[6px] border flex items-center justify-between text-[11.5px] cursor-pointer transition-colors ${t.completed ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-[#e2e8f0] hover:bg-blue-50/30'
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
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${t.priority === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-700'
                              }`}
                          >
                            {t.priority}
                          </span>
                          <span className="text-[10.5px] text-[#64748b]">{t.dueDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-[11.5px] text-[#64748b] bg-white rounded border border-dashed border-[#e2e8f0]">
                    No follow-up tasks currently assigned for this student.
                  </div>
                )}
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
                  {activeLead.activityLogs && activeLead.activityLogs.length > 0 ? (
                    activeLead.activityLogs.map((act, idx) => (
                      <div key={act.id || idx} className="flex items-start gap-3 relative">
                        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-[#087cf5] z-10" />
                        <div className="flex-1 flex items-baseline justify-between gap-2 text-[11.5px]">
                          <span className="font-medium text-[#101d37] flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-[#087cf5]" />
                            {act.action}: {act.details}
                          </span>
                          <span className="text-[10.5px] text-[#64748b] whitespace-nowrap">
                            {act.createdAt ? new Date(act.createdAt).toLocaleDateString('en-GB') : 'Recent'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-start gap-3 relative">
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-emerald-500 z-10" />
                      <div className="flex-1 flex items-baseline justify-between gap-2 text-[11.5px]">
                        <span className="font-medium text-[#101d37] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Lead Created via {activeLead.leadSource || 'Manual Entry'}
                        </span>
                        <span className="text-[10.5px] text-[#64748b] whitespace-nowrap">
                          {activeLead.lastActivity || 'Registration'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 8: PAYMENTS */}
            {activeTab === 'payments' && (
              <div className="space-y-3">
                {/* Header with Actions */}
                <div className="bg-white border border-[#e2e8f0] rounded-[9px] p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-[13px] font-bold text-[#101d37] flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#087cf5]" />
                      <span>Student Payments &amp; Fee Monitoring</span>
                    </h3>
                    <p className="text-[11px] text-[#64748b] mt-0.5">
                      Monitor incoming budget, agreed fee, installment breakdown, and GST compliance
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleOpenEditPlan}
                      className="px-3 py-1.5 rounded-[6px] border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3 text-slate-500" />
                      <span>Edit Plan &amp; Budget</span>
                    </button>
                    <button
                      onClick={handleOpenAddInstallment}
                      className="px-3 py-1.5 rounded-[6px] bg-[#087cf5] hover:bg-[#076ed9] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Record Payment</span>
                    </button>
                  </div>
                </div>

                {/* Toast Notification */}
                {paymentToast && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-[8px] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{paymentToast}</span>
                  </div>
                )}

                {/* 4 Financial KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-white p-3 rounded-[8px] border border-[#e2e8f0] shadow-2xs">
                    <span className="text-[10px] text-[#64748b] font-semibold uppercase tracking-wider block">
                      Incoming Budget
                    </span>
                    <div className="text-[17px] font-bold text-[#101d37] mt-1 truncate" title={paymentPlan?.agreed_budget || activeLead.budget || '€ 18,000 / yr'}>
                      {paymentPlan?.agreed_budget || activeLead.budget || '€ 18,000 / yr'}
                    </div>
                    <span className="text-[10.5px] text-slate-400 block mt-0.5">Onboarded target budget</span>
                  </div>

                  <div className="bg-white p-3 rounded-[8px] border border-blue-200 shadow-2xs bg-blue-50/20">
                    <span className="text-[10px] text-[#087cf5] font-semibold uppercase tracking-wider block">
                      Agreed Service Fee
                    </span>
                    <div className="text-[17px] font-bold text-[#101d37] mt-1">
                      ₹ {(paymentPlan?.total_package_fee || 0).toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10.5px] text-blue-700 font-medium block mt-0.5">
                      {paymentPlan?.gst_included ? `With GST (${paymentPlan.gst_percentage || 18}%)` : 'Without GST'}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-[8px] border border-emerald-200 shadow-2xs bg-emerald-50/20">
                    <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider block">
                      Total Paid
                    </span>
                    <div className="text-[17px] font-bold text-emerald-700 mt-1">
                      ₹ {(paymentPlan?.total_paid || 0).toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10.5px] text-emerald-600 block mt-0.5">
                      {paymentPlan?.total_package_fee
                        ? `${Math.round(((paymentPlan.total_paid || 0) / paymentPlan.total_package_fee) * 100)}% received`
                        : '0% received'}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-[8px] border border-amber-200 shadow-2xs bg-amber-50/20">
                    <span className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider block">
                      Balance Due
                    </span>
                    <div className="text-[17px] font-bold text-amber-800 mt-1">
                      ₹ {(paymentPlan?.balance_due || 0).toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10.5px] font-semibold text-amber-700 block mt-0.5">
                      Status: {paymentPlan?.payment_status || 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Installments Progress & Tax Breakdown Bar */}
                <div className="bg-white border border-[#e2e8f0] rounded-[9px] p-3.5 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#101d37]">Installment Payment Progress</span>
                    <span className="text-slate-600 font-medium">
                      ₹ {(paymentPlan?.total_paid || 0).toLocaleString('en-IN')} / ₹ {(paymentPlan?.total_package_fee || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                      style={{
                        width: `${paymentPlan?.total_package_fee
                            ? Math.min(100, Math.round(((paymentPlan.total_paid || 0) / paymentPlan.total_package_fee) * 100))
                            : 0
                          }%`,
                      }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      Planned Installments: {paymentPlan?.installment_count || 2}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Paid: {paymentInstallmentsList.filter((i) => i.status === 'Paid').length}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      Pending: {paymentInstallmentsList.filter((i) => i.status !== 'Paid').length}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      GST: {paymentPlan?.gst_included ? `Included (${paymentPlan.gst_percentage || 18}%)` : 'Without GST'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                      Total GST: ₹ {(paymentPlan?.gst_amount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Installments Table */}
                <div className="bg-white border border-[#e2e8f0] rounded-[9px] shadow-xs overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-[#e2e8f0] bg-slate-50 flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#101d37]">Installment Transactions &amp; Receipts</h4>
                    <span className="text-[11px] text-slate-500 font-medium font-mono">
                      {paymentInstallmentsList.length} Installment Records
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3">#</th>
                          <th className="py-2.5 px-3">Milestone / Title</th>
                          <th className="py-2.5 px-3">Base Fee</th>
                          <th className="py-2.5 px-3">GST Tax</th>
                          <th className="py-2.5 px-3">Total Payable</th>
                          <th className="py-2.5 px-3">Payment Mode</th>
                          <th className="py-2.5 px-3">Transaction UTR / Ref</th>
                          <th className="py-2.5 px-3">Receipt No.</th>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 text-[11.5px]">
                        {paymentInstallmentsList.length > 0 ? (
                          paymentInstallmentsList.map((inst, idx) => {
                            const isPaid = inst.status === 'Paid';
                            return (
                              <tr key={inst.id || idx} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-2.5 px-3 font-mono font-bold text-slate-500">
                                  #{inst.installment_number || idx + 1}
                                </td>
                                <td className="py-2.5 px-3 font-semibold text-[#101d37]">
                                  <div>{inst.title}</div>
                                  {inst.notes && <div className="text-[10px] text-slate-400 font-normal">{inst.notes}</div>}
                                </td>
                                <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                                  ₹ {(inst.amount || 0).toLocaleString('en-IN')}
                                </td>
                                <td className="py-2.5 px-3 whitespace-nowrap">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${inst.gst_type?.includes('Without')
                                      ? 'bg-slate-100 text-slate-600'
                                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                                    }`}>
                                    {inst.gst_type || 'With GST (18%)'}
                                  </span>
                                  {Number(inst.gst_amount || 0) > 0 && (
                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                      +₹ {(inst.gst_amount || 0).toLocaleString('en-IN')}
                                    </div>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 font-bold text-[#101d37] whitespace-nowrap">
                                  ₹ {(inst.total_amount || inst.amount || 0).toLocaleString('en-IN')}
                                </td>
                                <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10.5px] font-medium">
                                    {inst.payment_mode || 'UPI'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-mono text-[10.5px] text-slate-600 whitespace-nowrap">
                                  {inst.transaction_ref || '—'}
                                </td>
                                <td className="py-2.5 px-3 font-mono text-[10.5px] text-slate-600 whitespace-nowrap">
                                  {inst.receipt_no || '—'}
                                </td>
                                <td className="py-2.5 px-3 whitespace-nowrap text-[10.5px]">
                                  {isPaid ? (
                                    <span className="text-emerald-700 font-medium">
                                      {inst.payment_date || 'Paid'}
                                    </span>
                                  ) : (
                                    <span className="text-amber-700 font-medium">
                                      Due: {inst.due_date || 'Pending'}
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 whitespace-nowrap">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold border ${isPaid
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                      }`}
                                  >
                                    {inst.status || 'Pending'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => handleOpenEditInstallment(inst)}
                                      className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
                                      title="Edit installment"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => inst.id && handleDeleteInstallment(inst.id)}
                                      className="p-1 rounded hover:bg-rose-50 text-rose-500 cursor-pointer"
                                      title="Delete installment"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={11} className="py-8 text-center text-slate-400">
                              <CreditCard className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                              <div className="font-semibold text-slate-600 text-xs">No installments recorded yet</div>
                              <p className="text-[11px] text-slate-400 mt-0.5">Click &ldquo;Record Payment&rdquo; to add installment details.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Profile Summary & Widgets (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            {/* Widget 1: Profile Completion Score */}
            {(() => {
              const hasContact = Boolean(activeLead.studentName && activeLead.phone && activeLead.email);
              const hasAcademic = Boolean(activeLead.tenthPercentage || activeLead.twelfthPercentage || activeLead.graduationDegree);
              const hasTest = Boolean(activeLead.testOverallScore);
              const docCount = activeLead.documents?.filter((d) => (d.status as string) === 'Approved' || (d.status as string) === 'Verified' || (d.status as string) === 'Received').length || 0;
              const hasEnroll = Boolean(activeLead.isEnrolled || activeLead.status === 'Enrolled');
              let score = 0;
              if (hasContact) score += 35;
              if (hasAcademic) score += 25;
              if (hasTest) score += 20;
              if (hasEnroll) score += 20;
              if (score > 100) score = 100;
              if (score < 25) score = 25;

              return (
                <div className="bg-white border border-[#e2e8f0] rounded-[9px] p-3.5 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[12.5px] font-bold text-[#101d37]">Profile Completion</h4>
                    <span className="text-[14px] font-black text-emerald-600">{score}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${score}%` }} />
                  </div>
                  <div className="space-y-1 pt-1 text-[11px] text-[#475569]">
                    <div className="flex items-center justify-between">
                      <span>Personal & Contact Info</span>
                      {hasContact ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <span className="text-amber-500 font-semibold">Incomplete</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Academic Records (10th, 12th, Degree)</span>
                      {hasAcademic ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <span className="text-slate-400">Pending</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>English Test Scores</span>
                      {hasTest ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <span className="text-slate-400">Not Added</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Document Checklist Uploads</span>
                      <span className="font-semibold text-slate-600">{docCount} / 10</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Widget 2: Upcoming Follow-up */}
            <div className="bg-white border border-[#e2e8f0] rounded-[9px] p-3.5 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-[12.5px] font-bold text-[#101d37]">Upcoming Follow-up</h4>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${activeLead.nextFollowUp
                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                  {activeLead.nextFollowUp ? 'Scheduled' : 'None'}
                </span>
              </div>
              {activeLead.nextFollowUp ? (
                <div className="flex items-start gap-2.5 p-2.5 rounded-[6px] bg-[#fff5f5] border border-rose-100">
                  <div className="w-10 h-10 rounded-md bg-white border border-rose-200 text-rose-600 flex flex-col items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-rose-500" />
                  </div>
                  <div>
                    <div className="text-[11.5px] font-bold text-[#101d37]">
                      {activeLead.nextFollowUpTask || 'Follow-up with student'}
                    </div>
                    <div className="text-[10.5px] text-[#64748b] mt-0.5">
                      Target: {activeLead.courseInterest} ({activeLead.countryInterest})
                    </div>
                    <div className="text-[10px] text-rose-600 font-semibold mt-1">
                      {activeLead.nextFollowUp} {activeLead.nextFollowUpTime ? `• ${activeLead.nextFollowUpTime}` : ''}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-[6px] bg-slate-50 border border-slate-200 text-center text-[11px] text-[#64748b]">
                  No upcoming follow-up scheduled yet.
                </div>
              )}
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
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm shrink-0">
                  {activeLead.counsellor?.name ? activeLead.counsellor.name.slice(0, 2).toUpperCase() : 'UA'}
                </div>
                <div>
                  <div className="font-bold text-[12px] text-[#101d37]">
                    {activeLead.counsellor?.name || 'Unassigned'}
                  </div>
                  <div className="text-[10.5px] text-[#64748b]">Study Abroad Counsellor</div>
                  <div className="text-[10.5px] text-[#087cf5] font-medium">
                    {activeLead.counsellor?.email || '-'}
                  </div>
                </div>
              </div>
            </div>

            {/* Widget 4: Package & Financial Snapshot */}
            <div className="bg-white border border-[#e2e8f0] rounded-[9px] p-3.5 shadow-xs space-y-2 text-[11.5px]">
              <h4 className="text-[12.5px] font-bold text-[#101d37]">Enrollment & Status</h4>
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-[#64748b]">Current Stage</span>
                <span className="font-semibold text-[#101d37]">{activeLead.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f1f5f9]">
                <span className="text-[#64748b]">Estimated Budget</span>
                <span className="font-bold text-[#101d37]">{activeLead.budget || 'Not specified'}</span>
              </div>
              <div className="flex justify-between py-1 items-center">
                <span className="text-[#64748b]">Enrollment Status</span>
                <span className={`px-2 py-0.5 rounded text-[10.5px] font-semibold border ${activeLead.isEnrolled || activeLead.status === 'Enrolled'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                  {activeLead.isEnrolled || activeLead.status === 'Enrolled' ? 'Enrolled Student' : 'Counselling Phase'}
                </span>
              </div>
              {(!activeLead.isEnrolled && activeLead.status !== 'Enrolled') && (
                <button
                  onClick={() => onEnrollLead(activeLead)}
                  className="w-full mt-2 py-1.5 bg-[#087cf5] hover:bg-[#076ed9] text-white rounded-[5px] text-[11.5px] font-semibold transition-colors"
                >
                  Enroll Student
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Confirmation Modal for Status/Stage transitions */}
        {confirmModalData && (
          <ActionConfirmModal
            isOpen={confirmModalData.isOpen}
            onClose={() => setConfirmModalData(null)}
            onConfirm={confirmModalData.onConfirm}
            title={confirmModalData.title}
            studentName={activeLead.studentName}
            studentId={activeLead.leadId}
            studentAvatar={activeLead.avatarUrl}
            country={activeLead.countryInterest}
            currentStageName={activeLead.status}
            targetStageName={confirmModalData.newStatus}
            description={confirmModalData.description}
            confirmLabel={`Yes, Change to ${confirmModalData.newStatus}`}
            variant={confirmModalData.variant}
            requireAcknowledgment
          />
        )}

        {/* Record / Edit Payment Installment Modal */}
        {showAddPaymentModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-150"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAddPaymentModal(false);
                setEditingInstallment(null);
              }
            }}
          >
            <div className="bg-white rounded-[12px] shadow-2xl border border-[#e2e8f0] w-full max-w-[560px] overflow-hidden animate-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-[#f1f5f9] flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5 text-[#087cf5]" />
                  </div>
                  <div>
                    <h3 className="text-[14.5px] font-bold text-[#101d37] leading-tight">
                      {editingInstallment ? 'Edit Payment Installment' : 'Record New Payment / Installment'}
                    </h3>
                    <p className="text-[11px] text-[#64748b] leading-tight mt-0.5">
                      Student: {activeLead.studentName} ({activeLead.leadId || activeLead.id})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAddPaymentModal(false);
                    setEditingInstallment(null);
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveInstallment} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Installment #
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={installmentForm.installment_number}
                      onChange={(e) =>
                        setInstallmentForm({ ...installmentForm, installment_number: Number(e.target.value) || 1 })
                      }
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-[6px] text-xs focus:outline-none focus:ring-1 focus:ring-[#087cf5]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Payment Status
                    </label>
                    <select
                      value={installmentForm.status}
                      onChange={(e) => setInstallmentForm({ ...installmentForm, status: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#087cf5]"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Installment Milestone Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1st Installment - Registration & University Application"
                    value={installmentForm.title}
                    onChange={(e) => setInstallmentForm({ ...installmentForm, title: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-[6px] text-xs focus:outline-none focus:ring-1 focus:ring-[#087cf5]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Base Fee Amount (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      required
                      placeholder="e.g. 30000"
                      value={installmentForm.amount}
                      onChange={(e) => setInstallmentForm({ ...installmentForm, amount: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-[6px] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#087cf5]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      GST Tax Option
                    </label>
                    <select
                      value={installmentForm.gst_type}
                      onChange={(e) => {
                        const val = e.target.value;
                        const rate = val.includes('With GST') ? 18 : 0;
                        setInstallmentForm({ ...installmentForm, gst_type: val, gst_rate: rate });
                      }}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#087cf5]"
                    >
                      <option value="With GST (18%)">With GST (18%)</option>
                      <option value="Without GST">Without GST (0%)</option>
                    </select>
                  </div>
                </div>

                {/* Live Amount Calculation Preview */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-[8px] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Base: ₹ {Number(installmentForm.amount || 0).toLocaleString('en-IN')}</span>
                    <span className="text-slate-500 block text-[11px]">
                      GST ({installmentForm.gst_type.includes('With GST') ? installmentForm.gst_rate : 0}%): +₹{' '}
                      {(installmentForm.gst_type.includes('With GST')
                        ? (Number(installmentForm.amount || 0) * (installmentForm.gst_rate || 18)) / 100
                        : 0
                      ).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10.5px] uppercase font-bold text-slate-500 block">Total Payable</span>
                    <span className="text-base font-bold text-[#101d37]">
                      ₹{' '}
                      {(installmentForm.gst_type.includes('With GST')
                        ? Number(installmentForm.amount || 0) +
                        (Number(installmentForm.amount || 0) * (installmentForm.gst_rate || 18)) / 100
                        : Number(installmentForm.amount || 0)
                      ).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Payment Mode
                    </label>
                    <select
                      value={installmentForm.payment_mode}
                      onChange={(e) => setInstallmentForm({ ...installmentForm, payment_mode: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#087cf5]"
                    >
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                      <option value="Credit / Debit Card">Credit / Debit Card</option>
                      <option value="Net Banking">Net Banking</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque / DD">Cheque / DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Transaction UTR / Ref #
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UPI/4231908756/HDFC"
                      value={installmentForm.transaction_ref}
                      onChange={(e) => setInstallmentForm({ ...installmentForm, transaction_ref: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-[6px] text-xs focus:outline-none focus:ring-1 focus:ring-[#087cf5]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Receipt / Invoice No.
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. REC-2025-001"
                      value={installmentForm.receipt_no}
                      onChange={(e) => setInstallmentForm({ ...installmentForm, receipt_no: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-[6px] text-xs focus:outline-none focus:ring-1 focus:ring-[#087cf5]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      {installmentForm.status === 'Paid' ? 'Payment Date' : 'Due Date'}
                    </label>
                    <input
                      type="date"
                      value={installmentForm.status === 'Paid' ? installmentForm.payment_date : installmentForm.due_date}
                      onChange={(e) => {
                        if (installmentForm.status === 'Paid') {
                          setInstallmentForm({ ...installmentForm, payment_date: e.target.value });
                        } else {
                          setInstallmentForm({ ...installmentForm, due_date: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-[6px] text-xs focus:outline-none focus:ring-1 focus:ring-[#087cf5]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Notes / Remarks
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Optional notes regarding this installment or bank receipt"
                    value={installmentForm.notes}
                    onChange={(e) => setInstallmentForm({ ...installmentForm, notes: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-[6px] text-xs focus:outline-none focus:ring-1 focus:ring-[#087cf5]"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddPaymentModal(false);
                      setEditingInstallment(null);
                    }}
                    className="px-3.5 py-1.5 rounded-[6px] border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-[6px] bg-[#087cf5] hover:bg-[#076ed9] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Configure Payment Plan & Incoming Budget Modal */}
        {showEditPlanModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-150"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowEditPlanModal(false);
              }
            }}
          >
            <div className="bg-white rounded-[12px] shadow-2xl border border-[#e2e8f0] w-full max-w-[540px] overflow-hidden animate-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-[#f1f5f9] flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Receipt className="w-5 h-5 text-[#087cf5]" />
                  </div>
                  <div>
                    <h3 className="text-[14.5px] font-bold text-[#101d37] leading-tight">
                      Configure Payment Plan &amp; Incoming Budget
                    </h3>
                    <p className="text-[11px] text-[#64748b] leading-tight mt-0.5">
                      Student: {activeLead.studentName} ({activeLead.leadId || activeLead.id})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditPlanModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSavePlan} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Student Incoming Budget
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. € 18,000 / yr or ₹ 15,00,000"
                    value={planForm.agreed_budget}
                    onChange={(e) => setPlanForm({ ...planForm, agreed_budget: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-[6px] text-xs font-semibold text-[#101d37] focus:outline-none focus:ring-1 focus:ring-[#087cf5]"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Monitors the original budget on which the student arrived / onboarded.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Package / Service Plan Name
                  </label>
                  <input
                    type="text"
                    required
                    value={planForm.plan_name}
                    onChange={(e) => setPlanForm({ ...planForm, plan_name: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-[6px] text-xs focus:outline-none focus:ring-1 focus:ring-[#087cf5]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Total Package Fee (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      required
                      placeholder="e.g. 60000"
                      value={planForm.total_package_fee}
                      onChange={(e) => setPlanForm({ ...planForm, total_package_fee: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-[6px] text-xs font-bold text-[#101d37] focus:outline-none focus:ring-1 focus:ring-[#087cf5]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Number of Installments
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      required
                      value={planForm.installment_count}
                      onChange={(e) =>
                        setPlanForm({ ...planForm, installment_count: Number(e.target.value) || 2 })
                      }
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-[6px] text-xs focus:outline-none focus:ring-1 focus:ring-[#087cf5]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Currency
                    </label>
                    <select
                      value={planForm.currency}
                      onChange={(e) => setPlanForm({ ...planForm, currency: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-[6px] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#087cf5]"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      GST Treatment
                    </label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={planForm.gst_included}
                          onChange={(e) => setPlanForm({ ...planForm, gst_included: e.target.checked })}
                          className="rounded text-[#087cf5] focus:ring-[#087cf5]"
                        />
                        <span>With GST ({planForm.gst_percentage || 18}%)</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Notes &amp; Agreement Terms
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Optional details or terms agreed with the student"
                    value={planForm.notes}
                    onChange={(e) => setPlanForm({ ...planForm, notes: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-[6px] text-xs focus:outline-none focus:ring-1 focus:ring-[#087cf5]"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowEditPlanModal(false)}
                    className="px-3.5 py-1.5 rounded-[6px] border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-[6px] bg-[#087cf5] hover:bg-[#076ed9] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Plan to SQLite Database</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
          <h1 className="text-[17px] font-bold text-[#101d37]">My Students</h1>
          <p className="text-[11.5px] text-[#64748b]">
            Monitoring {filtered.length} students across Contacted, Counselling, Interested, On Hold and Drop
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (onOpenMetaSheetModal) onOpenMetaSheetModal();
              else window.dispatchEvent(new CustomEvent('open-meta-sheet-modal'));
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            title="Import and sync Meta ad leads from Google Sheets"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Meta Ads Google Sheet</span>
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#cbd5e1] text-xs font-semibold text-[#475569] hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          {showAddButton && (
            <button
              onClick={onAddNewLead}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[#087cf5] hover:bg-[#076ed9] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Lead</span>
            </button>
          )}
        </div>
      </div>

      {/* Status sections — monitor each counselling funnel step */}
      <div className="bg-white px-3 py-2 rounded-[9px] border border-[#e2e8f0] shadow-xs flex items-center gap-1.5 overflow-x-auto">
        {statusTabs.map((tab) => {
          const isActive = tab.route ? false : statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.route) {
                  onNavigate?.(tab.route);
                  return;
                }
                setStatusFilter(tab.id);
              }}
              className={`px-3 py-1.5 rounded-[6px] text-[11.5px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${isActive
                  ? 'bg-[#087cf5] text-white shadow-xs'
                  : 'bg-slate-50 text-[#52627a] hover:bg-slate-100 hover:text-[#101d37]'
                }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-white text-[#087cf5] border border-slate-200'
                    }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
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
            {LEAD_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
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
                      className={`px-2 py-0.5 rounded text-[10.5px] font-semibold ${l.status === 'Enrolled'
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
