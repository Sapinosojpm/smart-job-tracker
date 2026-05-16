'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  X,
  Save,
  Search,
  CheckCircle2,
  Circle,
  Globe,
  Loader2,
  Settings as SettingsIcon,
  ShieldAlert,
  Plus,
  Target,
  Send,
  Zap
} from 'lucide-react';
import { toast } from 'react-toastify';
import CancelSubscriptionModal from './CancelSubscriptionModal';

interface ISettings {
  scraperQuery: string;
  keywordFilters: string[];
  scrapeIndeed: boolean;
  scrapeJobStreet: boolean;
  scrapeOnlineJobs: boolean;
  scrapeUpwork: boolean;
  scrapeLinkedIn: boolean;
  scrapeRemoteOK: boolean;
  telegramBotToken: string;
  telegramChatId: string;
  plan: 'FREE' | 'PRO' | 'TEAM';
}

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ConfigModal({ isOpen, onClose, onSuccess }: ConfigModalProps) {
  const [settings, setSettings] = useState<ISettings>({
    scraperQuery: '',
    keywordFilters: [],
    scrapeIndeed: true,
    scrapeJobStreet: true,
    scrapeOnlineJobs: true,
    scrapeUpwork: true,
    scrapeLinkedIn: true,
    scrapeRemoteOK: true,
    telegramBotToken: '',
    telegramChatId: '',
    plan: 'FREE',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (isOpen && modalRef.current && backdropRef.current) {
      gsap.fromTo(backdropRef.current, 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.4, ease: 'power2.out' }
      );
      gsap.fromTo(modalRef.current, 
        { opacity: 0, scale: 0.95, y: 30 }, 
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'expo.out', delay: 0.05 }
      );
    }
  }, { dependencies: [isOpen] });

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.data) {
        setSettings({
          scraperQuery: data.data.scraperQuery || '',
          keywordFilters: data.data.keywordFilters || [],
          scrapeIndeed: data.data.scrapeIndeed !== false,
          scrapeJobStreet: data.data.scrapeJobStreet !== false,
          scrapeOnlineJobs: data.data.scrapeOnlineJobs !== false,
          scrapeUpwork: data.data.scrapeUpwork !== false,
          scrapeLinkedIn: data.data.scrapeLinkedIn !== false,
          scrapeRemoteOK: data.data.scrapeRemoteOK !== false,
          telegramBotToken: data.data.telegramBotToken || '',
          telegramChatId: data.data.telegramChatId || '',
          plan: data.data.plan || 'FREE',
        });
      }
    } catch (err) {
      console.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Configuration updated successfully!');
        onSuccess();
        onClose();
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (err) {
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
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
        setSettings({ ...settings, plan: 'FREE' });
        setShowCancelModal(false);
        onSuccess();
      } else {
        throw new Error(data.error || 'Failed to cancel subscription');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCanceling(false);
    }
  };

  const addKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newKeyword.trim()) {
      if (settings.plan === 'FREE' && settings.keywordFilters.length >= 1) {
        toast.warning('Free plan is limited to 1 filter. Upgrade to PRO for more!');
        return;
      }
      if (!settings.keywordFilters.includes(newKeyword.trim().toLowerCase())) {
        setSettings({
          ...settings,
          keywordFilters: [...settings.keywordFilters, newKeyword.trim().toLowerCase()],
        });
      }
      setNewKeyword('');
    }
  };

  const removeKeyword = (kw: string) => {
    setSettings({
      ...settings,
      keywordFilters: settings.keywordFilters.filter((k) => k !== kw),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        ref={backdropRef}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
        onClick={onClose} 
      />

      {/* Modal */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 p-2 rounded-full hover:bg-white/10 transition-colors text-blue-100 hover:text-white"
          >
            <X size={24} />
          </button>

          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
              <SettingsIcon size={28} className="text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight">Scraper Configuration</h2>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-black uppercase tracking-widest ${
                  settings.plan === 'TEAM' ? 'bg-purple-500/30 border-white/30 text-white' :
                  settings.plan === 'PRO' ? 'bg-amber-500/20 border-white/20 text-white' :
                  'bg-white/10 border-white/10 text-blue-100'
                }`}>
                  {settings.plan === 'TEAM' ? 'ELITE' : settings.plan} PLAN
                </span>
              </div>
              <p className="text-blue-100 text-sm font-medium mt-1">
                Customize your search targets and filtering logic.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[70vh] overflow-y-auto bg-slate-50/30">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 size={32} className="animate-spin mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest">Loading Preferences...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Search Query */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                  <Search size={14} />
                  Main Search Query
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={settings.scraperQuery}
                    onChange={(e) => setSettings({ ...settings, scraperQuery: e.target.value })}
                    placeholder="e.g. Senior Frontend Developer"
                    className="w-full text-sm font-semibold p-4 rounded-2xl border border-slate-200 bg-white text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Sources & Keywords Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Target Sources */}
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                    <Target size={14} />
                    Target Sources
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'scrapeIndeed', label: 'Indeed PH' },
                      { id: 'scrapeJobStreet', label: 'JobStreet PH' },
                      { id: 'scrapeOnlineJobs', label: 'OnlineJobs.ph' },
                      { id: 'scrapeLinkedIn', label: 'LinkedIn' },
                      { id: 'scrapeRemoteOK', label: 'RemoteOK (Intl)' },
                    ].map((source) => {
                      const isChecked = settings[source.id as keyof ISettings] as boolean;
                      return (
                        <label key={source.id} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer group ${isChecked ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => setSettings({ ...settings, [source.id]: e.target.checked })}
                            className="sr-only"
                          />
                          <div className={`transition-all duration-200 ${isChecked ? 'text-blue-600' : 'text-slate-300 group-hover:text-slate-400'}`}>
                            {isChecked ? <CheckCircle2 size={18} strokeWidth={2.5} /> : <Circle size={18} strokeWidth={2} />}
                          </div>
                          <span className={`text-[13px] font-bold ${isChecked ? 'text-blue-900' : 'text-slate-500'}`}>
                            {source.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Keyword Filters */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                      <Zap size={14} />
                      Keyword Filters
                    </label>
                    {settings.plan === 'FREE' && (
                      <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                        1 Limit
                      </span>
                    )}
                  </div>
                  <div className="p-4 min-h-[150px] rounded-2xl border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 transition-all shadow-sm">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {settings.keywordFilters.map((kw) => (
                        <span key={kw} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider border border-blue-100 animate-in zoom-in-95">
                          {kw}
                          <button onClick={() => removeKeyword(kw)} className="text-blue-400 hover:text-blue-600">
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Type & press Enter..."
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyDown={addKeyword}
                      className="w-full text-sm font-semibold outline-none bg-transparent placeholder:text-slate-300"
                    />
                  </div>
                  <div className="flex items-start gap-2 px-1">
                    <Globe size={12} className="text-slate-400 mt-0.5" />
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                      Only jobs matching these keywords will be saved and notified.
                    </p>
                  </div>
                </div>
              </div>

              {/* Telegram Notifications */}
              <div className="pt-6 border-t border-slate-100">
                <label className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2 px-1 mb-4">
                  <Send size={14} />
                  Telegram Notifications
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Bot Token</label>
                    <input
                      type="password"
                      value={settings.telegramBotToken}
                      onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })}
                      placeholder="bot123456:ABC-DEF..."
                      className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 bg-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Chat ID</label>
                    <input
                      type="text"
                      value={settings.telegramChatId}
                      onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
                      placeholder="123456789"
                      className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 bg-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-3 px-1">
                  Create a bot via @BotFather to get a token and Chat ID.
                </p>
              </div>

              {/* Plan Management */}
              {settings.plan !== 'FREE' && (
                <div className="pt-6 border-t border-slate-100">
                  <label className="text-[11px] font-black text-red-600 uppercase tracking-[0.2em] flex items-center gap-2 px-1 mb-4">
                    <ShieldAlert size={14} />
                    Plan Management
                  </label>
                  
                  <div className="bg-red-50/50 border border-red-100 rounded-2xl p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Cancel Subscription</h4>
                        <p className="text-[11px] text-slate-500 font-medium mt-1">
                          You will lose access to {settings.plan === 'TEAM' ? 'Elite' : 'Pro'} features immediately.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-[11px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-white border-t border-slate-100 flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl bg-blue-600 text-white font-bold text-base shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : (
              <>
                <Save size={20} />
                <span>Save Configuration</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-8 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold text-base hover:bg-slate-200 transition-all active:scale-95"
          >
            Cancel
          </button>
        </div>
      </div>

      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelSubscription}
        loading={canceling}
        planName={settings.plan === 'TEAM' ? 'Elite' : 'Pro'}
      />
    </div>
  );
}
