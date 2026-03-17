'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/library");
    } catch (err) {
      setError("Server error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #0f0f0f;
          position: relative;
          overflow: hidden;
        }

        /* Left decorative panel */
        .login-panel-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          position: relative;
          background: linear-gradient(135deg, #111 0%, #1a1a1a 100%);
          border-right: 1px solid #222;
        }

        .panel-noise {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        .panel-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .panel-orb-1 {
          width: 320px; height: 320px;
          background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%);
          top: 10%; left: -60px;
        }
        .panel-orb-2 {
          width: 240px; height: 240px;
          background: radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%);
          bottom: 20%; right: 20px;
        }

        .panel-brand {
          position: relative;
          z-index: 1;
        }
        .panel-brand-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .panel-brand-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #6366f1, #a78bfa);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .panel-brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          color: #fff;
          letter-spacing: 0.02em;
        }

        .panel-headline {
          position: relative;
          z-index: 1;
        }
        .panel-headline h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 3.5vw, 52px);
          color: #fff;
          line-height: 1.15;
          font-weight: 400;
          margin-bottom: 16px;
          letter-spacing: -0.01em;
        }
        .panel-headline h1 em {
          font-style: italic;
          color: #a78bfa;
        }
        .panel-headline p {
          font-size: 15px;
          color: #666;
          line-height: 1.65;
          font-weight: 300;
          max-width: 320px;
        }

        .panel-testimonial {
          position: relative;
          z-index: 1;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 24px 28px;
          backdrop-filter: blur(10px);
        }
        .panel-testimonial blockquote {
          font-size: 14px;
          color: #aaa;
          line-height: 1.7;
          font-weight: 300;
          margin-bottom: 16px;
        }
        .panel-testimonial-author {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .author-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #ec4899);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; color: #fff; font-weight: 500;
        }
        .author-info p { font-size: 13px; color: #ddd; font-weight: 500; }
        .author-info span { font-size: 12px; color: #555; }

        /* Right form panel */
        .login-panel-right {
          width: min(480px, 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px;
          background: #0f0f0f;
          position: relative;
        }

        .form-header {
          margin-bottom: 36px;
        }
        .form-header-eyebrow {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #6366f1;
          margin-bottom: 10px;
        }
        .form-header h2 {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          color: #fff;
          font-weight: 400;
          letter-spacing: -0.01em;
          margin-bottom: 8px;
        }
        .form-header p {
          font-size: 14px;
          color: #555;
          font-weight: 300;
        }

        .form-group {
          margin-bottom: 18px;
          position: relative;
        }
        .form-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #555;
          margin-bottom: 8px;
        }
        .form-input-wrapper {
          position: relative;
        }
        .form-input {
          width: 100%;
          padding: 13px 16px;
          background: #181818;
          border: 1px solid #2a2a2a;
          border-radius: 10px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 300;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          outline: none;
          letter-spacing: 0.01em;
        }
        .form-input::placeholder { color: #3a3a3a; }
        .form-input:focus {
          border-color: #6366f1;
          background: #1a1a1a;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .form-input.has-icon { padding-right: 44px; }

        .input-icon-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #444;
          display: flex;
          align-items: center;
          padding: 4px;
          transition: color 0.2s;
        }
        .input-icon-btn:hover { color: #888; }

        .form-row-meta {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 24px;
        }
        .form-forgot {
          font-size: 12px;
          color: #555;
          text-decoration: none;
          transition: color 0.2s;
          letter-spacing: 0.02em;
        }
        .form-forgot:hover { color: #a78bfa; }

        .error-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 8px;
          padding: 11px 14px;
          margin-bottom: 20px;
          font-size: 13px;
          color: #f87171;
          animation: shake 0.35s ease;
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
        }

        .btn-submit {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          position: relative;
          overflow: hidden;
        }
        .btn-submit:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(99,102,241,0.35);
        }
        .btn-submit:active:not(:disabled) { transform: translateY(0); }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-loader {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 24px 0;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: #1e1e1e;
        }
        .divider-text { font-size: 12px; color: #3a3a3a; letter-spacing: 0.06em; }

        .btn-oauth {
          width: 100%;
          padding: 12px;
          background: #181818;
          border: 1px solid #2a2a2a;
          border-radius: 10px;
          color: #888;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 400;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
        }
        .btn-oauth:hover {
          border-color: #3a3a3a;
          color: #ccc;
          background: #1c1c1c;
        }

        .form-footer {
          margin-top: 28px;
          text-align: center;
          font-size: 13px;
          color: #3a3a3a;
          font-weight: 300;
        }
        .form-footer a {
          color: #6366f1;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        .form-footer a:hover { color: #a78bfa; }

        @media (max-width: 768px) {
          .login-panel-left { display: none; }
          .login-panel-right { width: 100%; padding: 32px 24px; }
        }
      `}</style>

      <div className="login-root">

        {/* Left panel */}
        <div className="login-panel-left">
          <div className="panel-noise" />
          <div className="panel-orb panel-orb-1" />
          <div className="panel-orb panel-orb-2" />

          <div className="panel-brand">
            <div className="panel-brand-logo">
              <div className="panel-brand-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <span className="panel-brand-name">UniLib</span>
            </div>
          </div>

          <div className="panel-headline">
            <h1>Your personal<br /><em>reading universe</em></h1>
            <p>Organize, discover, and track every book you've ever loved — all in one beautiful place.</p>
          </div>

          <div className="panel-testimonial">
            <blockquote>"This completely changed how I manage my reading list. It's elegant, fast, and genuinely delightful to use."</blockquote>
            <div className="panel-testimonial-author">
              <div className="author-avatar">SC</div>
              <div className="author-info">
                <p>Sarah Chen</p>
                <span>Avid reader · 312 books logged</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="login-panel-right">

          <div className="form-header">
            <p className="form-header-eyebrow">Welcome back</p>
            <h2>Sign in to your account</h2>
            <p>Pick up right where you left off.</p>
          </div>

          <form onSubmit={handleLogin}>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <div className="form-input-wrapper">
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="form-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input has-icon"
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
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

            <div className="form-row-meta">
              <Link href="/forgot-password" className="form-forgot">Forgot password?</Link>
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
                  Signing in…
                </span>
              ) : "Sign in"}
            </button>

          </form>

        <p className="form-footer">
  Don't have an account?{" "}
  <Link href="/signup" className="signup-link">
    Create one — it's free
  </Link>
</p>
        </div>
      </div>
    </>
  );
}