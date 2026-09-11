import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TestModeProvider, useTestMode } from './context/TestModeContext';
import { Opportunity } from './types';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { OpportunityDetail } from './components/opportunities/OpportunityDetail';
import { MockTestRunner } from './components/mock-test/MockTestRunner';
import { MockTestSetup } from './components/mock-test/MockTestSetup';
import { MockInterviewSimulator } from './components/mock-interview/MockInterviewSimulator';
import { CareerCalendar } from './components/calendar/CareerCalendar';
import { WhatsAppCenter } from './components/whatsapp/WhatsAppCenter';
import { EmailIntelligenceView } from './components/gmail/EmailIntelligenceView';
import { GmailConnectModal } from './components/gmail/GmailConnectModal';
import { AiCareerAssistant } from './components/assistant/AiCareerAssistant';
import { ProfileView } from './components/profile/ProfileView';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { Sparkles, Mail, CheckCircle2, ShieldCheck } from 'lucide-react';
import { MockTest } from './types';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { isTestFullscreen } = useTestMode();
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showGmailModal, setShowGmailModal] = useState(false);
  const [readyMockTest, setReadyMockTest] = useState<{ test: MockTest; stream: MediaStream | null } | null>(null);
  const [oauthMessage, setOauthMessage] = useState<string | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('gmail_connected') === 'true') {
      setOauthMessage('Gmail connected successfully! Your recruitment emails and opportunities are synced.');
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => setOauthMessage(null), 6000);
    } else if (params.get('gmail_error')) {
      setOauthMessage(`Gmail connection issue: ${params.get('gmail_error')}`);
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => setOauthMessage(null), 6000);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-sm font-bold text-slate-800">Initializing PrepPilot AI Engine...</h2>
        <p className="text-xs text-slate-500 mt-1">Connecting to opportunity intelligence services</p>
      </div>
    );
  }

  // If user is not authenticated yet or email not verified
  if (!user || !user.isEmailVerified) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-md mx-auto w-full">
          <AuthModal />
        </div>

        <footer className="text-center text-xs text-slate-400 mt-8">
          PrepPilot AI • Intelligent Career Copilot for University Students
        </footer>
      </div>
    );
  }

  // If user is authenticated but hasn't finished onboarding
  if (!user.isOnboarded) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Welcome to PrepPilot, {user.name}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Let's tailor your career copilot to your university, skills, and dream company goals.
            </p>
          </div>
          <OnboardingFlow onComplete={() => setCurrentView('dashboard')} />
        </div>
      </div>
    );
  }

  // Handler helpers
  const handleViewOpportunity = (opp: Opportunity) => {
    setSelectedOpportunity(opp);
    setCurrentView('opportunity-detail');
  };

  const handleStartMockTest = (opp?: Opportunity) => {
    if (opp) setSelectedOpportunity(opp);
    setReadyMockTest(null);
    setCurrentView('mock-tests');
  };

  const handleStartMockInterview = (opp?: Opportunity) => {
    if (opp) setSelectedOpportunity(opp);
    setCurrentView('mock-interview');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans antialiased">
      {/* Sidebar navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => {
          if (view !== 'opportunity-detail') {
            setSelectedOpportunity(null);
          }
          setCurrentView(view);
        }}
        isOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area — no reserved sidebar space while a proctored
          test has hidden the sidebar via isTestFullscreen. */}
      <div className={`flex-1 flex flex-col min-w-0 ${isTestFullscreen ? '' : 'lg:pl-64'}`}>
        <Header
          currentView={currentView}
          onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onNavigate={(view) => setCurrentView(view)}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {oauthMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between gap-3 animate-fade-in shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{oauthMessage}</span>
              </div>
              <button
                onClick={() => setOauthMessage(null)}
                className="text-emerald-700 hover:text-emerald-900 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Dashboard View */}
          {currentView === 'dashboard' && (
            <OverviewDashboard
              onSelectOpportunity={handleViewOpportunity}
              onPrepareOpportunity={handleViewOpportunity}
              onStartGeneralMockTest={() => handleStartMockTest()}
              onStartGeneralMockInterview={() => handleStartMockInterview()}
              onOpenGmailConnect={() => setShowGmailModal(true)}
            />
          )}

          {/* Opportunities List View */}
          {currentView === 'opportunities' && (
            <OverviewDashboard
              onSelectOpportunity={handleViewOpportunity}
              onPrepareOpportunity={handleViewOpportunity}
              onStartGeneralMockTest={() => handleStartMockTest()}
              onStartGeneralMockInterview={() => handleStartMockInterview()}
              onOpenGmailConnect={() => setShowGmailModal(true)}
            />
          )}

          {/* Opportunity Detail View */}
          {currentView === 'opportunity-detail' && selectedOpportunity && (
            <OpportunityDetail
              opportunity={selectedOpportunity}
              onBack={() => setCurrentView('dashboard')}
              onStartMockTest={(opp) => handleStartMockTest(opp)}
              onStartMockInterview={(opp) => handleStartMockInterview(opp)}
            />
          )}

          {/* Mock Test Runner */}
          {currentView === 'mock-tests' && (
            readyMockTest ? (
              <MockTestRunner
                test={readyMockTest.test}
                cameraStream={readyMockTest.stream}
                onExit={() => { setReadyMockTest(null); setCurrentView('dashboard'); }}
                onPracticeWeakAreas={() => setCurrentView('assistant')}
              />
            ) : (
              <MockTestSetup
                onReady={(test: MockTest, stream: MediaStream | null) => setReadyMockTest({ test, stream })}
                onCancel={() => setCurrentView('dashboard')}
              />
            )
          )}

          {/* Mock Interview Simulator */}
          {currentView === 'mock-interview' && (
            <MockInterviewSimulator
              opportunity={selectedOpportunity || undefined}
              onExit={() => setCurrentView('dashboard')}
            />
          )}

          {/* Career Calendar */}
          {currentView === 'calendar' && (
            <CareerCalendar
              opportunities={[]}
              onSelectOpportunity={handleViewOpportunity}
              onTakeMockTest={(opp) => handleStartMockTest(opp)}
            />
          )}

          {/* WhatsApp Alert Center */}
          {currentView === 'whatsapp' && <WhatsAppCenter />}

          {/* Email Intelligence & Scanned Inbox */}
          {currentView === 'email-intelligence' && (
            <div className="space-y-6">
              <GmailConnectModal onScanComplete={() => setCurrentView('dashboard')} />
              <EmailIntelligenceView onViewOpportunity={handleViewOpportunity} />
            </div>
          )}

          {/* AI Career Assistant */}
          {currentView === 'assistant' && <AiCareerAssistant />}

          {/* Student Profile View */}
          {currentView === 'profile' && <ProfileView />}
        </main>
      </div>

      {/* Optional Gmail Connect Modal Popup */}
      {showGmailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setShowGmailModal(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <GmailConnectModal
              onClose={() => setShowGmailModal(false)}
              onScanComplete={() => setShowGmailModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <TestModeProvider>
        <AppContent />
      </TestModeProvider>
    </AuthProvider>
  );
}