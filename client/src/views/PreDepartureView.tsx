import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ArrowRight,
  Search,
  Filter,
  ShieldCheck,
  FileText,
  Send,
  Smartphone,
  Mail,
  Phone,
  AlertTriangle,
  Check,
  Lock,
  RefreshCw,
  Download,
  ExternalLink,
  Share2,
  Building2,
  Calendar,
  CreditCard,
  FileCheck2,
  Plane,
  Home,
  MapPin,
  Luggage,
  Users,
} from 'lucide-react';
import { StudentRecord } from '../services/studentsData';
import { WorkflowStageBanner } from '../components/workflow/WorkflowStageBanner';
import { getStageById } from '../context/WorkflowContext';
import { ActionConfirmModal } from '../components/modals/ActionConfirmModal';

interface PreDepartureViewProps {
  students?: StudentRecord[];
  onAdvanceStage?: (studentId: string) => any;
  onNavigate?: (route: string) => void;
  onOpenPhone?: (lead: any) => void;
  onOpenWhatsApp?: (lead: any) => void;
  onOpenEmail?: (lead: any) => void;
  onScheduleFollowUp?: (lead: any) => void;
}

interface TravelRecord {
  flightAirline: string;
  flightNumber: string;
  pnrCode: string;
  departureDate: string;
  departureAirport: string;
  arrivalAirport: string;
  baggageAllowance: string;
  housingType: string;
  housingAddress: string;
  monthlyRent: string;
  landlordContact: string;
  forexCardProvider: string;
  forexLoadedAmount: string;
  cashInHand: string;
  simProvider: string;
  simPhoneNumber: string;
  departureStatus: 'Landed & Settled' | 'Departure Ready' | 'Logistics In Prep';
  permessoOrAnmeldungStatus: string;
}

