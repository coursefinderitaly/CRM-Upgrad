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
  X,
  ChevronLeft,
  ChevronRight,
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

  // Primary operational sections: clean, focused, relatable
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads', icon: Users, badge: unreadLeadsCount },
    {
      id: 'students',
      label: 'Students',
      icon: () => (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <circle cx="12" cy="10" r="3" />
          <path d="M7 17a5 5 0 0 1 10 0" />
        </svg>
      ),
    },
    { id: 'counselling', label: 'Counselling', icon: Headphones },
    { id: 'documentation', label: 'Documentation', icon: FileText },
    { id: 'university-shortlisting', label: 'University Shortlisting', icon: GraduationCap },
    { id: 'applications', label: 'Applications', icon: Send },
    { id: 'enrolment', label: 'Finance & Enrolment', icon: CreditCard },
  ];

  // Secondary management sections below divider
  const secondaryNavItems = [
    { id: 'tasks', label: 'Tasks & Follow-ups', icon: CheckSquare },
    { id: 'communication', label: 'Communications', icon: MessageSquare },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderNavItem = (item: {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
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
          {item.badge !== undefined && (
            <span
              className={`ml-auto px-1.5 py-0.2 rounded-full bg-[#ef4444] text-white text-[10px] font-bold leading-normal shrink-0 ${
                isCollapsed ? 'lg:hidden' : ''
              }`}
            >
              {item.badge}
            </span>
          )}
          {item.badge !== undefined && isCollapsed && (
            <span className="hidden lg:block absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#ef4444] ring-2 ring-[#07182c]" />
          )}
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
