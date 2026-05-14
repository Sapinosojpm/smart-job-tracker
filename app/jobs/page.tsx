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
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100 text-[10px] font-semibold text-blue-800 uppercase tracking-wide">
              Live feed
            </div>
            <span className="text-slate-300">·</span>
            <span
              className="text-[10px] font-semibold uppercase tracking-wide text-slate-500"
              suppressHydrationWarning
            >
              Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2 flex items-center gap-3">
            <span className="gradient-text">Job board</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-black uppercase tracking-widest ${
              userPlan === 'TEAM' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' :
              userPlan === 'PRO' ? 'bg-amber-50 border-amber-200 text-amber-600' :
              'bg-slate-100 border-slate-200 text-slate-500'
            }`}>
              {userPlan}
            </span>
          </h1>
          <p className="text-slate-600 max-w-xl text-sm md:text-base leading-relaxed">
            Manage your search targets and view opportunities in real-time.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {userPlan === 'FREE' && (
            <button
              onClick={() => setShowPlanModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-100 bg-amber-50 text-amber-600 font-bold text-sm hover:bg-amber-100 transition-all shadow-sm active:scale-95 animate-pulse"
            >
              <Zap size={18} fill="currentColor" />
              Upgrade to PRO
            </button>
          )}

          <button
            onClick={() => window.open('/api/jobs/export', '_blank')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-100 bg-blue-50/50 text-blue-600 font-semibold text-sm hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm active:scale-95"
          >
            <ArrowUpRight size={18} />
            Download CSV
          </button>

          <button
            onClick={() => setShowClearModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-100 bg-red-50/50 text-red-600 font-semibold text-sm hover:bg-red-50 hover:border-red-200 transition-all shadow-sm active:scale-95"
          >
            <Trash2 size={18} />
            Clear Board
          </button>

          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:border-blue-200 hover:bg-blue-50/50 transition-all shadow-sm active:scale-95"
          >
            <SettingsIcon size={18} className="text-slate-400" />
            Configure Scraper
          </button>
          
          <ScrapeButton onSuccess={() => fetchJobs()} />
          
          <button
            onClick={() => {
              setIsRefreshing(true);
              fetchJobs().then(() => setIsRefreshing(false));
            }}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-blue-200 hover:bg-blue-50/50 transition-all active:scale-[0.98]"
            title="Refresh list"
            type="button"
          >
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin text-blue-600' : ''} />
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="glass mb-8 flex flex-col gap-2 rounded-2xl border border-slate-200/90 p-2 shadow-sm md:flex-row md:items-center">
        <div className="relative flex-1 w-full group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Quick search results..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-transparent bg-white/80 py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 shadow-inner placeholder:text-slate-400 focus:border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-full md:w-auto border border-slate-200/80">
          {['all', 'new', 'applied'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all whitespace-nowrap flex-1 md:flex-none ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:text-slate-900'
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
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-64 rounded-3xl" />
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
        <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-2xl border border-dashed border-slate-300 bg-slate-50/30">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-5">
            <Layers size={28} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No jobs match</h3>
          <p className="text-slate-600 text-sm max-w-md">Change filters or run a scrape to populate the board.</p>
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

              {job.isScam && userPlan !== 'FREE' && (
                <div className="absolute left-16 top-4 z-10 rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm ring-2 ring-white animate-pulse">
                  Scam Alert
                </div>
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

              {job.isScam && job.scamReason && userPlan !== 'FREE' && (
                <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2.5">
                  <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-red-700 font-medium leading-tight">
                    <span className="font-bold">Flagged:</span> {job.scamReason}
                  </p>
                </div>
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
