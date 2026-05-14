'use client';
// Clean dashboard without animations

import { useState, useEffect } from 'react';
import {
  BarChart3,
  PieChart,
  Briefcase,
  CheckCircle,
  Clock,
  TrendingUp,
  Target,
  Zap,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

interface Stats {
  total: number;
  applied: number;
  new: number;
  sources: { id: string; count: number }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="space-y-8 animate-in">
      <div className="skeleton h-32 rounded-3xl w-full" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-40 rounded-3xl" />)}
      </div>
    </div>
  );

  const statCards = [
    {
      label: 'Total listings',
      value: stats?.total || 0,
      icon: Briefcase,
      gradient: 'from-blue-600 to-blue-800',
      shadow: 'shadow-blue-600/25',
    },
    {
      label: 'Applications',
      value: stats?.applied || 0,
      icon: CheckCircle,
      gradient: 'from-sky-500 to-blue-600',
      shadow: 'shadow-sky-500/20',
    },
    {
      label: 'New leads',
      value: stats?.new || 0,
      icon: Zap,
      gradient: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/20',
    },
    {
      label: 'Apply rate',
      value: stats?.total ? Math.round((stats.applied / stats.total) * 100) + '%' : '0%',
      icon: Target,
      gradient: 'from-indigo-600 to-blue-800',
      shadow: 'shadow-indigo-600/20',
    },
  ];

  return (
    <div className="animate-in">
      {/* Welcome Header */}
      <div className="premium-card p-6 md:p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-56 h-56 bg-blue-400/10 blur-[70px] rounded-full -translate-y-1/3 translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-blue-600" />
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Overview</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">
              Welcome back, <span className="gradient-text">candidate</span>
            </h1>
            <p className="text-slate-600 text-sm md:text-base max-w-lg">
              <span className="font-semibold text-blue-700">{stats?.new} new listings</span> since your last sync — review them on the job board.
            </p>
          </div>

          <div className="shrink-0 rounded-xl border border-slate-200 bg-white px-5 py-3 text-center shadow-sm">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Status</div>
            <div className="text-sm font-semibold text-emerald-700 flex items-center gap-2 justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
              Operational
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="premium-card p-5 group relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${card.gradient} opacity-[0.07] blur-2xl group-hover:opacity-[0.12] transition-opacity`} />

              <div className="flex items-center justify-between mb-4 relative">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${card.gradient} shadow-md ${card.shadow}`}
                >
                  <Icon size={20} />
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 group-hover:border-blue-100 group-hover:bg-blue-50/50 transition-colors">
                  <ArrowUpRight size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>

              <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-1 tabular-nums relative">{card.value}</div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide relative">{card.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Sources Chart (Left) */}
        <div className="lg:col-span-3 premium-card p-6 md:p-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <PieChart className="text-blue-600" size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Listings by source</h3>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 w-fit">
              Live
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            {stats?.sources.map((source, idx) => (
              <div key={source.id} className="group">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${idx === 0 ? 'bg-blue-600' : idx === 1 ? 'bg-sky-500' : 'bg-blue-400'}`}
                    />
                    <span className="text-sm font-semibold text-slate-800 uppercase tracking-wide truncate">
                      {source.id}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-blue-700 tabular-nums shrink-0 ml-2">
                    {Math.round((source.count / (stats.total || 1)) * 100)}%
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${idx === 0 ? 'bg-blue-600' : idx === 1 ? 'bg-sky-500' : 'bg-blue-400'}`}
                    style={{ width: `${(source.count / (stats.total || 1)) * 100}%` }}
                  />
                </div>
                <div className="mt-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide text-right">
                  {source.count} jobs
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Summary (Right) */}
        <div className="lg:col-span-2 premium-card p-6 md:p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <TrendingUp className="text-blue-600" size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Trends</h3>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 group hover:border-blue-200 transition-colors">
            <div className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm group-hover:border-blue-100 transition-colors">
              <BarChart3 size={26} className="text-slate-400 group-hover:text-blue-600" />
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-1">Historical analytics</p>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
              Velocity charts will appear after your first full week of scrapes.
            </p>
          </div>

          <button
            type="button"
            className="mt-6 w-full py-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold uppercase tracking-wide text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            View report
          </button>
        </div>
      </div>
    </div>
  );
}