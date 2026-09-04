import React, { useState, useEffect } from 'react';
import { X, Send, Copy, CheckCircle2, Globe, Calendar, Clock, DollarSign, Briefcase, Mail, Link as LinkIcon } from 'lucide-react';
import { saveCandidateSubmission } from '../services/submissionsService';

export default function ClientSubmissionModal({ candidate, job, currentUser, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    source_name: 'Naukri',
    date_of_sourcing: new Date().toISOString().split('T')[0],
    ready_to_relocate: 'Yes',
    relevant_experience: candidate?.experience || '3 Years',
    current_salary: candidate?.currentCtc || 1800000,
    expected_salary: candidate?.expectedCtc || 2400000,
    notice_period: candidate?.noticePeriod || '30 Days',
    reason_for_leaving: 'Career Growth & Skill Expansion',
    offer_in_hand: 'No',
    status: 'Approved',
    last_call_details: 'Candidate interviewed on phone. Good communication and strong technical background.'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [magicLink, setMagicLink] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [emailText, setEmailText] = useState('');

  const handleSaveAndGenerateLink = async (e) => {
    e?.preventDefault();
    setIsSaving(true);

    const candName = candidate?.fullName || candidate?.name || 'Candidate Profile';
    const jobTitle = job?.jobTitle || candidate?.designation || 'Software Engineer';
    const matchScore = candidate?.matchPercentage ?? candidate?.matchScore ?? 85;
    const matchedList = candidate?.matched_skills || candidate?.matchedSkills || [];

    const submissionRecord = await saveCandidateSubmission({
      ...formData,
      agency_id: currentUser?.agencyId || null,
      job_id: job?.id || candidate?.appliedJobs?.[0]?.jobId || null,
      candidate_id: candidate?.id,
      candidate_name: candName,
      candidate_email: candidate?.email,
      candidate_phone: candidate?.phone,
      designation: candidate?.designation || 'Software Engineer',
      match_percentage: matchScore,
      matched_skills: matchedList,
      missing_skills: candidate?.missing_skills || candidate?.missingSkills || []
    });

    const generatedUrl = `${window.location.origin}/#candidate-share/${submissionRecord.magic_link_token}`;
    setMagicLink(generatedUrl);

    // Pre-format Client Email
    const formattedEmail = `Subject: Candidate Submission: ${candName} - ${jobTitle} (${matchScore}% Match)

Dear Client,

We are pleased to submit the candidate profile of ${candName} for the position of ${jobTitle}.

CANDIDATE METRICS SUMMARY:
- Name: ${candName}
- Total / Relevant Experience: ${candidate?.totalExperience || candidate?.experience || '3 Years'} / ${formData.relevant_experience}
- Current / Expected CTC: ₹${Number(formData.current_salary).toLocaleString('en-IN')} / ₹${Number(formData.expected_salary).toLocaleString('en-IN')}
- Notice Period: ${formData.notice_period}
- Ready to Relocate: ${formData.ready_to_relocate}
- Offer In Hand: ${formData.offer_in_hand}
- Match Score: ${matchScore}% (${matchedList.join(', ')})

SECURE MAGIC LINK (No Login Required):
${generatedUrl}

Best regards,
${currentUser?.name || 'Recruitment Team'}
RecruitOS Agency Workspace`;

    setEmailText(formattedEmail);
    setIsSaving(false);
    if (onSaved) onSaved(submissionRecord);
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
      <div style={{ background: '#ffffff', width: '100%', maxWidth: 720, maxHeight: '90vh', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px', background: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Client Submission & Magic Link Generator</h2>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0 0' }}>
              Candidate: <strong>{candidate?.fullName || candidate?.name || 'Candidate Profile'}</strong> • Match Score: <strong>{candidate?.matchPercentage ?? candidate?.matchScore ?? 85}%</strong>
            </p>
          </div>
          <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

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
                  <span>{isSaving ? 'Generating Link...' : 'Save & Generate Magic Link'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div>
              {/* Magic Link Result Box */}
              <div style={{ background: '#f0fdf4', padding: 20, borderRadius: 12, border: '1px solid #bbf7d0', marginBottom: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#15803d', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={18} />
                  <span>Client Magic Link Successfully Generated!</span>
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
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
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
                  style={{ width: '100%', height: 200, padding: 14, fontSize: 12, fontFamily: 'monospace', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, color: '#334155', lineHeight: '1.5' }}
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
