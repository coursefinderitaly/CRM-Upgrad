import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CountryInterestWidgetProps {
  data?: Array<{ country: string; count: number; flag: string; color: string }>;
  onSelectCountry?: (country: string) => void;
}

export const CountryInterestWidget: React.FC<CountryInterestWidgetProps> = ({
  data,
  onSelectCountry,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');

  const countries = data && data.length > 0 ? data : [
    { country: 'Italy', count: 16, flag: '🇮🇹', color: '#087cf5' },
    { country: 'Germany', count: 10, flag: '🇩🇪', color: '#10b981' },
    { country: 'Canada', count: 8, flag: '🇨🇦', color: '#eab308' },
    { country: 'UK', count: 6, flag: '🇬🇧', color: '#ec4899' },
    { country: 'Australia', count: 4, flag: '🇦🇺', color: '#a855f7' },
    { country: 'Others', count: 4, flag: '🌐', color: '#94a3b8' },
  ];

  const maxVal = Math.max(...countries.map((c) => c.count), 16);

  return (
    <div className="bg-white rounded-[10px] border border-[#e5edf5] shadow-crm-card p-4 flex flex-col h-full w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#eef3f8] mb-2 shrink-0">
        <h3 className="text-[13.5px] font-bold text-[#101d37]">Country Interest (Leads)</h3>
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

      {/* Horizontal Progress Bars List */}
      <div className="flex-1 flex flex-col justify-center gap-[8px] py-1 min-h-0">
        {countries.map((item) => {
          const widthPercent = Math.max((item.count / maxVal) * 100, 6);
          return (
            <button
              key={item.country}
              onClick={() => onSelectCountry && onSelectCountry(item.country)}
              className="w-full flex items-center gap-3 hover:bg-slate-50 px-1.5 py-[3px] rounded-md transition-colors text-left group min-h-[26px]"
            >
              {/* Flag & Country Name */}
              <div className="w-[108px] flex items-center gap-1.5 text-[12px] font-medium text-[#0f172a] shrink-0 min-w-0">
                <span className="text-[15px] leading-none shrink-0 w-[20px] text-center">{item.flag}</span>
                <span className="truncate group-hover:text-[#087cf5]">{item.country}</span>
              </div>

              {/* Progress Bar Track */}
              <div className="flex-1 min-w-0 h-[9px] bg-[#eef3f8] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>

              {/* Value Count */}
              <div className="w-6 text-right text-[12.5px] font-bold text-[#0f172a] shrink-0 tabular-nums">
                {item.count}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
