import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ReminderFrequency, DeadlineReminderTiming } from '../../types';
import {
  User,
  GraduationCap,
  Mail,
  Smartphone,
  Sparkles,
  CheckCircle2,
  Save,
  Plus,
  X,
  ShieldCheck,
  MessageSquare,
  Bell,
  Clock,
  ExternalLink,
  Check
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user, updateProfile, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || 'Pragnya Yelisetti');
  const [college, setCollege] = useState(user?.college || 'International Institute of Information Technology');
  const [degree, setDegree] = useState(user?.degree || 'B.Tech / B.S.');
  const [branch, setBranch] = useState(user?.branch || 'Computer Science & Engineering');
  const [gradYear, setGradYear] = useState(user?.gradYear || '2027');
  const [careerGoals, setCareerGoals] = useState(user?.careerGoals || 'Crack Tier-1 Software Engineering Internships and Full-Time Roles');
  const [skills, setSkills] = useState<string[]>(user?.skills || ['Data Structures & Algorithms', 'Python', 'Java', 'React']);
  const [interests, setInterests] = useState<string[]>(user?.interests || ['Software Development', 'Backend Systems']);
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // WhatsApp Notification Settings State
  const initialWaPrefs = user?.whatsappPreferences;
  const [waEnabled, setWaEnabled] = useState(
    initialWaPrefs?.enabled ?? user?.whatsappNotificationsEnabled ?? true
  );
  const [waPhone, setWaPhone] = useState(
    initialWaPrefs?.phoneNumber || user?.whatsappNumber || '+91 98765 43210'
  );
  const [waFrequency, setWaFrequency] = useState<ReminderFrequency>(
    initialWaPrefs?.frequency || 'daily'
  );
  const [waDeadlineTimings, setWaDeadlineTimings] = useState<DeadlineReminderTiming[]>(
    initialWaPrefs?.deadlineTimings || ['7_days', '3_days', '1_day', 'on_deadline_day']
  );
  const [waNotifyNewOpps, setWaNotifyNewOpps] = useState(
    initialWaPrefs?.notifyNewOpportunities ?? true
  );
  const [waNotifyDeadlines, setWaNotifyDeadlines] = useState(
    initialWaPrefs?.notifyApplicationDeadlines ?? true
  );
  const [waNotifyInterviews, setWaNotifyInterviews] = useState(
    initialWaPrefs?.notifyInterviewReminders ?? true
  );

  const [waSaving, setWaSaving] = useState(false);
  const [waSavedSuccess, setWaSavedSuccess] = useState(false);
  const [sampleWaLink, setSampleWaLink] = useState<string | null>(null);

  const toggleDeadlineTiming = (timing: DeadlineReminderTiming) => {
    if (waDeadlineTimings.includes(timing)) {
      if (waDeadlineTimings.length > 1) {
        setWaDeadlineTimings(waDeadlineTimings.filter(t => t !== timing));
      }
    } else {
      setWaDeadlineTimings([...waDeadlineTimings, timing]);
    }
  };

  const handleSaveWhatsAppSettings = async () => {
    setWaSaving(true);
    setWaSavedSuccess(false);
    try {
      await api.updateWhatsAppSettings({
        enabled: waEnabled,
        phoneNumber: waPhone,
        frequency: waFrequency,
        deadlineTimings: waDeadlineTimings,
        notifyNewOpportunities: waNotifyNewOpps,
        notifyApplicationDeadlines: waNotifyDeadlines,
        notifyInterviewReminders: waNotifyInterviews
      });
      await refreshUser();
      setWaSavedSuccess(true);
      setTimeout(() => setWaSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Failed saving WhatsApp settings:', err);
    } finally {
      setWaSaving(false);
    }
  };

  const handleGenerateSampleLink = async () => {
    try {
      const res = await api.generateWhatsAppLink({
        company: 'Microsoft',
        role: 'Software Engineer Intern',
        deadline: 'September 15',
        daysRemaining: 3
      });
      if (res?.waLink) {
        setSampleWaLink(res.waLink);
      }
    } catch (err) {
      console.error('Failed generating test link:', err);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (s: string) => {
    setSkills(skills.filter(item => item !== s));
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (i: string) => {
    setInterests(interests.filter(item => item !== i));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await updateProfile({
        name,
        college,
        degree,
        branch,
        gradYear,
        careerGoals,
        skills,
        interests
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Failed saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="profile-management-view" className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-xs">
            {name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{name}</h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Verified Student
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {branch} • Class of {gradYear} • {college}
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile changes successfully saved! Your opportunity recommendations have updated.</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Academic Details */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>Academic Background</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Student Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">College / University</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Degree Program</label>
              <select
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white"
              >
                <option value="B.Tech / B.S.">B.Tech / B.S.</option>
                <option value="M.Tech / M.S.">M.Tech / M.S.</option>
                <option value="BCA / MCA">BCA / MCA</option>
                <option value="Other STEM">Other STEM</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Graduation Year</label>
              <input
                type="text"
                value={gradYear}
                onChange={(e) => setGradYear(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Branch / Major</label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white"
            />
          </div>
        </div>

        {/* Technical Skills */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Technical Skills & Stacks</span>
          </h2>

          <div className="flex flex-wrap gap-2">
            {skills.map((s, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-100"
              >
                <span>{s}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(s)}
                  className="hover:text-rose-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="Add skill (e.g. Docker, Go, Kubernetes)..."
              className="flex-1 p-2 text-xs rounded-xl border border-slate-300 bg-white"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Career Objective */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Target Career Goals
          </h2>
          <textarea
            rows={3}
            value={careerGoals}
            onChange={(e) => setCareerGoals(e.target.value)}
            className="w-full p-3 text-xs rounded-xl border border-slate-300 bg-white leading-relaxed"
          />
        </div>

        {/* WhatsApp Notification Settings Card */}
        <div id="whatsapp-notification-settings" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span>WhatsApp Notification Settings</span>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${waEnabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                    {waEnabled ? 'Active' : 'Disabled'}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Receive personalized deadline & opportunity reminders via verified WhatsApp click-to-chat links (wa.me).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveWhatsAppSettings}
              disabled={waSaving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{waSaving ? 'Saving...' : 'Save WhatsApp Settings'}</span>
            </button>
          </div>

          {waSavedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>WhatsApp notification preferences saved successfully!</span>
            </div>
          )}

          {/* 1. Toggle Enable / Disable */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <div className="text-xs font-bold text-slate-800">Enable WhatsApp Notifications</div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Generate click-to-chat reminder links for approaching deadlines and matching opportunities.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setWaEnabled(!waEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                waEnabled ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  waEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 2. WhatsApp Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-slate-500" />
              <span>WhatsApp Phone Number (with country code)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={waPhone}
                onChange={(e) => setWaPhone(e.target.value)}
                placeholder="+91 98765 43210 or +1 (555) 000-0000"
                className="flex-1 p-2.5 text-xs rounded-xl border border-slate-300 bg-white font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Include country code (e.g. +91 for India, +1 for USA). Messages open securely in WhatsApp on this number.
            </p>
          </div>

          {/* 3. Reminder Frequency */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Reminder Frequency</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {[
                { id: 'daily', label: 'Every day' },
                { id: 'every_2_days', label: 'Every 2 days' },
                { id: 'every_3_days', label: 'Every 3 days' },
                { id: 'weekly', label: 'Every week' },
                { id: 'deadline_only', label: 'Deadlines only' }
              ].map((freq) => (
                <button
                  key={freq.id}
                  type="button"
                  onClick={() => setWaFrequency(freq.id as ReminderFrequency)}
                  className={`p-2.5 text-xs font-semibold rounded-xl border text-center transition-all ${
                    waFrequency === freq.id
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {freq.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Choose Deadline Reminders */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-slate-500" />
              <span>Deadline Reminder Timings (select when to be reminded)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: '7_days', label: '7 days before' },
                { id: '3_days', label: '3 days before' },
                { id: '1_day', label: '1 day before' },
                { id: 'on_deadline_day', label: 'On deadline day' }
              ].map((timing) => {
                const isSelected = waDeadlineTimings.includes(timing.id as DeadlineReminderTiming);
                return (
                  <button
                    key={timing.id}
                    type="button"
                    onClick={() => toggleDeadlineTiming(timing.id as DeadlineReminderTiming)}
                    className={`p-2.5 text-xs font-medium rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span>{timing.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Notification Types */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">
              Notify Me For:
            </label>
            <div className="space-y-2">
              {[
                {
                  label: 'New matching opportunities',
                  desc: 'Alerts when a high-match internship, job, or campus drive is discovered',
                  checked: waNotifyNewOpps,
                  toggle: () => setWaNotifyNewOpps(!waNotifyNewOpps)
                },
                {
                  label: 'Application deadlines',
                  desc: 'Reminders approaching your chosen deadline milestones (7d, 3d, 1d, day-of)',
                  checked: waNotifyDeadlines,
                  toggle: () => setWaNotifyDeadlines(!waNotifyDeadlines)
                },
                {
                  label: 'Interview reminders',
                  desc: 'Alerts for upcoming online assessments, technical rounds, and behavioral interviews',
                  checked: waNotifyInterviews,
                  toggle: () => setWaNotifyInterviews(!waNotifyInterviews)
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={item.toggle}
                  className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => {}}
                    className="mt-0.5 h-4 w-4 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-800">{item.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Click-to-Chat Test & Explanation Banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero-Spam Click-to-Chat Protection (wa.me)</span>
              </span>
              <button
                type="button"
                onClick={handleGenerateSampleLink}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 underline flex items-center gap-1"
              >
                <span>Generate Test Link</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              PrepPilot does not use automated bots or unofficial scripts. Instead, it generates direct <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700 font-mono">wa.me</code> click-to-chat links with the pre-formatted reminder. When you click "Open in WhatsApp", WhatsApp opens with the message ready, and you simply tap Send.
            </p>

            {sampleWaLink && (
              <div className="p-3 bg-white border border-emerald-200 rounded-xl space-y-2 animate-fade-in">
                <div className="text-[11px] font-bold text-emerald-800">Sample Reminder Message Prepared:</div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700 whitespace-pre-line">
                  {`Hi ${name.split(' ')[0]} 👋\n\n⏰ Your application deadline is approaching!\n\nCompany: Microsoft\nRole: Software Engineer Intern\nDeadline: September 15\n\nYou have 3 days left to apply. 🚀`}
                </div>
                <a
                  href={sampleWaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Open in WhatsApp (wa.me)</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
