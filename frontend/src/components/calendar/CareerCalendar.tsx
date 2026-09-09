import React, { useState, useEffect } from 'react';
import { Opportunity } from '../../types';
import { api } from '../../services/api';
import {
  Calendar as CalendarIcon,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Award
} from 'lucide-react';

interface CareerCalendarProps {
  opportunities?: Opportunity[];
  onSelectOpportunity: (opp: Opportunity) => void;
  onTakeMockTest: (opp: Opportunity) => void;
}

export const CareerCalendar: React.FC<CareerCalendarProps> = ({
  opportunities = [],
  onSelectOpportunity,
  onTakeMockTest
}) => {
  const [currentMonth, setCurrentMonth] = useState('September 2026');
  const [items, setItems] = useState<Opportunity[]>(opportunities);

  useEffect(() => {
    if (opportunities.length > 0) {
      setItems(opportunities);
    } else {
      api.getOpportunities().then(res => {
        if (res?.opportunities) {
          setItems(res.opportunities);
        }
      }).catch(err => console.error(err));
    }
  }, [opportunities]);

  const events = items.map(opp => {
    const isUrgent = opp.daysRemaining <= 5;
    const isCompleted = opp.status === 'applied';

    let statusType: 'urgent' | 'upcoming' | 'completed' = 'upcoming';
    if (isCompleted) statusType = 'completed';
    else if (isUrgent) statusType = 'urgent';

    return {
      opportunity: opp,
      title: `${opp.company} - ${opp.title}`,
      date: opp.deadline,
      daysLeft: opp.daysRemaining,
      statusType
    };
  });

  return (
    <div id="career-calendar-view" className="space-y-6 animate-fade-in pb-12">
      {/* Calendar Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-600" />
              <span>Career & Recruitment Calendar</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Track deadlines, online assessment windows, and campus drive schedules.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Legend */}
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-medium">
                🔴 Deadline approaching
              </span>
              <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                🟡 Upcoming
              </span>
              <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                🟢 Completed / Applied
              </span>
            </div>
          </div>
        </div>

        {/* Timeline Events List */}
        <div className="space-y-4 mt-6">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            September 2026 Deadlines & Milestones
          </h2>

          <div className="space-y-3">
            {events.map((evt, idx) => {
              const borderClass = {
                urgent: 'border-rose-200 bg-rose-50/20',
                upcoming: 'border-amber-200 bg-amber-50/20',
                completed: 'border-emerald-200 bg-emerald-50/20'
              }[evt.statusType];

              const badgeClass = {
                urgent: 'bg-rose-100 text-rose-800 border-rose-200',
                upcoming: 'bg-amber-100 text-amber-800 border-amber-200',
                completed: 'bg-emerald-100 text-emerald-800 border-emerald-200'
              }[evt.statusType];

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border ${borderClass} flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-xs`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {evt.date.split(' ')[0]}
                      </span>
                      <span className="text-base font-extrabold text-slate-900 leading-tight">
                        {evt.date.split(' ')[1]?.replace(',', '') || '15'}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase ${badgeClass}`}>
                          {evt.statusType === 'urgent' ? 'Closing Soon' : evt.statusType === 'completed' ? 'Applied' : 'Active'}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {evt.daysLeft} days remaining
                        </span>
                      </div>

                      <h3
                        onClick={() => onSelectOpportunity(evt.opportunity)}
                        className="text-sm font-bold text-slate-900 mt-1 hover:text-indigo-600 transition-colors cursor-pointer"
                      >
                        {evt.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {evt.opportunity.location} • {evt.opportunity.workMode} • {evt.opportunity.confidenceScore}% Legitimate
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onTakeMockTest(evt.opportunity)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>Practice OA</span>
                    </button>
                    <button
                      onClick={() => onSelectOpportunity(evt.opportunity)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>View Roadmap</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
