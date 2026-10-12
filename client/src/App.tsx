import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './views/DashboardView';
import { LeadsView } from './views/LeadsView';
import { StudentsView } from './views/StudentsView';
import { DocumentationView } from './views/DocumentationView';
import { UniversityShortlistingView } from './views/UniversityShortlistingView';
import { ApplicationsView } from './views/ApplicationsView';
import { CounsellingView } from './views/CounsellingView';
import { EnrolmentView } from './views/EnrolmentView';
import { FollowUpsView } from './views/FollowUpsView';
import { TasksView } from './views/TasksView';
import { CommunicationView } from './views/CommunicationView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

import { AddLeadModal } from './components/modals/AddLeadModal';
import { EditLeadModal } from './components/modals/EditLeadModal';
import { EnrollStudentModal } from './components/modals/EnrollStudentModal';
import { ScheduleFollowUpModal } from './components/modals/ScheduleFollowUpModal';
import { EmailModal } from './components/modals/EmailModal';
import { WhatsAppModal } from './components/modals/WhatsAppModal';
import { TaskModal } from './components/modals/TaskModal';
import { TransferDocsModal } from './components/modals/TransferDocsModal';

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

export function App() {
  const { convertLeadToStudent, advanceStudentStage, getSectionStudents } = useWorkflow();
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

  // Data states
  const [analytics, setAnalytics] = useState<AnalyticsData | undefined>();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tabCounts, setTabCounts] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<string>('My Leads');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(3);
  const [tableMode, setTableMode] = useState<'table' | 'kanban'>('table');

  // Modals
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showEditLeadModal, setShowEditLeadModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTransferDocsModal, setShowTransferDocsModal] = useState(false);
  const [modalTargetLead, setModalTargetLead] = useState<Lead | null>(null);

  // Load Initial Data
  const loadDashboardData = async () => {
    try {
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

      // Default selected lead: Rahul Sharma (L2025100501)
      if (!selectedLead && leadsData.data.length > 0) {
        const rahul = leadsData.data.find((l) => l.leadId === 'L2025100501') || leadsData.data[0];
        setSelectedLead(rahul);
      }
    } catch (err) {
      console.error('Error loading CRM data:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

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
      await updateLead(leadId, { status: newStatus });
      loadDashboardData();
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

  // Delete Lead
  const handleDeleteLead = async (lead: Lead) => {
    if (window.confirm(`Are you sure you want to delete lead ${lead.studentName}?`)) {
      try {
        await deleteLead(lead.id);
        setLeads((prev) => prev.filter((l) => l.id !== lead.id));
        if (selectedLead?.id === lead.id) {
          const next = leads.find((l) => l.id !== lead.id) || null;
          setSelectedLead(next);
        }
        loadDashboardData();
      } catch (err) {
        alert('Failed to delete lead');
      }
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
        setCurrentRoute('documentation');
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

  return (
    <div className="min-h-screen bg-[#f4f8fc] flex font-sans antialiased text-[#101d37]">
      {/* 1. Dark Navy Sidebar */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        unreadLeadsCount={12}
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
        />

        {/* Dynamic Route View */}
        <main className="flex-1">
          {currentRoute === 'dashboard' && (
            <DashboardView
              analytics={analytics}
              leads={leads}
              tabCounts={tabCounts}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              selectedLead={selectedLead}
              onSelectLead={(l) => setSelectedLead(l)}
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onAddTask={() => setShowTaskModal(true)}
              onViewAllTasks={() => setCurrentRoute('tasks')}
              onViewReports={() => handleTabChange('Counselling')}
              onOpenPhone={openPhone}
              onOpenWhatsApp={openWhatsApp}
              onOpenEmail={openEmail}
              onScheduleFollowUp={openScheduleFollowUp}
              onEditLead={openEditLead}
              onEnrollLead={openEnrollLead}
              onTransferDocs={openTransferDocs}
              onDeleteLead={handleDeleteLead}
              onAddNote={handleAddNote}
              viewMode={tableMode}
              onViewModeChange={(m) => setTableMode(m)}
              onUpdateStatus={handleUpdateStatus}
              onKpiClick={(filter) => {
                if (filter === 'total') handleTabChange('My Leads');
                else if (filter === 'counselling') handleTabChange('Counselling');
                else if (filter === 'enrolled') handleTabChange('Enrolled');
                else if (filter === 'transferred') handleTabChange('Transferred');
              }}
              onSelectSource={async (src) => {
                const res = await fetchLeads({ source: src });
                setLeads(res.data);
              }}
              onSelectCountry={async (country) => {
                const res = await fetchLeads({ country });
                setLeads(res.data);
              }}
            />
          )}

          {currentRoute === 'leads' && (
            <LeadsView
              leads={leads}
              selectedLead={selectedLead}
              onAddNewLead={() => setShowAddLeadModal(true)}
              onSelectLead={(l) => {
                setSelectedLead(l);
              }}
              onEditLead={openEditLead}
              onEnrollLead={openEnrollLead}
              onTransferDocs={openTransferDocs}
              onDeleteLead={handleDeleteLead}
              onOpenPhone={openPhone}
              onOpenWhatsApp={openWhatsApp}
              onOpenEmail={openEmail}
              onScheduleFollowUp={openScheduleFollowUp}
              onUpdateStatus={handleUpdateStatus}
              onAddNote={handleAddNote}
            />
          )}

          {currentRoute === 'contacted' && (
            <LeadsView
              key="contacted"
              leads={leads}
              initialStatusFilter="Contacted"
              onAddNewLead={() => setShowAddLeadModal(true)}
              onSelectLead={(l) => {
                setSelectedLead(l);
              }}
              onEditLead={openEditLead}
              onEnrollLead={openEnrollLead}
              onTransferDocs={openTransferDocs}
              onDeleteLead={handleDeleteLead}
              onOpenPhone={openPhone}
              onOpenWhatsApp={openWhatsApp}
              onOpenEmail={openEmail}
              onScheduleFollowUp={openScheduleFollowUp}
              onUpdateStatus={handleUpdateStatus}
              onAddNote={handleAddNote}
            />
          )}

          {(currentRoute === 'students' ||
            currentRoute === 'student-approval' ||
            currentRoute === 'scholarship' ||
            currentRoute === 'pre-enrolment' ||
            currentRoute === 'dov-cimea' ||
            currentRoute === 'visa-process' ||
            currentRoute === 'pre-departure') && (
            <StudentsView
              onScheduleFollowUp={openScheduleFollowUp}
              onOpenPhone={openPhone}
              onOpenWhatsApp={openWhatsApp}
              onOpenEmail={openEmail}
              onNavigate={handleNavigate}
              onEditLead={openEditLead}
            />
          )}

          {currentRoute === 'documentation' && (
            <DocumentationView
              students={getSectionStudents('documentation')}
              onAdvanceStage={advanceStudentStage}
              onForwardToApplications={() => handleNavigate('university-shortlisting')}
              onNavigate={handleNavigate}
            />
          )}

          {(currentRoute === 'university-shortlisting' || currentRoute === 'final-university') && (
            <UniversityShortlistingView
              students={getSectionStudents('shortlisting')}
              onAdvanceStage={advanceStudentStage}
              onForwardToApplications={() => handleNavigate('applications')}
              onNavigate={handleNavigate}
            />
          )}

          {(currentRoute === 'applications' || currentRoute === 'offer-letters') && (
            <ApplicationsView
              students={getSectionStudents('applications')}
              onAdvanceStage={advanceStudentStage}
              onNavigate={handleNavigate}
            />
          )}

          {currentRoute === 'counselling' && (
            <CounsellingView
              students={getSectionStudents('counselling')}
              onAdvanceStage={advanceStudentStage}
              onNavigate={handleNavigate}
            />
          )}

          {(currentRoute === 'enrolment' || currentRoute === 'finance') && (
            <EnrolmentView
              leads={leads}
              onTransferDocs={openTransferDocs}
              onSelectLead={(l) => {
                setSelectedLead(l);
                setCurrentRoute('dashboard');
              }}
            />
          )}

          {currentRoute === 'follow-ups' && (
            <FollowUpsView
              leads={leads}
              onOpenPhone={openPhone}
              onOpenWhatsApp={openWhatsApp}
              onScheduleFollowUp={openScheduleFollowUp}
            />
          )}

          {currentRoute === 'tasks' && (
            <TasksView
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onAddTask={() => setShowTaskModal(true)}
            />
          )}

          {currentRoute === 'communication' && (
            <CommunicationView
              onOpenEmail={() => {
                setModalTargetLead(selectedLead);
                setShowEmailModal(true);
              }}
              onOpenWhatsApp={() => {
                setModalTargetLead(selectedLead);
                setShowWhatsAppModal(true);
              }}
            />
          )}

          {(currentRoute === 'reports' || currentRoute === 'hr') && (
            <ReportsView analytics={analytics} leads={leads} />
          )}

          {currentRoute === 'settings' && <SettingsView />}
        </main>

      </div>

      {/* Reusable Modals */}
      <AddLeadModal
        isOpen={showAddLeadModal}
        onClose={() => setShowAddLeadModal(false)}
        onSuccess={(newLead) => {
          setLeads((prev) => [newLead, ...prev]);
          setSelectedLead(newLead);
          loadDashboardData();
        }}
      />

      <EditLeadModal
        isOpen={showEditLeadModal}
        onClose={() => setShowEditLeadModal(false)}
        lead={modalTargetLead}
        onSuccess={(updated) => {
          setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
          if (selectedLead?.id === updated.id) setSelectedLead(updated);
          loadDashboardData();
        }}
      />

      <EnrollStudentModal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        lead={modalTargetLead}
        onSuccess={(updated) => {
          setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
          if (selectedLead?.id === updated.id) setSelectedLead(updated);
          // Workflow hand-off: convert the lead into a student at the Counselling stage.
          const student = convertLeadToStudent(updated, 'counselling');
          loadDashboardData();
          handleNavigate(`counselling?id=${student.studentId}`);
        }}
      />

      <ScheduleFollowUpModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        lead={modalTargetLead}
        onSuccess={(updated) => {
          setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
          if (selectedLead?.id === updated.id) setSelectedLead(updated);
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
          handleNavigate(`documentation?id=${student.studentId}`);
        }}
      />
    </div>
  );
}

export default App;
