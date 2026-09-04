import React, { useState } from 'react';
import {
  Settings,
  Mail,
  Smartphone,
  Bell,
  Shield,
  CheckCircle2,
  Lock,
  Save
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          <span>PrepPilot Platform Settings</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure notification dispatching, inbound parsing preferences, and account security.
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Notification Preferences
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-white/5">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white">Email Opportunity Alerts</div>
              <div className="text-[11px] text-slate-400">Receive instant notifications when an email contains an interview shortlist</div>
            </div>
            <button
              onClick={() => setEmailAlerts(!emailAlerts)}
              className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                emailAlerts ? 'bg-indigo-600 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md"></div>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-white/5">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white">WhatsApp Morning Sprint Delivery</div>
              <div className="text-[11px] text-slate-400">Dispatches your top 3 preparation tasks at 8:00 AM every morning</div>
            </div>
            <button
              onClick={() => setWhatsappAlerts(!whatsappAlerts)}
              className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                whatsappAlerts ? 'bg-emerald-600 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md"></div>
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>

          {saved && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Preferences saved successfully!</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
