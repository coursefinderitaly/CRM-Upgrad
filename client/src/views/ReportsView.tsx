import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Download,
  TrendingUp,
  Users,
  Award,
  FileText,
  Printer,
  Filter,
  Search,
  ChevronRight,
  PieChart as PieIcon,
  GraduationCap,
  Plane,
  Clock,
  Target,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { AnalyticsData, Lead } from '../types/crm';
import { StudentRecord } from '../services/studentsData';
import { useWorkflow } from '../context/WorkflowContext';

interface ReportsViewProps {
  analytics?: AnalyticsData;
  leads?: Lead[];
}

type ReportTab = 'overview' | 'funnel' | 'counsellors' | 'destinations';

/* Stage buckets used consistently across dashboards and reports */
interface StageBucket {
  id: string;
  label: string;
  color: string;
  match: (st: StudentRecord) => boolean;
}

const STAGE_BUCKETS: StageBucket[] = [
  { id: 'counselling', label: 'Counselling', color: '#f59e0b', match: (st) => st.stageNumber === 1 },
  { id: 'documentation', label: 'Documentation', color: '#8b5cf6', match: (st) => st.stageNumber === 2 },
  { id: 'shortlisting', label: 'Shortlisting', color: '#087cf5', match: (st) => st.stageNumber === 3 },
  { id: 'applications', label: 'Applications', color: '#0ea5e9', match: (st) => st.stageNumber >= 4 && st.stageNumber <= 5 },
  { id: 'offers', label: 'Offers', color: '#16a34a', match: (st) => st.stageNumber >= 6 && st.stageNumber <= 9 },
  { id: 'visa', label: 'Visa', color: '#ea580c', match: (st) => st.stageNumber >= 10 && st.stageNumber <= 11 },
  { id: 'ready', label: 'Ready', color: '#7c3aed', match: (st) => st.stageNumber >= 12 },
];

const COUNTRY_COLORS = ['#087cf5', '#16a34a', '#f59e0b', '#8b5cf6', '#ec4899', '#0ea5e9', '#ea580c', '#64748b'];

