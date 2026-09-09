import { Router, Request, Response } from 'express';
import { appState } from '../state';
import { generateContentWithFallback } from '../gemini';
import { MockInterviewSession, MockInterviewEvaluation, InterviewAnswerMetrics } from '../types';

export const mockInterviewRouter = Router();

const TRACK_QUESTIONS: Record<string, string[]> = {
  Technical: [
    'Can you describe a challenging technical project you built, the architecture decisions you made, and what trade-offs you encountered?',
    'How would you design a rate limiter for an API with high throughput, and how would you handle distributed state across multiple server nodes?',
    'Explain how database indexing works internally. When would you prefer a B+ Tree index over a Hash index, and what are the trade-offs of having too many indexes?',
    'What is the difference between synchronous and asynchronous I/O? How does an event loop handle non-blocking operations without spawning new threads?'
  ],
  HR: [
    'Tell me about yourself, your background in computer science, and what drove you to pursue software engineering.',
    'Why do you want to join our organization specifically rather than other technology companies?',
    'Where do you see yourself professionally in the next three years, and how do you plan to get there?',
    'Describe a time when you received tough constructive criticism on your code or behavior. How did you react?'
  ],
  Behavioral: [
    'Tell me about a time you faced a critical disagreement with a teammate or project partner. How did you handle it and what was the outcome?',
    'Describe a situation where you had a tight project deadline and had to make compromises. How did you prioritize what to ship?',
    'Give an example of a goal you set that you failed to achieve. What did you learn and how did you adapt?',
    'Tell me about a project where you took the initiative to learn a new framework or technology without being prompted.'
  ],
  'Company-specific': [
    'Walk me through the Amazon Leadership Principle of "Customer Obsession" or "Ownership". How have you demonstrated this in your university or internship projects?',
    'At Google, engineering excellence and scalability are paramount. How do you ensure your code is clean, testable, and fault-tolerant?',
    'How would you diagnose and debug a sudden 500ms latency spike in a live cloud microservice handling payments?',
    'Do you have any questions for me about engineering culture, mentoring, or technical challenges at this company?'
  ]
};

const DEFAULT_TIME_LIMIT_SECONDS = 150; // 2.5 minutes per question — "time matters"
const TOPIC_MODE_TOTAL_QUESTIONS = 5;
const MAX_HINTS_PER_QUESTION = 2;

// Strict rule reused across every prompt that generates interviewer text:
// the model's ONLY job is to ask a question (or a short hint) — it must
// never solve the question, write sample answers, or grade inline.
const INTERVIEWER_GUARDRAIL = `You are a professional AI interviewer conducting a real-time mock interview.
Your ONLY job right now is to ask ONE interview question. Rules you must never break:
- Never answer the question yourself.
- Never write or imply a sample/model answer.
- Never repeat a question already asked in this session.
- Output ONLY the question text itself — no preamble like "Great, next question:", no numbering, no markdown.`;

function buildFirstQuestionPrompt(topic: string, company?: string): string {
  return `${INTERVIEWER_GUARDRAIL}

Topic the candidate chose to be interviewed on: "${topic}"
${company ? `Target company context: ${company}` : ''}

Ask an opening interview question on this topic, appropriate for a college student / entry-level candidate.`;
}

function buildNextQuestionPrompt(session: MockInterviewSession): string {
  const history = session.conversation
    .map(c => `${c.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${c.content}`)
    .join('\n');
  return `${INTERVIEWER_GUARDRAIL}

Topic: "${session.topic}"
${session.company ? `Target company context: ${session.company}` : ''}
This is question ${session.currentQuestionIndex + 1} of ${session.totalQuestions}.

Conversation so far:
${history}

Ask the NEXT interview question on this topic, building naturally on what the candidate has said so far, without repeating any earlier question.`;
}

function fallbackQuestion(topic: string, index: number): string {
  const templates = [
    `Let's start with ${topic}: can you walk me through a project or problem where you applied it?`,
    `What's a common mistake people make with ${topic}, and how would you avoid it?`,
    `How would you explain a core concept of ${topic} to someone who's never heard of it?`,
    `Describe a trade-off you'd need to think about when using ${topic} in a real system.`,
    `If you had to go deeper into ${topic} next, what would you want to learn and why?`
  ];
  return templates[index % templates.length];
}

