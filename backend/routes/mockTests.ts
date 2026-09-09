import { Router, Request, Response } from 'express';
import { MOCK_TESTS } from '../data';
import { MockTestResult } from '../types';
import { appState } from '../state';
import { generateContentWithFallback } from '../gemini';

export const mockTestsRouter = Router();

// GET all mock tests
mockTestsRouter.get('/', (req: Request, res: Response) => {
  const summaries = MOCK_TESTS.map(t => ({
    id: t.id,
    opportunityId: t.opportunityId,
    title: t.title,
    company: t.company,
    difficulty: t.difficulty,
    durationMinutes: t.durationMinutes,
    questionCount: t.questions.length,
    topics: t.topics
  }));

  res.json({ tests: summaries });
});

// --- Dynamic test generation -------------------------------------------

const DIFFICULTY_CONFIG: Record<string, { questionCount: number; durationMinutes: number; marksPerQuestion: number }> = {
  Easy: { questionCount: 10, durationMinutes: 20, marksPerQuestion: 1 },
  Medium: { questionCount: 15, durationMinutes: 30, marksPerQuestion: 2 },
  Hard: { questionCount: 20, durationMinutes: 40, marksPerQuestion: 3 },
};

// Small local question bank used only if Gemini isn't configured/available,
// so test generation never hard-fails.
const FALLBACK_BANK = [
  { question: 'What is the time complexity of binary search on a sorted array of n elements?', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], correctAnswerIndex: 1, explanation: 'Binary search halves the search space each step, giving O(log n).', topic: 'Data Structures & Algorithms' },
  { question: 'Which data structure uses LIFO (Last In First Out) ordering?', options: ['Queue', 'Stack', 'Linked List', 'Heap'], correctAnswerIndex: 1, explanation: 'A stack pushes/pops from the same end, giving Last-In-First-Out order.', topic: 'Data Structures & Algorithms' },
  { question: 'In SQL, which clause is used to filter grouped rows?', options: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'], correctAnswerIndex: 1, explanation: 'HAVING filters rows after GROUP BY aggregation; WHERE filters before grouping.', topic: 'DBMS' },
  { question: 'What does the acronym REST stand for in web APIs?', options: ['Remote Execution State Transfer', 'Representational State Transfer', 'Reliable State Transport', 'Resource State Tracking'], correctAnswerIndex: 1, explanation: 'REST = Representational State Transfer, an architectural style for APIs.', topic: 'System Design' },
  { question: 'Which OS scheduling algorithm can cause starvation of low-priority processes?', options: ['Round Robin', 'Priority Scheduling', 'FCFS', 'Shortest Job First (non-preemptive, single queue)'], correctAnswerIndex: 1, explanation: 'Pure priority scheduling can starve low-priority processes indefinitely.', topic: 'Operating Systems' },
  { question: 'What is the space complexity of an in-place quicksort implementation (excluding recursion stack)?', options: ['O(n)', 'O(1)', 'O(log n)', 'O(n log n)'], correctAnswerIndex: 1, explanation: 'In-place partitioning uses O(1) extra space besides the recursion stack.', topic: 'Data Structures & Algorithms' },
  { question: 'Which HTTP status code indicates a successful resource creation?', options: ['200', '201', '204', '301'], correctAnswerIndex: 1, explanation: '201 Created signals a new resource was successfully created.', topic: 'System Design' },
  { question: 'In networking, what does TCP guarantee that UDP does not?', options: ['Lower latency', 'Ordered, reliable delivery', 'Smaller packet size', 'Broadcast support'], correctAnswerIndex: 1, explanation: 'TCP provides ordered, reliable, connection-based delivery; UDP does not.', topic: 'Computer Networks' },
  { question: 'What is a primary key constraint used for in a relational database?', options: ['Sorting rows', 'Uniquely identifying each row', 'Compressing storage', 'Encrypting data'], correctAnswerIndex: 1, explanation: 'A primary key uniquely identifies each row and cannot be NULL.', topic: 'DBMS' },
  { question: 'Which Big-O best describes checking if a key exists in a hash map on average?', options: ['O(n)', 'O(1)', 'O(log n)', 'O(n^2)'], correctAnswerIndex: 1, explanation: 'Hash maps give O(1) average-case lookup via hashing.', topic: 'Data Structures & Algorithms' },
];

function buildFallbackQuestions(count: number, topic: string) {
  const qs = [];
  for (let i = 0; i < count; i++) {
    const base = FALLBACK_BANK[i % FALLBACK_BANK.length];
    qs.push({
      id: `fq-${Date.now()}-${i}`,
      question: base.question,
      options: base.options,
      correctAnswerIndex: base.correctAnswerIndex,
      explanation: base.explanation,
      topic: i < FALLBACK_BANK.length ? base.topic : topic,
    });
  }
  return qs;
}

