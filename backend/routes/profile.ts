import { Router, Request, Response } from 'express';
import { appState } from '../state';
import { UserModel } from '../models/User';

export const profileRouter = Router();

// GET profile
profileRouter.get('/', (req: Request, res: Response) => {
  res.json({
    profile: appState.user
  });
});

// Fields on UserProfile that also live on the persisted User account.
// (Anything else — like OTP/session-only flags — stays appState-only.)
const PERSISTABLE_FIELDS = [
  'college', 'degree', 'branch', 'gradYear',
  'skills', 'interests', 'preferredRoles', 'careerGoals',
  'phoneNumber', 'whatsappNumber', 'whatsappNotificationsEnabled',
  'notificationPreferences',
] as const;

async function persistToAccount(updates: Record<string, any>, isOnboarded: boolean) {
  if (!appState.user.email) return;
  const setFields: Record<string, any> = { isOnboarded };
  for (const field of PERSISTABLE_FIELDS) {
    if (updates[field] !== undefined) setFields[field] = updates[field];
  }
  try {
    await UserModel.updateOne({ email: appState.user.email.toLowerCase().trim() }, { $set: setFields });
  } catch (err) {
    console.error('[profile] Failed to persist profile to account:', (err as Error).message);
  }
}

// Update profile / Complete Onboarding
profileRouter.post('/', async (req: Request, res: Response) => {
  const updates = req.body;
  const isOnboarded = updates.isOnboarded !== undefined ? updates.isOnboarded : true;

  appState.user = {
    ...appState.user,
    ...updates,
    isOnboarded
  };

  await persistToAccount(updates, isOnboarded);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    profile: appState.user
  });
});

profileRouter.put('/', async (req: Request, res: Response) => {
  const updates = req.body;

  appState.user = {
    ...appState.user,
    ...updates
  };

  await persistToAccount(updates, appState.user.isOnboarded);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    profile: appState.user
  });
});