// Start Interview Session
mockInterviewRouter.post('/start', async (req: Request, res: Response) => {
  const { track = 'Technical', company, topic } = req.body;
  const sessionId = 'session_' + Date.now();
  const cleanTopic = typeof topic === 'string' ? topic.trim() : '';

  let firstQuestion: string;
  let questions: string[] = [];
  let totalQuestions: number;

  if (cleanTopic) {
    totalQuestions = TOPIC_MODE_TOTAL_QUESTIONS;
    const aiText = await generateContentWithFallback(
      buildFirstQuestionPrompt(cleanTopic, company),
      ''
    );
    firstQuestion = aiText.trim() || fallbackQuestion(cleanTopic, 0);
  } else {
    questions = TRACK_QUESTIONS[track] || TRACK_QUESTIONS.Technical;
    totalQuestions = questions.length;
    firstQuestion = questions[0];
  }

  const session: MockInterviewSession = {
    id: sessionId,
    track,
    topic: cleanTopic || undefined,
    company,
    currentQuestionIndex: 0,
    questions,
    totalQuestions,
    timeLimitSeconds: DEFAULT_TIME_LIMIT_SECONDS,
    conversation: [
      {
        role: 'assistant',
        content: `Hello! I am your AI interviewer for this ${company ? company + ' ' : ''}${cleanTopic ? cleanTopic : track} session. Let's begin.\n\n${firstQuestion}`,
        timestamp: new Date().toISOString()
      }
    ],
    status: 'in_progress',
    answerMetrics: [],
    hintsUsedForCurrentQuestion: 0
  };

  appState.interviewSessions[sessionId] = session;

  res.json({
    sessionId,
    currentQuestionIndex: 0,
    totalQuestions,
    timeLimitSeconds: session.timeLimitSeconds,
    question: firstQuestion,
    conversation: session.conversation
  });
});

// Give a short HINT for the current question — never the answer itself.
mockInterviewRouter.post('/hint', async (req: Request, res: Response) => {
  const { sessionId } = req.body;
  const session: MockInterviewSession = appState.interviewSessions[sessionId];
  if (!session) {
    return res.status(404).json({ error: 'Interview session not found' });
  }
  if (session.status === 'completed') {
    return res.status(400).json({ error: 'Interview already completed' });
  }

  if (session.hintsUsedForCurrentQuestion >= MAX_HINTS_PER_QUESTION) {
    return res.json({
      hint: "You've used all the hints available for this question — give it your best shot.",
      hintsUsedForCurrentQuestion: session.hintsUsedForCurrentQuestion,
      maxHints: MAX_HINTS_PER_QUESTION
    });
  }

  const currentQuestion =
    [...session.conversation].reverse().find(c => c.role === 'assistant')?.content || '';

  const prompt = `You are helping a candidate who is stuck during a live mock interview.
The interviewer just asked: "${currentQuestion}"

Give ONE short nudge (max 20 words) that points them toward HOW to think about or structure their answer.
Absolute rules:
- Do NOT answer the question.
- Do NOT give facts, definitions, or the solution.
- Do NOT write example sentences they could just read out.
Output ONLY the nudge itself, nothing else.`;

  const fallback = 'Think of a concrete example from a project you\'ve done, and structure it as: the situation, what you did, and the result.';
  const aiText = await generateContentWithFallback(prompt, fallback);
  const hint = (aiText || fallback).trim();

  session.hintsUsedForCurrentQuestion += 1;

  res.json({
    hint,
    hintsUsedForCurrentQuestion: session.hintsUsedForCurrentQuestion,
    maxHints: MAX_HINTS_PER_QUESTION
  });
});

