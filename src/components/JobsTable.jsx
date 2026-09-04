import React, { useState } from 'react';
import { Eye, Upload, Edit3, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Users, CheckCircle2 } from 'lucide-react';

export default function JobsTable({
  jobs,
  onRowClick,
  onViewJob,
  onUploadResumes,
  onEditJob,
  statusFilter,
  setStatusFilter,
  tableSearch,
  setTableSearch
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter Jobs
  const filteredJobs = jobs.filter(job => {
    const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
    const searchLower = tableSearch.toLowerCase();
    const matchesSearch =
      job.jobTitle.toLowerCase().includes(searchLower) ||
      job.jobSummary.toLowerCase().includes(searchLower) ||
      job.department.toLowerCase().includes(searchLower) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchLower));

    return matchesStatus && matchesSearch;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage) || 1;
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Not Started':
        return (
          <span className="status-badge not-started">
            <span className="status-dot"></span>
            Not Started
          </span>
        );
      case 'WIP':
        return (
          <span className="status-badge wip">
            <span className="status-dot"></span>
            WIP
          </span>
        );
      case 'Interview':
        return (
          <span className="status-badge interview">
            <span className="status-dot"></span>
            Interview
          </span>
        );
      default:
        return (
          <span className="status-badge not-started">
            <span className="status-dot"></span>
            {status}
          </span>
        );
    }
  };

  return (
    <div className="table-card">
      {/* Table Toolbar / Controls */}
      <div className="toolbar-card">
        <div className="filter-group">
          {/* Quick Search inside Table */}
          <div className="table-search">
            <Search size={15} className="table-search-icon" />
            <input
              type="text"
              placeholder="Filter by title or skill..."
              value={tableSearch}
              onChange={(e) => {
                setTableSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Status Dropdown Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={14} color="#64748b" />
            <select
              className="select-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="WIP">WIP</option>
              <option value="Interview">Interview</option>
            </select>
          </div>
        </div>

        <div className="records-counter">
          Showing <strong>{filteredJobs.length}</strong> of <strong>{jobs.length}</strong> job openings
        </div>
      </div>

      {/* Main Jobs Table */}
      <div className="table-container">
        <table className="jobs-table">
          <thead>
            <tr>
              <th className="col-sno">S No.</th>
              <th>Job Title</th>
              <th>Job Summary</th>
              <th>Total Candidates</th>
              <th>Total Shortlisted</th>
              <th>Start Date</th>
              <th>Status</th>
              <th>Skills</th>
              <th style={{ textAlign: 'right', paddingRight: 24 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedJobs.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '48px 24px', color: '#64748b' }}>
                  No job openings match the current filters.
                </td>
              </tr>
            ) : (
              paginatedJobs.map((job, idx) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                const formattedSNo = globalIndex < 10 ? `0${globalIndex}` : `${globalIndex}`;

                return (
                  <tr
                    key={job.id}
                    className="job-row"
                    onClick={() => onRowClick(job)}
                    title="Click row to open candidate pipeline drawer"
                  >
                    <td className="col-sno">{formattedSNo}</td>

                    <td>
                      <div className="job-title-cell">
                        <span className="job-main-title">{job.jobTitle}</span>
                        <span className="job-meta-sub">
                          {job.department} • {job.location}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="job-summary-cell" title={job.jobSummary}>
                        {job.jobSummary}
                      </div>
                    </td>

                    <td>
                      <span className="candidate-count-pill">
                        <Users size={13} color="#475569" />
                        {job.totalCandidates}
                      </span>
                    </td>

                    <td>
                      <span className="shortlisted-count-pill">
                        <CheckCircle2 size={13} color="#15803d" />
                        {job.totalShortlisted}
                      </span>
                    </td>

                    <td className="col-date">{job.startDate}</td>

                    <td>{getStatusBadge(job.status)}</td>

                    <td>
                      <div className="skills-wrapper">
                        {job.skills.slice(0, 3).map((skill, sIdx) => (
                          <span key={sIdx} className="skill-tag">
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 3 && (
                          <span className="skill-tag-more">+{job.skills.length - 3}</span>
                        )}
                      </div>
                    </td>

                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="row-actions">
                        <button
                          className="action-btn-icon"
                          title="View Job Details"
                          onClick={() => onViewJob(job)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="action-btn-icon"
                          title="Upload Resumes for this Job"
                          onClick={() => onUploadResumes(job)}
                        >
                          <Upload size={16} />
                        </button>
                        <button
                          className="action-btn-icon"
                          title="Edit Job Mandate"
                          onClick={() => onEditJob(job)}
                        >
                          <Edit3 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="table-pagination">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div className="pagination-controls">
          <button
            className="page-num-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
            <button
              key={num}
              className={`page-num-btn ${currentPage === num ? 'active' : ''}`}
              onClick={() => setCurrentPage(num)}
            >
              {num}
            </button>
          ))}

          <button
            className="page-num-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
