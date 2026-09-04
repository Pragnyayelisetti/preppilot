import React from 'react';
import {
  Bell,
  Mail,
  Calendar,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Clock
} from 'lucide-react';
import { DashboardPage } from './Sidebar';

interface NotificationsViewProps {
  onSelectPage: (page: DashboardPage) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onSelectPage }) => {
  const notifications = [
    {
      id: 'notif-1',
      type: 'interview',
      title: 'Interview Shortlist Extracted: TechNova',
      detail: 'Online assessment cleared with 94th percentile. Technical Round 1 scheduled for Sep 9, 2026.',
      time: '2 hours ago',
      read: false,
      targetPage: 'opportunities' as DashboardPage,
    },
    {
      id: 'notif-2',
      type: 'deadline',
      title: 'Deadline Approaching: ETHGlobal Singapore',
      detail: 'Final hackathon project submissions close in 8 days. Smart contract architecture pending.',
      time: '5 hours ago',
      read: false,
      targetPage: 'calendar' as DashboardPage,
    },
    {
      id: 'notif-3',
      type: 'sprint',
      title: 'Daily Preparation Streak: 7 Days!',
      detail: 'You completed 2 of 4 sprint tasks yesterday. Today’s goal: Review OOP & practice DBMS normalization.',
      time: '1 day ago',
      read: false,
      targetPage: 'preparation-hub' as DashboardPage,
    },
    {
      id: 'notif-4',
      type: 'email',
      title: 'Promotional Emails Filtered',
      detail: '9 irrelevant promotional blasts from third-party bootcamps were filtered out of your queue.',
      time: '2 days ago',
      read: true,
      targetPage: 'email-intelligence' as DashboardPage,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Bell className="w-4 h-4" />
            <span>Activity Stream</span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">Notifications & Alerts</h2>
          <p className="text-xs text-slate-400">
            Real-time tracking of parsed opportunities, preparation reminders, and deadlines.
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          3 Unread Alerts
        </span>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => onSelectPage(n.targetPage)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              !n.read
                ? 'bg-slate-900/90 border-indigo-500/40 hover:border-indigo-500/70 shadow-sm'
                : 'bg-slate-950/40 border-white/5 opacity-70'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                  n.type === 'interview'
                    ? 'bg-rose-500/20 text-rose-300'
                    : n.type === 'deadline'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {n.type === 'interview' ? (
                  <Mail className="w-4 h-4" />
                ) : n.type === 'deadline' ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{n.title}</h4>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{n.detail}</p>
                <span className="text-[10px] text-slate-500 font-mono block">{n.time}</span>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <span className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
