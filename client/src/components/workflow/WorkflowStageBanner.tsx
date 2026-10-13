import React from 'react';
import { ArrowRight, Inbox } from 'lucide-react';
import {
  PipelineStage,
  getNextStageForStudent,
  PIPELINE_STAGES,
} from '../../context/WorkflowContext';
import { StudentRecord } from '../../services/studentsData';

interface WorkflowStageBannerProps {
  stage: PipelineStage;
  students: StudentRecord[];
  selectedId: string | null;
  onSelect: (studentId: string) => void;
  onAdvance: (studentId: string) => void;
  onEmptyAction?: () => void;
  emptyActionLabel?: string;
  emptyHint?: string;
}

/**
 * Shared pipeline banner used by every stage workspace (Counselling, Documentation,
 * Shortlisting, Applications). Shows who currently sits at the stage, lets the user
 * switch the active profile and push it forward to the next stage.
 */
export const WorkflowStageBanner: React.FC<WorkflowStageBannerProps> = ({
  stage,
  students,
  selectedId,
  onSelect,
  onAdvance,
  onEmptyAction,
  emptyActionLabel,
  emptyHint,
}) => {
  const selected = students.find((s) => s.id === selectedId) || students[0];
  const stageIdx = PIPELINE_STAGES.findIndex((s) => s.id === stage.id);
  const nextStage =
    stageIdx >= 0 && stageIdx < PIPELINE_STAGES.length - 1
      ? PIPELINE_STAGES[stageIdx + 1]
      : selected
      ? getNextStageForStudent(selected)
      : undefined;

  return (
    <div className="bg-white rounded-[8px] border border-[#e5edf5] shadow-xs px-3 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${stage.dotClass}`} />
            <span className="text-[12px] font-bold text-[#101d37]">{stage.label}</span>
            <span className={`px-1.5 py-0.5 rounded-full border text-[10px] font-bold ${stage.badgeClass}`}>
              {students.length}
            </span>
          </div>

          {students.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {students.map((st) => {
                const isActive = selected?.id === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => onSelect(st.id)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10.5px] font-semibold transition-colors ${
                      isActive
                        ? 'bg-[#087cf5] border-[#087cf5] text-white'
                        : 'bg-[#f8fafc] border-[#e2e8f0] text-[#52627a] hover:border-[#087cf5]/40 hover:text-[#101d37]'
                    }`}
                  >
                    <img
                      src={st.avatar}
                      alt={st.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/avatars/row_rahul.png';
                      }}
                      className="w-4 h-4 aspect-square rounded-full object-cover border border-white/60 shrink-0"
                    />
                    <span>{st.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {students.length > 0 ? (
          nextStage ? (
            <button
              onClick={() => selected && onAdvance(selected.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[#087cf5] hover:bg-[#006ee6] text-white text-[11.5px] font-semibold shadow-xs transition-colors"
            >
              <span>Send to {nextStage.label}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-[5px]">
              End of current pipeline
            </span>
          )
        ) : (
          <div className="flex items-center gap-2 text-[11px] text-[#64748b]">
            <Inbox className="w-3.5 h-3.5" />
            <span>{emptyHint || `No students currently in ${stage.label}.`}</span>
            {onEmptyAction && (
              <button
                onClick={onEmptyAction}
                className="text-[11px] font-semibold text-[#087cf5] hover:underline"
              >
                {emptyActionLabel || 'Go to Leads'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
