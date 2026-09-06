export interface Opportunity {
  id: string;
  title: string;
  company: string;
  type: 'internship' | 'hackathon' | 'placement' | 'scholarship';
  location: string;
  stipendOrPrize: string;
  deadline: string;
  matchScore: number;
  eligibilityStatus: 'Eligible' | 'Borderline' | 'Action Needed';
  eligibilityCriteria: {
    label: string;
    status: 'pass' | 'warning' | 'gap';
    detail: string;
  }[];
  skillsMatched: string[];
  skillsMissing: string[];
  roadmapSnapshot: {
    day: number;
    totalDays: number;
    currentFocus: string;
    tasksRemaining: number;
    activeTask: string;
  };
  aiSuggestion: string;
  badge: string;
}

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'google-step-2025',
    title: 'Student Training in Engineering (STEP) Intern 2025',
    company: 'Google',
    type: 'internship',
    location: 'Bangalore / Hyderabad / Remote',
    stipendOrPrize: '₹1,10,000 / month',
    deadline: 'In 14 days • Oct 15',
    matchScore: 94,
    eligibilityStatus: 'Eligible',
    eligibilityCriteria: [
      { label: 'Academic Standing', status: 'pass', detail: '2nd/3rd Year CS/IT (Verified)' },
      { label: 'Minimum CGPA', status: 'pass', detail: '8.4 / 10.0 (Requirement: 7.5+)' },
      { label: 'Core Coursework', status: 'pass', detail: 'Data Structures, Algorithms, OS completed' },
      { label: 'Work Authorization', status: 'pass', detail: 'Full-time student citizen' },
    ],
    skillsMatched: ['C++', 'Python', 'Data Structures', 'Git', 'OOP'],
    skillsMissing: ['System Design Basics', 'Dynamic Programming Optimization'],
    roadmapSnapshot: {
      day: 12,
      totalDays: 30,
      currentFocus: 'Graph Traversal & BFS/DFS on LeetCode Medium',
      tasksRemaining: 8,
      activeTask: 'Complete 3 Tree/Graph problems + Review Google past interview transcripts',
    },
    aiSuggestion: 'PrepPilot detected Google interviewers heavily weight time-complexity trade-offs in Trees. Schedule a 45-min mock round today.',
    badge: 'High Match • Top Priority',
  },
  {
    id: 'ethglobal-hackathon',
    title: 'ETHGlobal Singapore 2025 & Hackathon Track',
    company: 'ETHGlobal Foundation',
    type: 'hackathon',
    location: 'Hybrid • Global Participation',
    stipendOrPrize: '$125,000 in Bounty Prizes',
    deadline: 'In 6 days • Submission Closes Soon',
    matchScore: 89,
    eligibilityStatus: 'Eligible',
    eligibilityCriteria: [
      { label: 'Student Track Eligibility', status: 'pass', detail: 'All university undergrad & grad students' },
      { label: 'Team Size Constraint', status: 'pass', detail: 'Up to 4 members allowed' },
      { label: 'Prerequisite Code', status: 'warning', detail: 'Must be fresh open-source repo created during hackathon' },
    ],
    skillsMatched: ['Solidity', 'React', 'TypeScript', 'Ethers.js', 'Web3 Wallets'],
    skillsMissing: ['Zero Knowledge Snarks (ZK-Rollups)', 'Foundry Testing'],
    roadmapSnapshot: {
      day: 4,
      totalDays: 14,
      currentFocus: 'Smart Contract Architecture & Scaffolding UI',
      tasksRemaining: 5,
      activeTask: 'Deploy ERC-4337 Account Abstraction testnet contract with Foundry',
    },
    aiSuggestion: 'Bounty sponsor Uniswap Foundation has $15K unallocated for Account Abstraction hooks. Target this specific track!',
    badge: 'High Bounty • Hackathon',
  },
  {
    id: 'microsoft-swe-newgrad',
    title: 'Software Development Engineer - Campus Placement 2025',
    company: 'Microsoft',
    type: 'placement',
    location: 'Noida / Hyderabad / Bengaluru',
    stipendOrPrize: '₹28 - 34 LPA CTC',
    deadline: 'In 21 days • Assessment Phase 1',
    matchScore: 91,
    eligibilityStatus: 'Eligible',
    eligibilityCriteria: [
      { label: 'Graduation Cohort', status: 'pass', detail: 'Class of 2025 / 2026' },
      { label: 'Academic Cutoff', status: 'pass', detail: '8.2 CGPA with no active backlogs' },
      { label: 'Coding Assessment', status: 'warning', detail: 'Round 1 Codility: 3 questions in 70 mins' },
    ],
    skillsMatched: ['Data Structures', 'Java', 'Distributed Databases', 'REST APIs', 'Cloud Fundamentals'],
    skillsMissing: ['Concurrency & Thread Safety', 'Low Level Design (LLD)'],
    roadmapSnapshot: {
      day: 18,
      totalDays: 45,
      currentFocus: 'Low Level Design: Parking Lot & Elevator System',
      tasksRemaining: 14,
      activeTask: 'Draft UML Class Diagram + Implement State & Factory patterns in Java',
    },
    aiSuggestion: 'Microsoft Campus Online Assessment has a 68% cut-off on graph pathfinding questions. Practice Disjoint Set Union today.',
    badge: 'Campus Placement • Tier 1',
  },
  {
    id: 'generation-google-scholarship',
    title: 'Generation Google Scholarship (APAC 2025)',
    company: 'Google Diversity & Inclusion',
    type: 'scholarship',
    location: 'Asia Pacific Universities',
    stipendOrPrize: '$2,500 USD Cash Grant + Mentorship',
    deadline: 'In 28 days • Applications Open',
    matchScore: 96,
    eligibilityStatus: 'Eligible',
    eligibilityCriteria: [
      { label: 'Enrollment', status: 'pass', detail: 'Full-time student in STEM / Computer Science' },
      { label: 'Leadership & Community', status: 'pass', detail: 'GDSC / Women in Tech / Peer tutoring track recorded' },
      { label: 'Essay Criteria', status: 'pass', detail: '2 short essay prompts (400 words each)' },
    ],
    skillsMatched: ['Technical Impact', 'Community Mentorship', 'Academic Merit', 'Diversity Advocacy'],
    skillsMissing: ['Essay Polish for Impact Metrics', 'Recommendation Letter Follow-up'],
    roadmapSnapshot: {
      day: 8,
      totalDays: 21,
      currentFocus: 'Essay Draft 2: Technical Leadership in Campus Communities',
      tasksRemaining: 4,
      activeTask: 'Incorporate STAR method and quantify peer outreach numbers in Essay #1',
    },
    aiSuggestion: 'Previous winners scored highest when detailing measurable community impact (e.g. "trained 120 juniors in Python workshops").',
    badge: '$2,500 USD • Prestigious Scholarship',
  },
];
