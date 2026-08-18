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
  const [selectedSlotDetails, setSelectedSlotDetails] = useState<string>("");

  // Custom Slot Modal
  const [altModalOpen, setAltModalOpen] = useState(false);
  const [customDateTime, setCustomDateTime] = useState("");
  const [customReason, setCustomReason] = useState("");

  const candidateName = "Aarav Sharma";
  const jobTitle = "Senior Full Stack Engineer";
  const clientName = "Apex Global Technologies";

  useEffect(() => {
    fetchSubmissionSlots();
  }, [submissionId]);

  const fetchSubmissionSlots = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/public/candidate/confirm-slot?submissionId=${submissionId}`);
      
      const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
      tomorrow.setHours(14, 0, 0, 0);

      const dayAfter = new Date(Date.now() + 48 * 3600 * 1000);
      dayAfter.setHours(11, 0, 0, 0);

      const day3 = new Date(Date.now() + 72 * 3600 * 1000);
      day3.setHours(16, 0, 0, 0);

      setSlots([
        {
          slotId: "slot-01",
          startTime: tomorrow.toISOString(),
          endTime: new Date(tomorrow.getTime() + 45 * 60000).toISOString(),
          interviewerEmail: "sarah.jenkins@apexglobal.com",
          status: "Proposed",
        },
        {
          slotId: "slot-02",
          startTime: dayAfter.toISOString(),
          endTime: new Date(dayAfter.getTime() + 45 * 60000).toISOString(),
          interviewerEmail: "sarah.jenkins@apexglobal.com",
          status: "Proposed",
        },
        {
          slotId: "slot-03",
          startTime: day3.toISOString(),
          endTime: new Date(day3.getTime() + 45 * 60000).toISOString(),
          interviewerEmail: "sarah.jenkins@apexglobal.com",
          status: "Proposed",
        },
      ]);
    } catch (err: any) {
      setError(err.message || "Failed to load interview slots");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSlot = (slot: Slot, idx: number) => {
    const slotTimeFormatted = new Date(slot.startTime).toLocaleString();
    setSelectedSlotDetails(slotTimeFormatted);
    setSuccessStatus("CONFIRMED");

    const clientScheduleLockUrl = `http://localhost:3000/client-schedule-confirm/${submissionId || "SUB_9701"}`;
    const message = `Hi Recruiter Priya Sharma,\n\nCandidate *${candidateName}* has CONFIRMED Slot #${idx + 1} (${slotTimeFormatted}) for interview with ${clientName} (${jobTitle}).\n\nPlease click link to trigger Client Meeting Link Generator & Calendar Invite:\n${clientScheduleLockUrl}`;

    const subject = `Slot Confirmed: ${candidateName} - ${jobTitle}`;

    // Trigger 1: WhatsApp to DEFAULT 917982416306
    window.open(`https://wa.me/917982416306?text=${encodeURIComponent(message)}`, "_blank");

    // Trigger 2: Email to DEFAULT divyanshu@botspring.in
    setTimeout(() => {
      window.location.href = `mailto:divyanshu@botspring.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    }, 400);
  };

  const handleRequestAlternatives = () => {
    if (!customDateTime) {
      alert("Please select your preferred Date & Time.");
      return;
    }

    const customFormatted = new Date(customDateTime).toLocaleString();
    setSelectedSlotDetails(customFormatted);
    setSuccessStatus("ALTERNATIVE_REQUESTED");
    setAltModalOpen(false);

    const clientScheduleLockUrl = `http://localhost:3000/client-schedule-confirm/${submissionId || "SUB_9701"}`;
    const message = `Hi Recruiter Priya Sharma,\n\nCandidate *${candidateName}* is unavailable for the 3 proposed client slots.\n\nCandidate Requested Custom Date & Time:\n*${customFormatted}*\nReason: "${customReason || "Schedule conflict"}"\n\nPlease forward custom availability to Client HR for reschedule confirmation:\n${clientScheduleLockUrl}`;

    const subject = `Custom Slot Request: ${candidateName} - ${jobTitle}`;

    // Trigger 1: WhatsApp to DEFAULT 917982416306
    window.open(`https://wa.me/917982416306?text=${encodeURIComponent(message)}`, "_blank");

    // Trigger 2: Email to DEFAULT divyanshu@botspring.in
    setTimeout(() => {
      window.location.href = `mailto:divyanshu@botspring.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    }, 400);
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
            Client Shortlist Confirmed!
          </span>
          <h1 className="text-xl font-black text-white">Select Your Interview Slot</h1>
          <p className="text-xs text-slate-300 font-medium">
            Client <strong className="text-amber-300">{clientName}</strong> has shortlisted you for <strong>{jobTitle}</strong>. Tap 1 slot to lock your interview!
          </p>
        </div>

        {/* Success Confirmation State */}
        {successStatus === "CONFIRMED" && (
          <div className="bg-emerald-50 border-2 border-emerald-400 p-6 rounded-3xl text-center space-y-4 shadow-lg animate-in zoom-in-95">
            <span className="material-symbols-outlined text-5xl text-emerald-600">check_circle</span>
            <h2 className="text-lg font-black text-emerald-900">Interview Slot Locked!</h2>
            <p className="text-xs text-emerald-800 font-bold">
              Confirmed Slot: {selectedSlotDetails}
            </p>
            <p className="text-xs text-emerald-700">
              Notification dispatched to lead recruiter. Final calendar invitation & meeting link will be sent shortly.
            </p>

            <div className="pt-3 border-t border-emerald-200 space-y-2 text-left">
              <span className="text-[10px] font-black text-emerald-900 uppercase tracking-wider block text-center">
                Next Steps in Recruiter/Client Pipeline:
              </span>

              <a
                href={`/client-schedule-confirm/${submissionId || "SUB_9701"}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#0F172A] text-[#FFD400] font-black p-3.5 rounded-2xl text-xs flex items-center justify-between hover:brightness-110 shadow-md transition-all"
              >
                <span>➡️ Open Client Final Schedule & Meeting Link Generator</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>
            </div>
          </div>
        )}

        {/* Alternative Requested State */}
        {successStatus === "ALTERNATIVE_REQUESTED" && (
          <div className="bg-blue-50 border-2 border-blue-400 p-6 rounded-3xl text-center space-y-4 shadow-lg animate-in zoom-in-95">
            <span className="material-symbols-outlined text-5xl text-blue-600">schedule_send</span>
            <h2 className="text-lg font-black text-blue-900">Custom Date & Time Requested!</h2>
            <p className="text-xs text-blue-800 font-bold">
              Requested Slot: {selectedSlotDetails}
            </p>
            <p className="text-xs text-blue-700">
              Your requested slot has been sent to recruiter Priya Sharma to coordinate with Client HR.
            </p>

            <div className="pt-3 border-t border-blue-200 text-left">
              <a
                href={`/client-schedule-confirm/${submissionId || "SUB_9701"}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#0F172A] text-[#FFD400] font-black p-3 rounded-2xl text-xs flex items-center justify-between hover:brightness-110 shadow-md"
              >
                <span>➡️ Open Client Schedule Confirmation Page</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>
            </div>
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
                  className="bg-white border-2 border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between hover:border-emerald-500 transition-all"
                >
                  <div>
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                      Option #{idx + 1}
                    </span>
                    <h3 className="text-sm font-black text-slate-900 mt-1">
                      {start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                    </h3>
                    <p className="text-xs font-bold text-slate-600">
                      {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  <button
                    onClick={() => handleConfirmSlot(slot, idx)}
                    disabled={submitting}
                    className="bg-emerald-600 text-white font-black text-xs px-4 py-3 rounded-xl hover:bg-emerald-700 active:scale-95 transition-all shadow cursor-pointer disabled:opacity-50 flex items-center gap-1"
                  >
                    <span>Confirm Slot</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              );
            })}

            {/* Alternative Slot Request Trigger */}
            <div className="pt-3 border-t border-slate-200">
              <button
                onClick={() => setAltModalOpen(true)}
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-sm">edit_calendar</span>
                None of these work? Request Other Date & Time
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Date & Time Modal */}
      {altModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1">
                <span className="material-symbols-outlined text-emerald-600">schedule</span>
                Request Custom Date & Time
              </h3>
              <button onClick={() => setAltModalOpen(false)} className="text-slate-400 font-bold text-xs">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Specify your available Date & Time. Lead recruiter Priya Sharma will coordinate directly with Client HR:
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Preferred Date & Time *</label>
                <input
                  type="datetime-local"
                  value={customDateTime}
                  onChange={(e) => setCustomDateTime(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason / Note</label>
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="e.g. Existing project deadline / Prior commitment..."
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
                className="flex-1 py-2.5 bg-[#0F172A] text-[#FFD400] text-xs font-black rounded-xl hover:brightness-110 transition-all shadow-md"
              >
                Send via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
