import React, { useState, useEffect } from 'react';
import {
  Mail,
  Filter,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Lock,
  Key,
  LogOut,
  ChevronDown,
  ChevronUp,
  Inbox,
  FileText
} from 'lucide-react';
import { DEMO_EMAILS, EmailLog } from './dashboardData';
import { Opportunity } from '../../data/mockOpportunities';
import {
  getGoogleClientId,
  setCustomGoogleClientId,
  getStoredAccessToken,
  saveAccessToken,
  clearStoredAuth,
  getConnectedEmail,
  requestGoogleGmailAccess,
  syncRealGmailInbox,
  fetchGmailProfile,
} from '../../services/gmailOAuthService';

interface EmailIntelligenceViewProps {
  userName: string;
  onSelectOpportunity: (opp: Opportunity) => void;
  onSimulateForward: () => void;
}

export const EmailIntelligenceView: React.FC<EmailIntelligenceViewProps> = ({
  userName,
  onSelectOpportunity,
  onSimulateForward,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'opportunity' | 'promotional'>('all');
  const [copied, setCopied] = useState(false);

  // Google OAuth states
  const [clientId, setClientId] = useState<string>(getGoogleClientId());
  const [connectedEmail, setConnectedEmail] = useState<string | null>(getConnectedEmail());
  const [hasToken, setHasToken] = useState<boolean>(!!getStoredAccessToken());
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Settings & manual token toggle
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [manualTokenInput, setManualTokenInput] = useState<string>('');
  const [showManualPaste, setShowManualPaste] = useState<boolean>(false);
  const [pasteSubject, setPasteSubject] = useState<string>('');
  const [pasteSender, setPasteSender] = useState<string>('');
  const [pasteBody, setPasteBody] = useState<string>('');

  // Synced email stream
  const [emails, setEmails] = useState<EmailLog[]>(() => {
    try {
      const saved = localStorage.getItem('preppilot_real_emails');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore parse error
    }
    return DEMO_EMAILS;
  });

  // Track if viewing real or demo emails
  const isUsingRealEmails = emails !== DEMO_EMAILS && emails.length > 0 && !emails.every((e) => e.id.startsWith('email-1') || e.id.startsWith('email-2') || e.id.startsWith('email-3') || e.id.startsWith('email-4') || e.id.startsWith('email-5'));

  const forwardAddress = `prep+${userName.toLowerCase().replace(/\s+/g, '')}@preppilot.ai`;

  // Auto-verify token on mount if present
  useEffect(() => {
    const token = getStoredAccessToken();
    if (token) {
      setHasToken(true);
      fetchGmailProfile(token)
        .then((p) => {
          setConnectedEmail(p.emailAddress);
        })
        .catch(() => {
          clearStoredAuth();
          setHasToken(false);
          setConnectedEmail(null);
        });
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard?.writeText(forwardAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Triggers the Google OAuth Consent Flow
   */
  const handleConnectGoogle = async () => {
    setIsConnecting(true);
    setStatusMessage({ type: 'info', text: 'Opening Google OAuth authorization popup...' });

    try {
      const token = await requestGoogleGmailAccess(clientId);
      setHasToken(true);
      const profile = await fetchGmailProfile(token);
      setConnectedEmail(profile.emailAddress);
      setStatusMessage({
        type: 'success',
        text: `Connected to Gmail (${profile.emailAddress})! Now syncing your inbox...`,
      });

      // Automatically sync inbox right after connection
      await handleSyncInbox(token);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to connect Gmail with Google OAuth.',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Fetches real messages from Gmail REST API and extracts opportunities
   */
  const handleSyncInbox = async (explicitToken?: string) => {
    const token = explicitToken || getStoredAccessToken();
    if (!token) {
      setStatusMessage({
        type: 'error',
        text: 'Please connect your Google account first to sync your inbox.',
      });
      return;
    }

    setIsSyncing(true);
    setStatusMessage({ type: 'info', text: 'Scanning inbox for recruitment, interview, and hackathon emails...' });

    try {
      const result = await syncRealGmailInbox(token, 15);
      setEmails(result.emails);
      setConnectedEmail(result.emailAddress);
      setStatusMessage({
        type: 'success',
        text: `Inbox synced successfully! Analyzed ${result.totalFetched} real emails • Detected ${result.opportunitiesDetected} actionable opportunities.`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Sync error: ${err.message}. If expired, please reconnect your Google account.`,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = () => {
    clearStoredAuth();
    setHasToken(false);
    setConnectedEmail(null);
    setStatusMessage({ type: 'info', text: 'Disconnected Gmail account. Reverted to default stream.' });
  };

  const handleSaveClientId = () => {
    setCustomGoogleClientId(clientId);
    setStatusMessage({ type: 'success', text: 'Google Client ID updated successfully!' });
  };

  const handleApplyManualToken = async () => {
    if (!manualTokenInput.trim()) return;
    try {
      saveAccessToken(manualTokenInput.trim(), 3600);
      const profile = await fetchGmailProfile(manualTokenInput.trim());
      setHasToken(true);
      setConnectedEmail(profile.emailAddress);
      setStatusMessage({ type: 'success', text: `Token verified for ${profile.emailAddress}` });
      await handleSyncInbox(manualTokenInput.trim());
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Invalid token: ${err.message}` });
    }
  };

  const handleParseCustomEmail = () => {
    if (!pasteSubject && !pasteBody) return;
    const combined = `${pasteSubject} ${pasteSender} ${pasteBody}`.toLowerCase();
    const isOpp = combined.includes('interview') || combined.includes('shortlist') || combined.includes('assessment') || combined.includes('hackathon') || combined.includes('test');

    const newLog: EmailLog = {
      id: 'custom-' + Date.now(),
      sender: pasteSender || 'recruitment@company.com',
      subject: pasteSubject || 'Technical Assessment Invitation',
      snippet: pasteBody.substring(0, 200) + '...',
      timestamp: 'Just now',
      type: isOpp ? 'opportunity' : 'promotional',
      stage: isOpp ? 'Assessment / Interview' : undefined,
      extractedCompany: 'Direct Ingestion',
      confidenceScore: 95,
    };

    const updated = [newLog, ...emails];
    setEmails(updated);
    localStorage.setItem('preppilot_real_emails', JSON.stringify(updated));
    setShowManualPaste(false);
    setPasteSubject('');
    setPasteSender('');
    setPasteBody('');
    setStatusMessage({ type: 'success', text: 'Email processed and added to stream!' });
  };

  // Metrics
  const totalAnalyzed = emails.length;
  const oppsCount = emails.filter((e) => e.type === 'opportunity').length;
  const promoCount = emails.filter((e) => e.type !== 'opportunity').length;

  const filteredEmails = emails.filter((e) => {
    if (activeFilter === 'all') return true;
    return e.type === activeFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. GOOGLE OAUTH CONNECTION BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-indigo-500/30 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm">
                {/* Official Google G Icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Google Workspace OAuth 2.0 Integration
              </span>
              {hasToken ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Lock className="w-3.5 h-3.5" />
                  Permission Required
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white">
              {hasToken && connectedEmail
                ? `Connected: ${connectedEmail}`
                : 'Connect Real Gmail Account'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {hasToken
                ? 'Your Gmail account is authorized with read-only access (gmail.readonly). PrepPilot safely parses incoming recruitment drives, interview notifications, and assessment deadlines.'
                : 'Grant read-only access to let PrepPilot automatically scan your inbox for interview invitations, coding tests, and hackathon confirmations.'}
            </p>

            {/* Status alerts */}
            {statusMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
                    : statusMessage.type === 'error'
                    ? 'bg-rose-950/60 border border-rose-500/40 text-rose-200'
                    : 'bg-indigo-950/60 border border-indigo-500/40 text-indigo-200'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : statusMessage.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                ) : (
                  <RefreshCw className="w-4 h-4 shrink-0 animate-spin text-indigo-400" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="shrink-0 flex flex-col sm:flex-row items-stretch gap-3">
            {!hasToken ? (
              <button
                onClick={handleConnectGoogle}
                disabled={isConnecting}
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold flex items-center justify-center gap-2.5 shadow-xl transition-all disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>Connecting with Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Connect Gmail with Google</span>
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleSyncInbox()}
                  disabled={isSyncing}
                  className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Reading Real Inbox...' : 'Sync Real Inbox Now'}</span>
                </button>

                <button
                  onClick={handleDisconnect}
                  className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              </>
            )}

            <button
              onClick={() => setShowConfig(!showConfig)}
              className="px-3.5 py-3 rounded-2xl bg-slate-950/60 border border-white/10 hover:border-white/20 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
            >
              <Key className="w-3.5 h-3.5" />
              <span>OAuth Settings</span>
              {showConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Collapsible OAuth & Token Configuration */}
        {showConfig && (
          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">
                Google OAuth Client ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="your-client-id.apps.googleusercontent.com"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleSaveClientId}
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
                >
                  Save
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                From Google Cloud Console $\rightarrow$ OAuth 2.0 Client IDs. Configured scope: <code className="text-indigo-300">gmail.readonly</code>.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">
                Or Paste Bearer Access Token Directly
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={manualTokenInput}
                  onChange={(e) => setManualTokenInput(e.target.value)}
                  placeholder="ya29.a0AfH6SM..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleApplyManualToken}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
                >
                  Apply & Sync
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Direct OAuth access token from Google Playground or curl authentication.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. FORWARDING CHANNEL & SIMULATE OPTION */}
      <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            <span>Alternative Ingestion: Dedicated Email Forwarding Address</span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <div className="px-3 py-1 rounded-xl bg-slate-950 border border-white/10 font-mono text-xs text-indigo-300">
              {forwardAddress}
            </div>
            <button
              onClick={handleCopy}
              className="p-1.5 hover:text-white text-slate-400 rounded-lg hover:bg-white/5 transition-all"
              title="Copy address"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowManualPaste(!showManualPaste)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-white/10 transition-all flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Paste Email Text</span>
          </button>
          <button
            onClick={onSimulateForward}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-white/10 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Forward</span>
          </button>
        </div>
      </div>

      {/* Manual Paste Email Modal / Box */}
      {showManualPaste && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-indigo-500/30 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Test AI Extractor with Any Real Email</span>
            </h3>
            <button
              onClick={() => setShowManualPaste(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Sender (e.g. careers@google.com)"
              value={pasteSender}
              onChange={(e) => setPasteSender(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="Subject (e.g. Technical Interview Shortlist)"
              value={pasteSubject}
              onChange={(e) => setPasteSubject(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <textarea
            rows={4}
            placeholder="Paste email body here (e.g. 'Dear Alex, you have been shortlisted for Round 1 Technical Interview on September 15. The interview will test DSA, Trees, and SQL...')"
            value={pasteBody}
            onChange={(e) => setPasteBody(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
          ></textarea>
          <button
            onClick={handleParseCustomEmail}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Extract Opportunities & Plan</span>
          </button>
        </div>
      )}

      {/* 3. METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10">
          <div className="text-xs font-bold text-slate-400 uppercase">Emails Processed</div>
          <div className="text-2xl font-black text-white mt-1">{totalAnalyzed}</div>
          <div className="text-[11px] text-indigo-400 mt-1">
            {isUsingRealEmails ? 'Live from your Gmail Inbox' : 'Demo recruitment corpus'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
          <div className="text-xs font-bold text-emerald-400 uppercase">Actionable Opportunities</div>
          <div className="text-2xl font-black text-emerald-300 mt-1">{oppsCount}</div>
          <div className="text-[11px] text-emerald-400 mt-1">
            Shortlists & assessment invites
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10">
          <div className="text-xs font-bold text-slate-400 uppercase">Filtered Out</div>
          <div className="text-2xl font-black text-slate-400 mt-1">{promoCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Marketing & newsletters muted</div>
        </div>
      </div>

      {/* 4. FILTERS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            All Emails ({totalAnalyzed})
          </button>
          <button
            onClick={() => setActiveFilter('opportunity')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'opportunity'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            Opportunities ({oppsCount})
          </button>
          <button
            onClick={() => setActiveFilter('promotional')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'promotional'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            Filtered Out ({promoCount})
          </button>
        </div>

        {isUsingRealEmails && (
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Inbox className="w-4 h-4 text-emerald-400" />
            <span>Showing real emails from {connectedEmail}</span>
          </div>
        )}
      </div>

      {/* 5. EMAILS STREAM LIST */}
      <div className="space-y-3">
        {filteredEmails.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-white/5 space-y-2">
            <Mail className="w-8 h-8 mx-auto text-slate-500" />
            <div className="text-sm font-bold text-white">No emails found in this category</div>
            <p className="text-xs text-slate-400">
              Click &quot;Sync Real Inbox Now&quot; above to refresh your messages from Gmail.
            </p>
          </div>
        ) : (
          filteredEmails.map((email) => {
            const isOpp = email.type === 'opportunity';
            return (
              <div
                key={email.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isOpp
                    ? 'bg-slate-900/80 border-indigo-500/30 hover:border-indigo-500/60'
                    : 'bg-slate-950/40 border-white/5 opacity-70'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        isOpp
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isOpp ? 'Opportunity Detected' : 'Filtered Promotional'}
                    </span>

                    {email.stage && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Stage: {email.stage}
                      </span>
                    )}

                    <span className="text-xs text-slate-400 font-mono">{email.sender}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <span>Confidence: {email.confidenceScore}%</span>
                    <span>•</span>
                    <span>{email.timestamp}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white mt-1">{email.subject}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{email.snippet}</p>

                {isOpp && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-indigo-400 font-medium">
                      Entity: {email.extractedCompany || 'Verified Opportunity'} • Preparation sprint created
                    </span>
                    <button
                      onClick={() => {
                        // Attempt to locate matching opportunity or create synthetic one
                        const savedOpps: Opportunity[] = JSON.parse(
                          localStorage.getItem('preppilot_real_opportunities') || '[]'
                        );
                        const match = savedOpps.find(
                          (o) => o.company === email.extractedCompany || email.subject.includes(o.company)
                        );
                        if (match) {
                          onSelectOpportunity(match);
                        } else {
                          // Create synthetic opportunity for drilldown
                          onSelectOpportunity({
                            id: email.id,
                            title: email.subject,
                            company: email.extractedCompany || 'Company',
                            type: 'internship',
                            location: 'Verified via Gmail Inbox',
                            stipendOrPrize: 'Competitive / Industry Standard',
                            deadline: 'In 7 days',
                            matchScore: 92,
                            eligibilityStatus: 'Eligible',
                            eligibilityCriteria: [
                              { label: 'Inbox Verification', status: 'pass', detail: `Received to ${email.sender}` },
                              { label: 'Current Stage', status: 'pass', detail: email.stage || 'Interview' },
                            ],
                            skillsMatched: ['DSA', 'Python', 'OOP', 'SQL'],
                            skillsMissing: ['System Design Tuning'],
                            roadmapSnapshot: {
                              day: 1,
                              totalDays: 7,
                              currentFocus: 'Technical Assessment & Core Rounds',
                              tasksRemaining: 4,
                              activeTask: 'Complete 3 problem sets and review system fundamentals',
                            },
                            aiSuggestion: 'Focus on high-frequency questions relevant to this role.',
                            badge: (email.stage || 'OPPORTUNITY').toUpperCase(),
                          });
                        }
                      }}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>View Extracted Plan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
