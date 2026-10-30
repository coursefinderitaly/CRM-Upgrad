import React from 'react';
import { AnalyticsData, Lead, Task } from '../types/crm';

export interface PortalProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  selectedLead: Lead | null;
  setSelectedLead: (lead: Lead | null) => void;
  analytics: AnalyticsData;
  tasks: Task[];
  tabCounts: Record<string, number>;
  activeTab: string;
  onTabChange: (tab: string) => void;
  // Common action handlers
  onOpenPhone: (lead: Lead) => void;
  onOpenWhatsApp: (lead: Lead) => void;
  onOpenEmail: (lead: Lead) => void;
  onScheduleFollowUp: (lead: Lead) => void;
  onBookCounsellingSession?: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onEnrollLead: (lead: Lead) => void;
  onTransferDocs: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
  onAddNote: (leadId: string, note: string) => void;
  onUpdateStatus: (leadId: string, newStatus: string) => void;
  onToggleTask: (taskId: string) => void;
  onAddTask: () => void;
  onAddNewLead: () => void;
  onOpenStudentProfile?: (studentIdOrLeadId: string) => void;
  onOpenMetaSheetModal?: (options?: { viewOnly?: boolean }) => void;
  tableMode: 'table' | 'kanban';
  setTableMode: (mode: 'table' | 'kanban') => void;
}
