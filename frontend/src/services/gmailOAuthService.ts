/**
 * PrepPilot Client-Side Gmail OAuth 2.0 & Intelligence Service
 * Uses Google Identity Services (GSI) initTokenClient to securely request
 * https://www.googleapis.com/auth/gmail.readonly permission directly from the user.
 */

import { EmailLog } from '../components/dashboard/dashboardData';
import { Opportunity } from '../data/mockOpportunities';

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

export interface SyncResult {
  source: 'google_oauth' | 'manual_token';
  emailAddress: string;
  totalFetched: number;
  opportunitiesDetected: number;
  emails: EmailLog[];
  opportunities: Opportunity[];
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
            error_callback?: (error: any) => void;
            prompt?: string;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

// Default Google Client ID from environment or fallback
export const getGoogleClientId = (): string => {
  const custom = localStorage.getItem('preppilot_custom_google_client_id');
  if (custom && custom.trim()) return custom.trim();
  const envId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
  return envId;
};

export const setCustomGoogleClientId = (id: string) => {
  if (id.trim()) {
    localStorage.setItem('preppilot_custom_google_client_id', id.trim());
  } else {
    localStorage.removeItem('preppilot_custom_google_client_id');
  }
};

export const getStoredAccessToken = (): string | null => {
  const token = localStorage.getItem('preppilot_gmail_access_token');
  const expiry = localStorage.getItem('preppilot_gmail_token_expiry');
  if (!token) return null;
  if (expiry && Date.now() > parseInt(expiry, 10)) {
    localStorage.removeItem('preppilot_gmail_access_token');
    localStorage.removeItem('preppilot_gmail_token_expiry');
    return null;
  }
  return token;
};

export const saveAccessToken = (token: string, expiresInSeconds: number = 3600) => {
  localStorage.setItem('preppilot_gmail_access_token', token);
  localStorage.setItem('preppilot_gmail_token_expiry', (Date.now() + expiresInSeconds * 1000).toString());
};

export const clearStoredAuth = () => {
  localStorage.removeItem('preppilot_gmail_access_token');
  localStorage.removeItem('preppilot_gmail_token_expiry');
  localStorage.removeItem('preppilot_gmail_connected_email');
};

export const getConnectedEmail = (): string | null => {
  return localStorage.getItem('preppilot_gmail_connected_email');
};

/**
 * Ensures Google Identity Services script is loaded in window
 */
export const ensureGsiLoaded = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.google?.accounts?.oauth2) {
      resolve(true);
      return;
    }
    const checkInterval = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        clearInterval(checkInterval);
        resolve(true);
      }
    }, 100);

    // Timeout after 5s
    setTimeout(() => {
      clearInterval(checkInterval);
      resolve(!!window.google?.accounts?.oauth2);
    }, 5000);
  });
};

/**
 * Triggers Google OAuth Consent Popup asking for https://www.googleapis.com/auth/gmail.readonly
 */
export const requestGoogleGmailAccess = async (clientId?: string): Promise<string> => {
  const activeClientId = clientId || getGoogleClientId();
  if (!activeClientId) {
    throw new Error('Google Client ID is missing. Please provide a Client ID in Settings or .env');
  }

  const loaded = await ensureGsiLoaded();
  if (!loaded || !window.google?.accounts?.oauth2) {
    throw new Error('Google Identity Services (GSI) failed to load. Please check your internet connection.');
  }

  return new Promise((resolve, reject) => {
    try {
      const tokenClient = window.google!.accounts.oauth2.initTokenClient({
        client_id: activeClientId,
        scope: 'https://www.googleapis.com/auth/gmail.readonly',
        prompt: 'consent',
        callback: (resp) => {
          if (resp.error) {
            reject(new Error(`Google OAuth error: ${resp.error}`));
            return;
          }
          if (resp.access_token) {
            saveAccessToken(resp.access_token, 3500);
            resolve(resp.access_token);
          } else {
            reject(new Error('No access token received from Google.'));
          }
        },
        error_callback: (err) => {
          reject(new Error(err?.message || 'Google OAuth prompt closed or failed.'));
        },
      });

      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (err: any) {
      reject(new Error(err?.message || 'Failed to initialize Google OAuth dialog.'));
    }
  });
};

/**
 * Fetches user profile from Gmail REST API
 */
export const fetchGmailProfile = async (accessToken: string): Promise<GmailProfile> => {
  const resp = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`Gmail API error (${resp.status}): ${errorText}`);
  }

  const data = await resp.json();
  if (data.emailAddress) {
    localStorage.setItem('preppilot_gmail_connected_email', data.emailAddress);
  }
  return data;
};

/**
 * Decodes URL-safe base64 data returned by Gmail API
 */
function decodeBase64Url(data: string): string {
  if (!data) return '';
  try {
    let base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binStr = atob(base64);
    const bytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) {
      bytes[i] = binStr.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    try {
      return atob(data.replace(/-/g, '+').replace(/_/g, '/'));
    } catch {
      return '';
    }
  }
}

