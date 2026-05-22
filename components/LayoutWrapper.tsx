"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Menu } from "lucide-react";
import dynamic from "next/dynamic";

const ToastProvider = dynamic(() => import("@/components/ToastProvider"), {
  ssr: false,
});

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!pathname) return;

    // Get or generate a persistent unique visitor ID
    let visitorId = localStorage.getItem('jobscoutai_visitor_id');
    if (!visitorId) {
      visitorId = typeof crypto?.randomUUID === 'function'
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('jobscoutai_visitor_id', visitorId);
    }

    // Send the tracking event
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId, path: pathname }),
    }).catch((err) => console.error('Failed to track page view:', err));
  }, [pathname]);

  const isPublicPage =
    !pathname ||
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/auth");


  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      {!isPublicPage && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      <main
        className={`flex-1 flex flex-col ${!isPublicPage ? "md:ml-64 border-l border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100/90" : "bg-white"} min-h-screen relative transition-all duration-300 overflow-x-hidden max-w-full`}
      >
        {!isPublicPage && (
          <>
            {/* Mobile Header */}
            <header className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-5 py-4 shadow-sm w-full print:hidden">
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 active:scale-95 transition-transform bg-white shadow-sm cursor-pointer hover:bg-slate-50"
              >
                <Menu size={20} />
              </button>
              <div className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="JobScoutAI"
                  className="w-8 h-8 object-contain"
                />
                <span className="font-bold text-sm text-slate-800 tracking-tight">
                  JobScoutAI
                </span>
              </div>
              <div className="w-10" /> {/* Flex spacing balancer */}
            </header>

            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/35 to-transparent" />
          </>
        )}

        <div className="fixed top-[-15%] right-[-5%] w-[45%] h-[45%] bg-blue-400/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="fixed bottom-[-20%] left-[15%] w-[35%] h-[35%] bg-sky-300/15 blur-[90px] rounded-full pointer-events-none" />

        <div
          className={`flex-1 ${!isPublicPage ? "max-w-[1600px] mx-auto px-5 py-6 md:px-10 md:py-10" : ""} relative z-10 w-full`}
        >
          {children}
        </div>
      </main>
      <ToastProvider />
    </div>
  );
}