export const ReportsView: React.FC<ReportsViewProps> = ({ analytics, leads = [] }) => {
  const { students } = useWorkflow();

  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  const [countryFilter, setCountryFilter] = useState('All');
  const [intakeFilter, setIntakeFilter] = useState('All');
  const [counsellorFilter, setCounsellorFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageDrilldown, setStageDrilldown] = useState<string | null>(null);

  /* ------------------------------ filter options ------------------------------ */
  const countries = useMemo(
    () => Array.from(new Set(students.map((s) => s.country))).sort(),
    [students]
  );
  const intakes = useMemo(
    () => Array.from(new Set(students.map((s) => s.intake))).sort(),
    [students]
  );
  const counsellors = useMemo(
    () => Array.from(new Set(students.map((s) => s.counsellor))).sort(),
    [students]
  );

  /* ------------------------------ filtered dataset ------------------------------ */
  const filteredStudents = useMemo(
    () =>
      students.filter((st) => {
        const matchesCountry = countryFilter === 'All' || st.country === countryFilter;
        const matchesIntake = intakeFilter === 'All' || st.intake === intakeFilter;
        const matchesCounsellor = counsellorFilter === 'All' || st.counsellor === counsellorFilter;
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !q ||
          st.name.toLowerCase().includes(q) ||
          st.studentId.toLowerCase().includes(q) ||
          st.preferredCourse.toLowerCase().includes(q) ||
          st.targetUniversity.toLowerCase().includes(q);
        return matchesCountry && matchesIntake && matchesCounsellor && matchesSearch;
      }),
    [students, countryFilter, intakeFilter, counsellorFilter, searchQuery]
  );

  /* ------------------------------ KPIs ------------------------------ */
  const kpis = useMemo(() => {
    const total = filteredStudents.length;
    const activePipeline = filteredStudents.filter((s) => s.stageNumber < 12).length;
    const offers = filteredStudents.filter((s) => s.stageNumber >= 6 && s.stageNumber <= 9).length;
    const visa = filteredStudents.filter((s) => s.stageNumber >= 10).length;
    const ready = filteredStudents.filter((s) => s.stageNumber >= 12).length;
    const avgStage =
      total > 0 ? (filteredStudents.reduce((acc, s) => acc + s.stageNumber, 0) / total).toFixed(1) : '0';
    const conversion = leads.length > 0 ? ((students.length / leads.length) * 100).toFixed(1) : '—';
    const withOffers = filteredStudents.filter((s) => s.offers.length > 0).length;
    const docsVerifiedPct =
      total > 0
        ? Math.round(
            (filteredStudents.reduce((acc, s) => {
              const verified = s.documents.filter((d) => d.status === 'Verified').length;
              return acc + (s.documents.length ? verified / s.documents.length : 0);
            }, 0) /
              total) *
              100
          )
        : 0;

    return { total, activePipeline, offers, visa, ready, avgStage, conversion, withOffers, docsVerifiedPct };
  }, [filteredStudents, leads.length, students.length]);

  /* ------------------------------ stage funnel ------------------------------ */
  const funnelData = useMemo(
    () =>
      STAGE_BUCKETS.map((bucket) => ({
        id: bucket.id,
        label: bucket.label,
        color: bucket.color,
        count: filteredStudents.filter(bucket.match).length,
      })),
    [filteredStudents]
  );

  const drilldownStudents = useMemo(
    () =>
      stageDrilldown
        ? filteredStudents.filter(STAGE_BUCKETS.find((b) => b.id === stageDrilldown)?.match || (() => false))
        : [],
    [filteredStudents, stageDrilldown]
  );

  /* ------------------------------ country breakdown ------------------------------ */
  const countryData = useMemo(() => {
    const map = new Map<string, number>();
    filteredStudents.forEach((s) => map.set(s.country, (map.get(s.country) || 0) + 1));
    return Array.from(map.entries())
      .map(([name, value], index) => ({ name, value, color: COUNTRY_COLORS[index % COUNTRY_COLORS.length] }))
      .sort((a, b) => b.value - a.value);
  }, [filteredStudents]);

  /* ------------------------------ counsellor productivity ------------------------------ */
  const counsellorData = useMemo(() => {
    const map = new Map<
      string,
      { name: string; total: number; active: number; offers: number; ready: number; stageSum: number }
    >();
    filteredStudents.forEach((s) => {
      const entry = map.get(s.counsellor) || {
        name: s.counsellor,
        total: 0,
        active: 0,
        offers: 0,
        ready: 0,
        stageSum: 0,
      };
      entry.total += 1;
      if (s.stageNumber < 12) entry.active += 1;
      if (s.stageNumber >= 6 && s.stageNumber <= 9) entry.offers += 1;
      if (s.stageNumber >= 12) entry.ready += 1;
      entry.stageSum += s.stageNumber;
      map.set(s.counsellor, entry);
    });
    return Array.from(map.values())
      .map((c) => ({ ...c, avgStage: c.total ? (c.stageSum / c.total).toFixed(1) : '0' }))
      .sort((a, b) => b.total - a.total);
  }, [filteredStudents]);

  /* ------------------------------ sources & counselling (server analytics) ------------------------------ */
  const sourceData =
    analytics?.leadSources && analytics.leadSources.length > 0
      ? analytics.leadSources
      : [
          { name: 'Google Ads', count: 17, percentage: 35, color: '#087cf5' },
          { name: 'Website', count: 12, percentage: 25, color: '#06b6d4' },
          { name: 'Instagram', count: 7, percentage: 15, color: '#eab308' },
          { name: 'Justdial', count: 5, percentage: 10, color: '#f97316' },
          { name: 'Referral', count: 5, percentage: 10, color: '#ec4899' },
        ];

  const counsellingData =
    analytics?.counsellingSummary && analytics.counsellingSummary.length > 0
      ? analytics.counsellingSummary
      : [
          { name: 'Completed', count: 15, fill: '#16a34a' },
          { name: 'Scheduled', count: 8, fill: '#087cf5' },
          { name: 'No Show', count: 3, fill: '#f59e0b' },
          { name: 'Cancelled', count: 2, fill: '#e11d48' },
        ];

  /* ------------------------------ exports ------------------------------ */
  const exportRows = useMemo(
    () =>
      filteredStudents.map((s) => ({
        StudentID: s.studentId,
        Name: s.name,
        Phone: s.phone,
        Email: s.email,
        Country: s.country,
        Course: s.preferredCourse,
        Intake: s.intake,
        Counsellor: s.counsellor,
        StageNumber: s.stageNumber,
        CurrentStage: s.currentStage,
        OverallStatus: s.overallStatus,
        Applications: s.applications.length,
        Offers: s.offers.length,
        Priority: s.priority,
      })),
    [filteredStudents]
  );

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    if (exportRows.length === 0) return;
    const headers = Object.keys(exportRows[0]);
    const csv = [
      headers.join(','),
      ...exportRows.map((row) =>
        headers
          .map((h) => {
            const value = String((row as Record<string, unknown>)[h] ?? '');
            return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
          })
          .join(',')
      ),
    ].join('\n');
    downloadFile(csv, `crm_students_report_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
  };

  const exportSummary = () => {
    const summary = {
      generatedAt: new Date().toISOString(),
      filters: { countryFilter, intakeFilter, counsellorFilter, searchQuery },
      kpis,
      funnel: funnelData,
      countries: countryData,
      counsellors: counsellorData,
      leadSources: sourceData,
      counsellingSessions: counsellingData,
      totalLeadsInCrm: leads.length,
    };
    downloadFile(
      JSON.stringify(summary, null, 2),
      `crm_analytics_summary_${new Date().toISOString().slice(0, 10)}.json`,
      'application/json'
    );
  };

  const tabs: Array<{ id: ReportTab; label: string; icon: React.ElementType }> = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'funnel', label: 'Conversion Funnel', icon: TrendingUp },
    { id: 'counsellors', label: 'Counsellor Productivity', icon: Users },
    { id: 'destinations', label: 'Destinations & Intake', icon: GraduationCap },
  ];

  return (
    <div className="p-3.5 pb-16 space-y-3 max-w-[1536px] mx-auto font-sans text-[#101d37] select-none">
      {/* Header */}
      <div className="bg-white p-3.5 rounded-[8px] border border-[#e5edf5] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#087cf5] text-white flex items-center justify-center shadow-xs">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-bold text-[#101d37] leading-tight">Reports & Analytics</h1>
            <p className="text-[11.5px] text-[#64748b] leading-tight mt-0.5">
              Live pipeline funnel, counsellor productivity, destination mix and intake forecasting
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[#087cf5] hover:bg-[#006ee6] text-white text-[12px] font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] border border-[#e2e8f0] bg-white hover:bg-slate-50 text-[12px] font-semibold text-[#101d37] shadow-xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>JSON Summary</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] border border-[#e2e8f0] bg-white hover:bg-slate-50 text-[12px] font-semibold text-[#101d37] shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student, ID, course or university..."
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] focus:bg-white rounded-[6px] pl-8 pr-3 py-1.5 text-[12px] outline-none transition-all"
            />
          </div>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] rounded-[6px] px-2.5 py-1.5 text-[12px] outline-none"
          >
            <option value="All">All Countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={intakeFilter}
            onChange={(e) => setIntakeFilter(e.target.value)}
            className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] rounded-[6px] px-2.5 py-1.5 text-[12px] outline-none"
          >
            <option value="All">All Intakes</option>
            {intakes.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
          <select
            value={counsellorFilter}
            onChange={(e) => setCounsellorFilter(e.target.value)}
            className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] rounded-[6px] px-2.5 py-1.5 text-[12px] outline-none"
          >
            <option value="All">All Counsellors</option>
            {counsellors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        {(countryFilter !== 'All' || intakeFilter !== 'All' || counsellorFilter !== 'All' || searchQuery) && (
          <div className="flex items-center gap-2 pt-2 mt-2 border-t border-slate-100 text-[11px] text-[#64748b]">
            <Filter className="w-3 h-3" />
            <span>
              Showing <span className="font-bold text-[#087cf5]">{filteredStudents.length}</span> of{' '}
              {students.length} students
            </span>
            <button
              onClick={() => {
                setCountryFilter('All');
                setIntakeFilter('All');
                setCounsellorFilter('All');
                setSearchQuery('');
              }}
              className="text-[#087cf5] font-semibold hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[12px]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-[5px] transition-all whitespace-nowrap font-medium flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[#087cf5] text-white font-semibold shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-[#52627a] border border-[#e2e8f0]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================== OVERVIEW ============================== */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <div className="bg-white p-3 rounded-[8px] border border-[#e5edf5] shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Total Students</span>
              <div className="text-[20px] font-bold text-[#101d37] mt-0.5">{kpis.total}</div>
              <span className="text-[10px] text-[#087cf5] font-semibold">In filtered view</span>
            </div>
            <div className="bg-white p-3 rounded-[8px] border border-[#e5edf5] shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Conversion Rate</span>
              <div className="text-[20px] font-bold text-[#101d37] mt-0.5">{kpis.conversion}%</div>
              <span className="text-[10px] text-[#64748b]">{students.length} students / {leads.length} leads</span>
            </div>
            <div className="bg-white p-3 rounded-[8px] border border-[#e5edf5] shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Active Pipeline</span>
              <div className="text-[20px] font-bold text-[#087cf5] mt-0.5">{kpis.activePipeline}</div>
              <span className="text-[10px] text-[#64748b]">Pre-departure files</span>
            </div>
            <div className="bg-white p-3 rounded-[8px] border border-[#e5edf5] shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Offers Issued</span>
              <div className="text-[20px] font-bold text-[#15803d] mt-0.5">{kpis.offers}</div>
              <span className="text-[10px] text-[#15803d] font-medium">{kpis.withOffers} with offer letters</span>
            </div>
            <div className="bg-white p-3 rounded-[8px] border border-[#e5edf5] shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Visa / Ready</span>
              <div className="text-[20px] font-bold text-[#ea580c] mt-0.5">
                {kpis.visa}
                <span className="text-[12px] text-[#64748b] font-semibold"> / {kpis.ready} ready</span>
              </div>
              <span className="text-[10px] text-[#ea580c] font-medium">VFS & embassy queue</span>
            </div>
            <div className="bg-white p-3 rounded-[8px] border border-[#e5edf5] shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Docs Verified</span>
              <div className="text-[20px] font-bold text-[#7c3aed] mt-0.5">{kpis.docsVerifiedPct}%</div>
              <span className="text-[10px] text-[#64748b]">Avg. dossier completion</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Counselling sessions */}
            <div className="bg-white rounded-[8px] border border-[#e5edf5] p-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                <h3 className="text-[13.5px] font-bold text-[#101d37]">Counselling Session Outcomes</h3>
                <span className="text-[10.5px] text-[#64748b] font-medium">This month</span>
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={counsellingData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef3f8" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#8496b0' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(8,124,245,0.05)' }}
                      contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                      {counsellingData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Lead sources */}
            <div className="bg-white rounded-[8px] border border-[#e5edf5] p-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                <h3 className="text-[13.5px] font-bold text-[#101d37]">Lead Source Performance</h3>
                <span className="text-[10.5px] text-[#64748b] font-medium">All time</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-[150px] h-[150px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sourceData}
                        dataKey="percentage"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={64}
                        paddingAngle={2}
                        stroke="#ffffff"
                        strokeWidth={2}
                        isAnimationActive={false}
                      >
                        {sourceData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                        formatter={(value) => [`${value}%`, 'Share']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-1.5 min-w-0">
                  {sourceData.map((source) => (
                    <div key={source.name} className="flex items-center justify-between text-[11.5px]">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: source.color }} />
                        <span className="text-[#475569] truncate">{source.name}</span>
                      </span>
                      <span className="font-bold text-[#101d37] tabular-nums">
                        {source.percentage}% · {source.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================== FUNNEL ============================== */}
      {activeTab === 'funnel' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 bg-white rounded-[8px] border border-[#e5edf5] p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-4">
              <h3 className="text-[13.5px] font-bold text-[#101d37]">Student Conversion Funnel</h3>
              <span className="text-[10.5px] text-[#64748b] font-medium">Click a stage to inspect profiles</span>
            </div>

            <div className="space-y-3">
              {funnelData.map((stage) => {
                const max = Math.max(...funnelData.map((f) => f.count), 1);
                const widthPct = Math.max((stage.count / max) * 100, 3);
                const pctOfTotal = kpis.total ? Math.round((stage.count / kpis.total) * 100) : 0;
                return (
                  <button
                    key={stage.id}
                    onClick={() => setStageDrilldown(stage.id === stageDrilldown ? null : stage.id)}
                    className={`w-full text-left group ${stage.id === stageDrilldown ? 'opacity-100' : ''}`}
                  >
                    <div className="flex items-center justify-between text-[11.5px] mb-1">
                      <span className="font-semibold text-[#101d37] flex items-center gap-1.5">
                        {stage.label}
                        <ChevronRight
                          className={`w-3 h-3 text-[#8496b0] transition-transform ${
                            stage.id === stageDrilldown ? 'rotate-90' : ''
                          }`}
                        />
                      </span>
                      <span className="text-[#52627a] font-medium tabular-nums">
                        {stage.count} students · {pctOfTotal}%
                      </span>
                    </div>
                    <div className="h-5 bg-[#f1f5f9] rounded-[4px] overflow-hidden">
                      <div
                        className="h-full rounded-[4px] transition-all duration-500"
                        style={{ width: `${widthPct}%`, backgroundColor: stage.color }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-[18px] font-bold text-[#101d37]">{kpis.total || 0}</div>
                <div className="text-[10.5px] text-[#64748b]">Profiles in scope</div>
              </div>
              <div>
                <div className="text-[18px] font-bold text-[#087cf5]">{kpis.avgStage}</div>
                <div className="text-[10.5px] text-[#64748b]">Avg. stage reached</div>
              </div>
              <div>
                <div className="text-[18px] font-bold text-[#15803d]">
                  {kpis.total ? Math.round((kpis.ready / kpis.total) * 100) : 0}%
                </div>
                <div className="text-[10.5px] text-[#64748b]">Departure ready</div>
              </div>
            </div>
          </div>

          {/* Drilldown list */}
          <div className="bg-white rounded-[8px] border border-[#e5edf5] p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <h3 className="text-[13.5px] font-bold text-[#101d37]">
                {stageDrilldown ? `${STAGE_BUCKETS.find((b) => b.id === stageDrilldown)?.label} Profiles` : 'Stage Drilldown'}
              </h3>
              {stageDrilldown && (
                <button onClick={() => setStageDrilldown(null)} className="text-[11px] font-semibold text-[#087cf5] hover:underline">
                  Clear
                </button>
              )}
            </div>
            {!stageDrilldown ? (
              <div className="py-10 text-center text-[11.5px] text-[#94a3b8]">
                <Target className="w-6 h-6 mx-auto mb-2 text-[#cbd5e1]" />
                Select a funnel stage to list the students currently sitting there.
              </div>
            ) : drilldownStudents.length === 0 ? (
              <div className="py-10 text-center text-[11.5px] text-[#94a3b8]">No students in this stage.</div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {drilldownStudents.map((st) => (
                  <div key={st.id} className="flex items-center justify-between p-2.5 rounded-[6px] border border-[#eef3f8] bg-[#f8fafc]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={st.avatar}
                        alt={st.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/avatars/row_rahul.png';
                        }}
                        className="w-7 h-7 aspect-square rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-[12px] font-semibold text-[#101d37] truncate">{st.name}</div>
                        <div className="text-[10px] text-[#64748b] truncate">
                          {st.studentId} • {st.country}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10.5px] font-semibold text-[#52627a] shrink-0">{st.currentStage}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================== COUNSELLORS ============================== */}
      {activeTab === 'counsellors' && (
        <div className="space-y-3">
          <div className="bg-white rounded-[8px] border border-[#e5edf5] p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <h3 className="text-[13.5px] font-bold text-[#101d37]">Students per Counsellor</h3>
              <span className="text-[10.5px] text-[#64748b] font-medium">Filtered view</span>
            </div>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={counsellorData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef3f8" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#8496b0' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(8,124,245,0.05)' }}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="total" name="Total" fill="#087cf5" radius={[5, 5, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="active" name="Active" fill="#16a34a" radius={[5, 5, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="ready" name="Ready" fill="#7c3aed" radius={[5, 5, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-[8px] border border-[#e5edf5] shadow-xs overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100">
              <h3 className="text-[13.5px] font-bold text-[#101d37]">Productivity Scorecard</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px] border-collapse min-w-[720px]">
                <thead>
                  <tr className="bg-[#f8fafc] text-[#52627a] font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-4">Counsellor</th>
                    <th className="py-2.5 px-3">Total Students</th>
                    <th className="py-2.5 px-3">Active</th>
                    <th className="py-2.5 px-3">Offers</th>
                    <th className="py-2.5 px-3">Departure Ready</th>
                    <th className="py-2.5 px-3">Avg. Stage</th>
                    <th className="py-2.5 px-3">Workload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {counsellorData.map((c) => {
                    const maxTotal = Math.max(...counsellorData.map((x) => x.total), 1);
                    return (
                      <tr key={c.name} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-full bg-[#dbeafe] text-[#087cf5] text-[11px] font-bold flex items-center justify-center shrink-0">
                              {c.name
                                .split(' ')
                                .map((p) => p[0])
                                .slice(0, 2)
                                .join('')}
                            </span>
                            <span className="font-semibold text-[#101d37]">{c.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#101d37]">{c.total}</td>
                        <td className="py-2.5 px-3 text-[#087cf5] font-semibold">{c.active}</td>
                        <td className="py-2.5 px-3 text-[#15803d] font-semibold">{c.offers}</td>
                        <td className="py-2.5 px-3 text-[#7c3aed] font-semibold">{c.ready}</td>
                        <td className="py-2.5 px-3 text-[#52627a] font-medium">{c.avgStage}</td>
                        <td className="py-2.5 px-3 w-[180px]">
                          <div className="h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#087cf5] rounded-full"
                              style={{ width: `${(c.total / maxTotal) * 100}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {counsellorData.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[11.5px] text-[#94a3b8]">
                        No counsellor data for the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================== DESTINATIONS ============================== */}
      {activeTab === 'destinations' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-white rounded-[8px] border border-[#e5edf5] p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <h3 className="text-[13.5px] font-bold text-[#101d37]">Destination Country Mix</h3>
              <PieIcon className="w-4 h-4 text-[#8496b0]" />
            </div>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={countryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    stroke="#ffffff"
                    strokeWidth={2}
                    isAnimationActive={false}
                  >
                    {countryData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                    formatter={(value, name) => [`${value} students`, String(name)]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-[8px] border border-[#e5edf5] p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <h3 className="text-[13.5px] font-bold text-[#101d37]">Destination Detail</h3>
              <Plane className="w-4 h-4 text-[#8496b0]" />
            </div>
            <div className="space-y-2">
              {countryData.map((country) => {
                const countryStudents = filteredStudents.filter((s) => s.country === country.name);
                const offers = countryStudents.filter((s) => s.stageNumber >= 6 && s.stageNumber <= 9).length;
                const ready = countryStudents.filter((s) => s.stageNumber >= 12).length;
                const share = kpis.total ? Math.round((country.value / kpis.total) * 100) : 0;
                return (
                  <div key={country.name} className="p-2.5 rounded-[6px] border border-[#eef3f8] bg-[#f8fafc]">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-semibold text-[#101d37] flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: country.color }} />
                        {country.name}
                      </span>
                      <span className="text-[#52627a] font-medium tabular-nums">
                        {country.value} students · {share}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[10.5px] text-[#64748b]">
                      <span className="flex items-center gap-1">
                        <Award className="w-3 h-3 text-[#15803d]" /> {offers} offers
                      </span>
                      <span className="flex items-center gap-1">
                        <Plane className="w-3 h-3 text-[#7c3aed]" /> {ready} ready
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#ea580c]" /> {countryStudents.length - ready} in progress
                      </span>
                    </div>
                  </div>
                );
              })}
              {countryData.length === 0 && (
                <div className="py-10 text-center text-[11.5px] text-[#94a3b8]">No destinations for the current filters.</div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-[8px] border border-[#e5edf5] shadow-xs overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-[13.5px] font-bold text-[#101d37]">Intake Forecast</h3>
              <span className="text-[10.5px] text-[#64748b] font-medium">{intakes.length} intakes in view</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px] border-collapse min-w-[640px]">
                <thead>
                  <tr className="bg-[#f8fafc] text-[#52627a] font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-4">Intake</th>
                    <th className="py-2.5 px-3">Students</th>
                    <th className="py-2.5 px-3">In Applications</th>
                    <th className="py-2.5 px-3">Offers</th>
                    <th className="py-2.5 px-3">Departure Ready</th>
                    <th className="py-2.5 px-3">Readiness</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {intakes.map((intake) => {
                    const list = filteredStudents.filter((s) => s.intake === intake);
                    const inApps = list.filter((s) => s.stageNumber >= 4 && s.stageNumber <= 5).length;
                    const offers = list.filter((s) => s.stageNumber >= 6 && s.stageNumber <= 9).length;
                    const ready = list.filter((s) => s.stageNumber >= 12).length;
                    const readiness = list.length ? Math.round(((offers + ready) / list.length) * 100) : 0;
                    return (
                      <tr key={intake} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-[#101d37]">{intake}</td>
                        <td className="py-2.5 px-3 font-bold text-[#101d37]">{list.length}</td>
                        <td className="py-2.5 px-3 text-[#087cf5] font-semibold">{inApps}</td>
                        <td className="py-2.5 px-3 text-[#15803d] font-semibold">{offers}</td>
                        <td className="py-2.5 px-3 text-[#7c3aed] font-semibold">{ready}</td>
                        <td className="py-2.5 px-3 w-[200px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  readiness >= 60 ? 'bg-[#16a34a]' : readiness >= 30 ? 'bg-[#eab308]' : 'bg-[#ea580c]'
                                }`}
                                style={{ width: `${readiness}%` }}
                              />
                            </div>
                            <span className="text-[10.5px] font-semibold text-[#52627a] tabular-nums w-9 text-right">
                              {readiness}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {intakes.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[11.5px] text-[#94a3b8]">
                        No intake data for the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Footer note */}
      <div className="flex items-center gap-2 text-[10.5px] text-[#94a3b8]">
        <CheckCircle2 className="w-3 h-3" />
        <span>
          Report generated from the live workflow store ({students.length} profiles) and CRM lead analytics.
        </span>
      </div>
    </div>
  );
};
