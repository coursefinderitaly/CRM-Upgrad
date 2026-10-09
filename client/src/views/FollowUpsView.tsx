import React from 'react';
import { History, Phone, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { Lead } from '../types/crm';

interface FollowUpsViewProps {
  leads: Lead[];
  onOpenPhone: (lead: Lead) => void;
  onOpenWhatsApp: (lead: Lead) => void;
  onScheduleFollowUp: (lead: Lead) => void;
}

export const FollowUpsView: React.FC<FollowUpsViewProps> = ({
  leads,
  onOpenPhone,
  onOpenWhatsApp,
  onScheduleFollowUp,
}) => {
  return (
    <div className="p-4 space-y-4 max-w-[1536px] mx-auto select-none">
      <div className="bg-white p-3.5 rounded-[8px] border border-[#e5edf5] flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-bold text-[#101d37]">Follow-up Schedule</h1>
          <p className="text-[11.5px] text-[#52627a]">
            Calls, document collection reminders, and upcoming counselling engagements
          </p>
        </div>
        <div className="text-xs font-bold px-3 py-1 bg-red-50 text-red-600 rounded-full border border-red-200">
          5 Urgent Actions Today
        </div>
      </div>

      <div className="bg-white rounded-[8px] border border-[#e5edf5] shadow-crm-card divide-y divide-slate-100">
        {leads.slice(0, 10).map((l) => (
          <div key={l.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-50 text-[#087cf5] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                {l.studentName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[13px] text-[#101d37]">{l.studentName}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                    {l.countryInterest}
                  </span>
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Task: <span className="font-medium text-slate-800">{l.nextFollowUpTask || 'Call to discuss university options'}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {l.phone} • Last Contact: {l.lastActivity}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs font-bold text-red-600">{l.nextFollowUp}</div>
                <div className="text-[10.5px] text-slate-500">{l.nextFollowUpTime || '11:00 AM'}</div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenPhone(l)}
                  className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded shadow-xs"
                  title="Call"
                >
                  <Phone className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onScheduleFollowUp(l)}
                  className="px-2.5 py-1 bg-[#087cf5] hover:bg-[#006ee6] text-white rounded text-xs font-semibold shadow-xs"
                >
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
