import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Award,
  Play,
  Calendar,
  MessageSquare,
  Mail,
  Bot,
  User,
  Sparkles,
  LogOut,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTestMode } from '../../context/TestModeContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpen,
  onCloseMobile
}) => {
  const { user, logout } = useAuth();
  const { isTestFullscreen } = useTestMode();

  // Don't render the nav at all while a proctored test is active — this is
  // what actually removes it from the fullscreen view (fullscreen itself
  // only hides the browser's own chrome, not our own layout).
  if (isTestFullscreen) return null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
    { id: 'mock-tests', label: 'Mock Assessments', icon: Award },
    { id: 'mock-interview', label: 'Mock Interview AI', icon: Play },
    { id: 'calendar', label: 'Career Calendar', icon: Calendar },
    { id: 'whatsapp', label: 'WhatsApp Alerts', icon: MessageSquare, badge: 'Active' },
    { id: 'email-intelligence', label: 'Email Intelligence', icon: Mail },
    { id: 'assistant', label: 'AI Career Copilot', icon: Bot, badge: 'AI' },
    { id: 'profile', label: 'My Student Profile', icon: User }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col justify-between border-r border-slate-800/90 transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Brand */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-xs">
                <Sparkles className="w-5 h-5 text-indigo-100" />
              </div>
              <div>
                <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  <span>PrepPilot</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md font-semibold border border-indigo-400/25">
                    AI
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 font-medium">Career Intelligence Copilot</p>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-3.5 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => {
                    onNavigate(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="tracking-tight">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badge === 'AI'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/20'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/20'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3.5 border-t border-slate-800/80 space-y-2">
          <div
            onClick={() => {
              onNavigate('profile');
              onCloseMobile();
            }}
            className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/40 transition-colors flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="truncate text-left">
                <div className="text-xs font-bold text-white truncate">{user?.name || 'Alex Morgan'}</div>
                <div className="text-[11px] text-slate-400 truncate">{user?.college || 'Stanford'}</div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};