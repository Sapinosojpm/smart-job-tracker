import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, Clock, AlertCircle, X, Zap, ArrowRight, ShieldCheck, Lock, Trash2, Download, Circle } from 'lucide-react';
import { toast } from 'react-toastify';
import PlanModal from './PlanModal';

interface ScrapeButtonProps {
  onSuccess?: (inserted: number) => void;
  currentSettings?: any;
  onSettingsSaved?: (newSettings: any) => void;
}

export default function ScrapeButton({ onSuccess, currentSettings, onSettingsSaved }: ScrapeButtonProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [limitData, setLimitData] = useState<{ resetTime: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [isCloud, setIsCloud] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [modalSettings, setModalSettings] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsCloud(window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');
    }
  }, []);

  // Initialize modal settings copy when opening confirm modal
  useEffect(() => {
    if (showConfirmModal && currentSettings) {
      setModalSettings({
        ...currentSettings,
        scraperQuery: currentSettings.scraperQuery || '',
      });
    }
  }, [showConfirmModal, currentSettings]);

  // Countdown logic
  useEffect(() => {
    if (!limitData) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const reset = new Date(limitData.resetTime).getTime();
      const diff = reset - now;

      if (diff <= 0) {
        setLimitData(null);
        clearInterval(timer);
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [limitData]);

  /** Safely parse JSON — returns null if the response is HTML / non-JSON */
  const safeJson = async (res: Response): Promise<any> => {
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      console.error('[ScrapeButton] Non-JSON response:', res.status, text.slice(0, 300));
      throw new Error(`Server error (${res.status}). Please try again or check the logs.`);
    }
    try {
      return await res.json();
    } catch (e) {
      const text = await res.clone().text().catch(() => '');
      console.error('[ScrapeButton] JSON parse failed:', text.slice(0, 300));
      throw new Error('Received an unexpected response from the server. Please try again.');
    }
  };

  const handleScrape = async (shouldClear: boolean = false) => {
    if (!modalSettings?.scraperQuery?.trim()) {
      toast.error('Please enter a job title to scrape.');
      return;
    }

    setShowConfirmModal(false);
    setState('loading');
    const toastId = toast.loading(shouldClear ? '🧹 Clearing board & searching...' : '🔍 Searching job boards...', { position: "top-right" });

    try {
      // 1. Save settings first to keep changes in sync
      const saveRes = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modalSettings),
      });
      const saveData = await saveRes.json();
      if (!saveData.success) {
        throw new Error(saveData.error || 'Failed to update crawler query settings.');
      }

      // Notify parent page
      onSettingsSaved?.(saveData.data);

      // 2. Clear if requested
      if (shouldClear) {
        setIsClearing(true);
        const clearRes = await fetch('/api/jobs/clear', { method: 'DELETE' });
        if (!clearRes.ok) {
          const clearData = await safeJson(clearRes).catch(() => null);
          console.warn('[ScrapeButton] Clear failed:', clearData);
        }
        setIsClearing(false);
      }

      // 3. Trigger scrape with the query
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: modalSettings.scraperQuery.trim() }), 
      });

      const data = await safeJson(res);

      if (data.success) {
        const found = data.data?.jobsFound ?? 0;
        const inserted = data.data?.jobsInserted ?? 0;
        setState(found > 0 ? 'success' : 'idle');
        toast.update(toastId, {
          render:
            found === 0
              ? '⚠️ No jobs found. Enable sources in Settings, or run scrape-worker on your PC for Indeed/JobStreet.'
              : `✅ Found ${found} jobs — ${inserted} new added to your board!`,
          type: found === 0 ? 'warning' : 'success',
          isLoading: false,
          autoClose: found === 0 ? 8000 : 5000,
        });
        onSuccess?.(data.data.jobsInserted);
        setTimeout(() => setState('idle'), 4000);
      } else if (data.isLimitReached) {
        setState('idle');
        setLimitData({ resetTime: data.resetTime });
        toast.update(toastId, {
          render: '🚫 Daily search limit reached (50 jobs/day on FREE). Upgrade to PRO for unlimited searches.',
          type: 'warning',
          isLoading: false,
          autoClose: 8000,
        });
      } else {
        throw new Error(data.error || 'Scrape failed with an unknown error.');
      }
    } catch (err: any) {
      setState('error');
      const message = err?.message || 'Search failed. Check your internet connection.';
      toast.update(toastId, {
        render: `❌ ${message}`,
        type: "error",
        isLoading: false,
        autoClose: 7000,
      });
      console.error('[ScrapeButton] Error:', err);
      setTimeout(() => setState('idle'), 5000);
    } finally {
      setIsClearing(false);
    }
  };

  const isLimitReached = !!limitData;
  const isDisabled = state === 'loading' || isLimitReached;

  const config = isLimitReached
    ? { bg: 'bg-amber-500', icon: <Clock size={16} />, label: timeLeft ? `Resets in ${timeLeft}` : 'Limit Reached' }
    : {
        idle: { bg: 'bg-blue-600', icon: <RefreshCw size={16} />, label: 'Start AI Scraper' },
        loading: { bg: 'bg-blue-800', icon: <RefreshCw size={16} className="animate-spin" />, label: 'Scraping…' },
        success: { bg: 'bg-green-600', icon: <CheckCircle2 size={16} />, label: 'Done!' },
        error: { bg: 'bg-red-600', icon: <AlertCircle size={16} />, label: 'Failed' },
      }[state];

  const platforms = [
    { id: 'scrapeWeWorkRemotely', label: 'We Work Remotely', isLive: true },
    { id: 'scrapeOnlineJobs', label: 'OnlineJobs.ph', isLive: true },
    { id: 'scrapeRemoteOK', label: 'RemoteOK & APIs', isLive: true },
    { id: 'scrapeWellfound', label: 'Wellfound', isLive: false },
    { id: 'scrapeRemoteCo', label: 'Remote.co', isLive: false },
    { id: 'scrapeOtta', label: 'Otta', isLive: false },
    { id: 'scrapeWorkingNomads', label: 'Working Nomads', isLive: false },
    { id: 'scrapeJobspresso', label: 'Jobspresso', isLive: false },
    { id: 'scrapeNoDesk', label: 'NoDesk', isLive: false },
    { id: 'scrapeSkipTheDrive', label: 'SkipTheDrive', isLive: false },
    { id: 'scrapeRemoteRocketship', label: 'Remote Rocketship', isLive: false },
    { id: 'scrapeDailyRemote', label: 'DailyRemote', isLive: false },
    { id: 'scrapeUpwork', label: 'Upwork', isLive: false },
  ];

  return (
    <>
      {isLimitReached ? (
        <div className="flex items-center gap-1">
          <button
            suppressHydrationWarning
            disabled
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-amber-500 opacity-80 cursor-not-allowed shadow-sm"
            title={`Daily limit reached. Resets in ${timeLeft}`}
          >
            <Clock size={15} className="shrink-0" />
            <span className="hidden sm:inline">Limit Reached</span>
            {timeLeft && <span className="tabular-nums text-xs font-mono opacity-90 ml-1">{timeLeft}</span>}
          </button>
          <button
            suppressHydrationWarning
            onClick={() => setShowPlanModal(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-600/30 active:scale-95 transition-all"
            title="Upgrade to continue searching"
          >
            <Zap size={13} className="fill-white" />
            Upgrade
          </button>
        </div>
      ) : (
        <button
          suppressHydrationWarning
          onClick={() => setShowConfirmModal(true)}
          disabled={isDisabled}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all duration-200 active:scale-95 shadow-lg ${config.bg} ${isDisabled ? 'opacity-85 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02]'}`}
        >
          {config.icon}
          {config.label}
        </button>
      )}

      {/* Scraper / Platforms Confirmation Modal */}
      {showConfirmModal && modalSettings && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowConfirmModal(false)} />
           <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Zap size={20} className="text-white fill-white/10" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight leading-none mb-1">Start AI Job Scraper</h3>
                    <p className="text-[11px] text-blue-100 font-semibold">Customize search query and platforms on the fly</p>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6 overflow-y-auto space-y-5 shrink-1 bg-slate-50/50">
                {/* Query Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest block">
                    Job Title / Keyword to Search
                  </label>
                  <input
                    type="text"
                    value={modalSettings.scraperQuery || ''}
                    onChange={(e) => setModalSettings({ ...modalSettings, scraperQuery: e.target.value })}
                    placeholder="e.g. React Developer, Node.js, Virtual Assistant"
                    className="w-full text-xs font-bold p-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm"
                  />
                </div>

                {/* Platforms selection */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest block">
                    Select Platforms to Crawl
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {platforms.map((platform) => {
                      const isChecked = !!modalSettings[platform.id];
                      const isDisabled = !platform.isLive && isCloud;
                      
                      return (
                        <button
                          key={platform.id}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => {
                            if (isDisabled) return;
                            setModalSettings({
                              ...modalSettings,
                              [platform.id]: !isChecked
                            });
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                            isDisabled 
                              ? 'bg-slate-100 border-slate-200 text-slate-300 opacity-50 cursor-not-allowed select-none'
                              : isChecked
                                ? 'bg-blue-50 border-blue-200 text-blue-800 font-bold'
                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 font-semibold'
                          }`}
                        >
                          <div className="flex flex-col min-w-0 pr-1">
                            <span className="text-[11px] truncate">{platform.label}</span>
                            <span className={`text-[8px] font-bold ${platform.isLive ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {isDisabled ? 'Cloud Blocked' : platform.isLive ? 'Live API' : 'Local Only'}
                            </span>
                          </div>
                          <div className={`shrink-0 ${isChecked && !isDisabled ? 'text-blue-600' : 'text-slate-300'}`}>
                            {isDisabled ? <Lock size={12} /> : isChecked ? <CheckCircle2 size={14} className="text-blue-600" /> : <Circle size={14} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 bg-white border-t border-slate-100 shrink-0 space-y-3">
                 <p className="text-[10px] text-slate-400 text-center font-semibold leading-relaxed">
                   Do you want to clear your current board before searching new jobs, or keep and add to your existing list?
                 </p>
                 
                 <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleScrape(true)}
                      className="py-3 px-4 rounded-xl bg-blue-600 text-white font-black text-xs uppercase tracking-wider hover:bg-blue-700 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/10 active:scale-95"
                    >
                       <Trash2 size={14} />
                       Clear & Search
                    </button>
                    <button 
                      onClick={() => handleScrape(false)}
                      className="py-3 px-4 rounded-xl bg-slate-100 text-slate-700 font-black text-xs uppercase tracking-wider hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    >
                       <Download size={14} />
                       Keep & Add
                    </button>
                 </div>
                 
                 <button 
                   onClick={() => setShowConfirmModal(false)}
                   className="w-full text-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors pt-2 block"
                 >
                    Cancel
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Plan Selection Modal */}
      <PlanModal 
        isOpen={showPlanModal} 
        onClose={() => setShowPlanModal(false)} 
      />
    </>
  );
}
