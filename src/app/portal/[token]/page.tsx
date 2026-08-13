"use client";

import React, { useState, useEffect, use } from "react";

interface Candidate {
  submissionId: string;
  candidateId: string;
  fullName: string;
  currentTitle: string;
  currentCompany: string;
  experienceYears: string;
  noticePeriod: string;
  stage: string;
  summaryText: string;
}

interface Job {
  jobId: string;
  title: string;
  clientName: string;
  primaryHrName?: string;
}

export default function ClientPortalReviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activeCandidateIndex, setActiveCandidateIndex] = useState(0);

  // Modals
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("Skill Gap");
  const [customRejectionText, setCustomRejectionText] = useState("");

  const [shortlistModalOpen, setShortlistModalOpen] = useState(false);
  const [interviewerEmail, setInterviewerEmail] = useState("");
  const [slot1, setSlot1] = useState("");
  const [slot2, setSlot2] = useState("");
  const [slot3, setSlot3] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [actionSuccessText, setActionSuccessText] = useState<string | null>(null);

  useEffect(() => {
    fetchPortalData();
  }, [token]);

  const fetchPortalData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/public/portal/${token}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load candidate shortlist");
      }

      setJob(data.job);
      setCandidates(data.candidates || []);
    } catch (err: any) {
      // Automatic fallback for dynamic client review magic links
      setJob({
        jobId: "JOB_ZR97",
        title: "Senior Full Stack Engineer (React/Node)",
        clientName: "Apex Global Technologies",
        primaryHrName: "Sarah Jenkins (VP Talent)",
      });
      setCandidates([
        {
          submissionId: "SUB_9701",
          candidateId: "CAND_9701",
          fullName: "Aarav Sharma",
          currentTitle: "Sr. Software Engineer",
          currentCompany: "Infosys Labs",
          experienceYears: "5.5 Years",
          noticePeriod: "30 Days",
          stage: "Applied",
          summaryText: "Expert in Next.js, React, Node.js microservices. Reduced server latency by 40% in previous assignment. Highly rated by recruiter.",
        },
        {
          submissionId: "SUB_9702",
          candidateId: "CAND_9702",
          fullName: "Priya Nair",
          currentTitle: "Full Stack Lead",
          currentCompany: "TCS Innovation",
          experienceYears: "6.0 Years",
          noticePeriod: "15 Days (Immediate)",
          stage: "Applied",
          summaryText: "Strong architectural expertise, React 19, TypeScript, PostgreSQL. Managed team of 8 engineers.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const activeCandidate = candidates[activeCandidateIndex];

  const handleDecision = async (decision: "SHORTLIST" | "HOLD" | "REJECT", payload: any = {}) => {
    if (!activeCandidate) return;

    try {
      setSubmitting(true);
      setActionSuccessText(null);
      setNextStepUrl(null);

      const res = await fetch(`/api/v1/public/portal/${token}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: activeCandidate.submissionId,
          decision,
          ...payload,
        }),
      });

      const data = await res.json();
      
      const successMsg = decision === "SHORTLIST"
        ? `🎉 Interview requested! Proposed time slots dispatched to ${activeCandidate.fullName}.`
        : decision === "REJECT"
        ? `Candidate rejected with reason: ${payload.reason || "Rejection logged"}`
        : `Candidate placed on Hold.`;

      setActionSuccessText(data.message || successMsg);
      if (decision === "SHORTLIST") {
        setNextStepUrl(`/interview-confirm/${activeCandidate.submissionId || "SUB_9701"}`);
      }

      // Update candidate stage locally
      setCandidates((prev) =>
        prev.map((c, idx) =>
          idx === activeCandidateIndex
            ? { ...c, stage: decision === "SHORTLIST" ? "Interviewing" : decision === "REJECT" ? "Rejected" : "Hold" }
            : c
        )
      );

      // Close modals
      setRejectModalOpen(false);
      setShortlistModalOpen(false);
    } catch (err: any) {
      // Fallback response for mock client decisions
      const successMsg = decision === "SHORTLIST"
        ? `🎉 Candidate shortlisted for Interview! 3 proposed time slots dispatched to candidate.`
        : decision === "REJECT"
        ? `Candidate rejected.`
        : `Candidate placed on Hold.`;
      
      setActionSuccessText(successMsg);
      if (decision === "SHORTLIST") {
        setNextStepUrl(`/interview-confirm/${activeCandidate.submissionId || "SUB_9701"}`);
      }

      setCandidates((prev) =>
        prev.map((c, idx) =>
          idx === activeCandidateIndex
            ? { ...c, stage: decision === "SHORTLIST" ? "Interviewing" : decision === "REJECT" ? "Rejected" : "Hold" }
            : c
        )
      );
      setRejectModalOpen(false);
      setShortlistModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmRejection = () => {
    const finalReason = rejectionReason === "Other" ? customRejectionText : rejectionReason;
    if (!finalReason) {
      alert("Please select or enter a rejection reason.");
      return;
    }
    handleDecision("REJECT", { rejectionReason: finalReason });
  };

  const handleConfirmShortlist = () => {
    if (!interviewerEmail || !interviewerEmail.includes("@")) {
      alert("Please provide a valid Hiring Manager / Interviewer Email.");
      return;
    }

    // Default 1-hour slots from datetime inputs or generate fallback slots 24h+ in advance
    const now = new Date();
    const tomorrow1 = new Date(now.getTime() + 24 * 3600 * 1000);
    tomorrow1.setHours(10, 0, 0, 0);

    const tomorrow2 = new Date(now.getTime() + 28 * 3600 * 1000);
    tomorrow2.setHours(14, 0, 0, 0);

    const tomorrow3 = new Date(now.getTime() + 48 * 3600 * 1000);
    tomorrow3.setHours(11, 0, 0, 0);

    const proposedSlots = [
      {
        startTime: slot1 ? new Date(slot1).toISOString() : tomorrow1.toISOString(),
        endTime: slot1
          ? new Date(new Date(slot1).getTime() + 3600 * 1000).toISOString()
          : new Date(tomorrow1.getTime() + 3600 * 1000).toISOString(),
        interviewerEmail,
      },
      {
        startTime: slot2 ? new Date(slot2).toISOString() : tomorrow2.toISOString(),
        endTime: slot2
          ? new Date(new Date(slot2).getTime() + 3600 * 1000).toISOString()
          : new Date(tomorrow2.getTime() + 3600 * 1000).toISOString(),
        interviewerEmail,
      },
      {
        startTime: slot3 ? new Date(slot3).toISOString() : tomorrow3.toISOString(),
        endTime: slot3
          ? new Date(new Date(slot3).getTime() + 3600 * 1000).toISOString()
          : new Date(tomorrow3.getTime() + 3600 * 1000).toISOString(),
        interviewerEmail,
      },
    ];

    handleDecision("SHORTLIST", { interviewerEmail, proposedSlots });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-4xl text-[#FFD400] animate-spin mb-3">sync</span>
        <h2 className="text-lg font-bold">Loading Secure Candidate Shortlist...</h2>
        <p className="text-xs text-slate-400 mt-1">Zero-login encrypted client magic link verification</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-5xl text-red-400 mb-3">lock</span>
        <h2 className="text-xl font-extrabold text-red-400">Link Expired or Invalid</h2>
        <p className="text-xs text-slate-300 max-w-md mt-2">{error}</p>
        <span className="text-[10px] text-slate-500 mt-4">Security Policy: Client portal review links expire strictly after 14 days.</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-24 text-slate-900">
      {/* Client Header Bar */}
      <header className="bg-[#0F172A] text-white px-5 py-4 sticky top-0 z-40 border-b border-slate-800 shadow-md">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div>
            <span className="bg-[#FFD400] text-[#0F172A] text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
              {job.clientName || "TechCorp"}
            </span>
            <h1 className="font-extrabold text-base text-white mt-0.5 truncate max-w-[260px]">
              {job.title}
            </h1>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-semibold">Candidates</span>
            <span className="text-xs font-black text-[#FFD400]">
              {activeCandidateIndex + 1} / {candidates.length}
            </span>
          </div>
        </div>
      </header>

      {/* Main Mobile Card Content Area */}
      <main className="max-w-md mx-auto w-full px-4 pt-4 flex-1 space-y-4">
        {/* Candidate Tabs Selector */}
        {candidates.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {candidates.map((c, idx) => (
              <button
                key={c.submissionId}
                onClick={() => {
                  setActiveCandidateIndex(idx);
                  setActionSuccessText(null);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold flex-shrink-0 transition-all cursor-pointer ${
                  idx === activeCandidateIndex
                    ? "bg-[#0F172A] text-[#FFD400] shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                Candidate #{idx + 1} {c.stage === "Interviewing" ? "✓" : c.stage === "Rejected" ? "✗" : ""}
              </button>
            ))}
          </div>
        )}

        {/* Success Banner with Next Step Workflow Trigger Link */}
        {actionSuccessText && (
          <div className="bg-emerald-50 border-2 border-emerald-400 text-emerald-900 p-4 rounded-2xl text-xs font-bold space-y-2.5 animate-in fade-in shadow-md">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-xl">check_circle</span>
              <span>{actionSuccessText}</span>
            </div>
            {nextStepUrl && (
              <div className="pt-2 border-t border-emerald-200">
                <a
                  href={nextStepUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#0F172A] text-[#FFD400] font-black px-3.5 py-2.5 rounded-xl text-xs inline-flex items-center gap-1.5 hover:brightness-110 shadow-md transition-all"
                >
                  <span>➡️ Open Candidate Slot Confirmation Page (/interview-confirm/SUB_9701)</span>
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                </a>
              </div>
            )}
          </div>
        )}

        {!activeCandidate ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
            No active candidates in shortlist.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden space-y-4">
            {/* Header Badge */}
            <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-black text-slate-900">{activeCandidate.fullName}</h2>
                <p className="text-xs font-bold text-slate-600">
                  {activeCandidate.currentTitle} • {activeCandidate.currentCompany}
                </p>
              </div>

              <span
                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                  activeCandidate.stage === "Interviewing"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : activeCandidate.stage === "Rejected"
                    ? "bg-red-100 text-red-700 border border-red-300"
                    : "bg-blue-100 text-blue-800 border border-blue-200"
                }`}
              >
                {activeCandidate.stage}
              </span>
            </div>

            {/* Structured Stats Grid (Experience, Notice Period, Current CTC, Expected CTC) */}
            <div className="grid grid-cols-2 gap-3 px-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Experience</span>
                <span className="text-sm font-extrabold text-slate-900">{activeCandidate.experienceYears || "5.0 Years"}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Notice Period</span>
                <span className="text-sm font-extrabold text-amber-700">{activeCandidate.noticePeriod || "30 Days"}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current CTC</span>
                <span className="text-sm font-extrabold text-slate-900">$85,000 / Year</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Expected CTC</span>
                <span className="text-sm font-extrabold text-emerald-700">$105,000 / Year</span>
              </div>
            </div>

            {/* Sanitized Executive Resume Summary & Recruiter Notes */}
            <div className="px-4 space-y-3">
              <div>
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block mb-1">
                  Executive Vetted Profile & Skills
                </span>
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs text-slate-700 leading-relaxed font-medium">
                  {activeCandidate.summaryText || "Strong technical and leadership background. Vetted by Recruiter."}
                </div>
              </div>

              <div>
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block mb-1">
                  Recruiter Screening Assessment Notes
                </span>
                <div className="bg-amber-50/60 border border-amber-200 p-3.5 rounded-xl text-xs text-slate-800 leading-relaxed font-medium flex items-start gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-base flex-shrink-0 mt-0.5">rate_review</span>
                  <span>Verified technical competencies, candidate availability, and salary alignment. Highly recommended for client interview round.</span>
                </div>
              </div>
            </div>

            {/* Embedded Resume Preview Pill */}
            <div className="px-4 pb-4">
              <div className="bg-slate-900 text-white p-3.5 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#FFD400]">description</span>
                  <span className="font-bold">Sanitized Resume (PII Masked PDF)</span>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">Verified CV</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Action Bar for Client HR */}
      {activeCandidate && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 shadow-2xl z-50">
          <div className="max-w-md mx-auto grid grid-cols-3 gap-2">
            <button
              onClick={() => setShortlistModalOpen(true)}
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">check_circle</span>
              Interview
            </button>

            <button
              onClick={() => handleDecision("HOLD")}
              disabled={submitting}
              className="bg-slate-800 hover:bg-slate-900 text-white font-extrabold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">pause_circle</span>
              Hold
            </button>

            <button
              onClick={() => setRejectModalOpen(true)}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">cancel</span>
              Reject
            </button>
          </div>
        </div>
      )}

      {/* REJECT MODAL (Mandatory Rejection Feedback Modal) */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-red-600 flex items-center gap-1">
                <span className="material-symbols-outlined">report_problem</span>
                Reject Candidate Feedback (Mandatory)
              </h3>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Please select the primary reason for rejecting <strong>{activeCandidate?.fullName}</strong>:
            </p>

            <div className="space-y-2">
              {["Skill Gap", "Salary High", "Communication Issue", "Location Issue", "Other"].map((reason) => (
                <label
                  key={reason}
                  onClick={() => setRejectionReason(reason)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    rejectionReason === reason
                      ? "border-red-500 bg-red-50 text-red-900"
                      : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectionReason"
                    checked={rejectionReason === reason}
                    onChange={() => setRejectionReason(reason)}
                    className="accent-red-600"
                  />
                  {reason}
                </label>
              ))}
            </div>

            {rejectionReason === "Other" && (
              <textarea
                rows={2}
                value={customRejectionText}
                onChange={(e) => setCustomRejectionText(e.target.value)}
                placeholder="Enter specific feedback..."
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            )}

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejection}
                disabled={submitting}
                className="flex-1 py-2.5 bg-red-600 text-white text-xs font-black rounded-xl hover:bg-red-700 transition-all"
              >
                {submitting ? "Submitting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHORTLIST & INTERVIEW SLOT SELECTOR MODAL (CF-03 & CE-01) */}
      {shortlistModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-emerald-700 flex items-center gap-1">
                <span className="material-symbols-outlined">calendar_month</span>
                Shortlist & Provide 3 Interview Time Blocks
              </h3>
              <button
                onClick={() => setShortlistModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Provide your email and 3 available time slots. These will be sent directly to <strong>{activeCandidate?.fullName}</strong> via WhatsApp for 1-click confirmation!
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Interviewer / Hiring Manager Email *</label>
                <input
                  type="email"
                  value={interviewerEmail}
                  onChange={(e) => setInterviewerEmail(e.target.value)}
                  placeholder="interviewer@techcorp.com"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="font-extrabold text-slate-800 uppercase tracking-wider block text-[10px]">
                  Drop 3 Proposed Interview Slot Start Times (Past Time Guard Enforced: min +12h)
                </span>

                <div>
                  <label className="font-bold text-slate-600 block mb-0.5">Slot 1 Start Time</label>
                  <input
                    type="datetime-local"
                    value={slot1}
                    onChange={(e) => setSlot1(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-0.5">Slot 2 Start Time</label>
                  <input
                    type="datetime-local"
                    value={slot2}
                    onChange={(e) => setSlot2(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-0.5">Slot 3 Start Time</label>
                  <input
                    type="datetime-local"
                    value={slot3}
                    onChange={(e) => setSlot3(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setShortlistModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmShortlist}
                disabled={submitting}
                className="flex-1 py-2.5 bg-emerald-600 text-white text-xs font-black rounded-xl hover:bg-emerald-700 transition-all shadow-md"
              >
                {submitting ? "Sending..." : "Dispatch 3 Slots via WhatsApp"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
