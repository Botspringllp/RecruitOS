import React, { useState, useEffect } from 'react';
import { ArrowLeft, UploadCloud, FileText, CheckCircle2, Award, XCircle, Users, Sparkles, Layers, BookOpen, Briefcase, ExternalLink, Send, Check, Star, Link as LinkIcon, Trash2 } from 'lucide-react';
import CandidateDrawer from './CandidateDrawer';
import ResumeViewerModal from './ResumeViewerModal';
import ResumeUploadModal from './ResumeUploadModal';
import ClientSubmissionModal from './ClientSubmissionModal';
import { getAllCandidates, updateCandidateStatus } from '../services/candidatesService';
import { getSubmissions, saveCandidateSubmission, deleteCandidateSubmission } from '../services/submissionsService';
import { calculateSkillMatch } from '../services/parserService';

export default function JobDetailsPage({ job, onBack, onUploadResumesForJob, currentUser }) {
  const [candidatesList, setCandidatesList] = useState([]);
  const [shortlistedSubmissions, setShortlistedSubmissions] = useState([]);
  const [selectedSubIds, setSelectedSubIds] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [previewResumeModal, setPreviewResumeModal] = useState(null);
  const [submissionModalCand, setSubmissionModalCand] = useState(null);
  const [submissionModalCandidates, setSubmissionModalCandidates] = useState([]);

  // Fetch Candidates from Candidate Directory & score against current Job
  useEffect(() => {
    if (job) {
      cleanLocalStorageDummyData();
      loadJobCandidates();
      loadSubmissions();
    }
  }, [job]);

  const cleanLocalStorageDummyData = () => {
    try {
      if (typeof localStorage !== 'undefined') {
        // Clean local submissions
        const rawSubs = localStorage.getItem('recruitos_submissions');
        if (rawSubs) {
          const parsed = JSON.parse(rawSubs);
          const clean = parsed.filter(s => 
            s && 
            s.candidate_name && 
            s.candidate_name.toLowerCase() !== 'candidate profile' && 
            s.candidate_name.toLowerCase() !== 'candidate'
          );
          localStorage.setItem('recruitos_submissions', JSON.stringify(clean));
        }

        // Clean local candidates
        const rawCands = localStorage.getItem('recruitos_candidates');
        if (rawCands) {
          const parsedC = JSON.parse(rawCands);
          const cleanC = parsedC.filter(c => 
            c && 
            c.name && 
            c.name.toLowerCase() !== 'candidate profile' && 
            c.name.toLowerCase() !== 'candidate' &&
            !c.name.toLowerCase().includes('divyanshu')
          );
          localStorage.setItem('recruitos_candidates', JSON.stringify(cleanC));
        }
      }
    } catch (e) {}
  };

  const loadJobCandidates = async () => {
    if (!job) return;

    // 1. Fetch Candidates from Candidate Directory (Tenant Scoped)
    const res = await getAllCandidates(currentUser?.agencyId, currentUser?.role);
    const directoryCands = (res.success && Array.isArray(res.candidates)) ? res.candidates : [];

    // 2. Extract Job-specific candidates if present
    const jobCands = Array.isArray(job.candidates) ? job.candidates : [];

    const map = new Map();

    // Add directory candidates
    directoryCands.forEach(c => {
      if (c && c.id && (c.name || c.fullName)) {
        map.set(c.id, c);
      }
    });

    // Merge job specific candidates
    jobCands.forEach(c => {
      if (c && c.id && (c.name || c.fullName)) {
        const existing = map.get(c.id);
        map.set(c.id, { ...existing, ...c });
      }
    });

    const combinedList = Array.from(map.values());

    // 3. Filter out invalid/empty placeholder candidates
    const validList = combinedList.filter(c => {
      if (!c) return false;
      const name = c.name || c.fullName;
      if (!name || typeof name !== 'string') return false;
      const cleanName = name.trim().toLowerCase();
      if (cleanName.length < 2) return false;
      if (cleanName.includes('divyanshu')) return false;
      if (cleanName === 'candidate profile' || cleanName === 'candidate' || cleanName === 'no name') return false;
      if (!c.email || c.email === 'No Email' || c.email === 'No Email Registered' || c.email.includes('candidate.com') || c.email.includes('example.com')) return false;
      return true;
    });

    // 4. Score candidates against THIS job mandate's required skills
    const jobRequiredSkills = job.requiredSkills || job.allRequiredSkills || [];

    const scored = validList.map(cand => {
      const candSkills = Array.isArray(cand.skills) && cand.skills.length > 0
        ? cand.skills
        : Array.isArray(cand.matched_skills)
          ? cand.matched_skills
          : Array.isArray(cand.matchedSkills)
            ? cand.matchedSkills
            : [];

      const matchRes = calculateSkillMatch(jobRequiredSkills, candSkills, cand.resumeText || cand.summary || '');

      return {
        ...cand,
        name: cand.name || cand.fullName,
        email: cand.email,
        phone: cand.phone || '+91 98765 43210',
        designation: cand.designation || 'Software Engineer',
        experience: cand.experience || cand.totalExperience || '3 Years',
        education: cand.education || 'Graduate',
        resumeFile: cand.resumeFile || cand.resumeFileName || 'Resume.pdf',
        matchPercentage: matchRes.match_percentage,
        matchedSkills: matchRes.matched_skills,
        missingSkills: matchRes.missing_skills
      };
    });

    // 5. Sort DESC by matchPercentage (highest match score first)
    scored.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));

    setCandidatesList(scored);
  };

  const loadSubmissions = async () => {
    if (job?.id) {
      const subs = await getSubmissions(job.id, currentUser?.agencyId);
      const validSubs = (subs || []).filter(s => {
        if (!s || !s.candidate_name) return false;
        const name = s.candidate_name.trim().toLowerCase();
        if (name === 'candidate profile' || name === 'candidate' || name === 'no name' || name.length < 2) return false;
        if (s.candidate_email && (s.candidate_email.includes('candidate.com') || s.candidate_email.includes('example.com'))) return false;
        return true;
      });
      setShortlistedSubmissions(validSubs);
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

  // Selection Handlers
  const toggleSelectSub = (subId) => {
    setSelectedSubIds(prev => 
      prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]
    );
  };

  const toggleSelectAllSubs = () => {
    if (selectedSubIds.length === shortlistedSubmissions.length && shortlistedSubmissions.length > 0) {
      setSelectedSubIds([]);
    } else {
      setSelectedSubIds(shortlistedSubmissions.map(s => s.id));
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (!newStatus || selectedSubIds.length === 0) return;
    const updated = shortlistedSubmissions.map(s => 
      selectedSubIds.includes(s.id) ? { ...s, status: newStatus } : s
    );
    setShortlistedSubmissions(updated);
    for (const subId of selectedSubIds) {
      const target = updated.find(s => s.id === subId);
      if (target) await saveCandidateSubmission(target);
    }
  };

  const handleBulkRemove = async () => {
    if (selectedSubIds.length === 0) return;
    if (window.confirm(`Are you sure you want to remove ${selectedSubIds.length} selected candidate(s) from Shortlist?`)) {
      for (const subId of selectedSubIds) {
        await deleteCandidateSubmission(subId);
      }
      setSelectedSubIds([]);
      await loadSubmissions();
    }
  };

  const handleBulkSendToClient = () => {
    const selectedCandidates = shortlistedSubmissions
      .filter(s => selectedSubIds.includes(s.id))
      .map(s => {
        const found = candidatesList.find(c => c.id === s.candidate_id);
        return found || {
          id: s.candidate_id,
          name: s.candidate_name,
          email: s.candidate_email,
          phone: s.candidate_phone,
          experience: s.relevant_experience
        };
      });

    if (selectedCandidates.length > 0) {
      setSubmissionModalCandidates(selectedCandidates);
    }
  };

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

      {/* 2. SECTION 5: SHORTLISTED CANDIDATES GRID & TRACKER WITH MULTI-SELECTION */}
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
                Select candidates to perform bulk actions, track call notes, status, and generate Client Magic Links.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {selectedSubIds.length > 0 && (
              <span style={{ fontSize: 12, fontWeight: 800, color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '6px 14px', borderRadius: 20 }}>
                ✓ {selectedSubIds.length} Selected
              </span>
            )}
            <span style={{ fontSize: 12, fontWeight: 800, color: '#1d4ed8', background: '#eff6ff', padding: '6px 14px', borderRadius: 20 }}>
              {shortlistedSubmissions.length} Candidates Shortlisted
            </span>
          </div>
        </div>

        {/* BULK ACTION SELECTION BAR */}
        {selectedSubIds.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            padding: '12px 18px',
            background: '#eff6ff',
            border: '1.5px solid #60a5fa',
            borderRadius: 12,
            marginBottom: 20,
            boxShadow: '0 4px 12px rgba(37,99,235,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontWeight: 800, color: '#1e40af', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={16} color="#2563eb" />
                <span>{selectedSubIds.length} Candidate{selectedSubIds.length > 1 ? 's' : ''} Selected</span>
              </div>
              <button
                onClick={() => setSelectedSubIds([])}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 12, textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
              >
                Clear Selection
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {/* Change Status Dropdown */}
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkStatusChange(e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                style={{ fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 8, border: '1px solid #93c5fd', background: '#ffffff', color: '#1e40af', cursor: 'pointer' }}
              >
                <option value="" disabled>Change Status (Bulk)...</option>
                <option value="Approved">Status: Approved</option>
                <option value="Hold">Status: Hold</option>
                <option value="Rejected">Status: Rejected</option>
              </select>

              {/* Bulk Send To Client */}
              <button
                className="btn btn-primary"
                style={{ padding: '6px 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={handleBulkSendToClient}
              >
                <Send size={14} />
                <span>Send Selected To Client ({selectedSubIds.length})</span>
              </button>

              {/* Bulk Remove */}
              <button
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, color: '#dc2626', borderColor: '#fecaca', background: '#fef2f2' }}
                onClick={handleBulkRemove}
              >
                <Trash2 size={14} />
                <span>Remove Selected</span>
              </button>
            </div>
          </div>
        )}

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
                  {/* Select All Checkbox */}
                  <th style={{ padding: '12px 14px', width: 40, textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={shortlistedSubmissions.length > 0 && selectedSubIds.length === shortlistedSubmissions.length}
                      onChange={toggleSelectAllSubs}
                      title="Select / Deselect All Candidates"
                      style={{ cursor: 'pointer', width: 16, height: 16, accentColor: '#2563eb' }}
                    />
                  </th>
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
                {shortlistedSubmissions.map((sub, idx) => {
                  const isSelected = selectedSubIds.includes(sub.id);
                  return (
                    <tr
                      key={sub.id || idx}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: isSelected ? '#eff6ff' : 'transparent',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      {/* Individual Candidate Checkbox */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectSub(sub.id)}
                          style={{ cursor: 'pointer', width: 16, height: 16, accentColor: '#2563eb' }}
                        />
                      </td>

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
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: isSelected ? '#1d4ed8' : '#0f172a' }}>
                        {sub.candidate_name || 'Candidate Profile'}
                        {isSelected && <span style={{ fontSize: 10, marginLeft: 6, color: '#2563eb', fontWeight: 700 }}>(Selected)</span>}
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
                  );
                })}
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
              Candidate Directory profiles automatically scored and ranked against this job mandate.
            </p>
          </div>

          <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '6px 14px', borderRadius: 20 }}>
            Sorted High → Low Match %
          </div>
        </div>

        {candidatesList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: '#64748b' }}>
            <Users size={36} color="#94a3b8" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>No Candidates Found in Directory</div>
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
                        <span>{cand.email || 'No Email Registered'}</span>
                        <span>• {cand.phone || '+91 98765 43210'}</span>
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
                  const matchedArr = cand.matchedSkills || cand.matched_skills || [];
                  const missingArr = cand.missingSkills || cand.missing_skills || [];
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
              const mergedMap = new Map();
              newCands.forEach(c => mergedMap.set(c.id, c));
              prev.forEach(c => {
                if (!mergedMap.has(c.id)) mergedMap.set(c.id, c);
              });
              const merged = Array.from(mergedMap.values());
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

      {submissionModalCandidates.length > 0 && (
        <ClientSubmissionModal
          candidates={submissionModalCandidates}
          job={job}
          currentUser={currentUser}
          onClose={() => setSubmissionModalCandidates([])}
          onSaved={() => {
            setSelectedSubIds([]);
            loadSubmissions();
          }}
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
