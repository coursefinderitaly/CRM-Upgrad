import React, { useState, useEffect } from 'react';
import { X, Mail, Send } from 'lucide-react';
import { sendEmail } from '../../services/api';
import { Lead } from '../../types/crm';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead | null;
}

export const EmailModal: React.FC<EmailModalProps> = ({
  isOpen,
  onClose,
  lead,
}) => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    if (lead) {
      setTo(lead.email || '');
      setSubject(`Study Abroad Guidance — ${lead.countryInterest} / ${lead.courseInterest}`);
      setMessage(
        `Dear ${lead.studentName},\n\nThank you for reaching out to Study Abroad CRM regarding your interest in studying in ${lead.countryInterest}.\n\nOur team has reviewed your profile for ${lead.courseInterest} (${lead.intake || 'Upcoming Intake'}). Please let us know your convenient time for a detailed counselling session.\n\nWarm regards,\nNeha Sharma\nSenior Study Abroad Counsellor`
      );
      setSentSuccess(false);
    } else {
      setTo('');
      setSubject('Study Abroad Guidance');
      setMessage('Hello,\n\nPlease find details attached.\n\nBest regards,\nStudy Abroad Team');
      setSentSuccess(false);
    }
  }, [lead, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendEmail({
        leadId: lead?.id,
        to,
        subject,
        message,
      });
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-[10px] shadow-2xl border border-[#e5edf5] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {sentSuccess && (
          <div className="bg-emerald-500 text-white text-xs font-semibold px-4 py-2 text-center animate-in fade-in">
            ✓ Email dispatched successfully and logged to student activity history!
          </div>
        )}

        <div className="px-5 py-3.5 border-b border-[#e5edf5] flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#087cf5]" />
            <h2 className="text-[14.5px] font-bold text-[#101d37]">Compose Email</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded text-[#64748b] hover:bg-slate-200/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSend} className="p-5 space-y-3 text-xs">
          <div>
            <label className="font-semibold block mb-1">To Email</label>
            <input
              type="email"
              required
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">Subject</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">Message Body</label>
            <textarea
              rows={6}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border rounded outline-none focus:border-[#087cf5]"
            />
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
              className="px-5 py-2 bg-[#087cf5] hover:bg-[#006ee6] text-white rounded font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Sending...' : 'Send Email'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
