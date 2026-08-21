"use client";

import React, { useState, useEffect, use } from "react";

interface Slot {
  slotId: string;
  startTime: string;
  endTime: string;
  interviewerEmail: string;
  status: string;
}

const WA_GREEN = "#25D366";
const WA_PANEL = "#202C33";
const WA_BUBBLE_IN = "#202C33";
const WA_BUBBLE_OUT = "#005C4B";
const WA_BG = "#0B141A";
const WA_TICK = "#53BDEB";

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
    <div className="flex items-end gap-2 max-w-[88%] self-start animate-in slide-in-from-left-2 fade-in duration-300">
      <div className="h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-black shadow-md"
        style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}>R</div>
      <div className="rounded-2xl rounded-tl-none p-3 text-sm text-white shadow-md" style={{ backgroundColor: WA_BUBBLE_IN }}>
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
    <div className="flex justify-end max-w-[88%] self-end ml-auto animate-in slide-in-from-right-2 fade-in duration-300">
      <div className="rounded-2xl rounded-tr-none p-3 text-sm text-white shadow-md" style={{ backgroundColor: WA_BUBBLE_OUT }}>
        {children}
        <div className="text-right text-[10px] mt-1 flex items-center justify-end gap-0.5" style={{ color: WA_TICK }}>
          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ✓✓
        </div>
      </div>
    </div>
  );
}

