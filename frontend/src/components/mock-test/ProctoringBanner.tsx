import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import type { ProctoringViolation } from '../../hooks/useProctoring';

interface ProctoringBannerProps {
  violationCount: number;
  maxViolations: number;
  lastViolation: ProctoringViolation | null;
  modelLoadError?: string | null;
}

/**
 * Drop this into the test-taking page (the screen shown after MockTestSetup's
 * onReady fires). It renders a persistent strike counter top-right, plus a
 * 4s toast whenever a new violation comes in.
 */
export const ProctoringBanner: React.FC<ProctoringBannerProps> = ({
  violationCount,
  maxViolations,
  lastViolation,
  modelLoadError,
}) => {
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!lastViolation) return;
    setShowToast(true);
    const t = setTimeout(() => setShowToast(false), 4000);
    return () => clearTimeout(t);
  }, [lastViolation]);

  return (
    <>
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-md">
        <ShieldAlert className={`w-4 h-4 ${violationCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`} />
        <span className="text-xs font-semibold text-slate-700">
          Proctoring violations: {violationCount}/{maxViolations}
        </span>
      </div>

      {modelLoadError && (
        <div className="fixed top-16 right-4 z-50 max-w-xs p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs shadow-lg">
          <div className="font-bold flex items-center gap-1.5 mb-0.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>AI proctoring unavailable</span>
          </div>
          <p>{modelLoadError}</p>
        </div>
      )}

      {showToast && lastViolation && (
        <div className="fixed top-16 right-4 z-50 max-w-xs p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs shadow-lg animate-fade-in">
          <div className="font-bold flex items-center gap-1.5 mb-0.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>
              Violation {lastViolation.count}/{maxViolations}
            </span>
          </div>
          <p>{lastViolation.message}</p>
        </div>
      )}
    </>
  );
};