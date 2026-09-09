import { Opportunity, CourseRecommendation, MockTest, Question, PrepResource, WhatsAppNotification } from './types';

export interface SyncedEmail {
  id: string;
  sender: string;
  senderName: string;
  subject: string;
  date: string;
  snippet: string;
  body: string;
  isOpportunity: boolean;
  opportunityId?: string;
}

export const INITIAL_EMAILS: SyncedEmail[] = [
  {
    id: 'em-101',
    sender: 'careers-noreply@google.com',
    senderName: 'Google University Programs',
    subject: 'Application Open: Software Engineering Internship - Summer 2027 / Fall 2026',
    date: '2026-09-05T10:14:00Z',
    snippet: 'Applications for Google Student Training in Engineering Program (STEP) and Software Engineering Internships are now live. Apply before the September 18 deadline...',
    body: `Dear Student,

Google is excited to announce that applications for the 2026/2027 Software Engineering Internship are now officially open!

Role: Software Engineering Intern
Locations: Mountain View CA, New York NY, Seattle WA, Bangalore India (Hybrid)
Eligibility: Currently pursuing a Bachelor's or Master's degree in Computer Science or related STEM field. Expected graduation between Dec 2026 and June 2028.
Required Skills: Data Structures, Algorithms, C++, Java, or Python.

Key Dates:
- Application Deadline: September 18, 2026 (11:59 PM PST)
- Online Assessment Invites: Starting late September 2026
- Interviews: October - November 2026

Apply exclusively via the Google Careers portal at https://careers.google.com/jobs/results/1489201. Please note Google will NEVER request money or payment for application fees.

Best regards,
Google University Programs Team`,
    isOpportunity: true,
    opportunityId: 'opp-google-sde-2026'
  },
  {
    id: 'em-102',
    sender: 'university-recruiting@amazon.jobs',
    senderName: 'Amazon Student Programs',
    subject: 'Invitation: Amazon Future Engineer SDE-1 Assessment & Campus Drive',
    date: '2026-09-04T16:45:00Z',
    snippet: 'You are invited to apply for Amazon SDE Intern / New Grad roles. Complete the preliminary technical screening before September 22...',
    body: `Hello,

Amazon Student Programs is inviting candidates for our upcoming Software Development Engineer (SDE) internships and new graduate roles.

Role: Software Development Engineer Intern (Summer 2027)
Organization: Amazon AWS & Core Retail
Eligibility: Enrolled in accredited University program, graduating in 2026, 2027, or 2028.
Selection Process:
1. Online Coding Assessment (OA1 & OA2 on HackerRank/Mettl: 2 coding questions + work style simulation)
2. Technical Interviews (2 rounds focusing on DSA and Leadership Principles)
3. Bar Raiser Round

Deadline to submit interest: September 22, 2026.
Official Portal: https://amazon.jobs/en/jobs/2591048/sde-intern

Sincerely,
Amazon University Recruiting`,
    isOpportunity: true,
    opportunityId: 'opp-amazon-sde-2026'
  },
  {
    id: 'em-103',
    sender: 'organizers@uber-hack.io',
    senderName: 'Uber HackTag 2026 Global',
    subject: 'HackTag 2026: Compete for $50,000 in prizes and fast-track PPI interviews at Uber',
    date: '2026-09-03T11:20:00Z',
    snippet: 'Registration is open for Uber HackTag 2026. Build innovative micro-mobility and AI logistics solutions. Top teams receive Pre-Placement Interview offers...',
    body: `Greetings Builder!

Uber is proud to launch HackTag 2026, our marquee collegiate hackathon.

Prizes & Benefits:
- 1st Prize: $25,000 USD
- 2nd Prize: $15,000 USD
- Direct PPI (Pre-Placement Interview) for all finalists for 2027 Internship and Full-Time Engineering roles.
- Mentorship from Uber Senior Staff Engineers.

Rounds:
1. Online Quiz & Idea Submission: Closes September 25, 2026
2. Prototype Building & Shortlist: October 5, 2026
3. 36-hour Virtual Finale: October 18-20, 2026

Register your team of 2-4 members at https://uber.hacktag.io/register.

Happy hacking,
The Uber Engineering Campus Team`,
    isOpportunity: true,
    opportunityId: 'opp-uber-hacktag-2026'
  },
  {
    id: 'em-104',
    sender: 'fellowships@microsoft.com',
    senderName: 'Microsoft Research',
    subject: 'Microsoft Research Ada Lovelace AI Fellowship & Research Mentorship 2027',
    date: '2026-09-02T09:00:00Z',
    snippet: 'Applications invited for undergraduate and graduate research fellows in Generative AI, Responsible AI, and Systems...',
    body: `Dear Applicant,

Microsoft Research (MSR) invites applications for the 2027 Ada Lovelace and AI Systems Fellowship.

Details:
- Full funding covering tuition + $28,000 annual stipend
- 12-week embedded research internship at MSR Redmond or MSR Bangalore
- Direct 1:1 co-mentorship with Microsoft Principal Scientists

Eligibility: Students pursuing STEM degrees with demonstrated interest in Machine Learning, Algorithms, or Distributed Systems.
Application closes: October 10, 2026.
Apply at: https://microsoft.com/research/fellowship-2027

Warm regards,
MSR Academic Relations`,
    isOpportunity: true,
    opportunityId: 'opp-msr-fellowship-2026'
  },
  {
    id: 'em-105',
    sender: 'quick-jobs-portal@gmail.com',
    senderName: 'FastTrack Placement HR',
    subject: 'URGENT: Guaranteed Placement at Top MNC - Immediate Joining (Deposit Required)',
    date: '2026-09-01T14:10:00Z',
    snippet: 'Congratulations! You have been selected for Data Analyst position. Please pay INR 4,999 / $65 security fee for laptop dispatch and verification...',
    body: `Dear candidate,
You have been pre-selected for high salary data analyst role. No interview needed! Send $60 document verification fee via wire transfer to confirm slot immediately.`,
    isOpportunity: true,
    opportunityId: 'opp-suspicious-alert-2026'
  },
  {
    id: 'em-106',
    sender: 'newsletters@techcrunch.com',
    senderName: 'TechCrunch Daily',
    subject: 'Startup Funding Daily: AI venture checks hit new highs in Q3',
    date: '2026-09-05T08:00:00Z',
    snippet: 'Good morning, here are the top startup investment rounds, venture updates, and market headlines...',
    body: 'Regular promotional newsletter content without job or hiring details.',
    isOpportunity: false
  },
  {
    id: 'em-107',
    sender: 'promotions@coursera.org',
    senderName: 'Coursera',
    subject: 'Special 40% discount on Professional Certificates this weekend',
    date: '2026-09-04T12:00:00Z',
    snippet: 'Advance your career with Google, IBM and AWS certifications. Sale ends Sunday...',
    body: 'Discount marketing email.',
    isOpportunity: false
  }
];

