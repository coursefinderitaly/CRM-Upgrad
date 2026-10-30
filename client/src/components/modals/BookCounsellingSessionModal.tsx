import React, { useEffect, useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, BookOpen, User, Video, MapPin, Phone } from 'lucide-react';
import { bookCounsellingSession } from '../../services/api';
import { Lead } from '../../types/crm';
import { useAuth } from '../../context/AuthContext';

interface BookCounsellingSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSuccess: () => void;
}

const todayLabel = () =>
  new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export const BookCounsellingSessionModal: React.FC<BookCounsellingSessionModalProps> = ({
  isOpen,
  onClose,
  lead,
  onSuccess,
}) => {
  const { user, activePortal } = useAuth();
  const [date, setDate] = useState(todayLabel());
  const [time, setTime] = useState('11:00 AM');
  const [sessionType, setSessionType] = useState('1-on-1 Consultation');
  const [mode, setMode] = useState('Video Call');
  const [notes, setNotes] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setDate(todayLabel());
    setTime('11:00 AM');
    setSessionType('1-on-1 Consultation');
    setMode('Video Call');
    setNotes('');
    setRecommendations('');
    setError(null);
  }, [isOpen, lead?.id]);

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const updated = await bookCounsellingSession(
        lead.leadId || lead.id,
        {
          session_date: date,
          session_time: time,
          counsellor_name: user?.name || lead.counsellor?.name || 'Neha Sharma',
          session_type: sessionType,
          mode,
          status: 'Scheduled',
          notes,
          recommendations,
        },
        {
          name: user?.name || 'Staff Operator',
          email: user?.email,
          role: activePortal?.role || 'counsellor',
          portal: activePortal?.title || 'Counsellor Portal',
        }
      );
      if (!updated) throw new Error('Could not save the counselling session to the student profile database.');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to book counselling session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-[10px] shadow-2xl border border-[#e5edf5] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {error && (
          <div className="bg-red-50 border-b border-red-200 text-red-700 text-xs px-5 py-2 font-medium">
            {error}
          </div>
        )}

        <div className="px-5 py-3.5 border-b border-[#e5edf5] flex items-center justify-between bg-blue-50/60">
          <div>
            <h2 className="text-[14.5px] font-bold text-[#101d37] flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#087cf5]" /> Book Counselling Session
            </h2>
            <p className="text-[11px] text-[#52627a]">
              Saved in the student profile database for {lead.studentName} ({lead.leadId})
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded text-[#64748b] hover:bg-slate-200/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1 flex items-center gap-1">
                <CalendarIcon className="w-3 h-3 text-[#087cf5]" /> Session Date
              </label>
              <input
                type="text"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. 10 Oct 2025"
                className="w-full p-2 border border-[#cbd5e1] rounded-[6px] outline-none focus:ring-1 focus:ring-[#087cf5]"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#087cf5]" /> Session Time
              </label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 11:00 AM"
                className="w-full p-2 border border-[#cbd5e1] rounded-[6px] outline-none focus:ring-1 focus:ring-[#087cf5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1 flex items-center gap-1">
                <User className="w-3 h-3 text-[#087cf5]" /> Session Type
              </label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="w-full p-2 border border-[#cbd5e1] rounded-[6px] bg-white outline-none focus:ring-1 focus:ring-[#087cf5]"
              >
                <option value="1-on-1 Consultation">1-on-1 Consultation</option>
                <option value="Parent Consultation">Parent Consultation</option>
                <option value="Academic Review">Academic Review</option>
                <option value="University Guidance">University Guidance</option>
                <option value="Visa & Documentation Review">Visa &amp; Documentation Review</option>
              </select>
            </div>
            <div>
              <label className="font-semibold block mb-1 flex items-center gap-1">
                <Video className="w-3 h-3 text-[#087cf5]" /> Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full p-2 border border-[#cbd5e1] rounded-[6px] bg-white outline-none focus:ring-1 focus:ring-[#087cf5]"
              >
                <option value="Video Call">Video Call</option>
                <option value="Phone Call">Phone Call</option>
                <option value="In Person">In Person</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1 flex items-center gap-1">
              <Phone className="w-3 h-3 text-[#087cf5]" /> Agenda / Session Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="University options, eligibility, budget, documents..."
              className="w-full p-2 border border-[#cbd5e1] rounded-[6px] outline-none focus:ring-1 focus:ring-[#087cf5] resize-y"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#087cf5]" /> Agreed Action Items / Recommendations
            </label>
            <input
              type="text"
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              placeholder="e.g. Shortlist 4 public universities and collect transcripts"
              className="w-full p-2 border border-[#cbd5e1] rounded-[6px] outline-none focus:ring-1 focus:ring-[#087cf5]"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#cbd5e1] rounded-[6px] text-[#52627a] hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#087cf5] hover:bg-[#006ee6] text-white rounded-[6px] font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Book Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