const getTravelForStudent = (st: StudentRecord): TravelRecord => {
  const isLanded = st.stageNumber === 12;

  if (st.country === 'Italy') {
    return {
      flightAirline: 'Qatar Airways (via Doha)',
      flightNumber: 'QR 579 & QR 127',
      pnrCode: `IT-PNR-2027-${st.studentId.slice(-3)}`,
      departureDate: '12 Sep 2027',
      departureAirport: 'DEL (Indira Gandhi Int, New Delhi)',
      arrivalAirport: 'MXP (Milan Malpensa Int, Milan)',
      baggageAllowance: '40 kg Student Allowance (2 x 23kg)',
      housingType: 'Camplus Student Residence (Single Room)',
      housingAddress: 'Via Giovanni da Procida 18, 20149 Milano MI, Italy',
      monthlyRent: '€ 450 / month (DSU Subsidized)',
      landlordContact: 'Camplus Housing Office (+39 02 849201)',
      forexCardProvider: 'Niyo Global Multi-Currency Forex Card',
      forexLoadedAmount: '€ 2,500 Loaded',
      cashInHand: '€ 650 (Euros in Cash)',
      simProvider: 'Iliad Italy 150GB 5G eSIM',
      simPhoneNumber: '+39 349 829 1048',
      departureStatus: isLanded ? 'Landed & Settled' : 'Departure Ready',
      permessoOrAnmeldungStatus: isLanded ? 'Permesso Kit Submitted (Questura Appt 18 Oct)' : 'Yellow Postal Kit Prepared',
    };
  }

  if (st.country === 'Germany') {
    return {
      flightAirline: 'Lufthansa Direct',
      flightNumber: 'LH 761',
      pnrCode: `LH-GER-2027-${st.studentId.slice(-3)}`,
      departureDate: '18 Sep 2027',
      departureAirport: 'BOM (Chhatrapati Shivaji Maharaj, Mumbai)',
      arrivalAirport: 'MUC (Munich Airport, Germany)',
      baggageAllowance: '40 kg Student Allowance (2 x 23kg)',
      housingType: 'Studentenwerk Munich University Dormitory',
      housingAddress: 'Leopoldstraße 150, 80804 München, Germany',
      monthlyRent: '€ 380 / month (Heating Included)',
      landlordContact: 'Studentenwerk München (+49 89 381960)',
      forexCardProvider: 'Coracle Multi-Currency Card & Expatrio Current Acc',
      forexLoadedAmount: '€ 1,800 + Blocked Account Active',
      cashInHand: '€ 800 (Cash)',
      simProvider: 'Vodafone Germany CallYa Digital',
      simPhoneNumber: '+49 152 9841 8201',
      departureStatus: isLanded ? 'Landed & Settled' : 'Departure Ready',
      permessoOrAnmeldungStatus: isLanded ? 'Anmeldung Completed (Bürgeramt München)' : 'Anmeldung Slot Booked',
    };
  }

  if (st.country === 'UK') {
    return {
      flightAirline: 'British Airways Direct',
      flightNumber: 'BA 142',
      pnrCode: `BA-UK-2027-${st.studentId.slice(-3)}`,
      departureDate: '10 Sep 2027',
      departureAirport: 'DEL (New Delhi)',
      arrivalAirport: 'LHR (London Heathrow Terminal 5)',
      baggageAllowance: '46 kg (2 x 23kg) Student Fare',
      housingType: 'University Hall of Residence (En-suite)',
      housingAddress: 'Oxford Road, Manchester M13 9PL, United Kingdom',
      monthlyRent: '£ 650 / month (Bills Included)',
      landlordContact: 'Manchester Accom Office (+44 161 275 2888)',
      forexCardProvider: 'Thomas Cook Borderless Prepaid Forex Card',
      forexLoadedAmount: '£ 3,000 Loaded',
      cashInHand: '£ 700 (GBP Cash)',
      simProvider: 'giffgaff UK 100GB Monthly Rolling',
      simPhoneNumber: '+44 7700 900821',
      departureStatus: isLanded ? 'Landed & Settled' : 'Departure Ready',
      permessoOrAnmeldungStatus: isLanded ? 'BRP Collected from Post Office' : 'BRP Collection Letter Assigned',
    };
  }

  return {
    flightAirline: 'Air France Direct',
    flightNumber: 'AF 225',
    pnrCode: `AF-FR-2027-${st.studentId.slice(-3)}`,
    departureDate: '01 Sep 2027',
    departureAirport: 'DEL (New Delhi)',
    arrivalAirport: 'CDG (Paris Charles de Gaulle)',
    baggageAllowance: '40 kg Student Allowance',
    housingType: 'CROUS Student Residence Paris',
    housingAddress: 'Boulevard Jourdan, 75014 Paris, France',
    monthlyRent: '€ 420 / month',
    landlordContact: 'CROUS de Paris (+33 1 40 51 36 00)',
    forexCardProvider: 'Niyo Global Forex Card',
    forexLoadedAmount: '€ 2,000 Loaded',
    cashInHand: '€ 600',
    simProvider: 'Free Mobile 250GB 5G',
    simPhoneNumber: '+33 6 12 34 56 78',
    departureStatus: isLanded ? 'Landed & Settled' : 'Departure Ready',
    permessoOrAnmeldungStatus: 'OFII Validation Scheduled',
  };
};

