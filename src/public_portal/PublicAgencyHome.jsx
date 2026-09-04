import React from 'react';
import { Briefcase, Users, Award, ShieldCheck, ArrowRight, Building2, Search, CheckCircle2, ChevronRight } from 'lucide-react';

export default function PublicAgencyHome({ agency, jobs, onNavigateTab, onSelectJob }) {
  const primaryColor = agency?.primaryColor || '#0284c7';
  const activeJobs = jobs.filter(j => j.status === 'Active');

  return (
    <div>
      {/* Hero Banner */}
      <section style={{
        background: `linear-gradient(135deg, #0f172a 0%, #1e293b 100%)`,
        color: '#ffffff',
        padding: '80px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: 840, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <span style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: 20,
            background: `${primaryColor}25`,
            color: primaryColor,
            border: `1px solid ${primaryColor}50`,
            fontSize: 13,
            fontWeight: 800,
            marginBottom: 20,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Official Career & Talent Portal
          </span>

          <h1 style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.15, marginBottom: 20, tracking: '-0.02em' }}>
            {agency?.tagline || `Transforming Talent Search for ${agency?.name}`}
          </h1>

          <p style={{ fontSize: 18, color: '#94a3b8', lineHeight: 1.6, marginBottom: 36, maxWidth: 720, margin: '0 auto 36px auto' }}>
            {agency?.aboutText ? agency.aboutText.substring(0, 220) + '...' : `Connecting market-leading enterprises with elite professionals across technology, leadership, and specialized domains.`}
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigateTab('jobs')}
              style={{
                padding: '14px 32px',
                borderRadius: 10,
                border: 'none',
                background: primaryColor,
                color: '#ffffff',
                fontSize: 16,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: `0 6px 20px ${primaryColor}50`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <span>Explore {activeJobs.length} Open Positions</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => onNavigateTab('employers')}
              style={{
                padding: '14px 32px',
                borderRadius: 10,
                border: '1px solid #334155',
                background: 'rgba(255,255,255,0.05)',
                color: '#ffffff',
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Building2 size={18} />
              <span>Hire Talent Through Us</span>
            </button>
          </div>
        </div>
      </section>

      {/* Agency Statistics Strip */}
      <section style={{ background: '#ffffff', borderBottom: '1px solid #eaecf0', padding: '36px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 36, fontWeight: 900, color: primaryColor }}>{activeJobs.length || '15+'}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginTop: 4 }}>Active Job Mandates</div>
          </div>
          <div>
            <div style={{ fontSize: 36, fontWeight: 900, color: primaryColor }}>98.5%</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginTop: 4 }}>Client Retention</div>
          </div>
          <div>
            <div style={{ fontSize: 36, fontWeight: 900, color: primaryColor }}>500+</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginTop: 4 }}>Placements Delivered</div>
          </div>
          <div>
            <div style={{ fontSize: 36, fontWeight: 900, color: primaryColor }}>12 Days</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginTop: 4 }}>Avg Time-To-Hire</div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>Featured Career Opportunities</h2>
            <p style={{ fontSize: 15, color: '#64748b', marginTop: 4 }}>Apply directly to open mandates managed by {agency?.name}</p>
          </div>
          <button
            onClick={() => onNavigateTab('jobs')}
            style={{
              background: 'transparent',
              border: `1px solid ${primaryColor}`,
              color: primaryColor,
              padding: '10px 20px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>View All Jobs</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {activeJobs.length === 0 ? (
          <div style={{ background: '#ffffff', borderRadius: 12, padding: 48, textAlign: 'center', border: '1px solid #eaecf0' }}>
            <Briefcase size={44} color="#94a3b8" style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>No Openings Posted Yet</h3>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Check back soon for new career opportunities from {agency?.name}.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {activeJobs.slice(0, 6).map(job => (
              <div
                key={job.id}
                onClick={() => onSelectJob(job.id)}
                style={{
                  background: '#ffffff',
                  borderRadius: 12,
                  padding: 24,
                  border: '1px solid #eaecf0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, boxShadow 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>{job.jobTitle}</h3>
                    <span style={{ fontSize: 11, fontWeight: 700, background: '#f1f5f9', padding: '3px 8px', borderRadius: 6, color: '#475569' }}>
                      {job.employmentType}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                    📍 {job.location} • 💼 {job.experienceRequired}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                    {(job.requiredSkills || []).slice(0, 4).map((skill, idx) => (
                      <span key={idx} style={{ fontSize: 11, fontWeight: 600, background: `${primaryColor}15`, color: primaryColor, padding: '3px 8px', borderRadius: 6 }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>Posted {job.createdAt}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: primaryColor, display: 'flex', alignItems: 'center', gap: 4 }}>
                    Apply Now <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Specializations & Services Overview */}
      <section style={{ background: '#ffffff', borderTop: '1px solid #eaecf0', padding: '64px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 30, fontWeight: 900, color: '#0f172a' }}>Why Partner With {agency?.name}?</h2>
            <p style={{ fontSize: 15, color: '#64748b', marginTop: 6 }}>Providing domain-expert recruitment services for high-growth sectors</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
            <div style={{ background: '#f8fafc', padding: 28, borderRadius: 12, border: '1px solid #eaecf0' }}>
              <Users size={32} color={primaryColor} style={{ marginBottom: 14 }} />
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Executive Talent Search</h3>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>Identifying and securing C-suite, VP, and Director level talent with deep industry networks.</p>
            </div>

            <div style={{ background: '#f8fafc', padding: 28, borderRadius: 12, border: '1px solid #eaecf0' }}>
              <Briefcase size={32} color={primaryColor} style={{ marginBottom: 14 }} />
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Specialized IT Staffing</h3>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>Rigorous technical vetting for Software Engineers, AI/ML Specialists, and Product Leaders.</p>
            </div>

            <div style={{ background: '#f8fafc', padding: 28, borderRadius: 12, border: '1px solid #eaecf0' }}>
              <ShieldCheck size={32} color={primaryColor} style={{ marginBottom: 14 }} />
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>End-to-End RPO Solutions</h3>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>Complete recruitment process outsourcing to scale hiring pipelines rapidly and efficiently.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
