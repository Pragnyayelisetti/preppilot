import React, { useState } from 'react';
import { 
  Briefcase, 
  Code2, 
  Target, 
  Award, 
  Search, 
  MapPin, 
  Clock, 
  ArrowUpRight, 
  Filter, 
  ShieldCheck, 
  AlertCircle,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { MOCK_OPPORTUNITIES, Opportunity } from '../data/mockOpportunities';

interface OpportunityShowcaseProps {
  onSelectOpportunity: (opp: Opportunity) => void;
}

export const OpportunityShowcase: React.FC<OpportunityShowcaseProps> = ({ onSelectOpportunity }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Opportunities', count: MOCK_OPPORTUNITIES.length },
    { id: 'internship', label: 'Internships', icon: Briefcase, count: 1 },
    { id: 'hackathon', label: 'Hackathons', icon: Code2, count: 1 },
    { id: 'placement', label: 'Placements', icon: Target, count: 1 },
    { id: 'scholarship', label: 'Scholarships', icon: Award, count: 1 },
  ];

  const filteredOpportunities = MOCK_OPPORTUNITIES.filter((opp) => {
    const matchesCategory = activeCategory === 'all' || opp.type === activeCategory;
    const matchesQuery =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.skillsMatched.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  return (
    <section id="opportunities" className="py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Live Opportunity Radar
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Curated, Verified & Ranked for Your Profile
            </h2>
            <p className="mt-2 text-base text-slate-300 max-w-2xl">
              Real high-impact openings for the 2025–2026 hiring and hackathon season. Click any card to inspect the skill requirements and prep roadmap.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search roles, skills, companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40"
            />
          </div>
        </div>

        {/* Filter Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900/60 text-slate-300 border-white/5 hover:bg-slate-800/80 hover:border-white/10'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Opportunity Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOpportunities.map((opp) => (
            <div
              key={opp.id}
              onClick={() => onSelectOpportunity(opp)}
              className="group cursor-pointer p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-indigo-500/40 transition-all duration-300 shadow-lg hover:shadow-indigo-500/10 flex flex-col justify-between backdrop-blur-xl relative overflow-hidden"
            >
              {/* Subtle hover gradient */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none"></div>

              <div>
                {/* Header row with Company and Match Score */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      {opp.company}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-indigo-200 transition-colors leading-snug">
                      {opp.title}
                    </h3>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{opp.matchScore}% Match</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {opp.eligibilityStatus}
                    </span>
                  </div>
                </div>

                {/* Key metadata badges */}
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-300 my-4 pb-4 border-b border-white/5">
                  <span className="flex items-center gap-1 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {opp.location}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {opp.stipendOrPrize}
                  </span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <Clock className="w-3.5 h-3.5" />
                    {opp.deadline}
                  </span>
                </div>

                {/* Skills Preview */}
                <div className="space-y-2">
                  <div className="text-[11px] text-slate-400 font-medium">
                    Skills Matched:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {opp.skillsMatched.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded bg-white/5 text-slate-300 text-[11px] font-medium border border-white/5"
                      >
                        {skill}
                      </span>
                    ))}
                    {opp.skillsMatched.length > 4 && (
                      <span className="px-2 py-0.5 rounded bg-white/5 text-slate-400 text-[11px]">
                        +{opp.skillsMatched.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer with CTA */}
              <div className="pt-4 mt-5 border-t border-white/5 flex items-center justify-between">
                <div className="text-xs text-indigo-300 font-medium flex items-center gap-1">
                  <span>Sprint: {opp.roadmapSnapshot.totalDays} Days</span>
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                  <span>Inspect Preparation Plan</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
