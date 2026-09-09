import { Router, Request, Response } from 'express';
import { appState } from '../state';
import { WhatsAppNotification } from '../types';

export const whatsappRouter = Router();

// GET WhatsApp status & notifications
whatsappRouter.get('/status', (req: Request, res: Response) => {
  res.json({
    connected: appState.user.whatsappNotificationsEnabled,
    phoneNumber: appState.user.whatsappNumber,
    preferences: appState.user.notificationPreferences,
    notifications: appState.notifications
  });
});

// Update phone number & connection
whatsappRouter.post('/connect', (req: Request, res: Response) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  appState.user.whatsappNumber = phoneNumber;
  appState.user.whatsappNotificationsEnabled = true;

  res.json({
    success: true,
    message: 'WhatsApp Connected ✓',
    phoneNumber,
    connected: true
  });
});

// Update preferences
whatsappRouter.post('/preferences', (req: Request, res: Response) => {
  const { preferences } = req.body;
  if (preferences) {
    appState.user.notificationPreferences = {
      ...appState.user.notificationPreferences,
      ...preferences
    };
  }

  res.json({
    success: true,
    message: 'Notification preferences saved',
    preferences: appState.user.notificationPreferences
  });
});

// Send notification / test message
whatsappRouter.post('/send', (req: Request, res: Response) => {
  const { title, message, type = 'deadline' } = req.body;

  const newNotif: WhatsAppNotification = {
    id: 'wa-' + Date.now(),
    title: title || 'Career Opportunity Alert',
    message: message || 'Important deadline reminder from PrepPilot.',
    timestamp: 'Just now',
    type: type as any,
    read: false
  };

  appState.notifications.unshift(newNotif);

  console.log(`[PrepPilot WhatsApp Dispatch] Dispatched to ${appState.user.whatsappNumber}: ${newNotif.message}`);

  res.json({
    success: true,
    message: `WhatsApp notification successfully dispatched to ${appState.user.whatsappNumber || 'your phone'}!`,
    notification: newNotif
  });
});

// Notification preview endpoint
whatsappRouter.get('/preview', (req: Request, res: Response) => {
  const samplePreviews = [
    {
      title: 'Google SDE Internship',
      message: 'Google Software Engineering Internship closes in 12 days. Your profile has a 96% match. Tap to review preparation roadmap: https://preppilot.dev/opp/google-sde-2026',
      type: 'deadline'
    },
    {
      title: 'Amazon SDE-1 Campus Drive',
      message: 'Amazon OA window opens September 29. Take the timed Amazon Mock Assessment on PrepPilot to test your score.',
      type: 'prep'
    }
  ];

  res.json({ previews: samplePreviews });
});
