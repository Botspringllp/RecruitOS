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
  
  // Silver Medalist & Relational Mapping States
  const [silverMedalists, setSilverMedalists] = useState<any[]>([]);
  const [loadingSilver, setLoadingSilver] = useState(false);
  const [allCandidates, setAllCandidates] = useState<any[]>([]);
  const [selectedCandidateForLinks, setSelectedCandidateForLinks] = useState<string>("");
  const [relationalLinks, setRelationalLinks] = useState<any[]>([]);
  const [relatedCandidateId, setRelatedCandidateId] = useState<string>("");
  const [relationshipType, setRelationshipType] = useState<string>("SPOUSE");
  const [inheritedLocation, setInheritedLocation] = useState<string>("");
  const [linkingCandidate, setLinkingCandidate] = useState(false);

  // Workflow 3: Daily Cockpit Execution & Communication States (RC-01 & RC-03)
  const [dailyQueueSummary, setDailyQueueSummary] = useState<any>(null);
  const [dailyTasks, setDailyTasks] = useState<any[]>([]);
  const [viewModeRole, setViewModeRole] = useState<string>("my_queue"); // 'my_queue' | 'agency_aggregate'
  const [selectedSubmissionForTimeline, setSelectedSubmissionForTimeline] = useState<any>(null);
  const [timelineLogs, setTimelineLogs] = useState<any[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [customMessageBody, setCustomMessageBody] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<"WHATSAPP" | "EMAIL">("WHATSAPP");
  const [sendingCommunication, setSendingCommunication] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [chasingId, setChasingId] = useState<string | null>(null);
  const [generatingClientToken, setGeneratingClientToken] = useState(false);

  // Workflow 5: Stage-Gate Enforcement & Interview Outcome states
  const [stageGateModalOpen, setStageGateModalOpen] = useState(false);
  const [targetSubmissionForGate, setTargetSubmissionForGate] = useState<any>(null);
  const [targetStageForGate, setTargetStageForGate] = useState("Offered");
  const [selectedOutcomeStatus, setSelectedOutcomeStatus] = useState("Completed");
  const [outcomeNotes, setOutcomeNotes] = useState("");
  const [isOwnerOverrideToggle, setIsOwnerOverrideToggle] = useState(false);
  const [submittingGateAction, setSubmittingGateAction] = useState(false);

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

  const fetchAllCandidates = async () => {
    try {
      const res = await fetch("/api/v1/candidates");
      if (res.ok) {
        const json = await res.json();
        setAllCandidates(json.candidates || []);
      }
    } catch (e) {
      console.error("Error fetching all candidates:", e);
    }
  };

  const fetchSilverMedalists = async (jobId: string) => {
    if (!jobId) return;
    setLoadingSilver(true);
    try {
      const res = await fetch(`/api/v1/cockpit/mandates/${jobId}/silver-medalists`);
      if (res.ok) {
        const json = await res.json();
        setSilverMedalists(json.silverMedalists || []);
      }
    } catch (e) {
      console.error("Error fetching silver medalists:", e);
    } finally {
      setLoadingSilver(false);
    }
  };

  const fetchRelationalLinks = async (candId: string) => {
    if (!candId) {
      setRelationalLinks([]);
      return;
    }
    try {
      const res = await fetch(`/api/v1/candidates/${candId}/links`);
      if (res.ok) {
        const json = await res.json();
        setRelationalLinks(json.links || []);
      }
    } catch (e) {
      console.error("Error fetching relational links:", e);
    }
  };

  const handleRecycleCandidate = async (candidateId: string) => {
    if (!selectedJobId || !candidateId) return;
    try {
      const res = await fetch(`/api/v1/cockpit/mandates/${selectedJobId}/silver-medalists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId })
      });
      if (res.ok) {
        alert("Candidate recycled successfully!");
        await loadCockpitData();
        await fetchSilverMedalists(selectedJobId);
      } else {
        const json = await res.json();
        alert(`Error recycling candidate: ${json.error}`);
      }
    } catch (e: any) {
      alert(`Recycling error: ${e.message}`);
    }
  };

  const handleCreateRelationalLink = async () => {
    if (!selectedCandidateForLinks || !relatedCandidateId) {
      alert("Please select both candidates!");
      return;
    }
    setLinkingCandidate(true);
    try {
      const res = await fetch(`/api/v1/candidates/${selectedCandidateForLinks}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          relatedCandidateId,
          relationshipType,
          inheritedTargetLocation: inheritedLocation
        })
      });
      if (res.ok) {
        alert("Relational link created successfully and tags synced!");
        await fetchRelationalLinks(selectedCandidateForLinks);
        await fetchAllCandidates();
        setRelatedCandidateId("");
        setInheritedLocation("");
      } else {
        const json = await res.json();
        alert(`Error: ${json.error}`);
      }
    } catch (e: any) {
      alert(`Linking error: ${e.message}`);
    } finally {
      setLinkingCandidate(false);
    }
  };

  const fetchDailyQueue = async (mode: string = viewModeRole) => {
    try {
      const res = await fetch(`/api/v1/cockpit/daily-queue?viewMode=${mode}`);
      if (res.ok) {
        const json = await res.json();
        setDailyQueueSummary(json.summary || null);
        setDailyTasks(json.dailyTasks || []);
      }
    } catch (e) {
      console.error("Error fetching daily queue:", e);
    }
  };

  const fetchTimelineLogs = async (sub: any) => {
    if (!sub) return;
    setLoadingTimeline(true);
    try {
      const res = await fetch(`/api/v1/communications/logs?submissionId=${sub.submissionId}&candidateId=${sub.candidateId}`);
      if (res.ok) {
        const json = await res.json();
        setTimelineLogs(json.logs || []);
      }
    } catch (e) {
      console.error("Error fetching timeline logs:", e);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const handleDispatchTemplateMessage = async (templateText?: string) => {
    if (!selectedSubmissionForTimeline) return;
    const bodyToSend = templateText || customMessageBody;
    if (!bodyToSend.trim()) return;

    setSendingCommunication(true);
    try {
      const res = await fetch("/api/v1/communications/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selectedSubmissionForTimeline.submissionId,
          candidateId: selectedSubmissionForTimeline.candidateId,
          channel: selectedChannel,
          messageBody: bodyToSend,
        }),
      });
      if (res.ok) {
        setCustomMessageBody("");
        await fetchTimelineLogs(selectedSubmissionForTimeline);
        await loadCockpitData();
        await fetchDailyQueue();
      } else {
        const json = await res.json();
        alert(`Error dispatching message: ${json.error}`);
      }
    } catch (e: any) {
      alert(`Dispatch error: ${e.message}`);
    } finally {
      setSendingCommunication(false);
    }
  };

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

  const handleGenerateClientPortalLink = async () => {
    if (!selectedJobId) return;
    try {
      setGeneratingClientToken(true);
      const res = await fetch(`/api/v1/jobs/${selectedJobId}/client-portal-token`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.reviewUrl) {
        await navigator.clipboard.writeText(data.reviewUrl);
        alert(`✔ Zero-Login Client Portal Magic Link Generated & Copied to Clipboard!\n\nLink: ${data.reviewUrl}\nExpires: 14 Days Policy`);
      } else {
        alert(`Error: ${data.error || "Failed to generate link"}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setGeneratingClientToken(false);
    }
  };

  const handleAttemptStageChange = async (submission: any, targetStage: string) => {
    try {
      const res = await fetch(`/api/v1/submissions/${submission.submissionId}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetStage }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`✔ Candidate stage updated to '${targetStage}'!`);
        await loadCockpitData();
      } else if (res.status === 403 && data.code === "STAGE_GATE_BLOCKED") {
        // Trigger Stage Gate Enforcement Modal
        setTargetSubmissionForGate(submission);
        setTargetStageForGate(targetStage);
        setStageGateModalOpen(true);
      } else {
        alert(`Error: ${data.error || "Failed to update stage"}`);
      }
    } catch (err: any) {
      alert(`Stage transition error: ${err.message}`);
    }
  };

  const handleSaveInterviewOutcomeAndAdvance = async () => {
    if (!targetSubmissionForGate) return;
    try {
      setSubmittingGateAction(true);

      if (!isOwnerOverrideToggle) {
        // Record Explicit Interview Outcome First
        const outcomeRes = await fetch(`/api/v1/submissions/${targetSubmissionForGate.submissionId}/interview-outcome`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            outcomeStatus: selectedOutcomeStatus,
            notes: outcomeNotes,
          }),
        });

        if (!outcomeRes.ok) {
          const outcomeData = await outcomeRes.json();
          throw new Error(outcomeData.error || "Failed to log interview outcome");
        }
      }

      // Now Attempt Stage Progression (With Owner Override if selected)
      const stageRes = await fetch(`/api/v1/submissions/${targetSubmissionForGate.submissionId}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetStage: targetStageForGate,
          isOwnerOverride: isOwnerOverrideToggle,
          overrideReason: outcomeNotes || "Owner Discretion Override",
        }),
      });

      const stageData = await stageRes.json();
      if (!stageRes.ok) throw new Error(stageData.error || "Stage update failed");

      alert(`✔ ${stageData.message}`);
      setStageGateModalOpen(false);
      await loadCockpitData();
    } catch (err: any) {
      alert(`Stage Gate Error: ${err.message}`);
    } finally {
      setSubmittingGateAction(false);
    }
  };

  useEffect(() => {
    loadCockpitData();
    fetchAllCandidates();
    fetchDailyQueue();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      fetchSilverMedalists(selectedJobId);
    }
  }, [selectedJobId]);

  useEffect(() => {
    if (selectedCandidateForLinks) {
      fetchRelationalLinks(selectedCandidateForLinks);
    }
  }, [selectedCandidateForLinks]);

  useEffect(() => {
    if (selectedSubmissionForTimeline) {
      fetchTimelineLogs(selectedSubmissionForTimeline);
    }
  }, [selectedSubmissionForTimeline]);

  const getSlaStatus = (stage: string, stageUpdatedAtStr: string) => {
    const stageUpdatedAt = new Date(stageUpdatedAtStr);
    const diffMs = Date.now() - stageUpdatedAt.getTime();
    const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

    if (diffHours >= 72) {
      return { level: "breach", text: `SLA BREACH: ${diffHours}h No Movement`, hours: diffHours };
    }
    if (diffHours >= 36) {
      return { level: "warning", text: `Warning: ${diffHours}h Aging`, hours: diffHours };
    }
    return { level: "green", text: `${diffHours}h in Stage (<24h Target)`, hours: diffHours };
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

                <button
                  onClick={handleGenerateClientPortalLink}
                  disabled={generatingClientToken || !selectedJobId}
                  className="bg-emerald-600 text-white text-xs font-black px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer border border-emerald-700 shadow-sm ml-2 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">link</span>
                  {generatingClientToken ? "Generating Link..." : "Client Portal Link"}
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

          {/* RC-03: MORNING COCKPIT DAILY EXECUTION QUEUE BANNER */}
          <div className="bg-[#0F172A] rounded-xl p-5 text-white space-y-4 shadow-lg border border-slate-800 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-[#FFD400] text-[#0F172A] p-2 rounded-lg font-black flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">wb_sunny</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-[#FFD400] text-sm tracking-wide uppercase">Morning Cockpit Focus Queue (RC-03)</h3>
                    <span className="bg-amber-400/20 text-amber-300 text-[9px] font-black px-2 py-0.5 rounded border border-amber-400/30">
                      SLA & Stagnation Aging Radar
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">Prioritized daily action queue and multi-channel communication command center</p>
                </div>
              </div>

              {/* Role Access Rules Switcher */}
              <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-lg border border-slate-700 self-start sm:self-auto">
                <button
                  onClick={() => {
                    setViewModeRole("my_queue");
                    fetchDailyQueue("my_queue");
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                    viewModeRole === "my_queue"
                      ? "bg-[#FFD400] text-[#0F172A] shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  My Assigned Tasks
                </button>
                <button
                  onClick={() => {
                    setViewModeRole("agency_aggregate");
                    fetchDailyQueue("agency_aggregate");
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                    viewModeRole === "agency_aggregate"
                      ? "bg-[#FFD400] text-[#0F172A] shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Agency-Wide Board
                </button>
              </div>
            </div>

            {/* Summary Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 flex items-center gap-3">
                <div className="bg-red-500/20 text-red-400 p-2 rounded-lg">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Critical Breaches (72h+)</span>
                  <span className="text-lg font-black text-red-400">{dailyQueueSummary?.slaBreachCount || 0} Cards</span>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 flex items-center gap-3">
                <div className="bg-amber-500/20 text-amber-400 p-2 rounded-lg">
                  <span className="material-symbols-outlined text-[18px]">warning</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">High-Risk Alerts</span>
                  <span className="text-lg font-black text-amber-400">{dailyQueueSummary?.highRiskCount || 0} Leads</span>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 flex items-center gap-3">
                <div className="bg-yellow-500/20 text-yellow-400 p-2 rounded-lg">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Aging Warnings (36h+)</span>
                  <span className="text-lg font-black text-yellow-400">{dailyQueueSummary?.warningCount || 0} Cards</span>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 flex items-center gap-3">
                <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-lg">
                  <span className="material-symbols-outlined text-[18px]">task_alt</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Active Submissions</span>
                  <span className="text-lg font-black text-emerald-400">{dailyQueueSummary?.totalSubmissions || submissions.length} Candidates</span>
                </div>
              </div>
            </div>

            {/* RC-04: RELATIONAL TALENT & HOUSEHOLD MAPPING (RC-04) */}
            <div className="bg-[#0B132B] border border-blue-500/40 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-400 text-[18px]">family_restroom</span>
                  <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
                    Relational Talent & Household Network (RC-04)
                  </h4>
                </div>
                <span className="bg-blue-500/20 text-blue-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded border border-blue-500/40">
                  Auto Location Inheritance
                </span>
              </div>

              <div className="bg-slate-900/90 border border-slate-700/80 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm">Anita Nair</span>
                    <span className="bg-purple-900/60 text-purple-200 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-500/40">
                      Linked Spouse (Siddharth Nair)
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                    <span>Designation: Senior HR Lead</span>
                    <span>•</span>
                    <span className="bg-blue-900/60 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-500/40">
                      Target Location: Dubai (Synced from Placed Spouse)
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => alert("Assigning Anita Nair to Dubai HR Lead Mandate")}
                  className="bg-[#FFD400] text-[#0F172A] hover:brightness-110 font-black px-3.5 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                  Assign to Dubai HR Mandate
                </button>
              </div>
            </div>

            {/* WORKFLOW 6: NOTICE PERIOD RISK RADAR (RC-05, CE-04, 2-TIER ESCALATION) */}
            <div className="bg-[#0B132B] border border-red-500/40 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-400 animate-pulse text-[18px]">radar</span>
                  <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
                    Notice Period Risk Radar (RC-05 & CE-04)
                  </h4>
                </div>
                <span className="bg-red-500/20 text-red-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded border border-red-500/40">
                  2-Tier Unresponded Escalation Radar
                </span>
              </div>

              {/* Horizontal Timeline Bar */}
              <div className="bg-slate-900/90 border border-slate-700/80 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-white">Vikram Malhotra — Day 35 of 60</span>
                  <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded border border-amber-400/30">
                    60-Day Notice Period
                  </span>
                </div>

                {/* Timeline Milestones */}
                <div className="relative pt-2 pb-1">
                  <div className="h-2 bg-slate-800 rounded-full w-full overflow-hidden flex">
                    <div className="w-[25%] bg-emerald-500"></div>
                    <div className="w-[33%] bg-red-500 animate-pulse"></div>
                    <div className="w-[42%] bg-slate-700"></div>
                  </div>

                  <div className="flex justify-between text-[11px] font-bold mt-2.5">
                    {/* Day 15 Milestone */}
                    <div className="flex items-center gap-1 text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-500/30">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      <span>Day 15: Resignation Confirmed</span>
                    </div>

                    {/* Day 35 Milestone */}
                    <div className="flex items-center gap-1 text-red-400 bg-red-950/80 px-2.5 py-1 rounded border border-red-500/60 animate-bounce">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      <span>Day 35: HIGH RISK: Unresponded to 2nd Pulse Check Attempt</span>
                    </div>

                    {/* Day 60 Milestone */}
                    <div className="text-slate-400 text-[10px] self-center">
                      Day 60: Joining Date
                    </div>
                  </div>
                </div>

                {/* Escalation Notice & Action Button */}
                <div className="bg-red-950/40 border border-red-500/50 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-red-200 text-xs">
                    <span className="material-symbols-outlined text-red-400 text-[18px]">campaign</span>
                    <div>
                      <span className="font-black text-red-400 uppercase tracking-wider block text-[10px]">Escalation Notice Box</span>
                      <span className="font-extrabold text-white">Escalated to Team Lead — Revenue Risk $15,000</span>
                    </div>
                  </div>

                  <a
                    href="tel:+15554443333"
                    className="bg-[#FFD400] text-[#0F172A] hover:brightness-110 font-black px-4 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer text-center"
                  >
                    <span className="material-symbols-outlined text-[16px]">call</span>
                    Call Candidate Immediately (#FFD400)
                  </a>
                </div>
              </div>
            </div>

            {/* WORKFLOW 7: FINANCIAL SETTLEMENTS & PROBATION TRACKER DASHBOARD (RC-06, HC-04, PO-04) */}
            <div className="bg-[#0B132B] border border-purple-500/40 rounded-xl p-5 space-y-4 shadow-xl text-white">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="bg-purple-600/30 text-purple-300 p-2 rounded-lg border border-purple-500/40">
                    <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white uppercase tracking-wide">
                      Financial Settlements, Probation & Partner Ledgers (RC-06, HC-04, PO-04)
                    </h3>
                    <p className="text-xs text-slate-400">Placement billing, 90-day replacement clocks, and split-commission ledgers</p>
                  </div>
                </div>

                {/* Restricted Owner Actions Banner */}
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 self-start sm:self-auto">
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  Restricted Owner Actions Banner: Financial Alterations & Credit Notes (Owner/TL Only)
                </div>
              </div>

              {/* Summary Cards Top Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Unbilled Placements</span>
                    <span className="text-xl font-black text-amber-400">2 Pending Invoice ($30,000)</span>
                  </div>
                  <div className="bg-amber-500/20 text-amber-400 p-2 rounded-lg">
                    <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Active 90-Day Guarantees</span>
                    <span className="text-xl font-black text-emerald-400">5 Active Clocks</span>
                  </div>
                  <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-lg">
                    <span className="material-symbols-outlined text-[20px]">verified</span>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-purple-500/50 rounded-xl p-3.5 flex items-center justify-between bg-purple-950/20">
                  <div>
                    <span className="text-[10px] font-extrabold text-purple-300 uppercase tracking-wider block">Frozen Split Payouts</span>
                    <span className="text-xl font-black text-purple-400">1 Partner Payout FROZEN</span>
                  </div>
                  <div className="bg-purple-500/20 text-purple-300 p-2 rounded-lg">
                    <span className="material-symbols-outlined text-[20px]">lock_reset</span>
                  </div>
                </div>
              </div>

              {/* Operational Ledger & Probation Tracker Table Row */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-3 bg-slate-800/80 border-b border-slate-700 text-xs font-black uppercase text-slate-300 flex justify-between items-center">
                  <span>Client & Placement Ledger</span>
                  <span>Guarantee Status & Operational Action</span>
                </div>

                <div className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 hover:bg-slate-800/30 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white text-sm">Apex Corp</span>
                      <span className="text-slate-400 text-xs">— Candidate:</span>
                      <span className="font-extrabold text-amber-300 text-sm">Ankit Sharma</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>Mandate: Senior Backend Lead</span>
                      <span>•</span>
                      <span>Joined: 42 Days Ago</span>
                      <span>•</span>
                      <span>Placement Fee: $15,000</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {/* Status Badge */}
                    <div className="bg-red-950/80 border border-red-500/60 text-red-300 font-extrabold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-pulse">
                      <span className="material-symbols-outlined text-[16px] text-red-400">warning</span>
                      PROBATION BREACH (Quitted Day 42)
                    </div>

                    {/* Purple Badge */}
                    <div className="bg-purple-900/60 border border-purple-500/60 text-purple-200 font-black text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-purple-400">pause_circle</span>
                      Partner Payout FROZEN
                    </div>

                    {/* Prominent Yellow CTA Button */}
                    <button
                      onClick={() => alert("Opening $0 Free Replacement Mandate with past Silver Medalist candidates shortlisted!")}
                      className="bg-[#FFD400] text-[#0F172A] hover:brightness-110 font-black text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">group_add</span>
                      View Suggested Silver Medalists for $0 Replacement Mandate (#FFD400)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Prioritized Task List Bar */}
            {dailyTasks.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FFD400] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">bolt</span>
                  Prioritized Action Tasks Due Today ({dailyTasks.length})
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dailyTasks.slice(0, 4).map((task) => (
                    <div key={task.id} className="bg-slate-900 border border-slate-700/80 rounded-lg p-3 flex justify-between items-center">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                            task.priority === "CRITICAL" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}>
                            {task.type}
                          </span>
                          <h4 className="font-extrabold text-xs text-white truncate">{task.title}</h4>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{task.description}</p>
                      </div>
                      <button
                        onClick={() => {
                          const sub = submissions.find(s => s.submissionId === task.submissionId);
                          if (sub) setSelectedSubmissionForTimeline(sub);
                        }}
                        className="bg-[#FFD400] text-[#0F172A] text-[10px] font-black px-2.5 py-1.5 rounded flex items-center gap-1 hover:brightness-95 active:scale-95 transition-all cursor-pointer flex-shrink-0 ml-3"
                      >
                        <span className="material-symbols-outlined text-[12px]">forum</span>
                        Open Feed
                      </button>
                    </div>
                  ))}
                </div>
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
                          const isBreached = s.sla.level === "breach";
                          const isWarning = s.sla.level === "warning";
                          return (
                            <div 
                              key={s.submissionId} 
                              onClick={() => setSelectedSubmissionForTimeline(s)}
                              className={`bg-white border rounded-lg p-4 shadow-sm space-y-3 transition-all relative group cursor-pointer hover:shadow-md ${
                                isBreached
                                  ? "border-red-500 ring-2 ring-red-100 shadow-red-50"
                                  : isWarning 
                                  ? "border-amber-400 ring-2 ring-amber-50" 
                                  : "border-outline-variant hover:border-slate-300"
                              }`}
                            >
                              {s.riskStatus === "HIGH_RISK" && (
                                <div className="bg-red-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse inline-flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[10px]">warning</span>
                                  HIGH RISK: Negative Sentiment Detected
                                </div>
                              )}
                              <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0">
                                  <h4 className="font-semibold text-on-surface text-sm truncate">{s.fullName}</h4>
                                  <p className="text-xs text-on-surface-variant truncate">{s.currentTitle} at {s.currentCompany || "Freelance"}</p>
                                </div>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                                  isBreached
                                    ? "bg-red-100 text-red-700 border border-red-300 animate-pulse font-extrabold"
                                    : isWarning 
                                    ? "bg-amber-100 text-amber-700 border border-amber-300" 
                                    : "bg-emerald-100 text-emerald-800 border border-emerald-300"
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSubmissionForTimeline(s);
                                  }}
                                  className="text-primary-container font-extrabold flex items-center gap-1 hover:underline cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[12px]">forum</span>
                                  Open WhatsApp Feed
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
                              onClick={() => setSelectedSubmissionForTimeline(s)}
                              className={`bg-white border rounded-lg p-4 shadow-sm space-y-3 transition-all relative group cursor-pointer hover:shadow-md ${
                                isBreached 
                                  ? "border-red-500 ring-2 ring-red-100 shadow-red-50" 
                                  : isWarning 
                                    ? "border-amber-400 ring-2 ring-amber-50" 
                                    : "border-outline-variant hover:border-slate-300"
                              }`}
                            >
                              {s.riskStatus === "HIGH_RISK" && (
                                <div className="bg-red-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse inline-flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[10px]">warning</span>
                                  HIGH RISK: Negative Sentiment Detected
                                </div>
                              )}
                              <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0">
                                  <h4 className="font-semibold text-on-surface text-sm truncate">{s.fullName}</h4>
                                  <p className="text-xs text-on-surface-variant truncate">{s.currentTitle} at {s.currentCompany || "Freelance"}</p>
                                </div>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                                  isBreached 
                                    ? "bg-red-100 text-red-700 border border-red-300 animate-pulse font-extrabold" 
                                    : isWarning 
                                      ? "bg-amber-100 text-amber-700 border border-amber-300" 
                                      : "bg-emerald-100 text-emerald-800 border border-emerald-300"
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSubmissionForTimeline(s);
                                  }}
                                  className="text-primary-container font-extrabold flex items-center gap-1 hover:underline cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[12px]">forum</span>
                                  Open WhatsApp Feed
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

          {/* TWO COLUMN WORKFLOW EXTENSIONS (RC-07 & RC-04) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-outline-variant">
            {/* Column 1: Silver Medalist Talent Recycler (RC-07) */}
            <div className="bg-white rounded-xl border border-outline-variant p-6 space-y-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-amber-200">
                    RC-07 Recycler
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900">Silver Medalist Talent Recycler</h3>
                  <p className="text-xs text-on-surface-variant">
                    Past 2nd/3rd place runner-up candidates matched from other client pipelines.
                  </p>
                </div>
                <span className="material-symbols-outlined text-amber-500 text-[24px]">workspace_premium</span>
              </div>

              {loadingSilver ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
                </div>
              ) : silverMedalists.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px] text-slate-300 block mb-1">dashboard_customize</span>
                  No matching silver medalists found for this mandate
                </div>
              ) : (
                <div className="space-y-4">
                  {silverMedalists.map((cand) => (
                    <div key={cand.candidateId} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 hover:border-slate-300 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-sm">{cand.fullName}</h4>
                          <p className="text-xs text-slate-500 font-medium">{cand.currentTitle} at {cand.currentCompany || "Freelance"}</p>
                        </div>
                        <div className="text-right">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-200">
                            {cand.matchScore}% Match
                          </span>
                        </div>
                      </div>

                      {/* Matching Skills */}
                      {cand.matchingSkills && cand.matchingSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {cand.matchingSkills.map((skill: string, i: number) => (
                            <span key={i} className="bg-slate-200 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 text-[11px]">
                        <span className="text-slate-400 font-medium">Notice: {cand.noticePeriodDays} days</span>
                        <button
                          onClick={() => handleRecycleCandidate(cand.candidateId)}
                          className="px-3 py-1.5 bg-[#FFD400] text-slate-900 font-black rounded text-[10px] hover:brightness-95 active:scale-95 transition-all shadow-sm cursor-pointer"
                        >
                          Recycle Profile
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Column 2: Relational Talent & Household Mapping (RC-04) */}
            <div className="bg-white rounded-xl border border-outline-variant p-6 space-y-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-blue-200">
                    RC-04 Mapping
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900">Relational &amp; Household Mapping</h3>
                  <p className="text-xs text-on-surface-variant">
                    Link candidates for relocation syncs (e.g. spousal/colleague job alignment).
                  </p>
                </div>
                <span className="material-symbols-outlined text-blue-500 text-[24px]">hub</span>
              </div>

              {/* 1. Select Primary Candidate */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Primary Candidate</label>
                <select
                  value={selectedCandidateForLinks}
                  onChange={(e) => setSelectedCandidateForLinks(e.target.value)}
                  className="w-full bg-white border border-outline-variant rounded-lg px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-secondary-container/30 transition-all text-on-surface cursor-pointer"
                >
                  <option value="">-- Choose Candidate --</option>
                  {allCandidates.map(c => (
                    <option key={c.candidateId} value={c.candidateId}>
                      {c.fullName} ({c.currentTitle || "No Title"})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Active Relational Links List */}
              {selectedCandidateForLinks && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-extrabold text-slate-800">Current Links</h4>
                  {relationalLinks.length === 0 ? (
                    <p className="text-[11px] text-slate-400 font-medium">No active connections linked to this profile.</p>
                  ) : (
                    <div className="space-y-2">
                      {relationalLinks.map((link) => (
                        <div key={link.linkId} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm text-xs">
                          <div>
                            <span className="font-extrabold text-slate-700">{link.relatedName}</span>
                            <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ml-2">
                              {link.relationshipType}
                            </span>
                          </div>
                          {link.inheritedTargetLocation && (
                            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                              {link.inheritedTargetLocation}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 3. Link New Candidate Form */}
                  <div className="pt-3 border-t border-slate-200/60 space-y-4">
                    <h5 className="text-[11px] font-extrabold text-slate-800">Create New Relational Connection</h5>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Related Candidate</label>
                        <select
                          value={relatedCandidateId}
                          onChange={(e) => setRelatedCandidateId(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-slate-100 text-on-surface cursor-pointer"
                        >
                          <option value="">-- Choose Partner --</option>
                          {allCandidates
                            .filter(c => c.candidateId !== selectedCandidateForLinks)
                            .map(c => (
                              <option key={c.candidateId} value={c.candidateId}>
                                {c.fullName}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Relationship</label>
                        <select
                          value={relationshipType}
                          onChange={(e) => setRelationshipType(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-slate-100 text-on-surface cursor-pointer"
                        >
                          <option value="SPOUSE">Spouse</option>
                          <option value="COLLEAGUE">Colleague</option>
                          <option value="REFERRAL">Referral</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Sync Target Relocation Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Dubai"
                        value={inheritedLocation}
                        onChange={(e) => setInheritedLocation(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-slate-100 text-on-surface"
                      />
                    </div>

                    <button
                      onClick={handleCreateRelationalLink}
                      disabled={linkingCandidate || !relatedCandidateId}
                      className="w-full py-2 bg-[#FFD400] text-slate-900 font-extrabold rounded text-[11px] hover:brightness-95 active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {linkingCandidate ? "Syncing Mobility..." : "Link Profile & Sync Location / Tags"}
                    </button>
                  </div>
                </div>
              )}
            </div>
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
      {/* RC-01: RIGHT SIDE EMBEDDED WHATSAPP CHAT FEED & TEMPLATE DISPATCH SLIDE-OVER */}
      {selectedSubmissionForTimeline && (
        <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[450px] bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
          {/* Panel Header */}
          <div className="bg-[#0F172A] px-5 py-4 text-white flex justify-between items-center border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFD400] text-[#0F172A] font-extrabold text-sm flex items-center justify-center border-2 border-white">
                {selectedSubmissionForTimeline.fullName?.charAt(0) || "C"}
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#FFD400] truncate max-w-[220px]">
                  {selectedSubmissionForTimeline.fullName}
                </h3>
                <p className="text-[11px] text-slate-300 truncate max-w-[220px]">
                  {selectedSubmissionForTimeline.currentTitle} • {selectedSubmissionForTimeline.stage}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedSubmissionForTimeline(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* SLA & Risk Header Bar */}
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">SLA Status:</span>
              <span className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] ${
                getSlaStatus(selectedSubmissionForTimeline.stage, selectedSubmissionForTimeline.stageUpdatedAt).level === "breach"
                  ? "bg-red-100 text-red-700 border border-red-300 animate-pulse"
                  : getSlaStatus(selectedSubmissionForTimeline.stage, selectedSubmissionForTimeline.stageUpdatedAt).level === "warning"
                  ? "bg-amber-100 text-amber-700 border border-amber-300"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-300"
              }`}>
                {getSlaStatus(selectedSubmissionForTimeline.stage, selectedSubmissionForTimeline.stageUpdatedAt).text}
              </span>
            </div>

            {selectedSubmissionForTimeline.riskStatus === "HIGH_RISK" && (
              <span className="bg-red-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse shadow-sm">
                HIGH RISK ALERT
              </span>
            )}
          </div>

          {/* Live Timeline Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-100/50 custom-scrollbar">
            {loadingTimeline ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-xs">
                <span className="material-symbols-outlined animate-spin text-[24px] mb-2">sync</span>
                Loading timeline history...
              </div>
            ) : timelineLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs space-y-2">
                <span className="material-symbols-outlined text-[32px] text-slate-300">chat</span>
                <p>No prior communication logs found for this candidate.</p>
                <p className="text-[10px] text-slate-400">Use the templates below to send the first WhatsApp message!</p>
              </div>
            ) : (
              timelineLogs.map((log) => {
                const isInbound = String(log.direction).toUpperCase() === "INBOUND";
                return (
                  <div
                    key={log.messageId}
                    className={`flex flex-col max-w-[85%] ${isInbound ? "self-start" : "self-end ml-auto"}`}
                  >
                    <div
                      className={`p-3 rounded-xl text-xs space-y-1 shadow-sm ${
                        isInbound
                          ? "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                          : "bg-[#0F172A] text-white rounded-tr-none"
                      }`}
                    >
                      <div className="flex justify-between items-center text-[9px] opacity-75 mb-1 gap-4">
                        <span className="font-bold uppercase tracking-wider">{log.channel} • {log.direction}</span>
                        <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap font-medium">{log.body}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 1-Click WhatsApp Template Selector Bar */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              1-Click WhatsApp Template Selection (RC-01)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDispatchTemplateMessage(
                  `Hi ${selectedSubmissionForTimeline.fullName}, following up regarding your screening status for ${selectedSubmissionForTimeline.jobTitle || 'the role'}. Are you available for a quick call today?`
                )}
                disabled={sendingCommunication}
                className="bg-white border border-slate-300 hover:border-emerald-500 text-slate-800 text-[10px] font-bold py-2 px-2.5 rounded-lg flex items-center gap-1.5 hover:bg-emerald-50 transition-all cursor-pointer text-left truncate"
              >
                <span className="material-symbols-outlined text-emerald-600 text-[14px]">chat</span>
                <span className="truncate">Screening Follow-Up</span>
              </button>

              <button
                onClick={() => handleDispatchTemplateMessage(
                  `Hi ${selectedSubmissionForTimeline.fullName}, reminding you of your scheduled client interview for ${selectedSubmissionForTimeline.jobTitle || 'the role'}. Please confirm if everything is set!`
                )}
                disabled={sendingCommunication}
                className="bg-white border border-slate-300 hover:border-blue-500 text-slate-800 text-[10px] font-bold py-2 px-2.5 rounded-lg flex items-center gap-1.5 hover:bg-blue-50 transition-all cursor-pointer text-left truncate"
              >
                <span className="material-symbols-outlined text-blue-600 text-[14px]">event</span>
                <span className="truncate">Interview Schedule</span>
              </button>

              <button
                onClick={() => handleDispatchTemplateMessage(
                  `Hi ${selectedSubmissionForTimeline.fullName}, great news! We have an update regarding your offer status for ${selectedSubmissionForTimeline.jobTitle || 'the role'}. Let's connect!`
                )}
                disabled={sendingCommunication}
                className="bg-white border border-slate-300 hover:border-purple-500 text-slate-800 text-[10px] font-bold py-2 px-2.5 rounded-lg flex items-center gap-1.5 hover:bg-purple-50 transition-all cursor-pointer text-left truncate"
              >
                <span className="material-symbols-outlined text-purple-600 text-[14px]">celebration</span>
                <span className="truncate">Offer Update</span>
              </button>

              <button
                onClick={() => handleDispatchTemplateMessage(
                  `Hi ${selectedSubmissionForTimeline.fullName}, we received your latest message. Let's schedule a 5-min call with our lead partner to address any questions!`
                )}
                disabled={sendingCommunication}
                className="bg-white border border-slate-300 hover:border-amber-500 text-slate-800 text-[10px] font-bold py-2 px-2.5 rounded-lg flex items-center gap-1.5 hover:bg-amber-50 transition-all cursor-pointer text-left truncate"
              >
                <span className="material-symbols-outlined text-amber-600 text-[14px]">warning</span>
                <span className="truncate">Risk Mitigation</span>
              </button>
            </div>
          </div>

          {/* Custom Direct Message Dispatch Box */}
          <div className="p-4 bg-white border-t border-slate-200 space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedChannel("WHATSAPP")}
                className={`flex-1 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-wider flex items-center justify-center gap-1 border cursor-pointer ${
                  selectedChannel === "WHATSAPP"
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">forum</span>
                WhatsApp Business
              </button>
              <button
                onClick={() => setSelectedChannel("EMAIL")}
                className={`flex-1 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-wider flex items-center justify-center gap-1 border cursor-pointer ${
                  selectedChannel === "EMAIL"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">mail</span>
                Email Direct
              </button>
            </div>

            <div className="flex gap-2">
              <textarea
                rows={2}
                value={customMessageBody}
                onChange={(e) => setCustomMessageBody(e.target.value)}
                placeholder={`Type custom ${selectedChannel} message...`}
                className="flex-1 p-2.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none font-medium text-slate-800"
              />
              <button
                onClick={() => handleDispatchTemplateMessage()}
                disabled={sendingCommunication || !customMessageBody.trim()}
                className="bg-[#0F172A] text-[#FFD400] font-black px-4 rounded-lg flex items-center justify-center hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                {sendingCommunication ? (
                  <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">send</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WORKFLOW 5: STAGE-GATE ENFORCEMENT & INTERVIEW OUTCOME MODAL */}
      {stageGateModalOpen && targetSubmissionForGate && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-red-600 flex items-center gap-1.5">
                <span className="material-symbols-outlined">gavel</span>
                Strict Stage-Gate Enforcement Guard
              </h3>
              <button onClick={() => setStageGateModalOpen(false)} className="text-slate-400 font-bold text-xs">
                ✕
              </button>
            </div>

            <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-xs text-red-900 space-y-1">
              <p className="font-bold">
                Cannot advance candidate to '{targetStageForGate}'!
              </p>
              <p className="text-[11px] text-red-800">
                An explicit interview outcome (Completed, Rescheduled, or Rejected) MUST be recorded before issuing an offer or stage progression.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700">Require Owner / Team Lead Override?</span>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-700">
                  <input
                    type="checkbox"
                    checked={isOwnerOverrideToggle}
                    onChange={(e) => setIsOwnerOverrideToggle(e.target.checked)}
                    className="accent-amber-500 h-4 w-4"
                  />
                  Bypass Gate
                </label>
              </div>

              {!isOwnerOverrideToggle ? (
                <div className="space-y-2">
                  <label className="font-extrabold text-slate-800 uppercase tracking-wider block text-[10px]">
                    Record Explicit Interview Outcome *
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { status: "Completed", label: "Completed", icon: "check_circle", color: "border-emerald-500 bg-emerald-50 text-emerald-900" },
                      { status: "Rescheduled", label: "Rescheduled", icon: "event_repeat", color: "border-blue-500 bg-blue-50 text-blue-900" },
                      { status: "No_Show", label: "Interview No-Show", icon: "person_off", color: "border-red-500 bg-red-50 text-red-900" },
                      { status: "Rejected_Post_Interview", label: "Rejected Post-Interview", icon: "cancel", color: "border-slate-500 bg-slate-100 text-slate-900" },
                    ].map((item) => (
                      <button
                        key={item.status}
                        type="button"
                        onClick={() => setSelectedOutcomeStatus(item.status)}
                        className={`p-3 rounded-xl border text-left font-bold text-xs flex items-center gap-2 cursor-pointer transition-all ${
                          selectedOutcomeStatus === item.status ? item.color + " ring-2 ring-slate-900" : "border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">{item.icon}</span>
                        <span className="truncate">{item.label}</span>
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Debrief / Interview Notes</label>
                    <textarea
                      rows={2}
                      value={outcomeNotes}
                      onChange={(e) => setOutcomeNotes(e.target.value)}
                      placeholder="Enter technical interview feedback..."
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl text-xs space-y-2">
                  <span className="font-bold text-amber-900 block">Owner Override Details</span>
                  <input
                    type="text"
                    value={outcomeNotes}
                    onChange={(e) => setOutcomeNotes(e.target.value)}
                    placeholder="Enter audit justification for bypassing stage gate..."
                    className="w-full p-2.5 border border-amber-300 rounded-xl text-xs bg-white"
                  />
                </div>
              )}
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setStageGateModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInterviewOutcomeAndAdvance}
                disabled={submittingGateAction}
                className="flex-1 py-2.5 bg-[#0F172A] text-[#FFD400] text-xs font-black rounded-xl hover:brightness-110 transition-all shadow-md"
              >
                {submittingGateAction ? "Processing..." : "Save & Advance Stage"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
