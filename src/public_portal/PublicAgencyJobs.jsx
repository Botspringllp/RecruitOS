import React, { useState } from 'react';
import { Search, Briefcase, MapPin, ChevronRight, Filter, Award, Sparkles } from 'lucide-react';

export default function PublicAgencyJobs({ agency, jobs, onSelectJob }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const primaryColor = agency?.primaryColor || '#0284c7';
  const activeJobs = jobs.filter(j => j.status === 'Active');

  // Extract all unique skills across jobs for filter pills
  const allSkills = Array.from(new Set(activeJobs.flatMap(j => j.requiredSkills || [])));

  // Filter jobs by search term and selected skill pill
  const filteredJobs = activeJobs.filter(job => {
    const matchesSearch = !searchQuery || 
      job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.requiredSkills || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSkill = selectedSkill === 'ALL' || (job.requiredSkills || []).includes(selectedSkill);

    return matchesSearch && matchesSkill;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage) || 1;
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      {/* Page Header */}
      <section style={{ background: '#0f172a', color: '#ffffff', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12 }}>Open Career Mandates</h1>
          <p style={{ fontSize: 16, color: '#94a3b8' }}>
            Explore verified opportunities managed by {agency?.name}
          </p>

          {/* Search Box */}
          <div style={{ marginTop: 32, position: 'relative', maxWidth: 600, margin: '32px auto 0 auto' }}>
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by job title, skill (e.g. React, Java), or location..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                padding: '14px 20px 14px 50px',
                borderRadius: 10,
                border: 'none',
                fontSize: 15,
                background: '#ffffff',
                color: '#0f172a',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
              }}
            />
          </div>
        </div>
      </section>

      {/* Main Jobs Section */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        {/* Filter Pills */}
        {allSkills.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginRight: 4 }}>Filter Skill:</span>
            <button
              onClick={() => { setSelectedSkill('ALL'); setCurrentPage(1); }}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: 'none',
                background: selectedSkill === 'ALL' ? primaryColor : '#e2e8f0',
                color: selectedSkill === 'ALL' ? '#ffffff' : '#475569',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              All Skills ({activeJobs.length})
            </button>
            {allSkills.map(skill => (
              <button
                key={skill}
                onClick={() => { setSelectedSkill(skill); setCurrentPage(1); }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  background: selectedSkill === skill ? primaryColor : '#ffffff',
                  color: selectedSkill === skill ? '#ffffff' : '#475569',
                  fontSize: 13,
                  fontWeight: 600,
                  border: `1px solid ${selectedSkill === skill ? primaryColor : '#cbd5e1'}`,
                  cursor: 'pointer'
                }}
              >
                {skill}
              </button>
            ))}
          </div>
        )}

        {/* Jobs Grid */}
        {paginatedJobs.length === 0 ? (
          <div style={{ background: '#ffffff', borderRadius: 16, padding: 64, textAlign: 'center', border: '1px solid #eaecf0' }}>
            <Briefcase size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>No Jobs Found</h3>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Try clearing your search query or selecting another skill filter.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24, marginBottom: 40 }}>
            {paginatedJobs.map(job => (
              <div
                key={job.id}
                onClick={() => onSelectJob(job.id)}
                style={{
                  background: '#ffffff',
                  borderRadius: 14,
                  padding: 24,
                  border: '1px solid #eaecf0',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>{job.jobTitle}</h3>
                    <span style={{ fontSize: 11, fontWeight: 700, background: '#f1f5f9', padding: '4px 10px', borderRadius: 6, color: '#334155' }}>
                      {job.employmentType}
                    </span>
                  </div>

                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                    📍 {job.location} • 💼 {job.experienceRequired}
                  </div>

                  <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.5, marginBottom: 20, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {job.jobSummary || 'Specialized role managing client mandates.'}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                    {(job.requiredSkills || []).map((skill, idx) => (
                      <span key={idx} style={{ fontSize: 11, fontWeight: 600, background: `${primaryColor}15`, color: primaryColor, padding: '3px 8px', borderRadius: 6 }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>Posted {job.createdAt}</span>
                  <button
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: 'none',
                      background: primaryColor,
                      color: '#ffffff',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <span>View & Apply</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: 14,
                fontWeight: 600,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              Previous
            </button>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#475569' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: 14,
                fontWeight: 600,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
