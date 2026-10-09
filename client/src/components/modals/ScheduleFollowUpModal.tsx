import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { scheduleFollowUp } from '../../services/api';
import { Lead } from '../../types/crm';

interface ScheduleFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSuccess: (updatedLead: Lead) => void;
}

export const ScheduleFollowUpModal: React.FC<ScheduleFollowUpModalProps> = ({
  isOpen,
  onClose,
  lead,
  onSuccess,
}) => {
  const [date, setDate] = useState('10 Oct 2025');
  const [time, setTime] = useState('11:00 AM');
  const [task, setTask] = useState('Call to discuss university options');
  const [reminder, setReminder] = useState('15 minutes before');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await scheduleFollowUp({
        leadId: lead.id,
        date,
        time,
        task,
        reminder,
      });
      const updated = {
        ...lead,
        nextFollowUp: date,
        nextFollowUpTime: time,
        nextFollowUpTask: task,
      };
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to schedule follow-up');
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
        <div className="px-5 py-3.5 border-b border-[#e5edf5] flex items-center justify-between bg-blue-50/60">
          <div>
            <h2 className="text-[14.5px] font-bold text-[#101d37]">Schedule Follow-up</h2>
            <p className="text-[11px] text-[#52627a]">For {lead.studentName} ({lead.leadId})</p>
          </div>
          <button onClick={onClose} className="p-1 rounded text-[#64748b] hover:bg-slate-200/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Follow-up Date</label>
              <input
                type="text"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. 10 Oct 2025"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Follow-up Time</label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 11:00 AM"
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">Agenda / Task Description</label>
            <input
              type="text"
              required
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="e.g. Call to discuss university options"
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Reminder Alert</label>
            <select
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              className="w-full p-2 border rounded bg-white"
            >
              <option value="15 minutes before">15 minutes before</option>
              <option value="30 minutes before">30 minutes before</option>
              <option value="1 hour before">1 hour before</option>
              <option value="1 day before">1 day before</option>
            </select>
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
              {loading ? 'Saving...' : 'Set Follow-up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
