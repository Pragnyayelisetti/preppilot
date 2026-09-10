import { useRef, useState, useCallback, useEffect } from 'react';

/**
 * Client-side proctoring for the mock test flow.
 *
 * Runs while a test is active:
 *  1. MediaRecorder on the camera stream (actual recording).
 *  2. A face-landmark model (MediaPipe FaceMesh, with iris + lip refinement)
 *     to flag "no face" / "multiple faces" / "looking away" (head turn OR
 *     eye gaze) / "lip movement" (talking).
 *  3. A lightweight object-detection model (coco-ssd) to flag "cell phone"
 *     in frame.
 *  4. The Fullscreen API's `fullscreenchange` event to flag exiting
 *     full-screen. Exiting full-screen is ONLY ever a counted violation —
 *     it never stops the camera, the recording, or the test. The camera
 *     keeps recording and the test keeps running in the background exactly
 *     like every other violation type; only reaching `maxViolations` (or
 *     submitting) ends the session. Browsers refuse to silently re-enter
 *     full-screen from inside the `fullscreenchange` handler (re-entering
 *     requires a fresh user gesture such as a click), so this hook exposes
 *     `isFullscreen` + `reenterFullscreen()` for the UI to render a
 *     "click to return to full-screen" prompt instead.
 *
 * Everything runs in-browser via TensorFlow.js — no server round trip per frame.
 *
 * npm install @tensorflow/tfjs @tensorflow/tfjs-backend-webgl \
 *             @tensorflow-models/coco-ssd @tensorflow-models/face-landmarks-detection
 */

export type ViolationType =
  | 'no-face'
  | 'multiple-faces'
  | 'looking-away'
  | 'lip-movement'
  | 'speech-detected'
  | 'phone-detected'
  | 'fullscreen-exit'
  | 'tab-switch';

export interface ProctoringViolation {
  type: ViolationType;
  message: string;
  timestamp: number;
  count: number;
}

interface UseProctoringOptions {
  /** Camera stream obtained from getUserMedia — pass the one MockTestSetup already gets. */
  stream: MediaStream | null;
  /** Ref to the <video> element the stream is attached to. Pass the ref itself
   * (not `.current`) so the detection loop always reads the live DOM node
   * instead of whatever value happened to be current at the render where
   * this hook was called — that was the root cause of detection silently
   * never starting when the <video> mounted a tick after this hook did. */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Only runs detection/recording while true — flip off on submit/unmount. */
  active: boolean;
  /** Strikes before onMaxViolationsReached fires. Default 3. */
  maxViolations?: number;
  onViolation?: (violation: ProctoringViolation) => void;
  onMaxViolationsReached?: () => void;
}

const VIOLATION_MESSAGES: Record<ViolationType, string> = {
  'no-face': 'No face detected in camera frame',
  'multiple-faces': 'Multiple people detected in camera frame',
  'looking-away': 'Candidate looking away from exam screen',
  'lip-movement': 'Talking or lip movement detected',
  'speech-detected': 'Microphone detected speaking or unauthorized audio',
  'phone-detected': 'Mobile phone detected in frame',
  'fullscreen-exit': 'Exited full-screen exam mode',
  'tab-switch': 'Switched browser tab or minimized window',
};

const DETECTION_INTERVAL_MS = 1500;
const CONSECUTIVE_FRAMES_TO_FLAG = 2; // debounce so one noisy frame doesn't burn a strike
const VIOLATION_COOLDOWN_MS = 6000; // don't re-flag the same violation type back-to-back

// Head-yaw ("looking away" by turning the head): nose-tip offset from the
// eye-line midpoint, as a ratio of eye span. Tune against real footage.
const HEAD_YAW_THRESHOLD = 0.32;

// Eye-gaze ("looking away" with eyes only, head still facing forward):
// iris-center offset from the eye-corner midpoint, as a ratio of eye width.
// This is what actually catches someone glancing sideways at notes without
// turning their head — the old head-yaw-only check couldn't see that at all.
const GAZE_OFFSET_THRESHOLD = 0.38;