function parseQuestionsJson(raw: string): any[] | null {
  if (!raw) return null;
  try {
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {
    // fall through
  }
  return null;
}

const GENERATION_PROMPT = (topic: string, difficulty: string, count: number) => `Generate exactly ${count} multiple-choice technical interview / campus placement practice questions on the topic "${topic}", at "${difficulty}" difficulty level, suitable for a computer science student.

Respond ONLY with a valid JSON array (no markdown, no commentary) where each item has this exact structure:
{
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswerIndex": 0,
  "explanation": "Brief explanation of why the correct answer is correct",
  "topic": "${topic}"
}`;

// POST /api/mock-tests/generate — builds a fresh test on the fly based on
// what the user picked (topic/skill + difficulty), instead of a fixed bank.
mockTestsRouter.post('/generate', async (req: Request, res: Response) => {
  const { topic, difficulty, skillBased, skills } = req.body;

  const level: 'Easy' | 'Medium' | 'Hard' =
    difficulty === 'Hard' ? 'Hard' : difficulty === 'Medium' ? 'Medium' : 'Easy';
  const config = DIFFICULTY_CONFIG[level];

  const effectiveTopic = skillBased && Array.isArray(skills) && skills.length > 0
    ? skills.join(', ')
    : (topic || 'General Computer Science Fundamentals');

  const raw = await generateContentWithFallback(
    GENERATION_PROMPT(effectiveTopic, level, config.questionCount),
    ''
  );

  let parsed = parseQuestionsJson(raw);
  let questions;

  if (parsed && parsed.length > 0) {
    questions = parsed.slice(0, config.questionCount).map((q, i) => ({
      id: `gq-${Date.now()}-${i}`,
      question: q.question,
      options: q.options,
      correctAnswerIndex: q.correctAnswerIndex,
      explanation: q.explanation,
      topic: q.topic || effectiveTopic,
    }));
    // Top up if the model returned fewer than requested
    if (questions.length < config.questionCount) {
      questions = questions.concat(
        buildFallbackQuestions(config.questionCount - questions.length, effectiveTopic)
      );
    }
  } else {
    questions = buildFallbackQuestions(config.questionCount, effectiveTopic);
  }

  const testId = `gen-${Date.now()}`;
  const totalMarks = config.questionCount * config.marksPerQuestion;

  const fullTest = {
    id: testId,
    title: skillBased ? 'Skill-Based Assessment' : `${effectiveTopic} Assessment`,
    difficulty: level,
    durationMinutes: config.durationMinutes,
    questionCount: config.questionCount,
    marksPerQuestion: config.marksPerQuestion,
    totalMarks,
    topics: [effectiveTopic],
    questions,
  };

  // Keep the answer key server-side only.
  appState.generatedTests[testId] = fullTest;

  const safeQuestions = questions.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options,
    topic: q.topic,
  }));

  res.json({
    test: {
      ...fullTest,
      questions: safeQuestions,
    },
  });
});

// GET single mock test
mockTestsRouter.get('/:id', (req: Request, res: Response) => {
  const generated = appState.generatedTests[req.params.id];
  if (generated) {
    const safeQuestions = generated.questions.map((q: any) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      topic: q.topic,
    }));
    return res.json({ test: { ...generated, questions: safeQuestions } });
  }

  const test = MOCK_TESTS.find(t => t.id === req.params.id) || MOCK_TESTS[0];
  if (!test) {
    return res.status(404).json({ error: 'Mock test not found' });
  }

  // Return test without exposing answers directly
  const safeQuestions = test.questions.map(q => ({
    id: q.id,
    question: q.question,
    codeSnippet: q.codeSnippet,
    options: q.options,
    topic: q.topic
  }));

  res.json({
    test: {
      ...test,
      questions: safeQuestions
    }
  });
});

// Submit mock test
mockTestsRouter.post('/:id/submit', (req: Request, res: Response) => {
  const { answers } = req.body; // { [questionId]: selectedIndex }
  const test: any = appState.generatedTests[req.params.id] || MOCK_TESTS.find(t => t.id === req.params.id) || MOCK_TESTS[0];

  if (!test) {
    return res.status(404).json({ error: 'Mock test not found' });
  }

  let correctCount = 0;
  const topicStats: Record<string, { correct: number; total: number }> = {};

  test.questions.forEach((q: any) => {
    if (!topicStats[q.topic]) {
      topicStats[q.topic] = { correct: 0, total: 0 };
    }
    topicStats[q.topic].total += 1;

    const userAnswer = answers ? answers[q.id] : undefined;
    if (userAnswer === q.correctAnswerIndex) {
      correctCount += 1;
      topicStats[q.topic].correct += 1;
    }
  });

  const totalQuestions = test.questions.length;
  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

  const topicPerformance = Object.keys(topicStats).map(topic => {
    const stat = topicStats[topic];
    const percentage = Math.round((stat.correct / stat.total) * 100);
    return {
      topic,
      correct: stat.correct,
      total: stat.total,
      percentage
    };
  });

  const strongAreas = topicPerformance
    .filter(tp => tp.percentage >= 70)
    .map(tp => tp.topic);

  const weakAreas = topicPerformance
    .filter(tp => tp.percentage < 70)
    .map(tp => tp.topic);

  if (strongAreas.length === 0) {
    strongAreas.push('Problem Understanding');
  }
  if (weakAreas.length === 0) {
    weakAreas.push('Time Management under Exam Conditions');
  }

  const result: MockTestResult = {
    testId: test.id,
    scorePercentage,
    totalQuestions,
    correctCount,
    topicPerformance,
    strongAreas,
    weakAreas,
    recommendedPractice: weakAreas.map(w => `Complete 5 targeted practice problems in ${w}`),
    userAnswers: answers || {}
  };

  // Provide explanations along with result
  const detailedQuestions = test.questions.map((q: any) => ({
    id: q.id,
    question: q.question,
    options: q.options,
    correctAnswerIndex: q.correctAnswerIndex,
    userAnswerIndex: answers ? answers[q.id] : null,
    isCorrect: answers ? answers[q.id] === q.correctAnswerIndex : false,
    explanation: q.explanation,
    topic: q.topic
  }));

  res.json({
    result,
    detailedQuestions
  });
});