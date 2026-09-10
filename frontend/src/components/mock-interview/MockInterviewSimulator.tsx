import React, { useEffect, useRef, useState } from 'react';
import { Opportunity, MockInterviewEvaluation } from '../../types';
import { api } from '../../services/api';
import { useProctoring } from '../../hooks/useProctoring';
import { useTestMode } from '../../context/TestModeContext';
import { ProctoringBanner } from '../mock-test/ProctoringBanner';
import {
  Sparkles,
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
  ShieldAlert,
  AlertTriangle,
  PhoneOff,
  Volume2,
  VolumeX,
  Languages,
  BookOpenCheck,
  Award,
  Send
} from 'lucide-react';

interface MockInterviewSimulatorProps {
  opportunity?: Opportunity;
  onExit: () => void;
}

const MAX_PROCTORING_VIOLATIONS = 3;
const FILLER_WORD_REGEX = /\b(um+|uh+|hmm+|like|you know|actually|basically|i mean)\b/gi;

function countFillerWords(text: string): number {
  const matches = text.match(FILLER_WORD_REGEX);
  return matches ? matches.length : 0;
}

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
  const candidateVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (setupVideoRef.current && mediaStream) {
      setupVideoRef.current.srcObject = mediaStream;
    }
    if (candidateVideoRef.current && mediaStream) {
      candidateVideoRef.current.srcObject = mediaStream;
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
  const [aiIsSpeaking, setAiIsSpeaking] = useState(false);
  const [voiceAudioEnabled, setVoiceAudioEnabled] = useState(true);
  const [showManualTranscriptEdit, setShowManualTranscriptEdit] = useState(false);

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

  // Proctoring active
  const proctoringActive = !!sessionId && !!mediaStream && !isCompleted;

  const {
    violationCount,
    lastViolation,
    maxViolations,
    modelLoadError,
    isFaceVisible,
    faceCount,
    audioLevel,
  } = useProctoring({
    stream: mediaStream,
    videoRef: candidateVideoRef,
    active: proctoringActive,
    maxViolations: MAX_PROCTORING_VIOLATIONS,
    onMaxViolationsReached: () => {
      forceEndRef.current?.();
    }
  });

  const teardownMedia = () => {
    mediaStream?.getTracks().forEach(track => track.stop());
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* already stopped */ }
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
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

  // Read question aloud via Web Speech Synthesis when new question arrives
  const speakCurrentQuestion = (text: string) => {
    if (!voiceAudioEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    // Clean greeting or question formatting
    const cleanSpeech = text
      .replace(/Hello! I am your AI interviewer[\s\S]*?Let's begin\.\s*/i, '')
      .replace(/Thank you for your answer[\s\S]*?Let's move to the next question:\s*/i, '');

    const utterance = new SpeechSynthesisUtterance(cleanSpeech || text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    utterance.onstart = () => {
      setAiIsSpeaking(true);
    };
    utterance.onend = () => {
      setAiIsSpeaking(false);
      // Auto-start recording candidate response when AI finishes asking
      if (speechSupported && !isRecording && !isCompleted) {
        startSpeechRecording();
      }
    };
    utterance.onerror = () => {
      setAiIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // ---- mandatory camera + mic + fullscreen gate ----
  const handleBegin = async () => {
    setGatePreparing(true);
    setGateError(null);

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
        'Camera and microphone access are both mandatory for this proctored video interview. Please grant permissions and retry.'
      );
      setGatePreparing(false);
      return;
    }

    if (!enteredFullscreen) {
      stream.getTracks().forEach(t => t.stop());
      setGateError('Full-screen mode is mandatory for this proctored interview. Please allow full-screen.');
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

        // Extract and speak opening question
        const latestQuestion = res.conversation?.[res.conversation.length - 1]?.content || '';
        speakCurrentQuestion(latestQuestion);
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

  // ---- speech recognition answer ----
  const startSpeechRecording = () => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
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
    } catch (e) {
      console.warn('Could not start speech recognition:', e);
      setIsRecording(false);
    }
  };

  const stopSpeechRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch { /* ignore */ }
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopSpeechRecording();
    } else {
      startSpeechRecording();
    }
  };

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
    setShowManualTranscriptEdit(false);
  };

  const submitAnswer = async (opts: { autoSubmittedOnTimeout: boolean }) => {
    if (!sessionId || isLoading) return;

    stopSpeechRecording();
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    const answerToSend = userAnswer.trim();
    const timeTakenSeconds = Math.round((Date.now() - questionStartRef.current) / 1000);
    const wordCount = answerToSend ? answerToSend.split(/\s+/).length : 0;
    const answeredViaVoice = speechActiveMsRef.current > 0 || isRecording;
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

          if (res.nextQuestion) {
            speakCurrentQuestion(res.nextQuestion);
          }
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
    submitAnswer({ autoSubmittedOnTimeout: true });
  };

  // Countdown per question
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

  // Current question text to display
  const currentAssistantMessage = conversation
    .slice()
    .reverse()
    .find(c => c.role === 'assistant')?.content || 'Preparing initial interview question...';

  // --- REPORT VIEW ---
  if (isCompleted && evaluation) {
    const lg = evaluation.languageAndGrammar;
    return (
      <div className="space-y-6 pb-12 animate-fade-in max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider">
                Interview Concluded • AI Evaluation Ready
              </span>
              <h1 className="text-2xl font-bold text-slate-900 mt-2">
                Mock Interview Performance & Language Report
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated for <strong>{effectiveTopic || track}</strong> {opportunity ? `at ${opportunity.company}` : ''}
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
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Start New Session</span>
              </button>

              <button
                onClick={onExit}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-center">
              <div className="text-[11px] font-bold text-indigo-700 uppercase">OVERALL SCORE</div>
              <div className="text-2xl font-extrabold text-indigo-900 mt-1">{evaluation.overallScore}%</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <div className="text-[11px] font-bold text-slate-500 uppercase">COMMUNICATION</div>
              <div className="text-2xl font-bold text-slate-800 mt-1">{evaluation.communication}%</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <div className="text-[11px] font-bold text-slate-500 uppercase">TECH ACCURACY</div>
              <div className="text-2xl font-bold text-slate-800 mt-1">{evaluation.technicalAccuracy}%</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <div className="text-[11px] font-bold text-slate-500 uppercase">PROBLEM SOLVING</div>
              <div className="text-2xl font-bold text-slate-800 mt-1">{evaluation.problemSolving}%</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <div className="text-[11px] font-bold text-slate-500 uppercase">CONFIDENCE</div>
              <div className="text-2xl font-bold text-slate-800 mt-1">{evaluation.confidence}%</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <div className="text-[11px] font-bold text-slate-500 uppercase">STRUCTURE</div>
              <div className="text-2xl font-bold text-slate-800 mt-1">{evaluation.structure}%</div>
            </div>
          </div>
        </div>

        {/* Dedicated Spoken Language & Grammar Analysis Section */}
        {lg && (
          <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Languages className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Spoken Language, Grammar & Cadence Analysis
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Evaluated from live speech transcription to enhance spoken professional authority.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs">
                  <span className="text-slate-500 font-medium">Grammar: </span>
                  <strong className="text-indigo-700">{lg.grammarScore}%</strong>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs">
                  <span className="text-slate-500 font-medium">Vocabulary: </span>
                  <strong className="text-indigo-700">{lg.vocabularyScore}%</strong>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs">
                  <span className="text-slate-500 font-medium">Fluency: </span>
                  <strong className="text-indigo-700">{lg.fluencyScore}%</strong>
                </div>
              </div>
            </div>

            {/* Delivery feedback narrative */}
            {lg.deliveryFeedback && (
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-slate-700 leading-relaxed">
                <strong className="text-indigo-950 font-semibold block mb-1">Vocal Delivery Overview:</strong>
                {lg.deliveryFeedback}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Grammar Critiques */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpenCheck className="w-4 h-4 text-indigo-600" />
                  <span>Grammar Critiques & Corrections</span>
                </div>
                <div className="space-y-2.5">
                  {lg.grammarCritiques?.map((gc, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                      <div className="text-rose-700 font-medium">
                        <span className="text-slate-400 mr-1.5 font-bold line-through">Spoken:</span>
                        "{gc.originalPhrase}"
                      </div>
                      <div className="text-emerald-800 font-bold">
                        <span className="text-slate-400 mr-1.5 font-normal">Polished:</span>
                        "{gc.correction}"
                      </div>
                      <div className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                        Rule: {gc.rule}
                      </div>
                    </div>
                  ))}
                  {(!lg.grammarCritiques || lg.grammarCritiques.length === 0) && (
                    <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs">
                      No notable grammatical errors detected during your spoken answers. Great job!
                    </div>
                  )}
                </div>
              </div>

              {/* Vocabulary Suggestions */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>High-Impact Engineering Vocabulary Upgrades</span>
                </div>
                <div className="space-y-2.5">
                  {lg.vocabularySuggestions?.map((vs, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-3">
                      <div className="text-slate-600">
                        <span className="text-slate-400 mr-1 text-[11px]">Spoken:</span>
                        <strong>{vs.spokenWord}</strong>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div className="text-indigo-800 font-bold text-right">
                        <span className="text-slate-400 mr-1 text-[11px] font-normal">Upgrade:</span>
                        {vs.enhancedAlternative}
                      </div>
                    </div>
                  ))}
                  {(!lg.vocabularySuggestions || lg.vocabularySuggestions.length === 0) && (
                    <div className="p-4 rounded-xl bg-slate-50 text-slate-600 text-xs">
                      Professional terminology used consistently throughout the interview.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Qualitative Feedback Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>What You Did Well</span>
            </h3>
            <div className="space-y-2.5">
              {evaluation.whatYouDidWell.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>What to Improve</span>
            </h3>
            <div className="space-y-2.5">
              {evaluation.whatToImprove.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                  <span className="text-amber-600 font-bold">!</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Better Answer Approach & Recommended Practice */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Better Answer Approach</span>
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100">
              {evaluation.betterAnswerApproach}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-600" />
              <span>Recommended Practice</span>
            </h3>
            <div className="space-y-2">
              {evaluation.recommendedPractice.map((rec, i) => (
                <div key={i} className="text-xs text-slate-700 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
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

  // --- SELECTION / SETUP GATE SCREEN ---
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

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs space-y-6">
          <div className="text-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center mx-auto mb-4">
              <Bot className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">AI Live Video Mock Interview</h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Full-screen 1-on-1 video call simulation: The AI interviewer asks questions on your chosen topic and evaluates your spoken answers, language, and grammar.
            </p>
          </div>

          {/* Select Track or Topic */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Choose Track or Enter Custom Topic
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {['Technical', 'HR', 'Behavioral', 'Company-specific'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTrack(t); setCustomTopic(''); }}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all text-center ${
                    track === t && !effectiveTopic
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20 shadow-xs'
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
                placeholder="Or focus on a specific topic (e.g. React Architecture, Dynamic Programming, DBMS, System Design)..."
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              />
              {effectiveTopic && (
                <p className="text-[11px] text-indigo-700 mt-1.5 font-medium">
                  AI will dynamically generate 5 focused questions strictly on "{effectiveTopic}".
                </p>
              )}
            </div>
          </div>

          {/* Target Context */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-slate-700">Interviewing For:</span>{' '}
              <span className="font-bold text-indigo-700">{opportunity?.company || 'General Tech Benchmark'}</span>
            </div>
            <span className="text-slate-500 font-medium">{effectiveTopic ? 5 : 4} Questions • Real-Time Voice</span>
          </div>

          {/* Rules & Requirements */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Real-Time Video Call Protocol</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
              <li><strong>Full-Screen Video Call:</strong> Camera and microphone are required. The layout places you and the AI side-by-side.</li>
              <li><strong>Voice-First Interaction:</strong> The AI interviewer speaks the questions aloud and does not provide answers. You answer via your microphone.</li>
              <li><strong>Language & Grammar Feedback:</strong> After completing the session, AI will produce an extensive grammatical and technical accuracy breakdown.</li>
              <li><strong>Integrity Enforcement:</strong> Tab switching or leaving full-screen triggers a proctoring strike (3 strikes maximum).</li>
            </ul>
          </div>

          {gateError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{gateError}</span>
            </div>
          )}

          {mediaStream && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
              <video ref={setupVideoRef} autoPlay muted className="w-20 h-14 rounded-xl object-cover bg-black" />
              <span className="text-xs font-semibold text-emerald-800">Camera & mic feed verified</span>
            </div>
          )}

          <button
            onClick={handleBegin}
            disabled={gatePreparing || isLoading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            {gatePreparing || isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{gatePreparing ? 'Acquiring camera & mic...' : 'Connecting video call...'}</span>
              </>
            ) : (
              <>
                <Maximize className="w-4 h-4" />
                <span>{gateError ? 'Retry & Enter Video Call' : 'Enter Full-Screen Video Call'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // --- ACTIVE VIDEO CALL INTERVIEW INTERFACE (NO CHATTING SCREEN) ---
  const timeIsLow = secondsRemaining <= 25;

  return (
    <div id="mock-interview-call" className="max-w-6xl mx-auto space-y-4 pb-8 animate-fade-in">
      <ProctoringBanner
        violationCount={violationCount}
        maxViolations={maxViolations}
        lastViolation={lastViolation}
        modelLoadError={modelLoadError}
        isFaceVisible={isFaceVisible}
        faceCount={faceCount}
        audioLevel={audioLevel}
      />

      {/* Video Call Top Bar */}
      <div className="bg-slate-900 text-white rounded-2xl px-5 py-3 shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <div className="text-xs font-bold tracking-wide">
            LIVE INTERVIEW VIDEO CALL • {opportunity?.company || 'TECH ROUND'}
          </div>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-semibold text-indigo-300 border border-slate-700">
            {effectiveTopic || track}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${
            timeIsLow ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse' : 'bg-slate-800 text-slate-200 border border-slate-700'
          }`}>
            <Timer className="w-3.5 h-3.5" />
            <span>Time Left: {formatTime(secondsRemaining)}</span>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Question <span className="text-white font-bold">{Math.min(questionIndex + 1, totalQuestions)}</span> / {totalQuestions}
          </div>

          <button
            onClick={() => setVoiceAudioEnabled(!voiceAudioEnabled)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title={voiceAudioEnabled ? 'Mute AI voice output' : 'Enable AI voice output'}
          >
            {voiceAudioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={onExit}
            className="px-3 py-1 text-xs bg-rose-600/80 hover:bg-rose-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <PhoneOff className="w-3 h-3" />
            <span>End Call</span>
          </button>
        </div>
      </div>

      {/* Video Call Split Screen: Left AI Interviewer | Right Candidate (You) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Side: AI Interviewer Video Feed */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between relative overflow-hidden min-h-[380px] shadow-lg">
          {/* Top Status */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-xs px-3 py-1.5 rounded-full border border-slate-700 text-xs font-semibold text-slate-200">
              <Bot className="w-4 h-4 text-indigo-400" />
              <span>AI Technical Interviewer</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-800/90 text-slate-300 border border-slate-700">
              {aiIsSpeaking ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-emerald-400">Speaking Question...</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>Listening to Candidate</span>
                </>
              )}
            </div>
          </div>

          {/* Center: AI Virtual Avatar / Visualizer */}
          <div className="my-auto py-8 text-center z-10 space-y-4">
            <div className="relative inline-block">
              <div className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto transition-all ${
                aiIsSpeaking
                  ? 'bg-indigo-600 ring-8 ring-indigo-500/30 scale-105 shadow-2xl'
                  : 'bg-slate-800 ring-4 ring-slate-700'
              }`}>
                <Bot className={`w-14 h-14 ${aiIsSpeaking ? 'text-white' : 'text-indigo-400'}`} />
              </div>
              {aiIsSpeaking && (
                <div className="absolute -bottom-2 inset-x-0 flex justify-center items-center gap-1">
                  <span className="w-1.5 h-4 bg-emerald-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-6 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Senior Engineering Interviewer
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Asking questions only • Analyzing grammar, depth & confidence
              </p>
            </div>
          </div>

          {/* Bottom Question Teleprompter Card */}
          <div className="z-10 bg-slate-950/90 border border-slate-800 rounded-2xl p-4 backdrop-blur-md space-y-2">
            <div className="flex items-center justify-between text-[11px] text-indigo-400 font-bold uppercase tracking-wider">
              <span>Question {Math.min(questionIndex + 1, totalQuestions)} of {totalQuestions}</span>
              <button
                type="button"
                onClick={() => speakCurrentQuestion(currentAssistantMessage)}
                className="hover:text-white flex items-center gap-1 text-[11px] text-slate-400"
              >
                <Volume2 className="w-3 h-3" />
                <span>Replay Question Audio</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
              {currentAssistantMessage}
            </p>
          </div>
        </div>

        {/* Right Side: Candidate Live Video Call Feed */}
        <div className="bg-black rounded-3xl border border-slate-800 relative overflow-hidden min-h-[380px] shadow-lg flex flex-col justify-between">
          {/* Live Webcam Stream */}
          <video
            ref={candidateVideoRef}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover -scale-x-100"
          />

          {/* Top Overlays */}
          <div className="relative z-10 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-semibold text-white">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Candidate (You)</span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md border ${
                !isFaceVisible
                  ? 'bg-rose-600/90 text-white border-rose-400 animate-pulse'
                  : faceCount > 1
                  ? 'bg-amber-600/90 text-white border-amber-400 animate-pulse'
                  : 'bg-emerald-600/70 text-emerald-100 border-emerald-400/30'
              }`}>
                {!isFaceVisible ? 'Face Missing' : faceCount > 1 ? `${faceCount} People` : 'Face Active'}
              </span>

              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md ${
                isRecording
                  ? 'bg-rose-600/90 text-white animate-pulse'
                  : 'bg-black/60 text-slate-300 border border-white/10'
              }`}>
                {isRecording ? (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span>Microphone Live</span>
                  </>
                ) : (
                  <>
                    <MicOff className="w-3.5 h-3.5 text-slate-400" />
                    <span>Microphone Paused</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Overlays: Live Speech Transcript & Closed Captions */}
          <div className="relative z-10 p-4 space-y-2">
            <div className="bg-black/75 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 space-y-2 text-white">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5" />
                  <span>Live Spoken Transcript (Captions)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowManualTranscriptEdit(!showManualTranscriptEdit)}
                  className="text-[10px] text-slate-300 hover:text-white underline"
                >
                  {showManualTranscriptEdit ? 'Hide Editor' : 'Review / Edit Transcript'}
                </button>
              </div>

              {showManualTranscriptEdit ? (
                <textarea
                  rows={2}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Spoken words transcribe here automatically. You can also refine text manually if needed..."
                  className="w-full p-2 text-xs bg-slate-900/90 text-white rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              ) : (
                <p className="text-xs text-slate-200 min-h-[36px] max-h-[72px] overflow-y-auto leading-relaxed">
                  {userAnswer ? (
                    userAnswer
                  ) : (
                    <span className="italic text-slate-400">
                      {isRecording ? 'Speak now into your microphone... your words will appear here in real-time.' : 'Microphone is paused. Click "Start Speaking" below to answer.'}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Call Active Control Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Hint Nudge */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={requestHint}
            disabled={hintLoading || hintsUsed >= maxHints || isLoading}
            className="text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 border border-amber-200 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
          >
            {hintLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lightbulb className="w-3.5 h-3.5" />}
            <span>{hintsUsed >= maxHints ? 'No hints left' : `Need a hint? (${maxHints - hintsUsed} left)`}</span>
          </button>
          {hintText && (
            <span className="text-xs text-amber-900 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 max-w-sm line-clamp-1">
              {hintText}
            </span>
          )}
        </div>

        {/* Primary Microphone and Submission Actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {speechSupported && (
            <button
              type="button"
              onClick={toggleRecording}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-rose-600" />}
              <span>{isRecording ? 'Pause Mic' : 'Start Speaking'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => submitAnswer({ autoSubmittedOnTimeout: false })}
            disabled={!userAnswer.trim() || isLoading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating Response...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{questionIndex + 1 >= totalQuestions ? 'Submit Final Answer & Get Report' : 'Submit Answer & Next Question'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
