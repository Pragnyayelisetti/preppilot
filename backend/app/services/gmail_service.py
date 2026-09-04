"""
Fetches recent emails via IMAP using a Gmail App Password.
This is intentionally simpler than full Gmail OAuth — fast to set up for a
hackathon demo. For production you'd switch to the Gmail API with OAuth.
"""
import imaplib
import email
from email.header import decode_header
from app.config import settings


def _clean(text: str) -> str:
    if isinstance(text, bytes):
        return text.decode(errors="ignore")
    return text


def fetch_recent_emails(limit: int = 15) -> list[dict]:
    """Connects to Gmail via IMAP and returns the most recent emails."""
    if not settings.gmail_address or not settings.gmail_app_password:
        raise RuntimeError("Gmail credentials not configured in .env")

    imap = imaplib.IMAP4_SSL("imap.gmail.com")
    imap.login(settings.gmail_address, settings.gmail_app_password)
    imap.select("inbox")

    status, messages = imap.search(None, "ALL")
    mail_ids = messages[0].split()[-limit:]  # most recent N

    emails = []
    for mail_id in reversed(mail_ids):
        _, msg_data = imap.fetch(mail_id, "(RFC822)")
        raw_email = msg_data[0][1]
        msg = email.message_from_bytes(raw_email)

        subject, encoding = decode_header(msg["Subject"])[0]
        subject = _clean(subject)
        if encoding:
            subject = subject.decode(encoding, errors="ignore") if isinstance(subject, bytes) else subject

        sender = msg.get("From", "")

        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                disposition = str(part.get("Content-Disposition"))
                if content_type == "text/plain" and "attachment" not in disposition:
                    body = _clean(part.get_payload(decode=True))
                    break
        else:
            body = _clean(msg.get_payload(decode=True))

        emails.append({"subject": subject, "sender": sender, "body": body[:3000]})

    imap.logout()
    return emails
