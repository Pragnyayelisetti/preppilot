export const mockOpportunities = [
  {
    is_opportunity: true,
    category: "placement",
    company_or_org: "Meridian Data Labs",
    role_or_title: "Software Engineer Interview",
    status: "shortlisted",
    deadline_or_event_date: "2026-09-09",
    days_remaining: 5,
    eligibility: "CGPA 7.5+, CSE/IT stream",
    required_skills: ["DSA", "OOP", "DBMS", "System Design Basics"],
    match_score: 82,
    focus_areas: ["DSA", "OOP", "DBMS", "Your projects", "Resume Q&A"],
    todays_task: "Practice 10 DSA problems (arrays + hashmaps)",
    raw_summary: "Shortlisted for the SDE interview round — 5 days to prepare."
  },
  {
    is_opportunity: true,
    category: "hackathon",
    company_or_org: "VEDA 2K26 — Aditya University",
    role_or_title: "AI Project Quest",
    status: "applied",
    deadline_or_event_date: "2026-09-11",
    days_remaining: 7,
    eligibility: "Any team of 2-4, ₹400 registration",
    required_skills: ["Generative AI", "NLP", "Prototype building"],
    match_score: 91,
    focus_areas: ["Prompt engineering", "Demo polish", "SDG framing"],
    todays_task: "Finalize the structured JSON prompt for opportunity extraction",
    raw_summary: "Team registered for AI Project Quest — prototype due in a week."
  },
  {
    is_opportunity: true,
    category: "scholarship",
    company_or_org: "AICTE",
    role_or_title: "Pragati Scholarship for Girls",
    status: "new",
    deadline_or_event_date: "2026-09-20",
    days_remaining: 16,
    eligibility: "Girl students, family income under ₹8L/year",
    required_skills: [],
    match_score: 74,
    focus_areas: ["Document collection", "Income certificate", "Application form"],
    todays_task: "Gather income certificate and last semester marksheet",
    raw_summary: "New scholarship opportunity — documents needed before applying."
  }
];

export const mockProfile = {
  name: "Pragnya",
  stream: "CSE",
  year: 2,
  cgpa: 9.51,
  skills: ["Python", "React", "DSA", "Machine Learning", "NLP"],
  interests: ["NLP", "Generative AI"]
};
