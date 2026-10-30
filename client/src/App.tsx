import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './views/LoginView';
import { HistoryView } from './views/HistoryView';
import { MobileNav } from './components/layout/MobileNav';
import {
  CounsellorPortal,
  AdminPortal,
  DocsPortal,
  ScholarshipPortal,
  VisaPortal,
  UpGradPortal,
  PortalProps,
} from './portals';

import { AddLeadModal } from './components/modals/AddLeadModal';
import { DeleteLeadModal } from './components/modals/DeleteLeadModal';
import { EditLeadModal } from './components/modals/EditLeadModal';
import { EnrollStudentModal } from './components/modals/EnrollStudentModal';
import { ScheduleFollowUpModal } from './components/modals/ScheduleFollowUpModal';
import { BookCounsellingSessionModal } from './components/modals/BookCounsellingSessionModal';
import { EmailModal } from './components/modals/EmailModal';
import { WhatsAppModal } from './components/modals/WhatsAppModal';
import { TaskModal } from './components/modals/TaskModal';
import { TransferDocsModal } from './components/modals/TransferDocsModal';
import { GoogleSheetMetaLeadsModal } from './components/modals/GoogleSheetMetaLeadsModal';

import {
  fetchAnalytics,
  fetchLeads,
  fetchTasks,
  fetchNotifications,
  toggleTask,
  deleteLead,
  updateLead,
} from './services/api';
import { AnalyticsData, Lead, NotificationItem, Task } from './types/crm';
import { useWorkflow } from './context/WorkflowContext';
import { useLocalStorage } from './hooks/useLocalStorage';

const EMPTY_ANALYTICS: AnalyticsData = {
  kpis: {
    totalLeads: { value: 0, label: 'Total Leads', growth: '—' },
    contacted: { value: 0, label: 'Contacted', growth: '—' },
    counsellingDone: { value: 0, label: 'Counselling Done', growth: '—' },
    enrolled: { value: 0, label: 'Enrolled', growth: '—' },
    transferred: { value: 0, label: 'Transferred to Documentation', growth: '—' },
    applicationInProcess: { value: 0, label: 'Application in Process', growth: '—' },
    offerReceived: { value: 0, label: 'Offer Received', growth: '—' },
  },
  counsellingSummary: [],
  leadSources: [],
  countryInterest: [],
};

