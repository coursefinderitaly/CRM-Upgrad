import React from 'react';
import {
  Users,
  Phone,
  MessageSquare,
  UserCheck,
  GraduationCap,
  PauseCircle,
  UserX,
  ArrowUpRight,
} from 'lucide-react';
import { AnalyticsData } from '../../types/crm';
import { useWorkflow } from '../../context/WorkflowContext';

interface KpiCardsRowProps {
  analytics?: AnalyticsData;
  tabCounts?: Record<string, number>;
  onKpiClick?: (filter: string) => void;
  onNavigate?: (route: string) => void;
}

export const KpiCardsRow: React.FC<KpiCardsRowProps> = ({
  analytics,
  tabCounts,
  onKpiClick,
  onNavigate,
}) => {
  const { students: workflowStudents } = useWorkflow();

  // Live counts from the lead/profile workflow. tabCounts is the authoritative
  // server count; workflowStudents is a fallback while the first fetch loads.
  const statusCount = (status: string) =>
    workflowStudents.filter((s) => (s.overallStatus || '').toLowerCase() === status.toLowerCase()).length;

  const myStudentsCount =
    tabCounts?.myLeads ??
    workflowStudents.filter((s) => (s.overallStatus || '').toLowerCase() !== 'enrolled').length;
  const contactedCount = tabCounts?.contacted ?? statusCount('Contacted');
  const counsellingCount = tabCounts?.counselling ?? statusCount('Counselling');
  const interestedCount = tabCounts?.interested ?? statusCount('Interested');
  const enrolledCount = tabCounts?.enrolled ?? statusCount('Enrolled');
  const onHoldCount = tabCounts?.onHold ?? statusCount('On Hold');
  const dropCount = tabCounts?.drop ?? statusCount('Drop');

  const cards = [
    {
      id: 'my-students',
      route: 'leads',
      value: myStudentsCount,
      label: 'My Students',
      caption: 'Active pipeline',
      bg: 'bg-[#e3effb]',
      hoverBg: 'hover:bg-[#d5e7f9]',
      iconBg: 'bg-[#cfe4f9]',
      iconColor: 'text-[#0284c7]',
      icon: Users,
      tooltip: 'Open My Students',
    },
    {
      id: 'contacted',
      route: 'my-students-contacted',
      value: contactedCount,
      label: 'Contacted',
      caption: 'Follow-up stage',
      bg: 'bg-[#e0f2fe]',
      hoverBg: 'hover:bg-[#cceafd]',
      iconBg: 'bg-[#c3e8fd]',
      iconColor: 'text-[#0369a1]',
      icon: Phone,
      tooltip: 'Open Contacted students',
    },
    {
      id: 'counselling',
      route: 'my-students-counselling',
      value: counsellingCount,
      label: 'Counselling',
      caption: 'In counselling',
      bg: 'bg-[#fef6e1]',
      hoverBg: 'hover:bg-[#fdedc9]',
      iconBg: 'bg-[#fdeebe]',
      iconColor: 'text-[#ca8a04]',
      icon: MessageSquare,
      tooltip: 'Open Counselling students',
    },
    {
      id: 'interested',
      route: 'my-students-interested',
      value: interestedCount,
      label: 'Interested',
      caption: 'Ready to enroll',
      bg: 'bg-[#fde2eb]',
      hoverBg: 'hover:bg-[#fcd3e1]',
      iconBg: 'bg-[#facad7]',
      iconColor: 'text-[#e11d48]',
      icon: UserCheck,
      tooltip: 'Open Interested students',
    },
    {
      id: 'enrolled',
      route: 'students',
      value: enrolledCount,
      label: 'Enrolled',
      caption: 'Enrolled students',
      bg: 'bg-[#def8ef]',
      hoverBg: 'hover:bg-[#ccf2e4]',
      iconBg: 'bg-[#c2f2df]',
      iconColor: 'text-[#16a34a]',
      icon: GraduationCap,
      tooltip: 'Open Enrolled Students',
    },
    {
      id: 'on-hold',
      route: 'leads',
      value: onHoldCount,
      label: 'On Hold',
      caption: 'Paused follow-up',
      bg: 'bg-[#f1f5f9]',
      hoverBg: 'hover:bg-[#e6edf5]',
      iconBg: 'bg-[#e2e8f0]',
      iconColor: 'text-[#475569]',
      icon: PauseCircle,
      tooltip: 'Open My Students on hold',
    },
    {
      id: 'drop',
      route: 'leads',
      value: dropCount,
      label: 'Drop',
      caption: 'Not proceeding',
      bg: 'bg-[#fee2e2]',
      hoverBg: 'hover:bg-[#fecaca]',
      iconBg: 'bg-[#fecaca]',
      iconColor: 'text-[#b91c1c]',
      icon: UserX,
      tooltip: 'Open My Students dropped leads',
    },
  ];

  const handleCardClick = (card: typeof cards[0]) => {
    // Prefer the portal-specific handler so each portal can route to a screen
    // it actually owns (Admin has no counsellor status sub-sections).
    if (onKpiClick) {
      onKpiClick(card.id);
      return;
    }
    if (onNavigate) {
      onNavigate(card.route);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2.5 mb-3.5">
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
              <div className="text-[10px] font-semibold text-[#64748b] leading-none mt-0.5">
                {c.caption}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

