from twilio.rest import Client
from app.config import settings
from app.models import ExtractedOpportunity

STATUS_EMOJI = {
    "shortlisted": "🎉",
    "interview": "🎯",
    "assessment": "📝",
    "selected": "🏆",
    "applied": "📨",
    "rejected": "💡",
    "new": "🔔",
}


def format_message(opp: ExtractedOpportunity) -> str:
    emoji = STATUS_EMOJI.get((opp.status or "new").lower(), "🔔")
    lines = [f"{emoji} {opp.role_or_title or 'Opportunity update'}"]

    if opp.company_or_org:
        lines[0] += f" — {opp.company_or_org}"

    if opp.days_remaining is not None:
        lines.append(f"⏰ {opp.days_remaining} day{'s' if opp.days_remaining != 1 else ''} remaining")

    if opp.match_score is not None:
        lines.append(f"🎯 Match: {opp.match_score}%")

    if opp.focus_areas:
        lines.append("Prepare: " + ", ".join(opp.focus_areas))

    if opp.todays_task:
        lines.append(f"Today's task: {opp.todays_task}")

    return "\n".join(lines)


def send_whatsapp_alert(opp: ExtractedOpportunity, to: str | None = None) -> str:
    if not settings.twilio_account_sid or not settings.twilio_auth_token:
        raise RuntimeError("Twilio credentials not configured in .env")

    client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
    body = format_message(opp)

    message = client.messages.create(
        from_=settings.twilio_whatsapp_from,
        to=to or settings.student_whatsapp_to,
        body=body,
    )
    return message.sid
