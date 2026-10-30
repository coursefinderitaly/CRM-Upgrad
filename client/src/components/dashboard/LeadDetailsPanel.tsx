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
import { LEAD_STATUS_OPTIONS } from '../../utils/statuses';
import { StudentAvatar } from '../common/StudentAvatar';
import { ActionConfirmModal } from '../modals/ActionConfirmModal';

interface LeadDetailsPanelProps {
  lead: Lead | null;
  onOpenPhone: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onEnrollLead: (lead: Lead) => void;
  onScheduleFollowUp: (lead: Lead) => void;
  onBookCounsellingSession?: (lead: Lead) => void;
  onOpenEmail: (lead: Lead) => void;
  onOpenWhatsApp: (lead: Lead) => void;
  onTransferDocs: (lead: Lead) => void;
  onAddNote: (leadId: string, note: string) => void;
  onUpdateStatus?: (leadId: string, newStatus: string) => void;
}

export const LeadDetailsPanel: React.FC<LeadDetailsPanelProps> = ({
  lead,
  onOpenPhone,
  onEditLead,
  onEnrollLead,
  onScheduleFollowUp,
  onBookCounsellingSession,
  onOpenEmail,
  onOpenWhatsApp,
  onTransferDocs,
  onAddNote,
  onUpdateStatus,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'academic' | 'test' | 'counselling' | 'notes'>('profile');
  const [newNoteText, setNewNoteText] = useState('');
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

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
              <StudentAvatar
                name={lead.studentName}
                src={lead.avatarUrl}
                className="w-10 h-10 aspect-square rounded-full object-cover border border-slate-200 shrink-0 text-xs"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[14px] font-bold text-[#101d37] leading-snug">
                    {lead.studentName}
                  </span>
                  <select
                    value={lead.status}
                    onChange={(e) => {
                      const next = e.target.value;
                      if (next && next !== lead.status) setPendingStatus(next);
                    }}
                    disabled={!onUpdateStatus}
                    title="Update lead status"
                    className={`px-2 py-0.2 rounded-[4px] text-[10.5px] font-semibold leading-tight outline-none cursor-pointer border disabled:cursor-default ${
                      lead.status === 'On Hold' || lead.status === 'Drop'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-[#dbeafe] text-[#1d4ed8] border-blue-200'
                    }`}
                  >
                    {LEAD_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                    {!LEAD_STATUS_OPTIONS.includes(lead.status as any) && (
                      <option value={lead.status}>{lead.status}</option>
                    )}
                  </select>
                </div>
                <div className="text-[11px] text-[#64748b] leading-tight mt-0.5">
                  <span>Lead ID: <span className="font-medium text-[#101d37]">{lead.leadId}</span></span>
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
                    <span className="font-medium text-[#101d37]">{lead.dob || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-[#8496b0] block text-[10.5px]">Address</span>
                    <span className="font-medium text-[#101d37] truncate block">
                      {lead.address || 'Not provided'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8496b0] block text-[10.5px]">Nationality</span>
                    <span className="font-medium text-[#101d37]">{lead.nationality || 'Not specified'}</span>
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
                    <span className="font-semibold text-[#101d37]">{lead.countryInterest || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-[#8496b0] block text-[10.5px]">Course</span>
                    <span className="font-medium text-[#101d37] truncate block">
                      {lead.courseInterest || 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8496b0] block text-[10.5px]">Intake</span>
                    <span className="font-medium text-[#101d37]">{lead.intake || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-[#8496b0] block text-[10.5px]">Budget</span>
                    <span className="font-medium text-[#101d37]">
                      {lead.budget || 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8496b0] block text-[10.5px]">University Type</span>
                    <span className="font-medium text-[#101d37]">
                      {lead.universityType || 'Any'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8496b0] block text-[10.5px]">Preferred City</span>
                    <span className="font-medium text-[#101d37]">
                      {lead.preferredCity || 'Flexible'}
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
                      {lead.nextFollowUp ? `${lead.nextFollowUp} ${lead.nextFollowUpTime || ''}` : 'Not scheduled yet'}
                    </span>
                  </div>
                  <div className="text-[11.5px] text-[#52627a] mt-1 leading-snug">
                    {lead.nextFollowUpTask || 'No follow-up activity pending'}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
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
              {lead.tenthPercentage || lead.twelfthPercentage || lead.graduationDegree ? (
                <>
                  <div className="bg-[#f8fafc] p-2.5 rounded-md border border-slate-200">
                    <div className="font-bold text-[#101d37] mb-1">10th Education</div>
                    <div className="text-[#52627a]">
                      Board: <span className="font-medium text-[#101d37]">{lead.tenthBoard || '-'}</span> •
                      Score: <span className="font-medium text-[#101d37]">{lead.tenthPercentage || '-'}</span> •
                      Year: <span className="font-medium text-[#101d37]">{lead.tenthYear || '-'}</span>
                    </div>
                  </div>

                  <div className="bg-[#f8fafc] p-2.5 rounded-md border border-slate-200">
                    <div className="font-bold text-[#101d37] mb-1">12th Education</div>
                    <div className="text-[#52627a]">
                      Board: <span className="font-medium text-[#101d37]">{lead.twelfthBoard || '-'}</span> •
                      Score: <span className="font-medium text-[#101d37]">{lead.twelfthPercentage || '-'}</span> •
                      Year: <span className="font-medium text-[#101d37]">{lead.twelfthYear || '-'}</span>
                    </div>
                  </div>

                  <div className="bg-[#f8fafc] p-2.5 rounded-md border border-slate-200">
                    <div className="font-bold text-[#101d37] mb-1">Undergraduate / Degree</div>
                    <div className="text-[#101d37] font-semibold">{lead.graduationDegree || '-'}</div>
                    <div className="text-[#52627a] mt-0.5">
                      Univ: <span className="font-medium text-[#101d37]">{lead.graduationUniversity || '-'}</span> •
                      CGPA: <span className="font-medium text-[#16a34a]">{lead.graduationCgpa || '-'}</span>
                    </div>
                    <div className="text-[#52627a] mt-0.5">
                      Graduation Year: {lead.graduationYear || '-'} • Backlogs: {lead.backlogs || '0'}
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center text-slate-400">
                  <GraduationCap className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                  <p className="font-medium text-xs text-slate-600">No Academic Records Yet</p>
                  <p className="text-[10.5px] mt-0.5 text-slate-400">Add 10th, 12th, or degree qualification details.</p>
                </div>
              )}

              <button
                onClick={() => onEditLead(lead)}
                className="w-full py-1 text-center text-xs font-semibold text-[#087cf5] border border-blue-200 rounded-md hover:bg-blue-50"
              >
                {lead.tenthPercentage || lead.graduationDegree ? 'Edit Academic Records' : '+ Add Academic Details'}
              </button>
            </div>
          )}

          {/* Tab 3: Test Score */}
          {activeTab === 'test' && (
            <div className="space-y-3 text-[11.5px]">
              {lead.testOverallScore || lead.testType ? (
                <div className="bg-[#f0f9ff] border border-blue-200 rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[13px] text-[#0369a1]">{lead.testType || 'IELTS'} Academic</span>
                    <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 font-bold text-[11px]">
                      {lead.testResultStatus || 'Passed'}
                    </span>
                  </div>
                  <div className="text-[20px] font-bold text-[#0f172a] mt-1">
                    {lead.testOverallScore}{' '}
                    <span className="text-xs font-normal text-slate-500">Overall Band</span>
                  </div>
                  {lead.testScoresDetails && (
                    <div className="text-[11px] text-slate-600 mt-1">
                      {lead.testScoresDetails}
                    </div>
                  )}
                  {lead.testDate && (
                    <div className="text-[10px] text-slate-500 mt-1">
                      Exam Date: {lead.testDate}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center text-slate-400">
                  <Award className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                  <p className="font-medium text-xs text-slate-600">No English Test Scores Added</p>
                  <p className="text-[10.5px] mt-0.5 text-slate-400">IELTS, TOEFL, PTE, or Duolingo scores can be added here.</p>
                </div>
              )}

              <button
                onClick={() => onEditLead(lead)}
                className="w-full py-1 text-center text-xs font-semibold text-[#087cf5] border border-blue-200 rounded-md hover:bg-blue-50"
              >
                {lead.testOverallScore ? 'Update Test Scores' : '+ Add Test Scores'}
              </button>
            </div>
          )}

          {/* Tab 4: Counselling */}
          {activeTab === 'counselling' && (
            <div className="space-y-2.5 text-[11.5px]">
              {lead.counsellingSessions && lead.counsellingSessions.length > 0 ? (
                lead.counsellingSessions.map((session, idx) => (
                  <div key={idx} className="bg-[#f8fafc] border border-slate-200 rounded-md p-2.5">
                    <div className="flex items-center justify-between text-[#8496b0] text-[10.5px]">
                      <span>Session: {session.date}</span>
                      <span>Counsellor: {session.counsellorName || (session as any).counsellor || 'Counsellor'}</span>
                    </div>
                    <p className="text-[#101d37] font-medium mt-1">
                      {session.notes || (session as any).summary}
                    </p>
                    {session.outcome && (
                      <div className="text-[#16a34a] text-[11px] mt-1 font-semibold">
                        Outcome: {session.outcome}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center text-slate-400">
                  <BookOpen className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                  <p className="font-medium text-xs text-slate-600">No Counselling Sessions Yet</p>
                  <p className="text-[10.5px] mt-0.5 text-slate-400">Schedule or record the first counselling session with this student.</p>
                </div>
              )}

              <button
                onClick={() => (onBookCounsellingSession || onScheduleFollowUp)(lead)}
                className="w-full py-1.5 bg-[#087cf5] text-white rounded text-xs font-semibold hover:bg-blue-600 transition-colors shadow-xs"
              >
                + Schedule / Add Counselling Session
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
                {lead.notes ? (
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-bold text-[#101d37]">Counsellor</span>
                      <span>Latest Note</span>
                    </div>
                    <p className="text-[11px] text-[#334155] mt-0.5">
                      {lead.notes}
                    </p>
                  </div>
                ) : (
                  <p className="text-center text-slate-400 text-xs py-2">No internal notes added yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {pendingStatus && (
        <ActionConfirmModal
          isOpen
          onClose={() => setPendingStatus(null)}
          onConfirm={() => {
            if (onUpdateStatus) onUpdateStatus(lead.id, pendingStatus);
            setPendingStatus(null);
          }}
          title={`Change status to "${pendingStatus}"?`}
          studentName={lead.studentName}
          studentId={lead.leadId}
          studentAvatar={lead.avatarUrl}
          country={lead.countryInterest}
          currentStageName={lead.status}
          targetStageName={pendingStatus}
          description={`Are you sure you want to change ${lead.studentName}'s status from "${lead.status}" to "${pendingStatus}"? This will update the student profile immediately.`}
          confirmLabel={`Yes, change to ${pendingStatus}`}
          variant={
            pendingStatus === 'Enrolled'
              ? 'success'
              : pendingStatus === 'Drop' || pendingStatus === 'Lost'
                ? 'danger'
                : pendingStatus === 'On Hold'
                  ? 'warning'
                  : 'primary'
          }
        />
      )}
    </div>
  );
};
