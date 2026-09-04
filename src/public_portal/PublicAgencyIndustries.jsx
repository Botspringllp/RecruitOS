import React from 'react';
import { Cpu, HeartPulse, DollarSign, Factory, ShoppingBag, Landmark } from 'lucide-react';

export default function PublicAgencyIndustries({ agency }) {
  const primaryColor = agency?.primaryColor || '#0284c7';

  const industries = [
    { icon: Cpu, name: 'Technology & SaaS', desc: 'Engineering, Cloud Infrastructure, Product Management, AI/ML' },
    { icon: DollarSign, name: 'Financial Services & Fintech', desc: 'Investment Banking, Quantitative Finance, Risk & Compliance' },
    { icon: HeartPulse, name: 'Healthcare & Life Sciences', desc: 'Medical Devices, Biotechnology, Healthcare Administration' },
    { icon: Factory, name: 'Advanced Manufacturing', desc: 'Robotics, Supply Chain, Operations, Industrial Engineering' },
    { icon: ShoppingBag, name: 'E-Commerce & Retail Tech', desc: 'Omnichannel Logistics, Marketing Technology, Growth Analytics' },
    { icon: Landmark, name: 'Professional & Enterprise Services', desc: 'Management Consulting, Audit, Legal, Business Strategy' },
  ];

  return (
    <div>
      <section style={{ background: '#0f172a', color: '#ffffff', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12 }}>Industry Specializations</h1>
          <p style={{ fontSize: 16, color: '#94a3b8' }}>
            Domain-focused recruitment expertise across core economic sectors
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28 }}>
          {industries.map((ind, i) => {
            const Icon = ind.icon;
            return (
              <div key={i} style={{ background: '#ffffff', borderRadius: 14, padding: 32, border: '1px solid #eaecf0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                <Icon size={36} color={primaryColor} style={{ marginBottom: 16 }} />
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>{ind.name}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{ind.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
