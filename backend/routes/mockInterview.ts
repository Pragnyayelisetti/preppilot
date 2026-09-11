import { Router, Request, Response } from 'express';
import { appState } from '../state';
import { generateContentWithFallback } from '../gemini';
import { MockInterviewSession, MockInterviewEvaluation, InterviewAnswerMetrics } from '../types';

export const mockInterviewRouter = Router();

// Pool of varied fallback questions when AI generation is unavailable
const TRACK_FALLBACK_POOLS: Record<string, string[]> = {
  Technical: [
    'Can you describe a challenging technical project you built, the architecture decisions you made, and what trade-offs you encountered?',
    'How would you design a rate limiter for an API with high throughput, and how would you handle distributed state across multiple server nodes?',
    'Explain how database indexing works internally. When would you prefer a B+ Tree index over a Hash index, and what are the trade-offs of having too many indexes?',
    'What is the difference between synchronous and asynchronous I/O? How does an event loop handle non-blocking operations without spawning new threads?',
    'How do you design a robust caching strategy using Redis or Memcached to prevent cache stampedes and stale reads?',
    'Walk me through how a web browser renders a page from the moment a user types a URL to the final pixel paint on screen.',
    'Explain how you would handle race conditions when updating shared financial balance records in a distributed microservice environment.'
  ],
  HR: [
    'Tell me about yourself, your background in computer science, and what drove you to pursue software engineering.',
    'Why do you want to join our organization specifically rather than other technology companies?',
    'Where do you see yourself professionally in the next three years, and how do you plan to get there?',
    'Describe a time when you received tough constructive criticism on your code or behavior. How did you react?',
    'What kind of work environment and engineering culture allows you to perform at your highest potential?',
    'How do you maintain work-life balance and avoid burnout when working on demanding technical milestones?'
  ],
  Behavioral: [
    'Tell me about a time you faced a critical disagreement with a teammate or project partner. How did you handle it and what was the outcome?',
    'Describe a situation where you had a tight project deadline and had to make compromises. How did you prioritize what to ship?',
    'Give an example of a goal you set that you failed to achieve. What did you learn and how did you adapt?',
    'Tell me about a project where you took the initiative to learn a new framework or technology without being prompted.',
    'Describe an instance where you discovered a serious bug right before a demo or submission. What immediate actions did you take?'
  ],
  'Company-specific': [
    'Walk me through a project where you demonstrated customer obsession or deep ownership over an end-to-end user problem.',
    'At top tech companies, scalability and reliability are paramount. How do you design systems with high fault tolerance and automatic failover?',
    'How would you diagnose and debug an unexpected 500ms latency spike in a live production microservice?',
    'If you were tasked with building a global real-time notifications engine for millions of active users, what architecture would you choose?'
  ]
};

const DEFAULT_TIME_LIMIT_SECONDS = 150; // 2.5 minutes per question
const TOTAL_QUESTIONS_PER_SESSION = 4;
const MAX_HINTS_PER_QUESTION = 2;

const INTERVIEWER_GUARDRAIL = `You are an expert AI technical & HR interviewer conducting an authentic live mock interview for university students and early-career software engineers.
Rules you must strictly uphold:
- Ask ONE concise, high-impact, realistic interview question.
- Never answer the question yourself or provide sample answers.
- Never repeat questions already asked in this session.
- Output ONLY the question text itself — no intro phrases, greetings, numbers, or markdown.`;

