import React, { useState } from 'react';
import { 
  Mail, 
  BrainCircuit, 
  Target, 
  Route, 
  MessageSquareCode, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Check, 
  AlertCircle,
  Zap,
  PhoneCall,
  Send
} from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      id: 'email',
      stepNumber: '01',
      badgeText: 'STAGE 1',
      title: 'EMAIL',
      subtitle: 'Opportunity Ingestion',
      tagline: 'Forward any college placement or opportunity email.',
      description:
        'Connect your college inbox (.edu) or simply forward messy recruiter emails to prep@preppilot.ai. PrepPilot monitors placement cells, company newsletters, and hackathon alerts without spamming you.',
      icon: Mail,
      color: 'from-blue-500 to-indigo-600',
      tag: 'College Mail Ingestion',
      mockData: {
        title: 'Incoming Recruiter Email',
        meta: 'From: university-recruiting@google.com • Sent: Today 08:14 AM',
        subject: 'Applications Open: Google STEP Internship 2025 (India & APAC)',
        content:
          'Dear Candidate, Google is pleased to invite applications for the Student Training in Engineering Program (STEP) Summer 2025. Applicants must be enrolled in a bachelor’s degree in Computer Science, graduating in 2026 or 2027. Minimum CGPA: 7.5. Assessment round includes Data Structures & Algorithmic problem solving...',
        badge: 'Raw Unstructured Email',
      },
    },
    {
      id: 'ai-understands',
      stepNumber: '02',
      badgeText: 'STAGE 2',
      title: 'AI UNDERSTANDS',
      subtitle: 'Intelligent Parsing',
      tagline: 'AI extracts criteria, dates, and requirements instantly.',
      description:
        'Our custom LLM parses the email text to extract hard eligibility constraints: eligible graduation cohorts, CGPA cutoffs, required tech stack, application deadline, and interview stages.',
      icon: BrainCircuit,
      color: 'from-indigo-500 to-violet-600',
      tag: 'Information Extraction',
      mockData: {
        title: 'Structured Criteria Matrix',
        meta: 'Processed in 120ms • Confidence: 99.4%',
        subject: 'Extracted Opportunity Schema',
        fields: [
          { label: 'Role & Company', value: 'Google STEP Intern (Summer 2025)', status: 'pass' },
          { label: 'Graduation Batches', value: 'Class of 2026 & 2027 (2nd / 3rd Year)', status: 'pass' },
          { label: 'Minimum CGPA', value: '7.5 / 10.0 (No Active Backlogs)', status: 'pass' },
          { label: 'Application Deadline', value: 'October 15, 2025 (14 Days Remaining)', status: 'warning' },
          { label: 'Evaluation Format', value: 'Online Coding Assessment + 2 Technical Rounds', status: 'pass' },
        ],
        badge: 'Structured LLM Output',
      },
    },
    {
      id: 'match-prioritize',
      stepNumber: '03',
      badgeText: 'STAGE 3',
      title: 'MATCH & PRIORITIZE',
      subtitle: 'Eligibility & Fit Audit',
      tagline: 'Compares your profile to filter out disqualifications.',
      description:
        'PrepPilot audits your academic records, current skills, and project history against the role. It flags whether you pass the cutoff, scores your readiness, and ranks the opportunity by urgency.',
      icon: Target,
      color: 'from-violet-500 to-purple-600',
      tag: 'Deterministic Match Audit',
      mockData: {
        title: 'Student Profile Alignment',
        meta: 'Candidate: Alex Chen • B.Tech CS (8.4 CGPA)',
        matchScore: 94,
        eligibilityStatus: '100% Eligible',
        reasons: [
          { check: 'CGPA Filter', detail: '8.4 exceeds 7.5 cutoff (+0.9 cushion)', pass: true },
          { check: 'Cohort Year', detail: 'Class of 2026 verified matches criteria', pass: true },
          { check: 'Core Foundations', detail: 'Data Structures & OOP confirmed in GitHub', pass: true },
          { check: 'Priority Rank', detail: '#1 High Priority (Top Recruiter Tier)', pass: true },
        ],
        badge: 'High Match • Queue Priority #1',
      },
    },
    {
      id: 'prepare',
      stepNumber: '04',
      badgeText: 'STAGE 4',
      title: 'PREPARE',
      subtitle: 'Daily Sprint Roadmap',
      tagline: 'Delivers a day-by-day roadmap tailored to the interview.',
      description:
        'No more panic or guesswork. PrepPilot creates a targeted 14 to 30-day prep sprint based on the company’s real interview question archives: daily coding problems, behavioral STAR prompts, and mock quizzes.',
      icon: Route,
      color: 'from-purple-500 to-pink-600',
      tag: 'Day-by-Day Sprint Engine',
      mockData: {
        title: 'Active Preparation Sprint: Day 12 of 30',
        meta: 'Google STEP Preparation Track • 14 Days to Deadline',
        tasks: [
          { time: 'Morning (45m)', task: 'Solve 2 LeetCode Mediums on Graph BFS/DFS', tag: 'DSA Practice' },
          { time: 'Afternoon (30m)', task: 'Review Google STAR behavioral interview questions', tag: 'Culture Fit' },
          { time: 'Evening (20m)', task: 'Time-complexity trade-offs drill on recursive trees', tag: 'Core CS' },
        ],
        badge: 'Personalized Daily Schedule',
      },
    },
    {
      id: 'whatsapp',
      stepNumber: '05',
      badgeText: 'STAGE 5',
      title: 'WHATSAPP',
      subtitle: 'Direct Mobile Nudges',
      tagline: 'Daily tasks and urgent deadlines sent straight to your phone.',
      description:
        'Never miss a deadline or skip prep. Every morning, PrepPilot sends your 2-3 daily tasks on WhatsApp. When the deadline nears or an assessment date is announced, you get an instant WhatsApp reminder.',
      icon: MessageSquareCode,
      color: 'from-emerald-500 to-teal-600',
      tag: 'Zero-Friction WhatsApp Alerts',
      mockData: {
        title: 'WhatsApp Chat Simulation',
        meta: 'PrepPilot AI Assistant • Verified Business',
        incomingMessage:
          '👋 Good morning Alex!\n\n📅 14 days remaining for Google STEP.\n\n🎯 Today’s Prep Tasks (Day 12):\n1. LeetCode Graph BFS/DFS (2 problems)\n2. Google STAR Behavioral Guide\n\nReply "DONE" when completed to log streak! 🔥',
        replyMessage: 'DONE',
        confirmation: '⚡ Awesome! Day 12 logged. Current streak: 7 days. Keep going!',
        badge: 'WhatsApp Bot Active',
      },
    },
  ];

  const current = steps[activeStep];

  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-slate-950/40 border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Zap className="w-3.5 h-3.5" />
            The 5-Stage Prep Pipeline
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            How PrepPilot Works
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            From raw email notifications to disciplined daily execution delivered right to your phone.
          </p>

          {/* Pipeline Stepper Visual Ribbon */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-bold uppercase tracking-wider">
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => setActiveStep(idx)}
                  className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                    activeStep === idx
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105 border border-indigo-400/40'
                      : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-white/10'
                  }`}
                >
                  <span className="text-[10px] opacity-70">0{idx + 1}</span>
                  <span>{step.title}</span>
                </button>
                {idx < steps.length - 1 && (
                  <span className="text-slate-600 font-bold hidden sm:inline">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Interactive Step Explorer Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Stage Explanation & Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                  {current.badgeText}
                </span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {current.subtitle}
                </span>
              </div>

              <h3 className="text-3xl font-black text-white tracking-tight">
                {current.title}
              </h3>

              <p className="text-base text-indigo-200 font-medium">
                "{current.tagline}"
              </p>

              <p className="text-sm text-slate-300 leading-relaxed">
                {current.description}
              </p>
            </div>

            {/* Quick Step Indicators */}
            <div className="space-y-2 pt-2">
              {steps.map((s, idx) => (
                <div
                  key={s.id}
                  onClick={() => setActiveStep(idx)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    activeStep === idx
                      ? 'bg-indigo-950/40 border-indigo-500/40 text-white'
                      : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-mono font-bold w-6 h-6 rounded-md flex items-center justify-center ${activeStep === idx ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold tracking-wide uppercase">
                      {s.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {s.subtitle}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Live Interactive Simulation of the Stage */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl bg-slate-900/90 border border-white/15 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
              {/* Decorative top bar */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  <span className="text-xs font-mono text-slate-400 ml-2">
                    {current.mockData.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {current.mockData.badge}
                </span>
              </div>

              {/* Stage 1: EMAIL Mock */}
              {current.id === 'email' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 space-y-1 text-xs">
                    <div className="text-slate-400">{current.mockData.meta}</div>
                    <div className="text-white font-bold text-sm">
                      {current.mockData.subject}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 text-xs text-slate-300 leading-relaxed font-mono">
                    {current.mockData.content}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                    <span>Forwarding address:</span>
                    <span className="text-indigo-400 font-mono font-semibold">prep@preppilot.ai</span>
                  </div>
                </div>
              )}

              {/* Stage 2: AI UNDERSTANDS Mock */}
              {current.id === 'ai-understands' && (
                <div className="space-y-4">
                  <div className="text-xs text-indigo-300 font-mono flex items-center justify-between">
                    <span>{current.mockData.meta}</span>
                    <span className="text-emerald-400 font-bold">100% Extraction Rate</span>
                  </div>
                  <div className="space-y-2">
                    {current.mockData.fields?.map((field) => (
                      <div
                        key={field.label}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-white/5 text-xs"
                      >
                        <span className="text-slate-400 font-medium">{field.label}</span>
                        <span className="text-white font-semibold">{field.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stage 3: MATCH & PRIORITIZE Mock */}
              {current.id === 'match-prioritize' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
                    <div>
                      <div className="text-xs text-slate-400">{current.mockData.meta}</div>
                      <div className="text-lg font-black text-white">
                        Match Score: <span className="text-emerald-400">94%</span>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                      {current.mockData.eligibilityStatus}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {current.mockData.reasons?.map((item) => (
                      <div
                        key={item.check}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-white/5 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-white font-semibold">{item.check}</span>
                        </div>
                        <span className="text-slate-300">{item.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stage 4: PREPARE Mock */}
              {current.id === 'prepare' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-violet-950/40 border border-violet-500/30 text-xs text-violet-200">
                    <span className="font-bold text-white block mb-0.5">
                      {current.mockData.title}
                    </span>
                    <span className="text-slate-400">{current.mockData.meta}</span>
                  </div>

                  <div className="space-y-2.5">
                    {current.mockData.tasks?.map((t) => (
                      <div
                        key={t.task}
                        className="p-3 rounded-xl bg-slate-950/70 border border-white/5 text-xs flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                          <div>
                            <div className="text-white font-medium">{t.task}</div>
                            <div className="text-[11px] text-slate-400">{t.time}</div>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10 shrink-0">
                          {t.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stage 5: WHATSAPP Mock */}
              {current.id === 'whatsapp' && (
                <div className="space-y-4 font-sans">
                  {/* WhatsApp Chat Container */}
                  <div className="rounded-2xl bg-[#0b141a] border border-emerald-500/30 p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-3 pb-3 border-b border-white/10 text-xs">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white">
                        P
                      </div>
                      <div>
                        <div className="text-white font-bold flex items-center gap-1.5">
                          <span>PrepPilot AI Bot</span>
                          <span className="text-emerald-400 text-[10px]">✔</span>
                        </div>
                        <div className="text-[10px] text-emerald-400">Online • Campus Copilot</div>
                      </div>
                    </div>

                    {/* Bot Message Bubble */}
                    <div className="bg-[#202c33] text-slate-200 text-xs p-3.5 rounded-2xl rounded-tl-none max-w-sm space-y-2 shadow">
                      <p className="whitespace-pre-line leading-relaxed">
                        {current.mockData.incomingMessage}
                      </p>
                      <div className="text-[10px] text-slate-400 text-right">08:30 AM</div>
                    </div>

                    {/* Student Reply Bubble */}
                    <div className="flex justify-end">
                      <div className="bg-[#005c4b] text-white text-xs px-3.5 py-2 rounded-2xl rounded-tr-none max-w-xs shadow">
                        <span className="font-bold">DONE</span>
                        <div className="text-[10px] text-emerald-200 text-right mt-0.5">09:15 AM ✔✔</div>
                      </div>
                    </div>

                    {/* Bot Confirmation Bubble */}
                    <div className="bg-[#202c33] text-emerald-300 text-xs p-3 rounded-2xl rounded-tl-none max-w-sm shadow">
                      {current.mockData.confirmation}
                      <div className="text-[10px] text-slate-400 text-right mt-1">09:15 AM</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Quick Navigation */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <button
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                  className="text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 font-semibold"
                >
                  ← Previous Stage
                </button>
                <div className="flex gap-1.5">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        activeStep === i ? 'w-6 bg-indigo-500' : 'w-2 bg-slate-700'
                      }`}
                    ></div>
                  ))}
                </div>
                <button
                  disabled={activeStep === steps.length - 1}
                  onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
                  className="text-indigo-400 hover:text-indigo-300 disabled:opacity-30 disabled:hover:text-indigo-400 font-bold flex items-center gap-1"
                >
                  <span>Next Stage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
