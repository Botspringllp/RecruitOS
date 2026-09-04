import React from 'react';
import { Building2, Briefcase, Phone, Mail, MapPin, Linkedin, Globe, ChevronRight, Menu, X, ArrowUpRight } from 'lucide-react';

export default function PublicAgencyLayout({ agency, currentTab, onNavigateTab, children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const primaryColor = agency?.primaryColor || '#0284c7';

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'jobs', label: 'Job Openings' },
    { id: 'services', label: 'Services' },
    { id: 'employers', label: 'Employers' },
    { id: 'industries', label: 'Industries' },
    { id: 'contact', label: 'Contact' },
    { id: 'blog', label: 'Resources' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Top Banner Bar */}
      <div style={{ background: '#0f172a', color: '#94a3b8', fontSize: 13, padding: '8px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <span><Phone size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> {agency?.phone || '+1 (800) 555-RECRUIT'}</span>
            <span><Mail size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> {agency?.email || `careers@${agency?.slug || 'agency'}.com`}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span>Powered by <strong>RecruitOS Agency Platform</strong></span>
            {agency?.linkedinUrl && (
              <a href={agency.linkedinUrl} target="_blank" rel="noreferrer" style={{ color: '#ffffff', textDecoration: 'none' }}>
                <Linkedin size={14} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Agency Header */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #eaecf0', sticky: 'top', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo & Agency Name */}
          <div 
            onClick={() => onNavigateTab('home')}
            style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
          >
            {agency?.logoUrl ? (
              <img src={agency.logoUrl} alt={agency.name} style={{ height: 40, objectFit: 'contain' }} />
            ) : (
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${primaryColor}, #0f172a)`,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: 18,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                {agency?.name ? agency.name.substring(0, 2).toUpperCase() : 'AG'}
              </div>
            )}
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', tracking: '-0.02em', lineHeight: 1.1 }}>
                {agency?.name || 'Recruitment Agency'}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: primaryColor }}>
                {agency?.tagline || 'Career & Executive Search Portal'}
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hide-mobile">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigateTab(item.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: 'none',
                    background: isActive ? `${primaryColor}15` : 'transparent',
                    color: isActive ? primaryColor : '#475569',
                    fontSize: 14,
                    fontWeight: isActive ? 800 : 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {item.label}
                </button>
              );
            })}

            <button
              onClick={() => onNavigateTab('jobs')}
              style={{
                marginLeft: 12,
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                background: primaryColor,
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: `0 4px 14px ${primaryColor}40`,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Briefcase size={16} />
              <span>Explore Openings</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Page Container */}
      <main style={{ minHeight: 'calc(100vh - 350px)' }}>
        {children}
      </main>

      {/* Public Footer */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '60px 24px 30px 24px', borderTop: '1px solid #1e293b' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 40, marginBottom: 40 }}>
          {/* Col 1: About */}
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', marginBottom: 12 }}>
              {agency?.name}
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: '#94a3b8' }}>
              {agency?.aboutText ? agency.aboutText.substring(0, 160) + '...' : 'A premier talent acquisition agency connecting elite professionals with industry leaders globally.'}
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginBottom: 16 }}>Navigation</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {navItems.map(item => (
                <a 
                  key={item.id} 
                  onClick={() => onNavigateTab(item.id)}
                  style={{ color: '#cbd5e1', fontSize: 14, textDecoration: 'none', cursor: 'pointer' }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* Col 3: Services */}
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginBottom: 16 }}>Services</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
              <span>Executive Search</span>
              <span>Direct Hire Placement</span>
              <span>IT & Tech Staffing</span>
              <span>RPO Solutions</span>
            </div>
          </div>

          {/* Col 4: Contact */}
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginBottom: 16 }}>Contact Us</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <span><MapPin size={15} style={{ verticalAlign: 'middle', marginRight: 6, color: primaryColor }} /> {agency?.address}</span>
              <span><Phone size={15} style={{ verticalAlign: 'middle', marginRight: 6, color: primaryColor }} /> {agency?.phone}</span>
              <span><Mail size={15} style={{ verticalAlign: 'middle', marginRight: 6, color: primaryColor }} /> {agency?.email}</span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', borderTop: '1px solid #1e293b', paddingTop: 24, textAlign: 'center', fontSize: 13 }}>
          © {new Date().getFullYear()} {agency?.name}. All rights reserved. Powered by <strong>RecruitOS Multi-Tenant SaaS Platform</strong>.
        </div>
      </footer>
    </div>
  );
}
