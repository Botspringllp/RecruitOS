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
const WA_DARK = "#111B21";
const WA_PANEL = "#202C33";
const WA_BG = "#0B141A";

export default function CandidateInterviewConfirmPage({ params }: { params: Promise<{ submissionId: string }> }) {
  const { submissionId } = use(params);

  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(true);
  const [waUrl, setWaUrl] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);

  const candidateName = "Aarav Sharma";
  const jobTitle = "Senior Full Stack Engineer";
  const clientName = "Apex Global Technologies";
  const recruiterPhone = "917982416306";

  useEffect(() => {
    // Generate dates for the 3 slots
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

    const formatSlotStr = (dStr: string) => {
      const d = new Date(dStr);
      return `${d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} at ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} IST`;
    };

    // Construct structured WhatsApp message with slot choices
    const message = `Hi Recruiter Priya Sharma & ${clientName} HR Team,\n\nI am *${candidateName}* and I received the interview invitation for the role of *${jobTitle}* at *${clientName}*! 🎯\n\nPlease confirm my interview slot from the 3 proposed options:\n\n1️⃣ Option 1: ${formatSlotStr(loadedSlots[0].startTime)}\n2️⃣ Option 2: ${formatSlotStr(loadedSlots[1].startTime)}\n3️⃣ Option 3: ${formatSlotStr(loadedSlots[2].startTime)}\n\nMy Choice: [ Please confirm Slot 1, Slot 2, or Slot 3 ]`;

    const generatedWaUrl = `https://wa.me/${recruiterPhone}?text=${encodeURIComponent(message)}`;
    setWaUrl(generatedWaUrl);
    setLoading(false);

    // DIRECT AUTOMATIC REDIRECT TO WHATSAPP UPON CLICKING THE LINK
    const timer = setTimeout(() => {
      window.location.href = generatedWaUrl;
    }, 400);

    return () => clearTimeout(timer);
  }, [submissionId]);

  const handleManualOpenWhatsApp = (selectedSlotIdx?: number) => {
    if (!waUrl) return;

    if (selectedSlotIdx !== undefined) {
      const d = new Date(slots[selectedSlotIdx].startTime);
      const slotStr = `${d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} at ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} IST`;
      const customMsg = `Hi Recruiter Priya Sharma,\n\nI am *${candidateName}*. I confirm *Slot ${selectedSlotIdx + 1} (${slotStr})* for my interview with *${clientName}* for *${jobTitle}*! 🎯\n\nPlease issue the Google Meet link & calendar invite.`;
      const customWaUrl = `https://wa.me/${recruiterPhone}?text=${encodeURIComponent(customMsg)}`;
      window.location.href = customWaUrl;
    } else {
      window.location.href = waUrl;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white" style={{ backgroundColor: WA_BG }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-14 w-14 rounded-full flex items-center justify-center text-white text-2xl font-black animate-pulse"
            style={{ background: `linear-gradient(135deg, ${WA_GREEN}, #128C7E)` }}>
            💬
          </div>
          <p className="font-bold text-sm">Opening WhatsApp Chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-white p-4" style={{ backgroundColor: WA_BG }}>
      <div className="max-w-md mx-auto w-full my-auto space-y-5 text-center">

        {/* WhatsApp Icon Banner */}
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full flex items-center justify-center text-white text-4xl shadow-2xl animate-bounce"
            style={{ background: `linear-gradient(135deg, ${WA_GREEN}, #128C7E)` }}>
            💬
          </div>
        </div>

        {/* Main Title */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full text-white"
            style={{ backgroundColor: WA_GREEN }}>
            Direct WhatsApp Redirect
          </span>
          <h1 className="text-xl font-black text-white">Opening WhatsApp Interview Assistant...</h1>
          <p className="text-xs text-slate-300 font-medium max-w-xs mx-auto">
            You are being redirected to WhatsApp to confirm your interview slot with <strong className="text-[#25D366]">{clientName}</strong> for <strong className="text-white">{jobTitle}</strong>.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          <button
            onClick={() => handleManualOpenWhatsApp()}
            className="w-full py-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            style={{ backgroundColor: WA_GREEN }}
          >
            <span>💬 Tap Here to Open WhatsApp Directly</span>
            <span className="text-lg">➔</span>
          </button>
          <p className="text-[10px] text-slate-400 mt-2">
            If WhatsApp didn't open automatically, tap the green button above.
          </p>
        </div>

        {/* 1-Click Direct Slot Options */}
        <div className="border-t border-slate-800 pt-4 space-y-3 text-left">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block text-center">
            Or Tap 1 Slot Below to Confirm Directly on WhatsApp:
          </span>

          <div className="space-y-2">
            {slots.map((slot, idx) => {
              const d = new Date(slot.startTime);
              const dateStr = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
              const timeStr = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

              return (
                <div
                  key={slot.slotId}
                  onClick={() => handleManualOpenWhatsApp(idx)}
                  className="rounded-2xl p-3.5 border border-slate-700 bg-slate-800/80 hover:border-[#25D366] transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded text-[#25D366] bg-emerald-950/80 border border-emerald-800">
                      Option #{idx + 1}
                    </span>
                    <p className="text-xs font-black text-white mt-1">{dateStr} at {timeStr}</p>
                    <p className="text-[10px] text-slate-400">45-min Video Call · Google Meet</p>
                  </div>
                  <span className="text-xs font-bold text-[#25D366] group-hover:translate-x-1 transition-transform">
                    Confirm 💬
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-[10px] text-slate-500 pt-2">
          🔒 End-to-End Encrypted · RecruitOS Dispatch Engine
        </div>
      </div>
    </div>
  );
}
