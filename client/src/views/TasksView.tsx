import React from 'react';
import { CheckSquare, Plus } from 'lucide-react';
import { Task } from '../types/crm';

interface TasksViewProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onAddTask: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onToggleTask,
  onAddTask,
}) => {
  return (
    <div className="p-4 space-y-4 max-w-[1536px] mx-auto select-none">
      <div className="bg-white p-3.5 rounded-[8px] border border-[#e5edf5] flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-bold text-[#101d37]">Task Management Board</h1>
          <p className="text-[11.5px] text-[#52627a]">
            Counsellor daily workflow, student follow-ups, and documentation tasks
          </p>
        </div>
        <button
          onClick={onAddTask}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#087cf5] hover:bg-[#006ee6] text-white rounded text-xs font-semibold shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>
      </div>

      <div className="bg-white rounded-[8px] border border-[#e5edf5] shadow-crm-card p-3 space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center justify-between p-3 rounded border border-slate-100 transition-colors ${
              task.completed ? 'bg-slate-50 opacity-60' : 'hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggleTask(task.id)}
                className="w-4 h-4 rounded text-[#087cf5] focus:ring-0 cursor-pointer"
              />
              <div>
                <div
                  className={`font-semibold text-[13px] text-[#101d37] ${
                    task.completed ? 'line-through text-slate-400' : ''
                  }`}
                >
                  {task.title}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{task.subtitle}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-500">{task.time}</span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  task.completed
                    ? 'bg-slate-200 text-slate-700'
                    : task.dueStatus === 'Due Now'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {task.completed ? 'Completed' : task.dueStatus}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
