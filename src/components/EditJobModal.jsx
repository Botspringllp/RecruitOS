import React, { useState, useEffect } from 'react';
import { X, Edit3, Save } from 'lucide-react';

export default function EditJobModal({ isOpen, onClose, job, onSaveJob }) {
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [jobSummary, setJobSummary] = useState('');
  const [startDate, setStartDate] = useState('');
  const [status, setStatus] = useState('WIP');
  const [skillsInput, setSkillsInput] = useState('');
  const [salaryRange, setSalaryRange] = useState('');

  useEffect(() => {
    if (job) {
      setJobTitle(job.jobTitle || '');
      setDepartment(job.department || 'Engineering');
      setLocation(job.location || '');
      setJobSummary(job.jobSummary || '');
      setStartDate(job.startDate || '');
      setStatus(job.status || 'WIP');
      setSkillsInput(job.skills ? job.skills.join(', ') : '');
      setSalaryRange(job.salaryRange || '');
    }
  }, [job]);

  if (!isOpen || !job) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedJob = {
      ...job,
      jobTitle,
      department,
      location,
      jobSummary,
      startDate,
      status,
      skills: skillsInput.split(',').map(s => s.trim()).filter(Boolean),
      salaryRange
    };

    onSaveJob(updatedJob);
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
              <Edit3 size={18} />
            </div>
            <div>
              <h2 className="modal-title">Edit Job Opening</h2>
              <span style={{ fontSize: 12, color: '#64748b' }}>Modify details for Job S No. {job.sNo}</span>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Job Title</label>
              <input
                type="text"
                className="form-input"
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
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Job Summary</label>
              <textarea
                className="form-textarea"
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
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Salary Range</label>
              <input
                type="text"
                className="form-input"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
