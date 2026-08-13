"use client";

import React, { useState, use } from "react";

export default function CandidateDebriefPage({ params }: { params: Promise<{ interviewId: string }> }) {
  const { interviewId } = use(params);

  const [rating, setRating] = useState(5);
  const [interestLevel, setInterestLevel] = useState<"100% Excited" | "Have Doubts" | "Not Interested">("100% Excited");
  const [candidateNotes, setCandidateNotes] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNoteRecorded, setVoiceNoteRecorded] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleVoiceRecordToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      setVoiceNoteRecorded(true);
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setVoiceNoteRecorded(true);
      }, 3000); // Simulate 3s recording
    }
  };

  const handleSubmitDebrief = async () => {
    try {
      setSubmitting(true);
      const res = await fetch("/api/v1/public/candidate/debrief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId,
          rating,
          interestLevel,
          candidateNotes: candidateNotes || (voiceNoteRecorded ? "30-sec voice debrief attached" : "Submitted via debrief survey."),
          voiceNoteUrl: voiceNoteRecorded ? `https://storage.recruiteros.com/voice-notes/${interviewId}.mp3` : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit debrief");

      setSubmitted(true);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <span className="material-symbols-outlined text-6xl text-[#FFD400]">task_alt</span>
        <h2 className="text-xl font-extrabold text-white">Debrief Survey Submitted!</h2>
        <p className="text-xs text-slate-300 max-w-xs">
          Thank you! Your feedback has been appended to your candidate timeline. The Recruiter Cockpit Stage-Gate audit card has been updated to <strong className="text-emerald-400">✓ Verified</strong>.
        </p>

        <a
          href="/cockpit"
          className="bg-[#FFD400] text-[#0F172A] font-black px-5 py-3 rounded-2xl text-xs inline-flex items-center gap-2 hover:brightness-110 shadow-lg transition-all"
        >
          <span className="material-symbols-outlined text-base">dashboard</span>
          <span>Return to Recruiter Cockpit (/cockpit)</span>
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans p-4 text-slate-900 pb-20">
      <div className="max-w-md mx-auto w-full space-y-5 my-auto">
        {/* Header Bar */}
        <div className="bg-[#0F172A] text-white p-5 rounded-3xl shadow-xl text-center space-y-1">
          <span className="text-[10px] font-black text-[#FFD400] uppercase tracking-wider block">Candidate Feedback (T+15m)</span>
          <h1 className="text-lg font-black text-white">TechCorp — Interview Debrief</h1>
          <p className="text-xs text-slate-300 font-medium">How did your interview go? Share your quick debrief.</p>
        </div>

        {/* 1. 5-Star Rating Component */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-center space-y-3">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
            Overall Interview Experience Rating
          </label>
          <div className="flex justify-center items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 focus:outline-none transition-transform active:scale-125 cursor-pointer"
              >
                <span className={`material-symbols-outlined text-3xl ${star <= rating ? "text-[#FFD400]" : "text-slate-300"}`}>
                  star
                </span>
              </button>
            ))}
          </div>
          <span className="text-xs font-bold text-slate-600 block">{rating} / 5 Stars Selected</span>
        </div>

        {/* 2. 3 Large Choice Cards for Interest Level */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wider block px-1">
            Candidate Interest Level
          </label>

          {/* Option A: 100% Excited (Highlighted in #FFD400) */}
          <button
            type="button"
            onClick={() => setInterestLevel("100% Excited")}
            className={`w-full p-4 rounded-2xl border text-left font-black text-xs flex items-center justify-between transition-all cursor-pointer ${
              interestLevel === "100% Excited"
                ? "bg-[#FFD400] text-[#0F172A] border-amber-400 shadow-md ring-2 ring-[#FFD400]"
                : "bg-white text-slate-700 border-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-xl">bolt</span>
              <span>100% Excited to Join!</span>
            </div>
            {interestLevel === "100% Excited" && <span className="material-symbols-outlined">check_circle</span>}
          </button>

          {/* Option B: Have Doubts */}
          <button
            type="button"
            onClick={() => setInterestLevel("Have Doubts")}
            className={`w-full p-4 rounded-2xl border text-left font-black text-xs flex items-center justify-between transition-all cursor-pointer ${
              interestLevel === "Have Doubts"
                ? "bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400"
                : "bg-white text-slate-700 border-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-xl">help_outline</span>
              <span>Have Doubts</span>
            </div>
            {interestLevel === "Have Doubts" && <span className="material-symbols-outlined">check_circle</span>}
          </button>

          {/* Option C: Not Interested */}
          <button
            type="button"
            onClick={() => setInterestLevel("Not Interested")}
            className={`w-full p-4 rounded-2xl border text-left font-black text-xs flex items-center justify-between transition-all cursor-pointer ${
              interestLevel === "Not Interested"
                ? "bg-red-100 text-red-900 border-red-300 ring-2 ring-red-400"
                : "bg-white text-slate-700 border-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-xl">cancel</span>
              <span>Not Interested</span>
            </div>
            {interestLevel === "Not Interested" && <span className="material-symbols-outlined">check_circle</span>}
          </button>
        </div>

        {/* 3. Audio Voice Note & Text Debrief Input */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3 shadow-sm">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
            Debrief Notes & Voice Impression
          </label>

          <button
            type="button"
            onClick={handleVoiceRecordToggle}
            className={`w-full py-3 px-4 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all ${
              isRecording
                ? "bg-red-600 text-white animate-pulse"
                : voiceNoteRecorded
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200"
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {isRecording ? "graphic_eq" : voiceNoteRecorded ? "mic_double" : "mic"}
            </span>
            {isRecording
              ? "Recording 30-sec voice debrief..."
              : voiceNoteRecorded
              ? "✔ 30-sec Voice Debrief Attached"
              : "Tap to record 30-sec voice debrief"}
          </button>

          <textarea
            rows={3}
            value={candidateNotes}
            onChange={(e) => setCandidateNotes(e.target.value)}
            placeholder="Or type key interview topics, questions asked, or team impressions..."
            className="w-full p-3 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0F172A] focus:outline-none"
          />
        </div>

        {/* 4. Dark Navy Submit Button */}
        <button
          type="button"
          onClick={handleSubmitDebrief}
          disabled={submitting}
          className="w-full bg-[#0F172A] text-white hover:bg-slate-900 font-extrabold py-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-base">send</span>
          {submitting ? "Submitting..." : "Submit Debrief"}
        </button>
      </div>
    </div>
  );
}
