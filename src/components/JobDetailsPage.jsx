import React, { useState, useEffect } from 'react';
import { ArrowLeft, UploadCloud, FileText, CheckCircle2, Award, XCircle, Users, Sparkles, Layers, BookOpen, Briefcase, ExternalLink, Send, Check, Star, Link as LinkIcon } from 'lucide-react';
import CandidateDrawer from './CandidateDrawer';
import ResumeViewerModal from './ResumeViewerModal';
import ResumeUploadModal from './ResumeUploadModal';
import ClientSubmissionModal from './ClientSubmissionModal';
import { updateCandidateStatus } from '../services/candidatesService';
import { getSubmissions, saveCandidateSubmission } from '../services/submissionsService';

export default function JobDetailsPage({ job, onBack, onUploadResumesForJob, currentUser }) {
  const [candidatesList, setCandidatesList] = useState([]);
  const [shortlistedSubmissions, setShortlistedSubmissions] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [previewResumeModal, setPreviewResumeModal] = useState(null);
  const [submissionModalCand, setSubmissionModalCand] = useState(null);

  // Initialize candidates list from job object & database
  useEffect(() => {
    if (job) {
      const initialCands = Array.isArray(job.candidates) ? [...job.candidates] : [];
      // Sort candidates by match_percentage DESC
      initialCands.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
      setCandidatesList(initialCands);
      loadSubmissions();
    }
  }, [job]);

  const loadSubmissions = async () => {
    if (job?.id) {
      const subs = await getSubmissions(job.id, currentUser?.agencyId);
      setShortlistedSubmissions(subs);
    }
  };

  if (!job) {
    return (
      <div className="card" style={{ padding: 48, textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>No Job selected.</p>
        <button className="btn btn-secondary" onClick={onBack} style={{ marginTop: 12 }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Handle Shortlisting Candidate
  const handleShortlistCandidate = async (cand) => {
    await updateCandidateStatus(cand.id, 'Shortlisted');

    // Create Submission Record
    const sub = await saveCandidateSubmission({
      agency_id: currentUser?.agencyId || null,
      job_id: job.id,
      candidate_id: cand.id,
      candidate_name: cand.name,
      candidate_email: cand.email,
      candidate_phone: cand.phone,
      source_name: 'Naukri',
      date_of_sourcing: new Date().toISOString().split('T')[0],
      relevant_experience: cand.experience || '3 Years',
      status: 'Approved'
    });

    setCandidatesList(prev => prev.map(c => c.id === cand.id ? { ...c, status: 'Shortlisted', shortlisted: true } : c));
    await loadSubmissions();
  };

  // Handle Updating Shortlisted Grid Fields
  const handleUpdateSubmissionField = async (subId, field, value) => {
    const updated = shortlistedSubmissions.map(s => s.id === subId ? { ...s, [field]: value } : s);
    setShortlistedSubmissions(updated);
    const targetSub = updated.find(s => s.id === subId);
    if (targetSub) {
      await saveCandidateSubmission(targetSub);
    }
  };

  // Open candidate resume document
  const handleOpenResumeDocument = (cand) => {
    if (cand.fileUrl) {
      window.open(cand.fileUrl, '_blank');
    } else {
      setPreviewResumeModal(cand);
    }
  };

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto' }}>
      
      {/* Page Navigation & Top Buttons */}
      <div style={{ marginBottom: 20 }}>
        <button
          className="btn btn-secondary"
          style={{ padding: '6px 14px', fontSize: 13, marginBottom: 16 }}
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          <span>Back to Job Openings</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>{job.jobTitle}</h1>
            <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>
              {job.location || 'Noida'} • {job.employmentType || 'Full Time, Permanent'} • {job.companyName || 'Shipgig Ventures'}
            </p>
          </div>

          {/* Section 4 Top-Right Upload Resume Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => setShowUploadModal(true)}
            >
              <UploadCloud size={16} />
              <span>Upload Resume</span>
            </button>

            <button
              className="btn btn-primary"
              style={{ padding: '8px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => setShowUploadModal(true)}
            >
              <Layers size={16} />
              <span>Bulk Upload Resume</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Job Description Overview Card */}
      <div className="card" style={{ padding: 24, marginBottom: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
          Job Description & Mandatory Skills
        </h2>
        
        <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6, marginBottom: 16, whiteSpace: 'pre-line' }}>
          {job.jobSummary || 'Seeking an experienced engineer to design, develop, and maintain web applications and REST APIs.'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Experience Required</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{job.experienceRequired || '0-2 Years'}</div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Location</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{job.location || 'Noida'}</div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Employment Type</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{job.employmentType || 'Full Time'}</div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>Required Skills (JD Mandatory)</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(job.requiredSkills || job.allRequiredSkills || []).map((skill, idx) => (
              <span key={idx} className="skill-tag" style={{ fontSize: 13, padding: '4px 12px', background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. SECTION 5: SHORTLISTED CANDIDATES GRID & TRACKER */}
      <div className="card" style={{ padding: 24, marginBottom: 28, border: '2px solid #3b82f6', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: 8, background: '#eff6ff', borderRadius: 8, color: '#2563eb' }}>
              <Star size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Shortlisted Candidates ({shortlistedSubmissions.length})
              </h2>
              <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                Track sourcing date, call notes, status (Approved/Hold/Rejected), and generate Client Magic Links.
              </p>
            </div>
          </div>

          <span style={{ fontSize: 12, fontWeight: 800, color: '#1d4ed8', background: '#eff6ff', padding: '6px 14px', borderRadius: 20 }}>
            {shortlistedSubmissions.length} Candidates Shortlisted
          </span>
        </div>

        {shortlistedSubmissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', background: '#f8fafc', borderRadius: 10, border: '1px dashed #cbd5e1' }}>
            <Users size={36} color="#94a3b8" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>No Shortlisted Candidates Yet</div>
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              Click <strong>"[ Shortlist ]"</strong> on any candidate in the Candidate Pool below to add them here.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Date of Sourcing</th>
                  <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Source Name</th>
                  <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Candidate Name</th>
                  <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Phone Number</th>
                  <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Last Call Details</th>
                  <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shortlistedSubmissions.map((sub, idx) => (
                  <tr key={sub.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {/* Date of Sourcing */}
                    <td style={{ padding: '12px 14px' }}>
                      <input
                        type="date"
                        value={sub.date_of_sourcing || new Date().toISOString().split('T')[0]}
                        onChange={(e) => handleUpdateSubmissionField(sub.id, 'date_of_sourcing', e.target.value)}
                        style={{ fontSize: 12, padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: 6, width: 125 }}
                      />
                    </td>

                    {/* Source Name Dropdown */}
                    <td style={{ padding: '12px 14px' }}>
                      <select
                        value={sub.source_name || 'Naukri'}
                        onChange={(e) => handleUpdateSubmissionField(sub.id, 'source_name', e.target.value)}
                        style={{ fontSize: 12, fontWeight: 600, padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: 6 }}
                      >
                        <option value="Naukri">Naukri</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Referral">Referral</option>
                        <option value="Foundit">Foundit / Monster</option>
                        <option value="Internal Database">Internal Database</option>
                      </select>
                    </td>

                    {/* Candidate Name */}
                    <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0f172a' }}>
                      {sub.candidate_name || 'Candidate Profile'}
                    </td>

                    {/* Phone Number */}
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#334155' }}>
                      {sub.candidate_phone || '+91 98765 43210'}
                    </td>

                    {/* Last Call Details Editable */}
                    <td style={{ padding: '12px 14px' }}>
                      <input
                        type="text"
                        value={sub.last_call_details || ''}
                        onChange={(e) => handleUpdateSubmissionField(sub.id, 'last_call_details', e.target.value)}
                        placeholder="Add call notes..."
                        style={{ fontSize: 12, padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: 6, width: 160 }}
                      />
                    </td>

                    {/* Status Dropdown: Approved / Hold / Rejected */}
                    <td style={{ padding: '12px 14px' }}>
                      <select
                        value={sub.status || 'Approved'}
                        onChange={(e) => handleUpdateSubmissionField(sub.id, 'status', e.target.value)}
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: '4px 8px',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          background: sub.status === 'Approved' ? '#f0fdf4' : sub.status === 'Rejected' ? '#fef2f2' : '#fffbeb',
                          color: sub.status === 'Approved' ? '#15803d' : sub.status === 'Rejected' ? '#b91c1c' : '#b45309'
                        }}
                      >
                        <option value="Approved">Approved</option>
                        <option value="Hold">Hold</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>

                    {/* Action Button: Send To Client */}
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <button
                        className="btn btn-primary"
                        style={{ padding: '4px 10px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        onClick={() => {
                          const cand = candidatesList.find(c => c.id === sub.candidate_id) || {
                            id: sub.candidate_id,
                            name: sub.candidate_name,
                            email: sub.candidate_email,
                            phone: sub.candidate_phone,
                            experience: sub.relevant_experience
                          };
                          setSubmissionModalCand(cand);
                        }}
                      >
                        <Send size={12} />
                        <span>Send To Client</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. SECTION 3: CANDIDATE POOL RANKING (SORTED BY MATCH % DESC) */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Candidate Ranking Pool ({candidatesList.length})
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '2px 0 0 0' }}>
              Automatically sorted from highest match score to lowest match score.
            </p>
          </div>

          <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '6px 14px', borderRadius: 20 }}>
            Sorted High → Low Match %
          </div>
        </div>

        {candidatesList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: '#64748b' }}>
            <Users size={36} color="#94a3b8" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>No Candidates Uploaded Yet</div>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              Click <strong>"Upload Resume"</strong> or <strong>"Bulk Upload Resume"</strong> above to parse and rank candidate profiles.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {candidatesList.map((cand, idx) => (
              <div
                key={cand.id || idx}
                onClick={() => setSelectedCandidate(cand)}
                style={{
                  border: '1px solid #eaecf0',
                  borderRadius: 12,
                  padding: 20,
                  background: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
                className="candidate-card-hover"
              >
                {/* Header Row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: idx === 0 ? '#eff6ff' : '#f8fafc',
                      color: idx === 0 ? '#2563eb' : '#64748b',
                      fontWeight: 900,
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      #{idx + 1}
                    </div>

                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                        {cand.name}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <span>{cand.email || 'No Email'}</span>
                        <span>• {cand.phone || 'No Phone'}</span>
                        <span>• {cand.designation || 'Software Engineer'}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Match Score Badge */}
                    <span className={`score-badge ${(cand.matchPercentage || 0) >= 75 ? 'high' : (cand.matchPercentage || 0) >= 50 ? 'medium' : 'low'}`} style={{ fontSize: 14, padding: '6px 14px' }}>
                      <Award size={14} style={{ marginRight: 4 }} />
                      {cand.matchPercentage || 0}% Match
                    </span>

                    {/* Shortlist Action Button */}
                    <button
                      className={`btn ${cand.status === 'Shortlisted' || cand.shortlisted ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ padding: '6px 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShortlistCandidate(cand);
                      }}
                      disabled={cand.status === 'Shortlisted' || cand.shortlisted}
                    >
                      <Star size={14} />
                      <span>{cand.status === 'Shortlisted' || cand.shortlisted ? 'Shortlisted' : 'Shortlist'}</span>
                    </button>
                  </div>
                </div>

                {/* Candidate Information Attributes Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 14, background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Briefcase size={15} color="#2563eb" />
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Experience</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{cand.experience || '3 Years'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BookOpen size={15} color="#2563eb" />
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Education</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{cand.education || 'Graduate'}</div>
                    </div>
                  </div>

                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenResumeDocument(cand);
                    }}
                  >
                    <FileText size={15} color="#2563eb" />
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Resume File</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>{cand.resumeFile || 'Resume.pdf'}</span>
                        <ExternalLink size={12} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skill Match Breakdown */}
                {(() => {
                  const matchedArr = cand.matched_skills || cand.matchedSkills || [];
                  const missingArr = cand.missing_skills || cand.missingSkills || [];
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 14, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <CheckCircle2 size={14} />
                          <span>Matched Skills ({matchedArr.length})</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {matchedArr.map((s, i) => (
                            <span key={i} className="skill-tag" style={{ background: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' }}>
                              {s}
                            </span>
                          ))}
                          {matchedArr.length === 0 && (
                            <span style={{ fontSize: 12, color: '#94a3b8' }}>No matched skills</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <XCircle size={14} />
                          <span>Missing Skills ({missingArr.length})</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {missingArr.map((s, i) => (
                            <span key={i} className="skill-tag" style={{ background: '#fef2f2', color: '#b91c1c', borderColor: '#fecaca' }}>
                              {s}
                            </span>
                          ))}
                          {missingArr.length === 0 && (
                            <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>100% Skills Matched!</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals & Drawers */}
      {showUploadModal && (
        <ResumeUploadModal
          job={job}
          currentUser={currentUser}
          onClose={() => setShowUploadModal(false)}
          onParsed={(newCands) => {
            setCandidatesList(prev => {
              const merged = [...newCands, ...prev];
              merged.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
              return merged;
            });
            if (onUploadResumesForJob) onUploadResumesForJob(job.id, newCands);
          }}
        />
      )}

      {submissionModalCand && (
        <ClientSubmissionModal
          candidate={submissionModalCand}
          job={job}
          currentUser={currentUser}
          onClose={() => setSubmissionModalCand(null)}
          onSaved={() => loadSubmissions()}
        />
      )}

      <CandidateDrawer
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onOpenResume={handleOpenResumeDocument}
      />

      <ResumeViewerModal
        candidate={previewResumeModal}
        onClose={() => setPreviewResumeModal(null)}
      />
    </div>
  );
}
