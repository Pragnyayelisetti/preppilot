import React from 'react';
import { Menu, Bell, Mail, RefreshCw, Sparkles, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTestMode } from '../../context/TestModeContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onNavigate,
  currentView
}) => {
  const { user } = useAuth();
  const { isTestFullscreen } = useTestMode();

  // Same reasoning as Sidebar — hide the app chrome entirely during a
  // proctored test rather than relying on the browser's fullscreen mode
  // to do it (it only hides browser tabs/URL bar, not our own layout).
  if (isTestFullscreen) return null;

  const titleMap: Record<string, string> = {
    dashboard: 'Career Dashboard',
    opportunities: 'Verified Opportunities',
    'opportunity-detail': 'Opportunity Deep Dive',
    'mock-tests': 'Timed Mock Assessments',
    'mock-interview': 'AI Mock Interview Simulator',
    calendar: 'Recruitment Calendar',
    whatsapp: 'WhatsApp Alert Center',
    'email-intelligence': 'Email Intelligence',
    assistant: 'AI Career Copilot',
    profile: 'Student Profile'
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 lg:px-8 py-3.5 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 lg:hidden transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
              {titleMap[currentView] || 'PrepPilot'}
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
              Active Session
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium hidden sm:block mt-0.5">
            AI Placement & Internship Copilot for University Candidates
          </div>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* WhatsApp indicator */}
        <button
          onClick={() => onNavigate('whatsapp')}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 relative transition-all"
          title="WhatsApp Alert Center"
        >
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5 ring-2 ring-white" />
        </button>

        {/* Connected email status */}
        <div
          onClick={() => onNavigate('email-intelligence')}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 cursor-pointer text-xs transition-colors shadow-2xs"
          title="Click to view Email Intelligence inbox status"
        >
          <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="font-medium text-slate-700 max-w-[130px] truncate">
            {user?.connectedGmailAddress || 'Connect Gmail'}
          </span>
        </div>
      </div>
    </header>
  );
};