import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { loginUser } from '../services/authService';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await loginUser(email, password);
    setIsLoading(false);

    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setError(res.error || 'Authentication failed. Please check your email and password.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: 24,
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: '#ffffff',
        borderRadius: 16,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        padding: 36,
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 54,
            height: 54,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: 26,
            margin: '0 auto 14px auto',
            boxShadow: '0 10px 20px rgba(2, 132, 199, 0.3)'
          }}>
            R
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: 4 }}>
            RecruitOS SaaS
          </h1>
          <p style={{ fontSize: 13, color: '#64748b' }}>
            Multi-Tenant Enterprise Portal & Workspace Login
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '12px 14px',
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 20,
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 6 }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: 14 }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@agency.com"
                className="form-input"
                style={{ paddingLeft: 40, height: 44, width: '100%', fontSize: 14 }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: 14 }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="form-input"
                style={{ paddingLeft: 40, height: 44, width: '100%', fontSize: 14 }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ width: '100%', height: 46, justifyContent: 'center', fontSize: 14, fontWeight: 700, background: '#0284c7' }}
          >
            {isLoading ? 'Authenticating...' : 'Sign In to Workspace'}
            {!isLoading && <ArrowRight size={16} style={{ marginLeft: 8 }} />}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <ShieldCheck size={14} color="#0284c7" />
          <span>Secured by RecruitOS Enterprise SaaS Auth</span>
        </div>

      </div>
    </div>
  );
}
