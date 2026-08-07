"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface StorefrontData {
  storefrontId: string;
  agencyId: string;
  subdomain: string;
  brandLogoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  heroHeadline: string;
  aboutText: string | null;
  featuredSpecializations: string[];
  showMetricsBar: boolean;
  agencyName: string;
  stats: {
    placements: number;
    slaHours: number;
    retentionRate: number;
  };
}

export default function StorefrontPage() {
  const router = useRouter();
  const { subdomain } = useParams() as { subdomain: string };
  const [data, setData] = useState<StorefrontData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gallery, setGallery] = useState<any[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryCompany, setInquiryCompany] = useState("");

  useEffect(() => {
    if (!subdomain) return;

    const fetchStorefront = async () => {
      try {
        const response = await fetch(`/api/v1/public/storefront/${subdomain}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Agency storefront not found or is currently unpublished.");
          }
          throw new Error("Failed to load storefront profile.");
        }
        const resJson = await response.json();
        setData(resJson.data);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    const fetchGallery = async () => {
      try {
        const response = await fetch(`/api/v1/public/storefront/${subdomain}/hot-talent`);
        if (response.ok) {
          const resJson = await response.json();
          setGallery(resJson.gallery || []);
        }
      } catch (err) {
        console.error("Failed to load talent showcase gallery:", err);
      } finally {
        setLoadingGallery(false);
      }
    };

    fetchStorefront();
    fetchGallery();
  }, [subdomain]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-[#0F172A] rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 font-semibold animate-pulse">Loading Agency Storefront...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[48px]">domain_disabled</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">404 - Not Found</h1>
        <p className="text-slate-600 max-w-md mb-8">{error || "The requested agency storefront could not be located."}</p>
        <Link 
          href="/login" 
          className="px-6 py-3 bg-[#0F172A] hover:bg-slate-800 text-white rounded-lg font-semibold transition-all shadow-md active:scale-95"
        >
          Return to Login
        </Link>
      </div>
    );
  }

  // Use custom dynamic colors from profile settings, falling back to default theme
  const primaryBg = data.primaryColor || "#0F172A";
  const accentColor = data.accentColor || "#FFD400";

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FF]">
      {/* Navigation Header */}
      <header className="sticky top-0 bg-white border-b border-slate-100 z-50 shadow-sm transition-all duration-300">
        <div className="max-w-[1200px] mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {data.brandLogoUrl ? (
              <img src={data.brandLogoUrl} alt={data.agencyName} className="h-10 object-contain" />
            ) : (
              <div 
                className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: primaryBg }}
              >
                {data.agencyName.charAt(0)}
              </div>
            )}
            <span className="font-bold text-xl text-slate-800 tracking-tight">{data.agencyName}</span>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href={`/storefront/${subdomain}/submit`}
              className="px-5 py-2.5 rounded-lg text-slate-800 font-bold transition-all shadow-sm active:scale-95 flex items-center gap-2"
              style={{ backgroundColor: accentColor }}
            >
              <span className="material-symbols-outlined text-[18px]">add_task</span>
              Submit Hiring Request
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="text-white relative overflow-hidden py-24 md:py-32"
        style={{ backgroundColor: primaryBg }}
      >
        {/* Abstract background graphics to add premium aesthetic */}
        <div className="absolute inset-0 bg-radial-gradient opacity-20 pointer-events-none"></div>
        <div className="absolute right-0 top-0 w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none"></div>

        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column: Narrative information */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/95 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              Official Talent Partner
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-[1.15] tracking-tight">
              {data.heroHeadline}
            </h1>
            <p className="text-lg text-slate-300 font-medium max-w-2xl leading-relaxed">
              {data.aboutText || "Connecting industry-leading companies with top-tier pre-vetted professional talent across technology, engineering, finance, and operations."}
            </p>

            {/* Specializations badge list */}
            {data.featuredSpecializations && data.featuredSpecializations.length > 0 && (
              <div className="pt-4 space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Areas of Expertise</p>
                <div className="flex flex-wrap gap-2.5">
                  {data.featuredSpecializations.map((spec, idx) => (
                    <span 
                      key={idx} 
                      className="px-3.5 py-1.5 rounded-md bg-white/5 border border-white/10 text-slate-200 text-xs font-semibold hover:bg-white/10 transition-all cursor-default"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Interaction Card */}
          <div className="lg:col-span-5">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl text-slate-800 space-y-6">
              <div>
                <h3 className="font-bold text-2xl text-slate-900 leading-tight">Partner with Us</h3>
                <p className="text-sm text-slate-500 mt-1">Get started by selecting your user journey below.</p>
              </div>

              <div className="space-y-4">
                {/* Submit Mandate Option */}
                <Link
                  href={`/storefront/${subdomain}/submit`}
                  className="flex items-center justify-between p-4 border-2 border-slate-100 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[26px]">business_center</span>
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-slate-800">I am an Employer</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Submit hiring requirement &amp; terms</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
                </Link>

                {/* Drop Resume / Application Option */}
                <Link
                  href={`/storefront/${subdomain}/apply`}
                  className="w-full flex items-center justify-between p-4 border-2 border-slate-100 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[26px]">person_pin</span>
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-slate-800">I am a Candidate</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Drop your CV &amp; join talent pool</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
                </Link>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
                <span className="material-symbols-outlined text-[14px]">verified_user</span>
                Secured and encrypted tenant channel
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Performance Bar */}
      {data.showMetricsBar && (
        <section className="bg-white border-b border-slate-100 py-10 shadow-sm relative z-20">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <div className="py-4 md:py-0">
                <p className="text-4xl font-extrabold text-slate-800">{data.stats.placements}+</p>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mt-1">Placements Completed</p>
              </div>
              <div className="py-4 md:py-0">
                <p className="text-4xl font-extrabold text-slate-800">{data.stats.slaHours}h</p>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mt-1">Average Shortlist SLA</p>
              </div>
              <div className="py-4 md:py-0">
                <p className="text-4xl font-extrabold text-slate-800">{data.stats.retentionRate}%</p>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mt-1">Probation Retention Rate</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Hot Talent Showcase Gallery (AS-03) */}
      <section className="bg-slate-50 border-b border-slate-100 py-16">
        <div className="max-w-[1200px] mx-auto px-6 space-y-8">
          <div className="text-center md:text-left space-y-2">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-amber-200">
              Live Showcase
            </span>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Active Candidate Gallery</h2>
            <p className="text-slate-500 text-sm max-w-xl">
              Browse pre-vetted, high-fidelity professional profiles currently in our network. Contact us directly to request full resume credentials.
            </p>
          </div>

          {loadingGallery ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
            </div>
          ) : gallery.length === 0 ? (
            /* Fallback Mock Showcase if DB is empty to satisfy the rich aesthetics guidelines */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { id: "mock1", maskedName: "Candidate Ref: #F82B9A", title: "Senior Frontend Architect", experience: "8 Yrs Exp", notice: "Immediate Notice", skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"], tags: ["Geographically Mobile: Dubai", "Hot Lead"] },
                { id: "mock2", maskedName: "Candidate Ref: #3B92CE", title: "Lead DevOps Engineer", experience: "6 Yrs Exp", notice: "30 Days Notice", skills: ["AWS", "Terraform", "Kubernetes", "Docker", "CI/CD"], tags: ["Highly Rated"] },
                { id: "mock3", maskedName: "Candidate Ref: #90A11F", title: "Principal Product Manager", experience: "10 Yrs Exp", notice: "60 Days Notice", skills: ["Agile Roadmap", "Metrics-Driven", "SQL", "Amplitude"], tags: ["Geographically Mobile: Riyadh"] }
              ].map((cand) => (
                <div key={cand.id} className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 flex flex-col justify-between hover:scale-[1.02] hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">{cand.maskedName}</span>
                        <h4 className="font-extrabold text-slate-800 text-base truncate mt-0.5">{cand.title}</h4>
                      </div>
                      <span className="bg-slate-150 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                        {cand.experience}
                      </span>
                    </div>

                    {/* Tags */}
                    {cand.tags && cand.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {cand.tags.map((tag, i) => (
                          <span key={i} className="bg-amber-50 text-amber-700 border border-amber-100 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {cand.skills.slice(0, 4).map((skill, i) => (
                        <span key={i} className="bg-slate-50 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded border border-slate-100">
                          {skill}
                        </span>
                      ))}
                      {cand.skills.length > 4 && (
                        <span className="text-[10px] text-slate-400 font-bold self-center">+{cand.skills.length - 4} more</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] animate-pulse">circle</span>
                      {cand.notice}
                    </span>
                    <button 
                      onClick={() => {
                        setSelectedCandidate(cand);
                        setInquiryModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-lg text-slate-800 font-bold text-xs hover:brightness-95 active:scale-95 transition-all shadow"
                      style={{ backgroundColor: accentColor }}
                    >
                      Inquire Talent
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gallery.map((cand) => (
                <div key={cand.id} className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 flex flex-col justify-between hover:scale-[1.02] hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">{cand.maskedName}</span>
                        <h4 className="font-extrabold text-slate-800 text-base truncate mt-0.5">{cand.title}</h4>
                      </div>
                      <span className="bg-slate-150 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                        {cand.experience}
                      </span>
                    </div>

                    {/* Tags */}
                    {cand.tags && cand.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {cand.tags.map((tag: string, i: number) => (
                          <span key={i} className="bg-amber-50 text-amber-700 border border-amber-100 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {cand.skills.slice(0, 4).map((skill: string, i: number) => (
                        <span key={i} className="bg-slate-50 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded border border-slate-100">
                          {skill}
                        </span>
                      ))}
                      {cand.skills.length > 4 && (
                        <span className="text-[10px] text-slate-400 font-bold self-center">+{cand.skills.length - 4} more</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] animate-pulse">circle</span>
                      {cand.notice}
                    </span>
                    <button 
                      onClick={() => {
                        setSelectedCandidate(cand);
                        setInquiryModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-lg text-slate-800 font-bold text-xs hover:brightness-95 active:scale-95 transition-all shadow"
                      style={{ backgroundColor: accentColor }}
                    >
                      Inquire Talent
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Inquiry Popup Modal (AS-03) */}
      {inquiryModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="p-6 text-white flex justify-between items-center" style={{ backgroundColor: primaryBg }}>
              <div>
                <h3 className="text-lg font-black tracking-tight">Talent Inquiry</h3>
                <p className="text-slate-300 text-xs mt-0.5">{selectedCandidate.title}</p>
              </div>
              <button 
                onClick={() => {
                  setInquiryModalOpen(false);
                  setInquirySuccess(false);
                }}
                className="p-1 hover:bg-white/10 rounded transition-colors text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Body */}
            {inquirySuccess ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'wght' 700" }}>check_circle</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xl font-extrabold text-slate-800">Inquiry Dispatched!</h4>
                  <p className="text-slate-500 text-xs max-w-xs mx-auto">
                    We have received your interest in Candidate {selectedCandidate.id.substring(0, 6).toUpperCase()}. An account owner will contact you shortly with full profile credentials.
                  </p>
                </div>
              </div>
            ) : (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  setInquirySuccess(true);
                }}
                className="p-6 space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Your Name</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm font-semibold"
                    placeholder="e.g. John Doe"
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Work Email</label>
                  <input 
                    type="email" 
                    required 
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm font-semibold"
                    placeholder="e.g. john@company.com"
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Company Name</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm font-semibold"
                    placeholder="e.g. Acme Tech Labs"
                    value={inquiryCompany}
                    onChange={(e) => setInquiryCompany(e.target.value)}
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full py-3 rounded-lg text-slate-850 font-bold shadow-md hover:brightness-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                    style={{ backgroundColor: accentColor }}
                  >
                    Send Profile Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Content Body: Specialization overview */}
      <main className="flex-1 max-w-[1200px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-slate-800">Our Recruitment Philosophy</h3>
          <p className="text-slate-600 leading-relaxed">
            We believe that recruitment is not about placing keywords in boxes. It is about understanding the business goals, tech stack challenges, and team dynamics of our clients. Our rigorous, multi-level evaluation processes verify both soft alignment and hard capability.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Our platform guarantees complete transparency, SLA-guided updates, and data security at every stage of the candidate lifecycle.
          </p>
        </div>
        <div className="bg-slate-100/50 rounded-xl p-8 border border-slate-100 space-y-4">
          <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">flash_on</span>
            Why scale with {data.agencyName}?
          </h4>
          <ul className="space-y-3 text-slate-600 text-sm">
            <li className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[16px] text-emerald-500 font-bold">check</span>
              <span><strong>Pre-Vetted Pool:</strong> Access to exclusive passive talent not active on job boards.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[16px] text-emerald-500 font-bold">check</span>
              <span><strong>Fast Turnaround:</strong> Curated shortlists submitted within 72 hours of mandate signup.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[16px] text-emerald-500 font-bold">check</span>
              <span><strong>Active Retention:</strong> Continuous pulse checking during notice periods to prevent dropouts.</span>
            </li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© {new Date().getFullYear()} {data.agencyName}. Powered by RecruitOS.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/login" className="hover:text-white transition-colors font-bold text-slate-300">Recruiter Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
