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

  const data = sources && sources.length > 0 ? sources : [
    { name: 'Google Ads', percentage: 35, count: 17, color: '#087cf5' },
    { name: 'Website', percentage: 25, count: 12, color: '#06b6d4' },
    { name: 'Instagram', percentage: 15, count: 7, color: '#eab308' },
    { name: 'Justdial', percentage: 10, count: 5, color: '#f97316' },
    { name: 'Referral', percentage: 10, count: 5, color: '#ec4899' },
    { name: 'Others', percentage: 5, count: 2, color: '#94a3b8' },
  ];

  const totalCount = data.reduce((acc, curr) => acc + curr.count, 0) || 48;

  return (
    <div className="bg-white rounded-[8px] border border-[#e5edf5] shadow-crm-card p-3 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#e5edf5] mb-2">
        <h3 className="text-[13px] font-bold text-[#101d37]">Lead Source Breakdown</h3>
        <div className="relative">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="text-[11px] font-medium text-[#52627a] bg-slate-50 border border-slate-200 rounded px-2 py-0.5 outline-none cursor-pointer"
          >
            <option value="This Month">This Month</option>
            <option value="Last Month">Last Month</option>
            <option value="This Year">This Year</option>
          </select>
        </div>
      </div>

      {/* Doughnut Chart & Legend */}
      <div className="flex items-center justify-between gap-2 flex-1 min-h-[140px]">
        {/* Doughnut Canvas with 48 Leads text in center */}
        <div className="w-[125px] h-[125px] relative shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white px-2 py-1 rounded shadow-md border border-slate-200 text-xs">
                        <span className="font-semibold">{d.name}</span>: {d.percentage}%
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={data}
                dataKey="percentage"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={56}
                paddingAngle={2}
                stroke="#ffffff"
                strokeWidth={2}
                isAnimationActive={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[17px] font-bold text-[#101d37] leading-none">
              {totalCount}
            </span>
            <span className="text-[10px] text-[#64748b] leading-tight font-medium mt-0.5">
              Leads
            </span>
          </div>
        </div>

        {/* Legend beside the chart */}
        <div className="flex-1 space-y-1.5 pl-2 text-[11px]">
          {data.map((item) => (
            <button
              key={item.name}
              onClick={() => onSelectSource && onSelectSource(item.name)}
              className="w-full flex items-center justify-between hover:bg-slate-50 px-1 py-0.5 rounded transition-colors text-left"
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[#52627a] truncate">{item.name}</span>
              </div>
              <span className="font-semibold text-[#101d37] ml-2 shrink-0">
                {item.percentage}%
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
