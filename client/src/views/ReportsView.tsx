import React from 'react';
import { BarChart3, Download, TrendingUp, Users, Award, FileText } from 'lucide-react';
import { AnalyticsData } from '../types/crm';

interface ReportsViewProps {
  analytics?: AnalyticsData;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ analytics }) => {
  const exportFullReport = () => {
    const reportData = `Study Abroad CRM - Monthly Performance Report
Generated: ${new Date().toLocaleDateString()}
Total Leads: 48 (+12% growth)
Contacted: 22 (+8% growth)
Counselling Sessions: 15 (+20% growth)
Enrolled: 8 (+14% growth)
Transferred to Documentation: 5 (+25% growth)
Applications in Process: 2
Offers Received: 1
Top Destination: Italy (16 leads)
Top Source: Google Ads (35%)
`;
    const blob = new Blob([reportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm_performance_report_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
  };

  return (
    <div className="p-4 space-y-4 max-w-[1536px] mx-auto select-none">
      <div className="bg-white p-3.5 rounded-[8px] border border-[#e5edf5] flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-bold text-[#101d37]">Analytics & Performance Reports</h1>
          <p className="text-[11.5px] text-[#52627a]">
            Lead conversion funnels, counsellor productivity, and intake forecasting
          </p>
        </div>

        <button
          onClick={exportFullReport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#087cf5] hover:bg-[#006ee6] text-white rounded text-xs font-semibold shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Summary Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-[8px] border border-[#e5edf5] shadow-crm-card">
          <div className="text-xs text-slate-500 font-medium">Conversion Rate</div>
          <div className="text-[24px] font-bold text-[#101d37] mt-1">16.7%</div>
          <div className="text-[11px] text-green-600 font-semibold mt-1">↑ 2.4% vs last month</div>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-[#e5edf5] shadow-crm-card">
          <div className="text-xs text-slate-500 font-medium">Avg. Counselling to Enrolment</div>
          <div className="text-[24px] font-bold text-[#101d37] mt-1">12 Days</div>
          <div className="text-[11px] text-green-600 font-semibold mt-1">Faster by 3 days</div>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-[#e5edf5] shadow-crm-card">
          <div className="text-xs text-slate-500 font-medium">Documentation Success</div>
          <div className="text-[24px] font-bold text-[#101d37] mt-1">100%</div>
          <div className="text-[11px] text-slate-500 font-semibold mt-1">5 of 5 dossiers verified</div>
        </div>

        <div className="bg-white p-4 rounded-[8px] border border-[#e5edf5] shadow-crm-card">
          <div className="text-xs text-slate-500 font-medium">Offer Acceptance Ratio</div>
          <div className="text-[24px] font-bold text-[#101d37] mt-1">100%</div>
          <div className="text-[11px] text-purple-600 font-semibold mt-1">1 conditional offer accepted</div>
        </div>
      </div>
    </div>
  );
};
