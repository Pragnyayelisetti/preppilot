import React, { useState } from 'react';
import {
  Target,
  Filter,
  Search,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Award,
  Briefcase
} from 'lucide-react';
import { Opportunity, MOCK_OPPORTUNITIES } from '../../data/mockOpportunities';
import { TECHNOVA_OPPORTUNITY } from './dashboardData';

interface OpportunitiesRadarViewProps {
  onSelectOpportunity: (opportunity: Opportunity) => void;
}

export const OpportunitiesRadarView: React.FC<OpportunitiesRadarViewProps> = ({
  onSelectOpportunity,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [realOpportunities, setRealOpportunities] = useState<Opportunity[]>(() => {
    try {
      const saved = localStorage.getItem('preppilot_real_opportunities');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return [];
  });

  React.useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem('preppilot_real_opportunities');
        if (saved) setRealOpportunities(JSON.parse(saved));
      } catch {
        // Ignore
      }
    };
    window.addEventListener('preppilot:inbox-synced', handleSync);
    return () => window.removeEventListener('preppilot:inbox-synced', handleSync);
  }, []);

  const allOpportunities = [...realOpportunities, TECHNOVA_OPPORTUNITY, ...MOCK_OPPORTUNITIES];

  const filtered = allOpportunities.filter((opp) => {
    const matchesType = filterType === 'all' || opp.type === filterType;
    const matchesSearch =
      opp.title.toLowerCase().includes(search.toLowerCase()) ||
      opp.company.toLowerCase().includes(search.toLowerCase()) ||
      opp.skillsMatched.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Target className="w-4 h-4" />
            <span>AI Opportunity Match Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Monitored Opportunities Radar
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Every opportunity is dynamically matched against your technical skills, college cohort, and graduation timeline. Select any card to review criteria and roadmap tasks.
          </p>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-950/80 border border-white/10 shrink-0">
          <div className="text-center">
            <div className="text-xs text-slate-400 font-medium">Opportunities</div>
            <div className="text-2xl font-black text-white mt-0.5">{allOpportunities.length}</div>
          </div>
          <div className="h-8 w-px bg-white/10"></div>
          <div className="text-center">
            <div className="text-xs text-slate-400 font-medium">Avg Match</div>
            <div className="text-2xl font-black text-indigo-400 mt-0.5">88%</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['all', 'placement', 'internship', 'hackathon', 'scholarship'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
                filterType === type
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              {type === 'all' ? 'All Roles' : `${type}s`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company or skill..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Opportunities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((opp) => (
          <div
            key={opp.id}
            onClick={() => onSelectOpportunity(opp)}
            className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-indigo-500/50 transition-all cursor-pointer group flex flex-col justify-between hover:scale-[1.01] shadow-lg relative overflow-hidden"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
                  {opp.company}
                </span>

                <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{opp.matchScore}% Match</span>
                </span>
              </div>

              <h3 className="text-base font-black text-white group-hover:text-indigo-300 transition-colors">
                {opp.title}
              </h3>

              <div className="flex flex-wrap items-center gap-1.5">
                {opp.skillsMatched.slice(0, 4).map((s) => (
                  <span
                    key={s}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                  >
                    {s}
                  </span>
                ))}
                {opp.skillsMatched.length > 4 && (
                  <span className="text-[10px] text-slate-500">
                    +{opp.skillsMatched.length - 4}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {opp.aiSuggestion}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{opp.deadline}</span>
              </span>

              <span className="text-indigo-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>View Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
