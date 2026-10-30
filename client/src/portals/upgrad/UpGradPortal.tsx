import React, { useState } from 'react';
import { PortalProps } from '../types';
import { LeadsView } from '../../views/LeadsView';
import { StudentsView } from '../../views/StudentsView';
import { ResourcesView } from '../../views/ResourcesView';
import { ReportsView } from '../../views/ReportsView';
import { HistoryView } from '../../views/HistoryView';
import {
  GraduationCap,
  Layers,
  Award,
  Globe,
  BookOpen,
  Calendar,
  CheckCircle2,
  Users,
  Percent,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileCheck,
  History,
} from 'lucide-react';

interface UpGradProgram {
  id: string;
  name: string;
  degreeType: string;
  partnerUniversity: string;
  country: string;
  model: string; // e.g. "1 Year India + 1 Year Abroad"
  intake: string;
  fee: string;
  credits: string;
  status: 'Open' | 'Filling Fast' | 'Waitlist';
}

const UPGRAD_PROGRAMS: UpGradProgram[] = [
  {
    id: 'upg-01',
    name: 'Master of Science in Data Science & AI',
    degreeType: "Master's Pathway",
    partnerUniversity: 'IU International University of Applied Sciences',
    country: 'Germany 🇩🇪',
    model: '1 Year Online + 1 Year On-Campus Berlin',
    intake: 'Sept 2026',
    fee: '€ 11,800',
    credits: '90 ECTS (30 Articulated)',
    status: 'Open',
  },
  {
    id: 'upg-02',
    name: 'Global MBA & Strategic Management',
    degreeType: 'Global MBA',
    partnerUniversity: 'Liverpool John Moores University',
    country: 'United Kingdom 🇬🇧',
    model: 'Blended Executive Pathway',
    intake: 'Sept 2026',
    fee: '£ 13,500',
    credits: '180 UK Credits',
    status: 'Filling Fast',
  },
  {
    id: 'upg-03',
    name: 'MSc International Business & FinTech',
    degreeType: 'Dual Degree',
    partnerUniversity: 'Rome Business School / University of Rome',
    country: 'Italy 🇮🇹',
    model: '1 Year Hybrid + 1 Year in Rome',
    intake: 'Oct 2026',
    fee: '€ 9,500',
    credits: '60 CFU / ECTS',
    status: 'Open',
  },
  {
    id: 'upg-04',
    name: 'Master of Engineering Management',
    degreeType: "Master's Track",
    partnerUniversity: 'Politecnico Network / UniMi Partner',
    country: 'Italy 🇮🇹',
    model: 'Foundation + Full Campus Degree',
    intake: 'Sept 2026',
    fee: '€ 8,900',
    credits: '120 ECTS',
    status: 'Open',
  },
];

