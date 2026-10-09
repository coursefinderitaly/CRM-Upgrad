import React from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  UserCheck,
  Headphones,
  Award,
  History,
  CheckSquare,
  Calendar,
  MessageSquare,
  BarChart3,
  PlusSquare,
  Mail,
  UserPlus,
  FileText,
  PhoneCall,
  Menu,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  unreadLeadsCount?: number;
  isOpen: boolean;
  onClose: () => void;
  onQuickAction: (action: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  unreadLeadsCount = 12,
  isOpen,
  onClose,
  onQuickAction,
}) => {
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads', icon: Users, badge: unreadLeadsCount },
    { id: 'students', label: 'Students', icon: UserCheck },
    { id: 'counselling', label: 'Counselling', icon: Headphones },
    { id: 'enrolment', label: 'Enrolment', icon: Award },
    { id: 'follow-ups', label: 'Follow-ups', icon: History },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'communication', label: 'Communication', icon: MessageSquare },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  const quickLinks = [
    { id: 'add-lead', label: 'Add New Lead', icon: PlusSquare },
    { id: 'send-whatsapp', label: 'Send WhatsApp', icon: PhoneCall },
    { id: 'send-email', label: 'Send Email', icon: Mail },
    { id: 'book-counselling', label: 'Book Counselling', icon: Headphones },
    { id: 'enrol-student', label: 'Enrol Student', icon: UserPlus },
    { id: 'transfer-docs', label: 'Transfer to Docs', icon: FileText },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[240px] bg-[#07182c] text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Branding */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-[#0f294a]/60">
          <div className="flex items-center justify-center w-9 h-9 rounded-md bg-transparent text-white">
            <GraduationCap className="w-8 h-8 text-white stroke-[1.8]" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] font-bold tracking-tight text-white leading-tight">
              Study Abroad CRM
            </h1>
            <p className="text-[10px] text-[#93a8c1] font-normal leading-tight truncate mt-0.5">
              From a Lead to a Dream Destination
            </p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {/* Section: Counsellor Portal */}
          <div>
            <div className="px-3 pb-2 text-[11px] font-semibold text-[#8ca0ba] uppercase tracking-wider">
              Counsellor Portal
            </div>
            <nav className="space-y-0.5">
              {mainNavItems.map((item) => {
                const isActive = currentRoute === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-[7px] text-[13px] font-medium transition-colors ${
                      isActive
                        ? 'bg-[#087cf5] text-white shadow-sm font-semibold'
                        : 'text-[#d0dbe7] hover:bg-[#0e2746] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-[17px] h-[17px] ${
                          isActive ? 'text-white' : 'text-[#a2b5cc]'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="px-1.5 py-0.2 rounded-full bg-[#ef4444] text-white text-[11px] font-bold leading-normal">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Section: Quick Links */}
          <div className="pt-2">
            <div className="px-3 pb-2 text-[11px] font-semibold text-[#8ca0ba] uppercase tracking-wider">
              Quick Links
            </div>
            <nav className="space-y-0.5">
              {quickLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onQuickAction(item.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[7px] text-[13px] font-medium text-[#d0dbe7] hover:bg-[#0e2746] hover:text-white transition-colors text-left"
                  >
                    <Icon className="w-[17px] h-[17px] text-[#a2b5cc]" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};
