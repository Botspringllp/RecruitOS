import React, { useState } from 'react';
import { Building2, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { submitEmployerInquiry } from '../services/publicAgencyService';

export default function PublicAgencyEmployers({ agency }) {
  const [form, setForm] = useState({ companyName: '', contactName: '', email: '', phone: '', hiringNeeds: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const primaryColor = agency?.primaryColor || '#0284c7';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.companyName || !form.contactName || !form.email || !form.hiringNeeds) return;

    setIsSubmitting(true);
    await submitEmployerInquiry(agency.id, form);
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div>
      <section style={{ background: '#0f172a', color: '#ffffff', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12 }}>Employer Hiring Portal</h1>
          <p style={{ fontSize: 16, color: '#94a3b8' }}>
            Submit your hiring requirements to {agency?.name} for expedited talent acquisition.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 800, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ background: '#ffffff', borderRadius: 16, padding: 40, border: '1px solid #eaecf0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          {isSubmitted ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <CheckCircle2 size={54} color="#15803d" style={{ marginBottom: 16 }} />
              <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>Requirement Received!</h2>
              <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6, maxWidth: 500, margin: '0 auto 24px auto' }}>
                Thank you <strong>{form.contactName}</strong>. A dedicated recruiter from <strong>{agency?.name}</strong> will review your hiring needs for <strong>{form.companyName}</strong> and contact you within 24 hours.
              </p>
              <button
                onClick={() => { setIsSubmitted(false); setForm({ companyName: '', contactName: '', email: '', phone: '', hiringNeeds: '' }); }}
                style={{ padding: '10px 24px', borderRadius: 8, background: primaryColor, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                Submit Another Mandate
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>Submit Hiring Requirement</h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Corporation"
                    value={form.companyName}
                    onChange={e => setForm({ ...form, companyName: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Contact Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins (VP HR)"
                    value={form.contactName}
                    onChange={e => setForm({ ...form, contactName: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Work Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="s.jenkins@acme.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 019-2834"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Hiring Needs & Position Mandates *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the positions, required skills, headcount, and target timeline..."
                  value={form.hiringNeeds}
                  onChange={e => setForm({ ...form, hiringNeeds: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, fontFamily: 'inherit' }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 8,
                  border: 'none',
                  background: primaryColor,
                  color: '#ffffff',
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                {isSubmitting ? <Loader2 size={18} className="spin-icon" /> : <Send size={18} />}
                <span>Submit Hiring Mandate</span>
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
