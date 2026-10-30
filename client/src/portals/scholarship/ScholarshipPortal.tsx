import React from 'react';
import { PortalProps } from '../types';
import { ScholarshipView } from '../../views/ScholarshipView';
import { StudentsView } from '../../views/StudentsView';
import { ResourcesView } from '../../views/ResourcesView';
import { ReportsView } from '../../views/ReportsView';
import { HistoryView } from '../../views/HistoryView';
import { Sparkles, DollarSign, Award, Calendar, BookOpen, History } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';

export const ScholarshipPortal: React.FC<PortalProps> = ({
  currentRoute,
  onNavigate,
  analytics,
  leads,
  onOpenPhone,
  onOpenWhatsApp,
  onOpenEmail,
  onScheduleFollowUp,
}) => {
  const { students: workflowStudents, advanceStudentStage } = useWorkflow();

  return (
    <div className="scholarship-portal-container space-y-3 p-2.5 sm:p-4 max-w-[1536px] mx-auto select-none">
      {/* Scholarship Portal Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-800 rounded-xl p-3 sm:p-4 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold leading-tight">Scholarship &amp; Financial Aid Portal</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white">
                DSU • ER.GO • ALiSEO
              </span>
            </div>
            <p className="text-xs text-emerald-100 mt-0.5">
              Regional Italian grant eligibility, ISEE Parificato documentation &amp; stipend disbarment
            </p>
          </div>
        </div>

        {/* Quick Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <button
            onClick={() => onNavigate('scholarship')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              currentRoute === 'scholarship' || currentRoute === 'dashboard' || !currentRoute ? 'bg-white text-emerald-900 shadow-sm' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Scholarship Roster</span>
          </button>
          <button
            onClick={() => onNavigate('students')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              currentRoute === 'students' ? 'bg-white text-emerald-900 shadow-sm' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Eligible Students</span>
          </button>
          <button
            onClick={() => onNavigate('resources')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              currentRoute === 'resources' ? 'bg-white text-emerald-900 shadow-sm' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>ISEE Guidelines</span>
          </button>
          <button
            onClick={() => onNavigate('history')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              currentRoute === 'history' ? 'bg-white text-emerald-900 shadow-sm' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Profile History</span>
          </button>
        </div>
      </div>

      {/* Dynamic View for Scholarship Portal */}
      <div className="scholarship-view-content">
        {(currentRoute === 'scholarship' || currentRoute === 'dashboard' || !currentRoute) && (
          <ScholarshipView
            students={workflowStudents}
            onAdvanceStage={advanceStudentStage}
            onNavigate={onNavigate}
            onOpenPhone={onOpenPhone}
            onOpenWhatsApp={onOpenWhatsApp}
            onOpenEmail={onOpenEmail}
            onScheduleFollowUp={onScheduleFollowUp}
          />
        )}
        {currentRoute === 'students' && (
          <StudentsView
            onNavigate={onNavigate}
            onOpenPhone={onOpenPhone}
            onOpenWhatsApp={onOpenWhatsApp}
            onOpenEmail={onOpenEmail}
            onScheduleFollowUp={onScheduleFollowUp}
          />
        )}
        {currentRoute === 'resources' && <ResourcesView onNavigate={onNavigate} />}
        {currentRoute === 'reports' && <ReportsView analytics={analytics} leads={leads} />}
        {currentRoute === 'history' && <HistoryView />}
      </div>
    </div>
  );
};
