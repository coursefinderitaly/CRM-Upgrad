import React, { useState } from 'react';
import { PortalProps } from '../types';
import { DashboardView } from '../../views/DashboardView';
import { LeadsView } from '../../views/LeadsView';
import { StudentsView } from '../../views/StudentsView';
import { ReportsView } from '../../views/ReportsView';
import { SettingsView } from '../../views/SettingsView';
import { HistoryView } from '../../views/HistoryView';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Database,
  Users,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  History,
} from 'lucide-react';

export const AdminPortal: React.FC<PortalProps> = (props) => {
  const {
    currentRoute,
    onNavigate,
    leads,
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
    tableMode,
    setTableMode,
  } = props;

  const { mongoStatus, refreshMongoStatus, portalUsers } = useAuth();
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  return (
    <div className="admin-portal-container space-y-4 p-2.5 sm:p-4 max-w-[1536px] mx-auto select-none">
      {/* Admin Executive Header */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-rose-800 rounded-xl p-3 sm:p-4 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold leading-tight">Admin Executive Command Center</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white">
                Global Operations
              </span>
            </div>
            <p className="text-xs text-amber-100 mt-0.5">
              Enterprise portal administration, staff credentials &amp; multi-department oversight
            </p>
          </div>
        </div>

        {/* MongoDB Status Box */}
        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs">
          <Database className="w-4 h-4 text-amber-300" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold">MongoDB Atlas:</span>
              <span className={`text-[11px] font-semibold ${mongoStatus?.connected ? 'text-emerald-300' : 'text-amber-300'}`}>
                {mongoStatus?.connected ? 'Live Connected' : 'Local Fallback'}
              </span>
              <span className={`w-2 h-2 rounded-full ${mongoStatus?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            </div>
            <span className="text-[10px] text-amber-200/80 font-mono block">
              DB: {mongoStatus?.activeDatabase || 'crm_portal'}
            </span>
          </div>
          <button
            onClick={refreshMongoStatus}
            title="Refresh DB connection"
            className="p-1 hover:bg-white/10 rounded transition-colors ml-1"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-200" />
          </button>
        </div>
      </div>

      {/* Dynamic View for Admin Portal */}
      <div className="admin-view-content">
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
              if (filter === 'enrolled') onNavigate('students');
              else onNavigate('leads');
            }}
            onNavigate={onNavigate}
            onSelectSource={() => {}}
            onSelectCountry={() => {}}
          />
        )}

        {currentRoute === 'leads' && (
          <LeadsView
            leads={leads}
            selectedLead={selectedLead}
            onAddNewLead={onAddNewLead}
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
          <StudentsView onNavigate={onNavigate} />
        )}

        {currentRoute === 'reports' && (
          <ReportsView analytics={analytics} leads={leads} />
        )}

        {currentRoute === 'settings' && (
          <SettingsView />
        )}

        {currentRoute === 'history' && (
          <HistoryView />
        )}
      </div>
    </div>
  );
};
