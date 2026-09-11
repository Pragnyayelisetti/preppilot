import { Router, Request, Response } from 'express';
import { appState } from '../state';
import { WhatsAppNotification, WhatsAppNotificationPreferences, DeadlineReminderTiming } from '../types';
import { UserModel } from '../models/User';
import mongoose from 'mongoose';

export const whatsappRouter = Router();

// In-memory set of event IDs that have already generated reminders to prevent duplicate alerts
const sentEventIds = new Set<string>();

function getCleanPhoneNumber(phone?: string): string {
  if (!phone) return '';
  // Remove all non-digit characters except leading plus
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    return cleaned.slice(1);
  }
  return cleaned;
}

function formatDeadlineDate(dateStr?: string): string {
  if (!dateStr) return 'Upcoming';
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
  } catch {
    // fallback
  }
  return dateStr;
}

function computeDaysRemaining(deadlineStr?: string): number | null {
  if (!deadlineStr) return null;
  const target = new Date(deadlineStr);
  if (isNaN(target.getTime())) return null;
  const now = new Date();
  // Normalize both to midnight UTC for clean calendar day differences
  const nowUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const targetUtc = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const diffDays = Math.ceil((targetUtc - nowUtc) / (1000 * 60 * 60 * 24));
  return diffDays;
}

function generateDueReminders(): WhatsAppNotification[] {
  const prefs = appState.user.whatsappPreferences;
  const isEnabled = prefs?.enabled ?? appState.user.whatsappNotificationsEnabled;
  const phone = prefs?.phoneNumber || appState.user.whatsappNumber || '';
  const cleanPhone = getCleanPhoneNumber(phone);

  if (!isEnabled || !cleanPhone) {
    return [];
  }

  const userFirstName = (appState.user.name || 'Pragnya').trim().split(' ')[0] || 'there';
  const newDueReminders: WhatsAppNotification[] = [];

  const deadlineTimings: DeadlineReminderTiming[] = prefs?.deadlineTimings || [
    '7_days',
    '3_days',
    '1_day',
    'on_deadline_day'
  ];
  const notifyDeadlines = prefs?.notifyApplicationDeadlines !== false;
  const notifyNewOpps = prefs?.notifyNewOpportunities !== false;
  const notifyInterviews = prefs?.notifyInterviewReminders !== false;

  for (const opp of appState.opportunities) {
    // Rule 9: If user already applied, is not interested (archived), or deadline passed, stop reminders
    if (opp.status === 'applied' || opp.status === 'archived') {
      continue;
    }

    const daysLeft = opp.daysRemaining !== undefined ? opp.daysRemaining : computeDaysRemaining(opp.deadline);
    if (daysLeft === null || daysLeft < 0) {
      // Deadline has passed
      continue;
    }

    // 1. Application Deadline Reminders
    if (notifyDeadlines) {
      let isDue = false;
      let timingTag = '';

      if (daysLeft === 7 && deadlineTimings.includes('7_days')) {
        isDue = true;
        timingTag = '7_days';
      } else if (daysLeft === 3 && deadlineTimings.includes('3_days')) {
        isDue = true;
        timingTag = '3_days';
      } else if (daysLeft === 1 && deadlineTimings.includes('1_day')) {
        isDue = true;
        timingTag = '1_day';
      } else if (daysLeft === 0 && deadlineTimings.includes('on_deadline_day')) {
        isDue = true;
        timingTag = 'on_deadline_day';
      }

      if (isDue) {
        const eventId = `opp_${opp.id}_deadline_${timingTag}`;
        if (!sentEventIds.has(eventId)) {
          const daysText = daysLeft === 0 ? 'only today' : `${daysLeft} day${daysLeft > 1 ? 's' : ''}`;
          const formattedDeadline = formatDeadlineDate(opp.deadline);

          const messageText = `Hi ${userFirstName} 👋\n\n⏰ Your application deadline is approaching!\n\nCompany: ${opp.company}\nRole: ${opp.title}\nDeadline: ${formattedDeadline}\n\nYou have ${daysText} left to apply. 🚀`;
          const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;

          const notif: WhatsAppNotification = {
            id: 'wa-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
            title: `Deadline Approaching: ${opp.company}`,
            message: messageText,
            timestamp: 'Due now',
            type: 'deadline',
            read: false,
            waLink,
            opportunityId: opp.id,
            eventId,
            status: 'pending'
          };

          sentEventIds.add(eventId);
          newDueReminders.push(notif);
        }
      }
    }

    // 2. New Matching Opportunities Reminders
    if (notifyNewOpps && opp.status === 'discovered') {
      const eventId = `opp_${opp.id}_new_matching`;
      if (!sentEventIds.has(eventId)) {
        const messageText = `Hi ${userFirstName} 👋\n\n🎯 New matching opportunity discovered!\n\nCompany: ${opp.company}\nRole: ${opp.title}\nMatch Score: ${opp.confidenceScore || 92}%\nDeadline: ${formatDeadlineDate(opp.deadline)}\n\nReview your preparation roadmap on PrepPilot and apply before slots close. 🚀`;
        const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;

        const notif: WhatsAppNotification = {
          id: 'wa-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
          title: `New Opportunity: ${opp.company}`,
          message: messageText,
          timestamp: 'Just now',
          type: 'opportunity',
          read: false,
          waLink,
          opportunityId: opp.id,
          eventId,
          status: 'pending'
        };

        sentEventIds.add(eventId);
        newDueReminders.push(notif);
      }
    }

    // 3. Interview Reminders
    if (notifyInterviews && (opp.status === 'preparing' || opp.status === 'interviewing')) {
      const upcomingInterview = opp.importantDates?.find(d => d.type === 'interview' && d.status === 'approaching');
      if (upcomingInterview) {
        const eventId = `opp_${opp.id}_interview_${upcomingInterview.id}`;
        if (!sentEventIds.has(eventId)) {
          const messageText = `Hi ${userFirstName} 👋\n\n💼 Upcoming interview round reminder!\n\nCompany: ${opp.company}\nRole: ${opp.title}\nRound: ${upcomingInterview.title}\nDate: ${formatDeadlineDate(upcomingInterview.date)}\n\nAce your round! Practice a live timed mock interview on PrepPilot today. 🚀`;
          const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;

          const notif: WhatsAppNotification = {
            id: 'wa-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
            title: `Interview Round: ${opp.company}`,
            message: messageText,
            timestamp: 'Upcoming',
            type: 'interview',
            read: false,
            waLink,
            opportunityId: opp.id,
            eventId,
            status: 'pending'
          };

          sentEventIds.add(eventId);
          newDueReminders.push(notif);
        }
      }
    }
  }

  // Prepend newly generated reminders into session notifications
  if (newDueReminders.length > 0) {
    appState.notifications = [...newDueReminders, ...appState.notifications];
  }

  return newDueReminders;
}

