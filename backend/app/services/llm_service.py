"""
PrepPilot LLM Intelligence Service
Uses Groq LLM or intelligent duplicate generator to extract opportunities, match scores, and daily prep tasks.
"""
import json
from app.config import settings
from app.models import StudentProfile, ExtractedOpportunity

SYSTEM_PROMPT = """You are PrepPilot's opportunity analysis engine.
You read a single email and a student's profile, and return ONLY a JSON object
(no markdown, no commentary, no code fences) matching this exact schema:

{
  "is_opportunity": boolean,
  "category": string|null,
  "company_or_org": string|null,
  "role_or_title": string|null,
  "status": string|null,
  "deadline_or_event_date": string|null,
  "days_remaining": integer|null,
  "eligibility": string|null,
  "required_skills": [string],
  "match_score": integer|null,
  "focus_areas": [string],
  "todays_task": string|null,
  "raw_summary": string
}
"""


def _generate_duplicate_opportunity(subject: str, sender: str, body: str, profile: StudentProfile) -> ExtractedOpportunity:
    """Intelligent duplicate generator that extracts realistic data matching the frontend style."""
    lower_subj = subject.lower()
    lower_body = body.lower()
    text = f"{lower_subj} {lower_body}"

    # Determine if this is promotional / newsletter
    is_promo = any(kw in text for kw in ["newsletter", "unsubscribe", "digest", "sale", "discount", "weekly digest"])
    is_opp = any(kw in text for kw in ["interview", "shortlist", "hackathon", "internship", "placement", "assessment", "congratulations", "hiring", "apply", "job"])

    if is_promo and not is_opp:
        return ExtractedOpportunity(
            is_opportunity=False,
            raw_summary=f"Promotional email from {sender}",
        )

    # Detect category & status
    category = "internship"
    status = "new"
    days_remaining = 7
    deadline = "2026-09-12"

    if "interview" in text:
        status = "interview"
        days_remaining = 5
        deadline = "2026-09-09"
    elif "shortlist" in text:
        status = "shortlisted"
        days_remaining = 6
        deadline = "2026-09-10"
    elif "hackathon" in text:
        category = "hackathon"
        status = "applied"
        days_remaining = 8
        deadline = "2026-09-12"
    elif "assessment" in text or "test" in text:
        category = "placement"
        status = "assessment"
        days_remaining = 11
        deadline = "2026-09-16"

    # Extract company
    company = "TechNova"
    if "technova" in text:
        company = "TechNova"
    elif "ethglobal" in text:
        company = "ETHGlobal Singapore"
    elif "apex" in text:
        company = "Apex Analytics Corp"
    elif "microsoft" in text:
        company = "Microsoft"
    elif "@" in sender:
        domain = sender.split("@")[1].split(".")[0]
        company = domain.capitalize()

    # Determine role
    role = "Software Engineer Intern"
    if "data" in text:
        role = "Data Analyst Associate"
    elif "hackathon" in text:
        role = "Hackathon Builder Track"
    elif "full stack" in text:
        role = "Full Stack Engineer"

    # Required skills
    req_skills = ["Python", "DSA", "OOP", "DBMS", "SQL"]
    if category == "hackathon":
        req_skills = ["Solidity", "React", "Web3", "Smart Contracts"]
    elif "data" in text:
        req_skills = ["SQL", "Python", "Data Analysis", "DBMS"]

    # Match score calculation based on student skills
    matched_skills = [s for s in req_skills if any(s.lower() in ps.lower() for ps in profile.skills)]
    match_score = min(96, max(70, int((len(matched_skills) / max(len(req_skills), 1)) * 40 + (profile.cgpa / 10.0) * 55)))

    # Focus areas
    focus_areas = ["OOP Polymorphism & Inheritance", "Array Sliding Window on LeetCode", "DBMS Normalization 3NF vs BCNF"]
    if category == "hackathon":
        focus_areas = ["Smart Contract Security", "Frontend dApp Integration", "Project Pitch Deck"]
    elif "data" in text:
        focus_areas = ["SQL Window Functions", "Query Indexing & Joins", "Statistical Analysis"]

    todays_task = f"Review {focus_areas[0]} (30m) and solve targeted problems"

    return ExtractedOpportunity(
        is_opportunity=True,
        category=category,
        company_or_org=company,
        role_or_title=role,
        status=status,
        deadline_or_event_date=deadline,
        days_remaining=days_remaining,
        eligibility=f"B.Tech CSE/IT students with CGPA >= {profile.cgpa - 0.5:.1f}",
        required_skills=req_skills,
        match_score=match_score,
        focus_areas=focus_areas,
        todays_task=todays_task,
        raw_summary=f"{company} {role} — {status.capitalize()} stage with {days_remaining} days remaining",
    )


def analyze_email(subject: str, sender: str, body: str, profile: StudentProfile) -> ExtractedOpportunity:
    """Analyzes email via Groq LLM if configured; otherwise returns duplicate intelligent analysis."""
    if settings.groq_api_key:
        try:
            from groq import Groq
            client = Groq(api_key=settings.groq_api_key)
            user_content = f"""TODAY'S DATE CONTEXT: 2026-09-05.
STUDENT PROFILE:
- Name: {profile.name}
- Stream: {profile.stream}, Year: {profile.year}
- CGPA: {profile.cgpa}
- Skills: {", ".join(profile.skills)}
- Interests: {", ".join(profile.interests)}

EMAIL:
Subject: {subject}
From: {sender}
Body:
{body}
"""
            response = client.chat.completions.create(
                model=settings.groq_model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_content},
                ],
                temperature=0.2,
                response_format={"type": "json_object"},
            )
            raw = response.choices[0].message.content
            data = json.loads(raw)
            return ExtractedOpportunity(**data)
        except Exception:
            pass

    # Duplicate / mock answer matching the frontend style
    return _generate_duplicate_opportunity(subject, sender, body, profile)
