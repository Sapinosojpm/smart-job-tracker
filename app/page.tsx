"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Zap,
  Search,
  Bell,
  ChevronRight,
  ArrowRight,
  Target,
  Sparkles,
  Globe,
  Mail,
  Lock,
  Loader2,
  X,
  CheckCircle2,
  Eye,
  EyeOff,
  TrendingUp,
  Users,
  Briefcase,
  Star,
  Play,
  Shield,
  Clock,
  BarChart3,
  Filter,
  Send,
  Menu as MenuIcon,
  Check,
  MessageSquarePlus,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "react-toastify";
import TestimonialModal from "@/components/TestimonialModal";

/* ─── Sub-components ─────────────────────────────────────────────── */

function NavBar({
  onSignIn,
  onGetStarted,
}: {
  onSignIn: () => void;
  onGetStarted: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled
          ? "bg-white/92 backdrop-blur-lg border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 shrink-0 transition-all duration-500 group-hover:scale-115 group-hover:rotate-[6deg] group-hover:drop-shadow-[0_4px_12px_rgba(26,86,219,0.2)]">
            <img
              src="/jobscoutai.png"
              alt="JobScoutAI"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="font-display font-extrabold text-base text-ink leading-none transition-colors duration-300 group-hover:text-brand">
              JobScoutAI
            </div>
          </div>
        </div>

        {/* Nav Links (desktop) */}
        <div className="hidden md:flex items-center gap-8">
          {["Features", "How it Works", "Pricing"].map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/ /g, "-")}`}
              className="text-sm font-medium text-ink-2 hover:text-brand transition-colors"
            >
              {l}
            </a>
          ))}
        </div>

        {/* CTA (desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onSignIn}
            className="px-5 py-2 text-sm font-bold text-ink-2 hover:text-brand transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            className="shimmer-btn px-[22px] py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-brand/35 hover:scale-[1.02] active:scale-95 transition-transform"
          >
            Get Started Free →
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-ink"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-border p-6 flex flex-col gap-6 animate-fadeIn">
          {["Features", "How it Works", "Pricing"].map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/ /g, "-")}`}
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-bold text-ink-2 hover:text-brand transition-colors"
            >
              {l}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-4 border-t border-border">
            <button
              onClick={() => {
                onSignIn();
                setMobileMenuOpen(false);
              }}
              className="w-full py-4 text-lg font-bold text-ink-2 bg-surface rounded-xl"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                onGetStarted();
                setMobileMenuOpen(false);
              }}
              className="shimmer-btn w-full py-4 rounded-xl text-lg font-bold text-white shadow-lg"
            >
              Get Started Free
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

interface KineticGridProps {
  mouseX: number;
  mouseY: number;
  isHovered: boolean;
}

function KineticGrid({ mouseX, mouseY, isHovered }: KineticGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    mouseRef.current.x = mouseX;
    mouseRef.current.y = mouseY;
    mouseRef.current.active = isHovered;
  }, [mouseX, mouseY, isHovered]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    const dpr = window.devicePixelRatio || 1;

    const dots: { x0: number; y0: number; x: number; y: number; vx: number; vy: number }[] = [];
    const spacing = 40;

    const initDots = () => {
      dots.length = 0;
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
          dots.push({ x0: x, y0: y, x: x, y: y, vx: 0, vy: 0 });
        }
      }
    };

    initDots();

    const handleResize = () => {
      initDots();
    };
    window.addEventListener("resize", handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mActive = mouseRef.current.active;

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        let targetX = dot.x0;
        let targetY = dot.y0;
        let radius = 1.2;
        let alpha = 0.12;
        const color = "26, 86, 219"; // Brand blue RGB

        if (mActive) {
          const dx = mx - dot.x0;
          const dy = my - dot.y0;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 180;

          if (dist < maxDist) {
            const force = (maxDist - dist) / maxDist;
            // Push away (repulsion force)
            targetX = dot.x0 - (dx / dist) * force * 16;
            targetY = dot.y0 - (dy / dist) * force * 16;
            radius = 1.2 + force * 1.8;
            alpha = 0.12 + force * 0.48;
          }
        }

        // Spring physics (easing with inertia)
        const ax = (targetX - dot.x) * 0.12;
        const ay = (targetY - dot.y) * 0.12;
        dot.vx = (dot.vx + ax) * 0.82;
        dot.vy = (dot.vy + ay) * 0.82;
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Draw dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${alpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
    />
  );
}

interface DraggableBadgeProps {
  platform: typeof floatingPlatforms[0];
  translateX: number;
  translateY: number;
  isHovered: boolean;
}

function DraggableBadge({ platform, translateX, translateY, isHovered }: DraggableBadgeProps) {
  const badgeRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  
  const posRef = useRef({ x: 0, y: 0 });
  const velRef = useRef({ x: 0, y: 0 });
  const lastMouseRef = useRef({ x: 0, y: 0, time: 0 });
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    posRef.current = offset;
  }, [offset]);

  const startInertia = () => {
    const updatePhysics = () => {
      if (isDraggingRef.current) return;

      let vx = velRef.current.x;
      let vy = velRef.current.y;

      vx *= 0.95;
      vy *= 0.95;

      velRef.current.x = vx;
      velRef.current.y = vy;

      let nextX = posRef.current.x + vx;
      let nextY = posRef.current.y + vy;

      if (badgeRef.current) {
        const rect = badgeRef.current.getBoundingClientRect();
        
        if (rect.left + vx < 10) {
          nextX = posRef.current.x - (rect.left - 10);
          velRef.current.x = -vx * 0.6;
        } else if (rect.right + vx > window.innerWidth - 10) {
          nextX = posRef.current.x + (window.innerWidth - 10 - rect.right);
          velRef.current.x = -vx * 0.6;
        }

        if (rect.top + vy < 10) {
          nextY = posRef.current.y - (rect.top - 10);
          velRef.current.y = -vy * 0.6;
        } else if (rect.bottom + vy > window.innerHeight - 10) {
          nextY = posRef.current.y + (window.innerHeight - 10 - rect.bottom);
          velRef.current.y = -vy * 0.6;
        }
      }

      setOffset({ x: nextX, y: nextY });

      if (Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05) {
        animFrameRef.current = requestAnimationFrame(updatePhysics);
      } else {
        animFrameRef.current = null;
      }
    };

    if (animFrameRef.current === null) {
      animFrameRef.current = requestAnimationFrame(updatePhysics);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    initDrag(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      initDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const initDrag = (clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    velRef.current = { x: 0, y: 0 };
    lastMouseRef.current = { x: clientX, y: clientY, time: Date.now() };

    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      onDragMove(moveEvent.clientX, moveEvent.clientY);
    };

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length === 1) {
        onDragMove(moveEvent.touches[0].clientX, moveEvent.touches[0].clientY);
      }
    };

    const handleDragEnd = () => {
      isDraggingRef.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleDragEnd);
      startInertia();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleDragEnd);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleDragEnd);
  };

  const onDragMove = (clientX: number, clientY: number) => {
    if (!isDraggingRef.current) return;

    const now = Date.now();
    const dt = now - lastMouseRef.current.time || 1;
    
    const dx = clientX - lastMouseRef.current.x;
    const dy = clientY - lastMouseRef.current.y;

    const instVx = (dx / dt) * 16;
    const instVy = (dy / dt) * 16;

    velRef.current.x = velRef.current.x * 0.4 + instVx * 0.6;
    velRef.current.y = velRef.current.y * 0.4 + instVy * 0.6;

    setOffset((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));

    lastMouseRef.current = { x: clientX, y: clientY, time: now };
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={badgeRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`absolute hidden md:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/75 backdrop-blur-md border border-slate-200/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] select-none transition-all duration-500 ease-out group cursor-grab active:cursor-grabbing hover:bg-white/95 hover:border-brand/35 hover:shadow-premium-md z-10 ${
        isHovered 
          ? "opacity-90 scale-100 pointer-events-auto" 
          : "opacity-15 scale-90 pointer-events-none"
      }`}
      style={{
        left: platform.left,
        right: platform.right,
        top: platform.top,
        bottom: platform.bottom,
        transform: `translate(${translateX + offset.x}px, ${translateY + offset.y}px)`,
        transition: isDraggingRef.current ? "none" : "opacity 0.5s ease, scale 0.5s ease",
      }}
    >
      {/* Cloud tooltip bubble */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-48 px-3 py-2 rounded-xl bg-[#0a0f1e]/95 backdrop-blur-md border border-white/10 text-white text-[10px] leading-normal font-medium shadow-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 z-30 text-center">
        {platform.description}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0a0f1e]/95" />
      </div>

      <div className="flex items-center justify-center w-6 h-6 rounded-xl bg-slate-50/50 shadow-inner">
        {platform.icon}
      </div>
      <span className="text-[11px] font-bold text-slate-600 tracking-tight">{platform.name}</span>
    </div>
  );
}

