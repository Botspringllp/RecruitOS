import React from 'react';
import { FileText, X } from 'lucide-react';

/**
 * Modular Candidate Resume In-App Document Viewer Modal Component
 */
export default function ResumeViewerModal({ candidate, onClose }) {
  if (!candidate) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 680,
          background: '#ffffff',
          borderRadius: 12,
          padding: 28,
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          maxHeight: '85vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, borderBottom: '1px solid #eaecf0', paddingBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={22} color="#2563eb" />
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{candidate.resumeFile}</h3>
              <span style={{ fontSize: 13, color: '#64748b' }}>Candidate Document Preview • {candidate.name}</span>
            </div>
          </div>
          <button
            className="btn btn-secondary"
            style={{ padding: '6px 12px' }}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{
          background: '#f8fafc',
          border: '1px solid #eaecf0',
          borderRadius: 8,
          padding: 20,
          fontSize: 14,
          color: '#334155',
          lineHeight: 1.6,
          whiteSpace: 'pre-line',
          fontFamily: 'monospace',
          minHeight: 200
        }}>
          {candidate.resumeText || 'Candidate Document Content loaded.'}
        </div>

        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <button className="btn btn-primary" onClick={onClose}>
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
