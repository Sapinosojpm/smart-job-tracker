'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = !pathname || pathname === '/' || pathname === '/login' || pathname.startsWith('/auth');

  return (
    <div className="flex min-h-screen w-full">
      {!isPublicPage && <Sidebar />}

      <main className={`flex-1 flex flex-col ${!isPublicPage ? 'md:ml-64 border-l border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100/90' : 'bg-white'} min-h-screen relative transition-all duration-300 overflow-x-hidden max-w-full`}>
        {!isPublicPage && <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/35 to-transparent" />}
        <div className="fixed top-[-15%] right-[-5%] w-[45%] h-[45%] bg-blue-400/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="fixed bottom-[-20%] left-[15%] w-[35%] h-[35%] bg-sky-300/15 blur-[90px] rounded-full pointer-events-none" />

        <div className={`flex-1 ${!isPublicPage ? 'max-w-7xl mx-auto px-5 py-8 md:px-10 md:py-10' : ''} relative z-10`}>
          {children}
        </div>
      </main>
    </div>
  );
}
