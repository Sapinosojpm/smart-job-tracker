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

  const handleScrape = async () => {
    setState('loading');
    const toastId = toast.loading('Scraping job boards...', { position: "top-right" });

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), 
      });

      const data = await res.json();

      if (data.success) {
        setState('success');
        toast.update(toastId, {
          render: `✓ Found ${data.data.jobsFound} jobs, inserted ${data.data.jobsInserted} new ones!`,
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });
        onSuccess?.(data.data.jobsInserted);
        setTimeout(() => setState('idle'), 4000);
      } else if (data.isLimitReached) {
        setState('idle');
        setLimitData({ resetTime: data.resetTime });
        toast.dismiss(toastId);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setState('error');
      toast.update(toastId, {
        render: `❌ ${err.message || 'Scrape failed'}`,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
      setTimeout(() => setState('idle'), 5000);
    }
  };

  const config = {
    idle: { bg: 'bg-blue-600', icon: <RefreshCw size={16} />, label: 'Scrape now' },
    loading: { bg: 'bg-blue-800', icon: <RefreshCw size={16} className="animate-spin" />, label: 'Scraping…' },
    success: { bg: 'bg-green-600', icon: <CheckCircle2 size={16} />, label: 'Done!' },
    error: { bg: 'bg-red-600', icon: <AlertCircle size={16} />, label: 'Failed' },
  }[state];

  return (
    <>
      <button
        onClick={handleScrape}
        disabled={state === 'loading'}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all duration-200 active:scale-95 shadow-lg ${config.bg} ${state === 'loading' ? 'opacity-85 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02]'}`}
      >
        {config.icon}
        {config.label}
      </button>

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
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Next Scrape Available In</div>
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
                  <span>Upgrade to PRO</span>
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
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PRO users get unlimited scraping</p>
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
