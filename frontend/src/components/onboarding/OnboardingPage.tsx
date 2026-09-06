import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  GraduationCap, 
  Target, 
  Check, 
  Briefcase, 
  Code2, 
  Cpu, 
  ShieldCheck, 
  Cloud, 
  Compass, 
  BarChart3, 
  Plus, 
  X, 
  Layers, 
  Award, 
  Edit3, 
  User, 
  Building2, 
  BookOpen, 
  Calendar, 
  Trophy, 
  Laptop
} from 'lucide-react';

export interface OnboardingData {
  name: string;
  university: string;
  degree: string;
  branch: string;
  graduationYear: string;
  currentYear: string;
  semester: string;
  careerGoal: string;
  customCareerGoal?: string;
  skills: string[];
  preferredOpportunities: string[];
  preferredRoles: string[];
}

interface OnboardingPageProps {
  user: { name: string; email: string };
  onComplete: (data: OnboardingData) => void;
}

const COMMON_SKILLS = [
  'Python',
  'Java',
  'C++',
  'JavaScript',
  'React',
  'SQL',
  'DBMS',
  'OOP',
  'DSA',
  'Machine Learning',
  'AI',
  'Cloud',
  'Git',
  'TypeScript',
  'Node.js',
  'System Design',
  'Docker',
];

const CAREER_GOALS = [
  { id: 'Software Development', label: 'Software Development', icon: Code2, desc: 'Full Stack, Frontend, Backend & Mobile Apps' },
  { id: 'Data Science', label: 'Data Science', icon: BarChart3, desc: 'Analytics, Data Pipelines & Statistical Modeling' },
  { id: 'AI / ML', label: 'AI / ML', icon: Cpu, desc: 'Generative AI, Deep Learning & LLMs' },
  { id: 'Cybersecurity', label: 'Cybersecurity', icon: ShieldCheck, desc: 'Security Audits, AppSec & Threat Defense' },
  { id: 'Cloud / DevOps', label: 'Cloud / DevOps', icon: Cloud, desc: 'AWS, GCP, Kubernetes & Infrastructure' },
  { id: 'Other', label: 'Other', icon: Compass, desc: 'Product, QA, Research or Hybrid Tech' },
];

const OPPORTUNITY_TYPES = [
  { id: 'Internships', label: 'Internships', desc: 'Summer, off-cycle, & remote tech internships', icon: Briefcase },
  { id: 'Placements', label: 'Placements', desc: 'Full-time campus drives & new grad off-campus roles', icon: Award },
  { id: 'Hackathons', label: 'Hackathons', desc: 'Global hackathons, prize pools & fast-track interviews', icon: Trophy },
  { id: 'Scholarships', label: 'Scholarships', desc: 'Merit-based, diversity & research tech grants', icon: GraduationCap },
  { id: 'Coding Contests', label: 'Coding Contests', desc: 'Competitive programming challenges & hiring rounds', icon: Code2 },
];