export const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-google-sde-2026',
    company: 'Google',
    companyLogo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=120&auto=format&fit=crop&q=80',
    title: 'Software Engineering Internship - Summer 2027',
    type: 'internship',
    description: 'Work on core engineering challenges across Google Search, Cloud, YouTube, or Android. Interns collaborate closely with senior software engineers on production codebases.',
    eligibility: "Currently enrolled in a Bachelor's, Master's, or Dual Degree program in Computer Science or related discipline. Graduation in Dec 2026 - June 2028. Minimum 7.5 CGPA / 3.2 GPA recommended.",
    location: 'Mountain View, CA / New York / Bangalore',
    workMode: 'Hybrid',
    deadline: '2026-09-18',
    daysRemaining: 12,
    applicationLink: 'https://careers.google.com/jobs/results/1489201',
    requiredSkills: ['Data Structures', 'Algorithms', 'C++', 'Java', 'Python', 'Problem Solving'],
    selectionRounds: [
      {
        roundNumber: 1,
        title: 'Online Assessment (Google OA)',
        focusTopics: ['Arrays', 'Strings', 'Hashing', 'Binary Search', 'Dynamic Programming'],
        description: '90-minute timed coding test with 2 medium-to-hard algorithmic problems on the Google hiring platform.',
        prepAdvice: ['Revise LeetCode medium array/string problems', 'Practice writing clean code without IDE autocomplete', 'Focus on optimal time and space complexity']
      },
      {
        roundNumber: 2,
        title: 'Technical Interview I (Algorithms & Data Structures)',
        focusTopics: ['Trees', 'Graphs', 'DFS/BFS', 'Time Complexity Analysis'],
        description: '45-minute live technical session with a Google engineer using Google Docs or collaborative code canvas.',
        prepAdvice: ['Communicate your thought process out loud before typing', 'State brute-force solution first then optimize', 'Walk through edge cases with a concrete dry run']
      },
      {
        roundNumber: 3,
        title: 'Technical Interview II & Googleyness',
        focusTopics: ['System Logic', 'Object-Oriented Design', 'Googleyness & Culture Fit'],
        description: '45-minute interview focusing on system trade-offs, clean software structure, and situational/behavioral collaboration scenarios.',
        prepAdvice: ['Prepare STAR method stories on teamwork and overcoming technical roadblocks', 'Review SOLID principles and clean abstractions', 'Ask insightful questions about engineering culture']
      }
    ],
    importantDates: [
      {
        id: 'date-g-1',
        title: 'Google SDE Application Deadline',
        date: '2026-09-18',
        type: 'deadline',
        status: 'approaching',
        company: 'Google',
        opportunityId: 'opp-google-sde-2026'
      },
      {
        id: 'date-g-2',
        title: 'Google Online Assessment Window',
        date: '2026-09-26',
        type: 'assessment',
        status: 'upcoming',
        company: 'Google',
        opportunityId: 'opp-google-sde-2026'
      },
      {
        id: 'date-g-3',
        title: 'Round 1 & 2 Technical Interviews',
        date: '2026-10-14',
        type: 'interview',
        status: 'upcoming',
        company: 'Google',
        opportunityId: 'opp-google-sde-2026'
      }
    ],
    sourceEmail: {
      sender: 'careers-noreply@google.com',
      senderDomain: 'google.com',
      subject: 'Application Open: Software Engineering Internship - Summer 2027 / Fall 2026',
      dateReceived: '2026-09-05',
      snippet: 'Applications for Google Student Training in Engineering Program (STEP) and Software Engineering Internships are now live...'
    },
    confidenceScore: 94,
    confidenceLevel: 'very_high',
    confidenceBreakdown: [
      { label: 'Sender Domain Authenticated', passed: true, detail: 'Sent from cryptographically verified google.com domain with valid SPF/DKIM.' },
      { label: 'Official Careers Link', passed: true, detail: 'Application URL points directly to verified Google Careers ATS (careers.google.com).' },
      { label: 'Legitimate Compensation & Terms', passed: true, detail: 'Industry-standard paid internship program, zero application or processing fees requested.' },
      { label: 'Clear Verified Timeline', passed: true, detail: 'Structured recruitment schedule, official online assessment window, and explicit graduation criteria.' },
      { label: 'No Phishing Indicators', passed: true, detail: 'No urgent banking requests, spoofed headers, or suspicious attachments.' }
    ],
    relevanceScore: 96,
    matchReasons: [
      'Matches your profile skills in DSA, C++, and Python',
      'Target graduation year 2027/2028 is strictly aligned',
      'High preference match for your Software Development career goal'
    ],
    status: 'discovered'
  },
  {
    id: 'opp-amazon-sde-2026',
    company: 'Amazon',
    companyLogo: 'https://images.unsplash.com/photo-1523474255658-408a67159011?w=120&auto=format&fit=crop&q=80',
    title: 'Software Development Engineer (SDE) Intern - AWS',
    type: 'internship',
    description: 'Join Amazon Web Services engineering teams. Design scalable distributed systems, microservices, and serverless architectures serving hundreds of millions of cloud users.',
    eligibility: "Bachelor's or Master's in Computer Science, Software Engineering, or related field. Expected graduation between Dec 2026 - June 2028.",
    location: 'Seattle, WA / Austin, TX / Arlington, VA / Hyderabad (Hybrid)',
    workMode: 'Hybrid',
    deadline: '2026-09-22',
    daysRemaining: 16,
    applicationLink: 'https://amazon.jobs/en/jobs/2591048/sde-intern',
    requiredSkills: ['Java', 'Python', 'Object-Oriented Programming', 'Data Structures', 'AWS / Cloud Basics'],
    selectionRounds: [
      {
        roundNumber: 1,
        title: 'OA1: Debugging & Coding Assessment',
        focusTopics: ['Bug Fixing', 'Data Structures', 'Logic Flow'],
        description: '70-minute HackerRank test containing 2 algorithmic coding problems plus 7 quick code debugging questions.',
        prepAdvice: ['Brush up on common language pitfalls in Java or C++', 'Practice finding boundary off-by-one errors']
      },
      {
        roundNumber: 2,
        title: 'OA2: Work Styles Assessment & Reasoning',
        focusTopics: ['Amazon 16 Leadership Principles', 'Scenario Decision Making'],
        description: 'Interactive work simulation where you manage simulated team priorities and customer requests.',
        prepAdvice: ['Study Customer Obsession, Ownership, and Bias for Action principles thoroughly', 'Never cut quality corners in decision scenarios']
      },
      {
        roundNumber: 3,
        title: 'Virtual Technical Final Interviews',
        focusTopics: ['System Architecture', 'Tree/Graph Traversal', 'Leadership Principles'],
        description: 'Two back-to-back 45-minute interviews covering in-depth coding problems and LP behavioral inquiries.',
        prepAdvice: ['Frame every behavioral response using the STAR (Situation, Task, Action, Result) methodology', 'Ensure your code compiles and handles empty or null inputs gracefully']
      }
    ],
    importantDates: [
      {
        id: 'date-a-1',
        title: 'Amazon SDE Registration Closes',
        date: '2026-09-22',
        type: 'deadline',
        status: 'approaching',
        company: 'Amazon',
        opportunityId: 'opp-amazon-sde-2026'
      },
      {
        id: 'date-a-2',
        title: 'Online Assessment Window Open',
        date: '2026-09-29',
        type: 'assessment',
        status: 'upcoming',
        company: 'Amazon',
        opportunityId: 'opp-amazon-sde-2026'
      }
    ],
    sourceEmail: {
      sender: 'university-recruiting@amazon.jobs',
      senderDomain: 'amazon.jobs',
      subject: 'Invitation: Amazon Future Engineer SDE-1 Assessment & Campus Drive',
      dateReceived: '2026-09-04',
      snippet: 'You are invited to apply for Amazon SDE Intern / New Grad roles...'
    },
    confidenceScore: 91,
    confidenceLevel: 'very_high',
    confidenceBreakdown: [
      { label: 'Sender Domain Authenticated', passed: true, detail: 'Sent from authentic amazon.jobs recruitment infrastructure with SPF/DMARC pass.' },
      { label: 'Official Careers Link', passed: true, detail: 'Destination URL is hosted under verified amazon.jobs parent domain.' },
      { label: 'Standard Recruitment Workflow', passed: true, detail: 'Matches standard Amazon university screening flow (OA1, OA2, and LP interviews).' },
      { label: 'No Fee Requests', passed: true, detail: 'Zero monetary or transactional requests present.' }
    ],
    relevanceScore: 92,
    matchReasons: [
      'Strong match for your Java and Software Development preferences',
      'Cloud & AWS alignment with your interests',
      'Target timeline matches your graduation year'
    ],
    status: 'discovered'
  },
  {
    id: 'opp-uber-hacktag-2026',
    company: 'Uber',
    companyLogo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=120&auto=format&fit=crop&q=80',
    title: 'HackTag 2026 - Global Collegiate Hackathon & PPI',
    type: 'hackathon',
    description: 'Uber global hackathon challenging student engineers to build high-scale mobility, geospatial routing, and AI dispatch solutions. Top 20 teams receive direct Pre-Placement Interview (PPI) offers.',
    eligibility: 'All active undergraduate and graduate students enrolled in accredited universities worldwide. Teams of 2 to 4 members.',
    location: 'Virtual / Remote Global Finale',
    workMode: 'Remote',
    deadline: '2026-09-25',
    daysRemaining: 19,
    applicationLink: 'https://uber.hacktag.io/register',
    requiredSkills: ['Full Stack Development', 'React', 'Node.js / Python', 'APIs', 'Machine Learning Basics'],
    selectionRounds: [
      {
        roundNumber: 1,
        title: 'Idea Pitch & Architecture Proposal',
        focusTopics: ['Product Innovation', 'System Feasibility', 'Uber Tech Alignment'],
        description: 'Submit 3-page design proposal and video walkthrough describing how your solution solves urban mobility or freight routing.',
        prepAdvice: ['Highlight concrete API integration plans', 'Focus on scalability and latency metrics']
      },
      {
        roundNumber: 2,
        title: '36-Hour Hackathon Finale',
        focusTopics: ['Rapid Prototyping', 'Working MVP Demo', 'Live Q&A with Uber Staff'],
        description: 'Live coding sprint mentored by Uber engineers with milestone checkpoints.',
        prepAdvice: ['Build a rock-solid working demo before polishing UI', 'Deploy live on Cloud Run or Vercel with real test data']
      }
    ],
    importantDates: [
      {
        id: 'date-u-1',
        title: 'HackTag Registration & Submission Deadline',
        date: '2026-09-25',
        type: 'deadline',
        status: 'approaching',
        company: 'Uber',
        opportunityId: 'opp-uber-hacktag-2026'
      },
      {
        id: 'date-u-2',
        title: 'Virtual Hackathon Kickoff',
        date: '2026-10-18',
        type: 'hackathon',
        status: 'upcoming',
        company: 'Uber',
        opportunityId: 'opp-uber-hacktag-2026'
      }
    ],
    sourceEmail: {
      sender: 'organizers@uber-hack.io',
      senderDomain: 'uber-hack.io',
      subject: 'HackTag 2026: Compete for $50,000 in prizes and fast-track PPI interviews at Uber',
      dateReceived: '2026-09-03',
      snippet: 'Registration is open for Uber HackTag 2026. Build innovative micro-mobility and AI logistics solutions...'
    },
    confidenceScore: 86,
    confidenceLevel: 'high',
    confidenceBreakdown: [
      { label: 'Event Domain Verification', passed: true, detail: 'Event domain backed by official Uber campus relations microsite.' },
      { label: 'Verified Corporate Sponsors', passed: true, detail: 'Prize pool and PPI interview tracks cross-referenced with Uber LinkedIn careers page.' },
      { label: 'Zero Registration Charges', passed: true, detail: 'Completely free student registration with developer swag and cloud credits.' }
    ],
    relevanceScore: 89,
    matchReasons: [
      'High reward hackathon offering fast-track Pre-Placement Interviews',
      'Matches your React and Full-stack engineering skill set',
      'Team-based format great for campus resume highlights'
    ],
    status: 'discovered'
  },
  {
    id: 'opp-msr-fellowship-2026',
    company: 'Microsoft Research',
    companyLogo: 'https://images.unsplash.com/photo-1583321500900-82807e458f3c?w=120&auto=format&fit=crop&q=80',
    title: 'Ada Lovelace AI Research Fellowship 2027',
    type: 'fellowship',
    description: 'Prestigious fellowship supporting students conducting innovative computer science research in AI systems, generative models, and computer vision. Includes full tuition and $28,000 annual stipend.',
    eligibility: 'Students currently enrolled in 2nd or 3rd year undergraduate or graduate STEM degrees with demonstrated research interest or publications.',
    location: 'Redmond, WA / Cambridge, UK / Bangalore, India',
    workMode: 'Hybrid',
    deadline: '2026-10-10',
    daysRemaining: 34,
    applicationLink: 'https://microsoft.com/research/fellowship-2027',
    requiredSkills: ['Machine Learning', 'Python', 'PyTorch', 'Research Writing', 'Mathematics & Linear Algebra'],
    selectionRounds: [
      {
        roundNumber: 1,
        title: 'Research Proposal & Academic Review',
        focusTopics: ['Originality', 'Methodological Rigor', 'Faculty Recommendations'],
        description: 'Peer evaluation of your statement of purpose, academic transcript, and 2-page research proposal.',
        prepAdvice: ['Ground your proposal in current state-of-the-art literature', 'Highlight potential societal and technical impact']
      },
      {
        roundNumber: 2,
        title: 'Technical Presentation & Scientist Q&A',
        focusTopics: ['Deep Learning', 'System Scalability', 'Research Philosophy'],
        description: '30-minute virtual presentation to Microsoft Principal Researchers followed by deep technical questioning.',
        prepAdvice: ['Be transparent about research limitations and failure modes', 'Rehearse presenting complex math intuitively']
      }
    ],
    importantDates: [
      {
        id: 'date-m-1',
        title: 'Research Proposal Deadline',
        date: '2026-10-10',
        type: 'deadline',
        status: 'upcoming',
        company: 'Microsoft Research',
        opportunityId: 'opp-msr-fellowship-2026'
      }
    ],
    sourceEmail: {
      sender: 'fellowships@microsoft.com',
      senderDomain: 'microsoft.com',
      subject: 'Microsoft Research Ada Lovelace AI Fellowship & Research Mentorship 2027',
      dateReceived: '2026-09-02',
      snippet: 'Applications invited for undergraduate and graduate research fellows in Generative AI...'
    },
    confidenceScore: 95,
    confidenceLevel: 'very_high',
    confidenceBreakdown: [
      { label: 'Sender Domain Authenticated', passed: true, detail: 'Sent from cryptographically verified microsoft.com corporate email server.' },
      { label: 'Official Research Portal', passed: true, detail: 'Application handled through microsoft.com/research academic gateway.' },
      { label: 'High Academic Standing', passed: true, detail: 'Accredited annual research grant program active since 2013.' }
    ],
    relevanceScore: 84,
    matchReasons: [
      'Aligns with your AI/ML interest and Python skills',
      'Provides high-prestige research credential for graduate or R&D roles'
    ],
    status: 'discovered'
  },
  {
    id: 'opp-suspicious-alert-2026',
    company: 'FastTrack Placement HR',
    companyLogo: '',
    title: 'Data Analyst - Direct Joining (Caution: Unverified)',
    type: 'job',
    description: 'Claims guaranteed placement as a Data Analyst with immediate joining and no interview process, but demands an upfront security deposit.',
    eligibility: 'Open to all students with zero verification.',
    location: 'Unspecified Remote',
    workMode: 'Remote',
    deadline: '2026-09-10',
    daysRemaining: 4,
    applicationLink: 'mailto:quick-jobs-portal@gmail.com',
    requiredSkills: ['Excel'],
    selectionRounds: [
      {
        roundNumber: 1,
        title: 'No Selection Round Required (High Red Flag)',
        focusTopics: ['Wire Transfer Demand'],
        description: 'Sender requires upfront INR 4,999 / $65 wire transfer for laptop dispatch.',
        prepAdvice: ['Do NOT pay money to any recruiter or job board. Legitimate employers never charge candidates.']
      }
    ],
    importantDates: [
      {
        id: 'date-s-1',
        title: 'Arbitrary Urgency Deadline',
        date: '2026-09-10',
        type: 'deadline',
        status: 'approaching',
        company: 'FastTrack Placement HR',
        opportunityId: 'opp-suspicious-alert-2026'
      }
    ],
    sourceEmail: {
      sender: 'quick-jobs-portal@gmail.com',
      senderDomain: 'gmail.com',
      subject: 'URGENT: Guaranteed Placement at Top MNC - Immediate Joining (Deposit Required)',
      dateReceived: '2026-09-01',
      snippet: 'Congratulations! You have been selected for Data Analyst position. Please pay INR 4,999 / $65 security fee...'
    },
    confidenceScore: 18,
    confidenceLevel: 'low',
    confidenceBreakdown: [
      { label: 'Sender Domain Authenticated', passed: false, detail: 'Sent from generic public @gmail.com address rather than an official enterprise domain.' },
      { label: 'Official Careers Link', passed: false, detail: 'No verified company website or ATS portal provided.' },
      { label: 'Payment Demand Detected', passed: false, detail: 'CRITICAL WARNING: Demands upfront money for laptop dispatch or processing.' },
      { label: 'Guaranteed Offer Without Interview', passed: false, detail: 'Claims guaranteed employment without technical evaluation or verified job requisition.' }
    ],
    relevanceScore: 22,
    matchReasons: [
      'Flagged by PrepPilot Security Shield as high-risk spam / scam'
    ],
    status: 'archived'
  }
];

