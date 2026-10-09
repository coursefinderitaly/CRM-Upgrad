import React from 'react';
import { Award, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';
import { Lead } from '../types/crm';

interface EnrolmentViewProps {
  leads: Lead[];
  onTransferDocs: (lead: Lead) => void;
  onSelectLead: (lead: Lead) => void;
}

export const EnrolmentView: React.FC<EnrolmentViewProps> = ({
  leads,
  onTransferDocs,
  onSelectLead,
}) => {
  const enrolledLeads = leads.filter((l) => l.isEnrolled || l.status === 'Enrolled');

  return (
    <div className="p-4 space-y-4 max-w-[1536px] mx-auto select-none">
      <div className="bg-white p-3.5 rounded-[8px] border border-[#e5edf5] flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-bold text-[#101d37]">Enrolment & Admission Desk</h1>
          <p className="text-[11.5px] text-[#52627a]">
            Formal enrollment tracking and documentation handoff triggers
          </p>
        </div>
        <div className="text-xs font-bold px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
          {enrolledLeads.length} Enrolled Students
        </div>
      </div>

      <div className="bg-white rounded-[8px] border border-[#e5edf5] shadow-crm-card overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[#e5edf5] text-[#52627a] font-bold uppercase text-[11px]">
              <th className="px-3 py-2.5">Student</th>
              <th className="px-3 py-2.5">Country & Course</th>
              <th className="px-3 py-2.5">Intake</th>
              <th className="px-3 py-2.5">Fee Status</th>
              <th className="px-3 py-2.5">Documentation Status</th>
              <th className="px-3 py-2.5 text-center">Workflow Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {enrolledLeads.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-3 py-2.5">
                  <div className="font-semibold text-[#101d37]">{item.studentName}</div>
                  <div className="text-[10.5px] text-slate-500">{item.phone} • {item.leadId}</div>
                </td>
                <td className="px-3 py-2.5">
                  <div className="font-medium text-[#101d37]">{item.countryInterest}</div>
                  <div className="text-[10.5px] text-slate-500 truncate max-w-xs">{item.courseInterest}</div>
                </td>
                <td className="px-3 py-2.5 font-medium">{item.intake || 'Sept 2026'}</td>
                <td className="px-3 py-2.5">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                    Verified
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  {item.isTransferredToDocs ? (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-700">
                      Transferred to Docs
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-700">
                      Pending Handoff
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-center">
                  {!item.isTransferredToDocs ? (
                    <button
                      onClick={() => onTransferDocs(item)}
                      className="px-2.5 py-1 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded text-xs font-semibold shadow-xs"
                    >
                      Transfer to Docs
                    </button>
                  ) : (
                    <button
                      onClick={() => onSelectLead(item)}
                      className="text-[#087cf5] hover:underline font-semibold text-xs"
                    >
                      View Dossier
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
