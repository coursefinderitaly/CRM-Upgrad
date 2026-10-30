import React from 'react';
import { MessageSquare, Mail, PhoneCall, Send } from 'lucide-react';

interface CommunicationViewProps {
  onOpenEmail: () => void;
  onOpenWhatsApp: () => void;
}

export const CommunicationView: React.FC<CommunicationViewProps> = ({
  onOpenEmail,
  onOpenWhatsApp,
}) => {
  const commHistory = [
    {
      id: '1',
      student: 'Ananya Sharma',
      channel: 'WhatsApp',
      type: 'Outbound',
      preview: 'Course shortlist sent for Italy public universities (Sapienza University of Rome)',
      time: 'Today, 11:30 AM',
      status: 'Delivered',
    },
    {
      id: '2',
      student: 'Kavya Iyer',
      channel: 'Email',
      type: 'Outbound',
      preview: 'Manchester Nursing Offer conditional terms & fee payment details',
      time: 'Today, 02:15 PM',
      status: 'Sent',
    },
    {
      id: '3',
      student: 'Arjun Verma',
      channel: 'Phone',
      type: 'Completed Call',
      preview: '30-minute discussion regarding Canada MBA requirements and dossier processing',
      time: 'Today, 12:45 PM',
      status: 'Answered',
    },
  ];

  return (
    <div className="p-4 space-y-4 max-w-[1536px] mx-auto select-none">
      <div className="bg-white p-3.5 rounded-[8px] border border-[#e5edf5] flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-bold text-[#101d37]">Communication Hub</h1>
          <p className="text-[11.5px] text-[#52627a]">
            Email dispatches, WhatsApp conversation records & phone activity logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenWhatsApp}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white rounded text-xs font-semibold shadow-xs"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Send WhatsApp</span>
          </button>
          <button
            onClick={onOpenEmail}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#087cf5] hover:bg-[#006ee6] text-white rounded text-xs font-semibold shadow-xs"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Send Email</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[8px] border border-[#e5edf5] shadow-crm-card divide-y divide-slate-100">
        {commHistory.map((item) => (
          <div key={item.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50">
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  item.channel === 'WhatsApp'
                    ? 'bg-emerald-100 text-emerald-600'
                    : item.channel === 'Email'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-amber-100 text-amber-600'
                }`}
              >
                {item.channel === 'WhatsApp' ? (
                  <PhoneCall className="w-4 h-4" />
                ) : item.channel === 'Email' ? (
                  <Mail className="w-4 h-4" />
                ) : (
                  <MessageSquare className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[13px] text-[#101d37]">{item.student}</span>
                  <span className="text-[10px] px-2 py-0.2 rounded font-semibold bg-slate-100 text-slate-700">
                    {item.channel}
                  </span>
                  <span className="text-[10px] text-slate-400">• {item.time}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{item.preview}</p>
              </div>
            </div>

            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
