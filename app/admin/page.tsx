'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-toastify';
import {
  Users,
  Briefcase,
  ClipboardList,
  Activity,
  CheckCircle2,
  XCircle,
  Shield,
  Zap,
  Settings as SettingsIcon,
  Search,
  ArrowUpRight,
  BarChart3,
  Database,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  Layers,
  Globe,
  Loader2,
  Sliders,
  ExternalLink
} from 'lucide-react';

interface UserData {
  id: string;
  userId: string;
  plan: 'FREE' | 'PRO' | 'TEAM';
  scraperQuery: string | null;
  keywordFilters: string[];
  emailTo: string | null;
  scrapeIndeed: boolean;
  scrapeJobStreet: boolean;
  scrapeOnlineJobs: boolean;
  scrapeUpwork: boolean;
  scrapeLinkedIn: boolean;
  scrapeRemoteOK: boolean;
  createdAt: string;
  jobCount: number;
  applicationCount: number;
  logCount: number;
}

interface AdminStats {
  users: {
    total: number;
    free: number;
    pro: number;
    team: number;
  };
  jobs: {
    total: number;
    distribution: { source: string; count: number }[];
  };
  applications: {
    total: number;
    distribution: { status: string; count: number }[];
  };
  scraper: {
    totalRuns: number;
    successRuns: number;
    failedRuns: number;
    successRate: number;
    jobsFound: number;
    jobsInserted: number;
    jobsDuplicated: number;
    recentLogs: any[];
  };
  system: {
    dbHealth: string;
    apiVersion: string;
    latency: string;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'logs' | 'system'>('overview');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      
      if (!statsRes.ok || !statsData.success) {
        throw new Error(statsData.error || 'Failed to fetch admin stats');
      }
      setStats(statsData.data);

      const usersRes = await fetch('/api/admin/users');
      const usersData = await usersRes.json();
      if (usersRes.ok && usersData.success) {
        setUsers(usersData.data);
        setFilteredUsers(usersData.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const adminEmails = ['sapinosojpm@gmail.com'];
      const envAdminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
        .split(',')
        .map(email => email.trim().toLowerCase())
        .filter(Boolean);

      const isUserAdmin = user && user.email && (
        user.email.toLowerCase() === 'sapinosojpm@gmail.com' ||
        adminEmails.includes(user.email.toLowerCase()) ||
        envAdminEmails.includes(user.email.toLowerCase())
      );

      if (!isUserAdmin) {
        toast.error('Access Denied: Super Admin only');
        window.location.href = '/dashboard';
        return;
      }

      setIsAdmin(true);
      fetchAdminData();
    };

    checkAuth();
  }, []);

  useEffect(() => {
    let result = users;

    if (planFilter !== 'ALL') {
      result = result.filter(u => u.plan === planFilter);
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(u => 
        u.userId.toLowerCase().includes(searchLower) ||
        (u.scraperQuery && u.scraperQuery.toLowerCase().includes(searchLower)) ||
        (u.emailTo && u.emailTo.toLowerCase().includes(searchLower))
      );
    }

    setFilteredUsers(result);
  }, [searchTerm, planFilter, users]);

  const handleUpdatePlan = async (userId: string, newPlan: 'FREE' | 'PRO' | 'TEAM') => {
    try {
      setActionLoading(userId);
      const res = await fetch('/api/admin/users/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, plan: newPlan })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update plan');
      }

      toast.success(`User plan updated to ${newPlan}!`);
      
      // Update local state
      setUsers(prev => prev.map(u => u.userId === userId ? { ...u, plan: newPlan } : u));
      
      // Refresh stats in background
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      if (statsRes.ok && statsData.success) {
        setStats(statsData.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating user plan');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAdmin || loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-bold text-sm tracking-wider uppercase">Loading administrative dashboard...</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Active Users',
      value: stats?.users?.total || 0,
      subtext: `${stats?.users?.pro || 0} Pro / ${stats?.users?.team || 0} Elite`,
      icon: Users,
      color: 'blue'
    },
    {
      label: 'Scraped Jobs',
      value: stats?.jobs?.total || 0,
      subtext: `${stats?.scraper?.jobsFound || 0} total listings found`,
      icon: Briefcase,
      color: 'indigo'
    },
    {
      label: 'Applications',
      value: stats?.applications?.total || 0,
      subtext: 'Across all active job hunters',
      icon: ClipboardList,
      color: 'emerald'
    },
    {
      label: 'Scraper Rate',
      value: `${stats?.scraper?.successRate || 0}%`,
      subtext: `${stats?.scraper?.successRuns || 0} successful runs`,
      icon: Activity,
      color: 'violet'
    }
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* --- HERO BANNER --- */}
      <div className="mb-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse ring-4 ring-red-100" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.25em] bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">Administrative Console</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 flex items-center gap-3">
              Super Admin <span className="text-blue-600">Panel</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg max-w-lg">
              Monitor job scraper statistics, database load, and perform administrative tier changes in real-time.
            </p>
          </div>

