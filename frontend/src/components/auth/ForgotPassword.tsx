import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { KeyRound, ArrowLeft, Mail, Lock, CheckCircle2 } from 'lucide-react';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
  const { forgotPassword, resetPassword } = useAuth();

  const [step, setStep] = useState<'email' | 'reset' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      const res = await forgotPassword(email.trim().toLowerCase());
      if (res.success) {
        setInfoMsg(res.message);
        setStep('reset');
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (otp.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit code sent to your email');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await resetPassword(email.trim().toLowerCase(), otp.trim(), newPassword);
      if (res.success) {
        setStep('done');
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'done') {
    return (
      <div className="max-w-md w-full mx-auto bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-6 text-center animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Password reset!</h2>
          <p className="text-xs text-slate-500 mt-1">
            Your password has been updated. You can now log in with your new password.
          </p>
        </div>
        <button
          onClick={onBackToLogin}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
        >
          Back to Log In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-6 animate-fade-in">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto mb-2">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">
          {step === 'email' ? 'Forgot your password?' : 'Reset your password'}
        </h1>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          {step === 'email'
            ? 'Enter your registered email and we will send a 6-digit reset code.'
            : `Enter the code sent to ${email} and choose a new password.`}
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
          {errorMsg}
        </div>
      )}
      {infoMsg && step === 'reset' && (
        <div className="p-3 bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-xl">
          {infoMsg}
        </div>
      )}

      {step === 'email' ? (
        <form onSubmit={handleRequestOtp} className="space-y-3.5">
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            {loading ? 'Sending code...' : 'Send Reset Code'}
          </button>

          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 pt-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Log In</span>
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              6-Digit Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-3 py-2.5 text-center tracking-[0.4em] font-bold text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-900"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>

          <button
            type="button"
            onClick={() => setStep('email')}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 pt-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Use a different email</span>
          </button>
        </form>
      )}
    </div>
  );
};