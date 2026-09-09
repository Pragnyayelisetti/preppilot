import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Opportunity } from '../../types';
import { OpportunityCard } from '../opportunities/OpportunityCard';
import { LearningHub } from '../recommendations/LearningHub';
import {
  Sparkles,
  ShieldCheck,
  Clock,
  Briefcase,
  Search,
  Filter,
  RefreshCw,
  Mail,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Layers,
  Award
} from 'lucide-react';

interface OverviewDashboardProps {
  onSelectOpportunity: (opp: Opportunity) => void;
  onPrepareOpportunity: (opp: Opportunity) => void;
  onStartGeneralMockTest: () => void;
  onStartGeneralMockInterview: () => void;
  onOpenGmailConnect: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  onSelectOpportunity,
  onPrepareOpportunity,
  onStartGeneralMockTest,
  onStartGeneralMockInterview,
  onOpenGmailConnect
}) => {
  const { user, hasOpportunities, setHasOpportunities, syncInbox } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedConfidence, setSelectedConfidence] = useState<string>('all');

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await api.getOpportunities();
      if (res?.opportunities) {
        setOpportunities(res.opportunities);
        if (res.hasFoundOpportunities !== undefined) {
          setHasOpportunities(res.hasFoundOpportunities);
        }
      }
    } catch (err) {
      console.error('Error fetching opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      await syncInbox();
      await fetchOpportunities();
    } catch (err) {
      console.error('Error during inbox sync:', err);
    } finally {
      setSyncing(false);
    }
  };

  // Filtered opportunities
  const filtered = opportunities.filter((opp) => {
    const matchesSearch =
      opp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.requiredSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'all' || opp.type === selectedType;
    const matchesConfidence =
      selectedConfidence === 'all' ||
      (selectedConfidence === 'very_high' && opp.confidenceLevel === 'very_high') ||
      (selectedConfidence === 'high' && (opp.confidenceLevel === 'high' || opp.confidenceLevel === 'very_high'));

    return matchesSearch && matchesType && matchesConfidence;
  });

  // Calculate statistics
  const totalCount = opportunities.length;
  const highConfidenceCount = opportunities.filter(
    o => o.confidenceLevel === 'very_high' || o.confidenceLevel === 'high'
  ).length;
  const urgentCount = opportunities.filter(o => o.daysRemaining <= 5).length;
  const nearestDeadline = opportunities
    .filter(o => o.daysRemaining > 0)
    .sort((a, b) => a.daysRemaining - b.daysRemaining)[0];

  // No opportunities found in the connected inbox yet — fall back to
  // interest-based recommendations instead of an empty dashboard.
  if (!hasOpportunities) {
    return (
      <div className="space-y-6 animate-fade-in">
        <LearningHub
          onStartGeneralMockTest={onStartGeneralMockTest}
          onStartGeneralMockInterview={onStartGeneralMockInterview}
          onScanAgain={() => handleManualSync()}
          isGmailConnected={!!user?.isGmailConnected}
          onConnectGmail={onOpenGmailConnect}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Greeting & Header Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                Career Intelligence Active
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">
                Connected: {user?.connectedGmailAddress || 'Gmail'}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Good morning, {user?.name?.split(' ')[0] || 'Alex'}
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Verified career opportunities extracted from your email, deadline schedules, and preparation blueprints.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleManualSync()}
              disabled={syncing}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing Mailbox...' : 'Scan Inbox for Opportunities'}</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4.5 rounded-xl bg-slate-50/70 border border-slate-200/80">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              VERIFIED OPPORTUNITIES
            </div>
            <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">{totalCount}</div>
            <div className="text-xs text-slate-500 mt-0.5 font-medium">Extracted from mailbox</div>
          </div>

          <div className="p-4.5 rounded-xl bg-emerald-50/50 border border-emerald-200/70">
            <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              HIGH CONFIDENCE
            </div>
            <div className="text-2xl lg:text-3xl font-extrabold text-emerald-950 mt-1 tracking-tight">{highConfidenceCount}</div>
            <div className="text-xs text-emerald-700 mt-0.5 font-medium">&gt;85% Legitimacy Score</div>
          </div>

          <div className="p-4.5 rounded-xl bg-rose-50/50 border border-rose-200/70">
            <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
              CLOSING SOON
            </div>
            <div className="text-2xl lg:text-3xl font-extrabold text-rose-950 mt-1 tracking-tight">{urgentCount}</div>
            <div className="text-xs text-rose-700 mt-0.5 font-medium">&le; 5 days remaining</div>
          </div>

          <div className="p-4.5 rounded-xl bg-indigo-50/50 border border-indigo-200/70 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">
                NEAREST DEADLINE
              </div>
              <div className="text-sm font-bold text-indigo-950 mt-1 line-clamp-1">
                {nearestDeadline?.company || 'Google'}
              </div>
              <div className="text-xs text-indigo-700 mt-0.5 font-medium">
                {nearestDeadline?.daysRemaining || 2} days left ({nearestDeadline?.deadline || 'Sep 18'})
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Deadline Notification Banner */}
      {nearestDeadline && (
        <div className="p-4.5 rounded-xl bg-slate-900 text-white shadow-xs border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Critical Upcoming Deadline:</span>
                <span className="text-indigo-300 font-semibold">{nearestDeadline.company} — {nearestDeadline.title}</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Application window closes in {nearestDeadline.daysRemaining} days. Complete your preparation checklist and attempt the timed assessment.
              </p>
            </div>
          </div>

          <button
            onClick={() => onPrepareOpportunity(nearestDeadline)}
            className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto shadow-xs shrink-0"
          >
            Review Prep Roadmap
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company, role title, or skill (e.g. Google, Python, SDE)..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white placeholder-slate-400 font-medium text-slate-800 transition-all"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
          >
            <option value="all">All Opportunity Types</option>
            <option value="internship">Internships</option>
            <option value="job">Full-Time Jobs</option>
            <option value="hackathon">Hackathons</option>
            <option value="contest">Contests</option>
            <option value="placement">Campus Placement</option>
          </select>

          {/* Confidence Filter */}
          <select
            value={selectedConfidence}
            onChange={(e) => setSelectedConfidence(e.target.value)}
            className="px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
          >
            <option value="all">All Legitimacy Scores</option>
            <option value="very_high">Very High Confidence (90%+)</option>
            <option value="high">High Confidence (75%+)</option>
          </select>
        </div>
      </div>

      {/* Opportunities Grid */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-600 font-medium">Scanning verified opportunities...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onView={onSelectOpportunity}
              onPrepare={onPrepareOpportunity}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs space-y-3">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No matching opportunities found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedType('all');
              setSelectedConfidence('all');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