export const PROFILE_RECOMMENDED_COURSES: CourseRecommendation[] = [
  {
    id: 'course-dsa-mastery',
    title: 'Data Structures & Algorithmic Problem Solving',
    skill: 'DSA',
    provider: 'NeetCode & MIT OpenCourseWare',
    difficulty: 'Intermediate',
    estimatedTime: '6-8 weeks (5 hrs/week)',
    reason: 'Essential prerequisite tested in 95% of top tech coding rounds and online assessments.',
    url: 'https://neetcode.io/roadmap',
    tag: 'Core Foundation'
  },
  {
    id: 'course-java-backend',
    title: 'Modern Java & Spring Boot Microservices Architecture',
    skill: 'Java',
    provider: 'Hyperskill / JetBrains Academy',
    difficulty: 'Intermediate',
    estimatedTime: '4 weeks (6 hrs/week)',
    reason: 'Directly requested in Amazon, Atlassian, and Goldman Sachs backend engineering tracks.',
    url: 'https://spring.io/guides',
    tag: 'Industry Stack'
  },
  {
    id: 'course-dbms-sql',
    title: 'Database Internals & Advanced SQL Query Optimization',
    skill: 'DBMS & SQL',
    provider: 'Stanford Lagunita / CMU DB Group',
    difficulty: 'Advanced',
    estimatedTime: '3 weeks (4 hrs/week)',
    reason: 'Frequently tested in Round 2 Technical interviews (indexing, ACID transactions, sharding).',
    url: 'https://15445.courses.cs.cmu.edu/',
    tag: 'CS Fundamentals'
  },
  {
    id: 'course-system-design',
    title: 'System Design Primer for Student Engineers',
    skill: 'System Design',
    provider: 'ByteByteGo / Donne Martin',
    difficulty: 'Intermediate',
    estimatedTime: '3 weeks (3 hrs/week)',
    reason: 'Key differentiator to transition from junior coder to high-impact intern candidate.',
    url: 'https://github.com/donnemartin/system-design-primer',
    tag: 'High Impact'
  },
  {
    id: 'course-behavioral-comm',
    title: 'Behavioral & Leadership Principles Mastery (STAR Method)',
    skill: 'Interview Communication',
    provider: 'PrepPilot Career Lab',
    difficulty: 'Beginner',
    estimatedTime: '1 week (2 hrs/week)',
    reason: 'Critical for Amazon LP and Google Googleyness rounds where 30% of candidates fail.',
    url: '#',
    tag: 'Culture Fit'
  },
  {
    id: 'course-machine-learning',
    title: 'Applied Deep Learning & PyTorch for Production',
    skill: 'Machine Learning',
    provider: 'Fast.ai & DeepLearning.AI',
    difficulty: 'Intermediate',
    estimatedTime: '5 weeks (6 hrs/week)',
    reason: 'Recommended based on your AI/ML interest area to build portfolio-ready research projects.',
    url: 'https://course.fast.ai/',
    tag: 'AI Specialization'
  }
];

