import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface CounsellingSummaryChartProps {
  data?: Array<{ name: string; count: number; fill: string }>;
  onViewReports: () => void;
  onBarClick?: (item: any) => void;
}

export const CounsellingSummaryChart: React.FC<CounsellingSummaryChartProps> = ({
  data,
  onViewReports,
  onBarClick,
}) => {
  const chartData = data && data.length > 0 ? data : [
    { name: 'Total Leads', count: 48, fill: '#087cf5' },
    { name: 'Contacted', count: 22, fill: '#10b981' },
    { name: 'Counselling', count: 15, fill: '#f59e0b' },
    { name: 'Enrolled', count: 8, fill: '#ec4899' },
    { name: 'Transferred', count: 5, fill: '#8b5cf6' },
  ];

  // Custom label to render value above each bar
  const renderCustomBarLabel = (props: any) => {
    const { x, y, width, value } = props;
    return (
      <text
        x={x + width / 2}
        y={y - 6}
        fill="#101d37"
        textAnchor="middle"
        fontSize="11"
        fontWeight="bold"
      >
        {value}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-[8px] border border-[#e5edf5] shadow-crm-card p-3 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#e5edf5] mb-2">
        <h3 className="text-[13px] font-bold text-[#101d37]">
          Counselling Summary <span className="font-normal text-[#64748b]">(This Month)</span>
        </h3>
        <button
          onClick={onViewReports}
          className="text-[11px] text-[#087cf5] hover:underline font-semibold"
        >
          View Reports
        </button>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full h-[185px] min-h-[185px]">
        <ResponsiveContainer width="100%" height={185}>
          <BarChart
            data={chartData}
            margin={{ top: 22, right: 10, left: -25, bottom: 5 }}
            barSize={32}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#52627a', fontSize: 10.5 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8496b0', fontSize: 10 }}
              domain={[0, 48]}
              ticks={[0, 10, 20, 30, 40]}
            />
            <Tooltip
              cursor={{ fill: 'rgba(8, 124, 245, 0.05)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white px-2.5 py-1.5 rounded-md shadow-md border border-slate-200 text-xs">
                      <div className="font-semibold text-slate-800">{d.name}</div>
                      <div className="text-blue-600 font-bold">{d.count} Leads</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="count"
              isAnimationActive={false}
              radius={[4, 4, 0, 0]}
              label={renderCustomBarLabel}
              onClick={(item) => onBarClick && onBarClick(item)}
              cursor="pointer"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
