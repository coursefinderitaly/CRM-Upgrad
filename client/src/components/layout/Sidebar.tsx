import React from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  FileText,
  CheckSquare,
  MessageSquare,
  BarChart3,
  Settings,
  Headphones,
  CreditCard,
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
} from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

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
  unreadLeadsCount = 12,
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}) => {
  // Organisation branding comes from Settings → Organisation (falls back to a neutral product name)
  const [org] = useLocalStorage<{ orgName: string }>('crm-settings-org', { orgName: '' });

  // Primary study abroad operational lifecycle stages as configured
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
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
    { id: 'tasks', label: 'Tasks & Follow-ups', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar & Schedule', icon: Calendar },
    { id: 'communication', label: 'Communications', icon: MessageSquare },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'resources', label: 'Resources', icon: Library },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderNavItem = (item: {
    id: string;
    label: string;
    icon: React.ElementType;
  }) => {
    const isActive = currentRoute === item.id;
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
        {/* Branding (reads the organisation name configured in Settings) */}
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

          {/* Desktop collapse / expand icon button */}
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

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-700">
          {/* Main Lifecycle Navigation */}
          <nav className="space-y-0.5">{mainNavItems.map(renderNavItem)}</nav>

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

        {/* Footer: collapse toggle (desktop) */}
        <div className="hidden lg:block border-t border-[#0f294a]/60 p-2.5">
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`w-full flex items-center px-3 py-2 rounded-[6px] text-[11.5px] font-medium text-[#8ca0ba] hover:bg-[#0e2746] hover:text-white transition-colors ${
              isCollapsed ? 'lg:justify-center lg:px-2' : ''
            }`}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 shrink-0" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span className="ml-2.5">Collapse Panel</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
