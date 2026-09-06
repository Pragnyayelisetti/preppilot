import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';

interface CtaSectionProps {
  onOpenDemo: (mode?: 'get-started' | 'how-it-works') => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ onOpenDemo }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-indigo-600/25 via-violet-600/25 to-purple-600/25 rounded-full blur-[140px] pointer-events-none -z-10"></div>

        {/* Card Box */}
        <div className="p-8 sm:p-14 lg:p-16 rounded-[32px] bg-gradient-to-b from-slate-900/90 via-slate-900/95 to-slate-950/95 border border-indigo-500/30 shadow-2xl backdrop-blur-2xl text-center relative overflow-hidden">
          {/* Subtle line decorations */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Hackathon Special Edition • Free for University Students
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
            Turn every opportunity <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-300">
              into preparation.
            </span>
          </h2>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Stop letting career emails get lost in your inbox. Forward your next opportunity email or sign up free to get tailored skill gap audits and daily WhatsApp preparation sprints.
          </p>

          {/* Quick email / action input */}
          <div className="mt-8 max-w-md mx-auto">
            {subscribed ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>You're in! Redirecting to your student dashboard...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your college .edu or student email"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-950/80 border border-white/15 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/30 transition-all shrink-0 hover:scale-[1.02]"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Guarantees */}
          <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>100% Free Forever for Students</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Instant AI Skill Audit</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
