import React from 'react';
import { Plus, FileText, ChevronRight, Upload, Award, Users } from 'lucide-react';

export default function JobDashboard({ jobs, onOpenCreateJobPage, onSelectJob, onOpenResumeUpload }) {
  const getScoreColorClass = (score) => {
    if (score >= 75) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  };

  return (
    <div className="card">
      {/* Dashboard Top Title Bar */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #eaecf0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff'
      }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Job Openings Dashboard</h2>
          <span style={{ fontSize: 13, color: '#64748b' }}>
            All active job requirement mandates created in RecruitOS
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {jobs.length > 0 && (
            <button
              className="btn btn-primary"
              onClick={onOpenCreateJobPage}
            >
              <Plus size={16} />
              <span>+ Upload Job Requirement</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Dashboard Data Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Skills</th>
              <th>Experience</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center' }}>Created Date</th>
              <th style={{ textAlign: 'center' }}>Total Resumes</th>
              <th style={{ textAlign: 'center' }}>Average Match Score</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '64px 20px', color: '#64748b' }}>
                  <FileText size={42} color="#94a3b8" style={{ marginBottom: 12 }} />
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                    No Job Requirements Available
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b', marginTop: 6, maxWidth: 440, margin: '6px auto 20px auto' }}>
                    Upload your first Job Requirement PDF to get started.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={onOpenCreateJobPage}
                    style={{ padding: '10px 20px', fontSize: 14 }}
                  >
                    <Plus size={18} />
                    <span>+ Upload Job Requirement</span>
                  </button>
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} onClick={() => onSelectJob(job.id)} style={{ cursor: 'pointer' }}>
                  {/* Job Title */}
                  <td>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                      {job.jobTitle}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      {job.location || 'Remote'} • {job.employmentType || 'Full-Time'}
                    </div>
                  </td>

                  {/* Skills */}
                  <td style={{ maxWidth: 220 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {(job.requiredSkills || []).slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="skill-tag" style={{ fontSize: 11, padding: '2px 8px' }}>
                          {skill}
                        </span>
                      ))}
                      {(job.requiredSkills || []).length > 3 && (
                        <span className="skill-tag" style={{ background: '#e2e8f0', fontSize: 11, padding: '2px 6px' }}>
                          +{(job.requiredSkills || []).length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Experience */}
                  <td>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                      {job.experienceRequired || 'Not Specified'}
                    </span>
                  </td>

                  {/* Status */}
                  <td style={{ textAlign: 'center' }}>
                    <span className="status-badge">
                      <span className="status-dot"></span>
                      {job.status || 'Active'}
                    </span>
                  </td>

                  {/* Created Date */}
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: 13, color: '#64748b' }}>
                      {job.createdAt || 'Today'}
                    </span>
                  </td>

                  {/* Total Resumes */}
                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#334155',
                      background: '#f1f5f9',
                      padding: '4px 10px',
                      borderRadius: 6
                    }}>
                      <Users size={14} color="#2563eb" />
                      {job.totalUploadedResumes || 0}
                    </span>
                  </td>

                  {/* Average Match Score */}
                  <td style={{ textAlign: 'center' }}>
                    <span className={`score-badge ${getScoreColorClass(job.avgMatchScore || 0)}`}>
                      <Award size={13} style={{ marginRight: 4 }} />
                      {job.avgMatchScore || 0}%
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                      <button
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: 12 }}
                        onClick={() => onSelectJob(job.id)}
                      >
                        <span>View Details</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
