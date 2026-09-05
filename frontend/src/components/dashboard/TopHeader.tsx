import React, { useState } from 'react';
import {
  Search,
  Bell,
  Menu,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Mail,
  X,
  ChevronDown
} from 'lucide-react';
import { DashboardPage } from './Sidebar';

interface TopHeaderProps {
  userName: string;
  userEmail: string;
  activePage: DashboardPage;
  onOpenMobileMenu: () => void;
  onSelectPage: (page: DashboardPage) => void;
  onViewLandingPage: () => void;
  onSearchChange?: (query: string) => void;
  notificationCount?: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  userName,
  userEmail,
  activePage,
  onOpenMobileMenu,
  onSelectPage,
  onViewLandingPage,
  onSearchChange,
  notificationCount = 3,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onSearchChange) onSearchChange(e.target.value);
  };

  const getPageTitle = () => {
    switch (activePage) {
      case 'email-intelligence':
        return 'AI Email Intelligence';
      case 'opportunities':
        return 'Opportunity Radar';
      case 'preparation-hub':
        return 'Preparation Hub & Sprints';
      case 'calendar':
        return 'Upcoming Deadlines & Calendar';
      case 'whatsapp':
        return 'WhatsApp Daily Briefing';
      case 'notifications':
        return 'Notification Stream';
      case 'ai-assistant':
        return 'PrepPilot AI Assistant';
      case 'profile':
        return 'Student Profile';
      case 'settings':
        return 'Settings & Preferences';
      case 'dashboard':
      default:
        return `Good morning, ${userName.split(' ')[0]} 👋`;
    }
  };

  const getPageSubtitle = () => {
    switch (activePage) {
      case 'email-intelligence':
        return 'Inbound emails parsed for shortlisted interviews, hackathons, and placement drives.';
      case 'opportunities':
        return 'Active campus and off-campus opportunities mapped against your technical skills.';
      case 'preparation-hub':
        return 'Targeted daily roadmap tasks designed to bridge your high-priority skill gaps.';
      case 'calendar':
        return 'Synchronized timeline of interviews, submission dates, and assessment rounds.';
      case 'whatsapp':
        return 'Your 8:00 AM daily sprint digest delivered directly to your mobile phone.';
      case 'notifications':
        return 'Real-time updates regarding parsed emails, upcoming cutoffs, and prep streaks.';
      case 'ai-assistant':
        return 'Ask questions about interview questions, mock problems, or skill recommendations.';
      case 'profile':
        return 'Your academic standing, skills matrix, and opportunity tracking preferences.';
      case 'settings':
        return 'Manage notification channels, email sync rules, and security preferences.';
      case 'dashboard':
      default:
        return "Here’s what needs your attention today.";
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Hamburger & Page Welcome */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white"
            title="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>{getPageTitle()}</span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              {getPageSubtitle()}
            </p>
          </div>
        </div>

        {/* Right: Search, Notifications, Profile */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative hidden md:block w-48 lg:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search opportunities, skills..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Landing Page Shortcut */}
          <button
            onClick={onViewLandingPage}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-white/10 hover:border-white/20 bg-slate-900/60 hover:bg-slate-900 text-xs text-slate-300 hover:text-white transition-all"
            title="View public marketing landing page"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] font-medium">Landing Page</span>
          </button>

          {/* Notifications Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl bg-slate-900/80 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center border-2 border-slate-950 animate-pulse">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Notification Popover Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-white/10 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Notifications</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium">
                      {notificationCount} New
                    </span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2.5 py-3">
                  <div
                    onClick={() => {
                      onSelectPage('opportunities');
                      setShowNotifications(false);
                    }}
                    className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all cursor-pointer flex items-start gap-2.5"
                  >
                    <div className="p-1.5 rounded-lg bg-indigo-600 text-white shrink-0 mt-0.5">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-white">Interview Shortlist Extracted</div>
                      <p className="text-[11px] text-slate-300">
                        TechNova technical interview round confirmed for Sep 9th.
                      </p>
                      <span className="text-[10px] text-indigo-400">2 hours ago</span>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      onSelectPage('calendar');
                      setShowNotifications(false);
                    }}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer flex items-start gap-2.5"
                  >
                    <div className="p-1.5 rounded-lg bg-amber-500 text-slate-950 shrink-0 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-white">Deadline Approaching</div>
                      <p className="text-[11px] text-slate-300">
                        ETHGlobal Singapore 2025 team submission due in 8 days.
                      </p>
                      <span className="text-[10px] text-slate-400">5 hours ago</span>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      onSelectPage('preparation-hub');
                      setShowNotifications(false);
                    }}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer flex items-start gap-2.5"
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-white">Daily Streak Active</div>
                      <p className="text-[11px] text-slate-300">
                        7-day streak maintained! 2 of 4 sprint tasks completed today.
                      </p>
                      <span className="text-[10px] text-slate-400">Yesterday</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 text-center">
                  <button
                    onClick={() => {
                      onSelectPage('notifications');
                      setShowNotifications(false);
                    }}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    View All Notifications &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Student Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-slate-900/80 border border-white/10 hover:border-white/20 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                {userName.charAt(0).toUpperCase()}
              </div>

              <div className="hidden md:block">
                <div className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                  <span>{userName}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <div className="text-[10px] text-indigo-400 font-mono">Verified Student</div>
              </div>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in">
                <div className="px-3 py-2 border-b border-white/10">
                  <div className="text-xs font-bold text-white">{userName}</div>
                  <div className="text-[10px] text-slate-400 truncate">{userEmail}</div>
                </div>

                <div className="py-1 space-y-0.5">
                  <button
                    onClick={() => {
                      onSelectPage('profile');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    View Profile & Skills
                  </button>
                  <button
                    onClick={() => {
                      onSelectPage('settings');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Account Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
