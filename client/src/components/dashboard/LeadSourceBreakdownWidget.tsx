import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChevronDown } from 'lucide-react';

interface LeadSourceBreakdownWidgetProps {
  sources?: Array<{ name: string; percentage: number; count: number; color: string }>;
  onSelectSource?: (source: string) => void;
}

export const LeadSourceBreakdownWidget: React.FC<LeadSourceBreakdownWidgetProps> = ({
  sources,
  onSelectSource,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');

  const defaultSources = [
    { name: 'Google Ads', percentage: 0, count: 0, color: '#087cf5' },
    { name: 'Website', percentage: 0, count: 0, color: '#06b6d4' },
    { name: 'Instagram', percentage: 0, count: 0, color: '#eab308' },
    { name: 'Justdial', percentage: 0, count: 0, color: '#f97316' },
    { name: 'Referral', percentage: 0, count: 0, color: '#ec4899' },
    { name: 'Others', percentage: 0, count: 0, color: '#94a3b8' },
  ];

  const data = sources && sources.length > 0 ? sources : defaultSources;
  const totalCount = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="bg-white rounded-[10px] border border-[#e5edf5] shadow-crm-card p-4 flex flex-col h-full w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#eef3f8] mb-3 shrink-0">
        <h3 className="text-[13.5px] font-bold text-[#101d37]">Lead Source Breakdown</h3>
        <div className="relative flex items-center">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="text-[11.5px] font-medium text-[#52627a] bg-slate-50 border border-slate-200 rounded-md pl-2.5 pr-7 py-1 outline-none cursor-pointer appearance-none focus:border-[#087cf5]"
          >
            <option value="This Month">This Month</option>
            <option value="Last Month">Last Month</option>
            <option value="This Year">This Year</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#64748b] absolute right-2 pointer-events-none" />
        </div>
      </div>

      {/* Doughnut Chart & Legend */}
      <div className="flex items-center gap-3 flex-1 min-h-0">
        {/* Doughnut Canvas with total leads text in center */}
        <div className="w-[128px] h-[128px] relative shrink-0 mx-auto">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    if (!d.name) return null;
                    return (
                      <div className="bg-white px-2 py-1 rounded shadow-md border border-slate-200 text-xs">
                        <span className="font-semibold">{d.name}</span>: {d.percentage}%
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {totalCount === 0 ? (
                <Pie
                  data={[{ value: 1 }]}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={58}
                  stroke="#e2e8f0"
                  fill="#f1f5f9"
                  isAnimationActive={false}
                />
              ) : (
                <Pie
                  data={data}
                  dataKey="percentage"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={58}
                  paddingAngle={2}
                  stroke="#ffffff"
                  strokeWidth={2}
                  isAnimationActive={false}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              )}
            </PieChart>
          </ResponsiveContainer>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[19px] font-bold text-[#101d37] leading-none">
              {totalCount}
            </span>
            <span className="text-[10.5px] text-[#64748b] leading-tight font-medium mt-1">
              Leads
            </span>
          </div>
        </div>

        {/* Legend beside the chart */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-[3px] text-[12px] py-1">
          {data.map((item) => (
            <button
              key={item.name}
              onClick={() => onSelectSource && onSelectSource(item.name)}
              className="w-full flex items-center justify-between hover:bg-slate-50 px-1.5 py-[3px] rounded-md transition-colors text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-[9px] h-[9px] rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[#475569] truncate font-medium">{item.name}</span>
              </div>
              <span className="font-bold text-[#0f172a] ml-2 shrink-0 tabular-nums">
                {item.percentage}%
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