export const PreDepartureView: React.FC<PreDepartureViewProps> = ({
  students,
  onAdvanceStage,
  onNavigate,
  onOpenPhone,
  onOpenWhatsApp,
  onOpenEmail,
  onScheduleFollowUp,
}) => {
  const studentList = students || [];

  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [tabFilter, setTabFilter] = useState<'All' | 'Landed' | 'Ready' | 'InPrep'>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [activeTravel, setActiveTravel] = useState<TravelRecord | null>(null);
  const [confirmModalData, setConfirmModalData] = useState<{
    isOpen: boolean;
    title: string;
    studentName: string;
    studentId: string;
    studentAvatar?: string;
    country?: string;
    currentStageName: string;
    targetStageName: string;
    description: string;
    confirmLabel: string;
    variant?: 'primary' | 'success' | 'warning';
    onConfirm: () => void;
  } | null>(null);

  // Hash deep-linking
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.includes('pre-departure') && hash.includes('?id=')) {
        const idParam = hash.split('?id=')[1];
        const match = studentList.find(
          (s) =>
            s.studentId.toLowerCase() === idParam.toLowerCase() ||
            s.id.toLowerCase() === idParam.toLowerCase() ||
            s.name.toLowerCase().includes(idParam.toLowerCase())
        );
        if (match) handleOpenStudent(match);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [studentList]);

  const handleOpenStudent = (st: StudentRecord) => {
    setSelectedStudent(st);
    window.location.hash = `pre-departure?id=${st.studentId}`;
    setActiveTravel(getTravelForStudent(st));
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
    window.location.hash = 'pre-departure';
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Stats
  const stats = useMemo(() => {
    let landed = 0;
    let ready = 0;
    let inPrep = 0;

    studentList.forEach((st) => {
      const t = getTravelForStudent(st);
      if (t.departureStatus === 'Landed & Settled') landed++;
      else if (t.departureStatus === 'Departure Ready') ready++;
      else inPrep++;
    });

    return {
      total: studentList.length,
      landed,
      ready,
      inPrep,
    };
  }, [studentList]);

  // Filtered List
  const filteredStudents = useMemo(() => {
    return studentList.filter((st) => {
      const t = getTravelForStudent(st);

      if (tabFilter === 'Landed' && t.departureStatus !== 'Landed & Settled') return false;
      if (tabFilter === 'Ready' && t.departureStatus !== 'Departure Ready') return false;
      if (tabFilter === 'InPrep' && t.departureStatus !== 'Logistics In Prep') return false;

      if (countryFilter !== 'All' && st.country !== countryFilter) return false;
      if (statusFilter !== 'All' && t.departureStatus !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          st.name.toLowerCase().includes(q) ||
          st.studentId.toLowerCase().includes(q) ||
          st.country.toLowerCase().includes(q) ||
          t.pnrCode.toLowerCase().includes(q) ||
          t.housingAddress.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [studentList, tabFilter, countryFilter, statusFilter, searchQuery]);

  return (
    <div className="p-3.5 pb-16 space-y-3 max-w-[1536px] mx-auto font-sans text-[#101d37] min-h-screen">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 right-5 z-50 bg-[#07182c] text-white text-xs px-4 py-2.5 rounded-lg shadow-xl border border-teal-500/30 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-3 text-slate-400 hover:text-white font-bold">
            ×
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODE 1: DIRECTORY VIEW                                               */}
      {/* ==================================================================== */}
      {!selectedStudent && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[17px] font-bold text-[#101d37] leading-tight">
                    Pre-Departure & Arrival Management
                  </h1>
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold border border-teal-200">
                    <Luggage className="w-3 h-3 text-teal-600" /> Stage 12 • Flight, Housing, Forex & Post-Landing Compliance
                  </span>
                </div>
                <p className="text-[11.5px] text-[#64748b] leading-tight mt-0.5">
                  Flight booking (40kg student allowance), accommodation leasing, Forex multi-currency cards, international SIMs, and Italian Permesso / German Anmeldung.
                </p>
              </div>
            </div>

            <div className="text-[11.5px] text-[#64748b] hidden sm:inline">
              Home &gt; <span className="font-semibold text-[#101d37]">Pre-Departure & Arrival</span>
            </div>
          </div>

          {/* Workflow Stage Banner */}
          <WorkflowStageBanner
            stage={getStageById('pre-departure')}
            students={studentList}
            selectedId={null}
            onSelect={(id) => {
              const st = studentList.find((s) => s.id === id);
              if (st) handleOpenStudent(st);
            }}
            onAdvance={(id) => {
              const targetStudent = studentList.find((s) => s.id === id || s.studentId === id);
              if (targetStudent) {
                setConfirmModalData({
                  isOpen: true,
                  title: 'Confirm Student Landed & Settled',
                  studentName: targetStudent.name,
                  studentId: targetStudent.studentId,
                  studentAvatar: targetStudent.avatar,
                  country: targetStudent.country,
                  currentStageName: 'Stage 12: Pre-Departure & Arrival',
                  targetStageName: 'Completed Lifecycle (Enrolled Abroad)',
                  description: `Confirm that ${targetStudent.name} has safely landed abroad, completed campus check-in, and successfully finalized their study abroad onboarding journey.`,
                  confirmLabel: 'Confirm Landed & Complete',
                  variant: 'success',
                  onConfirm: () => {
                    if (onAdvanceStage) onAdvanceStage(id);
                    showToast(`${targetStudent.name} is marked as Landed & Settled abroad! 🎉`);
                  },
                });
              } else if (onAdvanceStage) {
                onAdvanceStage(id);
              }
            }}
            onEmptyAction={() => onNavigate && onNavigate('visa-process')}
            emptyActionLabel="Go to Visa Processing"
            emptyHint="No students have reached the Pre-Departure stage yet."
          />

          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Total Departure Ready</span>
              <div className="text-[19px] font-bold text-[#101d37] mt-0.5">{stats.total}</div>
              <span className="text-[10px] text-[#087cf5] font-semibold">● Visa Approved Cohort</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Landed & Settled in EU/UK</span>
              <div className="text-[19px] font-bold text-emerald-600 mt-0.5">{stats.landed}</div>
              <span className="text-[10px] text-emerald-600 font-semibold">✓ Legal Kits Submitted</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Departure Ready (Travel Pack)</span>
              <div className="text-[19px] font-bold text-teal-700 mt-0.5">{stats.ready}</div>
              <span className="text-[10px] text-teal-700 font-semibold">Flights & Housing Leased</span>
            </div>

            <div className="bg-white border border-[#e5edf5] rounded-[8px] p-2.5 shadow-xs">
              <span className="text-[10.5px] text-[#64748b] font-medium block">Logistics In Preparation</span>
              <div className="text-[19px] font-bold text-amber-600 mt-0.5">{stats.inPrep}</div>
              <span className="text-[10px] text-amber-600 font-medium">Forex & SIM Activation</span>
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-white rounded-[8px] border border-[#e5edf5] p-3 shadow-xs space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11.5px]">
                {[
                  { id: 'All', label: `All Candidates (${stats.total})` },
                  { id: 'Landed', label: `Landed in Host Country (${stats.landed})` },
                  { id: 'Ready', label: `Departure Ready (${stats.ready})` },
                ].map((tb) => (
                  <button
                    key={tb.id}
                    onClick={() => setTabFilter(tb.id as any)}
                    className={`px-3 py-1.5 rounded-[5px] font-semibold transition-colors whitespace-nowrap ${
                      tabFilter === tb.id
                        ? 'bg-[#087cf5] text-white shadow-xs'
                        : 'bg-slate-50 text-[#52627a] hover:bg-slate-100 hover:text-[#101d37]'
                    }`}
                  >
                    {tb.label}
                  </button>
                ))}
              </div>

              {studentList.length > 0 && (
                <button
                  onClick={() => handleOpenStudent(studentList[0])}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-[#087cf5] hover:bg-[#006ee6] text-white text-[12px] font-semibold transition-colors shadow-xs"
                >
                  <Compass className="w-3.5 h-3.5 text-teal-200" />
                  <span>Open Pre-Departure Workspace ({studentList[0].name})</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2 pt-1 border-t border-slate-100">
              <div className="relative sm:col-span-2">
                <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search candidate by name, student ID, PNR, or host city..."
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] focus:bg-white rounded-[6px] pl-8 pr-3 py-1.5 text-[12px] text-[#101d37] outline-none transition-all"
                />
              </div>

              <div>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] rounded-[6px] px-2.5 py-1.5 text-[12px] text-[#101d37] outline-none"
                >
                  <option value="All">All Destination Countries</option>
                  <option value="Italy">🇮🇹 Italy (Milan, Rome, Padua)</option>
                  <option value="Germany">🇩🇪 Germany (Munich, Berlin, Aachen)</option>
                  <option value="UK">🇬🇧 United Kingdom (London, Manchester)</option>
                </select>
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] rounded-[6px] px-2.5 py-1.5 text-[12px] text-[#101d37] outline-none"
                >
                  <option value="All">All Departure Statuses</option>
                  <option value="Landed & Settled">Landed & Settled</option>
                  <option value="Departure Ready">Departure Ready</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-[8px] border border-[#e5edf5] shadow-xs overflow-hidden flex flex-col">
            <div className="overflow-x-auto overflow-y-auto max-h-[640px] scrollbar-thin">
              <table className="w-full text-left text-[12px] border-collapse min-w-[1260px]">
                <thead className="sticky top-0 bg-[#f8fafc] z-10 border-b border-[#e5edf5] shadow-2xs">
                  <tr className="text-[#52627a] font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-3 text-center w-12 shrink-0">#</th>
                    <th className="py-3 px-3 min-w-[270px]">Student & Academic Profile</th>
                    <th className="py-3 px-3 min-w-[210px]">Destination City & University</th>
                    <th className="py-3 px-3 min-w-[320px]">Flight Itinerary & Baggage</th>
                    <th className="py-3 px-3 min-w-[170px] text-center">Accommodation Status</th>
                    <th className="py-3 px-3 min-w-[170px] text-center">Departure Status</th>
                    <th className="py-3 px-3 min-w-[140px] text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((st, idx) => {
                      const tr = getTravelForStudent(st);

                      return (
                        <tr
                          key={st.id}
                          onClick={() => handleOpenStudent(st)}
                          className="hover:bg-teal-50/30 cursor-pointer transition-colors group"
                        >
                          <td className="py-3.5 px-3 text-center text-[#64748b] font-medium text-[11.5px] align-middle">
                            {idx + 1}
                          </td>

                          <td className="py-3.5 px-3 min-w-[270px] align-middle">
                            <div className="flex items-center gap-3">
                              <img
                                src={st.avatar}
                                alt={st.name}
                                onError={(e) => {
                                  (e.target as HTMLElement).style.visibility = 'hidden';
                                }}
                                className="w-10 h-10 aspect-square rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs"
                              />
                              <div className="min-w-0">
                                <div className="font-bold text-[#101d37] group-hover:text-[#087cf5] transition-colors text-[13px] leading-snug whitespace-nowrap">
                                  {st.name}
                                </div>
                                <div className="text-[10.5px] text-[#64748b] font-medium flex items-center gap-1.5 mt-1 whitespace-nowrap">
                                  <span className="font-mono text-slate-500 font-semibold">ID: {st.studentId}</span>
                                  <span className="text-slate-300">•</span>
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 font-bold text-slate-700">
                                    {st.phone}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 min-w-[210px] align-middle">
                            <div className="font-semibold text-[#101d37] text-[12px] flex items-center gap-1.5 whitespace-nowrap">
                              <span className="text-sm">
                                {st.country === 'Italy' ? '🇮🇹' : st.country === 'Germany' ? '🇩🇪' : st.country === 'UK' ? '🇬🇧' : '🇫🇷'}
                              </span>
                              <span>{st.country}</span>
                              <span className="text-[10.5px] text-slate-400 font-normal">({st.intake})</span>
                            </div>
                            <div className="text-[11px] text-[#64748b] mt-1 flex items-center gap-1.5 whitespace-nowrap truncate max-w-[200px]">
                              <span>{st.targetUniversity}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 min-w-[320px] align-middle">
                            <div className="flex flex-col gap-1">
                              <div className="font-bold text-slate-800 text-[12px] flex items-center gap-1.5 truncate">
                                <Plane className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                <span>{tr.flightAirline} • {tr.departureDate}</span>
                              </div>
                              <div className="text-[11px] text-slate-600 flex items-center gap-2">
                                <span className="font-mono font-semibold text-teal-700">{tr.pnrCode}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-emerald-700 font-semibold">{tr.baggageAllowance}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 min-w-[170px] text-center align-middle">
                            <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-[5px] text-[11px] font-semibold border whitespace-nowrap bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs">
                              <Home className="w-3 h-3 text-emerald-600" />
                              <span>{tr.housingType.split('(')[0]}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-3 min-w-[170px] text-center align-middle">
                            <span
                              className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-[5px] text-[11px] font-semibold border whitespace-nowrap shadow-2xs ${
                                tr.departureStatus === 'Landed & Settled'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-teal-50 text-teal-800 border-teal-200'
                              }`}
                            >
                              <CheckCircle2 className="w-3 h-3 text-teal-600" />
                              <span>{tr.departureStatus}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-3 min-w-[140px] text-center align-middle">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenStudent(st);
                              }}
                              className="px-3 py-1.5 rounded-[5px] bg-[#087cf5] text-white hover:bg-[#006ee6] font-semibold text-[11px] transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-xs hover:shadow group/btn"
                            >
                              <span>Departure Pack</span>
                              <span className="transition-transform group-hover/btn:translate-x-0.5 font-bold">&gt;</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#64748b] text-xs">
                        No pre-departure records found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-3.5 py-2.5 bg-[#f8fafc] border-t border-[#e5edf5] flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-[#64748b]">
              <span>Showing <strong>{filteredStudents.length}</strong> departure & arrival records</span>
              <span className="text-teal-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 inline-block" />
                Landing Assistance Desk 2026/27 Active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODE 2: WORKSPACE WINDOW                                             */}
      {/* ==================================================================== */}
      {selectedStudent && activeTravel && (
        <div className="space-y-3.5 animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-0.5">
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleBackToList}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#e2e8f0] bg-white hover:bg-slate-50 text-[12px] font-semibold text-[#101d37] shadow-xs transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#087cf5]" />
                <span>← Back to Pre-Departure Directory</span>
              </button>

              <span className="text-[12px] text-[#64748b] hidden sm:inline">
                Home &gt; Pre-Departure &gt;{' '}
                <span className="font-bold text-[#101d37]">{selectedStudent.name}</span>{' '}
                <span className="text-[#64748b]">({selectedStudent.studentId})</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast('Pre-Departure Briefing Pack PDF exported')}
                className="px-2.5 py-1.5 rounded-[6px] border border-[#cbd5e1] bg-white hover:bg-slate-50 text-[#101d37] text-[11.5px] font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export Departure Pack</span>
              </button>
            </div>
          </div>

          {/* Student Banner */}
          <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <img
                  src={selectedStudent.avatar}
                  alt={selectedStudent.name}
                  onError={(e) => {
                    (e.target as HTMLElement).style.visibility = 'hidden';
                  }}
                  className="w-12 h-12 aspect-square rounded-full object-cover border-2 border-teal-500/30 shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[16px] font-bold text-[#101d37] leading-tight">
                      {selectedStudent.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10.5px] font-mono font-bold">
                      {selectedStudent.studentId}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold flex items-center gap-1">
                      <Compass className="w-3 h-3 text-teal-600" /> {activeTravel.departureStatus}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#64748b] mt-1">
                    <span>Flight: <strong className="text-slate-800">{activeTravel.flightAirline}</strong> ({activeTravel.flightNumber})</span>
                    <span>•</span>
                    <span>Housing: <strong className="text-slate-800">{activeTravel.housingType}</strong></span>
                    <span>•</span>
                    <span>Host Phone: <strong className="font-mono text-teal-700">{activeTravel.simPhoneNumber}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-[6px] bg-teal-50/70 border border-teal-200 text-center">
                  <span className="text-[10px] text-teal-800 font-semibold block">Flight Departure</span>
                  <span className="text-[12px] font-bold text-teal-900">{activeTravel.departureDate}</span>
                </div>
                <div className="px-3 py-1.5 rounded-[6px] bg-emerald-50/70 border border-emerald-200 text-center">
                  <span className="text-[10px] text-emerald-800 font-semibold block">Forex Funds</span>
                  <span className="text-[12px] font-bold text-emerald-900">{activeTravel.forexLoadedAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Cards Grid: Flight, Housing, Forex, Post-Landing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Card 1: Flight */}
            <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs space-y-2.5">
              <h3 className="font-bold text-[13.5px] text-[#101d37] flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Plane className="w-4 h-4 text-teal-600" />
                Flight Itinerary & Baggage Allowance
              </h3>

              <div className="space-y-1.5 text-[11.5px] text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Airline / Route:</span>
                  <strong className="text-slate-800">{activeTravel.flightAirline} ({activeTravel.flightNumber})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">PNR Reference:</span>
                  <strong className="font-mono text-teal-700">{activeTravel.pnrCode}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Departure Airport:</span>
                  <strong className="text-slate-800">{activeTravel.departureAirport}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Arrival Airport:</span>
                  <strong className="text-slate-800">{activeTravel.arrivalAirport}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Baggage Allowance:</span>
                  <strong className="text-emerald-700 font-bold">{activeTravel.baggageAllowance}</strong>
                </div>
              </div>
            </div>

            {/* Card 2: Housing */}
            <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs space-y-2.5">
              <h3 className="font-bold text-[13.5px] text-[#101d37] flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Home className="w-4 h-4 text-[#087cf5]" />
                Accommodation & Leased Housing
              </h3>

              <div className="space-y-1.5 text-[11.5px] text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Housing Category:</span>
                  <strong className="text-slate-800">{activeTravel.housingType}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Address:</span>
                  <strong className="text-slate-800 text-right max-w-[240px] truncate">{activeTravel.housingAddress}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Monthly Rent:</span>
                  <strong className="text-emerald-700 font-bold">{activeTravel.monthlyRent}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Landlord Contact:</span>
                  <strong className="text-slate-800">{activeTravel.landlordContact}</strong>
                </div>
              </div>
            </div>

            {/* Card 3: Forex & SIM */}
            <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs space-y-2.5">
              <h3 className="font-bold text-[13.5px] text-[#101d37] flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Forex Card & International Telecoms Kit
              </h3>

              <div className="space-y-1.5 text-[11.5px] text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Multi-Currency Card:</span>
                  <strong className="text-slate-800">{activeTravel.forexCardProvider}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Loaded Amount:</span>
                  <strong className="text-emerald-700 font-bold">{activeTravel.forexLoadedAmount}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Emergency Cash in Hand:</span>
                  <strong className="text-slate-800">{activeTravel.cashInHand}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">International SIM Provider:</span>
                  <strong className="text-slate-800">{activeTravel.simProvider}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Host Mobile Number:</span>
                  <strong className="font-mono text-teal-700">{activeTravel.simPhoneNumber}</strong>
                </div>
              </div>
            </div>

            {/* Card 4: Post-Landing Compliance */}
            <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs space-y-2.5">
              <h3 className="font-bold text-[13.5px] text-[#101d37] flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Post-Landing Host Country Compliance Kit
              </h3>

              <div className="space-y-1.5 text-[11.5px] text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Residence Permit / Kit:</span>
                  <strong className="text-indigo-700 font-semibold">{activeTravel.permessoOrAnmeldungStatus}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tax Registration:</span>
                  <strong className="text-emerald-700">Codice Fiscale / Tax ID Collected</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">National Health Insurance:</span>
                  <strong className="text-slate-800">Tessera Sanitaria / TK Active</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Senior Buddy Assigned:</span>
                  <strong className="text-slate-800">Vikram S. (2nd Year Master)</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="bg-white rounded-[9px] border border-[#e5edf5] p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="text-[12px] text-slate-600">
              Candidate is fully departure-ready. All travel, housing, and legal arrival kits are validated.
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 mr-2 border-r border-slate-200 pr-3">
                <button
                  onClick={() => onOpenPhone?.(selectedStudent as any)}
                  title="Call candidate"
                  className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenWhatsApp?.(selectedStudent as any)}
                  title="WhatsApp message"
                  className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenEmail?.(selectedStudent as any)}
                  title="Send email"
                  className="p-1.5 rounded hover:bg-blue-50 text-[#087cf5]"
                >
                  <Mail className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onScheduleFollowUp?.(selectedStudent as any)}
                  title="Schedule flight check-in"
                  className="p-1.5 rounded hover:bg-indigo-50 text-indigo-600"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => {
                  setConfirmModalData({
                    isOpen: true,
                    title: 'Confirm Student Landed & Settled',
                    studentName: selectedStudent.name,
                    studentId: selectedStudent.studentId,
                    studentAvatar: selectedStudent.avatar,
                    country: selectedStudent.country,
                    currentStageName: 'Stage 12: Pre-Departure & Arrival',
                    targetStageName: 'Completed Lifecycle (Enrolled Abroad)',
                    description: `Confirm that ${selectedStudent.name} has safely landed abroad at ${activeTravel?.arrivalAirport || selectedStudent.targetUniversity}, completed campus check-in, and successfully finalized their study abroad onboarding journey.`,
                    confirmLabel: 'Confirm Landed & Complete',
                    variant: 'success',
                    onConfirm: () => {
                      showToast('Candidate marked as Landed & Settled in Host Country! 🎉');
                      setActiveTravel((prev) => prev ? { ...prev, departureStatus: 'Landed & Settled' } : null);
                      if (onAdvanceStage) onAdvanceStage(selectedStudent.studentId || selectedStudent.id);
                    },
                  });
                }}
                className="px-4 py-2 rounded-[6px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12px] shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark as Landed & Settled</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Confirmation Floating Modal */}
      {confirmModalData && (
        <ActionConfirmModal
          isOpen={confirmModalData.isOpen}
          title={confirmModalData.title}
          studentName={confirmModalData.studentName}
          studentId={confirmModalData.studentId}
          studentAvatar={confirmModalData.studentAvatar}
          country={confirmModalData.country}
          currentStageName={confirmModalData.currentStageName}
          targetStageName={confirmModalData.targetStageName}
          description={confirmModalData.description}
          confirmLabel={confirmModalData.confirmLabel}
          variant={confirmModalData.variant}
          onConfirm={() => {
            confirmModalData.onConfirm();
            setConfirmModalData(null);
          }}
          onClose={() => setConfirmModalData(null)}
        />
      )}
    </div>
  );
};
