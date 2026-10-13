import React, { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Phone,
  Calendar,
  Mail,
  UserCheck,
  Edit2,
  MoreVertical,
  Plus,
  Clock,
  BookOpen,
  GraduationCap,
  Award,
  FileText,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Lead } from '../../types/crm';

interface LeadDetailsPanelProps {
  lead: Lead | null;
  onOpenPhone: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onEnrollLead: (lead: Lead) => void;
  onScheduleFollowUp: (lead: Lead) => void;
  onOpenEmail: (lead: Lead) => void;
  onOpenWhatsApp: (lead: Lead) => void;
  onTransferDocs: (lead: Lead) => void;
  onAddNote: (leadId: string, note: string) => void;
}

export const LeadDetailsPanel: React.FC<LeadDetailsPanelProps> = ({
  lead,
  onOpenPhone,
  onEditLead,
  onEnrollLead,
  onScheduleFollowUp,
  onOpenEmail,
  onOpenWhatsApp,
  onTransferDocs,
  onAddNote,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'academic' | 'test' | 'counselling' | 'notes'>('profile');
  const [newNoteText, setNewNoteText] = useState('');

  if (!lead) {
    return (
      <div className="bg-white rounded-[8px] border border-[#e5edf5] p-6 text-center text-[#8496b0]">
        Select a lead to view details
      </div>
    );
  }

  // Workflow steps
  const workflowStages = [
    { key: 'Enrolled', label: 'Enrolled' },
    { key: 'Shortlisting', label: 'Shortlisting' },
    { key: 'Approval', label: 'Student Approval' },
    { key: 'Documentation', label: 'Documentation' },
    { key: 'Application', label: 'Application' },
  ];

  const getStageIndex = (stage: string) => {
    switch (stage) {
      case 'New Lead':
      case 'Contacted':
      case 'Interested':
      case 'Counselling':
      case 'Follow-up':
      case 'Enrolled':
        return 0;
      case 'Shortlisting':
      case 'University Shortlisting':
        return 1;
      case 'Approval':
      case 'Student Approval':
        return 2;
      case 'Documentation':
      case 'Transferred':
        return 3;
      case 'Application':
      case 'Offer':
        return 4;
      default:
        return 0;
    }
  };

  const currentStageIndex = getStageIndex(
    lead.isTransferredToDocs
      ? 'Documentation'
      : lead.isEnrolled
      ? 'Enrolled'
      : lead.currentStage || lead.status
  );

  return (
    <div className="bg-white rounded-[8px] border border-[#e5edf5] shadow-crm-card flex flex-col h-full">
      {/* Header */}
      <div className="px-3.5 py-2.5 border-b border-[#e5edf5] flex items-center justify-between">
        <h2 className="text-[13.5px] font-bold text-[#101d37]">Lead Details</h2>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-[#64748b] hover:text-[#101d37] p-0.5 rounded transition-colors"
          title={isCollapsed ? 'Expand Panel' : 'Collapse Panel'}
        >
          {isCollapsed ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>
      </div>

      {!isCollapsed && (
        <div className="flex-1 flex flex-col p-3 space-y-3.5 overflow-y-auto">
          {/* Selected Student Banner */}
          <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={
                  lead.studentName === 'Rahul Sharma'
                    ? '/avatars/rahul.png'
                    : lead.studentName === 'Priya Singh'
                    ? '/avatars/priya.png'
                    : lead.studentName === 'Amit Kumar'
                    ? '/avatars/amit.png'
                    : lead.studentName === 'Sneha Patel'
                    ? '/avatars/sneha.png'
                    : lead.studentName === 'Rohit Verma'
                    ? '/avatars/rohit.png'
                    : lead.avatarUrl || '/avatars/rahul.png'
                }
                alt={lead.studentName}
                className="w-10 h-10 aspect-square rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[14px] font-bold text-[#101d37] leading-snug">
                    {lead.studentName}
                  </span>
                  <span className="px-2 py-0.2 rounded-[4px] bg-[#dbeafe] text-[#1d4ed8] text-[10.5px] font-semibold leading-tight">
                    {lead.status}
                  </span>
                </div>
                <div className="text-[11px] text-[#64748b] leading-tight mt-0.5 flex items-center gap-2">
                  <span>Lead ID: <span className="font-medium text-[#101d37]">{lead.leadId}</span></span>
                  <a
                    href={`#students?id=${
                      lead.leadId === 'L2025100501' || lead.studentName.toLowerCase().includes('rahul')
                        ? 'ITA-2027-001'
                        : lead.studentName.toLowerCase().includes('priya')
                        ? 'GER-2026-004'
                        : lead.studentName.toLowerCase().includes('rohit')
                        ? 'ITA-2027-008'
                        : lead.studentName.toLowerCase().includes('sneha')
                        ? 'UK-2026-012'
                        : 'ITA-2027-001'
                    }`}
                    className="text-[#087cf5] hover:underline font-semibold flex items-center gap-0.5 text-[10.5px]"
                    title="View Full Student Profile"
                  >
                    <span>View Student Profile &gt;</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Header Mini Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => onOpenPhone(lead)}
                className="w-7 h-7 rounded-md bg-[#22c55e] hover:bg-[#16a34a] text-white flex items-center justify-center transition-colors"
                title="Call"
              >
                <Phone className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onOpenWhatsApp(lead)}
                className="w-7 h-7 rounded-md bg-[#10b981] hover:bg-[#059669] text-white flex items-center justify-center transition-colors"
                title="WhatsApp"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                </svg>
              </button>
              <button
                onClick={() => onEditLead(lead)}
                className="w-7 h-7 rounded-md hover:bg-slate-100 text-[#64748b] flex items-center justify-center transition-colors"
                title="Edit Lead"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Detail Tabs */}
          <div className="flex items-center gap-3 border-b border-[#e5edf5] text-[12px] pb-1">
            {[
              { id: 'profile', label: 'Profile' },
              { id: 'academic', label: 'Academic' },
              { id: 'test', label: 'Test Score' },
              { id: 'counselling', label: 'Counselling' },
              { id: 'notes', label: 'Notes' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-1 font-medium transition-colors relative ${
                    isActive
                      ? 'text-[#087cf5] font-semibold'
                      : 'text-[#64748b] hover:text-[#101d37]'
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <span className="absolute left-0 right-0 -bottom-1 h-[2px] bg-[#087cf5] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab 1: Profile Tab Content */}
          {activeTab === 'profile' && (
            <div className="space-y-3.5 text-[11.5px]">
              {/* Personal Details Section */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-bold text-[#101d37] text-[12px]">Personal Details</h3>
                  <button
                    onClick={() => onEditLead(lead)}
                    className="text-[11px] text-[#087cf5] hover:underline font-semibold flex items-center gap-1"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-[#52627a]">
                  <div>
                    <span className="text-[#8496b0] block text-[10.5px]">Name</span>
                    <span className="font-semibold text-[#101d37]">{lead.studentName}</span>
                  </div>
                  <div>
                    <span className="text-[#8496b0] block text-[10.5px]">Mobile</span>
                    <span className="font-medium text-[#101d37]">{lead.phone}</span>
                  </div>
                  <div>
                    <span className="text-[#8496b0] block text-[10.5px]">Email</span>
                    <span className="font-medium text-[#101d37] truncate block">{lead.email}</span>
                  </div>
                  <div>
                    <span className="text-[#8496b0] block text-[10.5px]">DOB</span>
                    <span className="font-medium text-[#101d37]">{lead.dob || '12 May 2000'}</span>
                  </div>
                  <div>
                    <span className="text-[#8496b0] block text-[10.5px]">Address</span>
                    <span className="font-medium text-[#101d37] truncate block">
                      {lead.address || 'Indore, Madhya Pradesh'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8496b0] block text-[10.5px]">Nationality</span>
                    <span className="font-medium text-[#101d37]">{lead.nationality || 'Indian'}</span>
                  </div>
                </div>
              </div>

              {/* Study Preference Section */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-bold text-[#101d37] text-[12px]">Study Preference</h3>
                  <button
                    onClick={() => onEditLead(lead)}
                    className="text-[11px] text-[#087cf5] hover:underline font-semibold flex items-center gap-1"
                  >
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-[#52627a]">
                  <div>
                    <span className="text-[#8496b0] block text-[10.5px]">Country</span>
                    <span className="font-semibold text-[#101d37]">{lead.countryInterest}</span>
                  </div>
                  <div>
                    <span className="text-[#8496b0] block text-[10.5px]">Course</span>
                    <span className="font-medium text-[#101d37] truncate block">
                      {lead.courseInterest}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8496b0] block text-[10.5px]">Intake</span>
                    <span className="font-medium text-[#101d37]">{lead.intake || 'Sept 2026'}</span>
                  </div>
                  <div>
                    <span className="text-[#8496b0] block text-[10.5px]">Budget</span>
                    <span className="font-medium text-[#101d37]">
                      {lead.budget || '€ 8,000 – 15,000'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8496b0] block text-[10.5px]">University Type</span>
                    <span className="font-medium text-[#101d37]">
                      {lead.universityType || 'Public / Private'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8496b0] block text-[10.5px]">Preferred City</span>
                    <span className="font-medium text-[#101d37]">
                      {lead.preferredCity || 'Rome / Milan'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Status Progression Workflow */}
              <div className="pt-2 border-t border-slate-100">
                <h3 className="font-bold text-[#101d37] text-[12px] mb-2.5">Current Status</h3>
                <div className="relative flex items-center justify-between px-1">
                  {/* Background progress bar line */}
                  <div className="absolute left-3 right-3 top-2.5 h-[2px] bg-[#e2e8f0] -z-0" />
                  <div
                    className="absolute left-3 top-2.5 h-[2px] bg-[#087cf5] -z-0 transition-all duration-300"
                    style={{
                      width: `${(currentStageIndex / (workflowStages.length - 1)) * 92}%`,
                    }}
                  />

                  {workflowStages.map((step, idx) => {
                    const isCompleted = idx < currentStageIndex;
                    const isCurrent = idx === currentStageIndex;
                    return (
                      <div key={step.key} className="flex flex-col items-center z-10">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                            isCurrent
                              ? 'bg-[#087cf5] ring-4 ring-blue-100 text-white'
                              : isCompleted
                              ? 'bg-[#087cf5] text-white'
                              : 'bg-white border-2 border-[#cbd5e1] text-transparent'
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCurrent || isCompleted ? 'bg-white' : 'bg-transparent'
                            }`}
                          />
                        </div>
                        <span
                          className={`text-[9.5px] mt-1 text-center whitespace-nowrap leading-tight ${
                            isCurrent
                              ? 'font-bold text-[#087cf5]'
                              : isCompleted
                              ? 'font-medium text-[#101d37]'
                              : 'text-[#8496b0]'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Next Follow-up Section */}
              <div className="pt-2.5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-[#101d37] text-[12.5px]">Next Follow-up</h3>
                  <button
                    onClick={() => onScheduleFollowUp(lead)}
                    className="text-[11px] bg-[#087cf5] hover:bg-[#006ee6] text-white px-3 py-1 rounded-md font-semibold shadow-xs transition-colors"
                  >
                    Update
                  </button>
                </div>
                <div className="bg-[#f8fafc] border border-slate-200/80 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 text-[#101d37] font-semibold text-[12px]">
                    <Calendar className="w-4 h-4 text-[#087cf5] shrink-0" />
                    <span className="truncate">
                      {lead.nextFollowUp} {lead.nextFollowUpTime || '11:00 AM'}
                    </span>
                  </div>
                  <div className="text-[11.5px] text-[#52627a] mt-1 leading-snug">
                    {lead.nextFollowUpTask || 'Call to discuss university options'}
                  </div>
                </div>
              </div>

              {/* Quick Actions (4 Buttons matching screenshot) */}
              <div className="pt-2.5 border-t border-slate-100 space-y-2">
                <h3 className="font-bold text-[#101d37] text-[12.5px]">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {/* Mark as Enrolled */}
                  <button
                    onClick={() => onEnrollLead(lead)}
                    className="flex items-center justify-center gap-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white text-[11.5px] font-semibold py-2 px-2 rounded-lg shadow-xs transition-colors whitespace-nowrap min-h-[36px]"
                  >
                    <UserCheck className="w-4 h-4 shrink-0" />
                    <span className="truncate">Convert to Student</span>
                  </button>

                  {/* Schedule Follow-up */}
                  <button
                    onClick={() => onScheduleFollowUp(lead)}
                    className="flex items-center justify-center gap-1.5 bg-[#087cf5] hover:bg-[#006ee6] text-white text-[11.5px] font-semibold py-2 px-2 rounded-lg shadow-xs transition-colors whitespace-nowrap min-h-[36px]"
                  >
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span className="truncate">Schedule Follow-up</span>
                  </button>

                  {/* Send Email */}
                  <button
                    onClick={() => onOpenEmail(lead)}
                    className="flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-[#0f172a] border border-[#e2e8f0] text-[11.5px] font-semibold py-2 px-2 rounded-lg transition-colors whitespace-nowrap min-h-[36px]"
                  >
                    <Mail className="w-4 h-4 text-[#64748b] shrink-0" />
                    <span className="truncate">Send Email</span>
                  </button>

                  {/* Send WhatsApp */}
                  <button
                    onClick={() => onOpenWhatsApp(lead)}
                    className="flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-[#0f172a] border border-[#e2e8f0] text-[11.5px] font-semibold py-2 px-2 rounded-lg transition-colors whitespace-nowrap min-h-[36px]"
                  >
                    <svg className="w-4 h-4 fill-[#10b981] shrink-0" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                    </svg>
                    <span className="truncate">Send WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Academic */}
          {activeTab === 'academic' && (
            <div className="space-y-3 text-[11.5px]">
              <div className="bg-[#f8fafc] p-2.5 rounded-md border border-slate-200">
                <div className="font-bold text-[#101d37] mb-1">10th Education</div>
                <div className="text-[#52627a]">
                  Board: <span className="font-medium text-[#101d37]">{lead.tenthBoard || 'CBSE'}</span> •
                  Score: <span className="font-medium text-[#101d37]">{lead.tenthPercentage || '86.4%'}</span> •
                  Year: <span className="font-medium text-[#101d37]">{lead.tenthYear || '2016'}</span>
                </div>
              </div>

              <div className="bg-[#f8fafc] p-2.5 rounded-md border border-slate-200">
                <div className="font-bold text-[#101d37] mb-1">12th Education</div>
                <div className="text-[#52627a]">
                  Board: <span className="font-medium text-[#101d37]">{lead.twelfthBoard || 'CBSE'}</span> •
                  Score: <span className="font-medium text-[#101d37]">{lead.twelfthPercentage || '84.2%'}</span> •
                  Year: <span className="font-medium text-[#101d37]">{lead.twelfthYear || '2018'}</span>
                </div>
              </div>

              <div className="bg-[#f8fafc] p-2.5 rounded-md border border-slate-200">
                <div className="font-bold text-[#101d37] mb-1">Undergraduate / Degree</div>
                <div className="text-[#101d37] font-semibold">{lead.graduationDegree || 'B.Tech Computer Science'}</div>
                <div className="text-[#52627a] mt-0.5">
                  Univ: <span className="font-medium text-[#101d37]">{lead.graduationUniversity || 'RGPV Bhopal'}</span> •
                  CGPA: <span className="font-medium text-[#16a34a]">{lead.graduationCgpa || '8.2 CGPA'}</span>
                </div>
                <div className="text-[#52627a] mt-0.5">
                  Graduation Year: {lead.graduationYear || '2022'} • Backlogs: {lead.backlogs || '0'}
                </div>
              </div>

              <button
                onClick={() => onEditLead(lead)}
                className="w-full py-1 text-center text-xs font-semibold text-[#087cf5] border border-blue-200 rounded-md hover:bg-blue-50"
              >
                Edit Academic Records
              </button>
            </div>
          )}

          {/* Tab 3: Test Score */}
          {activeTab === 'test' && (
            <div className="space-y-3 text-[11.5px]">
              <div className="bg-[#f0f9ff] border border-blue-200 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[13px] text-[#0369a1]">{lead.testType || 'IELTS'} Academic</span>
                  <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 font-bold text-[11px]">
                    {lead.testResultStatus || 'Passed'}
                  </span>
                </div>
                <div className="text-[20px] font-bold text-[#0f172a] mt-1">
                  {lead.testOverallScore || '7.5'}{' '}
                  <span className="text-xs font-normal text-slate-500">Overall Band</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  {lead.testScoresDetails || 'L: 8.0, R: 7.5, W: 7.0, S: 7.5'}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Exam Date: {lead.testDate || '15 Jan 2025'}
                </div>
              </div>

              <button
                onClick={() => onEditLead(lead)}
                className="w-full py-1 text-center text-xs font-semibold text-[#087cf5] border border-blue-200 rounded-md hover:bg-blue-50"
              >
                Update Test Scores
              </button>
            </div>
          )}

          {/* Tab 4: Counselling */}
          {activeTab === 'counselling' && (
            <div className="space-y-2.5 text-[11.5px]">
              <div className="bg-[#f8fafc] border border-slate-200 rounded-md p-2.5">
                <div className="flex items-center justify-between text-[#8496b0] text-[10.5px]">
                  <span>Session: 05 Oct 2025</span>
                  <span>Counsellor: Neha Sharma</span>
                </div>
                <p className="text-[#101d37] font-medium mt-1">
                  Student evaluated for Italy public universities (Sapienza, Politecnico di Milano).
                </p>
                <div className="text-[#16a34a] text-[11px] mt-1 font-semibold">
                  Outcome: Interested in English MSc AI / CS with scholarship.
                </div>
              </div>

              <button
                onClick={() => onScheduleFollowUp(lead)}
                className="w-full py-1.5 bg-[#087cf5] text-white rounded text-xs font-semibold hover:bg-blue-600 transition-colors shadow-xs"
              >
                + Add Counselling Session
              </button>
            </div>
          )}

          {/* Tab 5: Notes */}
          {activeTab === 'notes' && (
            <div className="space-y-2.5 text-[11.5px]">
              <div className="space-y-1.5">
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Add internal counsellor note..."
                  rows={2}
                  className="w-full p-2 border border-slate-200 rounded text-xs outline-none focus:border-[#087cf5]"
                />
                <button
                  onClick={() => {
                    if (newNoteText.trim()) {
                      onAddNote(lead.id, newNoteText.trim());
                      setNewNoteText('');
                    }
                  }}
                  className="px-3 py-1 bg-[#087cf5] text-white text-xs rounded font-medium hover:bg-blue-600"
                >
                  Save Note
                </button>
              </div>

              <div className="border-t border-slate-100 pt-2 space-y-2">
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-bold text-[#101d37]">Neha Sharma</span>
                    <span>05 Oct 2025</span>
                  </div>
                  <p className="text-[11px] text-[#334155] mt-0.5">
                    {lead.notes || 'Strong candidate for Italy public universities. Wants English taught MSc in AI/Computer Science.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
