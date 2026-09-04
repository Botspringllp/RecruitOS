import React, { useRef, useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { parseAndScoreCandidateResume } from '../services/candidatesService';

export default function ResumeUploadModal({ job, currentUser, onClose, onParsed }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const singleInputRef = useRef(null);
  const bulkInputRef = useRef(null);

  const processFiles = async (files) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setStatusText('Initializing AI Resume Parsing Engine...');
    setSuccessMsg('');

    const fileList = Array.from(files);
    const requiredSkills = job?.skills || job?.allRequiredSkills || [];
    const jobId = job?.id || null;
    const jobTitle = job?.jobTitle || job?.title || 'Job Mandate';

    let count = 0;
    const newParsedList = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setStatusText(`Parsing Resume ${i + 1} of ${fileList.length}: "${file.name}"...`);
      setProgress(Math.round(((i) / fileList.length) * 100));

      try {
        const cand = await parseAndScoreCandidateResume(
          file,
          requiredSkills,
          jobId,
          jobTitle,
          currentUser?.agencyId
        );
        if (cand) {
          count++;
          newParsedList.push(cand);
        }
      } catch (err) {
        console.error('[ResumeUploadModal] Parsing error:', err);
      }
    }

    setProgress(100);
    setStatusText(`Successfully parsed ${count} candidate resume(s)!`);
    setIsProcessing(false);
    setSuccessMsg(`🎉 Successfully processed ${count} candidate profile(s) and attached to job!`);

    if (onParsed) onParsed(newParsedList);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      {/* Hidden File Inputs */}
      <input
        ref={singleInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) processFiles([e.target.files[0]]);
        }}
      />
      <input
        ref={bulkInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files) processFiles(e.target.files);
        }}
      />

      <div style={{ background: '#ffffff', width: '100%', maxWidth: 580, borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px', background: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Upload & Score Candidate Resumes</h3>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0 0' }}>
              Job: <strong>{job?.jobTitle || job?.title || 'Current Opening'}</strong>
            </p>
          </div>
          <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 24 }}>
          <div
            style={{
              border: '2px dashed #cbd5e1',
              borderRadius: 12,
              padding: '36px 20px',
              textAlign: 'center',
              background: '#f8fafc',
              cursor: isProcessing ? 'wait' : 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => {
              if (!isProcessing && bulkInputRef.current) bulkInputRef.current.click();
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (!isProcessing && e.dataTransfer.files) processFiles(e.dataTransfer.files);
            }}
          >
            <UploadCloud size={44} color="#2563eb" style={{ marginBottom: 12 }} />
            <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
              Drag & Drop Resumes Here, or Click to Browse
            </h4>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
              Supports PDF and DOCX files. Select multiple files for bulk upload.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20 }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: 13, padding: '8px 16px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (singleInputRef.current) singleInputRef.current.click();
                }}
              >
                Upload Single Resume
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ fontSize: 13, padding: '8px 16px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (bulkInputRef.current) bulkInputRef.current.click();
                }}
              >
                Bulk Upload Resumes
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          {isProcessing && (
            <div style={{ marginTop: 20, background: '#eff6ff', padding: 16, borderRadius: 10, border: '1px solid #bfdbfe' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: '#1e40af', marginBottom: 6 }}>
                <span>{statusText}</span>
                <span>{progress}%</span>
              </div>
              <div style={{ width: '100%', height: 8, background: '#dbeafe', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: '#2563eb', transition: 'width 0.3s ease' }}></div>
              </div>
            </div>
          )}

          {/* Success Notification */}
          {successMsg && (
            <div style={{ marginTop: 20, background: '#f0fdf4', padding: 14, borderRadius: 10, border: '1px solid #bbf7d0', color: '#15803d', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
            <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={onClose}>
              {successMsg ? 'Close' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
