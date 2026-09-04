import React from 'react';
import { Target, Eye, Award, Users, Shield, CheckCircle } from 'lucide-react';

export default function PublicAgencyAbout({ agency }) {
  const primaryColor = agency?.primaryColor || '#0284c7';

  return (
    <div>
      {/* Page Header */}
      <section style={{ background: '#0f172a', color: '#ffffff', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: 38, fontWeight: 900, marginBottom: 12 }}>About {agency?.name}</h1>
          <p style={{ fontSize: 16, color: '#94a3b8', lineHeight: 1.6 }}>
            {agency?.tagline || 'Leading Recruitment & Executive Search Firm'}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '64px 24px' }}>
        {/* Company Overview */}
        <div style={{ background: '#ffffff', borderRadius: 16, padding: 40, border: '1px solid #eaecf0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: 40 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>Company Overview</h2>
          <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.8, marginBottom: 24 }}>
            {agency?.aboutText || `${agency?.name} is a premier talent acquisition agency specializing in connecting high-caliber professionals with innovative enterprises across technology, finance, engineering, and healthcare. Founded on principles of transparency, domain expertise, and candidate care, we help companies build industry-defining teams.`}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CheckCircle size={20} color={primaryColor} />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>100% Vetted Talent Pools</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CheckCircle size={20} color={primaryColor} />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Dedicated Account Managers</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CheckCircle size={20} color={primaryColor} />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>AI-Powered ATS Matching</span>
            </div>
          </div>
        </div>

        {/* Mission & Vision Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32, marginBottom: 40 }}>
          {/* Mission */}
          <div style={{ background: '#ffffff', borderRadius: 16, padding: 32, border: '1px solid #eaecf0' }}>
            <Target size={36} color={primaryColor} style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Our Mission</h3>
            <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7 }}>
              {agency?.missionText || `To empower global organizations by discovering and delivering top 1% talent with speed, precision, and unyielding integrity.`}
            </p>
          </div>

          {/* Vision */}
          <div style={{ background: '#ffffff', borderRadius: 16, padding: 32, border: '1px solid #eaecf0' }}>
            <Eye size={36} color={primaryColor} style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Our Vision</h3>
            <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7 }}>
              {agency?.visionText || `To be the most trusted strategic recruitment partner for growth enterprises worldwide.`}
            </p>
          </div>
        </div>

        {/* Leadership Team Placeholder */}
        <div style={{ background: '#ffffff', borderRadius: 16, padding: 40, border: '1px solid #eaecf0' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Leadership & Recruiters</h2>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28 }}>Meet the talent acquisition specialists managing your mandates.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            <div style={{ textAlign: 'center', background: '#f8fafc', padding: 24, borderRadius: 12 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: primaryColor, color: '#fff', fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                {agency?.ownerName ? agency.ownerName.substring(0, 2).toUpperCase() : 'OW'}
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{agency?.ownerName || 'Managing Principal'}</div>
              <div style={{ fontSize: 13, color: primaryColor, fontWeight: 600, marginTop: 2 }}>Head of Recruitment</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>{agency?.ownerEmail}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
