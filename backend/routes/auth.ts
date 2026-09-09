import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { appState } from '../state';
import { UserModel } from '../models/User';
import { sendOtpEmail } from '../services/emailService';
import { exchangeCodeForTokens, fetchGmailProfile } from '../services/gmailApiService';

export const authRouter = Router();

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
    whatsappNumber: userDoc.whatsappNumber,
    whatsappNotificationsEnabled: userDoc.whatsappNotificationsEnabled,
    notificationPreferences: userDoc.notificationPreferences,
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
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (error) {
    return res.redirect(`${frontendUrl}/dashboard?gmail_error=${encodeURIComponent(String(error))}`);
  }
  if (!code || typeof code !== 'string') {
    return res.redirect(`${frontendUrl}/dashboard?gmail_error=missing_code`);
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

    return res.redirect(`${frontendUrl}/dashboard?gmail_connected=true`);
  } catch (err: any) {
    console.error('[Google OAuth] Callback failed:', err.message);
    return res.redirect(`${frontendUrl}/dashboard?gmail_error=${encodeURIComponent(err.message)}`);
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

  const existing = await UserModel.findOne({ email: cleanEmail });
  if (existing) {
    return fail(res, 409, 'An account with this email already exists. Please log in instead.');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await UserModel.create({
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
    message: `Verification code sent to ${cleanEmail}`,
    email: cleanEmail,
    isNewUser: true,
    deliveryMethod: emailResult.method,
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

  const userDoc = await UserModel.findOne({ email: cleanEmail });
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
    message: `Verification code sent to ${cleanEmail}`,
    email: cleanEmail,
    requiresOtp: true,
    deliveryMethod: emailResult.method,
  });
});

// Verify OTP — the ONLY code that's ever accepted is the one actually
// generated and emailed for this address. No hardcoded backdoor code.
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

  const userDoc = await UserModel.findOne({ email: cleanEmail });
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

  const userDoc = await UserModel.findOne({ email: cleanEmail });
  if (!userDoc) {
    return fail(res, 404, 'No account found with this email.');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  appState.otpStore[cleanEmail] = otp;

  const emailResult = await sendOtpEmail(cleanEmail, otp, userDoc.username);

  res.json({
    success: true,
    message: `New 6-digit verification code sent to ${cleanEmail}`,
    deliveryMethod: emailResult.method,
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
