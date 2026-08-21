"use client";

import React, { useState, use } from "react";

export default function CandidateNoticePulsePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  const [touchpointDay, setTouchpointDay] = useState(15);
  const [counterOfferStatus, setCounterOfferStatus] = useState<"None" | "Considering" | "Declined">("None");
  const [handoverStatus, setHandoverStatus] = useState<"On Track" | "Minor Delay" | "Experiencing Issues">("On Track");
  const [candidateComments, setCandidateComments] = useState("");
  const [resignationProofFile, setResignationProofFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const candidateName = "Aarav Sharma";
  const jobTitle = "Senior Full Stack Engineer";
  const clientName = "Apex Global Technologies";

  const handleSubmitPulse = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const responseStatus =
        counterOfferStatus === "Considering" || handoverStatus === "Experiencing Issues"
          ? "High_Risk_Counter_Offer"
          : "Responded_Safe";

      const res = await fetch("/api/v1/public/candidate/notice-pulse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pulseToken: token,
          submissionId: token,
          touchpointDay,
          responseStatus,
          candidateComments: candidateComments || `Handover: ${handoverStatus}, Counter-Offer: ${counterOfferStatus}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit notice period update");

      setSubmitted(true);

      // WhatsApp notification to Recruiter
      const riskAlert = responseStatus === "High_Risk_Counter_Offer" ? "⚠️ HIGH RISK ALERT: Candidate reported retention pressure / counter offer!" : "✅ Status Safe & On Track.";
      const msg = `Hi Recruiter Priya Sharma,\n\nCandidate *${candidateName}* completed Notice Period Pulse Check (Day ${touchpointDay}):\n\n• Counter-Offer: *${counterOfferStatus}*\n• Handover: *${handoverStatus}*\n${riskAlert}`;
      window.open(`https://wa.me/917982416306?text=${encodeURIComponent(msg)}`, "_blank");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl font-black shadow-xl">
          ✓
        </div>
        <h2 className="text-xl font-black text-white">Notice Period Update Submitted!</h2>
        <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
          Thank you, {candidateName}! Your resignation & handover status has been updated. Recruiter Priya Sharma has been notified.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans p-4 text-slate-900">
      <div className="max-w-md mx-auto w-full space-y-4 my-auto">
        {/* Header Card */}
        <div className="bg-[#0F172A] text-white p-6 rounded-3xl shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="bg-[#FFD400] text-[#0F172A] font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
              Feature CE-04 · Retention Pulse
            </span>
            <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg">
              Day {touchpointDay} of 60
            </span>
          </div>
          <h1 className="text-xl font-black text-white">Bi-Weekly Notice Period Pulse</h1>
          <p className="text-xs text-slate-300 font-medium">
            Candidate: <strong className="text-white">{candidateName}</strong> · Joining: <strong className="text-[#FFD400]">{clientName}</strong>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-2xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Question 1: Counter Offer */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-3 shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Question 1</span>
            <h3 className="text-xs font-extrabold text-slate-900">
              Has your current employer offered a buyout or counter-offer to keep you?
            </h3>
          </div>

          <div className="space-y-2">
            {[
              { id: "None", label: "No Counter-Offer", desc: "No retention attempt made by current company" },
              { id: "Considering", label: "Counter-Offer Made - Need Advice", desc: "Current company offered hike / promotion. Need recruiter guidance." },
              { id: "Declined", label: "Declined Counter-Offer", desc: "Received counter-offer but declined it." },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setCounterOfferStatus(opt.id as any)}
                className={`w-full p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                  counterOfferStatus === opt.id
                    ? "border-[#0F172A] bg-slate-900 text-white shadow-md"
                    : "border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300"
                }`}
              >
                <div>
                  <p className="text-xs font-black">{opt.label}</p>
                  <p className={`text-[10px] mt-0.5 ${counterOfferStatus === opt.id ? "text-slate-300" : "text-slate-500"}`}>
                    {opt.desc}
                  </p>
                </div>
                {counterOfferStatus === opt.id && <span className="text-emerald-400 font-bold text-sm">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Question 2: Handover Status */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-3 shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Question 2</span>
            <h3 className="text-xs font-extrabold text-slate-900">
              How is your resignation handover progressing?
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "On Track", label: "On Track", icon: "✅" },
              { id: "Minor Delay", label: "Minor Delay", icon: "⚠️" },
              { id: "Experiencing Issues", label: "Issues", icon: "🚨" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setHandoverStatus(opt.id as any)}
                className={`p-3 rounded-2xl text-center border transition-all cursor-pointer ${
                  handoverStatus === opt.id
                    ? "border-[#0F172A] bg-slate-900 text-white shadow-md"
                    : "border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300"
                }`}
              >
                <span className="text-lg block">{opt.icon}</span>
                <span className="text-[11px] font-bold mt-1 block">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Resignation Letter Upload Dropzone */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-3 shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Proof Milestone</span>
            <h3 className="text-xs font-extrabold text-slate-900">
              Upload Resignation Acceptance Letter (PDF/Image)
            </h3>
          </div>

          <label className="border-2 border-dashed border-slate-200 hover:border-[#0F172A] rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50 transition-all">
            <span className="material-symbols-outlined text-2xl text-slate-400 mb-1">cloud_upload</span>
            <span className="text-xs font-bold text-slate-700">
              {resignationProofFile ? resignationProofFile.name : "Tap to upload Resignation Acceptance Copy"}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">Supports PDF, PNG, JPG (Max 10MB)</span>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && setResignationProofFile(e.target.files[0])}
            />
          </label>
        </div>

        {/* Comments input */}
        <div className="bg-white border border-slate-200 p-4 rounded-3xl space-y-2 shadow-sm">
          <label className="text-[11px] font-extrabold text-slate-700 block">Additional Notes / Comments</label>
          <input
            type="text"
            value={candidateComments}
            onChange={(e) => setCandidateComments(e.target.value)}
            placeholder="e.g. Official LWD confirmed for 15th Sept..."
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
          />
        </div>

        {/* Action button */}
        <button
          type="button"
          onClick={handleSubmitPulse}
          disabled={submitting}
          className="w-full py-4 bg-[#FFD400] text-[#0F172A] hover:brightness-105 font-black text-sm rounded-2xl shadow-xl active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <span>Updating Pulse Status...</span>
          ) : (
            <>
              <span>Submit Bi-Weekly Update</span>
              <span className="material-symbols-outlined text-base">send</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
