import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { appState } from '../state';
import { UserModel } from '../models/User';
import { sendOtpEmail } from '../services/emailService';
import { exchangeCodeForTokens, fetchGmailProfile } from '../services/gmailApiService';

export const authRouter = Router();

// In-memory fallback accounts for when MongoDB is not connected
const inMemoryUsers = new Map<string, any>();

// Seed default user account
(async () => {
  const defaultHash = await bcrypt.hash('password123', 10);
  inMemoryUsers.set('pragnyayelisetti@gmail.com', {
    _id: 'usr_demo_101',
    username: 'Pragnya Yelisetti',
    email: 'pragnyayelisetti@gmail.com',
    passwordHash: defaultHash,
    phoneNumber: '+1 (555) 349-2819',
    college: 'International Institute of Information Technology',
    degree: 'B.Tech',
    branch: 'Computer Science & Engineering',
    gradYear: '2027',
    skills: ['C++', 'Python', 'Java', 'React', 'SQL', 'DSA', 'Machine Learning'],
    interests: ['Software Development', 'AI/ML', 'Cloud Architecture'],
    preferredRoles: ['Software Development Engineer', 'Backend Engineer', 'AI/ML Engineer'],
    careerGoals: 'Secure a top-tier software engineering internship at Google, Amazon, or high-growth tech firms.',
    isOnboarded: true,
    isGmailConnected: false,
    whatsappNumber: '+1 (555) 349-2819',
    whatsappNotificationsEnabled: true,
    notificationPreferences: {
      deadlines: true,
      highConfidenceOpportunities: true,
      prepReminders: true,
      mockTestReminders: true,
    },
  });
})();

async function findUserByEmail(email: string) {
  if (mongoose.connection.readyState === 1) {
    try {
      const doc = await UserModel.findOne({ email });
      if (doc) return doc;
    } catch {
      // fallback
    }
  }
  return inMemoryUsers.get(email) || null;
}

async function createUserAccount(data: any) {
  if (mongoose.connection.readyState === 1) {
    try {
      return await UserModel.create(data);
    } catch {
      // fallback
    }
  }
  const user = { _id: 'usr_' + Date.now(), ...data, isOnboarded: false };
  inMemoryUsers.set(data.email, user);
  return user;
}

// Copies a persisted User document into the shape the rest of the app
// (appState.user / UserProfile) expects, and makes it the active session.
function loadUserIntoSession(userDoc: any) {
  appState.user = {
    id: String(userDoc._id),
    name: userDoc.username,
    username: userDoc.username,
    email: userDoc.email,
    phoneNumber: userDoc.phoneNumber,
    college: userDoc.college || '',
    degree: userDoc.degree || '',
    branch: userDoc.branch || '',
    gradYear: userDoc.gradYear || '',
    skills: userDoc.skills || [],
    interests: userDoc.interests || [],
    preferredRoles: userDoc.preferredRoles || [],
    careerGoals: userDoc.careerGoals || '',
    isEmailVerified: true,
    isOnboarded: userDoc.isOnboarded,
    isGmailConnected: userDoc.isGmailConnected,
    connectedGmailAddress: userDoc.connectedGmailAddress,
    whatsappNumber: userDoc.whatsappNumber || '',
    whatsappNotificationsEnabled: userDoc.whatsappNotificationsEnabled !== false,
    whatsappPreferences: userDoc.whatsappPreferences || {
      enabled: userDoc.whatsappNotificationsEnabled !== false,
      phoneNumber: userDoc.whatsappNumber || '',
      frequency: 'daily',
      deadlineTimings: ['7_days', '3_days', '1_day', 'on_deadline_day'],
      notifyNewOpportunities: true,
      notifyApplicationDeadlines: true,
      notifyInterviewReminders: true,
    },
    notificationPreferences: userDoc.notificationPreferences || {
      deadlines: true,
      highConfidenceOpportunities: true,
      prepReminders: true,
      mockTestReminders: true,
    },
  } as any;
}

// Small helper so the frontend (which reads `.message` for errors) and any
// caller reading `.error` both get the same text.
function fail(res: Response, status: number, msg: string) {
  return res.status(status).json({ success: false, error: msg, message: msg });
}

