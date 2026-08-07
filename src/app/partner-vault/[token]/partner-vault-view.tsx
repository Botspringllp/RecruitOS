"use client";

import React, { useState, useEffect } from "react";

interface PartnerVaultViewProps {
  token: string;
}

export default function PartnerVaultView({ token }: PartnerVaultViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareData, setShareData] = useState<any>(null);

  // Submission Form States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShareDetails() {
      try {
        const res = await fetch(`/api/v1/public/partner/${token}`);
        const data = await res.json();
        if (res.ok) {
          setShareData(data.share);
        } else {
          setError(data.error || "Failed to load shared mandate details");
        }
      } catch (err) {
        setError("Network error. Unable to contact RecruitOS vault.");
      } finally {
        setLoading(false);
      }
    }
    fetchShareDetails();
  }, [token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmitCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      setSubmitError("Please fill out all required fields.");
      return;
    }

    setUploading(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Simulate/Trigger submission integration (PO-02 groundwork)
      // We will parse name, email, phone, and files.
      // For now, we mock success state with details.
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitSuccess(true);
      setFullName("");
      setEmail("");
      setPhone("");
      setSelectedFile(null);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit candidate.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-12 h-12 border-4 border-[#0F172A] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold text-[#0F172A] uppercase tracking-widest animate-pulse">
          Opening Masking Vault...
        </p>
      </div>
    );
  }

  if (error || !shareData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-white border border-rose-100 rounded-xl p-8 max-w-md w-full text-center shadow-xl space-y-4">
          <span className="material-symbols-outlined text-rose-500 text-[48px]">report_problem</span>
          <h2 className="text-lg font-bold text-slate-800">Collaboration Link Issue</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {error || "The magic link you clicked is invalid, has expired, or has been revoked by the sponsoring agency."}
          </p>
          <div className="pt-2">
            <a 
              href="mailto:support@recruiteros.com" 
              className="inline-block bg-[#0F172A] text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:brightness-95 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    );
  }

  const partnerSplit = Number(shareData.partnerSplitPercentage);
  const agencySplit = 100 - partnerSplit;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Dark Navy Header */}
      <header className="bg-[#0F172A] h-16 px-6 flex justify-between items-center text-white shadow-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FFD400] flex items-center justify-center text-[#0F172A] font-black text-sm">
            R
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-wider uppercase">RecruitOS</h1>
            <p className="text-[10px] text-slate-400 font-medium">Partner Collaboration Network</p>
          </div>
        </div>

        {/* Dynamic Split Badge */}
        <div className="flex items-center gap-2 bg-[#FFD400]/10 border border-[#FFD400]/25 rounded-lg px-3.5 py-1.5 animate-in fade-in duration-300">
          <span className="w-2 h-2 rounded-full bg-[#FFD400] animate-pulse"></span>
          <span className="text-[11px] font-black text-[#FFD400] uppercase tracking-wider">
            Split Fee: {agencySplit}% Agency / {partnerSplit}% Partner
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: Mandate Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <div className="inline-block bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-3">
                Active Mandate
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                {shareData.maskedJobTitle}
              </h2>
            </div>

            {/* Split Info Card */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 rounded-lg p-4 text-xs">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Collaboration Split</p>
                <p className="font-bold text-slate-700 mt-1">
                  You receive {partnerSplit}% of the billing commission fee.
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Masking Status</p>
                <p className="font-bold text-[#FFD400] bg-[#0F172A] px-2 py-0.5 rounded-full inline-block text-[9px] mt-1 uppercase tracking-wider">
                  Secure Vault Protected
                </p>
              </div>
            </div>

            {/* Sanitized Job Description */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b pb-2">
                Sanitized Job Requirements
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                {shareData.maskedCompanyDescription}
              </p>
            </div>

            {/* General Instructions */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 space-y-2 text-xs text-blue-900">
              <p className="font-bold">Guidelines for Submission:</p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-blue-800">
                <li>Submit only candidates who fit the technical requirements.</li>
                <li>Ownership is tracked automatically via your unique partner link.</li>
                <li>Direct client communication is handled by the sponsoring recruitment agency.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Side: CV Submission Drawer */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-md space-y-5">
            <div className="text-center">
              <span className="material-symbols-outlined text-[#0F172A] text-[36px]">cloud_upload</span>
              <h3 className="text-sm font-bold text-slate-900 mt-2">Submit Candidate</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Drop candidate credentials to claim split fee</p>
            </div>

            {submitSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 text-center space-y-3 animate-in fade-in duration-300">
                <span className="material-symbols-outlined text-emerald-600 text-[36px]">check_circle</span>
                <p className="text-xs font-bold text-emerald-800">Candidate Submitted Successfully!</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Your candidate profile has been safely ingested into the agency cockpit under the protected partner pool.
                </p>
                <button 
                  onClick={() => setSubmitSuccess(false)}
                  className="w-full bg-[#0F172A] text-white text-xs font-bold py-2 rounded-lg hover:brightness-95 active:scale-95 transition-all cursor-pointer"
                >
                  Submit Another
                </button>
              </div>
            )}

            {submitError && (
              <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 text-xs font-semibold text-rose-800 flex items-center gap-2 animate-in fade-in duration-300">
                <span className="material-symbols-outlined text-[16px]">error</span>
                {submitError}
              </div>
            )}

            {!submitSuccess && (
              <form onSubmit={handleSubmitCandidate} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Candidate Full Name *</label>
                  <input 
                    type="text" 
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F172A]/10 transition-all"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address *</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane.doe@example.com"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F172A]/10 transition-all"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+971 50 123 4567"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F172A]/10 transition-all"
                  />
                </div>

                {/* Resume Upload Dropzone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Upload Resume (PDF/Word)</label>
                  <div className="border-2 border-dashed border-slate-300 hover:border-[#0F172A] rounded-lg p-4 text-center cursor-pointer transition-all bg-slate-50 relative">
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">upload_file</span>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1">
                      {selectedFile ? selectedFile.name : "Choose file or drag here"}
                    </p>
                  </div>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-[#FFD400] text-[#0F172A] font-extrabold py-3.5 rounded-lg hover:brightness-95 active:scale-95 transition-all shadow-md text-xs tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {uploading ? "Submitting Application..." : "Submit Candidate"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
