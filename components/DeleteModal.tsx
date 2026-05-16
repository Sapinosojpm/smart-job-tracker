'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

interface DeleteModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function DeleteModal({ title, isOpen, onClose, onConfirm, loading }: DeleteModalProps) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        ref={backdropRef}
        className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-8 text-center">
          {/* Warning Icon */}
          <div className="mx-auto w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6 ring-8 ring-red-50/50">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 size={28} className="text-red-600" />
            </div>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-2">Are you sure?</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-8 px-4">
            You are about to remove <span className="text-slate-900 font-bold">"{title}"</span> from your job board. This action cannot be undone.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3.5 rounded-2xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-all active:scale-95"
            >
              No, keep it
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-6 py-3.5 rounded-2xl bg-red-600 text-white font-bold text-sm shadow-lg shadow-red-600/25 hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Trash2 size={16} />
                  <span>Yes, delete</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Top Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