// Submit answer to current question
mockInterviewRouter.post('/respond', async (req: Request, res: Response) => {
  const { sessionId, answer, metrics, autoSubmittedOnTimeout } = req.body;
  const session: MockInterviewSession = appState.interviewSessions[sessionId];

  if (!session) {
    return res.status(404).json({ error: 'Interview session not found' });
  }

  const answerText = typeof answer === 'string' && answer.trim()
    ? answer.trim()
    : '(No answer provided — time expired)';

  // Record user answer
  session.conversation.push({
    role: 'user',
    content: answerText,
    timestamp: new Date().toISOString()
  });

  const recordedMetrics: InterviewAnswerMetrics = {
    answeredViaVoice: !!metrics?.answeredViaVoice,
    timeTakenSeconds: typeof metrics?.timeTakenSeconds === 'number' ? metrics.timeTakenSeconds : 0,
    timeLimitSeconds: session.timeLimitSeconds,
    autoSubmittedOnTimeout: !!autoSubmittedOnTimeout,
    fillerWordCount: typeof metrics?.fillerWordCount === 'number' ? metrics.fillerWordCount : 0,
    wordsPerMinute: typeof metrics?.wordsPerMinute === 'number' ? metrics.wordsPerMinute : null,
    hintsUsed: session.hintsUsedForCurrentQuestion
  };
  session.answerMetrics.push(recordedMetrics);

  session.currentQuestionIndex += 1;
  session.hintsUsedForCurrentQuestion = 0;

  // Check if more questions remain
  if (session.currentQuestionIndex < session.totalQuestions) {
    let nextQ: string;

    if (session.topic) {
      const aiText = await generateContentWithFallback(buildNextQuestionPrompt(session), '');
      nextQ = aiText.trim() || fallbackQuestion(session.topic, session.currentQuestionIndex);
    } else {
      nextQ = session.questions[session.currentQuestionIndex];
    }

    const transitionMessage = `Thank you for your answer. Let's move to the next question:\n\n${nextQ}`;

    session.conversation.push({
      role: 'assistant',
      content: transitionMessage,
      timestamp: new Date().toISOString()
    });

    return res.json({
      completed: false,
      currentQuestionIndex: session.currentQuestionIndex,
      totalQuestions: session.totalQuestions,
      timeLimitSeconds: session.timeLimitSeconds,
      nextQuestion: nextQ,
      conversation: session.conversation
    });
  }

  // Interview Finished: Generate comprehensive AI evaluation
  session.status = 'completed';

  const userAnswersSummary = session.conversation
    .filter(c => c.role === 'user')
    .map((c, i) => {
      const m = session.answerMetrics[i];
      const signals = m
        ? ` [answered ${m.answeredViaVoice ? 'by voice' : 'by typing'}; took ${m.timeTakenSeconds}s of ${m.timeLimitSeconds}s allotted${m.autoSubmittedOnTimeout ? ' (ran out of time)' : ''}${m.wordsPerMinute ? `; ~${m.wordsPerMinute} words/min` : ''}${m.fillerWordCount ? `; ${m.fillerWordCount} filler words (um/uh/like)` : ''}${m.hintsUsed ? `; used ${m.hintsUsed} hint(s)` : ''}]`
        : '';
      return `Q${i + 1} Answer: ${c.content}${signals}`;
    })
    .join('\n\n');

  const prompt = `You are a Principal Tech Interviewer evaluating a candidate's mock interview responses.
Track: ${session.topic || session.track}
Company: ${session.company || 'Tech Company'}
Candidate's Answers, with real-time signals captured during the live session (voice/typing, time taken vs allotted, speaking pace, filler-word count, hints used):
${userAnswersSummary}

Use the bracketed signals to ground your scoring — e.g. heavy filler-word usage or repeated hint usage should lower confidence/communication; running out of time repeatedly should be called out; strong pacing and no hints used should raise confidence. Also check the answers themselves for grammatical mistakes (in typing OR speech) and note specific ones in whatToImprove.

Provide a realistic, professional evaluation strictly as JSON:
{
  "overallScore": 84,
  "communication": 82,
  "technicalAccuracy": 85,
  "problemSolving": 86,
  "confidence": 80,
  "structure": 88,
  "whatYouDidWell": [
    "Clear explanation of architecture choices",
    "Effective usage of the STAR framework with concrete metrics",
    "Good awareness of trade-offs and edge cases"
  ],
  "whatToImprove": [
    "Elaborate more on error handling and fallback mechanisms",
    "Avoid jumping straight to the complex solution before stating the baseline"
  ],
  "betterAnswerApproach": "When discussing distributed rate limiters, explicitly mention Redis Token Bucket or Sliding Window Log algorithms with TTL and network partition resilience.",
  "recommendedPractice": [
    "Practice system design latency estimation numbers",
    "Rehearse behavioral responses under 90-second time limits",
    "Review LeetCode top concurrency and synchronization problems"
  ]
}`;

  try {
    const aiText = await generateContentWithFallback(prompt, '');
    let evalData: MockInterviewEvaluation | null = null;

    if (aiText) {
      try {
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          evalData = JSON.parse(jsonMatch[0]);
        }
      } catch (err) {
        console.warn('Failed parsing Gemini interview evaluation');
      }
    }

    if (!evalData) {
      // High quality fallback evaluation
      evalData = {
        overallScore: 82,
        communication: 84,
        technicalAccuracy: 80,
        problemSolving: 85,
        confidence: 79,
        structure: 83,
        whatYouDidWell: [
          'Articulated the core requirements clearly before presenting the final approach',
          'Good logical structure using concrete real-world engineering terminology',
          'Demonstrated clear ownership and problem decomposition'
        ],
        whatToImprove: [
          'Quantify your impact more precisely (e.g., latency reduction percentages or throughput numbers)',
          'Address operational monitoring and failure modes proactively'
        ],
        betterAnswerApproach: 'Anchor your technical answers around the CAR framework: Context (the environment and challenge), Action (your specific technical execution), and Result (the measurable latency or business outcome).',
        recommendedPractice: [
          'Review distributed systems fundamentals and CAP theorem trade-offs',
          'Practice 2-minute behavioral drill recordings using the STAR format',
          'Brush up on memory management and database indexing patterns'
        ]
      };
    }

    session.evaluation = evalData;

    session.conversation.push({
      role: 'assistant',
      content: `That concludes our mock interview! I have generated your comprehensive evaluation report with scores across Communication, Technical Accuracy, Problem Solving, and Structure. Review your feedback below to accelerate your preparation.`,
      timestamp: new Date().toISOString()
    });

    res.json({
      completed: true,
      evaluation: evalData,
      conversation: session.conversation
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed generating interview feedback: ' + err.message });
  }
});

// Get session details
mockInterviewRouter.get('/:id', (req: Request, res: Response) => {
  const session = appState.interviewSessions[req.params.id];
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json({ session });
});
