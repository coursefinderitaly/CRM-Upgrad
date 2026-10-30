import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, Trash2, ArrowLeft, FolderX, FileWarning } from 'lucide-react';
import { Lead } from '../../types/crm';

interface DeleteLeadModalProps {
  isOpen: boolean;
  lead: Lead | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: (lead: Lead) => void;
}

export const DeleteLeadModal: React.FC<DeleteLeadModalProps> = ({
  isOpen,
  lead,
  deleting,
  onClose,
  onConfirm,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [acknowledged, setAcknowledged] = useState(false);

  // Reset to step 1 every time the modal opens (or the target changes)
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setAcknowledged(false);
    }
  }, [isOpen, lead?.id]);

  if (!isOpen || !lead) return null;

  const initials = lead.studentName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-red-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#101d37]">
                {step === 1 ? 'Delete this profile?' : 'Final confirmation'}
              </h3>
              <p className="text-[11px] text-[#52627a]">
                {step === 1 ? 'Step 1 of 2 — review what will be removed' : 'Step 2 of 2 — this cannot be undone'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={deleting}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {/* Profile summary */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#07182c] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#101d37] truncate">{lead.studentName}</p>
              <p className="text-[11px] text-[#52627a] truncate font-mono">
                {lead.leadId} • {lead.phone} • {lead.email}
              </p>
            </div>
          </div>

          {step === 1 ? (
            <>
              <div className="space-y-2 text-[12.5px] text-[#101d37] mb-5">
                <p className="font-semibold">The following will be permanently removed:</p>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2">
                    <Trash2 className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                    <span>Lead profile, tasks, follow-ups, documents, applications &amp; notes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FolderX className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                    <span>Student folder on disk (documents, database file)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileWarning className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <span>A record of this deletion is kept in History &amp; Audit Trail</span>
                  </li>
                </ul>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 text-xs font-medium text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Continue
                </button>
              </div>
            </>
          ) : (
            <>
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 cursor-pointer mb-5">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-red-600 shrink-0"
                />
                <span className="text-[12.5px] text-[#101d37] leading-snug">
                  I understand that deleting <strong>{lead.studentName}</strong> (
                  <span className="font-mono">{lead.leadId}</span>) is{' '}
                  <strong>permanent</strong> and the profile, files and disk folder cannot be recovered.
                </span>
              </label>
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={deleting}
                  className="px-4 py-2 border border-slate-300 text-xs font-medium text-slate-600 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
                <button
                  type="button"
                  disabled={!acknowledged || deleting}
                  onClick={() => onConfirm(lead)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {deleting ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  {deleting ? 'Deleting...' : 'Delete permanently'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
