"use client";

import { useState } from "react";
import { X, Send, Loader2, MessageSquarePlus, Sparkles } from "lucide-react";
import { toast } from "react-toastify";

interface TestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TestimonialModal({
  isOpen,
  onClose,
  onSuccess,
}: TestimonialModalProps) {
  const [formData, setFormData] = useState({ name: "", role: "", content: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.content) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Thank you for your feedback!");
        setFormData({ name: "", role: "", content: "" });
        onSuccess();
        onClose();
      }
    } catch (e) {
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] flex flex-col animate-in zoom-in-95 duration-500 overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-4 text-center border-b border-slate-50 relative">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="inline-flex w-12 h-12 rounded-2xl bg-blue-600 items-center justify-center mb-6 shadow-lg shadow-blue-600/20">
            <MessageSquarePlus className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            Share your story
          </h2>
          <p className="text-slate-500 text-[13px] font-medium leading-relaxed">
            How has JobScoutAI changed your search?
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Your Name
              </label>
              <input
                type="text"
                placeholder="Juan Dela Cruz"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-sm text-slate-900"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Your Role
              </label>
              <input
                type="text"
                placeholder="Developer"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-sm text-slate-900"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Testimonial Content
            </label>
            <textarea
              placeholder="Tell us about your experience..."
              rows={4}
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all font-medium text-sm text-slate-900 resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Sparkles size={18} /> Post Story
              </>
            )}
          </button>
        </form>

        <div className="p-5 bg-slate-50 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Publicly visible on landing page
          </p>
        </div>
      </div>
    </div>
  );
}
