import React, { useState } from 'react';
import {
  Mail,
  Filter,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { DEMO_EMAILS, EmailLog } from './dashboardData';
import { Opportunity } from '../../data/mockOpportunities';

interface EmailIntelligenceViewProps {
  userName: string;
  onSelectOpportunity: (opp: Opportunity) => void;
  onSimulateForward: () => void;
}

export const EmailIntelligenceView: React.FC<EmailIntelligenceViewProps> = ({
  userName,
  onSelectOpportunity,
  onSimulateForward,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'opportunity' | 'promotional'>('all');
  const [copied, setCopied] = useState(false);

  const forwardAddress = `prep+${userName.toLowerCase().replace(/\s+/g, '')}@preppilot.ai`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(forwardAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredEmails = DEMO_EMAILS.filter((e) => {
    if (activeFilter === 'all') return true;
    return e.type === activeFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Banner / Ingestion Engine Info */}
      <div className="p-6 rounded-3xl bg-indigo-950/40 border border-indigo-500/30 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Smart Email Extraction Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Inbound Recruitment Email Processing
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              PrepPilot monitors your forwarding channel, separates real interview shortlists and hackathon registrations from spam, and automatically builds personalized preparation plans.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs text-slate-400 font-medium">Your Dedicated Forwarding Address:</span>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 font-mono text-xs text-indigo-300">
                <span>{forwardAddress}</span>
                <button
                  onClick={handleCopy}
                  className="p-1 hover:text-white text-slate-400"
                  title="Copy address"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-stretch gap-3">
            <button
              onClick={onSimulateForward}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>Simulate Inbound Email</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10">
          <div className="text-xs font-bold text-slate-400 uppercase">Emails Analyzed</div>
          <div className="text-2xl font-black text-white mt-1">12</div>
          <div className="text-[11px] text-indigo-400 mt-1">100% classification accuracy</div>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
          <div className="text-xs font-bold text-emerald-400 uppercase">Opportunities Detected</div>
          <div className="text-2xl font-black text-emerald-300 mt-1">3</div>
          <div className="text-[11px] text-emerald-400 mt-1">TechNova, ETHGlobal, Apex</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10">
          <div className="text-xs font-bold text-slate-400 uppercase">Promotions & Spam Filtered</div>
          <div className="text-2xl font-black text-slate-400 mt-1">9</div>
          <div className="text-[11px] text-slate-500 mt-1">Bootcamp blasts silenced</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            All Emails (5)
          </button>
          <button
            onClick={() => setActiveFilter('opportunity')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'opportunity'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            Opportunities (3)
          </button>
          <button
            onClick={() => setActiveFilter('promotional')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'promotional'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            Filtered Out (2)
          </button>
        </div>
      </div>

      {/* Emails Stream List */}
      <div className="space-y-3">
        {filteredEmails.map((email) => {
          const isOpp = email.type === 'opportunity';
          return (
            <div
              key={email.id}
              className={`p-5 rounded-2xl border transition-all ${
                isOpp
                  ? 'bg-slate-900/80 border-indigo-500/30 hover:border-indigo-500/60'
                  : 'bg-slate-950/40 border-white/5 opacity-70'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      isOpp
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isOpp ? 'Opportunity Detected' : 'Filtered Promotional'}
                  </span>

                  {email.stage && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Stage: {email.stage}
                    </span>
                  )}

                  <span className="text-xs text-slate-400">{email.sender}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                  <span>Confidence: {email.confidenceScore}%</span>
                  <span>•</span>
                  <span>{email.timestamp}</span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-white mt-1">{email.subject}</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{email.snippet}</p>

              {isOpp && (
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-indigo-400 font-medium">
                    Entity: {email.extractedCompany} • Preparation sprint created
                  </span>
                  <span className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer">
                    <span>View Extracted Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
