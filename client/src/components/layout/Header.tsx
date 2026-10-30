import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Search,
  Plus,
  Mail,
  Bell,
  ChevronDown,
  User,
  Settings,
  Key,
  LogOut,
  Calendar,
  Phone,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { NotificationItem, Lead } from '../../types/crm';
import { searchGlobal, markNotificationRead, markAllNotificationsRead } from '../../services/api';
import { CalendarEvent, STORAGE_KEY, getInitialEvents } from '../../views/CalendarView';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  onAddNewLead: () => void;
  onOpenEmail: () => void;
  onOpenWhatsApp: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  onSelectLead: (lead: Lead) => void;
  onRefreshNotifications: () => void;
  onNavigate?: (route: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onAddNewLead,
  onOpenEmail,
  notifications,
  unreadCount,
  onSelectLead,
  onRefreshNotifications,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Lead[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const { user, activePortal, logout, switchPortal } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeModal, setActiveModal] = useState<'profile' | 'settings' | 'password' | 'logout' | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Calendar Dropdown State
  const [showCalendarPopup, setShowCalendarPopup] = useState(false);
  const [calendarPopupDate, setCalendarPopupDate] = useState(() => new Date());
  const [selectedPopupDate, setSelectedPopupDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchGlobal(searchQuery.trim());
        setSearchResults(res);
        setShowSearchDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load calendar events from shared localStorage whenever popup opens
  useEffect(() => {
    if (showCalendarPopup) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setCalendarEvents(JSON.parse(saved));
        } else {
          const initial = getInitialEvents();
          setCalendarEvents(initial);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        }
      } catch {
        setCalendarEvents(getInitialEvents());
      }
    }
  }, [showCalendarPopup]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendarPopup(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calendar calculations
  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  const currentPopupYear = calendarPopupDate.getFullYear();
  const currentPopupMonth = calendarPopupDate.getMonth();
  const firstDayOfMonthIndex = (new Date(currentPopupYear, currentPopupMonth, 1).getDay() + 6) % 7;
  const daysInCurrentMonth = new Date(currentPopupYear, currentPopupMonth + 1, 0).getDate();
  const daysInPreviousMonth = new Date(currentPopupYear, currentPopupMonth, 0).getDate();

  const prevMonthDays = Array.from({ length: firstDayOfMonthIndex }, (_, i) => {
    const day = daysInPreviousMonth - firstDayOfMonthIndex + i + 1;
    const m = currentPopupMonth === 0 ? 12 : currentPopupMonth;
    const y = currentPopupMonth === 0 ? currentPopupYear - 1 : currentPopupYear;
    return {
      day,
      dateStr: `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      isCurrentMonth: false,
    };
  });

  const curMonthDays = Array.from({ length: daysInCurrentMonth }, (_, i) => {
    const day = i + 1;
    return {
      day,
      dateStr: `${currentPopupYear}-${String(currentPopupMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      isCurrentMonth: true,
    };
  });

  const slotsNeeded = (7 - ((prevMonthDays.length + curMonthDays.length) % 7)) % 7;
  const nextMonthDays = Array.from({ length: slotsNeeded }, (_, i) => {
    const day = i + 1;
    const m = currentPopupMonth === 11 ? 1 : currentPopupMonth + 2;
    const y = currentPopupMonth === 11 ? currentPopupYear + 1 : currentPopupYear;
    return {
      day,
      dateStr: `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      isCurrentMonth: false,
    };
  });

  const allGridDays = [...prevMonthDays, ...curMonthDays, ...nextMonthDays];

  const selectedDayEvents = calendarEvents.filter((e) => e.date === selectedPopupDate);
  const todayEventsCount = calendarEvents.filter((e) => e.date === todayStr).length;

  const handlePrevMonth = () => {
    setCalendarPopupDate(new Date(currentPopupYear, currentPopupMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarPopupDate(new Date(currentPopupYear, currentPopupMonth + 1, 1));
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCalendarPopupDate(now);
    setSelectedPopupDate(todayStr);
  };

  const getCategoryDot = (type: string) => {
    switch (type) {
      case 'counselling':
        return 'bg-blue-500';
      case 'followup':
        return 'bg-emerald-500';
      case 'visa':
        return 'bg-purple-500';
      case 'deadline':
        return 'bg-rose-500';
      default:
        return 'bg-amber-500';
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      await markNotificationRead(notif.id);
      onRefreshNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    onRefreshNotifications();
  };

  return (
    <header className="h-[56px] bg-white border-b border-[#e5edf5] px-4 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left Area: Toggle & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-[480px]">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 text-[#52627a] hover:text-[#101d37] hover:bg-slate-100 rounded-md transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Input */}
        <div ref={searchRef} className="relative flex-1">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#8496b0] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
              placeholder="Search by Name, Mobile, Student ID..."
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] focus:border-[#087cf5] focus:bg-white rounded-[7px] pl-9 pr-3 py-1.5 text-[12.5px] text-[#101d37] placeholder-[#8496b0] outline-none transition-all"
            />
          </div>

          {/* Search Dropdown */}
          {showSearchDropdown && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#e2e8f0] rounded-lg shadow-lg max-h-[320px] overflow-y-auto z-50 py-1">
              {isSearching ? (
                <div className="px-4 py-3 text-xs text-[#8496b0] text-center">
                  Searching records...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => {
                      onSelectLead(lead);
                      setShowSearchDropdown(false);
                      setSearchQuery('');
                    }}
                    className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-blue-50/60 border-b border-slate-50 last:border-0"
                  >
                    <div>
                      <div className="text-[13px] font-semibold text-[#101d37]">
                        {lead.studentName}
                      </div>
                      <div className="text-[11px] text-[#52627a]">
                        {lead.phone} • {lead.countryInterest} • {lead.leadId}
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {lead.status}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-xs text-[#8496b0] text-center">
                  No matching student or lead found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Area: Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        {/* + Add New Lead Button */}
        <button
          onClick={onAddNewLead}
          className="flex items-center gap-1.5 bg-[#087cf5] hover:bg-[#006ee6] text-white text-[12.5px] font-semibold px-2.5 sm:px-3 py-1.5 rounded-[6px] shadow-sm transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden xs:inline sm:inline">Add New Lead</span>
          <span className="inline xs:hidden sm:hidden">Add Lead</span>
        </button>


        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 text-[#334155] hover:text-[#087cf5] hover:bg-slate-100 rounded-md transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#ef4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#e2e8f0] rounded-lg shadow-xl py-2 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[13px] font-bold text-[#101d37]">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-[#087cf5] hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`px-3 py-2.5 text-left cursor-pointer transition-colors ${
                        n.isRead ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/40 hover:bg-blue-50/70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-[#101d37]">
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#087cf5]" />
                        )}
                      </div>
                      <p className="text-[11.5px] text-[#52627a] mt-0.5 leading-snug">
                        {n.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-4 text-xs text-[#8496b0] text-center">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Calendar Dropdown */}
        <div ref={calendarRef} className="relative">
          <button
            onClick={() => setShowCalendarPopup(!showCalendarPopup)}
            className={`p-1.5 rounded-md transition-colors relative ${
              showCalendarPopup
                ? 'bg-blue-50 text-[#087cf5]'
                : 'text-[#334155] hover:text-[#087cf5] hover:bg-slate-100'
            }`}
            title="Calendar & Schedule"
          >
            <Calendar className="w-5 h-5" />
            {todayEventsCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#087cf5] rounded-full ring-2 ring-white" />
            )}
          </button>

          {showCalendarPopup && (
            <div className="absolute right-0 top-full mt-2 w-[350px] sm:w-[380px] bg-white border border-[#e2e8f0] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header */}
              <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-[#101d37]">
                    {calendarPopupDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    onClick={handleJumpToToday}
                    className="text-[10px] font-semibold text-[#087cf5] hover:bg-blue-50 px-2 py-0.5 rounded border border-blue-200 transition-colors"
                  >
                    Today
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1 hover:bg-slate-200 text-[#52627a] rounded transition-colors"
                    title="Previous Month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-slate-200 text-[#52627a] rounded transition-colors"
                    title="Next Month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day of Week headers */}
              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-[#8ca0ba] py-1 border-b border-slate-100 bg-slate-50/50">
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
                <span>Su</span>
              </div>

              {/* Mini Month Grid */}
              <div className="grid grid-cols-7 p-2 gap-1 bg-white">
                {allGridDays.map((d, idx) => {
                  const isToday = d.dateStr === todayStr;
                  const isSelected = d.dateStr === selectedPopupDate;
                  const dayEvts = calendarEvents.filter((e) => e.date === d.dateStr);
                  const hasEvents = dayEvts.length > 0;

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedPopupDate(d.dateStr)}
                      className={`h-7 sm:h-8 flex flex-col items-center justify-center rounded-lg text-[11px] relative transition-all ${
                        !d.isCurrentMonth
                          ? 'text-slate-300'
                          : isSelected
                          ? 'bg-[#087cf5] text-white font-bold shadow-xs'
                          : isToday
                          ? 'border border-[#087cf5] text-[#087cf5] font-semibold hover:bg-blue-50'
                          : 'text-[#101d37] hover:bg-slate-100'
                      }`}
                    >
                      <span className="leading-none">{d.day}</span>
                      {hasEvents && (
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {dayEvts.slice(0, 3).map((evt, i) => (
                            <span
                              key={i}
                              className={`w-1 h-1 rounded-full ${
                                isSelected ? 'bg-white' : getCategoryDot(evt.type)
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected Day Agenda Header */}
              <div className="px-3 py-1.5 bg-slate-50 border-t border-b border-slate-100 flex items-center justify-between text-[11px]">
                <div className="font-semibold text-[#101d37] flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-[#087cf5]" />
                  <span>
                    {new Date(selectedPopupDate + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-[#52627a] bg-slate-200/70 px-2 py-0.5 rounded-full">
                  {selectedDayEvents.length} {selectedDayEvents.length === 1 ? 'Event' : 'Events'}
                </span>
              </div>

              {/* Selected Day Event List */}
              <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1 bg-white">
                {selectedDayEvents.length > 0 ? (
                  selectedDayEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50/50 border border-slate-100 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-bold text-[#101d37] truncate">
                          {evt.title}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
                            evt.type === 'counselling'
                              ? 'bg-blue-100 text-blue-700'
                              : evt.type === 'visa'
                              ? 'bg-purple-100 text-purple-700'
                              : evt.type === 'deadline'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {evt.type}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[10.5px] text-[#52627a]">
                        <span className="font-medium text-[#101d37] truncate">{evt.studentName}</span>
                        <span className="text-slate-500 font-semibold shrink-0">{evt.time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-3 text-center">
                    <p className="text-xs text-[#8496b0]">No events scheduled on this date</p>
                    <p className="text-[10.5px] text-slate-400 mt-0.5">
                      Select another day or open full calendar
                    </p>
                  </div>
                )}
              </div>

              {/* Footer CTA */}
              <div className="p-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setShowCalendarPopup(false);
                    onNavigate?.('calendar');
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#087cf5] hover:bg-[#076ed9] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Open Full Calendar & Schedule</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Area */}
        <div ref={profileRef} className="relative pl-1 border-l border-slate-200">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 hover:bg-slate-50 p-1 rounded-md transition-colors"
          >
            <div
              className="w-7 h-7 rounded-full text-white flex items-center justify-center text-[11px] font-bold border border-slate-300 shrink-0"
              style={{ backgroundColor: activePortal.accentHex }}
            >
              {user?.name
                ? user.name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : 'U'}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-[12.5px] font-bold text-[#101d37] leading-tight truncate max-w-[120px]">
                {user?.name || 'Portal User'}
              </div>
              <div className="text-[10px] text-[#52627a] leading-tight">
                {activePortal.title}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#52627a]" />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-[#e2e8f0] rounded-xl shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-[#101d37] truncate">{user?.name || 'Portal User'}</div>
                <div className="text-[10.5px] text-[#52627a] truncate">{user?.email || 'user@crm.com'}</div>
                <div
                  className="mt-1 inline-block text-[9.5px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${activePortal.accentHex}15`,
                    color: activePortal.accentHex,
                  }}
                >
                  {activePortal.title}
                </div>
              </div>
              <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Switch Portal
              </div>
              <div className="px-1.5 pb-1 space-y-0.5">
                {[
                  { role: 'counsellor' as const, label: 'Counsellor Portal', desc: 'Leads & Onboarding' },
                  { role: 'docs' as const, label: 'Document & Application', desc: 'Dossiers & My Students' },
                  { role: 'admin' as const, label: 'Admin Command', desc: 'Executive Management' },
                  { role: 'scholarship' as const, label: 'Scholarship Portal', desc: 'Grants & Merit' },
                  { role: 'visa' as const, label: 'Visa Portal', desc: 'Embassy & Slots' },
                  { role: 'upgrad' as const, label: 'UpGrad Partner', desc: 'Partner Channel' },
                ].map((p) => (
                  <button
                    key={p.role}
                    onClick={() => {
                      switchPortal(p.role);
                      setShowProfileMenu(false);
                      if (onNavigate) {
                        onNavigate(p.role === 'docs' ? 'leads' : 'dashboard');
                      }
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors flex items-center justify-between ${
                      activePortal.role === p.role
                        ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="font-semibold leading-tight text-[11.5px]">{p.label}</div>
                      <div className="text-[9.5px] text-slate-400">{p.desc}</div>
                    </div>
                    {activePortal.role === p.role && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => {
                  setActiveModal('profile');
                  setShowProfileMenu(false);
                }}
                className="w-full px-3 py-1.5 text-left text-xs text-[#101d37] hover:bg-slate-50 flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5 text-[#52627a]" />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => {
                  setActiveModal('settings');
                  setShowProfileMenu(false);
                }}
                className="w-full px-3 py-1.5 text-left text-xs text-[#101d37] hover:bg-slate-50 flex items-center gap-2"
              >
                <Settings className="w-3.5 h-3.5 text-[#52627a]" />
                <span>Account Settings</span>
              </button>
              <button
                onClick={() => {
                  setActiveModal('password');
                  setShowProfileMenu(false);
                }}
                className="w-full px-3 py-1.5 text-left text-xs text-[#101d37] hover:bg-slate-50 flex items-center gap-2"
              >
                <Key className="w-3.5 h-3.5 text-[#52627a]" />
                <span>Change Password</span>
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => {
                  setActiveModal('logout');
                  setShowProfileMenu(false);
                }}
                className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5 text-red-600" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 1. My Profile Modal */}
      {activeModal === 'profile' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#101d37]">Counsellor Profile</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center gap-3.5">
              <img
                src="/avatars/neha.png"
                alt="Neha Sharma"
                className="w-14 h-14 aspect-square rounded-full border-2 border-[#087cf5] object-cover shrink-0"
              />
              <div>
                <h4 className="font-bold text-base text-[#101d37]">Neha Sharma</h4>
                <div className="text-xs text-[#087cf5] font-semibold">Senior Study Abroad Counsellor</div>
                <div className="text-[11px] text-[#52627a]">Employee ID: CRM-CNS-104</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200/70">
              <div>
                <span className="text-slate-400 block text-[10px]">Email</span>
                <span className="font-medium text-[#101d37]">neha@studyabroad.com</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Mobile</span>
                <span className="font-medium text-[#101d37]">+91 98765 00000</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Assigned Leads</span>
                <span className="font-bold text-[#087cf5]">48 Students</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Visa Success Rate</span>
                <span className="font-bold text-emerald-600">96.4%</span>
              </div>
            </div>
            <div className="text-xs text-[#52627a]">
              Specialization: European Admissions (Italy, Germany), UK Russell Group, STEM & Management Programs.
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-[#087cf5] hover:bg-[#006ee6] text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Account Settings Modal */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#101d37]">Account Settings</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-semibold text-[#101d37]">Desktop Notifications</div>
                  <div className="text-[11px] text-slate-500">Alerts for new assigned leads and tasks</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#087cf5]" />
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-semibold text-[#101d37]">WhatsApp Web Sync</div>
                  <div className="text-[11px] text-slate-500">Enable one-click chat opener for students</div>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#087cf5]" />
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-semibold text-[#101d37]">Calendar Timezone</div>
                  <div className="text-[11px] text-slate-500">Currently set to Asia/Kolkata (GMT+5:30)</div>
                </div>
                <span className="text-slate-400 text-xs font-mono">IST</span>
              </div>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-3.5 py-1.5 border border-slate-300 text-xs text-slate-600 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                }}
                className="px-4 py-1.5 bg-[#087cf5] text-white text-xs font-semibold rounded-lg hover:bg-[#006ee6]"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Change Password Modal */}
      {activeModal === 'password' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#101d37]">Change Password</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPasswordSuccess(true);
                setTimeout(() => {
                  setPasswordSuccess(false);
                  setActiveModal(null);
                }, 1200);
              }}
              className="space-y-3 text-xs"
            >
              {passwordSuccess && (
                <div className="bg-emerald-500 text-white p-2 rounded text-center font-semibold text-xs">
                  ✓ Password updated successfully!
                </div>
              )}

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Current Password</label>
                <input
                  type="password"
                  required
                  defaultValue="••••••••"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#087cf5]"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 8 characters"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#087cf5]"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Repeat new password"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#087cf5]"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#087cf5] text-white font-semibold rounded-lg hover:bg-[#006ee6]"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Logout Confirmation Modal */}
      {activeModal === 'logout' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm p-5 space-y-3.5 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#101d37]">Sign Out from Portal?</h3>
            <p className="text-xs text-slate-500">
              You will need to re-authenticate with your counsellor credentials to access student records.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 border border-slate-300 text-xs text-slate-600 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  logout();
                }}
                className="px-4 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
