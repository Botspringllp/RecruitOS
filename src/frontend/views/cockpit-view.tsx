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
  const [addCandidateModalOpen, setAddCandidateModalOpen] = useState(false);
  const [newCandidateForm, setNewCandidateForm] = useState({
    name: "",
    email: "",
    status: "New",
    rating: "4.0 ⭐",
    skills: "",
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

  // Initial Mandates List State (with Source, Status, and Negotiation Comments)
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
    heroSubtitle: "Connecting world-class talent with industry leaders across the UAE, KSA, and beyond. We combine local market intelligence with a global search footprint.",
    whatsapp: "+971 50 123 4567",
    email: "mandates@apexpartners.ae",
    hqAddress: "Level 24, ADGM Square, Maryah Island, Abu Dhabi, UAE",
    themeColor: "stitch",
    enableFinancial: true,
    enableTech: true,
    enableStrategy: true,
    enableLifeSciences: true,
  });
  const [configSaveNotice, setConfigSaveNotice] = useState(false);

  // Load agency website config from localStorage on mount
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

  const toggleTask = (id: number) => {
    setMyTasks(myTasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const handleLogout = () => {
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  const handleAddCandidateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Candidate ${newCandidateForm.name} added to ${selectedJob?.title || "Job Mandate"}!`);
    setAddCandidateModalOpen(false);
    setNewCandidateForm({ name: "", email: "", status: "New", rating: "4.0 ⭐", skills: "" });
  };

  // Accept Mandate Handler (Assigns Recruiter + BD, sends email notification)
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

    // Trigger Automated Email Dispatch Notification Banner
    const isOnline = selectedMandate.source?.includes("Website");
    const noticeText = isOnline
      ? `✉️ Automated Email Dispatched: Recruiter (${assignedRecruiter}) assigned for sourcing & BD Officer (${assignedBD}) assigned for client onboarding!`
      : `✉️ Automated Email Dispatched to BD Team & Recruiter (${assignedRecruiter}) for active sourcing!`;

    setEmailNoticeBanner(noticeText);
    setTimeout(() => setEmailNoticeBanner(null), 5000);
  };

  // Reject / Negotiate Mandate Handler (Routes back to BD team with Admin comments)
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

          {/* Navigation Options (Interviews & Reports removed as requested) */}
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
          {/* Search Bar */}
          <div className="flex items-center gap-3 bg-slate-100/80 border border-slate-200 rounded-xl px-4 py-2 w-full max-w-md focus-within:ring-2 focus-within:ring-amber-400 focus-within:bg-white transition-all">
            <span className="material-symbols-outlined text-[20px] text-slate-400">search</span>
            <input
              type="text"
              placeholder="Search Candidate, Requirement, Client, Interview..."
              className="bg-transparent border-none text-xs text-slate-800 focus:outline-none w-full font-medium"
            />
          </div>

          {/* Right Actions & Profile */}
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

            {/* Profile Drawer Trigger (Shows ONLY First Name 'Divyanshu') */}
            <div
              onClick={() => setShowProfileDrawer(true)}
              className="flex items-center gap-3 cursor-pointer p-1 rounded-xl hover:bg-slate-100 transition-all"
            >
              <div className="h-9 w-9 rounded-xl bg-[#0F172A] text-[#FFD400] flex items-center justify-center font-black text-xs shadow-sm">
                DS
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
              
              {/* Welcome Section */}
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

              {/* Recruitment Pipeline Snapshot (Stage 1 is Shortlisted with Date Selector) */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">Candidate Pipeline Snapshot</h3>
                    <p className="text-xs text-slate-500">Live SLA aging breakdown across hiring stages</p>
                  </div>

                  {/* Date Selector Dropdown */}
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
                      <option value="Custom">Custom Range</option>
                    </select>
                  </div>
                </div>

                {/* Pipeline Flow Stages */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { stage: "Shortlisted", count: 120, color: "border-purple-300 bg-purple-50 text-purple-900" },
                    { stage: "Screening", count: 80, color: "border-sky-300 bg-sky-50 text-sky-900" },
                    { stage: "Interview", count: 35, color: "border-amber-300 bg-amber-50 text-amber-900" },
                    { stage: "Offer", count: 12, color: "border-indigo-300 bg-indigo-50 text-indigo-900" },
                    { stage: "Joining", count: 7, color: "border-emerald-300 bg-emerald-50 text-emerald-900" },
                  ].map((item, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl border ${item.color} space-y-1 shadow-2xs`}>
                      <span className="text-[10px] font-black uppercase tracking-widest block opacity-75">{item.stage}</span>
                      <p className="text-2xl font-black">{item.count}</p>
                      <p className="text-[10px] font-bold opacity-80">Candidates active</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid Layout: High Risk Candidates & Pending Client Feedback */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* High Risk Candidates Section */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-600">
                      <span className="material-symbols-outlined text-[22px]">warning</span>
                      <h3 className="text-base font-black text-slate-900">High Risk Candidates</h3>
                    </div>
                    {/* Sub-text explanation as requested */}
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
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

                {/* Pending Client Feedback Section */}
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

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: JOBS PAGE (Parent-child flow: Job Openings -> Candidate Directory) */}
          {/* ========================================================================= */}
          {activeNavTab === "jobs" && !showStorefront && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {selectedJob ? (
                /* Candidate List View for Specific Job (Matching Image 1) */
                <div className="space-y-6">
                  
                  {/* Top Bar with Job Title and + Add New Candidate Button */}
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

                    {/* + Add New Candidate Button (Located on candidate view page) */}
                    <button
                      onClick={() => setAddCandidateModalOpen(true)}
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
                          {[
                            { name: "Christina Thomas", email: "christina@prmail.com", status: "New", rating: "3.0 ⭐", skills: "Writing, Social Media, Marketing" },
                            { name: "Will James", email: "willjames@icloud.com", status: "Interview-Scheduled", rating: "5.0 ⭐", skills: "React, Node.js, TypeScript" },
                            { name: "Cooper", email: "cooper@yymail.com", status: "Associated", rating: "5.0 ⭐", skills: "UI/UX, Figma, Tailwind" },
                            { name: "Aron Ramsey", email: "aron@icloud.com", status: "Interview-Scheduled", rating: "5.0 ⭐", skills: "Product Strategy, Analytics" },
                            { name: "Satish Chauhan", email: "satish@gmail.com", status: "Associated", rating: "4.0 ⭐", skills: "Cold Calling, B2B Sales" },
                          ].map((cand, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-3 font-extrabold text-amber-600">{cand.rating}</td>
                              <td className="p-3 font-extrabold text-slate-900">{cand.name}</td>
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
                /* Job Openings Directory View (Matching Image 2) */
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
                        <label className="flex items-center gap-2 font-semibold cursor-pointer">
                          <input type="checkbox" className="rounded text-[#0F172A]" />
                          <span>Job Opening Status</span>
                        </label>
                        <label className="flex items-center gap-2 font-semibold cursor-pointer">
                          <input type="checkbox" className="rounded text-[#0F172A]" />
                          <span>Client Name</span>
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
                            { id: "ZR_97_JOB", title: "Software Developer", status: "In-progress", count: 12, client: "Zylker" },
                            { id: "ZR_95_JOB", title: "Accountant", status: "Lost To Competitor", count: 2, client: "Zylker" },
                            { id: "ZR_94_JOB", title: "Marketing Manager", status: "In-progress", count: 6, client: "Zylker" },
                            { id: "ZR_89_JOB", title: "Software Engineer", status: "In-progress", count: 8, client: "Pinnacle" },
                            { id: "ZR_88_JOB", title: "Sales Executive", status: "Submitted by client", count: 11, client: "Avon Products Inc" },
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
              
              {/* Header */}
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

              {/* Mandate Details View if Selected */}
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

                    {/* Status & Priority Badges */}
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

                  {/* Mandate Request Source Banner */}
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

                  {/* Admin Negotiation Comment Warning Banner if Present */}
                  {selectedMandate.negotiationComment && (
                    <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl space-y-1">
                      <p className="font-black text-xs flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-amber-700 text-[18px]">gavel</span>
                        <span>Admin Negotiation Feedback (Sent to BD Team)</span>
                      </p>
                      <p className="text-xs font-medium">{selectedMandate.negotiationComment}</p>
                    </div>
                  )}

                  {/* 8 Required Mandate Details Fields */}
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

                  {/* Actions: Accept & Assign Recruiter / Reject & Send to BD */}
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
                /* Open Mandates Directory List */
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

                          {/* Source Column */}
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

                          {/* Status Column */}
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
          {/* TAB 4: ACTIVE MANDATES (RENAMED FROM NEW MANDATES) */}
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
          {/* TAB 5: CUSTOMIZED WEBSITE (AGENCY STOREFRONT BUILDER FEATURE) */}
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

              {/* Customizer Form */}
              <form onSubmit={handleSaveWebsiteConfig} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-6 text-xs">
                
                {/* 1. Branding Header */}
                <div className="space-y-3 border-b border-slate-100 pb-5">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-600">badge</span>
                    <span>1. Agency Brand & Hero Content</span>
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
                      <label className="font-extrabold text-slate-700 block mb-1">Hero Headline Tagline *</label>
                      <input
                        type="text"
                        value={websiteConfig.tagline}
                        onChange={(e) => setWebsiteConfig({ ...websiteConfig, tagline: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">Hero Subtitle Paragraph *</label>
                    <textarea
                      rows={2}
                      value={websiteConfig.heroSubtitle}
                      onChange={(e) => setWebsiteConfig({ ...websiteConfig, heroSubtitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* 2. Contact Information Specs */}
                <div className="space-y-3 border-b border-slate-100 pb-5">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-600">call</span>
                    <span>2. Contact Information Specs (About Section & Footer)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">Headquarters Address *</label>
                    <input
                      type="text"
                      value={websiteConfig.hqAddress}
                      onChange={(e) => setWebsiteConfig({ ...websiteConfig, hqAddress: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* 3. Practice Sectors Toggles */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-600">category</span>
                    <span>3. Enable/Disable Practice Sector Cards</span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700 font-bold">
                    <label className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={websiteConfig.enableFinancial}
                        onChange={(e) => setWebsiteConfig({ ...websiteConfig, enableFinancial: e.target.checked })}
                        className="rounded text-[#0F172A]"
                      />
                      <span>Financial Services</span>
                    </label>

                    <label className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={websiteConfig.enableTech}
                        onChange={(e) => setWebsiteConfig({ ...websiteConfig, enableTech: e.target.checked })}
                        className="rounded text-[#0F172A]"
                      />
                      <span>Technology & AI</span>
                    </label>

                    <label className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={websiteConfig.enableStrategy}
                        onChange={(e) => setWebsiteConfig({ ...websiteConfig, enableStrategy: e.target.checked })}
                        className="rounded text-[#0F172A]"
                      />
                      <span>Strategy & Infra</span>
                    </label>

                    <label className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={websiteConfig.enableLifeSciences}
                        onChange={(e) => setWebsiteConfig({ ...websiteConfig, enableLifeSciences: e.target.checked })}
                        className="rounded text-[#0F172A]"
                      />
                      <span>Life Sciences</span>
                    </label>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#0F172A] text-white font-black text-xs rounded-xl shadow-md hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center gap-2"
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
      {/* 3. ACCEPT MANDATE MODAL (ASSIGN RECRUITER & BD + EMAIL NOTICE) */}
      {/* ========================================================================= */}
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
              
              {/* Recruiter Selector */}
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

              {/* BD Selector if Online Storefront */}
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

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px]">
                <p className="font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-emerald-700">mark_email_read</span>
                  <span>Automated Notification Trigger</span>
                </p>
                <p className="text-emerald-700 mt-0.5">
                  Submitting will automatically send an assignment email to BD Team & Recruiter.
                </p>
              </div>

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

      {/* ========================================================================= */}
      {/* 4. REJECT / NEGOTIATE MANDATE MODAL (ADMIN COMMENTS TO BD TEAM) */}
      {/* ========================================================================= */}
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

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px]">
                <p className="font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-amber-700">swap_horizontal_circle</span>
                  <span>Route Back to BD Sales Queue</span>
                </p>
                <p className="text-amber-800 mt-0.5">
                  This mandate will be marked as Needs Negotiation and sent back to the BD Sales Representative.
                </p>
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
                  DS
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
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-4 text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-black text-base text-red-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-red-600">warning</span>
                  <span>High Risk Candidates Radar</span>
                </h4>
                <p className="text-[11px] text-slate-500">Candidates with accepted offers currently serving notice periods</p>
              </div>
              <button onClick={() => setShowHighRiskModal(false)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { name: "Rahul Verma", role: "DevOps Engineer", client: "Apex Tech", notice: "45 Days Notice", status: "High Risk (Counter-offer)" },
                { name: "Ananya Sen", role: "UI/UX Lead", client: "Global Freight", notice: "30 Days Notice", status: "Stagnant (No Update)" },
                { name: "Siddharth Rao", role: "Full Stack Lead", client: "Horizon Labs", notice: "60 Days Notice", status: "Offer Buyout Delay" },
              ].map((c, idx) => (
                <div key={idx} className="p-3.5 bg-red-50/70 border border-red-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-slate-900">{c.name} - <span className="text-slate-600">{c.role}</span></p>
                    <p className="text-[10px] text-red-800 font-bold">{c.client} • {c.notice} • {c.status}</p>
                  </div>
                  <button onClick={() => alert(`Triggering check-in call with ${c.name}`)} className="bg-red-600 text-white font-black text-[10px] px-3 py-1.5 rounded-xl cursor-pointer">
                    Check-in
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pending Client Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-4 text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-black text-base text-amber-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber-600">schedule</span>
                  <span>Pending Client Feedback Tracker</span>
                </h4>
                <p className="text-[11px] text-slate-500">Submissions pending review past 48h SLA</p>
              </div>
              <button onClick={() => setShowFeedbackModal(false)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { client: "Apex Tech Corp", candidate: "Vikram Malhotra", role: "Lead Architect", overdue: "54 Hours Overdue" },
                { client: "Global Freight Ltd", candidate: "Neha Sharma", role: "DevOps Engineer", overdue: "49 Hours Overdue" },
                { client: "Pinnacle Systems", candidate: "Karan Johar", role: "Product Manager", overdue: "72 Hours Overdue" },
              ].map((fb, idx) => (
                <div key={idx} className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-slate-900">{fb.client} - <span className="text-[#0F172A] font-black">{fb.candidate}</span></p>
                    <p className="text-[10px] text-amber-800 font-bold">Role: {fb.role} • {fb.overdue}</p>
                  </div>
                  <button onClick={() => alert(`Automated reminder email dispatched to HR at ${fb.client}`)} className="bg-amber-500 text-slate-950 font-black text-[10px] px-3 py-1.5 rounded-xl cursor-pointer">
                    Ping HR
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
