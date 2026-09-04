import React, { useState } from 'react';
import { MapPin, Phone, Mail, Linkedin, Globe, Send, CheckCircle2 } from 'lucide-react';

export default function PublicAgencyContact({ agency }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const primaryColor = agency?.primaryColor || '#0284c7';

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      <section style={{ background: '#0f172a', color: '#ffffff', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12 }}>Contact {agency?.name}</h1>
          <p style={{ fontSize: 16, color: '#94a3b8' }}>
            Get in touch with our talent acquisition advisory team
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40 }}>
          {/* Contact Information */}
          <div style={{ background: '#ffffff', borderRadius: 16, padding: 36, border: '1px solid #eaecf0' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>Agency Headquarters</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontSize: 15, color: '#475569' }}>
              <div style={{ display: 'flex', gap: 14 }}>
                <MapPin size={22} color={primaryColor} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ display: 'block', color: '#0f172a' }}>Office Address:</strong>
                  {agency?.address || 'Enterprise Business Tower, Suite 400, Innovation Way'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14 }}>
                <Phone size={22} color={primaryColor} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ display: 'block', color: '#0f172a' }}>Telephone:</strong>
                  {agency?.phone || '+1 (800) 555-RECRUIT'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14 }}>
                <Mail size={22} color={primaryColor} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={{ display: 'block', color: '#0f172a' }}>Direct Email:</strong>
                  {agency?.email || `contact@${agency?.slug || 'agency'}.com`}
                </div>
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <div style={{ background: '#ffffff', borderRadius: 16, padding: 36, border: '1px solid #eaecf0' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <CheckCircle2 size={48} color="#15803d" style={{ marginBottom: 12 }} />
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Message Sent!</h3>
                <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>We will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>Send an Inquiry</h2>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 4 }}>Your Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 4 }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 4 }}>Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
                  />
                </div>

                <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: 8, background: primaryColor, color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
