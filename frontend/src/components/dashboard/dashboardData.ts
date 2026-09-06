import { Opportunity } from '../../data/mockOpportunities';

export interface EmailLog {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  timestamp: string;
  type: 'opportunity' | 'promotional' | 'update';
  stage?: string;
  extractedCompany?: string;
  confidenceScore: number;
}

export interface PrepTask {
  id: string;
  title: string;
  category: 'OOP' | 'DSA' | 'SQL' | 'DBMS' | 'System Design';
  completed: boolean;
  estimatedMinutes: number;
}

export interface SkillProgress {
  skill: string;
  proficiency: number;
  status: 'strong' | 'improve';
  targetLevel: string;
  recommendedTask: string;
}

export interface DeadlineItem {
  id: string;
  title: string;
  companyOrOrg: string;
  daysRemaining: number;
  dateStr: string;
  urgency: 'high' | 'medium' | 'normal';
  type: 'interview' | 'hackathon' | 'assessment';
}

export const DEMO_PREP_TASKS: PrepTask[] = [
  { id: 'task-1', title: 'Review OOP concepts (Inheritance & Polymorphism)', category: 'OOP', completed: true, estimatedMinutes: 30 },
  { id: 'task-2', title: 'Solve 5 array problems on LeetCode', category: 'DSA', completed: true, estimatedMinutes: 45 },
  { id: 'task-3', title: 'Practice SQL queries (Window Functions & Joins)', category: 'SQL', completed: false, estimatedMinutes: 35 },
  { id: 'task-4', title: 'Review DBMS normalization (1NF to BCNF)', category: 'DBMS', completed: false, estimatedMinutes: 25 },
  { id: 'task-5', title: 'Run mock coding interview on Binary Trees', category: 'DSA', completed: false, estimatedMinutes: 45 },
];

export const DEMO_SKILLS: SkillProgress[] = [
  { skill: 'DSA', proficiency: 80, status: 'strong', targetLevel: '85% Recommended', recommendedTask: 'Graphs & Disjoint Sets' },
  { skill: 'DBMS', proficiency: 70, status: 'improve', targetLevel: '80% Recommended', recommendedTask: 'ACID Properties & Indexing' },
  { skill: 'OOP', proficiency: 90, status: 'strong', targetLevel: '85% Recommended', recommendedTask: 'Solid Principles Deep Dive' },
  { skill: 'System Design', proficiency: 40, status: 'improve', targetLevel: '65% Recommended', recommendedTask: 'Rate Limiter & Cache Design' },
];

export const DEMO_DEADLINES: DeadlineItem[] = [
  {
    id: 'dl-1',
    title: 'Software Engineer Interview',
    companyOrOrg: 'TechNova',
    daysRemaining: 5,
    dateStr: 'Sep 9, 2026',
    urgency: 'high',
    type: 'interview',
  },
  {
    id: 'dl-2',
    title: 'Hackathon Submission',
    companyOrOrg: 'ETHGlobal Singapore',
    daysRemaining: 8,
    dateStr: 'Sep 12, 2026',
    urgency: 'medium',
    type: 'hackathon',
  },
  {
    id: 'dl-3',
    title: 'Data Analyst Assessment',
    companyOrOrg: 'Apex Analytics Corp',
    daysRemaining: 12,
    dateStr: 'Sep 16, 2026',
    urgency: 'normal',
    type: 'assessment',
  },
];

export const DEMO_EMAILS: EmailLog[] = [
  {
    id: 'em-1',
    sender: 'careers@technova.io',
    subject: 'Congratulations! You have been shortlisted for TechNova Technical Interview Round',
    snippet: 'Dear Alex, We were impressed by your assessment performance. Your Round 1 Technical Interview is scheduled for September 9th with our Senior Engineering Manager...',
    timestamp: '2 hours ago',
    type: 'opportunity',
    stage: 'Interview',
    extractedCompany: 'TechNova',
    confidenceScore: 98,
  },
  {
    id: 'em-2',
    sender: 'hackathons@ethglobal.com',
    subject: 'ETHGlobal 2025: Team Final Submission Deadline in 8 Days',
    snippet: 'Reminder: Project repositories must be submitted along with a 3-minute video demo before the countdown ends. Uniswap and Arbitrum bounty tracks are open...',
    timestamp: '5 hours ago',
    type: 'opportunity',
    stage: 'Submission',
    extractedCompany: 'ETHGlobal',
    confidenceScore: 94,
  },
  {
    id: 'em-3',
    sender: 'recruitment@apexanalytics.com',
    subject: 'Invitation to Online Coding Assessment: Apex Junior Analyst Role',
    snippet: 'Your assessment link is now active. Please complete the SQL and problem solving section within 72 hours of opening the test window...',
    timestamp: 'Yesterday',
    type: 'opportunity',
    stage: 'Assessment',
    extractedCompany: 'Apex Corp',
    confidenceScore: 92,
  },
  {
    id: 'em-4',
    sender: 'newsletter@codingbootcamp-promo.com',
    subject: 'Flash Sale: 50% Off Full Stack Mastery Masterclass',
    snippet: 'Unlock complete Web3 and AI development courses with our limited coupon code. Valid until midnight...',
    timestamp: 'Yesterday',
    type: 'promotional',
    confidenceScore: 99,
  },
  {
    id: 'em-5',
    sender: 'offers@jobboard-blast.net',
    subject: 'Urgent hiring for 100+ telemarketing executive roles near you',
    snippet: 'Work from home opportunity with immediate onboarding. No prior experience required. Apply with one click...',
    timestamp: '2 days ago',
    type: 'promotional',
    confidenceScore: 96,
  },
];

export const TECHNOVA_OPPORTUNITY: Opportunity = {
  id: 'technova-swe-interview',
  title: 'Software Engineer Interview',
  company: 'TechNova',
  type: 'placement',
  location: 'Bangalore / Remote',
  stipendOrPrize: '₹18 - 24 LPA CTC',
  deadline: 'In 5 days • Sep 9, 2026',
  matchScore: 82,
  eligibilityStatus: 'Eligible',
  eligibilityCriteria: [
    { label: 'Technical Screening', status: 'pass', detail: 'Online Assessment Cleared (94th percentile)' },
    { label: 'Required Skills Matrix', status: 'warning', detail: 'DSA, OOP, DBMS, SQL' },
    { label: 'Interview Format', status: 'pass', detail: '60 min Live Coding + OOP System Architecture' },
    { label: 'Graduation Year', status: 'pass', detail: '2025 / 2026 Batch Eligible' },
  ],
  skillsMatched: ['DSA', 'OOP', 'SQL', 'Python'],
  skillsMissing: ['DBMS Normalization', 'System Design Caching'],
  roadmapSnapshot: {
    day: 5,
    totalDays: 10,
    currentFocus: 'Live Coding Simulation & DBMS Deep Dive',
    tasksRemaining: 4,
    activeTask: 'Review OOP concepts and solve 5 array/linked-list problems',
  },
  aiSuggestion: 'TechNova technical panel emphasizes database indexing, transaction isolation levels, and clean OOP design. Target DBMS normalization questions today.',
  badge: 'URGENT • High Priority Interview',
};