// GET WhatsApp status & settings
whatsappRouter.get('/status', (req: Request, res: Response) => {
  const prefs = appState.user.whatsappPreferences || {
    enabled: appState.user.whatsappNotificationsEnabled !== false,
    phoneNumber: appState.user.whatsappNumber || '',
    frequency: 'daily',
    deadlineTimings: ['7_days', '3_days', '1_day', 'on_deadline_day'],
    notifyNewOpportunities: true,
    notifyApplicationDeadlines: true,
    notifyInterviewReminders: true,
  };

  generateDueReminders();

  res.json({
    connected: prefs.enabled,
    phoneNumber: prefs.phoneNumber,
    preferences: prefs,
    notifications: appState.notifications,
  });
});

// Update WhatsApp Notification Settings
whatsappRouter.post('/settings', async (req: Request, res: Response) => {
  const {
    enabled,
    phoneNumber,
    frequency,
    deadlineTimings,
    notifyNewOpportunities,
    notifyApplicationDeadlines,
    notifyInterviewReminders,
  } = req.body;

  const currentPrefs = appState.user.whatsappPreferences || {
    enabled: true,
    phoneNumber: appState.user.whatsappNumber || '',
    frequency: 'daily',
    deadlineTimings: ['7_days', '3_days', '1_day', 'on_deadline_day'],
    notifyNewOpportunities: true,
    notifyApplicationDeadlines: true,
    notifyInterviewReminders: true,
  };

  const updatedPrefs: WhatsAppNotificationPreferences = {
    enabled: typeof enabled === 'boolean' ? enabled : currentPrefs.enabled,
    phoneNumber: typeof phoneNumber === 'string' ? phoneNumber.trim() : currentPrefs.phoneNumber,
    frequency: frequency || currentPrefs.frequency || 'daily',
    deadlineTimings: Array.isArray(deadlineTimings) ? deadlineTimings : currentPrefs.deadlineTimings,
    notifyNewOpportunities: typeof notifyNewOpportunities === 'boolean' ? notifyNewOpportunities : currentPrefs.notifyNewOpportunities,
    notifyApplicationDeadlines: typeof notifyApplicationDeadlines === 'boolean' ? notifyApplicationDeadlines : currentPrefs.notifyApplicationDeadlines,
    notifyInterviewReminders: typeof notifyInterviewReminders === 'boolean' ? notifyInterviewReminders : currentPrefs.notifyInterviewReminders,
    deadlines: typeof notifyApplicationDeadlines === 'boolean' ? notifyApplicationDeadlines : true,
    highConfidenceOpportunities: typeof notifyNewOpportunities === 'boolean' ? notifyNewOpportunities : true,
  };

  appState.user.whatsappPreferences = updatedPrefs;
  appState.user.whatsappNumber = updatedPrefs.phoneNumber;
  appState.user.whatsappNotificationsEnabled = updatedPrefs.enabled;

  // Persist to MongoDB if connected
  if (mongoose.connection.readyState === 1 && appState.user.email) {
    try {
      await UserModel.updateOne(
        { email: appState.user.email.toLowerCase().trim() },
        {
          whatsappNumber: updatedPrefs.phoneNumber,
          whatsappNotificationsEnabled: updatedPrefs.enabled,
          whatsappPreferences: updatedPrefs,
        }
      );
    } catch (err) {
      console.warn('Failed saving WhatsApp preferences to DB:', err);
    }
  }

  // Refresh due reminders with new preferences
  generateDueReminders();

  res.json({
    success: true,
    message: 'WhatsApp Notification Settings updated successfully ✓',
    preferences: updatedPrefs,
    phoneNumber: updatedPrefs.phoneNumber,
    connected: updatedPrefs.enabled,
  });
});

