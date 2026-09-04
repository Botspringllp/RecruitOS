import React from 'react';
import { X, Calendar, MapPin, DollarSign, Briefcase, Upload, Edit3 } from 'lucide-react';

export default function JobDetailDrawer({ isOpen, onClose, job, onUploadResumes, onEditJob }) {
  if (!isOpen || !job) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Not Started':
        return <span className="status-badge not-started"><span className="status-dot"></span>Not Started</span>;
      case 'WIP':
        return <span className="status-badge wip"><span className="status-dot"></span>WIP</span>;
      case 'Interview':
        return <span className="status-badge interview"><span className="status-dot"></span>Interview</span>;
      default:
        return <span className="status-badge wip"><span className="status-dot"></span>{status}</span>;
    }
  };

  const stages = [
    { label: "Sourced", count: Math.round(job.totalCandidates * 0.45) || 12 },
    { label: "Screened", count: Math.round(job.totalCandidates * 0.3) || 8 },
    { label: "Shortlisted", count: job.totalShortlisted || 4 },
    { label: "Interview", count: job.status === 'Interview' ? 6 : 2 },
    { label: "Offered", count: 1 }
  ];

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #eaecf0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>
                JOB #{job.sNo}
              </span>
              {getStatusBadge(job.status)}
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
              {job.jobTitle}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: '#64748b', marginTop: 4 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Briefcase size={14} /> {job.department}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={14} /> {job.location}
              </span>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Quick Actions Header Toolbar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc',
            border: '1px solid #eaecf0',
            borderRadius: 12,
            padding: '14px 18px'
          }}>
            <div style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>
              Mandate Actions
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  onClose();
                  onUploadResumes(job);
                }}
              >
                <Upload size={14} />
                <span>Upload Resumes</span>
              </button>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  onClose();
                  onEditJob(job);
                }}
              >
                <Edit3 size={14} />
                <span>Edit Job</span>
              </button>
            </div>
          </div>

          {/* Job Mandate Overview Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div style={{ background: '#ffffff', border: '1px solid #eaecf0', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Start Date
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={14} color="#2563eb" />
                {job.startDate}
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #eaecf0', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Salary Range
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <DollarSign size={14} color="#16a34a" />
                {job.salaryRange || '$140k - $170k'}
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #eaecf0', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Hiring Lead
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
                {job.hiringManager || 'Sarah Jenkins'}
              </div>
            </div>
          </div>

          {/* Job Summary Description */}
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
              Job Summary & Mandate Scope
            </h4>
            <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.6, background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #eaecf0' }}>
              {job.jobSummary}
            </p>
          </div>

          {/* Recruitment Pipeline Progress Bar */}
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
              Recruitment Pipeline Breakdown
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {stages.map((st, i) => (
                <div key={i} style={{
                  background: i === 2 || i === 3 ? '#eff6ff' : '#f8fafc',
                  border: i === 2 || i === 3 ? '1px solid #bfdbfe' : '1px solid #eaecf0',
                  borderRadius: 8,
                  padding: '10px 8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{st.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: i === 2 || i === 3 ? '#1d4ed8' : '#0f172a', marginTop: 2 }}>
                    {st.count}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Required Skills Badges */}
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
              Required Candidate Skills
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {job.skills.map((skill, sIdx) => (
                <span key={sIdx} style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 12.5,
                  fontWeight: 600
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Active Candidates Preview List */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                Recent Active Candidates ({job.candidatesList?.length || 0})
              </h4>
              <span style={{ fontSize: 12, color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}>
                View All {job.totalCandidates} Applicants &rarr;
              </span>
            </div>

            {(!job.candidatesList || job.candidatesList.length === 0) ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13, background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1' }}>
                No active candidates screened yet. Upload resumes to populate candidate pipeline.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {job.candidatesList.map((cand, cIdx) => (
                  <div key={cIdx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: '#ffffff',
                    border: '1px solid #eaecf0',
                    borderRadius: 8
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: '#eff6ff',
                        color: '#2563eb',
                        fontWeight: 700,
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {cand.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                          {cand.name}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#64748b' }}>
                          {cand.role} • Applied {cand.applied}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: '#16a34a',
                        background: '#f0fdf4',
                        padding: '2px 8px',
                        borderRadius: 4
                      }}>
                        Match: {cand.match}
                      </span>
                      <span className={`status-badge ${cand.stage.toLowerCase() === 'interview' ? 'interview' : 'wip'}`}>
                        {cand.stage}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
