import React, { useState, useRef } from 'react';
import { ArrowLeft, Briefcase, MapPin, Award, CheckCircle2, Upload, FileText, Loader2, Sparkles, Check } from 'lucide-react';
import { parseAndScoreCandidateResume } from '../services/candidatesService';

export default function PublicJobDetailsPage({ agency, job, onBack }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCandidate, setSubmittedCandidate] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  const primaryColor = agency?.primaryColor || '#0284c7';

  if (!job) {
    return (
      <div style={{ maxWidth: 800, margin: '60px auto', textAlign: 'center', padding: 24 }}>
        <h2>Job requirement not found.</h2>
        <button onClick={onBack} style={{ marginTop: 16, padding: '10px 20px', borderRadius: 8, background: primaryColor, color: '#fff', border: 'none' }}>
          Back to Jobs
        </button>
      </div>
    );
  }

  const handleFileChange = (file) => {
    setErrorMsg(null);
    if (file) setSelectedFile(file);
  };

  const handleApplySubmission = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please upload your resume PDF or DOCX document.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const skills = job.requiredSkills || [];
      const cand = await parseAndScoreCandidateResume(selectedFile, skills, job.id, job.jobTitle, agency.id);

      if (cand) {
        setSubmittedCandidate(cand);
      } else {
        throw new Error('Unable to parse resume');
      }
    } catch (err) {
      setErrorMsg('Application submission failed. Please try uploading your resume again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          padding: '8px 16px',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 700,
          color: '#475569',
          cursor: 'pointer',
          marginBottom: 24
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to All Openings</span>
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32, alignItems: 'start' }}>
        {/* Left Column: Job Description Details */}
        <div style={{ background: '#ffffff', borderRadius: 16, padding: 36, border: '1px solid #eaecf0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, background: `${primaryColor}15`, color: primaryColor, padding: '4px 12px', borderRadius: 20 }}>
              {job.employmentType || 'Full-Time'}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, background: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: 20 }}>
              📍 {job.location || 'Remote'}
            </span>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', marginBottom: 8, lineHeight: 1.2 }}>
            {job.jobTitle}
          </h1>

          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 28 }}>
            Managed by <strong>{agency?.name}</strong> • Posted {job.createdAt}
          </div>

          {/* Job Overview Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32, background: '#f8fafc', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Experience</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{job.experienceRequired || '3+ Years'}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Employment Type</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{job.employmentType || 'Full-Time'}</div>
            </div>
          </div>

          {/* Required Skills */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Required Technical Skills & Competencies</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(job.requiredSkills || []).map((skill, idx) => (
                <span key={idx} style={{ fontSize: 13, fontWeight: 700, background: `${primaryColor}15`, color: primaryColor, padding: '6px 14px', borderRadius: 8, border: `1px solid ${primaryColor}30` }}>
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Detailed Summary */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Position Overview</h3>
            <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.8, whitespace: 'pre-line' }}>
              {job.jobSummary || `We are seeking a highly skilled ${job.jobTitle} to join our client's growing team. In this role, you will be responsible for executing key deliverables, collaborating across functional departments, and driving operational excellence.`}
            </p>
          </div>
        </div>

        {/* Right Column: Candidate Apply Card */}
        <div style={{ background: '#ffffff', borderRadius: 16, padding: 32, border: `2px solid ${primaryColor}`, boxShadow: `0 8px 30px ${primaryColor}20`, sticky: 'top', top: 90 }}>
          {submittedCandidate ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <Check size={36} />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>Application Submitted!</h3>
              <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 20 }}>
                Thank you <strong>{submittedCandidate.name}</strong>! Your resume has been parsed and submitted to the recruiters at <strong>{agency?.name}</strong>.
              </p>
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, marginBottom: 20, fontSize: 13, textAlign: 'left', color: '#334155' }}>
                <div>🎯 <strong>ATS Match Score:</strong> {submittedCandidate.matchPercentage}%</div>
                <div>📧 <strong>Registered Email:</strong> {submittedCandidate.email}</div>
              </div>
              <button
                onClick={() => setSubmittedCandidate(null)}
                style={{ width: '100%', padding: '12px', borderRadius: 8, background: primaryColor, color: '#ffffff', border: 'none', fontWeight: 800, cursor: 'pointer' }}
              >
                Submit Another Resume
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplySubmission}>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginBottom: 6 }}>Apply for this Position</h3>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
                Upload your resume PDF or DOCX file. Our AI engine will parse your skills and submit your application to {agency?.name}.
              </p>

              {errorMsg && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: 12, borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                  {errorMsg}
                </div>
              )}

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,application/pdf"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
              />

              {/* Upload Drop Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${selectedFile ? primaryColor : '#cbd5e1'}`,
                  borderRadius: 12,
                  padding: 24,
                  textAlign: 'center',
                  background: selectedFile ? `${primaryColor}08` : '#f8fafc',
                  cursor: 'pointer',
                  marginBottom: 20,
                  transition: 'all 0.2s ease'
                }}
              >
                <Upload size={32} color={selectedFile ? primaryColor : '#94a3b8'} style={{ marginBottom: 8 }} />
                {selectedFile ? (
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: primaryColor }}>{selectedFile.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{(selectedFile.size / 1024).toFixed(1)} KB • Click to change file</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Click to Upload Resume PDF/DOCX</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Maximum file size: 10MB</div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 10,
                  border: 'none',
                  background: primaryColor,
                  color: '#ffffff',
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: `0 4px 14px ${primaryColor}40`
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="spin-icon" />
                    <span>Parsing Resume & Applying...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Submit Application</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
