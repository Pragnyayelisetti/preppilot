import React from 'react';
import {
  LayoutDashboard,
  Mail,
  Target,
  BookOpen,
  Calendar,
  Smartphone,
  Bell,
  Bot,
  User,
  Settings,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

export type DashboardPage =
  | 'dashboard'
  | 'email-intelligence'
  | 'opportunities'
  | 'preparation-hub'
  | 'calendar'
  | 'whatsapp'
  | 'notifications'
  | 'ai-assistant'
  | 'profile'
  | 'settings';

interface SidebarProps {
  activePage: DashboardPage;
  onSelectPage: (page: DashboardPage) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onSignOut: () => void;
  notificationCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onSelectPage,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onSignOut,
  notificationCount = 3,
}) => {
  const menuItems = [
    { id: 'dashboard' as DashboardPage, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'email-intelligence' as DashboardPage, label: 'Email Intelligence', icon: Mail, badge: 'AI' },
    { id: 'opportunities' as DashboardPage, label: 'Opportunities', icon: Target, badge: '8' },
    { id: 'preparation-hub' as DashboardPage, label: 'Preparation Hub', icon: BookOpen },
    { id: 'calendar' as DashboardPage, label: 'Calendar', icon: Calendar },
    { id: 'whatsapp' as DashboardPage, label: 'WhatsApp', icon: Smartphone, badge: 'Sync' },
    { id: 'notifications' as DashboardPage, label: 'Notifications', icon: Bell, badgeCount: notificationCount },
    { id: 'ai-assistant' as DashboardPage, label: 'AI Assistant', icon: Bot, isAura: true },
    { id: 'profile' as DashboardPage, label: 'Profile', icon: User },
    { id: 'settings' as DashboardPage, label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (page: DashboardPage) => {
    onSelectPage(page);
    if (isMobileOpen) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-950/95 border-r border-white/10 backdrop-blur-2xl transition-all duration-300 ${
          /* Mobile styles */
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${
          /* Desktop collapsed styles */
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        }`}
      >
        {/* Header / Logo */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 cursor-pointer overflow-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 p-0.5 shadow-lg shadow-indigo-500/25 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[9px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-lg font-black tracking-tight text-white">
                  Prep<span className="text-indigo-400">Pilot</span>
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                  AI
                </span>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={isCollapsed && !isMobileOpen ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/30 to-violet-600/20 text-white border border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {/* Active left indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-400 rounded-r-full" />
                )}

                <div
                  className={`shrink-0 transition-transform group-hover:scale-110 ${
                    isActive
                      ? 'text-indigo-400'
                      : item.isAura
                      ? 'text-violet-400'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {(!isCollapsed || isMobileOpen) && (
                  <div className="flex-1 flex items-center justify-between overflow-hidden">
                    <span className="truncate">{item.label}</span>

                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-white/10 text-indigo-300 shrink-0">
                        {item.badge}
                      </span>
                    )}

                    {item.badgeCount !== undefined && item.badgeCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 shrink-0">
                        {item.badgeCount}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section / Logout */}
        <div className="p-3 border-t border-white/10 shrink-0 space-y-2">
          {(!isCollapsed || isMobileOpen) && (
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-950/40 to-violet-950/40 border border-indigo-500/20">
              <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>AI Career Sprint</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                TechNova interview in 5 days. Next task ready in Sprint Engine.
              </p>
            </div>
          )}

          <button
            onClick={onSignOut}
            title="Sign out of PrepPilot"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {(!isCollapsed || isMobileOpen) && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
