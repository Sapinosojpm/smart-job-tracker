'use client';

import { useState } from 'react';
import { X, Check, Zap, Shield, Users, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlanModal({ isOpen, onClose }: PlanModalProps) {
  const [loadingPlan, setLoadingPlan] = useState<'PRO' | 'TEAM' | null>(null);

  if (!isOpen) return null;

  const handleUpgrade = async (plan: 'PRO' | 'TEAM') => {
    setLoadingPlan(plan);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to start checkout');
      }
    } catch (err: any) {
      toast.error(err.message);
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      id: 'PRO',
      name: 'Pro Plan',
      price: '₱299',
      period: '/mo',
      desc: 'Ideal for serious job seekers.',
      icon: <Zap className="text-amber-500" />,
      color: 'blue',
      features: [
        'Unlimited daily scraping',
        'Up to 10 smart filters',
        'Telegram & Email alerts',
        'Scam detection engine',
        'Salary analytics insights',
      ],
    },
    {
      id: 'TEAM',
      name: 'Team Plan',
      price: '₱799',
      period: '/mo',
      desc: 'For groups and collaborations.',
      icon: <Users className="text-indigo-500" />,
      color: 'indigo',
      features: [
        'Everything in Pro',
        'Up to 5 team members',
        'Shared filter templates',
        'CSV & JSON exports',
        'Priority support',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-slate-50 rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
        {/* Left Side - Info */}
        <div className="w-full md:w-[320px] bg-white p-10 border-r border-slate-100 flex flex-col justify-between">
          <div>
            <button onClick={onClose} className="md:hidden absolute right-6 top-6 p-2 rounded-full bg-slate-100 text-slate-400">
              <X size={20} />
            </button>
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mb-8 shadow-lg shadow-blue-600/20">
              <Shield className="text-white" size={28} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 leading-tight mb-4">Upgrade Your Search</h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Unlock the full potential of our AI-powered engine and land your dream job faster.
            </p>
          </div>

          <div className="mt-12 space-y-6">
             <div className="flex items-center gap-3">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure Payment by PayMongo</p>
             </div>
          </div>
        </div>

        {/* Right Side - Plans */}
        <div className="flex-1 p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((p) => (
            <div 
              key={p.id} 
              className={`relative bg-white p-8 rounded-[32px] border-2 transition-all group ${
                p.id === 'PRO' ? 'border-amber-100 hover:border-amber-300' : 'border-indigo-100 hover:border-indigo-300'
              } hover:shadow-xl`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${p.id === 'PRO' ? 'bg-amber-50' : 'bg-indigo-50'}`}>
                  {p.icon}
                </div>
                <div className="text-[11px] font-black text-slate-300 uppercase tracking-widest group-hover:text-slate-400 transition-colors">{p.id}</div>
              </div>

              <h3 className="text-xl font-extrabold text-slate-900 mb-2">{p.name}</h3>
              <p className="text-slate-500 text-xs font-medium mb-6">{p.desc}</p>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-black text-slate-900 tracking-tight">{p.price}</span>
                <span className="text-slate-400 text-sm font-bold">{p.period}</span>
              </div>

              <div className="h-px bg-slate-50 w-full mb-8" />

              <ul className="space-y-4 mb-10">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[13px] font-semibold text-slate-600">
                    <Check size={16} className="text-green-500 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(p.id as 'PRO' | 'TEAM')}
                disabled={!!loadingPlan}
                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-sm font-black transition-all ${
                  p.id === 'PRO' 
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600' 
                    : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700'
                } active:scale-95 disabled:opacity-50`}
              >
                {loadingPlan === p.id ? <Loader2 size={18} className="animate-spin" /> : (
                  <>
                    <span>Choose {p.name}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
