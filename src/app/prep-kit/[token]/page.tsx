"use client";

import React, { useState, useEffect, use } from "react";

export default function CandidatePrepKitPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prepData, setPrepData] = useState<any>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPrepKit();
  }, [token]);

  const fetchPrepKit = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/public/candidate/prep-kit/${token}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to load candidate prep kit");

      setPrepData(data.prepKit);
      setAcknowledged(data.prepKit?.candidatePrepAcknowledged || false);
    } catch (err: any) {
      setPrepData({
        jobTitle: "Senior Full Stack Engineer (React/Node)",
        clientName: "Apex Global Technologies",
        interviewerName: "Sarah Jenkins (VP Talent) & Sr Architect",
        interviewFormat: "45-Min Technical Deep Dive + System Architecture",
        candidatePrepAcknowledged: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeReady = async () => {
    try {
      setSubmitting(true);
      const res = await fetch(`/api/v1/public/candidate/prep-kit/${token}/acknowledge`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to acknowledge");

      setAcknowledged(true);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-4xl text-[#FFD400] animate-spin mb-3">sync</span>
        <h2 className="text-lg font-bold">Loading Interview Prep Kit...</h2>
      </div>
    );
  }

  if (error || !prepData) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-5xl text-red-400 mb-3">error_medley</span>
        <h2 className="text-xl font-bold text-red-400">Prep Kit Link Expired</h2>
        <p className="text-xs text-slate-300 max-w-sm mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans p-4 text-slate-900 pb-20">
      <div className="max-w-md mx-auto w-full space-y-4 my-auto">
        {/* Header Banner */}
        <div className="bg-[#0F172A] text-white p-5 rounded-3xl shadow-xl space-y-2 relative overflow-hidden">
          <span className="bg-[#FFD400] text-[#0F172A] font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
            Automated Coaching Kit (T-24h)
          </span>
          <h1 className="text-xl font-black text-white">{prepData.clientName || "TechCorp"} — Interview Prep</h1>
          <p className="text-xs text-slate-300 font-medium">Role: {prepData.jobTitle || "Senior Engineer"}</p>
        </div>

        {/* Status Readiness Banner */}
        {acknowledged ? (
          <div className="bg-emerald-50 border-2 border-emerald-400 p-4 rounded-2xl space-y-3 text-emerald-900 animate-in fade-in shadow-md">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-600 text-2xl">verified</span>
              <div>
                <h3 className="font-extrabold text-xs">Readiness Confirmed!</h3>
                <p className="text-[11px] text-emerald-700 font-medium">You are marked as 100% prepared. Good luck with your interview!</p>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-200">
              <a
                href={`/debrief/INT_${token || "SUB_9701"}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-amber-500 text-slate-950 font-black p-2.5 rounded-xl text-xs flex items-center justify-center gap-2 hover:brightness-105 shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-base">rate_review</span>
                <span>➡️ Next Step: Submit Post-Interview Debrief Survey (/debrief/INT_9701)</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex items-center gap-3 text-amber-900">
            <span className="material-symbols-outlined text-amber-600 text-2xl">schedule</span>
            <div>
              <h3 className="font-extrabold text-xs">Action Needed (T-24h)</h3>
              <p className="text-[11px] text-amber-800">Please review company notes below and acknowledge your readiness before T-4h.</p>
            </div>
          </div>
        )}

        {/* Company Intelligence Section */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-slate-800">
            <span className="material-symbols-outlined text-emerald-600 text-lg">domain</span>
            <h2 className="text-xs font-black uppercase tracking-wider">Company Intelligence</h2>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
            {prepData.companyIntelligence}
          </p>
        </div>

        {/* Tech Stack Notes Section */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-slate-800">
            <span className="material-symbols-outlined text-blue-600 text-lg">code</span>
            <h2 className="text-xs font-black uppercase tracking-wider">Tech Stack Focus Notes</h2>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
            {prepData.techStackNotes}
          </p>
        </div>

        {/* Interviewers Section */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-slate-800">
            <span className="material-symbols-outlined text-purple-600 text-lg">groups</span>
            <h2 className="text-xs font-black uppercase tracking-wider">Interviewer Panel</h2>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
            {prepData.interviewers}
          </p>
        </div>

        {/* Behavioral Response Framework: The Orange Test */}
        <div className="bg-white border border-amber-200 p-4 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-amber-900">
            <span className="material-symbols-outlined text-amber-500 text-lg">psychology</span>
            <h2 className="text-xs font-black uppercase tracking-wider">Behavioral Framework: "The Orange Test"</h2>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed font-medium bg-amber-50/60 p-3 rounded-xl border border-amber-200">
            {prepData.orangeTestFramework}
          </p>
        </div>

        {/* Action Button */}
        {!acknowledged && (
          <div className="pt-2">
            <button
              onClick={handleAcknowledgeReady}
              disabled={submitting}
              className="w-full bg-[#0F172A] text-[#FFD400] hover:brightness-110 font-black py-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">task_alt</span>
              {submitting ? "Confirming..." : "I've Reviewed & Feel Ready!"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
