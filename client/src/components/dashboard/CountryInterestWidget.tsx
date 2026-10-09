import React, { useState } from 'react';

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
    <div className="bg-white rounded-[8px] border border-[#e5edf5] shadow-crm-card p-3 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#e5edf5] mb-2">
        <h3 className="text-[13px] font-bold text-[#101d37]">Country Interest (Leads)</h3>
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

      {/* Horizontal Progress Bars List */}
      <div className="flex-1 space-y-2 justify-around flex flex-col min-h-[140px]">
        {countries.map((item) => {
          const widthPercent = (item.count / maxVal) * 100;
          return (
            <button
              key={item.country}
              onClick={() => onSelectCountry && onSelectCountry(item.country)}
              className="w-full flex items-center gap-2 hover:bg-slate-50 px-1 py-0.5 rounded transition-colors text-left group"
            >
              {/* Flag & Country Name */}
              <div className="w-24 flex items-center gap-1.5 text-[11px] font-medium text-[#101d37] shrink-0 truncate">
                <span className="text-sm shrink-0">{item.flag}</span>
                <span className="truncate group-hover:text-[#087cf5]">{item.country}</span>
              </div>

              {/* Progress Bar Track */}
              <div className="flex-1 h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>

              {/* Value Count */}
              <div className="w-6 text-right text-[11.5px] font-bold text-[#101d37] shrink-0">
                {item.count}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
