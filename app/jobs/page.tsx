'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  RefreshCw,
  Clock,
  MapPin,
  Building2,
  CheckCircle2,
  Circle,
  Trash2,
  AlertCircle,
  Layers,
  ArrowUpRight,
  Settings as SettingsIcon,
  Zap,
  Download,
  Briefcase,
  Lock
} from 'lucide-react';
import ScrapeButton from '@/components/ScrapeButton';
import ApplyModal from '@/components/ApplyModal';
import DeleteModal from '@/components/DeleteModal';
import ConfigModal from '@/components/ConfigModal';
import PlanModal from '@/components/PlanModal';
import { toast } from 'react-toastify';

interface Job {
  id: string;
  title: string;
  company: string;
  link: string;
  source: string;
  location?: string;
  postedAt?: string;
  isApplied: boolean;
  isNewListing: boolean;
  createdAt: string;
  isScam: boolean;
  scamReason?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userPlan, setUserPlan] = useState<'FREE' | 'PRO' | 'TEAM'>('FREE');
  const [settings, setSettings] = useState<any>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);

  // Modals State
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null);
  const [selectedJobForDelete, setSelectedJobForDelete] = useState<Job | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/jobs?filter=${filter}&search=${search}`);
      const data = await res.json();
      if (data.success) {
        setJobs(data.data);
      } else {
        setError(data.error);
      }

      // Fetch user plan
      const settingsRes = await fetch('/api/settings');
      const settingsData = await settingsRes.json();
      if (settingsData.success) {
        setUserPlan(settingsData.data.plan || 'FREE');
        setSettings(settingsData.data);
      }
    } catch (err) {
      setError('Failed to fetch jobs. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleDeleteConfirm = async () => {
    if (!selectedJobForDelete) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/jobs?id=${selectedJobForDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setJobs(jobs.filter(job => job.id !== selectedJobForDelete.id));
        toast.success('Job removed successfully');
        setSelectedJobForDelete(null);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      toast.error('Failed to delete job');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearBoard = async () => {
    setIsClearing(true);
    try {
      const res = await fetch('/api/jobs/clear', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(`Cleared ${data.count} unapplied jobs`);
        fetchJobs();
        setShowClearModal(false);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      toast.error('Failed to clear board');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="animate-in">
      {/* --- MINIMALIST HEADER --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Board</span>
            <span className="text-slate-300 mx-1">/</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" suppressHydrationWarning>
              Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Job Board</h1>
            <span className={`text-[10px] px-2 py-0.5 rounded-lg border font-black uppercase tracking-widest ${
              userPlan === 'TEAM' ? 'bg-purple-50 border-purple-100 text-purple-600' :
              userPlan === 'PRO' ? 'bg-amber-50 border-amber-200 text-amber-600' :
              'bg-slate-100 border-slate-200 text-slate-500'
            }`}>
              {userPlan === 'TEAM' ? 'ELITE' : userPlan}
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Action Group */}
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
            <ScrapeButton onSuccess={() => fetchJobs()} />
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <button
              onClick={() => {
                setIsRefreshing(true);
                fetchJobs().then(() => setIsRefreshing(false));
              }}
              className="p-2.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
              title="Refresh Board"
            >
              <RefreshCw size={20} className={isRefreshing ? 'animate-spin text-blue-600' : ''} />
            </button>
          </div>

          {/* Secondary Actions */}
          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={() => setShowConfigModal(true)}
              className="p-3 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
              title="Settings"
            >
              <SettingsIcon size={20} />
            </button>
            <button
              onClick={() => window.open('/api/jobs/export', '_blank')}
              className="p-3 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
              title="Download CSV"
            >
              <Download size={20} />
            </button>
            <button
              onClick={() => setShowClearModal(true)}
              className="p-3 rounded-2xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
              title="Clear Board"
            >
              <Trash2 size={20} />
            </button>
            {userPlan === 'FREE' && (
              <button
                onClick={() => setShowPlanModal(true)}
                className="ml-2 px-5 py-2.5 rounded-2xl bg-amber-500 text-white font-bold text-xs uppercase tracking-widest hover:bg-amber-600 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                Upgrade
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- MODERN SEARCH & FILTERS --- */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-10 w-full">
        <div className="relative flex-grow group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search jobs, companies, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 pl-14 pr-6 rounded-[20px] bg-white border border-slate-200 shadow-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-slate-900"
          />
        </div>
        
        <div className="flex items-center p-1.5 bg-slate-100/80 backdrop-blur-sm rounded-[20px] border border-slate-200 shrink-0">
          {['all', 'new', 'applied'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-8 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                filter === f
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      {loading && !isRefreshing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-[32px] p-6 space-y-6 shadow-sm overflow-hidden relative">
               {/* Shimmer Effect */}
               <div className="absolute inset-0 -translate-x-full animate-[shimmer-slide_2s_infinite] bg-gradient-to-r from-transparent via-slate-50/50 to-transparent" />
               
               <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 shrink-0" />
                  <div className="flex-1 space-y-3">
                     <div className="h-5 bg-slate-100 rounded-lg w-3/4" />
                     <div className="h-4 bg-slate-50 rounded-lg w-1/2" />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50/50 rounded-2xl">
                  <div className="h-8 bg-white/80 rounded-xl" />
                  <div className="h-8 bg-white/80 rounded-xl" />
               </div>

               <div className="flex justify-between items-center pt-2">
                  <div className="h-4 bg-slate-100 rounded-md w-24" />
                  <div className="h-9 bg-slate-200 rounded-xl w-24" />
               </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-2xl border border-slate-200">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-5 ring-8 ring-red-50/50">
            <AlertCircle size={28} className="text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Could not load jobs</h3>
          <p className="text-slate-600 mb-8 max-w-sm text-sm">{error}</p>
          <button
            type="button"
            onClick={fetchJobs}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-md shadow-blue-600/25 hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center bg-white border border-dashed border-slate-200 rounded-[40px] p-12 transition-all animate-in fade-in zoom-in-95 duration-500">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-100 blur-3xl opacity-30 rounded-full animate-pulse" />
            <div className="relative w-24 h-24 rounded-[32px] bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center shadow-xl shadow-blue-600/5">
              <Briefcase size={40} className="text-blue-600" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-lg flex items-center justify-center">
              <Zap size={20} className="text-amber-500 fill-amber-500" />
            </div>
          </div>
          
          <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Board is currently empty</h3>
          <p className="text-slate-500 text-base max-w-sm leading-relaxed mb-10">
            Start your hunt by running a fresh scrape. We'll find the best {settings?.scraperQuery || 'React'} jobs across the web for you.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => setShowConfigModal(true)}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-95"
            >
              <SettingsIcon size={18} />
              Configure Search
            </button>
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-100 w-full max-w-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Automated Job Tracking System</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="card-glow group relative flex h-full flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-shadow duration-300 hover:border-blue-200/80 hover:shadow-md"
            >
              {job.isNewListing && (
                <div className="absolute left-4 top-4 z-10 rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm ring-2 ring-white">
                  New
                </div>
              )}

              {job.isScam && (
                userPlan === 'TEAM' ? (
                  <div className="absolute left-16 top-4 z-10 rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm ring-2 ring-white animate-pulse">
                    Scam Alert
                  </div>
                ) : (
                  <div className="absolute left-16 top-4 z-10 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm ring-2 ring-white flex items-center gap-1">
                    <Lock size={10} /> Scam Locked
                  </div>
                )
              )}

              <div
                className={`mb-5 flex items-start justify-between gap-3 ${job.isNewListing || job.isScam ? 'pt-7 sm:pt-6' : 'pt-0.5'}`}
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-sky-50 text-xl font-bold text-blue-800 shadow-sm">
                    {job.company.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1 pr-2">
                    <h3 className="mb-1.5 line-clamp-2 text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-700">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                      <Building2 size={14} className="shrink-0 text-slate-400" />
                      <span className="truncate">{job.company}</span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1.5 self-start">
                  <button
                    type="button"
                    onClick={() => setSelectedJobForApply(job)}
                    className={`p-2 rounded-xl border transition-all duration-300 ${
                      job.isApplied
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-600'
                    }`}
                    title={job.isApplied ? 'Update tracking details' : 'Mark as applied'}
                  >
                    {job.isApplied ? (
                      <CheckCircle2 size={20} strokeWidth={2.5} />
                    ) : (
                      <Circle size={20} strokeWidth={2} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedJobForDelete(job)}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Remove"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200/80">
                      <MapPin size={14} className="text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Location</div>
                      <div className="text-xs font-medium text-slate-800 truncate max-w-[110px]">
                        {job.location || 'Remote'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200/80">
                      <Zap size={14} className="text-amber-500" />
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Salary (Est.)</div>
                      <div className="text-xs font-medium text-slate-800">
                        {job.salaryMin && userPlan !== 'FREE' ? (
                          <>
                            {job.currency === 'PHP' ? '₱' : '$'}
                            {Intl.NumberFormat('en-US', { notation: 'compact' }).format(job.salaryMin)}
                            {job.salaryMax && job.salaryMax !== job.salaryMin ? ` - ${Intl.NumberFormat('en-US', { notation: 'compact' }).format(job.salaryMax)}` : ''}
                          </>
                        ) : 'Locked'}
                      </div>
                    </div>
                </div>
              </div>

              {job.isScam && (
                userPlan === 'TEAM' ? (
                  job.scamReason && (
                    <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2.5">
                      <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                      <p className="text-[11px] text-red-700 font-medium leading-tight">
                        <span className="font-bold">Flagged:</span> {job.scamReason}
                      </p>
                    </div>
                  )
                ) : (
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPlanModal(true);
                    }}
                    className="mb-5 p-3 rounded-xl bg-amber-50/40 border border-amber-100/60 flex items-center justify-between gap-2 hover:bg-amber-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Lock size={12} className="text-amber-600 shrink-0" />
                      <span className="text-[10px] text-amber-800 font-black uppercase tracking-wider">Scam Shield Pro</span>
                    </div>
                    <span className="text-[8px] text-blue-600 font-extrabold uppercase tracking-widest hover:underline">Unlock in Elite</span>
                  </div>
                )
              )}

              <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block mb-0.5">
                    Source
                  </span>
                  <span className="text-xs font-semibold text-blue-700 truncate block">{job.source}</span>
                </div>
                <a
                  href={job.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold uppercase tracking-wide hover:bg-blue-700 shadow-sm transition-colors group/link"
                >
                  Apply{' '}
                  <ArrowUpRight
                    size={14}
                    className="transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                  />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <ConfigModal 
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSuccess={() => fetchJobs()}
      />

      <PlanModal 
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
      />

      <DeleteModal
        title="All Unapplied Jobs"
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearBoard}
        loading={isClearing}
      />

      {selectedJobForApply && (
        <ApplyModal 
          job={selectedJobForApply} 
          onClose={() => setSelectedJobForApply(null)} 
          onSuccess={() => fetchJobs()} 
        />
      )}

      {selectedJobForDelete && (
        <DeleteModal
          title={selectedJobForDelete.title}
          isOpen={!!selectedJobForDelete}
          onClose={() => setSelectedJobForDelete(null)}
          onConfirm={handleDeleteConfirm}
          loading={isDeleting}
        />
      )}
    </div>
  );
}
