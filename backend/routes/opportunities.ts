import { Router, Request, Response } from 'express';
import { appState } from '../state';
import { MOCK_QUESTIONS_DATABASE, PROFILE_RECOMMENDED_COURSES } from '../data';
import { PreparationPlan, Question, PrepResource } from '../types';

export const opportunitiesRouter = Router();

// GET all opportunities
opportunitiesRouter.get('/', (req: Request, res: Response) => {
  const { status, type } = req.query;
  let list = [...appState.opportunities];

  if (status) {
    list = list.filter(o => o.status === status);
  }
  if (type) {
    list = list.filter(o => o.type === type);
  }

  res.json({
    opportunities: list,
    total: list.length,
    hasFoundOpportunities: appState.hasFoundOpportunities
  });
});

// GET opportunity by ID
opportunitiesRouter.get('/:id', (req: Request, res: Response) => {
  const opp = appState.opportunities.find(o => o.id === req.params.id);
  if (!opp) {
    return res.status(404).json({ error: 'Opportunity not found' });
  }

  res.json({ opportunity: opp });
});

// Update opportunity status
opportunitiesRouter.post('/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  const oppIndex = appState.opportunities.findIndex(o => o.id === req.params.id);

  if (oppIndex === -1) {
    return res.status(404).json({ error: 'Opportunity not found' });
  }

  appState.opportunities[oppIndex].status = status;

  res.json({
    success: true,
    message: `Opportunity marked as ${status}`,
    opportunity: appState.opportunities[oppIndex]
  });
});

// GET How to Crack It - Preparation Roadmap
opportunitiesRouter.get('/:id/roadmap', (req: Request, res: Response) => {
  const opp = appState.opportunities.find(o => o.id === req.params.id) || appState.opportunities[0];

  const plan: PreparationPlan = {
    opportunityId: opp ? opp.id : 'unknown',
    company: opp ? opp.company : 'Tech Leader',
    role: opp ? opp.title : 'Software Engineer',
    overallStrategy: `Targeted 4-week systematic preparation plan for ${opp ? opp.company : 'Tech'} covering algorithmic mastery, core CS foundations, and behavioral alignment.`,
    roundRoadmaps: [
      {
        round: 'Round 1 — Online Assessment (Coding & Aptitude)',
        focus: ['Arrays & Hashing', 'Two Pointers', 'Binary Search', 'Sliding Window', 'Dynamic Programming Basics'],
        whatToExpect: '20–30 coding/aptitude questions with 2 LeetCode Medium/Hard algorithmic challenges within 70-90 minutes.',
        checklist: [
          { id: 'c1', text: 'Revise array manipulation and hash map patterns', completed: true },
          { id: 'c2', text: 'Solve 15 LeetCode Medium problems under timed conditions', completed: true },
          { id: 'c3', text: 'Practice writing clean code without IDE auto-complete', completed: false },
          { id: 'c4', text: 'Take PrepPilot Google/Amazon OA Mock Test', completed: false }
        ],
        recommendedTimeline: 'Days 1 - 10: High intensity problem solving'
      },
      {
        round: 'Round 2 — Technical Interview (Data Structures & Systems)',
        focus: ['Tree & Graph Traversals', 'Object-Oriented Programming (OOP)', 'DBMS & SQL Indexes', 'OS Concurrency', 'Projects Deep-Dive'],
        whatToExpect: '45-minute live pair coding session with senior engineer. Candidate must communicate thought process out loud, discuss complexity, and test edge cases.',
        checklist: [
          { id: 'c5', text: 'Practice vocalizing thought process before typing a single line of code', completed: false },
          { id: 'c6', text: 'Review BFS/DFS cycle detection and Dijkstra shortest path', completed: false },
          { id: 'c7', text: 'Master B+ tree vs Hash indexes in relational databases', completed: false },
          { id: 'c8', text: 'Prepare architecture diagrams and technical trade-offs for resume projects', completed: true }
        ],
        recommendedTimeline: 'Days 11 - 20: Mock interviews and CS fundamentals'
      },
      {
        round: 'Round 3 — HR / Behavioral & Culture Alignment',
        focus: ['Tell me about yourself (STAR method)', 'Why this company?', 'Overcoming technical roadblocks', 'Handling constructive feedback'],
        whatToExpect: '30-45 minute conversational evaluation of culture fit, collaboration mindset, leadership principles, and communication clarity.',
        checklist: [
          { id: 'c9', text: 'Draft 5 STAR stories covering leadership, failure, and conflict resolution', completed: false },
          { id: 'c10', text: 'Deeply research recent products, engineering blog posts, and company values', completed: false },
          { id: 'c11', text: 'Conduct AI Mock Behavioral Interview on PrepPilot', completed: false }
        ],
        recommendedTimeline: 'Days 21 - 25: Behavioral drills & final review'
      }
    ]
  };

  res.json({ roadmap: plan });
});

