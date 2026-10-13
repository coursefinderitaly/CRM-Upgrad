import React, { useMemo, useState } from 'react';
import {
  Library,
  GraduationCap,
  Sparkles,
  Plane,
  Landmark,
  Search,
  Download,
  X,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Globe,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
  Copy,
  Stamp,
  Building2,
  ExternalLink,
  FileText,
  Share2,
} from 'lucide-react';
import {
  RESOURCE_GROUPS,
  VISA_PACKS,
  DESTINATION_COUNTRIES,
  INDIAN_STATES,
  EMBASSY_DIRECTORY,
  HRD_CENTRES,
  categoryCounts,
  documentsForCountry,
  embassiesForState,
  hrdCentresForState,
  buildSampleDocumentText,
  buildChecklistText,
  buildHRDDirectoryText,
  buildHRDAuthorizationLetterText,
  type DocumentSample,
  type ResourceCategory,
  type RequirementLevel,
  type DestinationFilter,
  type DestinationCountry,
  type EmbassyEntry,
  type HRDCentre,
} from '../services/resourcesData';

interface ResourcesViewProps {
  onNavigate?: (route: string) => void;
}

type SectionId = 'academic' | 'scholarship' | 'visa' | 'hrd' | 'embassies';

const SECTIONS: {
  id: SectionId;
  label: string;
  short: string;
  subtitle: string;
  icon: React.ElementType;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  accentSolid: string;
  gradient: string;
  chip: string;
}[] = [
  {
    id: 'academic',
    label: 'Academic Documents',
    short: 'Academic',
    subtitle: 'Everything a student needs for university admission — IDs, marksheets, tests, essays and country paperwork.',
    icon: GraduationCap,
    accentText: 'text-[#087cf5]',
    accentBg: 'bg-blue-50',
    accentBorder: 'border-blue-200',
    accentSolid: 'bg-[#087cf5]',
    gradient: 'from-[#087cf5] to-[#0059c9]',
    chip: 'bg-blue-50 text-[#087cf5] border-blue-200',
  },
  {
    id: 'scholarship',
    label: 'Scholarship Documents',
    short: 'Scholarship',
    subtitle: 'The exact papers scholarship panels ask for — marks, income proof, essays and references.',
    icon: Sparkles,
    accentText: 'text-[#7c3aed]',
    accentBg: 'bg-purple-50',
    accentBorder: 'border-purple-200',
    accentSolid: 'bg-[#7c3aed]',
    gradient: 'from-[#7c3aed] to-[#5b21b6]',
    chip: 'bg-purple-50 text-[#7c3aed] border-purple-200',
  },
  {
    id: 'visa',
    label: 'Visa Documents',
    short: 'Visa',
    subtitle: 'Country-wise visa files — forms, money proof, insurance and what to do after landing.',
    icon: Plane,
    accentText: 'text-[#059669]',
    accentBg: 'bg-emerald-50',
    accentBorder: 'border-emerald-200',
    accentSolid: 'bg-[#059669]',
    gradient: 'from-[#059669] to-[#047857]',
    chip: 'bg-emerald-50 text-[#059669] border-emerald-200',
  },
  {
    id: 'hrd',
    label: 'State HRD & Authentication Centres',
    short: 'HRD',
    subtitle: 'State-wise Regional Authentication Centres (RAC), university verification guidelines, e-Sanad online portal and MEA legalization rules.',
    icon: Stamp,
    accentText: 'text-[#d97706]',
    accentBg: 'bg-amber-50',
    accentBorder: 'border-amber-200',
    accentSolid: 'bg-[#d97706]',
    gradient: 'from-[#b45309] via-[#d97706] to-[#92400e]',
    chip: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    id: 'embassies',
    label: 'Embassy & State Finder',
    short: 'Embassy Finder',
    subtitle: 'Find the right embassy, consulate or VFS centre for the student’s home state.',
    icon: Landmark,
    accentText: 'text-[#4f46e5]',
    accentBg: 'bg-indigo-50',
    accentBorder: 'border-indigo-200',
    accentSolid: 'bg-[#4f46e5]',
    gradient: 'from-[#4f46e5] to-[#3730a3]',
    chip: 'bg-indigo-50 text-[#4f46e5] border-indigo-200',
  },
];

/* Plain-English labels so staff and students understand instantly */
const PLAIN_REQUIREMENT: Record<RequirementLevel, string> = {
  Mandatory: 'Must have',
  Recommended: 'Good to have',
  Conditional: 'Only if needed',
};

const REQUIREMENT_STYLES: Record<RequirementLevel, string> = {
  Mandatory: 'bg-rose-50 text-rose-700 border-rose-200',
  Recommended: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Conditional: 'bg-slate-100 text-slate-600 border-slate-200',
};