// Google OAuth callback — this is where Google redirects back to after the
// user approves (or denies) Gmail read access.
authRouter.get('/google/callback', async (req: Request, res: Response) => {
  const { code, error } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || '';

  if (error) {
    return res.redirect(`${frontendUrl}/?gmail_error=${encodeURIComponent(String(error))}`);
  }
  if (!code || typeof code !== 'string') {
    return res.redirect(`${frontendUrl}/?gmail_error=missing_code`);
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    appState.googleAccessToken = tokens.access_token;
    if (tokens.refresh_token) {
      appState.googleRefreshToken = tokens.refresh_token;
    }
    appState.googleTokenExpiresAt = Date.now() + tokens.expires_in * 1000;

    const profile = await fetchGmailProfile();
    appState.user.isGmailConnected = true;
    appState.user.connectedGmailAddress = profile.emailAddress;

    return res.redirect(`${frontendUrl}/?gmail_connected=true`);
  } catch (err: any) {
    console.error('[Google OAuth] Callback failed:', err.message);
    return res.redirect(`${frontendUrl}/?gmail_error=${encodeURIComponent(err.message)}`);
  }
});

// Signup — creates a brand-new account. Fails if the email is already
// registered (that person should log in instead).
authRouter.post('/signup', async (req: Request, res: Response) => {
  const { name, username, email, password, phoneNumber, phone } = req.body;
  const targetName = username || name;

  if (!email || !targetName || !password) {
    return fail(res, 400, 'Username, email and password are required');
  }

  const cleanEmail = email.toLowerCase().trim();

  const existing = await findUserByEmail(cleanEmail);
  if (existing) {
    return fail(res, 409, 'An account with this email already exists. Please log in instead.');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await createUserAccount({
    username: targetName,
    email: cleanEmail,
    passwordHash,
    phoneNumber: phoneNumber || phone,
  });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  appState.otpStore[cleanEmail] = otp;

  const emailResult = await sendOtpEmail(cleanEmail, otp, targetName);

  res.json({
    success: true,
    message: emailResult.method === 'console-logger'
      ? `Verification code: ${otp} (Demo Preview Mode)`
      : `Verification code sent to ${cleanEmail}`,
    email: cleanEmail,
    isNewUser: true,
    deliveryMethod: emailResult.method,
    debugOtp: otp,
  });
});

// Login — only succeeds for an email that already has an account, and only
// if the password matches it.
authRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return fail(res, 400, 'Email and password are required');
  }

  const cleanEmail = email.toLowerCase().trim();

  const userDoc = await findUserByEmail(cleanEmail);
  if (!userDoc) {
    return fail(res, 404, 'No account found with this email. Please sign up first.');
  }

  const passwordMatches = await bcrypt.compare(password, userDoc.passwordHash);
  if (!passwordMatches) {
    return fail(res, 401, 'Incorrect password. Please try again.');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  appState.otpStore[cleanEmail] = otp;

  const emailResult = await sendOtpEmail(cleanEmail, otp, userDoc.username);

  res.json({
    success: true,
    message: emailResult.method === 'console-logger'
      ? `Verification code: ${otp} (Demo Preview Mode)`
      : `Verification code sent to ${cleanEmail}`,
    email: cleanEmail,
    requiresOtp: true,
    deliveryMethod: emailResult.method,
    debugOtp: otp,
  });
});

// Verify OTP
authRouter.post('/verify-otp', async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return fail(res, 400, 'Email and verification code are required');
  }

  const cleanEmail = email.toLowerCase().trim();
  const expectedOtp = appState.otpStore[cleanEmail];

  if (!expectedOtp || otp !== expectedOtp) {
    return fail(res, 400, 'Invalid OTP. Please check the code sent to your email and try again.');
  }

  delete appState.otpStore[cleanEmail];

  const userDoc = await findUserByEmail(cleanEmail);
  if (!userDoc) {
    return fail(res, 404, 'Account not found. Please sign up again.');
  }

  loadUserIntoSession(userDoc);

  res.json({
    success: true,
    message: 'Email verified successfully! Welcome to PrepPilot.',
    user: appState.user,
    token: 'jwt_mock_token_' + Date.now(),
  });
});

// Resend OTP
authRouter.post('/resend-otp', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return fail(res, 400, 'Email is required');
  }
  const cleanEmail = email.toLowerCase().trim();

  const userDoc = await findUserByEmail(cleanEmail);
  if (!userDoc) {
    return fail(res, 404, 'No account found with this email.');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  appState.otpStore[cleanEmail] = otp;

  const emailResult = await sendOtpEmail(cleanEmail, otp, userDoc.username);

  res.json({
    success: true,
    message: emailResult.method === 'console-logger'
      ? `New verification code: ${otp} (Demo Preview Mode)`
      : `New 6-digit verification code sent to ${cleanEmail}`,
    deliveryMethod: emailResult.method,
    debugOtp: otp,
  });
});

// Get Current User
authRouter.get('/me', (req: Request, res: Response) => {
  if (!appState.user.isEmailVerified) {
    return res.json({ user: null });
  }
  res.json({
    user: appState.user
  });
});

// Logout
authRouter.post('/logout', (req: Request, res: Response) => {
  appState.user.isEmailVerified = false;
  res.json({
    success: true,
    message: 'Signed out successfully'
  });
});
