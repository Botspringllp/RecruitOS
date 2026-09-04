import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle, Sparkles, Loader2 } from 'lucide-react';

export default function UploadResumesModal({ isOpen, onClose, targetJob, jobs, onResumesUploaded }) {
  const [selectedJobId, setSelectedJobId] = useState(targetJob ? targetJob.id : (jobs[0]?.id || 1));
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseComplete, setParseComplete] = useState(false);

  if (!isOpen) return null;

  const handleFileDrop = (e) => {
    e.preventDefault();
    const files = [
      { name: "Alex_Vanderbilt_Resume.pdf", size: "1.4 MB", parsedName: "Alex Vanderbilt", match: "97%", stage: "Shortlisted", skills: ["React", "TypeScript", "Node.js"] },
      { name: "Jessica_Wong_CV_2026.docx", size: "890 KB", parsedName: "Jessica Wong", match: "92%", stage: "Screening", skills: ["Figma", "UI/UX", "User Research"] },
      { name: "Michael_Chang_Resume.pdf", size: "2.1 MB", parsedName: "Michael Chang", match: "88%", stage: "Screening", skills: ["Python", "AWS", "Kubernetes"] }
    ];
    setUploadedFiles(files);
  };

  const handleSimulateSelectFiles = () => {
    const files = [
      { name: "David_Miller_Resume_2026.pdf", size: "1.2 MB", parsedName: "David Miller", match: "95%", stage: "Shortlisted", skills: ["React", "Next.js", "Tailwind"] },
      { name: "Sophia_Chen_Senior_CV.pdf", size: "1.8 MB", parsedName: "Sophia Chen", match: "93%", stage: "Screening", skills: ["Python", "Machine Learning", "PyTorch"] }
    ];
    setUploadedFiles(files);
  };

  const handleStartParsing = () => {
    setIsParsing(true);
    setTimeout(() => {
      setIsParsing(false);
      setParseComplete(true);
      if (onResumesUploaded) {
        onResumesUploaded(selectedJobId, uploadedFiles.length);
      }
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Upload size={18} />
            </div>
            <div>
              <h2 className="modal-title">
                {targetJob ? `Upload Resumes for "${targetJob.jobTitle}"` : 'Bulk Upload Candidate Resumes'}
              </h2>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                AI Automated Parsing & ATS Candidate Matching Pipeline
              </span>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Target Job Selection Dropdown */}
          <div className="form-group">
            <label className="form-label">Assign Resumes to Job Opening</label>
            <select
              className="form-select"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(Number(e.target.value))}
            >
              {jobs.map(j => (
                <option key={j.id} value={j.id}>
                  {j.jobTitle} ({j.department}) - {j.status}
                </option>
              ))}
            </select>
          </div>

          {/* Dropzone */}
          {!parseComplete ? (
            <div>
              <div
                className="dropzone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={handleSimulateSelectFiles}
              >
                <div className="dropzone-icon">
                  <Upload size={24} />
                </div>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                    Click to browse or drag & drop PDF/DOCX resumes
                  </span>
                  <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                    Supports batch upload of up to 50 resumes simultaneously (PDF, DOCX, TXT)
                  </p>
                </div>
              </div>

              {/* Uploaded Files Preview */}
              {uploadedFiles.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8 }}>
                    <span>Selected Files ({uploadedFiles.length})</span>
                    <span style={{ color: '#2563eb' }}>Ready for AI parsing</span>
                  </div>
                  <div className="upload-file-list">
                    {uploadedFiles.map((file, i) => (
                      <div key={i} className="upload-file-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <FileText size={16} color="#2563eb" />
                          <span className="upload-file-name">{file.name}</span>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>({file.size})</span>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#16a34a', background: '#f0fdf4', padding: '2px 6px', borderRadius: 4 }}>
                          Matched {file.match}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 12px' }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: '#f0fdf4',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <CheckCircle size={32} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                Resumes Successfully Parsed & Added!
              </h3>
              <p style={{ fontSize: 13, color: '#64748b', marginTop: 6, maxWidth: 420, margin: '6px auto 0 auto' }}>
                Extracted contact details, experience, and skill tags for {uploadedFiles.length} candidate profiles into the target job pipeline.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          {!parseComplete ? (
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                disabled={uploadedFiles.length === 0 || isParsing}
                onClick={handleStartParsing}
                style={{ opacity: uploadedFiles.length === 0 ? 0.5 : 1 }}
              >
                {isParsing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Parsing Resumes...</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={16} />
                    <span>Parse & Index Resumes</span>
                  </div>
                )}
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={onClose}>
              Done & Return to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