function CRMMain() {
  const { isAuthenticated, activePortal } = useAuth();
  const { convertLeadToStudent, refreshFromProfiles } = useWorkflow();
  const getInitialRoute = () => {
    const raw = window.location.hash.replace('#', '');
    const route = raw.split('?')[0];
    return route || 'dashboard';
  };
  const [currentRoute, setCurrentRoute] = useState<string>(getInitialRoute);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage<boolean>('crm-sidebar-collapsed', false);

  useEffect(() => {
    const handleHashChange = () => {
      const raw = window.location.hash.replace('#', '');
      const route = raw.split('?')[0];
      if (route) setCurrentRoute(route);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (route: string) => {
    const cleanRoute = route.split('?')[0];
    setCurrentRoute(cleanRoute);
    window.location.hash = route;
  };

  // Start with clean initial structures so dummy/demo data NEVER flashes on screen during a refresh
  const [analytics, setAnalytics] = useState<AnalyticsData>(EMPTY_ANALYTICS);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tabCounts, setTabCounts] = useState<Record<string, number>>({
    myLeads: 0,
    total: 0,
    newLeads: 0,
    contacted: 0,
    counselling: 0,
    interested: 0,
    enrolled: 0,
    transferred: 0,
    onHold: 0,
    drop: 0,
    lost: 0,
  });
  const [activeTab, setActiveTab] = useState<string>('My Leads');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem('crm_tasks_v3');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const demoTaskIds = new Set(['task-1', 'task-2', 'task-3', 'task-4']);
          return parsed.filter((t: Task) => !demoTaskIds.has(t.id));
        }
      }
    } catch {}
    return [];
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);
  const [tableMode, setTableMode] = useState<'table' | 'kanban'>('table');

  // Modals
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showEditLeadModal, setShowEditLeadModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCounsellingModal, setShowCounsellingModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTransferDocsModal, setShowTransferDocsModal] = useState(false);
  const [showMetaSheetModal, setShowMetaSheetModal] = useState(false);
  const [metaSheetViewOnly, setMetaSheetViewOnly] = useState(false);
  const [modalTargetLead, setModalTargetLead] = useState<Lead | null>(null);

  useEffect(() => {
    const handleOpenMetaSheet = (e: Event) => {
      const customEvent = e as CustomEvent<{ viewOnly?: boolean }>;
      setMetaSheetViewOnly(Boolean(customEvent.detail?.viewOnly));
      setShowMetaSheetModal(true);
    };
    window.addEventListener('open-meta-sheet-modal', handleOpenMetaSheet);
    return () => window.removeEventListener('open-meta-sheet-modal', handleOpenMetaSheet);
  }, []);

  // Load Initial Data
  const loadDashboardData = async () => {
    try {
      // Remove any old placeholder demo leads, tasks, and notifications accidentally cached by earlier builds.
      try {
        const stored = localStorage.getItem('crm_leads_v3');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const demoIds = new Set(['lead-1', 'lead-2', 'lead-3', 'lead-4']);
            const cleaned = parsed.filter((lead: Lead) => !demoIds.has(lead.id));
            if (cleaned.length !== parsed.length) {
              localStorage.setItem('crm_leads_v3', JSON.stringify(cleaned));
            }
          }
        }
      } catch {}

      try {
        const storedTasks = localStorage.getItem('crm_tasks_v3');
        if (storedTasks) {
          const parsed = JSON.parse(storedTasks);
          if (Array.isArray(parsed)) {
            const demoTaskIds = new Set(['task-1', 'task-2', 'task-3', 'task-4']);
            const cleaned = parsed.filter((t: Task) => !demoTaskIds.has(t.id));
            if (cleaned.length !== parsed.length) {
              localStorage.setItem('crm_tasks_v3', JSON.stringify(cleaned));
            }
          }
        }
      } catch {}

      try {
        const storedNotifs = localStorage.getItem('crm_notifs_v3');
        if (storedNotifs) {
          const parsed = JSON.parse(storedNotifs);
          if (Array.isArray(parsed)) {
            const demoNotifIds = new Set(['notif-1', 'notif-2', 'notif-3']);
            const cleaned = parsed.filter((n: NotificationItem) => !demoNotifIds.has(n.id));
            if (cleaned.length !== parsed.length) {
              localStorage.setItem('crm_notifs_v3', JSON.stringify(cleaned));
            }
          }
        }
      } catch {}

      const [analyticsData, leadsData, tasksData, notifsData] = await Promise.all([
        fetchAnalytics(),
        fetchLeads({ tab: activeTab }),
        fetchTasks(),
        fetchNotifications(),
      ]);

      setAnalytics(analyticsData);
      setLeads(leadsData.data);
      setTabCounts(leadsData.tabCounts);
      setTasks(tasksData);
      setNotifications(notifsData.list);
      setUnreadNotifCount(notifsData.unreadCount);

      // Keep the selected student pointing at the fresh folder-backed record.
      setSelectedLead((prev) => {
        if (leadsData.data.length === 0) return null;
        if (!prev) {
          return leadsData.data.find((l) => l.leadId === 'L2026103004') || leadsData.data[0];
        }
        return (
          leadsData.data.find((l) => l.id === prev.id || l.leadId === prev.leadId) ||
          leadsData.data[0]
        );
      });
    } catch (err) {
      console.error('Error loading CRM data:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Re-pull the folder-backed lead projection when entering My Students so
  // stage/profile changes made in other sections are always reflected here.
  useEffect(() => {
    const isStudentsRoute =
      currentRoute === 'leads' ||
      currentRoute === 'my-students-contacted' ||
      currentRoute === 'my-students-counselling' ||
      currentRoute === 'my-students-interested' ||
      currentRoute === 'my-students-on-hold' ||
      currentRoute === 'my-students-drop';
    if (!isStudentsRoute) return;
    let cancelled = false;
    fetchLeads()
      .then((res) => {
        if (cancelled) return;
        setLeads(res.data);
        setTabCounts(res.tabCounts);
        setSelectedLead((prev) => {
          if (res.data.length === 0) return null;
          if (!prev) return res.data.find((l) => l.leadId === 'L2026103004') || res.data[0];
          return res.data.find((l) => l.id === prev.id || l.leadId === prev.leadId) || res.data[0];
        });
      })
      .catch((err) => console.error('Error refreshing folder-backed leads:', err));
    return () => {
      cancelled = true;
    };
  }, [currentRoute]);

  // When tab changes, reload leads for that tab
  const handleTabChange = async (tab: string) => {
    setActiveTab(tab);
    try {
      const res = await fetchLeads({ tab });
      setLeads(res.data);
      setTabCounts(res.tabCounts);
    } catch (err) {
      console.error(err);
    }
  };

  // Task Toggle
  const handleToggleTask = async (taskId: string) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                completed: !t.completed,
                dueStatus: !t.completed ? 'Completed' : 'Upcoming',
              }
            : t
        )
      );
      await toggleTask(taskId);
    } catch (err) {
      console.error(err);
    }
  };

  // Update Status
  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    try {
      const targetLead = leads.find((l) => l.id === leadId || l.leadId === leadId);
      await updateLead(leadId, {
        status: newStatus,
        ...(newStatus === 'Enrolled' ? { isEnrolled: true } : {}),
      } as Partial<Lead>);

      if (newStatus === 'Enrolled' && targetLead) {
        convertLeadToStudent(targetLead, 'counselling');
      }

      await refreshFromProfiles();

      if (newStatus === 'Enrolled') {
        // Enrolled students leave My Students and appear in Enrolled Students / Docs portal.
        setLeads((prev) => prev.filter((l) => l.id !== leadId && l.leadId !== leadId));
        setSelectedLead((prev) => (prev && (prev.id === leadId || prev.leadId === leadId) ? null : prev));
        handleNavigate(`students?id=${targetLead?.leadId || targetLead?.id || leadId}`);
        loadDashboardData();
      } else {
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Note
  const handleAddNote = async (leadId: string, note: string) => {
    try {
      const target = leads.find((l) => l.id === leadId);
      const combinedNotes = target?.notes ? `${target.notes}\n• ${note}` : note;
      const updated = await updateLead(leadId, { notes: combinedNotes });
      setSelectedLead(updated);
      setLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)));
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Lead (two-step in-app confirmation — see DeleteLeadModal)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState(false);

  const handleDeleteLead = (lead: Lead) => {
    setDeleteTarget(lead);
    setShowDeleteModal(true);
  };

  const handleConfirmDeleteLead = async (lead: Lead) => {
    setDeletingLead(true);
    try {
      await deleteLead(lead.id);
      setLeads((prev) => prev.filter((l) => l.id !== lead.id));
      if (selectedLead?.id === lead.id) {
        const next = leads.find((l) => l.id !== lead.id) || null;
        setSelectedLead(next);
      }
      setShowDeleteModal(false);
      setDeleteTarget(null);
      refreshFromProfiles();
      loadDashboardData();
    } catch (err) {
      alert('Failed to delete lead');
    } finally {
      setDeletingLead(false);
    }
  };

  // Quick Action Dispatcher from Sidebar
  const handleQuickAction = (action: string) => {
    const target = selectedLead || leads[0] || null;
    setModalTargetLead(target);
    switch (action) {
      case 'add-lead':
        setShowAddLeadModal(true);
        break;
      case 'send-whatsapp':
        setShowWhatsAppModal(true);
        break;
      case 'send-email':
        setShowEmailModal(true);
        break;
      case 'book-counselling':
        setShowScheduleModal(true);
        break;
      case 'document-templates':
      case 'checklist-library':
        setCurrentRoute('resources');
        break;
      case 'help-support':
        alert('Support Desk: support@studyabroadcrm.com | Toll-Free: 1800-123-7890');
        break;
      default:
        break;
    }
  };

  // Action helpers for row and panel
  const openPhone = (lead: Lead) => {
    window.location.href = `tel:${lead.phone.replace(/[^0-9+]/g, '')}`;
  };

  const openWhatsApp = (lead: Lead) => {
    setModalTargetLead(lead);
    setShowWhatsAppModal(true);
  };

  const openEmail = (lead: Lead) => {
    setModalTargetLead(lead);
    setShowEmailModal(true);
  };

  const openScheduleFollowUp = (lead: Lead) => {
    setModalTargetLead(lead);
    setShowScheduleModal(true);
  };

  const openBookCounsellingSession = (lead: Lead) => {
    setModalTargetLead(lead);
    setShowCounsellingModal(true);
  };

  const openEditLead = (lead: Lead) => {
    setModalTargetLead(lead);
    setShowEditLeadModal(true);
  };

  const openEnrollLead = (lead: Lead) => {
    setModalTargetLead(lead);
    setShowEnrollModal(true);
  };

  const openTransferDocs = (lead: Lead) => {
    setModalTargetLead(lead);
    setShowTransferDocsModal(true);
  };

  // If user is not authenticated, render the Login Screen!
  if (!isAuthenticated) {
    return <LoginView />;
  }

  const portalProps: PortalProps = {
    currentRoute,
    onNavigate: handleNavigate,
    leads,
    setLeads,
    selectedLead,
    setSelectedLead,
    analytics,
    tasks,
    tabCounts,
    activeTab,
    onTabChange: handleTabChange,
    onOpenPhone: openPhone,
    onOpenWhatsApp: openWhatsApp,
    onOpenEmail: openEmail,
    onScheduleFollowUp: openScheduleFollowUp,
    onBookCounsellingSession: openBookCounsellingSession,
    onEditLead: openEditLead,
    onEnrollLead: openEnrollLead,
    onTransferDocs: openTransferDocs,
    onDeleteLead: handleDeleteLead,
    onAddNote: handleAddNote,
    onUpdateStatus: handleUpdateStatus,
    onToggleTask: handleToggleTask,
    onAddTask: () => setShowTaskModal(true),
    onAddNewLead: () => setShowAddLeadModal(true),
    onOpenMetaSheetModal: (options?: { viewOnly?: boolean }) => {
      setMetaSheetViewOnly(Boolean(options?.viewOnly));
      setShowMetaSheetModal(true);
    },
    onOpenStudentProfile: (id: string) => {
      handleNavigate(id ? `students?id=${id}` : 'students');
    },
    tableMode,
    setTableMode,
  };

  const renderActivePortal = () => {
    switch (activePortal.role) {
      case 'admin':
        return <AdminPortal {...portalProps} />;
      case 'counsellor':
        return <CounsellorPortal {...portalProps} />;
      case 'docs':
        return <DocsPortal {...portalProps} />;
      case 'scholarship':
        return <ScholarshipPortal {...portalProps} />;
      case 'visa':
        return <VisaPortal {...portalProps} />;
      case 'upgrad':
        return <UpGradPortal {...portalProps} />;
      default:
        return <CounsellorPortal {...portalProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f8fc] flex font-sans antialiased text-[#101d37]">
      {/* 1. Dark Navy Sidebar */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        unreadLeadsCount={leads.length}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onQuickAction={handleQuickAction}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* 2. Main Content Canvas */}
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-screen transition-[padding] duration-300 ${
          sidebarCollapsed ? 'lg:pl-[76px]' : 'lg:pl-[240px]'
        }`}
      >
        {/* Top Header */}
        <Header
          onToggleSidebar={() => {
            if (window.innerWidth >= 1024) setSidebarCollapsed((prev) => !prev);
            else setSidebarOpen((prev) => !prev);
          }}
          onAddNewLead={() => setShowAddLeadModal(true)}
          onOpenEmail={() => {
            setModalTargetLead(selectedLead);
            setShowEmailModal(true);
          }}
          onOpenWhatsApp={() => {
            setModalTargetLead(selectedLead);
            setShowWhatsAppModal(true);
          }}
          notifications={notifications}
          unreadCount={unreadNotifCount}
          onSelectLead={(l) => {
            setSelectedLead(l);
            setCurrentRoute('dashboard');
          }}
          onRefreshNotifications={async () => {
            const notifs = await fetchNotifications();
            setNotifications(notifs.list);
            setUnreadNotifCount(notifs.unreadCount);
          }}
          onNavigate={handleNavigate}
        />

        {/* Isolated Portal Rendering (Complete Separation of Design and Logic) */}
        <main className="flex-1 pb-20 lg:pb-6">
          {renderActivePortal()}
        </main>

      </div>

      {/* Reusable Modals */}
      <AddLeadModal
        isOpen={showAddLeadModal}
        onClose={() => setShowAddLeadModal(false)}
        onSuccess={(newLead) => {
          setLeads((prev) => [newLead, ...prev.filter((l) => l.id !== newLead.id)]);
          setSelectedLead(newLead);
          setActiveTab('My Leads');
          loadDashboardData();
          refreshFromProfiles();
        }}
      />

      <EditLeadModal
        isOpen={showEditLeadModal}
        onClose={() => setShowEditLeadModal(false)}
        lead={modalTargetLead}
        onSuccess={(updated) => {
          setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
          if (selectedLead?.id === updated.id) setSelectedLead(updated);
          refreshFromProfiles();
          loadDashboardData();
        }}
      />

      <DeleteLeadModal
        isOpen={showDeleteModal}
        lead={deleteTarget}
        deleting={deletingLead}
        onClose={() => {
          if (!deletingLead) {
            setShowDeleteModal(false);
            setDeleteTarget(null);
          }
        }}
        onConfirm={handleConfirmDeleteLead}
      />

      <EnrollStudentModal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        lead={modalTargetLead}
        onSuccess={(updated) => {
          setLeads((prev) => prev.filter((l) => l.id !== updated.id && l.leadId !== updated.leadId));
          if (selectedLead?.id === updated.id || selectedLead?.leadId === updated.leadId) setSelectedLead(null);
          // Workflow hand-off: convert the lead into an enrolled student profile.
          const student = convertLeadToStudent(updated, 'counselling');
          refreshFromProfiles();
          loadDashboardData();
          handleNavigate(`students?id=${student.studentId}`);
        }}
      />

      <ScheduleFollowUpModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        lead={modalTargetLead}
        onSuccess={(updated) => {
          setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
          if (selectedLead?.id === updated.id) setSelectedLead(updated);
          refreshFromProfiles();
          loadDashboardData();
        }}
      />

      <BookCounsellingSessionModal
        isOpen={showCounsellingModal}
        onClose={() => setShowCounsellingModal(false)}
        lead={modalTargetLead}
        onSuccess={() => {
          refreshFromProfiles();
          loadDashboardData();
        }}
      />

      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        lead={modalTargetLead}
      />

      <WhatsAppModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        lead={modalTargetLead}
      />

      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSuccess={(newTask) => {
          setTasks((prev) => [newTask, ...prev]);
        }}
      />

      <TransferDocsModal
        isOpen={showTransferDocsModal}
        onClose={() => setShowTransferDocsModal(false)}
        lead={modalTargetLead}
        onSuccess={(updated) => {
          setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
          if (selectedLead?.id === updated.id) setSelectedLead(updated);
          // Register the profile in the workflow at the Documentation stage.
          const student = convertLeadToStudent(updated, 'documentation');
          loadDashboardData();
          refreshFromProfiles();
          if (activePortal.role === 'docs') {
            handleNavigate(`documentation?id=${student.studentId}`);
          } else {
            // The counsellor portal does not own the documentation route — stay
            // on a real counsellor screen instead of rendering a blank page.
            handleNavigate('students');
          }
        }}
      />

      <GoogleSheetMetaLeadsModal
        isOpen={showMetaSheetModal}
        viewOnly={metaSheetViewOnly}
        onClose={() => setShowMetaSheetModal(false)}
        onLeadAdded={() => {
          loadDashboardData();
          refreshFromProfiles();
        }}
      />
      <MobileNav
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        onOpenMobileMenu={() => setSidebarOpen(true)}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <CRMMain />
    </AuthProvider>
  );
}

export default App;
