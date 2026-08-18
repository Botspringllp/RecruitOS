"use client";

import React, { useState, use } from "react";

export default function ClientScheduleConfirmPage({ params }: { params: Promise<{ submissionId: string }> }) {
  const { submissionId } = use(params);

  const candidateName = "Aarav Sharma";
  const jobTitle = "Senior Full Stack Engineer (React/Node)";
  const clientName = "Apex Global Technologies";

  const [confirmedSlot, setConfirmedSlot] = useState("Tomorrow at 2:00 PM (14:00 - 14:45 IST)");
  const [meetingConfirmed, setMeetingConfirmed] = useState(false);
  const [googleMeetLink, setGoogleMeetLink] = useState("");

  // Reschedule Modal
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [newSlot1, setNewSlot1] = useState("");
  const [newSlot2, setNewSlot2] = useState("");

  // Reject Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleConfirmAndGenerateMeetingLink = () => {
    const meetUrl = `https://meet.google.com/rec-ops-meet-${submissionId || "9701"}`;
    setGoogleMeetLink(meetUrl);
    setMeetingConfirmed(true);

    const prepKitUrl = `http://localhost:3000/prep-kit/PREP_KIT_${submissionId || "SUB_9701"}`;

    const message = `Hi ${candidateName},\n\nYour interview for *${jobTitle}* with *${clientName}* is 100% CONFIRMED!\n\n📅 Date & Time: ${confirmedSlot}\n🎥 Google Meet Join Link:\n${meetUrl}\n\n📚 Placement Preparation Kit (T-24h Intel):\n${prepKitUrl}\n\nPlease click your prep kit link to acknowledge your readiness before the interview!`;
    const subject = `Interview Confirmed & Google Meet Link: ${jobTitle} - ${clientName}`;

    // Trigger 1: WhatsApp to DEFAULT 917982416306
    window.open(`https://wa.me/917982416306?text=${encodeURIComponent(message)}`, "_blank");

    // Trigger 2: Email to DEFAULT divyanshu@botspring.in
    setTimeout(() => {
      window.location.href = `mailto:divyanshu@botspring.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    }, 400);
  };

  const handleSendReschedule = () => {
    if (!newSlot1) {
      alert("Please provide at least 1 new proposed time slot.");
      return;
    }

    const message = `Hi Recruiter Priya Sharma,\n\nClient HR ${clientName} requests to RESCHEDULE candidate *${candidateName}* for role: ${jobTitle}.\n\nNew Proposed Client Slots:\n1. ${new Date(newSlot1).toLocaleString()}\n${newSlot2 ? `2. ${new Date(newSlot2).toLocaleString()}` : ""}\n\nPlease forward new slots to candidate for re-confirmation.`;
    const subject = `Reschedule Request: ${candidateName} - ${jobTitle}`;

    // Trigger 1: WhatsApp to DEFAULT 917982416306
    window.open(`https://wa.me/917982416306?text=${encodeURIComponent(message)}`, "_blank");

    // Trigger 2: Email to DEFAULT divyanshu@botspring.in
    setTimeout(() => {
      window.location.href = `mailto:divyanshu@botspring.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    }, 400);

    alert("Reschedule notice dispatched via WhatsApp & Email.");
    setRescheduleModalOpen(false);
  };

  const handleSendRejection = () => {
    if (!rejectReason) {
      alert("Please provide a reason for cancelling.");
      return;
    }

    const message = `Hi Recruiter Priya Sharma,\n\nClient HR ${clientName} has CANCELLED/REJECTED candidate *${candidateName}* for role: ${jobTitle}.\n\nReason: "${rejectReason}"`;
    const subject = `Cancellation Notice: ${candidateName} - ${jobTitle}`;

    // Trigger 1: WhatsApp to DEFAULT 917982416306
    window.open(`https://wa.me/917982416306?text=${encodeURIComponent(message)}`, "_blank");

    // Trigger 2: Email to DEFAULT divyanshu@botspring.in
    setTimeout(() => {
      window.location.href = `mailto:divyanshu@botspring.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    }, 400);

    alert("Rejection notice dispatched via WhatsApp & Email.");
    setRejectModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans p-4 text-slate-900">
      <div className="max-w-xl mx-auto w-full space-y-6 my-auto">
        {/* Header Banner */}
        <div className="bg-[#0F172A] text-white p-6 rounded-3xl shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="bg-[#FFD400] text-[#0F172A] font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
              Client Final Schedule Gateway
            </span>
            <span className="text-[10px] text-slate-400 font-mono">ID: {submissionId || "SUB_9701"}</span>
          </div>

          <h1 className="text-xl font-black text-white">Interview Schedule Lock & Meeting Generator</h1>
          <p className="text-xs text-slate-300">
            Client: <strong className="text-amber-300">{clientName}</strong> • Candidate: <strong className="text-emerald-300">{candidateName}</strong>
          </p>
        </div>

        {/* Selected Slot Overview Card */}
        <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Target Mandate</span>
              <h2 className="text-base font-black text-slate-900">{jobTitle}</h2>
            </div>
            <span className="bg-emerald-50 border border-emerald-300 text-emerald-900 font-black text-xs px-3 py-1 rounded-full uppercase">
              Candidate Selected
            </span>
          </div>

          <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-600 text-3xl">event_available</span>
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Candidate Confirmed Time</span>
                <span className="text-sm font-black text-slate-900">{confirmedSlot}</span>
              </div>
            </div>
          </div>

          {/* Confirmed Meeting Success View */}
          {meetingConfirmed ? (
            <div className="bg-emerald-50 border-2 border-emerald-400 p-5 rounded-2xl space-y-4 text-center animate-in zoom-in-95 shadow-lg">
              <span className="material-symbols-outlined text-5xl text-emerald-600">video_camera_front</span>
              <div>
                <h3 className="text-base font-black text-emerald-900">Google Meet Video Link Generated!</h3>
                <p className="text-xs text-emerald-800 font-medium">Calendar invitation & video link created for Client HR & Candidate.</p>
              </div>

              <div className="bg-white border border-emerald-300 p-3 rounded-xl flex items-center justify-between text-xs">
                <span className="font-mono text-emerald-900 font-bold truncate">{googleMeetLink}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(googleMeetLink);
                    alert("Google Meet Link copied to clipboard!");
                  }}
                  className="bg-emerald-600 text-white font-extrabold px-3 py-1.5 rounded-lg text-[11px] hover:bg-emerald-700 cursor-pointer"
                >
                  Copy Link
                </button>
              </div>

              <div className="pt-2 border-t border-emerald-200 text-left space-y-2">
                <span className="text-[10px] font-black text-emerald-900 uppercase tracking-wider block text-center">
                  Next Step: Placement Preparation Kit (T-24h)
                </span>
                <a
                  href={`/prep-kit/PREP_KIT_${submissionId || "SUB_9701"}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-[#0F172A] text-[#FFD400] font-black p-3.5 rounded-2xl text-xs flex items-center justify-between hover:brightness-110 shadow-md transition-all"
                >
                  <span>➡️ Open Candidate Placement Prep Kit Page (/prep-kit/PREP_KIT_SUB_9701)</span>
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                </a>
              </div>
            </div>
          ) : (
            /* 3 Main Action Buttons */
            <div className="space-y-3 pt-2">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                Select Client HR Action:
              </span>

              <button
                type="button"
                onClick={handleConfirmAndGenerateMeetingLink}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">check_circle</span>
                <span>✓ Confirm Interview & Generate Google Meet Link</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRescheduleModalOpen(true)}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-extrabold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <span className="material-symbols-outlined text-base">edit_calendar</span>
                  <span>🔄 Reschedule</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRejectModalOpen(true)}
                  className="bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <span className="material-symbols-outlined text-base">cancel</span>
                  <span>✕ Reject / Cancel</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1">
                <span className="material-symbols-outlined text-amber-500">edit_calendar</span>
                Propose New Interview Slots
              </h3>
              <button onClick={() => setRescheduleModalOpen(false)} className="text-slate-400 font-bold text-xs">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Provide new dates & times to send to recruiter for candidate re-confirmation:
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">New Slot #1 *</label>
                <input
                  type="datetime-local"
                  value={newSlot1}
                  onChange={(e) => setNewSlot1(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">New Slot #2</label>
                <input
                  type="datetime-local"
                  value={newSlot2}
                  onChange={(e) => setNewSlot2(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setRescheduleModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReschedule}
                className="flex-1 py-2.5 bg-[#0F172A] text-[#FFD400] text-xs font-black rounded-xl hover:brightness-110 transition-all shadow-md"
              >
                Send via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-red-600 flex items-center gap-1">
                <span className="material-symbols-outlined">report_problem</span>
                Cancel Interview Request
              </h3>
              <button onClick={() => setRejectModalOpen(false)} className="text-slate-400 font-bold text-xs">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Provide cancellation reason for candidate <strong>{candidateName}</strong>:
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason..."
              className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
            />

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSendRejection}
                className="flex-1 py-2.5 bg-red-600 text-white text-xs font-black rounded-xl hover:bg-red-700 transition-all shadow-md"
              >
                Send Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