export const UpGradPortal: React.FC<PortalProps> = (props) => {
  const {
    currentRoute,
    onNavigate,
    leads,
    selectedLead,
    setSelectedLead,
    analytics,
    onOpenPhone,
    onOpenWhatsApp,
    onOpenEmail,
    onScheduleFollowUp,
    onEditLead,
    onEnrollLead,
    onTransferDocs,
    onDeleteLead,
    onAddNote,
    onUpdateStatus,
    onAddTask,
    onAddNewLead,
  } = props;

  const [activeTab, setActiveTab] = useState<'programs' | 'cohorts' | 'leads'>('programs');

  return (
    <div className="upgrad-portal-container space-y-4 p-2.5 sm:p-4 max-w-[1536px] mx-auto select-none">
      {/* UpGrad Brand Header */}
      <div className="bg-gradient-to-r from-[#e21b22] via-[#b81218] to-[#800b10] rounded-2xl p-4 sm:p-5 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        {/* Subtle decorative crest */}
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-44 h-44 bg-white/5 rounded-full pointer-events-none blur-2xl" />

        <div className="flex items-center gap-3.5 z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner ring-1 ring-white/30">
            <GraduationCap className="w-7 h-7 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">upGrad Global Degree Portal</h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white uppercase tracking-wider">
                Articulation Suite
              </span>
            </div>
            <p className="text-xs text-red-100 mt-1 max-w-xl">
              1+1 Global Pathway Degrees, credit transfers, dual degree certifications &amp; European cohort tracking
            </p>
          </div>
        </div>

        {/* UpGrad Key Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs z-10">
          <div className="bg-black/20 rounded-xl px-3 py-2 backdrop-blur-xs border border-white/10">
            <span className="text-[10.5px] text-red-200 block font-medium">Active Cohorts</span>
            <span className="text-base font-bold text-white">4 Intakes</span>
          </div>
          <div className="bg-black/20 rounded-xl px-3 py-2 backdrop-blur-xs border border-white/10">
            <span className="text-[10.5px] text-red-200 block font-medium">Enrolled Students</span>
            <span className="text-base font-bold text-amber-200">28 Candidates</span>
          </div>
          <div className="bg-black/20 rounded-xl px-3 py-2 backdrop-blur-xs border border-white/10">
            <span className="text-[10.5px] text-red-200 block font-medium">Credit Articulation</span>
            <span className="text-base font-bold text-emerald-300">100% Validated</span>
          </div>
          <div className="bg-black/20 rounded-xl px-3 py-2 backdrop-blur-xs border border-white/10">
            <span className="text-[10.5px] text-red-200 block font-medium">Scholarship Pool</span>
            <span className="text-base font-bold text-white">₹45 Lakhs</span>
          </div>
        </div>
      </div>

      {/* UpGrad Portal Internal Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5 rounded-xl shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('programs')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'programs'
                ? 'bg-[#e21b22] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Global Degree Programs (4)
          </button>
          <button
            onClick={() => setActiveTab('cohorts')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'cohorts'
                ? 'bg-[#e21b22] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Cohort Intakes (2026)
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'leads'
                ? 'bg-[#e21b22] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            UpGrad Leads Pipeline
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('history')}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors ${
              currentRoute === 'history'
                ? 'bg-[#e21b22] text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Profile History</span>
          </button>
          <button
            onClick={() => onNavigate('students')}
            className="text-xs font-semibold text-[#e21b22] hover:underline flex items-center gap-1"
          >
            <span>View All Students</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tab 1: Global Degree Programs Grid */}
      {activeTab === 'programs' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {UPGRAD_PROGRAMS.map((prog) => (
              <div
                key={prog.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-[#e21b22] border border-red-200">
                      {prog.degreeType}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{prog.country}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug mb-1">
                    {prog.name}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mb-3">
                    Partner: <span className="text-slate-900 font-semibold">{prog.partnerUniversity}</span>
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600 mb-3 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Study Model:</span>
                      <span className="font-semibold text-slate-800">{prog.model}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">ECTS / Credits:</span>
                      <span className="font-semibold text-emerald-700">{prog.credits}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Intake / Fee:</span>
                      <span className="font-bold text-slate-900">{prog.intake} • {prog.fee}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>UpGrad ₹50k Waiver Eligible</span>
                  </span>
                  <button
                    onClick={() => onNavigate('leads')}
                    className="px-3 py-1.5 rounded-lg bg-[#e21b22] hover:bg-[#c4151b] text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <span>Assign Leads</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Cohort Intakes */}
      {activeTab === 'cohorts' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">2026 Academic Cohort Timeline</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl border border-red-200 bg-red-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#e21b22]">Spring 2026 Cohort</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">Active</span>
              </div>
              <p className="text-xs text-slate-600">Orientation: 15 Jan 2026</p>
              <p className="text-xs text-slate-600">Campus Transfer: Sept 2026</p>
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-900">12 Students Onboarded</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Summer 2026 Cohort</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">Admissions Open</span>
              </div>
              <p className="text-xs text-slate-600">Orientation: 10 May 2026</p>
              <p className="text-xs text-slate-600">Campus Transfer: Jan 2027</p>
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-900">9 Inquiries In Prep</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Fall 2026 Cohort</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">Early Bird</span>
              </div>
              <p className="text-xs text-slate-600">Orientation: 15 Sept 2026</p>
              <p className="text-xs text-slate-600">Campus Transfer: Fall 2027</p>
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-900">7 Applications Pending</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: UpGrad Leads Pipeline */}
      {activeTab === 'leads' && (
        <div className="space-y-3">
          <LeadsView
            leads={leads}
            selectedLead={selectedLead}
            onAddNewLead={onAddNewLead}
            onSelectLead={setSelectedLead}
            onEditLead={onEditLead}
            onEnrollLead={onEnrollLead}
            onTransferDocs={onTransferDocs}
            onDeleteLead={onDeleteLead}
            onOpenPhone={onOpenPhone}
            onOpenWhatsApp={onOpenWhatsApp}
            onOpenEmail={onOpenEmail}
            onScheduleFollowUp={onScheduleFollowUp}
            onUpdateStatus={onUpdateStatus}
            onAddNote={onAddNote}
          />
        </div>
      )}

      {/* Default Fallback for other routes */}
      {currentRoute === 'history' && <HistoryView />}
      {currentRoute === 'students' && <StudentsView onNavigate={onNavigate} />}
      {currentRoute === 'resources' && <ResourcesView onNavigate={onNavigate} />}
      {currentRoute === 'reports' && <ReportsView analytics={analytics} leads={leads} />}
    </div>
  );
};
