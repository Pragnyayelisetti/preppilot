import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Target,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { DEMO_DEADLINES } from './dashboardData';

export const CalendarView: React.FC = () => {
  const [selectedEventId, setSelectedEventId] = useState<string>('dl-1');

  const events = [
    { day: 9, title: 'TechNova Interview (Round 1)', type: 'interview', urgency: 'high', time: '11:00 AM' },
    { day: 12, title: 'ETHGlobal Hackathon Submission', type: 'hackathon', urgency: 'medium', time: '11:59 PM' },
    { day: 16, title: 'Apex Corp Coding Assessment', type: 'assessment', urgency: 'normal', time: '6:00 PM' },
    { day: 22, title: 'Mock Technical Interview Sprint', type: 'mock', urgency: 'normal', time: '4:00 PM' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <CalendarIcon className="w-4 h-4" />
            <span>Opportunity Timeline</span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">September 2026 Schedule</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronized recruitment deadlines and preparation milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-white">
            September 2026
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Matrix (Left 2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 pb-2 border-b border-white/10">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Empty slots for month padding */}
            {[...Array(2)].map((_, i) => (
              <div key={`empty-${i}`} className="h-14 sm:h-20 rounded-xl bg-slate-950/20 opacity-30"></div>
            ))}

            {/* Days 1 to 30 */}
            {[...Array(30)].map((_, i) => {
              const day = i + 1;
              const event = events.find((e) => e.day === day);
              const isToday = day === 4;

              return (
                <div
                  key={day}
                  className={`h-16 sm:h-22 p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between transition-all ${
                    event
                      ? event.urgency === 'high'
                        ? 'bg-rose-950/30 border-rose-500/40'
                        : event.urgency === 'medium'
                        ? 'bg-amber-950/30 border-amber-500/40'
                        : 'bg-indigo-950/30 border-indigo-500/30'
                      : isToday
                      ? 'bg-indigo-600/10 border-indigo-500/50'
                      : 'bg-slate-950/40 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px]'
                          : 'text-slate-300'
                      }`}
                    >
                      {day}
                    </span>
                    {isToday && (
                      <span className="hidden sm:inline text-[9px] font-bold text-indigo-400 uppercase">
                        Today
                      </span>
                    )}
                  </div>

                  {event && (
                    <div
                      className={`p-1 rounded text-[9px] font-bold leading-tight truncate ${
                        event.urgency === 'high'
                          ? 'bg-rose-500/30 text-rose-200'
                          : event.urgency === 'medium'
                          ? 'bg-amber-500/30 text-amber-200'
                          : 'bg-indigo-500/30 text-indigo-200'
                      }`}
                      title={event.title}
                    >
                      <span className="hidden sm:inline">{event.title}</span>
                      <span className="sm:hidden">{event.type}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Deadlines Breakdown Sidebar (Right col) */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Upcoming Milestones</span>
            </h3>

            <div className="space-y-3">
              {DEMO_DEADLINES.map((dl) => (
                <div
                  key={dl.id}
                  className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{dl.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        dl.urgency === 'high'
                          ? 'bg-rose-500/20 text-rose-300'
                          : dl.urgency === 'medium'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {dl.daysRemaining} days left
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {dl.companyOrOrg} • {dl.dateStr}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>Sync with Google Calendar or Apple iCal in Settings.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
