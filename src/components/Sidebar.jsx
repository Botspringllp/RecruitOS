import React from 'react';
import { Briefcase, Users, Building2 } from 'lucide-react';

export default function Sidebar({ currentView, onNavigate, currentUser }) {
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  return (
    <aside style={{
      width: 240,
      background: '#ffffff',
      borderRight: '1px solid #eaecf0',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      padding: '20px 16px',
      boxSizing: 'border-box'
    }}>
      {/* Brand Logo & Title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 8px',
          marginBottom: 28,
          cursor: 'pointer'
        }}
        onClick={() => onNavigate(isSuperAdmin ? 'super-admin' : 'dashboard')}
      >
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontSize: 18
        }}>
          R
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.3px' }}>
            RecruitOS
          </div>
          <span style={{ fontSize: 10, fontWeight: 800, color: isSuperAdmin ? '#0284c7' : '#15803d', background: isSuperAdmin ? '#e0f2fe' : '#f0fdf4', padding: '2px 6px', borderRadius: 4 }}>
            {isSuperAdmin ? 'SUPER ADMIN' : (currentUser?.agencyName || 'AGENCY WORKSPACE')}
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', padding: '0 8px', marginBottom: 8 }}>
        Navigation
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {isSuperAdmin ? (
          <>
            <button
              onClick={() => onNavigate('super-admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: 'none',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left',
                background: currentView === 'super-admin' ? '#e0f2fe' : 'transparent',
                color: currentView === 'super-admin' ? '#0369a1' : '#475569'
              }}
            >
              <Building2 size={18} color={currentView === 'super-admin' ? '#0369a1' : '#64748b'} />
              <span>Agencies Directory</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onNavigate('dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: 'none',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left',
                background: currentView === 'dashboard' || currentView === 'job-detail' || currentView === 'create-job' ? '#eff6ff' : 'transparent',
                color: currentView === 'dashboard' || currentView === 'job-detail' || currentView === 'create-job' ? '#1d4ed8' : '#475569'
              }}
            >
              <Briefcase size={18} color={currentView === 'dashboard' || currentView === 'job-detail' || currentView === 'create-job' ? '#1d4ed8' : '#64748b'} />
              <span>Job Mandates</span>
            </button>

            <button
              onClick={() => onNavigate('candidates')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: 'none',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left',
                background: currentView === 'candidates' ? '#eff6ff' : 'transparent',
                color: currentView === 'candidates' ? '#1d4ed8' : '#475569'
              }}
            >
              <Users size={18} color={currentView === 'candidates' ? '#1d4ed8' : '#64748b'} />
              <span>Candidates</span>
            </button>
          </>
        )}
      </nav>
    </aside>
  );
}
