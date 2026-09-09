import React, { useEffect, useRef, useState } from 'react';
import { Opportunity, MockInterviewEvaluation } from '../../types';
import { api } from '../../services/api';
import { useProctoring } from '../../hooks/useProctoring';
import { useTestMode } from '../../context/TestModeContext';
import { ProctoringBanner } from '../mock-test/ProctoringBanner';
import {
  Play,
  Send,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Bot,
  User,
  Camera,
  Mic,
  MicOff,
  Maximize,
  Loader2,
  Lightbulb,
  Timer,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface MockInterviewSimulatorProps {
  opportunity?: Opportunity;
  onExit: () => void;
}

const MAX_PROCTORING_VIOLATIONS = 4;
// A few common filler words/phrases — rough heuristic, not a full grammar
// checker, but enough to flag hesitant/unstructured speech to the AI
// evaluator alongside the transcript itself.
const FILLER_WORD_REGEX = /\b(um+|uh+|hmm+|like|you know|actually|basically|i mean)\b/gi;

function countFillerWords(text: string): number {
  const matches = text.match(FILLER_WORD_REGEX);
  return matches ? matches.length : 0;
}

// Minimal typing for the Web Speech API — not in standard TS lib.dom yet,
// and only some browsers (Chrome/Edge) support it.
type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export const MockInterviewSimulator: React.FC<MockInterviewSimulatorProps> = ({
  opportunity,
  onExit
}) => {
  const { setIsTestFullscreen } = useTestMode();

  // ---- setup form state ----
  const [track, setTrack] = useState<string>('Technical');
  const [customTopic, setCustomTopic] = useState('');
  const effectiveTopic = customTopic.trim();

  // ---- mandatory camera + mic + fullscreen gate ----
  const [gatePreparing, setGatePreparing] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const setupVideoRef = useRef<HTMLVideoElement | null>(null);
  const activeVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (setupVideoRef.current && mediaStream) {
      setupVideoRef.current.srcObject = mediaStream;
    }
    if (activeVideoRef.current && mediaStream) {
      activeVideoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  // ---- session state ----
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<any[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(4);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(150);
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [evaluation, setEvaluation] = useState<MockInterviewEvaluation | null>(null);

  // ---- per-question timer ----
  const [secondsRemaining, setSecondsRemaining] = useState(150);
  const questionStartRef = useRef<number>(Date.now());

  // ---- voice answer state ----
  const [speechSupported] = useState<boolean>(!!getSpeechRecognitionCtor());
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const speechActiveMsRef = useRef<number>(0);
  const speechStartedAtRef = useRef<number | null>(null);
  const finalTranscriptRef = useRef<string>('');

  // ---- hint state ----
  const [hintText, setHintText] = useState<string | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [maxHints, setMaxHints] = useState(2);
  const [hintLoading, setHintLoading] = useState(false);

  const proctoringActive = !!sessionId && !!mediaStream && !isCompleted;

  const {
    violationCount,
    lastViolation,
    maxViolations,
    modelLoadError
  } = useProctoring({
    stream: mediaStream,
    videoRef: activeVideoRef,
    active: proctoringActive,
    maxViolations: MAX_PROCTORING_VIOLATIONS,
    onMaxViolationsReached: () => {
      forceEndRef.current?.();
    }
  });

  // Tear down camera/mic + full-screen exactly once, when the interview
  // actually ends (completed or the component unmounts) — same pattern as
  // MockTestRunner's stopProctoring, so the camera light reliably goes off.
  const teardownMedia = () => {
    mediaStream?.getTracks().forEach(track => track.stop());
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* already stopped */ }
    }
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsTestFullscreen(false);
  };

  useEffect(() => {
    return () => {
      teardownMedia();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isCompleted) teardownMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompleted]);

  // ---- mandatory camera + mic + fullscreen, then start the session ----
  const handleBegin = async () => {
    setGatePreparing(true);
    setGateError(null);

    // Must be requested synchronously in this click handler, before any
    // `await` — the browser silently rejects requestFullscreen() once the
    // user-gesture window closes.
    let enteredFullscreen = true;
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
      enteredFullscreen = false;
    }

    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (err) {
      console.warn('Camera/mic permission denied or unavailable:', err);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      setGateError(
        'Camera and microphone access are both required to start this proctored interview. Please allow access and try again.'
      );
      setGatePreparing(false);
      return;
    }

    if (!enteredFullscreen) {
      stream.getTracks().forEach(t => t.stop());
      setGateError('Full-screen mode could not be enabled — please allow it and try again.');
      setGatePreparing(false);
      return;
    }

    setMediaStream(stream);
    setIsTestFullscreen(true);

    setIsLoading(true);
    try {
      const res = await api.startMockInterview({
        track,
        company: opportunity?.company || 'Top Tech Firm',
        topic: effectiveTopic || undefined
      });
      if (res?.sessionId) {
        setSessionId(res.sessionId);
        setQuestionIndex(res.currentQuestionIndex);
        setTotalQuestions(res.totalQuestions);
        setTimeLimitSeconds(res.timeLimitSeconds || 150);
        setSecondsRemaining(res.timeLimitSeconds || 150);
        setConversation(res.conversation || []);
        questionStartRef.current = Date.now();
      } else {
        setGateError('Could not start the interview session. Please try again.');
        stream.getTracks().forEach(t => t.stop());
        teardownMedia();
      }
    } catch (err) {
      console.error('Failed starting interview:', err);
      setGateError('Could not start the interview session. Please try again.');
      teardownMedia();
    } finally {
      setGatePreparing(false);
      setIsLoading(false);
    }
  };

  // ---- voice answer via Web Speech API ----
  const toggleRecording = () => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    finalTranscriptRef.current = userAnswer ? userAnswer + ' ' : '';

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptChunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcriptChunk + ' ';
        } else {
          interim += transcriptChunk;
        }
      }
      setUserAnswer((finalTranscriptRef.current + interim).trim());
    };
    recognition.onerror = () => {
      setIsRecording(false);
    };
    recognition.onend = () => {
      setIsRecording(false);
      if (speechStartedAtRef.current) {
        speechActiveMsRef.current += Date.now() - speechStartedAtRef.current;
        speechStartedAtRef.current = null;
      }
    };

    recognitionRef.current = recognition;
    speechStartedAtRef.current = Date.now();
    setIsRecording(true);
    recognition.start();
  };

  // ---- hint (nudge only — the backend never returns the actual answer) ----
  const requestHint = async () => {
    if (!sessionId || hintLoading || hintsUsed >= maxHints) return;
    setHintLoading(true);
    try {
      const res = await api.getMockInterviewHint(sessionId);
      setHintText(res.hint);
      setHintsUsed(res.hintsUsedForCurrentQuestion);
      setMaxHints(res.maxHints);
    } catch (err) {
      console.error('Failed getting hint:', err);
    } finally {
      setHintLoading(false);
    }
  };

  const resetPerQuestionState = () => {
    setUserAnswer('');
    setHintText(null);
    setHintsUsed(0);
    finalTranscriptRef.current = '';
    speechActiveMsRef.current = 0;
    speechStartedAtRef.current = null;
    questionStartRef.current = Date.now();
  };

  const submitAnswer = async (opts: { autoSubmittedOnTimeout: boolean }) => {
    if (!sessionId || isLoading) return;

    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }

    const answerToSend = userAnswer.trim();
    const timeTakenSeconds = Math.round((Date.now() - questionStartRef.current) / 1000);
    const wordCount = answerToSend ? answerToSend.split(/\s+/).length : 0;
    const answeredViaVoice = speechActiveMsRef.current > 0;
    const wordsPerMinute = answeredViaVoice && speechActiveMsRef.current > 0
      ? Math.round(wordCount / (speechActiveMsRef.current / 60000))
      : null;

    setIsLoading(true);
    try {
      const res = await api.respondMockInterview({
        sessionId,
        answer: answerToSend,
        autoSubmittedOnTimeout: opts.autoSubmittedOnTimeout,
        metrics: {
          answeredViaVoice,
          timeTakenSeconds,
          fillerWordCount: countFillerWords(answerToSend),
          wordsPerMinute
        }
      });

      if (res) {
        setConversation(res.conversation || []);
        if (res.completed) {
          setIsCompleted(true);
          setEvaluation(res.evaluation);
        } else {
          setQuestionIndex(res.currentQuestionIndex || questionIndex + 1);
          const nextLimit = res.timeLimitSeconds || timeLimitSeconds;
          setTimeLimitSeconds(nextLimit);
          setSecondsRemaining(nextLimit);
          resetPerQuestionState();
        }
      }
    } catch (err) {
      console.error('Failed submitting interview response:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const forceEndRef = useRef<() => void>(() => {});
  forceEndRef.current = () => {
    // Max proctoring violations hit — end the session the same way the
    // mock test does: auto-submit, exactly like a timeout, so it still
    // goes through normal evaluation with whatever was answered so far.
    submitAnswer({ autoSubmittedOnTimeout: true });
  };

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || isLoading) return;
    await submitAnswer({ autoSubmittedOnTimeout: false });
  };

  // ---- countdown per question — auto-submits whatever's there on timeout ----
  useEffect(() => {
    if (!sessionId || isCompleted || isLoading) return;
    if (secondsRemaining <= 0) {
      submitAnswer({ autoSubmittedOnTimeout: true });
      return;
    }
    const t = setTimeout(() => setSecondsRemaining(s => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsRemaining, sessionId, isCompleted, isLoading]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- REPORT VIEW ---
  if (isCompleted && evaluation) {
    return (
      <div className="space-y-6 pb-12 animate-fade-in">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                AI Evaluation Ready
              </span>
              <h1 className="text-2xl font-bold text-slate-900 mt-2">
                Mock Interview Performance Report
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated for {effectiveTopic || track} {opportunity ? `at ${opportunity.company}` : ''}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSessionId(null);
                  setIsCompleted(false);
                  setEvaluation(null);
                  setConversation([]);
                  setMediaStream(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Start New Session</span>
              </button>

              <button
                onClick={onExit}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 text-center">
              <div className="text-[11px] font-bold text-indigo-700 uppercase">OVERALL SCORE</div>
              <div className="text-2xl font-extrabold text-indigo-900 mt-1">{evaluation.overallScore}%</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <div className="text-[11px] font-bold text-slate-500 uppercase">COMMUNICATION</div>
              <div className="text-2xl font-bold text-slate-800 mt-1">{evaluation.communication}%</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <div className="text-[11px] font-bold text-slate-500 uppercase">TECH ACCURACY</div>
              <div className="text-2xl font-bold text-slate-800 mt-1">{evaluation.technicalAccuracy}%</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <div className="text-[11px] font-bold text-slate-500 uppercase">PROBLEM SOLVING</div>
              <div className="text-2xl font-bold text-slate-800 mt-1">{evaluation.problemSolving}%</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <div className="text-[11px] font-bold text-slate-500 uppercase">CONFIDENCE</div>
              <div className="text-2xl font-bold text-slate-800 mt-1">{evaluation.confidence}%</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <div className="text-[11px] font-bold text-slate-500 uppercase">STRUCTURE</div>
              <div className="text-2xl font-bold text-slate-800 mt-1">{evaluation.structure}%</div>
            </div>
          </div>
        </div>

        {/* Detailed Feedback Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* What you did well */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>What You Did Well</span>
            </h3>
            <div className="space-y-2.5">
              {evaluation.whatYouDidWell.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What to improve */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>What to Improve</span>
            </h3>
            <div className="space-y-2.5">
              {evaluation.whatToImprove.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                  <span className="text-amber-600 font-bold">!</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Better Answer Approach & Recommended Practice */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Better Answer Approach</span>
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-indigo-50/60 p-4 rounded-xl border border-indigo-100">
              {evaluation.betterAnswerApproach}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-600" />
              <span>Recommended Practice</span>
            </h3>
            <div className="space-y-2">
              {evaluation.recommendedPractice.map((rec, i) => (
                <div key={i} className="text-xs text-slate-700 p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- SELECTION / SETUP + MANDATORY PROCTORING GATE SCREEN ---
  if (!sessionId) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-12">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Opportunities</span>
        </button>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-6">
          <div className="text-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
              <Bot className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">AI Mock Interview Simulator</h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              A real-time proctored interview: the AI only asks questions — it never gives you the
              answer. Camera, microphone and full-screen are required for the full experience.
            </p>
          </div>

          {/* Select Track */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Interview Track
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {['Technical', 'HR', 'Behavioral', 'Company-specific'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTrack(t); setCustomTopic(''); }}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all text-center ${
                    track === t && !effectiveTopic
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="pt-1">
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Or focus on a specific topic (e.g. React Hooks, Dynamic Programming, DBMS)..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              />
              {effectiveTopic && (
                <p className="text-[11px] text-emerald-700 mt-1.5 font-medium">
                  The AI will ask {5} questions built around "{effectiveTopic}".
                </p>
              )}
            </div>
          </div>

          {/* Target Company */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-slate-700">Simulating For:</span>{' '}
              <span className="font-bold text-indigo-700">{opportunity?.company || 'General Tech Standard'}</span>
            </div>
            <span className="text-slate-400">{effectiveTopic ? 5 : 4} Questions</span>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Before you begin</div>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>The interview opens in full-screen with your <strong>camera and microphone required</strong>.</li>
              <li>You can speak your answer (if your browser supports voice) or type it — either way, be mindful of grammar and clarity.</li>
              <li>Each question has a time limit — it auto-submits whatever you have when time runs out.</li>
              <li>Up to 2 short hints per question are available — hints nudge you, they never give the answer.</li>
              <li>Looking away, multiple people in frame, leaving full screen, or switching tabs each count as a violation.</li>
            </ul>
          </div>

          {gateError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <Camera className="w-4 h-4 shrink-0" />
              <span>{gateError}</span>
            </div>
          )}

          {mediaStream && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <video ref={setupVideoRef} autoPlay muted className="w-20 h-14 rounded-lg object-cover bg-black" />
              <span className="text-xs font-semibold text-emerald-800">Camera & mic active</span>
            </div>
          )}

          <button
            onClick={handleBegin}
            disabled={gatePreparing || isLoading}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            {gatePreparing || isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{gatePreparing ? 'Requesting camera & mic…' : 'Setting up session…'}</span>
              </>
            ) : (
              <>
                <Maximize className="w-4 h-4" />
                <span>{gateError ? 'Retry & Begin Mock Interview' : 'Begin Mock Interview'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // --- ACTIVE SIMULATOR CONVERSATION ---
  const timeIsLow = secondsRemaining <= 20;

  return (
    <div id="mock-interview-active" className="max-w-3xl mx-auto space-y-6 pb-12">
      <ProctoringBanner
        violationCount={violationCount}
        maxViolations={maxViolations}
        lastViolation={lastViolation}
        modelLoadError={modelLoadError}
      />

      {/* Active Session Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <video
            ref={activeVideoRef}
            autoPlay
            muted
            className="w-14 h-11 rounded-lg object-cover bg-black shrink-0 border border-slate-200"
          />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-900 truncate">
              {effectiveTopic || track} Interview Simulator
            </div>
            <div className="text-[11px] text-slate-500">
              Question {Math.min(questionIndex + 1, totalQuestions)} of {totalQuestions}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold ${
            timeIsLow ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
          }`}>
            <Timer className="w-3.5 h-3.5" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>
          <button
            onClick={onExit}
            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium rounded-lg hover:bg-slate-100"
          >
            Quit Interview
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs min-h-[380px] max-h-[500px] overflow-y-auto space-y-4">
        {conversation.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-4 rounded-2xl max-w-[80%] text-xs leading-relaxed whitespace-pre-line ${
                msg.role === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-xs'
                  : 'bg-slate-100 text-slate-800 rounded-tl-xs'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 italic p-3">
            <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>AI Interviewer is analyzing your response and preparing next round...</span>
          </div>
        )}
      </div>

      {/* Hint (a nudge only — never the answer) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-500" />
            <span>Stuck? Get a short nudge — not the answer.</span>
          </div>
          <button
            type="button"
            onClick={requestHint}
            disabled={hintLoading || hintsUsed >= maxHints || isLoading}
            className="text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 border border-amber-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
          >
            {hintLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lightbulb className="w-3 h-3" />}
            <span>{hintsUsed >= maxHints ? 'No hints left' : `Need a hint? (${maxHints - hintsUsed} left)`}</span>
          </button>
        </div>
        {hintText && (
          <p className="text-xs text-amber-900 bg-white border border-amber-100 rounded-lg p-2.5">{hintText}</p>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendResponse} className="flex gap-2">
        <textarea
          rows={3}
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Speak or type your structured answer here (Hint: Use Situation, Task, Action, Result)..."
          className="flex-1 p-3.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        />
        <div className="flex flex-col gap-2">
          {speechSupported && (
            <button
              type="button"
              onClick={toggleRecording}
              className={`px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title={isRecording ? 'Stop recording' : 'Answer by voice'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
          <button
            type="submit"
            disabled={!userAnswer.trim() || isLoading}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
      </form>

      {isRecording && (
        <div className="flex items-center gap-1.5 text-[11px] text-rose-600 font-semibold -mt-3">
          <AlertTriangle className="w-3 h-3" />
          <span>Listening — speak your answer, then tap the mic to stop.</span>
        </div>
      )}
    </div>
  );
};
