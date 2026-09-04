import React from 'react';
import { Briefcase, Clock, Users, CheckCircle, TrendingUp } from 'lucide-react';

export default function StatOverview({ jobs }) {
  const totalJobs = jobs.length;
  const wipJobs = jobs.filter(j => j.status === 'WIP').length;
  const interviewJobs = jobs.filter(j => j.status === 'Interview').length;
  const totalCandidatesSum = jobs.reduce((acc, j) => acc + (j.totalCandidates || 0), 0);
  const totalShortlistedSum = jobs.reduce((acc, j) => acc + (j.totalShortlisted || 0), 0);

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-content">
          <span className="stat-label">Total Job Openings</span>
          <span className="stat-value">{totalJobs}</span>
          <span className="stat-badge up">
            <TrendingUp size={13} /> Active Mandates
          </span>
        </div>
        <div className="stat-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
          <Briefcase size={22} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-content">
          <span className="stat-label">In Progress (WIP)</span>
          <span className="stat-value">{wipJobs}</span>
          <span className="stat-badge up" style={{ color: '#2563eb' }}>
            Active Sourcing
          </span>
        </div>
        <div className="stat-icon-box" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
          <Clock size={22} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-content">
          <span className="stat-label">Active Interviews</span>
          <span className="stat-value">{interviewJobs}</span>
          <span className="stat-badge up" style={{ color: '#16a34a' }}>
            High Priority
          </span>
        </div>
        <div className="stat-icon-box" style={{ background: '#f0fdf4', color: '#166534' }}>
          <CheckCircle size={22} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-content">
          <span className="stat-label">Total Applicants Pool</span>
          <span className="stat-value">{totalCandidatesSum}</span>
          <span className="stat-badge up" style={{ color: '#2563eb' }}>
            {totalShortlistedSum} Shortlisted
          </span>
        </div>
        <div className="stat-icon-box" style={{ background: '#f8fafc', color: '#475569' }}>
          <Users size={22} />
        </div>
      </div>
    </div>
  );
}
