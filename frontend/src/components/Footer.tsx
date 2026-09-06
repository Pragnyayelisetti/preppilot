import React from 'react';
import { Sparkles, Heart, ExternalLink, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 bg-slate-950/80 pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-slate-400 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 border border-white/10">
                P
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                PrepPilot
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              The AI career intelligence copilot for university students. Discover internships, hackathons, and scholarships, verify your true eligibility, and master your preparation roadmaps.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>All Systems Operational • Prep Engine v2.4 Active</span>
            </div>
          </div>

          {/* Nav Col 1 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Opportunities
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#opportunities" className="hover:text-white transition-colors">
                  Tech Internships 2025
                </a>
              </li>
              <li>
                <a href="#opportunities" className="hover:text-white transition-colors">
                  Global Hackathons
                </a>
              </li>
              <li>
                <a href="#opportunities" className="hover:text-white transition-colors">
                  Campus Placements
                </a>
              </li>
              <li>
                <a href="#opportunities" className="hover:text-white transition-colors">
                  STEM Scholarships & Grants
                </a>
              </li>
            </ul>
          </div>

          {/* Nav Col 2 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              AI Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#mockup" className="hover:text-white transition-colors">
                  Eligibility AI Auditor
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Skill Gap Diagnostics
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  30-Day Preparation Sprints
                </a>
              </li>
              <li>
                <a href="#mockup" className="hover:text-white transition-colors">
                  Company OA Simulator
                </a>
              </li>
            </ul>
          </div>

          {/* Nav Col 3 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Community & Demo
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  Hackathon Showcase
                </a>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Student Discord</span>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </a>
              </li>
              <li>
                <a href="#comparison" className="hover:text-white transition-colors">
                  Success Stories
                </a>
              </li>
              <li>
                <span className="text-indigo-400 font-semibold cursor-pointer">
                  Student Ambassador Program
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} PrepPilot Inc. Built for university hackathon demo.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-slate-400 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-slate-400 transition-colors">
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
