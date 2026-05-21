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
  Zap,
  Lock
} from 'lucide-react';
import { toast } from 'react-toastify';
import CancelSubscriptionModal from '@/components/CancelSubscriptionModal';
import PlanModal from '@/components/PlanModal';

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
  plan: 'FREE' | 'PRO' | 'TEAM';
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
    plan: 'FREE',
  });

  const [showEmailPass, setShowEmailPass] = useState(false);
  const [showBotToken, setShowBotToken] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);

  // Load cache on mount
  useEffect(() => {
    const cachedSettingsStr = localStorage.getItem("jobTracker_cachedSettings");
    if (cachedSettingsStr) {
      try {
        const parsed = JSON.parse(cachedSettingsStr);
        setSettings((prev) => ({ ...prev, ...parsed }));
        setFetching(false);
      } catch (e) {
        console.error("Failed to parse cached settings", e);
      }
    }
  }, []);

  const fetchSettings = async (showSkeleton = false) => {
    if (showSkeleton) {
      setFetching(true);
    }
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
          localStorage.setItem("jobTracker_cachedSettings", JSON.stringify(sanitized));
        }
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setError('Failed to load settings. Please refresh.');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    const cachedSettingsStr = localStorage.getItem("jobTracker_cachedSettings");
    fetchSettings(!cachedSettingsStr);
  }, []);

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

      // Update local storage cache
      localStorage.setItem("jobTracker_cachedSettings", JSON.stringify(settings));

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

  const handleCancelSubscription = async () => {
    setCanceling(true);
    try {
      const res = await fetch('/api/subscription/cancel', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        const updatedSettings = { ...settings, plan: 'FREE' as const };
        setSettings(updatedSettings);
        localStorage.setItem("jobTracker_cachedSettings", JSON.stringify(updatedSettings));
        setShowCancelModal(false);
      } else {
        throw new Error(data.error || 'Failed to cancel subscription');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCanceling(false);
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
              <div className="space-y-5 relative">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-800">Telegram Bot</span>
                  </div>
                  {settings.plan === 'FREE' && (
                    <span className="text-[8px] bg-amber-500 text-white px-2 py-0.5 rounded font-black uppercase tracking-wider">PRO</span>
                  )}
                </div>

                <div className={`space-y-4 ${settings.plan === 'FREE' ? 'opacity-40 pointer-events-none select-none blur-[1px]' : ''}`}>
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
                        disabled={settings.plan === 'FREE'}
                        value={settings.telegramBotToken}
                        onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })}
                        className="w-full text-sm p-2.5 pr-10 rounded-lg border border-slate-200 focus:border-blue-300 outline-none transition-all"
                        placeholder="123456:ABC-DEF..."
                      />
                      <button 
                        type="button"
                        onClick={() => setShowBotToken(!showBotToken)}
                        disabled={settings.plan === 'FREE'}
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
                      disabled={settings.plan === 'FREE'}
                      value={settings.telegramChatId}
                      onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
                      className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:border-blue-300 outline-none transition-all"
                      placeholder="-100123456789"
                    />
                  </div>
                </div>

                {settings.plan === 'FREE' && (
                  <div className="absolute inset-x-0 bottom-0 top-8 flex flex-col items-center justify-center bg-white/75 backdrop-blur-[1px] rounded-2xl p-4 text-center z-10">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-2 shadow-sm">
                      <Lock size={16} className="text-amber-500" />
                    </div>
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1">Telegram Alerts Locked</h5>
                    <p className="text-[10px] text-slate-500 font-medium max-w-xs leading-normal">
                      Upgrade to Pro for just ₱99/mo to get direct job notifications on your phone!
                    </p>
                  </div>
                )}
              </div>
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

          {/* Plan Section */}
          <section className="glass p-6 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={16} className="text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Current Plan</h4>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-600">Active Tier:</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-lg border font-black uppercase tracking-widest ${
                  settings.plan === 'TEAM' ? 'bg-purple-50 border-purple-100 text-purple-600' :
                  settings.plan === 'PRO' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                  'bg-slate-100 border-slate-200 text-slate-500'
                }`}>
                  {settings.plan === 'TEAM' ? 'ELITE' : settings.plan}
                </span>
              </div>

              {settings.plan !== 'TEAM' && (
                <button
                  type="button"
                  onClick={() => setShowPlanModal(true)}
                  className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                >
                  Upgrade Plan
                </button>
              )}

              {settings.plan !== 'FREE' && (
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full py-2.5 rounded-xl border border-red-100 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-50 transition-all"
                  >
                    Cancel Subscription
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelSubscription}
        loading={canceling}
        planName={settings.plan === 'TEAM' ? 'Elite' : 'Pro'}
      />

      <PlanModal 
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
      />
    </div>
  );
}
