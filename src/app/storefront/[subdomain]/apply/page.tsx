"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface StorefrontData {
  agencyName: string;
  primaryColor: string;
  accentColor: string;
  brandLogoUrl: string | null;
}

export default function CandidateApplyPage() {
  const router = useRouter();
  const { subdomain } = useParams() as { subdomain: string };
  const [storefront, setStorefront] = useState<StorefrontData | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [desiredTitle, setDesiredTitle] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("30");
  const [expectedCtc, setExpectedCtc] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);

  // UI state
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setFormError("");
    const allowedExtensions = [".pdf", ".docx", ".txt"];
    const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    
    if (!allowedExtensions.includes(extension)) {
      setFormError("Invalid file type. Please upload a PDF, DOCX, or TXT resume.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFormError("File size exceeds the 10MB limit.");
      return;
    }

    setCvFile(file);
  };

  const removeFile = () => {
    setCvFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setFormError("Name, Email, and Phone number are required.");
      return;
    }

    if (!cvFile) {
      setFormError("Please upload your resume to submit your application.");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("noticePeriodDays", noticePeriod);
      formData.append("desiredTitle", desiredTitle);
      if (expectedCtc) formData.append("expectedCtc", expectedCtc);
      formData.append("file", cvFile);

      const response = await fetch(`/api/v1/public/storefront/${subdomain}/apply`, {
        method: "POST",
        body: formData,
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Failed to submit application.");
      }

      setCompleted(true);
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred during submission.");
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
    <div className="min-h-screen bg-[#F8F9FF] flex flex-col font-sans">
      {/* Mini Branded Header */}
      <header className="bg-white border-b border-slate-100 py-5 shadow-sm">
        <div className="max-w-[800px] mx-auto px-6 flex justify-between items-center">
          <Link href={`/storefront/${subdomain}`} className="flex items-center gap-2 text-slate-650 hover:text-slate-800 font-semibold transition-colors">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span>{agencyName} Storefront</span>
          </Link>
          <span className="text-xs text-slate-400 font-bold tracking-wider uppercase">Candidate Portal</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center py-12 px-6">
        <div className="max-w-[600px] w-full mx-auto bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden flex flex-col transition-all duration-300">
          
          {/* Header Banner */}
          <div className="p-8 text-white text-center relative overflow-hidden" style={{ backgroundColor: primaryBg }}>
            <div className="relative z-10 space-y-2">
              <h2 className="text-2xl font-black tracking-tight">Join {agencyName} Talent Network</h2>
              <p className="text-slate-350 text-sm">Drop your resume to get matched with active career opportunities.</p>
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
                <h3 className="text-2xl font-extrabold text-slate-800">Application Received!</h3>
                <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed">
                  We have added you to our active talent database. Our AI engine is parsing your profile, and our recruiter team will contact you once a matching position opens up.
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
            /* Form State */
            <form onSubmit={handleSubmit} className="p-8 flex-1 flex flex-col space-y-5">
              {formError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-red-500 text-[20px]">error_outline</span>
                  <p className="text-red-700 text-xs font-semibold">{formError}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Full Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm font-semibold"
                    placeholder="e.g. Priya Mehta"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                {/* Email and Phone Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
                    <input 
                      type="email" 
                      required
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm font-semibold"
                      placeholder="e.g. priya@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm font-semibold"
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Designation and Expected Salary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Desired Designation</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm font-semibold"
                      placeholder="e.g. Senior Frontend Engineer"
                      value={desiredTitle}
                      onChange={(e) => setDesiredTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Expected Salary (Annual)</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm font-semibold"
                      placeholder="e.g. 2400000"
                      value={expectedCtc}
                      onChange={(e) => setExpectedCtc(e.target.value)}
                    />
                  </div>
                </div>

                {/* Notice Period */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Notice Period (Days)</label>
                  <select 
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm font-semibold bg-white"
                    value={noticePeriod}
                    onChange={(e) => setNoticePeriod(e.target.value)}
                  >
                    <option value="0">Immediate / Serving Notice</option>
                    <option value="15">15 Days</option>
                    <option value="30">30 Days</option>
                    <option value="60">60 Days</option>
                    <option value="90">90 Days</option>
                  </select>
                </div>

                {/* Resume Dropzone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Resume Upload</label>
                  
                  {!cvFile ? (
                    <div 
                      className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                        dragActive ? "border-slate-800 bg-slate-50" : "border-slate-200 hover:border-slate-350 hover:bg-slate-50/50"
                      }`}
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <span className="material-symbols-outlined text-[36px] text-slate-450 mb-2">cloud_upload</span>
                      <p className="text-sm font-bold text-slate-800">Drag &amp; Drop Resume</p>
                      <p className="text-xs text-slate-400 mt-1">PDF, DOCX, or TXT up to 10MB</p>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileChange}
                      />
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[28px] text-red-500">description</span>
                        <div className="text-left">
                          <p className="text-sm font-bold text-slate-800 max-w-[280px] truncate">{cvFile.name}</p>
                          <p className="text-xs text-slate-400">{(cvFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={removeFile}
                        className="w-8 h-8 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-xl font-bold shadow-md hover:brightness-95 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-slate-900"
                  style={{ backgroundColor: accentColor }}
                >
                  {submitting && <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>}
                  {submitting ? "Uploading & Processing..." : "Submit Application"}
                </button>
              </div>
            </form>
          )}

        </div>
      </main>

      {/* Mini Branded Footer */}
      <footer className="py-6 border-t border-slate-100 bg-white">
        <div className="max-w-[800px] mx-auto px-6 text-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} {agencyName}. Secure application channel.</p>
        </div>
      </footer>
    </div>
  );
}
