import React from 'react';
import { Sparkles, Play, ArrowRight, ShieldCheck, CheckCircle2, Award, Users, TrendingUp, Zap } from 'lucide-react';
import { DashboardPreview } from './DashboardPreview';
import { Opportunity } from '../data/mockOpportunities';

interface HeroProps {
  onOpenDemo: (mode?: 'get-started' | 'how-it-works' | 'sign-in') => void;
  onOpenActionPlan?: (opportunity: Opportunity) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenDemo, onOpenActionPlan }) => {
  return (
    <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background ambient decorative blurs */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-[10%] right-[10%] w-[450px] h-[450px] bg-violet-600/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[0%] left-[5%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide uppercase mb-6 shadow-sm shadow-indigo-500/10">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <span className="font-bold">Next-Gen AI Career Copilot for Students</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300 font-normal">2025–26 Cycle Active</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] max-w-4xl">
          Don't just find opportunities.{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-300">
            Prepare for them.
          </span>
        </h1>

        {/* Short Description */}
        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed font-normal">
          PrepPilot uses AI to understand your opportunity emails, identify what matters, and tell you exactly what to prepare before it's too late.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => onOpenDemo('get-started')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white px-8 py-4 rounded-xl font-bold text-base shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200 border border-white/20"
            id="hero-primary-cta"
          >
            <Sparkles className="w-5 h-5 text-indigo-200" />
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onOpenDemo('how-it-works')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-slate-900/80 hover:bg-slate-800/90 text-slate-200 hover:text-white px-8 py-4 rounded-xl font-bold text-base border border-white/10 hover:border-white/20 shadow-lg shadow-black/40 hover:-translate-y-0.5 transition-all duration-200 backdrop-blur-md"
            id="hero-secondary-cta"
          >
            <Play className="w-4 h-4 text-indigo-400 fill-indigo-400/40" />
            <span>See How It Works</span>
          </button>
        </div>

        {/* Micro Value Prop Bullets */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>No generic job board spam</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>100% Free for College Students</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Tailored DSA & System Design Roadmaps</span>
          </div>
        </div>

        {/* High-Fidelity Interactive Dashboard Preview */}
        <DashboardPreview onOpenActionPlan={onOpenActionPlan} />

        {/* Quick Proof Metrics Row */}
        <div className="mt-14 w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-10 border-t border-white/5">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
            <div className="text-2xl sm:text-3xl font-black text-white">4,800+</div>
            <div className="text-xs text-slate-400 mt-1">Verified Opportunities</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
            <div className="text-2xl sm:text-3xl font-black text-indigo-400">96.8%</div>
            <div className="text-xs text-slate-400 mt-1">Eligibility Audit Accuracy</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
            <div className="text-2xl sm:text-3xl font-black text-violet-400">30 Days</div>
            <div className="text-xs text-slate-400 mt-1">Average Prep Sprint</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">3.8x</div>
            <div className="text-xs text-slate-400 mt-1">Higher Selection Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
};
