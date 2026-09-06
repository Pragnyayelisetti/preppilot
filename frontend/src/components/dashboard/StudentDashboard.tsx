import React, { useState } from 'react';
import { Sidebar, DashboardPage } from './Sidebar';
import { TopHeader } from './TopHeader';
import { OverviewDashboard } from './OverviewDashboard';
import { EmailIntelligenceView } from './EmailIntelligenceView';
import { OpportunitiesRadarView } from './OpportunitiesRadarView';
import { PreparationHubView } from './PreparationHubView';
import { CalendarView } from './CalendarView';
import { WhatsAppView } from './WhatsAppView';
import { NotificationsView } from './NotificationsView';
import { AIAssistantView } from './AIAssistantView';
import { StudentProfileView } from './StudentProfileView';
import { SettingsView } from './SettingsView';
import { Opportunity } from '../../data/mockOpportunities';
import { CheckCircle2, Mail, Sparkles, X } from 'lucide-react';

interface StudentDashboardProps {
  user: {
    name: string;
    email: string;
    degree?: string;
    university?: string;
    branch?: string;
    graduationYear?: string;
    currentYear?: string;
    semester?: string;
    careerGoal?: string;
    skills?: string[];
    preferredOpportunities?: string[];
    preferredRoles?: string[];
    cgpa?: string;
  };
  onSignOut: () => void;
  onViewLandingPage: () => void;
  onSelectOpportunity: (opportunity: Opportunity) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  onSignOut,
  onViewLandingPage,
  onSelectOpportunity,
}) => {
  // Navigation & responsive state
  const [activePage, setActivePage] = useState<DashboardPage>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Email simulation toast / modal notification
  const [isAnalyzingEmails, setIsAnalyzingEmails] = useState(false);
  const [analysisCompleteToast, setAnalysisCompleteToast] = useState(false);

  const handleSimulateEmailAnalysis = () => {
    setIsAnalyzingEmails(true);
    setTimeout(() => {
      setIsAnalyzingEmails(false);
      setAnalysisCompleteToast(true);
      setTimeout(() => {
        setAnalysisCompleteToast(false);
      }, 4000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex relative overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Ambient Glows (Consistent with Elegant Dark AI SaaS) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/15 rounded-full blur-[160px]"></div>
        <div className="absolute top-[35%] right-[-10%] w-[45%] h-[45%] bg-violet-600/12 rounded-full blur-[160px]"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[140px]"></div>
      </div>

      {/* 1. SIDEBAR */}
      <Sidebar
        activePage={activePage}
        onSelectPage={setActivePage}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onSignOut={onSignOut}
        notificationCount={3}
      />

      {/* Main Content Area (with dynamic left padding for collapsible sidebar) */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* 2. TOP HEADER */}
        <TopHeader
          userName={user.name}
          userEmail={user.email}
          activePage={activePage}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onSelectPage={setActivePage}
          onViewLandingPage={onViewLandingPage}
          notificationCount={3}
        />

        {/* Global Ingestion / Analysis Loading Overlay */}
        {isAnalyzingEmails && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="p-6 rounded-3xl bg-slate-900 border border-indigo-500/40 shadow-2xl max-w-sm w-full text-center space-y-4 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400">
                <Sparkles className="w-6 h-6 animate-spin" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">AI Email Intelligence Active</h3>
                <p className="text-xs text-slate-300">
                  Scanning inbound campus recruitment emails, filtering spam, and matching interview shortlists...
                </p>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 animate-pulse w-3/4"></div>
              </div>
            </div>
          </div>
        )}

        {/* Toast for Email Analysis Complete */}
        {analysisCompleteToast && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900/95 border border-emerald-500/40 shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white">Email Intelligence Ingestion Complete</div>
              <div className="text-[11px] text-slate-300">
                12 emails analyzed • 3 active opportunities detected!
              </div>
            </div>
            <button
              onClick={() => setAnalysisCompleteToast(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main View Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Active View Switching */}
          {activePage === 'dashboard' && (
            <OverviewDashboard
              userName={user.name}
              onSelectPage={setActivePage}
              onSelectOpportunity={onSelectOpportunity}
              onSimulateEmailAnalysis={handleSimulateEmailAnalysis}
            />
          )}

          {activePage === 'email-intelligence' && (
            <EmailIntelligenceView
              userName={user.name}
              onSelectOpportunity={onSelectOpportunity}
              onSimulateForward={handleSimulateEmailAnalysis}
            />
          )}

          {activePage === 'opportunities' && (
            <OpportunitiesRadarView onSelectOpportunity={onSelectOpportunity} />
          )}

          {activePage === 'preparation-hub' && <PreparationHubView />}

          {activePage === 'calendar' && <CalendarView />}

          {activePage === 'whatsapp' && <WhatsAppView userName={user.name} />}

          {activePage === 'notifications' && (
            <NotificationsView onSelectPage={setActivePage} />
          )}

          {activePage === 'ai-assistant' && <AIAssistantView userName={user.name} />}

          {activePage === 'profile' && <StudentProfileView user={user} />}

          {activePage === 'settings' && <SettingsView />}
        </main>

        {/* Dashboard Footer */}
        <footer className="w-full py-6 text-center text-xs text-slate-500 border-t border-white/5 mt-12">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>&copy; {new Date().getFullYear()} PrepPilot — The Opportunity Preparation Copilot</span>
            <div className="flex items-center gap-4 text-slate-400">
              <button
                onClick={onViewLandingPage}
                className="hover:text-white transition-colors"
              >
                Public Landing Page
              </button>
              <span>•</span>
              <button
                onClick={() => setActivePage('ai-assistant')}
                className="hover:text-white transition-colors"
              >
                Ask PrepPilot AI
              </button>
              <span>•</span>
              <button
                onClick={onSignOut}
                className="hover:text-rose-400 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
