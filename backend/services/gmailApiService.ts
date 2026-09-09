/**
 * Real Google OAuth token exchange + Gmail message fetching.
 * This replaces the simulated /connect and /sync behavior with actual
 * calls to Google's OAuth and Gmail REST APIs.
 */
import { appState } from '../state';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GMAIL_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `${process.env.APP_URL || 'http://localhost:8000'}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not configured in backend .env');
  }

  const resp = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(`Token exchange failed: ${JSON.stringify(data)}`);
  }
  return data;
}

async function refreshAccessToken(): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!appState.googleRefreshToken || !clientId || !clientSecret) {
    throw new Error('No refresh token available — user must reconnect Gmail');
  }

  const resp = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: appState.googleRefreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(`Token refresh failed: ${JSON.stringify(data)}`);
  }

  appState.googleAccessToken = data.access_token;
  appState.googleTokenExpiresAt = Date.now() + data.expires_in * 1000;
  return data.access_token;
}

async function getValidAccessToken(): Promise<string> {
  const isExpired = !appState.googleTokenExpiresAt || Date.now() > appState.googleTokenExpiresAt - 60_000;
  if (appState.googleAccessToken && !isExpired) {
    return appState.googleAccessToken;
  }
  return refreshAccessToken();
}

function decodeBase64Url(data: string): string {
  if (!data) return '';
  const padded = data.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (data.length % 4)) % 4);
  return Buffer.from(padded, 'base64').toString('utf-8');
}

function extractBody(payload: any): string {
  if (!payload) return '';
  if (payload.body?.data) {
    const text = decodeBase64Url(payload.body.data);
    if (text.trim()) return text;
  }
  let plain = '';
  let html = '';
  function scan(parts: any[]) {
    for (const part of parts || []) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        plain += decodeBase64Url(part.body.data) + '\n';
      } else if (part.mimeType === 'text/html' && part.body?.data && !plain) {
        html += decodeBase64Url(part.body.data) + '\n';
      }
      if (part.parts) scan(part.parts);
    }
  }
  scan(payload.parts || []);
  return plain.trim() || html.trim();
}

export async function fetchGmailProfile(): Promise<{ emailAddress: string }> {
  const token = await getValidAccessToken();
  const resp = await fetch(`${GMAIL_BASE}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error(`Failed to fetch Gmail profile: ${resp.status}`);
  return resp.json();
}

export interface FetchedEmail {
  subject: string;
  sender: string;
  body: string;
}

export async function fetchRecentEmails(maxResults: number = 15): Promise<FetchedEmail[]> {
  const token = await getValidAccessToken();
  const headers = { Authorization: `Bearer ${token}` };

  const query =
    'subject:(interview OR assessment OR shortlisted OR selected OR application OR hackathon OR internship OR placement OR scholarship OR offer)';

  const listResp = await fetch(
    `${GMAIL_BASE}/messages?maxResults=${maxResults}&q=${encodeURIComponent(query)}`,
    { headers }
  );
  if (!listResp.ok) throw new Error(`Failed to list messages: ${listResp.status}`);
  const listData = await listResp.json();
  let refs = listData.messages || [];

  if (refs.length === 0) {
    const fallbackResp = await fetch(`${GMAIL_BASE}/messages?maxResults=${maxResults}`, { headers });
    if (fallbackResp.ok) {
      const fallbackData = await fallbackResp.json();
      refs = fallbackData.messages || [];
    }
  }

  const emails: FetchedEmail[] = [];
  for (const ref of refs.slice(0, maxResults)) {
    const detailResp = await fetch(`${GMAIL_BASE}/messages/${ref.id}?format=full`, { headers });
    if (!detailResp.ok) continue;
    const detail = await detailResp.json();
    const headerList: { name: string; value: string }[] = detail.payload?.headers || [];
    const getHeader = (name: string) =>
      headerList.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    emails.push({
      subject: getHeader('Subject') || 'No Subject',
      sender: getHeader('From') || 'Unknown Sender',
      body: (extractBody(detail.payload) || detail.snippet || '').slice(0, 3000),
    });
  }

  return emails;
}
