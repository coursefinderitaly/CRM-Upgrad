import React, { useState } from 'react';
import { X, UserCheck, ShieldCheck } from 'lucide-react';
import { enrollLead } from '../../services/api';
import { Lead } from '../../types/crm';

interface EnrollStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSuccess: (updatedLead: Lead) => void;
}

export const EnrollStudentModal: React.FC<EnrollStudentModalProps> = ({
  isOpen,
  onClose,
  lead,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [feeStatus, setFeeStatus] = useState('Paid');
  const [enrollmentNotes, setEnrollmentNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !lead) return null;

  const handleEnroll = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await enrollLead(lead.id);
      onSuccess(res.lead);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to enroll student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-[10px] shadow-2xl border border-[#e5edf5] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {error && (
          <div className="bg-red-50 border-b border-red-200 text-red-700 text-xs px-4 py-2 font-medium">
            {error}
          </div>
        )}
        <div className="px-5 py-3.5 border-b border-[#e5edf5] flex items-center justify-between bg-emerald-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[14.5px] font-bold text-[#101d37]">Enrol Student</h2>
              <p className="text-[11px] text-[#52627a]">Convert lead to formal enrolled student</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-[#64748b] hover:bg-slate-200/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3.5 text-xs">
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <div className="font-bold text-[#101d37]">{lead.studentName}</div>
            <div className="text-slate-600 mt-0.5">
              {lead.phone} • {lead.countryInterest} • {lead.courseInterest}
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">Enrollment Fee Status</label>
            <select
              value={feeStatus}
              onChange={(e) => setFeeStatus(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded text-xs bg-white"
            >
              <option value="Paid">Received & Verified (₹ 25,000)</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Waived">Promotional Waiver</option>
            </select>
          </div>

          <div>
            <label className="font-semibold block mb-1">Documentation Handoff Note</label>
            <textarea
              rows={2}
              value={enrollmentNotes}
              onChange={(e) => setEnrollmentNotes(e.target.value)}
              placeholder="Instructions for Documentation Team..."
              className="w-full p-2 border border-slate-200 rounded text-xs outline-none focus:border-emerald-500"
            />
          </div>

          <div className="bg-emerald-50/70 p-2.5 rounded border border-emerald-200 text-emerald-800 text-[11px] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>
              Enrolling automatically generates Student ID, triggers the documentation verification checklist, and notifies the documentation team.
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded text-[#52627a] hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleEnroll}
              disabled={loading}
              className="px-5 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white rounded font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Enrolling...' : 'Confirm Enrollment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
