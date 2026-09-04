import React from 'react';
import { BookOpen, Calendar, ArrowRight } from 'lucide-react';

export default function PublicAgencyBlog({ agency }) {
  const primaryColor = agency?.primaryColor || '#0284c7';

  const posts = [
    { title: 'Top 10 Resume Optimization Strategies for Executive Roles', date: 'August 28, 2026', excerpt: 'How to structure your ATS resume to score over 85% on modern recruiter matching engines.' },
    { title: 'Navigating Technical Engineering Interviews in 2026', date: 'August 15, 2026', excerpt: 'Key competencies, system design expectations, and hands-on coding trends leading tech companies look for.' },
    { title: 'The Future of Remote Executive Hiring', date: 'July 30, 2026', excerpt: 'Why global enterprises are shifting towards distributed leadership teams and how candidate evaluation models are evolving.' },
  ];

  return (
    <div>
      <section style={{ background: '#0f172a', color: '#ffffff', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12 }}>Career Insights & Resources</h1>
          <p style={{ fontSize: 16, color: '#94a3b8' }}>
            Expert hiring guidance, resume advice, and market intelligence from {agency?.name}
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
          {posts.map((post, i) => (
            <div key={i} style={{ background: '#ffffff', borderRadius: 14, padding: 28, border: '1px solid #eaecf0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: primaryColor, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={14} />
                <span>{post.date}</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 10, lineHeight: 1.3 }}>{post.title}</h3>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 16 }}>{post.excerpt}</p>
              <button style={{ background: 'transparent', border: 'none', color: primaryColor, fontWeight: 800, fontSize: 13, cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Read Full Article <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
