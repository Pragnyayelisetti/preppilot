import React, { useState, useEffect, useRef } from 'react';
import { MockTest, MockTestResult, Opportunity } from '../../types';
import { api } from '../../services/api';
import { useProctoring } from '../../hooks/useProctoring';
import { useTestMode } from '../../context/TestModeContext';
import { ProctoringBanner } from './ProctoringBanner';
import {
  Clock,
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckSquare,
  Bookmark,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Download,
  Video,
  ShieldOff,
  Maximize
} from 'lucide-react';

interface MockTestRunnerProps {
  testId?: string;
  test?: MockTest;
  cameraStream?: MediaStream | null;
  opportunity?: Opportunity;
  onExit: () => void;
  onPracticeWeakAreas?: (topics: string[]) => void;
}

const MAX_PROCTORING_VIOLATIONS = 3;

export const MockTestRunner: React.FC<MockTestRunnerProps> = ({
  testId = 'test-google-sde',
  test: preloadedTest,
  cameraStream,
  opportunity,
  onExit,
  onPracticeWeakAreas
}) => {
  const [test, setTest] = useState<MockTest | null>(preloadedTest || null);
  const [loading, setLoading] = useState(!preloadedTest);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(45 * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<MockTestResult | null>(null);
  const [detailedQuestions, setDetailedQuestions] = useState<any[]>([]);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Set once the test is force-ended by the proctoring system, so the
  // results view (and the "submitting" overlay before it) can explain why.
  const [autoSubmitReason, setAutoSubmitReason] = useState<string | null>(null);

  useEffect(() => {
    if (preloadedTest) {
      setSecondsRemaining(preloadedTest.durationMinutes * 60);
      setLoading(false);
      return;
    }
    const fetchTest = async () => {
      setLoading(true);
      try {
        const idToFetch = opportunity?.company?.toLowerCase().includes('amazon')
          ? 'test-amazon-sde'
          : testId;
        const res = await api.getMockTest(idToFetch);
        if (res?.test) {
          setTest(res.test);
          setSecondsRemaining(res.test.durationMinutes * 60);
        }
      } catch (err) {
        console.error('Error fetching mock test:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId, opportunity, preloadedTest]);

  // Local, retake-able copy of the camera stream. The prop is the stream
  // MockTestSetup originally acquired; after a submit we stop its tracks
  // (see stopProctoring below), so "Retake Test" needs to ask for a fresh
  // one rather than reusing a dead stream. Everything below reads from
  // this state instead of the prop directly.
  const [liveCameraStream, setLiveCameraStream] = useState<MediaStream | null>(
    cameraStream ?? null
  );

  // Attach the proctoring camera stream (if any) to the preview element
  useEffect(() => {
    if (videoRef.current && liveCameraStream) {
      videoRef.current.srcObject = liveCameraStream;
    }
  }, [liveCameraStream]);

  const { setIsTestFullscreen } = useTestMode();

  // Stop the camera and leave full-screen exactly once — when the test
  // actually ends (submitted, auto-submitted, or the component unmounts).
  // This is the ONLY place that tears proctoring down; a full-screen EXIT
  // on its own must never reach this (see the fullscreen-exit handling
  // further down), so the test/recording keeps running in the background
  // no matter how many times the person drops out of full-screen — right
  // up until they submit or hit the violation cap.
  const stopProctoring = () => {
    liveCameraStream?.getTracks().forEach(track => track.stop());
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsTestFullscreen(false);
  };

  const teardownTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Hide the app chrome (header/sidebar) for the whole time this runner
    // is mounted — from the first question until results/exit — so the
    // test genuinely stays full-screen-only rather than relying solely on
    // the browser's own Fullscreen API (which only hides browser chrome,
    // not our own layout).
    setIsTestFullscreen(true);

    // Cancel any teardown a previous (StrictMode dev-only) unmount scheduled —
    // if we're re-running setup, that unmount was synthetic, not real.
    if (teardownTimerRef.current) {
      clearTimeout(teardownTimerRef.current);
      teardownTimerRef.current = null;
    }
    return () => {
      teardownTimerRef.current = window.setTimeout(stopProctoring, 0);
    };
  }, [liveCameraStream]);

  // Once the test is submitted (any path — manual, time-up, or max
  // violations) tear proctoring down immediately rather than waiting for
  // onExit/unmount, so the camera light goes off and full-screen releases
  // as soon as the result screen appears.
  useEffect(() => {
    if (isSubmitted) {
      stopProctoring();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitted]);

  const handleSubmitTest = async () => {
    if (!test || submitting) return;
    setSubmitting(true);
    try {
      const res = await api.submitMockTest(test.id, userAnswers);
      if (res?.result) {
        setResult(res.result);
        setDetailedQuestions(res.detailedQuestions || []);
        setIsSubmitted(true);
        setShowConfirmSubmit(false);
      }
    } catch (err) {
      console.error('Error submitting test:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Fires once proctoring hits MAX_PROCTORING_VIOLATIONS: auto-submit
  // whatever's answered so far. Camera/full-screen teardown happens via the
  // isSubmitted effect above, same as every other submit path.
  const handleMaxViolations = () => {
    setAutoSubmitReason(
      `Test auto-submitted after ${MAX_PROCTORING_VIOLATIONS} proctoring violations.`
    );
    handleSubmitTest();
  };

  const proctoringActive = !!liveCameraStream && !isSubmitted && !loading && !!test;

  const {
    violationCount,
    lastViolation,
    maxViolations,
    isFullscreen,
    reenterFullscreen,
    modelLoadError,
  } = useProctoring({
    stream: liveCameraStream,
    videoRef,
    active: proctoringActive,
    maxViolations: MAX_PROCTORING_VIOLATIONS,
    onMaxViolationsReached: handleMaxViolations,
  });

  // Timer countdown
  useEffect(() => {
    if (isSubmitted || loading || !test) return;

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, loading, test]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const selectAnswer = (questionId: string, optionIndex: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const toggleReview = (questionId: string) => {
    setMarkedForReview(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Re-enter full-screen and (if this test used proctoring) grab a fresh
  // camera stream — the original one's tracks were already stopped when
  // the test was submitted, so simply flipping isSubmitted back to false
  // would leave proctoring dark on the retake.
  const [preparingRetake, setPreparingRetake] = useState(false);

  const handleRetake = async () => {
    if (!test || preparingRetake) return;
    setPreparingRetake(true);

    // Must be requested synchronously in this click handler, before any
    // `await` — same reasoning as MockTestSetup: once the user-gesture
    // window closes, requestFullscreen() gets silently rejected.
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      console.warn('Fullscreen request failed on retake:', err);
    }
    setIsTestFullscreen(true);

    // Only re-prompt for the camera if this test actually used proctoring
    // originally — don't surprise a no-camera test with a permission popup.
    if (cameraStream) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setLiveCameraStream(stream);
      } catch (err) {
        console.warn('Camera permission denied or unavailable on retake:', err);
        setLiveCameraStream(null);
      }
    }

    setIsSubmitted(false);
    setUserAnswers({});
    setMarkedForReview({});
    setCurrentIndex(0);
    setSecondsRemaining(test.durationMinutes * 60);
    setAutoSubmitReason(null);
    setPreparingRetake(false);
  };

  const handleDownloadReport = () => {
    if (!result || !test) return;

    const rows = detailedQuestions.map((q, idx) => `
      <div style="margin-bottom:16px;padding:14px;border:1px solid ${q.isCorrect ? '#a7f3d0' : '#fecdd3'};background:${q.isCorrect ? '#ecfdf5' : '#fff1f2'};border-radius:10px;">
        <div style="font-size:12px;color:#64748b;font-weight:700;margin-bottom:4px;">Question ${idx + 1} • ${q.topic} • ${q.isCorrect ? 'Correct' : 'Incorrect'}</div>
        <div style="font-weight:700;color:#0f172a;margin-bottom:8px;">${q.question}</div>
        <div style="font-size:13px;color:#334155;margin-bottom:4px;">Your answer: <strong>${q.userAnswerIndex != null && q.options[q.userAnswerIndex] !== undefined ? q.options[q.userAnswerIndex] : 'Not answered'}</strong></div>
        <div style="font-size:13px;color:#334155;margin-bottom:8px;">Correct answer: <strong>${q.options[q.correctAnswerIndex]}</strong></div>
        <div style="font-size:12px;color:#475569;background:#f8fafc;padding:8px;border-radius:8px;"><strong>Explanation:</strong> ${q.explanation}</div>
      </div>
    `).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${test.title} - Report</title>
</head>
<body style="font-family:Arial,Helvetica,sans-serif;max-width:800px;margin:24px auto;color:#0f172a;">
  <h1 style="font-size:22px;">${test.title} — Performance Report</h1>
  <p style="color:#475569;">Difficulty: ${test.difficulty} • ${result.totalQuestions} Questions</p>
  <div style="display:flex;gap:16px;margin:16px 0 24px;">
    <div style="padding:12px 16px;background:#eef2ff;border-radius:10px;"><strong>${result.scorePercentage}%</strong><br/><span style="font-size:12px;color:#4338ca;">Score</span></div>
    <div style="padding:12px 16px;background:#ecfdf5;border-radius:10px;"><strong>${result.correctCount}/${result.totalQuestions}</strong><br/><span style="font-size:12px;color:#047857;">Correct</span></div>
  </div>
  <h2 style="font-size:16px;">Question-by-Question Review</h2>
  ${rows}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${test.title.replace(/\s+/g, '_')}_Report.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-600 font-medium">Preparing mock assessment environment...</p>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs">
        <p className="text-slate-600">Failed to load assessment. Please try again.</p>
        <button
          onClick={onExit}
          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // --- RESULT VIEW ---
  if (isSubmitted && result) {
    return (
      <div className="space-y-6 pb-12 animate-fade-in">
        {autoSubmitReason && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl p-3 flex items-center gap-2">
            <ShieldOff className="w-4 h-4 shrink-0" />
            <span>{autoSubmitReason}</span>
          </div>
        )}

        {/* Results Header Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Assessment Complete
              </span>
              <h1 className="text-2xl font-bold text-slate-900 mt-2">
                {test.title} - Performance Report
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Completed {result.totalQuestions} questions with detailed topic analysis.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadReport}
                className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report</span>
              </button>

              <button
                onClick={handleRetake}
                disabled={preparingRetake}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{preparingRetake ? 'Preparing…' : 'Retake Test'}</span>
              </button>

              <button
                onClick={onExit}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Back to Opportunities
              </button>
            </div>
          </div>

          {/* Score & Insights Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">YOUR SCORE</div>
              <div className="text-3xl font-extrabold text-indigo-600 mt-1">{result.scorePercentage}%</div>
              <div className="text-xs text-slate-500 mt-1">
                {result.correctCount} of {result.totalQuestions} correct
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">STRONG AREAS</div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {result.strongAreas.map((area, i) => (
                  <span key={i} className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    ✓ {area}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
              <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider">NEEDS IMPROVEMENT</div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {result.weakAreas.map((area, i) => (
                  <span key={i} className="text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    ! {area}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">RECOMMENDED ACTION</div>
                <p className="text-xs text-slate-600 mt-1">
                  Targeted drills for weak topics to boost pass rate.
                </p>
              </div>
              <button
                onClick={() => onPracticeWeakAreas && onPracticeWeakAreas(result.weakAreas)}
                className="mt-2 w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <span>Practice Weak Areas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Topic-wise Performance Bars */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Topic-Wise Accuracy Breakdown
            </h3>
            <div className="space-y-3">
              {result.topicPerformance.map((tp, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-800">{tp.topic}</span>
                    <span className="text-slate-600">{tp.correct}/{tp.total} ({tp.percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        tp.percentage >= 70
                          ? 'bg-emerald-500'
                          : tp.percentage >= 50
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${tp.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Questions & Explanations Review */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900">
            Question-by-Question Review & Explanations
          </h2>

          <div className="space-y-4">
            {detailedQuestions.map((q, idx) => (
              <div
                key={q.id}
                className={`p-5 rounded-xl border ${
                  q.isCorrect ? 'border-emerald-200 bg-emerald-50/20' : 'border-rose-200 bg-rose-50/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Question {idx + 1}</span>
                    <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                      {q.topic}
                    </span>
                  </div>

                  {q.isCorrect ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
                      <XCircle className="w-3.5 h-3.5" /> Incorrect
                    </span>
                  )}
                </div>

                <div className="font-semibold text-sm text-slate-900 mb-3">{q.question}</div>

                {q.codeSnippet && (
                  <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg overflow-x-auto mb-3">
                    {q.codeSnippet}
                  </pre>
                )}

                <div className="space-y-1.5 mb-3">
                  {q.options.map((opt: string, oi: number) => {
                    const isUserPick = q.userAnswerIndex === oi;
                    const isCorrectAnswer = q.correctAnswerIndex === oi;

                    let optStyle = 'border-slate-200 bg-white text-slate-700';
                    if (isCorrectAnswer) {
                      optStyle = 'border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold';
                    } else if (isUserPick && !isCorrectAnswer) {
                      optStyle = 'border-rose-300 bg-rose-50 text-rose-900 line-through';
                    }

                    return (
                      <div
                        key={oi}
                        className={`text-xs p-2.5 rounded-lg border flex items-center justify-between ${optStyle}`}
                      >
                        <span>{opt}</span>
                        {isCorrectAnswer && (
                          <span className="text-[10px] font-bold text-emerald-700 uppercase">Correct Answer</span>
                        )}
                        {isUserPick && !isCorrectAnswer && (
                          <span className="text-[10px] font-bold text-rose-700 uppercase">Your Choice</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900 block mb-1">Explanation:</span>
                  {q.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- ACTIVE TEST INTERFACE ---
  const currentQuestion = test.questions[currentIndex];
  const answeredCount = Object.keys(userAnswers).length;
  const isTimeLow = secondsRemaining < 300; // < 5 mins

  return (
    <div id="mock-test-runner" className="space-y-6 pb-12">
      {proctoringActive && (
        <ProctoringBanner
          violationCount={violationCount}
          maxViolations={maxViolations}
          lastViolation={lastViolation}
          modelLoadError={modelLoadError}
        />
      )}

      {/* Blocking prompt while the person is out of full-screen. This is the
          ONLY way back in — browsers refuse to re-enter full-screen except
          from inside a real click, so we can't do it automatically. The
          test, timer, camera and recording all keep running underneath;
          exiting full-screen already counted as one violation the moment
          it happened. */}
      {proctoringActive && !isFullscreen && violationCount < maxViolations && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-sm w-full text-center space-y-3">
            <ShieldOff className="w-8 h-8 text-rose-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">You left full-screen</h3>
            <p className="text-xs text-slate-600">
              That counted as violation {violationCount}/{maxViolations}. The test keeps running —
              click below to return to full-screen and continue.
            </p>
            <button
              onClick={reenterFullscreen}
              className="w-full px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center justify-center gap-1.5"
            >
              <Maximize className="w-3.5 h-3.5" />
              <span>Return to Full-Screen</span>
            </button>
          </div>
        </div>
      )}

      {/* Overlay shown briefly while an auto-submit triggered by max violations is in flight */}
      {autoSubmitReason && submitting && !isSubmitted && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-sm w-full text-center space-y-3">
            <ShieldOff className="w-8 h-8 text-rose-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">Maximum violations reached</h3>
            <p className="text-xs text-slate-600">{autoSubmitReason} Submitting your answers now...</p>
          </div>
        </div>
      )}

      {/* Top Test Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              Timed Assessment
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-600 font-medium">{test.difficulty} Difficulty</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-1">{test.title}</h1>
        </div>

        {/* Timer & Submit Controls */}
        <div className="flex items-center gap-3">
          {liveCameraStream && (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200">
              <video ref={videoRef} autoPlay muted className="w-9 h-7 rounded object-cover bg-black" />
              <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 uppercase">
                <Video className="w-3 h-3" /> Rec
              </span>
            </div>
          )}
          <div
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-mono text-sm font-bold border transition-colors ${
              isTimeLow
                ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                : 'bg-slate-50 text-slate-800 border-slate-200'
            }`}
          >
            <Clock className={`w-4 h-4 ${isTimeLow ? 'text-rose-600' : 'text-slate-500'}`} />
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            Submit Assessment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Current Question & Options */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                  {currentIndex + 1}
                </span>
                <span className="text-xs text-slate-500">of {test.questions.length} questions</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {currentQuestion.topic}
                </span>
              </div>

              <button
                onClick={() => toggleReview(currentQuestion.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  markedForReview[currentQuestion.id]
                    ? 'bg-amber-50 text-amber-800 border-amber-300 font-semibold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{markedForReview[currentQuestion.id] ? 'Marked for Review' : 'Mark for Review'}</span>
              </button>
            </div>

            {/* Question Text */}
            <div>
              <p className="text-base font-semibold text-slate-900 leading-relaxed">
                {currentQuestion.question}
              </p>

              {currentQuestion.codeSnippet && (
                <pre className="mt-4 p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto">
                  {currentQuestion.codeSnippet}
                </pre>
              )}
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-2.5 pt-2">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = userAnswers[currentQuestion.id] === idx;
                const letter = String.fromCharCode(65 + idx);

                return (
                  <div
                    key={idx}
                    onClick={() => selectAnswer(currentQuestion.id, idx)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-400/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {letter}
                    </div>
                    <span className="text-xs font-medium text-slate-800 pt-0.5 leading-relaxed">
                      {option}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Next / Previous Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none rounded-lg transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Question</span>
              </button>

              {currentIndex < test.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex(prev => Math.min(test.questions.length - 1, prev + 1))}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => setShowConfirmSubmit(true)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <span>Review & Finish</span>
                  <CheckSquare className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Question Navigator Palette */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Question Navigator
            </h3>

            <div className="grid grid-cols-5 gap-2">
              {test.questions.map((q, i) => {
                const isAnswered = userAnswers[q.id] !== undefined;
                const isMarked = !!markedForReview[q.id];
                const isCurrent = currentIndex === i;

                let btnStyle = 'bg-slate-100 text-slate-700 border-slate-200';
                if (isCurrent) {
                  btnStyle = 'ring-2 ring-indigo-600 bg-indigo-50 text-indigo-900 font-bold border-indigo-400';
                } else if (isMarked) {
                  btnStyle = 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
                } else if (isAnswered) {
                  btnStyle = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-9 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all ${btnStyle}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 shrink-0" />
                <span className="text-slate-600">Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300 shrink-0" />
                <span className="text-slate-600">Marked for Review ({Object.values(markedForReview).filter(Boolean).length})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200 shrink-0" />
                <span className="text-slate-600">Unanswered ({test.questions.length - answeredCount})</span>
              </div>
            </div>

            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="w-full mt-2 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors"
            >
              Submit Assessment
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Submit Mock Assessment?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              You have answered <strong>{answeredCount}</strong> of <strong>{test.questions.length}</strong> questions.
              {test.questions.length - answeredCount > 0 && (
                <span className="text-amber-700 block mt-1">
                  Warning: {test.questions.length - answeredCount} questions remain unanswered!
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Back to Test
              </button>
              <button
                onClick={handleSubmitTest}
                disabled={submitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-2"
              >
                {submitting ? 'Evaluating...' : 'Confirm & View Results'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};