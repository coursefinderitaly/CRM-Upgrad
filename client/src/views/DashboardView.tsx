import React from 'react';
import { AnalyticsData, Lead, Task } from '../types/crm';
import { KpiCardsRow } from '../components/dashboard/KpiCardsRow';
import { LeadManagementTable } from '../components/dashboard/LeadManagementTable';
import { LeadDetailsPanel } from '../components/dashboard/LeadDetailsPanel';
import { TodaysTasksWidget } from '../components/dashboard/TodaysTasksWidget';
import { CounsellingSummaryChart } from '../components/dashboard/CounsellingSummaryChart';
import { LeadSourceBreakdownWidget } from '../components/dashboard/LeadSourceBreakdownWidget';
import { CountryInterestWidget } from '../components/dashboard/CountryInterestWidget';

interface DashboardViewProps {
  analytics?: AnalyticsData;
  leads: Lead[];
  tabCounts: Record<string, number>;
  activeTab: string;
  onTabChange: (tab: string) => void;
  selectedLead: Lead | null;
  onSelectLead: (lead: Lead) => void;
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onAddTask: () => void;
  onViewAllTasks: () => void;
  onViewReports: () => void;
  onOpenPhone: (lead: Lead) => void;
  onOpenWhatsApp: (lead: Lead) => void;
  onOpenEmail: (lead: Lead) => void;
  onScheduleFollowUp: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onEnrollLead: (lead: Lead) => void;
  onTransferDocs: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
  onAddNote: (leadId: string, note: string) => void;
  viewMode: 'table' | 'kanban';
  onViewModeChange: (mode: 'table' | 'kanban') => void;
  onUpdateStatus: (leadId: string, newStatus: string) => void;
  onKpiClick: (filter: string) => void;
  onNavigate?: (route: string) => void;
  onSelectSource: (source: string) => void;
  onSelectCountry: (country: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analytics,
  leads,
  tabCounts,
  activeTab,
  onTabChange,
  selectedLead,
  onSelectLead,
  tasks,
  onToggleTask,
  onAddTask,
  onViewAllTasks,
  onViewReports,
  onOpenPhone,
  onOpenWhatsApp,
  onOpenEmail,
  onScheduleFollowUp,
  onEditLead,
  onEnrollLead,
  onTransferDocs,
  onDeleteLead,
  onAddNote,
  viewMode,
  onViewModeChange,
  onUpdateStatus,
  onKpiClick,
  onNavigate,
  onSelectSource,
  onSelectCountry,
}) => {
  return (
    <div className="p-3 space-y-2.5 max-w-[1536px] mx-auto select-none">
      {/* 1. Seven KPI Cards Row */}
      <KpiCardsRow analytics={analytics} onKpiClick={onKpiClick} onNavigate={onNavigate} />

      {/* 2. Main Dashboard Layout (Left ~72% / Right ~28%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-start">
        {/* Left Section (8 cols out of 12 ~ 70%) */}
        <div className="lg:col-span-8 xl:col-span-8 flex flex-col space-y-2.5">
          {/* Main Lead Management Table */}
          <LeadManagementTable
            leads={leads}
            activeTab={activeTab}
            onTabChange={onTabChange}
            tabCounts={tabCounts}
            selectedLeadId={selectedLead?.id || ''}
            onSelectLead={onSelectLead}
            onOpenPhone={onOpenPhone}
            onOpenWhatsApp={onOpenWhatsApp}
            onScheduleFollowUp={onScheduleFollowUp}
            onEditLead={onEditLead}
            onEnrollLead={onEnrollLead}
            onTransferDocs={onTransferDocs}
            onDeleteLead={onDeleteLead}
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
            onUpdateStatus={onUpdateStatus}
          />

          {/* Widgets Grid: 2 rows × 2 cols */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-stretch">
            {/* Row 1 Left: Today's Tasks */}
            <div className="md:col-span-5 min-h-[260px] flex">
              <TodaysTasksWidget
                tasks={tasks}
                onToggleTask={onToggleTask}
                onViewAll={onViewAllTasks}
                onAddTask={onAddTask}
              />
            </div>

            {/* Row 1 Right: Counselling Summary (This Month) */}
            <div className="md:col-span-7 min-h-[260px] flex">
              <CounsellingSummaryChart
                data={analytics?.counsellingSummary}
                onViewReports={onViewReports}
                onBarClick={(entry) => {
                  if (entry?.name) onTabChange(entry.name);
                }}
              />
            </div>


            {/* Row 2 Left: Lead Source Breakdown */}
            <div className="md:col-span-5 min-h-[290px] flex">
              <LeadSourceBreakdownWidget
                sources={analytics?.leadSources}
                onSelectSource={onSelectSource}
              />
            </div>

            {/* Row 2 Right: Country Interest (Leads) */}
            <div className="md:col-span-7 min-h-[290px] flex">
              <CountryInterestWidget
                data={analytics?.countryInterest}
                onSelectCountry={onSelectCountry}
              />
            </div>
          </div>
        </div>

        {/* Right Section: Lead Details Panel */}
        <div className="lg:col-span-4 xl:col-span-4 sticky top-[65px]">
          <LeadDetailsPanel
            lead={selectedLead}
            onOpenPhone={onOpenPhone}
            onEditLead={onEditLead}
            onEnrollLead={onEnrollLead}
            onScheduleFollowUp={onScheduleFollowUp}
            onOpenEmail={onOpenEmail}
            onOpenWhatsApp={onOpenWhatsApp}
            onTransferDocs={onTransferDocs}
            onAddNote={onAddNote}
          />
        </div>
      </div>
    </div>
  );
};