// GET previous & expected questions
opportunitiesRouter.get('/:id/questions', (req: Request, res: Response) => {
  const opp = appState.opportunities.find(o => o.id === req.params.id);
  const company = opp?.company || 'General Tech';

  // Filter or augment questions database
  const questions: Question[] = MOCK_QUESTIONS_DATABASE.map(q => {
    return {
      ...q,
      tags: [...q.tags, company]
    };
  });

  res.json({
    questions,
    total: questions.length,
    company
  });
});

// GET preparation resources
opportunitiesRouter.get('/:id/resources', (req: Request, res: Response) => {
  const opp = appState.opportunities.find(o => o.id === req.params.id);

  const resources: PrepResource[] = [
    {
      id: 'res-dsa-1',
      skillCategory: 'DSA',
      title: 'NeetCode 150 - Curated Algorithmic Problem Set',
      provider: 'NeetCode',
      difficulty: 'Intermediate',
      estimatedTime: '30 hours',
      reason: 'Standard curriculum covering all algorithmic patterns tested in company online assessments.',
      url: 'https://neetcode.io/practice'
    },
    {
      id: 'res-dsa-2',
      skillCategory: 'DSA',
      title: 'Striver SDE Sheet - Top Interview Questions',
      provider: 'takeUforward',
      difficulty: 'Advanced',
      estimatedTime: '40 hours',
      reason: '180 top coding questions frequently repeated in campus and off-campus tech drives.',
      url: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/'
    },
    {
      id: 'res-java-1',
      skillCategory: 'Java & OOP',
      title: 'Java Concurrency & Memory Model Deep Dive',
      provider: 'Baeldung / Java Magazine',
      difficulty: 'Intermediate',
      estimatedTime: '8 hours',
      reason: 'Crucial for multi-threaded server architecture questions in Amazon & Atlassian.',
      url: 'https://www.baeldung.com/java-concurrency'
    },
    {
      id: 'res-db-1',
      skillCategory: 'DBMS',
      title: 'SQL Indexing & Transaction Isolation Levels',
      provider: 'Use The Index, Luke!',
      difficulty: 'Intermediate',
      estimatedTime: '6 hours',
      reason: 'Directly tested in technical rounds to determine if candidates understand database performance.',
      url: 'https://use-the-index-luke.com/'
    },
    {
      id: 'res-sys-1',
      skillCategory: 'System Design',
      title: 'Designing Data-Intensive Applications Summary',
      provider: 'Martin Kleppmann / GitHub',
      difficulty: 'Advanced',
      estimatedTime: '15 hours',
      reason: 'Gives students clear vocabulary on replication, partitioning, and consistency models.',
      url: 'https://github.com/ept/ddia-references'
    },
    {
      id: 'res-hr-1',
      skillCategory: 'Interview Preparation',
      title: 'Cracking the Behavioral Interview (STAR Framework)',
      provider: 'PrepPilot Career Lab',
      difficulty: 'Beginner',
      estimatedTime: '4 hours',
      reason: 'Helps students construct concise 2-minute answers for Amazon LP and Googleyness rounds.',
      url: '#'
    }
  ];

  res.json({
    resources,
    company: opp?.company || 'All Companies'
  });
});
