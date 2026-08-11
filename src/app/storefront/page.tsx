"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function StorefrontPage() {
  const router = useRouter();

  // Submission Form Modal State (ONLY opened by SUBMIT HIRING REQUIREMENT button)
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // About Section Contact Info Modal State
  const [showContactModal, setShowContactModal] = useState(false);

  // Form Fields State (8 Required Details)
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    position: "",
    openings: "3",
    experience: "5-8 Years",
    location: "Dubai, UAE",
    compensation: "$90,000 - $120,000 / Year",
    priority: "Urgent",
    commercialModel: "15% Contingency Success Fee",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newMandate = {
      id: `MAND-${Date.now().toString().slice(-4)}`,
      companyName: formData.companyName || "New Enterprise Client",
      industry: "Executive Search & Technology",
      contactPerson: formData.contactPerson || "Hiring Lead",
      position: formData.position || "Senior Executive Lead",
      openings: parseInt(formData.openings) || 1,
      experience: formData.experience,
      location: formData.location,
      compensation: formData.compensation,
      priority: formData.priority,
      commercialModel: formData.commercialModel,
      dateSubmitted: "Just Now",
    };

    // Save to localStorage so Recruiter Cockpit can ingest it immediately
    try {
      const existing = JSON.parse(localStorage.getItem("recruitos_open_mandates") || "[]");
      localStorage.setItem("recruitos_open_mandates", JSON.stringify([newMandate, ...existing]));
    } catch (err) {
      console.error("Failed to save mandate to localStorage", err);
    }

    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setShowSubmitModal(false);
      // Navigate back to Cockpit Open Mandates
      router.push("/cockpit");
    }, 1800);
  };

  const handleAboutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowContactModal(true);
    const aboutSec = document.getElementById("about");
    if (aboutSec) {
      aboutSec.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-x-hidden selection:bg-[#FFD400] selection:text-[#0F172A]">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & NAVBAR (Centered Navigation Links) */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 md:px-16 py-4 flex items-center justify-between shadow-2xs">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/cockpit")}>
          <div className="h-10 w-10 rounded-xl bg-[#FFD400] text-[#0F172A] flex items-center justify-center font-black shadow-md">
            <span className="material-symbols-outlined text-[24px]">work</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-[#0F172A] tracking-tight">
              Apex <span className="text-slate-600 font-bold">Recruitment Partners</span>
            </h1>
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-amber-600">
              RecruitOS Enterprise Storefront
            </p>
          </div>
        </div>

        {/* CENTERED Navigation Options: Services | Markets | About */}
        <nav className="hidden md:flex items-center justify-center gap-10 text-xs font-black text-slate-700 bg-slate-100/80 border border-slate-200/80 px-8 py-2.5 rounded-full shadow-2xs">
          <a 
            href="#services" 
            className="hover:text-amber-600 transition-colors uppercase tracking-wider"
          >
            Services
          </a>
          <a 
            href="#markets" 
            className="hover:text-amber-600 transition-colors uppercase tracking-wider"
          >
            Markets
          </a>
          <button 
            onClick={handleAboutClick}
            className="hover:text-amber-600 transition-colors uppercase tracking-wider cursor-pointer font-black"
          >
            About
          </button>
        </nav>

        {/* Right: Only Submit Hiring Requirement & Back to Cockpit */}
        <div className="flex items-center gap-4">
          {/* Yellow CTA Button: ONLY THIS BUTTON OPENS FILLUP FORM */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="bg-[#FFD400] text-[#0F172A] hover:brightness-105 font-black px-5 py-2.5 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer text-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>SUBMIT HIRING REQUIREMENT</span>
          </button>

          <button
            onClick={() => router.push("/cockpit")}
            className="hidden sm:flex text-slate-500 hover:text-slate-900 text-xs font-bold underline items-center gap-1 cursor-pointer"
          >
            <span>Back to Cockpit</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="px-6 md:px-16 pt-16 pb-20 max-w-6xl mx-auto text-center space-y-8">
        
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 bg-amber-100/70 border border-amber-300 px-4 py-1.5 rounded-full">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest">
            Exclusively Global, Locally Rooted.
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
          Premier Executive Search for <span className="bg-[#0F172A] text-[#FFD400] px-4 py-1 rounded-2xl inline-block shadow-lg">Gulf</span> & Emerging Markets
        </h1>

        {/* Subtitle */}
        <p className="text-sm md:text-base font-medium text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Connecting world-class talent with industry leaders across the UAE, KSA, and beyond. We combine local market intelligence with a global search footprint.
        </p>

        {/* Hero Action Buttons (Does NOT open modal, scrolls to sections) */}
        <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
          <a 
            href="#markets"
            className="bg-[#0F172A] text-white hover:bg-slate-800 font-black text-xs px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-2"
          >
            <span>View Market Capabilities</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </a>

          <a 
            href="#about"
            onClick={handleAboutClick}
            className="bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 font-extrabold text-xs px-6 py-3.5 rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            Meet Our Partners & Contact
          </a>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. KEY STATS BANNER (#0F172A Dark Slate + #FFD400 Yellow Numbers) */}
      {/* ========================================================================= */}
      <section className="bg-[#0F172A] text-white py-12 px-6 md:px-16 shadow-xl">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800 text-center">
          
          <div className="py-6 md:py-0 px-4 space-y-1">
            <p className="text-4xl md:text-5xl font-black text-[#FFD400] tracking-tight">140+</p>
            <p className="text-xs font-extrabold text-slate-300 uppercase tracking-widest">Executive Placements</p>
          </div>

          <div className="py-6 md:py-0 px-4 space-y-1">
            <p className="text-4xl md:text-5xl font-black text-[#FFD400] tracking-tight">72h</p>
            <p className="text-xs font-extrabold text-slate-300 uppercase tracking-widest">Average Shortlist SLA</p>
          </div>

          <div className="py-6 md:py-0 px-4 space-y-1">
            <p className="text-4xl md:text-5xl font-black text-[#FFD400] tracking-tight">98%</p>
            <p className="text-xs font-extrabold text-slate-300 uppercase tracking-widest">Placement Retention Rate</p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SERVICES SECTION (Tailored to RecruitOS Project Requirements) */}
      {/* ========================================================================= */}
      <section id="services" className="px-6 md:px-16 py-20 max-w-6xl mx-auto space-y-12">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block">
              OUR CORE RECRUITMENT SERVICES
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Domain Expertise Across High-Growth Sectors
            </h2>
            <p className="text-xs text-slate-500 max-w-xl">
              Our recruitment consultants bring deep functional knowledge to every mandate, ensuring a nuanced understanding of technical, executive, and cultural requirements.
            </p>
          </div>
        </div>

        {/* Specialized Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Service 1 */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xs hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[26px]">stars</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">Executive Search & Headhunting</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dedicated C-Suite, VP, and Director level leadership search across UAE, KSA, and global markets.
              </p>
            </div>
          </div>

          {/* Service 2 */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xs hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[26px]">terminal</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">Tech & AI Hiring</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Niche talent acquisition for Full-Stack, Cloud Architects, AI Engineers, and Product Managers.
              </p>
            </div>
          </div>

          {/* Service 3 */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xs hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[26px]">bolt</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">72h SLA Shortlisting</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Guaranteed high-speed candidate pipeline delivery backed by automated CV parsing and SLA radar.
              </p>
            </div>
          </div>

          {/* Service 4 */}
          <div className="bg-[#0F172A] text-white border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md">
            <div className="h-12 w-12 rounded-2xl bg-[#FFD400] text-[#0F172A] flex items-center justify-center font-black">
              <span className="material-symbols-outlined text-[26px]">handshake</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-white">Contingency & RPO Models</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Flexible engagement models tailored for scale-ups and global enterprises with success-based fees.
              </p>
            </div>
          </div>

        </div>

        {/* Sector Practices Grid matching Screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          
          {/* Card 1: Financial Services (Large Image Card) */}
          <div className="relative rounded-3xl overflow-hidden min-h-[360px] bg-slate-900 text-white p-8 flex flex-col justify-end group shadow-lg">
            <Image 
              src="/images/financial_services_city.png" 
              alt="Financial Services Skyline" 
              fill
              className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

            <div className="relative z-10 space-y-2">
              <span className="material-symbols-outlined text-amber-400 text-[28px]">account_balance</span>
              <h3 className="text-2xl font-black text-white">Financial Services</h3>
              <p className="text-xs text-slate-300 font-medium max-w-sm">
                Private Equity, Sovereign Wealth Funds, and Digital Banking leadership search.
              </p>
              <div className="w-12 h-1 bg-[#FFD400] rounded-full pt-1"></div>
            </div>
          </div>

          {/* Right Sub-Grid (3 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Technology & AI */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
              <span className="material-symbols-outlined text-[#0F172A] text-[28px]">grid_view</span>
              <div>
                <h4 className="text-lg font-black text-slate-900">Technology & AI</h4>
                <p className="text-xs text-slate-500 mt-1">Scaling engineering hubs & AI leadership.</p>
              </div>
            </div>

            {/* Strategy & Infra (Dark Slate Card) */}
            <div className="bg-[#0F172A] text-white border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md flex flex-col justify-between">
              <span className="material-symbols-outlined text-[#FFD400] text-[28px]">domain</span>
              <div>
                <h4 className="text-lg font-black text-white">Strategy & Infra</h4>
                <p className="text-xs text-slate-300 mt-1">Mega projects & large scale logistics.</p>
              </div>
            </div>

            {/* Life Sciences (Full Width in Sub-grid) */}
            <div className="sm:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 space-y-2 shadow-2xs hover:shadow-md transition-all">
              <h4 className="text-lg font-black text-slate-900">Life Sciences</h4>
              <p className="text-xs text-slate-500">Pharma leadership and healthcare tech expansion across GCC.</p>
            </div>

          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 5. MARKETS SECTION (Tailored to RecruitOS Global Footprint) */}
      {/* ========================================================================= */}
      <section id="markets" className="bg-slate-900 text-white py-20 px-6 md:px-16 border-y border-slate-800">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="space-y-2 text-center max-w-2xl mx-auto">
            <span className="text-[10px] font-black text-[#FFD400] uppercase tracking-widest block">
              GLOBAL TALENT FOOTPRINT
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Markets & Regions We Cover
            </h2>
            <p className="text-xs text-slate-400">
              Connecting emerging markets and tier-1 tech hubs through localized recruitment teams.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            
            <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 space-y-3">
              <div className="text-3xl font-black text-[#FFD400]">🇦🇪 🇸🇦</div>
              <h3 className="text-lg font-black text-white">Middle East & GCC</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Dubai UAE (HQ), Riyadh KSA, Qatar, Kuwait, Oman executive leadership placement.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 space-y-3">
              <div className="text-3xl font-black text-[#FFD400]">🇸🇬 🇮🇳</div>
              <h3 className="text-lg font-black text-white">Southeast Asia & APAC</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Singapore regional tech hub and Indian software development centers.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 space-y-3">
              <div className="text-3xl font-black text-[#FFD400]">🇬🇧 🇪🇺</div>
              <h3 className="text-lg font-black text-white">Europe & UK</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                London financial tech and European tech expansion leadership.
              </p>
            </div>

            <div className="bg-[#FFD400] text-[#0F172A] rounded-3xl p-6 space-y-3 font-black">
              <span className="material-symbols-outlined text-[32px]">public</span>
              <h3 className="text-lg font-black">Remote & Global Relocation</h3>
              <p className="text-xs font-semibold leading-relaxed text-[#0F172A]/80">
                End-to-end relocation assistance and global remote talent sourcing.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. ABOUT SECTION & CONTACT INFORMATION */}
      {/* ========================================================================= */}
      <section id="about" className="bg-slate-100/70 border-b border-slate-200 py-20 px-6 md:px-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Photo + Floating Yellow Box */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white h-[450px]">
              <Image 
                src="/images/executive_leader_woman.png" 
                alt="Executive Consultant Leader" 
                fill
                className="object-cover"
              />
            </div>

            {/* Yellow Floating Network Badge */}
            <div className="absolute -bottom-6 -right-4 bg-[#FFD400] text-[#0F172A] p-6 rounded-3xl shadow-xl font-black space-y-1">
              <p className="text-3xl tracking-tight">24k</p>
              <p className="text-[10px] uppercase tracking-widest font-extrabold text-[#0F172A]/80">Vetted Network</p>
            </div>
          </div>

          {/* Right Column: Content + Direct Contact Box */}
          <div className="space-y-6">
            <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest block">
              OUR METHODOLOGY & ABOUT US
            </span>

            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Data-Informed Selection. Intuition-Driven Matching.
            </h2>

            {/* Contact Info Highlight Box */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600 text-[18px]">contact_phone</span>
                <span>Agency Contact Information</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                {/* WhatsApp */}
                <a 
                  href="https://wa.me/971501234567" 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-bold flex items-center gap-2.5 hover:bg-emerald-100 transition-colors"
                >
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">chat</span>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-emerald-700">WhatsApp Support</p>
                    <p className="text-xs font-black">+971 50 123 4567</p>
                  </div>
                </a>

                {/* Email */}
                <a 
                  href="mailto:mandates@apexpartners.ae" 
                  className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-bold flex items-center gap-2.5 hover:bg-amber-100 transition-colors"
                >
                  <span className="material-symbols-outlined text-amber-600 text-[20px]">mail</span>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-amber-700">Direct Email</p>
                    <p className="text-xs font-black">mandates@apexpartners.ae</p>
                  </div>
                </a>

              </div>
            </div>

            <div className="space-y-4 pt-1">
              
              {/* Pillar 1 */}
              <div className="flex gap-4 items-start">
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 shadow-2xs font-bold text-xs flex-shrink-0">
                  01
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Precision Headhunting</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    We active headhunt top 1% executive leaders across GCC and global technology hubs.
                  </p>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="flex gap-4 items-start">
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 shadow-2xs font-bold text-xs flex-shrink-0">
                  02
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Cultural & SLA Radar</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Every mandate is tracked using RecruitOS SLA aging radar ensuring candidate delivery within 72 hours.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-[#0F172A] text-slate-400 text-xs py-16 px-6 md:px-16 border-t border-slate-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-[#FFD400] text-[#0F172A] flex items-center justify-center font-black">
                <span className="material-symbols-outlined text-[18px]">work</span>
              </div>
              <span className="text-base font-black text-white">Apex Partners</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              The executive search partner of choice for transformational leadership across the Middle East and emerging global hubs.
            </p>
          </div>

          {/* Col 2: Locations */}
          <div className="space-y-3">
            <h4 className="font-black text-white text-xs uppercase tracking-wider">Locations</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>Dubai, UAE (HQ)</li>
              <li>Riyadh, KSA</li>
              <li>London, UK</li>
              <li>Singapore</li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div className="space-y-3">
            <h4 className="font-black text-white text-xs uppercase tracking-wider">Resources</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li className="hover:text-white cursor-pointer" onClick={() => setShowContactModal(true)}>Contact Information</li>
              <li className="hover:text-white cursor-pointer">Market Insights</li>
              <li className="hover:text-white cursor-pointer">Salary Benchmarking</li>
              <li className="hover:text-white cursor-pointer">Client Login</li>
            </ul>
          </div>

          {/* Col 4: Action */}
          <div className="space-y-3">
            <h4 className="font-black text-white text-xs uppercase tracking-wider">Client Requirement</h4>
            <p className="text-[11px]">Need to hire executive leadership?</p>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full bg-[#FFD400] text-[#0F172A] font-black py-2.5 rounded-xl hover:brightness-105 shadow-md cursor-pointer"
            >
              Submit Mandate
            </button>
          </div>

        </div>

        <div className="max-w-6xl mx-auto pt-12 mt-12 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px]">
          <p>© 2026 Apex Recruitment Partners Ltd. All Rights Reserved.</p>
          <p className="text-slate-500">Powered by RecruitOS V3 Enterprise Platform</p>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 8. ABOUT / CONTACT INFORMATION MODAL */}
      {/* ========================================================================= */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl space-y-6 text-slate-900">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <span className="material-symbols-outlined text-[24px]">call</span>
                </div>
                <div>
                  <h4 className="font-black text-base text-[#0F172A] tracking-tight">
                    Contact & Agency Information
                  </h4>
                  <p className="text-[11px] text-slate-500">Reach out directly to our search consultants</p>
                </div>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* WhatsApp Row */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-600 text-[26px]">chat</span>
                  <div>
                    <p className="font-black text-emerald-900 text-sm">WhatsApp Support</p>
                    <p className="text-emerald-700 font-mono text-xs">+971 50 123 4567 / +91 98765 43210</p>
                  </div>
                </div>
                <a
                  href="https://wa.me/971501234567"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-600 text-white font-black px-4 py-2 rounded-xl text-[11px] hover:bg-emerald-700 transition-colors"
                >
                  Chat Now
                </a>
              </div>

              {/* Email Row */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-amber-600 text-[26px]">mail</span>
                  <div>
                    <p className="font-black text-amber-900 text-sm">Direct Agency Email</p>
                    <p className="text-amber-700 font-mono text-xs">mandates@apexpartners.ae</p>
                  </div>
                </div>
                <a
                  href="mailto:mandates@apexpartners.ae"
                  className="bg-amber-600 text-white font-black px-4 py-2 rounded-xl text-[11px] hover:bg-amber-700 transition-colors"
                >
                  Send Email
                </a>
              </div>

              {/* HQ Address Row */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <p className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-slate-700 text-[18px]">location_on</span>
                  <span>Headquarters & Global Hubs</span>
                </p>
                <p className="text-slate-600 font-medium pl-6 text-[11px]">
                  Level 24, Al Khatem Tower, ADGM Square, Maryah Island, Abu Dhabi, UAE
                </p>
                <p className="text-slate-500 pl-6 text-[10px]">
                  Additional Hubs: Dubai Internet City (UAE) | Riyadh Digital City (KSA) | Singapore
                </p>
              </div>

              {/* Hours & Tenant ID */}
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="font-bold text-slate-500 text-[10px]">Business Hours</p>
                  <p className="font-extrabold text-slate-800">Mon - Fri: 9am - 6pm GST</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="font-bold text-slate-500 text-[10px]">RecruitOS Tenant ID</p>
                  <p className="font-mono font-bold text-amber-700 text-[10px]">11111111-1111-4111...</p>
                </div>
              </div>

            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowContactModal(false)}
                className="w-full py-2.5 bg-slate-900 text-white font-black text-xs rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. SUBMIT HIRING REQUIREMENT FORM MODAL (8 DETAILED FIELDS) */}
      {/* ========================================================================= */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 w-full max-w-xl shadow-2xl space-y-4 text-slate-900">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-black text-base text-[#0F172A] tracking-tight">
                  Submit Hiring Requirement
                </h4>
                <p className="text-[11px] text-slate-500">Provide your hiring specs to ingest into Open Mandates</p>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {submittedSuccess ? (
              <div className="p-8 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-center space-y-2">
                <span className="material-symbols-outlined text-[40px] text-emerald-600">check_circle</span>
                <h3 className="text-lg font-black">Requirement Submitted!</h3>
                <p className="text-xs text-emerald-700 font-medium">
                  Your mandate has been ingested into RecruitOS Open Mandates. Redirecting to Cockpit...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                
                {/* Field 1 & 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">1. Company Details *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Tech Solutions"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">Contact Person *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins (HR VP)"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Field 3 & 4 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">2. Position to be Hired *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Full Stack Lead"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">3. Number of Openings *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 4"
                      value={formData.openings}
                      onChange={(e) => setFormData({ ...formData, openings: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Field 5 & 6 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">4. Required Experience *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 5-8 Years"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">5. Location *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dubai, UAE"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Field 7 & 8 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">6. Compensation Range *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. $90,000 - $120,000"
                      value={formData.compensation}
                      onChange={(e) => setFormData({ ...formData, compensation: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">7. Hiring Priority *</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="Urgent">Urgent</option>
                      <option value="High">High</option>
                      <option value="Normal">Normal</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">8. Commercial Engagement Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15% Contingency Success Fee"
                    value={formData.commercialModel}
                    onChange={(e) => setFormData({ ...formData, commercialModel: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#FFD400] text-[#0F172A] font-black text-xs rounded-xl shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer"
                  >
                    Submit Mandate Requirement
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
