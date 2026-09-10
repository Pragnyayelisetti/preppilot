import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { MockTest } from '../../types';
import {
  Sparkles,
  Target,
  Zap,
  Flame,
  Clock,
  FileText,
  Award,
  Camera,
  Mic,
  Maximize,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Loader2
} from 'lucide-react';

interface MockTestSetupProps {
  onReady: (test: MockTest, cameraStream: MediaStream | null) => void;
  onCancel: () => void;
}

const TOPIC_OPTIONS = [
  'Data Structures & Algorithms',
  'DBMS & SQL',
  'Operating Systems',
  'Computer Networks',
  'Object-Oriented Programming',
  'System Design',
];

export const MockTestSetup: React.FC<MockTestSetupProps> = ({ onReady, onCancel }) => {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mode, setMode] = useState<'skills' | 'topic'>('skills');
  const [topic, setTopic] = useState<string>(TOPIC_OPTIONS[0]);
  const [customTopic, setCustomTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [generating, setGenerating] = useState(false);
  const [test, setTest] = useState<MockTest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [preparing, setPreparing] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  const effectiveTopic = mode === 'topic' ? (customTopic.trim() || topic) : undefined;

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await api.generateMockTest({
        difficulty,
        skillBased: mode === 'skills',
        skills: mode === 'skills' ? (user?.skills || []) : undefined,
        topic: mode === 'topic' ? effectiveTopic : undefined,
      });
      if (res?.test) {
        setTest(res.test);
        setStep(3);
      } else {
        setError('Could not generate the test. Please try again.');
      }
    } catch (err) {
      console.error('Error generating test:', err);
      setError('Could not generate the test. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Camera access is MANDATORY for the test — without it there is no
  // proctoring, so we never let the test start on a null stream. On
  // failure we stay on this screen with a "Retry Camera Access" prompt.
  const handleStart = async () => {
    if (!test) return;
    setPreparing(true);
    setCameraError(null);

    // IMPORTANT: request fullscreen FIRST, synchronously, before any `await`.
    // Browsers only honour Fullscreen API calls while still inside the
    // click's "user activation" window — once you await getUserMedia (or
    // anything else) first, that window closes and requestFullscreen()
    // gets silently rejected. That silent rejection was why the test never
    // actually went fullscreen even though no error appeared.
    let enteredFullscreen = true;
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
      enteredFullscreen = false;
    }

    // Camera & Microphone — both required for strict proctoring. If this fails,
    // the test cannot begin: back out of full-screen and let the candidate retry.
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setCameraStream(stream);
    } catch (err) {
      console.warn('Camera/Microphone permission denied or unavailable:', err);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setCameraError(
        'Camera and microphone access are mandatory to start this proctored test. Please grant permissions in your browser and try again.'
      );
      setPreparing(false);
      return;
    }

    if (!enteredFullscreen) {
      setCameraError(
        'Full-screen mode could not be enabled — full screen is required for test integrity. Please allow it and try again.'
      );
      stream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
      setPreparing(false);
      return;
    }

    setPreparing(false);
    onReady(test, stream);
  };

  const totalMarks = test?.totalMarks ?? test?.questionCount ?? 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Step 1: What to test on */}
      {step === 1 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-6">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mock Test Setup</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-2">What do you want to be tested on?</h1>
            <p className="text-xs text-slate-500">Choose a general skill-based test, or pick a specific topic.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setMode('skills')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                mode === 'skills' ? 'border-indigo-500 bg-indigo-50/60' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Target className="w-5 h-5 text-indigo-600 mb-2" />
              <div className="text-sm font-bold text-slate-900">Based on my skills</div>
              <div className="text-xs text-slate-500 mt-1">
                {user?.skills?.length ? user.skills.slice(0, 4).join(', ') : 'Uses your profile skills'}
              </div>
            </button>

            <button
              onClick={() => setMode('topic')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                mode === 'topic' ? 'border-indigo-500 bg-indigo-50/60' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <FileText className="w-5 h-5 text-indigo-600 mb-2" />
              <div className="text-sm font-bold text-slate-900">A specific topic</div>
              <div className="text-xs text-slate-500 mt-1">Pick or type a topic to focus on</div>
            </button>
          </div>

          {mode === 'topic' && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap gap-2">
                {TOPIC_OPTIONS.map(t => (
                  <button
                    key={t}
                    onClick={() => { setTopic(t); setCustomTopic(''); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      topic === t && !customTopic ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Or type your own topic (e.g. React Hooks, Graph Algorithms)..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button onClick={onCancel} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900">
              Cancel
            </button>
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>Next: Choose Difficulty</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Difficulty */}
      {step === 2 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold text-slate-900">Choose your difficulty level</h1>
            <p className="text-xs text-slate-500">Higher difficulty means more questions and higher total marks.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {([
              { level: 'Easy' as const, icon: Target, desc: '10 questions • 20 min • 10 marks' },
              { level: 'Medium' as const, icon: Zap, desc: '15 questions • 30 min • 30 marks' },
              { level: 'Hard' as const, icon: Flame, desc: '20 questions • 40 min • 60 marks' },
            ]).map(({ level, icon: Icon, desc }) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  difficulty === level ? 'border-indigo-500 bg-indigo-50/60' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Icon className="w-5 h-5 text-indigo-600 mb-2" />
                <div className="text-sm font-bold text-slate-900">{level}</div>
                <div className="text-[11px] text-slate-500 mt-1">{desc}</div>
              </button>
            ))}
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">{error}</div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              {generating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating Test...</span>
                </>
              ) : (
                <>
                  <span>Generate Test</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Instructions + Fullscreen/Camera gate */}
      {step === 3 && test && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-6">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Test Ready</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-2">{test.title}</h1>
            <p className="text-xs text-slate-500">Read the instructions carefully before you begin.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <FileText className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
              <div className="text-lg font-extrabold text-slate-900">{test.questionCount}</div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Questions</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <Award className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
              <div className="text-lg font-extrabold text-slate-900">{totalMarks}</div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Total Marks</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <Clock className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
              <div className="text-lg font-extrabold text-slate-900">{test.durationMinutes}m</div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Duration</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <Zap className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
              <div className="text-lg font-extrabold text-slate-900">{test.difficulty}</div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Difficulty</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Strict Proctored Assessment Regulations</span>
            </div>
            <ul className="list-disc list-inside space-y-1.5 pl-1 text-slate-800">
              <li>
                <strong>Camera & Microphone are strictly mandatory</strong>: Visual facial tracking, lip movement detection, and audio speech detection will run continuously.
              </li>
              <li>
                <strong>Full-Screen Lockdown</strong>: The exam opens in full-screen mode. Exiting full-screen or minimizing the window counts as an integrity strike.
              </li>
              <li>
                <strong>Tab Switching / Focus Loss</strong>: Switching browser tabs or opening applications is instantly registered as a proctoring violation.
              </li>
              <li>
                <strong>Candidate Environment</strong>: You must be alone in the frame. Looking away, multiple faces, talking/lip movement, or mobile phone detection will trigger strikes.
              </li>
              <li>
                <strong className="text-rose-700">3-Strike Disqualification Rule</strong>: If 3 violations are logged, the proctored exam is immediately terminated, you are forced out, and the assessment is marked disqualified.
              </li>
            </ul>
          </div>

          {cameraError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{cameraError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                <Camera className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-slate-900">Mandatory Webcam</div>
                <div className="text-[11px] text-slate-500">Live face, lip movement & phone monitor</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                <Mic className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-slate-900">Mandatory Microphone</div>
                <div className="text-[11px] text-slate-500">Speech & unauthorized audio detector</div>
              </div>
            </div>
          </div>

          {cameraStream && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <video ref={videoRef} autoPlay muted className="w-20 h-14 rounded-lg object-cover bg-black" />
              <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Webcam & Microphone verified — AI proctoring active</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={handleStart}
              disabled={preparing}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              {preparing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Configuring Proctoring...</span>
                </>
              ) : (
                <>
                  <Maximize className="w-3.5 h-3.5" />
                  <span>{cameraError ? 'Grant Permissions & Start Proctored Exam' : 'Enter Fullscreen & Begin Proctored Exam'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};