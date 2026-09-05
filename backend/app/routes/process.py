"""
PrepPilot Process & Opportunity Routes
Provides endpoints for student profile, email ingestion, inbox sync, and WhatsApp alerts.
Uses duplicate answers and in-memory persistence mirroring the frontend style.
"""
from typing import List
from fastapi import APIRouter, HTTPException, Query
from app.models import StudentProfile, ProcessEmailRequest, ExtractedOpportunity
from app.services import gmail_service, llm_service, whatsapp_service

router = APIRouter(prefix="/api", tags=["process"])

# Duplicate Database: Initialized with high-fidelity profile matching the frontend
_profile = StudentProfile(
    name="Alex Chen",
    stream="Computer Science & Engineering",
    year=3,
    cgpa=8.4,
    skills=["Python", "JavaScript", "React", "DSA", "SQL", "Git", "Machine Learning"],
    interests=["Software Development", "Full Stack", "System Design", "Cloud Computing"],
)

# Duplicate Database: Pre-populated opportunities matching the frontend cards and timeline
_opportunities: List[ExtractedOpportunity] = [
    ExtractedOpportunity(
        is_opportunity=True,
        category="internship",
        company_or_org="TechNova",
        role_or_title="Software Engineer Intern",
        status="interview",
        deadline_or_event_date="2026-09-09",
        days_remaining=5,
        eligibility="B.Tech CSE/IT with CGPA >= 8.0",
        required_skills=["Python", "DSA", "OOP", "DBMS", "SQL"],
        match_score=92,
        focus_areas=["OOP Polymorphism & Inheritance", "Array Sliding Window on LeetCode", "DBMS Normalization 3NF vs BCNF"],
        todays_task="Review OOP Inheritance concepts and solve 5 array problems on LeetCode",
        raw_summary="Technical Interview Round 1 scheduled for Sept 9th with Senior Engineering Manager",
    ),
    ExtractedOpportunity(
        is_opportunity=True,
        category="hackathon",
        company_or_org="ETHGlobal Singapore",
        role_or_title="Hackathon Builder Track",
        status="applied",
        deadline_or_event_date="2026-09-12",
        days_remaining=8,
        eligibility="Open to all university students globally",
        required_skills=["Solidity", "React", "Web3", "Smart Contracts"],
        match_score=78,
        focus_areas=["Smart Contract Security", "Frontend dApp Integration", "Pitch Deck"],
        todays_task="Finalize team project repository and setup Hardhat deployment environment",
        raw_summary="ETHGlobal Singapore 2026 registration confirmed. Submission portal closes Sept 12.",
    ),
    ExtractedOpportunity(
        is_opportunity=True,
        category="placement",
        company_or_org="Apex Analytics Corp",
        role_or_title="Data Analyst Associate",
        status="assessment",
        deadline_or_event_date="2026-09-16",
        days_remaining=11,
        eligibility="Undergraduate graduating in 2026 with strong analytical background",
        required_skills=["SQL", "Python", "Data Analysis", "DBMS"],
        match_score=85,
        focus_areas=["SQL Window Functions", "Query Optimization & Indexing", "Statistical Analysis"],
        todays_task="Practice 10 SQL join and window ranking queries on HackerRank",
        raw_summary="Online Technical Assessment invitation received. 90-minute window closes Sept 16.",
    ),
    ExtractedOpportunity(
        is_opportunity=True,
        category="placement",
        company_or_org="Microsoft",
        role_or_title="Software Development Engineer (Azure)",
        status="new",
        deadline_or_event_date="2026-09-25",
        days_remaining=20,
        eligibility="B.Tech CSE/IT with CGPA >= 8.0",
        required_skills=["DSA", "System Design", "Cloud Architecture", "C++ / Python"],
        match_score=88,
        focus_areas=["Binary Trees & Graphs", "Distributed Systems Basics", "Mock Interviews"],
        todays_task="Review Graph BFS/DFS traversal algorithms and solve 3 medium problems",
        raw_summary="Microsoft Azure Campus Placement Drive 2026 resume submissions open until Sept 25.",
    ),
]


@router.get("/profile", response_model=StudentProfile)
def get_profile():
    """Returns the current student profile."""
    return _profile


@router.put("/profile", response_model=StudentProfile)
def update_profile(profile: StudentProfile):
    """Updates the student profile in memory/database."""
    global _profile
    _profile = profile
    return _profile


@router.post("/process-email", response_model=ExtractedOpportunity)
def process_single_email(req: ProcessEmailRequest, notify: bool = False):
    """Analyze one email (manual paste / test). Extracts actionable opportunity details."""
    try:
        opp = llm_service.analyze_email(req.subject, req.sender, req.body, _profile)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")

    if opp.is_opportunity:
        _opportunities.insert(0, opp)
        if notify:
            try:
                whatsapp_service.send_whatsapp_alert(opp)
            except Exception:
                pass

    return opp


@router.post("/sync-inbox")
def sync_inbox(limit: int = 10, notify: bool = False):
    """Pulls recent recruitment emails and extracts opportunities into the radar."""
    try:
        emails = gmail_service.fetch_recent_emails(limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inbox fetch failed: {e}")

    results = []
    for e in emails:
        try:
            opp = llm_service.analyze_email(e["subject"], e["sender"], e["body"], _profile)
            if opp.is_opportunity:
                # Deduplicate by company and role
                if not any(o.company_or_org == opp.company_or_org and o.role_or_title == opp.role_or_title for o in _opportunities):
                    _opportunities.insert(0, opp)
                if notify:
                    try:
                        whatsapp_service.send_whatsapp_alert(opp)
                    except Exception:
                        pass
            results.append(opp)
        except Exception:
            continue

    return {
        "processed": len(results),
        "opportunities_found": sum(1 for r in results if r.is_opportunity),
        "total_active_opportunities": len(_opportunities),
    }


@router.get("/opportunities", response_model=List[ExtractedOpportunity])
def list_opportunities():
    """Returns all active tracked opportunities."""
    return _opportunities


@router.post("/preview-whatsapp")
def preview_whatsapp(opp: ExtractedOpportunity):
    """Formats an opportunity into a crisp WhatsApp daily sprint alert."""
    return {"message": whatsapp_service.format_message(opp)}
