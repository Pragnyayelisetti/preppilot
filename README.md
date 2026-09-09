# PrepPilot

Now properly split into two independent folders:

```
preppilot/
├── backend/     Express + Gemini AI + real Gmail OAuth + OTP email sending
└── frontend/    React + Vite dashboard
```

## What changed from the AI-Studio version

- The single combined server (frontend + backend on one port) is now two
  separate apps you run independently, like a real production setup.
- **Gmail OAuth is now REAL.** Previously "Connect Gmail" just flipped a flag
  and "Sync Inbox" returned pre-written fake opportunities regardless of your
  actual inbox. Now: clicking Connect redirects to Google's real consent
  screen, and Sync genuinely fetches and analyzes your real emails.
- OTP emailing was already real in the code you had — untouched, just moved.

---

## Where to put your API keys (all in `backend/.env`)

Copy `backend/.env.example` to `backend/.env` and fill in:

| What | Where it goes | Used for |
|---|---|---|
| `GEMINI_API_KEY` | `backend/.env` | AI email analysis (classification, extraction) |
| `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` | `backend/.env` | Real Gmail OAuth (reading actual inbox) |
| `GMAIL_USER` + `GMAIL_APP_PASSWORD` | `backend/.env` | Sending OTP emails during login |

**Nothing goes in the frontend `.env`** — the frontend never touches API keys directly; it talks to your backend, which holds all the secrets.

### Setting up Google OAuth (for real Gmail reading)

1. [console.cloud.google.com](https://console.cloud.google.com) → create/select a project → enable the **Gmail API** (APIs & Services → Library)
2. **OAuth consent screen** → External → fill in app name/support email → add scope `https://www.googleapis.com/auth/gmail.readonly` → add your own Gmail as a **Test User** (required while in Testing mode — every email you'll actually demo with must be added here)
3. **Credentials** → Create Credentials → OAuth Client ID → type **Web application**
   - Authorized redirect URI: `http://localhost:8000/api/auth/google/callback` (must match exactly — this is a server redirect, not a JS origin)
4. Copy the Client ID and Client Secret into `backend/.env`

### Setting up OTP email sending

1. Enable 2-Step Verification on the Gmail account you'll send from
2. Generate an App Password: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Put that Gmail address in `GMAIL_USER` and the 16-character app password in `GMAIL_APP_PASSWORD`

---

## Running it

**Terminal 1 — backend:**
```bash
cd backend
npm install
copy .env.example .env    # then fill in the keys above
npm run dev
```
Runs on `http://localhost:8000`.

**Terminal 2 — frontend:**
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`. All its `/api/...` calls are automatically forwarded to the backend (see `vite.config.ts`) — no frontend code needed changing.

## Testing the real Gmail flow end-to-end

1. Open `http://localhost:5173`, sign up/log in (OTP should land in your real inbox if `GMAIL_USER`/`GMAIL_APP_PASSWORD` are set — otherwise it's logged to the backend terminal)
2. Go to Email Intelligence → Connect Gmail — this should open Google's **real** consent screen now, not skip straight to "connected"
3. Approve access → you'll be redirected back to the dashboard
4. Click Sync Inbox — the backend fetches your actual recent emails and runs each through Gemini; check the backend terminal logs if anything looks off

## If OAuth throws `401 invalid_client` or `403 access_denied`

- `invalid_client` → double check `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are copied exactly, and the redirect URI in Cloud Console matches `backend/.env`'s `GOOGLE_REDIRECT_URI` character-for-character
- `access_denied` → your Google account isn't added as a Test User yet on the OAuth consent screen page
