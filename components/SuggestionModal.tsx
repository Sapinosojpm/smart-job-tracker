"use client";

import React, { useState } from "react";
import {
  X,
  Lightbulb,
  Loader2,
  CheckCircle2,
  MessageSquarePlus,
} from "lucide-react";
import { toast } from "react-toastify";

export default function SuggestionModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [category, setCategory] = useState("Feature Request");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<
    "Nice to Have" | "Important" | "Critical"
  >("Important");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in the title and description.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, title, content, priority }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Submission failed");

      setSuccess(true);
      toast.success("Thank you! Your suggestion has been recorded.");
      setTimeout(() => {
        setSuccess(false);
        setTitle("");
        setContent("");
        setCategory("Feature Request");
        setPriority("Important");
        onClose();
      }, 2500);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit suggestion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease]">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-[500px] bg-white rounded-3xl p-8 md:p-10 shadow-2xl border border-slate-100 animate-fade-up">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <CheckCircle2 size={36} className="stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Suggestion Submitted!
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Your feedback is extremely valuable. We will review your
              suggestion to improve the application.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Title & Icon */}
            <div className="flex items-center gap-3.5 mb-2">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                <Lightbulb size={24} className="stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Suggest Improvements
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  Help us make JobScoutAI even better.
                </p>
              </div>
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 tracking-wider uppercase mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full py-3 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
              >
                {[
                  "Feature Request",
                  "UI/UX Design",
                  "Bug Report",
                  "Platform Integration",
                  "Other",
                ].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Suggestion Title */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 tracking-wider uppercase mb-2">
                Title / Core Idea
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Add dark mode to the dashboard"
                className="w-full py-3 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* Suggestion Description */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 tracking-wider uppercase mb-2">
                Details & Description
              </label>
              <textarea
                required
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe your idea in detail. What problem does it solve and how should it behave?"
                className="w-full py-3 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
              />
            </div>

            {/* Importance / Priority Selectors */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 tracking-wider uppercase mb-2.5">
                Priority Level
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(["Nice to Have", "Important", "Critical"] as const).map(
                  (p) => {
                    const isActive = priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          isActive
                            ? p === "Critical"
                              ? "bg-rose-50 border-rose-200 text-rose-700 shadow-sm shadow-rose-100"
                              : p === "Important"
                                ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm shadow-blue-100"
                                : "bg-slate-100 border-slate-300 text-slate-800"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <MessageSquarePlus size={16} />
                  <span>Submit Suggestion</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
