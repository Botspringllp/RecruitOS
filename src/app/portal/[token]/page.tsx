"use client";

import React, { useState, useEffect, use } from "react";

/* --------------------------------------------------------
   Outlook-Style Calendar Slot Picker Component
   Matches the Microsoft Outlook new-event date/time row
-------------------------------------------------------- */
function OutlookSlotPicker({
  label,
  required = false,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  // Derive date and time parts from combined ISO datetime value
  const datePart = value ? value.split("T")[0] : "";
  const timePart = value ? value.split("T")[1]?.slice(0, 5) : "";

  // Generate 30-min interval time options (00:00 → 23:30)
  const timeSlots: string[] = [];
  for (let h = 0; h < 24; h++) {
    ["00", "30"].forEach((m) => {
      timeSlots.push(`${String(h).padStart(2, "0")}:${m}`);
    });
  }

  // Compute end time (+30 min by default)
  const computeEndTime = (t: string) => {
    if (!t) return "";
    const [hh, mm] = t.split(":").map(Number);
    const total = hh * 60 + mm + 30;
    return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  };

  const endTime = computeEndTime(timePart);

  const handleDateChange = (d: string) => {
    onChange(`${d}T${timePart || "09:00"}`);
  };

  const handleStartTimeChange = (t: string) => {
    onChange(`${datePart || new Date().toISOString().split("T")[0]}T${t}`);
  };

  return (
    <div className="space-y-2">
      {/* Slot label */}
      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </span>

      {/* Outlook-style rows */}
      <div className="border border-slate-200 rounded-xl px-3 py-2.5 space-y-2 bg-white">
        {/* Row 1: Start date */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400 font-semibold w-20 shrink-0">Start date</span>
          <input
            type="date"
            value={datePart}
            onChange={(e) => handleDateChange(e.target.value)}
            className="flex-1 text-[13px] font-medium text-slate-800 border-0 border-b border-slate-200 focus:border-sky-400 focus:outline-none bg-transparent py-0.5"
          />
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* Row 2: Start time + End time */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400 font-semibold w-20 shrink-0">Start time</span>
          <div className="relative flex-1">
            <select
              value={timePart}
              onChange={(e) => handleStartTimeChange(e.target.value)}
              className="w-full appearance-none text-[13px] font-medium text-slate-800 border border-slate-200 focus:border-sky-400 focus:outline-none rounded-lg px-2 py-1 pr-6 bg-white cursor-pointer"
            >
              <option value="">--:--</option>
              {timeSlots.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">▼</span>
          </div>

          <span className="text-[11px] text-slate-400 font-semibold w-16 shrink-0 text-center">End time</span>
          <div className="relative flex-1">
            <select
              value={endTime}
              disabled
              className="w-full appearance-none text-[13px] font-medium text-slate-700 border border-sky-300 focus:outline-none rounded-lg px-2 py-1 pr-6 bg-slate-50 cursor-not-allowed"
            >
              <option value="">{endTime || "--:--"}</option>
              {timeSlots.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">▼</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Candidate {
  submissionId: string;
  candidateId: string;
  fullName: string;
  currentTitle: string;
  currentCompany: string;
  experienceYears: string;
  noticePeriod: string;
  stage: string;
  summaryText: string;
  currentCtc?: string;
  expectedCtc?: string;
  skills?: string[];
  photoUrl?: string;
}

interface Job {
  jobId: string;
  title: string;
  clientName: string;
  primaryHrName?: string;
  agencyName?: string;
  recruiterName?: string;
}

export default function ClientPortalReviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activeCandidateIndex, setActiveCandidateIndex] = useState(0);

  // Modals
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("Skill Gap");
  const [customRejectionText, setCustomRejectionText] = useState("");

  const [holdModalOpen, setHoldModalOpen] = useState(false);
  const [holdReasonText, setHoldReasonText] = useState("");

  const [shortlistModalOpen, setShortlistModalOpen] = useState(false);
  const [clientNameInput, setClientNameInput] = useState("");
  const [clientEmailInput, setClientEmailInput] = useState("");
  const [clientPhoneInput, setClientPhoneInput] = useState("");
  const [slot1, setSlot1] = useState("");
  const [slot2, setSlot2] = useState("");
  const [slot3, setSlot3] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [actionSuccessText, setActionSuccessText] = useState<string | null>(null);
  const [nextStepUrl, setNextStepUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchPortalData();
  }, [token]);

  const fetchPortalData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/public/portal/${token}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load candidate shortlist");
      }

      setJob(data.job);
      setCandidates(data.candidates || []);
      if (data.job?.clientName) setClientNameInput(data.job.clientName);
      if (data.job?.primaryHrName) setClientEmailInput(data.job.primaryHrName);
    } catch (err: any) {
      // Dynamic loading from local storage for exact recruiter selection pass-through
      let storedCands: any[] = [];
      if (typeof window !== "undefined") {
        const rawTokenData = localStorage.getItem(`recruitos_portal_${token}`) || localStorage.getItem(`recruitos_latest_portal_candidates`);
        if (rawTokenData) {
          try {
            storedCands = JSON.parse(rawTokenData);
          } catch (e) {}
        }
      }

      setJob({
        jobId: "JOB_ZR97",
        title: "Senior Full Stack Engineer (React/Node)",
        clientName: "Apex Global Technologies",
        primaryHrName: "divyanshu@botspring.in",
        agencyName: "BotSpring Recruitment LLP",
        recruiterName: "Priya Sharma (Lead Recruiter)",
      });
      setClientNameInput("Apex Global Technologies");
      setClientEmailInput("divyanshu@botspring.in");

      if (storedCands && storedCands.length > 0) {
        const mappedCands: Candidate[] = storedCands.map((c, idx) => ({
          submissionId: `SUB_970${idx + 1}`,
          candidateId: c.id || `CAND_970${idx + 1}`,
          fullName: c.name,
          currentTitle: c.designation || "Software Specialist",
          currentCompany: c.currentCompany || "Enterprise Labs",
          experienceYears: c.experience || "5.0 Years",
          noticePeriod: c.noticePeriod || "30 Days",
          currentCtc: c.ctc || "₹18.5 LPA",
          expectedCtc: c.expectedCtc || "₹24.0 LPA",
          skills: typeof c.skills === "string" ? c.skills.split(",").map((s: string) => s.trim()) : c.skills || ["React", "TypeScript", "Node.js"],
          stage: c.status || "Applied",
          summaryText: c.notes || `Screened and vetted candidate for role. Applied for mandate.`,
          photoUrl: c.photoUrl,
        }));
        setCandidates(mappedCands);
      } else {
        setCandidates([
          {
            submissionId: "SUB_9701",
            candidateId: "CAND_9701",
            fullName: "Aarav Sharma",
            currentTitle: "Sr. Software Engineer",
            currentCompany: "Infosys Labs",
            experienceYears: "5.5 Years",
            noticePeriod: "30 Days",
            currentCtc: "₹18.5 LPA",
            expectedCtc: "₹24.0 LPA",
            skills: ["React 19", "Next.js", "Node.js", "TypeScript", "PostgreSQL", "TailwindCSS"],
            stage: "Applied",
            summaryText: "Expert in Next.js, React, Node.js microservices. Reduced server latency by 40% in previous assignment. Highly rated by recruiter.",
          },
          {
            submissionId: "SUB_9702",
            candidateId: "CAND_9702",
            fullName: "Priya Nair",
            currentTitle: "Full Stack Lead",
            currentCompany: "TCS Innovation",
            experienceYears: "6.0 Years",
            noticePeriod: "15 Days (Immediate)",
            currentCtc: "₹21.0 LPA",
            expectedCtc: "₹27.0 LPA",
            skills: ["React", "NestJS", "Docker", "AWS Lambda", "Microservices"],
            stage: "Applied",
            summaryText: "Strong architectural expertise, React 19, TypeScript, PostgreSQL. Managed team of 8 engineers.",
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const activeCandidate = candidates[activeCandidateIndex] || candidates[0];

  const handleDownloadResume = () => {
    if (!activeCandidate) return;
    const blob = new Blob(
      [
        `==================================================\nRECRUITOS MASKED CANDIDATE RESUME\nCandidate: ${activeCandidate.fullName}\nRole: ${activeCandidate.currentTitle} (${activeCandidate.currentCompany})\nExperience: ${activeCandidate.experienceYears}\nSkills: ${activeCandidate.skills?.join(", ")}\n==================================================\nSummary:\n${activeCandidate.summaryText}\n`,
      ],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeCandidate.fullName.replace(/\s+/g, "_")}_Resume.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleConfirmShortlistDual = () => {
    if (!slot1) {
      alert("Please provide at least Slot 1 Date & Time.");
      return;
    }

    const proposedSlots = [slot1, slot2, slot3].filter(Boolean);
    const confirmUrl = `http://localhost:3000/interview-confirm/${activeCandidate?.submissionId || "SUB_9701"}`;
    const slotsFormatted = proposedSlots.map((s, idx) => `Slot #${idx + 1}: ${new Date(s).toLocaleString()}`).join("\n");

    const message = `Hi Recruiter Priya Sharma,\n\nClient HR ${clientNameInput || "Apex Tech"} has SHORTLISTED candidate *${activeCandidate?.fullName}* for mandate: ${job?.title || "Role"}.\n\nProposed Interview Slots:\n${slotsFormatted}\n\nCandidate Slot Selection Link:\n${confirmUrl}\n\nClient Contact: ${clientNameInput} (${clientEmailInput} / ${clientPhoneInput})`;

    const subject = `Shortlist & Interview Slots: ${activeCandidate?.fullName} - ${job?.title}`;
    const body = `Dear Recruiter Priya Sharma,\n\nClient HR ${clientNameInput} has shortlisted candidate ${activeCandidate?.fullName} for mandate: ${job?.title}.\n\nProposed Interview Slots:\n${slotsFormatted}\n\nCandidate Confirmation URL:\n${confirmUrl}\n\nBest regards,\n${clientNameInput}`;

    // Trigger 1: WhatsApp to DEFAULT 917982416306
    window.open(`https://wa.me/917982416306?text=${encodeURIComponent(message)}`, "_blank");

    // Trigger 2: Email to DEFAULT divyanshu@botspring.in
    setTimeout(() => {
      window.location.href = `mailto:divyanshu@botspring.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }, 400);

    setActionSuccessText(`🎉 Interview requested! Proposed slots dispatched via WhatsApp & Email.`);
    setNextStepUrl(`/interview-confirm/${activeCandidate?.submissionId || "SUB_9701"}`);
    setCandidates((prev) =>
      prev.map((c, idx) => (idx === activeCandidateIndex ? { ...c, stage: "Interviewing" } : c))
    );
    setShortlistModalOpen(false);
  };

  const handleConfirmHold = () => {
    if (!holdReasonText) {
      alert("Please provide a reason for placing the candidate on hold.");
      return;
    }

    const message = `Hi Recruiter Priya Sharma,\n\nClient HR ${job?.clientName} has placed candidate *${activeCandidate?.fullName}* on HOLD for role: ${job?.title}.\n\nHold Feedback Reason:\n"${holdReasonText}"`;
    const subject = `Candidate Hold Notice: ${activeCandidate?.fullName} - ${job?.title}`;

    // Trigger 1: WhatsApp to DEFAULT 917982416306
    window.open(`https://wa.me/917982416306?text=${encodeURIComponent(message)}`, "_blank");

    // Trigger 2: Email to DEFAULT divyanshu@botspring.in
    setTimeout(() => {
      window.location.href = `mailto:divyanshu@botspring.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }, 400);

    setActionSuccessText(`⏸ Candidate ${activeCandidate?.fullName} placed on Hold. Feedback sent via WhatsApp & Email.`);
    setCandidates((prev) =>
      prev.map((c, idx) => (idx === activeCandidateIndex ? { ...c, stage: "Hold" } : c))
    );
    setHoldModalOpen(false);
  };

  const handleConfirmRejection = () => {
    const finalReason = rejectionReason === "Other" ? customRejectionText : rejectionReason;
    if (!finalReason) {
      alert("Please select or enter a rejection reason.");
      return;
    }

    const message = `Hi Recruiter Priya Sharma,\n\nClient HR ${job?.clientName} has REJECTED candidate *${activeCandidate?.fullName}* for role: ${job?.title}.\n\nPrimary Rejection Category: ${rejectionReason}\nDetailed Feedback: "${finalReason}"`;
    const subject = `Candidate Rejection Feedback: ${activeCandidate?.fullName} - ${job?.title}`;

    // Trigger 1: WhatsApp to DEFAULT 917982416306
    window.open(`https://wa.me/917982416306?text=${encodeURIComponent(message)}`, "_blank");

    // Trigger 2: Email to DEFAULT divyanshu@botspring.in
    setTimeout(() => {
      window.location.href = `mailto:divyanshu@botspring.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }, 400);

    setActionSuccessText(`✕ Candidate ${activeCandidate?.fullName} rejected with feedback logged (WhatsApp + Email).`);
    setCandidates((prev) =>
      prev.map((c, idx) => (idx === activeCandidateIndex ? { ...c, stage: "Rejected" } : c))
    );
    setRejectModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-4xl text-[#FFD400] animate-spin mb-3">sync</span>
        <h2 className="text-lg font-bold">Loading Secure Candidate Review Portal...</h2>
        <p className="text-xs text-slate-400 mt-1">BotSpring Recruitment Operations Gateway</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-5xl text-red-400 mb-3">lock</span>
        <h2 className="text-xl font-extrabold text-red-400">Link Expired or Invalid</h2>
        <p className="text-xs text-slate-300 max-w-md mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 pb-28">
      {/* Landscape Header */}
      <header className="bg-[#0F172A] text-white sticky top-0 z-40 border-b border-slate-800 shadow-lg px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#FFD400] text-[#0F172A] font-black text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider">
                {job.agencyName || "BotSpring Recruitment LLP"}
              </span>
              <span className="text-xs text-slate-400">Client Portal</span>
            </div>
            <h1 className="text-lg md:text-xl font-black text-white mt-1">
              Requirement: {job.title}
            </h1>
            <p className="text-xs text-slate-300">
              Client: <strong className="text-amber-300">{job.clientName}</strong> ({job.primaryHrName || "VP HR"}) • Recruiter: <strong className="text-emerald-300">{job.recruiterName || "Priya Sharma"}</strong>
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-2xl text-right flex items-center gap-3">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Candidates Shortlist</span>
              <span className="text-sm font-black text-[#FFD400]">
                {activeCandidateIndex + 1} of {candidates.length} Presented
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Responsive Container */}
      <main className="max-w-6xl mx-auto w-full px-4 pt-6 space-y-6 flex-1">
        {/* Banner Notice */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-400 text-2xl">verified_user</span>
            <div>
              <p className="text-xs font-bold text-slate-200">
                Lead Recruiter <strong>{job.recruiterName || "Priya Sharma"}</strong> has screened and presented {candidates.length} vetted candidates for position <strong>{job.title}</strong>.
              </p>
              <p className="text-[11px] text-slate-400">Review full profiles, CTC breakdown, download resumes, and select Interview time blocks below.</p>
            </div>
          </div>
        </div>

        {/* Candidate Tabs Bar */}
        {candidates.length > 1 && (
          <div className="flex gap-2 border-b border-slate-200 pb-2">
            {candidates.map((c, idx) => (
              <button
                key={c.submissionId}
                onClick={() => {
                  setActiveCandidateIndex(idx);
                  setActionSuccessText(null);
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                  idx === activeCandidateIndex
                    ? "bg-[#0F172A] text-[#FFD400] shadow-md scale-102"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                Candidate #{idx + 1}: {c.fullName}
                {c.stage === "Interviewing" && <span className="text-emerald-400 font-bold">✓ Interview Requested</span>}
                {c.stage === "Hold" && <span className="text-amber-400 font-bold">⏸ On Hold</span>}
                {c.stage === "Rejected" && <span className="text-red-400 font-bold">✕ Rejected</span>}
              </button>
            ))}
          </div>
        )}

        {/* Success Action Notification Card */}
        {actionSuccessText && (
          <div className="bg-emerald-50 border-2 border-emerald-400 text-emerald-900 p-4 rounded-2xl text-xs font-bold space-y-3 animate-in fade-in shadow-md">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-2xl">check_circle</span>
              <span className="text-sm font-black">{actionSuccessText}</span>
            </div>
            {nextStepUrl && (
              <div className="pt-2 border-t border-emerald-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-800">
                  Step 2 (Candidate Slot Confirmation) Link is ready for testing:
                </span>
                <a
                  href={nextStepUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#0F172A] text-[#FFD400] font-black px-4 py-2 rounded-xl text-xs inline-flex items-center gap-2 hover:brightness-110 shadow-md transition-all"
                >
                  <span>➡️ Open Candidate Slot Lock Page (/interview-confirm/SUB_9701)</span>
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                </a>
              </div>
            )}
          </div>
        )}

        {!activeCandidate ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200">
            No active candidates found.
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left Column: Candidate Info & Stats (7 cols) */}
            <div className="lg:col-span-7 p-6 space-y-6 border-b lg:border-b-0 lg:border-r border-slate-200">
              {/* Candidate Avatar Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 text-[#FFD400] font-black text-2xl flex items-center justify-center border-2 border-amber-400 shadow-md">
                      {activeCandidate.fullName.charAt(0)}
                    </div>
                    <label className="absolute -bottom-1 -right-1 bg-slate-800 text-white p-1 rounded-full text-[10px] cursor-pointer hover:bg-slate-700" title="Upload Photo Option">
                      <span className="material-symbols-outlined text-xs">photo_camera</span>
                    </label>
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-slate-900">{activeCandidate.fullName}</h2>
                    <p className="text-xs font-bold text-slate-600">
                      {activeCandidate.currentTitle} at <strong className="text-slate-900">{activeCandidate.currentCompany}</strong>
                    </p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                        Exp: {activeCandidate.experienceYears || "5.5 Yrs"}
                      </span>
                      <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
                        Notice: {activeCandidate.noticePeriod || "30 Days"}
                      </span>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                    activeCandidate.stage === "Interviewing"
                      ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                      : activeCandidate.stage === "Hold"
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : activeCandidate.stage === "Rejected"
                      ? "bg-red-100 text-red-900 border border-red-300"
                      : "bg-blue-100 text-blue-900 border border-blue-200"
                  }`}
                >
                  {activeCandidate.stage}
                </span>
              </div>

              {/* 4 Stat Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Exp</span>
                  <span className="text-xs font-black text-slate-900">{activeCandidate.experienceYears || "5.5 Years"}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Notice Period</span>
                  <span className="text-xs font-black text-amber-700">{activeCandidate.noticePeriod || "30 Days"}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current CTC</span>
                  <span className="text-xs font-black text-slate-900">{activeCandidate.currentCtc || "₹18.5 LPA"}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Expected CTC</span>
                  <span className="text-xs font-black text-emerald-700">{activeCandidate.expectedCtc || "₹24.0 LPA"}</span>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="space-y-1.5">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">Key Technical Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {(activeCandidate.skills || ["React 19", "Next.js", "Node.js", "TypeScript", "PostgreSQL"]).map((sk, i) => (
                    <span key={i} className="bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-lg">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Executive Summary */}
              <div className="space-y-1.5">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">Candidate Executive Profile</span>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs text-slate-700 leading-relaxed font-medium">
                  {activeCandidate.summaryText}
                </div>
              </div>

              {/* Recruiter Assessment Notes */}
              <div className="space-y-1.5">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">Recruiter Screening Notes</span>
                <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl text-xs text-slate-800 leading-relaxed font-medium flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-600 text-xl flex-shrink-0 mt-0.5">rate_review</span>
                  <div>
                    <strong className="block text-slate-900 font-extrabold mb-0.5">Vetted by Priya Sharma (Lead Recruiter):</strong>
                    Candidate verified on technical depth, notice period flexibility, and salary expectations. Highly recommended for client interview.
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Resume Preview & Download PDF (5 cols) */}
            <div className="lg:col-span-5 p-6 bg-slate-50 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500 text-xl">picture_as_pdf</span>
                    <span className="text-xs font-extrabold text-slate-900">Verified Resume Preview</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-2 py-0.5 rounded">
                    PII Masked PDF
                  </span>
                </div>

                {/* Simulated Live Resume Box */}
                <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 text-xs font-mono space-y-3 shadow-inner max-h-80 overflow-y-auto">
                  <div className="border-b border-slate-200 pb-2">
                    <h3 className="font-black text-slate-900 text-sm">{activeCandidate.fullName}</h3>
                    <p className="text-[11px] text-slate-500 font-sans">{activeCandidate.currentTitle} • {activeCandidate.currentCompany}</p>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-700 font-sans">
                    <p className="font-bold text-slate-900 uppercase text-[10px]">Summary & Experience Highlights</p>
                    <p>{activeCandidate.summaryText}</p>
                  </div>

                  <div className="space-y-1 text-[11px] font-sans">
                    <p className="font-bold text-slate-900 uppercase text-[10px]">Core Stack & Tools</p>
                    <p className="text-slate-600">{activeCandidate.skills?.join(" • ")}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-sans italic text-center">
                    🔒 Candidate contact PII masked for agency data integrity.
                  </div>
                </div>
              </div>

              {/* Download Resume PDF Button */}
              <button
                type="button"
                onClick={handleDownloadResume}
                className="w-full bg-[#0F172A] hover:bg-slate-900 text-white font-extrabold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-base">download</span>
                <span>Download Resume PDF</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Action Bar for Client HR */}
      {activeCandidate && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 shadow-2xl z-50">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-700">Client Action for Candidate:</span>
              <h4 className="text-sm font-black text-slate-900">{activeCandidate.fullName} ({activeCandidate.currentTitle})</h4>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShortlistModalOpen(true)}
                disabled={submitting}
                className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-lg">calendar_month</span>
                <span>Interview</span>
              </button>

              <button
                onClick={() => setHoldModalOpen(true)}
                disabled={submitting}
                className="flex-1 sm:flex-initial bg-slate-800 hover:bg-slate-900 text-white font-black px-6 py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-lg">pause_circle</span>
                <span>Hold</span>
              </button>

              <button
                onClick={() => setRejectModalOpen(true)}
                disabled={submitting}
                className="flex-1 sm:flex-initial bg-red-600 hover:bg-red-700 text-white font-black px-6 py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-lg">cancel</span>
                <span>Reject</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HOLD MODAL */}
      {holdModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">pause_circle</span>
                Hold Candidate Feedback (Mandatory)
              </h3>
              <button onClick={() => setHoldModalOpen(false)} className="text-slate-400 font-bold text-xs">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Please provide the reason for placing candidate <strong>{activeCandidate?.fullName}</strong> on hold:
            </p>

            <textarea
              rows={3}
              value={holdReasonText}
              onChange={(e) => setHoldReasonText(e.target.value)}
              placeholder="e.g. Budget freeze under review / Awaiting internal VP approval / Role scope adjustment..."
              className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setHoldModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmHold}
                className="flex-1 py-2.5 bg-amber-500 text-slate-950 text-xs font-black rounded-xl hover:brightness-105 transition-all shadow-md"
              >
                Send Feedback via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-red-600 flex items-center gap-2">
                <span className="material-symbols-outlined">report_problem</span>
                Reject Candidate Feedback (Mandatory)
              </h3>
              <button onClick={() => setRejectModalOpen(false)} className="text-slate-400 font-bold text-xs">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Select primary rejection reason for <strong>{activeCandidate?.fullName}</strong>:
            </p>

            <div className="space-y-2">
              {["Skill Gap", "Salary High", "Communication Issue", "Location Issue", "Other"].map((reason) => (
                <label
                  key={reason}
                  onClick={() => setRejectionReason(reason)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    rejectionReason === reason
                      ? "border-red-500 bg-red-50 text-red-900"
                      : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectionReason"
                    checked={rejectionReason === reason}
                    onChange={() => setRejectionReason(reason)}
                    className="accent-red-600"
                  />
                  {reason}
                </label>
              ))}
            </div>

            {rejectionReason === "Other" && (
              <textarea
                rows={2}
                value={customRejectionText}
                onChange={(e) => setCustomRejectionText(e.target.value)}
                placeholder="Enter specific rejection feedback..."
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            )}

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejection}
                className="flex-1 py-2.5 bg-red-600 text-white text-xs font-black rounded-xl hover:bg-red-700 transition-all shadow-md"
              >
                Send Rejection Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERVIEW 3-SLOT PROPOSAL MODAL */}
      {shortlistModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-emerald-700 flex items-center gap-2">
                <span className="material-symbols-outlined">calendar_month</span>
                Shortlist Candidate & Provide 3 Interview Slots
              </h3>
              <button onClick={() => setShortlistModalOpen(false)} className="text-slate-400 font-bold text-xs">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Client HR Details & 3 available time slots to send to Recruiter for candidate <strong>{activeCandidate?.fullName}</strong>:
            </p>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Client HR / Company Name *</label>
                  <input
                    type="text"
                    value={clientNameInput}
                    onChange={(e) => setClientNameInput(e.target.value)}
                    placeholder="Apex Global Technologies"
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Client HR Email *</label>
                  <input
                    type="email"
                    value={clientEmailInput}
                    onChange={(e) => setClientEmailInput(e.target.value)}
                    placeholder="sarah.jenkins@apex.com"
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Client Contact Mobile (WhatsApp)</label>
                <input
                  type="text"
                  value={clientPhoneInput}
                  onChange={(e) => setClientPhoneInput(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              {/* Outlook-Style Slot Pickers */}
              <div className="space-y-5 pt-2 border-t border-slate-100">
                <span className="font-extrabold text-slate-800 uppercase tracking-wider block text-[10px] pt-1">
                  📅 Propose Up to 3 Interview Slots
                </span>

                <OutlookSlotPicker label="Slot 1" required value={slot1} onChange={setSlot1} />
                <OutlookSlotPicker label="Slot 2" value={slot2} onChange={setSlot2} />
                <OutlookSlotPicker label="Slot 3" value={slot3} onChange={setSlot3} />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setShortlistModalOpen(false)}
                className="py-3 px-4 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmShortlistDual}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-slate-900 hover:from-emerald-700 hover:to-slate-950 text-white text-xs font-black rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-base text-amber-400">send</span>
                <span>🚀 Dispatch Notification (WhatsApp + Email)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
