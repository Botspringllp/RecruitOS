import React from 'react';
import { X, Award, Mail, Phone, Briefcase, BookOpen, FileText, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';

/**
 * Modular Candidate Profile Overview Drawer Component
 */
export default function CandidateDrawer({ candidate, onClose, onOpenResume }) {
  if (!candidate) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 540,
          background: '#ffffff',
          height: '100%',
          overflowY: 'auto',
          padding: 32,
          boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, borderBottom: '1px solid #eaecf0', paddingBottom: 16 }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>Candidate Profile Overview</span>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{candidate.name}</h2>
          </div>
          <button
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: 13 }}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Score Banner */}
        <div style={{
          background: candidate.matchPercentage >= 75 ? '#f0fdf4' : candidate.matchPercentage >= 50 ? '#eff6ff' : '#fef2f2',
          border: `1px solid ${candidate.matchPercentage >= 75 ? '#bbf7d0' : candidate.matchPercentage >= 50 ? '#bfdbfe' : '#fecaca'}`,
          borderRadius: 10,
          padding: 20,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>JD Requirements Match Score</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: candidate.matchPercentage >= 75 ? '#15803d' : candidate.matchPercentage >= 50 ? '#1d4ed8' : '#b91c1c', marginTop: 2 }}>
              {candidate.matchPercentage}%
            </div>
          </div>
          <span className={`score-badge ${candidate.matchPercentage >= 75 ? 'high' : candidate.matchPercentage >= 50 ? 'medium' : 'low'}`} style={{ fontSize: 14, padding: '8px 16px' }}>
            <Award size={16} style={{ marginRight: 6 }} />
            {candidate.matchPercentage >= 75 ? 'Strong Match' : candidate.matchPercentage >= 50 ? 'Moderate Match' : 'Potential Match'}
          </span>
        </div>

        {/* Contact Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24, background: '#f8fafc', padding: 16, borderRadius: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Mail size={16} color="#2563eb" />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Email</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{candidate.email || 'N/A'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Phone size={16} color="#2563eb" />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Phone</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{candidate.phone || 'N/A'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Briefcase size={16} color="#2563eb" />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Experience</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{candidate.experience || '2 Years'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BookOpen size={16} color="#2563eb" />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Education</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{candidate.education || 'Graduate'}</div>
            </div>
          </div>
        </div>

        {/* Clickable Resume File Section with Open Button */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>Uploaded Document</div>
          <div
            onClick={() => onOpenResume(candidate)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              background: '#eff6ff',
              border: '1.5px solid #bfdbfe',
              borderRadius: 10,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FileText size={20} color="#2563eb" />
              <div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1e40af' }}>{candidate.resumeFile}</span>
                <p style={{ fontSize: 12, color: '#3b82f6', marginTop: 2 }}>Click to open full candidate resume</p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '6px 12px', fontSize: 13 }}
              onClick={(e) => {
                e.stopPropagation();
                onOpenResume(candidate);
              }}
            >
              <ExternalLink size={14} />
              <span>Open Resume</span>
            </button>
          </div>
        </div>

        {/* Matched Skills Breakdown */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <CheckCircle2 size={16} />
            <span>Matched Skills ({(candidate.matchedSkills || []).length})</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(candidate.matchedSkills || []).map((s, i) => (
              <span key={i} className="skill-tag" style={{ background: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0', padding: '6px 12px', fontSize: 13 }}>
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Missing Skills Breakdown */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <XCircle size={16} />
            <span>Missing Skills ({(candidate.missingSkills || []).length})</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(candidate.missingSkills || []).map((s, i) => (
              <span key={i} className="skill-tag" style={{ background: '#fef2f2', color: '#b91c1c', borderColor: '#fecaca', padding: '6px 12px', fontSize: 13 }}>
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <div style={{ marginTop: 'auto', paddingTop: 20 }}>
          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={onClose}
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
