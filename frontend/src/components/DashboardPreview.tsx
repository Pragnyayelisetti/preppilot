import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calendar, 
  ChevronRight, 
  BrainCircuit, 
  Check, 
  Layers, 
  TrendingUp, 
  Code2, 
  Target, 
  Briefcase, 
  Award, 
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Mail,
  MessageCircle,
  BellRing
} from 'lucide-react';
import { MOCK_OPPORTUNITIES, Opportunity } from '../data/mockOpportunities';

interface DashboardPreviewProps {
  onOpenActionPlan?: (opportunity: Opportunity) => void;
}

export const DashboardPreview: React.FC<DashboardPreviewProps> = ({ onOpenActionPlan }) => {
  const [selectedId, setSelectedId] = useState<string>(MOCK_OPPORTUNITIES[0].id);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    'task-1': true,
    'task-2': false,
    'task-3': false,
  });

  const activeOpp = MOCK_OPPORTUNITIES.find((o) => o.id === selectedId) || MOCK_OPPORTUNITIES[0];

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  // Calculate days remaining dynamically based on opportunity
  const daysRemainingMap: Record<string, number> = {
    'google-step-2025': 14,
    'ethglobal-hackathon': 6,
    'microsoft-swe-newgrad': 21,
    'generation-google-scholarship': 28,
  };

  const daysLeft = daysRemainingMap[activeOpp.id] || 14;

  return (
    <div id="mockup" className="relative w-full max-w-6xl mx-auto mt-8">
      {/* Decorative backdrop glow */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-purple-500/20 rounded-[32px] blur-2xl -z-10 opacity-70"></div>

      {/* Main Container Window */}
      <div className="relative bg-slate-900/95 border border-white/10 rounded-[28px] shadow-2xl backdrop-blur-2xl overflow-hidden">
        {/* Top Window Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-400/40"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-400/40"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-400/40"></div>
            </div>
            <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-indigo-300 font-semibold bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                AI DASHBOARD PREVIEW
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                Profile: <strong className="text-slate-200">Alex Chen (3rd Yr CS, 8.4 CGPA)</strong>
              </span>
            </div>
          </div>

          {/* Quick Opportunity Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950/90 rounded-xl border border-white/5 mt-2 sm:mt-0">
            {MOCK_OPPORTUNITIES.map((opp) => (
              <button
                key={opp.id}
                onClick={() => setSelectedId(opp.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                  selectedId === opp.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {opp.type === 'internship' && <Briefcase className="w-3 h-3" />}
                {opp.type === 'hackathon' && <Code2 className="w-3 h-3" />}
                {opp.type === 'placement' && <Target className="w-3 h-3" />}
                {opp.type === 'scholarship' && <Award className="w-3 h-3" />}
                <span className="capitalize">{opp.type}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="p-5 sm:p-7 space-y-6">
          {/* Email Ingestion Notification Pill */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs">
            <div className="flex items-center gap-2.5 text-indigo-200">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold text-white">Smart Email Intelligence:</span>
              <span className="text-slate-300 truncate max-w-xs sm:max-w-md">
                Parsed from campus recruiter mail • {activeOpp.company} Recruiting Alert
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-indigo-300">
              <span className="px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30">
                0-Min Latency
              </span>
            </div>
          </div>

          {/* 1. New Opportunity + Match Score + Days Remaining Header Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-indigo-950/50 via-slate-900/80 to-violet-950/50 border border-indigo-500/25 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none"></div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              {/* Left Details: New Opportunity */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    New Opportunity
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {activeOpp.badge}
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {activeOpp.stipendOrPrize}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {activeOpp.title}
                </h3>
                
                <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
                  <span className="font-semibold text-white">{activeOpp.company}</span>
                  <span className="text-slate-500">•</span>
                  <span>{activeOpp.location}</span>
                </p>
              </div>

              {/* Right Stats: Match Percentage + Days Remaining */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 shrink-0">
                {/* Match Percentage Widget */}
                <div className="flex items-center gap-3.5 bg-slate-950/90 px-4 py-3 rounded-2xl border border-white/10 shadow-lg">
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-indigo-400"
                        strokeDasharray={`${activeOpp.matchScore}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-sm font-extrabold text-white">
                      {activeOpp.matchScore}%
                    </span>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wide">
                      Match Percentage
                    </div>
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {activeOpp.eligibilityStatus}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Verified Criteria Pass
                    </div>
                  </div>
                </div>

                {/* Days Remaining Widget */}
                <div className="flex items-center gap-3.5 bg-slate-950/90 px-4 py-3 rounded-2xl border border-amber-500/20 shadow-lg">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col items-center justify-center text-amber-300">
                    <Clock className="w-5 h-5 mb-0.5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wide">
                      Days Remaining
                    </div>
                    <div className="text-base font-extrabold text-white">
                      {daysLeft} Days Left
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {activeOpp.deadline}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-bar match progress */}
            <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-slate-300">Academic & Technical Eligibility:</span>
                <span className="text-emerald-400 font-semibold">100% Verified (CGPA 8.4 meets 7.5+ cutoff)</span>
              </div>
              <div className="flex items-center gap-1 text-indigo-300 font-medium">
                <span>Auto-Prioritized in Student Queue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* 2. Skills to Prepare + Today's Task + WhatsApp Alert Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Skills to Prepare Card (Col 6) */}
            <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-indigo-500/30 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">
                        Skills to Prepare
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        AI Skill Match & Gap Diagnostics
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    High Priority
                  </span>
                </div>

                {/* Priority Missing Skills to Master */}
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-bold text-rose-400 mb-2 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Priority Gaps (Recruiter High Weightage):</span>
                    </div>
                    <div className="space-y-2">
                      {activeOpp.skillsMissing.map((skill, idx) => (
                        <div
                          key={skill}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-bold flex items-center justify-center">
                              #{idx + 1}
                            </span>
                            <span className="text-rose-200 font-semibold">{skill}</span>
                          </div>
                          <span className="text-[10px] text-rose-300 font-mono">
                            ~3-4 hrs prep
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Profile Strengths Matched */}
                  <div className="pt-2">
                    <div className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>Verified Skills in Your Profile:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeOpp.skillsMatched.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 text-xs font-medium border border-emerald-500/20 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 text-emerald-400" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-5 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span>Ramp Time to 98% Match:</span>
                <span className="text-white font-bold">~8.5 hours targeted practice</span>
              </div>
            </div>

            {/* Today's Task Card (Col 6) */}
            <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-violet-500/30 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">
                        Today's Task
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Personalized Daily Roadmap • Day {activeOpp.roadmapSnapshot.day} of {activeOpp.roadmapSnapshot.totalDays}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-violet-300 bg-violet-600/20 px-2.5 py-1 rounded-full border border-violet-500/30">
                    Day {activeOpp.roadmapSnapshot.day}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-semibold mb-3">
                  Current Sprint Focus: <span className="text-white">{activeOpp.roadmapSnapshot.currentFocus}</span>
                </p>

                {/* Progress bar */}
                <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden mb-3.5">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(activeOpp.roadmapSnapshot.day / activeOpp.roadmapSnapshot.totalDays) * 100}%`,
                    }}
                  ></div>
                </div>

                {/* Interactive Tasks Checklist */}
                <div className="space-y-2.5">
                  <div
                    onClick={() => toggleTask('task-1')}
                    className="flex items-start gap-2.5 text-xs p-2.5 rounded-xl bg-slate-950/70 border border-white/5 cursor-pointer hover:bg-white/5 transition-all"
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center transition-colors ${completedTasks['task-1'] ? 'bg-indigo-600 text-white' : 'border border-slate-600'}`}>
                      {completedTasks['task-1'] && <Check className="w-3 h-3" />}
                    </div>
                    <div className="flex-1">
                      <span className={completedTasks['task-1'] ? 'line-through text-slate-500' : 'text-slate-200 font-medium'}>
                        Solve 2 LeetCode Mediums on Graph DFS (Estimated 45 min)
                      </span>
                    </div>
                  </div>

                  <div
                    onClick={() => toggleTask('task-2')}
                    className="flex items-start gap-2.5 text-xs p-2.5 rounded-xl bg-slate-950/70 border border-white/5 cursor-pointer hover:bg-white/5 transition-all"
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center transition-colors ${completedTasks['task-2'] ? 'bg-indigo-600 text-white' : 'border border-slate-600'}`}>
                      {completedTasks['task-2'] && <Check className="w-3 h-3" />}
                    </div>
                    <div className="flex-1">
                      <span className={completedTasks['task-2'] ? 'line-through text-slate-500' : 'text-slate-200 font-medium'}>
                        {activeOpp.roadmapSnapshot.activeTask}
                      </span>
                    </div>
                  </div>

                  <div
                    onClick={() => toggleTask('task-3')}
                    className="flex items-start gap-2.5 text-xs p-2.5 rounded-xl bg-slate-950/70 border border-white/5 cursor-pointer hover:bg-white/5 transition-all"
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center transition-colors ${completedTasks['task-3'] ? 'bg-indigo-600 text-white' : 'border border-slate-600'}`}>
                      {completedTasks['task-3'] && <Check className="w-3 h-3" />}
                    </div>
                    <div className="flex-1">
                      <span className={completedTasks['task-3'] ? 'line-through text-slate-500' : 'text-slate-200 font-medium'}>
                        10-minute speed drill on recursion stack complexity
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp Alert Simulation Box */}
              <div className="mt-4 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-emerald-300 font-medium truncate">
                    WhatsApp Alert: "Morning Alex! 2 tasks scheduled before your 14-day deadline."
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded shrink-0">
                  Delivered 08:30 AM
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="px-6 py-3.5 border-t border-white/5 bg-slate-950/90 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Pipeline Active: Email Ingestion & Opportunity Radar Online
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline text-slate-400">Targeted for 2025–26 Cycles</span>
          </div>
          <button
            onClick={() => onOpenActionPlan?.(activeOpp)}
            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold text-xs transition-colors"
          >
            <span>Open Full Interactive Plan</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
