import React, { useState } from 'react';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { OnboardingPage } from './components/onboarding/OnboardingPage';
import { StudentDashboard } from './components/dashboard/StudentDashboard';

// Landing Page Components
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { OpportunityShowcase } from './components/OpportunityShowcase';
import { Comparison } from './components/Comparison';
import { Testimonials } from './components/Testimonials';
import { CtaSection } from './components/CtaSection';
import { Footer } from './components/Footer';
import { InteractiveDemoModal } from './components/InteractiveDemoModal';
import { Opportunity } from './data/mockOpportunities';

export interface UserSession {
  name: string;
  email: string;
  university?: string;
  degree?: string;
  branch?: string;
  graduationYear?: string;
  currentYear?: string;
  semester?: string;
  careerGoal?: string;
  customCareerGoal?: string;
  skills?: string[];
  preferredOpportunities?: string[];
  preferredRoles?: string[];
  cgpa?: string;
  selectedTracks?: string[];
  phone?: string;
  enableWhatsApp?: boolean;
}

const getDefaultUser = (): UserSession => {
  const defaultUser: UserSession = {
    name: 'Alex Chen',
    email: 'alex.chen@university.edu',
    university: 'University Institute of Technology',
    degree: 'B.Tech',
    branch: 'Computer Science & Engineering',
    graduationYear: '2026',
    currentYear: '3rd Year',
    semester: 'Semester 6',
    careerGoal: 'Software Development',
    skills: ['Python', 'JavaScript', 'React', 'DSA', 'SQL', 'Git'],
    preferredOpportunities: ['Internships', 'Hackathons', 'Placements'],
    preferredRoles: ['SDE Intern', 'Full Stack Developer'],
    cgpa: '8.4',
  };

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('preppilot_student_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultUser,
          ...parsed,
          name: parsed.name || defaultUser.name,
        };
      }
    } catch {
      // Ignore parse errors
    }
  }
  return defaultUser;
};