export default function CandidateInterviewConfirmPage({ params }: { params: Promise<{ submissionId: string }> }) {
  const { submissionId } = use(params);

  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<Slot[]>([]);

  // Flow State
  type Step = "greeting" | "show_slots" | "confirming" | "confirmed" | "alt_request" | "alt_sent";
  const [step, setStep] = useState<Step>("greeting");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedSlotIdx, setSelectedSlotIdx] = useState<number | null>(null);
  const [altDateTime, setAltDateTime] = useState("");
  const [altReason, setAltReason] = useState("");

  const candidateName = "Aarav Sharma";
  const jobTitle = "Senior Full Stack Engineer";
  const clientName = "Apex Global Technologies";
  const recruiterPhone = "917982416306";

  useEffect(() => {
    // Generate dates for the 3 slots selected by client
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
    tomorrow.setHours(14, 0, 0, 0);

    const dayAfter = new Date(Date.now() + 48 * 3600 * 1000);
    dayAfter.setHours(11, 0, 0, 0);

    const day3 = new Date(Date.now() + 72 * 3600 * 1000);
    day3.setHours(16, 0, 0, 0);

    const loadedSlots: Slot[] = [
      { slotId: "slot-01", startTime: tomorrow.toISOString(), endTime: new Date(tomorrow.getTime() + 45 * 60000).toISOString(), interviewerEmail: "hr@apexglobal.com", status: "Proposed" },
      { slotId: "slot-02", startTime: dayAfter.toISOString(), endTime: new Date(dayAfter.getTime() + 45 * 60000).toISOString(), interviewerEmail: "hr@apexglobal.com", status: "Proposed" },
      { slotId: "slot-03", startTime: day3.toISOString(), endTime: new Date(day3.getTime() + 45 * 60000).toISOString(), interviewerEmail: "hr@apexglobal.com", status: "Proposed" },
    ];

    setSlots(loadedSlots);
    setLoading(false);
    setTimeout(() => setStep("show_slots"), 1000);
  }, [submissionId]);

  const formatSlotStr = (dStr: string) => {
    const d = new Date(dStr);
    return `${d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} at ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} IST`;
  };

  const handleSelectSlot = (slot: Slot, idx: number) => {
    setSelectedSlot(slot);
    setSelectedSlotIdx(idx);
    setStep("confirming");

    // Auto-advance bot reply
    setTimeout(() => {
      setStep("confirmed");

      // Auto-dispatch WhatsApp to Recruiter
      const slotTimeFmt = formatSlotStr(slot.startTime);
      const msg = `Hi Recruiter Priya Sharma,\n\nI am *${candidateName}*. I confirm *Slot ${idx + 1} (${slotTimeFmt})* for my interview with *${clientName}* for *${jobTitle}*! 🎯\n\nPlease issue the Google Meet link & calendar invite.`;
      const generatedWaUrl = `https://wa.me/${recruiterPhone}?text=${encodeURIComponent(msg)}`;
      
      setTimeout(() => {
        window.open(generatedWaUrl, "_blank");
      }, 800);
    }, 1200);
  };

  const handleSendAltSlot = () => {
    if (!altDateTime) return;
    setStep("alt_sent");
    const fmt = new Date(altDateTime).toLocaleString("en-IN");
    const msg = `Hi Recruiter Priya Sharma,\n\nCandidate *${candidateName}* is unavailable for proposed client slots.\n\nRequested Custom Slot:\n*${fmt}*\nReason: "${altReason || "Schedule conflict"}"`;
    window.open(`https://wa.me/${recruiterPhone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white" style={{ backgroundColor: WA_BG }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-14 w-14 rounded-full flex items-center justify-center text-white text-2xl font-black animate-bounce"
            style={{ background: `linear-gradient(135deg, ${WA_GREEN}, #128C7E)` }}>💬</div>
          <p className="font-bold text-sm">Opening WhatsApp Chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: WA_BG }}>

      {/* Top Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-2.5 shadow-lg" style={{ backgroundColor: WA_PANEL }}>
        <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${WA_GREEN}, #128C7E)` }}>R</div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-bold truncate">RecruitOS Bot</p>
          <p className="text-xs truncate" style={{ color: WA_GREEN }}>{clientName} · {jobTitle}</p>
        </div>
        <div className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#2A3942", color: WA_GREEN }}>
          <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: WA_GREEN }} />
          Online
        </div>
      </div>

      {/* Chat Body */}
      <div className="flex-1 flex flex-col gap-3 px-3 py-4 overflow-y-auto max-w-lg mx-auto w-full pb-20">

        {/* Greeting message */}
        <BotBubble>
          <p>Hi <strong>{candidateName}! 👋</strong></p>
          <p className="text-slate-300 text-xs mt-1 leading-relaxed">
            Great news! Client <strong className="text-white">{clientName}</strong> has shortlisted you for <strong className="text-[#25D366]">{jobTitle}</strong>. 🎉
          </p>
          <p className="text-slate-300 text-xs mt-2">Here are the 3 interview time slots chosen by the Client HR. Please select 1 slot to lock your interview:</p>
        </BotBubble>

        {/* Slots choices */}
        {(step === "show_slots" || step === "confirming" || step === "confirmed" || step === "alt_request" || step === "alt_sent") && (
          <BotBubble delay={0}>
            <p className="font-bold text-xs text-slate-300 mb-2">📅 Client Proposed Slots:</p>
            <div className="space-y-2">
              {slots.map((slot, idx) => {
                const isSelected = selectedSlotIdx === idx && (step === "confirming" || step === "confirmed");
                return (
                  <div key={slot.slotId}
                    onClick={() => step === "show_slots" && handleSelectSlot(slot, idx)}
                    className={`rounded-xl p-2.5 border transition-all cursor-pointer ${isSelected ? "border-emerald-400 bg-emerald-900/40" : "border-slate-600 bg-slate-700/40 hover:border-emerald-500"}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{["1️⃣", "2️⃣", "3️⃣"][idx]}</span>
                      <div>
                        <p className="text-white text-xs font-bold">{formatSlotStr(slot.startTime)}</p>
                        <p className="text-slate-400 text-[10px]">Video Call · 45 mins · Google Meet</p>
                      </div>
                      {isSelected && <span className="ml-auto text-green-400 text-xs font-bold">✅ Selected</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </BotBubble>
        )}

        {/* Quick reply selection buttons */}
        {step === "show_slots" && (
          <div className="space-y-2 self-start w-full max-w-[88%] ml-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {slots.map((slot, idx) => (
              <button
                key={slot.slotId}
                onClick={() => handleSelectSlot(slot, idx)}
                className="w-full text-left text-xs font-semibold py-2.5 px-3.5 rounded-xl border transition-all active:scale-95 cursor-pointer flex items-center gap-2 text-white"
                style={{ backgroundColor: idx === 0 ? WA_GREEN : "#2A3942", borderColor: idx === 0 ? WA_GREEN : "#3C4C55" }}
              >
                <span>{["1️⃣", "2️⃣", "3️⃣"][idx]}</span>
                <span>Select Slot {idx + 1}: {formatSlotStr(slot.startTime)}</span>
              </button>
            ))}
            <button
              onClick={() => setStep("alt_request")}
              className="w-full text-left text-xs font-semibold py-2.5 px-3.5 rounded-xl border border-slate-600 text-slate-300 hover:text-white cursor-pointer"
              style={{ backgroundColor: "#1F2C34" }}
            >
              ❌ None of these work — Request Other Time
            </button>
          </div>
        )}

        {/* Confirming state */}
        {step === "confirming" && selectedSlot && (
          <>
            <CandidateBubble>
              <p>✅ Selected Slot {selectedSlotIdx! + 1}: <strong>{formatSlotStr(selectedSlot.startTime)}</strong></p>
            </CandidateBubble>
            <div className="flex items-center gap-2 self-start ml-10">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => <div key={i} className="h-2 w-2 rounded-full animate-bounce" style={{ backgroundColor: WA_GREEN, animationDelay: `${i * 0.15}s` }} />)}
              </div>
              <p className="text-xs" style={{ color: "#8696A0" }}>RecruiterBot is locking calendar slot...</p>
            </div>
          </>
        )}

        {/* Confirmed State & T-24h Prep Kit Notice */}
        {step === "confirmed" && selectedSlot && (
          <>
            <BotBubble>
              <p>✅ <strong>Interview Confirmed!</strong></p>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                Your interview has been locked for <strong className="text-[#25D366]">{formatSlotStr(selectedSlot.startTime)}</strong> with {clientName}.
              </p>
              <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                📩 Recruiter Priya Sharma has been notified via WhatsApp. Meeting link & calendar invite are being dispatched.
              </p>
            </BotBubble>

            {/* Crucial Bot Message for 24h Prep Kit */}
            <BotBubble delay={800}>
              <p className="text-[#FFD400] font-bold">📚 Interview Preparation Kit Notice:</p>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                You will receive your personalized <strong>Interview Preparation Kit</strong> on WhatsApp exactly <strong>24 hours before</strong> your interview! ⏱️
              </p>
              <p className="text-slate-300 text-xs mt-1">
                It contains company intel, tech stack focus areas, and key behavioral question response guides ("The Orange Test").
              </p>

              {/* Direct Link to Prep Kit Page with Live Countdown Popup */}
              <a
                href={`/prep-kit/INT_${submissionId || "SUB_9703"}`}
                className="mt-3 flex items-center justify-between text-xs font-black px-3.5 py-2.5 rounded-xl shadow-lg transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: "#FFD400", color: "#0F172A" }}
              >
                <span>➡️ Open T-24h Interview Prep Kit & Live Countdown</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>
            </BotBubble>
          </>
        )}

        {/* Alt slot request */}
        {(step === "alt_request" || step === "alt_sent") && (
          <>
            <CandidateBubble>
              <p>❌ None of the proposed slots work for me.</p>
            </CandidateBubble>
            <BotBubble>
              <p className="font-bold">No problem! 📅</p>
              <p className="text-slate-300 text-xs mt-1">Please enter your preferred date & time:</p>
            </BotBubble>
            {step === "alt_request" && (
              <div className="self-start ml-10 w-full max-w-[88%] space-y-2 animate-in fade-in">
                <div className="rounded-xl p-3 space-y-2" style={{ backgroundColor: "#1F2C34", border: "1px solid #2A373F" }}>
                  <input
                    type="datetime-local"
                    value={altDateTime}
                    onChange={e => setAltDateTime(e.target.value)}
                    className="w-full text-sm text-white rounded-xl px-3 py-2"
                    style={{ backgroundColor: "#2A3942", border: "1px solid #3C4C55" }}
                  />
                  <button
                    onClick={handleSendAltSlot}
                    disabled={!altDateTime}
                    className="w-full py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-50"
                    style={{ backgroundColor: WA_GREEN }}
                  >
                    📤 Send Preferred Slot to Recruiter
                  </button>
                </div>
              </div>
            )}
            {step === "alt_sent" && (
              <BotBubble>
                <p>📨 Sent to Recruiter Priya Sharma! They will coordinate with Client HR and update you shortly.</p>
              </BotBubble>
            )}
          </>
        )}

      </div>

      <div className="sticky bottom-0 py-2 text-center text-[10px]" style={{ backgroundColor: WA_BG, color: "#8696A0" }}>
        🔒 End-to-end encrypted · RecruitOS Candidate Experience Engine
      </div>
    </div>
  );
}
