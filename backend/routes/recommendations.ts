import { Router, Request, Response } from 'express';
import { appState } from '../state';
import { PROFILE_RECOMMENDED_COURSES } from '../data';
import { CourseRecommendation } from '../types';

export const recommendationsRouter = Router();

// Loose keyword match between a profile field (skill/interest/role) and a
// course or skill-suggestion's own labels, so recommendations actually
// track what the user said they're into.
function textMatches(a: string, b: string): boolean {
  const na = a.toLowerCase();
  const nb = b.toLowerCase();
  return na.includes(nb) || nb.includes(na);
}

function matchesProfile(labels: string[], profileTerms: string[]): boolean {
  return profileTerms.some(term => labels.some(label => textMatches(label, term)));
}

// GET recommendations based on user's profile
recommendationsRouter.get('/', (req: Request, res: Response) => {
  const user = appState.user;
  const userSkills = user.skills || [];
  const userInterests = user.interests || [];
  const userRoles = user.preferredRoles || [];
  const profileTerms = [...userInterests, ...userRoles, ...userSkills];

  // Prioritize courses that match the user's stated interests/roles/skills
  // ahead of the general catalog, instead of showing a fixed static order.
  const courses: CourseRecommendation[] = [...PROFILE_RECOMMENDED_COURSES].sort((a, b) => {
    const aMatch = matchesProfile([a.skill, a.tag || ''], profileTerms) ? 1 : 0;
    const bMatch = matchesProfile([b.skill, b.tag || ''], profileTerms) ? 1 : 0;
    return bMatch - aMatch;
  });

  // Tailored skills to learn — each tagged with whether it lines up with a
  // stated interest/role, and skills the user already has are deprioritized
  // since there's less value recommending something they already know.
  const skillCatalog = [
    {
      skill: 'Advanced DSA (Graphs & Dynamic Programming)',
      why: 'Highest correlation with clearing technical online assessments for SDE roles.',
      priority: 'Essential',
      hoursToMaster: '30-40 hours',
      matchingRole: 'Software Engineer'
    },
    {
      skill: 'System Design & Distributed Scalability',
      why: 'Differentiates top candidates for Tier-1 engineering internships.',
      priority: 'High',
      hoursToMaster: '20 hours',
      matchingRole: 'Backend Engineer'
    },
    {
      skill: 'Database Indexing & ACID Internals',
      why: 'Crucial core CS foundation asked in round 2 interviews.',
      priority: 'Essential',
      hoursToMaster: '15 hours',
      matchingRole: 'Full Stack & Backend'
    },
    {
      skill: 'Modern React & State Architecture',
      why: 'Fastest route to win collegiate hackathons and build resume-defining products.',
      priority: 'Medium',
      hoursToMaster: '25 hours',
      matchingRole: 'Frontend & Full Stack'
    },
    {
      skill: 'Applied Machine Learning Foundations',
      why: 'Builds the math and modeling base needed for AI/ML-focused internship tracks.',
      priority: 'High',
      hoursToMaster: '25-30 hours',
      matchingRole: 'AI/ML Engineer'
    },
    {
      skill: 'Cloud Deployment & CI/CD Pipelines',
      why: 'Shows up in take-home assignments for teams that ship on cloud-native infrastructure.',
      priority: 'Medium',
      hoursToMaster: '18 hours',
      matchingRole: 'Cloud Architecture'
    }
  ];

  const recommendedSkillsToLearn = skillCatalog
    .filter(s => !userSkills.some(skill => textMatches(skill, s.skill)))
    .sort((a, b) => {
      const aMatch = matchesProfile([a.matchingRole], profileTerms) ? 1 : 0;
      const bMatch = matchesProfile([b.matchingRole], profileTerms) ? 1 : 0;
      return bMatch - aMatch;
    })
    .slice(0, 4);

  const careerRoadmapMilestones = [
    {
      step: 1,
      title: 'Master Algorithmic Patterns',
      description: 'Solve the top 75 LeetCode patterns (Two Pointers, Sliding Window, DFS/BFS, Hashing).',
      status: 'in_progress',
      progress: 68
    },
    {
      step: 2,
      title: 'Solidify CS Fundamentals',
      description: 'Review OS process scheduling, DBMS indexes, and Computer Networks TCP/TLS handshakes.',
      status: 'upcoming',
      progress: 40
    },
    {
      step: 3,
      title: 'Build & Deploy a Capstone Full-Stack App',
      description: 'Create a production-grade distributed application with cloud deployment and clean README.',
      status: 'upcoming',
      progress: 85
    },
    {
      step: 4,
      title: 'Run Timed Mock Tests & AI Interviews',
      description: 'Practice 45-minute timed assessments and behavioral STAR drills on PrepPilot.',
      status: 'upcoming',
      progress: 50
    }
  ];

  res.json({
    userGreeting: `While we continuously scan your inbox for new verified opportunities, here is your customized career acceleration roadmap based on your ${user.branch} background, your interest in ${userInterests[0] || 'Software Engineering'}, and your ${userRoles[0] || 'Software Engineering'} goal.`,
    courses,
    recommendedSkills: recommendedSkillsToLearn,
    careerMilestones: careerRoadmapMilestones,
    userProfileSnapshot: {
      name: user.name,
      college: user.college,
      gradYear: user.gradYear,
      skills: user.skills,
      interests: user.interests,
      careerGoals: user.careerGoals
    }
  });
});
