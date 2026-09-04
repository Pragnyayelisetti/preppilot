import React from 'react';
import { 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  CalendarClock, 
  MessageSquareCode, 
  BrainCircuit, 
  Route, 
  ArrowRight, 
  ShieldCheck,
  Zap,
  Target,
  BellRing
} from 'lucide-react';

export const Features: React.FC = () => {
  const features = [
    {
      icon: Mail,
      color: 'from-blue-500 to-indigo-600',
      badge: 'Email Engine',
      title: 'Smart Email Intelligence',
      description:
        'Connect your college inbox or forward recruitment emails to prep@preppilot.ai. Our AI parses messy newsletters, career portal updates, and placement cell blasts to extract only actionable opportunities.',
      highlights: [
        'Automatic College Email Ingestion',
        'Noise & Spam Stripping',
        'Zero-Effort Inbox Sync',
      ],
      previewSnippet: 'Parsed: "Google STEP Internship 2025 applications are now open for 2nd year students."',
    },
    {
      icon: Sparkles,
      color: 'from-indigo-500 to-violet-600',
      badge: 'Detection AI',
      title: 'AI Opportunity Detection',
      description:
        'Instantly extracts role titles, company names, qualification criteria, graduation batch cutoffs, CGPA gates, and stipend or prize money without manual searching.',
      highlights: [
        'Batch & CGPA Cutoff Extraction',
        'Internships, Hackathons & Scholarships',
        'Verified Legitimacy Scoring',
      ],
      previewSnippet: 'Criteria: 2026 Batch • Min 7.5 CGPA • $7,800/mo Stipend • In-person + Remote',
    },
    {
      icon: BrainCircuit,
      color: 'from-violet-500 to-purple-600',
      badge: 'Diagnostic Core',
      title: 'Skill Match Analysis',
      description:
        'Compares your current resume and GitHub profile against historical interview questions. Pinpoints exact strengths you already possess and critical technical blindspots you need to resolve.',
      highlights: [
        'Resume vs. JD Semantic Matching',
        'Blindspot Identification',
        'Interview Weightage Weighting',
      ],
      previewSnippet: 'Match: 88% • Matched: Python, DSA • Missing: Graph BFS/DFS, System Design',
    },
    {
      icon: Route,
      color: 'from-purple-500 to-pink-600',
      badge: 'Adaptive Sprint',
      title: 'Personalized Preparation',
      description:
        'Generates an agile, day-by-day prep plan calibrated to the company\'s historical rounds. Delivers curated LeetCode patterns, system design summaries, and mock evaluation checklists.',
      highlights: [
        'Tailored 14 to 30-Day Roadmaps',
        'Curated Practice Problem Sets',
        'Company-Specific Behavioral Prep',
      ],
      previewSnippet: 'Today (Day 12): 2 LeetCode Graph Mediums + STAR behavioral method review',
    },
    {
      icon: CalendarClock,
      color: 'from-amber-500 to-orange-600',
      badge: 'Urgency Tracker',
      title: 'Deadline Tracking',
      description:
        'Calculates real application submission windows, early applicant advantage periods, and online assessment dates so you submit when hiring manager queues are freshest.',
      highlights: [
        'Dynamic Days-Remaining Countdown',
        'Rolling Admission Urgency Alerts',
        'Calendar Sync & Milestones',
      ],
      previewSnippet: 'Status: 14 Days Remaining • Early pool closes in 4 days (3.2x higher interview rate)',
    },
    {
      icon: MessageSquareCode,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Direct Nudges',
      title: 'WhatsApp Alerts',
      description:
        'Get actionable morning nudges directly on WhatsApp: daily practice problems, deadline countdowns, and instant notifications when high-match opportunities are detected.',
      highlights: [
        'Daily Morning Sprint Tasks',
        'Critical 48-Hour Deadline Pings',
        'Zero Distraction Direct Messages',
      ],
      previewSnippet: 'WhatsApp ping: "Alex, Day 12 task is live: 2 Graph DFS problems before your Google deadline!"',
    },
  ];

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-950/20 rounded-full blur-[160px] pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Zap className="w-3.5 h-3.5" />
            Core AI Capabilities
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Everything you need to turn <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-300">
              opportunity emails into job offers.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            From automated inbox ingestion to tailored WhatsApp study sprints, PrepPilot orchestrates your entire preparation cycle.
          </p>
        </div>

        {/* 6 Core Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group p-6 sm:p-7 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden backdrop-blur-sm"
              >
                {/* Ambient hover gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 group-hover:bg-indigo-500/10 rounded-full blur-2xl transition-all pointer-events-none"></div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} p-0.5 shadow-lg shadow-indigo-500/10`}>
                      <div className="w-full h-full bg-slate-950/90 rounded-[10px] flex items-center justify-center text-white">
                        <Icon className="w-6 h-6 text-indigo-300 group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white tracking-tight mb-2.5 group-hover:text-indigo-200 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
                    {feature.description}
                  </p>

                  {/* Feature Highlights */}
                  <div className="space-y-1.5 mb-5">
                    {feature.highlights.map((h) => (
                      <div key={h} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Micro Mock Snippet */}
                <div className="pt-3 border-t border-white/5">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 text-[11px] font-mono text-slate-400 leading-relaxed">
                    <span className="text-indigo-400 font-semibold block mb-0.5">Live Output:</span>
                    {feature.previewSnippet}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
