import mongoose, { Schema } from 'mongoose';

/**
 * A real, persisted user account. Distinct from AppState (which stores the
 * currently-active session's working data — emails, opportunities, etc).
 *
 * One document per signed-up person, looked up by (lowercased) email during
 * login/signup so returning users go straight to "log in" instead of being
 * silently re-created, and new users are asked to onboard (skills,
 * interests, preferred roles) exactly once.
 */
const UserSchema = new Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phoneNumber: { type: String },

    college: { type: String, default: '' },
    degree: { type: String, default: '' },
    branch: { type: String, default: '' },
    gradYear: { type: String, default: '' },
    skills: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    preferredRoles: { type: [String], default: [] },
    careerGoals: { type: String, default: '' },

    isOnboarded: { type: Boolean, default: false },
    isGmailConnected: { type: Boolean, default: false },
    connectedGmailAddress: { type: String },
    whatsappNumber: { type: String, default: '' },
    whatsappNotificationsEnabled: { type: Boolean, default: true },
    whatsappPreferences: {
      frequency: { type: String, default: 'daily' },
      deadlineTimings: { type: [String], default: ['7_days', '3_days', '1_day', 'on_deadline_day'] },
      notifyNewOpportunities: { type: Boolean, default: true },
      notifyApplicationDeadlines: { type: Boolean, default: true },
      notifyInterviewReminders: { type: Boolean, default: true },
    },
    notificationPreferences: {
      deadlines: { type: Boolean, default: true },
      highConfidenceOpportunities: { type: Boolean, default: true },
      prepReminders: { type: Boolean, default: true },
      mockTestReminders: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model('User', UserSchema);
