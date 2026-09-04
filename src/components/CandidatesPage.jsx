import React, { useState, useEffect, useRef } from 'react';
import { Users, Search, Filter, Briefcase, Mail, Phone, Clock, FileText, ChevronRight, Award, UploadCloud, CheckCircle2, AlertCircle, Plus, X } from 'lucide-react';
import { getAllCandidates, updateCandidateStatus, parseAndScoreCandidateResume } from '../services/candidatesService';
import CandidateDrawer from './CandidateDrawer';
import ResumeViewerModal from './ResumeViewerModal';

export default function CandidatesPage({ searchQuery = '', jobs = [], currentUser }) {
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [previewResumeModal, setPreviewResumeModal] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  // Resume Upload Section States
  const [showUploadBox, setShowUploadBox] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [isProcessingResumes, setIsProcessingResumes] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [parseMessage, setParseMessage] = useState('');
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [uploadErrorMsg, setUploadErrorMsg] = useState('');

  const singleInputRef = useRef(null);
  const bulkInputRef = useRef(null);

  const loadCandidates = async () => {
    setIsLoading(true);
    const res = await getAllCandidates(currentUser?.agencyId, currentUser?.role);
    let fetched = (res.success && Array.isArray(res.candidates)) ? res.candidates : [];

    // Gather candidates attached to active jobs
    const jobCandidates = [];
    (jobs || []).forEach(j => {
      if (Array.isArray(j.candidates)) {
        j.candidates.forEach(cand => {
          jobCandidates.push({
            ...cand,
            appliedJobs: cand.appliedJobs || [{ jobId: j.id, jobTitle: j.jobTitle, matchPercentage: cand.matchPercentage, status: cand.status || 'Applied' }]
          });
        });
      }
    });

    // Merge without duplicates
    const candMap = new Map();
    fetched.forEach(c => { if (c.email) candMap.set(c.email.toLowerCase(), c); });
    jobCandidates.forEach(c => {
      if (c.email) {
        const existing = candMap.get(c.email.toLowerCase());
        if (!existing) candMap.set(c.email.toLowerCase(), c);
      }
    });

    const cleanList = Array.from(candMap.values()).filter(c => c && c.name && !c.name.toLowerCase().includes('divyanshu'));
    setCandidates(cleanList);
    setIsLoading(false);
  };

  useEffect(() => {
    loadCandidates();
  }, [jobs]);

  const handleStatusChange = async (candidateId, newStatus) => {
    await updateCandidateStatus(candidateId, newStatus);
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, status: newStatus } : c));
  };

  // Open candidate resume document
  const handleOpenResume = (cand) => {
    if (cand.fileUrl) {
      window.open(cand.fileUrl, '_blank');
    } else {
      setPreviewResumeModal(cand);
    }
  };

  // Process Resume Uploads (Single or Bulk)
  const processUploadFiles = async (files) => {
    if (!files || files.length === 0) return;

    setIsProcessingResumes(true);
    setParseProgress(0);
    setParseMessage('Initializing AI Resume Parser...');
    setUploadSuccessMsg('');
    setUploadErrorMsg('');

    const targetJob = jobs.find(j => j.id === selectedJobId) || null;
    const requiredSkills = targetJob?.skills || targetJob?.allRequiredSkills || [];
    const jobId = targetJob?.id || null;
    const jobTitle = targetJob?.jobTitle || targetJob?.title || 'General Pool';

    const fileList = Array.from(files);
    let parsedCount = 0;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setParseMessage(`Parsing Resume ${i + 1} of ${fileList.length}: "${file.name}"...`);
      setParseProgress(Math.round(((i) / fileList.length) * 100));

      try {
        const newCand = await parseAndScoreCandidateResume(
          file,
          requiredSkills,
          jobId,
          jobTitle,
          currentUser?.agencyId
        );
        if (newCand) {
          parsedCount++;
          setCandidates(prev => {
            const filtered = prev.filter(c => c.id !== newCand.id && (c.email && newCand.email ? c.email.toLowerCase() !== newCand.email.toLowerCase() : true));
            return [newCand, ...filtered];
          });
        }
      } catch (err) {
        console.error('Error parsing file:', file.name, err);
      }
    }

    setParseProgress(100);
    setParseMessage(`Successfully parsed ${parsedCount} candidate resume(s)!`);
    setIsProcessingResumes(false);
    setUploadSuccessMsg(`🎉 Successfully processed ${parsedCount} candidate profile(s) and saved to database!`);

    // Reload Candidates Table
    await loadCandidates();
  };

  // Filter candidates based on global search & status filter dropdown
  const filteredCandidates = candidates.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.skills && c.skills.some(s => s.toLowerCase().includes(q)))
    );

    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto' }}>
      {/* Hidden File Inputs */}
      <input
        ref={singleInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            processUploadFiles([e.target.files[0]]);
          }
        }}
      />
      <input
        ref={bulkInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files) {
            processUploadFiles(e.target.files);
          }
        }}
      />

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Candidate Directory ({filteredCandidates.length})</h1>
          <p className="page-subtitle">
            All candidates parsed from uploaded resumes stored dynamically in Supabase database.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Upload Resumes Primary Button */}
          <button
            className="btn btn-primary"
            style={{ height: 40, padding: '0 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={() => {
              if (bulkInputRef.current) bulkInputRef.current.click();
            }}
          >
            <UploadCloud size={18} />
            <span>Upload Resumes</span>
          </button>

          {/* Status Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={16} color="#64748b" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
              style={{ height: 40, fontSize: 13, padding: '0 12px', background: '#ffffff', cursor: 'pointer' }}
            >
              <option value="All">All Hiring Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Screening">Screening</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Offered">Offered</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Parsing Progress Indicator */}
      {isProcessingResumes && (
        <div style={{ marginBottom: 20, background: '#eff6ff', padding: 16, borderRadius: 10, border: '1px solid #bfdbfe' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: '#1e40af', marginBottom: 6 }}>
            <span>{parseMessage}</span>
            <span>{parseProgress}%</span>
          </div>
          <div style={{ width: '100%', height: 8, background: '#dbeafe', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${parseProgress}%`, height: '100%', background: '#2563eb', transition: 'width 0.3s ease' }}></div>
          </div>
        </div>
      )}

      {/* Success Banner */}
      {uploadSuccessMsg && (
        <div style={{ marginBottom: 20, background: '#f0fdf4', padding: 12, borderRadius: 8, border: '1px solid #bbf7d0', color: '#15803d', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} />
          <span>{uploadSuccessMsg}</span>
        </div>
      )}

      {/* Candidates Data Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Loading candidates from Supabase DB...</div>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            <Users size={32} color="#94a3b8" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>No candidates available in directory.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #eaecf0' }}>
                  <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Candidate Name</th>
                  <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Contact Info</th>
                  <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Experience</th>
                  <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Notice Period</th>
                  <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Hiring Status</th>
                  <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((cand, idx) => (
                  <tr
                    key={cand.id || idx}
                    style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.15s ease' }}
                    className="table-row-hover"
                    onClick={() => setSelectedCandidate(cand)}
                  >
                    {/* Candidate Name & Resume Badge */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>{cand.name}</div>
                      <div style={{ fontSize: 12, color: '#2563eb', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FileText size={12} />
                        <span>{cand.resumeFile}</span>
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Mail size={13} color="#64748b" />
                        <span>{cand.email}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Phone size={12} color="#64748b" />
                        <span>{cand.phone}</span>
                      </div>
                    </td>

                    {/* Experience */}
                    <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                      {cand.experience || '2 Years'}
                    </td>

                    {/* Notice Period */}
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 12,
                        background: cand.noticePeriod === 'Immediate' ? '#f0fdf4' : '#f8fafc',
                        color: cand.noticePeriod === 'Immediate' ? '#15803d' : '#475569',
                        border: `1px solid ${cand.noticePeriod === 'Immediate' ? '#bbf7d0' : '#e2e8f0'}`
                      }}>
                        {cand.noticePeriod || 'Immediate'}
                      </span>
                    </td>

                    {/* Hiring Status Dropdown */}
                    <td style={{ padding: '16px 20px' }} onClick={(e) => e.stopPropagation()}>
                      <select
                        value={cand.status || 'Applied'}
                        onChange={(e) => handleStatusChange(cand.id, e.target.value)}
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: '4px 8px',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          background: cand.status === 'Offered' ? '#f0fdf4' : cand.status === 'Rejected' ? '#fef2f2' : cand.status === 'Interviewing' ? '#eff6ff' : '#ffffff',
                          color: cand.status === 'Offered' ? '#15803d' : cand.status === 'Rejected' ? '#b91c1c' : cand.status === 'Interviewing' ? '#1d4ed8' : '#0f172a',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Applied">Applied</option>
                        <option value="Screening">Screening</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Offered">Offered</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>

                    {/* Action Button */}
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: 12 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCandidate(cand);
                        }}
                      >
                        <span>View Profile</span>
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Candidate Profile Drawer */}
      <CandidateDrawer
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onOpenResume={handleOpenResume}
      />

      {/* Resume Viewer Modal */}
      <ResumeViewerModal
        candidate={previewResumeModal}
        onClose={() => setPreviewResumeModal(null)}
      />
    </div>
  );
}
