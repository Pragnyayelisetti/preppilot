import json
from groq import Groq
from app.config import settings
from app.models import StudentProfile, ExtractedOpportunity

client = Groq(api_key=settings.groq_api_key)

SYSTEM_PROMPT = """You are PrepPilot's opportunity analysis engine.
You read a single email and a student's profile, and return ONLY a JSON object
(no markdown, no commentary, no code fences) matching this exact schema:

{
  "is_opportunity": boolean,          // false if this is promotional/spam/unrelated
  "category": string|null,            // "internship" | "placement" | "hackathon" | "scholarship" | "competition" | "other"
  "company_or_org": string|null,
  "role_or_title": string|null,
  "status": string|null,              // "new" | "applied" | "shortlisted" | "interview" | "assessment" | "rejected" | "selected"
  "deadline_or_event_date": string|null,   // ISO date "YYYY-MM-DD" if you can determine one, else null
  "days_remaining": integer|null,     // estimate relative to today if a date was found
  "eligibility": string|null,         // one short sentence
  "required_skills": [string],        // technical skills/topics relevant to this opportunity
  "match_score": integer|null,        // 0-100, how well the student's profile fits, null if is_opportunity is false
  "focus_areas": [string],            // 2-4 topics the student should prioritize studying, ranked by importance
  "todays_task": string|null,         // ONE concrete, specific, actionable task for today (not generic — tie it to the role/category)
  "raw_summary": string               // one plain-sentence summary of the email for a dashboard card
}

Rules:
- If the email is not opportunity-related (promotions, newsletters, unrelated), set is_opportunity to false and leave opportunity-specific fields null/empty, but still write a one-line raw_summary.
- match_score should reflect real overlap between required_skills/eligibility and the student's listed skills/CGPA/interests — do not default to a flat number.
- todays_task must be specific to the actual role and days_remaining (e.g. more urgent phrasing and narrower scope if days_remaining is low).
- Return ONLY valid JSON. No explanation text before or after.
"""


def analyze_email(subject: str, sender: str, body: str, profile: StudentProfile) -> ExtractedOpportunity:
    user_content = f"""TODAY'S DATE CONTEXT: use relative reasoning if an explicit date is present in the email.

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
