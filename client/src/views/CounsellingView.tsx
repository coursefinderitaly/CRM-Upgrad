import React, { useEffect, useState } from 'react';
import { Headphones, Calendar, Clock, User, CheckCircle2, Plus } from 'lucide-react';
import { Lead } from '../types/crm';

interface CounsellingViewProps {
  leads: Lead[];
  onScheduleFollowUp: (lead: Lead) => void;
  onOpenPhone: (lead: Lead) => void;
}

export const CounsellingView: React.FC<CounsellingViewProps> = ({
  leads,
  onScheduleFollowUp,
  onOpenPhone,
}) => {
  const counsellingLeads = leads.filter((l) => l.status === 'Counselling');

  return (
    <div className="p-4 space-y-4 max-w-[1536px] mx-auto select-none">
      <div className="bg-white p-3.5 rounded-[8px] border border-[#e5edf5] flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-bold text-[#101d37]">Counselling Desk</h1>
          <p className="text-[11.5px] text-[#52627a]">
            Active counselling sessions, course advisories, and eligibility evaluations
          </p>
        </div>
        <div className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
          {counsellingLeads.length} Students in Counselling
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {counsellingLeads.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-[8px] border border-[#e5edf5] p-3.5 shadow-crm-card space-y-3 hover:border-[#087cf5] transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                {item.leadId}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {item.nextFollowUp} {item.nextFollowUpTime || '12:30 PM'}
              </span>
            </div>

            <div>
              <div className="text-[14px] font-bold text-[#101d37]">{item.studentName}</div>
              <div className="text-[11px] text-slate-500">{item.phone} • {item.email}</div>
            </div>

            <div className="bg-[#f8fafc] p-2.5 rounded text-xs space-y-1 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Destination:</span>
                <span className="font-semibold text-slate-800">{item.countryInterest}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Course Preference:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[160px]">{item.courseInterest}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Language Test:</span>
                <span className="font-semibold text-slate-800">{item.testType || 'IELTS'} ({item.testOverallScore || 'In Prep'})</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 bg-blue-50/50 p-2 rounded border border-blue-100">
              <span className="font-semibold text-blue-900 block text-[10.5px]">Counsellor Focus:</span>
              {item.notes || 'Evaluating university options & budget constraints.'}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <button
                onClick={() => onOpenPhone(item)}
                className="text-xs text-green-600 hover:underline font-semibold flex items-center gap-1"
              >
                Call Student
              </button>
              <button
                onClick={() => onScheduleFollowUp(item)}
                className="text-xs text-[#087cf5] hover:underline font-semibold flex items-center gap-1"
              >
                Schedule Follow-up
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
