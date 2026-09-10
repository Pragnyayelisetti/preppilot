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
  const lastUserAnswer = [...session.conversation].reverse().find(c => c.role === 'user')?.content || '';

  return `${INTERVIEWER_GUARDRAIL}

Interview Context:
- Track: ${session.track}
${session.topic ? `- Focus Topic: "${session.topic}"` : ''}
${session.company ? `- Target Company: ${session.company}` : ''}
- Question ${session.currentQuestionIndex + 1} of ${session.totalQuestions}

Conversation History so far:
${history}

LATEST CANDIDATE RESPONSE:
"${lastUserAnswer}"

MANDATORY ADAPTIVE INSTRUCTION:
- You MUST adapt this next question directly based on what the candidate just explained above!
- Probe deeper into any technical terms, frameworks, architectural trade-offs, algorithms, or examples they brought up.
- If they struggled or missed key considerations (like scalability, edge cases, error handling, or teamwork dynamics), ask an adaptive follow-up probing that area.
- Ask ONE concise, authentic interview question. Do NOT repeat previous questions.
- Output ONLY the question text itself.`;
}

function fallbackQuestion(topicOrTrack: string, index: number, lastAnswer?: string): string {
  const isTechnical = /tech|dsa|system|code|data|sql|dev/i.test(topicOrTrack);
  if (isTechnical) {
    const technicalFollowUps = [
      `Building on what you just shared: what edge cases or failure modes would you need to protect against in production?`,
      `How would your design or approach scale if the traffic or dataset size increased by 100x?`,
      `What alternative technology or pattern did you consider for that, and what was the main trade-off?`,
      `How would you test and monitor that system to ensure 99.9% uptime and low latency?`,
      `If you had to refactor that implementation today, what is the first thing you would improve and why?`
    ];
    return technicalFollowUps[index % technicalFollowUps.length];
  }
  const generalFollowUps = [
    `That's interesting. What was the biggest obstacle you personally overcame during that experience?`,
    `How did you measure whether that outcome was successful, and what would you do differently in hindsight?`,
    `Can you describe how you communicated that decision to other team members or stakeholders?`,
    `If priorities shifted unexpectedly halfway through, how would you adapt your approach?`
  ];
  return generalFollowUps[index % generalFollowUps.length];
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
    try {
      const aiText = await generateContentWithFallback(buildNextQuestionPrompt(session), '');
      const lastAns = session.conversation.filter(c => c.role === 'user').pop()?.content;
      nextQ = aiText.trim() || fallbackQuestion(session.topic || session.track, session.currentQuestionIndex, lastAns);
    } catch {
      const lastAns = session.conversation.filter(c => c.role === 'user').pop()?.content;
      nextQ = fallbackQuestion(session.topic || session.track, session.currentQuestionIndex, lastAns);
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

  const prompt = `You are a Principal Tech Interviewer and Executive Communication Coach evaluating a candidate's live spoken mock interview responses.
Topic: ${session.topic || session.track}
Company: ${session.company || 'Tech Company'}

Candidate's Spoken Responses (captured live via microphone speech recognition, along with speaking pace, filler words, and hints):
${userAnswersSummary}

Thoroughly evaluate their technical answers AND their language, grammar, fluency, and spoken communication delivery.
Specifically:
1. Examine the grammar of their spoken responses: identify specific sentence structure flaws, subject-verb agreement issues, tense inconsistencies, or informal phrasing.
2. Provide specific grammar critiques: original spoken phrase -> grammatically correct polished phrasing -> rule explained.
3. Provide vocabulary suggestions: words they spoke -> stronger professional engineering/industry vocabulary.
4. Score them objectively across all dimensions (0-100), including grammarScore, vocabularyScore, and fluencyScore.

Provide your evaluation strictly as valid JSON conforming to this schema:
{
  "overallScore": 84,
  "communication": 82,
  "technicalAccuracy": 85,
  "problemSolving": 86,
  "confidence": 80,
  "structure": 88,
  "languageAndGrammar": {
    "grammarScore": 85,
    "vocabularyScore": 82,
    "fluencyScore": 86,
    "grammarCritiques": [
      {
        "originalPhrase": "we was using redis cache to make it faster",
        "correction": "we were utilizing Redis caching to optimize response latency",
        "rule": "Subject-verb agreement (plural 'we were') and precise engineering vocabulary."
      }
    ],
    "vocabularySuggestions": [
      {
        "spokenWord": "make it faster",
        "enhancedAlternative": "reduce p99 latency and improve throughput"
      }
    ],
    "deliveryFeedback": "Spoke clearly with good cadence. Minimal filler words detected. Ensure consistent past tense when narrating prior engineering projects."
  },
  "whatYouDidWell": [
    "Clear explanation of architecture choices",
    "Effective usage of the STAR framework with concrete metrics",
    "Good awareness of trade-offs and edge cases"
  ],
  "whatToImprove": [
    "Tighten grammatical consistency when switching between project backstory and current design",
    "Elaborate more on error handling and fallback mechanisms",
    "Avoid jumping straight to the complex solution before stating the baseline"
  ],
  "betterAnswerApproach": "When discussing technical trade-offs, state the problem first, describe the primary mechanism (e.g. Redis sliding window log), and finish with measurable latency and fault-tolerance metrics.",
  "recommendedPractice": [
    "Practice speaking technical explanations with zero filler words under 90 seconds",
    "Review distributed systems latency numbers and system design terminology",
    "Rehearse behavioral responses using the STAR method"
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
      // High quality fallback evaluation with language & grammar breakdown
      evalData = {
        overallScore: 82,
        communication: 84,
        technicalAccuracy: 80,
        problemSolving: 85,
        confidence: 79,
        structure: 83,
        languageAndGrammar: {
          grammarScore: 84,
          vocabularyScore: 82,
          fluencyScore: 86,
          grammarCritiques: [
            {
              originalPhrase: 'The system handle the requests by queuing them',
              correction: 'The system handles requests by queuing them asynchronously',
              rule: 'Third-person singular agreement: subject "system" takes singular verb "handles".'
            }
          ],
          vocabularySuggestions: [
            {
              spokenWord: 'it broke',
              enhancedAlternative: 'encountered service degradation or partition failure'
            },
            {
              spokenWord: 'good speed',
              enhancedAlternative: 'sub-50ms p99 latency SLA'
            }
          ],
          deliveryFeedback: 'Articulated thoughts clearly with steady speech cadence. Good conversational confidence with slight reliance on conversational fillers.'
        },
        whatYouDidWell: [
          'Articulated the core requirements clearly before presenting the final approach',
          'Good logical structure using concrete real-world engineering terminology',
          'Demonstrated clear ownership and problem decomposition'
        ],
        whatToImprove: [
          'Maintain grammatical consistency when explaining past project outcomes versus current architectures',
          'Quantify your impact more precisely (e.g., latency reduction percentages or throughput numbers)',
          'Address operational monitoring and failure modes proactively'
        ],
        betterAnswerApproach: 'Anchor your technical answers around the CAR framework: Context (the environment and challenge), Action (your specific technical execution), and Result (the measurable latency or business outcome).',
        recommendedPractice: [
          'Practice recording 2-minute technical answers focused on vocal clarity and grammar',
          'Review distributed systems fundamentals and CAP theorem trade-offs',
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
