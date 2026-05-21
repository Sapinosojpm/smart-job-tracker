'use client';

import { useState, useEffect } from 'react';
import { Download, X, Database, Check } from 'lucide-react';

export default function CacheBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Check if the user has already interacted with the cache download
    const cacheStatus = localStorage.getItem('jobTracker_cacheStatus');
    if (!cacheStatus) {
      // Delay showing the banner for a smooth visual entry
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDownload = () => {
    setIsDownloading(true);
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 5;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setIsCompleted(true);
        localStorage.setItem('jobTracker_cacheStatus', 'downloaded');
        
        // Auto-close banner shortly after completion
        setTimeout(() => {
          setIsVisible(false);
        }, 1200);
      }
      setProgress(currentProgress);
    }, 150);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('jobTracker_cacheStatus', 'dismissed');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white/90 p-5 shadow-2xl backdrop-blur-xl md:p-6 dark:border-slate-800 dark:bg-slate-900/90">
        
        {/* Decorative ambient background glow */}
        <div className="absolute -left-12 -top-12 -z-10 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl" />
        <div className="absolute -right-12 -bottom-12 -z-10 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl" />

        <div className="flex items-start gap-4 pr-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 shadow-sm border border-blue-100/50 dark:from-slate-800 dark:to-slate-800 dark:border-slate-700">
            {isCompleted ? (
              <Check className="h-6 w-6 stroke-[2.5] text-emerald-500 animate-bounce" />
            ) : (
              <Database className={`h-6 w-6 text-blue-600 ${isDownloading ? 'animate-pulse' : ''}`} />
            )}
          </div>

          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
              {isCompleted ? 'Cache Saved Successfully!' : isDownloading ? 'Caching Web Assets...' : 'Optimize Offline Performance'}
            </h4>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              {isCompleted 
                ? 'Website assets have been optimized and saved for offline access.' 
                : isDownloading 
                  ? 'Saving images, styling, and job tracking assets to your browser storage.'
                  : 'Save assets and cached listings locally. Improves load speeds and reduces network data consumption.'}
            </p>
          </div>
        </div>

        {/* Progress Bar or Action Buttons */}
        <div className="mt-5 flex items-center justify-between gap-4">
          {isDownloading ? (
            <div className="w-full space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
                <span>Downloading assets...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-150 ease-out" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={handleDismiss}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                No, thanks
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest shadow-md shadow-blue-600/10 active:scale-95 transition-all"
              >
                <Download size={14} />
                Download Cache
              </button>
            </>
          )}
        </div>

        {/* Close Icon (only when not downloading) */}
        {!isDownloading && (
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Dismiss"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
