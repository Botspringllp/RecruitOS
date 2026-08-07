"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface ParsedData {
  fullName: string;
  email: string | null;
  phone: string | null;
  skills: string[];
  totalExpMonths: number | null;
  currentCompany: string | null;
  currentTitle: string | null;
  noticePeriodDays: number | null;
  currentCtc: number | null;
  expectedCtc: number | null;
}

export default function CockpitView() {
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parsingStatus, setParsingStatus] = useState("");
  const [saving, setSaving] = useState(false);
  
  // File states
  const [fileName, setFileName] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parsed Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [experienceMonths, setExperienceMonths] = useState<number>(0);
  const [noticePeriod, setNoticePeriod] = useState<number>(30);
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");

  // Duplicate Check states
  const [duplicateDetected, setDuplicateDetected] = useState(false);
  const [duplicateName, setDuplicateName] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Cockpit Database States
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [chasingId, setChasingId] = useState<string | null>(null);

  // Job Board Broadcasting states
  const [postings, setPostings] = useState<any[]>([]);
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [selectedBoards, setSelectedBoards] = useState<string[]>(["Naukri", "Bayt", "LinkedIn"]);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Partner Sharing states
  const [partnerShareModalOpen, setPartnerShareModalOpen] = useState(false);
  const [partnerEmail, setPartnerEmail] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [maskedTitle, setMaskedTitle] = useState("");
  const [maskedDesc, setMaskedDesc] = useState("");
  const [partnerSplit, setPartnerSplit] = useState(50);
  const [sharingJob, setSharingJob] = useState(false);
  const [shareSuccessMessage, setShareSuccessMessage] = useState("");
  const [generatedMagicLink, setGeneratedMagicLink] = useState("");

  // Mandate Conversion (AS-02 Owner Verification) States
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [converting, setConverting] = useState(false);
  const [convertSuccessMsg, setConvertSuccessMsg] = useState("");
  const [agreedFee, setAgreedFee] = useState("8.33");

  const handleConvertInboundMandate = async () => {
    if (!selectedJobId) return;
    setConverting(true);
    setConvertSuccessMsg("");
    try {
      const response = await fetch(`/api/v1/mandates/${selectedJobId}/convert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "owner" // Owner Verification locked rule
        },
        body: JSON.stringify({
          agreedFeePercentage: agreedFee,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setConvertSuccessMsg("Mandate approved! Client record created & onboarding emails/WhatsApp dispatched.");
        setTimeout(() => {
          loadCockpitData();
          setConvertModalOpen(false);
        }, 1800);
      } else {
        throw new Error(data.error || "Failed to convert mandate");
      }
    } catch (err: any) {
      setConvertSuccessMsg(`Error: ${err.message}`);
    } finally {
      setConverting(false);
    }
  };

  const openPartnerShareModal = () => {
    const selectedJob = jobs.find(j => j.jobId === selectedJobId);
    if (selectedJob) {
      setMaskedTitle(`Leading Tier-1 Organization — ${selectedJob.title}`);
      setMaskedDesc(`A premier enterprise client is looking for a qualified ${selectedJob.title} to join their engineering team. The client is a top-tier industry leader specializing in modern tech stack development.`);
    }
    setPartnerEmail("");
    setPartnerName("");
    setPartnerSplit(50);
    setGeneratedMagicLink("");
    setShareSuccessMessage("");
    setPartnerShareModalOpen(true);
  };

  const handleCreatePartnerShare = async () => {
    if (!selectedJobId) return;
    setSharingJob(true);
    setShareSuccessMessage("");
    try {
      const response = await fetch(`/api/v1/jobs/${selectedJobId}/partner-share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partner_email: partnerEmail,
          partner_name: partnerName,
          masked_job_title: maskedTitle,
          masked_company_description: maskedDesc,
          partner_split_percentage: partnerSplit,
          expires_in_days: 30
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setGeneratedMagicLink(data.magicLink);
        setShareSuccessMessage("Encrypted partner link successfully generated!");
      } else {
        throw new Error(data.error || "Failed to create sharing link");
      }
    } catch (err: any) {
      setShareSuccessMessage(`Error: ${err.message}`);
    } finally {
      setSharingJob(false);
    }
  };

  // Fallback mock candidates database for board display when no jobs are linked
  const [candidates, setCandidates] = useState([
    { id: "1", name: "Ankit Sharma", title: "Senior Product Designer", company: "Apex Corp", status: "Interviewing", experience: "6 Years", notice: "30 Days", email: "ankit.sharma@example.com" },
    { id: "2", name: "Sarah Jenkins", title: "Infrastructure Lead", company: "CloudNet", status: "Screened", experience: "8 Years", notice: "Immediate", email: "sarah.j@example.com" },
    { id: "3", name: "David Chen", title: "Full Stack Dev", company: "DevWorks", status: "Interviewing", experience: "4 Years", notice: "60 Days", email: "david.chen@example.com" },
  ]);

  const loadCockpitData = async () => {
    try {
      const response = await fetch("/api/v1/cockpit/submissions");
      if (response.ok) {
        const json = await response.json();
        setJobs(json.jobs || []);
        setSubmissions(json.submissions || []);
        setPostings(json.postings || []);
        if (json.jobs && json.jobs.length > 0 && !selectedJobId) {
          setSelectedJobId(json.jobs[0].jobId);
        }
      }
    } catch (err) {
      console.error("Failed to load cockpit database profiles:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadCockpitData();
  }, []);

  const handleBroadcast = async () => {
    if (!selectedJobId) return;
    setBroadcasting(true);
    setBroadcastMessage("");
    setBroadcastSuccess(false);
    try {
      const response = await fetch(`/api/v1/jobs/${selectedJobId}/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selected_boards: selectedBoards }),
      });
      const data = await response.json();
      if (response.ok) {
        setBroadcastSuccess(true);
        setBroadcastMessage("Job mandate successfully broadcast across the selected portals!");
        await loadCockpitData();
        setTimeout(() => {
          setBroadcastModalOpen(false);
          setBroadcastMessage("");
          setBroadcastSuccess(false);
        }, 2000);
      } else {
        throw new Error(data.error || "Failed to broadcast");
      }
    } catch (err: any) {
      setBroadcastSuccess(false);
      setBroadcastMessage(err.message || "An unexpected error occurred.");
    } finally {
      setBroadcasting(false);
    }
  };

  const getSlaStatus = (stage: string, stageUpdatedAtStr: string) => {
    const stageUpdatedAt = new Date(stageUpdatedAtStr);
    const diffMs = Date.now() - stageUpdatedAt.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (stage === "Submitted") {
      if (diffHours >= 72) return { level: "breach", text: `CRITICAL: ${Math.round(diffHours)}h SLA Breached`, hours: diffHours };
      if (diffHours >= 48) return { level: "warning", text: `${Math.round(diffHours)}h in Submitted`, hours: diffHours };
      return { level: "normal", text: `${Math.round(diffHours)}h in Submitted`, hours: diffHours };
    }
    
    if (diffHours >= 24) return { level: "warning", text: `${Math.round(diffHours)}h Stagnant`, hours: diffHours };
    return { level: "normal", text: `${Math.round(diffHours)}h in Stage`, hours: diffHours };
  };

  const handleTriggerChase = async (sub: any) => {
    setChasingId(sub.submissionId);
    try {
      const selectedJob = jobs.find(j => j.jobId === selectedJobId);
      const jobTitle = selectedJob ? selectedJob.title : "the role";
      const response = await fetch("/api/v1/communications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: sub.candidateId,
          channel: "whatsapp",
          body: `Hi ${sub.fullName}, this is Ankit from Apex Recruitment. I sent your profile for ${jobTitle} 3 days ago and wanted to nudge you for updates. Let me know if you are free.`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send chase message");
      }

      alert(`Operational chase notification successfully sent to ${sub.fullName}!`);
      
      // Reset communication timestamp locally
      setSubmissions(prev => prev.map(s => {
        if (s.submissionId === sub.submissionId) {
          return { ...s, lastCommunicationAt: new Date().toISOString() };
        }
        return s;
      }));
    } catch (err: any) {
      alert(`Failed to send chase: ${err.message}`);
    } finally {
      setChasingId(null);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    setUploading(true);
    setFileName(file.name);
    setSaveSuccess(false);

    // Create a local blob URL for the iframe PDF viewer
    const localUrl = URL.createObjectURL(file);
    setPdfUrl(localUrl);

    // Simulated status messages during parsing
    const statuses = [
      "Uploading raw resume stream...",
      "Extracting raw document text...",
      "Analyzing structured entities...",
      "Running semantic validation...",
    ];

    let statusIdx = 0;
    setParsingStatus(statuses[0]);
    const interval = setInterval(() => {
      statusIdx++;
      if (statusIdx < statuses.length) {
        setParsingStatus(statuses[statusIdx]);
      }
    }, 600);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/v1/parser", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Parsing failed");
      }

      const resData = await response.json();
      const parsed: ParsedData = resData.data;

      // Populate form states
      setFullName(parsed.fullName);
      setEmail(parsed.email || "");
      setPhone(parsed.phone || "");
      setSkills(parsed.skills || []);
      setExperienceMonths(parsed.totalExpMonths || 0);
      setNoticePeriod(parsed.noticePeriodDays || 0);
      setCurrentCompany(parsed.currentCompany || "");
      setCurrentTitle(parsed.currentTitle || "");

      // Duplicate check
      setDuplicateDetected(resData.duplicateDetected);
      setDuplicateName(resData.duplicateCandidateName);

      setModalOpen(true);
    } catch (err: any) {
      alert(`Error parsing CV: ${err.message}`);
    } finally {
      setUploading(false);
      setParsingStatus("");
    }
  };

  const addSkillTag = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkillTag = (indexToRemove: number) => {
    setSkills(skills.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        fullName,
        email: email || null,
        phone: phone || null,
        currentCompany: currentCompany || null,
        currentTitle: currentTitle || null,
        skills,
        totalExpMonths: experienceMonths,
        noticePeriodDays: noticePeriod,
      };

      const response = await fetch("/api/v1/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to save candidate");
      }

      const resData = await response.json();
      
      setSaveSuccess(true);
      setSaveMessage(resData.updatedExisting 
        ? `Duplicate check resolved: Successfully updated existing record for ${fullName}!` 
        : `Successfully imported candidate ${fullName}!`);

      // Add to local UI candidates list for visual validation
      if (!resData.updatedExisting) {
        const newCandidate = {
          id: resData.candidateId,
          name: fullName,
          title: currentTitle || "Software Engineer",
          company: currentCompany || "Indie",
          status: "Screened",
          experience: `${Math.round(experienceMonths / 12)} Years`,
          notice: noticePeriod === 0 ? "Immediate" : `${noticePeriod} Days`,
          email: email,
        };
        setCandidates([newCandidate, ...candidates]);
      }

      // Close modal after a short delay to let user see success banner
      setTimeout(() => {
        setModalOpen(false);
        setSaveSuccess(false);
      }, 2000);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Side Navigation Bar */}
      <aside className="flex h-screen w-sidebar-width flex-col fixed left-0 top-0 bg-primary-container z-20">
        <div className="p-gutter flex flex-col gap-stack-sm">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-secondary-container">
              <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                work
              </span>
            </div>
            <div>
              <h1 className="font-headline-md text-[20px] font-bold text-on-primary leading-tight">RecruitPro</h1>
              <p className="text-[12px] text-on-primary-container opacity-70">Enterprise HRMS</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            <Link href="#" className="flex items-center gap-stack-md px-gutter py-stack-md text-on-primary-container hover:bg-on-primary-fixed-variant/5 transition-all duration-200">
              <span className="material-symbols-outlined">dashboard</span>
              <span className="font-label-md">Dashboard</span>
            </Link>
            <Link href="#" className="relative flex items-center gap-stack-md px-gutter py-stack-md text-secondary-container border-l-4 border-secondary-container bg-on-primary-fixed-variant/10 transition-all duration-200">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
              <span className="font-label-md">Candidates</span>
            </Link>
            <Link href="#" className="flex items-center gap-stack-md px-gutter py-stack-md text-on-primary-container hover:bg-on-primary-fixed-variant/5 transition-all duration-200">
              <span className="material-symbols-outlined">event_available</span>
              <span className="font-label-md">Interviews</span>
            </Link>
            <Link href="#" className="flex items-center gap-stack-md px-gutter py-stack-md text-on-primary-container hover:bg-on-primary-fixed-variant/5 transition-all duration-200">
              <span className="material-symbols-outlined">work</span>
              <span className="font-label-md">Jobs</span>
            </Link>
            <Link href="#" className="flex items-center gap-stack-md px-gutter py-stack-md text-on-primary-container hover:bg-on-primary-fixed-variant/5 transition-all duration-200">
              <span className="material-symbols-outlined">assessment</span>
              <span className="font-label-md">Reports</span>
            </Link>
            <Link href="#" className="flex items-center gap-stack-md px-gutter py-stack-md text-on-primary-container hover:bg-on-primary-fixed-variant/5 transition-all duration-200">
              <span className="material-symbols-outlined">settings</span>
              <span className="font-label-md">Settings</span>
            </Link>
          </nav>
        </div>

        {/* Floating Import Actions */}
        <div className="mt-auto p-gutter space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.txt"
            className="hidden"
          />
          <button
            onClick={triggerFileUpload}
            disabled={uploading}
            className="w-full bg-secondary-container text-primary-container font-label-md py-3 rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-all hover:brightness-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
            {uploading ? "Uploading..." : "Import Resume"}
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 ml-sidebar-width flex flex-col min-h-screen">
        {/* Header App Bar */}
        <header className="flex justify-between items-center h-16 px-gutter w-full bg-white border-b border-outline-variant shadow-sm z-10">
          <div className="flex items-center gap-6">
            <h2 className="font-headline-md text-[18px] font-bold text-on-surface">Candidate Central</h2>
            <div className="relative w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-surface text-body-sm border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-container/30 transition-all font-semibold"
                placeholder="Search candidates..."
                type="text"
              />
            </div>

            {/* Dynamic Job Mandate Selector */}
            {jobs.length > 0 && (
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Job Mandate:</span>
                <select 
                  className="bg-surface border border-outline-variant rounded-lg px-3.5 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-secondary-container/30 transition-all text-on-surface bg-white cursor-pointer"
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                >
                  {jobs.map(j => (
                    <option key={j.jobId} value={j.jobId}>
                      {j.clientName || "Inbound"} — {j.title}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setBroadcastModalOpen(true)}
                  className="bg-secondary-container text-primary-container text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 hover:brightness-95 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">podcasts</span>
                  Broadcast Mandate
                </button>

                <button
                  onClick={openPartnerShareModal}
                  className="bg-[#0F172A] text-[#FFD400] text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 hover:brightness-95 active:scale-95 transition-all cursor-pointer border border-[#FFD400]/30 ml-2"
                >
                  <span className="material-symbols-outlined text-[16px]">share</span>
                  Share Mandate
                </button>

                <button
                  onClick={() => setConvertModalOpen(true)}
                  className="bg-amber-400 text-[#0F172A] text-xs font-black px-3 py-2 rounded-lg flex items-center gap-1.5 hover:brightness-95 active:scale-95 transition-all cursor-pointer border border-amber-500 shadow-sm ml-2"
                >
                  <span className="material-symbols-outlined text-[16px]">gavel</span>
                  Owner Conversion
                </button>

                {postings.filter(p => p.jobId === selectedJobId).length > 0 && (
                  <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-emerald-200 animate-in fade-in duration-200">
                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                    Active on: {postings.filter(p => p.jobId === selectedJobId).map(p => p.boardName).join(", ")}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors active:scale-95">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors active:scale-95">
              <span className="material-symbols-outlined">help_outline</span>
            </button>
            <div className="h-8 w-[1px] bg-outline-variant mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden lg:block">
                <p className="text-label-sm text-on-surface font-semibold">Ankit Sharma</p>
                <p className="text-[10px] text-on-surface-variant font-medium">Global Recruiter</p>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-secondary-container p-0.5">
                <div className="w-full h-full rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-sm">
                  AS
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content area */}
        <div className="p-gutter space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* Uploader Drag Zone */}
          <div 
            onClick={triggerFileUpload}
            className="group relative flex flex-col items-center justify-center border-2 border-dashed border-outline-variant rounded-xl bg-white p-8 text-center cursor-pointer transition-all hover:bg-slate-50/50 hover:border-secondary-container"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 group-hover:bg-secondary-container/20 transition-all">
              <span className="material-symbols-outlined text-[24px] text-on-surface-variant group-hover:text-primary-container">
                cloud_upload
              </span>
            </div>
            <h3 className="font-semibold text-on-surface">Drag & Drop candidate resumes here</h3>
            <p className="mt-1 text-xs text-on-surface-variant">
              Supports PDF and TXT formats up to 5MB. Files are automatically parsed using Gemini AI.
            </p>
            {uploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 rounded-xl backdrop-blur-sm z-30">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-outline border-t-secondary-container mb-3"></div>
                <p className="font-semibold text-sm text-primary-container animate-pulse">{parsingStatus}</p>
              </div>
            )}
          </div>

          {/* Kanban / Candidate Board simulation */}
          <div>
            <h3 className="font-headline-md text-[18px] font-bold text-on-surface mb-4">Pipeline Candidates</h3>
            
            {jobs.length > 0 ? (
              /* Database-driven Kanban Board with SLA Radar */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
                {/* Column 1: Screened */}
                <div className="bg-slate-100/50 p-4 rounded-xl border border-outline-variant space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Screened</span>
                    <span className="bg-slate-200 text-on-surface text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {submissions.filter(s => s.jobId === selectedJobId && s.stage.toLowerCase() === "screened").length}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {submissions.filter(s => s.jobId === selectedJobId && s.stage.toLowerCase() === "screened").length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-on-surface-variant border border-dashed border-outline-variant rounded-lg bg-white/20">
                        <span className="material-symbols-outlined text-[20px] text-slate-300 mb-1">inbox</span>
                        No candidates screened
                      </div>
                    ) : (
                      submissions
                        .filter(s => s.jobId === selectedJobId && s.stage.toLowerCase() === "screened")
                        .map(s => ({ ...s, sla: getSlaStatus(s.stage, s.stageUpdatedAt) }))
                        .sort((a, b) => b.sla.hours - a.sla.hours)
                        .map(s => {
                          const isWarning = s.sla.level === "warning";
                          return (
                            <div 
                              key={s.submissionId} 
                              className={`bg-white border rounded-lg p-4 shadow-sm space-y-3 transition-all relative group ${
                                isWarning 
                                  ? "border-amber-400 ring-2 ring-amber-50" 
                                  : "border-outline-variant hover:border-slate-300"
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0">
                                  <h4 className="font-semibold text-on-surface text-sm truncate">{s.fullName}</h4>
                                  <p className="text-xs text-on-surface-variant truncate">{s.currentTitle} at {s.currentCompany || "Freelance"}</p>
                                </div>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                                  isWarning ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                                }`}>
                                  {s.sla.text}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2 text-[10px]">
                                <span className="bg-slate-100 text-on-surface-variant px-2 py-0.5 rounded font-medium">
                                  {s.totalExpMonths ? `${Math.round(s.totalExpMonths / 12)} Yrs` : "N/A Exp"}
                                </span>
                                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">
                                  {s.noticePeriodDays}d Notice
                                </span>
                              </div>
                              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px]">
                                <span className="text-slate-400 truncate">
                                  Sent: {new Date(s.stageUpdatedAt).toLocaleDateString()}
                                </span>
                                <button
                                  onClick={() => handleTriggerChase(s)}
                                  disabled={chasingId === s.submissionId}
                                  className="text-primary-container font-extrabold flex items-center gap-1 hover:underline cursor-pointer disabled:opacity-50"
                                >
                                  <span className="material-symbols-outlined text-[12px]">send</span>
                                  {chasingId === s.submissionId ? "Chasing..." : "Trigger Chase"}
                                </button>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>

                {/* Column 2: Submitted to Client */}
                <div className="bg-slate-100/50 p-4 rounded-xl border border-outline-variant space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Submitted to Client</span>
                    <span className="bg-slate-200 text-on-surface text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {submissions.filter(s => s.jobId === selectedJobId && s.stage.toLowerCase() === "submitted").length}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {submissions.filter(s => s.jobId === selectedJobId && s.stage.toLowerCase() === "submitted").length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-on-surface-variant border border-dashed border-outline-variant rounded-lg bg-white/20">
                        <span className="material-symbols-outlined text-[20px] text-slate-300 mb-1">inbox</span>
                        No candidates submitted
                      </div>
                    ) : (
                      submissions
                        .filter(s => s.jobId === selectedJobId && s.stage.toLowerCase() === "submitted")
                        .map(s => ({ ...s, sla: getSlaStatus(s.stage, s.stageUpdatedAt) }))
                        .sort((a, b) => b.sla.hours - a.sla.hours)
                        .map(s => {
                          const isBreached = s.sla.level === "breach";
                          const isWarning = s.sla.level === "warning";
                          return (
                            <div 
                              key={s.submissionId} 
                              className={`bg-white border rounded-lg p-4 shadow-sm space-y-3 transition-all relative group ${
                                isBreached 
                                  ? "border-red-400 ring-2 ring-red-100 shadow-red-50" 
                                  : isWarning 
                                    ? "border-amber-400 ring-2 ring-amber-50" 
                                    : "border-outline-variant hover:border-slate-300"
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0">
                                  <h4 className="font-semibold text-on-surface text-sm truncate">{s.fullName}</h4>
                                  <p className="text-xs text-on-surface-variant truncate">{s.currentTitle} at {s.currentCompany || "Freelance"}</p>
                                </div>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                                  isBreached 
                                    ? "bg-red-100 text-red-700 animate-pulse" 
                                    : isWarning 
                                      ? "bg-amber-100 text-amber-700" 
                                      : "bg-slate-100 text-slate-600"
                                }`}>
                                  {s.sla.text}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2 text-[10px]">
                                <span className="bg-slate-100 text-on-surface-variant px-2 py-0.5 rounded font-medium">
                                  {s.totalExpMonths ? `${Math.round(s.totalExpMonths / 12)} Yrs` : "N/A Exp"}
                                </span>
                                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">
                                  {s.noticePeriodDays}d Notice
                                </span>
                              </div>
                              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px]">
                                <span className="text-slate-400 truncate">
                                  Sent: {new Date(s.stageUpdatedAt).toLocaleDateString()}
                                </span>
                                <button
                                  onClick={() => handleTriggerChase(s)}
                                  disabled={chasingId === s.submissionId}
                                  className="text-primary-container font-extrabold flex items-center gap-1 hover:underline cursor-pointer disabled:opacity-50"
                                >
                                  <span className="material-symbols-outlined text-[12px]">send</span>
                                  {chasingId === s.submissionId ? "Chasing..." : "Trigger Chase"}
                                </button>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>

                {/* Column 3: Interviewing */}
                <div className="bg-slate-100/50 p-4 rounded-xl border border-outline-variant space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Interviewing</span>
                    <span className="bg-slate-200 text-on-surface text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {submissions.filter(s => s.jobId === selectedJobId && s.stage.toLowerCase() === "interviewing").length}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {submissions.filter(s => s.jobId === selectedJobId && s.stage.toLowerCase() === "interviewing").length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-on-surface-variant border border-dashed border-outline-variant rounded-lg bg-white/20">
                        <span className="material-symbols-outlined text-[20px] text-slate-300 mb-1">inbox</span>
                        No candidates in interview
                      </div>
                    ) : (
                      submissions
                        .filter(s => s.jobId === selectedJobId && s.stage.toLowerCase() === "interviewing")
                        .map(s => ({ ...s, sla: getSlaStatus(s.stage, s.stageUpdatedAt) }))
                        .sort((a, b) => b.sla.hours - a.sla.hours)
                        .map(s => {
                          const isWarning = s.sla.level === "warning";
                          return (
                            <div 
                              key={s.submissionId} 
                              className={`bg-white border rounded-lg p-4 shadow-sm space-y-3 transition-all relative group ${
                                isWarning 
                                  ? "border-amber-400 ring-2 ring-amber-50" 
                                  : "border-outline-variant hover:border-slate-300"
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0">
                                  <h4 className="font-semibold text-on-surface text-sm truncate">{s.fullName}</h4>
                                  <p className="text-xs text-on-surface-variant truncate">{s.currentTitle} at {s.currentCompany || "Freelance"}</p>
                                </div>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                                  isWarning ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                                }`}>
                                  {s.sla.text}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2 text-[10px]">
                                <span className="bg-slate-100 text-on-surface-variant px-2 py-0.5 rounded font-medium">
                                  {s.totalExpMonths ? `${Math.round(s.totalExpMonths / 12)} Yrs` : "N/A Exp"}
                                </span>
                                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">
                                  {s.noticePeriodDays}d Notice
                                </span>
                              </div>
                              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px]">
                                <span className="text-slate-400 truncate">
                                  Sent: {new Date(s.stageUpdatedAt).toLocaleDateString()}
                                </span>
                                <button
                                  onClick={() => handleTriggerChase(s)}
                                  disabled={chasingId === s.submissionId}
                                  className="text-primary-container font-extrabold flex items-center gap-1 hover:underline cursor-pointer disabled:opacity-50"
                                >
                                  <span className="material-symbols-outlined text-[12px]">send</span>
                                  {chasingId === s.submissionId ? "Chasing..." : "Trigger Chase"}
                                </button>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Fallback static demo list when no database seeds are present */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1: Screened */}
                <div className="bg-slate-100/50 p-4 rounded-xl border border-outline-variant space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Screened</span>
                    <span className="bg-slate-200 text-on-surface text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {candidates.filter(c => c.status === "Screened").length}
                    </span>
                  </div>
                  {candidates.filter(c => c.status === "Screened").map(c => (
                    <div key={c.id} className="bg-white border border-outline-variant rounded-lg p-4 shadow-sm space-y-3">
                      <div>
                        <h4 className="font-semibold text-on-surface text-sm">{c.name}</h4>
                        <p className="text-xs text-on-surface-variant">{c.title}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[10px]">
                        <span className="bg-slate-100 text-on-surface-variant px-2 py-0.5 rounded font-medium">{c.experience}</span>
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">{c.notice} Notice</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Column 2: Interviewing */}
                <div className="bg-slate-100/50 p-4 rounded-xl border border-outline-variant space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Interviewing</span>
                    <span className="bg-slate-200 text-on-surface text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {candidates.filter(c => c.status === "Interviewing").length}
                    </span>
                  </div>
                  {candidates.filter(c => c.status === "Interviewing").map(c => (
                    <div key={c.id} className="bg-white border border-outline-variant rounded-lg p-4 shadow-sm space-y-3">
                      <div>
                        <h4 className="font-semibold text-on-surface text-sm">{c.name}</h4>
                        <p className="text-xs text-on-surface-variant">{c.title}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[10px]">
                        <span className="bg-slate-100 text-on-surface-variant px-2 py-0.5 rounded font-medium">{c.experience}</span>
                        <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-medium">{c.notice} Notice</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Column 3: Submitted */}
                <div className="bg-slate-100/50 p-4 rounded-xl border border-outline-variant space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Submitted to Client</span>
                    <span className="bg-slate-200 text-on-surface text-[10px] font-bold px-2 py-0.5 rounded-full">0</span>
                  </div>
                  <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-on-surface-variant border border-dashed border-outline-variant rounded-lg bg-white/20">
                    <span className="material-symbols-outlined text-[20px] text-slate-300 mb-1">inbox</span>
                    No candidates in review
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL OVERLAY: Resume Parsing & Duplicate Check */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 modal-overlay">
          <div className="bg-white w-full max-w-6xl h-full max-h-[850px] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="bg-primary-container px-gutter py-stack-md flex justify-between items-center text-on-primary">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary-container">rule</span>
                <h2 className="font-headline-md text-[20px] font-semibold">Resume Parsing &amp; Duplicate Check</h2>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Success / Duplicate Notification Banner */}
            {saveSuccess ? (
              <div className="bg-emerald-50 border-b border-emerald-100 px-gutter py-3 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center animate-bounce">
                  <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'wght' 700" }}>check</span>
                </div>
                <p className="text-emerald-800 font-label-md font-semibold">{saveMessage}</p>
              </div>
            ) : duplicateDetected ? (
              <div className="bg-amber-50 border-b border-amber-100 px-gutter py-3 flex items-center gap-3 animate-pulse">
                <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'wght' 700" }}>warning</span>
                </div>
                <p className="text-amber-800 font-label-md font-semibold">
                  Duplicate Detected: Email/Phone already exists under candidate &quot;{duplicateName}&quot;. Confirm &amp; Save will update their profile.
                </p>
              </div>
            ) : (
              <div className="bg-emerald-50 border-b border-emerald-100 px-gutter py-3 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'wght' 700" }}>check</span>
                </div>
                <p className="text-emerald-800 font-label-md font-semibold">Duplicate Check Passed - Record Created</p>
              </div>
            )}

            {/* Modal Content Split View */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Side: Document Preview (50%) */}
              <div className="w-1/2 bg-slate-100 border-r border-outline-variant flex flex-col">
                <div className="p-4 flex justify-between items-center bg-white border-b border-outline-variant">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                    <span className="text-label-sm font-semibold text-on-surface-variant truncate max-w-xs">{fileName}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1 hover:bg-slate-100 rounded text-on-surface-variant">
                      <span className="material-symbols-outlined text-[20px]">zoom_in</span>
                    </button>
                    <button className="p-1 hover:bg-slate-100 rounded text-on-surface-variant">
                      <span className="material-symbols-outlined text-[20px]">zoom_out</span>
                    </button>
                    {pdfUrl && (
                      <a 
                        href={pdfUrl} 
                        download={fileName} 
                        className="p-1 hover:bg-slate-100 rounded text-on-surface-variant"
                      >
                        <span className="material-symbols-outlined text-[20px]">file_download</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex-1 p-0.5 bg-slate-200">
                  {pdfUrl ? (
                    <iframe 
                      src={`${pdfUrl}#toolbar=0&navpanes=0`} 
                      className="w-full h-full border-none" 
                      title="PDF Document Viewer"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-on-surface-variant">
                      Preview unavailable
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Structured Data (50%) */}
              <div className="w-1/2 p-10 overflow-y-auto custom-scrollbar flex flex-col bg-white">
                <div className="mb-8">
                  <h3 className="font-headline-md text-[18px] text-on-surface mb-1 font-bold">Extracted Information</h3>
                  <p className="text-body-sm text-on-surface-variant">Review and verify the data parsed from the resume.</p>
                </div>
                <form className="space-y-6 flex-1" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 gap-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wide">Full Name</label>
                      <div className="relative">
                        <input 
                          className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary-container/20 focus:border-primary-container outline-none transition-all text-sm font-semibold"
                          type="text" 
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          check_circle
                        </span>
                      </div>
                    </div>

                    {/* Primary Skills */}
                    <div className="space-y-2">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wide">Primary Skills</label>
                      <div className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg flex flex-wrap gap-2 items-center">
                        {skills.map((skill, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 bg-primary-container text-on-primary px-3 py-1 rounded text-xs font-semibold">
                            {skill}
                            <span 
                              onClick={() => removeSkillTag(idx)} 
                              className="material-symbols-outlined text-[14px] cursor-pointer hover:text-secondary-container"
                            >
                              close
                            </span>
                          </span>
                        ))}
                        <div className="flex items-center gap-1 ml-1">
                          <input 
                            type="text" 
                            placeholder="Add tag..." 
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addSkillTag();
                              }
                            }}
                            className="bg-transparent border-none text-xs outline-none py-1 w-20 placeholder-slate-400 focus:ring-0"
                          />
                          <button 
                            type="button" 
                            onClick={addSkillTag}
                            className="text-primary-container text-xs font-bold hover:underline"
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Experience & Notice Period */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wide">Experience (Months)</label>
                        <div className="relative">
                          <input 
                            className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary-container/20 focus:border-primary-container outline-none transition-all text-sm font-semibold"
                            type="number" 
                            value={experienceMonths}
                            onChange={(e) => setExperienceMonths(parseInt(e.target.value, 10) || 0)}
                          />
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                            calendar_today
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wide">Notice Period (Days)</label>
                        <div className="relative">
                          <input 
                            className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary-container/20 focus:border-primary-container outline-none transition-all text-sm font-semibold"
                            type="number" 
                            value={noticePeriod}
                            onChange={(e) => setNoticePeriod(parseInt(e.target.value, 10) || 0)}
                          />
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                            timer
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Company & Title */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wide">Current Company</label>
                        <input 
                          className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary-container/20 focus:border-primary-container outline-none transition-all text-sm font-semibold"
                          type="text" 
                          value={currentCompany}
                          onChange={(e) => setCurrentCompany(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wide">Current Designation</label>
                        <input 
                          className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary-container/20 focus:border-primary-container outline-none transition-all text-sm font-semibold"
                          type="text" 
                          value={currentTitle}
                          onChange={(e) => setCurrentTitle(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wide">Candidate Email</label>
                      <input 
                        className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary-container/20 focus:border-primary-container outline-none transition-all text-sm font-semibold"
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </form>

                {/* Footer Buttons */}
                <div className="mt-auto pt-10 border-t border-outline-variant flex justify-between items-center">
                  <button 
                    type="button"
                    onClick={() => alert("Re-scanning currently repeats parser execution.")}
                    className="text-on-surface-variant font-label-md hover:text-primary transition-colors font-bold"
                  >
                    Re-scan Document
                  </button>
                  <div className="flex gap-4">
                    <button 
                      type="button" 
                      onClick={() => setModalOpen(false)}
                      className="px-6 py-3 border border-primary-container text-primary-container font-label-md rounded-lg hover:bg-slate-50 transition-colors active:scale-95 font-semibold"
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      onClick={handleSave}
                      disabled={saving}
                      className="px-8 py-3 bg-secondary-container text-primary-container font-label-md rounded-lg hover:brightness-95 shadow-md active:scale-95 transition-all font-bold disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Confirm & Save"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL OVERLAY: Job Board Broadcast Modal */}
      {broadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 modal-overlay">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="bg-primary-container px-6 py-4 flex justify-between items-center text-on-primary">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary-container">podcasts</span>
                <h2 className="font-headline-md text-[18px] font-bold">Broadcast Mandate to External Portals</h2>
              </div>
              <button 
                onClick={() => setBroadcastModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors text-white cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Select the external portals to broadcast the current job mandate. The system formats and publishes the posting concurrently using active agency credentials.
              </p>

              {/* Success / Error notification banner */}
              {broadcastMessage && (
                <div className={`p-3 rounded text-xs font-semibold flex items-center gap-2 ${
                  broadcastSuccess ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : "bg-red-50 text-red-800 border border-red-100"
                }`}>
                  <span className="material-symbols-outlined text-[16px]">
                    {broadcastSuccess ? "check_circle" : "error"}
                  </span>
                  {broadcastMessage}
                </div>
              )}

              {/* Integration Toggle Cards */}
              <div className="space-y-3">
                {/* Naukri */}
                <div 
                  onClick={() => {
                    setSelectedBoards(prev => 
                      prev.includes("Naukri") ? prev.filter(b => b !== "Naukri") : [...prev, "Naukri"]
                    );
                  }}
                  className={`border rounded-xl p-4 flex justify-between items-center cursor-pointer transition-all hover:bg-slate-50 ${
                    selectedBoards.includes("Naukri") ? "border-amber-400 bg-amber-50/10 ring-2 ring-amber-50" : "border-outline-variant"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center font-black text-sky-700 text-sm">
                      N
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-on-surface">Naukri.com</p>
                      <p className="text-[10px] text-on-surface-variant font-medium">Connected - Account #8412</p>
                    </div>
                  </div>
                  {selectedBoards.includes("Naukri") ? (
                    <div className="w-5 h-5 rounded-full bg-[#FFD400] flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary-container text-[12px] font-black">check</span>
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-outline-variant"></div>
                  )}
                </div>

                {/* Bayt */}
                <div 
                  onClick={() => {
                    setSelectedBoards(prev => 
                      prev.includes("Bayt") ? prev.filter(b => b !== "Bayt") : [...prev, "Bayt"]
                    );
                  }}
                  className={`border rounded-xl p-4 flex justify-between items-center cursor-pointer transition-all hover:bg-slate-50 ${
                    selectedBoards.includes("Bayt") ? "border-amber-400 bg-amber-50/10 ring-2 ring-amber-50" : "border-outline-variant"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center font-black text-green-700 text-sm">
                      B
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-on-surface">Bayt.com</p>
                      <p className="text-[10px] text-on-surface-variant font-medium">Connected - Gulf Region</p>
                    </div>
                  </div>
                  {selectedBoards.includes("Bayt") ? (
                    <div className="w-5 h-5 rounded-full bg-[#FFD400] flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary-container text-[12px] font-black">check</span>
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-outline-variant"></div>
                  )}
                </div>

                {/* LinkedIn */}
                <div 
                  onClick={() => {
                    setSelectedBoards(prev => 
                      prev.includes("LinkedIn") ? prev.filter(b => b !== "LinkedIn") : [...prev, "LinkedIn"]
                    );
                  }}
                  className={`border rounded-xl p-4 flex justify-between items-center cursor-pointer transition-all hover:bg-slate-50 ${
                    selectedBoards.includes("LinkedIn") ? "border-amber-400 bg-amber-50/10 ring-2 ring-amber-50" : "border-outline-variant"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center font-black text-blue-700 text-sm">
                      in
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-on-surface">LinkedIn Jobs</p>
                      <p className="text-[10px] text-on-surface-variant font-medium">Connected</p>
                    </div>
                  </div>
                  {selectedBoards.includes("LinkedIn") ? (
                    <div className="w-5 h-5 rounded-full bg-[#FFD400] flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary-container text-[12px] font-black">check</span>
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-outline-variant"></div>
                  )}
                </div>
              </div>

              {/* Bottom CTA Button */}
              <button
                onClick={handleBroadcast}
                disabled={broadcasting || selectedBoards.length === 0}
                className="w-full bg-[#FFD400] text-primary-container font-extrabold py-3.5 rounded-lg hover:brightness-95 active:scale-95 transition-all shadow-md text-xs tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {broadcasting ? "Publishing Mandate..." : `Publish Mandate across ${selectedBoards.length} Job Boards`}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL OVERLAY: Masking Configuration Drawer/Modal (PO-01) */}
      {partnerShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 modal-overlay">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="bg-[#0F172A] px-6 py-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#FFD400]">share</span>
                <h2 className="font-headline-md text-[18px] font-bold text-[#FFD400]">Share Mandate with Partner Network</h2>
              </div>
              <button 
                onClick={() => setPartnerShareModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors text-white cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh] custom-scrollbar">
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Create an anonymized magic link to collaborate with external sourcers. All client identity, direct contact details, and sensitive metrics will be stripped from the public partner workspace.
              </p>

              {shareSuccessMessage && (
                <div className={`p-3 rounded text-xs font-semibold flex items-center gap-2 ${
                  generatedMagicLink ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : "bg-red-50 text-red-800 border border-red-100"
                }`}>
                  <span className="material-symbols-outlined text-[16px]">
                    {generatedMagicLink ? "check_circle" : "error"}
                  </span>
                  {shareSuccessMessage}
                </div>
              )}

              {generatedMagicLink ? (
                /* Display Generated Magic Link */
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3 animate-in fade-in duration-300">
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-emerald-600 text-[16px]">vpn_key</span>
                    Magic Collaboration Link Generated
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Send this encrypted link to your partner. They will access the masked mandate details and CV dropzone without requiring an account.
                  </p>
                  <div className="flex gap-2">
                    <input 
                      readOnly 
                      value={generatedMagicLink} 
                      className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs flex-1 outline-none text-slate-600 font-mono select-all" 
                    />
                    <button 
                      onClick={() => { 
                        navigator.clipboard.writeText(generatedMagicLink); 
                        alert("Magic link copied to clipboard!"); 
                      }} 
                      className="bg-[#0F172A] text-[#FFD400] px-4 py-2 text-xs font-bold rounded-lg hover:brightness-95 active:scale-95 transition-all cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ) : (
                /* Form Inputs */
                <div className="space-y-4">
                  {/* Readonly Actual Client */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Actual Client Name (Confidential)</label>
                    <input 
                      readOnly 
                      value={jobs.find(j => j.jobId === selectedJobId)?.clientName || "Apex Clients"} 
                      className="w-full px-3.5 py-2.5 bg-slate-100 border border-outline-variant rounded-lg text-xs font-semibold text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  {/* Masked Public Title */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Masked Public Title (Visible to Partner)</label>
                    <input 
                      type="text" 
                      value={maskedTitle} 
                      onChange={(e) => setMaskedTitle(e.target.value)} 
                      placeholder="e.g. Leading Tier-1 FinTech Platform"
                      className="w-full px-3.5 py-2.5 bg-white border border-outline-variant rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-secondary-container/20 transition-all text-on-surface"
                    />
                  </div>

                  {/* Masked Description */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Masked Description</label>
                    <textarea 
                      rows={3}
                      value={maskedDesc} 
                      onChange={(e) => setMaskedDesc(e.target.value)} 
                      placeholder="Anonymized description of the company and role requirements..."
                      className="w-full px-3.5 py-2.5 bg-white border border-outline-variant rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-secondary-container/20 transition-all text-on-surface resize-none"
                    />
                  </div>

                  {/* Partner Identity */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Partner Email (Magic Dispatch)</label>
                      <input 
                        type="email" 
                        value={partnerEmail} 
                        onChange={(e) => setPartnerEmail(e.target.value)} 
                        placeholder="partner@sourcers.com"
                        className="w-full px-3.5 py-2.5 bg-white border border-outline-variant rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-secondary-container/20 transition-all text-on-surface"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Partner Name (Optional)</label>
                      <input 
                        type="text" 
                        value={partnerName} 
                        onChange={(e) => setPartnerName(e.target.value)} 
                        placeholder="John Sourcer"
                        className="w-full px-3.5 py-2.5 bg-white border border-outline-variant rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-secondary-container/20 transition-all text-on-surface"
                      />
                    </div>
                  </div>

                  {/* Split Fee */}
                  <div className="bg-slate-50 border border-outline-variant rounded-xl p-4 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">Split Fee Agreement</span>
                      <span className="font-black text-[#0F172A] bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                        {100 - partnerSplit}% Agency / {partnerSplit}% Partner
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="90" 
                      step="5"
                      value={partnerSplit} 
                      onChange={(e) => setPartnerSplit(Number(e.target.value))} 
                      className="w-full accent-[#0F172A] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                      <span>90% Agency / 10% Partner</span>
                      <span>10% Agency / 90% Partner</span>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleCreatePartnerShare}
                    disabled={sharingJob || !partnerEmail || !maskedTitle}
                    className="w-full bg-[#FFD400] text-primary-container font-extrabold py-3.5 rounded-lg hover:brightness-95 active:scale-95 transition-all shadow-md text-xs tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {sharingJob ? "Generating Magic Vault..." : "Generate Encrypted Partner Link"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL OVERLAY: Convert Inbound Hiring Mandate (AS-02 Locked Rule) */}
      {convertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 modal-overlay">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="bg-[#0F172A] px-6 py-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#FFD400]">gavel</span>
                <div>
                  <h2 className="font-headline-md text-[16px] font-bold text-[#FFD400]">Convert Inbound Hiring Mandate</h2>
                  <p className="text-[10px] text-slate-400">AS-02 Locked Owner Verification & Intake Approval</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-amber-400/30">
                  Owner Restricted
                </span>
                <button 
                  onClick={() => setConvertModalOpen(false)}
                  className="p-1 hover:bg-white/10 rounded transition-colors text-white cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh] custom-scrollbar">
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Review and approve inbound client intake requirements. Upon owner acceptance, the system automatically creates the client account record and dispatches onboarding packages via Email & WhatsApp.
              </p>

              {convertSuccessMsg && (
                <div className={`p-3 rounded text-xs font-semibold flex items-center gap-2 ${
                  convertSuccessMsg.startsWith("Error") ? "bg-red-50 text-red-800 border border-red-100" : "bg-emerald-50 text-emerald-800 border border-emerald-100"
                }`}>
                  <span className="material-symbols-outlined text-[16px]">
                    {convertSuccessMsg.startsWith("Error") ? "error" : "check_circle"}
                  </span>
                  {convertSuccessMsg}
                </div>
              )}

              {/* Submission Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inbound Client</span>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {jobs.find(j => j.jobId === selectedJobId)?.clientName || "Apex Cloud Labs"}
                    </h3>
                  </div>
                  <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                    Status: {jobs.find(j => j.jobId === selectedJobId)?.status || "Unreviewed Inbound"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-200/60">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Role Requirement</span>
                    <span className="font-bold text-slate-800">
                      {jobs.find(j => j.jobId === selectedJobId)?.title || "Sr Backend Lead"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Selected Term</span>
                    <span className="font-bold text-amber-700">
                      {jobs.find(j => j.jobId === selectedJobId)?.selectedTerms || "Priority Retainer (5% Upfront)"}
                    </span>
                  </div>
                </div>

                <div className="text-xs pt-1 border-t border-slate-200/60 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-[16px]">contacts</span>
                  <span className="text-slate-600">
                    HR Contact: <strong className="text-slate-800">{jobs.find(j => j.jobId === selectedJobId)?.primaryHrName || "Alex"}</strong> ({jobs.find(j => j.jobId === selectedJobId)?.primaryHrEmail || "alex@client.com"})
                  </span>
                </div>
              </div>

              {/* Commercial Fee Setup */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Agreed Commercial Fee Percentage (%)</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="number" 
                    step="0.01"
                    value={agreedFee} 
                    onChange={(e) => setAgreedFee(e.target.value)} 
                    className="w-32 px-3.5 py-2.5 bg-white border border-outline-variant rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-secondary-container/20 transition-all text-on-surface"
                  />
                  <span className="text-xs text-slate-500 font-semibold">% of Annual CTC</span>
                </div>
              </div>

              {/* Primary CTA */}
              <button
                onClick={handleConvertInboundMandate}
                disabled={converting}
                className="w-full bg-[#FFD400] text-primary-container font-extrabold py-3.5 rounded-lg hover:brightness-95 active:scale-95 transition-all shadow-md text-xs tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {converting ? "Processing Account Onboarding..." : "Approve Mandate & Send Client Onboarding Package"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