// Lip movement / talking: mouth-open height normalized by mouth width,
// sampled every tick and tracked over a short rolling window. Repeated
// open→close swings across that window (not just one big opening, which
// could be a yawn) are treated as talking.
const MOUTH_HISTORY_LENGTH = 6; // ~9s of samples at the 1.5s tick rate
const MOUTH_OPEN_RATIO_THRESHOLD = 0.16;
const MOUTH_MIN_OPEN_TRANSITIONS = 2;

export function useProctoring({
  stream,
  videoRef,
  active,
  maxViolations = 3,
  onViolation,
  onMaxViolationsReached,
}: UseProctoringOptions) {
  const [violationCount, setViolationCount] = useState(0);
  const [lastViolation, setLastViolation] = useState<ProctoringViolation | null>(null);
  const [violations, setViolations] = useState<ProctoringViolation[]>([]);
  const [modelsReady, setModelsReady] = useState(false);
  const [modelLoadError, setModelLoadError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(!!document.fullscreenElement);

  const cocoModelRef = useRef<any>(null);
  const faceModelRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);

  const awayStreakRef = useRef(0);
  const noFaceStreakRef = useRef(0);
  const mouthHistoryRef = useRef<number[]>([]);
  const lastFlagAtRef = useRef<Record<string, number>>({});
  const maxReachedFiredRef = useRef(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // ---- load detection models once ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const tf = await import('@tensorflow/tfjs');
        await import('@tensorflow/tfjs-backend-webgl');
        await tf.setBackend('webgl');

        const cocoSsd = await import('@tensorflow-models/coco-ssd');
        const faceLandmarks = await import('@tensorflow-models/face-landmarks-detection');

        const coco = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
        const face = await faceLandmarks.createDetector(
          faceLandmarks.SupportedModels.MediaPipeFaceMesh,
          {
            runtime: 'tfjs',
            // Needed for iris landmarks (real eye-gaze) and refined lip
            // landmarks (accurate mouth-open ratio for talking detection).
            refineLandmarks: true,
            // Cap at 4 so a crowded background doesn't tank frame rate, but
            // high enough that "multiple people" always trips the check —
            // the old cap of 2 was irrelevant to that (>1 already flags),
            // it just limited how many extra faces got reported.
            maxFaces: 4,
          }
        );

        if (!cancelled) {
          cocoModelRef.current = coco;
          faceModelRef.current = face;
          setModelsReady(true);
        }
      } catch (err) {
        console.error('Proctoring: failed to load detection models', err);
        if (!cancelled) {
          setModelLoadError(
            'AI proctoring models could not be loaded (network/browser issue) — face, gaze, phone and lip checks are unavailable this session.'
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- actual recording ----
  useEffect(() => {
    if (!stream || !active) return;

    try {
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.start(1000); // flush a chunk every second
      recorderRef.current = recorder;
    } catch (err) {
      console.error('Proctoring: could not start MediaRecorder', err);
    }

    return () => {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      }
    };
  }, [stream, active]);

  /** Call on submit to get the recorded session as a single webm Blob. */
  const stopRecordingAndGetBlob = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        resolve(chunksRef.current.length ? new Blob(chunksRef.current, { type: 'video/webm' }) : null);
        return;
      }
      recorder.onstop = () => {
        resolve(chunksRef.current.length ? new Blob(chunksRef.current, { type: 'video/webm' }) : null);
      };
      recorder.stop();
    });
  }, []);

  // ---- flag a violation, with per-type cooldown so one event isn't double-counted ----
  const flag = useCallback(
    (type: ViolationType) => {
      const now = Date.now();
      const last = lastFlagAtRef.current[type] ?? 0;
      if (now - last < VIOLATION_COOLDOWN_MS) return;
      lastFlagAtRef.current[type] = now;

      setViolationCount((prev) => {
        const next = prev + 1;
        const violation: ProctoringViolation = {
          type,
          message: VIOLATION_MESSAGES[type],
          timestamp: now,
          count: next,
        };
        setLastViolation(violation);
        setViolations((vList) => [...vList, violation]);
        onViolation?.(violation);
        if (next >= maxViolations && !maxReachedFiredRef.current) {
          maxReachedFiredRef.current = true;
          onMaxViolationsReached?.();
        }
        return next;
      });
    },
    [maxViolations, onViolation, onMaxViolationsReached]
  );

  // ---- fullscreen-exit counts as a violation, and ONLY that. It never
  // stops the camera/recording/test — the test must stay running in the
  // background either until the person clicks back into full-screen, the
  // test is submitted, or violations hit the max. ----
  const reenterFullscreen = useCallback(() => {
    // This must be called from a real click handler (user gesture) — the
    // browser silently rejects requestFullscreen() calls that aren't
    // directly inside one, which is exactly why this can't be done
    // automatically from the fullscreenchange handler below.
    return document.documentElement.requestFullscreen().catch((err) => {
      console.warn('Could not re-enter full-screen:', err);
    });
  }, []);

  useEffect(() => {
    if (!active) return;
    const handleFsChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      if (!fs) flag('fullscreen-exit');
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [active, flag]);

  // ---- tab-switch: fires whenever the tab is backgrounded — switching to
  // another tab, another application, or minimizing the window. Also listens to
  // window blur to catch app switches or multi-monitor focus loss immediately. ----
  useEffect(() => {
    if (!active) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flag('tab-switch');
    };
    const handleBlur = () => {
      flag('tab-switch');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [active, flag]);

  // ---- Microphone audio analysis for talking / speech detection ----
  useEffect(() => {
    if (!active || !stream) return;
    const audioTracks = stream.getAudioTracks();
    if (!audioTracks || audioTracks.length === 0) return;

    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let timer: number | null = null;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let vocalSpeakingTicks = 0;

        timer = window.setInterval(() => {
          if (!analyser) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          // Threshold for clear spoken vocal audio
          if (avg > 26) {
            vocalSpeakingTicks++;
            if (vocalSpeakingTicks >= 2) {
              flag('speech-detected');
              vocalSpeakingTicks = 0;
            }
          } else {
            vocalSpeakingTicks = Math.max(0, vocalSpeakingTicks - 1);
          }
        }, 800);
      }
    } catch (err) {
      console.warn('Audio proctoring analyzer unavailable:', err);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (source) {
        try { source.disconnect(); } catch {}
      }
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close().catch(() => {});
      }
    };
  }, [active, stream, flag]);

  // ---- detection loop: gaze / face count / lips / phone ----
  useEffect(() => {
    if (!active || !modelsReady) return;

    const tick = async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      // Phone detection
      try {
        const predictions = await cocoModelRef.current.detect(video);
        const hasPhone = predictions.some((p: any) => p.class === 'cell phone' && p.score > 0.55);
        if (hasPhone) flag('phone-detected');
      } catch {
        // non-fatal — skip this frame
      }

      // Face presence, count, gaze, and lip movement from landmark geometry
      try {
        const faces = await faceModelRef.current.estimateFaces(video);

        if (faces.length === 0) {
          noFaceStreakRef.current += 1;
          awayStreakRef.current = 0;
          mouthHistoryRef.current = [];
          if (noFaceStreakRef.current >= CONSECUTIVE_FRAMES_TO_FLAG) {
            flag('no-face');
            noFaceStreakRef.current = 0;
          }
          return;
        }
        noFaceStreakRef.current = 0;

        if (faces.length > 1) {
          flag('multiple-faces');
          // Still keep evaluating the primary face below for gaze/lips —
          // a multi-face flag shouldn't suppress other checks.
        }

        const kp = faces[0].keypoints as { x: number; y: number; name?: string }[];
        const get = (i: number) => kp[i];

        // --- Head yaw (nose offset from the eye-line midpoint) ---
        const leftEyeOuter = get(33);
        const rightEyeOuter = get(263);
        const nose = get(1);

        let headTurned = false;
        if (leftEyeOuter && rightEyeOuter && nose) {
          const eyeMidX = (leftEyeOuter.x + rightEyeOuter.x) / 2;
          const eyeSpan = Math.abs(rightEyeOuter.x - leftEyeOuter.x) || 1;
          const offsetRatio = (nose.x - eyeMidX) / eyeSpan;
          headTurned = Math.abs(offsetRatio) > HEAD_YAW_THRESHOLD;
        }

        // --- Eye gaze (iris position within each eye socket) — catches
        // someone looking to the side WITHOUT turning their head, which
        // head-yaw alone can never see. ---
        const gazeOffset = (
          cornerA: { x: number } | undefined,
          cornerB: { x: number } | undefined,
          iris: { x: number } | undefined
        ): number | null => {
          if (!cornerA || !cornerB || !iris) return null;
          const min = Math.min(cornerA.x, cornerB.x);
          const max = Math.max(cornerA.x, cornerB.x);
          const halfSpan = (max - min) / 2 || 1;
          const mid = (min + max) / 2;
          return (iris.x - mid) / halfSpan;
        };

        const gazeRight = gazeOffset(get(33), get(133), get(468));
        const gazeLeft = gazeOffset(get(263), get(362), get(473));
        const gazeSamples = [gazeRight, gazeLeft].filter((v): v is number => v !== null);
        const gazeAvg = gazeSamples.length
          ? gazeSamples.reduce((a, b) => a + b, 0) / gazeSamples.length
          : 0;
        const eyesAway = gazeSamples.length > 0 && Math.abs(gazeAvg) > GAZE_OFFSET_THRESHOLD;

        if (headTurned || eyesAway) {
          awayStreakRef.current += 1;
          if (awayStreakRef.current >= CONSECUTIVE_FRAMES_TO_FLAG) {
            flag('looking-away');
            awayStreakRef.current = 0;
          }
        } else {
          awayStreakRef.current = 0;
        }

        // --- Lip movement / talking (mouth-open ratio over a rolling window) ---
        const upperLip = get(13);
        const lowerLip = get(14);
        const mouthLeft = get(61);
        const mouthRight = get(291);
        if (upperLip && lowerLip && mouthLeft && mouthRight) {
          const mouthWidth =
            Math.hypot(mouthRight.x - mouthLeft.x, mouthRight.y - mouthLeft.y) || 1;
          const mouthOpen =
            Math.hypot(lowerLip.x - upperLip.x, lowerLip.y - upperLip.y) / mouthWidth;

          const history = mouthHistoryRef.current;
          history.push(mouthOpen);
          if (history.length > MOUTH_HISTORY_LENGTH) history.shift();

          let openTransitions = 0;
          for (let i = 1; i < history.length; i++) {
            const wasOpen = history[i - 1] > MOUTH_OPEN_RATIO_THRESHOLD;
            const isOpen = history[i] > MOUTH_OPEN_RATIO_THRESHOLD;
            if (!wasOpen && isOpen) openTransitions++;
          }

          if (openTransitions >= MOUTH_MIN_OPEN_TRANSITIONS) {
            flag('lip-movement');
            mouthHistoryRef.current = [];
          }
        }
      } catch {
        // non-fatal — skip this frame
      }
    };

    intervalRef.current = window.setInterval(tick, DETECTION_INTERVAL_MS);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [active, modelsReady, videoRef, flag]);

  return {
    violationCount,
    lastViolation,
    violations,
    modelsReady,
    modelLoadError,
    maxViolations,
    isFullscreen,
    reenterFullscreen,
    stopRecordingAndGetBlob,
  };
}
