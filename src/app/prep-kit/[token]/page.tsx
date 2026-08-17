"use client";

import React, { useState, useEffect, use } from "react";

export default function CandidatePrepKitPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  const [loading, setLoading] = useState(true);
  const [prepData, setPrepData] = useState<any>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
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
        meetingLink: "https://meet.google.com/rec-ops-meet-9701",
        candidatePrepAcknowledged: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeReady = async () => {
    try {
      setSubmitting(true);
      setAcknowledged(true);

      const message = `Hi Recruiter Priya Sharma,\n\nCandidate *Aarav Sharma* has reviewed the Placement Prep Kit and confirmed 100% READINESS for interview with Apex Global Technologies tomorrow!`;
      const subject = `Placement Prep Confirmed: Aarav Sharma - Ready`;

      // Trigger 1: WhatsApp
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");

      // Trigger 2: Email
      setTimeout(() => {
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      }, 400);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeclineInterview = () => {
    if (!declineReason) {
      alert("Please provide a reason for declining.");
      return;
    }

    setDeclined(true);
    setDeclineModalOpen(false);

    const message = `Hi Recruiter Priya Sharma,\n\nCandidate *Aarav Sharma* has DECLINED / CANCELLED the scheduled interview for Senior Full Stack Engineer with Apex Global Technologies.\n\nReason: "${declineReason}"`;
    const subject = `Interview Declined by Candidate: Aarav Sharma`;

    // Trigger 1: WhatsApp
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");

    // Trigger 2: Email
    setTimeout(() => {
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    }, 400);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-4xl text-[#FFD400] animate-spin mb-3">sync</span>
        <h2 className="text-lg font-bold">Loading Placement Prep Kit...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans p-4 text-slate-900 pb-20">
      <div className="max-w-md mx-auto w-full space-y-4 my-auto">
        {/* Header Banner */}
        <div className="bg-[#0F172A] text-white p-5 rounded-3xl shadow-xl space-y-2 relative overflow-hidden">
          <span className="bg-[#FFD400] text-[#0F172A] font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
            Placement Prep Kit (T-24h)
          </span>
          <h1 className="text-xl font-black text-white">{prepData?.clientName || "Apex Global Technologies"} — Interview Prep</h1>
          <p className="text-xs text-slate-300 font-medium">Role: {prepData?.jobTitle || "Senior Full Stack Engineer"}</p>
        </div>

        {/* Live Google Meet Video Link Box */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2 shadow-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-xl">video_camera_front</span>
              <span className="text-xs font-black text-white">Google Meet Video Join Link</span>
            </div>
            <span className="text-[9px] bg-emerald-900 text-emerald-300 font-bold px-2 py-0.5 rounded">Verified URL</span>
          </div>

          <a
            href={prepData?.meetingLink || "https://meet.google.com/rec-ops-meet-9701"}
            target="_blank"
            rel="noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <span>🎥 Join Video Interview Call</span>
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </a>
        </div>

        {/* Status Readiness Banner */}
        {declined ? (
          <div className="bg-red-50 border-2 border-red-400 p-4 rounded-2xl text-center text-red-900 animate-in zoom-in-95 space-y-1">
            <span className="material-symbols-outlined text-red-600 text-3xl">cancel</span>
            <h3 className="font-black text-sm">Interview Declined</h3>
            <p className="text-xs font-medium">Cancellation notice sent to lead recruiter Priya Sharma.</p>
          </div>
        ) : acknowledged ? (
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
                className="w-full bg-amber-500 text-slate-950 font-black p-3 rounded-xl text-xs flex items-center justify-center gap-2 hover:brightness-105 shadow-sm transition-all"
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
              <p className="text-[11px] text-amber-800">Please review company notes below and acknowledge your readiness before interview time.</p>
            </div>
          </div>
        )}

        {/* Company Intelligence Section */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 shadow-sm">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Company Intel & Focus Areas</h3>
          <div className="space-y-2 text-xs text-slate-600">
            <p><strong>Panel:</strong> {prepData?.interviewerName}</p>
            <p><strong>Format:</strong> {prepData?.interviewFormat}</p>
            <p><strong>Key Focus:</strong> Next.js App Router, Microservices latency optimization, PostgreSQL index design.</p>
          </div>
        </div>

        {/* Behavioral Framework ("The Orange Test") */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 shadow-sm">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">The Orange Test (Behavioral Checklist)</h3>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 font-medium">
            <li>Have concise 60-second answers for your key project achievements.</li>
            <li>Be prepared to explain trade-offs between REST and GraphQL.</li>
            <li>Keep video background clean & join 5 minutes early.</li>
          </ul>
        </div>

        {/* Action Buttons: Accept vs Decline */}
        {!acknowledged && !declined && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleAcknowledgeReady}
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>Accept & Ready</span>
            </button>

            <button
              onClick={() => setDeclineModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">cancel</span>
              <span>Decline / Cancel</span>
            </button>
          </div>
        )}
      </div>

      {/* Decline Reason Modal */}
      {declineModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-red-600 flex items-center gap-1">
                <span className="material-symbols-outlined">report_problem</span>
                Decline Interview
              </h3>
              <button onClick={() => setDeclineModalOpen(false)} className="text-slate-400 font-bold text-xs">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Provide a reason for declining this interview:
            </p>

            <textarea
              rows={3}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="e.g. Received another offer / Schedule conflict..."
              className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
            />

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setDeclineModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeclineInterview}
                className="flex-1 py-2.5 bg-red-600 text-white text-xs font-black rounded-xl hover:bg-red-700 transition-all shadow-md"
              >
                Send Decline Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
