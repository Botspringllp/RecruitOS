"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CockpitView() {
  const router = useRouter();

  // Sidebar & Navigation State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState<string>("dashboard");

  // Profile Slide-Over Drawer State
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  // Search Bar State
  const [searchCategory, setSearchCategory] = useState("Candidates");
  const [searchQuery, setSearchQuery] = useState("");

  // Notifications Popover State
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);

  // Quick Action Modal States
  const [activeModal, setActiveModal] = useState<"requirement" | "client" | "interview" | "offer" | "candidate" | null>(null);
  const [modalSuccessMessage, setModalSuccessMessage] = useState("");

  // Interactive Task List State for "Today's Tasks"
  const [myTasks, setMyTasks] = useState([
    { id: 1, text: "Follow up Rahul", done: false },
    { id: 2, text: "Schedule Interview Priya", done: false },
    { id: 3, text: "Client Feedback Pending", done: false },
    { id: 4, text: "Offer Acceptance Check", done: false },
    { id: 5, text: "Notice Period Review", done: false },
  ]);

  // Form Field States
  const [formField1, setFormField1] = useState("");
  const [formField2, setFormField2] = useState("");

  const toggleTask = (id: number) => {
    setMyTasks(myTasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleLogout = () => {
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  const handleModalSubmit = (e: React.FormEvent, title: string) => {
    e.preventDefault();
    setModalSuccessMessage(`${title} created successfully!`);
    setTimeout(() => {
      setModalSuccessMessage("");
      setActiveModal(null);
      setFormField1("");
      setFormField2("");
    }, 1500);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">

      {/* ========================================================================= */}
      {/* 1. LEFT SIDEBAR NAVIGATION (Stitch Dark Slate #0F172A + Yellow #FFD400) */}
      {/* ========================================================================= */}
      <aside 
        className={`bg-[#0F172A] flex flex-col justify-between transition-all duration-300 z-30 select-none shadow-xl ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Top Brand Header */}
        <div>
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

          {/* Main Navigation Items */}
          <nav className="p-3 space-y-1.5 mt-3">
            {[
              { id: "dashboard", label: "Dashboard", icon: "grid_view" },
              { id: "candidates", label: "Candidates", icon: "group" },
              { id: "interviews", label: "Interviews", icon: "event" },
              { id: "jobs", label: "Jobs", icon: "business_center" },
              { id: "reports", label: "Reports", icon: "bar_chart" },
            ].map((tab) => {
              const isActive = activeNavTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveNavTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#FFD400] text-[#0F172A] shadow-md font-black"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${isActive ? "text-[#0F172A]" : "text-slate-400"}`}>
                    {tab.icon}
                  </span>
                  {!sidebarCollapsed && <span>{tab.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          <button
            onClick={() => setActiveModal("candidate")}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#FFD400] text-[#0F172A] hover:brightness-105 font-black text-xs transition-all active:scale-95 cursor-pointer shadow-md ${
              sidebarCollapsed ? "px-0" : ""
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            {!sidebarCollapsed && <span>+ Add New Candidate</span>}
          </button>

          <button
            onClick={() => setActiveNavTab("settings")}
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
            onClick={() => alert("RecruitPro Support: support@recruitpro.com")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">help</span>
            {!sidebarCollapsed && <span>Support</span>}
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN LIGHT SURFACES WRAPPER (#F8FAFC Background + Crisp White Cards) */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC]">

        {/* TOP HEADER BAR (Clean White Surface) */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4 z-20 shadow-2xs">
          
          {/* SEARCH BAR WITH CATEGORY SELECTOR */}
          <div className="flex items-center gap-2 bg-slate-100/80 border border-slate-200 rounded-xl p-1.5 w-full max-w-xl">
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="bg-white text-slate-800 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer border border-slate-200 shadow-2xs"
            >
              <option value="Candidates">Search Candidate</option>
              <option value="Requirements">Search Requirement</option>
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

          {/* RIGHT SIDE ACTIONS: NOTIFICATIONS, MESSAGES, PROFILE */}
          <div className="flex items-center gap-4">
            
            {/* Notifications 🔔 */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setUnreadNotifications(0);
                }}
                className="relative p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-xl transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white font-black text-[9px] rounded-full flex items-center justify-center animate-bounce">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* Popover */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 space-y-3 z-50 animate-in fade-in zoom-in duration-200">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h4 className="font-extrabold text-xs text-slate-900">Notifications</h4>
                    <span className="text-[10px] text-amber-600 font-bold">Mark all read</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/60">
                      <p className="font-bold text-amber-900">High Risk Alert: Rahul</p>
                      <p className="text-[11px] text-amber-700 mt-0.5">Notice period 15 days remaining.</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="font-bold text-slate-900">New Requirement Created</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">Infosys posted React Developer mandate.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Messages 💬 */}
            <button
              onClick={() => alert("Direct Messages Studio: No unread candidate messages.")}
              className="relative p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-xl transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">chat</span>
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Profile Avatar 👤 */}
            <div 
              onClick={() => setProfileDrawerOpen(true)}
              className="flex items-center gap-2.5 p-1.5 pr-3 bg-slate-100 hover:bg-amber-100/60 border border-slate-200 hover:border-amber-400 rounded-xl transition-all cursor-pointer group"
            >
              <div className="h-8 w-8 rounded-lg bg-[#FFD400] text-[#0F172A] flex items-center justify-center font-black text-xs shadow-xs">
                DS
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                  Divyanshu Sharma
                </p>
                <p className="text-[9px] font-extrabold text-amber-600 uppercase tracking-wider">
                  Agency Owner
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN DASHBOARD CONTENT (Clean Light Palette: Slate & White Cards) */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

          {/* ========================================================================= */}
          {/* TAB 1: DASHBOARD VIEW (10 Sections with Crisp Light Aesthetics) */}
          {/* ========================================================================= */}
          {activeNavTab === "dashboard" && (
            <div className="space-y-6 animate-in fade-in duration-300">

              {/* ----------------------------------------------------------------- */}
              {/* SECTION 1: WELCOME BANNER (Stitch Navy #0F172A + Yellow #FFD400 Accent) */}
              {/* ----------------------------------------------------------------- */}
              <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-80 h-80 bg-[#FFD400]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
                  <div className="space-y-1">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                      Good Morning, <span className="text-[#FFD400]">Divyanshu</span> 👋
                    </h2>
                    <p className="text-xs text-slate-300 font-medium">
                      Here is your agency recruitment dashboard for today:
                    </p>
                  </div>

                  {/* Summary Bullets */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-800/80 border border-slate-700 px-3.5 py-2 rounded-xl text-center shadow-xs">
                      <span className="text-[10px] font-extrabold text-[#FFD400] uppercase tracking-wider block">Today</span>
                      <span className="text-sm font-black text-white">8 Interviews</span>
                    </div>
                    <div className="bg-slate-800/80 border border-slate-700 px-3.5 py-2 rounded-xl text-center shadow-xs">
                      <span className="text-[10px] font-extrabold text-sky-400 uppercase tracking-wider block">Pending</span>
                      <span className="text-sm font-black text-white">5 Follow-ups</span>
                    </div>
                    <div className="bg-slate-800/80 border border-slate-700 px-3.5 py-2 rounded-xl text-center shadow-xs">
                      <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block">Offers</span>
                      <span className="text-sm font-black text-white">3 Pending</span>
                    </div>
                    <div className="bg-slate-800/80 border border-slate-700 px-3.5 py-2 rounded-xl text-center shadow-xs">
                      <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider block">This Week</span>
                      <span className="text-sm font-black text-white">2 Joining</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* SECTION 2: QUICK ACTION BUTTONS */}
              {/* ----------------------------------------------------------------- */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setActiveModal("requirement")}
                  className="flex-1 min-w-[180px] bg-[#FFD400] text-[#0F172A] hover:brightness-105 font-black px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>+ Create Requirement</span>
                </button>

                <button
                  onClick={() => setActiveModal("client")}
                  className="flex-1 min-w-[180px] bg-white border border-slate-200 hover:border-slate-300 text-slate-800 font-extrabold px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-2xs active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-sky-500">domain_add</span>
                  <span>+ Add Client</span>
                </button>

                <button
                  onClick={() => setActiveModal("interview")}
                  className="flex-1 min-w-[180px] bg-white border border-slate-200 hover:border-slate-300 text-slate-800 font-extrabold px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-2xs active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-purple-500">calendar_month</span>
                  <span>+ Schedule Interview</span>
                </button>

                <button
                  onClick={() => setActiveModal("offer")}
                  className="flex-1 min-w-[180px] bg-white border border-slate-200 hover:border-slate-300 text-slate-800 font-extrabold px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-2xs active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-emerald-600">badge</span>
                  <span>+ Create Offer</span>
                </button>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* SECTION 3: KPI CARDS (6 GRID CARDS - Clean White Surfaces) */}
              {/* ----------------------------------------------------------------- */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                
                {/* Card 1: Open Requirements */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-1 shadow-2xs hover:shadow-md transition-all">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] font-black uppercase tracking-wider">Open Requirements</span>
                    <span className="material-symbols-outlined text-[18px] text-amber-500">business_center</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900">25</p>
                  <span className="text-[10px] font-extrabold text-amber-600">3 Urgent Mandates</span>
                </div>

                {/* Card 2: Active Candidates */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-1 shadow-2xs hover:shadow-md transition-all">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] font-black uppercase tracking-wider">Active Candidates</span>
                    <span className="material-symbols-outlined text-[18px] text-sky-500">group</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900">356</p>
                  <span className="text-[10px] font-extrabold text-sky-600">In Active Sourcing</span>
                </div>

                {/* Card 3: Interviews Today */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-1 shadow-2xs hover:shadow-md transition-all">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] font-black uppercase tracking-wider">Interviews Today</span>
                    <span className="material-symbols-outlined text-[18px] text-purple-500">event_available</span>
                  </div>
                  <p className="text-2xl font-black text-purple-600">12</p>
                  <span className="text-[10px] font-bold text-slate-500">4 Prep Kits Sent</span>
                </div>

                {/* Card 4: Offers Pending */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-1 shadow-2xs hover:shadow-md transition-all">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] font-black uppercase tracking-wider">Offers Pending</span>
                    <span className="material-symbols-outlined text-[18px] text-emerald-500">assignment_turned_in</span>
                  </div>
                  <p className="text-2xl font-black text-emerald-600">8</p>
                  <span className="text-[10px] font-extrabold text-emerald-600">CTC Audited</span>
                </div>

                {/* Card 5: Joining This Month */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-1 shadow-2xs hover:shadow-md transition-all">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] font-black uppercase tracking-wider">Joining This Month</span>
                    <span className="material-symbols-outlined text-[18px] text-teal-500">task_alt</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900">15</p>
                  <span className="text-[10px] font-extrabold text-teal-600">Day 1 HR Verified</span>
                </div>

                {/* Card 6: Revenue This Month (Agency Owner Badge) */}
                <div className="bg-amber-50/50 border border-amber-300 rounded-2xl p-4 space-y-1 shadow-2xs hover:shadow-md transition-all">
                  <div className="flex items-center justify-between text-amber-700">
                    <span className="text-[10px] font-black uppercase tracking-wider">Revenue This Month</span>
                    <span className="material-symbols-outlined text-[18px] text-amber-600">payments</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900">₹2.5 Lakh</p>
                  <span className="text-[10px] font-black text-amber-700">👑 Agency Owner View</span>
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* SECTION 4 & 5: TWO COLUMN ROW (MY TASKS & TODAY'S INTERVIEWS) */}
              {/* ----------------------------------------------------------------- */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* SECTION 4: MY TASKS (Interactive Morning Checklist) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500 text-[20px]">checklist</span>
                      <h3 className="font-extrabold text-sm text-slate-900">Today's Tasks</h3>
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
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
                            : "bg-white border-slate-200 text-slate-800 hover:border-amber-400 hover:shadow-2xs"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
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

                {/* SECTION 5: TODAY'S INTERVIEWS TABLE */}
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

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] uppercase font-bold text-slate-500">
                          <th className="p-2.5 rounded-l-lg">Candidate</th>
                          <th className="p-2.5">Time</th>
                          <th className="p-2.5">Client</th>
                          <th className="p-2.5 text-right rounded-r-lg">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[
                          { candidate: "Rahul", time: "10 AM", client: "Infosys" },
                          { candidate: "Priya", time: "2 PM", client: "TCS" },
                          { candidate: "Aman", time: "4 PM", client: "Wipro" },
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="p-2.5 font-extrabold text-slate-900">{row.candidate}</td>
                            <td className="p-2.5 font-black text-amber-600">{row.time}</td>
                            <td className="p-2.5 font-semibold text-slate-700">{row.client}</td>
                            <td className="p-2.5 text-right space-x-1.5">
                              <button 
                                onClick={() => alert(`Joining meeting for ${row.candidate}`)}
                                className="bg-[#FFD400] text-[#0F172A] px-2.5 py-1 rounded-lg font-black text-[10px] hover:brightness-105 active:scale-95 transition-all cursor-pointer shadow-2xs"
                              >
                                Join Meeting
                              </button>
                              <button 
                                onClick={() => alert(`Rescheduling ${row.candidate}`)}
                                className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg font-bold text-[10px] hover:bg-slate-200 cursor-pointer"
                              >
                                Reschedule
                              </button>
                              <button 
                                onClick={() => alert(`Adding feedback for ${row.candidate}`)}
                                className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg font-bold text-[10px] hover:bg-purple-100 cursor-pointer"
                              >
                                Feedback
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* SECTION 6 & 7: ACTIVE REQUIREMENTS & PIPELINE SNAPSHOT */}
              {/* ----------------------------------------------------------------- */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* SECTION 6: ACTIVE REQUIREMENTS TABLE */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sky-600 text-[20px]">business_center</span>
                      <h3 className="font-extrabold text-sm text-slate-900">Active Requirements</h3>
                    </div>
                    <span className="text-[10px] font-extrabold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
                      Live Mandates
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] uppercase font-bold text-slate-500">
                          <th className="p-2.5 rounded-l-lg">Position</th>
                          <th className="p-2.5">Client</th>
                          <th className="p-2.5 text-center">Submitted</th>
                          <th className="p-2.5 text-center">Interviewed</th>
                          <th className="p-2.5 text-center rounded-r-lg">Selected</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[
                          { position: "React Developer", client: "Infosys", sub: 12, int: 5, sel: 2 },
                          { position: "Java Developer", client: "TCS", sub: 8, int: 3, sel: 1 },
                          { position: "HR Manager", client: "Wipro", sub: 5, int: 2, sel: 1 },
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="p-2.5 font-extrabold text-slate-900">{row.position}</td>
                            <td className="p-2.5 font-semibold text-slate-700">{row.client}</td>
                            <td className="p-2.5 text-center font-bold text-sky-600">{row.sub}</td>
                            <td className="p-2.5 text-center font-bold text-purple-600">{row.int}</td>
                            <td className="p-2.5 text-center font-black text-emerald-600">{row.sel}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SECTION 7: CANDIDATE PIPELINE SNAPSHOT */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-[20px]">filter_alt</span>
                      <h3 className="font-extrabold text-sm text-slate-900">Pipeline Snapshot</h3>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">Total: 254</span>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { stage: "Applied", count: 120, bg: "bg-slate-100", text: "text-slate-700" },
                      { stage: "Screening", count: 80, bg: "bg-sky-50", text: "text-sky-700" },
                      { stage: "Interview", count: 35, bg: "bg-purple-50", text: "text-purple-700" },
                      { stage: "Offer", count: 12, bg: "bg-amber-50", text: "text-amber-700" },
                      { stage: "Joining", count: 7, bg: "bg-emerald-50", text: "text-emerald-700" },
                    ].map((step, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-2.5 ${step.bg} rounded-xl border border-slate-200/60`}>
                        <span className="text-xs font-bold text-slate-800">{step.stage}</span>
                        <span className={`text-xs font-black ${step.text}`}>{step.count} Candidates</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* SECTION 8 & 9: HIGH RISK CANDIDATES & PENDING CLIENT FEEDBACK */}
              {/* ----------------------------------------------------------------- */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* SECTION 8: HIGH RISK CANDIDATES */}
                <div className="bg-white border border-red-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                  <div className="flex justify-between items-center border-b border-red-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-red-500 animate-pulse text-[20px]">warning</span>
                      <h3 className="font-extrabold text-sm text-slate-900">High Risk Candidates</h3>
                    </div>
                    <span className="text-[10px] font-extrabold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                      Drop-off Radar
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead>
                        <tr className="border-b border-slate-200 bg-red-50/50 text-[10px] uppercase font-bold text-slate-500">
                          <th className="p-2.5 rounded-l-lg">Candidate</th>
                          <th className="p-2.5">Notice Remaining</th>
                          <th className="p-2.5">Risk Level</th>
                          <th className="p-2.5 text-right rounded-r-lg">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-red-50/30">
                          <td className="p-2.5 font-extrabold text-slate-900">Rahul</td>
                          <td className="p-2.5 font-semibold text-slate-700">15 Days</td>
                          <td className="p-2.5">
                            <span className="bg-red-100 text-red-800 border border-red-300 font-black text-[10px] px-2 py-0.5 rounded-full">
                              🔴 High Risk
                            </span>
                          </td>
                          <td className="p-2.5 text-right">
                            <button 
                              onClick={() => alert("Calling Rahul...")}
                              className="bg-[#FFD400] text-[#0F172A] px-3 py-1 rounded-lg font-black text-[10px] hover:brightness-105 cursor-pointer shadow-2xs"
                            >
                              Call Now
                            </button>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="p-2.5 font-extrabold text-slate-900">Vikram</td>
                          <td className="p-2.5 font-semibold text-slate-700">30 Days</td>
                          <td className="p-2.5">
                            <span className="bg-amber-100 text-amber-800 border border-amber-300 font-black text-[10px] px-2 py-0.5 rounded-full">
                              🟡 Medium Risk
                            </span>
                          </td>
                          <td className="p-2.5 text-right">
                            <button 
                              onClick={() => alert("Pulse check to Vikram...")}
                              className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg font-bold text-[10px] hover:bg-slate-200 cursor-pointer"
                            >
                              Pulse Check
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SECTION 9: PENDING CLIENT FEEDBACK */}
                <div className="bg-white border border-amber-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                  <div className="flex justify-between items-center border-b border-amber-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-600 text-[20px]">schedule</span>
                      <h3 className="font-extrabold text-sm text-slate-900">Pending Client Feedback</h3>
                    </div>
                    <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                      Action Required
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead>
                        <tr className="border-b border-slate-200 bg-amber-50/50 text-[10px] uppercase font-bold text-slate-500">
                          <th className="p-2.5 rounded-l-lg">Client</th>
                          <th className="p-2.5">Requirement</th>
                          <th className="p-2.5">Waiting Since</th>
                          <th className="p-2.5 text-right rounded-r-lg">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-amber-50/30">
                          <td className="p-2.5 font-extrabold text-slate-900">Infosys</td>
                          <td className="p-2.5 font-semibold text-slate-700">React Developer</td>
                          <td className="p-2.5 font-bold text-amber-700">3 Days</td>
                          <td className="p-2.5 text-right">
                            <button 
                              onClick={() => alert("Sending reminder to Infosys...")}
                              className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-lg font-bold text-[10px] hover:bg-amber-200 cursor-pointer"
                            >
                              Reminder
                            </button>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="p-2.5 font-extrabold text-slate-900">Wipro</td>
                          <td className="p-2.5 font-semibold text-slate-700">HR Manager</td>
                          <td className="p-2.5 font-bold text-red-600">5 Days (Urgent)</td>
                          <td className="p-2.5 text-right">
                            <button 
                              onClick={() => alert("Escalating Wipro...")}
                              className="bg-red-100 text-red-800 border border-red-300 px-2.5 py-1 rounded-lg font-bold text-[10px] hover:bg-red-200 cursor-pointer"
                            >
                              Escalate
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* SECTION 10: RECENT ACTIVITIES STREAM */}
              {/* ----------------------------------------------------------------- */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sky-600 text-[20px]">history</span>
                    <h3 className="font-extrabold text-sm text-slate-900">Recent Activities</h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">Live System Feed</span>
                </div>

                <div className="space-y-2.5">
                  {[
                    { text: "Rahul moved to Interview stage", time: "10 mins ago", icon: "swap_horiz", bg: "bg-purple-50 text-purple-700 border-purple-200" },
                    { text: "Offer sent to Priya (TCS Mandate)", time: "25 mins ago", icon: "badge", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                    { text: "ABC Tech created new requirement: Full Stack Lead", time: "1 hour ago", icon: "business_center", bg: "bg-amber-50 text-amber-700 border-amber-200" },
                    { text: "Candidate Sneha joined Infosys", time: "2 hours ago", icon: "task_alt", bg: "bg-teal-50 text-teal-700 border-teal-200" },
                  ].map((act, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50/70 rounded-xl border border-slate-200/70">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg border ${act.bg}`}>
                          <span className="material-symbols-outlined text-[16px]">{act.icon}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-800">{act.text}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">{act.time}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: CANDIDATES PAGE SURFACE */}
          {/* ========================================================================= */}
          {activeNavTab === "candidates" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Candidates Directory</h2>
                  <p className="text-xs text-slate-500">Manage candidate profiles & AI CV parsing</p>
                </div>
                <button 
                  onClick={() => setActiveModal("candidate")}
                  className="bg-[#FFD400] text-[#0F172A] font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-2xs hover:brightness-105"
                >
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  <span>+ Add Candidate</span>
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-2xs">
                <div className="h-16 w-16 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto border border-sky-200">
                  <span className="material-symbols-outlined text-[32px]">cloud_upload</span>
                </div>
                <h3 className="text-base font-black text-slate-900">Drag & Drop Resumes Here</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Supports PDF and TXT formats up to 5MB. Resumes are parsed automatically with Gemini AI.
                </p>
              </div>
            </div>
          )}

          {/* OTHER TABS */}
          {activeNavTab !== "dashboard" && activeNavTab !== "candidates" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2 shadow-2xs">
              <h2 className="text-2xl font-black text-slate-900 capitalize">{activeNavTab} Surface</h2>
              <p className="text-xs text-slate-500">Manage all {activeNavTab} workflows and data records</p>
            </div>
          )}

        </main>
      </div>

      {/* ========================================================================= */}
      {/* 3. PROFILE SLIDE-OVER DRAWER */}
      {/* ========================================================================= */}
      {profileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border-l border-slate-200 h-full p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300 text-slate-900">
            
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-[20px]">account_circle</span>
                  <h3 className="font-black text-xs uppercase tracking-wider text-slate-900">Owner Profile</h3>
                </div>
                <button
                  onClick={() => setProfileDrawerOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 text-center">
                <div className="h-16 w-16 rounded-2xl bg-[#FFD400] text-[#0F172A] flex items-center justify-center font-black text-2xl mx-auto shadow-md">
                  DS
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Divyanshu Sharma</h3>
                  <p className="text-xs text-amber-700 font-extrabold uppercase tracking-wider mt-0.5">
                    Agency Founder & Owner
                  </p>
                  <p className="text-xs text-slate-500 mt-1 font-mono">owner@recruitpro.com</p>
                </div>
              </div>

              <div className="space-y-3 bg-white border border-slate-200 p-4 rounded-2xl text-xs shadow-2xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Agency Name</span>
                  <span className="font-extrabold text-slate-900">Apex Talent Partners</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Tenant ID</span>
                  <span className="font-mono text-[10px] font-bold text-slate-600">11111111-1111-4111-8111...</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 font-semibold">Subscription</span>
                  <span className="bg-emerald-100 text-emerald-800 font-black text-[10px] px-2 py-0.5 rounded-full border border-emerald-300">
                    Enterprise Active
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>Log Out of RecruitPro</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. QUICK ACTION CREATION MODALS */}
      {/* ========================================================================= */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-black text-xs uppercase tracking-wider text-amber-700">
                + Create {activeModal.toUpperCase()}
              </h4>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {modalSuccessMessage ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold p-4 rounded-xl text-center text-xs space-y-1">
                <span className="material-symbols-outlined text-[24px] text-emerald-600">check_circle</span>
                <p>{modalSuccessMessage}</p>
              </div>
            ) : (
              <form onSubmit={(e) => handleModalSubmit(e, activeModal)} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px]">Title / Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter details..."
                    value={formField1}
                    onChange={(e) => setFormField1(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px]">Client / Sub-Detail</label>
                  <input
                    type="text"
                    placeholder="e.g. Infosys / Department"
                    value={formField2}
                    onChange={(e) => setFormField2(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#FFD400] text-[#0F172A] font-black text-xs rounded-xl hover:brightness-105 transition-all cursor-pointer shadow-sm"
                >
                  Save & Create
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
