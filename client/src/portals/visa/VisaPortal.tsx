import React from 'react';
import { PortalProps } from '../types';
import { VisaProcessView } from '../../views/VisaProcessView';
import { PreEnrolmentView } from '../../views/PreEnrolmentView';
import { DovCimeaView } from '../../views/DovCimeaView';
import { PreDepartureView } from '../../views/PreDepartureView';
import { StudentsView } from '../../views/StudentsView';
import { HistoryView } from '../../views/HistoryView';
import { Plane, ClipboardCheck, Stamp, Compass, ShieldCheck, History } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';

export const VisaPortal: React.FC<PortalProps> = ({
  currentRoute,
  onNavigate,
  onOpenPhone,
  onOpenWhatsApp,
  onOpenEmail,
  onScheduleFollowUp,
}) => {
  const { students: workflowStudents, advanceStudentStage } = useWorkflow();

  return (
    <div className="visa-portal-container space-y-3 p-2.5 sm:p-4 max-w-[1536px] mx-auto select-none">
      {/* Visa Portal Header */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-700 to-indigo-800 rounded-xl p-3 sm:p-4 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold leading-tight">Visa &amp; Pre-Departure Operations</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white">
                Legalization &amp; Travel
              </span>
            </div>
            <p className="text-xs text-cyan-100 mt-0.5">
              Universitaly pre-enrolment, DOV/CIMEA legalization, VFS slots &amp; Italian residence permit
            </p>
          </div>
        </div>

        {/* Quick Stage Shortcuts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <button
            onClick={() => onNavigate('visa-process')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              currentRoute === 'visa-process' || currentRoute === 'dashboard' || !currentRoute ? 'bg-white text-blue-900 shadow-sm' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span>Visa Process</span>
          </button>
          <button
            onClick={() => onNavigate('pre-enrolment')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              currentRoute === 'pre-enrolment' ? 'bg-white text-blue-900 shadow-sm' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Universitaly</span>
          </button>
          <button
            onClick={() => onNavigate('dov-cimea')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              currentRoute === 'dov-cimea' ? 'bg-white text-blue-900 shadow-sm' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Stamp className="w-3.5 h-3.5" />
            <span>DOV / CIMEA</span>
          </button>
          <button
            onClick={() => onNavigate('pre-departure')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              currentRoute === 'pre-departure' ? 'bg-white text-blue-900 shadow-sm' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Arrival Ready</span>
          </button>
          <button
            onClick={() => onNavigate('history')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              currentRoute === 'history' ? 'bg-white text-blue-900 shadow-sm' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Profile History</span>
          </button>
        </div>
      </div>

      {/* Dynamic View for Visa Portal */}
      <div className="visa-view-content">
        {(currentRoute === 'visa-process' || currentRoute === 'dashboard' || !currentRoute) && (
          <VisaProcessView
            students={workflowStudents}
            onAdvanceStage={advanceStudentStage}
            onNavigate={onNavigate}
            onOpenPhone={onOpenPhone}
            onOpenWhatsApp={onOpenWhatsApp}
            onOpenEmail={onOpenEmail}
            onScheduleFollowUp={onScheduleFollowUp}
          />
        )}
        {currentRoute === 'pre-enrolment' && (
          <PreEnrolmentView
            students={workflowStudents}
            onAdvanceStage={advanceStudentStage}
            onNavigate={onNavigate}
            onOpenPhone={onOpenPhone}
            onOpenWhatsApp={onOpenWhatsApp}
            onOpenEmail={onOpenEmail}
            onScheduleFollowUp={onScheduleFollowUp}
          />
        )}
        {currentRoute === 'dov-cimea' && (
          <DovCimeaView
            students={workflowStudents}
            onAdvanceStage={advanceStudentStage}
            onNavigate={onNavigate}
            onOpenPhone={onOpenPhone}
            onOpenWhatsApp={onOpenWhatsApp}
            onOpenEmail={onOpenEmail}
            onScheduleFollowUp={onScheduleFollowUp}
          />
        )}
        {currentRoute === 'pre-departure' && (
          <PreDepartureView
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
        {currentRoute === 'history' && <HistoryView />}
      </div>
    </div>
  );
};
