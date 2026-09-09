import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { WhatsAppNotification } from '../../types';
import {
  MessageSquare,
  CheckCircle2,
  Bell,
  Send,
  Smartphone,
  Sparkles,
  Clock,
  ShieldCheck,
  Check,
  Calendar,
  Award
} from 'lucide-react';

export const WhatsAppCenter: React.FC = () => {
  const [connected, setConnected] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('+1 (555) 234-8901');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState(phoneNumber);
  const [preferences, setPreferences] = useState({
    importantDeadlines: true,
    highConfidenceOpportunities: true,
    prepReminders: true,
    mockTestReminders: false
  });
  const [notifications, setNotifications] = useState<WhatsAppNotification[]>([]);
  const [sendingTest, setSendingTest] = useState(false);
  const [testSentSuccess, setTestSentSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.getWhatsAppStatus();
        if (res) {
          setConnected(res.connected !== false);
          if (res.phoneNumber) {
            setPhoneNumber(res.phoneNumber);
            setNewPhone(res.phoneNumber);
          }
          if (res.preferences) {
            setPreferences(res.preferences);
          }
          if (res.notifications) {
            setNotifications(res.notifications);
          }
        }
      } catch (err) {
        console.error('Failed fetching WhatsApp status:', err);
      }
    };

    fetchStatus();
  }, []);

  const handleUpdatePhone = async () => {
    try {
      const res = await api.connectWhatsApp(newPhone);
      if (res.success) {
        setPhoneNumber(newPhone);
        setIsEditingPhone(false);
        setConnected(true);
      }
    } catch (err) {
      console.error('Error connecting phone:', err);
    }
  };

  const handleTogglePreference = async (key: keyof typeof preferences) => {
    const updated = {
      ...preferences,
      [key]: !preferences[key]
    };
    setPreferences(updated);
    try {
      await api.updateWhatsAppPreferences(updated);
    } catch (err) {
      console.error('Failed saving preference:', err);
    }
  };

  const handleSendTestNotification = async () => {
    setSendingTest(true);
    setTestSentSuccess(null);
    try {
      const res = await api.sendWhatsAppAlert({
        title: 'Google SDE Internship — Urgent Notice',
        message: `🚨 PrepPilot Alert: Google Software Engineering Internship deadline is in 48 hours! Review your Round 1 checklist and attempt the mock test at https://preppilot.dev`,
        type: 'deadline'
      });

      if (res?.success) {
        setTestSentSuccess('Real-time alert dispatched to your WhatsApp!');
        if (res.notification) {
          setNotifications(prev => [res.notification, ...prev]);
        }
        setTimeout(() => setTestSentSuccess(null), 5000);
      }
    } catch (err) {
      console.error('Failed sending test alert:', err);
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div id="whatsapp-center" className="space-y-6 animate-fade-in pb-12">
      {/* WhatsApp Banner & Status */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
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
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  WhatsApp Connected ✓
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Never miss an OA link, interview slot, or deadline with instant phone alerts.
              </p>
            </div>
          </div>

          <button
            onClick={handleSendTestNotification}
            disabled={sendingTest}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{sendingTest ? 'Dispatching...' : 'Trigger Test Alert'}</span>
          </button>
        </div>

        {testSentSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{testSentSuccess}</span>
          </div>
        )}

        {/* Connected Number Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
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
                    className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white"
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
                <div className="text-sm font-bold text-slate-800 mt-0.5">{phoneNumber}</div>
              )}
            </div>
          </div>

          {!isEditingPhone && (
            <button
              onClick={() => setIsEditingPhone(true)}
              className="text-xs text-indigo-600 font-semibold hover:text-indigo-800"
            >
              Update Number
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent WhatsApp Notifications Received */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                <span>Recent WhatsApp Dispatch Logs</span>
              </h2>
              <span className="text-xs text-slate-400">{notifications.length} alerts logged</span>
            </div>

            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold text-slate-900">{notif.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">{notif.timestamp}</span>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 font-sans shadow-2xs leading-relaxed">
                    {notif.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Notification Preferences */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Notification Preferences
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Control which categories trigger real-time WhatsApp dispatches to your device.
            </p>

            <div className="space-y-3 pt-2">
              {[
                {
                  key: 'importantDeadlines' as const,
                  title: 'Important Deadlines',
                  desc: 'Alerts 48h and 24h before application cutoffs.'
                },
                {
                  key: 'highConfidenceOpportunities' as const,
                  title: 'New High-Confidence Opportunities',
                  desc: 'Instant alert when a verified >85% legitimate match arrives.'
                },
                {
                  key: 'prepReminders' as const,
                  title: 'Preparation Reminders',
                  desc: 'Study roadmap checklists & algorithmic pattern goals.'
                },
                {
                  key: 'mockTestReminders' as const,
                  title: 'Mock Test Reminders',
                  desc: 'Weekly performance benchmarks & practice prompts.'
                }
              ].map((pref) => {
                const isActive = preferences[pref.key];

                return (
                  <div
                    key={pref.key}
                    onClick={() => handleTogglePreference(pref.key)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      isActive ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800">{pref.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{pref.desc}</div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                        isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isActive && <Check className="w-3.5 h-3.5 stroke-3" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Anti-Spam Guarantee</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              PrepPilot sends at most 2 urgent messages per week, strictly reserved for confirmed recruitment dates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
