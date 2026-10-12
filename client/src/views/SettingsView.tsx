import React, { useMemo, useState } from 'react';
import {
  Settings as SettingsIcon,
  Building2,
  Users,
  Bell,
  GitBranch,
  ShieldCheck,
  Save,
  Plus,
  Trash2,
  Download,
  RotateCcw,
  Mail,
  Phone,
  Globe,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  Clock,
  Lock,
  Database,
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useWorkflow, PIPELINE_STAGES } from '../context/WorkflowContext';

/* ------------------------------------------------------------------ */
/* Types & defaults                                                    */
/* ------------------------------------------------------------------ */

interface OrganisationSettings {
  orgName: string;
  agencyCode: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  timezone: string;
  currency: string;
  academicYear: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

interface NotificationSettings {
  newLeadAssigned: boolean;
  followUpReminders: boolean;
  documentUpdates: boolean;
  visaAlerts: boolean;
  offerUpdates: boolean;
  dailyDigest: boolean;
  whatsappUpdates: boolean;
  desktopNotifications: boolean;
}

interface StageConfig {
  id: string;
  enabled: boolean;
  slaDays: number | '';
}

interface SecuritySettings {
  twoFactor: boolean;
  autoLogout: string;
  sessionAlerts: boolean;
}

/* Blank defaults — the workspace starts unconfigured and is filled in by the user */
const EMPTY_ORG: OrganisationSettings = {
  orgName: '',
  agencyCode: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  timezone: '',
  currency: '',
  academicYear: '',
};

const EMPTY_TEAM: TeamMember[] = [];

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  newLeadAssigned: false,
  followUpReminders: false,
  documentUpdates: false,
  visaAlerts: false,
  offerUpdates: false,
  dailyDigest: false,
  whatsappUpdates: false,
  desktopNotifications: false,
};

const DEFAULT_STAGES: StageConfig[] = PIPELINE_STAGES.map((s) => ({
  id: s.id,
  enabled: true,
  slaDays: '',
}));

const DEFAULT_SECURITY: SecuritySettings = {
  twoFactor: false,
  autoLogout: '',
  sessionAlerts: false,
};

const ROLES = [
  'Admin',
  'Senior Counsellor',
  'Counsellor',
  'Documentation Officer',
  'Application Officer',
  'Visa Officer',
  'Finance',
];

type SettingsTab = 'organisation' | 'team' | 'notifications' | 'pipeline' | 'security';

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  type?: string;
  options?: string[];
  placeholder?: string;
  className?: string;
}> = ({ label, value, onChange, icon, type = 'text', options, placeholder, className = '' }) => (
  <div className={className}>
    <label className="block text-[11px] font-semibold text-[#52627a] mb-1">{label}</label>
    <div className="relative">
      {icon && <span className="absolute left-2.5 top-2.5 text-[#8496b0] pointer-events-none">{icon}</span>}
      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] focus:bg-white rounded-[6px] ${
            icon ? 'pl-8' : 'pl-3'
          } pr-3 py-2 text-[12px] outline-none transition-all ${value ? 'text-[#101d37]' : 'text-[#94a3b8]'}`}
        >
          <option value="" disabled>
            {placeholder || 'Select an option'}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="text-[#101d37]">
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] focus:bg-white rounded-[6px] ${
            icon ? 'pl-8' : 'pl-3'
          } pr-3 py-2 text-[12px] text-[#101d37] outline-none transition-all placeholder:text-[#94a3b8]`}
        />
      )}
    </div>
  </div>
);

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
      checked ? 'bg-[#087cf5]' : 'bg-slate-300'
    }`}
  >
    <span
      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
        checked ? 'left-[18px]' : 'left-0.5'
      }`}
    />
  </button>
);

