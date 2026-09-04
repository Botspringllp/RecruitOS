import React, { useState, useEffect } from 'react';
import { Award, Briefcase, Calendar, CheckCircle2, Download, FileText, Globe, Mail, MapPin, Phone, User, XCircle, Building, Clock, DollarSign } from 'lucide-react';
import { getSubmissionByMagicToken } from '../services/submissionsService';
import { getAllCandidates } from '../services/candidatesService';

export default function PublicCandidateSharePage({ token, onBack }) {
  const [submission, setSubmission] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const sub = await getSubmissionByMagicToken(token);
      setSubmission(sub);

      if (sub) {
        const candRes = await getAllCandidates();
        const candList = candRes.candidates || [];
        const cand = candList.find(c => c.id === sub.candidate_id || c.email === sub.candidate_email);
        if (cand) {
          setCandidate(cand);
        } else {
          // Fallback mock candidate object from submission data
          setCandidate({
            name: sub.candidate_name || 'Candidate Profile',
            email: sub.candidate_email || 'candidate@domain.com',
            phone: sub.candidate_phone || '+91 98765 43210',
            designation: sub.designation || 'Software Engineer',
            experience: sub.experience || sub.relevant_experience || '3 Years',
            education: sub.education || 'B.Tech / B.E. Computer Science',
            currentCompany: sub.current_company || 'Shipgig Ventures',
            location: sub.location || 'Noida / Remote',
            matchedSkills: sub.matched_skills || ['React', 'Node.js', 'PostgreSQL'],
            missingSkills: sub.missing_skills || [],
            matchPercentage: sub.match_percentage || 85,
            resumeFile: sub.resume_file || 'Candidate_Resume.pdf'
          });
        }
      }
      setIsLoading(false);
    }

    loadData();
  }, [token]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Loading Candidate Profile...</div>
          <p style={{ fontSize: 13 }}>RecruitOS Secure Magic Link Client Portal</p>
        </div>
      </div>
    );
  }

  if (!submission && !candidate) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#64748b', maxWidth: 400, padding: 32, background: '#ffffff', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <XCircle size={48} color="#ef4444" style={{ marginBottom: 12 }} />
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>Invalid or Expired Magic Link</h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>This candidate profile link is no longer accessible or has been removed by the recruitment agency.</p>
        </div>
      </div>
    );
  }

  const candName = candidate?.name || submission?.candidate_name || 'Candidate Profile';
  const matchScore = candidate?.matchPercentage || submission?.match_percentage || 85;
  const matchedSkills = candidate?.matchedSkills || submission?.matched_skills || ['React', 'Node.js'];
  const missingSkills = candidate?.missingSkills || submission?.missing_skills || [];

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '40px 20px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        
        {/* Client Portal Header */}
        <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '32px 40px', borderRadius: '16px 16px 0 0', color: '#ffffff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 12 }}>
                <Globe size={14} color="#60a5fa" />
                <span>Verified Client Profile Presentation</span>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>{candName}</h1>
              <p style={{ fontSize: 15, color: '#94a3b8', margin: 0, fontWeight: 500 }}>
                {candidate?.designation || 'Senior Software Engineer'} • {candidate?.currentCompany || 'Shipgig Ventures'}
              </p>
            </div>

            {/* Match Score Badge */}
            <div style={{ background: matchScore >= 75 ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)', border: `1px solid ${matchScore >= 75 ? '#22c55e' : '#eab308'}`, padding: '12px 20px', borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: matchScore >= 75 ? '#4ade80' : '#fde047' }}>{matchScore}%</div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px' }}>Match Score</div>
            </div>
          </div>
        </div>

        {/* Candidate Submission Main Content */}
        <div style={{ background: '#ffffff', padding: 40, borderRadius: '0 0 16px 16px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
          
          {/* Key Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 36, background: '#f8fafc', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Date of Sourcing</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={15} color="#2563eb" />
                <span>{submission?.date_of_sourcing || '2026-09-04'}</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Source Name</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Globe size={15} color="#2563eb" />
                <span>{submission?.source_name || 'Naukri'}</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Notice Period</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={15} color="#2563eb" />
                <span>{submission?.notice_period || candidate?.noticePeriod || '30 Days'}</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Ready to Relocate</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#15803d', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={15} color="#16a34a" />
                <span>{submission?.ready_to_relocate || 'Yes'}</span>
              </div>
            </div>
          </div>

          {/* Full Professional Information Table */}
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 16, borderBottom: '2px solid #f1f5f9', paddingBottom: 10 }}>
            Candidate Profile & Financial Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 40px', marginBottom: 36 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Full Name</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{candName}</div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Email Address</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#2563eb', marginTop: 2 }}>{candidate?.email || submission?.candidate_email}</div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Phone / Mobile Number</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{candidate?.phone || submission?.candidate_phone}</div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Current Location</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{candidate?.location || 'Noida / Remote'}</div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Total Experience</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{candidate?.experience || '3 Years'}</div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Relevant Experience</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{submission?.relevant_experience || '3 Years'}</div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Current / Last Employer</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{candidate?.currentCompany || 'Shipgig Ventures'}</div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Highest Qualification</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{candidate?.education || 'B.Tech / B.E.'}</div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Current Annual CTC</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>₹{Number(submission?.current_salary || candidate?.currentCtc || 1800000).toLocaleString('en-IN')}</div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Expected Annual CTC</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#16a34a', marginTop: 2 }}>₹{Number(submission?.expected_salary || candidate?.expectedCtc || 2400000).toLocaleString('en-IN')}</div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Reason for Leaving</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginTop: 2 }}>{submission?.reason_for_leaving || 'Better Career & Technical Growth'}</div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Offer In Hand</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{submission?.offer_in_hand || 'No'}</div>
            </div>
          </div>

          {/* Skill Analysis Badges */}
          <div style={{ marginBottom: 36 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 16, borderBottom: '2px solid #f1f5f9', paddingBottom: 10 }}>
              Technical Skill Analysis
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div style={{ background: '#f0fdf4', padding: 20, borderRadius: 12, border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#15803d', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} />
                  <span>Matched Skills ({matchedSkills.length})</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {matchedSkills.map((sk, i) => (
                    <span key={i} style={{ background: '#ffffff', color: '#15803d', border: '1px solid #86efac', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 6 }}>
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ background: missingSkills.length > 0 ? '#fef2f2' : '#f8fafc', padding: 20, borderRadius: 12, border: `1px solid ${missingSkills.length > 0 ? '#fecaca' : '#e2e8f0'}` }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: missingSkills.length > 0 ? '#b91c1c' : '#64748b', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <XCircle size={16} />
                  <span>Missing Skills ({missingSkills.length})</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {missingSkills.length > 0 ? missingSkills.map((sk, i) => (
                    <span key={i} style={{ background: '#ffffff', color: '#b91c1c', border: '1px solid #fca5a5', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 6 }}>
                      {sk}
                    </span>
                  )) : <span style={{ fontSize: 12, color: '#64748b' }}>No missing skills</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 24, borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
              Powered by RecruitOS Enterprise ATS • Secure Shared Portal
            </div>

            <button
              className="btn btn-primary"
              style={{ padding: '10px 20px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, background: '#2563eb' }}
              onClick={() => {
                if (candidate?.fileUrl) {
                  window.open(candidate.fileUrl, '_blank');
                } else {
                  alert(`Candidate resume document: ${candidate?.resumeFile || 'Resume.pdf'}`);
                }
              }}
            >
              <Download size={18} />
              <span>Download Candidate Resume</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
