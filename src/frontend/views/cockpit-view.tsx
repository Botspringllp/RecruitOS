"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CockpitView() {
  const router = useRouter();

  // Navigation State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState<string>("dashboard");

  // Profile Drawer State
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  // Search State
  const [searchCategory, setSearchCategory] = useState("Requirements");
  const [searchQuery, setSearchQuery] = useState("");

  // Notifications State
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Job Opening -> Candidate View Flow State
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  // Open Mandates -> Details & Storefront State
  const [selectedMandate, setSelectedMandate] = useState<any | null>(null);
  const [showStorefront, setShowStorefront] = useState(false);
  const [showStorefrontForm, setShowStorefrontForm] = useState(false);

  // Date Filter State for Pipeline Snapshot
  const [pipelineDateFilter, setPipelineDateFilter] = useState("Today");

  // View More Modals
  const [showAllHighRiskModal, setShowAllHighRiskModal] = useState(false);
  const [showAllPendingFeedbackModal, setShowAllPendingFeedbackModal] = useState(false);

  // Add Candidate Modal (used inside Job-Candidate view)
  const [addCandidateModalOpen, setAddCandidateModalOpen] = useState(false);
  const [newCandidateForm, setNewCandidateForm] = useState({
    name: "",
    email: "",
    status: "New",
    rating: "4.0 ⭐",
    skills: "",
  });

  // Interactive Tasks State
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
      dateSubmitted: "08 Aug 2026",
    },
  ]);

  // New Storefront Requirement Form State
  const [storefrontForm, setStorefrontForm] = useState({
    companyName: "",
    contactPerson: "",
    position: "",
    openings: "1",
    experience: "",
    location: "",
    compensation: "",
    priority: "High",
    commercialModel: "15% Contingency Fee",
  });

  // Load mandates from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem("recruitos_open_mandates");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge unique mandates by id
          const ids = new Set(parsed.map(m => m.id));
          const baseFiltered = openMandatesList.filter(m => !ids.has(m.id));
          setOpenMandatesList([...parsed, ...baseFiltered]);
        }
      }
    } catch (err) {
      console.error("Error reading mandates from localStorage", err);
    }
  }, [activeNavTab]);

  const toggleTask = (id: number) => {
    setMyTasks(myTasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
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

  const handleSubmitStorefrontRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    const newMandate = {
      id: `MAND-00${openMandatesList.length + 1}`,
      companyName: storefrontForm.companyName || "New Client Corp",
      industry: "Enterprise Services",
      contactPerson: storefrontForm.contactPerson || "Hiring Manager",
      position: storefrontForm.position || "Software Engineer",
      openings: parseInt(storefrontForm.openings) || 1,
      experience: storefrontForm.experience || "3-5 Years",
      location: storefrontForm.location || "Remote / Onsite",
      compensation: storefrontForm.compensation || "Competitive Market Rate",
      priority: storefrontForm.priority || "High",
      commercialModel: storefrontForm.commercialModel || "15% Contingency Fee",
      dateSubmitted: "Just Now",
    };

    setOpenMandatesList([newMandate, ...openMandatesList]);
    setShowStorefrontForm(false);
    setShowStorefront(false);
    setActiveNavTab("open_mandates");
    setSelectedMandate(newMandate);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">

      {/* ========================================================================= */}
      {/* 1. LEFT SIDEBAR NAVIGATION (RecruitPro Branding) */}
      {/* ========================================================================= */}
      <aside 
        className={`bg-[#0F172A] flex flex-col justify-between transition-all duration-300 z-30 select-none shadow-xl ${
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
              { id: "new_mandates", label: "New Mandates", icon: "assignment_ind", adminOnly: true },
              { id: "interviews", label: "Interviews", icon: "event" },
              { id: "reports", label: "Reports", icon: "bar_chart" },
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
                ? "bg-[#FFD400] text-[#0F172A]"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            {!sidebarCollapsed && <span>Settings</span>}
          </button>

          <button
            onClick={() => alert("RecruitPro Support Desk: support@recruitpro.com")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">help</span>
            {!sidebarCollapsed && <span>Support</span>}
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE CONTENT */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC]">

        {/* TOP HEADER BAR */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4 z-20 shadow-2xs">
          
          {/* SEARCH BAR */}
          <div className="flex items-center gap-2 bg-slate-100/80 border border-slate-200 rounded-xl p-1.5 w-full max-w-xl">
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="bg-white text-slate-800 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer border border-slate-200 shadow-2xs"
            >
              <option value="Requirements">Search Requirement</option>
              <option value="Candidates">Search Candidate</option>
              <option value="Clients">Search Client</option>
              <option value="Interviews">Search Interview</option>
            </select>

            <div className="flex-1 flex items-center gap-2 px-2 text-slate-400">
              <span className="material-symbols-outlined text-[18px] text-slate-500">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${searchCategory.toLowerCase()}...`}
                className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* RIGHT ACTIONS: NOTIFICATIONS, MESSAGES, PROFILE */}
          <div className="flex items-center gap-4">
            
            {/* Notifications 🔔 */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-xl transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white font-black text-[9px] rounded-full flex items-center justify-center animate-bounce">
                  3
                </span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 space-y-3 z-50 animate-in fade-in">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h4 className="font-extrabold text-xs text-slate-900">Notifications</h4>
                    <span className="text-[10px] text-amber-600 font-bold">Mark read</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                      <p className="font-bold text-amber-900">High Risk Candidate: Rahul</p>
                      <p className="text-[11px] text-amber-700 mt-0.5">Accepted offer, 15 days notice remaining.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Messages 💬 */}
            <button
              onClick={() => alert("Direct Messages Studio")}
              className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-xl transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">chat</span>
            </button>

            {/* Profile Avatar 👤 (Displays "Divyanshu") */}
            <div 
              onClick={() => setProfileDrawerOpen(true)}
              className="flex items-center gap-2.5 p-1.5 pr-3 bg-slate-100 hover:bg-amber-100/60 border border-slate-200 hover:border-amber-400 rounded-xl transition-all cursor-pointer group"
            >
              <div className="h-8 w-8 rounded-lg bg-[#FFD400] text-[#0F172A] flex items-center justify-center font-black text-xs shadow-xs">
                DS
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                  Divyanshu
                </p>
                <p className="text-[9px] font-extrabold text-amber-600 uppercase tracking-wider">
                  Agency Owner
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

          {/* ========================================================================= */}
          {/* VIEW A: PUBLIC AGENCY STOREFRONT WEBSITE (Triggered from + Add Company) */}
          {/* ========================================================================= */}
          {showStorefront && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-300">
              
              {/* Storefront Top Navbar */}
              <nav className="bg-[#0F172A] text-white px-8 py-4 flex justify-between items-center border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-[#FFD400] text-[#0F172A] flex items-center justify-center font-black">
                    <span className="material-symbols-outlined text-[22px]">work</span>
                  </div>
                  <span className="text-xl font-black tracking-tight">Apex Recruitment Partners</span>
                </div>

                <div className="flex items-center gap-6 text-xs font-bold text-slate-300">
                  <span className="hover:text-white cursor-pointer">Services</span>
                  <span className="hover:text-white cursor-pointer">Markets</span>
                  <span className="hover:text-white cursor-pointer">About</span>
                  
                  {/* Gold Button: Submit Hiring Requirement */}
                  <button
                    onClick={() => setShowStorefrontForm(true)}
                    className="bg-[#FFD400] text-[#0F172A] font-black px-4 py-2.5 rounded-xl hover:brightness-105 shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    SUBMIT HIRING REQUIREMENT
                  </button>

                  <button
                    onClick={() => setShowStorefront(false)}
                    className="text-slate-400 hover:text-white text-xs underline cursor-pointer"
                  >
                    Back to Cockpit
                  </button>
                </div>
              </nav>

              {/* Storefront Hero Section */}
              <div className="p-12 md:p-16 text-center space-y-6 bg-gradient-to-b from-[#0F172A]/5 to-transparent">
                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  ✦ EXCLUSIVELY GLOBAL, LOCALLY ROOTED
                </span>

                <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
                  Premier Executive Search for <span className="bg-[#0F172A] text-[#FFD400] px-3 py-1 rounded-xl">Gulf</span> & Emerging Markets
                </h1>

                <p className="text-sm text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
                  Connecting world-class talent with industry leaders across the UAE, KSA, and beyond. We combine local market intelligence with a global search footprint.
                </p>

                <div className="flex justify-center gap-4 pt-2">
                  <button 
                    onClick={() => setShowStorefrontForm(true)}
                    className="bg-[#0F172A] text-white font-black text-xs px-6 py-3 rounded-xl hover:bg-slate-800 transition-all cursor-pointer shadow-md"
                  >
                    View Market Capabilities →
                  </button>
                </div>
              </div>

              {/* Storefront Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 bg-[#0F172A] text-white text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
                <div className="p-8">
                  <p className="text-3xl font-black text-[#FFD400]">140+</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Executive Placements</p>
                </div>
                <div className="p-8">
                  <p className="text-3xl font-black text-[#FFD400]">72h</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Average Shortlist SLA</p>
                </div>
                <div className="p-8">
                  <p className="text-3xl font-black text-[#FFD400]">98%</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Placement Retention Rate</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: DASHBOARD VIEW (Exact Specs requested by User) */}
          {/* ========================================================================= */}
          {activeNavTab === "dashboard" && !showStorefront && (
            <div className="space-y-6 animate-in fade-in duration-300">

              {/* Welcome Section */}
              <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
                  <div className="space-y-1">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                      Good Morning, <span className="text-[#FFD400]">Divyanshu</span> 👋
                    </h2>
                    <p className="text-xs text-slate-300 font-medium">
                      Here is your agency execution summary for today:
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-800/80 border border-slate-700 px-3.5 py-2 rounded-xl text-center">
                      <span className="text-[10px] font-extrabold text-[#FFD400] uppercase tracking-wider block">Today</span>
                      <span className="text-sm font-black text-white">8 Interviews</span>
                    </div>
                    <div className="bg-slate-800/80 border border-slate-700 px-3.5 py-2 rounded-xl text-center">
                      <span className="text-[10px] font-extrabold text-sky-400 uppercase tracking-wider block">Pending</span>
                      <span className="text-sm font-black text-white">5 Follow-ups</span>
                    </div>
                    <div className="bg-slate-800/80 border border-slate-700 px-3.5 py-2 rounded-xl text-center">
                      <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block">Offers</span>
                      <span className="text-sm font-black text-white">3 Pending</span>
                    </div>
                    <div className="bg-slate-800/80 border border-slate-700 px-3.5 py-2 rounded-xl text-center">
                      <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider block">This Week</span>
                      <span className="text-sm font-black text-white">2 Joining</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Open Requirements</span>
                  <p className="text-2xl font-black text-slate-900">25</p>
                  <span className="text-[10px] font-extrabold text-amber-600">3 Urgent Mandates</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Active Candidates</span>
                  <p className="text-2xl font-black text-slate-900">356</p>
                  <span className="text-[10px] font-extrabold text-sky-600">In Sourcing</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Interviews Today</span>
                  <p className="text-2xl font-black text-purple-600">12</p>
                  <span className="text-[10px] font-bold text-slate-500">4 Prep Kits</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Offers Pending</span>
                  <p className="text-2xl font-black text-emerald-600">8</p>
                  <span className="text-[10px] font-extrabold text-emerald-600">CTC Audited</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-slate-500 block">Joining This Month</span>
                  <p className="text-2xl font-black text-slate-900">15</p>
                  <span className="text-[10px] font-extrabold text-teal-600">Day 1 HR Verified</span>
                </div>

                <div className="bg-amber-50/60 border border-amber-300 rounded-2xl p-4 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-amber-800 block">Revenue This Month</span>
                  <p className="text-2xl font-black text-slate-900">₹2.5 Lakh</p>
                  <span className="text-[10px] font-black text-amber-700">👑 Agency Owner View</span>
                </div>
              </div>

              {/* Two Column Grid: Tasks & Interviews */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Today's Tasks */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500 text-[20px]">checklist</span>
                      <h3 className="font-extrabold text-sm text-slate-900">Today's Tasks</h3>
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {myTasks.filter(t => t.done).length} / {myTasks.length} Completed
                    </span>
                  </div>

                  <div className="space-y-2">
                    {myTasks.map((task) => (
                      <div 
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                          task.done 
                            ? "bg-slate-50 border-slate-200 text-slate-400 line-through" 
                            : "bg-white border-slate-200 text-slate-800 hover:border-amber-400"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-5 w-5 rounded-md border flex items-center justify-center ${
                            task.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 bg-slate-50"
                          }`}>
                            {task.done && <span className="material-symbols-outlined text-[14px] font-black">check</span>}
                          </div>
                          <span className="text-xs font-bold">{task.text}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">Subah Queue</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Today's Interviews */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-600 text-[20px]">event</span>
                      <h3 className="font-extrabold text-sm text-slate-900">Today's Interviews</h3>
                    </div>
                    <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
                      3 Scheduled
                    </span>
                  </div>

                  <table className="w-full text-left text-xs text-slate-700">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                        <th className="p-2">Candidate</th>
                        <th className="p-2">Time</th>
                        <th className="p-2">Client</th>
                        <th className="p-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { candidate: "Rahul", time: "10 AM", client: "Infosys" },
                        { candidate: "Priya", time: "2 PM", client: "TCS" },
                        { candidate: "Aman", time: "4 PM", client: "Wipro" },
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 font-extrabold text-slate-900">{row.candidate}</td>
                          <td className="p-2 font-black text-amber-600">{row.time}</td>
                          <td className="p-2 font-semibold text-slate-700">{row.client}</td>
                          <td className="p-2 text-right space-x-1">
                            <button className="bg-[#FFD400] text-[#0F172A] px-2 py-0.5 rounded font-black text-[10px]">Join</button>
                            <button className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold text-[10px]">Reschedule</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PIPELINE SNAPSHOT WITH DATE SELECTOR */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[20px]">filter_alt</span>
                    <h3 className="font-extrabold text-sm text-slate-900">Candidate Pipeline Snapshot</h3>
                  </div>

                  {/* Date Selector (Default: Today) */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">Filter Date:</span>
                    <select
                      value={pipelineDateFilter}
                      onChange={(e) => setPipelineDateFilter(e.target.value)}
                      className="bg-slate-100 border border-slate-300 text-slate-900 text-xs font-black rounded-lg px-3 py-1 focus:outline-none cursor-pointer"
                    >
                      <option value="Today">Today</option>
                      <option value="Yesterday">Yesterday</option>
                      <option value="Last 7 Days">Last 7 Days</option>
                      <option value="This Month">This Month</option>
                      <option value="Custom Date">Custom Calendar...</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { stage: "Shortlisted", count: 120, bg: "bg-slate-100", text: "text-slate-700" },
                    { stage: "Screening", count: 80, bg: "bg-sky-50", text: "text-sky-700" },
                    { stage: "Interview", count: 35, bg: "bg-purple-50", text: "text-purple-700" },
                    { stage: "Offer", count: 12, bg: "bg-amber-50", text: "text-amber-700" },
                    { stage: "Joining", count: 7, bg: "bg-emerald-50", text: "text-emerald-700" },
                  ].map((step, idx) => (
                    <div key={idx} className={`p-4 ${step.bg} rounded-2xl border border-slate-200 text-center space-y-1`}>
                      <span className="text-[11px] font-extrabold text-slate-600 block">{step.stage}</span>
                      <p className={`text-xl font-black ${step.text}`}>{step.count}</p>
                      <span className="text-[9px] font-bold text-slate-400">Candidates</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* HIGH RISK CANDIDATES & PENDING CLIENT FEEDBACK (WITH VIEW MORE ->) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* High Risk Candidates */}
                <div className="bg-white border border-red-200 rounded-2xl p-5 space-y-4 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center border-b border-red-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-500 text-[20px] animate-pulse">warning</span>
                        <h3 className="font-extrabold text-sm text-slate-900">High Risk Candidates</h3>
                      </div>
                      <span className="text-[10px] font-extrabold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                        Drop-off Radar
                      </span>
                    </div>

                    {/* Sub-headline explanation requested by user */}
                    <p className="text-[11px] text-slate-500 font-medium italic mt-2">
                      Candidates who have accepted the offer letter and are scheduled to join within their notice period.
                    </p>

                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead>
                          <tr className="border-b border-slate-200 bg-red-50/50 text-[10px] uppercase font-bold text-slate-500">
                            <th className="p-2">Candidate</th>
                            <th className="p-2">Notice Remaining</th>
                            <th className="p-2">Risk Level</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr className="hover:bg-red-50/30">
                            <td className="p-2 font-extrabold text-slate-900">Rahul</td>
                            <td className="p-2 font-semibold">15 Days</td>
                            <td className="p-2">
                              <span className="bg-red-100 text-red-800 font-black text-[10px] px-2 py-0.5 rounded-full">🔴 High Risk</span>
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="p-2 font-extrabold text-slate-900">Vikram</td>
                            <td className="p-2 font-semibold">30 Days</td>
                            <td className="p-2">
                              <span className="bg-amber-100 text-amber-800 font-black text-[10px] px-2 py-0.5 rounded-full">🟡 Medium Risk</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* View More Button */}
                  <div className="pt-3 border-t border-slate-100 text-right">
                    <button
                      onClick={() => setShowAllHighRiskModal(true)}
                      className="text-xs font-black text-red-600 hover:text-red-800 flex items-center gap-1 ml-auto cursor-pointer"
                    >
                      <span>View More</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>

                {/* Pending Client Feedback */}
                <div className="bg-white border border-amber-200 rounded-2xl p-5 space-y-4 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center border-b border-amber-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-600 text-[20px]">schedule</span>
                        <h3 className="font-extrabold text-sm text-slate-900">Pending Client Feedback</h3>
                      </div>
                      <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Action Required
                      </span>
                    </div>

                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead>
                          <tr className="border-b border-slate-200 bg-amber-50/50 text-[10px] uppercase font-bold text-slate-500">
                            <th className="p-2">Client</th>
                            <th className="p-2">Requirement</th>
                            <th className="p-2">Waiting Since</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr className="hover:bg-amber-50/30">
                            <td className="p-2 font-extrabold text-slate-900">Infosys</td>
                            <td className="p-2 font-semibold">React Developer</td>
                            <td className="p-2 font-bold text-amber-700">3 Days</td>
                          </tr>
                          <tr className="hover:bg-slate-50">
                            <td className="p-2 font-extrabold text-slate-900">Wipro</td>
                            <td className="p-2 font-semibold">HR Manager</td>
                            <td className="p-2 font-bold text-red-600">5 Days (Urgent)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* View More Button */}
                  <div className="pt-3 border-t border-slate-100 text-right">
                    <button
                      onClick={() => setShowAllPendingFeedbackModal(true)}
                      className="text-xs font-black text-amber-700 hover:text-amber-900 flex items-center gap-1 ml-auto cursor-pointer"
                    >
                      <span>View More</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: JOBS PAGE SURFACE & CANDIDATES FLOW (Matching Image 1 & 2) */}
          {/* ========================================================================= */}
          {activeNavTab === "jobs" && !showStorefront && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* IF A SPECIFIC JOB IS SELECTED: SHOW JOB'S ASSOCIATED CANDIDATES (IMAGE 1) */}
              {selectedJob ? (
                <div className="space-y-4">
                  {/* Header & Back Breadcrumb */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                    <div>
                      <button
                        onClick={() => setSelectedJob(null)}
                        className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        <span>Back to Job Openings</span>
                      </button>
                      <h2 className="text-2xl font-black text-slate-900">
                        Candidates — {selectedJob.title} ({selectedJob.client})
                      </h2>
                      <p className="text-xs text-slate-500">
                        Job Opening ID: <span className="font-mono text-slate-700 font-bold">{selectedJob.id}</span> | Status: <span className="text-emerald-700 font-bold">{selectedJob.status}</span>
                      </p>
                    </div>

                    {/* + Add New Candidate Button (Located on this page as requested) */}
                    <button
                      onClick={() => setAddCandidateModalOpen(true)}
                      className="bg-[#FFD400] text-[#0F172A] font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">person_add</span>
                      <span>+ Add New Candidate</span>
                    </button>
                  </div>

                  {/* Main Grid: Left Filter Sidebar + Right Candidates Table (Matching Image 1) */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    
                    {/* Left Filter Sidebar */}
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
                        <label className="flex items-center gap-2 font-semibold cursor-pointer">
                          <input type="checkbox" className="rounded text-[#0F172A]" />
                          <span>Located Within</span>
                        </label>
                        <label className="flex items-center gap-2 font-semibold cursor-pointer">
                          <input type="checkbox" className="rounded text-[#0F172A]" />
                          <span>Skill Set</span>
                        </label>
                      </div>
                    </div>

                    {/* Right Candidates Table */}
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
                /* JOB OPENINGS DIRECTORY TABLE (MATCHING IMAGE 2) */
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">Job Openings</h2>
                      <p className="text-xs text-slate-500">Click on any job to view associated candidates</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    
                    {/* Left Filter Sidebar */}
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
                          <span>Job Opening ID</span>
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

                    {/* Job Openings Table */}
                    <div className="md:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                            <th className="p-3">Posting Title</th>
                            <th className="p-3">Job Opening ID</th>
                            <th className="p-3">Job Opening Status</th>
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
                  <p className="text-xs text-slate-500">Incoming hiring offers submitted by prospective hiring clients</p>
                </div>

                {/* Button: Add Company -> Opens Standalone Public Website Route */}
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
                        <span>Back to Open Mandates List</span>
                      </button>
                      <h3 className="text-2xl font-black text-slate-900">{selectedMandate.companyName}</h3>
                      <p className="text-xs font-bold text-amber-700">{selectedMandate.industry}</p>
                    </div>

                    <span className="bg-red-100 text-red-800 font-black text-xs px-3 py-1 rounded-full border border-red-300">
                      Priority: {selectedMandate.priority}
                    </span>
                  </div>

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
                </div>
              ) : (
                /* Open Mandates Directory List */
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                        <th className="p-3">Company Name</th>
                        <th className="p-3">Position Title</th>
                        <th className="p-3 text-center">Openings</th>
                        <th className="p-3">Location</th>
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
                          <td className="p-3 text-center font-black text-amber-600">{man.openings}</td>
                          <td className="p-3 font-semibold text-slate-600">{man.location}</td>
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
          {/* TAB 4: NEW MANDATES (ADMIN/OWNER EXCLUSIVE FEATURE) */}
          {/* ========================================================================= */}
          {activeNavTab === "new_mandates" && !showStorefront && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <h2 className="text-2xl font-black text-slate-900">New Mandates Assignment</h2>
                <p className="text-xs text-slate-500">👑 Admin / Owner View: Track recruiter assignments for incoming company mandates</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                      <th className="p-3">Company Name</th>
                      <th className="p-3">Mandate Title</th>
                      <th className="p-3 text-center">Openings</th>
                      <th className="p-3">Assigned Recruiter</th>
                      <th className="p-3">Assigned Date</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { company: "Infosys", title: "Senior React Developer", openings: 5, recruiter: "Ankit Sharma", date: "10 Aug 2026" },
                      { company: "TCS", title: "Java Backend Lead", openings: 3, recruiter: "Neha Verma", date: "09 Aug 2026" },
                      { company: "Wipro", title: "HR Manager", openings: 2, recruiter: "Rohan Mehta", date: "08 Aug 2026" },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-extrabold text-slate-900">{row.company}</td>
                        <td className="p-3 font-bold text-slate-800">{row.title}</td>
                        <td className="p-3 text-center font-black text-amber-600">{row.openings}</td>
                        <td className="p-3 font-extrabold text-sky-700">{row.recruiter}</td>
                        <td className="p-3 font-mono text-slate-500">{row.date}</td>
                        <td className="p-3 text-right">
                          <button 
                            onClick={() => alert(`Reassigning ${row.title}`)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1 rounded-lg font-bold text-[10px]"
                          >
                            Reassign
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* OTHER TABS: INTERVIEWS & REPORTS */}
          {(activeNavTab === "interviews" || activeNavTab === "reports" || activeNavTab === "settings") && !showStorefront && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2 shadow-2xs">
              <h2 className="text-2xl font-black text-slate-900 capitalize">{activeNavTab} Workflows</h2>
              <p className="text-xs text-slate-500">Manage recruitment operations for {activeNavTab}</p>
            </div>
          )}

        </main>
      </div>

      {/* ========================================================================= */}
      {/* 3. STOREFRONT REQUIREMENT SUBMISSION FORM MODAL */}
      {/* ========================================================================= */}
      {showStorefrontForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-4 text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-black text-sm text-[#0F172A] uppercase tracking-wider">
                Submit Hiring Requirement (Storefront)
              </h4>
              <button
                onClick={() => setShowStorefrontForm(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitStorefrontRequirement} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Company Details *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Tech Solutions"
                    value={storefrontForm.companyName}
                    onChange={(e) => setStorefrontForm({ ...storefrontForm, companyName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins (HR VP)"
                    value={storefrontForm.contactPerson}
                    onChange={(e) => setStorefrontForm({ ...storefrontForm, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Position to be Hired *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Full Stack Lead"
                    value={storefrontForm.position}
                    onChange={(e) => setStorefrontForm({ ...storefrontForm, position: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Number of Openings *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 4"
                    value={storefrontForm.openings}
                    onChange={(e) => setStorefrontForm({ ...storefrontForm, openings: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Required Experience *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5-8 Years"
                    value={storefrontForm.experience}
                    onChange={(e) => setStorefrontForm({ ...storefrontForm, experience: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dubai, UAE"
                    value={storefrontForm.location}
                    onChange={(e) => setStorefrontForm({ ...storefrontForm, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Compensation Range *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. $90,000 - $110,000"
                    value={storefrontForm.compensation}
                    onChange={(e) => setStorefrontForm({ ...storefrontForm, compensation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Hiring Priority *</label>
                  <select
                    value={storefrontForm.priority}
                    onChange={(e) => setStorefrontForm({ ...storefrontForm, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Normal">Normal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Commercial Engagement Model *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15% Annual CTC Contingency Fee"
                  value={storefrontForm.commercialModel}
                  onChange={(e) => setStorefrontForm({ ...storefrontForm, commercialModel: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#FFD400] text-[#0F172A] font-black text-xs rounded-xl shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer"
                >
                  Submit Requirement & Send to Open Mandates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MORE MODAL 1: HIGH RISK CANDIDATES */}
      {showAllHighRiskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-black text-sm text-red-600 uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                  <span>All High Risk Candidates Radar</span>
                </h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Candidates who have accepted the offer letter and are scheduled to join within their notice period.
                </p>
              </div>
              <button onClick={() => setShowAllHighRiskModal(false)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <table className="w-full text-left text-xs text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 bg-red-50 text-[10px] uppercase font-bold text-slate-500">
                  <th className="p-2.5">Candidate</th>
                  <th className="p-2.5">Notice Remaining</th>
                  <th className="p-2.5">Risk Level</th>
                  <th className="p-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-red-50/40">
                  <td className="p-2.5 font-extrabold text-slate-900">Rahul Sharma</td>
                  <td className="p-2.5 font-semibold">15 Days</td>
                  <td className="p-2.5"><span className="bg-red-100 text-red-800 font-black text-[10px] px-2 py-0.5 rounded-full">🔴 High Risk</span></td>
                  <td className="p-2.5 text-right">
                    <button onClick={() => alert("Calling Rahul...")} className="bg-[#FFD400] text-[#0F172A] px-2.5 py-1 rounded font-black text-[10px]">Call Now</button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-2.5 font-extrabold text-slate-900">Vikram Malhotra</td>
                  <td className="p-2.5 font-semibold">30 Days</td>
                  <td className="p-2.5"><span className="bg-amber-100 text-amber-800 font-black text-[10px] px-2 py-0.5 rounded-full">🟡 Medium Risk</span></td>
                  <td className="p-2.5 text-right">
                    <button onClick={() => alert("Pulse check to Vikram...")} className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-bold text-[10px]">Pulse Check</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MORE MODAL 2: PENDING CLIENT FEEDBACK */}
      {showAllPendingFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-black text-sm text-amber-700 uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">schedule</span>
                <span>All Pending Client Feedbacks</span>
              </h4>
              <button onClick={() => setShowAllPendingFeedbackModal(false)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <table className="w-full text-left text-xs text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 bg-amber-50 text-[10px] uppercase font-bold text-slate-500">
                  <th className="p-2.5">Client</th>
                  <th className="p-2.5">Requirement</th>
                  <th className="p-2.5">Waiting Since</th>
                  <th className="p-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-amber-50/40">
                  <td className="p-2.5 font-extrabold text-slate-900">Infosys</td>
                  <td className="p-2.5 font-semibold">React Developer</td>
                  <td className="p-2.5 font-bold text-amber-700">3 Days</td>
                  <td className="p-2.5 text-right">
                    <button onClick={() => alert("Reminder sent")} className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded font-bold text-[10px]">Reminder</button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-2.5 font-extrabold text-slate-900">Wipro</td>
                  <td className="p-2.5 font-semibold">HR Manager</td>
                  <td className="p-2.5 font-bold text-red-600">5 Days (Urgent)</td>
                  <td className="p-2.5 text-right">
                    <button onClick={() => alert("Escalated")} className="bg-red-100 text-red-800 px-2.5 py-1 rounded font-bold text-[10px]">Escalate</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PROFILE SLIDE-OVER DRAWER */}
      {profileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border-l border-slate-200 h-full p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300 text-slate-900">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h3 className="font-black text-xs uppercase tracking-wider text-slate-900">Owner Profile</h3>
                <button onClick={() => setProfileDrawerOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-center space-y-3">
                <div className="h-16 w-16 rounded-2xl bg-[#FFD400] text-[#0F172A] flex items-center justify-center font-black text-2xl mx-auto shadow-md">
                  DS
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Divyanshu</h3>
                  <p className="text-xs text-amber-700 font-extrabold uppercase mt-0.5">Agency Founder & Owner</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button onClick={handleLogout} className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-700 font-black text-xs rounded-xl flex items-center justify-center gap-2 border border-red-200">
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>Log Out of RecruitPro</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
