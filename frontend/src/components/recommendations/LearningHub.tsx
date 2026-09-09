import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CourseRecommendation } from '../../types';
import {
  Sparkles,
  BookOpen,
  Award,
  Play,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Clock,
  Compass,
  ArrowRight,
  RefreshCw,
  Mail
} from 'lucide-react';

interface LearningHubProps {
  onStartGeneralMockTest: () => void;
  onStartGeneralMockInterview: () => void;
  onScanAgain?: () => void;
  isGmailConnected?: boolean;
  onConnectGmail?: () => void;
}

export const LearningHub: React.FC<LearningHubProps> = ({
  onStartGeneralMockTest,
  onStartGeneralMockInterview,
  onScanAgain,
  isGmailConnected,
  onConnectGmail
}) => {
  const [data, setData] = useState<{
    userGreeting: string;
    courses: CourseRecommendation[];
    recommendedSkills: any[];
    careerMilestones: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.getRecommendations();
        if (res) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed fetching recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-600 font-medium">Curating personalized learning recommendations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* No-opportunities explanatory card */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-400/25 inline-flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              <span>Career Acceleration Mode</span>
            </span>
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white">
              {isGmailConnected
                ? 'No matching opportunities yet in your inbox.'
                : 'Connect your Gmail to discover opportunities.'}
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isGmailConnected
                ? 'While PrepPilot continuously monitors incoming correspondence, here is your customized curriculum to sharpen your competitive edge and crack top-tier technical drives.'
                : 'Connect your Gmail and PrepPilot will scan it for real internship, job, and hackathon opportunities. Until then, here is a customized curriculum based on your profile.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {!isGmailConnected && onConnectGmail && (
              <button
                onClick={onConnectGmail}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Connect Gmail</span>
              </button>
            )}
            {isGmailConnected && onScanAgain && (
              <button
                onClick={onScanAgain}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl transition-colors border border-slate-700 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-scan Mailbox</span>
              </button>
            )}

            <button
              onClick={onStartGeneralMockTest}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Take General SDE Mock</span>
            </button>
          </div>
        </div>

        {/* Quick Action CTAs Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800">
          <button
            onClick={onStartGeneralMockTest}
            className="p-3.5 bg-slate-800/70 hover:bg-slate-800 rounded-xl border border-slate-700/60 text-left transition-colors flex items-center justify-between group"
          >
            <div>
              <div className="text-[11px] text-indigo-300 font-bold uppercase tracking-wider">General Assessment</div>
              <div className="text-sm font-bold text-white mt-0.5">Take SDE Mock Test</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            onClick={onStartGeneralMockInterview}
            className="p-3.5 bg-slate-800/70 hover:bg-slate-800 rounded-xl border border-slate-700/60 text-left transition-colors flex items-center justify-between group"
          >
            <div>
              <div className="text-[11px] text-indigo-300 font-bold uppercase tracking-wider">AI Simulator</div>
              <div className="text-sm font-bold text-white mt-0.5">Start Mock Interview</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>

          <div className="p-3.5 bg-slate-800/70 rounded-xl border border-slate-700/60 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">Continuous Scanner</div>
              <div className="text-sm font-bold text-white mt-0.5">Auto-Scan Enabled</div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Recommended Skills to Learn */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Recommended Skills for Your Goals</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identified from high-frequency technical online assessments and interview rounds.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data?.recommendedSkills.map((sk: any, i: number) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all bg-slate-50/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
                  <span className="text-indigo-600">{sk.matchingRole}</span>
                  <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">
                    {sk.priority}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-xs">{sk.skill}</h3>
                <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                  {sk.why}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Est. {sk.hoursToMaster}</span>
                <span className="font-semibold text-indigo-600">Curated</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Curated Courses & Learning Resources */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Curated Courses & Learning Pathways</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified free and premier engineering curriculums with high student clearance rates.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.courses.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all bg-white flex flex-col justify-between shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-600 font-medium">
                    {c.difficulty}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{c.title}</h3>

              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Free Resource
                </span>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>Start Course</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
