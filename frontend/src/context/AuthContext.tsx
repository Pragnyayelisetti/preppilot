import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  hasOpportunities: boolean;
  setHasOpportunities: (val: boolean) => void;
  pendingEmailForOtp: string | null;
  setPendingEmailForOtp: (email: string | null) => void;
  latestDebugOtp: string | null;
  signup: (name: string, email: string, password?: string, phoneNumber?: string) => Promise<{ success: boolean; message: string; debugOtp?: string }>;
  login: (email: string, password?: string, username?: string, phoneNumber?: string) => Promise<{ success: boolean; requiresOtp?: boolean; message: string; debugOtp?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; message: string }>;
  resendOtp: (email: string) => Promise<{ success: boolean; message: string; debugOtp?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  connectGmail: (email?: string) => Promise<void>;
  disconnectGmail: () => Promise<void>;
  syncInbox: () => Promise<{ count: number; hasOpportunities: boolean; message: string }>;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasOpportunities, setHasOpportunities] = useState(true);
  const [pendingEmailForOtp, setPendingEmailForOtp] = useState<string | null>(null);

  const [latestDebugOtp, setLatestDebugOtp] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      const data = await api.getMe();
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('preppilot_active_user', JSON.stringify(data.user));
      }
      const gStatus = await api.getGmailStatus();
      if (gStatus) {
        setHasOpportunities(gStatus.hasFoundOpportunities !== false);
      }
    } catch (err) {
      console.error('Failed fetching user info:', err);
    }
  };

  // Restore authenticated session across reloads and Google OAuth redirects
  useEffect(() => {
    const initSession = async () => {
      const saved = localStorage.getItem('preppilot_active_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setUser(parsed);
        } catch {
          // ignore parsing errors
        }
      }

      // Check if redirected from Google OAuth
      const urlParams = new URLSearchParams(window.location.search);
      const isFromGoogle = urlParams.has('gmail_connected') || urlParams.has('gmail_error');

      try {
        const data = await api.getMe();
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem('preppilot_active_user', JSON.stringify(data.user));
        }
        const gStatus = await api.getGmailStatus();
        if (gStatus) {
          setHasOpportunities(gStatus.hasFoundOpportunities !== false);
        }
      } catch (err) {
        console.warn('Session verification fallback:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, []);

  const signup = async (name: string, email: string, password?: string, phoneNumber?: string) => {
    const res = await api.signup({ name, username: name, email, password, phoneNumber });
    if (res.success) {
      setPendingEmailForOtp(email);
      if (res.debugOtp) {
        setLatestDebugOtp(res.debugOtp);
      }
    }
    return res;
  };

  const login = async (email: string, password?: string, username?: string, phoneNumber?: string) => {
    const res = await api.login({ email, password, username, phoneNumber });
    if (res.success) {
      setPendingEmailForOtp(email);
      if (res.debugOtp) {
        setLatestDebugOtp(res.debugOtp);
      }
    }
    return res;
  };

  const verifyOtp = async (email: string, otp: string) => {
    const res = await api.verifyOtp({ email, otp });
    if (res.success && res.user) {
      setUser(res.user);
      localStorage.setItem('preppilot_active_user', JSON.stringify(res.user));
      setPendingEmailForOtp(null);
      setLatestDebugOtp(null);
    }
    return res;
  };

  const resendOtp = async (email: string) => {
    const res = await api.resendOtp(email);
    if (res.success && res.debugOtp) {
      setLatestDebugOtp(res.debugOtp);
    }
    return res;
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const res = await api.updateProfile(updates);
    if (res.success && res.profile) {
      setUser(res.profile);
      localStorage.setItem('preppilot_active_user', JSON.stringify(res.profile));
    }
  };

  const connectGmail = async (email?: string) => {
    const res = await api.connectGmail(email);
    if (res.success) {
      await fetchUserData();
    }
  };

  const disconnectGmail = async () => {
    const res = await api.disconnectGmail();
    if (res.success) {
      await fetchUserData();
    }
  };

  const syncInbox = async () => {
    const res = await api.syncInbox();
    setHasOpportunities(res.hasFoundOpportunities);
    return {
      count: res.opportunitiesFound || 0,
      hasOpportunities: res.hasFoundOpportunities,
      message: res.message
    };
  };

  const refreshUser = async () => {
    await fetchUserData();
  };

  const logout = () => {
    api.logout().catch(() => {});
    localStorage.removeItem('preppilot_active_user');
    setUser(null);
    setPendingEmailForOtp(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        hasOpportunities,
        setHasOpportunities,
        pendingEmailForOtp,
        setPendingEmailForOtp,
        latestDebugOtp,
        signup,
        login,
        verifyOtp,
        resendOtp,
        updateProfile,
        connectGmail,
        disconnectGmail,
        syncInbox,
        refreshUser,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};