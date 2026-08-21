"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginView() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup"); // Default to signup per requirement
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  // Sign Up Form States
  const [signupForm, setSignupForm] = useState({
    agencyName: "",
    tenantId: "",
    ownerName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  // Login Form States
  const [loginForm, setLoginForm] = useState({
    identifier: "",
    password: "",
  });

  // 3-Second Full Screen Splash Screen Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Helper to ensure valid UUID for API
  const getValidTenantId = (rawId: string) => {
    const defaultUuid = "11111111-1111-4111-8111-111111111111";
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(rawId.trim()) ? rawId.trim() : defaultUuid;
  };

  const performAuth = async (targetTenantId: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agencyId: getValidTenantId(targetTenantId) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed. Please check details.");
      }

      // Redirect to Cockpit Dashboard
      router.push("/cockpit");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupForm.agencyName || !signupForm.email || !signupForm.password) {
      setError("Please fill in all mandatory fields.");
      return;
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      setError("Password and Confirm Password do not match.");
      return;
    }
    await performAuth(signupForm.tenantId);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.identifier || !loginForm.password) {
      setError("Please enter your Email/Agency Tenant ID and Password.");
      return;
    }
    await performAuth(loginForm.identifier);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotEmail) {
      setForgotSent(true);
      setTimeout(() => {
        setForgotModalOpen(false);
        setForgotSent(false);
        setForgotEmail("");
      }, 2000);
    }
  };

  // 1. SPLASH SCREEN VIEW (3 SECONDS DURATION)
  if (showSplash) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0F172A] text-white p-6 transition-all duration-500">
        {/* Glowing Logo & Branding */}
        <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-700">
          <div className="h-20 w-20 rounded-2xl bg-[#FFD400] flex items-center justify-center shadow-[0_0_50px_rgba(255,212,0,0.3)] animate-pulse">
            <span className="material-symbols-outlined text-[48px] text-[#0F172A] font-black">
              work
            </span>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-5xl font-black tracking-tight text-white flex items-center justify-center gap-3">
              Recruit<span className="text-[#FFD400]">OS</span>
            </h1>
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
              Enterprise Multi-Tenant Recruitment HRMS
            </p>
          </div>
        </div>

        {/* Loading Progress Animation */}
        <div className="mt-12 w-64 space-y-3 text-center">
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-[#FFD400] rounded-full animate-[progress_3s_ease-in-out]"></div>
          </div>
          <p className="text-xs font-mono text-slate-400 animate-pulse">
            Initializing Agency Workspace...
          </p>
        </div>

        <style jsx>{`
          @keyframes progress {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  // 2. MAIN AUTH SCREEN VIEW (SIGNUP & LOGIN WITH SPLIT DIAGONAL CONTAINER)
  return (
    <div className="min-h-screen w-full bg-[#090D16] flex items-center justify-center p-4 sm:p-8 font-sans">
      {/* Main Split Card Container */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[620px] border border-slate-800/20 relative">
        
        {/* LEFT DIAGONAL BRAND BANNER (Stitch Theme: Dark Slate #0F172A & Yellow #FFD400) */}
        <div className="w-full md:w-5/12 bg-[#0F172A] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden text-white">
          {/* Background Decorative Diagonal Shape */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#FFD400]/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#FFD400]"></div>

          {/* Top Brand Header */}
          <div className="z-10 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-[#FFD400] text-[#0F172A] flex items-center justify-center font-black shadow-md">
                <span className="material-symbols-outlined text-[22px]">work</span>
              </div>
              <span className="text-2xl font-black tracking-tight">RecruitOS</span>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              V3 Enterprise SaaS
            </p>
          </div>

          {/* Center Welcome Text */}
          <div className="z-10 my-8 space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              {authMode === "signup" ? (
                <>
                  Welcome! <br />
                  <span className="text-[#FFD400]">Create your account.</span>
                </>
              ) : (
                <>
                  Welcome Back! <br />
                  <span className="text-[#FFD400]">Sign in to Cockpit.</span>
                </>
              )}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {authMode === "signup"
                ? "Join hundreds of recruitment agencies using RecruitOS for SLA tracking, CV parsing & placement management."
                : "Enter your agency credentials to resume candidate sourcing, interview scheduling & notice radar management."}
            </p>

            {/* Mode Switch Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setAuthMode(authMode === "signup" ? "login" : "signup");
                }}
                className="inline-flex items-center gap-2 border-2 border-[#FFD400] text-[#FFD400] hover:bg-[#FFD400] hover:text-[#0F172A] font-extrabold text-xs px-6 py-2.5 rounded-full transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <span>{authMode === "signup" ? "Sign In Instead" : "Sign Up For Free"}</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Bottom Security Badge */}
          <div className="z-10 flex items-center gap-2 text-[10px] text-slate-400 border-t border-slate-800 pt-4">
            <span className="material-symbols-outlined text-[16px] text-emerald-400">verified_user</span>
            <span>Multi-Tenant JWT & Row-Level PostgreSQL Security</span>
          </div>
        </div>

        {/* RIGHT FORM SECTION */}
        <div className="w-full md:w-7/12 bg-white p-8 md:p-10 flex flex-col justify-between">
          <div>
            {/* Header Title */}
            <div className="mb-6">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {authMode === "signup" ? "Agency Registration" : "Account Login"}
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {authMode === "signup"
                  ? "Please fill in your agency details to provision your tenant."
                  : "Enter your Agency Tenant ID / Email and password to login."}
              </p>
            </div>

            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-xl flex items-center gap-2 animate-in fade-in">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* FORM 1: SIGN UP FORM */}
            {authMode === "signup" && (
              <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Agency Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block">
                      Agency Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Talent Partners"
                      value={signupForm.agencyName}
                      onChange={(e) => setSignupForm({ ...signupForm, agencyName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:bg-white transition-all"
                    />
                  </div>

                  {/* Agency Tenant ID - Optional */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block">
                      Agency Tenant ID <span className="text-slate-400 font-medium text-[10px]">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={signupForm.tenantId}
                      onChange={(e) => setSignupForm({ ...signupForm, tenantId: e.target.value })}
                      placeholder=""
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Agency Owner Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block">
                      Agency Owner Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Divyanshu Kashyap"
                      value={signupForm.ownerName}
                      onChange={(e) => setSignupForm({ ...signupForm, ownerName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:bg-white transition-all"
                    />
                  </div>

                  {/* Mobile No */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block">
                      Mobile No. <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 XXXXXXXXXX"
                      value={signupForm.mobile}
                      onChange={(e) => setSignupForm({ ...signupForm, mobile: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block">
                    Work Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="owner@agency.com"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Password */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:bg-white transition-all"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Sign Up Submit Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#FFD400] text-[#0F172A] hover:brightness-105 font-black text-sm rounded-xl shadow-md active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Creating Agency Workspace...</span>
                    ) : (
                      <>
                        <span>Sign Up</span>
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* FORM 2: LOGIN FORM */}
            {authMode === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-5 pt-4">
                {/* Username / Email / Tenant ID */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block">
                    Email or Agency Tenant ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. owner@agency.com or Tenant ID"
                    value={loginForm.identifier}
                    onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:bg-white transition-all"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotModalOpen(true)}
                      className="text-[11px] font-bold text-slate-500 hover:text-[#0F172A] transition-all cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:bg-white transition-all"
                  />
                </div>

                {/* Sign In Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[#FFD400] text-[#0F172A] hover:brightness-105 font-black text-sm rounded-xl shadow-md active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Verifying Credentials...</span>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <span className="material-symbols-outlined text-[18px]">login</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-sm text-slate-900">Reset Password</h4>
              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {forgotSent ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-4 rounded-xl text-center space-y-1">
                <span className="material-symbols-outlined text-[24px] text-emerald-600">mark_email_read</span>
                <p>Password reset link sent to {forgotEmail}!</p>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-slate-600 font-medium">
                  Enter your registered work email address below to receive an instant password reset link.
                </p>
                <input
                  type="email"
                  required
                  placeholder="name@agency.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#FFD400] text-[#0F172A] font-black text-xs rounded-xl shadow-sm hover:brightness-105 active:scale-95 transition-all"
                >
                  Send Recovery Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
