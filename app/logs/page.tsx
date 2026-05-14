'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Database,
  History,
  Activity,
} from 'lucide-react';

interface LogEntry {
  id: string; // Updated from _id
  startedAt: string;
  finishedAt: string | null;
  status: string;
  source: string | null;
  keywords: string[];
  jobsFound: number;
  jobsInserted: number;
  jobsDuplicated: number;
  error?: string | null;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/logs?limit=50');
        const data = await res.json();
        if (data.success) {
          setLogs(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return (
    <div className="space-y-8 animate-in p-8">
       <div className="skeleton h-32 rounded-[40px] w-full" />
       <div className="skeleton h-96 rounded-[40px] w-full" />
    </div>
  );

  return (
    <div className="animate-in p-4 md:p-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-blue-600 ring-4 ring-blue-100" />
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Telemetry</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">
            <span className="gradient-text">Scraper logs</span>
          </h1>
          <p className="text-slate-600 text-sm md:text-base max-w-xl">
            Background runs and manual syncs — newest first.
          </p>
        </div>

        <div className="flex items-stretch sm:items-center gap-3">
          <div className="glass px-5 py-3 rounded-xl border border-slate-100 flex items-center gap-5 shadow-sm">
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Runs</div>
              <div className="text-xl font-bold text-slate-900 tabular-nums">{logs?.length || 0}</div>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Success</div>
              <div className="text-xl font-bold text-emerald-700 tabular-nums">
                {logs?.length > 0 ? Math.round((logs.filter((l) => l.status === 'success').length / logs.length) * 100) : 0}
                %
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden border border-slate-200 relative shadow-sm">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600" />
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                  Date
                </th>
                <th className="px-4 py-4 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-4 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                  Keywords
                </th>
                <th className="px-4 py-4 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                  Found
                </th>
                <th className="px-4 py-4 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                  New
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!logs || logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <History size={40} className="mb-3 text-slate-300" />
                      <p className="font-semibold text-sm text-slate-600">No runs yet</p>
                      <p className="text-xs text-slate-500 mt-1">Trigger a scrape from the job board.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const duration = log.finishedAt 
                    ? Math.round((new Date(log.finishedAt).getTime() - new Date(log.startedAt).getTime()) / 1000)
                    : 0;
                  
                  return (
                    <tr key={log.id} className="hover:bg-blue-50/40 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                            <Activity size={16} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              {new Date(log.startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                            <div className="text-[11px] font-medium text-slate-500 tabular-nums">
                              {new Date(log.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                            log.status === 'success'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : log.status === 'error'
                                ? 'bg-red-50 text-red-800 border-red-200'
                                : 'bg-amber-50 text-amber-900 border-amber-200'
                          }`}
                        >
                          {log.status === 'success' ? <CheckCircle2 size={12} /> : log.status === 'error' ? <XCircle size={12} /> : <Clock size={12} />}
                          {log.status}
                        </div>
                        {log.error && (
                          <div
                            className="mt-2 text-[10px] text-red-600 max-w-[220px] truncate font-medium"
                            title={log.error}
                          >
                            {log.error}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[240px]">
                          {log.keywords && log.keywords.length > 0 ? (
                            log.keywords.map((kw, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-600 border border-slate-200"
                              >
                                {kw}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center tabular-nums">
                        <div className="text-sm font-semibold text-slate-800">{log.jobsFound}</div>
                      </td>
                      <td className="px-4 py-4 text-center tabular-nums">
                        <div className="text-sm font-semibold text-blue-700">{log.jobsInserted}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-semibold text-slate-700 tabular-nums">{duration}s</div>
                        <div className="text-[10px] font-medium text-slate-400">elapsed</div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
            <Database size={12} className="text-slate-400" />
            Last 50 entries
          </div>
          <div className="text-[10px] font-medium text-slate-400">Times shown in your local timezone</div>
        </div>
      </div>
    </div>
  );
}
