'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Zap, Search, Bell, ChevronRight, ArrowRight, Target,
  Sparkles, Globe, Mail, Lock, Loader2, X, CheckCircle2,
  TrendingUp, Users, Briefcase, Star, Play, Shield,
  Clock, BarChart3, Filter, Send, Menu as MenuIcon
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-toastify';

/* ─── Sub-components ─────────────────────────────────────────────── */

function NavBar({ onSignIn, onGetStarted }: { onSignIn: () => void; onGetStarted: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-white/92 backdrop-blur-lg border-b border-border shadow-sm' : 'bg-transparent'
      }`}>
      <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-lg shadow-brand/30">
            <Briefcase size={20} color="white" />
          </div>
          <div>
            <div className="font-display font-extrabold text-base text-ink leading-none">Smart Job</div>
            <div className="text-[10px] font-bold text-brand tracking-widest uppercase mt-0.5">Tracker</div>
          </div>
        </div>

        {/* Nav Links (desktop) */}
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'How it Works', 'Pricing'].map(l => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/ /g, '-')}`}
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
          {['Features', 'How it Works', 'Pricing'].map(l => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/ /g, '-')}`}
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-bold text-ink-2 hover:text-brand transition-colors"
            >
              {l}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-4 border-t border-border">
            <button
              onClick={() => { onSignIn(); setMobileMenuOpen(false); }}
              className="w-full py-4 text-lg font-bold text-ink-2 bg-surface rounded-xl"
            >
              Sign In
            </button>
            <button
              onClick={() => { onGetStarted(); setMobileMenuOpen(false); }}
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

function HeroSection({ stats, onGetStarted }: { stats: any; onGetStarted: () => void }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white pt-[72px]">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-[radial-gradient(ellipse,_rgba(26,86,219,0.06)_0%,_transparent_70%)]" />
        <div className="absolute bottom-[5%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,_rgba(6,182,212,0.05)_0%,_transparent_70%)]" />
        <div className="absolute bottom-[5%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,_rgba(26,86,219,0.05)_0%,_transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(26,86,219,0.1)_1px,_transparent_1px)] bg-[length:40px_40px] opacity-35" />
      </div>

      <div className="w-full max-w-[1200px] mx-auto px-6 py-20 relative z-[1] flex flex-col items-center">
        <div className="w-full max-w-[760px] text-center">
          {/* Pill badge */}
          <div className="animate-fade-up animate-delay-[0.1s] inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-light border border-brand/20 mb-8">
            <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_0_2px_rgba(16,185,129,0.3)] animate-pulse" />
            <span className="text-[13px] font-bold text-brand tracking-tight">Actively scraping 500+ new jobs daily</span>
          </div>

          {/* Headline */}
          <h1 className="hero-title animate-fade-up animate-delay-[0.2s] font-display text-[2.8rem] md:text-[4.2rem] font-extrabold leading-[1.08] text-ink mb-6 tracking-tight">
            Your Dream Job Is <span className="gradient-text">One Alert</span> Away
          </h1>

          {/* Sub */}
          <p className="animate-fade-up animate-delay-[0.3s] text-lg md:text-[1.15rem] text-ink-3 leading-relaxed mb-10 max-w-[560px] mx-auto font-medium">
            We automatically scrape JobStreet, Indeed & OnlineJobs.ph, filter to your profile, and ping you the moment a match appears.
          </p>

          {/* CTA group */}
          <div className="animate-fade-up animate-delay-[0.45s] flex flex-wrap items-center justify-center gap-3 mb-12">
            <button
              onClick={onGetStarted}
              className="shimmer-btn flex items-center gap-2.5 px-[30px] py-[14px] rounded-xl text-[15px] font-bold text-white shadow-premium-lg hover:scale-105 active:scale-95 transition-transform"
            >
              Start Free — No Credit Card <ArrowRight size={18} />
            </button>
            <button className="flex items-center gap-2 px-[24px] py-[14px] rounded-xl border-2 border-border bg-white text-[15px] font-bold text-ink-2 hover:border-brand hover:text-brand transition-all">
              <Play size={16} fill="currentColor" /> Watch 2-min demo
            </button>
          </div>

          {/* Trust row */}
          <div className="animate-fade-up animate-delay-[0.6s] flex flex-wrap items-center justify-center gap-6 mb-16">
            {[
              { label: 'No spam, ever', icon: <Shield size={14} /> },
              { label: 'Cancel anytime', icon: <CheckCircle2 size={14} /> },
              { label: 'Setup in 2 minutes', icon: <Clock size={14} /> },
            ].map(t => (
              <div key={t.label} className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-3">
                <span className="text-success">{t.icon}</span>{t.label}
              </div>
            ))}
          </div>

          {/* Stats bar */}
          <div className="animate-fade-up animate-delay-[0.6s] w-full grid grid-cols-2 md:grid-cols-3 bg-surface rounded-[20px] border border-border shadow-sm overflow-hidden">
            {[
              { value: stats?.totalJobs, label: 'Jobs Scraped', suffix: '+' },
              { value: stats?.activeUsers, label: 'Active Users', suffix: '+' },
              { value: stats?.successMatches, label: 'Success Matches', suffix: '+' },
            ].map((s, i) => (
              <div key={s.label} className={`text-center py-6 md:py-8 px-4 ${
                i === 0 ? 'border-r border-b md:border-b-0 border-border' : 
                i === 1 ? 'border-b md:border-b-0 md:border-r border-border' : 
                'col-span-2 md:col-span-1'
              }`}>
                <div className="font-display text-[1.6rem] md:text-[2rem] font-extrabold text-ink leading-none">
                  {Intl.NumberFormat('en-US', { notation: 'compact' }).format(s.value || 0)}{s.suffix}
                </div>
                <div className="text-[10px] md:text-[11px] font-bold text-ink-4 tracking-wider uppercase mt-2">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LogoMarquee() {
  const platforms = ['JobStreet', 'Indeed', 'OnlineJobs.ph', 'Kalibrr', 'LinkedIn', 'Glassdoor', 'Workable', 'Remotive'];
  const doubled = [...platforms, ...platforms, ...platforms, ...platforms];
  return (
    <section className="bg-ink py-7 overflow-hidden relative">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-ink to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-ink to-transparent z-10 pointer-events-none" />
      <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/40 text-center mb-5">Scraping top platforms for you</div>
      <div className="overflow-hidden">
        <div className="flex gap-16 items-center animate-marquee w-max">
          {doubled.map((p, i) => (
            <div key={i} className="flex items-center gap-2.5 whitespace-nowrap">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="font-display text-base font-bold text-white/70">{p}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: <Search size={24} />, color: 'text-brand', bg: 'bg-brand/10',
      title: 'Automated Daily Scraping',
      desc: 'Our bots run every 4 hours across 8+ job platforms so fresh listings land in your dashboard before anyone else.',
      tag: 'Core'
    },
    {
      icon: <Filter size={24} />, color: 'text-purple-500', bg: 'bg-purple-500/10',
      title: 'AI-Powered Smart Filtering',
      desc: 'Define your ideal role with keywords, salary, and location. We surface only the jobs that truly fit.',
      tag: 'AI'
    },
    {
      icon: <Bell size={24} />, color: 'text-success', bg: 'bg-success/10',
      title: 'Instant Email & Telegram Alerts',
      desc: 'Get notified within minutes of a new match via your preferred channel. Be the first to apply.',
      tag: 'Alerts'
    },
    {
      icon: <BarChart3 size={24} />, color: 'text-gold', bg: 'bg-gold/10',
      title: 'Application Dashboard',
      desc: 'Track every application in one place — from "Saved" to "Offer Received" — with timeline per role.',
      tag: 'Dashboard'
    },
    {
      icon: <TrendingUp size={24} />, color: 'text-accent', bg: 'bg-accent/10',
      title: 'Market Salary Insights',
      desc: 'See real-time salary data for your target roles so you always negotiate from a position of knowledge.',
      tag: 'Analytics'
    },
    {
      icon: <Shield size={24} />, color: 'text-red-500', bg: 'bg-red-500/10',
      title: 'Scam Job Detection',
      desc: 'Our classifier flags suspicious listings before they waste your time, keeping only verified employers.',
      tag: 'Safety'
    },
  ];

  return (
    <section id="features" className="py-20 md:py-32 px-6 bg-white">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-3.5 py-1 rounded-full bg-brand-light text-[12px] font-bold text-brand tracking-widest uppercase mb-4">Features</div>
          <h2 className="font-display text-[2rem] md:text-[2.5rem] font-extrabold text-ink mb-4 tracking-tight">
            Everything you need to land the job
          </h2>
          <p className="text-base md:text-lg text-ink-3 max-w-[520px] mx-auto leading-relaxed">
            Stop copy-pasting from ten browser tabs. One smart tool handles your entire search workflow.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => (
            <div key={f.title} className="group p-8 rounded-[24px] border border-border bg-white hover:border-brand/30 hover:shadow-premium-lg transition-all duration-300 relative overflow-hidden">
              {/* Tag */}
              <div className={`absolute top-5 right-5 text-[11px] font-bold tracking-wider uppercase ${f.color} ${f.bg} px-2.5 py-0.5 rounded-full`}>{f.tag}</div>
              {/* Icon */}
              <div className={`w-[52px] h-[52px] rounded-xl ${f.bg} flex items-center justify-center ${f.color} mb-5 group-hover:scale-110 transition-transform`}>{f.icon}</div>
              <h3 className="font-display text-lg font-bold text-ink mb-2.5">{f.title}</h3>
              <p className="text-sm text-ink-3 leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { num: '01', icon: <Users size={28} />, title: 'Create your profile', desc: 'Sign up and tell us your target roles, keywords, and salary expectations.' },
    { num: '02', icon: <Search size={28} />, title: 'We scrape for you', desc: 'Every 4 hours our bots comb 8+ platforms and filter results against your exact criteria.' },
    { num: '03', icon: <Bell size={28} />, title: 'Get instant alerts', desc: 'Matching jobs land in your inbox or Telegram within minutes of being posted.' },
    { num: '04', icon: <CheckCircle2 size={28} />, title: 'Apply & track', desc: 'Apply directly, then track progress from your dashboard — all in one organized view.' },
  ];
  return (
    <section id="how-it-works" className="py-20 md:py-32 px-6 bg-surface">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-3.5 py-1 rounded-full bg-brand-light text-[12px] font-bold text-brand tracking-widest uppercase mb-4">How it Works</div>
          <h2 className="font-display text-[2rem] md:text-[2.5rem] font-extrabold text-ink tracking-tight">
            From signup to offer in 4 steps
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={s.num} className="text-center group">
              <div className={`w-[72px] h-[72px] rounded-full flex items-center justify-center mx-auto mb-5 transition-all duration-300 ${i === 0 ? 'bg-brand text-white shadow-lg shadow-brand/35' : 'bg-white border-2 border-border text-brand'
                }`}>
                {s.icon}
              </div>
              <div className="text-[11px] font-extrabold text-brand tracking-[0.15em] mb-2 uppercase">{s.num}</div>
              <h3 className="font-display text-base font-bold text-ink mb-2.5">{s.title}</h3>
              <p className="text-sm text-ink-3 leading-relaxed font-medium">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const reviews = [
    { name: 'Maria Santos', role: 'Data Analyst', avatar: 'MS', quote: 'I landed 3 interviews in my first week. The Telegram alerts are insanely fast — I applied before it showed up in regular search.', stars: 5 },
    { name: 'James Reyes', role: 'Frontend Developer', avatar: 'JR', quote: 'Saved me hours of manual searching every day. The smart filter for remote React roles is incredibly accurate.', stars: 5 },
    { name: 'Anna Lim', role: 'Marketing Manager', avatar: 'AL', quote: 'I was skeptical but the scam detection alone is worth it. No more wasting time on suspicious listings.', stars: 5 },
  ];
  return (
    <section className="py-20 md:py-32 px-6 bg-white">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => <Star key={i} size={20} className="fill-gold text-gold" />)}
          </div>
          <h2 className="font-display text-[2rem] md:text-[2.5rem] font-extrabold text-ink tracking-tight mb-4">Loved by job seekers</h2>
          <p className="text-ink-3 text-lg font-medium">Real stories from people who landed their dream roles.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map(r => (
            <div key={r.name} className="p-8 rounded-[24px] border border-border bg-surface hover:shadow-premium-lg transition-shadow duration-300">
              <div className="flex gap-1 mb-5">
                {[...Array(r.stars)].map((_, i) => <Star key={i} size={16} className="fill-gold text-gold" />)}
              </div>
              <p className="text-[15px] text-ink-2 leading-relaxed mb-6 font-medium italic">"{r.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center font-display font-extrabold text-sm text-white">{r.avatar}</div>
                <div>
                  <div className="font-bold text-sm text-ink">{r.name}</div>
                  <div className="text-[13px] text-ink-3 font-medium">{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection({ onGetStarted }: { onGetStarted: () => void }) {
  const plans = [
    {
      name: 'Free', price: '₱0', period: '/forever',
      features: ['50 jobs/day scrape', '1 job alert filter', 'Email alerts', 'Basic dashboard'],
      cta: 'Start Free', popular: false
    },
    {
      name: 'Pro', price: '₱299', period: '/month',
      features: ['Unlimited scraping', '10 smart filters', 'Email + Telegram alerts', 'Advanced dashboard', 'Salary insights', 'Priority scam detection'],
      cta: 'Start Pro Trial', popular: true
    },
    {
      name: 'Team', price: '₱799', period: '/month',
      features: ['Everything in Pro', 'Up to 5 team members', 'Shared filter templates', 'CSV export', 'Dedicated support'],
      cta: 'Contact Us', popular: false
    },
  ];
  return (
    <section id="pricing" className="py-20 md:py-32 px-6 bg-surface">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-3.5 py-1 rounded-full bg-brand-light text-[12px] font-bold text-brand tracking-widest uppercase mb-4">Pricing</div>
          <h2 className="font-display text-[2rem] md:text-[2.5rem] font-extrabold text-ink tracking-tight mb-4">Simple, transparent pricing</h2>
          <p className="text-ink-3 text-lg font-medium">Start free. Upgrade when you're ready.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {plans.map(p => (
            <div key={p.name} className={`rounded-[32px] p-8 md:p-10 relative transition-all duration-300 ${p.popular ? 'bg-brand text-white border-2 border-brand shadow-premium-xl ring-4 ring-brand/10' : 'bg-white border border-border shadow-sm'
              }`}>
              {p.popular && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gold text-white text-[11px] font-extrabold tracking-widest uppercase px-4 py-1.5 rounded-full">Most Popular</div>}
              <div className={`text-[13px] font-bold mb-3 tracking-widest uppercase ${p.popular ? 'text-white/70' : 'text-ink-3'}`}>{p.name}</div>
              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="font-display text-4xl font-extrabold tracking-tight">{p.price}</span>
                <span className={`text-sm ${p.popular ? 'text-white/60' : 'text-ink-4'}`}>{p.period}</span>
              </div>
              <div className={`h-px w-full mb-8 ${p.popular ? 'bg-white/10' : 'bg-border'}`} />
              <ul className="space-y-4 mb-10">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm font-medium">
                    <CheckCircle2 size={16} className={`shrink-0 ${p.popular ? 'text-white/80' : 'text-success'}`} />
                    <span className={p.popular ? 'text-white/90' : 'text-ink-2'}>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={onGetStarted}
                className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all ${p.popular ? 'bg-white text-brand hover:bg-brand-light' : 'border-2 border-border text-ink-2 hover:border-brand hover:text-brand'
                  }`}
              >
                {p.cta}
              </button>
            </div>
          ))}
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
          Ready to stop searching<br />and start landing?
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
        <p className="mt-5 text-[13px] text-white/35 font-medium">No credit card required · Free plan forever</p>
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
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <Briefcase size={16} color="white" />
            </div>
            <span className="font-display font-extrabold text-white text-base tracking-tight">Smart Job Tracker</span>
          </div>
          <p className="text-[13px] text-white/35 font-medium">© {new Date().getFullYear()} Smart Job Tracker. All rights reserved.</p>
        </div>
        <div className="flex gap-8">
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <a key={l} href="#" className="text-[13px] text-white/40 hover:text-white/90 transition-colors font-medium">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ─── Auth Modal ─────────────────────────────────────────────────── */
function AuthModal({ isOpen, onClose, defaultSignUp = false }: { isOpen: boolean; onClose: () => void; defaultSignUp?: boolean }) {
  const [isSignUp, setIsSignUp] = useState(defaultSignUp);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => { setIsSignUp(defaultSignUp); }, [defaultSignUp]);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
        if (error) throw error;
        toast.info('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = '/jobs';
      }
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } });
      if (error) throw error;
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-[fadeIn_0.2s_ease]">
      <div onClick={onClose} className="absolute inset-0 bg-[#0a0f1e]/70 backdrop-blur-md" />
      <div className="relative w-full max-w-[440px] bg-white rounded-[32px] p-10 md:p-12 shadow-2xl animate-fade-up">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full border border-border bg-surface flex items-center justify-center text-ink-3 hover:text-brand hover:border-brand transition-all"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand/35">
            <Briefcase size={24} color="white" />
          </div>
          <h3 className="font-display text-2xl font-extrabold text-ink mb-2">{isSignUp ? 'Create Account' : 'Welcome Back'}</h3>
          <p className="text-sm text-ink-3 font-medium">{isSignUp ? 'Start finding your dream job today.' : 'Sign in to your dashboard.'}</p>
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border-2 border-border bg-white text-sm font-bold text-ink-2 hover:border-brand hover:text-brand transition-all mb-6"
        >
          <Globe size={18} className="text-blue-500" /> Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] font-black text-ink-4 tracking-widest uppercase">OR</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          {[
            { label: 'Email', type: 'email', value: email, set: setEmail, icon: <Mail size={16} />, placeholder: 'name@example.com' },
            { label: 'Password', type: 'password', value: password, set: setPassword, icon: <Lock size={16} />, placeholder: '••••••••' },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-[11px] font-extrabold text-ink-3 tracking-widest uppercase mb-2">{f.label}</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-4">{f.icon}</div>
                <input
                  type={f.type}
                  required
                  value={f.value}
                  onChange={e => f.set(e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full py-3 pl-11 pr-4 rounded-xl border-2 border-border bg-surface text-sm font-semibold outline-none focus:border-brand transition-colors"
                />
              </div>
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="shimmer-btn w-full py-3.5 rounded-xl text-[15px] font-bold text-white flex items-center justify-center gap-2.5 disabled:opacity-70 mt-2 hover:scale-[1.02] active:scale-95 transition-transform"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><span className="mt-0.5">{isSignUp ? 'Create Account' : 'Sign In'}</span><ChevronRight size={18} /></>}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-ink-3 font-medium">
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-brand font-bold hover:underline">
            {isSignUp ? 'Sign In' : 'Sign Up Free'}
          </button>
        </p>
      </div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────── */
function LandingContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultSignUp, setDefaultSignUp] = useState(false);
  const [stats, setStats] = useState({ totalJobs: 0, activeUsers: 0, successMatches: 0 });
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('login') === 'true') { setModalOpen(true); setDefaultSignUp(false); }
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/global-stats').then(r => r.json()).then(d => { if (d.success) setStats(d.data); }).catch(() => { });
  }, []);

  const openSignIn = () => { setDefaultSignUp(false); setModalOpen(true); };
  const openSignUp = () => { setDefaultSignUp(true); setModalOpen(true); };

  return (
    <div className="w-full bg-white text-ink selection:bg-brand/10">
      <NavBar onSignIn={openSignIn} onGetStarted={openSignUp} />
      <HeroSection stats={stats} onGetStarted={openSignUp} />
      <LogoMarquee />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection onGetStarted={openSignUp} />
      <CTASection onGetStarted={openSignUp} />
      <Footer />
      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} defaultSignUp={defaultSignUp} />
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 size={32} className="animate-spin text-brand" /></div>}>
      <LandingContent />
    </Suspense>
  );
}