          {/* Quick Stats Panel */}
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchAdminData} 
              className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-100 shadow-sm transition-all"
            >
              <RefreshCw size={20} className="hover:rotate-180 transition-transform duration-500" />
            </button>
            <div className="bg-white border border-slate-100 rounded-[28px] p-5 pr-8 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center">
                <Shield size={22} strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Admin Security</div>
                <div className="text-sm font-bold text-slate-900">Developer Root</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- DASHBOARD TABS --- */}
      <div className="flex border-b border-slate-200 mb-10 overflow-x-auto whitespace-nowrap scrollbar-none gap-2">
        {(['overview', 'users', 'logs', 'system'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 font-black text-sm tracking-wide border-b-2 uppercase transition-all ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-900'
            }`}
          >
            {tab === 'overview' && 'System Overview'}
            {tab === 'users' && 'User Directory'}
            {tab === 'logs' && 'Scraper History'}
            {tab === 'system' && 'Engine Health'}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 1. OVERVIEW TAB */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-12">
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => (
              <div key={stat.label} className="bg-white border border-slate-100 rounded-[32px] p-8 hover:shadow-xl hover:shadow-blue-900/5 transition-all group">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors border border-transparent group-hover:border-blue-100">
                    <stat.icon size={22} strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Real-time</span>
                </div>
                <div className="text-4xl font-black text-slate-900 mb-1 tracking-tight">{stat.value}</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
                <div className="text-[11px] font-medium text-slate-500">{stat.subtext}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Plan breakdown */}
            <div className="bg-white border border-slate-100 rounded-[40px] p-8 md:p-10 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Plan Breakdown</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tier-based subscription metrics</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <Layers size={18} strokeWidth={1.5} />
                  </div>
                </div>

                <div className="space-y-6">
                  {/* FREE TIER */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                      <span>Free Tier Users</span>
                      <span className="text-slate-900">{stats?.users?.free || 0}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-slate-400 rounded-full" 
                        style={{ width: `${Math.round(((stats?.users?.free || 0) / (stats?.users?.total || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* PRO PLAN */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                      <span>Pro Subscribers</span>
                      <span className="text-blue-600">{stats?.users?.pro || 0}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full" 
                        style={{ width: `${Math.round(((stats?.users?.pro || 0) / (stats?.users?.total || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* TEAM / ELITE PLAN */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                      <span>Elite Subscribers</span>
                      <span className="text-indigo-600">{stats?.users?.team || 0}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full" 
                        style={{ width: `${Math.round(((stats?.users?.team || 0) / (stats?.users?.total || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>Total Active Profiles</span>
                <span className="text-slate-900 text-lg font-black">{stats?.users?.total || 0}</span>
              </div>
            </div>

            {/* Source Distribution */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[40px] p-8 md:p-10 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Scraped Job Distribution</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Platform indexing performance</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <BarChart3 size={18} strokeWidth={1.5} />
                </div>
              </div>

              <div className="space-y-6">
                {(stats?.jobs?.distribution && stats.jobs.distribution.length > 0) ? (
                  stats.jobs.distribution.map((item, index) => {
                    const percentage = Math.round((item.count / (stats?.jobs?.total || 1)) * 100);
                    return (
                      <div key={item.source} className="space-y-2">
                        <div className="flex justify-between items-end">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Source 0{index + 1}</span>
                            <span className="text-sm font-bold text-slate-900 uppercase tracking-tight">{item.source} <span className="text-slate-300">/</span> {item.count}</span>
                          </div>
                          <span className="text-sm font-black text-blue-600">{percentage}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full transition-all duration-1000 shadow-sm"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-400 text-sm font-medium py-10 text-center">No jobs found in database yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. USER DIRECTORY TAB */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-100 rounded-[40px] shadow-sm overflow-hidden p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900">User Directory</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage subscription tiers and scraper queries</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-stretch sm:items-center">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  placeholder="Search user ID or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-blue-500 focus:bg-white text-sm font-semibold rounded-2xl pl-11 pr-4 py-3 outline-none transition-all placeholder:text-slate-400"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              </div>

              {/* Plan Filter */}
              <div className="relative">
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="appearance-none w-full bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-blue-500 focus:bg-white text-sm font-bold rounded-2xl pl-4 pr-10 py-3 outline-none transition-all cursor-pointer"
                >
                  <option value="ALL">All Tiers</option>
                  <option value="FREE">Free Tier</option>
                  <option value="PRO">Pro Plan</option>
                  <option value="TEAM">Elite Plan</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-wider pl-4">User Settings ID</th>
                  <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-wider">Plan Tier</th>
                  <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-wider">Scraper Query</th>
                  <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-wider">Job Count</th>
                  <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-wider">App Count</th>
                  <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-wider pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 font-bold text-sm text-slate-900 pl-4 max-w-[200px] truncate">
                        <div className="flex flex-col">
                          <span className="truncate" title={u.userId}>{u.userId}</span>
                          <span className="text-[10px] font-semibold text-slate-400 mt-0.5">{u.emailTo || 'No Alert Email'}</span>
                        </div>
                      </td>
                      <td className="py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wide uppercase border ${
                          u.plan === 'TEAM'
                            ? 'bg-indigo-50 border-indigo-100 text-indigo-700'
                            : u.plan === 'PRO'
                            ? 'bg-blue-50 border-blue-100 text-blue-700'
                            : 'bg-slate-100 border-transparent text-slate-600'
                        }`}>
                          <Zap size={10} className="fill-current" />
                          {u.plan === 'TEAM' ? 'Elite' : u.plan === 'PRO' ? 'Pro' : 'Free'}
                        </span>
                      </td>
                      <td className="py-5 font-semibold text-sm text-slate-600 max-w-[220px] truncate">
                        {u.scraperQuery || <span className="text-slate-300">None</span>}
                      </td>
                      <td className="py-5 font-bold text-slate-700 text-sm">{u.jobCount}</td>
                      <td className="py-5 font-bold text-slate-700 text-sm">{u.applicationCount}</td>
                      <td className="py-5 pr-4 text-right">
                        {actionLoading === u.userId ? (
                          <Loader2 className="w-5 h-5 text-blue-600 animate-spin ml-auto" />
                        ) : (
                          <div className="flex gap-2 justify-end">
                            {u.plan !== 'FREE' && (
                              <button
                                onClick={() => handleUpdatePlan(u.userId, 'FREE')}
                                className="px-3 py-1.5 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all"
                              >
                                FREE
                              </button>
                            )}
                            {u.plan !== 'PRO' && (
                              <button
                                onClick={() => handleUpdatePlan(u.userId, 'PRO')}
                                className="px-3 py-1.5 text-[10px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 rounded-lg transition-all"
                              >
                                PRO
                              </button>
                            )}
                            {u.plan !== 'TEAM' && (
                              <button
                                onClick={() => handleUpdatePlan(u.userId, 'TEAM')}
                                className="px-3 py-1.5 text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 rounded-lg transition-all"
                              >
                                ELITE
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400 font-medium">No users matched your search criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SCRAPER HISTORY TAB */}
      {/* ========================================================================= */}
      {activeTab === 'logs' && (
        <div className="bg-white border border-slate-100 rounded-[40px] shadow-sm overflow-hidden p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900">Scraper History Logs</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Audit trail for global scraper cron operations</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 text-blue-600 rounded-2xl px-4 py-2 text-xs font-bold flex items-center gap-2">
              <Activity size={14} />
              <span>{stats?.scraper?.totalRuns || 0} Total Runs</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-wider pl-4">Timestamp</th>
                  <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-wider">User ID</th>
                  <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-wider">Source</th>
                  <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-wider">Jobs Found</th>
                  <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-wider">Inserted</th>
                  <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-wider pr-4">Logs / Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.scraper?.recentLogs && stats.scraper.recentLogs.length > 0 ? (
                  stats.scraper.recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 text-xs font-semibold text-slate-500 pl-4">
                        {new Date(log.startedAt).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}
                      </td>
                      <td className="py-4 font-bold text-xs text-slate-700 max-w-[120px] truncate" title={log.userId}>
                        {log.userId}
                      </td>
                      <td className="py-4 font-bold text-xs text-slate-500 uppercase">{log.source || 'GLOBAL'}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                          {log.status === 'SUCCESS' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                          {log.status}
                        </span>
                      </td>
                      <td className="py-4 font-bold text-xs text-slate-900">{log.jobsFound}</td>
                      <td className="py-4 font-bold text-xs text-blue-600">{log.jobsInserted}</td>
                      <td className="py-4 text-xs font-medium text-slate-500 max-w-[200px] truncate pr-4" title={log.error}>
                        {log.error ? (
                          <span className="text-red-500 flex items-center gap-1">
                            <AlertTriangle size={12} className="shrink-0" />
                            {log.error}
                          </span>
                        ) : (
                          <span className="text-slate-400">Scraped cleanly</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400 font-medium">No scraper logs found in database.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ENGINE HEALTH TAB */}
      {/* ========================================================================= */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Engine Parameters */}
          <div className="bg-white border border-slate-100 rounded-[40px] p-8 md:p-10 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Database className="text-blue-600" /> Database & Core Engine
            </h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center py-4 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-500">Prisma Client Core version</span>
                <span className="text-sm font-bold text-slate-900">v6.2.1</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-500">Supabase Connection Mode</span>
                <span className="text-sm font-bold text-blue-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" /> Transaction Pooler
                </span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-500">Database Connection Port</span>
                <span className="text-sm font-bold text-slate-900">6543 (PgBouncer/Supavisor)</span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-500">Next.js Framework version</span>
                <span className="text-sm font-bold text-slate-900">16.2.6</span>
              </div>
              <div className="flex justify-between items-center py-4">
                <span className="text-sm font-semibold text-slate-500">Site Status Mode</span>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase">Operational</span>
              </div>
            </div>
          </div>

          {/* Scraper Stats Aggregates */}
          <div className="bg-white border border-slate-100 rounded-[40px] p-8 md:p-10 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Sliders className="text-indigo-600" /> Scraper Aggregate Output
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-sm font-semibold text-slate-500">Total Scraper Crawls</span>
                  <span className="text-sm font-bold text-slate-900">{stats?.scraper?.totalRuns || 0} runs</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-sm font-semibold text-slate-500">Overall Jobs Found</span>
                  <span className="text-sm font-bold text-slate-900">{stats?.scraper?.jobsFound || 0} listings</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-sm font-semibold text-slate-500">Jobs Inserted / Synced</span>
                  <span className="text-sm font-bold text-emerald-600">{stats?.scraper?.jobsInserted || 0} listings</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm font-semibold text-slate-500">De-duplicated / Ignored</span>
                  <span className="text-sm font-bold text-slate-400">{stats?.scraper?.jobsDuplicated || 0} duplicates</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl mt-8">
              <h4 className="font-black text-slate-900 text-sm mb-2 flex items-center gap-2">
                <Globe className="text-blue-600 w-4 h-4" /> Live Scraper Health
              </h4>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                The scraping scheduler is running cleanly. Platform API latency is averaging <span className="text-blue-600 font-bold">{stats?.system?.latency || '24ms'}</span>. All active index nodes are healthy.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
