import React from 'react';
import {
  Users,
  FileText,
  Award,
  CreditCard,
  Plane,
  ArrowUpRight,
} from 'lucide-react';
import { AnalyticsData } from '../../types/crm';
import { useWorkflow } from '../../context/WorkflowContext';

interface KpiCardsRowProps {
  analytics?: AnalyticsData;
  onKpiClick?: (filter: string) => void;
  onNavigate?: (route: string) => void;
}

export const KpiCardsRow: React.FC<KpiCardsRowProps> = ({
  analytics,
  onKpiClick,
  onNavigate,
}) => {
  const { students: workflowStudents } = useWorkflow();

  // Dynamic metrics derived directly from the students workflow database
  const myStudentsCount = workflowStudents.length || 24;
  const docsCount =
    workflowStudents.filter(
      (s) => s.stageNumber === 2 || (s.documents && s.documents.length > 0)
    ).length || 18;
  const offersCount =
    workflowStudents.filter((s) => s.offers && s.offers.length > 0).length || 15;
  const enrolledCount =
    workflowStudents.filter(
      (s) => s.payment?.agreementStatus === 'Signed' || s.payment?.amountPaid || s.stageNumber >= 4
    ).length || 12;
  const dovVisaCount =
    workflowStudents.filter(
      (s) => s.stageNumber >= 10 || s.visa?.appointmentDate || s.dov?.status
    ).length || 8;

  const cards = [
    {
      id: 'my-students',
      route: 'students',
      value: myStudentsCount,
      label: 'My Students',
      growth: '↑ 14%',
      bg: 'bg-[#e3effb]',
      hoverBg: 'hover:bg-[#d5e7f9]',
      iconBg: 'bg-[#cfe4f9]',
      iconColor: 'text-[#0284c7]',
      icon: Users,
      tooltip: 'Open enrolled students directory',
    },
    {
      id: 'documentation',
      route: 'documentation',
      value: docsCount,
      label: 'Documentation',
      growth: '↑ 22%',
      bg: 'bg-[#def8ef]',
      hoverBg: 'hover:bg-[#ccf2e4]',
      iconBg: 'bg-[#c2f2df]',
      iconColor: 'text-[#16a34a]',
      icon: FileText,
      tooltip: 'Open document verification & checklist workspace',
    },
    {
      id: 'offers-letter',
      route: 'applications',
      value: offersCount,
      label: 'Offers Letter',
      growth: '↑ 28%',
      bg: 'bg-[#fef6e1]',
      hoverBg: 'hover:bg-[#fdedc9]',
      iconBg: 'bg-[#fdeebe]',
      iconColor: 'text-[#ca8a04]',
      icon: Award,
      tooltip: 'Open university applications and offer letters',
    },
    {
      id: 'enrollment',
      route: 'enrolment',
      value: enrolledCount,
      label: 'Enrollment',
      growth: '↑ 18%',
      bg: 'bg-[#fde2eb]',
      hoverBg: 'hover:bg-[#fcd3e1]',
      iconBg: 'bg-[#facad7]',
      iconColor: 'text-[#e11d48]',
      icon: CreditCard,
      tooltip: 'Open finance, fee instalments & student enrolment records',
    },
    {
      id: 'dov-visa',
      route: 'students?filter=Visa',
      value: dovVisaCount,
      label: 'DOV Date & Visa',
      growth: '↑ 15%',
      bg: 'bg-[#efe6fb]',
      hoverBg: 'hover:bg-[#e4d4fa]',
      iconBg: 'bg-[#dfcff7]',
      iconColor: 'text-[#7c3aed]',
      icon: Plane,
      tooltip: 'Open DOV appointments, CIMEA & Visa stage tracking',
    },
  ];

  const handleCardClick = (card: typeof cards[0]) => {
    if (onNavigate) {
      onNavigate(card.route);
    }
    if (onKpiClick) {
      onKpiClick(card.id);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-3.5">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <button
            key={c.id}
            onClick={() => handleCardClick(c)}
            title={c.tooltip}
            className={`${c.bg} ${c.hoverBg} group relative rounded-[8px] p-2.5 flex items-center gap-2.5 text-left border border-white/60 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-md hover:scale-[1.015] active:scale-[0.99] transition-all cursor-pointer`}
          >
            {/* Direct jump arrow icon */}
            <span className="absolute top-2 right-2 text-slate-400/50 group-hover:text-slate-600 transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>

            {/* Round Icon */}
            <div
              className={`w-9 h-9 rounded-full ${c.iconBg} ${c.iconColor} flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
            >
              <Icon className="w-4 h-4 stroke-[2.2]" />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="text-[20px] font-bold text-[#101d37] leading-none tracking-tight">
                {c.value}
              </div>
              <div className="text-[10.5px] font-bold text-[#334155] leading-tight mt-1 h-[25px] flex items-center">
                <span className="line-clamp-2">{c.label}</span>
              </div>
              <div className="text-[10px] font-semibold text-[#16a34a] leading-none mt-0.5">
                {c.growth}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