const ToggleRow: React.FC<{
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}> = ({ title, description, checked, onChange }) => (
  <div className="flex items-center justify-between gap-3 p-3 bg-[#f8fafc] rounded-[7px] border border-[#eef3f8]">
    <div>
      <div className="font-semibold text-[#101d37] text-[12px]">{title}</div>
      <div className="text-[11px] text-[#64748b] mt-0.5">{description}</div>
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

/* ------------------------------------------------------------------ */
/* Main view                                                           */
/* ------------------------------------------------------------------ */

export const SettingsView: React.FC = () => {
  const { resetWorkflow, students } = useWorkflow();

  const [activeTab, setActiveTab] = useState<SettingsTab>('organisation');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [org, setOrg, resetOrg] = useLocalStorage<OrganisationSettings>('crm-settings-org', EMPTY_ORG);
  const [team, setTeam, resetTeam] = useLocalStorage<TeamMember[]>('crm-settings-team', EMPTY_TEAM);
  const [notifications, setNotifications, resetNotifications] = useLocalStorage<NotificationSettings>(
    'crm-settings-notifications',
    DEFAULT_NOTIFICATIONS
  );
  const [stages, setStages, resetStages] = useLocalStorage<StageConfig[]>('crm-settings-stages', DEFAULT_STAGES);
  const [security, setSecurity, resetSecurity] = useLocalStorage<SecuritySettings>(
    'crm-settings-security',
    DEFAULT_SECURITY
  );

  // Add-member form state
  const [newMember, setNewMember] = useState({ name: '', email: '', role: ROLES[2] });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const enabledStages = useMemo(() => stages.filter((s) => s.enabled).length, [stages]);

  const tabs: Array<{ id: SettingsTab; label: string; icon: React.ElementType }> = [
    { id: 'organisation', label: 'Organisation', icon: Building2 },
    { id: 'team', label: 'Users & Team', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'pipeline', label: 'Pipeline & Stages', icon: GitBranch },
    { id: 'security', label: 'Data & Security', icon: ShieldCheck },
  ];

  const handleAddMember = () => {
    const name = newMember.name.trim();
    const email = newMember.email.trim();
    if (!name || !email) {
      showToast('Enter both name and email to add a team member');
      return;
    }
    const member: TeamMember = {
      id: `u-${Date.now()}`,
      name,
      email,
      role: newMember.role,
      active: true,
    };
    setTeam((prev) => [...prev, member]);
    setNewMember({ name: '', email: '', role: ROLES[2] });
    showToast(`${name} added to the team`);
  };

  const handleExportSettings = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      organisation: org,
      team,
      notifications,
      pipelineStages: stages,
      security,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm_settings_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Settings exported as JSON');
  };

  const handleResetWorkflowData = () => {
    if (window.confirm('Reset all student workflow progress back to the seeded demo data?')) {
      resetWorkflow();
      showToast('Workflow data reset to demo seed');
    }
  };

  return (
    <div className="p-3.5 pb-16 space-y-3 max-w-[1536px] mx-auto font-sans text-[#101d37] select-none">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-16 right-5 z-50 bg-[#07182c] text-white text-xs px-4 py-2.5 rounded-lg shadow-xl border border-blue-500/30 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-3 text-slate-400 hover:text-white font-bold">
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-3.5 rounded-[8px] border border-[#e5edf5] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-slate-700 text-white flex items-center justify-center shadow-xs">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-[17px] font-bold text-[#101d37] leading-tight">Settings</h1>
            <p className="text-[11.5px] text-[#64748b] leading-tight mt-0.5">
              Organisation profile, team access, notifications, pipeline configuration and data controls
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
            <Save className="w-3 h-3" />
            Auto-saved locally
          </span>
          <button
            onClick={handleExportSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] border border-[#e2e8f0] bg-white hover:bg-slate-50 text-[12px] font-semibold text-[#101d37] shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Settings</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[12px]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-[5px] transition-all whitespace-nowrap font-medium flex items-center gap-1.5 ${
                isActive
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

      {/* ---------------------------- Organisation ---------------------------- */}
      {activeTab === 'organisation' && (
        <div className="bg-white rounded-[8px] border border-[#e5edf5] p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-[14px] font-bold text-[#101d37]">Organisation Profile</h2>
              <p className="text-[11px] text-[#64748b]">
                Displayed on student agreements, invoices and official communication
              </p>
            </div>
            <button
              onClick={() => {
                resetOrg();
                showToast('Organisation profile cleared');
              }}
              className="text-[11px] font-semibold text-[#64748b] hover:text-[#101d37] flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Field
              label="Organisation Name"
              value={org.orgName}
              onChange={(v) => setOrg({ ...org, orgName: v })}
              icon={<Building2 className="w-3.5 h-3.5" />}
              placeholder="Enter your organisation name"
              className="sm:col-span-2"
            />
            <Field
              label="Agency Code"
              value={org.agencyCode}
              onChange={(v) => setOrg({ ...org, agencyCode: v })}
              icon={<Lock className="w-3.5 h-3.5" />}
              placeholder="Enter agency code"
            />
            <Field
              label="Primary Email"
              value={org.email}
              onChange={(v) => setOrg({ ...org, email: v })}
              icon={<Mail className="w-3.5 h-3.5" />}
              type="email"
              placeholder="you@company.com"
            />
            <Field
              label="Phone"
              value={org.phone}
              onChange={(v) => setOrg({ ...org, phone: v })}
              icon={<Phone className="w-3.5 h-3.5" />}
              placeholder="+91 00000 00000"
            />
            <Field
              label="Website"
              value={org.website}
              onChange={(v) => setOrg({ ...org, website: v })}
              icon={<Globe className="w-3.5 h-3.5" />}
              placeholder="https://example.com"
            />
            <Field
              label="Head Office Address"
              value={org.address}
              onChange={(v) => setOrg({ ...org, address: v })}
              icon={<MapPin className="w-3.5 h-3.5" />}
              placeholder="Enter full office address"
              className="sm:col-span-2 lg:col-span-3"
            />
            <Field
              label="Timezone"
              value={org.timezone}
              onChange={(v) => setOrg({ ...org, timezone: v })}
              options={['Asia/Kolkata (GMT+5:30)', 'Asia/Dubai (GMT+4:00)', 'Europe/London (GMT+0:00)', 'Europe/Rome (GMT+1:00)']}
              placeholder="Select timezone"
            />
            <Field
              label="Default Currency"
              value={org.currency}
              onChange={(v) => setOrg({ ...org, currency: v })}
              options={['INR (₹)', 'EUR (€)', 'GBP (£)', 'USD ($)', 'AUD (A$)', 'CAD (C$)']}
              placeholder="Select currency"
            />
            <Field
              label="Active Academic Year"
              value={org.academicYear}
              onChange={(v) => setOrg({ ...org, academicYear: v })}
              options={['2026/27', '2027/28', '2028/29']}
              placeholder="Select academic year"
            />
          </div>
        </div>
      )}

      {/* ---------------------------- Team ---------------------------- */}
      {activeTab === 'team' && (
        <div className="space-y-3">
          <div className="bg-white rounded-[8px] border border-[#e5edf5] p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-[14px] font-bold text-[#101d37]">Add Team Member</h2>
                <p className="text-[11px] text-[#64748b]">Grant CRM access with a role-based permission profile</p>
              </div>
              <UserPlus className="w-4 h-4 text-[#087cf5]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <Field label="Full Name" value={newMember.name} onChange={(v) => setNewMember({ ...newMember, name: v })} />
              <Field
                label="Work Email"
                value={newMember.email}
                onChange={(v) => setNewMember({ ...newMember, email: v })}
                type="email"
              />
              <Field
                label="Role"
                value={newMember.role}
                onChange={(v) => setNewMember({ ...newMember, role: v })}
                options={ROLES}
              />
              <div className="flex items-end">
                <button
                  onClick={handleAddMember}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-[6px] bg-[#087cf5] hover:bg-[#006ee6] text-white text-[12px] font-semibold shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Member</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[8px] border border-[#e5edf5] shadow-xs overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-[14px] font-bold text-[#101d37]">Team Members ({team.length})</h2>
              <button
                onClick={() => {
                  resetTeam();
                  showToast('Team roster cleared');
                }}
                className="text-[11px] font-semibold text-[#64748b] hover:text-[#101d37] flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px] border-collapse min-w-[720px]">
                <thead>
                  <tr className="bg-[#f8fafc] text-[#52627a] font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-4">Member</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {team.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-10 text-center">
                        <Users className="w-6 h-6 mx-auto mb-2 text-[#cbd5e1]" />
                        <div className="text-[12px] font-semibold text-[#52627a]">No team members yet</div>
                        <div className="text-[11px] text-[#94a3b8] mt-0.5">
                          Add your first CRM user using the form above.
                        </div>
                      </td>
                    </tr>
                  )}
                  {team.map((member) => (
                    <tr key={member.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-full bg-[#dbeafe] text-[#087cf5] text-[11px] font-bold flex items-center justify-center shrink-0">
                            {member.name
                              .split(' ')
                              .map((p) => p[0])
                              .slice(0, 2)
                              .join('')}
                          </span>
                          <div>
                            <div className="font-semibold text-[#101d37]">{member.name}</div>
                            <div className="text-[10.5px] text-[#64748b]">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <select
                          value={member.role}
                          onChange={(e) =>
                            setTeam((prev) =>
                              prev.map((m) => (m.id === member.id ? { ...m, role: e.target.value } : m))
                            )
                          }
                          className="bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] rounded-[5px] px-2 py-1 text-[11.5px] outline-none"
                        >
                          {ROLES.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() =>
                            setTeam((prev) =>
                              prev.map((m) => (m.id === member.id ? { ...m, active: !m.active } : m))
                            )
                          }
                          className={`px-2 py-0.5 rounded-[4px] text-[10.5px] font-semibold border ${
                            member.active
                              ? 'bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {member.active ? 'Active' : 'Suspended'}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => {
                            setTeam((prev) => prev.filter((m) => m.id !== member.id));
                            showToast(`${member.name} removed from the team`);
                          }}
                          className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------- Notifications ---------------------------- */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-[8px] border border-[#e5edf5] p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-[14px] font-bold text-[#101d37]">Notification Preferences</h2>
              <p className="text-[11px] text-[#64748b]">
                Control which workflow events raise alerts for your workspace
              </p>
            </div>
            <button
              onClick={() => {
                resetNotifications();
                showToast('Notification preferences cleared');
              }}
              className="text-[11px] font-semibold text-[#64748b] hover:text-[#101d37] flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
            <ToggleRow
              title="New lead assigned"
              description="Alert when a lead is assigned to you"
              checked={notifications.newLeadAssigned}
              onChange={(v) => setNotifications({ ...notifications, newLeadAssigned: v })}
            />
            <ToggleRow
              title="Follow-up reminders"
              description="Remind me before scheduled student follow-ups"
              checked={notifications.followUpReminders}
              onChange={(v) => setNotifications({ ...notifications, followUpReminders: v })}
            />
            <ToggleRow
              title="Document verification updates"
              description="Approvals, rejections and re-upload requests"
              checked={notifications.documentUpdates}
              onChange={(v) => setNotifications({ ...notifications, documentUpdates: v })}
            />
            <ToggleRow
              title="Offer letter updates"
              description="Conditional and unconditional offers received"
              checked={notifications.offerUpdates}
              onChange={(v) => setNotifications({ ...notifications, offerUpdates: v })}
            />
            <ToggleRow
              title="Visa & VFS alerts"
              description="Appointment slots, biometrics and visa decisions"
              checked={notifications.visaAlerts}
              onChange={(v) => setNotifications({ ...notifications, visaAlerts: v })}
            />
            <ToggleRow
              title="Daily digest email"
              description="Morning summary of pipeline movement at 9:00 AM"
              checked={notifications.dailyDigest}
              onChange={(v) => setNotifications({ ...notifications, dailyDigest: v })}
            />
            <ToggleRow
              title="WhatsApp updates"
              description="Send student-facing updates over WhatsApp Business"
              checked={notifications.whatsappUpdates}
              onChange={(v) => setNotifications({ ...notifications, whatsappUpdates: v })}
            />
            <ToggleRow
              title="Desktop notifications"
              description="Browser push notifications while CRM is open"
              checked={notifications.desktopNotifications}
              onChange={(v) => setNotifications({ ...notifications, desktopNotifications: v })}
            />
          </div>
        </div>
      )}

      {/* ---------------------------- Pipeline ---------------------------- */}
      {activeTab === 'pipeline' && (
        <div className="bg-white rounded-[8px] border border-[#e5edf5] p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-[14px] font-bold text-[#101d37]">Pipeline & Stage Configuration</h2>
              <p className="text-[11px] text-[#64748b]">
                {enabledStages} of {stages.length} stages enabled · service-level targets per stage
              </p>
            </div>
            <button
              onClick={() => {
                resetStages();
                showToast('Pipeline configuration cleared');
              }}
              className="text-[11px] font-semibold text-[#64748b] hover:text-[#101d37] flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          <div className="space-y-2">
            {PIPELINE_STAGES.map((stage, index) => {
              const config = stages.find((s) => s.id === stage.id) || { id: stage.id, enabled: true, slaDays: '' as const };
              return (
                <div
                  key={stage.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-[7px] border border-[#eef3f8] bg-[#f8fafc]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-white border border-[#e2e8f0] text-[11px] font-bold text-[#52627a] flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${stage.dotClass}`} />
                    <div>
                      <div className="text-[12.5px] font-semibold text-[#101d37]">{stage.label}</div>
                      <div className="text-[10.5px] text-[#64748b]">
                        Route: /{stage.route} · side-nav section
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#8496b0]" />
                      <label className="text-[11px] text-[#52627a] font-medium">SLA (days)</label>
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={config.slaDays}
                        placeholder="—"
                        onChange={(e) => {
                          const raw = e.target.value;
                          const next = raw === '' ? '' : Math.max(1, Math.min(60, Number(raw) || 1));
                          setStages((prev) => prev.map((s) => (s.id === stage.id ? { ...s, slaDays: next } : s)));
                        }}
                        className="w-16 bg-white border border-[#e2e8f0] focus:border-[#087cf5] rounded-[5px] px-2 py-1 text-[11.5px] outline-none placeholder:text-[#94a3b8]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#52627a] font-medium">
                        {config.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <Toggle
                        checked={config.enabled}
                        onChange={(v) =>
                          setStages((prev) => prev.map((s) => (s.id === stage.id ? { ...s, enabled: v } : s)))
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------- Security & Data ---------------------------- */}
      {activeTab === 'security' && (
        <div className="space-y-3">
          <div className="bg-white rounded-[8px] border border-[#e5edf5] p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-[14px] font-bold text-[#101d37]">Security</h2>
                <p className="text-[11px] text-[#64748b]">Session policies for all CRM users</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    resetSecurity();
                    showToast('Security preferences cleared');
                  }}
                  className="text-[11px] font-semibold text-[#64748b] hover:text-[#101d37] flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
            </div>

            <ToggleRow
              title="Two-factor authentication"
              description="Require an OTP on every new device login"
              checked={security.twoFactor}
              onChange={(v) => setSecurity({ ...security, twoFactor: v })}
            />
            <ToggleRow
              title="Session alerts"
              description="Email me when a new device signs in to my account"
              checked={security.sessionAlerts}
              onChange={(v) => setSecurity({ ...security, sessionAlerts: v })}
            />
            <div className="flex items-center justify-between gap-3 p-3 bg-[#f8fafc] rounded-[7px] border border-[#eef3f8]">
              <div>
                <div className="font-semibold text-[#101d37] text-[12px]">Auto logout after inactivity</div>
                <div className="text-[11px] text-[#64748b] mt-0.5">Locks the workstation session automatically</div>
              </div>
              <select
                value={security.autoLogout}
                onChange={(e) => setSecurity({ ...security, autoLogout: e.target.value })}
                className={`bg-white border border-[#e2e8f0] focus:border-[#087cf5] rounded-[5px] px-2 py-1.5 text-[11.5px] outline-none ${
                  security.autoLogout ? 'text-[#101d37]' : 'text-[#94a3b8]'
                }`}
              >
                <option value="" disabled>
                  Select duration
                </option>
                {['15 minutes', '30 minutes', '1 hour', '4 hours', 'Never'].map((opt) => (
                  <option key={opt} value={opt} className="text-[#101d37]">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-[8px] border border-[#e5edf5] p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-[14px] font-bold text-[#101d37]">Data Management</h2>
                <p className="text-[11px] text-[#64748b]">
                  {students.length} student profiles in the workflow store
                </p>
              </div>
              <Database className="w-4 h-4 text-[#087cf5]" />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleExportSettings}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] border border-[#e2e8f0] bg-white hover:bg-slate-50 text-[12px] font-semibold text-[#101d37] shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Configuration</span>
              </button>
              <button
                onClick={handleResetWorkflowData}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] border border-amber-200 bg-amber-50 hover:bg-amber-100 text-[12px] font-semibold text-amber-800 shadow-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Workflow Data</span>
              </button>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-[7px] border border-rose-200 bg-rose-50 text-rose-800">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-snug">
                <span className="font-bold block">Danger zone</span>
                Resetting the workflow returns every student profile to the seeded demo stages and clears their
                tracked timeline. Preferences in this page are not affected.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
