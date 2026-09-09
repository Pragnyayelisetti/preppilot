import React from 'react';
import { Opportunity } from '../../types';
import { LegitimacyBadge } from './LegitimacyBadge';
import { Calendar, Clock, MapPin, Sparkles, ArrowRight, ExternalLink, Bookmark, CheckCircle } from 'lucide-react';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onView: (opp: Opportunity) => void;
  onPrepare: (opp: Opportunity) => void;
  onStatusChange?: (id: string, status: string) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onView,
  onPrepare,
  onStatusChange
}) => {
  const isUrgent = opportunity.daysRemaining <= 5;

  const typeStyles: Record<string, { label: string; color: string }> = {
    internship: { label: 'Internship', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    job: { label: 'Full-Time Job', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    hackathon: { label: 'Hackathon', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    contest: { label: 'Coding Contest', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    fellowship: { label: 'Fellowship', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    scholarship: { label: 'Scholarship', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    workshop: { label: 'Workshop', color: 'bg-slate-50 text-slate-700 border-slate-200' },
    placement: { label: 'Campus Drive', color: 'bg-rose-50 text-rose-700 border-rose-200' }
  };

  const typeBadge = typeStyles[opportunity.type] || {
    label: opportunity.type,
    color: 'bg-slate-50 text-slate-700 border-slate-200'
  };

  return (
    <div
      id={`opp-card-${opportunity.id}`}
      className="group relative bg-white border border-slate-200/90 hover:border-slate-300 rounded-xl p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
    >
      <div>
        {/* Header Row: Company avatar + type badge + status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-base shadow-2xs overflow-hidden shrink-0">
              {opportunity.companyLogo ? (
                <img
                  src={opportunity.companyLogo}
                  alt={opportunity.company}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{opportunity.company.charAt(0)}</span>
              )}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 leading-tight">
                {opportunity.company}
              </h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {opportunity.location}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-medium">{opportunity.workMode}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${typeBadge.color}`}
            >
              {typeBadge.label}
            </span>
          </div>
        </div>

        {/* Opportunity Title */}
        <h3
          onClick={() => onView(opportunity)}
          className="text-base font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors cursor-pointer mb-2.5 line-clamp-2 tracking-tight"
        >
          {opportunity.title}
        </h3>

        {/* Confidence & Relevance Scores Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-3.5">
          <LegitimacyBadge
            score={opportunity.confidenceScore}
            level={opportunity.confidenceLevel}
            signals={opportunity.confidenceBreakdown}
            company={opportunity.company}
            size="sm"
          />

          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/70">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>{opportunity.relevanceScore}% Match</span>
          </div>
        </div>

        {/* Skills chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {opportunity.requiredSkills.slice(0, 4).map((skill, i) => (
            <span
              key={i}
              className="px-2 py-0.5 text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-200/60 rounded-md"
            >
              {skill}
            </span>
          ))}
          {opportunity.requiredSkills.length > 4 && (
            <span className="px-1.5 py-0.5 text-[11px] text-slate-400 font-medium">
              +{opportunity.requiredSkills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Footer Area: Deadline info + CTA Actions */}
      <div className="pt-3 border-t border-slate-100 mt-2">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3.5">
          <div className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Deadline: <strong className="text-slate-800 font-semibold">{opportunity.deadline}</strong>
            </span>
          </div>
          <div
            className={`flex items-center gap-1 font-semibold ${
              isUrgent ? 'text-rose-600' : 'text-slate-600'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{opportunity.daysRemaining} days left</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            id={`btn-view-opp-${opportunity.id}`}
            onClick={() => onView(opportunity)}
            className="w-full py-2 px-3 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <span>View Details</span>
          </button>
          <button
            id={`btn-prep-opp-${opportunity.id}`}
            onClick={() => onPrepare(opportunity)}
            className="w-full py-2 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>Prepare Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
