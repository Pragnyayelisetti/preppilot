import React, { useState } from 'react';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck,
  Compass,
  Zap
} from 'lucide-react';

interface LoginPageProps {
  onNavigateToSignup: () => void;
  onNavigateToForgotPassword: () => void;
  onLoginSuccess: (user: { name: string; email: string }) => void;
  onViewLandingPage?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToSignup,
  onNavigateToForgotPassword,
  onLoginSuccess,
  onViewLandingPage,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return false;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return false;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMessage('');
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      const name = email.split('@')[0].replace('.', ' ');
      const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
      setTimeout(() => {
        onLoginSuccess({
          name: email.toLowerCase().includes('alex') ? 'Alex Chen' : formattedName || 'Student Pilot',
          email: email.trim(),
        });
      }, 700);
    }, 600);
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setErrorMessage('');
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        onLoginSuccess({
          name: 'Alex Chen',
          email: 'alex.chen@university.edu',
        });
      }, 700);
    }, 600);
  };

  const handleFillDemo = () => {
    setEmail('alex.chen@university.edu');
    setPassword('pilot2026!');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Ambient Lighting (Elegant Dark Theme) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/15 rounded-full blur-[160px]"></div>
        <div className="absolute top-[35%] right-[-10%] w-[45%] h-[45%] bg-violet-600/12 rounded-full blur-[160px]"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[140px]"></div>
      </div>

      {/* Top Bar with Brand Logo & Optional Landing Page Preview Link */}
      <header className="w-full px-6 py-5 flex items-center justify-between max-w-7xl mx-auto z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 p-0.5 shadow-lg shadow-indigo-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-white">
                Prep<span className="text-indigo-400">Pilot</span>
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                AI
              </span>
            </div>
          </div>
        </div>

        {onViewLandingPage && (
          <button
            onClick={onViewLandingPage}
            className="text-xs font-semibold text-slate-400 hover:text-white px-3.5 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-slate-900/50 hover:bg-slate-900 transition-all flex items-center gap-1.5"
            title="Explore full public landing page"
          >
            <span>Preview Landing Page</span>
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
          </button>
        )}
      </header>

      {/* Centered Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-md">
          {/* Card Frame */}
          <div className="relative rounded-3xl bg-slate-900/90 border border-white/10 p-7 sm:p-9 shadow-2xl backdrop-blur-2xl">
            {/* Top Glowing Edge */}
            <div className="absolute top-0 inset-x-12 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

            {/* Quick Demo Credentials Banner (Hackathon Friendly) */}
            <div className="mb-6 p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/25 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-indigo-200">
                <Zap className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>
                  Hackathon judge? Quick fill sample student account.
                </span>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] transition-colors"
              >
                Quick Fill
              </button>
            </div>

            {/* Header */}
            <div className="text-center mb-6 space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Welcome back
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
                Your opportunities are waiting. Let's prepare for them.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Successful Login State */}
            {isSuccess && (
              <div className="mb-5 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">Login successful! Launching PrepPilot Dashboard...</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    id="login-email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="alex.chen@university.edu"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={onNavigateToForgotPassword}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                    id="login-forgot-password"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                  <input
                    type="checkbox"
                    id="login-remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border border-white/20 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 rounded-sm"
                  />
                  <span>Remember me for 30 days</span>
                </label>
              </div>

              {/* Primary Sign In Button */}
              <button
                type="submit"
                id="login-submit-btn"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider with "or" */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-3 text-slate-500 font-medium">or</span>
              </div>
            </div>

            {/* Continue with Google Button */}
            <button
              type="button"
              id="login-google-btn"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-white/10 hover:border-white/20 text-slate-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.1-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.8.7 5.5 1.9 7.9l3.7-2.9c-.2-.7-.4-1.5-.4-2.4z"
                />
                <path
                  fill="#34A853"
                  d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Don't have an account? Create account */}
            <div className="mt-6 text-center text-xs text-slate-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onNavigateToSignup}
                id="login-to-signup"
                className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4 transition-colors"
              >
                Create account
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-5 text-center text-xs text-slate-500 border-t border-white/5 z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} PrepPilot. College Hackathon Special Edition.</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Campus Protected & Encrypted</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
