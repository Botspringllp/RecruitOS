"use client";

import React, { useState, use } from "react";

const WA_GREEN = "#25D366";
const WA_PANEL = "#202C33";
const WA_BUBBLE_IN = "#202C33";
const WA_BUBBLE_OUT = "#005C4B";
const WA_BG = "#0B141A";

function BotBubble({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [visible, setVisible] = React.useState(delay === 0);
  React.useEffect(() => {
    if (delay > 0) { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }
  }, [delay]);
  if (!visible) return null;
  return (
    <div className="flex items-end gap-2 max-w-[88%] self-start animate-in slide-in-from-left-2 fade-in duration-300">
      <div className="h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-black"
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

type InterestLevel = "100% Excited!" | "Have Some Doubts" | "Not Interested";

export default function CandidateDebriefPage({ params }: { params: Promise<{ interviewId: string }> }) {
  const { interviewId } = use(params);

  // Conversation steps
  type Step = "q1_rating" | "q2_interest" | "q3_notes" | "submitting" | "done";
  const [step, setStep] = useState<Step>("q1_rating");

  const [rating, setRating] = useState<number | null>(null);
  const [interest, setInterest] = useState<InterestLevel | null>(null);
  const [notes, setNotes] = useState("");

  const candidateName = "Aarav";
  const clientName = "Apex Global Technologies";

  const handleSelectRating = (r: number) => {
    setRating(r);
    setTimeout(() => setStep("q2_interest"), 800);
  };

  const handleSelectInterest = (i: InterestLevel) => {
    setInterest(i);
    setTimeout(() => setStep("q3_notes"), 800);
  };

  const handleSubmit = async () => {
    setStep("submitting");

    const interestEmoji = interest === "100% Excited!" ? "🔥" : interest === "Have Some Doubts" ? "🤔" : "❌";
    const flagAlert = (interest === "Have Some Doubts" || interest === "Not Interested" || (rating ?? 5) <= 2)
      ? `\n\n⚠️ *[ALERT: Immediate Recruiter Intervention Required — Candidate expressed "${interest}"]* ⚠️`
      : "";

    const msg = `Hi Recruiter Priya Sharma,\n\nCandidate *${candidateName}* has submitted their Post-Interview Debrief for *${clientName}*:\n\n⭐ Rating: ${rating}/5\n${interestEmoji} Interest Level: *${interest}*\n📝 Notes: ${notes || "(No additional notes)"}\n${flagAlert}`;

    window.open(`https://wa.me/917982416306?text=${encodeURIComponent(msg)}`, "_blank");
    setTimeout(() => setStep("done"), 800);
  };

  const starLabel = (r: number) => ["", "Poor 😞", "Below Average 😐", "Average 🙂", "Good 😊", "Excellent 🌟"][r];

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: WA_BG }}>

      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-2.5 shadow-lg" style={{ backgroundColor: WA_PANEL }}>
        <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}>R</div>
        <div className="flex-1">
          <p className="text-white text-sm font-bold">RecruitOS Bot</p>
          <p className="text-xs" style={{ color: WA_GREEN }}>Post-Interview Debrief · {clientName}</p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: "#2A3942", color: "#FF6B35" }}>
          T+15 min
        </span>
      </div>

      {/* Chat body */}
      <div className="flex-1 flex flex-col gap-3 px-3 py-4 overflow-y-auto max-w-lg mx-auto w-full pb-20">

        {/* Opening greeting */}
        <BotBubble>
          <p>Hi <strong>{candidateName}! 👋</strong></p>
          <p className="text-slate-300 text-xs mt-1 leading-relaxed">
            How did your interview with <strong className="text-white">{clientName}</strong> go? 🤞
          </p>
          <p className="text-slate-300 text-xs mt-1">
            It'll just take <strong className="text-white">30 seconds</strong>. Your feedback helps us support you better! 💪
          </p>
        </BotBubble>

        {/* Q1: Star Rating */}
        <BotBubble delay={0}>
          <p className="font-bold text-sm">⭐ Q1 of 3 — Overall Experience</p>
          <p className="text-slate-300 text-xs mt-1">How was your overall interview experience?</p>
        </BotBubble>

        {/* Star selector */}
        {(step === "q1_rating") && (
          <div className="self-start ml-10 animate-in fade-in duration-300">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(r => (
                <button
                  key={r}
                  onClick={() => handleSelectRating(r)}
                  className="flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-all p-2 rounded-xl"
                  style={{ backgroundColor: "#1F2C34", border: "1px solid #2A373F" }}
                >
                  <span className="text-2xl">{r <= 3 ? "⭐" : r === 4 ? "🌟" : "✨"}</span>
                  <span className="text-[10px] text-slate-400 font-bold">{r}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Q1 answer bubble */}
        {rating !== null && step !== "q1_rating" && (
          <CandidateBubble>
            <p>⭐ {rating}/5 — {starLabel(rating)}</p>
          </CandidateBubble>
        )}

        {/* Q2: Interest level */}
        {(step === "q2_interest" || step === "q3_notes" || step === "submitting" || step === "done") && (
          <>
            <BotBubble delay={0}>
              <p className="font-bold text-sm">💼 Q2 of 3 — Interest Level</p>
              <p className="text-slate-300 text-xs mt-1">Are you still interested in joining <strong className="text-white">{clientName}</strong>?</p>
            </BotBubble>

            {step === "q2_interest" && (
              <div className="self-start ml-10 w-full max-w-[88%] space-y-2 animate-in fade-in duration-300">
                {(["100% Excited!", "Have Some Doubts", "Not Interested"] as InterestLevel[]).map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleSelectInterest(opt)}
                    className="w-full text-left text-sm font-semibold py-2.5 px-4 rounded-xl border transition-all active:scale-95 cursor-pointer flex items-center gap-2 text-white"
                    style={{
                      backgroundColor: opt === "100% Excited!" ? "#1A3A2A" : opt === "Have Some Doubts" ? "#2A2A1A" : "#2A1A1A",
                      borderColor: opt === "100% Excited!" ? WA_GREEN : opt === "Have Some Doubts" ? "#FFD400" : "#EF4444",
                    }}
                  >
                    <span>{opt === "100% Excited!" ? "🔥" : opt === "Have Some Doubts" ? "🤔" : "❌"}</span>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Q2 answer */}
        {interest !== null && step !== "q2_interest" && (
          <CandidateBubble>
            <p>{interest === "100% Excited!" ? "🔥" : interest === "Have Some Doubts" ? "🤔" : "❌"} {interest}</p>
          </CandidateBubble>
        )}

        {/* Doubts warning bubble */}
        {interest === "Have Some Doubts" && (step === "q3_notes" || step === "submitting" || step === "done") && (
          <BotBubble delay={0}>
            <p className="text-[#FFD400] font-bold">🤔 Got it, no worries!</p>
            <p className="text-slate-300 text-xs mt-1">Your recruiter Priya will reach out to discuss your doubts and address any concerns. Please share any notes below.</p>
          </BotBubble>
        )}
        {interest === "Not Interested" && (step === "q3_notes" || step === "submitting" || step === "done") && (
          <BotBubble delay={0}>
            <p className="text-red-400 font-bold">😔 Understood!</p>
            <p className="text-slate-300 text-xs mt-1">Your recruiter will be in touch. Please share a quick note so we can understand your concerns better.</p>
          </BotBubble>
        )}

        {/* Q3: Notes */}
        {(step === "q3_notes" || step === "submitting" || step === "done") && (
          <>
            <BotBubble delay={0}>
              <p className="font-bold text-sm">📝 Q3 of 3 — Interview Notes</p>
              <p className="text-slate-300 text-xs mt-1">What key technical or salary topics were discussed? (Optional — type or skip)</p>
            </BotBubble>

            {step === "q3_notes" && (
              <div className="self-start ml-10 w-full max-w-[88%] space-y-2 animate-in fade-in duration-300">
                <div className="rounded-xl p-3 space-y-2" style={{ backgroundColor: "#1F2C34", border: "1px solid #2A373F" }}>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g. They asked about AWS architecture, PostgreSQL indexing strategies, system design..."
                    className="w-full text-sm text-white rounded-xl px-3 py-2 focus:outline-none placeholder:text-slate-600 resize-none"
                    style={{ backgroundColor: "#2A3942", border: "1px solid #3C4C55" }}
                  />
                  <button
                    onClick={handleSubmit}
                    className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                    style={{ backgroundColor: WA_GREEN }}
                  >
                    📤 Submit Debrief
                  </button>
                  <button
                    onClick={() => { setNotes(""); handleSubmit(); }}
                    className="w-full py-2 text-xs text-slate-400 font-medium cursor-pointer"
                  >
                    Skip notes & submit →
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Submitting state */}
        {step === "submitting" && (
          <div className="flex items-center gap-2 self-start ml-10">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => <div key={i} className="h-2 w-2 rounded-full animate-bounce" style={{ backgroundColor: WA_GREEN, animationDelay: `${i * 0.15}s` }} />)}
            </div>
            <p className="text-xs" style={{ color: "#8696A0" }}>RecruiterBot is processing...</p>
          </div>
        )}

        {/* Done state */}
        {step === "done" && (
          <>
            {notes && (
              <CandidateBubble>
                <p>📝 {notes}</p>
              </CandidateBubble>
            )}
            <BotBubble>
              <p>✅ <strong>Debrief Received!</strong></p>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                Thank you, <strong className="text-white">{candidateName}</strong>! Your feedback has been sent to recruiter <strong className="text-white">Priya Sharma</strong>.
              </p>
              {(interest === "100% Excited!" || (rating ?? 0) >= 4) && (
                <p className="text-[#25D366] text-xs mt-2 font-semibold">🌟 Excellent! We'll be in touch soon with the next steps from {clientName}!</p>
              )}
              <a href="https://wa.me/917982416306" target="_blank" rel="noreferrer"
                className="mt-3 flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl"
                style={{ backgroundColor: WA_GREEN, color: "#fff" }}>
                💬 Chat with Recruiter on WhatsApp
              </a>
            </BotBubble>

            {/* Summary card */}
            <div className="self-start ml-10 w-full max-w-[88%]">
              <div className="rounded-2xl p-3 text-xs space-y-1.5 text-white"
                style={{ backgroundColor: "#1F2C34", border: "1px solid #2A373F" }}>
                <p className="font-extrabold text-sm text-[#25D366]">📊 Debrief Summary</p>
                <p><span className="text-slate-400">Candidate:</span> <strong>{candidateName}</strong></p>
                <p><span className="text-slate-400">Company:</span> <strong>{clientName}</strong></p>
                <p><span className="text-slate-400">Rating:</span> <strong>{"⭐".repeat(rating ?? 0)} ({rating}/5)</strong></p>
                <p><span className="text-slate-400">Interest:</span> <strong style={{ color: interest === "100% Excited!" ? WA_GREEN : interest === "Have Some Doubts" ? "#FFD400" : "#EF4444" }}>{interest}</strong></p>
                {notes && <p><span className="text-slate-400">Notes:</span> {notes}</p>}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="sticky bottom-0 py-2 text-center text-[10px]" style={{ backgroundColor: WA_BG, color: "#8696A0" }}>
        🔒 End-to-end encrypted · RecruitOS Candidate Experience Engine
      </div>
    </div>
  );
}