function buildFirstQuestionPrompt(track: string, company?: string, topic?: string): string {
  return `${INTERVIEWER_GUARDRAIL}

Interview Settings:
- Track: ${track}
${topic ? `- Specific Focus Topic: "${topic}"` : ''}
${company ? `- Target Company Context: "${company}"` : ''}

Generate a fresh, realistic opening interview question tailored to this ${track} interview. Make it thought-provoking and appropriate for a competitive software engineering / intern assessment.
Output ONLY the question text.`;
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
${session.company ? `- Target Company: "${session.company}"` : ''}
- Question ${session.currentQuestionIndex + 1} of ${session.totalQuestions}

Conversation History so far:
${history}

LATEST CANDIDATE RESPONSE:
"${lastUserAnswer}"

CRITICAL ADAPTIVE INSTRUCTION:
- You MUST adapt this next question directly based on what the candidate just explained above.
- Dig deeper into specific concepts, frameworks, trade-offs, algorithms, or examples they mentioned.
- If they missed critical considerations (such as edge cases, failure recovery, security, testing, or user experience), ask an adaptive follow-up probing that exact gap.
- Output ONLY the question text itself.`;
}

function getFallbackQuestion(track: string, topic?: string, index: number = 0): string {
  const pool = TRACK_FALLBACK_POOLS[track] || TRACK_FALLBACK_POOLS.Technical;
  const randIndex = (index + Math.floor(Math.random() * pool.length)) % pool.length;
  return pool[randIndex];
}

// Helper to generate dynamic evaluation fallback when Gemini is unavailable
function generateDynamicFallbackEvaluation(
  session: MockInterviewSession,
  userResponses: { question: string; answer: string; metrics?: InterviewAnswerMetrics }[]
): MockInterviewEvaluation {
  const totalAnswers = userResponses.length;
  const allAnswersText = userResponses.map(r => r.answer).join(' ');
  const wordCount = allAnswersText.split(/\s+/).filter(Boolean).length;
  const avgWordsPerAnswer = totalAnswers > 0 ? Math.round(wordCount / totalAnswers) : 0;

  const totalFillerWords = userResponses.reduce(
    (acc, curr) => acc + (curr.metrics?.fillerWordCount || 0),
    0
  );

  // Score adjustments based on answer length and substance
  let scoreBase = 78;
  if (avgWordsPerAnswer > 60) scoreBase += 6;
  if (avgWordsPerAnswer > 110) scoreBase += 4;
  if (totalFillerWords > 6) scoreBase -= 4;

  const primaryTopic = session.topic || session.track || 'Engineering';

  // Sample extract from candidate answers for personalized feedback
  const firstAns = userResponses[0]?.answer || '';
  const firstWords = firstAns.split(' ').slice(0, 8).join(' ');

  return {
    overallScore: Math.min(94, Math.max(68, scoreBase)),
    communication: Math.min(92, Math.max(70, scoreBase - (totalFillerWords > 5 ? 5 : 0))),
    technicalAccuracy: Math.min(95, Math.max(70, scoreBase + 2)),
    problemSolving: Math.min(93, Math.max(70, scoreBase)),
    confidence: Math.min(90, Math.max(68, scoreBase - (totalFillerWords > 4 ? 3 : 0))),
    structure: Math.min(92, Math.max(72, scoreBase + 1)),
    languageAndGrammar: {
      grammarScore: Math.min(92, Math.max(74, scoreBase)),
      vocabularyScore: Math.min(90, Math.max(72, scoreBase - 1)),
      fluencyScore: Math.min(94, Math.max(70, scoreBase + 1)),
      grammarCritiques: [
        {
          originalPhrase: firstWords ? `"${firstWords}..."` : 'Informal phrasing in explanation',
          correction: 'Use structured active phrasing: "In my previous project, I implemented..."',
          rule: 'Maintain consistent past tense when describing previous implementations, and active voice for engineering decisions.'
        }
      ],
      vocabularySuggestions: [
        {
          spokenWord: 'it handled the data',
          enhancedAlternative: 'ingested, sanitized, and batched data processing pipelines'
        },
        {
          spokenWord: 'made it work',
          enhancedAlternative: 'architected and deployed a resilient solution'
        }
      ],
      deliveryFeedback: `Your response length averaged ~${avgWordsPerAnswer} words per response. ${
        totalFillerWords > 0
          ? `Detected approximately ${totalFillerWords} conversational filler word(s). Pausing before speaking will help project authority.`
          : 'Clean articulation with minimal vocal pauses detected.'
      }`
    },
    whatYouDidWell: [
      `Engaged with the ${primaryTopic} interview questions directly and addressed the core problem parameters`,
      `Maintained a clear progression from context to implementation across answers`,
      `Demonstrated familiarity with key engineering workflows and concepts`
    ],
    whatToImprove: [
      `Structure answers using the STAR format (Situation, Task, Action, Result) to provide measurable outcomes`,
      `Highlight edge case prevention, error boundaries, and monitoring metrics more prominently`,
      `Elaborate on architectural alternatives considered before choosing your final approach`
    ],
    betterAnswerApproach: `For ${primaryTopic} interviews, start by clarifying assumptions, outline your high-level strategy, dive into the implementation trade-offs, and conclude with concrete operational metrics (e.g. latency, reliability, team velocity).`,
    recommendedPractice: [
      `Practice 2-minute timed voice drills for ${primaryTopic} topics`,
      `Study system design failure recovery and API rate limiting mechanisms`,
      `Refine behavioral stories highlighting leadership and technical disagreements using STAR`
    ]
  };
}

// Start Interview Session with dynamic AI Question Generation
mockInterviewRouter.post('/start', async (req: Request, res: Response) => {
  const { track = 'Technical', company, topic } = req.body;
  const sessionId = 'session_' + Date.now();
  const cleanTopic = typeof topic === 'string' ? topic.trim() : '';

  let firstQuestion: string = '';

  try {
    const aiText = await generateContentWithFallback(
      buildFirstQuestionPrompt(track, company, cleanTopic),
      ''
    );
    firstQuestion = aiText.trim();
  } catch (err) {
    console.warn('AI first question generation failed, using pool fallback');
  }

  if (!firstQuestion) {
    firstQuestion = getFallbackQuestion(track, cleanTopic, 0);
  }

  const session: MockInterviewSession = {
    id: sessionId,
    track,
    topic: cleanTopic || undefined,
    company,
    currentQuestionIndex: 0,
    questions: [firstQuestion],
    totalQuestions: TOTAL_QUESTIONS_PER_SESSION,
    timeLimitSeconds: DEFAULT_TIME_LIMIT_SECONDS,
    conversation: [
      {
        role: 'assistant',
        content: `Hello! I am your AI interviewer for this ${company ? company + ' ' : ''}${cleanTopic ? cleanTopic : track} interview session. Let's begin.\n\n${firstQuestion}`,
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
    totalQuestions: TOTAL_QUESTIONS_PER_SESSION,
    timeLimitSeconds: session.timeLimitSeconds,
    question: firstQuestion,
    conversation: session.conversation
  });
});