const downloadText = (filename: string, text: string) => {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

const countryFlag = (country: DestinationCountry): string =>
  DESTINATION_COUNTRIES.find((c) => c.id === country)?.flag || '🌍';

const destinationsText = (doc: DocumentSample): string =>
  doc.appliesTo.includes('All')
    ? 'All destinations'
    : doc.appliesTo.map((c) => `${countryFlag(c as DestinationCountry)} ${c}`).join(', ');

export const ResourcesView: React.FC<ResourcesViewProps> = ({ onNavigate }) => {
  const [section, setSection] = useState<SectionId>('academic');
  const [searchQuery, setSearchQuery] = useState('');
  const [requirementFilter, setRequirementFilter] = useState<'All' | RequirementLevel>('All');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [destination, setDestination] = useState<DestinationFilter>('All');
  const [selectedDoc, setSelectedDoc] = useState<DocumentSample | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [stateFilter, setStateFilter] = useState<string>('All');
  const [embassyCountry, setEmbassyCountry] = useState<DestinationFilter>('All');
  const [missionType, setMissionType] = useState<'All' | 'Missions' | 'VFS'>('Missions');

  // HRD State
  const [hrdStateFilter, setHrdStateFilter] = useState<string>('All');
  const [hrdModeFilter, setHrdModeFilter] = useState<'All' | 'e-Sanad Online' | 'Physical Walk-in'>('All');
  const [hrdSearchQuery, setHrdSearchQuery] = useState('');
  const [selectedHrdCentre, setSelectedHrdCentre] = useState<HRDCentre | null>(null);
  const [showAuthLetterModal, setShowAuthLetterModal] = useState(false);

  // Authorization Draft fields
  const [authStudentName, setAuthStudentName] = useState('Rahul Sharma');
  const [authPassportNo, setAuthPassportNo] = useState('Z6492104');
  const [authRepName, setAuthRepName] = useState('Priya Sharma');
  const [authRelationship, setAuthRelationship] = useState('Mother / Authorized Family Member');
  const [authUnivName, setAuthUnivName] = useState('University of Delhi');
  const [authDegreeName, setAuthDegreeName] = useState('Bachelor of Science (Computer Science)');

  const activeMeta = SECTIONS.find((s) => s.id === section)!;
  const isDocSection = section === 'academic' || section === 'scholarship' || section === 'visa';
  const isHrdSection = section === 'hrd';
  const isEmbassySection = section === 'embassies';
  const category = (isDocSection ? section : 'academic') as ResourceCategory;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  /* ---------------- Documents ---------------- */

  const sectionDocs = useMemo(
    () => (isDocSection ? documentsForCountry(category, destination) : []),
    [isDocSection, category, destination]
  );

  const filteredDocs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sectionDocs.filter((doc) => {
      const matchesGroup = groupFilter === 'all' || doc.group === groupFilter;
      const matchesRequirement = requirementFilter === 'All' || doc.requirement === requirementFilter;
      const matchesSearch =
        q.length === 0 ||
        doc.name.toLowerCase().includes(q) ||
        doc.description.toLowerCase().includes(q) ||
        doc.issuingAuthority.toLowerCase().includes(q);
      return matchesGroup && matchesRequirement && matchesSearch;
    });
  }, [sectionDocs, groupFilter, requirementFilter, searchQuery]);

  const groupedDocs = useMemo(
    () =>
      RESOURCE_GROUPS[category]
        .map((group) => ({ ...group, docs: filteredDocs.filter((d) => d.group === group.id) }))
        .filter((g) => g.docs.length > 0),
    [category, filteredDocs]
  );

  /* ---------------- HRD Centres ---------------- */

  const filteredHrdCentres = useMemo(() => {
    const q = hrdSearchQuery.trim().toLowerCase();
    return HRD_CENTRES.filter((c) => {
      const matchesState = hrdStateFilter === 'All' || c.state === hrdStateFilter;
      const matchesMode =
        hrdModeFilter === 'All' ||
        (hrdModeFilter === 'e-Sanad Online'
          ? c.mode.includes('e-Sanad')
          : c.mode.includes('Physical'));
      const matchesSearch =
        q.length === 0 ||
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.jurisdiction.toLowerCase().includes(q) ||
        c.officer.toLowerCase().includes(q);
      return matchesState && matchesMode && matchesSearch;
    });
  }, [hrdStateFilter, hrdModeFilter, hrdSearchQuery]);

  /* ---------------- Embassies ---------------- */

  const embassyResults = useMemo(() => {
    const list = embassiesForState(stateFilter, embassyCountry).filter((e) => {
      if (missionType === 'All') return true;
      if (missionType === 'Missions') return e.type !== 'VFS Visa Centre';
      return e.type === 'VFS Visa Centre';
    });
    const typeOrder: Record<EmbassyEntry['type'], number> = {
      Embassy: 0,
      'Consulate General': 1,
      'VFS Visa Centre': 2,
    };
    return [...list].sort((a, b) => {
      if (a.country !== b.country) return a.country.localeCompare(b.country);
      if (typeOrder[a.type] !== typeOrder[b.type]) return typeOrder[a.type] - typeOrder[b.type];
      return a.city.localeCompare(b.city);
    });
  }, [stateFilter, embassyCountry, missionType]);

  const decidingMissions = embassyResults.filter((e) => e.type !== 'VFS Visa Centre');
  const submissionCentres = embassyResults.filter((e) => e.type === 'VFS Visa Centre');

  /* ---------------- Actions ---------------- */

  const handleDownloadSample = (doc: DocumentSample) => {
    downloadText(`${doc.id}_sample_fields.txt`, buildSampleDocumentText(doc));
    showToast(`Sample saved — ${doc.name}`);
  };

  const handleDownloadChecklist = () => {
    downloadText(
      `${category}_document_checklist.txt`,
      buildChecklistText(category, filteredDocs, destination)
    );
    showToast(`Checklist saved — ${filteredDocs.length} documents`);
  };

  const handleDownloadHrdDirectory = () => {
    downloadText(
      `state_hrd_centres_directory_${hrdStateFilter.toLowerCase().replace(/\s+/g, '_')}.txt`,
      buildHRDDirectoryText(filteredHrdCentres, hrdStateFilter)
    );
    showToast(`HRD Directory saved — ${filteredHrdCentres.length} state centres`);
  };

  const handleCopyHrdCentre = async (c: HRDCentre) => {
    const text = [
      `HRD CENTRE: ${c.name}`,
      `State & City: ${c.state} - ${c.city}`,
      `Department: ${c.department}`,
      `Address: ${c.address}`,
      `Officer: ${c.officer} (${c.designation})`,
      c.phone ? `Phone: ${c.phone}` : null,
      c.email ? `Email: ${c.email}` : null,
      `Timings: ${c.timings}`,
      `Turnaround: ${c.processingDays} | Fee: ${c.fees}`,
      `Website: ${c.website}`,
      c.eSanadUrl ? `e-Sanad: ${c.eSanadUrl}` : null,
      `Instructions: ${c.instructions}`,
    ].filter(Boolean).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      showToast(`Copied details for ${c.city} HRD Centre`);
    } catch {
      showToast('Could not copy to clipboard');
    }
  };

  const handleShareHrdWhatsApp = (c: HRDCentre) => {
    const msg = `*State HRD Centre Details for ${c.state}:*\n\n` +
      `🏢 *${c.name}*\n` +
      `📍 ${c.address}\n` +
      `👤 Officer: ${c.officer} (${c.designation})\n` +
      (c.phone ? `📞 Phone: ${c.phone}\n` : '') +
      `⏱ Timings: ${c.timings}\n` +
      `⏳ Processing Time: ${c.processingDays}\n` +
      `💰 Fee: ${c.fees}\n\n` +
      `📌 *Instructions:* ${c.instructions}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleDownloadAuthLetter = () => {
    downloadText(
      `hrd_authorization_letter_${authStudentName.toLowerCase().replace(/\s+/g, '_')}.txt`,
      buildHRDAuthorizationLetterText(
        authStudentName,
        authPassportNo,
        authRepName,
        authRelationship,
        authUnivName,
        authDegreeName
      )
    );
    showToast('Authorization Letter draft saved');
  };

  const handleCopyAuthLetter = async () => {
    const text = buildHRDAuthorizationLetterText(
      authStudentName,
      authPassportNo,
      authRepName,
      authRelationship,
      authUnivName,
      authDegreeName
    );
    try {
      await navigator.clipboard.writeText(text);
      showToast('Authorization Letter draft copied');
    } catch {
      showToast('Could not copy to clipboard');
    }
  };

  const handleCopyFields = async (doc: DocumentSample) => {
    const text = doc.sampleFields.map((f, i) => `${i + 1}. ${f.label}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      showToast('Sample fields copied');
    } catch {
      showToast('Copy failed — use the download button instead');
    }
  };

  /* ---------------- Doc card ---------------- */

  const changed = (next: SectionId) => {
    setSection(next);
    setGroupFilter('all');
    setSearchQuery('');
    setRequirementFilter('All');
    setHrdSearchQuery('');
    setHrdStateFilter('All');
    setHrdModeFilter('All');
  };

  const renderDocCard = (doc: DocumentSample) => (
    <button
      key={doc.id}
      onClick={() => setSelectedDoc(doc)}
      className="text-left bg-white border border-[#e5edf5] rounded-[10px] p-4 shadow-xs flex flex-col gap-2.5 hover:border-[#c7d9ee] hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-2.5 w-full">
        <div
          className={`w-9 h-9 rounded-[8px] ${activeMeta.accentBg} ${activeMeta.accentText} border ${activeMeta.accentBorder} flex items-center justify-center shrink-0`}
        >
          <FileCheck2 className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[13px] font-bold text-[#101d37] leading-snug">{doc.name}</h3>
          <div className="text-[11px] text-[#64748b] mt-0.5">
            <span className="font-semibold">{PLAIN_REQUIREMENT[doc.requirement]}</span>
            <span className="mx-1.5 text-[#c3d2e3]">·</span>
            {destinationsText(doc)}
          </div>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full border text-[10px] font-bold shrink-0 ${REQUIREMENT_STYLES[doc.requirement]}`}
        >
          {PLAIN_REQUIREMENT[doc.requirement]}
        </span>
      </div>

      <p className="text-[12px] text-[#52627a] leading-relaxed">{doc.description}</p>

      <div className={`mt-auto pt-1 flex items-center gap-1 text-[11.5px] font-semibold ${activeMeta.accentText}`}>
        View sample fields
        <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </button>
  );

  /* ---------------- Embassy card ---------------- */

  const renderEmbassyCard = (entry: EmbassyEntry) => (
    <div
      key={entry.id}
      className="bg-white border border-[#e5edf5] rounded-[10px] p-4 shadow-xs flex flex-col gap-2.5 hover:border-[#c7d9ee] hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-[13px] font-bold text-[#101d37] leading-snug">{entry.name}</h3>
          <div className="text-[11px] text-[#64748b] mt-0.5">
            {countryFlag(entry.country)} {entry.country}
            <span className="mx-1.5 text-[#c3d2e3]">·</span>
            <MapPin className="w-3 h-3 inline -mt-0.5" /> {entry.city}
          </div>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full border text-[10px] font-bold shrink-0 ${
            entry.type === 'Embassy'
              ? 'bg-indigo-50 text-[#4f46e5] border-indigo-200'
              : entry.type === 'Consulate General'
                ? 'bg-blue-50 text-[#087cf5] border-blue-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          {entry.type}
        </span>
      </div>

      <p className="text-[11.5px] text-[#52627a] leading-relaxed">{entry.address}</p>

      {(entry.phone || entry.email) && (
        <div className="space-y-1 text-[11px] text-[#334155]">
          {entry.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#8496b0] shrink-0" />
              {entry.phone}
            </div>
          )}
          {entry.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#8496b0] shrink-0" />
              {entry.email}
            </div>
          )}
        </div>
      )}

      <div className="text-[11px] text-[#52627a] leading-relaxed">
        <span className="font-semibold text-[#334155]">Serves: </span>
        {entry.states.length > 10
          ? `${entry.states.slice(0, 8).join(', ')} and ${entry.states.length - 8} more`
          : entry.states.join(', ')}
      </div>

      <div className="text-[11px] bg-amber-50/70 border border-amber-100 rounded-[7px] px-2.5 py-2 text-[#7c5b16] leading-relaxed">
        {entry.note}
      </div>

      <a
        href={entry.website}
        target="_blank"
        rel="noreferrer"
        className="mt-auto pt-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[7px] bg-[#4f46e5] hover:bg-[#4338ca] text-white text-[11.5px] font-semibold transition-colors"
      >
        <Globe className="w-3.5 h-3.5" />
        Open official portal
        <ArrowUpRight className="w-3.5 h-3.5" />
      </a>
    </div>
  );

  /* ---------------- Page ---------------- */

  return (
    <div className="p-3.5 pb-20 space-y-3.5 max-w-[1536px] mx-auto font-sans text-[#101d37] min-h-screen">
      {toastMessage && (
        <div className="fixed top-16 right-5 z-[60] bg-[#07182c] text-white text-xs px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-3 text-slate-400 hover:text-white font-bold">
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#0f1f4d] text-white flex items-center justify-center shadow-sm">
            <Library className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-[#101d37] leading-tight">Resources</h1>
            <p className="text-[11.5px] text-[#64748b] leading-tight mt-0.5">
              Sample documents, checklists and the embassy finder — always re-check the official portal before filing.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {onNavigate && (
            <button
              onClick={() => onNavigate('documentation')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#e2e8f0] bg-white text-[#52627a] hover:text-[#101d37] hover:bg-slate-50 text-[11.5px] font-semibold transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#087cf5]" />
              Open Documentation Hub
            </button>
          )}
          <div className="text-[11.5px] text-[#64748b] hidden md:inline">
            Home &gt; <span className="font-semibold text-[#101d37]">Resources</span>
          </div>
        </div>
      </div>

      {/* Section tabs */}
      <div className="bg-white border border-[#e5edf5] rounded-[10px] p-1.5 shadow-xs flex flex-wrap gap-1.5">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const isActive = section === s.id;
          const count =
            s.id === 'embassies'
              ? EMBASSY_DIRECTORY.length
              : s.id === 'hrd'
                ? HRD_CENTRES.length
                : categoryCounts(s.id as ResourceCategory);
          return (
            <button
              key={s.id}
              onClick={() => changed(s.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-[7px] text-[12px] transition-colors ${
                isActive ? `${s.accentSolid} text-white font-semibold shadow-xs` : 'text-[#52627a] hover:bg-slate-50 font-medium'
              }`}
            >
              <Icon className="w-4 h-4" />
              {s.short}
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#64748b]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Section intro */}
      <div className={`bg-gradient-to-r ${activeMeta.gradient} rounded-[10px] px-4 py-3 text-white shadow-sm flex flex-wrap items-center justify-between gap-3`}>
        <div className="flex items-center gap-3 min-w-0">
          {React.createElement(activeMeta.icon, { className: 'w-5 h-5 shrink-0' })}
          <div className="min-w-0">
            <div className="text-[13.5px] font-bold">{activeMeta.label}</div>
            <div className="text-[11px] text-white/85 leading-snug">{activeMeta.subtitle}</div>
          </div>
        </div>
        {isDocSection && (
          <button
            onClick={handleDownloadChecklist}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-white/15 hover:bg-white/25 border border-white/25 text-[11.5px] font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download checklist
          </button>
        )}
        {isHrdSection && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadHrdDirectory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-white/15 hover:bg-white/25 border border-white/25 text-[11.5px] font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download HRD Directory
            </button>
            <button
              onClick={() => setShowAuthLetterModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-white text-amber-900 font-semibold text-[11.5px] shadow-xs hover:bg-amber-50 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-amber-700" />
              Authorization Draft
            </button>
          </div>
        )}
      </div>

      {/* ================= DOCUMENT SECTIONS ================= */}
      {isDocSection && (
        <>
          {/* Filters — one simple row */}
          <div className="bg-white rounded-[10px] border border-[#e5edf5] p-3 shadow-xs flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search a document by name or explanation..."
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] focus:bg-white rounded-[6px] pl-8 pr-3 py-2 text-[12px] outline-none transition-all"
              />
            </div>

            {section === 'visa' ? (
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value as DestinationFilter)}
                className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] px-2.5 py-2 text-[11.5px] outline-none"
              >
                <option value="All">🌍 All countries</option>
                {DESTINATION_COUNTRIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.flag} {c.label}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] px-2.5 py-2 text-[11.5px] outline-none"
              >
                <option value="all">All parts of the file</option>
                {RESOURCE_GROUPS[category].map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label}
                  </option>
                ))}
              </select>
            )}

            <select
              value={requirementFilter}
              onChange={(e) => setRequirementFilter(e.target.value as 'All' | RequirementLevel)}
              className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] px-2.5 py-2 text-[11.5px] outline-none"
            >
              <option value="All">Show everything</option>
              <option value="Mandatory">Must have</option>
              <option value="Recommended">Good to have</option>
              <option value="Conditional">Only if needed</option>
            </select>

            <span className="text-[11px] text-[#8496b0] font-medium ml-auto">
              {filteredDocs.length} of {sectionDocs.length} documents
            </span>
          </div>

          {/* Country pack summary for visa */}
          {section === 'visa' && destination !== 'All' && (
            <div className="bg-white border border-emerald-100 rounded-[10px] p-4 shadow-xs">
              {(() => {
                const pack = VISA_PACKS.find((p) => p.country === destination)!;
                const rows = [
                  { k: 'Visa type', v: pack.visaType },
                  { k: 'How to apply', v: pack.applicationRoute },
                  { k: 'Money to show', v: pack.proofOfFunds },
                  { k: 'Visa fee', v: pack.fee },
                  { k: 'Time to get it', v: pack.processingTime },
                  { k: 'After you arrive', v: pack.postArrival },
                ];
                return (
                  <div className="flex flex-wrap gap-x-8 gap-y-3">
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-[15px]">{pack.flag}</span>
                      <span className="text-[13px] font-bold">{pack.country} — full visa picture</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-2.5 flex-1">
                      {rows.map((r) => (
                        <div key={r.k}>
                          <div className="text-[10.5px] font-bold text-[#059669] uppercase tracking-wide">{r.k}</div>
                          <div className="text-[11.5px] text-[#334155] leading-snug mt-0.5">{r.v}</div>
                        </div>
                      ))}
                    </div>
                    <div className="w-full border-t border-slate-100 pt-2">
                      <div className="text-[10.5px] font-bold text-[#8496b0] uppercase tracking-wide mb-1">
                        Keep in mind
                      </div>
                      <ul className="space-y-1">
                        {pack.notes.map((n) => (
                          <li key={n} className="text-[11.5px] text-[#52627a] flex items-start gap-1.5">
                            <ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#059669]" />
                            {n}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Grouped cards */}
          {groupedDocs.length === 0 ? (
            <div className="bg-white border border-[#e5edf5] rounded-[10px] p-10 text-center shadow-xs">
              <Search className="w-8 h-8 text-[#c3d2e3] mx-auto" />
              <div className="text-[13px] font-bold mt-2">Nothing matches this search</div>
              <p className="text-[11.5px] text-[#64748b] mt-1">Try clearing the search box or switching the filters above.</p>
            </div>
          ) : (
            groupedDocs.map((group) => (
              <div key={group.id} className="space-y-2.5">
                <div>
                  <h2 className="text-[14px] font-bold text-[#101d37]">
                    {group.label}
                    <span className="ml-2 text-[11px] font-semibold text-[#8496b0]">
                      {group.docs.length} {group.docs.length === 1 ? 'document' : 'documents'}
                    </span>
                  </h2>
                  <p className="text-[11.5px] text-[#64748b] mt-0.5">{group.description}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                  {group.docs.map(renderDocCard)}
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* ================= HRD SECTION & FINDER ================= */}
      {isHrdSection && (
        <div className="space-y-3.5">
          {/* Top Filter & Search Controls */}
          <div className="bg-white rounded-[10px] border border-[#e5edf5] p-3.5 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* State Dropdown */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10.5px] font-bold text-[#64748b] uppercase tracking-wide mb-1">
                  Student Graduation State / UT
                </label>
                <select
                  value={hrdStateFilter}
                  onChange={(e) => setHrdStateFilter(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#d97706] rounded-[6px] px-3 py-2 text-[12px] font-medium outline-none transition-colors"
                >
                  <option value="All">📍 All States &amp; UTs ({HRD_CENTRES.length} Centres)</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mode Toggle */}
              <div>
                <label className="block text-[10.5px] font-bold text-[#64748b] uppercase tracking-wide mb-1">
                  Submission Mode
                </label>
                <div className="flex items-center bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] p-0.5">
                  {(['All', 'e-Sanad Online', 'Physical Walk-in'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setHrdModeFilter(m)}
                      className={`px-3 py-1.5 rounded-[5px] text-[11px] font-semibold transition-colors ${
                        hrdModeFilter === m
                          ? 'bg-[#d97706] text-white shadow-xs'
                          : 'text-[#64748b] hover:text-[#101d37]'
                      }`}
                    >
                      {m === 'All' ? 'All Modes' : m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Box */}
              <div className="flex-1 min-w-[240px]">
                <label className="block text-[10.5px] font-bold text-[#64748b] uppercase tracking-wide mb-1">
                  Search Centre / City / Officer
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#8496b0] absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={hrdSearchQuery}
                    onChange={(e) => setHrdSearchQuery(e.target.value)}
                    placeholder="Search by state, city, university, officer or address..."
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#d97706] rounded-[6px] pl-8 pr-3 py-1.5 text-[12px] outline-none"
                  />
                  {hrdSearchQuery && (
                    <button
                      onClick={() => setHrdSearchQuery('')}
                      className="absolute right-2.5 top-2 text-[#94a3b8] hover:text-[#101d37]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="self-end flex items-center gap-1.5">
                <button
                  onClick={handleDownloadHrdDirectory}
                  className="px-3 py-2 rounded-[6px] border border-[#cbd5e1] hover:bg-slate-50 text-[#334155] text-[11.5px] font-semibold flex items-center gap-1.5 transition-colors"
                  title="Download complete directory as text"
                >
                  <Download className="w-3.5 h-3.5 text-[#d97706]" />
                  <span>Export TXT</span>
                </button>
                <button
                  onClick={() => setShowAuthLetterModal(true)}
                  className="px-3 py-2 rounded-[6px] bg-amber-500 hover:bg-amber-600 text-white text-[11.5px] font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Authorization Draft</span>
                </button>
              </div>
            </div>

            {/* Quick State Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 text-[11px]">
              <span className="text-[#8496b0] font-bold text-[10px] uppercase tracking-wider shrink-0 mr-1">
                Popular Hubs:
              </span>
              {[
                'Delhi',
                'Maharashtra',
                'Karnataka',
                'Punjab',
                'Kerala',
                'Tamil Nadu',
                'Telangana',
                'Uttar Pradesh',
                'West Bengal',
                'Gujarat',
                'Rajasthan',
              ].map((st) => (
                <button
                  key={st}
                  onClick={() => setHrdStateFilter(hrdStateFilter === st ? 'All' : st)}
                  className={`px-2.5 py-1 rounded-[5px] whitespace-nowrap transition-colors font-medium ${
                    hrdStateFilter === st
                      ? 'bg-amber-600 text-white font-bold shadow-2xs'
                      : 'bg-slate-100 text-[#52627a] hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
              {hrdStateFilter !== 'All' && (
                <button
                  onClick={() => setHrdStateFilter('All')}
                  className="text-amber-700 hover:underline font-bold ml-1 shrink-0"
                >
                  Clear filter ×
                </button>
              )}
            </div>
          </div>

          {/* Legalization Pipeline / Educational Roadmap */}
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/60 border border-amber-200/80 rounded-[10px] p-4 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-[11px]">
                  HRD
                </div>
                <h3 className="text-[13.5px] font-bold text-[#101d37]">
                  Educational Document Legalization Ladder (India to Abroad)
                </h3>
              </div>
              <span className="text-[11px] font-bold text-amber-900 bg-amber-100/80 border border-amber-200 px-2 py-0.5 rounded-full">
                Prerequisite for Italy (DoV &amp; CIMEA), UAE, Austria &amp; MEA Apostille
              </span>
            </div>

            {/* 4 Pipeline Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-white/90 border border-amber-200/80 rounded-[8px] p-3 shadow-2xs">
                <div className="flex items-center justify-between text-amber-700 font-bold text-[10.5px]">
                  <span>STEP 1</span>
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <div className="font-bold text-[#101d37] text-[12px] mt-1">University Verification</div>
                <p className="text-[11px] text-[#52627a] mt-0.5 leading-snug">
                  Controller of Examination / Registrar issues an outward verification letter in a sealed envelope or provides digital verification.
                </p>
              </div>

              <div className="bg-white/90 border border-amber-300 rounded-[8px] p-3 shadow-2xs relative ring-1 ring-amber-400/40">
                <div className="flex items-center justify-between text-amber-700 font-bold text-[10.5px]">
                  <span className="text-amber-800">STEP 2 · CRITICAL</span>
                  <Stamp className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="font-bold text-[#101d37] text-[12px] mt-1">State HRD / RAC Stamp</div>
                <p className="text-[11px] text-[#52627a] mt-0.5 leading-snug">
                  State Higher Education Department authenticates the genuine certificate with the official government seal on the reverse of the degree.
                </p>
              </div>

              <div className="bg-white/90 border border-amber-200/80 rounded-[8px] p-3 shadow-2xs">
                <div className="flex items-center justify-between text-amber-700 font-bold text-[10.5px]">
                  <span>STEP 3</span>
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="font-bold text-[#101d37] text-[12px] mt-1">MEA Apostille (Govt of India)</div>
                <p className="text-[11px] text-[#52627a] mt-0.5 leading-snug">
                  Ministry of External Affairs attaches the Hague Apostille sticker with unique registration number or generates the e-Sanad QR certificate.
                </p>
              </div>

              <div className="bg-white/90 border border-amber-200/80 rounded-[8px] p-3 shadow-2xs">
                <div className="flex items-center justify-between text-amber-700 font-bold text-[10.5px]">
                  <span>STEP 4</span>
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <div className="font-bold text-[#101d37] text-[12px] mt-1">Translation &amp; Embassy Filing</div>
                <p className="text-[11px] text-[#52627a] mt-0.5 leading-snug">
                  Certified translation (Italian / German / French) followed by Declaration of Value (DoV) or CIMEA Statement of Comparability.
                </p>
              </div>
            </div>

            {/* Compliance Warning Box */}
            <div className="bg-white/95 border border-amber-300/80 rounded-[8px] p-3 text-[11.5px] text-[#78350f] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="font-bold text-amber-950">Important Regulatory Notice for Counsellors &amp; Students:</strong>{' '}
                Several commercial agencies promote Sub-Divisional Magistrate (SDM) attestation as a fast shortcut. However, the{' '}
                <strong>Italian Embassy, Italian Consulates (Mumbai &amp; Kolkata), and CIMEA strictly reject SDM for educational degrees</strong>{' '}
                because SDM does not verify records with the university registrar. For study abroad in Italy and Europe,{' '}
                <strong>State HRD Authentication is mandatory</strong> in the state where the degree was awarded.
              </div>
            </div>
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between px-1 text-[12px]">
            <div className="text-[#52627a] font-medium">
              Showing <strong className="text-[#101d37] font-bold">{filteredHrdCentres.length}</strong> State Regional Authentication Centres
              {hrdStateFilter !== 'All' && <span> in <strong>{hrdStateFilter}</strong></span>}
            </div>
            <a
              href="https://esamad.nic.in"
              target="_blank"
              rel="noreferrer"
              className="text-[#d97706] hover:underline font-semibold flex items-center gap-1 text-[11.5px]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Official MEA e-Sanad Portal
            </a>
          </div>

          {/* HRD Centres Grid */}
          {filteredHrdCentres.length === 0 ? (
            <div className="bg-white border border-[#e5edf5] rounded-[10px] p-12 text-center shadow-xs">
              <Building2 className="w-10 h-10 text-[#cbd5e1] mx-auto mb-2" />
              <div className="text-[14px] font-bold text-[#101d37]">No HRD centres found for this query</div>
              <p className="text-[12px] text-[#64748b] mt-1">
                Try selecting &quot;All States&quot; or clearing your search term.
              </p>
              <button
                onClick={() => {
                  setHrdStateFilter('All');
                  setHrdModeFilter('All');
                  setHrdSearchQuery('');
                }}
                className="mt-3 px-3.5 py-1.5 rounded-[6px] bg-amber-500 text-white font-semibold text-xs shadow-xs"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredHrdCentres.map((centre) => (
                <div
                  key={centre.id}
                  className="bg-white border border-[#e5edf5] hover:border-amber-300 rounded-[10px] p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group space-y-3"
                >
                  <div>
                    {/* State / City & Mode Badge */}
                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                      <div>
                        <span className="text-[10.5px] font-extrabold uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <span>🇮🇳</span> {centre.state} · {centre.city}
                        </span>
                        <h4 className="font-bold text-[13.5px] text-[#101d37] group-hover:text-[#b45309] transition-colors mt-1.5 leading-snug">
                          {centre.name}
                        </h4>
                        <div className="text-[11px] text-[#64748b] mt-0.5">{centre.department}</div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                          centre.mode.includes('e-Sanad')
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {centre.mode}
                      </span>
                    </div>

                    {/* Address with Copy Icon */}
                    <div className="py-2 space-y-2 text-[11.5px]">
                      <div className="flex items-start gap-1.5 bg-[#f8fafc] border border-slate-100 rounded-[6px] p-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="flex-1 text-[#334155] leading-relaxed">
                          {centre.address}
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(centre.address);
                            showToast(`Copied address for ${centre.city}`);
                          }}
                          className="text-[#94a3b8] hover:text-[#d97706] p-0.5"
                          title="Copy address"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Officer & Contacts */}
                      <div className="space-y-1 text-[11px] text-[#475569]">
                        <div className="font-semibold text-[#101d37] flex items-center gap-1.5">
                          <span className="text-[#8496b0]">Officer:</span> {centre.officer}
                          <span className="text-[#94a3b8]">({centre.designation})</span>
                        </div>
                        {centre.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-[#8496b0] shrink-0" />
                            <a href={`tel:${centre.phone.split('/')[0].trim()}`} className="hover:text-amber-700">
                              {centre.phone}
                            </a>
                          </div>
                        )}
                        {centre.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-[#8496b0] shrink-0" />
                            <a href={`mailto:${centre.email}`} className="hover:text-amber-700 truncate">
                              {centre.email}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Timings, Turnaround & Fees */}
                      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10.5px]">
                        <div className="bg-amber-50/50 border border-amber-100 rounded-[6px] p-1.5">
                          <span className="text-[#8496b0] block font-bold">Counter Hours:</span>
                          <span className="font-semibold text-[#101d37]">{centre.timings}</span>
                        </div>
                        <div className="bg-amber-50/50 border border-amber-100 rounded-[6px] p-1.5">
                          <span className="text-[#8496b0] block font-bold">Turnaround / Fee:</span>
                          <span className="font-semibold text-[#101d37]">{centre.processingDays}</span>
                          <span className="text-[10px] text-[#64748b] block">{centre.fees}</span>
                        </div>
                      </div>

                      {/* Jurisdiction */}
                      <div className="text-[11px] text-[#64748b] leading-snug">
                        <strong className="text-[#334155] font-semibold">Jurisdiction: </strong>
                        {centre.jurisdiction}
                      </div>

                      {/* Special instructions */}
                      <div className="bg-amber-50/70 border border-amber-100 rounded-[6px] p-2 text-[10.5px] text-[#78350f] leading-relaxed">
                        <strong className="font-semibold">Note: </strong>
                        {centre.instructions}
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyHrdCentre(centre)}
                        className="p-1.5 rounded-[5px] text-[#64748b] hover:text-[#101d37] hover:bg-slate-100 border border-slate-200"
                        title="Copy complete details"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleShareHrdWhatsApp(centre)}
                        className="p-1.5 rounded-[5px] text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border border-emerald-200"
                        title="Share on WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedHrdCentre(centre)}
                        className="px-2 py-1 rounded-[5px] text-[#d97706] hover:bg-amber-50 font-semibold"
                      >
                        Full Details
                      </button>
                    </div>

                    <a
                      href={centre.website}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-[5px] bg-[#d97706] hover:bg-[#b45309] text-white font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                    >
                      <span>State Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= EMBASSY FINDER ================= */}
      {isEmbassySection && (
        <>
          <div className="bg-white rounded-[10px] border border-[#e5edf5] p-3 shadow-xs space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="flex-1 min-w-[180px] bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#4f46e5] rounded-[6px] px-2.5 py-2 text-[12px] outline-none"
              >
                <option value="All">📍 All states &amp; UTs</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={embassyCountry}
                onChange={(e) => setEmbassyCountry(e.target.value as DestinationFilter)}
                className="flex-1 min-w-[160px] bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#4f46e5] rounded-[6px] px-2.5 py-2 text-[12px] outline-none"
              >
                <option value="All">🌍 All destinations</option>
                {DESTINATION_COUNTRIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.flag} {c.label}
                  </option>
                ))}
              </select>
              <div className="flex items-center bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] p-0.5">
                {(['Missions', 'VFS', 'All'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setMissionType(t)}
                    className={`px-3 py-1.5 rounded-[5px] text-[11px] font-semibold transition-colors ${
                      missionType === t ? 'bg-[#4f46e5] text-white' : 'text-[#64748b] hover:text-[#101d37]'
                    }`}
                  >
                    {t === 'Missions' ? 'Embassies' : t === 'VFS' ? 'VFS centres' : 'All desks'}
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-[#8496b0] font-medium ml-auto">{embassyResults.length} offices</span>
            </div>

            <div className="text-[11px] text-[#52627a] bg-[#f8fafc] border border-[#eef3f8] rounded-[7px] px-3 py-2 leading-relaxed">
              <span className="font-semibold text-[#334155]">Rule of thumb:</span> Germany and Italy make students apply in
              the mission that covers their state (they must have lived there 6+ months). UK and Ireland let students pick
              any VFS centre. Booking must be under the student’s own name and email.
            </div>

            {stateFilter !== 'All' && embassyCountry !== 'All' && (
              <div className="border border-indigo-100 bg-indigo-50/50 rounded-[8px] p-3.5">
                <div className="text-[12px] font-bold text-[#4f46e5]">
                  Student from {stateFilter} applying to {embassyCountry}:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  <div>
                    <div className="text-[10.5px] font-bold text-[#8496b0] uppercase tracking-wide">Decides the visa</div>
                    {decidingMissions.length > 0 ? (
                      decidingMissions.map((m) => (
                        <div key={m.id} className="text-[11.5px] text-[#334155] mt-0.5">
                          {m.name} <span className="text-[#8496b0]">({m.city})</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-[11.5px] text-[#8496b0] mt-0.5">No mission mapped for this combination.</div>
                    )}
                  </div>
                  <div>
                    <div className="text-[10.5px] font-bold text-[#8496b0] uppercase tracking-wide">Where to submit</div>
                    {submissionCentres.length > 0 ? (
                      submissionCentres.map((v) => (
                        <div key={v.id} className="text-[11.5px] text-[#334155] mt-0.5">
                          VFS {v.city}
                        </div>
                      ))
                    ) : (
                      <div className="text-[11.5px] text-[#8496b0] mt-0.5">Switch the desk filter to VFS centres to see submission points.</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {embassyResults.length === 0 ? (
            <div className="bg-white border border-[#e5edf5] rounded-[10px] p-10 text-center shadow-xs">
              <Landmark className="w-8 h-8 text-[#c3d2e3] mx-auto" />
              <div className="text-[13px] font-bold mt-2">No offices match this combination</div>
              <p className="text-[11.5px] text-[#64748b] mt-1">Try another state, destination or desk type.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
              {embassyResults.map(renderEmbassyCard)}
            </div>
          )}
        </>
      )}

      {/* ================= DOCUMENT DETAILS MODAL ================= */}
      {selectedDoc && (
        <div
          className="fixed inset-0 z-[70] bg-[#07182c]/60 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setSelectedDoc(null)}
        >
          <div
            className="bg-white rounded-[12px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-[9px] ${activeMeta.accentBg} ${activeMeta.accentText} border ${activeMeta.accentBorder} flex items-center justify-center shrink-0`}
                >
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-[15px] font-bold leading-snug">{selectedDoc.name}</h2>
                  <div className="text-[11px] text-[#64748b] mt-0.5">
                    <span className="font-semibold">{PLAIN_REQUIREMENT[selectedDoc.requirement]}</span>
                    <span className="mx-1.5 text-[#c3d2e3]">·</span>
                    {destinationsText(selectedDoc)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 rounded-[6px] text-[#64748b] hover:bg-slate-100 hover:text-[#101d37] transition-colors shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* What it is */}
              <div>
                <div className="text-[11px] font-bold text-[#8496b0] uppercase tracking-wide mb-1">What it is</div>
                <p className="text-[12.5px] text-[#334155] leading-relaxed">{selectedDoc.description}</p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { label: 'Who issues it', value: selectedDoc.issuingAuthority },
                  { label: 'What you submit', value: selectedDoc.format },
                  { label: 'How long it stays valid', value: selectedDoc.validity },
                  { label: 'How long it takes', value: selectedDoc.processingTime || 'Varies by authority' },
                ].map((row) => (
                  <div key={row.label} className="bg-[#f8fafc] border border-[#eef3f8] rounded-[7px] px-3 py-2.5">
                    <div className="text-[10.5px] font-bold text-[#8496b0] uppercase tracking-wide">{row.label}</div>
                    <div className="text-[12px] text-[#334155] leading-snug mt-0.5">{row.value}</div>
                  </div>
                ))}
              </div>

              {/* Sample fields */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-[11px] font-bold text-[#8496b0] uppercase tracking-wide">
                    Sample fields to fill ({selectedDoc.sampleFields.length})
                  </div>
                  <button
                    onClick={() => handleCopyFields(selectedDoc)}
                    className="flex items-center gap-1 text-[10.5px] font-semibold text-[#52627a] hover:text-[#101d37]"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy list
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {selectedDoc.sampleFields.map((field, idx) => (
                    <div key={field.label} className="flex items-start gap-2 border border-[#e5edf5] rounded-[6px] px-2.5 py-1.5">
                      <span className={`text-[10.5px] font-bold ${activeMeta.accentText} mt-0.5 w-4 shrink-0`}>
                        {idx + 1}.
                      </span>
                      <div className="min-w-0">
                        <div className="text-[11.5px] font-medium text-[#334155]">{field.label}</div>
                        {field.hint && <div className="text-[10.5px] text-[#8496b0]">{field.hint}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-amber-50/70 border border-amber-100 rounded-[8px] px-3.5 py-3">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                  <AlertCircle className="w-3.5 h-3.5" /> Read this before you file
                </div>
                <ul className="mt-1.5 space-y-1.5">
                  {selectedDoc.tips.map((tip) => (
                    <li key={tip} className="text-[11.5px] text-[#7c5b16] leading-relaxed flex items-start gap-1.5">
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                <span className="text-[10.5px] text-[#8496b0]">
                  File name: <span className="font-semibold text-[#52627a]">{selectedDoc.sampleFileName}</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadSample(selectedDoc)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] text-white text-[11.5px] font-semibold transition-colors ${activeMeta.accentSolid} hover:opacity-90`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download sample
                  </button>
                  <button
                    onClick={() => setSelectedDoc(null)}
                    className="px-3.5 py-2 rounded-[6px] border border-[#e2e8f0] text-[#52627a] hover:text-[#101d37] hover:bg-slate-50 text-[11.5px] font-semibold transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= HRD CENTRE DETAIL MODAL ================= */}
      {selectedHrdCentre && (
        <div
          className="fixed inset-0 z-[70] bg-[#07182c]/60 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setSelectedHrdCentre(null)}
        >
          <div
            className="bg-white rounded-[12px] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3 bg-amber-50/60">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-[9px] bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Stamp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wide text-amber-800 bg-white border border-amber-200 px-2 py-0.5 rounded-full inline-block">
                    {selectedHrdCentre.state} · {selectedHrdCentre.city}
                  </span>
                  <h3 className="text-[15px] font-bold text-[#101d37] mt-1">
                    {selectedHrdCentre.name}
                  </h3>
                  <div className="text-[11px] text-[#64748b]">{selectedHrdCentre.department}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedHrdCentre(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="bg-[#f8fafc] border border-slate-200 rounded-[8px] p-3 space-y-1.5">
                <div className="text-[10.5px] font-bold text-[#8496b0] uppercase tracking-wide">
                  Office Location &amp; Timings
                </div>
                <div className="font-semibold text-[#101d37] text-[12px]">
                  {selectedHrdCentre.address}
                </div>
                <div className="text-[11.5px] text-[#52627a]">
                  Counter Hours: <strong>{selectedHrdCentre.timings}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11.5px]">
                <div className="bg-amber-50/50 border border-amber-100 rounded-[7px] p-2.5">
                  <div className="text-[10px] font-bold text-[#8496b0] uppercase tracking-wide">Competent Officer</div>
                  <div className="font-bold text-[#101d37] mt-0.5">{selectedHrdCentre.officer}</div>
                  <div className="text-[10.5px] text-[#64748b]">{selectedHrdCentre.designation}</div>
                </div>
                <div className="bg-amber-50/50 border border-amber-100 rounded-[7px] p-2.5">
                  <div className="text-[10px] font-bold text-[#8496b0] uppercase tracking-wide">Turnaround &amp; Fees</div>
                  <div className="font-bold text-[#101d37] mt-0.5">{selectedHrdCentre.processingDays}</div>
                  <div className="text-[10.5px] text-[#64748b]">{selectedHrdCentre.fees}</div>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-[#101d37] uppercase tracking-wide mb-1.5">
                  Mandatory Submission Prerequisites
                </div>
                <ul className="space-y-1.5">
                  {selectedHrdCentre.prerequisites.map((p, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11.5px] text-[#334155]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50/80 border border-amber-200 rounded-[8px] p-3 text-[11.5px] text-[#78350f]">
                <strong className="font-bold">Instructions &amp; Tips:</strong> {selectedHrdCentre.instructions}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleCopyHrdCentre(selectedHrdCentre)}
                  className="px-3 py-1.5 rounded-[6px] border border-slate-200 hover:bg-slate-50 text-[11.5px] font-semibold flex items-center gap-1.5 text-[#334155]"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Details
                </button>
                <div className="flex items-center gap-2">
                  <a
                    href={selectedHrdCentre.website}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-[6px] bg-[#d97706] hover:bg-[#b45309] text-white font-bold text-[11.5px] flex items-center gap-1"
                  >
                    <span>Visit Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= HRD AUTHORIZATION LETTER DRAFT MODAL ================= */}
      {showAuthLetterModal && (
        <div
          className="fixed inset-0 z-[70] bg-[#07182c]/60 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setShowAuthLetterModal(false)}
        >
          <div
            className="bg-white rounded-[12px] shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3 bg-amber-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[8px] bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#101d37]">
                    HRD Authorization Letter Generator
                  </h3>
                  <div className="text-[11px] text-[#64748b]">
                    Draft authorization letter for blood relatives or agency representatives to submit and collect degrees.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowAuthLetterModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Form Input Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#101d37] mb-1">Student Full Name</label>
                  <input
                    type="text"
                    value={authStudentName}
                    onChange={(e) => setAuthStudentName(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-[6px] px-2.5 py-1.5 text-[12px] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#101d37] mb-1">Student Passport Number</label>
                  <input
                    type="text"
                    value={authPassportNo}
                    onChange={(e) => setAuthPassportNo(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-[6px] px-2.5 py-1.5 text-[12px] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#101d37] mb-1">Authorized Representative Name</label>
                  <input
                    type="text"
                    value={authRepName}
                    onChange={(e) => setAuthRepName(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-[6px] px-2.5 py-1.5 text-[12px] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#101d37] mb-1">Relationship / Agency Title</label>
                  <input
                    type="text"
                    value={authRelationship}
                    onChange={(e) => setAuthRelationship(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-[6px] px-2.5 py-1.5 text-[12px] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#101d37] mb-1">Issuing University Name</label>
                  <input
                    type="text"
                    value={authUnivName}
                    onChange={(e) => setAuthUnivName(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-[6px] px-2.5 py-1.5 text-[12px] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#101d37] mb-1">Degree Title</label>
                  <input
                    type="text"
                    value={authDegreeName}
                    onChange={(e) => setAuthDegreeName(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-[6px] px-2.5 py-1.5 text-[12px] outline-none"
                  />
                </div>
              </div>

              {/* Draft Preview Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wide">Formatted Letter Preview</span>
                  <button
                    onClick={handleCopyAuthLetter}
                    className="text-[11px] text-amber-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy Letter Text
                  </button>
                </div>
                <div className="bg-[#f8fafc] border border-slate-200 rounded-[8px] p-3.5 max-h-56 overflow-y-auto font-mono text-[11px] text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {buildHRDAuthorizationLetterText(
                    authStudentName,
                    authPassportNo,
                    authRepName,
                    authRelationship,
                    authUnivName,
                    authDegreeName
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowAuthLetterModal(false)}
                  className="px-3.5 py-1.5 rounded-[6px] border border-slate-200 text-[#52627a] hover:bg-slate-50 text-[11.5px] font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDownloadAuthLetter}
                  className="px-4 py-1.5 rounded-[6px] bg-[#d97706] hover:bg-[#b45309] text-white font-bold text-[11.5px] flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Draft (.txt)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesView;
