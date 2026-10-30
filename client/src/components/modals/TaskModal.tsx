import React, { useState } from 'react';
import { X, CheckSquare } from 'lucide-react';
import { createTask } from '../../services/api';
import { Task } from '../../types/crm';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (task: Task) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [time, setTime] = useState('02:00 PM');
  const [dueDate, setDueDate] = useState('10 Oct 2025');
  const [priority, setPriority] = useState('High');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const task = await createTask({
        title,
        subtitle,
        time,
        dueDate,
        dueStatus: 'Upcoming',
        priority,
      });
      onSuccess(task);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-[10px] shadow-2xl border border-[#e5edf5] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {error && (
          <div className="bg-red-50 border-b border-red-200 text-red-700 text-xs px-5 py-2 font-medium">
            {error}
          </div>
        )}
        <div className="px-5 py-3.5 border-b border-[#e5edf5] flex items-center justify-between bg-slate-50/60">

          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#087cf5]" />
            <h2 className="text-[14.5px] font-bold text-[#101d37]">Add New Task</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded text-[#64748b] hover:bg-slate-200/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="font-semibold block mb-1">Task Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Call Arjun Verma"
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Description / Subtitle</label>
            <input
              type="text"
              required
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Discuss documents list"
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Time</label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="11:00 AM"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2 border rounded bg-white"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded text-[#52627a] hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#087cf5] hover:bg-[#006ee6] text-white rounded font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
