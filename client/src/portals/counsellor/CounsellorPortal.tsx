import React from 'react';
import { PortalProps } from '../types';
import { DashboardView } from '../../views/DashboardView';
import { LeadsView } from '../../views/LeadsView';
import { StudentsView } from '../../views/StudentsView';
import { UniversityShortlistingView } from '../../views/UniversityShortlistingView';
import { StudentApprovalView } from '../../views/StudentApprovalView';
import { CounsellingView } from '../../views/CounsellingView';
import { EnrolmentView } from '../../views/EnrolmentView';
import { TasksView } from '../../views/TasksView';
import { CalendarView } from '../../views/CalendarView';
import { CommunicationView } from '../../views/CommunicationView';
import { ReportsView } from '../../views/ReportsView';
import { PhoneCall, Calendar, Users, GraduationCap, CheckCircle, History } from 'lucide-react';
import { HistoryView } from '../../views/HistoryView';
import { useWorkflow } from '../../context/WorkflowContext';

export const CounsellorPortal: React.FC<PortalProps> = (props) => {
  const { students: workflowStudents, advanceStudentStage, getSectionStudents } = useWorkflow();
  const {
    currentRoute,
    onNavigate,
    leads,
    setLeads,
    selectedLead,
    setSelectedLead,
    analytics,
    tasks,
    tabCounts,
    activeTab,
    onTabChange,
    onOpenPhone,
    onOpenWhatsApp,
    onOpenEmail,
    onScheduleFollowUp,
    onBookCounsellingSession,
    onEditLead,
    onEnrollLead,
    onTransferDocs,
    onDeleteLead,
    onAddNote,
    onUpdateStatus,
    onToggleTask,
    onAddTask,
    onAddNewLead,
    onOpenMetaSheetModal,
    tableMode,
    setTableMode,
  } = props;

  // Counsellor-specific live counts (same statuses as the My Students sections)
  const myStudentsCount = tabCounts?.myLeads ?? leads.length;
  const contactedCount = tabCounts?.contacted ?? leads.filter((l) => l.status === 'Contacted').length;
  const counsellingCount = tabCounts?.counselling ?? leads.filter((l) => l.status === 'Counselling').length;
  const interestedCount = tabCounts?.interested ?? leads.filter((l) => l.status === 'Interested').length;
  const enrolledCount =
    tabCounts?.enrolled ?? workflowStudents.filter((s) => s.overallStatus === 'Enrolled').length;
  const onHoldCount = tabCounts?.onHold ?? leads.filter((l) => l.status === 'On Hold').length;
  const dropCount = tabCounts?.drop ?? leads.filter((l) => l.status === 'Drop').length;

  // My Students status sub-sections. These routes only ever render inside the
  // counsellor portal, never the downstream Docs/Scholarship/Visa portals.
  const leadStatusRoute: Record<string, string | undefined> = {
    leads: undefined,
    'my-students-contacted': 'Contacted',
    'my-students-counselling': 'Counselling',
    'my-students-interested': 'Interested',
    'my-students-on-hold': 'On Hold',
    'my-students-drop': 'Drop',
  };
  const activeLeadStatusFilter = leadStatusRoute[currentRoute];
  const isLeadStatusRoute = Object.prototype.hasOwnProperty.call(leadStatusRoute, currentRoute);

  return (
    <div className="counsellor-portal-container space-y-3 p-2.5 sm:p-4 max-w-[1536px] mx-auto select-none">
      {/* Counsellor Portal Header Strip */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-xl p-3 sm:p-4 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold leading-tight">Counsellor Workspace</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white">
                Student Onboarding
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">
              Inbound qualification, calls, university matching &amp; student consent
            </p>
          </div>
        </div>

        {/* Quick Counsellor Stat Badges */}
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-center text-xs">
            <div className="bg-white/10 rounded-lg px-2.5 py-1.5 backdrop-blur-xs">
              <span className="text-[10px] text-blue-200 block">My Students</span>
              <span className="text-sm font-bold text-white">{myStudentsCount}</span>
            </div>
            <div className="bg-white/10 rounded-lg px-2.5 py-1.5 backdrop-blur-xs">
              <span className="text-[10px] text-blue-200 block">Contacted</span>
              <span className="text-sm font-bold text-cyan-200">{contactedCount}</span>
            </div>
            <div className="bg-white/10 rounded-lg px-2.5 py-1.5 backdrop-blur-xs">
              <span className="text-[10px] text-blue-200 block">Counselling</span>
              <span className="text-sm font-bold text-amber-300">{counsellingCount}</span>
            </div>
            <div className="bg-white/10 rounded-lg px-2.5 py-1.5 backdrop-blur-xs">
              <span className="text-[10px] text-blue-200 block">Interested</span>
              <span className="text-sm font-bold text-rose-200">{interestedCount}</span>
            </div>
            <div className="bg-white/10 rounded-lg px-2.5 py-1.5 backdrop-blur-xs">
              <span className="text-[10px] text-blue-200 block">Enrolled</span>
              <span className="text-sm font-bold text-emerald-300">{enrolledCount}</span>
            </div>
            <div className="bg-white/10 rounded-lg px-2.5 py-1.5 backdrop-blur-xs">
              <span className="text-[10px] text-blue-200 block">On Hold</span>
              <span className="text-sm font-bold text-slate-200">{onHoldCount}</span>
            </div>
            <div className="bg-white/10 rounded-lg px-2.5 py-1.5 backdrop-blur-xs">
              <span className="text-[10px] text-blue-200 block">Drop</span>
              <span className="text-sm font-bold text-red-200">{dropCount}</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className={`self-end rounded-lg px-2.5 py-1.5 backdrop-blur-xs flex items-center gap-1.5 transition-all text-xs font-semibold ${
              currentRoute === 'history'
                ? 'bg-white text-blue-900 shadow-sm'
                : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
            }`}
            title="View Student Profile Change History"
          >
            <History className="w-3.5 h-3.5" />
            <span>Profile History</span>
          </button>
        </div>
      </div>

      {/* Dynamic View for Counsellor Portal */}
      <div className="counsellor-view-content">
        {(currentRoute === 'dashboard' || !currentRoute) && (
          <DashboardView
            analytics={analytics}
            leads={leads}
            tabCounts={tabCounts}
            activeTab={activeTab}
            onTabChange={onTabChange}
            selectedLead={selectedLead}
            onSelectLead={setSelectedLead}
            tasks={tasks}
            onToggleTask={onToggleTask}
            onAddTask={onAddTask}
            onViewAllTasks={() => onNavigate('tasks')}
            onViewReports={() => onNavigate('reports')}
            onOpenPhone={onOpenPhone}
            onOpenWhatsApp={onOpenWhatsApp}
            onOpenEmail={onOpenEmail}
            onScheduleFollowUp={onScheduleFollowUp}
            onBookCounsellingSession={onBookCounsellingSession}
            onEditLead={onEditLead}
            onEnrollLead={onEnrollLead}
            onTransferDocs={onTransferDocs}
            onDeleteLead={onDeleteLead}
            onAddNote={onAddNote}
            viewMode={tableMode}
            onViewModeChange={setTableMode}
            onUpdateStatus={onUpdateStatus}
            onKpiClick={(filter) => {
              const routes: Record<string, string> = {
                'my-students': 'leads',
                contacted: 'my-students-contacted',
                counselling: 'my-students-counselling',
                interested: 'my-students-interested',
                enrolled: 'students',
                'on-hold': 'my-students-on-hold',
                drop: 'my-students-drop',
              };
              onNavigate(routes[filter] || 'leads');
            }}
            onNavigate={onNavigate}
            onSelectSource={() => {}}
            onSelectCountry={() => {}}
          />
        )}

        {isLeadStatusRoute && (
          <LeadsView
            key={currentRoute}
            leads={leads}
            selectedLead={selectedLead}
            onAddNewLead={onAddNewLead}
            onOpenMetaSheetModal={onOpenMetaSheetModal}
            showAddButton={false}
            showConvertActions={false}
            showFullPipeline={false}
            initialStatusFilter={activeLeadStatusFilter || 'all'}
            statusCounts={tabCounts}
            onNavigate={onNavigate}
            onSelectLead={setSelectedLead}
            onEditLead={onEditLead}
            onEnrollLead={onEnrollLead}
            onTransferDocs={onTransferDocs}
            onDeleteLead={onDeleteLead}
            onOpenPhone={onOpenPhone}
            onOpenWhatsApp={onOpenWhatsApp}
            onOpenEmail={onOpenEmail}
            onScheduleFollowUp={onScheduleFollowUp}
            onBookCounsellingSession={onBookCounsellingSession}
            onUpdateStatus={onUpdateStatus}
            onAddNote={onAddNote}
          />
        )}

        {currentRoute === 'students' && (
          <StudentsView
            onNavigate={onNavigate}
            onScheduleFollowUp={onScheduleFollowUp}
            onOpenPhone={onOpenPhone}
            onOpenWhatsApp={onOpenWhatsApp}
            onOpenEmail={onOpenEmail}
          />
        )}

        {currentRoute === 'university-shortlisting' && (
          <UniversityShortlistingView
            students={getSectionStudents('shortlisting')}
            onAdvanceStage={advanceStudentStage}
            onNavigate={onNavigate}
          />
        )}

        {currentRoute === 'student-approval' && (
          <StudentApprovalView
            students={getSectionStudents('student-approval')}
            onAdvanceStage={advanceStudentStage}
            onNavigate={onNavigate}
            onOpenPhone={onOpenPhone}
            onOpenWhatsApp={onOpenWhatsApp}
            onOpenEmail={onOpenEmail}
            onScheduleFollowUp={onScheduleFollowUp}
          />
        )}

        {currentRoute === 'counselling' && (
          <CounsellingView
            students={workflowStudents}
            onAdvanceStage={advanceStudentStage}
            onNavigate={onNavigate}
          />
        )}

        {currentRoute === 'enrolment' && (
          <EnrolmentView
            leads={leads}
            onSelectLead={(lead) => setSelectedLead(lead)}
            onTransferDocs={onTransferDocs}
          />
        )}

        {currentRoute === 'tasks' && (
          <TasksView
            tasks={tasks}
            leads={leads}
            onToggleTask={onToggleTask}
            onAddTask={onAddTask}
            onOpenPhone={onOpenPhone}
            onOpenWhatsApp={onOpenWhatsApp}
            onOpenEmail={onOpenEmail}
            onScheduleFollowUp={onScheduleFollowUp}
            onNavigate={onNavigate}
          />
        )}

        {currentRoute === 'calendar' && (
          <CalendarView
            leads={leads}
            onNavigate={onNavigate}
            onScheduleFollowUp={onScheduleFollowUp}
            onOpenWhatsApp={onOpenWhatsApp}
            onOpenPhone={onOpenPhone}
          />
        )}

        {currentRoute === 'communication' && (
          <CommunicationView
            onOpenEmail={() => {
              if (selectedLead) onOpenEmail(selectedLead);
              else if (leads.length > 0) onOpenEmail(leads[0]);
            }}
            onOpenWhatsApp={() => {
              if (selectedLead) onOpenWhatsApp(selectedLead);
              else if (leads.length > 0) onOpenWhatsApp(leads[0]);
            }}
          />
        )}

        {currentRoute === 'reports' && (
          <ReportsView analytics={analytics} leads={leads} />
        )}

        {currentRoute === 'history' && (
          <HistoryView />
        )}
      </div>
    </div>
  );
};
