from fastapi import APIRouter, HTTPException
from app.models import StudentProfile, ProcessEmailRequest, ExtractedOpportunity
from app.services import gmail_service, llm_service, whatsapp_service

router = APIRouter(prefix="/api", tags=["process"])

# In-memory demo storage (swap for MongoDB when you have time)
_opportunities: list[ExtractedOpportunity] = []
_profile = StudentProfile(
    name="Pragnya",
    stream="CSE",
    year=2,
    cgpa=9.51,
    skills=["Python", "React", "DSA", "Machine Learning", "NLP"],
    interests=["NLP", "Generative AI"],
)


@router.get("/profile")
def get_profile():
    return _profile


@router.put("/profile")
def update_profile(profile: StudentProfile):
    global _profile
    _profile = profile
    return _profile


@router.post("/process-email", response_model=ExtractedOpportunity)
def process_single_email(req: ProcessEmailRequest, notify: bool = False):
    """Analyze one email (manual paste — good for live demo without real inbox access)."""
    try:
        opp = llm_service.analyze_email(req.subject, req.sender, req.body, _profile)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM analysis failed: {e}")

    if opp.is_opportunity:
        _opportunities.insert(0, opp)
        if notify:
            try:
                whatsapp_service.send_whatsapp_alert(opp)
            except Exception as e:
                raise HTTPException(status_code=502, detail=f"WhatsApp send failed: {e}")

    return opp


@router.post("/sync-inbox")
def sync_inbox(limit: int = 10, notify: bool = False):
    """Pulls recent Gmail emails and runs the full pipeline on each."""
    try:
        emails = gmail_service.fetch_recent_emails(limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gmail fetch failed: {e}")

    results = []
    for e in emails:
        try:
            opp = llm_service.analyze_email(e["subject"], e["sender"], e["body"], _profile)
        except Exception:
            continue
        if opp.is_opportunity:
            _opportunities.insert(0, opp)
            if notify:
                try:
                    whatsapp_service.send_whatsapp_alert(opp)
                except Exception:
                    pass
        results.append(opp)

    return {"processed": len(results), "opportunities_found": sum(1 for r in results if r.is_opportunity)}


@router.get("/opportunities", response_model=list[ExtractedOpportunity])
def list_opportunities():
    return _opportunities


@router.post("/preview-whatsapp")
def preview_whatsapp(opp: ExtractedOpportunity):
    from app.services.whatsapp_service import format_message
    return {"message": format_message(opp)}
