import React from 'react';
import { Task } from '../../types/crm';
import { Plus } from 'lucide-react';

interface TodaysTasksWidgetProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onViewAll: () => void;
  onAddTask: () => void;
}

export const TodaysTasksWidget: React.FC<TodaysTasksWidgetProps> = ({
  tasks,
  onToggleTask,
  onViewAll,
  onAddTask,
}) => {
  return (
    <div className="bg-white rounded-[10px] border border-[#e5edf5] shadow-crm-card p-4 flex flex-col h-full w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#eef3f8] mb-2 shrink-0">
        <h3 className="text-[13.5px] font-bold text-[#101d37]">Today's Tasks</h3>
        <button
          onClick={onViewAll}
          className="text-[11.5px] text-[#087cf5] hover:underline font-semibold"
        >
          View All
        </button>
      </div>

      {/* Task List */}
      <div className="flex-1 space-y-1 overflow-y-auto min-h-0 flex flex-col justify-center">
        {tasks.length === 0 ? (
          <div className="text-center py-4 px-2">
            <p className="text-[12px] font-semibold text-[#64748b]">No tasks due today</p>
            <p className="text-[10.5px] text-[#94a3b8] mt-0.5">
              Scheduled follow-ups and student reminders will appear here.
            </p>
          </div>
        ) : (
          tasks.slice(0, 5).map((task) => {
            const isDueNow = task.dueStatus === 'Due Now';
            return (
              <div
                key={task.id}
                className={`flex items-center gap-2 px-1.5 py-1 rounded-[5px] transition-colors ${
                  task.completed ? 'bg-slate-50 opacity-60' : 'hover:bg-[#f8fafc]'
                }`}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggleTask(task.id)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-[#087cf5] focus:ring-0 cursor-pointer shrink-0"
                />

                {/* Title & Subtitle */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-[11.5px] font-semibold text-[#101d37] leading-tight truncate ${
                      task.completed ? 'line-through text-slate-400' : ''
                    }`}
                  >
                    {task.title}
                  </div>
                  <div className="text-[10px] text-[#52627a] leading-tight truncate mt-0.5">
                    {task.subtitle}
                  </div>
                </div>

                {/* Time & Due Status Chip */}
                <div className="text-right shrink-0 flex items-center gap-1.5">
                  <span className="text-[10.5px] text-[#52627a] font-medium whitespace-nowrap">
                    {task.time}
                  </span>

                  <span
                    className={`px-1.5 py-0.5 rounded-[4px] text-[9.5px] font-semibold whitespace-nowrap ${
                      task.completed
                        ? 'bg-slate-100 text-slate-500'
                        : isDueNow
                        ? 'bg-[#ffe4e6] text-[#e11d48]'
                        : 'bg-[#fef3c7] text-[#b45309]'
                    }`}
                  >
                    {task.completed ? 'Done' : task.dueStatus}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
