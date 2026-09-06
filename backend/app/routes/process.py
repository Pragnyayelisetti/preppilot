"""
PrepPilot Process & Opportunity Routes
Provides endpoints for student profile, email ingestion, inbox sync, and WhatsApp alerts.
Supports Google OAuth 2.0 (Gmail REST API), IMAP credentials, and demo fallback.
"""
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Header, Body
from app.models import (
    StudentProfile,
    ProcessEmailRequest,
    ExtractedOpportunity,
    SyncInboxRequest,
    OAuthVerifyRequest,
)
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
        days_remaining=12,
        eligibility="Open to all engineering streams, CGPA >= 7.5",
        required_skills=["Python", "SQL", "Data Analysis", "Tableau"],
        match_score=85,
        focus_areas=["SQL Window Functions", "Data Modeling & Normalization", "Speed Aptitude"],
        todays_task="Complete 2 SQL window function practice sets and practice 20 aptitude questions",
        raw_summary="Online Technical Assessment invitation received. 90-minute timed test on HackerRank.",
    ),
    ExtractedOpportunity(
        is_opportunity=True,
        category="placement",
        company_or_org="Microsoft",
        role_or_title="Software Development Engineer (Azure)",
        status="new",
        deadline_or_event_date="2026-09-25",
        days_remaining=21,
        eligibility="B.Tech CSE/IT with CGPA >= 8.0, zero active backlogs",
        required_skills=["C++", "Java", "DSA", "OS", "System Design", "Algorithms"],
        match_score=88,
        focus_areas=["Tree & Graph Traversals", "Operating System Processes & Deadlocks", "Computer Networks (TCP/IP)"],
        todays_task="Solve Binary Tree Zigzag Level Order Traversal and revise Deadlock Conditions",
        raw_summary="Campus Placement Drive notification. Applications open until September 25th.",
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


@router.post("/gmail/verify")
def verify_gmail_token(
    req: Optional[OAuthVerifyRequest] = None,
    authorization: Optional[str] = Header(None),
):
    """Verifies a Google OAuth access token against the Gmail REST API."""
    token = None
    if req and req.access_token:
        token = req.access_token
    elif authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ", 1)[1].strip()

    if not token:
        raise HTTPException(status_code=400, detail="access_token is required via JSON body or Authorization: Bearer <token>")

    status = gmail_service.verify_oauth_token(token)
    if not status.get("valid"):
        raise HTTPException(status_code=401, detail=status.get("error", "Invalid or expired Google OAuth token"))

    return status


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
def sync_inbox(
    req: Optional[SyncInboxRequest] = None,
    limit: int = Query(10, description="Max emails to analyze"),
    notify: bool = Query(False, description="Send WhatsApp alert for new opportunities"),
    authorization: Optional[str] = Header(None),
):
    """
    Pulls recruitment emails and extracts opportunities into the radar.
    Supports:
    - Google OAuth Bearer Token (via Authorization header or req.access_token)
    - Direct IMAP credentials (GMAIL_ADDRESS & GMAIL_APP_PASSWORD)
    - Realistic duplicate demo stream fallback
    """
    token: Optional[str] = None
    target_limit = limit
    target_notify = notify

    if req:
        if req.access_token:
            token = req.access_token
        if req.limit:
            target_limit = req.limit
        if req.notify is not None:
            target_notify = req.notify

    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ", 1)[1].strip()

    source = "google_oauth" if token else ("imap" if gmail_service.settings.gmail_address else "demo_stream")

    try:
        emails = gmail_service.fetch_recent_emails(limit=target_limit, access_token=token)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inbox fetch failed: {e}")

    results = []
    added_count = 0
    for e in emails:
        try:
            opp = llm_service.analyze_email(e["subject"], e["sender"], e["body"], _profile)
            if opp.is_opportunity:
                # Deduplicate by company and role
                if not any(o.company_or_org == opp.company_or_org and o.role_or_title == opp.role_or_title for o in _opportunities):
                    _opportunities.insert(0, opp)
                    added_count += 1
                if target_notify:
                    try:
                        whatsapp_service.send_whatsapp_alert(opp)
                    except Exception:
                        pass
            results.append(opp)
        except Exception:
            continue

    return {
        "source": source,
        "processed": len(results),
        "opportunities_found": sum(1 for r in results if r.is_opportunity),
        "new_opportunities_added": added_count,
        "total_active_opportunities": len(_opportunities),
        "opportunities": [r for r in results if r.is_opportunity],
    }


@router.get("/opportunities", response_model=List[ExtractedOpportunity])
def list_opportunities():
    """Returns all active tracked opportunities."""
    return _opportunities


@router.post("/preview-whatsapp")
def preview_whatsapp(opp: ExtractedOpportunity):
    """Formats an opportunity into a crisp WhatsApp daily sprint alert."""
    return {"message": whatsapp_service.format_message(opp)}
