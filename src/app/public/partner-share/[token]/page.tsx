"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function PartnerSharePage() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shareData, setShareData] = useState<any>(null);

  // Candidate Submission Form States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("30 Days");
  const [experienceMonths, setExperienceMonths] = useState("36");
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [skills, setSkills] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchShareDetails = async () => {
      try {
        const response = await fetch(`/api/v1/public/partner/${token}`);
        const data = await response.json();
        if (response.ok) {
          setShareData(data);
        } else {
          setError(data.error || "Shared mandate is expired, invalid, or removed.");
        }
      } catch (err) {
        setError("Unable to connect to the portal. Please check your network.");
      } finally {
        setLoading(false);
      }
    };
    fetchShareDetails();
  }, [token]);

  const handleSubmitCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      setSubmitSuccess(false);
      setSubmitMessage("Full Name and Email are required.");
      return;
    }
    setSubmitting(true);
    setSubmitMessage("");
    setSubmitSuccess(false);

    try {
      // Simulate/prepare ingestion webhook call (or direct isolated partner submission endpoint for PO-02)
      // For now, we connect directly to the job boards ingestion engine using our shared context!
      // This bridges PO-01 and PO-02 seamlessly.
      const response = await fetch(`/api/v1/webhooks/job-boards/LinkedIn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          externalJobId: `linkedin_job_${token.substring(0, 6)}`, // Simulated mapping mapping back to this token
          fullName,
          email,
          phone,
          skills: skills.split(",").map(s => s.trim()).filter(Boolean),
          experienceMonths: parseInt(experienceMonths) || 36,
          noticePeriodDays: noticePeriod === "Immediate" ? 0 : noticePeriod === "15 Days" ? 15 : noticePeriod === "30 Days" ? 30 : 60,
          currentCompany,
          currentTitle
        }),
      });

      const resJson = await response.json();
      if (response.ok) {
        setSubmitSuccess(true);
        setSubmitMessage("Candidate application successfully ingested and pipeline mapping updated!");
        // Clear fields
        setFullName("");
        setEmail("");
        setPhone("");
        setCurrentCompany("");
        setCurrentTitle("");
        setSkills("");
      } else {
        throw new Error(resJson.error || "Failed to submit candidate profile.");
      }
    } catch (err: any) {
      setSubmitSuccess(false);
      setSubmitMessage(err.message || "An unexpected error occurred during CV ingestion.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin"></div>
          <p className="text-slate-500 font-semibold text-xs uppercase tracking-widest">Loading Masking Vault...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-red-100 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[32px]">block</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">Access Denied</h2>
          <p className="text-sm text-slate-500">{error}</p>
          <div className="pt-4">
            <Link href="/" className="text-xs font-bold text-slate-900 bg-slate-100 px-4 py-2.5 rounded-lg hover:bg-slate-200 transition-colors">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { maskedJobTitle, maskedCompanyDescription, partnerSplitPercentage, agencySplitPercentage, expiresAt } = shareData;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header Banner */}
      <header className="bg-[#0F172A] text-white py-4 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-amber-400 text-slate-950 p-2 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px] font-bold">vpn_key</span>
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider uppercase">Partner Collaboration Network</h1>
            <p className="text-[10px] text-slate-400 font-medium">Anonymized Mandate & Masking Vault</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700">
          <span className="material-symbols-outlined text-amber-400 text-[16px]">account_balance_wallet</span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Split Fee: {agencySplitPercentage}% Agency / {partnerSplitPercentage}% Partner
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto p-6 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        {/* Mandate Description Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
            <div>
              <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-slate-200">
                Shared Mandate
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-3">{maskedJobTitle}</h2>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Target Role: {shareData.job?.roleTitle} &bull; Status: {shareData.job?.status}
              </p>
            </div>

            <div className="h-[1px] bg-slate-100"></div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sanitized Job Description</h3>
              <div className="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-5 rounded-lg border border-slate-100 whitespace-pre-line">
                {maskedCompanyDescription}
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium pt-2">
              <span className="material-symbols-outlined text-[14px]">info</span>
              <span>Magic link expires on: {new Date(expiresAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Candidate Submission Card */}
        <div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 sticky top-6">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Submit Candidate</h3>
              <p className="text-xs text-slate-500 leading-normal">
                Drop your CV to join the talent pool and apply for this mandate.
              </p>
            </div>

            {submitMessage && (
              <div className={`p-3 rounded text-xs font-semibold flex items-start gap-2 ${
                submitSuccess ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : "bg-red-50 text-red-800 border border-red-100"
              }`}>
                <span className="material-symbols-outlined text-[16px] mt-0.5">
                  {submitSuccess ? "check_circle" : "error"}
                </span>
                <span className="flex-1">{submitMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitCandidate} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Full Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Karan Johar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Address *</label>
                <input 
                  type="email"
                  required
                  placeholder="e.g. karan.johar@movies.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Phone Number</label>
                <input 
                  type="tel"
                  placeholder="e.g. +918112233445"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 text-xs font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Exp (Months)</label>
                  <input 
                    type="number"
                    placeholder="36"
                    value={experienceMonths}
                    onChange={(e) => setExperienceMonths(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 text-xs font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Notice Period</label>
                  <select
                    value={noticePeriod}
                    onChange={(e) => setNoticePeriod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 text-xs font-bold text-slate-900 cursor-pointer"
                  >
                    <option>Immediate</option>
                    <option>15 Days</option>
                    <option>30 Days</option>
                    <option>60 Days</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Current Company & Title</label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text"
                    placeholder="Dharma Productions"
                    value={currentCompany}
                    onChange={(e) => setCurrentCompany(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 text-xs font-semibold text-slate-900"
                  />
                  <input 
                    type="text"
                    placeholder="Creative Director"
                    value={currentTitle}
                    onChange={(e) => setCurrentTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Skills (Comma separated)</label>
                <input 
                  type="text"
                  placeholder="React, Next.js, CSS"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 text-xs font-semibold text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#0F172A] text-white font-extrabold py-3 rounded-lg hover:brightness-90 active:scale-95 transition-all text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Ingesting Profile..." : "Submit CV & Apply"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
