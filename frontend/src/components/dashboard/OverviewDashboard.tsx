import React, { useState } from 'react';
import {
  Target,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Mail,
  BookOpen,
  Smartphone,
  Check,
  Bot,
  Flame,
  Zap,
  Briefcase,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Code2,
  Database,
  Layers,
  Cpu
} from 'lucide-react';
import { DashboardPage } from './Sidebar';
import { Opportunity } from '../../data/mockOpportunities';
import {
  DEMO_PREP_TASKS,
  DEMO_SKILLS,
  DEMO_DEADLINES,
  DEMO_EMAILS,
  TECHNOVA_OPPORTUNITY,
  PrepTask
} from './dashboardData';

interface OverviewDashboardProps {
  userName: string;
  onSelectPage: (page: DashboardPage) => void;
  onSelectOpportunity: (opportunity: Opportunity) => void;
  onSimulateEmailAnalysis: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  userName,
  onSelectPage,
  onSelectOpportunity,
  onSimulateEmailAnalysis,
}) => {
  // Interactive tasks state
  const [tasks, setTasks] = useState<PrepTask[]>(DEMO_PREP_TASKS);

  // Interactive AI Assistant mini-card state
  const [activePromptQuestion, setActivePromptQuestion] = useState<string | null>(null);
  const [assistantReply, setAssistantReply] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  // Toggle tasks completion
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  // Compute live task progress
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const taskProgressPercent = Math.round((completedTasksCount / tasks.length) * 100);

  // Handle clicking quick AI prompt pills
  const handleAskPrompt = (prompt: string) => {
    setActivePromptQuestion(prompt);
    setIsThinking(true);
    setAssistantReply(null);

    setTimeout(() => {
      setIsThinking(false);
      if (prompt.includes('What should I prepare today?')) {
        setAssistantReply(
          'Focus on your TechNova interview in 5 days! Complete 2 DBMS normalization tasks (2NF to BCNF) and solve 3 tree problems. That will boost your skill match to 88%.'
        );
      } else if (prompt.includes('Which opportunity should I prioritize?')) {
        setAssistantReply(
          'Prioritize TechNova Software Engineer Interview (Urgent: 5 days, 82% match). Second priority is ETHGlobal Hackathon (8 days). Put Microsoft placement on background radar.'
        );
      } else {
        setAssistantReply(
          'Your primary gap is System Design (40%) and DBMS Normalization (70%). Your DSA (80%) and OOP (90%) are strong enough for screening rounds.'
        );
      }
    }, 450);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 11. QUICK ACTIONS BAR */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-bold text-slate-400 shrink-0 uppercase tracking-wider text-[10px] mr-1">
          Quick Actions:
        </span>

        <button
          onClick={onSimulateEmailAnalysis}
          className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 text-xs font-semibold flex items-center gap-2 transition-all shrink-0 hover:scale-[1.02] shadow-sm"
        >
          <Mail className="w-3.5 h-3.5 text-indigo-400" />
          <span>Analyze Emails</span>
        </button>

        <button
          onClick={() => onSelectPage('opportunities')}
          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all shrink-0 hover:scale-[1.02]"
        >
          <Target className="w-3.5 h-3.5 text-emerald-400" />
          <span>View Opportunities</span>
        </button>

        <button
          onClick={() => onSelectPage('preparation-hub')}
          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all shrink-0 hover:scale-[1.02]"
        >
          <BookOpen className="w-3.5 h-3.5 text-violet-400" />
          <span>Start Preparation</span>
        </button>

        <button
          onClick={() => onSelectPage('calendar')}
          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all shrink-0 hover:scale-[1.02]"
        >
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>Open Calendar</span>
        </button>

        <button
          onClick={() => onSelectPage('whatsapp')}
          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all shrink-0 hover:scale-[1.02]"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>WhatsApp Briefing</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. OVERVIEW CARDS (4 Cards) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Important Opportunities */}
        <div
          onClick={() => onSelectPage('opportunities')}
          className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-indigo-500/40 backdrop-blur-xl transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+2 New</span>
            </span>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-black text-white tracking-tight">8</div>
            <div className="text-xs font-bold text-slate-300 mt-1 uppercase tracking-wider text-[11px]">
              Important Opportunities
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              3 high skill match &gt; 80%
            </p>
          </div>
        </div>

        {/* Card 2: Interviews */}
        <div
          onClick={() => onSelectOpportunity(TECHNOVA_OPPORTUNITY)}
          className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-violet-500/40 backdrop-blur-xl transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 flex items-center gap-1 animate-pulse">
              <Clock className="w-3 h-3" />
              <span>1 Urgent</span>
            </span>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-black text-white tracking-tight">2</div>
            <div className="text-xs font-bold text-slate-300 mt-1 uppercase tracking-wider text-[11px]">
              Interviews
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              TechNova in 5 days (Round 1)
            </p>
          </div>
        </div>

        {/* Card 3: Upcoming Deadlines */}
        <div
          onClick={() => onSelectPage('calendar')}
          className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-amber-500/40 backdrop-blur-xl transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Next in 5d
            </span>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-black text-white tracking-tight">4</div>
            <div className="text-xs font-bold text-slate-300 mt-1 uppercase tracking-wider text-[11px]">
              Upcoming Deadlines
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Next: TechNova interview & ETHGlobal
            </p>
          </div>
        </div>

        {/* Card 4: Preparation Progress */}
        <div
          onClick={() => onSelectPage('preparation-hub')}
          className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-emerald-500/40 backdrop-blur-xl transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              17 / 25 Tasks
            </span>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-black text-white tracking-tight">68%</div>
            <div className="text-xs font-bold text-slate-300 mt-1 uppercase tracking-wider text-[11px]">
              Preparation Progress
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              8.5 hours studied this week
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. URGENT OPPORTUNITY (Prominent AI Priority Card) */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-gradient-to-r from-rose-950/40 via-indigo-950/40 to-slate-900/80 border border-rose-500/30 p-6 sm:p-8 backdrop-blur-2xl relative overflow-hidden shadow-2xl">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-rose-500 text-white shadow-md shadow-rose-500/30 flex items-center gap-1.5 animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Priority: HIGH</span>
              </span>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>⏰ Interview in 5 days</span>
              </span>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Skill Match: 82%
              </span>
            </div>

            {/* Title & Company */}
            <div>
              <div className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                <span>Company: <strong className="text-white text-sm">TechNova</strong></span>
                <span>•</span>
                <span>Stage: <strong className="text-indigo-400 text-sm">Interview</strong></span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
                <span>🎯 Software Engineer Interview</span>
              </h2>
            </div>

            {/* Required Skills Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-slate-400">Required Skills:</span>
              {['DSA', 'OOP', 'DBMS', 'SQL'].map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-0.5 rounded-lg bg-white/10 border border-white/15 text-xs font-mono font-bold text-indigo-200"
                >
                  {skill}
                </span>
              ))}
            </div>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              AI Recommendation: TechNova's technical panel heavily evaluates query normalization & live coding complexity. Complete today’s target modules before Friday.
            </p>
          </div>

          {/* Action Button */}
          <div className="shrink-0">
            <button
              onClick={() => onSelectOpportunity(TECHNOVA_OPPORTUNITY)}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group"
            >
              <span>View Opportunity</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. TODAY'S PREPARATION & 6. SKILL GAP ANALYSIS (2-COL GRID) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 5: Today's Preparation */}
        <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Daily Action Sprint</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Today's Preparation
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Progress: {taskProgressPercent}%
              </span>
            </div>

            {/* Today's Goal Card */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-slate-300 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">
                  Today's Goal
                </span>
                <span className="font-bold text-white text-sm">
                  Prepare for Software Engineer Interview
                </span>
              </div>
              <span className="text-[11px] text-indigo-300 font-mono">
                {completedTasksCount} / {tasks.length} Completed
              </span>
            </div>

            {/* Interactive Tasks Checklist */}
            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    task.completed
                      ? 'bg-slate-950/40 border-white/5 opacity-75'
                      : 'bg-slate-950/80 border-white/10 hover:border-indigo-500/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                        task.completed
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : 'border-white/20 bg-slate-900 hover:border-white/40'
                      }`}
                    >
                      {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <span
                      className={`text-xs font-medium ${
                        task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {task.estimatedMinutes} min
                  </span>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Preparation completion:</span>
                <span className="font-bold text-white">{taskProgressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${taskProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={() => onSelectPage('preparation-hub')}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Continue Preparation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Section 6: Skill Gap Analysis */}
        <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  <span>AI Competency Diagnostic</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Your Skill Gaps
                </h3>
              </div>
              <span className="text-xs text-slate-400">Target: SDE 1</span>
            </div>

            {/* Strong vs Improve Legend */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                <span className="text-slate-300 font-medium">Strong Skills (&ge;75%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <span className="text-slate-300 font-medium">Skills to Improve (&lt;75%)</span>
              </div>
            </div>

            {/* Skill Bars with ASCII representation & gauges */}
            <div className="space-y-3.5 pt-1">
              {DEMO_SKILLS.map((item) => {
                const isStrong = item.status === 'strong';
                return (
                  <div key={item.skill} className="space-y-1.5 p-3 rounded-2xl bg-slate-950/50 border border-white/5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{item.skill}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                            isStrong
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                          }`}
                        >
                          {isStrong ? 'Strong' : 'Needs Practice'}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-white">{item.proficiency}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isStrong ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                        style={{ width: `${item.proficiency}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>Recommendation: {item.recommendedTask}</span>
                      <span className="font-mono">{item.targetLevel}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Button */}
          <button
            onClick={() => onSelectPage('preparation-hub')}
            className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <span>View Skill Analysis</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. UPCOMING DEADLINES & 9. PREPARATION OVERVIEW (2-COL GRID) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 7: Upcoming Deadlines */}
        <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Clock className="w-4 h-4" />
                  <span>Timeline & Critical Dates</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Upcoming Deadlines
                </h3>
              </div>
              <span className="text-xs text-slate-400">3 critical milestones</span>
            </div>

            {/* Deadlines List */}
            <div className="space-y-3">
              {DEMO_DEADLINES.map((dl) => {
                const isHigh = dl.urgency === 'high';
                const isMedium = dl.urgency === 'medium';
                return (
                  <div
                    key={dl.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isHigh
                        ? 'bg-rose-950/30 border-rose-500/30'
                        : isMedium
                        ? 'bg-amber-950/20 border-amber-500/20'
                        : 'bg-slate-950/50 border-white/10'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-white">
                          {dl.title}
                        </h4>
                        <span className="text-[10px] text-slate-400">({dl.companyOrOrg})</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        <span>Date: {dl.dateStr}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-xl block ${
                          isHigh
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : isMedium
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        {dl.daysRemaining} days remaining
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onSelectPage('calendar')}
            className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <span>View Calendar</span>
            <Calendar className="w-4 h-4" />
          </button>
        </div>

        {/* Section 9: Preparation Overview */}
        <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4" />
                  <span>Weekly Study Velocity</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Preparation Overview
                </h3>
              </div>
              <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                Weekly: 68%
              </span>
            </div>

            {/* Metric Counters Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase font-medium">Weekly Prep</div>
                <div className="text-xl font-black text-indigo-400 mt-0.5">68%</div>
                <div className="text-[10px] text-emerald-400 mt-0.5">+12% vs last wk</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase font-medium">Tasks Completed</div>
                <div className="text-xl font-black text-white mt-0.5">17 / 25</div>
                <div className="text-[10px] text-slate-400 mt-0.5">8 remaining</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase font-medium">Hours Prepared</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">8.5 hrs</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Goal: 10 hrs</div>
              </div>
            </div>

            {/* Weekly Daily Activity Bar Representation */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Daily Sprint Consistency:</span>
                <span className="text-white font-bold">5 of 7 Days Active</span>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-[10px]">
                {[
                  { day: 'Mon', active: true, hrs: '1.5h' },
                  { day: 'Tue', active: true, hrs: '2.0h' },
                  { day: 'Wed', active: true, hrs: '1.8h' },
                  { day: 'Thu', active: true, hrs: '1.2h' },
                  { day: 'Fri', active: true, hrs: '2.0h' },
                  { day: 'Sat', active: false, hrs: '0h' },
                  { day: 'Sun', active: false, hrs: 'Today' },
                ].map((d) => (
                  <div key={d.day} className="space-y-1">
                    <div
                      className={`h-12 rounded-xl flex items-end justify-center pb-1 transition-all ${
                        d.active
                          ? 'bg-gradient-to-t from-indigo-600 to-violet-500 text-white font-bold'
                          : 'bg-slate-950/80 text-slate-600 border border-white/5'
                      }`}
                    >
                      <span className="text-[9px]">{d.hrs}</span>
                    </div>
                    <span className="text-slate-400 font-medium">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectPage('preparation-hub')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>Launch Complete Study Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 8. EMAIL INTELLIGENCE & 10. AI ASSISTANT CARD (2-COL GRID) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 8: AI Email Intelligence */}
        <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  <Mail className="w-4 h-4" />
                  <span>Automated Ingestion</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  AI Email Intelligence
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                12 Analyzed
              </span>
            </div>

            {/* Metrics Chips */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                <div className="font-black text-white text-base">12</div>
                <div className="text-[10px] text-slate-400 leading-tight mt-0.5">Emails Analyzed</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                <div className="font-black text-emerald-400 text-base">3</div>
                <div className="text-[10px] text-emerald-300/80 leading-tight mt-0.5">Opportunities Found</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                <div className="font-black text-slate-400 text-base">9</div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">Promos Filtered</div>
              </div>
            </div>

            {/* Example Recent Email */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/30 space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                  Status: Opportunity Detected
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  Stage: Interview
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">
                  "Congratulations! You have been shortlisted..."
                </h4>
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                  {DEMO_EMAILS[0].snippet}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-white/5">
                <span>From: {DEMO_EMAILS[0].sender}</span>
                <span>{DEMO_EMAILS[0].timestamp}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectPage('email-intelligence')}
            className="w-full py-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <span>View Email Intelligence</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Section 10: AI Assistant Card */}
        <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Instant Career Copilot</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Ask PrepPilot
                </h3>
              </div>
              <span className="text-xs text-slate-400">24/7 AI Ready</span>
            </div>

            <p className="text-xs text-slate-300">
              Click a suggested query or open the AI assistant for personalized preparation advice:
            </p>

            {/* Prompt Chips */}
            <div className="space-y-2">
              {[
                'What should I prepare today?',
                'Which opportunity should I prioritize?',
                'What are my biggest skill gaps?',
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleAskPrompt(prompt)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${
                    activePromptQuestion === prompt
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/20'
                      : 'bg-slate-950/60 border-white/10 text-slate-300 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <span>"{prompt}"</span>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                </button>
              ))}
            </div>

            {/* Thinking / AI Answer Display */}
            {isThinking && (
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-300 flex items-center gap-2 animate-pulse">
                <Bot className="w-4 h-4 animate-spin text-indigo-400" />
                <span>PrepPilot is formulating recommendation...</span>
              </div>
            )}

            {assistantReply && !isThinking && (
              <div className="p-3.5 rounded-2xl bg-indigo-950/50 border border-indigo-500/40 text-xs text-slate-200 space-y-1 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-[11px]">
                  <Bot className="w-3.5 h-3.5" />
                  <span>PrepPilot AI Answer:</span>
                </div>
                <p className="leading-relaxed">{assistantReply}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => onSelectPage('ai-assistant')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Bot className="w-4 h-4" />
            <span>Open AI Assistant</span>
          </button>
        </div>
      </div>
    </div>
  );
};
