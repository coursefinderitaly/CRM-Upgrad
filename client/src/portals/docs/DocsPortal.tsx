import React from 'react';
import { PortalProps } from '../types';
import { DocumentationView } from '../../views/DocumentationView';
import { ApplicationsView } from '../../views/ApplicationsView';
import { OfferLettersView } from '../../views/OfferLettersView';
import { FinalUniversityView } from '../../views/FinalUniversityView';
import { StudentsView } from '../../views/StudentsView';
import { ResourcesView } from '../../views/ResourcesView';
import { HistoryView } from '../../views/HistoryView';
import { FileCheck2, Send, Award, Building2, CheckCircle2, History, Users } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';

export const DocsPortal: React.FC<PortalProps> = ({
  currentRoute,
  onNavigate,
  onOpenPhone,
  onOpenWhatsApp,
  onOpenEmail,
  onScheduleFollowUp,
}) => {
  const { students: workflowStudents, advanceStudentStage } = useWorkflow();

  return (
    <div className="docs-portal-container space-y-3 p-2.5 sm:p-4 max-w-[1536px] mx-auto select-none">
      {/* Docs Portal Header */}
      <div className="bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-800 rounded-xl p-3 sm:p-4 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold leading-tight">Document &amp; Application Operations</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white">
                Dossier Verification
              </span>
            </div>
            <p className="text-xs text-violet-100 mt-0.5">
              Academic checklists, verification audit, university portal submissions &amp; offer letters
            </p>
          </div>
        </div>

        {/* Quick Stage Shortcuts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <button
            onClick={() => onNavigate('leads')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              currentRoute === 'leads' || currentRoute === 'students' ? 'bg-white text-violet-900 shadow-sm' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>My Students</span>
          </button>
          <button
            onClick={() => onNavigate('documentation')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              currentRoute === 'documentation' || !currentRoute ? 'bg-white text-violet-900 shadow-sm' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Dossiers</span>
          </button>
          <button
            onClick={() => onNavigate('applications')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              currentRoute === 'applications' ? 'bg-white text-violet-900 shadow-sm' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Applications</span>
          </button>
          <button
            onClick={() => onNavigate('offer-letters')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              currentRoute === 'offer-letters' ? 'bg-white text-violet-900 shadow-sm' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Offer Letters</span>
          </button>
          <button
            onClick={() => onNavigate('final-university')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              currentRoute === 'final-university' ? 'bg-white text-violet-900 shadow-sm' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Seat Confirm</span>
          </button>
          <button
            onClick={() => onNavigate('history')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              currentRoute === 'history' ? 'bg-white text-violet-900 shadow-sm' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Profile History</span>
          </button>
        </div>
      </div>

      {/* Dynamic View for Docs Portal */}
      <div className="docs-view-content">
        {(currentRoute === 'documentation' || currentRoute === 'dashboard' || !currentRoute) && (
          <DocumentationView
            students={workflowStudents}
            onAdvanceStage={advanceStudentStage}
            onNavigate={onNavigate}
          />
        )}
        {currentRoute === 'applications' && (
          <ApplicationsView
            students={workflowStudents}
            onAdvanceStage={advanceStudentStage}
            onNavigate={onNavigate}
          />
        )}
        {currentRoute === 'offer-letters' && (
          <OfferLettersView
            students={workflowStudents}
            onAdvanceStage={advanceStudentStage}
            onNavigate={onNavigate}
            onOpenPhone={onOpenPhone}
            onOpenWhatsApp={onOpenWhatsApp}
            onOpenEmail={onOpenEmail}
            onScheduleFollowUp={onScheduleFollowUp}
          />
        )}
        {currentRoute === 'final-university' && (
          <FinalUniversityView
            students={workflowStudents}
            onAdvanceStage={advanceStudentStage}
            onNavigate={onNavigate}
            onOpenPhone={onOpenPhone}
            onOpenWhatsApp={onOpenWhatsApp}
            onOpenEmail={onOpenEmail}
            onScheduleFollowUp={onScheduleFollowUp}
          />
        )}
        {(currentRoute === 'students' || currentRoute === 'leads') && (
          <StudentsView
            onNavigate={onNavigate}
            onOpenPhone={onOpenPhone}
            onOpenWhatsApp={onOpenWhatsApp}
            onOpenEmail={onOpenEmail}
            onScheduleFollowUp={onScheduleFollowUp}
          />
        )}
        {currentRoute === 'resources' && <ResourcesView onNavigate={onNavigate} />}
        {currentRoute === 'history' && <HistoryView />}
      </div>
    </div>
  );
};