// GET Due Reminders
whatsappRouter.get('/due-reminders', (req: Request, res: Response) => {
  generateDueReminders();
  res.json({
    success: true,
    reminders: appState.notifications,
  });
});

// Mark reminder as opened
whatsappRouter.post('/mark-opened', (req: Request, res: Response) => {
  const { id, eventId } = req.body;
  const notif = appState.notifications.find(n => n.id === id || (eventId && n.eventId === eventId));
  if (notif) {
    notif.read = true;
    notif.status = 'opened';
  }
  res.json({ success: true, notification: notif });
});

// Generate sample WhatsApp link for a company opportunity
whatsappRouter.post('/generate-link', (req: Request, res: Response) => {
  const { company, role, deadline, daysRemaining } = req.body;
  const phone = appState.user.whatsappPreferences?.phoneNumber || appState.user.whatsappNumber || '';
  const cleanPhone = getCleanPhoneNumber(phone);
  const userFirstName = (appState.user.name || 'Pragnya').trim().split(' ')[0] || 'there';

  const daysText = daysRemaining === 0 ? 'only today' : `${daysRemaining || 3} days`;
  const messageText = `Hi ${userFirstName} 👋\n\n⏰ Your application deadline is approaching!\n\nCompany: ${company || 'Microsoft'}\nRole: ${role || 'Software Engineer Intern'}\nDeadline: ${deadline || 'September 15'}\n\nYou have ${daysText} left to apply. 🚀`;

  const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;

  res.json({
    success: true,
    message: messageText,
    waLink,
    phoneNumber: phone,
  });
});

// Connect phone number (backward compatible)
whatsappRouter.post('/connect', (req: Request, res: Response) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  appState.user.whatsappNumber = phoneNumber;
  appState.user.whatsappNotificationsEnabled = true;
  if (appState.user.whatsappPreferences) {
    appState.user.whatsappPreferences.phoneNumber = phoneNumber;
    appState.user.whatsappPreferences.enabled = true;
  }

  res.json({
    success: true,
    message: 'WhatsApp Connected ✓',
    phoneNumber,
    connected: true,
  });
});

// Update preferences (backward compatible)
whatsappRouter.post('/preferences', (req: Request, res: Response) => {
  const { preferences } = req.body;
  if (preferences) {
    appState.user.notificationPreferences = {
      ...appState.user.notificationPreferences,
      ...preferences,
    };
  }

  res.json({
    success: true,
    message: 'Notification preferences saved',
    preferences: appState.user.notificationPreferences,
  });
});

// Trigger click-to-chat reminder (generates wa.me link instead of auto-sending)
whatsappRouter.post('/send', (req: Request, res: Response) => {
  const { title, message, type = 'deadline', company, role, deadline, daysRemaining } = req.body;
  const phone = appState.user.whatsappPreferences?.phoneNumber || appState.user.whatsappNumber || '';
  const cleanPhone = getCleanPhoneNumber(phone);
  const userFirstName = (appState.user.name || 'Pragnya').trim().split(' ')[0] || 'there';

  const messageText = message || `Hi ${userFirstName} 👋\n\n⏰ Your application deadline is approaching!\n\nCompany: ${company || 'Microsoft'}\nRole: ${role || 'Software Engineer Intern'}\nDeadline: ${deadline || 'September 15'}\n\nYou have ${daysRemaining || 3} days left to apply. 🚀`;

  const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;

  const newNotif: WhatsAppNotification = {
    id: 'wa-' + Date.now(),
    title: title || `Deadline Alert: ${company || 'Career Opportunity'}`,
    message: messageText,
    timestamp: 'Just now',
    type: type as any,
    read: false,
    waLink,
    status: 'pending',
  };

  appState.notifications.unshift(newNotif);

  res.json({
    success: true,
    message: `WhatsApp reminder prepared with click-to-chat link!`,
    notification: newNotif,
    waLink,
  });
});
