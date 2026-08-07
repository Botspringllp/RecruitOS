"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface StorefrontData {
  agencyName: string;
  primaryColor: string;
  accentColor: string;
  brandLogoUrl: string | null;
}

export default function SubmitMandatePage() {
  const router = useRouter();
  const { subdomain } = useParams() as { subdomain: string };
  const [storefront, setStorefront] = useState<StorefrontData | null>(null);
  const [loading, setLoading] = useState(true);

  // Wizard state
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Form Fields
  // Step 1: Contact Info
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Step 2: Role Specifications
  const [jobTitle, setJobTitle] = useState("");
  const [targetLocation, setTargetLocation] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("30");

  // Step 3: Terms Selection
  const [selectedTermType, setSelectedTermType] = useState("Standard Contingency");

  // Step 4: JD Drop / Text
  const [jdDescription, setJdDescription] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!subdomain) return;
    const fetchStorefront = async () => {
      try {
        const res = await fetch(`/api/v1/public/storefront/${subdomain}`);
        if (res.ok) {
          const json = await res.json();
          setStorefront(json.data);
        }
      } catch (err) {
        console.error("Error loading storefront details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStorefront();
  }, [subdomain]);

  const handleNext = () => {
    setFormError("");

    if (step === 1) {
      if (!companyName.trim() || !contactName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
        setFormError("All contact fields are required.");
        return;
      }
      if (!contactEmail.includes("@")) {
        setFormError("Please enter a valid email address.");
        return;
      }
    }

    if (step === 2) {
      if (!jobTitle.trim() || !targetLocation.trim()) {
        setFormError("Job title and location are required.");
        return;
      }
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    setFormError("");
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setFormError("");
    setSubmitting(true);

    try {
      const payload = {
        companyName,
        contactName,
        contactEmail,
        contactPhone,
        jobTitle,
        targetLocation,
        minBudget: minBudget ? parseFloat(minBudget) : null,
        maxBudget: maxBudget ? parseFloat(maxBudget) : null,
        selectedTermType,
        rawJdUrl: jdDescription.trim() || null,
      };

      const response = await fetch(`/api/v1/public/storefront/${subdomain}/submit-mandate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to submit mandate.");
      }

      setCompleted(true);
    } catch (err: any) {
      setFormError(err.message || "Something went wrong during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  const primaryBg = storefront?.primaryColor || "#0F172A";
  const accentColor = storefront?.accentColor || "#FFD400";
  const agencyName = storefront?.agencyName || "RecruitOS Partner";

  return (
    <div className="min-h-screen bg-[#F8F9FF] flex flex-col">
      {/* Mini Branded Header */}
      <header className="bg-white border-b border-slate-100 py-5 shadow-sm">
        <div className="max-w-[800px] mx-auto px-6 flex justify-between items-center">
          <Link href={`/storefront/${subdomain}`} className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400">arrow_back</span>
            <span className="font-bold text-slate-800 tracking-tight">{agencyName} Storefront</span>
          </Link>
          <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Hiring Inbound Portal</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center py-12 px-6">
        <div className="max-w-[650px] w-full mx-auto bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden flex flex-col transition-all duration-300">
          
          {/* Header Banner */}
          <div className="p-8 text-white text-center relative overflow-hidden" style={{ backgroundColor: primaryBg }}>
            <div className="relative z-10 space-y-2">
              <h2 className="text-2xl font-black tracking-tight">Submit a Hiring Mandate</h2>
              <p className="text-slate-300 text-sm">Tell us who you are looking to hire, and we will get to work.</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/15 to-transparent pointer-events-none"></div>
          </div>

          {completed ? (
            /* Success State */
            <div className="p-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <span className="material-symbols-outlined text-[42px]" style={{ fontVariationSettings: "'wght' 700" }}>check_circle</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-slate-800">Mandate Received!</h3>
                <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed">
                  Thank you for submitting your mandate details. A Senior Recruitment consultant will reach out to confirm terms and details within 4 hours.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100">
                <Link 
                  href={`/storefront/${subdomain}`}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-slate-850 font-bold shadow-md hover:brightness-95 transition-all"
                  style={{ backgroundColor: accentColor }}
                >
                  Return to Storefront
                </Link>
              </div>
            </div>
          ) : (
            /* Active Form State */
            <div className="p-8 flex-1 flex flex-col">
              {/* Progress Indicator */}
              <div className="flex items-center justify-between mb-8">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex-1 flex items-center">
                    <div 
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        step === s 
                          ? "text-slate-900 border-2 border-slate-800 scale-110" 
                          : step > s 
                            ? "bg-slate-800 text-white" 
                            : "bg-slate-100 text-slate-400"
                      }`}
                      style={{ 
                        borderColor: step === s ? primaryBg : undefined,
                        backgroundColor: step > s ? primaryBg : undefined 
                      }}
                    >
                      {step > s ? (
                        <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                      ) : s}
                    </div>
                    {s < 4 && (
                      <div className={`flex-1 h-0.5 mx-2 ${step > s ? "bg-slate-800" : "bg-slate-100"}`}
                        style={{ backgroundColor: step > s ? primaryBg : undefined }}
                      ></div>
                    )}
                  </div>
                ))}
              </div>

              {formError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6 flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-red-500 text-[20px]">error_outline</span>
                  <p className="text-red-700 text-xs font-semibold">{formError}</p>
                </div>
              )}

              {/* Wizard Screens */}
              <div className="flex-1 space-y-6">
                
                {/* Step 1: Contact Info */}
                {step === 1 && (
                  <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
                    <h3 className="font-bold text-lg text-slate-800">1. Contact &amp; Company Details</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Company Name</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm font-semibold"
                            placeholder="e.g. Acme Tech Labs"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">HR Contact Name</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm font-semibold"
                            placeholder="e.g. Sarah Connor"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">HR Contact Email</label>
                          <input 
                            type="email" 
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm font-semibold"
                            placeholder="e.g. hr@acme.io"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">HR Contact Phone</label>
                          <input 
                            type="tel" 
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm font-semibold"
                            placeholder="e.g. +91 98765 43210"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Role Specifications */}
                {step === 2 && (
                  <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
                    <h3 className="font-bold text-lg text-slate-800">2. Role Specifications</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Target Job Title</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm font-semibold"
                            placeholder="e.g. Senior Backend Engineer"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Location / Remote Info</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm font-semibold"
                            placeholder="e.g. Bangalore / Remote"
                            value={targetLocation}
                            onChange={(e) => setTargetLocation(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Min Budget (Annual CTC)</label>
                          <input 
                            type="number" 
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm font-semibold"
                            placeholder="e.g. 1500000"
                            value={minBudget}
                            onChange={(e) => setMinBudget(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Max Budget (Annual CTC)</label>
                          <input 
                            type="number" 
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm font-semibold"
                            placeholder="e.g. 2500050"
                            value={maxBudget}
                            onChange={(e) => setMaxBudget(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Max Notice Period Allowed</label>
                        <select 
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm font-semibold bg-white"
                          value={noticePeriod}
                          onChange={(e) => setNoticePeriod(e.target.value)}
                        >
                          <option value="0">Immediate Joiner only</option>
                          <option value="15">15 Days</option>
                          <option value="30">30 Days</option>
                          <option value="60">60 Days</option>
                          <option value="90">90 Days</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Terms Selection */}
                {step === 3 && (
                  <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
                    <h3 className="font-bold text-lg text-slate-800">3. Commercial Terms</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Select your preferred fee terms layout. These rates are negotiable during our intake discovery.
                    </p>
                    <div className="space-y-4 pt-2">
                      {/* Option 1: Standard Contingency */}
                      <label 
                        className={`flex flex-col p-5 border-2 rounded-xl cursor-pointer transition-all ${
                          selectedTermType === "Standard Contingency"
                            ? "border-slate-800 bg-slate-50/50"
                            : "border-slate-100 hover:border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input 
                            type="radio" 
                            name="term_type"
                            className="h-4 w-4 text-slate-800 focus:ring-slate-800"
                            checked={selectedTermType === "Standard Contingency"}
                            onChange={() => setSelectedTermType("Standard Contingency")}
                          />
                          <div>
                            <span className="font-extrabold text-slate-800 text-sm">Standard Contingency (8.33% Placement Fee)</span>
                            <p className="text-slate-500 text-xs mt-1">Zero upfront cost. We only charge a success fee when the candidate successfully completes onboarding.</p>
                          </div>
                        </div>
                      </label>

                      {/* Option 2: Priority Retainer */}
                      <label 
                        className={`flex flex-col p-5 border-2 rounded-xl cursor-pointer transition-all ${
                          selectedTermType === "Priority Retainer"
                            ? "border-slate-800 bg-slate-50/50"
                            : "border-slate-100 hover:border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input 
                            type="radio" 
                            name="term_type"
                            className="h-4 w-4 text-slate-800 focus:ring-slate-800"
                            checked={selectedTermType === "Priority Retainer"}
                            onChange={() => setSelectedTermType("Priority Retainer")}
                          />
                          <div>
                            <span className="font-extrabold text-slate-800 text-sm">Priority Retainer (5% Upfront + 5% Success)</span>
                            <p className="text-slate-500 text-xs mt-1">Dedicated sourcing engine, custom video screening and priority weekly SLA review.</p>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Step 4: JD Drop / Text */}
                {step === 4 && (
                  <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
                    <h3 className="font-bold text-lg text-slate-800">4. Job Description &amp; Details</h3>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Enter Job Description / Sourcing Details (Optional)</label>
                        <textarea 
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm font-semibold h-40 resize-none"
                          placeholder="Paste job details, key skills, required experience, or target company parameters..."
                          value={jdDescription}
                          onChange={(e) => setJdDescription(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Action Buttons */}
              <div className="pt-8 mt-8 border-t border-slate-100 flex justify-between gap-4">
                {step > 1 ? (
                  <button 
                    onClick={handleBack}
                    disabled={submitting}
                    className="px-6 py-3 border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-bold text-slate-600 transition-all active:scale-95 disabled:opacity-50"
                  >
                    Back
                  </button>
                ) : (
                  <div></div>
                )}

                {step < 4 ? (
                  <button 
                    onClick={handleNext}
                    className="px-6 py-3 rounded-lg text-sm font-bold shadow-md hover:brightness-95 transition-all active:scale-95"
                    style={{ backgroundColor: accentColor, color: "#0F172A" }}
                  >
                    Next: {step === 1 ? "Role Specs" : step === 2 ? "Select Terms" : "Drop Details"}
                  </button>
                ) : (
                  <button 
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-3 rounded-lg text-sm font-bold shadow-md hover:brightness-95 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    style={{ backgroundColor: accentColor, color: "#0F172A" }}
                  >
                    {submitting && <span className="w-4 h-4 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></span>}
                    Submit Mandate to {storefront?.agencyName || "Agency"}
                  </button>
                )}
              </div>

            </div>
          )}

        </div>
      </main>

      {/* Mini Branded Footer */}
      <footer className="py-6 border-t border-slate-100 bg-white">
        <div className="max-w-[800px] mx-auto px-6 text-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} {agencyName}. Secure mandate ingestion system.</p>
        </div>
      </footer>
    </div>
  );
}
