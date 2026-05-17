'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  BarChart3,
  ScrollText,
  Settings,
  Zap,
  ChevronRight,
  ClipboardList,
  FileText,
  Activity,
  Shield
} from 'lucide-react';

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    description: 'Stats & trends',
  },
  {
    href: '/jobs',
    label: 'Job Board',
    icon: Briefcase,
    description: 'Browse listings',
  },
  {
    href: '/applications',
    label: 'Application Log',
    icon: ClipboardList,
    description: 'Track progress',
  },
  {
    href: '/documents',
    label: 'Documents',
    icon: FileText,
    description: 'Resume & Letters',
  },
  {
    href: '/logs',
    label: 'Scraper Logs',
    icon: Activity,
    description: 'Run history',
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    description: 'Config alerts',
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    
    const checkAdminStatus = async () => {
      try {
        const { createClient } = await import('@/utils/supabase/client');
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        const adminEmails = ['sapinosojpm@gmail.com'];
        const envAdminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
          .split(',')
          .map(email => email.trim().toLowerCase())
          .filter(Boolean);

        if (user && user.email) {
          const email = user.email.toLowerCase();
          if (email === 'sapinosojpm@gmail.com' || adminEmails.includes(email) || envAdminEmails.includes(email)) {
            setIsAdmin(true);
          }
        }
      } catch (err) {
        console.error('Failed to check admin status in Sidebar:', err);
      }
    };

    checkAdminStatus();
  }, []);

  const itemsToShow = React.useMemo(() => {
    if (!isAdmin) return navItems;
    return [
      ...navItems.slice(0, 5),
      {
        href: '/admin',
        label: 'Admin Panel',
        icon: Shield,
        description: 'Site Performance',
      },
      navItems[5]
    ];
  }, [isAdmin]);

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col overflow-hidden border-r border-slate-200 bg-white shadow-[4px_0_24px_-12px_rgba(15,23,42,0.12)] print:hidden">
      <div className="border-b border-slate-100 px-6 py-6">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg shadow-blue-600/10 transition-all duration-300 group-hover:scale-[1.08] border border-slate-100 bg-white shrink-0">
            <img src="/logo.png" alt="Smart Job Tracker" className="w-full h-full object-contain p-1.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="font-bold text-[15px] tracking-tight text-slate-900 leading-tight">
                Smart Job
              </h1>
              <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[8px] font-black border border-blue-100 shadow-sm leading-none tracking-tighter uppercase">BETA</span>
            </div>
            <p className="text-[11px] font-semibold text-blue-600 tracking-wide">
              Tracker
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
        <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Menu</p>
        {itemsToShow.map((item) => {
          const isActive = mounted && (
            pathname === item.href ||
            (item.href !== '/jobs' && pathname.startsWith(item.href))
          );
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors duration-200 group relative ${
                isActive
                  ? 'bg-blue-50 text-blue-800 ring-1 ring-blue-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
              )}

              <Icon
                size={18}
                strokeWidth={2}
                className={`shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}
              />

              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold ${isActive ? 'text-slate-900' : ''}`}>
                  {item.label}
                </div>
                <div className="text-[11px] text-slate-500 truncate">{item.description}</div>
              </div>

              {isActive && (
                <ChevronRight size={14} className="text-blue-500 shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-100 bg-slate-50/90 px-4 py-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
              Scraper
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
              Active
            </span>
          </div>
          <p className="text-xs font-medium text-slate-600">Scheduled sync enabled</p>
          <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-blue-600 rounded-full" />
          </div>
        </div>

        <p className="mt-3 px-1 text-[10px] text-slate-400 font-medium">v1.2.0-BETA</p>
        
        <button
          onClick={async () => {
            const { createClient } = await import('@/utils/supabase/client');
            const supabase = createClient();
            await supabase.auth.signOut();
            window.location.href = '/';
          }}
          className="mt-4 flex w-full items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
        >
          <Zap size={14} className="rotate-180" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
