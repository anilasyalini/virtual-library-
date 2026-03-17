'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './signup.css';

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');

      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <>
      <div className="signup-root">

        {/* ── Left panel ── */}
        <div className="signup-left">
          <div className="panel-noise" />
          <div className="orb orb-1" />
          <div className="orb orb-2" />

          <div className="panel-brand">
            <div className="brand-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <span className="brand-name">UniLib</span>
          </div>

          <div className="panel-body">
            <h1>Join your<br /><em>reading community</em></h1>
            <p>Set up your account in seconds and start building your personal library today.</p>
          </div>

          <div className="perks">
            <div className="perk">
              <div className="perk-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
              <div className="perk-text">
                <strong>Track your reading</strong>
                <span>Log books, set goals, and see your progress over time.</span>
              </div>
            </div>
            <div className="perk">
              <div className="perk-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <div className="perk-text">
                <strong>Discover new titles</strong>
                <span>Get personalised recommendations based on your taste.</span>
              </div>
            </div>
            <div className="perk">
              <div className="perk-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className="perk-text">
                <strong>Share with others</strong>
                <span>Build reading lists and share them with friends or students.</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="signup-right">

          <div className="form-header">
            <p className="form-eyebrow">Free forever</p>
            <h2>Create your account</h2>
            <p>Already have one? <Link href="/login" style={{ color: '#6366f1', fontWeight: 500, textDecoration: 'none' }}>Sign in instead</Link></p>
          </div>

          <form onSubmit={handleSignup}>

            <div className="field">
              <label className="field-label">Full Name</label>
              <div className="input-wrap">
                <input
                  className="field-input"
                  placeholder="Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label className="field-label">Email Address</label>
              <div className="input-wrap">
                <input
                  type="email"
                  className="field-input"
                  placeholder="jane@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label className="field-label">Password</label>
              <div className="input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="field-input has-icon"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="field">
              <label className="field-label">I am a…</label>
              <div className="role-grid">
                {[
                  { value: 'STUDENT', label: 'Student', icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                    </svg>
                  )},
                  { value: 'FACULTY', label: 'Faculty', icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                  )},
                ].map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    className={`role-card ${role === value ? 'active' : ''}`}
                    onClick={() => setRole(value)}
                  >
                    <div className="role-radio">
                      <div className="role-dot" />
                    </div>
                    <span style={{ color: role === value ? '#818cf8' : '#555', marginRight: 4 }}>{icon}</span>
                    <span className="role-label">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="error-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <span className="btn-loader">
                  <span className="spinner" />
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>

          </form>

          <p className="form-footer">
            By signing up you agree to our{' '}
            <Link href="/terms" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>Privacy Policy</Link>
          </p>

        </div>
      </div>
    </>
  );
}