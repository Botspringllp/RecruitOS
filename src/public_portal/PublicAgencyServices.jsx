import React from 'react';
import { Briefcase, Users, ShieldCheck, Zap, Layers, Award } from 'lucide-react';

export default function PublicAgencyServices({ agency, onNavigateTab }) {
  const primaryColor = agency?.primaryColor || '#0284c7';

  return (
    <div>
      <section style={{ background: '#0f172a', color: '#ffffff', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12 }}>Recruitment & Staffing Services</h1>
          <p style={{ fontSize: 16, color: '#94a3b8' }}>
            Tailored hiring solutions designed for enterprise scalability and speed
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
          {/* Service 1 */}
          <div style={{ background: '#ffffff', borderRadius: 16, padding: 36, border: '1px solid #eaecf0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Users size={38} color={primaryColor} style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Executive & C-Suite Search</h3>
            <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.7, marginBottom: 20 }}>
              Retained and contingent executive search targeting VP, Director, and C-level leaders across technology and growth verticals.
            </p>
            <button onClick={() => onNavigateTab('employers')} style={{ background: 'transparent', border: `1px solid ${primaryColor}`, color: primaryColor, padding: '8px 16px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
              Request Executive Search
            </button>
          </div>

          {/* Service 2 */}
          <div style={{ background: '#ffffff', borderRadius: 16, padding: 36, border: '1px solid #eaecf0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Briefcase size={38} color={primaryColor} style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Specialized Tech & IT Staffing</h3>
            <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.7, marginBottom: 20 }}>
              Full-lifecycle placement of Software Engineers, DevOps, AI Engineers, Product Managers, and Data Scientists.
            </p>
            <button onClick={() => onNavigateTab('employers')} style={{ background: 'transparent', border: `1px solid ${primaryColor}`, color: primaryColor, padding: '8px 16px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
              Submit IT Mandate
            </button>
          </div>

          {/* Service 3 */}
          <div style={{ background: '#ffffff', borderRadius: 16, padding: 36, border: '1px solid #eaecf0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <ShieldCheck size={38} color={primaryColor} style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Recruitment Process Outsourcing (RPO)</h3>
            <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.7, marginBottom: 20 }}>
              End-to-end recruitment process management embedded within your human resources operations for rapid scaling.
            </p>
            <button onClick={() => onNavigateTab('employers')} style={{ background: 'transparent', border: `1px solid ${primaryColor}`, color: primaryColor, padding: '8px 16px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
              Explore RPO Solutions
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
