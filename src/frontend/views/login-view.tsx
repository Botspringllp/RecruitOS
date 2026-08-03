"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginView() {
  const [agencyId, setAgencyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Seed agency IDs for testing ease in dev
  const demoAgencies = [
    { name: "Apex Recruitment Partners", id: "11111111-1111-1111-1111-111111111111" },
    { name: "TechCorp Sourcing", id: "22222222-2222-2222-2222-222222222222" },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agencyId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed. Please check the Agency ID.");
      }

      // Redirect to cockpit on success
      router.push("/cockpit");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const useDemoAgency = (id: string) => {
    setAgencyId(id);
    setError("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-on-background px-6">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-md">
        {/* Header Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary-container">
            <span className="material-symbols-outlined text-[28px] text-on-background font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
              work
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">RecruitOS</h1>
          <p className="mt-1 text-sm text-on-primary-container opacity-70">
            Multi-Tenant Recruitment SaaS Platform
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="agency-id"
              className="block text-xs font-bold uppercase tracking-wider text-on-primary-container"
            >
              Agency Tenant ID
            </label>
            <div className="relative">
              <input
                id="agency-id"
                type="text"
                required
                value={agencyId}
                onChange={(e) => setAgencyId(e.target.value)}
                placeholder="00000000-0000-0000-0000-000000000000"
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-secondary-container focus:ring-2 focus:ring-secondary-container/20"
              />
            </div>
            {error && <p className="text-xs font-medium text-error">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-secondary-container py-3 font-semibold text-on-background transition-all hover:brightness-95 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Verifying Agency..." : "Enter Workspace"}
          </button>
        </form>

        {/* Demo Quick Access */}
        <div className="mt-8 border-t border-slate-800 pt-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Development Quick Access
          </p>
          <div className="space-y-2">
            {demoAgencies.map((agency) => (
              <button
                key={agency.id}
                type="button"
                onClick={() => useDemoAgency(agency.id)}
                className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-800/20 px-4 py-2.5 text-left text-xs transition-all hover:bg-slate-800/50 hover:border-slate-700"
              >
                <div>
                  <p className="font-semibold text-white">{agency.name}</p>
                  <p className="font-mono text-[10px] text-slate-400 mt-0.5">{agency.id}</p>
                </div>
                <span className="material-symbols-outlined text-[16px] text-secondary-container">
                  login
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
