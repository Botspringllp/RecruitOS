import React, { useState } from 'react';
import { Globe, Palette, Save, CheckCircle2, ExternalLink, Loader2, Image, Phone, Mail, MapPin, Eye, Building2 } from 'lucide-react';
import { updateAgencyBranding } from '../services/agencyService';

export default function AgencyWebsiteSettings({ agency, onUpdateSuccess }) {
  const agencySlug = agency?.slug || (agency?.name ? agency.name.toLowerCase().trim().replace(/\s+/g, '-') : 'agency');

  const [form, setForm] = useState({
    name: agency?.name || 'Agency Workspace',
    logoUrl: agency?.logoUrl || '',
    primaryColor: agency?.primaryColor || '#0284c7',
    secondaryColor: agency?.secondaryColor || '#0f172a',
    tagline: agency?.tagline || `Leading Recruitment & Executive Search Solutions`,
    aboutText: agency?.aboutText || `${agency?.name || 'Our Agency'} is a premier talent acquisition and executive search agency dedicated to connecting top-tier professionals with market-leading enterprises.`,
    missionText: agency?.missionText || `To empower global organizations by discovering and delivering top 1% talent with speed, precision, and integrity.`,
    visionText: agency?.visionText || `To be the most trusted strategic recruitment partner for growth enterprises across technology, engineering, and enterprise services.`,
    phone: agency?.phone || '+1 (800) 555-RECRUIT',
    email: agency?.email || agency?.ownerEmail || `contact@${agencySlug}.com`,
    address: agency?.address || 'Enterprise Business Tower, Suite 400, Innovation Way',
    linkedinUrl: agency?.linkedinUrl || 'https://linkedin.com'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const portalUrl = `${window.location.origin}/#/agency/${agencySlug}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    await updateAgencyBranding(agency?.id || 'agency_1', form);

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);

    if (onUpdateSuccess) onUpdateSuccess();
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 0' }}>
      {/* Top Title & Public Link Preview Card */}
      <div className="card" style={{ padding: 24, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Globe size={20} color="#0284c7" />
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>Career Portal Website Customization</h2>
          </div>
          <p style={{ fontSize: 13, color: '#64748b' }}>
            Customize your dedicated public career portal (<code>/agency/{agencySlug}</code>) for candidate applications and employer inquiries.
          </p>
        </div>

        <a
          href={`/#/agency/${agencySlug}`}
          target="_blank"
          rel="noreferrer"
          style={{
            padding: '10px 18px',
            borderRadius: 8,
            background: '#0284c7',
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 800,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
          }}
        >
          <Globe size={16} />
          <span>View Live Public Website</span>
          <ExternalLink size={14} />
        </a>
      </div>

      {saveSuccess && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', padding: 14, borderRadius: 10, fontSize: 14, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={18} />
          <span>Website customization updated successfully! All changes are live on your public career portal.</span>
        </div>
      )}

      {/* Real-Time Live Preview Banner */}
      <div className="card" style={{ padding: 24, marginBottom: 24, background: form.secondaryColor || '#0f172a', color: '#ffffff', borderRadius: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: form.primaryColor, letterSpacing: '1px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Eye size={14} />
          <span>Real-Time Website Live Preview</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          {form.logoUrl ? (
            <img src={form.logoUrl} alt="Agency Logo" style={{ height: 36, objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: 8, background: form.primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18 }}>
              {form.name ? form.name.charAt(0) : 'A'}
            </div>
          )}
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>{form.name}</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>/agency/{agencySlug}</div>
          </div>
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 800, marginTop: 12, marginBottom: 6 }}>{form.tagline}</h3>
        <p style={{ fontSize: 13, color: '#cbd5e1', maxWidth: 640, lineHeight: 1.5 }}>
          {form.aboutText || 'Your company overview description will be displayed here.'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Branding & Theme Card */}
        <div className="card" style={{ padding: 28, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Palette size={18} color="#0284c7" />
            <span>Website Branding & Visual Theme</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Agency Display Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Agency Logo Image URL</label>
              <input
                type="url"
                placeholder="https://example.com/logo.png"
                value={form.logoUrl}
                onChange={e => setForm({ ...form, logoUrl: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Primary Brand Color (Accent)</label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={e => setForm({ ...form, primaryColor: e.target.value })}
                  style={{ width: 44, height: 42, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={form.primaryColor}
                  onChange={e => setForm({ ...form, primaryColor: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, fontWeight: 700 }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Header & Footer Dark Theme (Hex)</label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="color"
                  value={form.secondaryColor}
                  onChange={e => setForm({ ...form, secondaryColor: e.target.value })}
                  style={{ width: 44, height: 42, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={form.secondaryColor}
                  onChange={e => setForm({ ...form, secondaryColor: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, fontWeight: 700 }}
                />
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Hero Header Tagline</label>
            <input
              type="text"
              placeholder="e.g. Connecting Top Executive Talent with Growth Enterprises"
              value={form.tagline}
              onChange={e => setForm({ ...form, tagline: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
            />
          </div>
        </div>

        {/* Website Content & Story */}
        <div className="card" style={{ padding: 28, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={18} color="#0284c7" />
            <span>Website Copy & About Information</span>
          </h3>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>About Us Overview Text</label>
            <textarea
              rows={3}
              placeholder="Describe your recruitment agency's background, specialization, and value proposition..."
              value={form.aboutText}
              onChange={e => setForm({ ...form, aboutText: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Company Mission Statement</label>
              <textarea
                rows={3}
                placeholder="Our mission is to..."
                value={form.missionText}
                onChange={e => setForm({ ...form, missionText: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, fontFamily: 'inherit' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Company Vision Statement</label>
              <textarea
                rows={3}
                placeholder="Our vision is to..."
                value={form.visionText}
                onChange={e => setForm({ ...form, visionText: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, fontFamily: 'inherit' }}
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card" style={{ padding: 28, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Phone size={18} color="#0284c7" />
            <span>Public Contact & Social Details</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Public Phone Number</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Public Contact Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Office Address</label>
              <input
                type="text"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>LinkedIn Page URL</label>
              <input
                type="url"
                value={form.linkedinUrl}
                onChange={e => setForm({ ...form, linkedinUrl: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={isSaving}
          className="btn btn-primary"
          style={{
            padding: '12px 28px',
            fontSize: 15,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#0284c7',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)'
          }}
        >
          {isSaving ? <Loader2 size={18} className="spin-icon" /> : <Save size={18} />}
          <span>Save & Publish Website Customization</span>
        </button>
      </form>
    </div>
  );
}
