import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, FileText, CheckCircle2, Award, XCircle, Users, Sparkles, Layers, Loader2, AlertCircle, BookOpen, Briefcase, ExternalLink } from 'lucide-react';
import CandidateDrawer from './CandidateDrawer';
import ResumeViewerModal from './ResumeViewerModal';
import { parseAndScoreCandidateResume } from '../services/candidatesService';

export default function JobDetailsPage({ job, onBack, onUploadResumesForJob, currentUser }) {
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'bulk'
  const [selectedSingleFile, setSelectedSingleFile] = useState(null);
  const [selectedBulkFiles, setSelectedBulkFiles] = useState([]);
  const [isProcessingResumes, setIsProcessingResumes] = useState(false);
  const [resumeError, setResumeError] = useState(null);

  // State for session-scoped candidate rankings (resets when page is re-opened)
  const [sessionCandidates, setSessionCandidates] = useState([]);

  // Selected Candidate for Profile Drawer Modal
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  // State for in-app Resume Previewer Modal
  const [previewResumeModal, setPreviewResumeModal] = useState(null);

  const singleInputRef = useRef(null);
  const bulkInputRef = useRef(null);

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

  // Handle single resume selection from native file picker
  const handleSinglePick = (file) => {
    setResumeError(null);
    if (file) setSelectedSingleFile(file);
  };

  // Handle bulk resume selection from native file picker
  const handleBulkPick = (files) => {
    setResumeError(null);
    if (files && files.length > 0) {
      setSelectedBulkFiles(Array.from(files));
    }
  };

  // Open candidate resume document (opens native PDF tab or preview modal)
  const handleOpenResumeDocument = (cand) => {
    if (cand.fileUrl) {
      window.open(cand.fileUrl, '_blank');
    } else {
      setPreviewResumeModal(cand);
    }
  };

  // Process Candidate Resume PDF/DOCX files & score against Job Mandate
  const handleParseAndScore = async () => {
    const filesToUpload = activeTab === 'single'
      ? (selectedSingleFile ? [selectedSingleFile] : [])
      : selectedBulkFiles;

    if (filesToUpload.length === 0) {
      setResumeError('Please select candidate resume PDF or DOCX file(s) to upload.');
      return;
    }

    setIsProcessingResumes(true);
    setResumeError(null);

    const jobSkills = job.requiredSkills || job.mandatorySkills || [];
    console.log('📌 [RecruitOS Resume Engine] Processing Candidate Resumes:', filesToUpload.map(f => f.name));

    try {
      let scoredCandidates = [];

      // Parse uploaded resume files via candidatesService engine
      for (const file of filesToUpload) {
        const cand = await parseAndScoreCandidateResume(file, jobSkills, job?.id, job?.jobTitle, currentUser?.agencyId);
        scoredCandidates.push(cand);
        console.log(`🎯 [RecruitOS Match Score Engine] Candidate: ${cand.name} | Match Score: ${cand.matchPercentage}%`);
      }

      if (scoredCandidates.length > 0) {
        setSessionCandidates(prev => [...scoredCandidates, ...prev]);
        onUploadResumesForJob(job.id, scoredCandidates);
        setSelectedSingleFile(null);
        setSelectedBulkFiles([]);
      } else {
        throw new Error('Unable to parse candidate resumes.');
      }
    } catch (err) {
      console.error('[JobDetailsPage] Resume processing error:', err.message);
      setResumeError(`Resume Processing Warning: ${err.message}`);
    } finally {
      setIsProcessingResumes(false);
    }
  };

  // Candidate rankings sorted by match score descending (Active Session Batch)
  const candidateList = [...sessionCandidates].sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      {/* Hidden Native File Inputs */}
      <input
        ref={singleInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleSinglePick(e.target.files[0]);
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
            handleBulkPick(e.target.files);
          }
        }}
      />

      {/* Back button & Page Title */}
      <div style={{ marginBottom: 20 }}>
        <button
          className="btn btn-secondary"
          style={{ padding: '6px 14px', fontSize: 13, marginBottom: 12 }}
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          <span>Back to Job Openings</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title">{job.jobTitle}</h1>
            <p className="page-subtitle">
              {job.location || 'Noida'} • {job.employmentType || 'Full Time, Permanent'} • {job.companyName || 'Shipgig Ventures'}
            </p>
          </div>
          <span className="status-badge" style={{ fontSize: 13, padding: '6px 12px' }}>
            <span className="status-dot"></span>
            {job.status || 'Active'}
          </span>
        </div>
      </div>

      {resumeError && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 14
        }}>
          <AlertCircle size={18} />
          <span>{resumeError}</span>
        </div>
      )}

      {/* 1. Job Information Section */}
      <div className="card" style={{ padding: 24, marginBottom: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
          Job Description & Mandate Requirements
        </h2>
        
        <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6, marginBottom: 16, whitespace: 'pre-line' }}>
          {job.jobSummary || 'Seeking a Full Stack Engineer to drive web architecture, REST APIs, and frontend user interfaces.'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, background: '#f8fafc', padding: 16, borderRadius: 8 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Experience Required</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>{job.experienceRequired || '0-2 Years'}</div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Location</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>{job.location || 'Noida'}</div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Employment Type</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>{job.employmentType || 'Full Time, Permanent'}</div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>Required Skills</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(job.requiredSkills || job.mandatorySkills || []).map((skill, idx) => (
              <span key={idx} className="skill-tag" style={{ fontSize: 13, padding: '4px 10px' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Resume Upload Section */}
      <div className="card" style={{ padding: 24, marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
              Resume Upload Section
            </h2>
            <p style={{ fontSize: 13, color: '#64748b' }}>
              Upload candidate resumes (PDF / DOCX) to trigger automated weighted skills scoring against Job Description.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <button
            className={`btn ${activeTab === 'single' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('single')}
            style={{ padding: '6px 12px', fontSize: 13 }}
          >
            <Upload size={14} />
            <span>Upload Single Resume</span>
          </button>
          <button
            className={`btn ${activeTab === 'bulk' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('bulk')}
            style={{ padding: '6px 12px', fontSize: 13 }}
          >
            <Layers size={14} />
            <span>Bulk Upload Resumes</span>
          </button>
        </div>

        {activeTab === 'single' ? (
          <div
            className="dropzone"
            onClick={() => singleInputRef.current && singleInputRef.current.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) handleSinglePick(e.dataTransfer.files[0]);
            }}
            style={{ cursor: 'pointer' }}
          >
            <div className="dropzone-icon">
              <Upload size={22} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
              Upload Single Resume (PDF / DOCX)
            </div>
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              Click to open native file picker or drag candidate resume file here
            </p>
          </div>
        ) : (
          <div
            className="dropzone"
            onClick={() => bulkInputRef.current && bulkInputRef.current.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files) handleBulkPick(e.dataTransfer.files);
            }}
            style={{ cursor: 'pointer' }}
          >
            <div className="dropzone-icon">
              <Layers size={22} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
              Bulk Upload Resumes (PDF / DOCX)
            </div>
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              Click to open native file picker or drag multiple candidate resume files here
            </p>
          </div>
        )}

        {/* Selected file preview & parse trigger */}
        {(selectedSingleFile || selectedBulkFiles.length > 0) && (
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: 12, borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
              <FileText size={16} color="#2563eb" />
              <span>
                {selectedSingleFile ? `${selectedSingleFile.name} (${(selectedSingleFile.size / 1024).toFixed(1)} KB)` : `${selectedBulkFiles.length} Resume Files Selected`}
              </span>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleParseAndScore}
              disabled={isProcessingResumes}
              style={{ padding: '6px 14px', fontSize: 13 }}
            >
              {isProcessingResumes ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Parsing & Scoring...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Parse & Score Resumes</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* 3. Candidate Ranking Section */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
              Candidate Ranking Section ({candidateList.length})
            </h2>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              Click on any candidate card below to view full profile details and open candidate resume.
            </span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '6px 12px', borderRadius: 20 }}>
            {candidateList.length} Candidates Ranked
          </div>
        </div>

        {candidateList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: '#64748b' }}>
            <Users size={36} color="#94a3b8" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>No Resumes Uploaded Yet</div>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              Upload candidate resumes in the section above to view automated match scoring and skill rankings.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {candidateList.map((cand, idx) => (
              <div
                key={cand.id || idx}
                onClick={() => setSelectedCandidate(cand)}
                style={{
                  border: '1px solid #eaecf0',
                  borderRadius: 10,
                  padding: 20,
                  background: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
                className="candidate-card-hover"
              >
                {/* Candidate Header Row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: idx === 0 ? '#eff6ff' : '#f8fafc',
                      color: idx === 0 ? '#2563eb' : '#64748b',
                      fontWeight: 800,
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      #{idx + 1}
                    </div>
                    <div>
                      {/* Candidate Name */}
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                        {cand.name}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <span>{cand.email || 'No Email'}</span>
                        <span>• {cand.phone || 'No Phone'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Match Score Badge */}
                  <span className={`score-badge ${(cand.matchPercentage || 0) >= 75 ? 'high' : (cand.matchPercentage || 0) >= 50 ? 'medium' : 'low'}`} style={{ fontSize: 14, padding: '6px 14px' }}>
                    <Award size={14} style={{ marginRight: 4 }} />
                    {cand.matchPercentage || 0}% Match
                  </span>
                </div>

                {/* Candidate Attributes Grid: Experience, Education, Resume File */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 14, background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Briefcase size={15} color="#2563eb" />
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Experience</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{cand.experience || 'N/A'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BookOpen size={15} color="#2563eb" />
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Education</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{cand.education || 'Graduate'}</div>
                    </div>
                  </div>

                  {/* Clickable Resume File Button on Card */}
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenResumeDocument(cand);
                    }}
                  >
                    <FileText size={15} color="#2563eb" />
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Resume File (Click to Open)</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>{cand.resumeFile || 'Uploaded Resume.pdf'}</span>
                        <ExternalLink size={12} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skill Match Breakdown: Matched Skills vs Missing Skills */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                  {/* Matched Skills */}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <CheckCircle2 size={14} />
                      <span>Matched Skills ({(cand.matchedSkills || []).length})</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(cand.matchedSkills || []).map((s, i) => (
                        <span key={i} className="skill-tag" style={{ background: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' }}>
                          {s}
                        </span>
                      ))}
                      {(cand.matchedSkills || []).length === 0 && (
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>No matched skills</span>
                      )}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <XCircle size={14} />
                      <span>Missing Skills ({(cand.missingSkills || []).length})</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(cand.missingSkills || []).map((s, i) => (
                        <span key={i} className="skill-tag" style={{ background: '#fef2f2', color: '#b91c1c', borderColor: '#fecaca' }}>
                          {s}
                        </span>
                      ))}
                      {(cand.missingSkills || []).length === 0 && (
                        <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>100% Skills Matched!</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modular Candidate Profile Drawer Modal Component */}
      <CandidateDrawer
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onOpenResume={handleOpenResumeDocument}
      />

      {/* Modular Resume Document Viewer Modal Component */}
      <ResumeViewerModal
        candidate={previewResumeModal}
        onClose={() => setPreviewResumeModal(null)}
      />
    </div>
  );
}
