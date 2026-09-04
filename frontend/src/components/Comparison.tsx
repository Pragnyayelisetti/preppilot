import React from 'react';
import { XCircle, CheckCircle2, Zap, ArrowRight } from 'lucide-react';

export const Comparison: React.FC = () => {
  const points = [
    {
      label: 'Opportunity Discovery',
      traditional: 'Endless manual browsing across 20+ disconnected portals, WhatsApp groups, and spam boards.',
      preppilot: 'Centralized AI stream filtering verified internships, hackathons, and grants matching your exact graduation year.',
    },
    {
      label: 'Eligibility Certainty',
      traditional: 'Apply blindly, only to get disqualified weeks later by unseen CGPA or degree batch limits.',
      preppilot: 'Instant deterministic eligibility audit before applying, checking all cutoffs and course prerequisites.',
    },
    {
      label: 'Skill Preparation',
      traditional: 'Overwhelmed by generic 500-question LeetCode lists with no idea what the specific company tests.',
      preppilot: 'Targeted skill gap diagnostic and company-tailored 14–30 day sprint focusing exclusively on missing competencies.',
    },
    {
      label: 'Interview Readiness',
      traditional: 'Cramming theoretical notes the night before with high anxiety and zero structure.',
      preppilot: 'Daily bite-sized milestones with real historical questions, system design blueprints, and behavioral rubrics.',
    },
    {
      label: 'Time to First Offer',
      traditional: '3 to 6 months of sporadic, unfocused effort with low interview conversion rates (~4%).',
      preppilot: 'High-conversion applications with 3.8x higher shortlisting rate and disciplined sprint tracking.',
    },
  ];

  return (
    <section id="comparison" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-slate-950/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Zap className="w-3.5 h-3.5" />
            The Paradigm Shift
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Why blind applications fail — <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-300">
              and preparation wins.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Stop treating university recruiting like a numbers game. Transform your preparation into an unfair competitive advantage.
          </p>
        </div>

        {/* Comparison Table / Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* The Old Way Card */}
          <div className="p-7 sm:p-9 rounded-3xl bg-slate-900/40 border border-rose-500/20 shadow-xl backdrop-blur-xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-rose-500/10">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">The Old Way</h3>
                <p className="text-xs text-rose-300">Spray-and-pray applications</p>
              </div>
            </div>

            <div className="space-y-4">
              {points.map((p, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-950/50 border border-white/5 space-y-1">
                  <div className="text-xs font-semibold text-slate-400">{p.label}</div>
                  <div className="text-xs sm:text-sm text-slate-300 leading-relaxed flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{p.traditional}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* The PrepPilot Way Card */}
          <div className="p-7 sm:p-9 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-violet-950/40 border border-indigo-500/40 shadow-2xl backdrop-blur-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between pb-4 border-b border-indigo-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">The PrepPilot Way</h3>
                  <p className="text-xs text-indigo-300">Targeted AI Intelligence & Daily Roadmaps</p>
                </div>
              </div>
              <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Recommended
              </span>
            </div>

            <div className="space-y-4 relative z-10">
              {points.map((p, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-slate-950/70 border border-indigo-500/20 hover:border-indigo-500/40 transition-colors space-y-1"
                >
                  <div className="text-xs font-semibold text-indigo-300">{p.label}</div>
                  <div className="text-xs sm:text-sm text-slate-100 leading-relaxed flex items-start gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{p.preppilot}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