const SUGGESTED_ROLES = [
  'SDE Intern',
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Developer',
  'AI/ML Engineer',
  'Data Analyst Intern',
  'DevOps Engineer',
  'Mobile App Developer',
];

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ user, onComplete }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // STEP 1 — Personal Details
  const [fullName, setFullName] = useState(user.name || 'Alex Chen');
  const [university, setUniversity] = useState('University Institute of Technology');
  const [degree, setDegree] = useState('B.Tech');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [graduationYear, setGraduationYear] = useState('2026');

  // STEP 2 — Current Status
  const [currentYear, setCurrentYear] = useState('3rd Year');
  const [semester, setSemester] = useState('Semester 6');
  const [careerGoal, setCareerGoal] = useState('Software Development');
  const [customCareerGoal, setCustomCareerGoal] = useState('');

  // STEP 3 — Skills
  const [skills, setSkills] = useState<string[]>([
    'Python',
    'JavaScript',
    'React',
    'DSA',
    'SQL',
    'Git',
  ]);
  const [customSkillInput, setCustomSkillInput] = useState('');

  // STEP 4 — Opportunity Preferences
  const [preferredOpportunities, setPreferredOpportunities] = useState<string[]>([
    'Internships',
    'Hackathons',
    'Placements',
  ]);
  const [preferredRoles, setPreferredRoles] = useState<string[]>([
    'SDE Intern',
    'Full Stack Developer',
  ]);
  const [customRoleInput, setCustomRoleInput] = useState('');

  // UI States
  const [validationError, setValidationError] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);

  // Load from local storage on initial mount if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('preppilot_student_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) setFullName(parsed.name);
        if (parsed.university) setUniversity(parsed.university);
        if (parsed.degree) setDegree(parsed.degree);
        if (parsed.branch) setBranch(parsed.branch);
        if (parsed.graduationYear) setGraduationYear(parsed.graduationYear);
        if (parsed.currentYear) setCurrentYear(parsed.currentYear);
        if (parsed.semester) setSemester(parsed.semester);
        if (parsed.careerGoal) setCareerGoal(parsed.careerGoal);
        if (parsed.customCareerGoal) setCustomCareerGoal(parsed.customCareerGoal);
        if (Array.isArray(parsed.skills) && parsed.skills.length > 0) setSkills(parsed.skills);
        if (Array.isArray(parsed.preferredOpportunities) && parsed.preferredOpportunities.length > 0) {
          setPreferredOpportunities(parsed.preferredOpportunities);
        }
        if (Array.isArray(parsed.preferredRoles) && parsed.preferredRoles.length > 0) {
          setPreferredRoles(parsed.preferredRoles);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save progress locally
  const saveProgressToLocal = () => {
    try {
      const profile = {
        name: fullName,
        university,
        degree,
        branch,
        graduationYear,
        currentYear,
        semester,
        careerGoal,
        customCareerGoal,
        skills,
        preferredOpportunities,
        preferredRoles,
      };
      localStorage.setItem('preppilot_student_profile', JSON.stringify(profile));
    } catch {
      // Ignore storage errors
    }
  };

  // Step Validation & Navigation
  const validateAndProceed = (nextStep: 1 | 2 | 3 | 4 | 5) => {
    setValidationError('');

    if (currentStep === 1) {
      if (!fullName.trim()) {
        setValidationError('Please enter your full name.');
        return;
      }
      if (!university.trim()) {
        setValidationError('Please enter your college or university name.');
        return;
      }
      if (!degree.trim()) {
        setValidationError('Please select or enter your degree.');
        return;
      }
      if (!branch.trim()) {
        setValidationError('Please enter your branch or specialization.');
        return;
      }
      if (!graduationYear.trim()) {
        setValidationError('Please specify your graduation year.');
        return;
      }
    } else if (currentStep === 2) {
      if (!currentYear) {
        setValidationError('Please select your current year of study.');
        return;
      }
      if (!semester) {
        setValidationError('Please select your current semester.');
        return;
      }
      if (!careerGoal) {
        setValidationError('Please select your preferred career goal.');
        return;
      }
      if (careerGoal === 'Other' && !customCareerGoal.trim()) {
        setValidationError('Please specify your custom career goal.');
        return;
      }
    } else if (currentStep === 3) {
      if (skills.length === 0) {
        setValidationError('Please select or add at least 1 technical skill.');
        return;
      }
    } else if (currentStep === 4) {
      if (preferredOpportunities.length === 0) {
        setValidationError('Please select at least 1 opportunity type to monitor.');
        return;
      }
      if (preferredRoles.length === 0) {
        setValidationError('Please select or add at least 1 preferred job/internship role.');
        return;
      }
    }

    saveProgressToLocal();
    setCurrentStep(nextStep);
  };

  // Skill Management
  const toggleSkill = (skill: string) => {
    setValidationError('');
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleAddCustomSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (!trimmed) return;
    if (!skills.map((s) => s.toLowerCase()).includes(trimmed.toLowerCase())) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setCustomSkillInput('');
    setValidationError('');
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  // Opportunity & Role Management
  const toggleOpportunity = (opp: string) => {
    setValidationError('');
    setPreferredOpportunities((prev) =>
      prev.includes(opp) ? prev.filter((o) => o !== opp) : [...prev, opp]
    );
  };

  const toggleRole = (role: string) => {
    setValidationError('');
    setPreferredRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleAddCustomRole = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customRoleInput.trim();
    if (!trimmed) return;
    if (!preferredRoles.map((r) => r.toLowerCase()).includes(trimmed.toLowerCase())) {
      setPreferredRoles((prev) => [...prev, trimmed]);
    }
    setCustomRoleInput('');
    setValidationError('');
  };

  const removeRole = (roleToRemove: string) => {
    setPreferredRoles((prev) => prev.filter((r) => r !== roleToRemove));
  };

  // Final Setup Completion
  const handleCompleteSetup = () => {
    setIsFinishing(true);
    saveProgressToLocal();
    setTimeout(() => {
      onComplete({
        name: fullName,
        university,
        degree,
        branch,
        graduationYear,
        currentYear,
        semester,
        careerGoal: careerGoal === 'Other' && customCareerGoal ? customCareerGoal : careerGoal,
        customCareerGoal,
        skills,
        preferredOpportunities,
        preferredRoles,
      });
    }, 800);
  };

  const stepLabels = [
    'Personal Details',
    'Current Status',
    'Skills Matrix',
    'Preferences',
    'Confirmation',
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Ambient Lighting (Consistent with Elegant Dark AI SaaS) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/15 rounded-full blur-[160px]"></div>
        <div className="absolute top-[35%] right-[-10%] w-[45%] h-[45%] bg-violet-600/12 rounded-full blur-[160px]"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[140px]"></div>
      </div>

      {/* Top Application Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between max-w-5xl mx-auto z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 p-0.5 shadow-lg shadow-indigo-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[9px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <span className="text-lg font-black tracking-tight text-white">
            Prep<span className="text-indigo-400">Pilot</span>
          </span>
          <span className="hidden sm:inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 ml-1">
            Student Setup
          </span>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">
            Step <strong className="text-white">{currentStep}</strong> of 5
          </span>
          <div className="flex gap-1.5 items-center">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => {
                  if (s < currentStep) setCurrentStep(s as any);
                }}
                disabled={s > currentStep}
                title={`Jump to ${stepLabels[s - 1]}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentStep === s
                    ? 'w-7 bg-indigo-500 shadow-sm shadow-indigo-500/50'
                    : currentStep > s
                    ? 'w-3.5 bg-emerald-400 hover:bg-emerald-300 cursor-pointer'
                    : 'w-2 bg-slate-800 cursor-not-allowed'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-6 z-10">
        <div className="w-full max-w-2xl">
          {/* Glass Card */}
          <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl relative overflow-hidden transition-all duration-300">
            {/* Ambient inner glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

            {/* Validation Banner */}
            {validationError && (
              <div className="mb-6 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                <div className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></div>
                <span className="font-medium">{validationError}</span>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 1: PERSONAL DETAILS */}
            {/* ========================================================================= */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                    <User className="w-4 h-4" />
                    <span>Step 1 of 5 • Personal Profile</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Tell us about yourself
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    We use your college and graduation timeline to match eligible opportunities and placement cutoffs.
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Full Name</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setValidationError('');
                      }}
                      placeholder="e.g. Alex Chen"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                    />
                  </div>

                  {/* College / University */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>College / University</span>
                    </label>
                    <input
                      type="text"
                      value={university}
                      onChange={(e) => {
                        setUniversity(e.target.value);
                        setValidationError('');
                      }}
                      placeholder="e.g. University Institute of Technology / Stanford"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                    />
                  </div>

                  {/* Degree & Branch Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Degree</span>
                      </label>
                      <select
                        value={degree}
                        onChange={(e) => setDegree(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                      >
                        <option value="B.Tech">B.Tech / B.E.</option>
                        <option value="B.S.">B.S. / B.Sc.</option>
                        <option value="BCA">BCA</option>
                        <option value="M.Tech">M.Tech / M.E.</option>
                        <option value="M.S.">M.S. / M.Sc.</option>
                        <option value="MCA">MCA</option>
                        <option value="Dual Degree">Dual Degree (B.Tech + M.Tech)</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Branch / Specialization</span>
                      </label>
                      <input
                        type="text"
                        value={branch}
                        onChange={(e) => {
                          setBranch(e.target.value);
                          setValidationError('');
                        }}
                        placeholder="e.g. Computer Science & Engineering"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                      />
                    </div>
                  </div>

                  {/* Graduation Year */}
                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Expected Graduation Year</span>
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {['2025', '2026', '2027', '2028', '2029'].map((yr) => (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => setGraduationYear(yr)}
                          className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                            graduationYear === yr
                              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30 scale-[1.02]'
                              : 'bg-slate-950/50 text-slate-300 border-white/10 hover:border-white/20'
                          }`}
                        >
                          {yr}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => validateAndProceed(2)}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Continue to Current Status</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 2: CURRENT STATUS */}
            {/* ========================================================================= */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                    <Target className="w-4 h-4" />
                    <span>Step 2 of 5 • Current Standing</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Where are you right now?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Your current semester determines whether to prioritize immediate recruitment sprints or skill-building roadmaps.
                  </p>
                </div>

                <div className="space-y-5 pt-1">
                  {/* Current Year */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Current Academic Year</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((yr) => (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => setCurrentYear(yr)}
                          className={`p-3 rounded-xl text-xs font-bold border transition-all text-center ${
                            currentYear === yr
                              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                              : 'bg-slate-950/50 text-slate-300 border-white/10 hover:border-white/20'
                          }`}
                        >
                          {yr}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Current Semester */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Current Semester</label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'].map((sem) => (
                        <button
                          key={sem}
                          type="button"
                          onClick={() => setSemester(sem)}
                          className={`py-2 rounded-lg text-xs font-bold border transition-all text-center ${
                            semester === sem
                              ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                              : 'bg-slate-950/50 text-slate-400 border-white/10 hover:border-white/20'
                          }`}
                        >
                          {sem}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preferred Career Goal */}
                  <div className="space-y-2.5 pt-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Preferred Career Goal</span>
                      <span className="text-[11px] text-indigo-400 font-normal">Select your primary direction</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {CAREER_GOALS.map((goal) => {
                        const Icon = goal.icon;
                        const isSelected = careerGoal === goal.id;
                        return (
                          <div
                            key={goal.id}
                            onClick={() => {
                              setCareerGoal(goal.id);
                              setValidationError('');
                            }}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                              isSelected
                                ? 'bg-indigo-950/60 border-indigo-400 shadow-md shadow-indigo-500/10'
                                : 'bg-slate-950/40 border-white/10 hover:border-white/20'
                            }`}
                          >
                            <div
                              className={`p-2 rounded-xl shrink-0 ${
                                isSelected ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="space-y-0.5">
                              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>{goal.label}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                              </div>
                              <p className="text-[11px] text-slate-400 leading-tight">
                                {goal.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Custom goal input if "Other" is picked */}
                    {careerGoal === 'Other' && (
                      <div className="pt-2 animate-in fade-in duration-200">
                        <input
                          type="text"
                          value={customCareerGoal}
                          onChange={(e) => setCustomCareerGoal(e.target.value)}
                          placeholder="Specify your career aspiration (e.g., Quantum Computing, Robotics, FinTech)..."
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-indigo-500/40 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 text-xs"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-5 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 font-semibold text-xs transition-all flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => validateAndProceed(3)}
                    className="px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2"
                  >
                    <span>Continue to Skills</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 3: SKILLS MATRIX */}
            {/* ========================================================================= */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                    <Code2 className="w-4 h-4" />
                    <span>Step 3 of 5 • Technical Skills</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Select & add your skills
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    PrepPilot's engine scans job descriptions and compares required technologies directly against your skills.
                  </p>
                </div>

                <div className="space-y-5 pt-1">
                  {/* Selected Skills Badges */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">
                        Your Selected Skills ({skills.length})
                      </span>
                      <span className="text-[11px] text-slate-500">Click &times; to remove</span>
                    </div>

                    <div className="min-h-[56px] p-3 rounded-2xl bg-slate-950/70 border border-white/10 flex flex-wrap gap-2 items-center">
                      {skills.length === 0 ? (
                        <span className="text-xs text-slate-500 italic">
                          No skills selected yet. Click the chips below or type to add.
                        </span>
                      ) : (
                        skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-200 text-xs font-semibold group animate-in fade-in"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="text-indigo-400 hover:text-rose-400 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Add Custom Skill Form */}
                  <form onSubmit={handleAddCustomSkill} className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Add Custom Skill</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customSkillInput}
                        onChange={(e) => setCustomSkillInput(e.target.value)}
                        placeholder="e.g. Next.js, Rust, Kubernetes, TensorFlow, Flutter..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddCustomSkill()}
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </form>

                  {/* Quick Select Common Skills */}
                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Popular Technical Skills (Click to Toggle)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_SKILLS.map((skill) => {
                        const isSelected = skills.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm shadow-indigo-600/30'
                                : 'bg-slate-950/50 text-slate-400 border-white/10 hover:border-white/25 hover:text-white'
                            }`}
                          >
                            <span>{skill}</span>
                            {isSelected ? (
                              <Check className="w-3 h-3 text-white" />
                            ) : (
                              <Plus className="w-3 h-3 text-slate-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-5 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 font-semibold text-xs transition-all flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => validateAndProceed(4)}
                    className="px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2"
                  >
                    <span>Continue to Preferences</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 4: OPPORTUNITY PREFERENCES */}
            {/* ========================================================================= */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                    <Compass className="w-4 h-4" />
                    <span>Step 4 of 5 • Opportunity Preferences</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    What should we track for you?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Filter out the noise. PrepPilot prioritizes high-confidence opportunities tailored to your targets.
                  </p>
                </div>

                <div className="space-y-5 pt-1">
                  {/* Opportunity Types */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Opportunities to Monitor</span>
                      <span className="text-[11px] text-indigo-400">Select all that apply</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {OPPORTUNITY_TYPES.map((opp) => {
                        const Icon = opp.icon;
                        const isSelected = preferredOpportunities.includes(opp.id);
                        return (
                          <div
                            key={opp.id}
                            onClick={() => toggleOpportunity(opp.id)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                              isSelected
                                ? 'bg-indigo-950/60 border-indigo-400 shadow-md shadow-indigo-500/10'
                                : 'bg-slate-950/40 border-white/10 hover:border-white/20'
                            }`}
                          >
                            <div
                              className={`p-2 rounded-xl shrink-0 ${
                                isSelected ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="space-y-0.5">
                              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>{opp.label}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                              </div>
                              <p className="text-[11px] text-slate-400 leading-tight">
                                {opp.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preferred Roles */}
                  <div className="space-y-2.5 pt-2">
                    <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Preferred Roles ({preferredRoles.length})</span>
                      <span className="text-[11px] text-slate-500">Pick chips or type your own</span>
                    </label>

                    {/* Active Selected Roles */}
                    <div className="flex flex-wrap gap-2">
                      {preferredRoles.map((role) => (
                        <span
                          key={role}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-200 text-xs font-semibold"
                        >
                          <span>{role}</span>
                          <button
                            type="button"
                            onClick={() => removeRole(role)}
                            className="text-violet-400 hover:text-rose-400 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Suggested Roles Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {SUGGESTED_ROLES.map((sRole) => {
                        const isSelected = preferredRoles.includes(sRole);
                        return (
                          <button
                            key={sRole}
                            type="button"
                            onClick={() => toggleRole(sRole)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                              isSelected
                                ? 'bg-violet-600 text-white border-violet-400'
                                : 'bg-slate-950/40 text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
                            }`}
                          >
                            {sRole}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Role Input */}
                    <form onSubmit={handleAddCustomRole} className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={customRoleInput}
                        onChange={(e) => setCustomRoleInput(e.target.value)}
                        placeholder="Add another role (e.g., Security Analyst, Blockchain Developer)..."
                        className="flex-1 px-4 py-2 rounded-xl bg-slate-950/60 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 text-xs transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddCustomRole()}
                        className="px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-1 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </form>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-5 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 font-semibold text-xs transition-all flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => validateAndProceed(5)}
                    className="px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2"
                  >
                    <span>Review Profile</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 5: CONFIRMATION & REVIEW */}
            {/* ========================================================================= */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Step 5 of 5 • Profile Summary</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Confirm your setup
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Verify your details below. You can edit any section before finalizing your personalized Opportunity Radar.
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  {/* Summary Card 1: Personal & Education */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2 relative group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                        <GraduationCap className="w-4 h-4" />
                        <span>Academic & Personal</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded-lg bg-white/5"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                      <div>
                        <div className="text-[10px] text-slate-500">Name</div>
                        <div className="font-bold text-white truncate">{fullName}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">University</div>
                        <div className="font-bold text-white truncate">{university}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Degree & Branch</div>
                        <div className="font-bold text-white truncate">{degree} • {branch}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Graduation Year</div>
                        <div className="font-bold text-indigo-300">{graduationYear}</div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Card 2: Standing & Career Goal */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2 relative group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                        <Target className="w-4 h-4" />
                        <span>Current Status & Career Goal</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded-lg bg-white/5"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                      <div>
                        <div className="text-[10px] text-slate-500">Academic Year</div>
                        <div className="font-bold text-white">{currentYear}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Semester</div>
                        <div className="font-bold text-white">{semester}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Target Career Goal</div>
                        <div className="font-bold text-emerald-400 truncate">
                          {careerGoal === 'Other' && customCareerGoal ? customCareerGoal : careerGoal}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Card 3: Skills Matrix */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2 relative group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                        <Code2 className="w-4 h-4" />
                        <span>Technical Skills ({skills.length})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded-lg bg-white/5"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Summary Card 4: Opportunity Tracking & Roles */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2 relative group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                        <Compass className="w-4 h-4" />
                        <span>Opportunity Tracking</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(4)}
                        className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded-lg bg-white/5"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="space-y-2 pt-1 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-500">Tracking Channels:</div>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {preferredOpportunities.map((opp) => (
                            <span
                              key={opp}
                              className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-medium"
                            >
                              {opp}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-500">Preferred Roles:</div>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {preferredRoles.map((role) => (
                            <span
                              key={role}
                              className="px-2.5 py-0.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[11px] font-medium"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* High Confidence Notice */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/70 to-violet-950/70 border border-indigo-500/30 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-white">AI Skill Match Ready</div>
                      <div className="text-[11px] text-slate-300 leading-tight">
                        Your skills and graduation cohort will prioritize relevant recruiter listings automatically.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="px-5 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 font-semibold text-xs transition-all flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCompleteSetup}
                    disabled={isFinishing}
                    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2.5 disabled:opacity-70"
                  >
                    {isFinishing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Personalizing Dashboard...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>Complete Setup & Launch Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-500 z-10 border-t border-white/5">
        &copy; {new Date().getFullYear()} PrepPilot — The Opportunity Preparation Copilot
      </footer>
    </div>
  );
};
