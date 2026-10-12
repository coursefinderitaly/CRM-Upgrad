import React from 'react';
import {
  Users,
  UserCheck,
  FileText,
  UserPlus,
  FileCheck2,
} from 'lucide-react';
import { AnalyticsData } from '../../types/crm';

interface KpiCardsRowProps {
  analytics?: AnalyticsData;
  onKpiClick: (filter: string) => void;
}

export const KpiCardsRow: React.FC<KpiCardsRowProps> = ({
  analytics,
  onKpiClick,
}) => {
  const kpis = analytics?.kpis || {
    totalLeads: { value: 48, label: 'Total Leads', growth: '↑ 12%' },
    contacted: { value: 22, label: 'Contacted', growth: '↑ 8%' },
    counsellingDone: { value: 15, label: 'Counselling Done', growth: '↑ 20%' },
    enrolled: { value: 8, label: 'Enrolled', growth: '↑ 14%' },
    transferred: { value: 5, label: 'Transferred to Documentation', growth: '↑ 25%' },
    applicationInProcess: { value: 2, label: 'Application in Process', growth: '—' },
    offerReceived: { value: 1, label: 'Offer Received', growth: '—' },
  };

  const cards = [
    {
      id: 'total',
      value: kpis.totalLeads.value,
      label: 'Total Leads',
      growth: kpis.totalLeads.growth,
      bg: 'bg-[#e3effb]',
      iconBg: 'bg-[#cfe4f9]',
      iconColor: 'text-[#0284c7]',
      icon: Users,
    },
    {
      id: 'contacted',
      value: kpis.contacted.value,
      label: 'Contacted',
      growth: kpis.contacted.growth,
      bg: 'bg-[#def8ef]',
      iconBg: 'bg-[#c2f2df]',
      iconColor: 'text-[#16a34a]',
      icon: UserCheck,
    },
    {
      id: 'counselling',
      value: kpis.counsellingDone.value,
      label: 'Counselling Done',
      growth: kpis.counsellingDone.growth,
      bg: 'bg-[#fef6e1]',
      iconBg: 'bg-[#fdeebe]',
      iconColor: 'text-[#ca8a04]',
      icon: FileText,
    },
    {
      id: 'enrolled',
      value: kpis.enrolled.value,
      label: 'Enrolled',
      growth: kpis.enrolled.growth,
      bg: 'bg-[#fde2eb]',
      iconBg: 'bg-[#facad7]',
      iconColor: 'text-[#e11d48]',
      icon: UserPlus,
    },
    {
      id: 'transferred',
      value: kpis.transferred.value,
      label: 'Transferred to Documentation',
      growth: kpis.transferred.growth,
      bg: 'bg-[#efe6fb]',
      iconBg: 'bg-[#dfcff7]',
      iconColor: 'text-[#7c3aed]',
      icon: FileCheck2,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-3.5">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <button
            key={c.id}
            onClick={() => onKpiClick(c.id)}
            className={`${c.bg} rounded-[8px] p-2.5 flex items-center gap-2.5 text-left border border-white/60 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-sm hover:scale-[1.01] transition-all`}
          >
            {/* Round Icon */}
            <div
              className={`w-9 h-9 rounded-full ${c.iconBg} ${c.iconColor} flex items-center justify-center shrink-0`}
            >
              <Icon className="w-4 h-4 stroke-[2.2]" />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="text-[20px] font-bold text-[#101d37] leading-none tracking-tight">
                {c.value}
              </div>
              <div className="text-[10.5px] font-medium text-[#52627a] leading-tight mt-1 h-[25px] flex items-center">
                <span className="line-clamp-2">{c.label}</span>
              </div>
              {c.growth !== '—' ? (
                <div className="text-[10px] font-semibold text-[#16a34a] leading-none mt-0.5">
                  {c.growth}
                </div>
              ) : (
                <div className="text-[10px] font-semibold text-[#8496b0] leading-none mt-0.5">
                  —
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
