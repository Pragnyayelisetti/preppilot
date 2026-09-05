from pydantic import BaseModel
from typing import Optional, List


class StudentProfile(BaseModel):
    name: str
    stream: str  # e.g. "CSE"
    year: int
    skills: list[str]
    cgpa: float
    interests: list[str] = []


class ExtractedOpportunity(BaseModel):
    is_opportunity: bool
    category: Optional[str] = None          # internship / placement / hackathon / scholarship / competition
    company_or_org: Optional[str] = None
    role_or_title: Optional[str] = None
    status: Optional[str] = None            # applied / shortlisted / interview / assessment / rejected / new
    deadline_or_event_date: Optional[str] = None  # ISO date string if found
    days_remaining: Optional[int] = None
    eligibility: Optional[str] = None
    required_skills: list[str] = []
    match_score: Optional[int] = None       # 0-100
    focus_areas: list[str] = []             # top 2-3 things to prioritize
    todays_task: Optional[str] = None
    raw_summary: Optional[str] = None


class ProcessEmailRequest(BaseModel):
    subject: str
    sender: str
    body: str


class WhatsAppPreview(BaseModel):
    message: str
