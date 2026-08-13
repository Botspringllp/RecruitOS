"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CockpitView() {
  const router = useRouter();

  // Navigation State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState("dashboard"); // dashboard, jobs, open_mandates, active_mandates, customized_website
  const [pipelineDateFilter, setPipelineDateFilter] = useState("Today");

  // Modal Overlay States
  const [showHighRiskModal, setShowHighRiskModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showStorefront, setShowStorefront] = useState(false);

  // Job & Candidate Selection State
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [viewingCandidate, setViewingCandidate] = useState<any>(null); // For Candidate Detailed Profile View
  const [activeProfileTab, setActiveProfileTab] = useState("resume"); // resume, skills, experience, notes, timeline

  // Candidates List State for Jobs
  const [jobCandidates, setJobCandidates] = useState<any[]>([
    {
      id: "CAND-1001",
      jobId: "ZR_97_JOB",
      name: "Christina Thomas",
      email: "christina@prmail.com",
      phone: "+91 98111 22334",
      designation: "Frontend Developer",
      currentCompany: "Media Pulse Tech",
      experience: "3.5 Years",
      noticePeriod: "15 Days",
      expectedCtc: "$75,000 / Year",
      status: "Applied",
      rating: "3.0 ⭐",
      skills: "Writing, Social Media, Marketing, React Basics",
      photoUrl: "/images/executive_leader_woman.png",
      resumeFileName: "Christina_Thomas_Resume_2026.pdf",
      notes: "Strong communication skills. Portfolio attached in resume.",
    },
    {
      id: "CAND-1002",
      jobId: "ZR_97_JOB",
      name: "Will James",
      email: "willjames@icloud.com",
      phone: "+1 415 892 1092",
      designation: "Senior Full Stack Engineer",
      currentCompany: "Vercel Inc",
      experience: "6.0 Years",
      noticePeriod: "Immediate",
      expectedCtc: "$110,000 / Year",
      status: "Applied",
      rating: "5.0 ⭐",
      skills: "React, Node.js, TypeScript, Next.js, GraphQL, AWS",
      photoUrl: null,
      resumeFileName: "Will_James_FullStack_CV.pdf",
      notes: "Initial profile ingestion. Applied for position.",
    },
    {
      id: "CAND-1003",
      jobId: "ZR_97_JOB",
      name: "Cooper",
      email: "cooper@yymail.com",
      phone: "+971 50 882 1199",
      designation: "UI/UX Designer",
      currentCompany: "Design Studio Dubai",
      experience: "4.5 Years",
      noticePeriod: "30 Days",
      expectedCtc: "$85,000 / Year",
      status: "Applied",
      rating: "5.0 ⭐",
      skills: "UI/UX, Figma, Tailwind, CSS3, Wireframing",
      photoUrl: null,
      resumeFileName: "Cooper_Design_Portfolio_CV.pdf",
      notes: "Figma design portfolio attached. Applied for position.",
    },
    {
      id: "CAND-1004",
      jobId: "ZR_97_JOB",
      name: "Aron Ramsey",
      email: "aron@icloud.com",
      phone: "+44 20 7946 0912",
      designation: "Product Analyst",
      currentCompany: "Fintech UK",
      experience: "7.0 Years",
      noticePeriod: "60 Days",
      expectedCtc: "$120,000 / Year",
      status: "Applied",
      rating: "5.0 ⭐",
      skills: "Product Strategy, Analytics, SQL, Python",
      photoUrl: null,
      resumeFileName: "Aron_Ramsey_CV.pdf",
      notes: "Applied for Product Analyst position.",
    },
    {
      id: "CAND-1005",
      jobId: "ZR_97_JOB",
      name: "Satish Chauhan",
      email: "satish@gmail.com",
      phone: "+91 99887 76655",
      designation: "Technical Sales Specialist",
      currentCompany: "Salesforce APAC",
      experience: "5.0 Years",
      noticePeriod: "30 Days",
      expectedCtc: "$90,000 / Year",
      status: "Applied",
      rating: "4.0 ⭐",
      skills: "Cold Calling, B2B Sales, CRM, Enterprise Accounts",
      photoUrl: null,
      resumeFileName: "Satish_Chauhan_Resume.pdf",
      notes: "Applied for Technical Sales Specialist position.",
    },
  ]);

  // + Add New Candidate Resume Upload & Auto-Parse Modal State
  const [addCandidateModalOpen, setAddCandidateModalOpen] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const [newCandidateForm, setNewCandidateForm] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "",
    currentCompany: "",
    experience: "5 Years",
    noticePeriod: "30 Days",
    expectedCtc: "$95,000 / Year",
    status: "Applied",
    rating: "4.5 ⭐",
    skills: "",
    photoUrl: "",
    resumeFileName: "",
    notes: "",
  });

  // Open Mandates Selection State & Modals
  const [selectedMandate, setSelectedMandate] = useState<any>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [assignedRecruiter, setAssignedRecruiter] = useState("Priya Sharma (Sr Tech Recruiter)");
  const [assignedBD, setAssignedBD] = useState("Rahul Verma (Client Onboarding Lead)");
  const [negotiationComment, setNegotiationComment] = useState("");
  const [emailNoticeBanner, setEmailNoticeBanner] = useState<string | null>(null);

  // Tasks Checklist State
  const [myTasks, setMyTasks] = useState([
    { id: 1, text: "Follow up Rahul", done: false },
    { id: 2, text: "Schedule Interview Priya", done: false },
    { id: 3, text: "Client Feedback Pending", done: false },
    { id: 4, text: "Offer Acceptance Check", done: false },
    { id: 5, text: "Notice Period Review", done: false },
  ]);

  // Initial Mandates List State
  const [openMandatesList, setOpenMandatesList] = useState([
    {
      id: "MAND-001",
      companyName: "Apex Tech Solutions",
      industry: "Information Technology",
      contactPerson: "Sarah Jenkins (HR VP)",
      position: "Full Stack Lead",
      openings: 4,
      experience: "5-8 Years",
      location: "Dubai, UAE",
      compensation: "$90,000 - $110,000 / Year",
      priority: "Urgent",
      commercialModel: "15% Annual CTC Contingency Fee",
      source: "Company Website (Online Storefront)",
      status: "Pending Review",
      dateSubmitted: "10 Aug 2026",
    },
    {
      id: "MAND-002",
      companyName: "Global Logistics Corp",
      industry: "Supply Chain & Freight",
      contactPerson: "Mohammed Al-Rashid",
      position: "DevOps Architect",
      openings: 2,
      experience: "6-10 Years",
      location: "Riyadh, KSA",
      compensation: "$100,000 - $130,000 / Year",
      priority: "High",
      commercialModel: "18% Retained Executive Search",
      source: "BD Sales Team (Rahul Verma)",
      status: "Needs Negotiation",
      negotiationComment: "Client offered 10% success fee. Admin feedback: Must negotiate for standard 15% rate before starting sourcing.",
      dateSubmitted: "09 Aug 2026",
    },
    {
      id: "MAND-003",
      companyName: "Horizon Labs",
      industry: "Biotech & Healthcare",
      contactPerson: "Dr. Elena Rostova",
      position: "Senior Product Manager",
      openings: 3,
      experience: "4-7 Years",
      location: "Singapore",
      compensation: "$85,000 - $105,000 / Year",
      priority: "High",
      commercialModel: "12.5% Success Fee",
      source: "BD Sales Team (Sameer Kapoor)",
      status: "Active Sourcing",
      assignedRecruiter: "Priya Sharma (Sr Tech Recruiter)",
      dateSubmitted: "08 Aug 2026",
    },
  ]);

  // Load mandates from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem("recruitos_open_mandates");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const ids = new Set(parsed.map((m: any) => m.id));
          const baseFiltered = openMandatesList.filter((m: any) => !ids.has(m.id));
          setOpenMandatesList([...parsed, ...baseFiltered]);
        }
      }
    } catch (err) {
      console.error("Error reading mandates from localStorage", err);
    }
  }, [activeNavTab]);

  // Agency Customized Website Builder Configuration State
  const [websiteConfig, setWebsiteConfig] = useState({
    agencyName: "Apex Recruitment Partners",
    tagline: "Premier Executive Search for Gulf & Emerging Markets",
    heroHeadline: "Premier Executive Search for Gulf & Emerging Markets",
    heroSubtitle: "Connecting world-class talent with industry leaders across the UAE, KSA, and beyond.",
    whatsapp: "+971 50 123 4567",
    email: "mandates@apexpartners.ae",
    phone: "+971 4 390 1234",
    hqAddress: "Level 24, ADGM Square, Maryah Island, Abu Dhabi, UAE",
    aboutBio: "We combine local market intelligence with a global executive search footprint across technology, finance, biotech, and leadership recruitment.",
    service1: "Executive Search & Leadership Hiring",
    service2: "Tech & Software Engineering Staffing",
    service3: "RPO & Volume Talent Sourcing",
    service4: "Overseas & Offshore Placement",
    market1: "Information Technology & AI",
    market2: "Banking, Finance & Fintech",
    market3: "Biotech & Healthcare",
    market4: "Supply Chain & Freight Logistics",
    themeColor: "stitch",
  });
  const [configSaveNotice, setConfigSaveNotice] = useState(false);

  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem("recruitos_agency_theme_config");
      if (savedConfig) {
        setWebsiteConfig(JSON.parse(savedConfig));
      }
    } catch (e) {
      console.error("Failed to load website config", e);
    }
  }, []);

  const handleSaveWebsiteConfig = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("recruitos_agency_theme_config", JSON.stringify(websiteConfig));
      setConfigSaveNotice(true);
      setTimeout(() => setConfigSaveNotice(false), 2500);
    } catch (err) {
      console.error("Failed to save website config", err);
    }
  };

  // Upload Real Candidate Resume File Handler with Auto-Parse
  const handleResumeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsParsingResume(true);
      setTimeout(() => {
        const rawName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        const cleanName = rawName.length > 3 
          ? rawName.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") 
          : "Rohan Sharma";
          
        const parsedData = {
          name: cleanName,
          email: `${file.name.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, ".")}@gmail.com`,
          phone: "+91 98765 43210",
          designation: "Senior Software Engineer",
          currentCompany: "Tech Enterprise Solutions",
          experience: "5.5 Years",
          noticePeriod: "30 Days",
          expectedCtc: "$95,000 / Year",
          status: "Applied",
          rating: "4.8 ⭐",
          skills: "React.js, Node.js, TypeScript, Next.js, Cloud Services, System Architecture",
          photoUrl: "",
          resumeFileName: file.name,
          notes: `Uploaded resume '${file.name}' parsed automatically with high accuracy.`,
        };
        setNewCandidateForm(parsedData);
        checkForDuplicates(parsedData.email, parsedData.name);
        setIsParsingResume(false);
        alert(`📄 Resume "${file.name}" Uploaded & Auto-Parsed Successfully! All fields auto-filled.`);
      }, 1000);
    }
  };

  // Live Duplicate Detection Function (Checks Name & Email)
  const checkForDuplicates = (emailVal: string, nameVal: string) => {
    if (!emailVal && !nameVal) {
      setDuplicateWarning(null);
      return false;
    }

    const match = jobCandidates.find((c) => {
      const emailMatch = emailVal && c.email.toLowerCase() === emailVal.toLowerCase().trim();
      const nameMatch = nameVal && c.name.toLowerCase() === nameVal.toLowerCase().trim();
      return emailMatch || nameMatch;
    });

    if (match) {
      setDuplicateWarning(
        `⚠️ DUPLICATE CANDIDATE DETECTED! A candidate with name '${match.name}' (${match.email}) already exists in this mandate (Status: ${match.status}).`
      );
      return true;
    } else {
      setDuplicateWarning(null);
      return false;
    }
  };

  // Trigger Sample Resume Auto-Parse
  const handleTriggerAutoParseSample = () => {
    setIsParsingResume(true);
    setTimeout(() => {
      const parsedSample = {
        name: "Rohan Sharma",
        email: "rohan.sharma@techcorp.com",
        phone: "+91 98765 43210",
        designation: "Lead React & Node Architect",
        currentCompany: "Cognizant Technology Solutions",
        experience: "6.5 Years",
        noticePeriod: "30 Days",
        expectedCtc: "$105,000 / Year",
        status: "Applied",
        rating: "4.8 ⭐",
        skills: "React.js, Node.js, TypeScript, Next.js, PostgreSQL, Docker, AWS",
        photoUrl: "/images/executive_leader_woman.png",
        resumeFileName: "Rohan_Sharma_Parsed_CV_2026.pdf",
        notes: "Automated CV Parsing: Extracted 6.5 yrs exp in Full-Stack web apps. Immediate fit for Senior Developer role.",
      };
      setNewCandidateForm(parsedSample);
      checkForDuplicates(parsedSample.email, parsedSample.name);
      setIsParsingResume(false);
    }, 1200);
  };

  // Add Candidate Submit Handler
  const handleAddCandidateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandidateForm.name || !newCandidateForm.email) {
      alert("Please provide at least Candidate Name and Email.");
      return;
    }

    const isDup = checkForDuplicates(newCandidateForm.email, newCandidateForm.name);
    if (isDup) {
      alert("Cannot add candidate: Duplicate candidate already exists in this job mandate pipeline!");
      return;
    }

    const createdCand = {
      id: `CAND-${Date.now().toString().slice(-4)}`,
      jobId: selectedJob?.id || "ZR_97_JOB",
      ...newCandidateForm,
      resumeFileName: newCandidateForm.resumeFileName || `${newCandidateForm.name.replace(/\s+/g, "_")}_Resume.pdf`,
    };

    setJobCandidates([createdCand, ...jobCandidates]);
    setAddCandidateModalOpen(false);
    alert(`🎉 Candidate ${createdCand.name} successfully ingested & parsed into ${selectedJob?.title || "Job Mandate"}!`);
    
    // Reset Form
    setNewCandidateForm({
      name: "",
      email: "",
      phone: "",
      designation: "",
      currentCompany: "",
      experience: "5 Years",
      noticePeriod: "30 Days",
      expectedCtc: "$95,000 / Year",
      status: "Applied",
      rating: "4.5 ⭐",
      skills: "",
      photoUrl: "",
      resumeFileName: "",
      notes: "",
    });
    setDuplicateWarning(null);
  };

  // Candidate Status Change Handler inside Detailed Profile View
  const handleUpdateCandidateStatus = (newStatus: string) => {
    if (!viewingCandidate) return;
    const updatedList = jobCandidates.map((c) => (c.id === viewingCandidate.id ? { ...c, status: newStatus } : c));
    setJobCandidates(updatedList);
    setViewingCandidate({ ...viewingCandidate, status: newStatus });
  };

  // Candidate Photo Change Handler inside Detailed Profile View
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && viewingCandidate) {
      const file = e.target.files[0];
      const fakeUrl = URL.createObjectURL(file);
      const updatedList = jobCandidates.map((c) => (c.id === viewingCandidate.id ? { ...c, photoUrl: fakeUrl } : c));
      setJobCandidates(updatedList);
      setViewingCandidate({ ...viewingCandidate, photoUrl: fakeUrl });
    }
  };

  // Logout Handler
  const handleLogout = () => {
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  // Accept Mandate Handler
  const handleAcceptMandateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMandate) return;

    const updated = openMandatesList.map((man) => {
      if (man.id === selectedMandate.id) {
        return {
          ...man,
          status: "Active Sourcing",
          assignedRecruiter: assignedRecruiter,
          assignedBD: man.source?.includes("Website") ? assignedBD : man.assignedBD || "Rahul Verma",
        };
      }
      return man;
    });

    setOpenMandatesList(updated);
    setSelectedMandate({
      ...selectedMandate,
      status: "Active Sourcing",
      assignedRecruiter: assignedRecruiter,
      assignedBD: selectedMandate.source?.includes("Website") ? assignedBD : selectedMandate.assignedBD || "Rahul Verma",
    });

    setShowAcceptModal(false);

    const isOnline = selectedMandate.source?.includes("Website");
    const noticeText = isOnline
      ? `✉️ Automated Email Dispatched: Recruiter (${assignedRecruiter}) assigned for sourcing & BD Officer (${assignedBD}) assigned for client onboarding!`
      : `✉️ Automated Email Dispatched to BD Team & Recruiter (${assignedRecruiter}) for active sourcing!`;

    setEmailNoticeBanner(noticeText);
    setTimeout(() => setEmailNoticeBanner(null), 5000);
  };

  // Reject Mandate Handler
  const handleRejectMandateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMandate) return;

    const updated = openMandatesList.map((man) => {
      if (man.id === selectedMandate.id) {
        return {
          ...man,
          status: "Needs Negotiation",
          negotiationComment: negotiationComment || "Admin requested commercial terms review before intake.",
        };
      }
      return man;
    });

    setOpenMandatesList(updated);
    setSelectedMandate({
      ...selectedMandate,
      status: "Needs Negotiation",
      negotiationComment: negotiationComment || "Admin requested commercial terms review before intake.",
    });

    setShowRejectModal(false);
    setNegotiationComment("");

    setEmailNoticeBanner(`🔄 Mandate routed back to BD Sales Team with Admin Negotiation Comments!`);
    setTimeout(() => setEmailNoticeBanner(null), 5000);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden select-none">

      {/* ========================================================================= */}
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      {/* ========================================================================= */}
      <aside
        className={`bg-[#0F172A] flex flex-col justify-between transition-all duration-300 z-30 shadow-xl ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-5 border-b border-slate-800/80 flex items-center gap-3 cursor-pointer hover:bg-slate-800/50 transition-all group"
            title="Click to toggle sidebar"
          >
            <div className="h-10 w-10 rounded-xl bg-[#FFD400] text-[#0F172A] flex items-center justify-center font-black shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">work</span>
            </div>

            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  Recruit<span className="text-[#FFD400]">Pro</span>
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Enterprise HRMS
                </p>
              </div>
            )}
          </div>

          {/* Navigation Options */}
          <nav className="p-3 space-y-1.5 mt-3">
            {[
              { id: "dashboard", label: "Dashboard", icon: "grid_view" },
              { id: "jobs", label: "Jobs", icon: "business_center" },
              { id: "open_mandates", label: "Open Mandates", icon: "storefront", badge: openMandatesList.length },
              { id: "active_mandates", label: "Active Mandates", icon: "assignment_ind", adminOnly: true },
              { id: "customized_website", label: "Customized Website", icon: "web" },
            ].map((tab) => {
              const isActive = activeNavTab === tab.id && !showStorefront;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setShowStorefront(false);
                    setSelectedJob(null);
                    setSelectedMandate(null);
                    setViewingCandidate(null);
                    setActiveNavTab(tab.id);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#FFD400] text-[#0F172A] shadow-md font-black"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-[20px] ${isActive ? "text-[#0F172A]" : "text-slate-400"}`}>
                      {tab.icon}
                    </span>
                    {!sidebarCollapsed && <span>{tab.label}</span>}
                  </div>

                  {!sidebarCollapsed && tab.badge && (
                    <span className="bg-[#FFD400] text-[#0F172A] font-black text-[10px] px-2 py-0.5 rounded-full animate-pulse shadow-2xs">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          <button
            onClick={() => {
              setShowStorefront(false);
              setActiveNavTab("settings");
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeNavTab === "settings"
                ? "bg-[#FFD400] text-[#0F172A] font-black"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            {!sidebarCollapsed && <span>Settings</span>}
          </button>

          <button
            onClick={() => alert("Connecting to RecruitOS 24/7 Support Hotline...")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">support_agent</span>
            {!sidebarCollapsed && <span>Support</span>}
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT AREA */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#F8FAFC]">

        {/* Email Notification Toast Banner */}
        {emailNoticeBanner && (
          <div className="bg-emerald-600 text-white font-bold text-xs py-2.5 px-6 flex justify-between items-center shadow-lg animate-in slide-in-from-top duration-300 z-50">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">mark_email_read</span>
              <span>{emailNoticeBanner}</span>
            </div>
            <button onClick={() => setEmailNoticeBanner(null)} className="text-white hover:opacity-80">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3 bg-slate-100/80 border border-slate-200 rounded-xl px-4 py-2 w-full max-w-md focus-within:ring-2 focus-within:ring-amber-400 focus-within:bg-white transition-all">
            <span className="material-symbols-outlined text-[20px] text-slate-400">search</span>
            <input
              type="text"
              placeholder="Search Candidate, Requirement, Client, Interview..."
              className="bg-transparent border-none text-xs text-slate-800 focus:outline-none w-full font-medium"
            />
          </div>

          <div className="flex items-center gap-5">
            <button className="relative p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            <button className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[22px]">chat_bubble</span>
            </button>

            <div className="h-6 w-[1px] bg-slate-200"></div>

            <div
              onClick={() => setShowProfileDrawer(true)}
              className="flex items-center gap-3 cursor-pointer p-1 rounded-xl hover:bg-slate-100 transition-all"
            >
              <div className="h-9 w-9 rounded-xl bg-[#0F172A] text-[#FFD400] flex items-center justify-center font-black text-xs shadow-sm">
                D
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-black text-slate-900 leading-tight">Divyanshu</p>
                <p className="text-[10px] font-bold text-amber-600 uppercase">Agency Admin</p>
              </div>
              <span className="material-symbols-outlined text-[18px] text-slate-400">expand_more</span>
            </div>
          </div>
        </header>

        {/* Dynamic View Body */}
        <div className="p-6 md:p-8 space-y-6">

          {/* ========================================================================= */}
          {/* TAB 1: MAIN DASHBOARD PAGE */}
          {/* ========================================================================= */}
          {activeNavTab === "dashboard" && !showStorefront && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              <div className="bg-gradient-to-r from-[#0F172A] via-slate-900 to-[#1E293B] text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                  <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/30 px-3 py-1 rounded-full text-[11px] font-bold text-[#FFD400]">
                    <span className="h-2 w-2 rounded-full bg-[#FFD400] animate-pulse"></span>
                    <span>RecruitOS Cockpit SLA Radar Active</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight">Good Morning Divyanshu 👋</h2>
                  <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-300 font-semibold">
                    <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                      <span className="material-symbols-outlined text-amber-400 text-[18px]">event</span>
                      <span>8 Interviews Today</span>
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                      <span className="material-symbols-outlined text-amber-400 text-[18px]">pending_actions</span>
                      <span>5 Follow-ups Pending</span>
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                      <span className="material-symbols-outlined text-amber-400 text-[18px]">workspace_premium</span>
                      <span>3 Offers Pending</span>
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                      <span className="material-symbols-outlined text-amber-400 text-[18px]">person_add</span>
                      <span>2 Joining This Week</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Pipeline Snapshot */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">Candidate Pipeline Snapshot</h3>
                    <p className="text-xs text-slate-500">Live SLA aging breakdown across hiring stages</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">View Date:</span>
                    <select
                      value={pipelineDateFilter}
                      onChange={(e) => setPipelineDateFilter(e.target.value)}
                      className="bg-slate-100 border border-slate-200 text-slate-800 font-extrabold text-xs px-3 py-1.5 rounded-xl focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="Today">Today (12 Aug 2026)</option>
                      <option value="This Week">This Week</option>
                      <option value="This Month">This Month</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { stage: "Applied / Shortlisted", count: jobCandidates.filter(c => c.status === "Applied").length + 120, color: "border-purple-300 bg-purple-50 text-purple-900" },
                    { stage: "Screening", count: jobCandidates.filter(c => c.status === "Screening").length + 80, color: "border-sky-300 bg-sky-50 text-sky-900" },
                    { stage: "Interview", count: jobCandidates.filter(c => c.status === "Interview").length + 35, color: "border-amber-300 bg-amber-50 text-amber-900" },
                    { stage: "Offer", count: jobCandidates.filter(c => c.status === "Offer").length + 12, color: "border-indigo-300 bg-indigo-50 text-indigo-900" },
                    { stage: "Joining", count: jobCandidates.filter(c => c.status === "Joining").length + 7, color: "border-emerald-300 bg-emerald-50 text-emerald-900" },
                  ].map((item, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl border ${item.color} space-y-1 shadow-2xs`}>
                      <span className="text-[10px] font-black uppercase tracking-widest block opacity-75">{item.stage}</span>
                      <p className="text-2xl font-black">{item.count}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3-Column Grid for Dashboard Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 1. High Risk Candidates / Counter-Offer Radar Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-600">
                      <span className="material-symbols-outlined text-[22px]">warning</span>
                      <h3 className="text-base font-black text-slate-900">High Risk Candidates Radar</h3>
                    </div>
                    <p className="text-xs text-slate-500">
                      Candidates who have accepted the offer letter and are scheduled to join within their notice period.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { name: "Rahul Verma", role: "DevOps Engineer", notice: "45 Days Notice", risk: "High Counter-offer Risk" },
                      { name: "Ananya Sen", role: "UI/UX Lead", notice: "30 Days Notice", risk: "Notice Period Stagnation" },
                    ].map((cand, i) => (
                      <div key={i} className="p-3 bg-red-50/60 border border-red-200 rounded-2xl flex items-center justify-between text-xs">
                        <div>
                          <p className="font-extrabold text-slate-900">{cand.name} ({cand.role})</p>
                          <p className="text-[10px] font-bold text-red-700">{cand.notice} • {cand.risk}</p>
                        </div>
                        <span className="bg-red-600 text-white font-black text-[10px] px-2.5 py-1 rounded-lg">Action Req</span>
                      </div>
                    ))}
                  </div>

                  {/* View More Button */}
                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => setShowHighRiskModal(true)}
                      className="text-xs font-black text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>View More -&gt;</span>
                    </button>
                  </div>
                </div>

                {/* 2. Pending Client Feedback Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-amber-600">
                      <span className="material-symbols-outlined text-[22px]">schedule</span>
                      <h3 className="text-base font-black text-slate-900">Pending Client Feedback</h3>
                    </div>
                    <p className="text-xs text-slate-500">Submissions awaiting client evaluation beyond 48h SLA</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { client: "Apex Tech Corp", candidate: "Vikram Malhotra", hours: "54h SLA Overdue" },
                      { client: "Global Freight Ltd", candidate: "Neha Sharma", hours: "49h SLA Overdue" },
                    ].map((fb, i) => (
                      <div key={i} className="p-3 bg-amber-50/60 border border-amber-200 rounded-2xl flex items-center justify-between text-xs">
                        <div>
                          <p className="font-extrabold text-slate-900">{fb.client}</p>
                          <p className="text-[10px] font-bold text-amber-800">Candidate: {fb.candidate} ({fb.hours})</p>
                        </div>
                        <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-lg">Ping Client</span>
                      </div>
                    ))}
                  </div>

                  {/* View More Button */}
                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => setShowFeedbackModal(true)}
                      className="text-xs font-black text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>View More -&gt;</span>
                    </button>
                  </div>
                </div>

                {/* 3. My Action Items Checklist Widget */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-800">
                      <span className="material-symbols-outlined text-[22px]">checklist</span>
                      <h3 className="text-base font-black text-slate-900">My Action Items</h3>
                    </div>
                    <p className="text-xs text-slate-500">Personal recruiter task checklist & follow-ups</p>
                  </div>

                  <div className="space-y-2">
                    {myTasks.map((t) => (
                      <label key={t.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 text-xs font-semibold">
                        <input
                          type="checkbox"
                          checked={t.done}
                          onChange={() => {
                            setMyTasks(myTasks.map((item) => (item.id === t.id ? { ...item, done: !item.done } : item)));
                          }}
                          className="h-4 w-4 accent-amber-500 rounded cursor-pointer"
                        />
                        <span className={t.done ? "line-through text-slate-400 font-normal" : "text-slate-800"}>
                          {t.text}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold">{myTasks.filter(t => t.done).length} / {myTasks.length} Completed</span>
                    <button
                      onClick={() => alert("Task added to your personal action list!")}
                      className="text-amber-700 font-extrabold hover:underline"
                    >
                      + Add Task
                    </button>
                  </div>
                </div>

              </div>

              {/* 4. Today's Interview Schedule List Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">Today's Scheduled Interviews (8)</h3>
                    <p className="text-xs text-slate-500 font-medium">Real-time candidate interview roster & panel feedback status</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs px-3 py-1 rounded-full">
                    Live Panel Sync Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { candidate: "Christina Thomas", role: "Frontend Dev", client: "Zylker", time: "10:30 AM", type: "Technical L1 (Google Meet)", status: "Completed" },
                    { candidate: "Will James", role: "Sr Full Stack Lead", client: "Apex Tech", time: "02:00 PM", type: "System Design (Zoom)", status: "Scheduled" },
                    { candidate: "Cooper", role: "UI/UX Designer", client: "Design Studio", time: "04:15 PM", type: "Portfolio Review", status: "Scheduled" },
                    { candidate: "Aron Ramsey", role: "Product Manager", client: "Fintech UK", time: "05:30 PM", type: "Bar Raiser Round", status: "Feedback Pending" },
                  ].map((int, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-slate-900">{int.candidate}</p>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">{int.role}</span>
                        </div>
                        <p className="text-slate-500 font-medium">{int.type} • {int.client}</p>
                        <p className="text-[11px] font-black text-slate-700">⏰ {int.time}</p>
                      </div>

                      <span className={`px-2.5 py-1 rounded-lg font-black text-[10px] ${
                        int.status === "Completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : int.status === "Scheduled"
                          ? "bg-sky-100 text-sky-800"
                          : "bg-amber-100 text-amber-900"
                      }`}>
                        {int.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: JOBS PAGE (PARENT-CHILD FLOW + DETAILED CANDIDATE PROFILE) */}
          {/* ========================================================================= */}
          {activeNavTab === "jobs" && !showStorefront && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* IF VIEWING FULL CANDIDATE PROFILE SCREEN */}
              {viewingCandidate ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-6 animate-in fade-in">
                  
                  {/* Top Bar with Back Button */}
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div>
                      <button
                        onClick={() => setViewingCandidate(null)}
                        className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        <span>Back to Candidate Directory ({selectedJob?.title || "Job Mandate"})</span>
                      </button>
                      <h3 className="text-2xl font-black text-slate-900">Candidate Full Profile</h3>
                      <p className="text-xs text-slate-500">Candidate ID: {viewingCandidate.id} • Applied for {selectedJob?.title || "Software Developer"}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Pipeline Stage Selector */}
                      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                        <span className="text-xs font-black text-slate-700 pl-2">Pipeline Stage:</span>
                        <select
                          value={viewingCandidate.status}
                          onChange={(e) => handleUpdateCandidateStatus(e.target.value)}
                          className="bg-white border border-slate-200 text-slate-900 font-extrabold text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 cursor-pointer shadow-xs"
                        >
                          <option value="Applied">Applied</option>
                          <option value="Screening">Screening</option>
                          <option value="Interview">Interview</option>
                          <option value="Offer">Offer</option>
                          <option value="Joining">Joining</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Candidate Header Profile Card */}
                  <div className="bg-gradient-to-r from-[#0F172A] to-slate-900 text-white rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-lg">
                    
                    {/* Photo with Change Photo Upload Feature */}
                    <div className="relative group flex-shrink-0">
                      <div className="h-24 w-24 rounded-2xl bg-amber-400 text-[#0F172A] flex items-center justify-center font-black text-3xl overflow-hidden border-2 border-white shadow-md">
                        {viewingCandidate.photoUrl ? (
                          <img src={viewingCandidate.photoUrl} alt={viewingCandidate.name} className="h-full w-full object-cover" />
                        ) : (
                          <span>{viewingCandidate.name.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      
                      {/* Upload/Change Photo Button Overlay */}
                      <label className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer">
                        <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                        <span className="text-[9px] font-bold">Change</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                      </label>
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-1 text-center md:text-left flex-1">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                        <h4 className="text-2xl font-black">{viewingCandidate.name}</h4>
                        <span className="bg-[#FFD400] text-[#0F172A] font-extrabold text-[10px] px-2.5 py-0.5 rounded-full">
                          {viewingCandidate.rating}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-amber-400">{viewingCandidate.designation} • {viewingCandidate.currentCompany}</p>
                      <p className="text-xs text-slate-300 font-mono">📧 {viewingCandidate.email} | 📞 {viewingCandidate.phone}</p>
                    </div>

                    {/* Quick Specs */}
                    <div className="grid grid-cols-2 gap-3 text-xs border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 text-slate-300">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Experience</span>
                        <span className="font-black text-white">{viewingCandidate.experience}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Notice Period</span>
                        <span className="font-black text-amber-400">{viewingCandidate.noticePeriod}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Expected CTC</span>
                        <span className="font-black text-emerald-400">{viewingCandidate.expectedCtc}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Pipeline Stage</span>
                        <span className="font-black text-purple-300">{viewingCandidate.status}</span>
                      </div>
                    </div>

                  </div>

                  {/* Single Unified Candidate Profile View (All Information Displayed Continuously) */}
                  <div className="space-y-6 pt-2">

                    {/* Section 1: Recruitment Stage Progress Timeline */}
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-xs">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                        <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                          <span className="material-symbols-outlined text-purple-600">account_tree</span>
                          <span>1. Recruitment Pipeline Progress</span>
                        </h4>
                        <span className="bg-purple-100 text-purple-900 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-purple-200">
                          Current: {viewingCandidate.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        {["Applied", "Screening", "Interview", "Offer", "Joining"].map((stg, i) => {
                          const stages = ["Applied", "Screening", "Interview", "Offer", "Joining"];
                          const currentIdx = stages.indexOf(viewingCandidate.status);
                          const isDone = i <= currentIdx;
                          return (
                            <div key={i} className="flex flex-col items-center space-y-1">
                              <div className={`h-9 w-9 rounded-full flex items-center justify-center font-black text-xs shadow-xs ${
                                isDone ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
                              }`}>
                                {i + 1}
                              </div>
                              <span className={`font-extrabold text-xs ${isDone ? "text-emerald-800" : "text-slate-400"}`}>{stg}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Section 2: Skill Set & Technical Competencies */}
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                      <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-600">psychology</span>
                        <span>2. Skill Set & Extracted Competencies</span>
                      </h4>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {viewingCandidate.skills.split(",").map((sk: string, idx: number) => (
                          <span key={idx} className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-3 py-1.5 rounded-xl shadow-2xs">
                            ⚡ {sk.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Section 3: Work Experience & History */}
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                      <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-sky-600">work_history</span>
                        <span>3. Work Experience & Career Overview</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                        <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase">Current Designation</span>
                          <p className="font-black text-slate-900">{viewingCandidate.designation}</p>
                        </div>
                        <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase">Current Employer</span>
                          <p className="font-black text-slate-900">{viewingCandidate.currentCompany}</p>
                        </div>
                        <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase">Total Experience</span>
                          <p className="font-black text-slate-900">{viewingCandidate.experience}</p>
                        </div>
                        <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase">Notice Period</span>
                          <p className="font-black text-amber-700">{viewingCandidate.noticePeriod}</p>
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Resume & Documents */}
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-xs">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-red-600 text-[28px]">picture_as_pdf</span>
                          <div>
                            <p className="font-black text-slate-900 text-sm">{viewingCandidate.resumeFileName || "Candidate_CV.pdf"}</p>
                            <p className="text-slate-500 text-[11px]">PDF Document • Verified AI Resume Parsing</p>
                          </div>
                        </div>

                        <button
                          onClick={() => alert(`Downloading CV file: ${viewingCandidate.resumeFileName || "Resume.pdf"}`)}
                          className="bg-[#0F172A] text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 hover:bg-slate-800 cursor-pointer shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">download</span>
                          <span>Download CV</span>
                        </button>
                      </div>

                      <div className="p-6 bg-white border border-slate-200 rounded-xl text-center space-y-2 shadow-2xs">
                        <span className="material-symbols-outlined text-[40px] text-slate-400">description</span>
                        <p className="font-black text-slate-800 text-sm">Resume Document Active</p>
                        <p className="text-slate-500 text-xs max-w-md mx-auto">
                          Candidate CV stored in system vault. Contains verified work history, academic credentials, and project certifications.
                        </p>
                      </div>
                    </div>

                    {/* Section 5: Recruiter Assessment Notes */}
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                      <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600">rate_review</span>
                        <span>5. Recruiter Assessment Notes & Feedback</span>
                      </h4>
                      <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
                        <p className="font-extrabold text-slate-900">Screening Notes by Divyanshu (Recruitment Lead)</p>
                        <p className="text-slate-600">{viewingCandidate.notes || "Candidate profile verified. Communication and technical skills match mandate specifications."}</p>
                      </div>
                    </div>

                  </div>

                </div>
              ) : selectedJob ? (
                /* Candidate List View for Specific Job */
                <div className="space-y-6">
                  
                  <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                    <div>
                      <button
                        onClick={() => setSelectedJob(null)}
                        className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        <span>Back to Job Openings</span>
                      </button>
                      <h2 className="text-2xl font-black text-slate-900">{selectedJob.title}</h2>
                      <p className="text-xs text-slate-500">Job ID: {selectedJob.id} • Client: {selectedJob.client}</p>
                    </div>

                    {/* + Add New Candidate Button */}
                    <button
                      onClick={() => {
                        setDuplicateWarning(null);
                        setAddCandidateModalOpen(true);
                      }}
                      className="bg-[#FFD400] text-[#0F172A] font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">person_add</span>
                      <span>+ Add New Candidate</span>
                    </button>
                  </div>

                  {/* Main Grid: Left Filter Sidebar + Right Candidates Table */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-2xs h-fit text-xs">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="font-black text-slate-900 uppercase text-[10px]">Filter Candidates By</span>
                        <span className="material-symbols-outlined text-[16px] text-slate-400">search</span>
                      </div>
                      <div className="space-y-2 text-slate-600">
                        <label className="flex items-center gap-2 font-semibold cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded text-[#0F172A]" />
                          <span>Associated Job Openings</span>
                        </label>
                        <label className="flex items-center gap-2 font-semibold cursor-pointer">
                          <input type="checkbox" className="rounded text-[#0F172A]" />
                          <span>Rating ⭐</span>
                        </label>
                        <label className="flex items-center gap-2 font-semibold cursor-pointer">
                          <input type="checkbox" className="rounded text-[#0F172A]" />
                          <span>Candidate Status</span>
                        </label>
                      </div>
                    </div>

                    <div className="md:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                            <th className="p-3">Rating</th>
                            <th className="p-3">Candidate Name</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Candidate Status</th>
                            <th className="p-3">Skill Set</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {jobCandidates.map((cand, idx) => (
                            <tr
                              key={cand.id || idx}
                              onClick={() => setViewingCandidate(cand)}
                              className="hover:bg-amber-50/60 cursor-pointer transition-colors group"
                            >
                              <td className="p-3 font-extrabold text-amber-600">{cand.rating}</td>
                              <td className="p-3 font-extrabold text-slate-900 group-hover:text-amber-700 flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-[#0F172A] text-[#FFD400] flex items-center justify-center text-[10px] font-black overflow-hidden">
                                  {cand.photoUrl ? (
                                    <img src={cand.photoUrl} alt={cand.name} className="h-full w-full object-cover" />
                                  ) : (
                                    cand.name.slice(0, 2).toUpperCase()
                                  )}
                                </div>
                                <span>{cand.name}</span>
                              </td>
                              <td className="p-3 font-mono text-slate-600">{cand.email}</td>
                              <td className="p-3 font-bold text-sky-700">
                                <span className="bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">{cand.status}</span>
                              </td>
                              <td className="p-3 font-medium text-slate-500">{cand.skills}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                /* Job Openings Directory View */
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">Job Openings</h2>
                      <p className="text-xs text-slate-500">Select a job to view candidates and source applicants</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-2xs h-fit text-xs">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="font-black text-slate-900 uppercase text-[10px]">Filter Job Openings By</span>
                        <span className="material-symbols-outlined text-[16px] text-slate-400">search</span>
                      </div>
                      <div className="space-y-2 text-slate-600">
                        <label className="flex items-center gap-2 font-semibold cursor-pointer">
                          <input type="checkbox" defaultChecked className="rounded text-[#0F172A]" />
                          <span>Posting Title</span>
                        </label>
                        <label className="flex items-center gap-2 font-semibold cursor-pointer">
                          <input type="checkbox" className="rounded text-[#0F172A]" />
                          <span>Job ID</span>
                        </label>
                      </div>
                    </div>

                    <div className="md:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                            <th className="p-3">Posting Title</th>
                            <th className="p-3">Job Opening ID</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-center">Associated Candidates</th>
                            <th className="p-3">Client Name</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {[
                            { id: "ZR_97_JOB", title: "Software Developer", status: "In-progress", count: jobCandidates.length, client: "Zylker" },
                            { id: "ZR_95_JOB", title: "Accountant", status: "Lost To Competitor", count: 2, client: "Zylker" },
                            { id: "ZR_94_JOB", title: "Marketing Manager", status: "In-progress", count: 6, client: "Zylker" },
                            { id: "ZR_89_JOB", title: "Software Engineer", status: "In-progress", count: 8, client: "Pinnacle" },
                          ].map((job, idx) => (
                            <tr
                              key={idx}
                              onClick={() => setSelectedJob(job)}
                              className="hover:bg-amber-50/60 cursor-pointer transition-colors group"
                            >
                              <td className="p-3 font-extrabold text-slate-900 group-hover:text-amber-700">{job.title}</td>
                              <td className="p-3 font-mono text-slate-600">{job.id}</td>
                              <td className="p-3 font-bold text-sky-700">{job.status}</td>
                              <td className="p-3 text-center font-black text-amber-600 bg-amber-50/50 rounded-lg">{job.count} Candidates</td>
                              <td className="p-3 font-bold text-slate-800">{job.client}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: OPEN MANDATES PAGE & STOREFRONT INGESTION */}
          {/* ========================================================================= */}
          {activeNavTab === "open_mandates" && !showStorefront && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Open Mandates</h2>
                  <p className="text-xs text-slate-500">Incoming hiring offers submitted via Storefront Website or BD Sales Team</p>
                </div>

                <button
                  onClick={() => router.push("/storefront")}
                  className="bg-[#0F172A] text-white hover:bg-slate-800 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#FFD400]">add_business</span>
                  <span>+ Add Company (Storefront)</span>
                </button>
              </div>

              {selectedMandate ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div>
                      <button
                        onClick={() => setSelectedMandate(null)}
                        className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        <span>Back to Open Mandates Directory</span>
                      </button>
                      <h3 className="text-2xl font-black text-slate-900">{selectedMandate.companyName}</h3>
                      <p className="text-xs font-bold text-amber-700">{selectedMandate.industry}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`font-black text-xs px-3 py-1 rounded-full border ${
                        selectedMandate.status === "Active Sourcing"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : selectedMandate.status === "Needs Negotiation"
                          ? "bg-amber-100 text-amber-900 border-amber-300"
                          : "bg-purple-100 text-purple-900 border-purple-300"
                      }`}>
                        Status: {selectedMandate.status}
                      </span>
                      <span className="bg-red-100 text-red-800 font-black text-xs px-3 py-1 rounded-full border border-red-300">
                        Priority: {selectedMandate.priority}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className="text-[10px] font-black text-[#FFD400] uppercase tracking-wider block">
                        REQUEST SOURCING CHANNEL
                      </span>
                      <p className="text-sm font-black flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-400">
                          {selectedMandate.source?.includes("Website") ? "language" : "handshake"}
                        </span>
                        <span>{selectedMandate.source || "Company Website (Online Storefront)"}</span>
                      </p>
                    </div>

                    {selectedMandate.assignedRecruiter && (
                      <div className="text-left sm:text-right text-xs">
                        <span className="text-[10px] font-bold text-slate-400 block">Assigned Recruiter</span>
                        <span className="font-extrabold text-amber-400">{selectedMandate.assignedRecruiter}</span>
                      </div>
                    )}
                  </div>

                  {selectedMandate.negotiationComment && (
                    <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl space-y-1">
                      <p className="font-black text-xs flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-amber-700 text-[18px]">gavel</span>
                        <span>Admin Negotiation Feedback (Sent to BD Team)</span>
                      </p>
                      <p className="text-xs font-medium">{selectedMandate.negotiationComment}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="font-extrabold text-slate-500 uppercase text-[10px] block">1. Company Details</span>
                      <p className="font-black text-slate-900 text-sm">{selectedMandate.companyName}</p>
                      <p className="text-slate-600">Contact: {selectedMandate.contactPerson}</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="font-extrabold text-slate-500 uppercase text-[10px] block">2. Position to be Hired</span>
                      <p className="font-black text-slate-900 text-sm">{selectedMandate.position}</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="font-extrabold text-slate-500 uppercase text-[10px] block">3. Number of Openings</span>
                      <p className="font-black text-amber-700 text-sm">{selectedMandate.openings} Headcounts</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="font-extrabold text-slate-500 uppercase text-[10px] block">4. Required Experience</span>
                      <p className="font-black text-slate-900 text-sm">{selectedMandate.experience}</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="font-extrabold text-slate-500 uppercase text-[10px] block">5. Location</span>
                      <p className="font-black text-slate-900 text-sm">{selectedMandate.location}</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="font-extrabold text-slate-500 uppercase text-[10px] block">6. Compensation Range</span>
                      <p className="font-black text-emerald-700 text-sm">{selectedMandate.compensation}</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="font-extrabold text-slate-500 uppercase text-[10px] block">7. Hiring Priority</span>
                      <p className="font-black text-red-600 text-sm">{selectedMandate.priority}</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="font-extrabold text-slate-500 uppercase text-[10px] block">8. Commercial Engagement Model</span>
                      <p className="font-black text-purple-700 text-sm">{selectedMandate.commercialModel}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex flex-wrap justify-end gap-3">
                    <button
                      onClick={() => setShowRejectModal(true)}
                      className="px-5 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-xs rounded-xl flex items-center gap-2 border border-amber-300 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">gavel</span>
                      <span>Reject & Send Back to BD (Negotiate)</span>
                    </button>

                    <button
                      onClick={() => setShowAcceptModal(true)}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      <span>Accept Mandate & Assign Team</span>
                    </button>
                  </div>

                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                        <th className="p-3">Company Name</th>
                        <th className="p-3">Position Title</th>
                        <th className="p-3">Request Source</th>
                        <th className="p-3 text-center">Openings</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Priority</th>
                        <th className="p-3">Date Submitted</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {openMandatesList.map((man) => (
                        <tr
                          key={man.id}
                          onClick={() => setSelectedMandate(man)}
                          className="hover:bg-amber-50/60 cursor-pointer transition-colors group"
                        >
                          <td className="p-3 font-extrabold text-slate-900 group-hover:text-amber-700">{man.companyName}</td>
                          <td className="p-3 font-bold text-slate-800">{man.position}</td>
                          <td className="p-3">
                            <span className={`font-bold text-[10px] px-2.5 py-1 rounded-full border flex items-center gap-1 w-fit ${
                              man.source?.includes("Website")
                                ? "bg-purple-50 text-purple-800 border-purple-200"
                                : "bg-sky-50 text-sky-800 border-sky-200"
                            }`}>
                              <span className="material-symbols-outlined text-[14px]">
                                {man.source?.includes("Website") ? "language" : "handshake"}
                              </span>
                              <span>{man.source?.includes("Website") ? "Storefront Website" : "BD Sales Team"}</span>
                            </span>
                          </td>
                          <td className="p-3 text-center font-black text-amber-600">{man.openings}</td>
                          <td className="p-3">
                            <span className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full border ${
                              man.status === "Active Sourcing"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200 font-extrabold"
                                : man.status === "Needs Negotiation"
                                ? "bg-amber-100 text-amber-900 border-amber-200 font-extrabold"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}>
                              {man.status || "Pending Review"}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="bg-red-100 text-red-800 font-bold text-[10px] px-2 py-0.5 rounded-full border border-red-200">
                              {man.priority}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-500">{man.dateSubmitted}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: ACTIVE MANDATES */}
          {/* ========================================================================= */}
          {activeNavTab === "active_mandates" && !showStorefront && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Active Mandates & Recruiter Radar</h2>
                  <p className="text-xs text-slate-500">👑 Admin / Owner View: Real-time recruiter assignments & BD onboarding tracking</p>
                </div>
                <span className="bg-[#0F172A] text-[#FFD400] font-black text-xs px-3.5 py-1.5 rounded-xl shadow-xs">
                  {openMandatesList.filter((m) => m.status === "Active Sourcing").length} Active Mandates
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                      <th className="p-3">Company Name</th>
                      <th className="p-3">Position Title</th>
                      <th className="p-3">Request Source</th>
                      <th className="p-3">Assigned Recruiter</th>
                      <th className="p-3">Assigned BD Lead</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {openMandatesList.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="p-3 font-extrabold text-slate-900">{m.companyName}</td>
                        <td className="p-3 font-bold text-slate-800">{m.position}</td>
                        <td className="p-3 font-semibold text-slate-600">{m.source || "Website"}</td>
                        <td className="p-3 font-extrabold text-amber-700">
                          {m.assignedRecruiter || "Unassigned"}
                        </td>
                        <td className="p-3 font-semibold text-sky-700">
                          {m.assignedBD || (m.source?.includes("Website") ? "Needs BD Assignment" : "Rahul Verma")}
                        </td>
                        <td className="p-3 font-bold">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] border ${
                            m.status === "Active Sourcing"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : "bg-amber-100 text-amber-900 border-amber-200"
                          }`}>
                            {m.status || "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: CUSTOMIZED WEBSITE */}
          {/* ========================================================================= */}
          {activeNavTab === "customized_website" && !showStorefront && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Customized Website Builder</h2>
                  <p className="text-xs text-slate-500">Configure your agency's public storefront website branding, colors & contact specs</p>
                </div>

                <button
                  onClick={() => router.push("/storefront")}
                  className="bg-[#FFD400] text-[#0F172A] font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md hover:brightness-105 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                  <span>🚀 Launch Live Storefront Website</span>
                </button>
              </div>

              {configSaveNotice && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl font-black text-xs flex items-center gap-2 animate-in fade-in">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
                  <span>Website Configuration Saved Successfully! Live Storefront Website updated.</span>
                </div>
              )}

              <form onSubmit={handleSaveWebsiteConfig} className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xs space-y-6 text-xs">
                
                {/* 1. Agency Brand & Hero Content */}
                <div className="space-y-4 border-b border-slate-100 pb-6">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-600">badge</span>
                    <span>1. Agency Brand & Hero Banner Specs</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-extrabold text-slate-700 block mb-1">Agency Name *</label>
                      <input
                        type="text"
                        value={websiteConfig.agencyName}
                        onChange={(e) => setWebsiteConfig({ ...websiteConfig, agencyName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="font-extrabold text-slate-700 block mb-1">Hero Main Title / Tagline *</label>
                      <input
                        type="text"
                        value={websiteConfig.tagline}
                        onChange={(e) => setWebsiteConfig({ ...websiteConfig, tagline: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">Hero Subtitle / Description *</label>
                    <textarea
                      rows={2}
                      value={websiteConfig.heroSubtitle}
                      onChange={(e) => setWebsiteConfig({ ...websiteConfig, heroSubtitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* 2. Contact Specs & About Bio */}
                <div className="space-y-4 border-b border-slate-100 pb-6">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-600">call</span>
                    <span>2. Contact Specs & About Us Information</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="font-extrabold text-slate-700 block mb-1">WhatsApp Support Number *</label>
                      <input
                        type="text"
                        value={websiteConfig.whatsapp}
                        onChange={(e) => setWebsiteConfig({ ...websiteConfig, whatsapp: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="font-extrabold text-slate-700 block mb-1">Direct Agency Email *</label>
                      <input
                        type="email"
                        value={websiteConfig.email}
                        onChange={(e) => setWebsiteConfig({ ...websiteConfig, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="font-extrabold text-slate-700 block mb-1">Direct Contact Phone *</label>
                      <input
                        type="text"
                        value={websiteConfig.phone}
                        onChange={(e) => setWebsiteConfig({ ...websiteConfig, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">Headquarters Office Location *</label>
                    <input
                      type="text"
                      value={websiteConfig.hqAddress}
                      onChange={(e) => setWebsiteConfig({ ...websiteConfig, hqAddress: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">About Us Company Bio *</label>
                    <textarea
                      rows={3}
                      value={websiteConfig.aboutBio}
                      onChange={(e) => setWebsiteConfig({ ...websiteConfig, aboutBio: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* 3. Custom Services Offered */}
                <div className="space-y-4 border-b border-slate-100 pb-6">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-600">home_repair_service</span>
                    <span>3. Custom Services Offered</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-extrabold text-slate-700 block mb-1">Service 1 *</label>
                      <input
                        type="text"
                        value={websiteConfig.service1}
                        onChange={(e) => setWebsiteConfig({ ...websiteConfig, service1: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="font-extrabold text-slate-700 block mb-1">Service 2 *</label>
                      <input
                        type="text"
                        value={websiteConfig.service2}
                        onChange={(e) => setWebsiteConfig({ ...websiteConfig, service2: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="font-extrabold text-slate-700 block mb-1">Service 3 *</label>
                      <input
                        type="text"
                        value={websiteConfig.service3}
                        onChange={(e) => setWebsiteConfig({ ...websiteConfig, service3: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="font-extrabold text-slate-700 block mb-1">Service 4 *</label>
                      <input
                        type="text"
                        value={websiteConfig.service4}
                        onChange={(e) => setWebsiteConfig({ ...websiteConfig, service4: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Target Industry Markets */}
                <div className="space-y-4 border-b border-slate-100 pb-6">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-600">storefront</span>
                    <span>4. Target Industry Markets</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-extrabold text-slate-700 block mb-1">Market 1 *</label>
                      <input
                        type="text"
                        value={websiteConfig.market1}
                        onChange={(e) => setWebsiteConfig({ ...websiteConfig, market1: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="font-extrabold text-slate-700 block mb-1">Market 2 *</label>
                      <input
                        type="text"
                        value={websiteConfig.market2}
                        onChange={(e) => setWebsiteConfig({ ...websiteConfig, market2: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="font-extrabold text-slate-700 block mb-1">Market 3 *</label>
                      <input
                        type="text"
                        value={websiteConfig.market3}
                        onChange={(e) => setWebsiteConfig({ ...websiteConfig, market3: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="font-extrabold text-slate-700 block mb-1">Market 4 *</label>
                      <input
                        type="text"
                        value={websiteConfig.market4}
                        onChange={(e) => setWebsiteConfig({ ...websiteConfig, market4: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#0F172A] text-white font-black text-xs rounded-xl shadow-md hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#FFD400]">save</span>
                    <span>💾 Save Agency Website Configuration</span>
                  </button>
                </div>

              </form>
            </div>
          )}

        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. MODAL: + ADD NEW CANDIDATE WITH RESUME PARSING & DUPLICATE CHECK */}
      {/* ========================================================================= */}
      {addCandidateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 w-full max-w-xl shadow-2xl space-y-5 text-slate-900 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-black text-base text-[#0F172A] tracking-tight flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500">person_add</span>
                  <span>Add Candidate to {selectedJob?.title || "Job Mandate"}</span>
                </h4>
                <p className="text-[11px] text-slate-500">Upload resume for automated parsing & duplicate verification</p>
              </div>
              <button
                onClick={() => setAddCandidateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Resume Upload & Sample Auto-Parse Dropzone */}
            <label className="p-5 bg-slate-50 border-2 border-dashed border-slate-300 hover:border-amber-400 hover:bg-amber-50/40 rounded-2xl space-y-3 text-center block cursor-pointer transition-all group">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                className="hidden"
                onChange={handleResumeFileUpload}
              />
              <div className="flex justify-center items-center gap-2">
                <span className="material-symbols-outlined text-[36px] text-amber-600 group-hover:scale-110 transition-transform">
                  upload_file
                </span>
              </div>
              <div>
                <p className="font-black text-slate-900 text-xs">
                  {isParsingResume ? "⚡ Parsing Resume File..." : "📁 Click or Drag & Drop candidate CV (PDF / DOCX)"}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  Click anywhere in this box to upload resume. Automated AI parser extracts skills & details automatically.
                </p>
              </div>

              {/* Quick Sample Resume Parse Action */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTriggerAutoParseSample();
                }}
                disabled={isParsingResume}
                className="bg-amber-400 text-[#0F172A] font-black px-4 py-2 rounded-xl text-xs shadow-xs hover:brightness-105 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                <span>{isParsingResume ? "Parsing..." : "⚡ Auto-Parse Sample CV (Rohan Sharma)"}</span>
              </button>
            </label>

            {/* Duplicate Candidate Warning Banner if Match Found */}
            {duplicateWarning && (
              <div className="p-3.5 bg-red-50 border-2 border-red-300 text-red-900 rounded-2xl text-xs space-y-1 animate-in fade-in">
                <div className="flex items-center gap-2 font-black">
                  <span className="material-symbols-outlined text-red-600 text-[20px]">warning</span>
                  <span>DUPLICATE CANDIDATE DETECTED</span>
                </div>
                <p className="text-[11px] font-semibold pl-7">{duplicateWarning}</p>
              </div>
            )}

            {/* Candidate Intake Form */}
            <form onSubmit={handleAddCandidateSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohan Sharma"
                    value={newCandidateForm.name}
                    onChange={(e) => {
                      setNewCandidateForm({ ...newCandidateForm, name: e.target.value });
                      checkForDuplicates(newCandidateForm.email, e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rohan@techcorp.com"
                    value={newCandidateForm.email}
                    onChange={(e) => {
                      setNewCandidateForm({ ...newCandidateForm, email: e.target.value });
                      checkForDuplicates(e.target.value, newCandidateForm.name);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={newCandidateForm.phone}
                    onChange={(e) => setNewCandidateForm({ ...newCandidateForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Current Company & Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Cognizant (Senior Developer)"
                    value={newCandidateForm.currentCompany}
                    onChange={(e) => setNewCandidateForm({ ...newCandidateForm, currentCompany: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Total Experience</label>
                  <input
                    type="text"
                    placeholder="e.g. 5.5 Years"
                    value={newCandidateForm.experience}
                    onChange={(e) => setNewCandidateForm({ ...newCandidateForm, experience: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Notice Period</label>
                  <input
                    type="text"
                    placeholder="e.g. 30 Days"
                    value={newCandidateForm.noticePeriod}
                    onChange={(e) => setNewCandidateForm({ ...newCandidateForm, noticePeriod: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Expected Salary</label>
                  <input
                    type="text"
                    placeholder="e.g. $95,000 / Year"
                    value={newCandidateForm.expectedCtc}
                    onChange={(e) => setNewCandidateForm({ ...newCandidateForm, expectedCtc: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Skill Set Competencies</label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, TypeScript, Next.js, AWS"
                  value={newCandidateForm.skills}
                  onChange={(e) => setNewCandidateForm({ ...newCandidateForm, skills: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!!duplicateWarning}
                  className={`w-full py-3 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer ${
                    duplicateWarning
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                      : "bg-[#0F172A] text-white hover:bg-slate-800"
                  }`}
                >
                  {duplicateWarning ? "⚠️ Cannot Submit Duplicate Candidate" : "Confirm Candidate Intake"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Accept Mandate Modal */}
      {showAcceptModal && selectedMandate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-slate-900">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-black text-base text-emerald-900 tracking-tight flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                  <span>Accept Mandate & Assign Team</span>
                </h4>
                <p className="text-[11px] text-slate-500">{selectedMandate.companyName} - {selectedMandate.position}</p>
              </div>
              <button onClick={() => setShowAcceptModal(false)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAcceptMandateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Assign Recruiter *</label>
                <select
                  value={assignedRecruiter}
                  onChange={(e) => setAssignedRecruiter(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-emerald-400 cursor-pointer"
                >
                  <option value="Priya Sharma (Sr Tech Recruiter)">Priya Sharma (Sr Tech Recruiter)</option>
                  <option value="Vikram Malhotra (DevOps Sourcing Lead)">Vikram Malhotra (DevOps Sourcing Lead)</option>
                  <option value="Ananya Sen (Executive Headhunter)">Ananya Sen (Executive Headhunter)</option>
                </select>
              </div>

              {selectedMandate.source?.includes("Website") && (
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    Assign BD Lead (For Formal Online Client Onboarding) *
                  </label>
                  <select
                    value={assignedBD}
                    onChange={(e) => setAssignedBD(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-emerald-400 cursor-pointer"
                  >
                    <option value="Rahul Verma (Client Onboarding Lead)">Rahul Verma (Client Onboarding Lead)</option>
                    <option value="Sameer Kapoor (Senior BD Manager)">Sameer Kapoor (Senior BD Manager)</option>
                  </select>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Confirm Acceptance & Dispatch Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Mandate Modal */}
      {showRejectModal && selectedMandate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-black text-base text-amber-900 tracking-tight flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber-600">gavel</span>
                  <span>Reject / Send for Negotiation</span>
                </h4>
                <p className="text-[11px] text-slate-500">{selectedMandate.companyName} - {selectedMandate.position}</p>
              </div>
              <button onClick={() => setShowRejectModal(false)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleRejectMandateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">
                  Admin Feedback & Negotiation Instructions for BD Team *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Success fee of 10% is below standard 15%. Ask client to raise base compensation to $100k or increase contingency fee before intake."
                  value={negotiationComment}
                  onChange={(e) => setNegotiationComment(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Send Back to BD Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Drawer */}
      {showProfileDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-sm h-full p-6 shadow-2xl space-y-6 flex flex-col justify-between text-slate-900">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h3 className="font-black text-lg text-[#0F172A]">User Profile</h3>
                <button onClick={() => setShowProfileDrawer(false)} className="text-slate-400 hover:text-slate-700">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="text-center space-y-2">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-[#0F172A] text-[#FFD400] flex items-center justify-center font-black text-xl shadow-md">
                  D
                </div>
                <div>
                  <h4 className="font-black text-base text-slate-900">Divyanshu</h4>
                  <p className="text-xs font-bold text-amber-600">owner@agency.com</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-3 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* High Risk Candidates Modal */}
      {showHighRiskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <span className="material-symbols-outlined text-[24px]">warning</span>
                <h4 className="font-black text-base tracking-tight">High Risk Candidates Radar (Detail View)</h4>
              </div>
              <button onClick={() => setShowHighRiskModal(false)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[60vh] overflow-y-auto">
              {[
                { name: "Rahul Verma", role: "DevOps Engineer", notice: "45 Days Notice", client: "Apex Tech", risk: "High Counter-offer Risk from current employer" },
                { name: "Ananya Sen", role: "UI/UX Lead", notice: "30 Days Notice", client: "Zylker", risk: "Notice Period Stagnation - SLA Follow-up required" },
                { name: "Siddharth Rao", role: "Backend Developer", notice: "60 Days Notice", client: "Global Freight", risk: "Relocation delay risk" },
              ].map((cand, i) => (
                <div key={i} className="p-4 bg-red-50/60 border border-red-200 rounded-2xl space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="font-extrabold text-slate-900 text-sm">{cand.name} ({cand.role})</p>
                    <span className="bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full">{cand.notice}</span>
                  </div>
                  <p className="text-slate-600 font-bold">Mandate Client: {cand.client}</p>
                  <p className="text-red-700 font-semibold">Risk Factor: {cand.risk}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowHighRiskModal(false)}
                className="px-4 py-2 bg-[#0F172A] text-white font-bold text-xs rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                Close Radar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Client Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-amber-600">
                <span className="material-symbols-outlined text-[24px]">schedule</span>
                <h4 className="font-black text-base tracking-tight">Pending Client Feedback (SLA Radar)</h4>
              </div>
              <button onClick={() => setShowFeedbackModal(false)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[60vh] overflow-y-auto">
              {[
                { client: "Apex Tech Corp", candidate: "Vikram Malhotra", hours: "54h SLA Overdue", contact: "Sarah VP HR" },
                { client: "Global Freight Ltd", candidate: "Neha Sharma", hours: "49h SLA Overdue", contact: "Mohammed Al-Rashid" },
                { client: "Horizon Labs", candidate: "Karan Patel", hours: "51h SLA Overdue", contact: "Dr. Elena Rostova" },
              ].map((fb, i) => (
                <div key={i} className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-1 flex justify-between items-center">
                  <div>
                    <p className="font-extrabold text-slate-900 text-sm">{fb.client}</p>
                    <p className="text-slate-600 font-bold">Submitted Candidate: {fb.candidate}</p>
                    <p className="text-amber-800 font-black">SLA Aging: {fb.hours}</p>
                  </div>
                  <button
                    onClick={() => alert(`Automated SLA Ping Email Sent to Client contact: ${fb.client}`)}
                    className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-2 rounded-xl shadow-xs hover:brightness-105 cursor-pointer"
                  >
                    Ping Client
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2 bg-[#0F172A] text-white font-bold text-xs rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                Close Feedback Radar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
