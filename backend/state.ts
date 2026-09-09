import { UserProfile, Opportunity, WhatsAppNotification } from './types';
import { SyncedEmail } from './data';
import { AppStateModel } from './models/AppState';

export interface AppState {
  user: UserProfile;
  otpStore: Record<string, string>; // email -> otp
  emails: SyncedEmail[];
  opportunities: Opportunity[];
  notifications: WhatsAppNotification[];
  lastSyncedAt: string | null;
  interviewSessions: Record<string, any>;
  generatedTests: Record<string, any>; // dynamically generated mock tests, keyed by test id
  hasFoundOpportunities: boolean;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  googleTokenExpiresAt?: number; // epoch ms
}

// Fresh-account defaults — NO demo/mock data. Everything below starts
// empty and only fills up once the user actually connects Gmail and we
// sync + extract real opportunities from their real inbox (see
// routes/gmail.ts: /connect, /sync, and the /google/callback OAuth flow
// in routes/auth.ts).
export const appState: AppState = {
  user: {
    id: 'usr_demo_101',
    name: 'Pragnya Yelisetti',
    username: 'pragnyayelisetti',
    email: 'pragnyayelisetti@gmail.com',
    phoneNumber: '+1 (555) 349-2819',
    college: 'International Institute of Information Technology',
    degree: 'B.Tech',
    branch: 'Computer Science & Engineering',
    gradYear: '2027',
    skills: ['C++', 'Python', 'Java', 'React', 'SQL', 'DSA', 'Machine Learning'],
    interests: ['Software Development', 'AI/ML', 'Cloud Architecture'],
    preferredRoles: ['Software Development Engineer', 'Backend Engineer', 'AI/ML Engineer'],
    careerGoals: 'Secure a top-tier software engineering internship at Google, Amazon, or high-growth tech firms and crack algorithmic coding rounds.',
    isEmailVerified: false,
    isOnboarded: true,
    isGmailConnected: false,
    connectedGmailAddress: undefined,
    whatsappNumber: '+1 (555) 349-2819',
    whatsappNotificationsEnabled: true,
    notificationPreferences: {
      deadlines: true,
      highConfidenceOpportunities: true,
      prepReminders: true,
      mockTestReminders: true
    }
  },
  otpStore: {
    'pragnyayelisetti@gmail.com': '123456'
  },
  emails: [],
  opportunities: [],
  notifications: [],
  lastSyncedAt: null,
  interviewSessions: {},
  generatedTests: {},
  hasFoundOpportunities: false
};

const STATE_KEY = 'singleton';

/**
 * Loads persisted state from MongoDB into the in-memory `appState`.
 * If nothing is saved yet (first run), it seeds the DB with the
 * default appState defined above. Call this once, after connectDB(),
 * before the server starts accepting requests.
 */
export async function loadStateFromDB(): Promise<void> {
  const existing = await AppStateModel.findOne({ key: STATE_KEY }).lean();

  if (existing && existing.data) {
    Object.assign(appState, existing.data);
    console.log('[state] Loaded saved state from MongoDB');
  } else {
    await AppStateModel.create({ key: STATE_KEY, data: appState });
    console.log('[state] No saved state found — seeded MongoDB with initial data');
  }
}

/**
 * Persists the current in-memory `appState` to MongoDB.
 * Called automatically after every request in server.ts, so any route
 * that mutates appState gets saved without needing route-level changes.
 */
export async function saveStateToDB(): Promise<void> {
  try {
    await AppStateModel.updateOne(
      { key: STATE_KEY },
      { $set: { data: appState } },
      { upsert: true }
    );
  } catch (err) {
    console.error('[state] Failed to save state to MongoDB:', (err as Error).message);
  }
}