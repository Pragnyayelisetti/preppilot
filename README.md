# PrepPilot

"We don't just tell students about an opportunity — we tell them how to prepare for it before it's too late."

AI system that reads opportunity emails (internships, placements, hackathons, scholarships),
figures out fit and urgency, and sends a personalized prep plan on WhatsApp.

## Project structure

```
preppilot/
├── backend/          FastAPI + Groq (LLM) + Twilio (WhatsApp) + Gmail (IMAP)
└── frontend/         React + Vite dashboard
```

## Backend setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
copy .env.example .env       # Windows: copy, Mac/Linux: cp
```

Fill in `.env`:
- **GMAIL_ADDRESS / GMAIL_APP_PASSWORD** — generate an app password at https://myaccount.google.com/apppasswords (needs 2FA enabled on the Gmail account)
- **GROQ_API_KEY** — from https://console.groq.com/keys (free tier is enough for a demo)
- **TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN** — from https://console.twilio.com. Join the WhatsApp sandbox by sending the join code to the sandbox number from your phone first — this step trips people up, do it early.

Run the server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Visit http://localhost:8000/docs for interactive API testing — this is the fastest way to
test the pipeline before wiring up the frontend. Try `/api/process-email` first, since it
lets you paste a raw email and doesn't need Gmail configured at all.

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:5173. The dashboard shows demo data by default and switches to
live data automatically once you hit "Sync inbox" with a working backend.

## Suggested demo flow for judges

1. Show the landing page and the WhatsApp mockup in the hero — this IS your pitch, let it speak
2. Open `/docs` on the backend and call `/api/process-email` live with a real (or realistic
   sample) opportunity email pasted in — show the JSON extraction happen in real time
3. Switch to the dashboard and click "Sync inbox" to show it pulling from a real Gmail account
4. If Twilio sandbox is joined on your phone, show the actual WhatsApp message arrive — this
   is the single most convincing demo moment, prioritize getting this working over polish elsewhere

## Notes on scope (given a 5-day build window)

- Gmail uses IMAP with an App Password, not full OAuth — much faster to set up, fine for a
  hackathon demo, swap to OAuth only if you have spare time
- One LLM call does classification + extraction + fit-scoring + prep-plan generation together
  (see `backend/app/services/llm_service.py`) — don't split this into separate models, it will
  cost you days you don't have
- Storage is in-memory for the demo — swap in MongoDB only if time permits, it's not what wins
  or loses this pitch
