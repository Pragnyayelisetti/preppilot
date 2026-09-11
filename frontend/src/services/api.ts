import {
  UserProfile,
  Opportunity,
  PreparationPlan,
  Question,
  PrepResource,
  MockTest,
  MockTestResult,
  MockInterviewSession,
  CourseRecommendation,
  WhatsAppNotification
} from '../types';

export const api = {
  // Auth
  async signup(data: { name?: string; username?: string; email: string; password?: string; phoneNumber?: string }) {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async login(data: { email: string; username?: string; password?: string; phoneNumber?: string }) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async verifyOtp(data: { email: string; otp: string }) {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async resendOtp(email: string) {
    const res = await fetch('/api/auth/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch('/api/auth/me');
    return res.json();
  },

  async logout() {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    return res.json();
  },

  // Profile
  async getProfile(): Promise<{ profile: UserProfile }> {
    const res = await fetch('/api/profile');
    return res.json();
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<{ success: boolean; profile: UserProfile }> {
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  // Gmail & OAuth
  async getGmailStatus() {
    const res = await fetch('/api/gmail/status');
    return res.json();
  },

  async getGoogleAuthUrl() {
    const res = await fetch('/api/gmail/auth-url');
    return res.json();
  },

  // Redirects the browser to Google's real consent screen. After approval,
  // Google redirects to the backend's /api/auth/google/callback, which
  // exchanges the code for tokens and redirects back to the dashboard.
  async startRealGoogleOAuth() {
    const { authUrl, hasConfiguredClient } = await this.getGoogleAuthUrl();
    if (!hasConfiguredClient) {
      throw new Error('GOOGLE_CLIENT_ID is not set in the backend .env yet.');
    }
    window.location.href = authUrl;
  },

  async connectGmail(email?: string) {
    const res = await fetch('/api/gmail/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return res.json();
  },

  async disconnectGmail() {
    const res = await fetch('/api/gmail/disconnect', {
      method: 'POST'
    });
    return res.json();
  },

  async syncInbox() {
    const res = await fetch('/api/gmail/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  },

  async getEmails() {
    const res = await fetch('/api/gmail/emails');
    return res.json();
  },

  async processEmail(data: { emailText: string; sender?: string; subject?: string }) {
    const res = await fetch('/api/gmail/process-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Opportunities
  async getOpportunities(params?: { status?: string; type?: string }): Promise<{ opportunities: Opportunity[]; total: number; hasFoundOpportunities: boolean }> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`/api/opportunities${query ? `?${query}` : ''}`);
    return res.json();
  },

  async getOpportunity(id: string): Promise<{ opportunity: Opportunity }> {
    const res = await fetch(`/api/opportunities/${id}`);
    return res.json();
  },

  async updateOpportunityStatus(id: string, status: string) {
    const res = await fetch(`/api/opportunities/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  async getRoadmap(opportunityId: string): Promise<{ roadmap: PreparationPlan }> {
    const res = await fetch(`/api/opportunities/${opportunityId}/roadmap`);
    return res.json();
  },

  async getQuestions(opportunityId: string): Promise<{ questions: Question[]; total: number; company: string }> {
    const res = await fetch(`/api/opportunities/${opportunityId}/questions`);
    return res.json();
  },

  async getResources(opportunityId: string): Promise<{ resources: PrepResource[]; company: string }> {
    const res = await fetch(`/api/opportunities/${opportunityId}/resources`);
    return res.json();
  },

  // Mock Tests
  async getMockTests(): Promise<{ tests: any[] }> {
    const res = await fetch('/api/mock-tests');
    return res.json();
  },

  async getMockTest(id: string): Promise<{ test: MockTest }> {
    const res = await fetch(`/api/mock-tests/${id}`);
    return res.json();
  },

  async generateMockTest(data: { topic?: string; difficulty: 'Easy' | 'Medium' | 'Hard'; skillBased: boolean; skills?: string[] }): Promise<{ test: MockTest }> {
    const res = await fetch('/api/mock-tests/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async submitMockTest(id: string, answers: Record<string, number>): Promise<{ result: MockTestResult; detailedQuestions: any[] }> {
    const res = await fetch(`/api/mock-tests/${id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers })
    });
    return res.json();
  },

  // Mock Interview
  async startMockInterview(data: { track: string; company?: string; topic?: string }): Promise<{
    sessionId: string;
    currentQuestionIndex: number;
    totalQuestions: number;
    timeLimitSeconds: number;
    question: string;
    conversation: any[];
  }> {
    const res = await fetch('/api/mock-interview/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async respondMockInterview(data: {
    sessionId: string;
    answer: string;
    autoSubmittedOnTimeout?: boolean;
    metrics?: {
      answeredViaVoice: boolean;
      timeTakenSeconds: number;
      fillerWordCount: number;
      wordsPerMinute: number | null;
    };
  }): Promise<{
    completed: boolean;
    currentQuestionIndex?: number;
    totalQuestions?: number;
    timeLimitSeconds?: number;
    nextQuestion?: string;
    evaluation?: any;
    conversation: any[];
  }> {
    const res = await fetch('/api/mock-interview/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getMockInterviewHint(sessionId: string): Promise<{
    hint: string;
    hintsUsedForCurrentQuestion: number;
    maxHints: number;
  }> {
    const res = await fetch('/api/mock-interview/hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });
    return res.json();
  },

  // WhatsApp
  async getWhatsAppStatus(): Promise<{
    connected: boolean;
    phoneNumber?: string;
    preferences: any;
    notifications: WhatsAppNotification[];
  }> {
    const res = await fetch('/api/whatsapp/status');
    return res.json();
  },

  async connectWhatsApp(phoneNumber: string) {
    const res = await fetch('/api/whatsapp/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber })
    });
    return res.json();
  },

  async updateWhatsAppSettings(settings: {
    enabled: boolean;
    phoneNumber: string;
    frequency: string;
    deadlineTimings: string[];
    notifyNewOpportunities: boolean;
    notifyApplicationDeadlines: boolean;
    notifyInterviewReminders: boolean;
  }) {
    const res = await fetch('/api/whatsapp/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return res.json();
  },

  async getWhatsAppDueReminders() {
    const res = await fetch('/api/whatsapp/due-reminders');
    return res.json();
  },

  async markWhatsAppOpened(id?: string, eventId?: string) {
    const res = await fetch('/api/whatsapp/mark-opened', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, eventId })
    });
    return res.json();
  },

  async generateWhatsAppLink(data: { company?: string; role?: string; deadline?: string; daysRemaining?: number }) {
    const res = await fetch('/api/whatsapp/generate-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateWhatsAppPreferences(preferences: any) {
    const res = await fetch('/api/whatsapp/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferences })
    });
    return res.json();
  },

  async sendWhatsAppAlert(data: { title: string; message?: string; type?: string; company?: string; role?: string; deadline?: string; daysRemaining?: number }) {
    const res = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Interest-based recommendations (shown when no inbox opportunities are found)
  async getRecommendations(): Promise<{
    userGreeting: string;
    courses: CourseRecommendation[];
    recommendedSkills: any[];
    careerMilestones: any[];
    userProfileSnapshot: any;
  }> {
    const res = await fetch('/api/recommendations');
    return res.json();
  },

  // AI Assistant Chat
  async chatAssistant(message: string, history: any[] = []): Promise<{ reply: string }> {
    const res = await fetch('/api/assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history })
    });
    return res.json();
  }
};