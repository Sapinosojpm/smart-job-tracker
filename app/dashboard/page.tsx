'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  Briefcase, 
  CheckCircle, 
  Zap, 
  BarChart3, 
  LayoutDashboard, 
  Calendar, 
  ArrowUpRight, 
  TrendingUp,
  Target,
  Rocket,
  Clock,
  ArrowRight
} from 'lucide-react';

interface Stats {
  total: number;
  applied: number;
  new: number;
  successRate: number;
  sources: { source: string; count: number }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        // Fetch Stats
        const statsRes = await fetch('/api/stats');
        const statsData = await statsRes.json();
        if (statsData.success) setStats(statsData.data);

        // Fetch Settings (for plan)
        const settingsRes = await fetch('/api/settings');
        const settingsData = await settingsRes.json();
        if (settingsData.success) setSettings(settingsData.data);

      } catch (err) {
        console.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="space-y-8 animate-pulse p-4">
      <div className="h-48 rounded-[40px] bg-slate-50 border border-slate-100" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => <div key={i} className="h-40 rounded-[32px] bg-slate-50 border border-slate-100" />)}
      </div>
    </div>
  );

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'User';
  const userPlan = settings?.plan || 'FREE';
  const displayPlan = userPlan === 'TEAM' ? 'Elite Plan' : userPlan === 'PRO' ? 'Pro Plan' : 'Free Tier';

  const statCards = [
    {
      label: 'Total Listings',
      value: stats?.total || 0,
      icon: Briefcase,
      color: 'blue',
    },
    {
      label: 'Applications',
      value: stats?.applied || 0,
      icon: Target,
      color: 'indigo',
    },
    {
      label: 'New Leads',
      value: stats?.new || 0,
      icon: Rocket,
      color: 'blue',
    },
    {
      label: 'Success Rate',
      value: `${stats?.successRate || 0}%`,
      icon: TrendingUp,
      color: 'emerald',
    },
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* --- MINIMALIST HERO --- */}
      <div className="mb-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dashboard Overview</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Welcome back, <span className="text-blue-600">{firstName}</span>.
            </h1>
            <p className="text-slate-500 font-medium text-lg max-w-lg">
              You have <span className="text-slate-900 font-bold">{stats?.new || 0} new opportunities</span> ready for review.
            </p>
          </div>

          <div className="flex items-center gap-4">
             <div className="bg-white border border-slate-100 rounded-[28px] p-5 pr-8 flex items-center gap-4 shadow-sm group hover:shadow-md transition-all">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                  userPlan === 'TEAM' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-400'
                }`}>
                   <Zap size={22} strokeWidth={1.5} />
                </div>
                <div>
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Status</div>
                   <div className="text-sm font-bold text-slate-900">{displayPlan}</div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white border border-slate-100 rounded-[32px] p-8 hover:shadow-xl hover:shadow-blue-900/5 transition-all group">
            <div className="flex items-center justify-between mb-6">
               <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors border border-transparent group-hover:border-blue-100">
                  <stat.icon size={22} strokeWidth={1.5} />
               </div>
               <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-blue-400 transition-colors">Real-time</div>
            </div>
            <div className="text-4xl font-black text-slate-900 mb-1 tracking-tight">{stat.value}</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Source Distribution */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[40px] p-8 md:p-10 shadow-sm">
          <div className="flex items-center justify-between mb-10">
             <div>
                <h3 className="text-xl font-black text-slate-900">Job Distribution</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Top performing sources</p>
             </div>
             <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <BarChart3 size={18} strokeWidth={1.5} />
             </div>
          </div>

          <div className="space-y-8">
            {stats?.sources?.map((item, index) => {
              const percentage = Math.round((item.count / (stats?.total || 1)) * 100);
              return (
                <div key={item.source} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3">
                       <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Source 0{index + 1}</span>
                       <span className="text-sm font-bold text-slate-900 uppercase tracking-tight">{item.source} <span className="text-slate-300 mx-1">/</span> {item.count}</span>
                    </div>
                    <span className="text-lg font-black text-blue-600">{percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out shadow-sm"
                      style={{ width: `${percentage}%`, transitionDelay: `${index * 100}ms` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions / Recent Activity */}
        <div className="space-y-6">
           <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-[40px] p-10 relative overflow-hidden group h-full flex flex-col justify-between shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400 blur-[80px] opacity-20 pointer-events-none" />
              
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-8 border border-blue-100 shadow-sm">
                   <Zap size={22} strokeWidth={1.5} className="text-blue-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">Elite Insights</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10">
                   Your current application success rate is <span className="text-blue-600 font-bold">{stats?.successRate}% higher</span> than the average user in your niche.
                </p>
              </div>

              <button className="flex items-center justify-between w-full p-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white transition-all group/btn font-bold text-sm shadow-lg shadow-blue-600/20">
                 <span>View Detailed Analytics</span>
                 <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}