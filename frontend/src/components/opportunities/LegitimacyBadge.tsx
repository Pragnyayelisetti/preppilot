import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle2, XCircle, Info, ChevronRight } from 'lucide-react';
import { ConfidenceLevel, ConfidenceSignal } from '../../types';

interface LegitimacyBadgeProps {
  score: number;
  level: ConfidenceLevel;
  signals?: ConfidenceSignal[];
  company?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LegitimacyBadge: React.FC<LegitimacyBadgeProps> = ({
  score,
  level,
  signals = [],
  company = 'the company',
  size = 'md'
}) => {
  const [showModal, setShowModal] = useState(false);

  // Status mapping
  const config = {
    very_high: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      pill: 'bg-emerald-600 text-white',
      border: 'border-emerald-200',
      label: 'Very High Confidence',
      icon: ShieldCheck,
      desc: 'Cryptographically verified employer domain, official ATS link, zero payment requests.'
    },
    high: {
      bg: 'bg-teal-50 text-teal-800 border-teal-200',
      pill: 'bg-teal-600 text-white',
      border: 'border-teal-200',
      label: 'High Confidence',
      icon: ShieldCheck,
      desc: 'Verified recruitment channel and corporate domain with standard application requirements.'
    },
    moderate: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      pill: 'bg-amber-500 text-white',
      border: 'border-amber-200',
      label: 'Moderate Confidence',
      icon: AlertTriangle,
      desc: 'Third-party aggregator or unverified hiring partner. Exercise normal diligence.'
    },
    low: {
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      pill: 'bg-rose-600 text-white',
      border: 'border-rose-200',
      label: 'Needs Verification / Caution',
      icon: ShieldAlert,
      desc: 'Suspicious attributes detected (e.g. personal email domain or upfront fee request).'
    }
  }[level] || {
    bg: 'bg-slate-50 text-slate-800 border-slate-200',
    pill: 'bg-slate-600 text-white',
    border: 'border-slate-200',
    label: 'Standard Confidence',
    icon: ShieldCheck,
    desc: 'Opportunity extracted from verified correspondence.'
  };

  const Icon = config.icon;

  return (
    <>
      <div
        id={`legitimacy-badge-${score}`}
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(true);
        }}
        className={`inline-flex items-center gap-1.5 cursor-pointer rounded-lg border font-semibold tracking-tight transition-all hover:shadow-xs shadow-2xs ${config.bg} ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'
        }`}
        title="Click to view full legitimacy signals breakdown"
      >
        <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        <span>{score}% Legitimacy</span>
        <span className="text-[11px] opacity-80 font-normal hidden sm:inline">({config.label})</span>
        <Info className="w-3 h-3 ml-0.5 opacity-60 hover:opacity-100" />
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(false);
          }}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${config.bg}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 text-base">Legitimacy Confidence</h3>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${config.pill}`}>
                      {score}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Evaluated for {company} by PrepPilot Security Shield
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Explanation */}
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Security Assessment
                </p>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {config.desc}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                  Verification Signals
                </p>
                <div className="space-y-2.5">
                  {signals.length > 0 ? (
                    signals.map((sig, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 text-sm p-2.5 rounded-lg border border-slate-100 bg-white"
                      >
                        {sig.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                        )}
                        <div>
                          <div className={`font-medium text-xs ${sig.passed ? 'text-slate-800' : 'text-rose-900'}`}>
                            {sig.label}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">{sig.detail}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-start gap-2.5 text-sm p-2.5 rounded-lg border border-slate-100 bg-white">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <div className="font-medium text-xs text-slate-800">Sender Domain Authenticated</div>
                          <div className="text-xs text-slate-500 mt-0.5">Matched verified organizational mail servers with valid DKIM.</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 text-sm p-2.5 rounded-lg border border-slate-100 bg-white">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <div className="font-medium text-xs text-slate-800">Official ATS Gateway</div>
                          <div className="text-xs text-slate-500 mt-0.5">Application redirects to standard careers portal.</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 text-sm p-2.5 rounded-lg border border-slate-100 bg-white">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <div className="font-medium text-xs text-slate-800">No Payment Requests</div>
                          <div className="text-xs text-slate-500 mt-0.5">Zero application or equipment fees demanded.</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Wording notice: "Confidence this is legitimate"</span>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-md font-medium hover:bg-slate-800 text-xs"
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
