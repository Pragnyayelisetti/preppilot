import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { WhatsAppNotification, ReminderFrequency, DeadlineReminderTiming } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  MessageSquare,
  CheckCircle2,
  Bell,
  Smartphone,
  Sparkles,
  Clock,
  ShieldCheck,
  Check,
  ExternalLink,
  Save,
  AlertCircle,
  Send,
  Calendar
} from 'lucide-react';

export const WhatsAppCenter: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [connected, setConnected] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState(phoneNumber);

  const [frequency, setFrequency] = useState<ReminderFrequency>('daily');
  const [deadlineTimings, setDeadlineTimings] = useState<DeadlineReminderTiming[]>([
    '7_days',
    '3_days',
    '1_day',
    'on_deadline_day'
  ]);
  const [notifyNewOpps, setNotifyNewOpps] = useState(true);
  const [notifyDeadlines, setNotifyDeadlines] = useState(true);
  const [notifyInterviews, setNotifyInterviews] = useState(true);

  const [notifications, setNotifications] = useState<WhatsAppNotification[]>([]);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState(false);
  const [testLink, setTestLink] = useState<string | null>(null);
  const [testSentFeedback, setTestSentFeedback] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await api.getWhatsAppStatus();
      if (res) {
        setConnected(res.connected !== false);
        if (res.phoneNumber) {
          setPhoneNumber(res.phoneNumber);
          setNewPhone(res.phoneNumber);
        }
        if (res.preferences) {
          const p = res.preferences;
          if (p.frequency) setFrequency(p.frequency);
          if (p.deadlineTimings) setDeadlineTimings(p.deadlineTimings);
          if (typeof p.notifyNewOpportunities === 'boolean') setNotifyNewOpps(p.notifyNewOpportunities);
          if (typeof p.notifyApplicationDeadlines === 'boolean') setNotifyDeadlines(p.notifyApplicationDeadlines);
          if (typeof p.notifyInterviewReminders === 'boolean') setNotifyInterviews(p.notifyInterviewReminders);
        }
        if (res.notifications) {
          setNotifications(res.notifications);
        }
      }
    } catch (err) {
      console.error('Failed fetching WhatsApp status:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdatePhone = async () => {
    try {
      const res = await api.connectWhatsApp(newPhone);
      if (res.success) {
        setPhoneNumber(newPhone);
        setIsEditingPhone(false);
        setConnected(true);
        await refreshUser();
      }
    } catch (err) {
      console.error('Error connecting phone:', err);
    }
  };

  const toggleDeadlineTiming = (timing: DeadlineReminderTiming) => {
    if (deadlineTimings.includes(timing)) {
      if (deadlineTimings.length > 1) {
        setDeadlineTimings(deadlineTimings.filter(t => t !== timing));
      }
    } else {
      setDeadlineTimings([...deadlineTimings, timing]);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setSettingsSavedSuccess(false);
    try {
      const res = await api.updateWhatsAppSettings({
        enabled: connected,
        phoneNumber,
        frequency,
        deadlineTimings,
        notifyNewOpportunities: notifyNewOpps,
        notifyApplicationDeadlines: notifyDeadlines,
        notifyInterviewReminders: notifyInterviews
      });

      if (res.success) {
        setSettingsSavedSuccess(true);
        await refreshUser();
        await loadData();
        setTimeout(() => setSettingsSavedSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Failed saving WhatsApp settings:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleOpenWhatsAppReminder = async (notif: WhatsAppNotification) => {
    if (notif.waLink) {
      window.open(notif.waLink, '_blank', 'noopener,noreferrer');
      try {
        await api.markWhatsAppOpened(notif.id, notif.eventId);
        setNotifications(prev =>
          prev.map(n => (n.id === notif.id ? { ...n, read: true, status: 'opened' } : n))
        );
      } catch {
        // non-fatal
      }
    }
  };

  const handleGenerateSampleReminder = async () => {
    try {
      const res = await api.sendWhatsAppAlert({
        title: 'Application Deadline Approaching: Microsoft',
        message: '⏰ Your application deadline for Microsoft is approaching! You have 3 days left to apply.',
        company: 'Microsoft',
        role: 'Software Engineer Intern',
        deadline: 'September 15',
        daysRemaining: 3,
        type: 'deadline'
      });

      if (res?.waLink) {
        setTestLink(res.waLink);
        setTestSentFeedback('Sample reminder prepared! Click "Open in WhatsApp" below.');
        if (res.notification) {
          setNotifications(prev => [res.notification, ...prev]);
        }
        setTimeout(() => setTestSentFeedback(null), 6000);
      }
    } catch (err) {
      console.error('Failed generating test alert:', err);
    }
  };

  return (
    <div id="whatsapp-center" className="space-y-6 animate-fade-in pb-12">
      {/* WhatsApp Banner & Status */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  WhatsApp Career Alerts
                </h1>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  connected
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {connected ? 'WhatsApp Alerts Active ✓' : 'Alerts Paused'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Never miss an OA link, interview slot, or deadline with verified click-to-chat links (wa.me).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateSampleReminder}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Test Click-to-Chat Link</span>
            </button>
          </div>
        </div>

        {testSentFeedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center justify-between gap-2 animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{testSentFeedback}</span>
            </div>
            {testLink && (
              <a
                href={testLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-lg flex items-center gap-1"
              >
                <span>Open in WhatsApp</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Connected Number & Toggle Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-slate-400" />
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Destination Phone Number
              </div>
              {isEditingPhone ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white font-mono"
                    placeholder="+91 98765 43210"
                  />
                  <button
                    onClick={handleUpdatePhone}
                    className="px-2.5 py-1 text-xs bg-slate-900 text-white font-medium rounded-lg"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingPhone(false)}
                    className="px-2.5 py-1 text-xs text-slate-600 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="text-sm font-bold text-slate-800 mt-0.5 font-mono">{phoneNumber}</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isEditingPhone && (
              <button
                onClick={() => setIsEditingPhone(true)}
                className="text-xs text-emerald-700 font-semibold hover:text-emerald-800"
              >
                Update Phone
              </button>
            )}
            <div className="h-4 w-px bg-slate-200" />
            <button
              type="button"
              onClick={() => setConnected(!connected)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                connected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {connected ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Due & Recent WhatsApp Notifications */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Ready WhatsApp Reminders & Dispatches
                </h2>
              </div>
              <span className="text-xs text-slate-400">{notifications.length} reminders prepared</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Click <strong>Open in WhatsApp</strong> to open WhatsApp Web or the WhatsApp app with your reminder pre-written. Review it and tap <strong>Send</strong> manually.
            </p>

            {notifications.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="text-xs font-bold text-slate-600">No Reminders Due Right Now</div>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  When application deadlines (7d, 3d, 1d, day-of) approach or new matching opportunities appear, verified click-to-chat links will generate here automatically.
                </p>
                <button
                  onClick={handleGenerateSampleReminder}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100"
                >
                  <span>Prepare Sample Reminder</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-200 transition-colors space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${notif.status === 'opened' ? 'bg-slate-400' : 'bg-emerald-500'}`} />
                        <span className="text-xs font-bold text-slate-900">{notif.title}</span>
                        {notif.status === 'opened' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-medium">
                            Opened ✓
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">{notif.timestamp}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 font-mono whitespace-pre-line leading-relaxed">
                      {notif.message}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400">
                        {notif.waLink ? 'Click-to-chat link ready' : 'Standard alert'}
                      </span>

                      {notif.waLink ? (
                        <button
                          onClick={() => handleOpenWhatsAppReminder(notif)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Open in WhatsApp</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Sent</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Notification Settings Panel */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Notification Settings
              </h3>
              <button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1"
              >
                <Save className="w-3 h-3" />
                <span>{savingSettings ? 'Saving...' : 'Save'}</span>
              </button>
            </div>

            {settingsSavedSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-lg flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Preferences updated successfully!</span>
              </div>
            )}

            {/* Reminder Frequency */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Reminder Frequency</span>
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { id: 'daily', label: 'Every day' },
                  { id: 'every_2_days', label: 'Every 2 days' },
                  { id: 'every_3_days', label: 'Every 3 days' },
                  { id: 'weekly', label: 'Every week' },
                  { id: 'deadline_only', label: 'Deadline reminders only' }
                ].map((freq) => (
                  <button
                    key={freq.id}
                    type="button"
                    onClick={() => setFrequency(freq.id as ReminderFrequency)}
                    className={`p-2 text-xs font-medium rounded-lg border text-left flex items-center justify-between ${
                      frequency === freq.id
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{freq.label}</span>
                    {frequency === freq.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Deadline Reminders */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Deadline Reminder Schedule</span>
              </label>
              <div className="space-y-1.5">
                {[
                  { id: '7_days', label: '7 days before' },
                  { id: '3_days', label: '3 days before' },
                  { id: '1_day', label: '1 day before' },
                  { id: 'on_deadline_day', label: 'On deadline day' }
                ].map((timing) => {
                  const isSelected = deadlineTimings.includes(timing.id as DeadlineReminderTiming);
                  return (
                    <div
                      key={timing.id}
                      onClick={() => toggleDeadlineTiming(timing.id as DeadlineReminderTiming)}
                      className={`p-2 text-xs rounded-lg border cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <span>{timing.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Event categories */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Notification Triggers</label>
              <div className="space-y-2">
                {[
                  {
                    title: 'New Matching Opportunities',
                    checked: notifyNewOpps,
                    toggle: () => setNotifyNewOpps(!notifyNewOpps)
                  },
                  {
                    title: 'Application Deadlines',
                    checked: notifyDeadlines,
                    toggle: () => setNotifyDeadlines(!notifyDeadlines)
                  },
                  {
                    title: 'Interview Reminders',
                    checked: notifyInterviews,
                    toggle: () => setNotifyInterviews(!notifyInterviews)
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={item.toggle}
                    className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 text-xs"
                  >
                    <span className="font-medium text-slate-800">{item.title}</span>
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => {}}
                      className="h-4 w-4 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Click-to-Chat Privacy Policy</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Only official <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-700">wa.me</code> links are generated. No third-party bots, spam, or automated messages. Reminders automatically stop if you apply or archive an opportunity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