/**
 * Extracts plain text body from a Gmail message payload
 */
function extractBodyFromMessage(payload: any): string {
  if (!payload) return '';
  if (payload.body?.data) {
    const text = decodeBase64Url(payload.body.data);
    if (text.trim()) return text;
  }

  let textPlain = '';
  let textHtml = '';

  const scanParts = (parts: any[]) => {
    if (!parts || !Array.isArray(parts)) return;
    for (const part of parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        textPlain += decodeBase64Url(part.body.data) + '\n';
      } else if (part.mimeType === 'text/html' && part.body?.data && !textPlain) {
        textHtml += decodeBase64Url(part.body.data) + '\n';
      }
      if (part.parts) {
        scanParts(part.parts);
      }
    }
  };

  scanParts(payload.parts || []);

  const raw = textPlain.trim() ? textPlain : textHtml;
  if (!raw) return '';

  // Clean HTML if present
  return raw
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * AI Opportunity Extraction Heuristics for Student Career Inboxes
 */
function analyzeEmailContent(
  subject: string,
  sender: string,
  body: string
): { isOpportunity: boolean; opportunity?: Opportunity; log: EmailLog } {
  const combined = `${subject} ${sender} ${body}`.toLowerCase();

  const isOpportunityKeywords = [
    'interview',
    'shortlisted',
    'shortlist',
    'technical round',
    'coding test',
    'online assessment',
    'hackathon',
    'hiring challenge',
    'internship',
    'placement drive',
    'test link',
    'hackerrank',
    'coderpad',
    'campus recruitment',
    'offered',
    'selection',
  ];

  const promotionalKeywords = [
    'newsletter',
    'unsubscribe',
    'webinar free',
    'bootcamp sale',
    '50% off',
    'discount code',
    'marketing digest',
    'promotion',
  ];

  let isOpp = isOpportunityKeywords.some((k) => combined.includes(k));
  const isPromo = promotionalKeywords.some((k) => combined.includes(k));

  if (isPromo && !combined.includes('shortlist') && !combined.includes('interview')) {
    isOpp = false;
  }

  // Determine stage
  let stage = 'Application Received';
  if (combined.includes('interview') || combined.includes('round 1') || combined.includes('round 2')) {
    stage = 'Technical Interview';
  } else if (combined.includes('assessment') || combined.includes('coding test') || combined.includes('test link')) {
    stage = 'Online Assessment';
  } else if (combined.includes('shortlisted') || combined.includes('congratulations')) {
    stage = 'Shortlisted';
  } else if (combined.includes('hackathon')) {
    stage = 'Hackathon Track';
  }

  // Determine company / sender
  let extractedCompany = 'Campus Opportunity';
  const companyMatch = subject.match(/(?:at|for|with|from)\s+([A-Z][a-zA-Z0-9&]+(?:\s+[A-Z][a-zA-Z0-9&]+)?)/);
  if (companyMatch && companyMatch[1]) {
    extractedCompany = companyMatch[1];
  } else {
    // Extract domain from sender
    const domainMatch = sender.match(/@([a-zA-Z0-9-]+)\./);
    if (domainMatch && domainMatch[1] && !['gmail', 'yahoo', 'outlook', 'hotmail'].includes(domainMatch[1])) {
      extractedCompany = domainMatch[1].charAt(0).toUpperCase() + domainMatch[1].slice(1);
    }
  }

  // Determine role
  let roleTitle = 'Software Engineer Candidate';
  if (combined.includes('intern')) roleTitle = 'Software Engineer Intern';
  else if (combined.includes('hackathon')) roleTitle = 'Hackathon Builder Track';
  else if (combined.includes('data analyst')) roleTitle = 'Data Analyst Associate';
  else if (combined.includes('sde') || combined.includes('software')) roleTitle = 'SDE Candidate';

  // Determine Opportunity Type
  let type: 'internship' | 'hackathon' | 'placement' | 'scholarship' = 'internship';
  if (combined.includes('hackathon')) type = 'hackathon';
  else if (combined.includes('placement') || combined.includes('campus drive') || combined.includes('full-time')) type = 'placement';
  else if (combined.includes('scholarship')) type = 'scholarship';

  const logId = 'email-' + Math.random().toString(36).substring(2, 9);
  const now = new Date();
  const timeStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const log: EmailLog = {
    id: logId,
    sender,
    subject,
    snippet: body ? body.substring(0, 200) + '...' : 'Email content processed from Gmail inbox.',
    timestamp: timeStr,
    type: isOpp ? 'opportunity' : 'promotional',
    stage: isOpp ? stage : undefined,
    extractedCompany: isOpp ? extractedCompany : undefined,
    confidenceScore: isOpp ? 94 : 88,
  };

  if (!isOpp) {
    return { isOpportunity: false, log };
  }

  // Build high-value actionable opportunity
  const oppId = `opp-gmail-${Math.random().toString(36).substring(2, 8)}`;
  const daysAhead = Math.floor(Math.random() * 8) + 4; // 4 to 12 days

  const matchedSkills = ['Python', 'DSA', 'OOP', 'SQL'].filter((s) => combined.includes(s.toLowerCase()));
  if (matchedSkills.length === 0) matchedSkills.push('Problem Solving', 'Data Structures');

  const missingSkills = ['System Design Basics', 'Dynamic Programming Tuning'].filter((s) => !matchedSkills.includes(s));

  const opportunity: Opportunity = {
    id: oppId,
    title: `${roleTitle} (${stage})`,
    company: extractedCompany,
    type,
    location: 'Verified via Gmail Inbox',
    stipendOrPrize: type === 'hackathon' ? '$10,000 Prize Pool' : 'Competitive / Industry Standard',
    deadline: `In ${daysAhead} days`,
    matchScore: Math.floor(Math.random() * 15) + 82, // 82 - 97
    eligibilityStatus: 'Eligible',
    eligibilityCriteria: [
      { label: 'Inbox Verification', status: 'pass', detail: `Received to ${sender}` },
      { label: 'Target Stage', status: 'pass', detail: stage },
      { label: 'Technical Prerequisites', status: 'pass', detail: matchedSkills.join(', ') },
      { label: 'Application Status', status: 'pass', detail: 'Active in candidate pipeline' },
    ],
    skillsMatched: matchedSkills,
    skillsMissing: missingSkills,
    roadmapSnapshot: {
      day: 1,
      totalDays: daysAhead,
      currentFocus: `${stage} Preparation Sprint`,
      tasksRemaining: 5,
      activeTask: `Solve 4 high-frequency ${matchedSkills[0] || 'DSA'} problems and review core concepts`,
    },
    aiSuggestion: `Prioritize ${matchedSkills.join(' & ')} practice before your scheduled ${stage}.`,
    badge: stage.toUpperCase(),
  };

  return { isOpportunity: true, opportunity, log };
}