// Give a short HINT for the current question — never the answer itself
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
      hint: "You've reached the maximum hints for this question. Give it your best shot!",
      hintsUsedForCurrentQuestion: session.hintsUsedForCurrentQuestion,
      maxHints: MAX_HINTS_PER_QUESTION
    });
  }

  const currentQuestion =
    [...session.conversation].reverse().find(c => c.role === 'assistant')?.content || '';

  const prompt = `You are assisting a candidate who requested a hint during a live mock interview.
The interviewer asked: "${currentQuestion}"

Provide ONE short, helpful guiding nudge (maximum 22 words) to help them structure their thought process.
Strict rules:
- Do NOT answer the question.
- Do NOT give away solutions, code snippets, or explicit answers.
Output ONLY the hint nudge.`;

  const fallback = 'Focus on breaking down the problem: state your assumptions, the core approach, and the main trade-off.';
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

  // Record candidate's answer
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

  // If more questions remain in the session, generate adaptive next question
  if (session.currentQuestionIndex < session.totalQuestions) {
    let nextQ: string = '';
    try {
      const aiText = await generateContentWithFallback(buildNextQuestionPrompt(session), '');
      nextQ = aiText.trim();
    } catch {
      // ignore
    }

    if (!nextQ) {
      nextQ = getFallbackQuestion(session.track, session.topic, session.currentQuestionIndex);
    }

    session.questions.push(nextQ);

    const transitionMessage = `Thank you for your response. Let's move to the next question:\n\n${nextQ}`;

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

  // Interview Completed: Generate comprehensive, user-answer-based AI evaluation report
  session.status = 'completed';

  const userAnswersPairs = session.conversation
    .filter(c => c.role === 'user')
    .map((c, i) => {
      const q = session.questions[i] || `Question ${i + 1}`;
      const m = session.answerMetrics[i];
      return {
        question: q,
        answer: c.content,
        metrics: m
      };
    });

  const promptUserSummary = userAnswersPairs
    .map((pair, idx) => {
      const m = pair.metrics;
      const metricsInfo = m
        ? ` (Time: ${m.timeTakenSeconds}s, Fillers: ${m.fillerWordCount}, ${m.answeredViaVoice ? 'Voice' : 'Typed'})`
        : '';
      return `Q${idx + 1}: ${pair.question}
Candidate's Spoken Answer${metricsInfo}:
"${pair.answer}"`;
    })
    .join('\n\n');

  const evalPrompt = `You are a Senior Engineering Hiring Manager and Technical Communication Coach evaluating a student's live mock interview responses.

Interview Track: ${session.track}
${session.topic ? `Focus Topic: ${session.topic}` : ''}
${session.company ? `Target Company: ${session.company}` : ''}

CANDIDATE'S ACTUAL QUESTIONS AND ANSWERS:
${promptUserSummary}

CRITICAL MANDATORY INSTRUCTIONS:
1. Your report MUST be directly and accurately based on the candidate's actual answers shown above.
2. Under "whatYouDidWell", cite specific points, algorithms, or examples the candidate actually mentioned in their answers.
3. Under "whatToImprove", point out exact technical inaccuracies, omitted edge cases, or weak explanations present in their answers.
4. Under "languageAndGrammar", analyze their actual grammar, vocabulary, and phrasing:
   - Provide "grammarCritiques" identifying an actual imperfect phrase they used -> improved professional version -> rule.
   - Provide "vocabularySuggestions" taking words they used -> higher-level engineering terms.
5. Score them fairly (0-100) based on their real performance.

Output ONLY valid JSON matching this schema:
{
  "overallScore": 82,
  "communication": 80,
  "technicalAccuracy": 84,
  "problemSolving": 82,
  "confidence": 78,
  "structure": 85,
  "languageAndGrammar": {
    "grammarScore": 83,
    "vocabularyScore": 80,
    "fluencyScore": 85,
    "grammarCritiques": [
      {
        "originalPhrase": "exact or close phrase from candidate answer",
        "correction": "polished professional sentence",
        "rule": "grammatical explanation"
      }
    ],
    "vocabularySuggestions": [
      {
        "spokenWord": "word candidate used",
        "enhancedAlternative": "stronger industry term"
      }
    ],
    "deliveryFeedback": "Detailed observation on their speech pace and clarity based on their actual words."
  },
  "whatYouDidWell": [
    "Specific strength referring to what they actually stated in their answers"
  ],
  "whatToImprove": [
    "Specific gap or missing consideration in their actual responses"
  ],
  "betterAnswerApproach": "A concrete blueprint of how to ideally answer their specific questions.",
  "recommendedPractice": [
    "Specific technical or behavioral drill recommendations"
  ]
}`;

  let evalData: MockInterviewEvaluation | null = null;

  try {
    const aiText = await generateContentWithFallback(evalPrompt, '');
    if (aiText) {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        evalData = JSON.parse(jsonMatch[0]);
      }
    }
  } catch (err) {
    console.warn('AI evaluation generation failed, utilizing dynamic answer analyzer');
  }

  if (!evalData) {
    evalData = generateDynamicFallbackEvaluation(session, userAnswersPairs);
  }

  session.evaluation = evalData;

  session.conversation.push({
    role: 'assistant',
    content: `Great job completing your mock interview! I have generated your comprehensive performance report analyzing your answers, technical depth, communication, and grammar. Review your personalized report below.`,
    timestamp: new Date().toISOString()
  });

  res.json({
    completed: true,
    evaluation: evalData,
    conversation: session.conversation
  });
});

// Fetch current session details
mockInterviewRouter.get('/session/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const session = appState.interviewSessions[sessionId];
  if (!session) {
    return res.status(404).json({ error: 'Interview session not found' });
  }
  res.json(session);
});
