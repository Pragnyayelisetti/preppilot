import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ScannedEmail, Opportunity } from '../../types';
import {
  Mail,
  Search,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Send,
  RefreshCw,
  ExternalLink,
  Code
} from 'lucide-react';
import { LegitimacyBadge } from '../opportunities/LegitimacyBadge';

interface EmailIntelligenceViewProps {
  onViewOpportunity?: (opp: Opportunity) => void;
}

export const EmailIntelligenceView: React.FC<EmailIntelligenceViewProps> = ({
  onViewOpportunity
}) => {
  const [emails, setEmails] = useState<ScannedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<ScannedEmail | null>(null);

  // Raw Email Tester state
  const [testSender, setTestSender] = useState('recruiting@stripe.com');
  const [testSubject, setTestSubject] = useState('Stripe Software Engineering Internship 2026 - Invitation to Apply');
  const [testBody, setTestBody] = useState(`Hi Alex,

We are excited to invite you to apply for Stripe's Summer 2026 Software Engineering Internship program.

Position: Software Engineering Intern (Core Infrastructure & Payments API)
Location: San Francisco, CA / Remote (United States)
Eligibility: Candidates currently enrolled in a BS/MS program in Computer Science graduating between Dec 2026 and June 2027.
Required Skills: Distributed systems, Go/Ruby/Java, SQL, algorithmic problem solving.
Application Cutoff: October 15, 2026
Apply directly at: https://stripe.com/jobs/apply/swe-intern-2026

Selection Process:
1. Online Assessment (Algorithmic & Debugging)
2. Technical Pairing Round (API integration)
3. Culture & Values Conversation

Best regards,
Stripe University Talent Acquisition`);

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<Opportunity | null>(null);

  useEffect(() => {
    const fetchEmails = async () => {
      setLoading(true);
      try {
        const res = await api.getEmails();
        if (res?.emails) {
          setEmails(res.emails);
          setSelectedEmail(res.emails[0] || null);
        }
      } catch (err) {
        console.error('Error fetching emails:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, []);

  const handleRunEmailAnalyzer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testBody.trim() || analyzing) return;

    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const res = await api.processEmail({
        sender: testSender,
        subject: testSubject,
        emailText: testBody
      });

      if (res?.success && res?.opportunity) {
        setAnalysisResult(res.opportunity);
      }
    } catch (err) {
      console.error('Failed processing raw email:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div id="email-intelligence-view" className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-600" />
              <span>Email Intelligence & Extraction Engine</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect emails scanned from your connected Gmail or test custom emails through the AI parser.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>AI Opportunity Detector: Active</span>
          </div>
        </div>

        {/* Live Email Analyzer Playground */}
        <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Interactive Email Extraction Sandbox
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Paste any opportunity email to extract data</span>
          </div>

          <form onSubmit={handleRunEmailAnalyzer} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Sender Email
                </label>
                <input
                  type="text"
                  value={testSender}
                  onChange={(e) => setTestSender(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={testSubject}
                  onChange={(e) => setTestSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Raw Email Body Content
              </label>
              <textarea
                rows={5}
                value={testBody}
                onChange={(e) => setTestBody(e.target.value)}
                className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl bg-white leading-relaxed focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none text-slate-800"
              />
            </div>

            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={analyzing}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting Opportunities...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run AI Extraction & Verification</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Analysis Output */}
          {analysisResult && (
            <div className="mt-4 p-4 rounded-xl bg-white border border-emerald-200 shadow-xs space-y-3 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-emerald-800">
                    Extracted Opportunity: {analysisResult.company} - {analysisResult.title}
                  </span>
                </div>
                <LegitimacyBadge
                  score={analysisResult.confidenceScore}
                  level={analysisResult.confidenceLevel}
                  signals={analysisResult.confidenceBreakdown}
                  company={analysisResult.company}
                  size="sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Type:</span>{' '}
                  <span className="font-semibold text-slate-800 capitalize">{analysisResult.type}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Deadline:</span>{' '}
                  <span className="font-semibold text-slate-800">{analysisResult.deadline}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Match:</span>{' '}
                  <span className="font-semibold text-indigo-700">{analysisResult.relevanceScore}%</span>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                {onViewOpportunity && (
                  <button
                    onClick={() => onViewOpportunity(analysisResult)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>View Full Preparation Roadmap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scanned Emails Browser */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Inbox Scanned Records ({emails.length})
        </h2>

        <div className="divide-y divide-slate-100">
          {emails.map((em) => (
            <div
              key={em.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 p-2 rounded-lg transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{em.sender}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-slate-400">{em.date}</span>
                  {em.isOpportunity && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                      Opportunity Detected
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-slate-800">{em.subject}</div>
                <div className="text-xs text-slate-500 line-clamp-1">{em.snippet}</div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-[11px] font-semibold rounded-md ${
                    em.status === 'processed'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {em.status === 'processed' ? 'Processed ✓' : 'Filtered Out'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
