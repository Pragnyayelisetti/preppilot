import React, { useState } from 'react';
import {
  Smartphone,
  CheckCircle2,
  Send,
  Sparkles,
  ShieldCheck,
  Clock,
  MessageSquare,
  BellRing
} from 'lucide-react';

interface WhatsAppViewProps {
  userName: string;
}

export const WhatsAppView: React.FC<WhatsAppViewProps> = ({ userName }) => {
  const [phone, setPhone] = useState('+91 98765 43210');
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [notificationTime, setNotificationTime] = useState('08:00');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Good morning ${userName.split(' ')[0]}! ☀️\n\n🎯 Today's AI Sprint (TechNova Interview in 5 days):\n1. [ ] Review OOP Inheritance & Polymorphism (30m)\n2. [ ] Solve 5 array LeetCode problems (45m)\n3. [ ] Practice SQL window functions (35m)\n\nReply "DONE 1" when you finish task 1 to log your daily streak!`,
      time: '08:00 AM',
    },
    {
      sender: 'user',
      text: 'DONE 1',
      time: '09:15 AM',
    },
    {
      sender: 'bot',
      text: `Awesome momentum! 🔥 Task 1 marked complete. Daily streak updated: 7 Days.\nNext up: Solve 5 array LeetCode problems. You've got this!`,
      time: '09:15 AM',
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const handleSend = () => {
    if (!inputMsg.trim()) return;
    const newMsg = { sender: 'user', text: inputMsg, time: 'Just now' };
    setMessages((prev) => [...prev, newMsg]);
    setInputMsg('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `Got it! PrepPilot logged your response. Your sprint progress is now synced across your Student Dashboard.`,
          time: 'Just now',
        },
      ]);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-emerald-950/30 border border-emerald-500/30 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Smartphone className="w-4 h-4" />
              <span>WhatsApp Daily Sprint Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Zero-Friction Daily Preparation Prompts
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              No need to open the app every morning. PrepPilot delivers your top 3 daily action tasks directly to your WhatsApp inbox at 8:00 AM. Reply directly to tick off tasks and maintain your streak.
            </p>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 shrink-0">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs font-bold text-white">WhatsApp Bot Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WhatsApp Phone Mockup (Left) */}
        <div className="rounded-3xl bg-slate-950 border border-white/15 p-4 sm:p-6 shadow-2xl flex flex-col justify-between h-[520px]">
          {/* Mockup Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white shadow">
                <Sparkles className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>PrepPilot Copilot</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400 text-slate-950" />
                </div>
                <div className="text-[10px] text-emerald-400 font-mono">Official Verified Assistant</div>
              </div>
            </div>

            <span className="text-[10px] text-slate-400 font-mono">Demo Preview</span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
            {messages.map((m, idx) => {
              const isBot = m.sender === 'bot';
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow ${
                      isBot
                        ? 'bg-slate-900 border border-white/10 text-slate-200 rounded-tl-sm'
                        : 'bg-emerald-600 text-white rounded-tr-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 px-1">{m.time}</span>
                </div>
              );
            })}
          </div>

          {/* Interactive Chat Input */}
          <div className="pt-3 border-t border-white/10 flex items-center gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder='Type "DONE 2" or ask a question...'
              className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleSend}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Configuration Controls (Right) */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Notification Preferences</span>
            </h3>

            {/* Sync Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-white/5">
              <div>
                <div className="text-xs font-bold text-white">Daily WhatsApp Dispatch</div>
                <div className="text-[11px] text-slate-400">Receive morning prioritized tasks</div>
              </div>
              <button
                onClick={() => setSyncEnabled(!syncEnabled)}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                  syncEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-800 justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-md"></div>
              </button>
            </div>

            {/* Phone input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">WhatsApp Mobile Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500">
                Encrypted & used strictly for daily opportunity alerts.
              </span>
            </div>

            {/* Delivery time */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Morning Alert Schedule</label>
              <select
                value={notificationTime}
                onChange={(e) => setNotificationTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="07:00">07:00 AM (Early Bird)</option>
                <option value="08:00">08:00 AM (Recommended)</option>
                <option value="09:00">09:00 AM (Standard)</option>
                <option value="10:00">10:00 AM</option>
              </select>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Verified WhatsApp template active. Ready for live deployment.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
