import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';

export default function CreateJobModal({ isOpen, onClose, onCreateJob }) {
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('San Francisco, CA (Hybrid)');
  const [jobSummary, setJobSummary] = useState('');
  const [startDate, setStartDate] = useState('');
  const [status, setStatus] = useState('WIP');
  const [skillsInput, setSkillsInput] = useState('');
  const [salaryRange, setSalaryRange] = useState('$130,000 - $160,000 / year');
  const [experienceLevel, setExperienceLevel] = useState('4-6 Years');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!jobTitle || !jobSummary) return;

    const skillsArray = skillsInput
      ? skillsInput.split(',').map(s => s.trim()).filter(Boolean)
      : ['React', 'TypeScript', 'Node.js'];

    const newJob = {
      jobTitle,
      department,
      location,
      jobSummary,
      startDate: startDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status,
      skills: skillsArray,
      salaryRange,
      experienceLevel,
      totalCandidates: 0,
      totalShortlisted: 0,
      hiringManager: 'Sarah Jenkins',
      candidatesList: []
    };

    onCreateJob(newJob);
    onClose();
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
              <Plus size={18} />
            </div>
            <div>
              <h2 className="modal-title">Create New Job Opening</h2>
              <span style={{ fontSize: 12, color: '#64748b' }}>Post a new recruitment mandate into RecruitOS</span>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Job Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Senior Frontend Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
                  <option value="Engineering">Engineering</option>
                  <option value="Product UX">Product UX</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales & RevOps">Sales & RevOps</option>
                  <option value="Client Services">Client Services</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. San Francisco, CA (Hybrid)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Job Summary Description *</label>
              <textarea
                className="form-textarea"
                placeholder="Enter a brief high-level summary of the role responsibilities and requirements..."
                value={jobSummary}
                onChange={(e) => setJobSummary(e.target.value)}
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 15 Sep 2026"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Not Started">Not Started</option>
                  <option value="WIP">WIP (Work In Progress)</option>
                  <option value="Interview">Interview Stage</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Required Skills (Comma separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. React, TypeScript, GraphQL, AWS"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Target Salary Range</label>
                <input
                  type="text"
                  className="form-input"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Experience Required</label>
                <input
                  type="text"
                  className="form-input"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Plus size={16} />
              <span>Create Job Mandate</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
