import React, { useState } from 'react';
import { X, FileText, ArrowRight } from 'lucide-react';
import { transferToDocs } from '../../services/api';
import { Lead } from '../../types/crm';

interface TransferDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSuccess: (updatedLead: Lead) => void;
}

export const TransferDocsModal: React.FC<TransferDocsModalProps> = ({
  isOpen,
  onClose,
  lead,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !lead) return null;

  const handleTransfer = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await transferToDocs(lead.id);
      onSuccess(res);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to transfer to documentation');
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
        <div className="px-5 py-3.5 border-b border-[#e5edf5] flex items-center justify-between bg-purple-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-[#7c3aed] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>

              <h2 className="text-[14.5px] font-bold text-[#101d37]">Transfer to Documentation</h2>
              <p className="text-[11px] text-[#52627a]">Assign dossier to documentation verification team</p>
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
            <label className="font-semibold block mb-1">Handoff Instructions / Missing Docs</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Passport received, pending 8th semester transcript and SOP review..."
              className="w-full p-2 border border-slate-200 rounded text-xs outline-none focus:border-purple-500"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded text-[#52627a] hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleTransfer}
              disabled={loading}
              className="px-5 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>{loading ? 'Transferring...' : 'Confirm Transfer'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
