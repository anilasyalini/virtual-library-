'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./login.css";

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