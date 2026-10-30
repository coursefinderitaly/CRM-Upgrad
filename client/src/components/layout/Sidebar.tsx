import React from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  CheckSquare,
  MessageSquare,
  BarChart3,
  Settings,
  History,
  Send,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  UserCheck,
  Award,
  Building2,
  Sparkles,
  ClipboardCheck,
  Stamp,
  Plane,
  Compass,
  Library,
  Phone,
  PauseCircle,
  UserX,
  LogOut,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  unreadLeadsCount?: number;
  isOpen: boolean;
  onClose: () => void;
  onQuickAction?: (action: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { user, activePortal, logout } = useAuth();
  const [org] = useLocalStorage<{ orgName: string }>('crm-settings-org', { orgName: '' });

  // Complete lifecycle navigation items (with Leads Management included!)
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'My Students', icon: UserPlus },
    { id: 'my-students-contacted', label: 'Contacted', icon: Phone },
    { id: 'my-students-counselling', label: 'Counselling', icon: MessageSquare },
    { id: 'my-students-interested', label: 'Interested', icon: UserCheck },
    { id: 'my-students-on-hold', label: 'On Hold', icon: PauseCircle },
    { id: 'my-students-drop', label: 'Drop', icon: UserX },
    { id: 'students', label: 'Enrolled Students', icon: Users },
    { id: 'university-shortlisting', label: 'University Shortlisting', icon: GraduationCap },
    { id: 'student-approval', label: 'Student Approval', icon: UserCheck },
    { id: 'documentation', label: 'Documentation Completed', icon: FileCheck2 },
    { id: 'applications', label: 'Application', icon: Send },
    { id: 'offer-letters', label: 'Offer Letter Received', icon: Award },
    { id: 'final-university', label: 'Final University', icon: Building2 },
    { id: 'scholarship', label: 'Scholarship', icon: Sparkles },
    { id: 'pre-enrolment', label: 'Pre-Enrollment', icon: ClipboardCheck },
    { id: 'dov-cimea', label: 'DOV and CIMEA', icon: Stamp },
    { id: 'visa-process', label: 'Visa', icon: Plane },
    { id: 'pre-departure', label: 'Pre-Departure & Arrival', icon: Compass },
  ];

  // Secondary management sections below divider
  const secondaryNavItems = [
    { id: 'history', label: 'History & Audit Trail', icon: History },
    { id: 'tasks', label: 'Tasks & Follow-ups', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar & Schedule', icon: Calendar },
    { id: 'communication', label: 'Communications', icon: MessageSquare },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'resources', label: 'Resources', icon: Library },
    { id: 'settings', label: 'Settings & Team', icon: Settings },
  ];

  // Counsellor portal only handles early-stage work. The downstream pipeline
  // stages (university shortlisting → pre-departure) live in the Docs /
  // Scholarship / Visa portals, so they are hidden here.
  const COUNSELLOR_MAIN_IDS = new Set([
    'dashboard',
    'leads',
    'my-students-contacted',
    'my-students-counselling',
    'my-students-interested',
    'my-students-on-hold',
    'my-students-drop',
    'students',
  ]);

  // Docs (Document & Application) portal only handles the dossier →
  // application → offer → final-university pipeline. Early counselling
  // stages and downstream visa/scholarship stages live in other portals.
  const DOCS_MAIN_IDS = new Set([
    'dashboard',
    'leads',
    'documentation',
    'applications',
    'offer-letters',
    'final-university',
  ]);

  const visibleMainNavItems =
    activePortal.role === 'counsellor'
      ? mainNavItems.filter((item) => COUNSELLOR_MAIN_IDS.has(item.id))
      : activePortal.role === 'docs'
        ? mainNavItems.filter((item) => DOCS_MAIN_IDS.has(item.id))
        : mainNavItems;

  // Contacted / Counselling / Interested / On Hold / Drop are sub-stages of the My Students
  // funnel. Render them as an indented group with a connector line so the
  // relationship is visible instead of looking like three separate modules.
  const STUDENT_STATUS_GROUP_IDS = new Set([
    'my-students-contacted',
    'my-students-counselling',
    'my-students-interested',
    'my-students-on-hold',
    'my-students-drop',
  ]);

  const firstGroupedIndex = visibleMainNavItems.findIndex((item) => STUDENT_STATUS_GROUP_IDS.has(item.id));
  const lastGroupedIndex = visibleMainNavItems.reduce(
    (last, item, index) => (STUDENT_STATUS_GROUP_IDS.has(item.id) ? index : last),
    -1
  );

  const navItemsBeforeGroup =
    firstGroupedIndex >= 0 ? visibleMainNavItems.slice(0, firstGroupedIndex) : visibleMainNavItems;
  const groupedStudentStatusItems =
    firstGroupedIndex >= 0
      ? visibleMainNavItems.slice(firstGroupedIndex, lastGroupedIndex + 1).filter((item) => STUDENT_STATUS_GROUP_IDS.has(item.id))
      : [];
  const navItemsAfterGroup =
    lastGroupedIndex >= 0 ? visibleMainNavItems.slice(lastGroupedIndex + 1) : [];

  const renderNavItem = (item: {
    id: string;
    label: string;
    icon: React.ElementType;
  }) => {
    const isActive =
      currentRoute === item.id ||
      (activePortal.role === 'docs' && item.id === 'leads' && currentRoute === 'students') ||
      (item.id === 'dashboard' && (!currentRoute || currentRoute === ''));
    const Icon = item.icon;
    return (
      <button
        key={item.id}
        onClick={() => {
          onNavigate(item.id);
          if (window.innerWidth < 1024) onClose();
        }}
        title={isCollapsed ? item.label : undefined}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-[6px] text-[12.5px] font-medium transition-colors ${
          isCollapsed ? 'lg:justify-center lg:px-2' : ''
        } ${
          isActive
            ? 'bg-[#087cf5] text-white shadow-xs font-semibold'
            : 'text-[#c2d3e7] hover:bg-[#0e2746] hover:text-white'
        }`}
      >
        <div className={`relative flex items-center gap-2.5 min-w-0 ${isCollapsed ? 'lg:gap-0' : ''}`}>
          <Icon
            className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#8ca0ba]'}`}
          />
          <span className={`truncate ${isCollapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
        </div>
      </button>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#07182c] text-white flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-[240px] lg:w-[76px]' : 'w-[240px]'}`}
      >
        {/* Branding */}
        <div
          className={`flex items-center gap-2 px-3.5 py-3.5 border-b border-[#0f294a]/60 ${
            isCollapsed ? 'lg:px-2.5 lg:justify-between lg:gap-1' : ''
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-transparent text-white shrink-0">
              <GraduationCap className="w-7 h-7 text-white stroke-[1.8]" />
            </div>
            <div className={`flex-1 min-w-0 ${isCollapsed ? 'lg:hidden' : ''}`}>
              <h1
                className="text-[14px] font-bold tracking-tight text-white leading-tight truncate"
                title={org.orgName || 'Study Abroad CRM'}
              >
                {org.orgName || 'Study Abroad CRM'}
              </h1>
              <p className="text-[9.5px] text-[#93a8c1] font-normal leading-tight truncate mt-0.5">
                Admissions &amp; Visa Suite
              </p>
            </div>
          </div>

          {/* Desktop collapse button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-5 h-5 rounded-md text-[#8ca0ba] hover:text-white hover:bg-[#0e2746] transition-colors shrink-0"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>

          {/* Mobile close button */}
          <button onClick={onClose} className="lg:hidden p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Portal Banner */}
        <div
          className={`px-3 py-2 bg-[#051426] border-b border-[#0f294a]/60 flex items-center justify-between ${
            isCollapsed ? 'lg:justify-center lg:px-1.5' : ''
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse"
              style={{ backgroundColor: activePortal.accentHex }}
            />
            <div className={`min-w-0 ${isCollapsed ? 'lg:hidden' : ''}`}>
              <span className="text-[11.5px] font-bold text-white block truncate leading-tight">
                {activePortal.title}
              </span>
              <span className="text-[9.5px] text-slate-400 block truncate leading-tight">
                {activePortal.badge}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-700">
          {/* Main Lifecycle Navigation */}
          <nav className="space-y-0.5">
            {navItemsBeforeGroup.map(renderNavItem)}

            {groupedStudentStatusItems.length > 0 && (
              <div className={`relative mt-0.5 mb-0.5 ${isCollapsed ? 'lg:mt-0 lg:mb-0' : ''}`}>
                {/* Vertical connector showing these are grouped under My Students */}
                <span
                  className={`absolute left-[13px] top-1 bottom-1 w-[1.5px] rounded-full bg-[#3b6ea8] ${
                    isCollapsed ? 'lg:hidden' : ''
                  }`}
                />
                <div className={`${isCollapsed ? 'lg:pl-0' : 'pl-3.5'} space-y-0.5`}>
                  {groupedStudentStatusItems.map(renderNavItem)}
                </div>
              </div>
            )}

            {navItemsAfterGroup.map(renderNavItem)}
          </nav>

          {/* Divider */}
          <div className="pt-2 border-t border-[#0f294a]/60">
            <div
              className={`px-3 pb-1.5 text-[10px] font-semibold text-[#8ca0ba] uppercase tracking-wider ${
                isCollapsed ? 'lg:hidden' : ''
              }`}
            >
              Management
            </div>
            {/* Secondary Management Navigation */}
            <nav className="space-y-0.5">{secondaryNavItems.map(renderNavItem)}</nav>
          </div>
        </div>

        {/* Footer: Active User & Logout */}
        <div className="border-t border-[#0f294a]/60 p-2.5 bg-[#051426]/60">
          <div
            className={`flex items-center justify-between gap-2 ${
              isCollapsed ? 'lg:flex-col lg:items-center' : ''
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-7 h-7 rounded-full text-white flex items-center justify-center text-[10px] font-bold shrink-0"
                style={{ backgroundColor: activePortal.accentHex }}
              >
                {user?.name
                  ? user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                  : 'U'}
              </div>
              <div className={`min-w-0 ${isCollapsed ? 'lg:hidden' : ''}`}>
                <div className="text-[11.5px] font-semibold text-white truncate leading-tight">
                  {user?.name || 'Portal User'}
                </div>
                <div className="text-[9.5px] text-slate-400 truncate leading-tight">
                  {user?.email || 'user@crm.com'}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Log Out of Portal"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