const floatingPlatforms = [
  { name: "We Work Remotely", icon: <Briefcase size={12} className="text-rose-500" />, left: "12%", top: "22%", parallaxFactor: 0.04, description: "World's largest remote work community. Scraping 100+ design & dev jobs daily." },
  { name: "Wellfound", icon: <Target size={12} className="text-emerald-500" />, right: "12%", top: "18%", parallaxFactor: -0.03, description: "Formerly AngelList Talent. Prime platform for remote startup & tech roles." },
  { name: "Remote.co", icon: <Globe size={12} className="text-blue-500" />, left: "10%", bottom: "35%", parallaxFactor: -0.05, description: "Highly curated list of international remote positions & tech jobs." },
  { name: "Upwork", icon: <Sparkles size={12} className="text-green-600" />, right: "8%", bottom: "38%", parallaxFactor: 0.04, description: "Leading freelance marketplace for contract, hourly, and project-based work." },
  { name: "Indeed", icon: <Search size={12} className="text-indigo-600" />, right: "20%", top: "52%", parallaxFactor: 0.03, description: "Global employment search aggregator tracking millions of new openings." },
  { name: "Working Nomads", icon: <Users size={12} className="text-cyan-600" />, left: "20%", top: "55%", parallaxFactor: -0.04, description: "Remote job listings curated curatively for digital nomads globally." },
];

