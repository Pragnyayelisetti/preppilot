import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShieldAlert, UserX, Users, Volume2 } from 'lucide-react';
import type { ProctoringViolation } from '../../hooks/useProctoring';

interface ProctoringBannerProps {
  violationCount: number;
  maxViolations: number;
  lastViolation: ProctoringViolation | null;
  modelLoadError?: string | null;
  isFaceVisible?: boolean;
  faceCount?: number;
  audioLevel?: number;
}

/**
 * Renders proctoring status, violation strike counter, and real-time alerts
 * for missing face, multiple persons, or noise.
 */
export const ProctoringBanner: React.FC<ProctoringBannerProps> = ({
  violationCount,
  maxViolations,
  lastViolation,
  modelLoadError,
  isFaceVisible = true,
  faceCount = 1,
  audioLevel = 0,
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
      {/* Top Proctoring Status Badge */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md">
        <ShieldAlert className={`w-4 h-4 ${violationCount > 0 ? 'text-rose-600 animate-pulse' : 'text-emerald-600'}`} />
        <span className="text-xs font-semibold text-slate-700">
          Violations: <span className={violationCount > 0 ? 'text-rose-600 font-bold' : 'text-slate-900'}>{violationCount}</span>/{maxViolations}
        </span>
        {audioLevel > 15 && (
          <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-mono">
            <Volume2 className="w-3 h-3 animate-pulse" />
            Mic {audioLevel}%
          </span>
        )}
      </div>

      {/* Real-time Alert: Face Not Visible */}
      {!isFaceVisible && (
        <div className="fixed top-16 right-4 z-50 max-w-sm p-3 rounded-xl bg-rose-600 text-white text-xs shadow-xl flex items-start gap-2.5 animate-bounce">
          <UserX className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-bold">Face Not Detected in Camera!</div>
            <p className="text-rose-100 text-[11px] mt-0.5 leading-snug">
              Keep your face clearly centered in camera view. Absence is flagged as a proctoring violation.
            </p>
          </div>
        </div>
      )}

      {/* Real-time Alert: Multiple People Detected */}
      {faceCount > 1 && (
        <div className="fixed top-28 right-4 z-50 max-w-sm p-3 rounded-xl bg-rose-600 text-white text-xs shadow-xl flex items-start gap-2.5 animate-bounce">
          <Users className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-bold">Multiple Persons Detected ({faceCount})!</div>
            <p className="text-rose-100 text-[11px] mt-0.5 leading-snug">
              Two or more people are visible in camera view. Strictly 1 person allowed during proctored tests.
            </p>
          </div>
        </div>
      )}

      {modelLoadError && (
        <div className="fixed top-16 right-4 z-50 max-w-xs p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs shadow-lg">
          <div className="font-bold flex items-center gap-1.5 mb-0.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>AI proctoring fallback active</span>
          </div>
          <p>{modelLoadError}</p>
        </div>
      )}

      {showToast && lastViolation && (
        <div className="fixed top-16 right-4 z-50 max-w-xs p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs shadow-xl animate-fade-in">
          <div className="font-bold flex items-center gap-1.5 mb-0.5 text-amber-900">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>
              Violation Strike {lastViolation.count}/{maxViolations}
            </span>
          </div>
          <p className="font-medium text-slate-800">{lastViolation.message}</p>
          <div className="text-[10px] text-rose-600 font-semibold mt-1">
            {maxViolations - lastViolation.count} strike(s) remaining before disqualification.
          </div>
        </div>
      )}
    </>
  );
};