export const MOCK_QUESTIONS_DATABASE: Question[] = [
  {
    id: 'q-1',
    roundCategory: 'Coding Round',
    question: 'Two Sum & 3-Sum Optimal Formulation (Hashing vs. Two Pointers)',
    type: 'previously_reported',
    difficulty: 'Easy',
    tags: ['Arrays', 'Hashing', 'Google', 'Amazon'],
    sampleApproach: 'Use an unordered hash map to store complements in O(N) time and O(N) auxiliary space. For 3-Sum, sort first and use two converging pointers in O(N^2) time and O(1) space.'
  },
  {
    id: 'q-2',
    roundCategory: 'Coding Round',
    question: 'Longest Substring Without Repeating Characters (Sliding Window)',
    type: 'previously_reported',
    difficulty: 'Medium',
    tags: ['Strings', 'Sliding Window', 'Amazon', 'Microsoft'],
    sampleApproach: 'Maintain a window [left, right] and a character index map. When duplicate encountered at right, move left forward to map[char] + 1.'
  },
  {
    id: 'q-3',
    roundCategory: 'Coding Round',
    question: 'Course Schedule (Cycle Detection in Directed Graph / Topological Sort)',
    type: 'likely_predicted',
    difficulty: 'Medium',
    tags: ['Graphs', 'BFS', 'Kahn Algorithm', 'Uber'],
    sampleApproach: 'Compute in-degrees for all nodes. Push nodes with 0 in-degree into a queue. Pop and reduce neighbor in-degrees, tracking count of processed vertices.'
  },
  {
    id: 'q-4',
    roundCategory: 'Coding Round',
    question: 'Trapping Rain Water (Two Pointers / Monotonic Stack)',
    type: 'previously_reported',
    difficulty: 'Hard',
    tags: ['Dynamic Programming', 'Two Pointers', 'Google'],
    sampleApproach: 'Track leftMax and rightMax from both ends converging inward to evaluate water height in O(N) time and O(1) space.'
  },
  {
    id: 'q-5',
    roundCategory: 'Technical Interview',
    question: 'Explain the internal difference between a Process and a Thread, including Context Switch overhead.',
    type: 'previously_reported',
    difficulty: 'Medium',
    tags: ['Operating Systems', 'Concurrency', 'CS Fundamentals'],
    sampleApproach: 'A process is an isolated instance of execution with its own virtual memory address space (text, data, heap). Threads share the same address space and heap but hold separate program counters, registers, and stacks. Thread context switches avoid TLB (Translation Lookaside Buffer) flushes.'
  },
  {
    id: 'q-6',
    roundCategory: 'Technical Interview',
    question: 'How does an index work internally in PostgreSQL or MySQL (B+ Tree vs. Hash Index)?',
    type: 'previously_reported',
    difficulty: 'Medium',
    tags: ['DBMS', 'SQL', 'Indexes'],
    sampleApproach: 'B+ Trees store keys sorted in balanced multi-way tree pages. Internal nodes only hold search keys and pointers; leaf nodes store actual row pointers and are doubly linked for sequential range scans in O(log N).'
  },
  {
    id: 'q-7',
    roundCategory: 'Technical Interview',
    question: 'Explain OOP principles (Polymorphism, Inheritance, Encapsulation, Abstraction) with an extensible design example.',
    type: 'previously_reported',
    difficulty: 'Easy',
    tags: ['OOP', 'Design Patterns'],
    sampleApproach: 'Use a PaymentProcessor interface (Abstraction), private API keys/secrets (Encapsulation), and StripeProcessor vs. PayPalProcessor implementations (Polymorphism).'
  },
  {
    id: 'q-8',
    roundCategory: 'Technical Interview',
    question: 'What happens from the moment you type google.com into your browser until the page renders?',
    type: 'likely_predicted',
    difficulty: 'Hard',
    tags: ['Networking', 'Web Architecture', 'DNS'],
    sampleApproach: 'Walk through browser cache check, OS hosts file, recursive DNS query, TCP 3-way handshake (SYN, SYN-ACK, ACK), TLS 1.3 handshake, HTTP GET request, server routing, and DOM/CSSOM render tree construction.'
  },
  {
    id: 'q-9',
    roundCategory: 'HR / Behavioral',
    question: 'Tell me about yourself, your technical journey, and why you are excited about this specific team.',
    type: 'previously_reported',
    difficulty: 'Easy',
    tags: ['Behavioral', 'Introduction', 'All Companies'],
    sampleApproach: 'Structure as: Present (current degree & major engineering focus), Past (meaningful projects or problem-solving milestones), Future (why this company and team aligns with your career trajectory).'
  },
  {
    id: 'q-10',
    roundCategory: 'HR / Behavioral',
    question: 'Describe a situation where you had a significant disagreement with a team member. How did you resolve it?',
    type: 'previously_reported',
    difficulty: 'Medium',
    tags: ['STAR Method', 'Leadership Principles', 'Amazon LP'],
    sampleApproach: 'Use STAR: Situation (hackathon tech stack debate), Task (agree on reliable API architecture before deadline), Action (ran quick benchmark prototype and focused on data rather than ego), Result (shipped MVP on time, won honorable mention).'
  },
  {
    id: 'q-11',
    roundCategory: 'HR / Behavioral',
    question: 'Why should we hire you over other qualified candidates applying for this internship?',
    type: 'likely_predicted',
    difficulty: 'Medium',
    tags: ['Culture Fit', 'Self-Awareness'],
    sampleApproach: 'Highlight unique intersection of rapid learning velocity, deep ownership mindset, and demonstrated ability to build and deploy end-to-end applications.'
  }
];

