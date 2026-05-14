'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Bell,
  Save,
  ShieldCheck,
  Mail,
  MessageSquare,
  Sparkles,
  Database,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';

interface ISettings {
  telegramBotToken: string;
  telegramChatId: string;
  emailUser: string;
  emailPass: string;
  emailTo: string;
  keywordFilters: string[];
  scraperBaseUrl: string;
  scraperQuery: string;
  scraperLocation: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<ISettings>({
    telegramBotToken: '',
    telegramChatId: '',
    emailUser: '',
    emailPass: '',
    emailTo: '',
    keywordFilters: [],
    scraperBaseUrl: '',
    scraperQuery: '',
    scraperLocation: '',
  });

  const [showEmailPass, setShowEmailPass] = useState(false);
  const [showBotToken, setShowBotToken] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          // Sanitize data to avoid null values in controlled inputs
          const sanitized = { ...data.data };
          for (const key in sanitized) {
            if (sanitized[key] === null) {
              sanitized[key] = '';
            }
          }
          setSettings((prev) => ({ ...prev, ...sanitized }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setError('Failed to load settings. Please refresh.');
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    const toastId = toast.loading('Saving credentials...', { position: "top-right" });
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error('Failed to save');

      toast.update(toastId, {
        render: 'Credentials updated successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      console.error('Save error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to save';
      toast.update(toastId, {
        render: `❌ ${msg}`,
        type: 'error',
        isLoading: false,
        autoClose: 5000,
      });
      setError('Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-500 font-medium">Loading configuration...</p>
      </div>
    );
  }

  return (
    <div className="animate-in max-w-5xl mx-auto pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Settings className="text-blue-600" size={20} />
            </div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Settings</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">
            <span className="gradient-text">Credentials</span>
          </h1>
          <p className="text-slate-600 text-sm md:text-base max-w-xl">
            Configure your notification channels and alert credentials.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-xs font-semibold mb-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-md shadow-blue-600/25 hover:bg-blue-700 transition-colors disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Saving...</span>
              </>
            ) : (
              <span className="flex items-center gap-2"><Save size={18} /> Save Credentials</span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Notifications / Alerts Settings */}
          <section className="glass p-6 md:p-8 rounded-2xl border border-slate-100 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                <Bell className="text-amber-700" size={16} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Notification Channels</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Email Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Mail size={16} className="text-slate-400" />
                  <span className="text-sm font-bold text-slate-800">Email (SMTP)</span>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Username / Email</label>
                    <input 
                      type="email" 
                      value={settings.emailUser}
                      onChange={(e) => setSettings({ ...settings, emailUser: e.target.value })}
                      className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:border-blue-300 outline-none transition-all"
                      placeholder="user@gmail.com"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">App Password</label>
                      <a 
                        href="https://myaccount.google.com/apppasswords" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <HelpCircle size={10} /> How to get?
                      </a>
                    </div>
                    <div className="relative">
                      <input 
                        type={showEmailPass ? "text" : "password"} 
                        value={settings.emailPass}
                        onChange={(e) => setSettings({ ...settings, emailPass: e.target.value })}
                        className="w-full text-sm p-2.5 pr-10 rounded-lg border border-slate-200 focus:border-blue-300 outline-none transition-all"
                        placeholder="••••••••••••••••"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowEmailPass(!showEmailPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        {showEmailPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alert Recipient</label>
                    <input 
                      type="email" 
                      value={settings.emailTo}
                      onChange={(e) => setSettings({ ...settings, emailTo: e.target.value })}
                      className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:border-blue-300 outline-none transition-all"
                      placeholder="your-alerts@mail.com"
                    />
                  </div>
                </div>
              </div>

              {/* Telegram Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <MessageSquare size={16} className="text-slate-400" />
                  <span className="text-sm font-bold text-slate-800">Telegram Bot</span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bot Token</label>
                      <a 
                        href="https://t.me/BotFather" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <HelpCircle size={10} /> Get Token
                      </a>
                    </div>
                    <div className="relative">
                      <input 
                        type={showBotToken ? "text" : "password"} 
                        value={settings.telegramBotToken}
                        onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })}
                        className="w-full text-sm p-2.5 pr-10 rounded-lg border border-slate-200 focus:border-blue-300 outline-none transition-all"
                        placeholder="123456:ABC-DEF..."
                      />
                      <button 
                        type="button"
                        onClick={() => setShowBotToken(!showBotToken)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        {showBotToken ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chat ID</label>
                      <a 
                        href="https://t.me/userinfobot" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <HelpCircle size={10} /> Find ID
                      </a>
                    </div>
                    <input 
                      type="text" 
                      value={settings.telegramChatId}
                      onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
                      className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:border-blue-300 outline-none transition-all"
                      placeholder="-100123456789"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Database Info */}
          <section className="glass p-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <Database className="text-emerald-700" size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Database Connection</h4>
                  <p className="text-xs text-slate-500 font-medium">Supabase PostgreSQL (Connected)</p>
                </div>
              </div>
              <span className="self-start sm:self-center px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wide border border-emerald-100">
                Online
              </span>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="glass p-6 rounded-2xl border border-blue-100 bg-blue-50/30">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-blue-600" />
              <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wider">Security Note</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed space-y-2">
              Credentials are saved securely in your private database. 
              <br/><br/>
              • Use <strong>App Passwords</strong> for Gmail.<br/>
              • Telegram <strong>Chat IDs</strong> usually start with a minus (-) sign for groups.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
