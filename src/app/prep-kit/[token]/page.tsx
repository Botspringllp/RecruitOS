"use client";

import React, { useState, useEffect, use } from "react";

const WA_GREEN = "#25D366";
const WA_PANEL = "#202C33";
const WA_BUBBLE_IN = "#202C33";
const WA_BUBBLE_OUT = "#005C4B";
const WA_BG = "#0B141A";

function BotBubble({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [visible, setVisible] = useState(delay === 0);
  useEffect(() => {
    if (delay > 0) { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }
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
        <div className="text-right text-[10px] mt-1" style={{ color: "#53BDEB" }}>
          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ✓✓
        </div>
      </div>
    </div>
  );
}

interface AccordionProps { title: string; icon: string; children: React.ReactNode; defaultOpen?: boolean; }
function Accordion({ title, icon, children, defaultOpen = false }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #2A373F" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-3 text-left text-white cursor-pointer"
        style={{ backgroundColor: "#1F2C34" }}
      >
        <span className="flex items-center gap-2 text-sm font-bold">
          <span>{icon}</span> {title}
        </span>
        <span className="text-slate-400 text-sm">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="px-3 py-3 text-xs text-slate-300 leading-relaxed space-y-2" style={{ backgroundColor: "#151F27" }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function CandidatePrepKitPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"intro" | "kit" | "ready" | "declined">("intro");
  const [declineReason, setDeclineReason] = useState("");
  const [showDeclineInput, setShowDeclineInput] = useState(false);

  // 24-HOUR COUNTDOWN TIMER STATE
  const [countdown, setCountdown] = useState({ hours: 23, minutes: 58, seconds: 45 });
  const [showPopupModal, setShowPopupModal] = useState(true); // Popup on load per requirement!

  const candidateName = "Aarav Sharma";
  const jobTitle = "Senior Full Stack Engineer";
  const clientName = "Apex Global Technologies";
  const interviewer = "Sarah Jenkins (VP Talent)";
  const meetLink = "https://meet.google.com/rec-ops-meet-9701";

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      setTimeout(() => setStep("kit"), 800);
    }, 600);
  }, [token]);

  // Live seconds countdown timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleReady = () => {
    setStep("ready");
    const msg = `Hi Recruiter Priya Sharma,\n\nCandidate *${candidateName}* has reviewed the Placement Prep Kit and confirmed ✅ 100% READINESS for tomorrow's interview with *${clientName}* for *${jobTitle}*.\n\nAll good to go! 🎯`;
    window.open(`https://wa.me/917982416306?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleDecline = () => {
    if (!declineReason.trim()) return;
    setStep("declined");
    const msg = `Hi Recruiter Priya Sharma,\n\n⚠️ Candidate *${candidateName}* has DECLINED / CANCELLED the scheduled interview for *${jobTitle}* with *${clientName}*.\n\nReason: "${declineReason}"`;
    window.open(`https://wa.me/917982416306?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: WA_BG }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-14 w-14 rounded-full flex items-center justify-center text-white text-xl font-black"
            style={{ background: `linear-gradient(135deg, ${WA_GREEN}, #128C7E)` }}>R</div>
          <div className="text-white font-bold text-sm">RecruitOS Bot</div>
          <div className="flex gap-1 mt-2">
            {[0, 1, 2].map(i => <div key={i} className="h-2 w-2 rounded-full animate-bounce" style={{ backgroundColor: WA_GREEN, animationDelay: `${i * 0.15}s` }} />)}
          </div>
          <p className="text-xs mt-1" style={{ color: "#8696A0" }}>Preparing your Interview Kit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans relative" style={{ backgroundColor: WA_BG }}>

      {/* ── 24-HOUR COUNTDOWN POPUP MODAL (Triggers automatically upon page load) ── */}
      {showPopupModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#1F2C34] border-2 border-[#FFD400] rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#FFD400] text-[#0F172A] text-2xl font-black shadow-lg">
              ⏱️
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FFD400] bg-[#FFD400]/10 px-3 py-1 rounded-full border border-[#FFD400]/30">
                T-24 Hours Automated Trigger
              </span>
              <h2 className="text-lg font-black text-white mt-1">Interview Prep Kit Activated!</h2>
              <p className="text-xs text-slate-300">
                Your interview with <strong className="text-white">{clientName}</strong> is scheduled in:
              </p>
            </div>

            {/* Live Countdown Display */}
            <div className="grid grid-cols-3 gap-2 bg-[#111B21] p-3 rounded-2xl border border-slate-700">
              <div className="bg-[#202C33] p-2 rounded-xl">
                <span className="text-xl font-black text-[#25D366] font-mono block">
                  {String(countdown.hours).padStart(2, "0")}
                </span>
                <span className="text-[9px] uppercase font-bold text-slate-400">Hours</span>
              </div>
              <div className="bg-[#202C33] p-2 rounded-xl">
                <span className="text-xl font-black text-[#25D366] font-mono block">
                  {String(countdown.minutes).padStart(2, "0")}
                </span>
                <span className="text-[9px] uppercase font-bold text-slate-400">Mins</span>
              </div>
              <div className="bg-[#202C33] p-2 rounded-xl">
                <span className="text-xl font-black text-[#FFD400] font-mono block">
                  {String(countdown.seconds).padStart(2, "0")}
                </span>
                <span className="text-[9px] uppercase font-bold text-slate-400">Secs</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Review company overview, tech stack topics, and behavioral response guides before your interview call!
            </p>

            <button
              onClick={() => setShowPopupModal(false)}
              className="w-full py-3.5 bg-[#FFD400] hover:brightness-105 text-[#0F172A] font-black text-xs rounded-xl shadow-lg cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Explore Interview Prep Kit</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-2.5 shadow-lg" style={{ backgroundColor: WA_PANEL }}>
        <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}>R</div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-bold">RecruitOS Bot</p>
          <p className="text-xs truncate" style={{ color: WA_GREEN }}>Interview Prep Kit · {clientName}</p>
        </div>

        {/* Live Timer Badge */}
        <button
          onClick={() => setShowPopupModal(true)}
          className="text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
          style={{ backgroundColor: "#FF6B35", color: "#fff" }}
        >
          <span>⏱️</span>
          <span>{countdown.hours}h {countdown.minutes}m {countdown.seconds}s</span>
        </button>
      </div>

      {/* Chat body */}
      <div className="flex-1 flex flex-col gap-3 px-3 py-4 overflow-y-auto max-w-lg mx-auto w-full pb-24">

        {/* Opening bot message */}
        <BotBubble>
          <p>Hi <strong>{candidateName}! 🎉</strong></p>
          <p className="text-slate-300 text-xs mt-1 leading-relaxed">
            Your interview with <strong className="text-white">{clientName}</strong> is in <strong className="text-[#FFD400]">{countdown.hours}h {countdown.minutes}m</strong>!
          </p>
          <p className="text-slate-300 text-xs mt-1 leading-relaxed">
            Here is your personalized <strong className="text-white">Interview Prep Kit</strong>. Please go through it carefully before your interview. 📚
          </p>
        </BotBubble>

        {(step === "kit" || step === "ready" || step === "declined") && (
          <>
            {/* Kit message */}
            <BotBubble delay={0}>
              <p className="font-bold text-sm mb-2">📋 Prep Kit — {clientName}</p>

              {/* Meet link */}
              <div className="rounded-xl p-2.5 mb-3" style={{ backgroundColor: "#1A2730", border: "1px solid #2A373F" }}>
                <p className="text-[11px] text-slate-400 font-bold mb-1.5">🎥 Google Meet Video Call</p>
                <a
                  href={meetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg"
                  style={{ backgroundColor: "#00A884", color: "#fff" }}
                >
                  <span>📹</span> Join Video Call — Click to Enter
                </a>
                <p className="text-[10px] text-slate-500 mt-1.5">Join 5 minutes early. Keep camera on.</p>
              </div>

              {/* Accordions */}
              <div className="space-y-2">
                <Accordion title="Company Overview & Products" icon="🏢" defaultOpen>
                  <ul className="space-y-1.5 list-disc pl-3">
                    <li><strong className="text-white">Apex Global Technologies</strong> — FinTech SaaS leader with 2,400+ enterprise clients globally.</li>
                    <li>Core product: Real-time payment processing infrastructure (50M+ daily transactions).</li>
                    <li>Recent news: Series C raised ₹850 Cr (Aug 2026). Expanding cloud infra team.</li>
                    <li>Tech stack: Next.js, Node.js, Kafka, PostgreSQL, AWS EKS.</li>
                  </ul>
                </Accordion>

                <Accordion title="Behavioral Questions & Frameworks (Orange Test)" icon="🧠">
                  <p className="font-bold text-white mb-1">Key questions to prepare:</p>
                  <ul className="space-y-2 list-disc pl-3">
                    <li><strong className="text-[#FFD400]">Q: "Tell me about a time you improved performance."</strong>
                      <br />Framework: Situation → Problem → Action → Result (always with metrics).</li>
                    <li><strong className="text-[#FFD400]">Q: "How do you handle technical debt?"</strong>
                      <br />Framework: Always ask "why" before proposing solutions. Show trade-off thinking.</li>
                  </ul>
                  <div className="mt-2 p-2 rounded-lg" style={{ backgroundColor: "#2A3942" }}>
                    <p className="text-[#FFD400] font-bold text-xs">🍊 Orange Test Rule:</p>
                    <p className="text-xs text-slate-300 mt-0.5">Always greet interviewer, reference their LinkedIn work, and close with "What does success look like in 90 days?"</p>
                  </div>
                </Accordion>

                <Accordion title="Interviewer Profile" icon="👤">
                  <p><strong className="text-white">Panel:</strong> {interviewer}</p>
                  <p><strong className="text-white">Format:</strong> 45-Min Technical Deep Dive + System Architecture</p>
                </Accordion>
              </div>
            </BotBubble>

            {/* Bot readiness prompt */}
            {step !== "declined" && (
              <BotBubble delay={0}>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Once you've reviewed everything above, please tap <strong className="text-[#25D366]">I'm Ready!</strong> so your recruiter knows you're prepared. 👍
                </p>
              </BotBubble>
            )}

            {/* Action buttons */}
            {step === "kit" && !showDeclineInput && (
              <div className="self-start ml-10 w-full max-w-[88%] space-y-2 animate-in fade-in duration-300">
                <button
                  onClick={handleReady}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                  style={{ backgroundColor: WA_GREEN }}
                >
                  ✅ I've Reviewed & I'm Ready — Start Interview!
                </button>
                <button
                  onClick={() => setShowDeclineInput(true)}
                  className="w-full py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                  style={{ backgroundColor: "#3C1C1C", border: "1px solid #8B2121" }}
                >
                  ❌ Decline / Cancel Interview
                </button>
              </div>
            )}

            {/* Decline input */}
            {step === "kit" && showDeclineInput && (
              <>
                <CandidateBubble>
                  <p>❌ I need to cancel the interview.</p>
                </CandidateBubble>
                <BotBubble>
                  <p>Please share a reason so we can inform recruiter Priya Sharma:</p>
                </BotBubble>
                <div className="self-start ml-10 w-full max-w-[88%] space-y-2 animate-in fade-in">
                  <div className="rounded-xl p-3 space-y-2" style={{ backgroundColor: "#1F2C34", border: "1px solid #2A373F" }}>
                    <textarea
                      rows={3}
                      value={declineReason}
                      onChange={e => setDeclineReason(e.target.value)}
                      placeholder="Reason for cancellation..."
                      className="w-full text-sm text-white rounded-xl px-3 py-2 focus:outline-none resize-none"
                      style={{ backgroundColor: "#2A3942", border: "1px solid #3C4C55" }}
                    />
                    <div className="flex gap-2">
                      <button onClick={() => setShowDeclineInput(false)} className="flex-1 py-2 text-xs font-bold rounded-xl text-slate-300 cursor-pointer" style={{ backgroundColor: "#2A3942" }}>← Back</button>
                      <button onClick={handleDecline} disabled={!declineReason.trim()} className="flex-1 py-2 text-xs font-bold rounded-xl text-white cursor-pointer disabled:opacity-50" style={{ backgroundColor: "#B91C1C" }}>Send Cancellation</button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Ready state */}
            {step === "ready" && (
              <>
                <CandidateBubble>
                  <p>✅ I've reviewed everything. I'm 100% ready for the interview!</p>
                </CandidateBubble>
                <BotBubble>
                  <p>🚀 <strong>Outstanding!</strong> Recruiter Priya Sharma has been notified. Go ace it, {candidateName}! 🌟</p>
                  <a href={meetLink} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl" style={{ backgroundColor: "#00A884", color: "#fff" }}>
                    🎥 Join Interview Call Now
                  </a>

                  {/* Next Step to Debrief */}
                  <a
                    href={`/debrief/INT_${token || "SUB_9703"}`}
                    className="mt-2 flex items-center justify-between text-xs font-bold p-2.5 rounded-xl bg-amber-500 text-slate-950 hover:brightness-105"
                  >
                    <span>➡️ Next Step: Post-Interview Debrief Survey (/debrief/INT_9703)</span>
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                </BotBubble>
              </>
            )}

            {/* Declined state */}
            {step === "declined" && (
              <>
                <CandidateBubble>
                  <p>❌ Cancelling interview. Reason: {declineReason}</p>
                </CandidateBubble>
                <BotBubble>
                  <p>😔 Cancellation sent to recruiter Priya Sharma.</p>
                </BotBubble>
              </>
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
