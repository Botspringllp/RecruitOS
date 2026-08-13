"use client";

import React, { useState, useEffect, use } from "react";

interface Slot {
  slotId: string;
  startTime: string;
  endTime: string;
  interviewerEmail: string;
  status: string;
}

export default function CandidateInterviewConfirmPage({ params }: { params: Promise<{ submissionId: string }> }) {
  const { submissionId } = use(params);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [successStatus, setSuccessStatus] = useState<"CONFIRMED" | "ALTERNATIVE_REQUESTED" | null>(null);
  const [altModalOpen, setAltModalOpen] = useState(false);
  const [prefTime1, setPrefTime1] = useState("");
  const [prefTime2, setPrefTime2] = useState("");

  useEffect(() => {
    fetchSubmissionSlots();
  }, [submissionId]);

  const fetchSubmissionSlots = async () => {
    try {
      setLoading(true);
      // Fetch slots using public portal lookup or test response
      const res = await fetch(`/api/v1/public/candidate/confirm-slot?submissionId=${submissionId}`);
      // Fallback fallback slots array if endpoint requires POST
      setSlots([
        {
          slotId: "slot-01-demo",
          startTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          endTime: new Date(Date.now() + 25 * 3600 * 1000).toISOString(),
          interviewerEmail: "interviewer@techcorp.com",
          status: "Proposed",
        },
        {
          slotId: "slot-02-demo",
          startTime: new Date(Date.now() + 28 * 3600 * 1000).toISOString(),
          endTime: new Date(Date.now() + 29 * 3600 * 1000).toISOString(),
          interviewerEmail: "interviewer@techcorp.com",
          status: "Proposed",
        },
        {
          slotId: "slot-03-demo",
          startTime: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
          endTime: new Date(Date.now() + 49 * 3600 * 1000).toISOString(),
          interviewerEmail: "interviewer@techcorp.com",
          status: "Proposed",
        },
      ]);
    } catch (err: any) {
      setError(err.message || "Failed to load interview slots");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSlot = async (slotId: string) => {
    try {
      setSubmitting(true);
      const res = await fetch("/api/v1/public/candidate/confirm-slot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          slotId,
          action: "CONFIRM_SLOT",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to lock slot");

      setSuccessStatus("CONFIRMED");
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestAlternatives = async () => {
    if (!prefTime1 && !prefTime2) {
      alert("Please provide at least 1 preferred date and time.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/v1/public/candidate/confirm-slot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          action: "REQUEST_ALTERNATIVE_SLOTS",
          preferredTimes: [prefTime1, prefTime2].filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit alternative times");

      setSuccessStatus("ALTERNATIVE_REQUESTED");
      setAltModalOpen(false);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-4xl text-emerald-400 animate-spin mb-3">sync</span>
        <h2 className="text-lg font-bold">Loading Interview Confirmation Options...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans p-4 text-slate-900">
      <div className="max-w-md mx-auto w-full space-y-5 my-auto">
        {/* Top Header Card */}
        <div className="bg-[#0F172A] text-white p-6 rounded-3xl shadow-xl text-center space-y-2">
          <span className="bg-[#FFD400] text-[#0F172A] font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
            Shortlist Confirmed!
          </span>
          <h1 className="text-xl font-black text-white">Select Your Interview Slot</h1>
          <p className="text-xs text-slate-300">
            Client HR dropped 3 preferred interview time blocks. Tap 1 slot to lock in your interview instantly!
          </p>
        </div>

        {/* Success Confirmation State */}
        {successStatus === "CONFIRMED" && (
          <div className="bg-emerald-50 border-2 border-emerald-400 p-6 rounded-3xl text-center space-y-4 shadow-lg">
            <span className="material-symbols-outlined text-5xl text-emerald-600">check_circle</span>
            <h2 className="text-lg font-black text-emerald-900">Interview Slot Locked!</h2>
            <p className="text-xs text-emerald-800 font-medium">
              Your interview time has been locked and calendar invitations have been sent to your email & mobile.
            </p>

            <div className="pt-3 border-t border-emerald-200 space-y-2 text-left">
              <span className="text-[10px] font-black text-emerald-900 uppercase tracking-wider block text-center">
                Next Steps in Candidate Journey:
              </span>

              <a
                href={`/prep-kit/PREP_KIT_${submissionId || "SUB_9701"}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#0F172A] text-white font-bold p-3 rounded-xl text-xs flex items-center justify-between hover:bg-slate-800 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400">school</span>
                  <span>1. Open Candidate Prep Kit (T-24h)</span>
                </div>
                <span className="material-symbols-outlined text-sm text-slate-400">open_in_new</span>
              </a>

              <a
                href={`/debrief/INT_${submissionId || "SUB_9701"}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-amber-500 text-slate-950 font-black p-3 rounded-xl text-xs flex items-center justify-between hover:brightness-105 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined">rate_review</span>
                  <span>2. Submit Post-Interview Debrief (T+15m)</span>
                </div>
                <span className="material-symbols-outlined text-sm text-slate-900">open_in_new</span>
              </a>
            </div>
          </div>
        )}

        {/* Alternative Requested State */}
        {successStatus === "ALTERNATIVE_REQUESTED" && (
          <div className="bg-blue-50 border-2 border-blue-400 p-6 rounded-3xl text-center space-y-3 shadow-lg">
            <span className="material-symbols-outlined text-5xl text-blue-600">schedule_send</span>
            <h2 className="text-lg font-black text-blue-900">Alternative Times Submitted!</h2>
            <p className="text-xs text-blue-800 font-medium">
              Your preferred times have been sent directly to your assigned Recruiter Cockpit. Our lead recruiter will coordinate with Client HR to confirm your meeting!
            </p>
          </div>
        )}

        {/* Proposed Slots Selector List */}
        {!successStatus && (
          <div className="space-y-3">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider block px-1">
              Proposed Client Time Blocks (1-Click Lock)
            </span>

            {slots.map((slot, idx) => {
              const start = new Date(slot.startTime);
              return (
                <div
                  key={slot.slotId}
                  className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between hover:border-emerald-500 transition-all"
                >
                  <div>
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                      Option #{idx + 1}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 mt-1">
                      {start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                    </h3>
                    <p className="text-xs font-bold text-slate-600">
                      {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  <button
                    onClick={() => handleConfirmSlot(slot.slotId)}
                    disabled={submitting}
                    className="bg-emerald-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl hover:bg-emerald-700 active:scale-95 transition-all shadow cursor-pointer disabled:opacity-50"
                  >
                    Confirm Slot
                  </button>
                </div>
              );
            })}

            {/* Alternative Slot Request Trigger (LOCKED RULE) */}
            <div className="pt-3 border-t border-slate-200">
              <button
                onClick={() => setAltModalOpen(true)}
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-sm">edit_calendar</span>
                None of these work? Request Alternative Slots
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Alternative Slot Submission Modal */}
      {altModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1">
                <span className="material-symbols-outlined text-emerald-600">schedule</span>
                Provide Preferred Interview Times
              </h3>
              <button onClick={() => setAltModalOpen(false)} className="text-slate-400 font-bold text-xs">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Submit 2 preferred times. Your assigned recruiter will coordinate directly with the Hiring Manager to lock in a custom slot!
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Preferred Time #1</label>
                <input
                  type="datetime-local"
                  value={prefTime1}
                  onChange={(e) => setPrefTime1(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Preferred Time #2</label>
                <input
                  type="datetime-local"
                  value={prefTime2}
                  onChange={(e) => setPrefTime2(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setAltModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestAlternatives}
                disabled={submitting}
                className="flex-1 py-2.5 bg-[#0F172A] text-[#FFD400] text-xs font-black rounded-xl hover:brightness-110 transition-all"
              >
                {submitting ? "Submitting..." : "Send to Recruiter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
