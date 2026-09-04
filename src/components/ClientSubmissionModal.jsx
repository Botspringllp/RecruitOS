import React, { useState, useEffect } from 'react';
import { X, Send, Copy, CheckCircle2, Globe, Calendar, Clock, DollarSign, Briefcase, Mail, Link as LinkIcon, Users } from 'lucide-react';
import { saveCandidateSubmission } from '../services/submissionsService';

export default function ClientSubmissionModal({ candidate, candidates, job, currentUser, onClose, onSaved }) {
  // Normalize candidates list (support either single candidate or array of selected candidates)
  const candidateList = candidates && candidates.length > 0 
    ? candidates 
    : candidate ? [candidate] : [];

  const [activeCandIndex, setActiveCandIndex] = useState(0);
  const currentCand = candidateList[activeCandIndex] || candidateList[0] || {};

  const [formData, setFormData] = useState({
    source_name: 'Naukri',
    date_of_sourcing: new Date().toISOString().split('T')[0],
    ready_to_relocate: 'Yes',
    relevant_experience: currentCand?.experience || '3 Years',
    current_salary: currentCand?.currentCtc || 1800000,
    expected_salary: currentCand?.expectedCtc || 2400000,
    notice_period: currentCand?.noticePeriod || '30 Days',
    reason_for_leaving: 'Career Growth & Skill Expansion',
    offer_in_hand: 'No',
    status: 'Approved',
    last_call_details: 'Candidate interviewed on phone. Good communication and strong technical background.'
  });

  useEffect(() => {
    if (currentCand) {
      setFormData(prev => ({
        ...prev,
        relevant_experience: currentCand?.experience || prev.relevant_experience || '3 Years',
        current_salary: currentCand?.currentCtc || prev.current_salary || 1800000,
        expected_salary: currentCand?.expectedCtc || prev.expected_salary || 2400000,
        notice_period: currentCand?.noticePeriod || prev.notice_period || '30 Days'
      }));
    }
  }, [activeCandIndex]);

  const [isSaving, setIsSaving] = useState(false);
  const [magicLink, setMagicLink] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [emailText, setEmailText] = useState('');

  const handleSaveAndGenerateLink = async (e) => {
    e?.preventDefault();
    setIsSaving(true);

    const savedRecords = [];
    const jobTitle = job?.jobTitle || currentCand?.designation || 'Software Engineer';
    let emailSections = [];
    let primaryLink = '';

    for (let i = 0; i < candidateList.length; i++) {
      const cand = candidateList[i];
      const candName = cand?.fullName || cand?.name || `Candidate #${i+1}`;
      const matchScore = cand?.matchPercentage ?? cand?.matchScore ?? 85;
      const matchedList = cand?.matched_skills || cand?.matchedSkills || [];

      const submissionRecord = await saveCandidateSubmission({
        ...formData,
        agency_id: currentUser?.agencyId || null,
        job_id: job?.id || cand?.appliedJobs?.[0]?.jobId || null,
        candidate_id: cand?.id,
        candidate_name: candName,
        candidate_email: cand?.email,
        candidate_phone: cand?.phone,
        designation: cand?.designation || 'Software Engineer',
        match_percentage: matchScore,
        matched_skills: matchedList,
        missing_skills: cand?.missing_skills || cand?.missingSkills || []
      });

      savedRecords.push(submissionRecord);
      const candUrl = `${window.location.origin}/#candidate-share/${submissionRecord.magic_link_token}`;
      if (i === 0) primaryLink = candUrl;

      emailSections.push(
`CANDIDATE ${i + 1}: ${candName} (${matchScore}% Match)
- Designation / Role: ${cand?.designation || 'Software Engineer'}
- Relevant Experience: ${formData.relevant_experience}
- Current / Expected CTC: ₹${Number(formData.current_salary).toLocaleString('en-IN')} / ₹${Number(formData.expected_salary).toLocaleString('en-IN')}
- Notice Period: ${formData.notice_period}
- Relocation: ${formData.ready_to_relocate} | Offer in Hand: ${formData.offer_in_hand}
- Key Matched Skills: ${matchedList.slice(0, 5).join(', ') || 'N/A'}
- Secure Profile Link: ${candUrl}`
      );
    }

    setMagicLink(primaryLink);

    // Pre-format Unified Client Email for single or multi-candidate selection
    const isMulti = candidateList.length > 1;
    const formattedEmail = `Subject: ${isMulti ? `Candidate Submissions (${candidateList.length} Profiles)` : `Candidate Submission: ${candidateList[0]?.name || 'Profile'}`} - ${jobTitle}

Dear Client,

We are pleased to submit ${isMulti ? `${candidateList.length} shortlisted candidate profiles` : `the candidate profile of ${candidateList[0]?.name}`} for the position of ${jobTitle}.

${emailSections.join('\n\n--------------------------------------------------\n\n')}

Best regards,
${currentUser?.name || 'Recruitment Team'}
RecruitOS Agency Workspace`;

    setEmailText(formattedEmail);
    setIsSaving(false);
    if (onSaved) onSaved(savedRecords.length === 1 ? savedRecords[0] : savedRecords);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#ffffff', width: '100%', maxWidth: 740, maxHeight: '90vh', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px', background: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              {candidateList.length > 1 && <Users size={20} color="#38bdf8" />}
              <span>Client Submission & Magic Link Generator</span>
            </h2>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0 0' }}>
              {candidateList.length > 1 
                ? `Selected ${candidateList.length} Candidates for Submission to Client`
                : `Candidate: ${currentCand?.fullName || currentCand?.name || 'Candidate Profile'} • Match Score: ${currentCand?.matchPercentage ?? currentCand?.matchScore ?? 85}%`
              }
            </p>
          </div>
          <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Multi Candidate Selection Tabs */}
        {candidateList.length > 1 && (
          <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '8px 24px', display: 'flex', gap: 8, overflowX: 'auto' }}>
            {candidateList.map((c, idx) => (
              <button
                key={c.id || idx}
                onClick={() => setActiveCandIndex(idx)}
                style={{
                  padding: '4px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  borderRadius: 20,
                  border: activeCandIndex === idx ? '1px solid #2563eb' : '1px solid #cbd5e1',
                  background: activeCandIndex === idx ? '#eff6ff' : '#ffffff',
                  color: activeCandIndex === idx ? '#1d4ed8' : '#64748b',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                #{idx + 1} {c.fullName || c.name || `Candidate ${idx+1}`} ({c.matchPercentage || 85}%)
              </button>
            ))}
          </div>
        )}

        {/* Body Form */}
        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
          {!magicLink ? (
            <form onSubmit={handleSaveAndGenerateLink}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Source Name *
                  </label>
                  <select
                    className="form-input"
                    style={{ height: 38, fontSize: 13 }}
                    value={formData.source_name}
                    onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
                  >
                    <option value="Naukri">Naukri</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Referral">Referral</option>
                    <option value="Foundit">Foundit / Monster</option>
                    <option value="Internal Database">Internal Database</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Date of Sourcing *
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    style={{ height: 38, fontSize: 13 }}
                    value={formData.date_of_sourcing}
                    onChange={(e) => setFormData({ ...formData, date_of_sourcing: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Relevant Experience *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ height: 38, fontSize: 13 }}
                    value={formData.relevant_experience}
                    onChange={(e) => setFormData({ ...formData, relevant_experience: e.target.value })}
                    placeholder="e.g. 4 Years"
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Ready To Relocate *
                  </label>
                  <select
                    className="form-input"
                    style={{ height: 38, fontSize: 13 }}
                    value={formData.ready_to_relocate}
                    onChange={(e) => setFormData({ ...formData, ready_to_relocate: e.target.value })}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Open to Hybrid">Open to Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Current Annual Salary (INR) *
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    style={{ height: 38, fontSize: 13 }}
                    value={formData.current_salary}
                    onChange={(e) => setFormData({ ...formData, current_salary: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Expected Annual Salary (INR) *
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    style={{ height: 38, fontSize: 13 }}
                    value={formData.expected_salary}
                    onChange={(e) => setFormData({ ...formData, expected_salary: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Notice Period *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ height: 38, fontSize: 13 }}
                    value={formData.notice_period}
                    onChange={(e) => setFormData({ ...formData, notice_period: e.target.value })}
                    placeholder="e.g. 15 Days / Immediate"
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Offer In Hand *
                  </label>
                  <select
                    className="form-input"
                    style={{ height: 38, fontSize: 13 }}
                    value={formData.offer_in_hand}
                    onChange={(e) => setFormData({ ...formData, offer_in_hand: e.target.value })}
                  >
                    <option value="No">No</option>
                    <option value="Yes (Holding 1 Offer)">Yes (Holding 1 Offer)</option>
                    <option value="Yes (Holding 2+ Offers)">Yes (Holding 2+ Offers)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Reason for Leaving *
                </label>
                <input
                  type="text"
                  className="form-input"
                  style={{ height: 38, fontSize: 13 }}
                  value={formData.reason_for_leaving}
                  onChange={(e) => setFormData({ ...formData, reason_for_leaving: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Last Call Details & Recruiter Notes
                </label>
                <textarea
                  className="form-input"
                  style={{ height: 60, fontSize: 13, padding: '8px 12px' }}
                  value={formData.last_call_details}
                  onChange={(e) => setFormData({ ...formData, last_call_details: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }} disabled={isSaving}>
                  <Send size={16} />
                  <span>{isSaving ? 'Generating Links...' : `Save & Generate Magic Link (${candidateList.length})`}</span>
                </button>
              </div>
            </form>
          ) : (
            <div>
              {/* Magic Link Result Box */}
              <div style={{ background: '#f0fdf4', padding: 20, borderRadius: 12, border: '1px solid #bbf7d0', marginBottom: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#15803d', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={18} />
                  <span>Client Magic Link(s) Successfully Generated!</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    readOnly
                    value={magicLink}
                    style={{ flex: 1, height: 40, padding: '0 12px', fontSize: 13, background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, fontWeight: 600 }}
                  />
                  <button
                    className="btn btn-primary"
                    style={{ height: 40, padding: '0 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={() => copyToClipboard(magicLink, 'link')}
                  >
                    <LinkIcon size={16} />
                    <span>{copiedLink ? 'Copied!' : 'Copy Primary Link'}</span>
                  </button>
                </div>
              </div>

              {/* Pre-formatted Email Template */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                    Client Presentation Email Content:
                  </label>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '4px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={() => copyToClipboard(emailText, 'email')}
                  >
                    <Copy size={14} />
                    <span>{copiedEmail ? 'Copied Email!' : 'Copy Email Text'}</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  value={emailText}
                  style={{ width: '100%', height: 220, padding: 14, fontSize: 12, fontFamily: 'monospace', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, color: '#334155', lineHeight: '1.5' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={() => setMagicLink('')}>
                  Edit Details
                </button>
                <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: 13 }} onClick={onClose}>
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
