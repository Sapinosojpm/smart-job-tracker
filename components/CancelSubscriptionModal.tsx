'use client';

import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { X, ShieldAlert, Loader2, AlertTriangle } from 'lucide-react';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  planName: string;
}

export default function CancelSubscriptionModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  loading,
  planName 
}: CancelSubscriptionModalProps) {
  const [verifyText, setVerifyText] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (isOpen) {
      gsap.fromTo(backdropRef.current, 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.4, ease: 'power2.out' }
      );
      gsap.fromTo(modalRef.current, 
        { opacity: 0, scale: 0.95, y: 30 }, 
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'expo.out', delay: 0.05 }
      );
    }
  }, { dependencies: [isOpen] });

  // Reset verify text when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setVerifyText('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isValid = verifyText.toUpperCase() === 'CANCEL';

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        ref={backdropRef}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100"
      >
        <div className="p-8">
          {/* Warning Icon */}
          <div className="mx-auto w-20 h-20 rounded-[24px] bg-red-50 flex items-center justify-center mb-6 ring-8 ring-red-50/50">
            <div className="w-12 h-12 rounded-[18px] bg-red-100 flex items-center justify-center">
              <ShieldAlert size={28} className="text-red-600" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Cancel {planName}?</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed px-4">
              You will lose access to all premium features immediately. This action cannot be reversed.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
              Type <span className="text-red-600">CANCEL</span> to confirm
            </label>
            <input
              type="text"
              value={verifyText}
              onChange={(e) => setVerifyText(e.target.value)}
              placeholder="Type CANCEL"
              className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold placeholder:text-slate-300 focus:border-red-400 focus:ring-4 focus:ring-red-50 outline-none transition-all text-center tracking-widest"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              className="h-14 rounded-2xl bg-slate-100 text-slate-600 font-bold text-[13px] hover:bg-slate-200 transition-all active:scale-[0.98]"
            >
              No, Keep {planName}
            </button>
            <button
              onClick={onConfirm}
              disabled={!isValid || loading}
              className="h-14 rounded-2xl bg-red-600 text-white font-black text-[13px] shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <span>Confirm Cancel</span>
              )}
            </button>
          </div>
        </div>

        {/* Top Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:bg-slate-50 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
