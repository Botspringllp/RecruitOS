"use client";

import React, { useState, useEffect, use } from "react";

interface Slot {
  slotId: string;
  startTime: string;
  endTime: string;
  interviewerEmail: string;
  status: string;
}

/* ─── WhatsApp green theme tokens ─── */
const WA_GREEN = "#25D366";
const WA_DARK = "#111B21";
const WA_PANEL = "#202C33";
const WA_BUBBLE_IN = "#202C33";   // received (bot) bubble
const WA_BUBBLE_OUT = "#005C4B";  // sent (candidate) bubble
const WA_BG = "#0B141A";
const WA_TICK = "#53BDEB";

/* ─── Reusable bubble components ─── */
function BotBubble({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [visible, setVisible] = useState(delay === 0);
  useEffect(() => {
    if (delay > 0) {
      const t = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(t);
    }
  }, [delay]);
  if (!visible) return null;
  return (
    <div className="flex items-end gap-2 max-w-[85%] self-start animate-in slide-in-from-left-2 fade-in duration-300">
      {/* Avatar */}
      <div className="h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-black shadow-md"
        style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}>
        R
      </div>
      <div className="rounded-2xl rounded-tl-none p-3 text-sm text-white shadow-md"
        style={{ backgroundColor: WA_BUBBLE_IN }}>
        {children}
        <div className="text-right text-[10px] text-slate-400 mt-1">
          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

function CandidateBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end max-w-[85%] self-end ml-auto animate-in slide-in-from-right-2 fade-in duration-300">
      <div className="rounded-2xl rounded-tr-none p-3 text-sm text-white shadow-md"
        style={{ backgroundColor: WA_BUBBLE_OUT }}>
        {children}
        <div className="text-right text-[10px] mt-1 flex items-center justify-end gap-0.5" style={{ color: WA_TICK }}>
          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          <svg viewBox="0 0 16 11" className="h-3 w-4" fill="currentColor">
            <path d="M11.071.653L4.42 8.169l-2.95-2.949L.53 6.159l3.89 3.89 7.591-8.456-1-..94z" />
            <path d="M15.071.653L8.42 8.169l-.95-.95-1.05 1.04 1.9 1.9 7.591-8.456L15.071.653z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ─── Option button (quick reply style) ─── */
function QuickReply({ label, icon, onClick, highlight = false }: {
  label: string; icon?: string; onClick: () => void; highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left text-sm font-semibold py-2.5 px-4 rounded-xl border transition-all active:scale-95 cursor-pointer flex items-center gap-2"
      style={{
        backgroundColor: highlight ? WA_GREEN : "#2A3942",
        borderColor: highlight ? WA_GREEN : "#3C4C55",
        color: "#fff",
      }}
    >
      {icon && <span className="text-base">{icon}</span>}
      {label}
    </button>
  );
}

export default function CandidateInterviewConfirmPage({ params }: { params: Promise<{ submissionId: string }> }) {
  const { submissionId } = use(params);

  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<Slot[]>([]);

  // Conversation state machine
  type Step = "greeting" | "slots" | "confirming" | "confirmed" | "alt_request" | "alt_sent";
  const [step, setStep] = useState<Step>("greeting");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedSlotIdx, setSelectedSlotIdx] = useState<number | null>(null);
  const [altDateTime, setAltDateTime] = useState("");
  const [altReason, setAltReason] = useState("");

  const candidateName = "Aarav";
  const jobTitle = "Senior Full Stack Engineer";
  const clientName = "Apex Global Technologies";
  const recruiterName = "Priya Sharma";

  useEffect(() => {
    // Simulate loading slots
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
    tomorrow.setHours(14, 0, 0, 0);
    const dayAfter = new Date(Date.now() + 48 * 3600 * 1000);
    dayAfter.setHours(11, 0, 0, 0);
    const day3 = new Date(Date.now() + 72 * 3600 * 1000);
    day3.setHours(16, 0, 0, 0);

    setSlots([
      { slotId: "slot-01", startTime: tomorrow.toISOString(), endTime: new Date(tomorrow.getTime() + 45 * 60000).toISOString(), interviewerEmail: "hr@apexglobal.com", status: "Proposed" },
      { slotId: "slot-02", startTime: dayAfter.toISOString(), endTime: new Date(dayAfter.getTime() + 45 * 60000).toISOString(), interviewerEmail: "hr@apexglobal.com", status: "Proposed" },
      { slotId: "slot-03", startTime: day3.toISOString(), endTime: new Date(day3.getTime() + 45 * 60000).toISOString(), interviewerEmail: "hr@apexglobal.com", status: "Proposed" },
    ]);

    setTimeout(() => {
      setLoading(false);
      setTimeout(() => setStep("slots"), 1200);
    }, 800);
  }, [submissionId]);

  const formatSlot = (slot: Slot) => {
    const d = new Date(slot.startTime);
    const date = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
    const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    return `${date} at ${time} IST`;
  };

  const handleSelectSlot = (slot: Slot, idx: number) => {
    setSelectedSlot(slot);
    setSelectedSlotIdx(idx);
    setStep("confirming");

    // Auto-advance to confirmed after 1.5s (simulate bot response)
    setTimeout(() => {
      setStep("confirmed");
      // Open WhatsApp to recruiter
      const msg = `Hi ${recruiterName},\n\nCandidate *${candidateName}* has CONFIRMED Slot ${idx + 1} — *${formatSlot(slot)}* for interview at ${clientName} for *${jobTitle}*.\n\nPlease generate the Google Meet link and send the calendar invite. 🎯\n\nClient Schedule Link:\nhttp://localhost:3000/client-schedule-confirm/${submissionId}`;
      setTimeout(() => {
        window.open(`https://wa.me/917982416306?text=${encodeURIComponent(msg)}`, "_blank");
      }, 800);
    }, 1500);
  };

  const handleSendAltSlot = () => {
    if (!altDateTime) return;
    const fmt = new Date(altDateTime).toLocaleString("en-IN");
    setStep("alt_sent");
    const msg = `Hi ${recruiterName},\n\nCandidate *${candidateName}* is unavailable for the 3 proposed slots.\n\nCandidate's Preferred Date & Time:\n*${fmt}*\nReason: "${altReason || "Schedule conflict"}"\n\nKindly coordinate with Client HR for a new slot.\n\nClient Link:\nhttp://localhost:3000/client-schedule-confirm/${submissionId}`;
    window.open(`https://wa.me/917982416306?text=${encodeURIComponent(msg)}`, "_blank");
  };

  /* ─── Loading screen ─── */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: WA_BG }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-14 w-14 rounded-full flex items-center justify-center text-white text-xl font-black"
            style={{ background: `linear-gradient(135deg, ${WA_GREEN}, #128C7E)` }}>R</div>
          <div className="text-white font-bold text-sm">RecruitOS Messaging</div>
          <div className="flex gap-1 mt-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-2 w-2 rounded-full animate-bounce" style={{ backgroundColor: WA_GREEN, animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <p className="text-xs mt-1" style={{ color: "#8696A0" }}>Fetching interview options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: WA_BG }}>

      {/* ── WhatsApp-style top bar ── */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-2.5 shadow-lg" style={{ backgroundColor: WA_PANEL }}>
        <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${WA_GREEN}, #128C7E)` }}>R</div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-bold truncate">RecruitOS Bot</p>
          <p className="text-xs truncate" style={{ color: WA_GREEN }}>
            {clientName} · {jobTitle}
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#2A3942", color: WA_GREEN }}>
          <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: WA_GREEN }} />
          Live
        </div>
      </div>

      {/* ── Chat body ── */}
      <div className="flex-1 flex flex-col gap-3 px-3 py-4 overflow-y-auto max-w-lg mx-auto w-full">

        {/* Greeting bubble */}
        <BotBubble>
          <p>Hi <strong>{candidateName}! 👋</strong></p>
          <p className="mt-1 text-slate-300 text-xs leading-relaxed">
            Great news! <strong className="text-white">{clientName}</strong> has shortlisted you for the role of <strong className="text-[#25D366]">{jobTitle}</strong>. 🎉
          </p>
          <p className="mt-2 text-slate-300 text-xs">Please choose one of the interview time slots below to lock your interview.</p>
        </BotBubble>

        {/* Slots message */}
        {(step === "slots" || step === "confirming" || step === "confirmed" || step === "alt_request" || step === "alt_sent") && (
          <BotBubble delay={0}>
            <p className="font-bold text-xs text-slate-300 mb-2">📅 Available Interview Slots:</p>
            <div className="space-y-2">
              {slots.map((slot, idx) => {
                const isSelected = selectedSlotIdx === idx && (step === "confirming" || step === "confirmed");
                return (
                  <div key={slot.slotId}
                    className={`rounded-xl p-2.5 border transition-all ${isSelected ? "border-emerald-400 bg-emerald-900/30" : "border-slate-600 bg-slate-700/40"}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{["1️⃣", "2️⃣", "3️⃣"][idx]}</span>
                      <div>
                        <p className="text-white text-xs font-bold">{formatSlot(slot)}</p>
                        <p className="text-slate-400 text-[10px]">Video Call · 45 mins · Google Meet</p>
                      </div>
                      {isSelected && <span className="ml-auto text-green-400 text-xs font-bold">✅ Selected</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-slate-400 text-[10px]">Reply with your preferred slot number or tap a button below 👇</p>
          </BotBubble>
        )}

        {/* Quick reply buttons — only when awaiting choice */}
        {step === "slots" && (
          <div className="space-y-2 self-start w-full max-w-[85%] ml-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {slots.map((slot, idx) => (
              <QuickReply
                key={slot.slotId}
                icon={["1️⃣", "2️⃣", "3️⃣"][idx]}
                label={`Slot ${idx + 1} — ${formatSlot(slot)}`}
                onClick={() => handleSelectSlot(slot, idx)}
                highlight={idx === 1}
              />
            ))}
            <QuickReply
              icon="❌"
              label="None of these work — Request other time"
              onClick={() => setStep("alt_request")}
            />
          </div>
        )}

        {/* Confirming state */}
        {step === "confirming" && selectedSlot && (
          <>
            <CandidateBubble>
              <p>✅ Slot {selectedSlotIdx! + 1} — <strong>{formatSlot(selectedSlot)}</strong></p>
            </CandidateBubble>
            <div className="flex items-center gap-2 self-start ml-10">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="h-2 w-2 rounded-full animate-bounce"
                    style={{ backgroundColor: WA_GREEN, animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <p className="text-xs" style={{ color: "#8696A0" }}>RecruiterBot is typing...</p>
            </div>
          </>
        )}

        {/* Confirmed state */}
        {step === "confirmed" && selectedSlot && (
          <>
            <BotBubble>
              <p>✅ <strong>Interview Confirmed!</strong></p>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                Your interview slot has been locked for <strong className="text-[#25D366]">{formatSlot(selectedSlot)}</strong> with {clientName}.
              </p>
              <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                📩 Recruiter <strong className="text-white">{recruiterName}</strong> has been notified and will send you the <strong>Google Meet link + Calendar Invite</strong> shortly.
              </p>
              <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                📚 You will receive your <strong className="text-[#FFD400]">personalised Interview Prep Kit</strong> on WhatsApp <strong>24 hours before</strong> your interview. Keep an eye out! 🎯
              </p>
            </BotBubble>

            {/* What to do next */}
            <BotBubble delay={1200}>
              <p className="text-xs text-slate-300 leading-relaxed">
                Is there anything else you need before the interview? 😊<br />
                You can reach your recruiter <strong className="text-white">{recruiterName}</strong> anytime on WhatsApp.
              </p>
              <a
                href="https://wa.me/917982416306"
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl"
                style={{ backgroundColor: WA_GREEN, color: "#fff" }}
              >
                <span>💬</span> Chat with Recruiter on WhatsApp
              </a>
            </BotBubble>

            {/* Confirmed summary card */}
            <div className="self-start ml-10 w-full max-w-[85%]">
              <div className="rounded-2xl p-4 text-white text-xs space-y-1.5"
                style={{ backgroundColor: "#1F2C34", border: "1px solid #2A373F" }}>
                <p className="font-extrabold text-[#25D366] text-sm">✅ Booking Confirmed</p>
                <p><span className="text-slate-400">Candidate:</span> <strong>{candidateName}</strong></p>
                <p><span className="text-slate-400">Company:</span> <strong>{clientName}</strong></p>
                <p><span className="text-slate-400">Role:</span> <strong>{jobTitle}</strong></p>
                <p><span className="text-slate-400">Slot:</span> <strong className="text-[#25D366]">{formatSlot(selectedSlot)}</strong></p>
                <p><span className="text-slate-400">Format:</span> Video Call · Google Meet</p>
              </div>
            </div>
          </>
        )}

        {/* Alt slot request */}
        {(step === "alt_request" || step === "alt_sent") && (
          <>
            <CandidateBubble>
              <p>❌ None of these slots work for me. I need a different time.</p>
            </CandidateBubble>

            <BotBubble>
              <p className="font-bold">No worries! 📅</p>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                Please share your preferred date & time and I'll pass it on to <strong className="text-white">{recruiterName}</strong> to coordinate with the client.
              </p>
            </BotBubble>

            {step === "alt_request" && (
              <div className="self-start ml-10 w-full max-w-[85%] space-y-2 animate-in fade-in duration-300">
                <div className="rounded-xl p-3 space-y-2" style={{ backgroundColor: "#1F2C34", border: "1px solid #2A373F" }}>
                  <label className="text-[11px] text-slate-400 font-bold block">Preferred Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={altDateTime}
                    onChange={e => setAltDateTime(e.target.value)}
                    className="w-full text-sm text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2"
                    style={{ backgroundColor: "#2A3942", borderColor: "#3C4C55", border: "1px solid #3C4C55" }}
                  />
                  <label className="text-[11px] text-slate-400 font-bold block mt-1">Reason (optional)</label>
                  <input
                    type="text"
                    value={altReason}
                    onChange={e => setAltReason(e.target.value)}
                    placeholder="e.g. Project deadline, prior commitment..."
                    className="w-full text-sm text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 placeholder:text-slate-600"
                    style={{ backgroundColor: "#2A3942", border: "1px solid #3C4C55" }}
                  />
                  <button
                    onClick={handleSendAltSlot}
                    disabled={!altDateTime}
                    className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    style={{ backgroundColor: WA_GREEN }}
                  >
                    📤 Send My Preferred Time to Recruiter
                  </button>
                </div>
              </div>
            )}

            {step === "alt_sent" && (
              <BotBubble>
                <p>📨 <strong>Sent!</strong></p>
                <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                  Your preferred time has been forwarded to <strong className="text-white">{recruiterName}</strong>. They will coordinate with {clientName} and confirm a new slot. We'll update you on WhatsApp! 💪
                </p>
              </BotBubble>
            )}
          </>
        )}

      </div>

      {/* ── Bottom secured by bar ── */}
      <div className="sticky bottom-0 py-2 text-center text-[10px]" style={{ backgroundColor: WA_BG, color: "#8696A0" }}>
        🔒 End-to-end encrypted · Powered by RecruitOS
      </div>
    </div>
  );
}
