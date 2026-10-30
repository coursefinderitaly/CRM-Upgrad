import React from 'react';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  FileCheck2,
  Send,
  Award,
  Sparkles,
  Plane,
  Layers,
  GraduationCap,
  Building2,
  ClipboardCheck,
  Stamp,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MobileNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenMobileMenu?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentRoute, onNavigate }) => {
  const { activePortal } = useAuth();

  // Portal-specific primary mobile tabs (max 4 + 1 Portal Switcher = 5 touch targets)
  const getNavItems = () => {
    switch (activePortal.role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'leads', label: 'Leads', icon: Users },
          { id: 'students', label: 'Students', icon: GraduationCap },
          { id: 'reports', label: 'Reports', icon: Layers },
        ];
      case 'counsellor':
        return [
          { id: 'dashboard', label: 'My Leads', icon: LayoutDashboard },
          { id: 'students', label: 'Students', icon: Users },
          { id: 'tasks', label: 'Tasks', icon: CheckSquare },
        ];
      case 'docs':
        return [
          { id: 'documentation', label: 'Dossiers', icon: FileCheck2 },
          { id: 'applications', label: 'Applications', icon: Send },
          { id: 'offer-letters', label: 'Offers', icon: Award },
          { id: 'students', label: 'Students', icon: Users },
        ];
      case 'scholarship':
        return [
          { id: 'scholarship', label: 'Grants', icon: Sparkles },
          { id: 'students', label: 'Students', icon: Users },
          { id: 'resources', label: 'Guides', icon: Building2 },
          { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        ];
      case 'visa':
        return [
          { id: 'visa-process', label: 'Visa', icon: Plane },
          { id: 'pre-enrolment', label: 'Pre-Enrol', icon: ClipboardCheck },
          { id: 'dov-cimea', label: 'DOV/CIMEA', icon: Stamp },
          { id: 'pre-departure', label: 'Arrival', icon: Compass },
        ];
      case 'upgrad':
        return [
          { id: 'dashboard', label: 'UpGrad', icon: LayoutDashboard },
          { id: 'leads', label: 'Leads', icon: Users },
          { id: 'students', label: 'Cohorts', icon: GraduationCap },
          { id: 'resources', label: 'Programs', icon: Building2 },
        ];
      default:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'students', label: 'Students', icon: Users },
          { id: 'tasks', label: 'Tasks', icon: CheckSquare },
          { id: 'reports', label: 'Reports', icon: Layers },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Fixed Bottom Navigation Bar on Mobile / Tablet */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#07182c]/95 backdrop-blur-md border-t border-[#162f4e] lg:hidden px-2 py-1.5 safe-area-bottom shadow-2xl">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = currentRoute === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[56px] ${
                  isActive ? 'text-[#38bdf8]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className={`p-1 rounded-lg transition-transform ${
                    isActive ? 'bg-[#087cf5]/20 scale-105' : 'bg-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="text-[10px] font-medium tracking-tight mt-0.5 truncate max-w-[62px]">
                  {item.label}
                </span>
              </button>
            );
          })}

        </div>
      </nav>
    </>
  );
};