export const MOCK_TESTS: MockTest[] = [
  {
    id: 'test-google-sde',
    opportunityId: 'opp-google-sde-2026',
    title: 'Google SDE Mock Assessment 2026',
    company: 'Google',
    difficulty: 'Medium',
    durationMinutes: 45,
    questionCount: 10,
    topics: ['Arrays & Hashing', 'Binary Search & Trees', 'Dynamic Programming', 'CS Fundamentals'],
    questions: [
      {
        id: 'gt-1',
        question: 'Given an array of integers nums and an integer target, which algorithmic technique yields O(N) time complexity to find two indices whose elements add up to target?',
        options: [
          'Brute force nested loops checking all pairs',
          'Sort the array with QuickSort then binary search',
          'Single-pass Hash Map storing elements and indices as complements',
          'Build a binary search tree and perform inorder traversal'
        ],
        correctAnswerIndex: 2,
        explanation: 'A Hash Map allows O(1) average-time lookups. For each element num, check if (target - num) exists in the map; if not, store (num, index). This achieves linear O(N) time and O(N) space.',
        topic: 'Arrays & Hashing'
      },
      {
        id: 'gt-2',
        question: 'What is the worst-case time complexity of searching for an element in an unbalanced Binary Search Tree (BST)?',
        options: [
          'O(1)',
          'O(log N)',
          'O(N)',
          'O(N log N)'
        ],
        correctAnswerIndex: 2,
        explanation: 'In the worst case (e.g. inserting elements in strictly ascending or descending order), a BST degrades into a linear linked list where depth is N, resulting in O(N) search time. Self-balancing trees like AVL or Red-Black trees prevent this.',
        topic: 'Binary Search & Trees'
      },
      {
        id: 'gt-3',
        question: 'Consider the classic 0/1 Knapsack problem with N items and maximum weight capacity W. What is its dynamic programming time complexity?',
        options: [
          'O(N log W)',
          'O(N * W)',
          'O(2^N)',
          'O(W^2)'
        ],
        correctAnswerIndex: 1,
        explanation: 'The standard 2D or 1D DP formulation iterates over all N items and capacities from 1 to W, yielding O(N * W) pseudo-polynomial time complexity.',
        topic: 'Dynamic Programming'
      },
      {
        id: 'gt-4',
        question: 'Which of the following sorting algorithms is guaranteed to have O(N log N) worst-case time complexity and is stable?',
        options: [
          'QuickSort',
          'HeapSort',
          'MergeSort',
          'SelectionSort'
        ],
        correctAnswerIndex: 2,
        explanation: 'MergeSort recursively splits arrays and merges sorted halves in O(N log N) time in all cases (best, average, worst) while preserving the relative order of identical keys (stable).',
        topic: 'Arrays & Hashing'
      },
      {
        id: 'gt-5',
        question: 'In modern operating systems, which memory segment stores dynamically allocated variables (e.g. malloc in C or new in Java)?',
        options: [
          'Stack segment',
          'Text / Code segment',
          'Heap segment',
          'Data segment'
        ],
        correctAnswerIndex: 2,
        explanation: 'The Heap segment is used for dynamic run-time memory allocation managed explicitly or via a garbage collector.',
        topic: 'CS Fundamentals'
      },
      {
        id: 'gt-6',
        question: 'What will be the output of following binary search logic if the target is greater than all elements in a sorted array of size N?',
        codeSnippet: `int low = 0, high = N - 1;
while (low <= high) {
  int mid = low + (high - low) / 2;
  if (arr[mid] < target) low = mid + 1;
  else high = mid - 1;
}
return low;`,
        options: [
          '0',
          '-1',
          'N (the size of array)',
          'N - 1'
        ],
        correctAnswerIndex: 2,
        explanation: 'Because target is larger than all elements, low increments past the final index N - 1 and exits the loop at low = N, which corresponds to the insertion point.',
        topic: 'Binary Search & Trees'
      },
      {
        id: 'gt-7',
        question: 'Which graph traversal algorithm uses a First-In-First-Out (FIFO) queue to discover vertices in shortest path order in an unweighted graph?',
        options: [
          'Depth-First Search (DFS)',
          'Breadth-First Search (BFS)',
          'Bellman-Ford Algorithm',
          'Floyd-Warshall Algorithm'
        ],
        correctAnswerIndex: 1,
        explanation: 'BFS explores neighbor vertices layer by layer using a FIFO queue, guaranteeing the minimum edge distance in unweighted graphs.',
        topic: 'CS Fundamentals'
      },
      {
        id: 'gt-8',
        question: 'In relational database transactions, which ACID property ensures that once a transaction commits, its changes survive system crashes?',
        options: [
          'Atomicity',
          'Consistency',
          'Isolation',
          'Durability'
        ],
        correctAnswerIndex: 3,
        explanation: 'Durability guarantees that committed transactions are written to non-volatile storage (via write-ahead logging or WAL) and will persist even during power failures.',
        topic: 'CS Fundamentals'
      },
      {
        id: 'gt-9',
        question: 'What is the time complexity of finding the diameter of a binary tree in a single postorder traversal?',
        options: [
          'O(N^2)',
          'O(N)',
          'O(log N)',
          'O(N log N)'
        ],
        correctAnswerIndex: 1,
        explanation: 'By computing the height of left and right subtrees bottom-up in a single postorder DFS pass, we can calculate the diameter at each node in O(1) work, totaling O(N) overall time.',
        topic: 'Binary Search & Trees'
      },
      {
        id: 'gt-10',
        question: 'What is the optimal space complexity for computing the N-th Fibonacci number using bottom-up dynamic programming?',
        options: [
          'O(N)',
          'O(1)',
          'O(2^N)',
          'O(log N)'
        ],
        correctAnswerIndex: 1,
        explanation: 'Since calculating Fib(N) only requires Fib(N-1) and Fib(N-2), we only need two variables to store previous states, resulting in O(1) auxiliary space.',
        topic: 'Dynamic Programming'
      }
    ]
  },
  {
    id: 'test-amazon-sde',
    opportunityId: 'opp-amazon-sde-2026',
    title: 'Amazon AWS SDE-1 Assessment Simulator',
    company: 'Amazon',
    difficulty: 'Medium',
    durationMinutes: 45,
    questionCount: 8,
    topics: ['Data Structures', 'OOP & Java', 'System Design Basics', 'Leadership Principles'],
    questions: [
      {
        id: 'az-1',
        question: 'Under Amazon Leadership Principles, if an engineer notices a bug in production that is not assigned to their team, which principle instructs them to take responsibility rather than saying "that’s not my job"?',
        options: [
          'Frugality',
          'Ownership',
          'Bias for Action',
          'Earn Trust'
        ],
        correctAnswerIndex: 1,
        explanation: 'Ownership states: Leaders are owners. They think long term and don’t sacrifice long-term value for short-term results. They never say "that’s not my job."',
        topic: 'Leadership Principles'
      },
      {
        id: 'az-2',
        question: 'In Java, what is the key difference between String, StringBuilder, and StringBuffer?',
        options: [
          'String is mutable; StringBuffer is immutable',
          'String is immutable; StringBuffer is thread-safe synchronized; StringBuilder is unsynchronized and faster for single-threaded usage',
          'StringBuilder is thread-safe; StringBuffer is not',
          'There is no functional difference'
        ],
        correctAnswerIndex: 1,
        explanation: 'Strings in Java are immutable. StringBuffer synchronizes methods for multithread safety at a performance cost, while StringBuilder is unsynchronized and optimal for single-threaded string concatenation.',
        topic: 'OOP & Java'
      },
      {
        id: 'az-3',
        question: 'Which data structure is ideal for implementing an LRU (Least Recently Used) cache with O(1) get and O(1) put operations?',
        options: [
          'Min Heap + Array',
          'Hash Map + Doubly Linked List',
          'Red-Black Tree',
          'Stack + Queue'
        ],
        correctAnswerIndex: 1,
        explanation: 'A Hash Map provides O(1) node lookup by key, and a Doubly Linked List allows O(1) node detachment and insertion at the head for recency tracking.',
        topic: 'Data Structures'
      },
      {
        id: 'az-4',
        question: 'What is the purpose of an exponential backoff with jitter algorithm in cloud network retries?',
        options: [
          'To overload the destination server faster',
          'To prevent the "thundering herd" problem where multiple clients retry simultaneously at identical intervals',
          'To encrypt payload data in transit',
          'To convert TCP packets into UDP'
        ],
        correctAnswerIndex: 1,
        explanation: 'Adding randomized jitter spreads retry calls across time intervals, preventing synchronized spikes that overwhelm recovering servers.',
        topic: 'System Design Basics'
      }
    ]
  }
];

export const INITIAL_NOTIFICATIONS: WhatsAppNotification[] = [
  {
    id: 'wa-1',
    title: 'Deadline Approaching',
    message: 'Google Software Engineering Internship closes in 12 days. Complete your preparation roadmap on PrepPilot.',
    timestamp: '2 hours ago',
    type: 'deadline',
    read: false
  },
  {
    id: 'wa-2',
    title: 'New High-Confidence Opportunity',
    message: 'Amazon Student Programs posted AWS SDE Intern (91% Legitimacy Confidence, 92% Match for your profile).',
    timestamp: 'Yesterday',
    type: 'opportunity',
    read: false
  },
  {
    id: 'wa-3',
    title: 'Mock Assessment Milestone',
    message: 'Your Google SDE Mock Assessment score improved to 82%! Recommended: review Dynamic Programming weak areas.',
    timestamp: '2 days ago',
    type: 'mock_test',
    read: true
  }
];
