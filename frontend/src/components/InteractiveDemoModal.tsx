import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Code2, 
  BrainCircuit, 
  Calendar, 
  Check, 
  Briefcase,
  Mail,
  User,
  Lock
} from 'lucide-react';
import { Opportunity } from '../data/mockOpportunities';

interface InteractiveDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'get-started' | 'how-it-works' | 'opportunity-detail' | 'sign-in';
  selectedOpportunity?: Opportunity | null;
}

export const InteractiveDemoModal: React.FC<InteractiveDemoModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'get-started',
  selectedOpportunity,
}) => {
  if (!isOpen) return null;

  // State for interactive simulator
  const [degree, setDegree] = useState('B.Tech Computer Science');
  const [cgpa, setCgpa] = useState('8.5');
  const [targetRole, setTargetRole] = useState('Google STEP / SWE Intern');
  const [skills, setSkills] = useState('C++, Python, React, Data Structures');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  // State for Sign In demo
  const [studentEmail, setStudentEmail] = useState('alex.chen@university.edu');
  const [signInSuccess, setSignInSuccess] = useState(false);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzed(true);
    }, 600);
  };

  const handleDemoSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. Opportunity Detail Mode */}
        {selectedOpportunity ? (
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  {selectedOpportunity.company}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {selectedOpportunity.matchScore}% Match
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {selectedOpportunity.title}
              </h3>
              <p className="text-xs text-slate-400">
                {selectedOpportunity.location} • {selectedOpportunity.stipendOrPrize}
              </p>
            </div>

            {/* AI Eligibility Audit */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5 text-indigo-400">
                  <ShieldCheck className="w-4 h-4" />
                  Eligibility AI Verification
                </span>
                <span className="text-emerald-400 font-semibold">Criteria Passed</span>
              </div>
              <div className="space-y-2">
                {selectedOpportunity.eligibilityCriteria.map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="text-slate-300 font-medium">{c.label}</span>
                    <span className="text-slate-400">{c.detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 30-Day Sprint Details */}
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span className="flex items-center gap-1.5 text-indigo-300">
                  <Calendar className="w-4 h-4" />
                  Sprint Plan: Day {selectedOpportunity.roadmapSnapshot.day} of {selectedOpportunity.roadmapSnapshot.totalDays}
                </span>
                <span className="text-indigo-400">
                  {selectedOpportunity.roadmapSnapshot.tasksRemaining} tasks remaining
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 text-xs text-slate-300">
                <div className="font-semibold text-white mb-1">Active High-Priority Sprint Task:</div>
                {selectedOpportunity.roadmapSnapshot.activeTask}
              </div>
            </div>

            {enrolled ? (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Roadmap activated! Your daily tasks are now queued on your dashboard.</span>
              </div>
            ) : (
              <button
                onClick={() => setEnrolled(true)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 font-bold text-white shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform"
              >
                <Sparkles className="w-4 h-4" />
                <span>Enroll In This Preparation Roadmap</span>
              </button>
            )}
          </div>
        ) : initialMode === 'sign-in' ? (
          /* 2. Demo Sign In Mode */
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                <User className="w-3.5 h-3.5" />
                Student Portal Access
              </div>
              <h3 className="text-2xl font-black text-white">
                Sign In to PrepPilot
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Access your synchronized email opportunities, skill gap diagnostics, and active preparation sprints.
              </p>
            </div>

            {signInSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-lg font-bold text-white">Welcome back, Alex Chen!</h4>
                <p className="text-xs text-emerald-200">
                  Signed in with university SSO. Loading your customized student roadmap...
                </p>
              </div>
            ) : (
              <form onSubmit={handleDemoSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    College (.edu) or Student Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200">
                  <span className="font-semibold text-white block mb-1">Hackathon Demo Access:</span>
                  Click below to log in as demo student <strong className="text-white">Alex Chen (3rd Yr CS)</strong> with pre-populated Google STEP, Microsoft, and ETHGlobal roadmaps.
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 font-bold text-white text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 hover:scale-[1.01] transition-all"
                >
                  <span>Sign In with Demo Student Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        ) : (
          /* 3. Interactive Student Prep Simulator */
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Live Demo Simulator
              </div>
              <h3 className="text-2xl font-black text-white">
                Experience PrepPilot AI in Action
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Enter your student details to run an instant eligibility audit and generate a customized roadmap snapshot.
              </p>
            </div>

            <form onSubmit={handleSimulate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Current Degree / Major
                  </label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cumulative GPA / CGPA
                  </label>
                  <input
                    type="text"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Role / Opportunity
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Known Skills & Technologies
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={analyzing}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                {analyzing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Analyzing Criteria & Mapping Skills...</span>
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-4 h-4" />
                    <span>Run AI Eligibility & Prep Diagnostic</span>
                  </>
                )}
              </button>
            </form>

            {/* Diagnostic Output Results */}
            {analyzed && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <span className="text-xs text-slate-400">Diagnostic Verdict:</span>
                    <h4 className="text-base font-bold text-white">
                      Target: {targetRole}
                    </h4>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    94% Eligible • High Match
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                    <span className="text-slate-300">CGPA Verification:</span>
                    <span className="text-emerald-400 font-semibold">{cgpa} exceeds minimum cutoff</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                    <span className="text-slate-300">Recommended 30-Day Sprint:</span>
                    <span className="text-indigo-400 font-semibold">Focus on Dynamic Programming & Tree Traversal</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                    <span className="text-slate-300">WhatsApp Morning Tasks:</span>
                    <span className="text-emerald-400 font-semibold">Enabled for candidate</span>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors"
                >
                  Done • Back to Landing Page
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
