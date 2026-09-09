import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { OtpVerification } from './OtpVerification';
import { Sparkles, ArrowRight, ShieldCheck, Mail, Lock, User, Phone } from 'lucide-react';

interface AuthModalProps {
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const { signup, login, verifyOtp, resendOtp, pendingEmailForOtp, setPendingEmailForOtp } = useAuth();
  const [tab, setTab] = useState<'signup' | 'login'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (tab === 'signup' && !username.trim()) {
      setErrorMsg('Please enter your username');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    if (tab === 'signup' && !phoneNumber.trim()) {
      setErrorMsg('Please enter your phone number');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      if (tab === 'signup') {
        const res = await signup(username, email, password, phoneNumber);
        if (!res.success) {
          setErrorMsg(res.message);
        }
      } else {
        const res = await login(email, password, username, phoneNumber);
        if (!res.success) {
          setErrorMsg(res.message);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If waiting for OTP verification
  if (pendingEmailForOtp) {
    return (
      <div className="py-8 animate-fade-in">
        <OtpVerification
          email={pendingEmailForOtp}
          onVerify={async (otp) => {
            const res = await verifyOtp(pendingEmailForOtp, otp);
            if (res.success && onSuccess) {
              onSuccess();
            }
            return res;
          }}
          onResend={() => resendOtp(pendingEmailForOtp)}
          onChangeEmail={() => setPendingEmailForOtp(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-6 animate-fade-in">
      {/* Brand Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PrepPilot Career Copilot</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {tab === 'signup' ? 'Create your account' : 'Welcome to PrepPilot'}
        </h1>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Sign in with your credentials. We will dispatch an OTP to verify your email.
        </p>
      </div>

      {/* Toggle Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-xl">
        <button
          type="button"
          onClick={() => {
            setTab('login');
            setErrorMsg(null);
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            tab === 'login'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Log In
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('signup');
            setErrorMsg(null);
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            tab === 'signup'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Sign Up
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* Auth Form with Username, Email, Phone Number, Password */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Username — signup only */}
        {tab === 'signup' && (
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>
        )}

        {/* Email Address */}
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">An OTP verification code will be sent to this email</p>
        </div>

        {/* Phone Number — signup only */}
        {tab === 'signup' && (
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="tel"
                required
                placeholder="Your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>
        )}

        {/* Password */}
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
        >
          <span>
            {loading
              ? 'Sending OTP...'
              : tab === 'login'
              ? 'Send OTP to Email & Log In'
              : 'Send OTP to Email & Register'}
          </span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
