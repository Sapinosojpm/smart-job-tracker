'use client';

import { useState } from 'react';
import { X, Check, Loader2, ArrowRight, ArrowLeft, Star, Zap, Rocket, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlanModal({ isOpen, onClose }: PlanModalProps) {
  const [checkoutStep, setCheckoutStep] = useState<'PLANS' | 'PAYMENT'>('PLANS');
  const [selectedPlan, setSelectedPlan] = useState<'PRO' | 'TEAM' | null>(null);
  const [payMongoLoading, setPayMongoLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpgradeSelect = (plan: string) => {
    if (plan === 'FREE') {
      onClose();
      return;
    }
    setSelectedPlan(plan as 'PRO' | 'TEAM');
    setCheckoutStep('PAYMENT');
  };

  const handlePayMongoCheckout = async () => {
    if (!selectedPlan) return;
    setPayMongoLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to start checkout');
      }
    } catch (err: any) {
      toast.error(err.message);
      setPayMongoLoading(false);
    }
  };

  const plans = [
    {
      id: 'FREE', name: 'Free', price: '₱0', period: '', icon: <Zap size={16} />,
      features: ['50 jobs/day scrape', '1 job alert filter', 'Email alerts', 'Basic dashboard'],
      cta: 'Current Plan', recommended: false,
    },
    {
      id: 'PRO', name: 'Pro', price: '₱99', period: '/mo', icon: <Star size={16} />,
      features: ['Unlimited scraping', '10 smart filters', 'Telegram alerts', 'Salary insights', 'Priority support'],
      cta: 'Upgrade Now', recommended: true,
    },
    {
      id: 'TEAM', name: 'Elite', price: '₱199', period: '/mo', icon: <Rocket size={16} />,
      features: ['Everything in Pro', 'AI Resume Tailoring', 'Scam Shield Pro', 'Instant Refresh', 'Elite Insights'],
      cta: 'Go Elite', recommended: false,
    },
  ];

  const payPalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-white rounded-[32px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute right-6 top-6 p-1.5 rounded-full hover:bg-slate-50 text-slate-400 transition-colors">
          <X size={18} />
        </button>

        {checkoutStep === 'PLANS' ? (
          <>
            <div className="pt-8 pb-6 px-10 text-center">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Elevate your search.</h2>
              <p className="text-slate-400 text-[13px] font-medium">Simple plans for individual career growth.</p>
            </div>

            <div className="px-8 pb-8 grid grid-cols-1 md:grid-cols-3 gap-5">
              {plans.map((p) => (
                <div 
                  key={p.id} 
                  className={`flex flex-col p-6 rounded-2xl border transition-all duration-300 ${
                    p.recommended ? 'border-blue-500 ring-4 ring-blue-50 shadow-lg' : 'border-slate-100 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className={`p-2 rounded-lg ${p.recommended ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                       {p.icon}
                    </div>
                    {p.recommended && <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">Popular</span>}
                  </div>

                  <div className="mb-4">
                     <h3 className="text-lg font-bold text-slate-900 leading-none mb-1">{p.name}</h3>
                     <div className="flex items-baseline gap-0.5">
                       <span className="text-2xl font-black text-slate-900">{p.price}</span>
                       <span className="text-slate-400 text-[11px] font-bold">{p.period}</span>
                     </div>
                  </div>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-[12px] font-semibold text-slate-600">
                        <Check size={14} className="text-blue-500 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgradeSelect(p.id)}
                    disabled={p.id === 'FREE'}
                    className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-[12px] font-bold transition-all ${
                      p.recommended 
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200' 
                        : p.id === 'FREE' ? 'bg-slate-50 text-slate-300' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{p.cta}</span>
                    {p.id !== 'FREE' && <ArrowRight size={14} />}
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="pt-8 pb-6 px-10 text-center relative">
              <button
                onClick={() => {
                  setCheckoutStep('PLANS');
                  setSelectedPlan(null);
                }}
                className="absolute left-10 top-8 flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={16} /> Back to plans
              </button>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Select Payment Method</h2>
              <p className="text-slate-400 text-[13px] font-medium">
                Choose how you would like to pay for the {selectedPlan === 'PRO' ? 'Pro Plan (₱99/mo)' : 'Elite Plan (₱199/mo)'}.
              </p>
            </div>

            <div className="px-10 pb-10 max-w-xl mx-auto w-full flex flex-col gap-6">
              {/* PayMongo Option */}
              <button
                onClick={handlePayMongoCheckout}
                disabled={payMongoLoading}
                className="w-full p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-600 hover:ring-4 hover:ring-blue-50 shadow-sm flex items-center justify-between transition-all group cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl">
                    ₱
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm text-slate-900">GCash, Maya, or Card</div>
                    <div className="text-xs font-medium text-slate-400">Pay via PayMongo checkout portal</div>
                  </div>
                </div>
                {payMongoLoading ? (
                  <Loader2 className="animate-spin w-5 h-5 text-blue-600" />
                ) : (
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                )}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Or Pay with PayPal</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              {/* PayPal Smart Buttons Container */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 min-h-[150px] flex flex-col justify-center">
                {payPalClientId ? (
                  <PayPalScriptProvider
                    options={{
                      clientId: payPalClientId,
                      currency: 'PHP',
                      intent: 'capture',
                    }}
                  >
                    <PayPalButtons
                      style={{
                        layout: 'vertical',
                        color: 'blue',
                        shape: 'rect',
                        label: 'pay'
                      }}
                      createOrder={async () => {
                        try {
                          const res = await fetch('/api/paypal/create-order', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ plan: selectedPlan }),
                          });
                          const data = await res.json();
                          if (data.success && data.orderID) {
                            return data.orderID;
                          } else {
                            throw new Error(data.error || 'Failed to initiate PayPal order');
                          }
                        } catch (err: any) {
                          toast.error(err.message || 'PayPal initiation error');
                          throw err;
                        }
                      }}
                      onApprove={async (data) => {
                        try {
                          const res = await fetch('/api/paypal/capture-order', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ orderID: data.orderID }),
                          });
                          const responseData = await res.json();
                          if (responseData.success) {
                            toast.success(`Success! Upgraded to ${selectedPlan === 'PRO' ? 'Pro' : 'Elite'} Plan.`);
                            onClose();
                            window.location.reload();
                          } else {
                            throw new Error(responseData.error || 'Failed to capture payment');
                          }
                        } catch (err: any) {
                          toast.error(err.message || 'PayPal capture error');
                        }
                      }}
                      onError={(err) => {
                        console.error('[PAYPAL_BUTTON_ERROR]', err);
                        toast.error('PayPal Transaction Error');
                      }}
                    />
                  </PayPalScriptProvider>
                ) : (
                  <div className="text-center py-4">
                    <span className="text-xs font-bold text-amber-500 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg">
                      PayPal Client ID not configured in environment
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="py-4 border-t border-slate-50 flex items-center justify-center gap-2">
           <ShieldCheck size={14} className="text-blue-500" />
           <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Secure Payment Gateway</span>
        </div>
      </div>
    </div>
  );
}