function HeroSection({
  stats,
  onGetStarted,
  onWatchDemo,
}: {
  stats: any;
  onGetStarted: () => void;
  onWatchDemo: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [winSize, setWinSize] = useState({ w: 1200, h: 800 });

  useEffect(() => {
    setMounted(true);
    setWinSize({ w: window.innerWidth, h: window.innerHeight });
    const handleResize = () => {
      setWinSize({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white pt-[72px]"
    >
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-[radial-gradient(ellipse,_rgba(26,86,219,0.06)_0%,_transparent_70%)]" />
        <div className="absolute bottom-[5%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,_rgba(6,182,212,0.05)_0%,_transparent_70%)]" />
        <div className="absolute bottom-[5%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,_rgba(26,86,219,0.05)_0%,_transparent_70%)]" />
        
        {/* Kinetic dot grid */}
        <KineticGrid mouseX={coords.x} mouseY={coords.y} isHovered={isHovered} />

        {/* Dynamic spotlight that tracks the mouse hover */}
        {isHovered && (
          <div
            className="absolute inset-0 transition-opacity duration-300 opacity-100"
            style={{
              background: `radial-gradient(450px circle at ${coords.x}px ${coords.y}px, rgba(26, 86, 219, 0.08), transparent 80%)`,
            }}
          />
        )}

      </div>

      {/* Floating platform badges with parallax effect & drag inertia */}
      {mounted && floatingPlatforms.map((p) => {
        const centerX = winSize.w / 2;
        const centerY = winSize.h / 2;
        const dx = coords.x - centerX;
        const dy = coords.y - centerY;
        const translateX = isHovered ? dx * p.parallaxFactor : 0;
        const translateY = isHovered ? dy * p.parallaxFactor : 0;
        
        return (
          <DraggableBadge
            key={p.name}
            platform={p}
            translateX={translateX}
            translateY={translateY}
            isHovered={isHovered}
          />
        );
      })}

      <div className="w-full max-w-[1200px] mx-auto px-6 py-20 relative z-[1] flex flex-col items-center">
        <div className="w-full max-w-[760px] text-center">
          {/* Pill badge */}
          <div className="animate-fade-up animate-delay-[0.1s] inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-light border border-brand/20 mb-8">
            <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_0_2px_rgba(16,185,129,0.3)] animate-pulse" />
            <span className="text-[13px] font-bold text-brand tracking-tight">
              Actively scraping 500+ new jobs daily
            </span>
          </div>

          {/* Headline */}
          <h1 className="hero-title animate-fade-up animate-delay-[0.2s] font-display text-[2.8rem] md:text-[4.2rem] font-extrabold leading-[1.08] text-ink mb-6 tracking-tight">
            Your Dream Job Is <span className="gradient-text">One Alert</span>{" "}
            Away
          </h1>

          {/* Sub */}
          <p className="animate-fade-up animate-delay-[0.3s] text-lg md:text-[1.15rem] text-ink-3 leading-relaxed mb-10 max-w-[560px] mx-auto font-medium">
            We automatically scrape We Work Remotely, Wellfound, Working Nomads, Remote.co, and 8+ major remote platforms, and alert you the second a match is live.
          </p>

          {/* CTA group */}
          <div className="animate-fade-up animate-delay-[0.45s] flex flex-wrap items-center justify-center gap-3 mb-12">
            <button
              onClick={onGetStarted}
              className="shimmer-btn flex items-center gap-2.5 px-[30px] py-[14px] rounded-xl text-[15px] font-bold text-white shadow-premium-lg hover:scale-105 active:scale-95 transition-transform"
            >
              Start Free — No Credit Card <ArrowRight size={18} />
            </button>
            <button
              onClick={onWatchDemo}
              className="flex items-center gap-2 px-[24px] py-[14px] rounded-xl border-2 border-border bg-white text-[15px] font-bold text-ink-2 hover:border-brand hover:text-brand hover:scale-105 active:scale-95 transition-all"
            >
              <Play size={16} fill="currentColor" /> Watch 2-min demo
            </button>
          </div>

          {/* Trust row */}
          <div className="animate-fade-up animate-delay-[0.6s] flex flex-wrap items-center justify-center gap-6 mb-16">
            {[
              { label: "No spam, ever", icon: <Shield size={14} /> },
              { label: "Cancel anytime", icon: <CheckCircle2 size={14} /> },
              { label: "Setup in 2 minutes", icon: <Clock size={14} /> },
            ].map((t) => (
              <div
                key={t.label}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-3"
              >
                <span className="text-success">{t.icon}</span>
                {t.label}
              </div>
            ))}
          </div>

          {/* Stats bar */}
          <div className="animate-fade-up animate-delay-[0.6s] w-full grid grid-cols-2 md:grid-cols-3 bg-surface rounded-[20px] border border-border shadow-sm overflow-hidden">
            {[
              { value: stats?.totalJobs, label: "Jobs Scraped", suffix: "+" },
              { value: stats?.activeUsers, label: "Active Users", suffix: "+" },
              {
                value: stats?.successMatches,
                label: "Success Matches",
                suffix: "+",
              },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`text-center py-6 md:py-8 px-4 ${
                  i === 0
                    ? "border-r border-b md:border-b-0 border-border"
                    : i === 1
                      ? "border-b md:border-b-0 md:border-r border-border"
                      : "col-span-2 md:col-span-1"
                }`}
              >
                <div className="font-display text-[1.6rem] md:text-[2rem] font-extrabold text-ink leading-none h-8 flex items-center justify-center">
                  {!mounted || !stats ? (
                    <span className="inline-block w-16 h-6 bg-slate-200/80 animate-pulse rounded-md" />
                  ) : (
                    <>
                      {Intl.NumberFormat("en-US", {
                        notation: "compact",
                      }).format(s.value || 0)}
                      {s.suffix}
                    </>
                  )}
                </div>
                <div className="text-[10px] md:text-[11px] font-bold text-ink-4 tracking-wider uppercase mt-2">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const BRAND_PLATFORMS = [
  { name: "We Work Remotely", icon: <Briefcase size={12} className="text-rose-500" />, border: "group-hover:border-rose-300/60", bg: "group-hover:bg-rose-500/5", shadow: "group-hover:shadow-rose-500/10" },
  { name: "Wellfound", icon: <Target size={12} className="text-emerald-500" />, border: "group-hover:border-emerald-300/60", bg: "group-hover:bg-emerald-500/5", shadow: "group-hover:shadow-emerald-500/10" },
  { name: "Remote.co", icon: <Globe size={12} className="text-blue-500" />, border: "group-hover:border-blue-300/60", bg: "group-hover:bg-blue-500/5", shadow: "group-hover:shadow-blue-500/10" },
  { name: "Upwork", icon: <Sparkles size={12} className="text-green-600" />, border: "group-hover:border-green-300/60", bg: "group-hover:bg-green-500/5", shadow: "group-hover:shadow-green-500/10" },
  { name: "Indeed", icon: <Search size={12} className="text-indigo-500" />, border: "group-hover:border-indigo-300/60", bg: "group-hover:bg-indigo-500/5", shadow: "group-hover:shadow-indigo-500/10" },
  { name: "Working Nomads", icon: <Users size={12} className="text-cyan-550" />, border: "group-hover:border-cyan-300/60", bg: "group-hover:bg-cyan-500/5", shadow: "group-hover:shadow-cyan-500/10" },
  { name: "Jobspresso", icon: <Zap size={12} className="text-amber-500" />, border: "group-hover:border-amber-300/60", bg: "group-hover:bg-amber-500/5", shadow: "group-hover:shadow-amber-500/10" },
  { name: "NoDesk", icon: <Clock size={12} className="text-slate-500" />, border: "group-hover:border-slate-300/60", bg: "group-hover:bg-slate-500/5", shadow: "group-hover:shadow-slate-500/10" },
  { name: "SkipTheDrive", icon: <TrendingUp size={12} className="text-teal-500" />, border: "group-hover:border-teal-300/60", bg: "group-hover:bg-teal-500/5", shadow: "group-hover:shadow-teal-500/10" },
  { name: "Remote Rocketship", icon: <Send size={12} className="text-purple-500" />, border: "group-hover:border-purple-300/60", bg: "group-hover:bg-purple-500/5", shadow: "group-hover:shadow-purple-500/10" },
  { name: "DailyRemote", icon: <Shield size={12} className="text-orange-500" />, border: "group-hover:border-orange-300/60", bg: "group-hover:bg-orange-500/5", shadow: "group-hover:shadow-orange-500/10" },
  { name: "Otta", icon: <BarChart3 size={12} className="text-fuchsia-500" />, border: "group-hover:border-fuchsia-300/60", bg: "group-hover:bg-fuchsia-500/5", shadow: "group-hover:shadow-fuchsia-500/10" },
  { name: "OnlineJobs.ph", icon: <Star size={12} className="text-sky-500" />, border: "group-hover:border-sky-300/60", bg: "group-hover:bg-sky-500/5", shadow: "group-hover:shadow-sky-500/10" },
  { name: "RemoteOK", icon: <Zap size={12} className="text-yellow-500" />, border: "group-hover:border-yellow-300/60", bg: "group-hover:bg-yellow-500/5", shadow: "group-hover:shadow-yellow-500/10" }
];

function LogoMarquee() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <section className="bg-[#0a0f1d] py-16 h-[220px]" />;
  }

  const row1 = BRAND_PLATFORMS.slice(0, 7);
  const row2 = BRAND_PLATFORMS.slice(7);

  const doubledRow1 = [...row1, ...row1, ...row1, ...row1, ...row1];
  const doubledRow2 = [...row2, ...row2, ...row2, ...row2, ...row2];

  return (
    <section className="bg-gradient-to-b from-[#0a0f1d] to-[#0f172a] py-16 overflow-hidden relative border-y border-slate-900">
      {/* Side Vignette Fades */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0a0f1d] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0a0f1d] to-transparent z-10 pointer-events-none" />
      
      {/* Title */}
      <div className="text-[11px] font-black tracking-[0.25em] uppercase text-slate-500 text-center mb-10 select-none">
        🔗 Scraping Top Platforms For You
      </div>
      
      <div className="space-y-6 max-w-[1400px] mx-auto">
        {/* Row 1 (Right to Left) */}
        <div className="overflow-hidden">
          <div className="flex gap-4 items-center animate-marquee w-max cursor-default">
            {/* Track A */}
            <div className="flex gap-4 items-center shrink-0">
              {doubledRow1.map((p, i) => (
                <div
                  key={`r1-a-${p.name}-${i}`}
                  className={`group flex items-center px-6 py-2.5 rounded-full bg-white/[0.02] border border-white/[0.04] hover:border-slate-800 transition-all duration-300 hover:scale-[1.03] select-none hover:bg-white/[0.05] ${p.border} ${p.bg} ${p.shadow}`}
                >
                  <span className="font-body text-xs font-bold text-slate-400 group-hover:text-white transition-colors">
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
            {/* Track B */}
            <div className="flex gap-4 items-center shrink-0" aria-hidden="true">
              {doubledRow1.map((p, i) => (
                <div
                  key={`r1-b-${p.name}-${i}`}
                  className={`group flex items-center px-6 py-2.5 rounded-full bg-white/[0.02] border border-white/[0.04] hover:border-slate-800 transition-all duration-300 hover:scale-[1.03] select-none hover:bg-white/[0.05] ${p.border} ${p.bg} ${p.shadow}`}
                >
                  <span className="font-body text-xs font-bold text-slate-400 group-hover:text-white transition-colors">
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2 (Left to Right) */}
        <div className="overflow-hidden">
          <div className="flex gap-4 items-center animate-marquee-reverse w-max cursor-default">
            {/* Track A */}
            <div className="flex gap-4 items-center shrink-0">
              {doubledRow2.map((p, i) => (
                <div
                  key={`r2-a-${p.name}-${i}`}
                  className={`group flex items-center px-6 py-2.5 rounded-full bg-white/[0.02] border border-white/[0.04] hover:border-slate-800 transition-all duration-300 hover:scale-[1.03] select-none hover:bg-white/[0.05] ${p.border} ${p.bg} ${p.shadow}`}
                >
                  <span className="font-body text-xs font-bold text-slate-400 group-hover:text-white transition-colors">
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
            {/* Track B */}
            <div className="flex gap-4 items-center shrink-0" aria-hidden="true">
              {doubledRow2.map((p, i) => (
                <div
                  key={`r2-b-${p.name}-${i}`}
                  className={`group flex items-center px-6 py-2.5 rounded-full bg-white/[0.02] border border-white/[0.04] hover:border-slate-800 transition-all duration-300 hover:scale-[1.03] select-none hover:bg-white/[0.05] ${p.border} ${p.bg} ${p.shadow}`}
                >
                  <span className="font-body text-xs font-bold text-slate-400 group-hover:text-white transition-colors">
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Features Section Interactive Sub-Widgets ─────────────────── */

function ScrapingLogWidget() {
  const [logs, setLogs] = useState<string[]>([
    "Indeed: scanned 150 jobs (+12 new)",
    "We Work Remotely: scanned 45 jobs (+3 new)",
    "RemoteOK: scanned 90 jobs (+5 new)",
  ]);
  
  useEffect(() => {
    const platforms = ["Indeed", "We Work Remotely", "RemoteOK", "JobStreet", "LinkedIn", "Wellfound", "Remote.co"];
    const keywords = ["React", "Node", "Python", "UI/UX", "Data Analyst", "Product Manager"];
    
    const timer = setInterval(() => {
      const p = platforms[Math.floor(Math.random() * platforms.length)];
      const k = keywords[Math.floor(Math.random() * keywords.length)];
      const count = Math.floor(Math.random() * 80) + 10;
      const newJobs = Math.floor(Math.random() * 5);
      const log = `${p}: scanned ${count} ${k} jobs (+${newJobs} new)`;
      setLogs((prev) => [...prev.slice(-2), log]);
    }, 3000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-slate-900 rounded-2xl p-4 font-mono text-[10px] text-emerald-400 space-y-1.5 border border-slate-850 shadow-inner h-[100px] overflow-hidden flex flex-col justify-end">
      {logs.map((log, i) => (
        <div key={i} className="whitespace-nowrap flex items-center gap-1.5 animate-fadeIn">
          <span className="text-slate-500 font-bold select-none">&gt;</span>
          <span className={i === logs.length - 1 ? "text-emerald-300 font-bold" : "opacity-60"}>{log}</span>
        </div>
      ))}
    </div>
  );
}

function FilterSandboxWidget() {
  const [selectedTags, setSelectedTags] = useState<string[]>(["React", "Remote"]);
  const allTags = ["React", "Remote", "PHP", "Salary > ₱80k", "Senior"];
  
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const getJobCount = () => {
    if (selectedTags.length === 0) return 415;
    let count = 415;
    if (selectedTags.includes("React")) count = Math.floor(count * 0.3);
    if (selectedTags.includes("Remote")) count = Math.floor(count * 0.6);
    if (selectedTags.includes("PHP")) count = Math.floor(count * 0.15);
    if (selectedTags.includes("Salary > ₱80k")) count = Math.floor(count * 0.4);
    if (selectedTags.includes("Senior")) count = Math.floor(count * 0.35);
    return Math.max(2, count);
  };

  return (
    <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-200/60 space-y-3 shadow-inner text-left h-[100px] flex flex-col justify-between">
      <div className="flex flex-wrap gap-1.5">
        {allTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={(e) => {
                e.stopPropagation();
                toggleTag(tag);
              }}
              className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all select-none ${
                isSelected 
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-600/10" 
                  : "bg-white border border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between border-t border-slate-200/50 pt-2 text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none select-none">
        <span>AI Filter Matches</span>
        <span className="text-purple-600 font-extrabold text-xs">
          {getJobCount()} listings
        </span>
      </div>
    </div>
  );
}

function AlertNotificationWidget() {
  const [bubbleText, setBubbleText] = useState("React Developer found at Canva!");
  const [bubbleSalary, setBubbleSalary] = useState("₱90k - ₱120k / mo");
  const [key, setKey] = useState(0);

  useEffect(() => {
    const roles = [
      { r: "React Developer found at Canva!", s: "₱90k - ₱120k / mo" },
      { r: "Virtual Assistant found at HubSpot!", s: "$1,500 - $2,500 / mo" },
      { r: "NodeJS Engineer found at Wise!", s: "£4,500 - £6,000 / mo" },
      { r: "Product Designer found at Figma!", s: "$80k - $110k / yr" }
    ];
    const timer = setInterval(() => {
      const role = roles[Math.floor(Math.random() * roles.length)];
      setBubbleText(role.r);
      setBubbleSalary(role.s);
      setKey(prev => prev + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-[#182533] rounded-2xl p-3 border border-slate-800 shadow-inner flex gap-2.5 items-start text-left h-[100px] overflow-hidden">
      <div className="w-8 h-8 rounded-full bg-sky-500 shrink-0 flex items-center justify-center text-white shadow-md select-none">
        <Send size={13} className="fill-white translate-x-[-0.5px] translate-y-[0.5px]" />
      </div>
      <div key={key} className="flex-1 min-w-0 animate-fadeIn">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[9px] font-black text-sky-400 uppercase tracking-wider">JobScoutAI Bot</span>
          <span className="text-[8px] text-slate-500 font-semibold select-none">just now</span>
        </div>
        <div className="bg-[#202f3e] rounded-2xl rounded-tl-none p-2.5 text-[10px] text-slate-200 font-semibold leading-relaxed shadow-sm">
          <p className="font-extrabold truncate text-white leading-tight">{bubbleText}</p>
          <p className="text-[8px] text-sky-300 font-bold mt-0.5 leading-none">{bubbleSalary} • Remote</p>
        </div>
      </div>
    </div>
  );
}

function KanbanPipelineWidget() {
  const [stage, setStage] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setStage((prev) => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const jobs = [
    { title: "Frontend Dev", company: "Canva" },
    { title: "UI Designer", company: "Figma" },
    { title: "React Dev", company: "Google" }
  ];

  return (
    <div className="w-full grid grid-cols-3 gap-2 bg-slate-50 rounded-2xl p-3 border border-slate-200/60 shadow-inner h-[100px] overflow-hidden text-center select-none">
      {["Saved", "Applied", "Offer"].map((column, colIdx) => (
        <div key={column} className="flex flex-col gap-1.5 h-full">
          <span className={`text-[8px] font-black uppercase tracking-wider ${
            colIdx === stage ? "text-amber-600" : "text-slate-400"
          }`}>
            {column}
          </span>
          <div className={`flex-1 rounded-xl border border-dashed transition-all flex flex-col items-center justify-center p-1 ${
            colIdx === stage 
              ? "bg-amber-50 border-amber-300/60 shadow-sm" 
              : "bg-white/80 border-slate-200"
          }`}>
            {colIdx === stage ? (
              <div className="w-full rounded-lg bg-white border border-amber-200 p-1.5 shadow-sm animate-in zoom-in-95 duration-300 text-left">
                <div className="text-[9px] font-black text-slate-800 truncate leading-tight">
                  {jobs[stage].title}
                </div>
                <div className="text-[7px] font-bold text-slate-400 truncate leading-none mt-0.5">
                  {jobs[stage].company}
                </div>
              </div>
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function SalaryInsightWidget() {
  const [activePoint, setActivePoint] = useState(2);
  const data = [
    { year: "2023", value: 65 },
    { year: "2024", value: 85 },
    { year: "2025", value: 110 },
    { year: "2026", value: 130 }
  ];

  return (
    <div className="w-full bg-slate-50 rounded-2xl p-3 border border-slate-200/60 shadow-inner h-[100px] flex flex-col justify-between text-left select-none">
      <div className="flex justify-between items-center shrink-0">
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Market Trend</span>
        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
          ₱{data[activePoint].value}k/mo Avg
        </span>
      </div>
      <div className="flex-1 flex items-end justify-between px-2 pt-2 gap-3">
        {data.map((item, i) => {
          const heightPercent = (item.value / 140) * 100;
          const isActive = i === activePoint;
          return (
            <div 
              key={item.year}
              onMouseEnter={() => setActivePoint(i)}
              className="flex-1 flex flex-col items-center cursor-pointer group/bar"
            >
              <div className="w-full relative flex items-end h-[42px]">
                <div 
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t-md transition-all duration-500 ${
                    isActive 
                      ? "bg-gradient-to-t from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/20" 
                      : "bg-slate-200 group-hover/bar:bg-slate-300"
                  }`}
                />
              </div>
              <span className={`text-[7px] font-black uppercase tracking-wider mt-1 ${
                isActive ? "text-emerald-600" : "text-slate-400"
              }`}>
                {item.year}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScamClassifierWidget() {
  const [scamState, setScamState] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [scamType, setScamType] = useState(0);

  const posts = [
    { title: "Virtual Assistant (Urgent)", desc: "Pay $50 for laptop shipping fee...", isScam: true },
    { title: "React Dev (Part-Time)", desc: "100% remote. Apply directly at Figma...", isScam: false }
  ];

  const handleScan = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScamState('scanning');
    setTimeout(() => {
      setScamState('done');
    }, 1500);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScamState('idle');
    setScamType(prev => (prev + 1) % 2);
  };

  return (
    <div className="w-full bg-slate-50 rounded-2xl p-3 border border-slate-200/60 shadow-inner h-[100px] flex flex-col justify-between text-left relative overflow-hidden select-none">
      {scamState === 'idle' && (
        <div className="flex flex-col justify-between h-full w-full">
          <div className="min-w-0">
            <div className="text-[9px] font-black text-slate-800 leading-tight truncate">{posts[scamType].title}</div>
            <div className="text-[8px] text-slate-400 font-semibold truncate leading-none mt-0.5">{posts[scamType].desc}</div>
          </div>
          <button 
            onClick={handleScan}
            className="w-full py-1.5 rounded-xl bg-red-600 text-white font-extrabold text-[8px] uppercase tracking-widest text-center shadow-md shadow-red-500/10 active:scale-95 transition-all"
          >
            🛡️ Scan Listing
          </button>
        </div>
      )}

      {scamState === 'scanning' && (
        <div className="flex flex-col items-center justify-center h-full w-full gap-2">
          <Loader2 size={16} className="text-red-500 animate-spin" />
          <span className="text-[8px] font-black text-red-600 uppercase tracking-widest animate-pulse">Analyzing...</span>
        </div>
      )}

      {scamState === 'done' && (
        <div className="flex flex-col justify-between h-full w-full items-center text-center">
          <div className={`text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 mt-2 ${
            posts[scamType].isScam ? "text-red-600" : "text-emerald-600"
          }`}>
            {posts[scamType].isScam ? "🚨 SCAM DETECTED" : "✅ VERIFIED EMPLOYER"}
          </div>
          <button 
            onClick={handleReset}
            className="w-full py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600 font-black text-[7px] uppercase tracking-widest transition-colors mt-2"
          >
            Reset Scanner
          </button>
        </div>
      )}
    </div>
  );
}

function FeatureCard({ f }: { f: any }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const getStyle = (): React.CSSProperties => {
    if (!isHovered || !cardRef.current) return { transform: 'none', transition: 'all 0.5s ease' };
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (centerY - coords.y) / 20;
    const rotateY = (coords.x - centerX) / 20;
    
    return {
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease-out, box-shadow 0.3s ease',
      boxShadow: '0 20px 40px rgba(0,0,0,0.06)'
    };
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCoords({ x: 0, y: 0 });
      }}
      style={getStyle()}
      className="group p-8 rounded-[24px] border border-border bg-white hover:border-brand/30 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[360px]"
    >
      {/* Dynamic spotlight gradient */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(180px circle at ${coords.x}px ${coords.y}px, rgba(26, 86, 219, 0.04), transparent 80%)`,
          }}
        />
      )}

      {/* Top elements */}
      <div className="w-full relative">
        {/* Tag */}
        <div
          className={`absolute top-0 right-0 text-[10px] font-black tracking-wider uppercase ${f.color} ${f.bg} px-2.5 py-0.5 rounded-full select-none`}
        >
          {f.tag}
        </div>
        {/* Icon */}
        <div
          className={`w-[52px] h-[52px] rounded-xl ${f.bg} flex items-center justify-center ${f.color} mb-5 group-hover:scale-105 transition-transform`}
        >
          {f.icon}
        </div>
        <h3 className="font-display text-lg font-bold text-ink mb-2.5">
          {f.title}
        </h3>
        <p className="text-sm text-ink-3 leading-relaxed font-medium mb-6">
          {f.desc}
        </p>
      </div>

      {/* Interactive Micro-Widget at the bottom */}
      <div className="w-full mt-auto pt-2 z-10">
        {f.widget}
      </div>
    </div>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: <Search size={24} />,
      color: "text-brand",
      bg: "bg-brand/10",
      title: "Automated Daily Scraping",
      desc: "Our bots run every 4 hours across 5 top job platforms so fresh listings land in your dashboard before anyone else.",
      tag: "Core",
      widget: <ScrapingLogWidget />
    },
    {
      icon: <Filter size={24} />,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      title: "AI-Powered Smart Filtering",
      desc: "Define your ideal role with keywords, salary, and location. We surface only the jobs that truly fit.",
      tag: "AI",
      widget: <FilterSandboxWidget />
    },
    {
      icon: <Bell size={24} />,
      color: "text-success",
      bg: "bg-success/10",
      title: "Instant Email & Telegram Alerts",
      desc: "Get notified within minutes of a new match via your preferred channel. Be the first to apply.",
      tag: "Alerts",
      widget: <AlertNotificationWidget />
    },
    {
      icon: <BarChart3 size={24} />,
      color: "text-gold",
      bg: "bg-gold/10",
      title: "Application Dashboard",
      desc: 'Track every application in one place — from "Saved" to "Offer Received" — with timeline per role.',
      tag: "Dashboard",
      widget: <KanbanPipelineWidget />
    },
    {
      icon: <TrendingUp size={24} />,
      color: "text-accent",
      bg: "bg-accent/10",
      title: "Market Salary Insights",
      desc: "See real-time salary data for your target roles so you always negotiate from a position of knowledge.",
      tag: "Analytics",
      widget: <SalaryInsightWidget />
    },
    {
      icon: <Shield size={24} />,
      color: "text-red-500",
      bg: "bg-red-500/10",
      title: "Scam Job Detection",
      desc: "Our classifier flags suspicious listings before they waste your time, keeping only verified employers.",
      tag: "Safety",
      widget: <ScamClassifierWidget />
    },
  ];

  return (
    <section id="features" className="py-20 md:py-32 px-6 bg-white">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-3.5 py-1 rounded-full bg-brand-light text-[12px] font-bold text-brand tracking-widest uppercase mb-4">
            Features
          </div>
          <h2 className="font-display text-[2rem] md:text-[2.5rem] font-extrabold text-ink mb-4 tracking-tight">
            Everything you need to land the job
          </h2>
          <p className="text-base md:text-lg text-ink-3 max-w-[520px] mx-auto leading-relaxed">
            Stop copy-pasting from ten browser tabs. One smart tool handles your
            entire search workflow.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <FeatureCard key={f.title} f={f} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepSimulator({ activeStep }: { activeStep: number }) {
  const [profileText, setProfileText] = useState("");
  
  // Typing animation for Step 1
  useEffect(() => {
    if (activeStep !== 0) return;
    setProfileText("");
    const text = "React Developer";
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setProfileText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [activeStep]);

  return (
    <div className="w-full max-w-[860px] mx-auto bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-2xl relative overflow-hidden mt-12 min-h-[260px] flex flex-col md:flex-row items-center justify-between gap-8 animate-fadeIn">
      {/* Glow background */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-brand/10 blur-[80px] rounded-full pointer-events-none" />
      
      {/* Left: Content */}
      <div className="flex-1 space-y-4 text-left max-w-sm">
        <span className="text-[10px] font-black text-brand tracking-[0.2em] uppercase bg-brand/10 border border-brand/20 px-3 py-1 rounded-full select-none">
          Step {activeStep + 1} Demo
        </span>
        <h4 className="text-xl font-display font-extrabold text-white tracking-tight">
          {
            [
              "Setting Up Your Job Preferences",
              "Automated Scraping In Action",
              "Instant Notification Dispatch",
              "Pipeline Management & Tracking"
            ][activeStep]
          }
        </h4>
        <p className="text-xs text-slate-450 font-medium leading-relaxed">
          {
            [
              "Input your target job keywords, salary minimums, and locations. Our AI uses these exact parameters to scan the web.",
              "Every 4 hours, our background scrapers trigger a remote crawl, checking 12+ platforms concurrently and filtering out duplicates.",
              "The moment a match is classified, we format the details and send it straight to your Telegram bot or email inbox.",
              "Mark jobs as applied, manage interview schedules, and track your offers inside your unified workspace dashboard."
            ][activeStep]
          }
        </p>
      </div>

      {/* Right: Visual simulator */}
      <div className="w-full md:w-[360px] h-[180px] bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-center relative overflow-hidden shrink-0">
        
        {/* Step 1 Visualizer: Profile Form */}
        {activeStep === 0 && (
          <div className="w-full space-y-2 text-slate-300 font-sans text-[11px] animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <span className="font-extrabold text-white">Target Position</span>
              <span className="text-[9px] font-mono text-brand font-bold bg-brand/10 px-2 py-0.5 rounded">AUTO-TYPING</span>
            </div>
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <div className="text-[9px] font-black text-slate-550 uppercase tracking-widest">Title Input</div>
                <div className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-white flex items-center gap-1">
                  <span>{profileText}</span>
                  <span className="w-1.5 h-3.5 bg-brand animate-pulse" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <div className="text-[9px] font-black text-slate-550 uppercase tracking-widest">Location</div>
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-slate-300">Remote Only</div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-[9px] font-black text-slate-550 uppercase tracking-widest">Min Salary</div>
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-slate-300">₱90,000 / mo</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 Visualizer: Scraper Radar */}
        {activeStep === 1 && (
          <div className="w-full h-full flex items-center justify-center relative animate-fadeIn select-none">
            {/* Pulsing radar circles */}
            <div className="absolute w-28 h-28 rounded-full border border-brand/20 animate-ping" />
            <div className="absolute w-20 h-20 rounded-full border border-brand/30" />
            <div className="absolute w-10 h-10 rounded-full border border-brand/50 flex items-center justify-center bg-brand/5">
              <Search size={14} className="text-brand animate-pulse" />
            </div>
            {/* Scraped nodes */}
            <div className="absolute top-4 left-6 px-2 py-1 rounded bg-slate-900 border border-slate-850 text-[8px] font-black text-emerald-400 animate-bounce">
              We Work Remotely
            </div>
            <div className="absolute bottom-6 right-6 px-2 py-1 rounded bg-slate-900 border border-slate-850 text-[8px] font-black text-sky-400 animate-bounce delay-500">
              OnlineJobs.ph
            </div>
            <div className="absolute top-10 right-4 px-2 py-1 rounded bg-slate-900 border border-slate-850 text-[8px] font-black text-purple-400 animate-bounce delay-1000">
              RemoteOK
            </div>
          </div>
        )}

        {/* Step 3 Visualizer: Alert Notification */}
        {activeStep === 2 && (
          <div className="w-full space-y-3 text-left animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2 select-none">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Device Notification Mockup</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex gap-3 shadow-lg max-w-[280px] mx-auto animate-bounce">
              <div className="w-8 h-8 rounded-full bg-sky-500 shrink-0 flex items-center justify-center text-white">
                <Send size={14} className="fill-white translate-x-[-0.5px] translate-y-[0.5px]" />
              </div>
              <div className="min-w-0">
                <div className="text-[9px] font-black text-sky-400 uppercase tracking-widest mb-0.5">Telegram Alert</div>
                <p className="text-[10px] text-white font-extrabold truncate">Stripe: React Dev Role Found</p>
                <p className="text-[8px] text-slate-400 font-semibold truncate mt-0.5">₱140k/mo • Verified Employer</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 Visualizer: Tracking Pipeline */}
        {activeStep === 3 && (
          <div className="w-full space-y-2 text-left animate-fadeIn select-none">
            <div className="flex justify-between items-center border-b border-slate-850 pb-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dashboard Pipeline</span>
              <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest animate-pulse">Offer Received!</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-1.5">
              {[
                { name: "Applied", active: false },
                { name: "Interview", active: false },
                { name: "Offer", active: true }
              ].map((c) => (
                <div key={c.name} className="flex flex-col gap-1.5">
                  <span className={`text-[7px] font-black uppercase tracking-wider ${c.active ? "text-emerald-500" : "text-slate-550"}`}>
                    {c.name}
                  </span>
                  <div className={`p-1.5 rounded-xl border flex flex-col items-center justify-center min-h-[48px] ${
                    c.active 
                      ? "bg-emerald-950/40 border-emerald-500/40 shadow-md shadow-emerald-500/5" 
                      : "bg-slate-900 border-slate-850 opacity-40"
                  }`}>
                    {c.active ? (
                      <div className="w-full rounded bg-slate-900 border border-emerald-500/30 p-1 text-left animate-pulse">
                        <div className="text-[8px] font-black text-white truncate">Canva React Dev</div>
                        <div className="text-[6px] font-bold text-emerald-400 leading-none mt-0.5">₱120k/mo</div>
                      </div>
                    ) : (
                      <div className="w-1 h-1 rounded-full bg-slate-700" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: "01",
      icon: <Users size={28} />,
      title: "Create your profile",
      desc: "Sign up and tell us your target roles, keywords, and salary expectations.",
    },
    {
      num: "02",
      icon: <Search size={28} />,
      title: "We scrape for you",
      desc: "Every 4 hours our bots comb 8+ platforms and filter results against your exact criteria.",
    },
    {
      num: "03",
      icon: <Bell size={28} />,
      title: "Get instant alerts",
      desc: "Matching jobs land in your inbox or Telegram within minutes of being posted.",
    },
    {
      num: "04",
      icon: <CheckCircle2 size={28} />,
      title: "Apply & track",
      desc: "Apply directly, then track progress from your dashboard — all in one organized view.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-32 px-6 bg-surface relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="inline-block px-3.5 py-1 rounded-full bg-brand-light text-[12px] font-bold text-brand tracking-widest uppercase mb-4">
            How it Works
          </div>
          <h2 className="font-display text-[2rem] md:text-[2.5rem] font-extrabold text-ink tracking-tight">
            From signup to offer in 4 steps
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="relative">
          {/* Timeline connective progress line (desktop only) */}
          <div className="hidden lg:block absolute top-[36px] left-[10%] right-[10%] h-[2px] bg-slate-200 z-0">
            <div 
              className="h-full bg-gradient-to-r from-brand to-accent transition-all duration-500 ease-out"
              style={{ width: `${(activeStep / 3) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((s, i) => {
              const isPassed = i <= activeStep;
              const isActive = i === activeStep;

              return (
                <div 
                  key={s.num} 
                  onMouseEnter={() => setActiveStep(i)}
                  className={`text-center group p-6 rounded-3xl border border-transparent transition-all duration-500 cursor-pointer ${
                    isActive 
                      ? "bg-white border-slate-200/80 shadow-md shadow-brand/5" 
                      : "hover:bg-white/40 hover:border-slate-200/50"
                  }`}
                >
                  <div
                    className={`w-[72px] h-[72px] rounded-full flex items-center justify-center mx-auto mb-5 transition-all duration-500 transform ${
                      isActive ? "scale-110 shadow-lg" : ""
                    } ${
                      isPassed
                        ? "bg-brand text-white shadow-brand/20"
                        : "bg-white border-2 border-slate-200 text-slate-400 group-hover:border-brand/40 group-hover:text-brand"
                    }`}
                  >
                    {s.icon}
                  </div>
                  <div className={`text-[10px] font-black tracking-[0.2em] mb-2 uppercase transition-colors ${
                    isPassed ? "text-brand" : "text-slate-400"
                  }`}>
                    Step {s.num}
                  </div>
                  <h3 className="font-display text-base font-bold text-ink mb-2.5">
                    {s.title}
                  </h3>
                  <p className="text-xs text-ink-3 leading-relaxed font-medium">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Simulator View */}
        <StepSimulator activeStep={activeStep} />
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const [userComments, setUserComments] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await fetch("/api/testimonials");
      const data = await res.json();
      if (data.success) setUserComments(data.data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const staticReviews = [
    {
      name: "Maria Santos",
      role: "Data Analyst",
      avatar: "MS",
      quote:
        "I landed 3 interviews in my first week. The Telegram alerts are insanely fast — I applied before it showed up in regular search.",
      stars: 5,
    },
    {
      name: "James Reyes",
      role: "Frontend Developer",
      avatar: "JR",
      quote:
        "Saved me hours of manual searching every day. The smart filter for remote React roles is incredibly accurate.",
      stars: 5,
    },
    {
      name: "Anna Lim",
      role: "Marketing Manager",
      avatar: "AL",
      quote:
        "I was skeptical but the scam detection alone is worth it. No more wasting time on suspicious listings.",
      stars: 5,
    },
  ];

  const allReviews = [
    ...staticReviews,
    ...userComments
      .filter((c) => !c.role?.startsWith("[Suggestion:"))
      .map((c) => ({
        name: c.name,
        role: c.role || "Job Seeker",
        avatar: c.name.charAt(0),
        quote: c.content,
        stars: c.rating,
      })),
  ];

  // Ensure we have enough items to fill the screen width for the marquee
  let trackReviews = [...allReviews];
  while (trackReviews.length < 8 && trackReviews.length > 0) {
    trackReviews = [...trackReviews, ...allReviews];
  }

  return (
    <section className="py-20 md:py-32 px-6 bg-white overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-10">
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={20} className="fill-gold text-gold" />
            ))}
          </div>
          <h2 className="font-display text-[2rem] md:text-[2.5rem] font-extrabold text-ink tracking-tight mb-4">
            Loved by job seekers
          </h2>
          <p className="text-ink-3 text-lg font-medium">
            Real stories from people who landed their dream roles.
          </p>
        </div>

        {/* Sliding Marquee Track */}
        <div className="overflow-hidden relative w-screen left-1/2 right-1/2 -ml-[50vw] mb-16 select-none py-4">
          {/* Fade gradients */}
          <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          
          <div 
            className="flex gap-6 items-center animate-marquee hover:[animation-play-state:paused] w-max cursor-default"
            style={{ animationDuration: "50s" }}
          >
            {/* Track A */}
            <div className="flex gap-6 items-center shrink-0">
              {trackReviews.map((r, i) => (
                <div
                  key={`review-a-${r.name}-${i}`}
                  className="w-[320px] md:w-[350px] p-8 rounded-[24px] border border-border bg-surface hover:shadow-premium-lg hover:border-brand/20 hover:scale-[1.01] transition-all duration-300 shrink-0"
                >
                  <div className="flex gap-1 mb-5">
                    {[...Array(r.stars)].map((_, idx) => (
                      <Star key={idx} size={15} className="fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-[14px] text-ink-2 leading-relaxed mb-6 font-medium italic min-h-[66px] line-clamp-3">
                    "{r.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center font-display font-extrabold text-xs text-white">
                      {r.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-ink">{r.name}</div>
                      <div className="text-[11px] text-ink-3 font-medium">
                        {r.role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Track B */}
            <div className="flex gap-6 items-center shrink-0" aria-hidden="true">
              {trackReviews.map((r, i) => (
                <div
                  key={`review-b-${r.name}-${i}`}
                  className="w-[320px] md:w-[350px] p-8 rounded-[24px] border border-border bg-surface hover:shadow-premium-lg hover:border-brand/20 hover:scale-[1.01] transition-all duration-300 shrink-0"
                >
                  <div className="flex gap-1 mb-5">
                    {[...Array(r.stars)].map((_, idx) => (
                      <Star key={idx} size={15} className="fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-[14px] text-ink-2 leading-relaxed mb-6 font-medium italic min-h-[66px] line-clamp-3">
                    "{r.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center font-display font-extrabold text-xs text-white">
                      {r.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-ink">{r.name}</div>
                      <div className="text-[11px] text-ink-3 font-medium">
                        {r.role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Trigger Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-3 shadow-xl active:scale-95 group"
          >
            <MessageSquarePlus
              size={20}
              className="group-hover:scale-110 transition-transform"
            />
            Share Your Success Story
          </button>
          <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Takes less than 1 minute
          </p>
        </div>

        <TestimonialModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchComments}
        />
      </div>
    </section>
  );
}

function PricingSection({ onGetStarted }: { onGetStarted: () => void }) {
  const plans = [
    {
      name: "Free Trial",
      price: "₱0",
      period: "",
      icon: <CheckCircle2 className="text-emerald-500" />,
      desc: "Start applying in minutes. Free forever for basic use.",
      features: [
        "50 jobs/day scrape",
        "1 job alert filter",
        "Email alerts",
        "Basic dashboard",
      ],
      cta: "Start Free Now",
      color: "emerald",
      popular: false,
    },
    {
      name: "Basic Pro",
      price: "₱99",
      period: "/month",
      icon: <Star className="text-blue-500" fill="currentColor" />,
      desc: "For freelancers who want to apply faster.",
      features: [
        "Unlimited scraping",
        "10 smart filters",
        "Telegram alerts",
        "Salary insights",
        "Priority detection",
      ],
      cta: "Start Applying Now",
      color: "blue",
      popular: true,
      badge: "Most Popular",
    },
    {
      name: "Elite Plan",
      price: "₱199",
      period: "/month",
      icon: <Zap className="text-indigo-600" fill="currentColor" />,
      desc: "For elite individuals who want absolute speed.",
      features: [
        "Everything in Pro",
        "AI Resume Builder",
        "Cover Letter Generator",
        "Unlimited exports",
        "Priority Support",
      ],
      cta: "Get Elite Access",
      color: "indigo",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 md:py-32 px-6 bg-white">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
            Start for free. Get results fast.
          </h2>
          <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">
            Try our smart filtering risk-free. Apply faster, save time, and
            upgrade anytime as your career grows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-[40px] p-8 md:p-10 border-2 transition-all duration-300 ${
                p.popular
                  ? "border-blue-600 shadow-2xl shadow-blue-900/10 scale-105 z-10"
                  : "border-slate-100 hover:border-slate-200"
              }`}
            >
              {p.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-blue-600/20">
                  {p.badge}
                </div>
              )}

              <div className="mb-8">
                <div
                  className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6`}
                >
                  {p.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">
                  {p.name}
                </h3>
                <p className="text-slate-500 text-xs font-bold leading-relaxed">
                  {p.desc}
                </p>
              </div>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-black text-slate-900 tracking-tighter">
                  {p.price}
                </span>
                <span className="text-slate-400 text-sm font-bold">
                  {p.period}
                </span>
              </div>

              <div className="h-px w-full bg-slate-100 mb-8" />

              <ul className="space-y-4 mb-12 flex-1">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 text-sm font-semibold"
                  >
                    <Check
                      size={16}
                      className={`shrink-0 mt-0.5 ${
                        p.color === "emerald"
                          ? "text-emerald-500"
                          : p.color === "blue"
                            ? "text-blue-500"
                            : "text-indigo-500"
                      }`}
                    />
                    <span className="text-slate-600">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={onGetStarted}
                className={`w-full py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all ${
                  p.color === "emerald"
                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                    : p.color === "blue"
                      ? "bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-600/20"
                } active:scale-95`}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <CheckCircle2 size={16} className="text-blue-500" />
              No credit card required
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <CheckCircle2 size={16} className="text-blue-500" />
              One-time payment options
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Already landed a job? Just don't renew — no hidden charges.
          </p>
        </div>
      </div>
    </section>
  );
}

function CTASection({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section className="py-20 md:py-32 px-6 bg-ink relative overflow-hidden">
      {/* bg decoration */}
      <div className="absolute top-[-30%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,_rgba(26,86,219,0.25)_0%,_transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,_rgba(6,182,212,0.12)_0%,_transparent_70%)] pointer-events-none" />

      <div className="max-w-[700px] mx-auto text-center relative z-[1]">
        <div className="w-16 h-16 rounded-[18px] bg-brand flex items-center justify-center mx-auto mb-6 shadow-[0_8px_32px_rgba(26,86,219,0.5)] animate-bounce-slow">
          <Zap size={28} color="white" fill="white" />
        </div>
        <h2 className="font-display text-[2.4rem] md:text-[2.8rem] font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
          Ready to stop searching
          <br />
          and start landing?
        </h2>
        <p className="text-lg text-white/60 mb-10 leading-relaxed font-medium">
          Join thousands of job seekers who apply faster and smarter every day.
        </p>
        <button
          onClick={onGetStarted}
          className="shimmer-btn inline-flex items-center gap-2.5 px-9 py-4 rounded-2xl text-base font-bold text-white shadow-[0_8px_32px_rgba(26,86,219,0.5)] hover:scale-105 active:scale-95 transition-transform"
        >
          Get Started Free <ArrowRight size={20} />
        </button>
        <p className="mt-5 text-[13px] text-white/35 font-medium">
          No credit card required · Free plan forever
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0a0f1e] py-12 px-6 border-t border-white/5">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 shrink-0">
              <img
                src="/jobscoutai.png"
                alt="JobScoutAI"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-display font-extrabold text-white text-base tracking-tight">
              JobScoutAI
            </span>
          </div>
          <p className="text-[13px] text-white/35 font-medium">
            © {new Date().getFullYear()} JobScoutAI. All rights reserved.
          </p>
        </div>
        <div className="flex gap-8">
          {["Privacy", "Terms", "Contact"].map((l) => (
            <a
              key={l}
              href="#"
              className="text-[13px] text-white/40 hover:text-white/90 transition-colors font-medium"
            >
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ─── Auth Modal ─────────────────────────────────────────────────── */
function AuthModal({
  isOpen,
  onClose,
  defaultSignUp = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  defaultSignUp?: boolean;
}) {
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "forgot" | "otp">(
    "signin",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const supabase = createClient();

  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setAuthMode(defaultSignUp ? "signup" : "signin");
  }, [defaultSignUp, isOpen]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    setOtpDigits(Array(6).fill(""));
  }, [authMode, isOpen]);

  if (!isOpen) return null;

  const handleOtpChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, "");
    if (!cleanVal) {
      const newOtp = [...otpDigits];
      newOtp[index] = "";
      setOtpDigits(newOtp);
      return;
    }

    const newOtp = [...otpDigits];
    if (cleanVal.length > 1) {
      const pastedCode = cleanVal.slice(0, 6 - index);
      for (let i = 0; i < pastedCode.length; i++) {
        newOtp[index + i] = pastedCode[i];
      }
      setOtpDigits(newOtp);
      const nextFocusIndex = Math.min(index + pastedCode.length, 5);
      otpInputRefs.current[nextFocusIndex]?.focus();
    } else {
      newOtp[index] = cleanVal;
      setOtpDigits(newOtp);
      if (index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        const newOtp = [...otpDigits];
        newOtp[index - 1] = "";
        setOtpDigits(newOtp);
        otpInputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otpDigits];
        newOtp[index] = "";
        setOtpDigits(newOtp);
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pastedData) {
      const newOtp = [...otpDigits];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtpDigits(newOtp);
      const focusIdx = Math.min(pastedData.length, 5);
      otpInputRefs.current[focusIdx]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      toast.success("Verification code resent successfully!");
      setCountdown(60);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (authMode === "signup") {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match.");
          setLoading(false);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;

        if (data?.user && (!data.user.identities || data.user.identities.length === 0)) {
          toast.warning("This email is already registered. Switching to Sign In.");
          setAuthMode("signin");
          setLoading(false);
          return;
        }

        toast.info("Check your email for the verification code!");
        setAuthMode("otp");
        setCountdown(60);
      } else if (authMode === "otp") {
        const token = otpDigits.join("");
        if (token.length !== 6) {
          toast.error("Please enter the 6-digit verification code.");
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.verifyOtp({
          email,
          token,
          type: "signup",
        });
        if (error) throw error;
        toast.success("Verification successful! Logging in...");
        window.location.href = "/jobs";
      } else if (authMode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.href = "/jobs";
      } else if (authMode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });
        if (error) throw error;
        toast.success(
          "Password reset link sent to your email! Please check your inbox.",
        );
        setAuthMode("signin");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-[fadeIn_0.2s_ease]">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#0a0f1e]/70 backdrop-blur-md"
      />
      <div className="relative w-full max-w-[440px] bg-white rounded-[32px] p-10 md:p-12 shadow-2xl animate-fade-up overflow-hidden border border-slate-100">
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500" />

        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full border border-border bg-surface flex items-center justify-center text-ink-3 hover:text-brand hover:border-brand hover:scale-105 active:scale-95 transition-all shadow-sm"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-4 shrink-0 flex items-center justify-center rounded-2xl bg-blue-50/50 p-2 shadow-inner ring-1 ring-blue-500/10">
            <img
              src="/jobscoutai.png"
              alt="JobScoutAI"
              className="w-full h-full object-contain"
            />
          </div>
          <h3 className="font-display text-2xl font-extrabold text-ink mb-2">
            {authMode === "signup"
              ? "Create Account"
              : authMode === "signin"
                ? "Welcome Back"
                : authMode === "forgot"
                  ? "Reset Password"
                  : "Verify Email"}
          </h3>
          <p className="text-sm text-ink-3 font-medium px-4">
            {authMode === "signup"
              ? "Start finding your dream job today."
              : authMode === "signin"
                ? "Sign in to your dashboard."
                : authMode === "forgot"
                  ? "Enter your email to receive a password reset link."
                  : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        {authMode !== "forgot" && authMode !== "otp" && (
          <>
            {/* Google */}
            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border-2 border-border bg-white text-sm font-bold text-ink-2 hover:border-brand hover:text-brand hover:scale-[1.01] active:scale-95 transition-all mb-6"
            >
              <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] font-black text-ink-4 tracking-widest uppercase">
                OR
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
          </>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          {authMode === "otp" ? (
            <div className="space-y-6">
              <div>
                <label className="block text-[11px] font-extrabold text-ink-3 tracking-widest uppercase mb-4 text-center">
                  Verification Code
                </label>
                <div className="flex justify-between gap-2 max-w-[340px] mx-auto mb-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-extrabold bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10 transition-all duration-200"
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading || countdown > 0}
                  className="text-xs font-bold text-brand hover:underline cursor-pointer disabled:text-ink-4 disabled:no-underline disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {countdown > 0 ? (
                    <>
                      <Loader2 size={12} className="animate-spin text-ink-4" />
                      <span>Resend Code in {countdown}s</span>
                    </>
                  ) : (
                    "Resend Code"
                  )}
                </button>
              </div>
            </div>
          ) : (
            [
              {
                label: "Email",
                type: "email",
                value: email,
                set: setEmail,
                icon: <Mail size={16} />,
                placeholder: "name@example.com",
              },
              {
                label: "Password",
                type: "password",
                value: password,
                set: setPassword,
                icon: <Lock size={16} />,
                placeholder: "••••••••",
                show: authMode !== "forgot",
              },
              {
                label: "Confirm Password",
                type: "password",
                value: confirmPassword,
                set: setConfirmPassword,
                icon: <Lock size={16} />,
                placeholder: "••••••••",
                show: authMode === "signup",
              },
            ]
              .filter((f) => f.show !== false)
              .map((f) => (
                <div key={f.label}>
                  <label className="block text-[11px] font-extrabold text-ink-3 tracking-widest uppercase mb-2">
                    {f.label}
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-4">
                      {f.icon}
                    </div>
                    <input
                      type={
                        f.type === "password" && showPassword ? "text" : f.type
                      }
                      required
                      value={f.value}
                      onChange={(e) => f.set(e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full py-3 pl-11 pr-12 rounded-xl border-2 border-border bg-surface text-sm font-semibold outline-none focus:border-brand transition-colors"
                    />
                    {f.type === "password" && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-4 hover:text-brand transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                  </div>
                  {f.label === "Password" && authMode === "signin" && (
                    <div className="flex justify-end mt-2">
                      <button
                        type="button"
                        onClick={() => setAuthMode("forgot")}
                        className="text-[11px] font-bold text-brand hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </div>
              ))
          )}
          <button
            type="submit"
            disabled={loading}
            className="shimmer-btn w-full py-3.5 rounded-xl text-[15px] font-bold text-white flex items-center justify-center gap-2.5 disabled:opacity-70 mt-2 hover:scale-[1.02] active:scale-95 transition-all duration-200 shadow-lg shadow-brand/10 hover:shadow-brand/20"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <span className="mt-0.5">
                  {authMode === "signup"
                    ? "Create Account"
                    : authMode === "signin"
                      ? "Sign In"
                      : authMode === "forgot"
                        ? "Send Reset Link"
                        : "Verify & Sign In"}
                </span>
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-ink-3 font-medium">
          {authMode === "forgot" ? (
            <button
              onClick={() => setAuthMode("signin")}
              className="text-brand font-bold hover:underline"
            >
              Back to Sign In
            </button>
          ) : authMode === "otp" ? (
            <button
              onClick={() => setAuthMode("signup")}
              className="text-brand font-bold hover:underline"
            >
              Back to Sign Up
            </button>
          ) : (
            <>
              {authMode === "signup"
                ? "Already have an account? "
                : "Don't have an account? "}
              <button
                onClick={() =>
                  setAuthMode(authMode === "signup" ? "signin" : "signup")
                }
                className="text-brand font-bold hover:underline"
              >
                {authMode === "signup" ? "Sign In" : "Sign Up Free"}
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

/* ─── Demo Video Modal ────────────────────────────────────────────── */
function DemoVideoModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease]">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#0a0f1e]/80 backdrop-blur-md"
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-[800px] aspect-video bg-black rounded-3xl shadow-2xl overflow-hidden border border-white/10 animate-fade-up">
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 z-10" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all z-20"
        >
          <X size={18} />
        </button>

        {/* Iframe for Google Drive Video */}
        <iframe
          src="https://drive.google.com/file/d/1hU4cYuX5gKccmCyF9vm9VbASBpbL4ttW/preview"
          className="w-full h-full border-0"
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      </div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────── */
function LandingContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultSignUp, setDefaultSignUp] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [demoOpen, setDemoOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.href = "/dashboard";
      }
    });
  }, []);

  useEffect(() => {
    if (searchParams.get("login") === "true") {
      setModalOpen(true);
      setDefaultSignUp(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/global-stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats(d.data);
      })
      .catch(() => {});
  }, []);

  const openSignIn = () => {
    setDefaultSignUp(false);
    setModalOpen(true);
  };
  const openSignUp = () => {
    setDefaultSignUp(true);
    setModalOpen(true);
  };

  return (
    <div className="w-full bg-white text-ink selection:bg-brand/10">
      <NavBar onSignIn={openSignIn} onGetStarted={openSignUp} />
      <HeroSection
        stats={stats}
        onGetStarted={openSignUp}
        onWatchDemo={() => setDemoOpen(true)}
      />
      <LogoMarquee />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection onGetStarted={openSignUp} />
      <CTASection onGetStarted={openSignUp} />
      <Footer />
      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultSignUp={defaultSignUp}
      />
      <DemoVideoModal
        isOpen={demoOpen}
        onClose={() => setDemoOpen(false)}
      />
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-brand" />
        </div>
      }
    >
      <LandingContent />
    </Suspense>
  );
}
