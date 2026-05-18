"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Lock,
  Loader2,
  ChevronRight,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Verify that the user has a valid active recovery session
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error(
          "Session expired or invalid. Please request a new password reset link.",
        );
        setTimeout(() => {
          router.push("/");
        }, 3000);
      }
    };
    checkSession();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccess(true);
      toast.success("Password updated successfully!");
      setTimeout(() => {
        router.push("/jobs");
      }, 2500);
    } catch (err: any) {
      toast.error(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white p-6">
      {/* Background blobs and Mesh Grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-[radial-gradient(ellipse,_rgba(26,86,219,0.06)_0%,_transparent_70%)]" />
        <div className="absolute bottom-[5%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,_rgba(6,182,212,0.05)_0%,_transparent_70%)]" />
        <div className="absolute bottom-[5%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,_rgba(26,86,219,0.05)_0%,_transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(26,86,219,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(26,86,219,0.12)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_40%,#000_40%,transparent_90%)] [-webkit-mask-image:radial-gradient(ellipse_80%_60%_at_50%_40%,#000_40%,transparent_90%)]" />
      </div>

      <div className="relative w-full max-w-[440px] bg-white rounded-[32px] p-10 md:p-12 shadow-2xl border border-slate-100/80 z-10 animate-fade-up">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 mx-auto mb-4 shrink-0 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="JobScoutAI"
              className="w-full h-full object-contain"
            />
          </div>
          <h3 className="font-display text-2xl font-extrabold text-ink mb-2">
            {success ? "Success!" : "Create New Password"}
          </h3>
          <p className="text-sm text-ink-3 font-medium">
            {success
              ? "Your password has been changed. Redirecting to dashboard..."
              : "Choose a strong password containing at least 6 characters."}
          </p>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-6 text-emerald-500 animate-pulse">
            <CheckCircle2 size={64} className="stroke-[1.5]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {[
              {
                label: "New Password",
                id: "password",
                value: password,
                set: setPassword,
                placeholder: "••••••••",
              },
              {
                label: "Confirm Password",
                id: "confirm",
                value: confirmPassword,
                set: setConfirmPassword,
                placeholder: "••••••••",
              },
            ].map((f) => (
              <div key={f.id}>
                <label className="block text-[11px] font-extrabold text-ink-3 tracking-widest uppercase mb-2">
                  {f.label}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-4">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full py-3 pl-11 pr-12 rounded-xl border-2 border-border bg-surface text-sm font-semibold outline-none focus:border-brand transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-4 hover:text-brand transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="shimmer-btn w-full py-3.5 rounded-xl text-[15px] font-bold text-white flex items-center justify-center gap-2.5 disabled:opacity-70 mt-2 hover:scale-[1.02] active:scale-95 transition-transform cursor-pointer"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <span className="mt-0.5">Update Password</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </main>
  );
}
