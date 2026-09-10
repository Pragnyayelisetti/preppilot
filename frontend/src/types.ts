export type OpportunityType =
  | 'internship'
  | 'job'
  | 'hackathon'
  | 'contest'
  | 'fellowship'
  | 'scholarship'
  | 'workshop'
  | 'placement';

export type ConfidenceLevel = 'very_high' | 'high' | 'moderate' | 'low';

export interface ConfidenceSignal {
  label: string;
  passed: boolean;
  detail: string;
}

export interface SelectionRound {
  roundNumber: number;
  title: string;
  focusTopics: string[];
  description: string;
  prepAdvice: string[];
}

export interface ImportantDate {
  id: string;
  title: string;
  date: string; // ISO date format YYYY-MM-DD
  type: 'deadline' | 'assessment' | 'interview' | 'result' | 'hackathon' | 'joining';
  status: 'approaching' | 'upcoming' | 'completed';
  opportunityId?: string;
  company?: string;
}

export interface Opportunity {
  id: string;
  company: string;
  companyLogo?: string;
  title: string;
  type: OpportunityType;
  description: string;
  eligibility: string;
  location: string;
  workMode: 'Remote' | 'Hybrid' | 'On-site';
  deadline: string;
  daysRemaining: number;
  applicationLink: string;
  requiredSkills: string[];
  selectionRounds: SelectionRound[];
  importantDates: ImportantDate[];
  sourceEmail: {
    sender: string;
    senderDomain: string;
    subject: string;
    dateReceived: string;
    snippet: string;
  };
  confidenceScore: number;
  confidenceLevel: ConfidenceLevel;
  confidenceBreakdown: ConfidenceSignal[];
  relevanceScore: number;
  matchReasons: string[];
  status: 'discovered' | 'saved' | 'preparing' | 'applied' | 'interviewing' | 'offered' | 'archived';
}

export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  email: string;
  phoneNumber?: string;
  college: string;
  degree: string;
  branch: string;
  gradYear: string;
  skills: string[];
  interests: string[];
  preferredRoles: string[];
  careerGoals: string;
  isEmailVerified: boolean;
  isOnboarded: boolean;
  isGmailConnected: boolean;
  connectedGmailAddress?: string;
  whatsappNumber?: string;
  whatsappNotificationsEnabled: boolean;
  notificationPreferences: {
    deadlines: boolean;
    highConfidenceOpportunities: boolean;
    prepReminders: boolean;
    mockTestReminders: boolean;
  };
}

export interface PreparationPlan {
  opportunityId: string;
  company: string;
  role: string;
  overallStrategy: string;
  roundRoadmaps: {
    round: string;
    focus: string[];
    whatToExpect: string;
    checklist: { id: string; text: string; completed: boolean }[];
    recommendedTimeline: string;
  }[];
}

export interface Question {
  id: string;
  roundCategory: 'Coding Round' | 'Technical Interview' | 'HR / Behavioral';
  question: string;
  type: 'previously_reported' | 'likely_predicted';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  sampleApproach?: string;
}

export interface PrepResource {
  id: string;
  skillCategory: string;
  title: string;
  provider: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  reason: string;
  url: string;
}

export interface MockTestQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  topic: string;
}

export interface MockTest {
  id: string;
  opportunityId?: string;
  title: string;
  company?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  durationMinutes: number;
  questionCount: number;
  marksPerQuestion?: number;
  totalMarks?: number;
  topics: string[];
  questions: MockTestQuestion[];
}

export interface MockTestResult {
  testId: string;
  scorePercentage: number;
  totalQuestions: number;
  correctCount: number;
  topicPerformance: { topic: string; correct: number; total: number; percentage: number }[];
  strongAreas: string[];
  weakAreas: string[];
  recommendedPractice: string[];
  userAnswers: Record<string, number>;
}

export interface LanguageAndGrammarMetrics {
  grammarScore: number;
  vocabularyScore: number;
  fluencyScore: number;
  grammarCritiques: {
    originalPhrase: string;
    correction: string;
    rule: string;
  }[];
  vocabularySuggestions: {
    spokenWord: string;
    enhancedAlternative: string;
  }[];
  deliveryFeedback: string;
}

export interface MockInterviewEvaluation {
  overallScore: number;
  communication: number;
  technicalAccuracy: number;
  problemSolving: number;
  confidence: number;
  structure: number;
  languageAndGrammar?: LanguageAndGrammarMetrics;
  whatYouDidWell: string[];
  whatToImprove: string[];
  betterAnswerApproach: string;
  recommendedPractice: string[];
}

export interface InterviewAnswerMetrics {
  answeredViaVoice: boolean;
  timeTakenSeconds: number;
  timeLimitSeconds: number;
  autoSubmittedOnTimeout: boolean;
  fillerWordCount: number;
  wordsPerMinute: number | null;
  hintsUsed: number;
}

export interface MockInterviewSession {
  id: string;
  track: 'Technical' | 'HR' | 'Behavioral' | 'Company-specific';
  topic?: string;
  company?: string;
  currentQuestionIndex: number;
  questions: string[];
  totalQuestions: number;
  timeLimitSeconds: number;
  conversation: { role: 'assistant' | 'user'; content: string; timestamp: string }[];
  status: 'in_progress' | 'completed';
  evaluation?: MockInterviewEvaluation;
  answerMetrics: InterviewAnswerMetrics[];
  hintsUsedForCurrentQuestion: number;
}

export interface CourseRecommendation {
  id: string;
  title: string;
  skill: string;
  provider: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  reason: string;
  url: string;
  tag?: string;
}

export interface WhatsAppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'deadline' | 'opportunity' | 'prep' | 'mock_test';
  read: boolean;
}

export interface ScannedEmail {
  id: string;
  sender: string;
  senderDomain?: string;
  subject: string;
  snippet: string;
  date: string;
  isOpportunity: boolean;
  status: 'processed' | 'skipped';
}