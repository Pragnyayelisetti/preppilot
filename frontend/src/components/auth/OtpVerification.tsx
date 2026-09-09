import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, ArrowLeft, RefreshCw, CheckCircle2, Mail } from 'lucide-react';

interface OtpVerificationProps {
  email: string;
  onVerify: (otp: string) => Promise<{ success: boolean; message: string }>;
  onResend: () => Promise<{ success: boolean; message: string; debugOtp?: string }>;
  onChangeEmail: () => void;
}

export const OtpVerification: React.FC<OtpVerificationProps> = ({
  email,
  onVerify,
  onResend,
  onChangeEmail
}) => {
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newValues = [...otpValues];
    newValues[index] = val.slice(-1);
    setOtpValues(newValues);

    // Auto-advance
    if (val && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newValues = [...otpValues];
    for (let i = 0; i < pasted.length; i++) {
      newValues[i] = pasted[i];
    }
    setOtpValues(newValues);
    if (pasted.length === 6) {
      inputsRef.current[5]?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otpValues.join('');
    if (code.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the OTP code.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await onVerify(code);
      if (!res.success) {
        setErrorMsg(res.message || 'Invalid OTP. Please check the code and try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed verifying OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await onResend();
      if (res.success) {
        setSuccessMsg(res.message);
        setTimer(60);
        setCanResend(false);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed sending OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Verify Your Email</h2>
        <p className="text-xs text-slate-500 mt-1">
          We have sent a 6-digit security code to{' '}
          <strong className="text-slate-800 font-semibold">{email}</strong>
        </p>
      </div>

      {/* Info notification */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
        <Mail className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-800">Check your inbox</p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Please check your inbox or spam folder for <span className="font-medium text-slate-700">{email}</span> and enter the 6-digit verification code.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        {/* 6 Digit Inputs */}
        <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
          {otpValues.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputsRef.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className="w-11 h-13 text-center text-lg font-bold rounded-xl border border-slate-300 bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none transition-all text-slate-900"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || otpValues.join('').length !== 6}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
        >
          {loading ? 'Verifying Security Code...' : 'Verify Email & Continue'}
        </button>

        {/* Resend & Change Email Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onChangeEmail}
            className="flex items-center gap-1 hover:text-slate-900 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Change email</span>
          </button>

          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Resend code
            </button>
          ) : (
            <span>Resend in {timer}s</span>
          )}
        </div>
      </form>
    </div>
  );
};
