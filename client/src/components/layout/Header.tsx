import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Search,
  Plus,
  Mail,
  Bell,
  ChevronDown,
  Check,
  User,
  Settings,
  Key,
  LogOut,
  Calendar,
  Phone,
  ExternalLink,
} from 'lucide-react';
import { NotificationItem, Lead } from '../../types/crm';
import { searchGlobal, markNotificationRead, markAllNotificationsRead } from '../../services/api';

interface HeaderProps {
  onToggleSidebar: () => void;
  onAddNewLead: () => void;
  onOpenEmail: () => void;
  onOpenWhatsApp: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  onSelectLead: (lead: Lead) => void;
  onRefreshNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onAddNewLead,
  onOpenEmail,
  onOpenWhatsApp,
  notifications,
  unreadCount,
  onSelectLead,
  onRefreshNotifications,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Lead[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeModal, setActiveModal] = useState<'profile' | 'settings' | 'password' | 'logout' | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
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

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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


        {/* WhatsApp Icon */}
        <button
          onClick={onOpenWhatsApp}
          className="w-8 h-8 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-xs transition-colors"
          title="Quick WhatsApp"
        >
          <svg
            className="w-4 h-4 fill-current"
            viewBox="0 0 24 24"
          >
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.044-2.029-.533-1.428-.592-2.348-2.04-2.42-2.137-.071-.097-.58-.771-.58-1.469 0-.698.362-1.041.49-1.185.127-.143.281-.179.375-.179.094 0 .188.001.27.006.086.004.202-.033.315.241.119.287.406.994.442 1.066.035.072.059.156.012.25-.047.093-.071.152-.142.235-.07.083-.148.185-.212.249-.071.071-.145.148-.062.291.082.143.366.604.786.978.54.482.996.632 1.138.703.142.071.226.059.31-.036.084-.095.361-.421.457-.565.095-.144.19-.119.321-.072.131.048.832.392.975.464.143.071.238.107.273.167.036.059.036.345-.108.75z" />
          </svg>
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

        {/* Calendar Icon Button */}
        <button
          onClick={() => alert('Calendar & Schedule: View meetings and deadlines.')}
          className="p-1.5 text-[#334155] hover:text-[#087cf5] hover:bg-slate-100 rounded-md transition-colors"
          title="Calendar & Appointments"
        >
          <Calendar className="w-5 h-5" />
        </button>

        {/* User Profile Area */}
        <div ref={profileRef} className="relative pl-1 border-l border-slate-200">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 hover:bg-slate-50 p-1 rounded-md transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-[#07182c] text-white flex items-center justify-center text-[11px] font-bold border border-slate-300 shrink-0">
              AG
            </div>
            <div className="text-left hidden md:block">
              <div className="text-[12.5px] font-bold text-[#101d37] leading-tight">
                Amit Gautam
              </div>
              <div className="text-[10px] text-[#52627a] leading-tight">
                Admin
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#52627a]" />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#e2e8f0] rounded-lg shadow-xl py-1 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-[#101d37]">Amit Gautam</div>
                <div className="text-[10.5px] text-[#52627a]">amit.gautam@company.com</div>
              </div>
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
                  window.location.reload();
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