export default function App() {
  // Resolve initial view from URL path
  const getInitialView = (): 'login' | 'signup' | 'forgot-password' | 'onboarding' | 'dashboard' | 'landing' => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/signup') return 'signup';
      if (path === '/forgot-password') return 'forgot-password';
      if (path === '/dashboard') return 'dashboard';
      if (path === '/onboarding') return 'onboarding';
      if (path === '/landing') return 'landing';
    }
    return 'login';
  };

  // Application starts with Login as the default first screen as strictly requested
  const [currentView, setCurrentView] = useState<
    'login' | 'signup' | 'forgot-password' | 'onboarding' | 'dashboard' | 'landing'
  >(getInitialView);

  // Synchronize browser history and path changes
  const navigate = (path: string) => {
    let view: 'login' | 'signup' | 'forgot-password' | 'onboarding' | 'dashboard' | 'landing' = 'login';
    if (path === '/signup') view = 'signup';
    else if (path === '/forgot-password') view = 'forgot-password';
    else if (path === '/dashboard') view = 'dashboard';
    else if (path === '/onboarding') view = 'onboarding';
    else if (path === '/landing') view = 'landing';
    else view = 'login';

    setCurrentView(view);
    try {
      if (window.location.pathname !== path) {
        window.history.pushState({}, '', path);
      }
    } catch {
      // Safe fallback if history API is restricted in sandboxed iframes
    }
  };

  // Listen to popstate (back/forward browser buttons)
  React.useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/signup') setCurrentView('signup');
      else if (path === '/forgot-password') setCurrentView('forgot-password');
      else if (path === '/dashboard') setCurrentView('dashboard');
      else if (path === '/onboarding') setCurrentView('onboarding');
      else if (path === '/landing') setCurrentView('landing');
      else setCurrentView('login');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [currentUser, setCurrentUser] = useState<UserSession>(getDefaultUser);

  // Modal state for opportunity drilldowns and demo interactions
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'get-started' | 'how-it-works' | 'opportunity-detail' | 'sign-in'>('get-started');
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

  // Authentication Handlers
  const handleLoginSuccess = (user: { name: string; email: string }) => {
    setCurrentUser((prev) => ({
      ...prev,
      name: user.name,
      email: user.email,
    }));
    // Successful login navigates to Dashboard
    navigate('/dashboard');
  };

  const handleSignupSuccess = (user: { name: string; email: string }) => {
    setCurrentUser((prev) => ({
      ...prev,
      name: user.name,
      email: user.email,
    }));
    // Successful signup navigates to Onboarding
    navigate('/onboarding');
  };

  const handleOnboardingComplete = (onboardingData: any) => {
    setCurrentUser((prev) => ({
      ...prev,
      ...onboardingData,
    }));
    // Completing onboarding navigates to Dashboard
    navigate('/dashboard');
  };

  const handleSignOut = () => {
    navigate('/');
  };

  const handleOpenDemoFromLanding = (mode: 'get-started' | 'how-it-works' | 'sign-in' = 'get-started') => {
    if (mode === 'sign-in') {
      navigate('/');
      return;
    }
    if (mode === 'get-started') {
      navigate('/signup');
      return;
    }
    setSelectedOpp(null);
    setModalMode(mode);
    setModalOpen(true);
  };

  const handleSelectOpportunity = (opp: Opportunity) => {
    setSelectedOpp(opp);
    setModalMode('opportunity-detail');
    setModalOpen(true);
  };

  // 1. LOGIN SCREEN (Default "/")
  if (currentView === 'login') {
    return (
      <LoginPage
        onNavigateToSignup={() => navigate('/signup')}
        onNavigateToForgotPassword={() => navigate('/forgot-password')}
        onLoginSuccess={handleLoginSuccess}
        onViewLandingPage={() => navigate('/landing')}
      />
    );
  }

  // 2. SIGNUP SCREEN (/signup)
  if (currentView === 'signup') {
    return (
      <SignupPage
        onNavigateToLogin={() => navigate('/')}
        onSignupSuccess={handleSignupSuccess}
        onViewLandingPage={() => navigate('/landing')}
      />
    );
  }

  // 3. FORGOT PASSWORD SCREEN (/forgot-password)
  if (currentView === 'forgot-password') {
    return (
      <ForgotPasswordPage
        onNavigateToLogin={() => navigate('/')}
      />
    );
  }

  // 4. ONBOARDING SCREEN (After Signup / /onboarding)
  if (currentView === 'onboarding') {
    return (
      <OnboardingPage
        user={currentUser}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  // 5. STUDENT DASHBOARD (After Login or Onboarding)
  if (currentView === 'dashboard') {
    return (
      <>
        <StudentDashboard
          user={currentUser}
          onSignOut={handleSignOut}
          onViewLandingPage={() => navigate('/landing')}
          onSelectOpportunity={handleSelectOpportunity}
        />
        <InteractiveDemoModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          initialMode={modalMode}
          selectedOpportunity={selectedOpp}
        />
      </>
    );
  }

  // 6. LANDING PAGE (Accessible on demand via top nav or links)
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden font-sans">
      {/* Global Background Ambient Glows ("Elegant Dark" theme) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/15 rounded-full blur-[160px]"></div>
        <div className="absolute top-[35%] right-[-10%] w-[45%] h-[45%] bg-violet-600/12 rounded-full blur-[160px]"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[140px]"></div>
      </div>

      {/* Floating Shortcut to Return to Login / Dashboard */}
      <div className="sticky top-0 z-50 bg-indigo-950/80 border-b border-indigo-500/30 backdrop-blur-md px-4 py-2 text-center text-xs flex items-center justify-between max-w-7xl mx-auto rounded-b-2xl shadow-lg">
        <span className="text-indigo-200 font-medium">
          Viewing Public Landing Page
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition-all"
          >
            Go to Sign In
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] transition-all"
          >
            Create Account
          </button>
        </div>
      </div>

      {/* Navigation Header */}
      <Navbar onOpenDemo={handleOpenDemoFromLanding} />

      <main className="relative z-10">
        {/* Hero with Headline, Subhead, CTAs & Live Interactive Dashboard Mockup */}
        <Hero
          onOpenDemo={handleOpenDemoFromLanding}
          onOpenActionPlan={handleSelectOpportunity}
        />

        {/* Core Features: 6 Pillars of Career Intelligence */}
        <Features />

        {/* 5-Step How It Works Interactive Architecture */}
        <HowItWorks />

        {/* Live Opportunity Radar: Internships, Hackathons, Placements, Scholarships */}
        <OpportunityShowcase onSelectOpportunity={handleSelectOpportunity} />

        {/* Old Way vs. The PrepPilot Way Comparison */}
        <Comparison />

        {/* Student Testimonials & Outcomes */}
        <Testimonials />

        {/* High-Impact Final Call to Action */}
        <CtaSection onOpenDemo={handleOpenDemoFromLanding} />
      </main>

      {/* Comprehensive Footer */}
      <Footer />

      {/* Interactive Modal for Live Hackathon Demonstration */}
      <InteractiveDemoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialMode={modalMode}
        selectedOpportunity={selectedOpp}
      />
    </div>
  );
}
