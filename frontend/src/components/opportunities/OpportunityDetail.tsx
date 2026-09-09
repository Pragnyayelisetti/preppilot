import React, { useState, useEffect } from 'react';
import { Opportunity, PreparationPlan, Question, PrepResource } from '../../types';
import { api } from '../../services/api';
import { LegitimacyBadge } from './LegitimacyBadge';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Award,
  BookOpen,
  HelpCircle,
  Play,
  Briefcase,
  MapPin,
  Building,
  GraduationCap,
  ListOrdered,
  ChevronRight,
  ShieldCheck,
  CheckSquare,
  Square
} from 'lucide-react';

interface OpportunityDetailProps {
  opportunity: Opportunity;
  onBack: () => void;
  onStartMockTest: (opportunity: Opportunity) => void;
  onStartMockInterview: (opportunity: Opportunity) => void;
}

export const OpportunityDetail: React.FC<OpportunityDetailProps> = ({
  opportunity,
  onBack,
  onStartMockTest,
  onStartMockInterview
}) => {
  const [activeTab, setActiveTab] = useState<string>('how-to-crack');
  const [roadmap, setRoadmap] = useState<PreparationPlan | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [resources, setResources] = useState<PrepResource[]>([]);
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [roadmapRes, questionsRes, resourcesRes] = await Promise.all([
          api.getRoadmap(opportunity.id),
          api.getQuestions(opportunity.id),
          api.getResources(opportunity.id)
        ]);

        if (roadmapRes?.roadmap) {
          setRoadmap(roadmapRes.roadmap);
          // init checklist
          const initialChecks: Record<string, boolean> = {};
          roadmapRes.roadmap.roundRoadmaps.forEach(r => {
            r.checklist.forEach(item => {
              initialChecks[item.id] = item.completed;
            });
          });
          setChecklistState(initialChecks);
        }

        if (questionsRes?.questions) {
          setQuestions(questionsRes.questions);
        }

        if (resourcesRes?.resources) {
          setResources(resourcesRes.resources);
        }
      } catch (err) {
        console.error('Error fetching detail subdata:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [opportunity.id]);

  const toggleChecklist = (id: string) => {
    setChecklistState(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const navTabs = [
    { id: 'how-to-crack', label: 'How to Crack This Opportunity' },
    { id: 'overview', label: 'About & Eligibility' },
    { id: 'selection', label: 'Selection Process' },
    { id: 'questions', label: 'Previous / Expected Questions' },
    { id: 'resources', label: 'Preparation Resources' },
    { id: 'practice', label: 'Mock Test & Interview' }
  ];

  return (
    <div id="opportunity-detail-view" className="space-y-6 animate-fade-in pb-12">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Opportunities</span>
      </button>

      {/* Opportunity Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-2xl shadow-xs overflow-hidden shrink-0">
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
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-sm font-bold text-slate-900 tracking-tight">
                  {opportunity.company}
                </span>
                <span className="text-slate-300">•</span>
                <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 capitalize">
                  {opportunity.type}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {opportunity.location} ({opportunity.workMode})
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                {opportunity.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mt-3">
                <LegitimacyBadge
                  score={opportunity.confidenceScore}
                  level={opportunity.confidenceLevel}
                  signals={opportunity.confidenceBreakdown}
                  company={opportunity.company}
                  size="md"
                />

                <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{opportunity.relevanceScore}% Profile Match</span>
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-md">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    Deadline: <strong>{opportunity.deadline}</strong> ({opportunity.daysRemaining} days remaining)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-end">
            <a
              href={opportunity.applicationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <span>Apply on Official Portal</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onStartMockTest(opportunity)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Mock Test</span>
              </button>
              <button
                onClick={() => onStartMockInterview(opportunity)}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Mock Interview</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-t border-slate-100 mt-6 pt-3 scrollbar-none">
          {navTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content 1: HOW TO CRACK THIS OPPORTUNITY (Main Differentiator) */}
      {activeTab === 'how-to-crack' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xs border border-slate-800">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-400/25 inline-flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-indigo-300" />
                  PrepPilot Exclusive Roadmap
                </span>
                <h2 className="text-xl font-bold mt-2.5 tracking-tight text-white">
                  How to Crack {opportunity.company} — {opportunity.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  {roadmap?.overallStrategy ||
                    `Targeted multi-stage preparation roadmap designed specifically for ${opportunity.company} recruitment patterns and evaluation rubrics.`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-6 pt-5 border-t border-slate-800">
              <div className="bg-slate-800/70 rounded-xl p-3.5 border border-slate-700/60">
                <div className="text-[11px] text-indigo-300 font-bold uppercase tracking-wider">Stage 1</div>
                <div className="text-sm font-bold text-white mt-0.5">Online Assessment</div>
                <div className="text-xs text-slate-400 mt-1">Data Structures, Algorithms & Debugging</div>
              </div>
              <div className="bg-slate-800/70 rounded-xl p-3.5 border border-slate-700/60">
                <div className="text-[11px] text-indigo-300 font-bold uppercase tracking-wider">Stage 2</div>
                <div className="text-sm font-bold text-white mt-0.5">Technical Interviews</div>
                <div className="text-xs text-slate-400 mt-1">DSA, Systems Architecture, OOP & CS Core</div>
              </div>
              <div className="bg-slate-800/70 rounded-xl p-3.5 border border-slate-700/60">
                <div className="text-[11px] text-indigo-300 font-bold uppercase tracking-wider">Stage 3</div>
                <div className="text-sm font-bold text-white mt-0.5">Behavioral & Values</div>
                <div className="text-xs text-slate-400 mt-1">STAR Method, Fitment & Culture Alignment</div>
              </div>
            </div>
          </div>

          {/* Detailed Round-by-Round Roadmaps */}
          <div className="space-y-4">
            {roadmap?.roundRoadmaps.map((r, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{r.round}</h3>
                      <div className="text-xs text-slate-500 mt-0.5">{r.recommendedTimeline}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => (idx === 0 ? onStartMockTest(opportunity) : onStartMockInterview(opportunity))}
                      className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>{idx === 0 ? 'Launch Round 1 Mock' : 'Practice Round Interview'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                  {/* Left: What to expect & focus */}
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        What to Expect
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {r.whatToExpect}
                      </p>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        High-Yield Focus Areas
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {r.focus.map((f, fi) => (
                          <span
                            key={fi}
                            className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-800 border border-slate-200"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Interactive Preparation Checklist */}
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Actionable Preparation Checklist</span>
                      <span className="text-[11px] text-slate-400 font-normal">Check off as you revise</span>
                    </div>

                    <div className="space-y-2">
                      {r.checklist.map(item => {
                        const isDone = !!checklistState[item.id];
                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleChecklist(item.id)}
                            className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                              isDone
                                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            {isDone ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                            )}
                            <span className={`text-xs leading-relaxed ${isDone ? 'line-through text-slate-500 font-normal' : 'font-medium'}`}>
                              {item.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 2: Overview & Eligibility */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-600" />
                <span>About the Opportunity</span>
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                {opportunity.description}
              </p>
            </div>

            {/* Eligibility */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Eligibility Requirements</span>
              </h3>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 text-sm text-slate-700 leading-relaxed">
                {opportunity.eligibility}
              </div>
            </div>

            {/* Required Skills */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-3">Required Technical Skills</h3>
              <div className="flex flex-wrap gap-2">
                {opportunity.requiredSkills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-lg flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Why this matches you & source */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Why This Matches You</span>
              </h3>
              <div className="space-y-2.5">
                {opportunity.matchReasons.map((reason, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Source Email */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Source Email Verification</span>
              </h3>
              <div className="space-y-2 text-xs text-slate-600">
                <div>
                  <span className="font-semibold text-slate-700">Sender:</span> {opportunity.sourceEmail.sender}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Domain:</span> {opportunity.sourceEmail.senderDomain}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Date Received:</span> {opportunity.sourceEmail.dateReceived}
                </div>
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded-md">
                  "{opportunity.sourceEmail.snippet}"
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Selection Process */}
      {activeTab === 'selection' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-indigo-600" />
            <span>Selection Rounds Breakdown</span>
          </h3>

          <div className="space-y-4">
            {opportunity.selectionRounds.map((round, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl p-5 bg-slate-50/50">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    {round.roundNumber}
                  </span>
                  <h4 className="font-bold text-slate-900 text-base">{round.title}</h4>
                </div>
                <p className="text-sm text-slate-700 mt-1 leading-relaxed pl-10">
                  {round.description}
                </p>

                <div className="mt-4 pl-10">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Prep Guidance & Advice
                  </div>
                  <ul className="space-y-1.5">
                    {round.prepAdvice.map((adv, ai) => (
                      <li key={ai} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="text-indigo-600 font-bold">•</span>
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 4: Previous / Expected Questions */}
      {activeTab === 'questions' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                <span>Questions You Should Prepare</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Organized by round. Clearly distinguished between reported alumni experiences and AI predictions.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                Previously reported
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-medium">
                Likely predicted
              </span>
            </div>
          </div>

          {['Coding Round', 'Technical Interview', 'HR / Behavioral'].map((cat, ci) => {
            const catQuestions = questions.filter(q => q.roundCategory === cat);
            if (catQuestions.length === 0) return null;

            return (
              <div key={ci} className="space-y-3">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  {cat}
                </h4>

                <div className="space-y-3">
                  {catQuestions.map(q => (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-semibold text-sm text-slate-900">
                          {q.question}
                        </div>
                        <div className="shrink-0 flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                              q.type === 'previously_reported'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {q.type === 'previously_reported' ? 'Reported in Rounds' : 'Likely Predicted'}
                          </span>
                          <span className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 rounded-md">
                            {q.difficulty}
                          </span>
                        </div>
                      </div>

                      {q.sampleApproach && (
                        <div className="mt-2.5 p-3 rounded-lg bg-slate-50 text-xs text-slate-700 border border-slate-100 leading-relaxed">
                          <span className="font-semibold text-slate-900 block mb-1">Recommended Solution Approach:</span>
                          {q.sampleApproach}
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 mt-2.5">
                        {q.tags.map((t, ti) => (
                          <span key={ti} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab Content 5: Preparation Resources */}
      {activeTab === 'resources' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Recommended Preparation Resources</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Personalized learning modules organized by skill to crack {opportunity.company}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map(res => (
              <div
                key={res.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span className="font-bold text-indigo-700 uppercase tracking-wider text-[11px]">
                      {res.skillCategory}
                    </span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                      {res.difficulty}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{res.title}</h4>
                  <div className="text-xs text-slate-500 mt-0.5">By {res.provider} • Est. {res.estimatedTime}</div>

                  <p className="text-xs text-slate-600 mt-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                    <strong className="text-slate-800">Why recommended:</strong> {res.reason}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                  {res.url !== '#' ? (
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span>Open Learning Resource</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <button
                      onClick={() => onStartMockInterview(opportunity)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span>Launch in PrepPilot</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 6: Mock Test & Mock Interview Launchpad */}
      {activeTab === 'practice' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mock Test Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {opportunity.company} SDE Mock Assessment
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Experience the exact timed pressure of the online assessment with 10-20 algorithmic and CS questions.
              </p>

              <div className="space-y-2 mt-4 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Format:</span>
                  <span className="font-semibold text-slate-800">Timed Multiple Choice & Logic</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Duration:</span>
                  <span className="font-semibold text-slate-800">45 Minutes</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Topics:</span>
                  <span className="font-semibold text-slate-800">DSA, Trees, DP, OS, SQL</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onStartMockTest(opportunity)}
              className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Take Mock Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mock Interview Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4">
                <Play className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                AI Mock Interview Simulator
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Step into a live simulator where PrepPilot AI conducts a round-by-round technical or behavioral interview.
              </p>

              <div className="space-y-2 mt-4 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Available Tracks:</span>
                  <span className="font-semibold text-slate-800">Technical, HR, Behavioral, {opportunity.company}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Feedback Metrics:</span>
                  <span className="font-semibold text-slate-800">Accuracy, Communication, Problem Solving</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Report:</span>
                  <span className="font-semibold text-slate-800">Comprehensive Scorecard + STAR Advice</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onStartMockInterview(opportunity)}
              className="mt-6 w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Start AI Mock Interview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
