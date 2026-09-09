import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Mail,
  CheckCircle2,
  ShieldCheck,
  Lock,
  RefreshCw,
  ExternalLink,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface GmailConnectModalProps {
  onClose?: () => void;
  onScanComplete?: (count: number) => void;
}

export const GmailConnectModal: React.FC<GmailConnectModalProps> = ({
  onClose,
  onScanComplete
}) => {
  const { user, connectGmail, disconnectGmail, syncInbox } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState(user?.connectedGmailAddress || '');

  const isConnected = !!user?.connectedGmailAddress;

  const handleConnect = async () => {
    try {
      // Redirects the browser to Google's real consent screen for Gmail
      // read access. On approval, the backend exchanges the code for
      // tokens and redirects back here with real access.
      await api.startRealGoogleOAuth();
    } catch (err) {
      console.error('Failed starting Google OAuth:', err);
      setScanMessage('Could not start Google sign-in — check GOOGLE_CLIENT_ID is set in backend .env.');
    }
  };

  const handleScan = async () => {
    setIsScanning(true);
    setScanMessage(null);
    try {
      const res = await syncInbox();
      setScanMessage(res.message);
      if (onScanComplete) {
        onScanComplete(res.count);
      }
    } catch (err) {
      console.error('Failed syncing inbox:', err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                {isConnected ? 'Gmail Connected' : 'Connect Your Gmail'}
              </h2>
              {isConnected && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Connected ✓
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
              PrepPilot securely reads relevant opportunity emails to help you discover internships, jobs, hackathons, and campus drives with full transparency.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md text-xs font-semibold"
          >
            Close
          </button>
        )}
      </div>

      {/* Connected State vs Connect Form */}
      {isConnected ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-500">Active Mailbox:</span>{' '}
              <strong className="text-slate-800 font-semibold">{user?.connectedGmailAddress}</strong>
              <div className="text-[11px] text-slate-400 mt-0.5">Last scanned: Moments ago</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleScan()}
                disabled={isScanning}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Scanning Mailbox...' : 'Scan My Inbox'}</span>
              </button>

              <button
                onClick={() => disconnectGmail()}
                className="px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>

          {scanMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{scanMessage}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              University / Personal Gmail Address
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="student@university.edu"
                className="flex-1 p-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                onClick={handleConnect}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Connect with Google OAuth</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security & Privacy Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
          <Lock className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <div className="text-xs font-bold text-slate-800">Strict Read-Only Scope</div>
            <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              We never send, delete, or modify emails. Access is restricted to reading hiring queries.
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <div className="text-xs font-bold text-slate-800">Opportunity Filtering Only</div>
            <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Personal messages, newsletters, and receipts are discarded immediately in memory.
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <div className="text-xs font-bold text-slate-800">No Credential Storage</div>
            <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Authentication tokens expire automatically according to standard OAuth 2.0 protocols.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
