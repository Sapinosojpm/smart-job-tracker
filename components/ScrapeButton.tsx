'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, Clock, AlertCircle, X, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import PlanModal from './PlanModal';

interface ScrapeButtonProps {
  onSuccess?: (inserted: number) => void;
}

export default function ScrapeButton({ onSuccess }: ScrapeButtonProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [limitData, setLimitData] = useState<{ resetTime: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [showPlanModal, setShowPlanModal] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

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
      // Server returned HTML or plain-text (e.g. Vercel 500 page)
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
    setShowConfirmModal(false);
    setState('loading');
    const toastId = toast.loading(shouldClear ? '🧹 Clearing board & searching...' : '🔍 Searching job boards...', { position: "top-right" });

    try {
      if (shouldClear) {
        setIsClearing(true);
        const clearRes = await fetch('/api/jobs/clear', { method: 'DELETE' });
        if (!clearRes.ok) {
          const clearData = await safeJson(clearRes).catch(() => null);
          console.warn('[ScrapeButton] Clear failed:', clearData);
        }
        setIsClearing(false);
      }

      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), 
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
        idle: { bg: 'bg-blue-600', icon: <RefreshCw size={16} />, label: 'Search now' },
        loading: { bg: 'bg-blue-800', icon: <RefreshCw size={16} className="animate-spin" />, label: 'Searching…' },
        success: { bg: 'bg-green-600', icon: <CheckCircle2 size={16} />, label: 'Done!' },
        error: { bg: 'bg-red-600', icon: <AlertCircle size={16} />, label: 'Failed' },
      }[state];

  return (
    <>
      {isLimitReached ? (
        /* Limit reached — show split button: disabled status + upgrade CTA */
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

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowConfirmModal(false)} />
           <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-10 text-center">
                 <div className="w-20 h-20 rounded-[32px] bg-blue-50 flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-xl shadow-blue-600/10">
                    <Zap size={40} className="text-blue-600 fill-blue-600/10" />
                 </div>
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">Fresh start?</h3>
                 <p className="text-slate-500 text-[13px] font-medium leading-relaxed mb-10 px-4">
                    Do you want to clear your current board before searching new jobs, or just add them to your existing list?
                 </p>

                 <div className="space-y-3">
                    <button 
                      onClick={() => handleScrape(true)}
                      className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                    >
                       <RefreshCw size={18} />
                       Clear & Search New
                    </button>
                    <button 
                      onClick={() => handleScrape(false)}
                      className="w-full py-4 rounded-2xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-all active:scale-95"
                    >
                       Keep & Add New
                    </button>
                    <button 
                      onClick={() => setShowConfirmModal(false)}
                      className="w-full py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                    >
                       Cancel
                    </button>
                 </div>
              </div>
              <div className="bg-slate-50 py-4 px-6 text-center border-t border-slate-100">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TIP: Clear board for better accuracy</p>
              </div>
           </div>
        </div>
      )}

      {/* Limit Modal */}
      {limitData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setLimitData(null)} />
          <div className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-8 text-white text-center relative">
              <button 
                onClick={() => setLimitData(null)}
                className="absolute right-4 top-4 p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-xl">
                <Zap size={32} className="text-white fill-white" />
              </div>
              <h3 className="text-2xl font-black tracking-tight mb-1">Daily Limit Reached!</h3>
              <p className="text-amber-50 text-sm font-medium">You've reached the 50 jobs/day limit for FREE tier.</p>
            </div>

            {/* Body */}
            <div className="p-8 text-center">
              <div className="mb-8">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Next Search Available In</div>
                <div className="text-4xl font-black text-slate-800 tracking-tighter tabular-nums">
                  {timeLeft || '--h --m --s'}
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => setShowPlanModal(true)}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-blue-600 text-white font-black text-base shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-95 group"
                >
                  <ShieldCheck size={20} />
                  <span>Upgrade to PRO — Unlimited Searches</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button 
                  onClick={() => setLimitData(null)}
                  className="w-full py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Wait until reset
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PRO users get unlimited searches + priority sources</p>
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