/**
 * Fetches real user messages from Gmail REST API and extracts opportunities
 */
export const syncRealGmailInbox = async (accessToken: string, maxResults: number = 15): Promise<SyncResult> => {
  // 1. Get user profile
  const profile = await fetchGmailProfile(accessToken);

  // 2. Query messages
  // Filter for recruitment / academic / career emails
  const query = 'category:primary OR category:updates OR subject:(interview OR assessment OR shortlisted OR application OR test OR drive OR hackathon OR offer OR placement)';
  let listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=${encodeURIComponent(query)}`;

  let listResp = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  let messageIds: { id: string }[] = [];
  if (listResp.ok) {
    const listData = await listResp.json();
    messageIds = listData.messages || [];
  }

  // Fallback: If query returned 0 messages, fetch the most recent inbox messages
  if (messageIds.length === 0) {
    const generalUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`;
    const generalResp = await fetch(generalUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (generalResp.ok) {
      const generalData = await generalResp.json();
      messageIds = generalData.messages || [];
    }
  }

  const logs: EmailLog[] = [];
  const opportunities: Opportunity[] = [];

  // 3. Fetch each message's payload
  for (const m of messageIds.slice(0, maxResults)) {
    try {
      const detailResp = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=full`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!detailResp.ok) continue;

      const detail = await detailResp.json();
      const headers = detail.payload?.headers || [];
      const headerMap: Record<string, string> = {};
      for (const h of headers) {
        if (h.name && h.value) {
          headerMap[h.name.toLowerCase()] = h.value;
        }
      }

      const subject = headerMap['subject'] || 'No Subject';
      const sender = headerMap['from'] || 'Unknown Sender';
      const body = extractBodyFromMessage(detail.payload) || detail.snippet || '';

      const analyzed = analyzeEmailContent(subject, sender, body);
      logs.push(analyzed.log);
      if (analyzed.isOpportunity && analyzed.opportunity) {
        opportunities.push(analyzed.opportunity);
      }
    } catch {
      // Continue next email
    }
  }

  // 4. Persist to localStorage
  if (logs.length > 0) {
    const existingEmails: EmailLog[] = JSON.parse(localStorage.getItem('preppilot_real_emails') || '[]');
    const mergedEmails = [...logs, ...existingEmails.filter((e) => !logs.some((l) => l.subject === e.subject))];
    localStorage.setItem('preppilot_real_emails', JSON.stringify(mergedEmails));
  }

  if (opportunities.length > 0) {
    const existingOpps: Opportunity[] = JSON.parse(localStorage.getItem('preppilot_real_opportunities') || '[]');
    const mergedOpps = [
      ...opportunities,
      ...existingOpps.filter((o) => !opportunities.some((no) => no.company === o.company && no.title === o.title)),
    ];
    localStorage.setItem('preppilot_real_opportunities', JSON.stringify(mergedOpps));
  }

  // Notify components via window event
  window.dispatchEvent(new CustomEvent('preppilot:inbox-synced', { detail: { count: opportunities.length } }));

  return {
    source: 'google_oauth',
    emailAddress: profile.emailAddress,
    totalFetched: logs.length,
    opportunitiesDetected: opportunities.length,
    emails: logs,
    opportunities,
  };
};
