/**
 * pages/AuthPage.jsx
 * Login / Register with animated left panel.
 * Inspired by Hirist.tech's clean split-screen layout.
 */

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (mode === "register") {
      if (!form.name.trim()) return setError("Enter your full name.");
      if (form.password !== form.confirm) return setError("Passwords don't match.");
      if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    }
    setLoading(true);
    try {
      if (mode === "login") login({ email: form.email, password: form.password });
      else register({ name: form.name, email: form.email, password: form.password });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* ── Left panel ── */}
      <div className="auth-left">
        <div className="auth-brand">
          <span className="auth-logo">⚡</span>
          <span className="auth-logo-name">ResumeAI</span>
        </div>
        <div className="auth-hero">
          <h1 className="auth-headline">
            Land your next<br />tech role, faster.
          </h1>
          <p className="auth-sub">
            Upload your resume once. Get AI-matched to the best jobs,
            instant ATS scores, and a personal analytics dashboard.
          </p>
          <ul className="auth-perks">
            {["AI resume parsing in seconds","Match score for every job","ATS scoring with actionable insights","Your data, your account, always private"].map(p => (
              <li key={p}><span className="perk-dot" />  {p}</li>
            ))}
          </ul>
        </div>
        <div className="auth-stats">
          <div className="stat"><span className="stat-n">10K+</span><span className="stat-l">Resumes parsed</span></div>
          <div className="stat"><span className="stat-n">94%</span><span className="stat-l">Match accuracy</span></div>
          <div className="stat"><span className="stat-n">3x</span><span className="stat-l">Faster job search</span></div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === "login" ? "auth-tab--active" : ""}`}
              onClick={() => { setMode("login"); setError(""); }}
            >Sign in</button>
            <button
              className={`auth-tab ${mode === "register" ? "auth-tab--active" : ""}`}
              onClick={() => { setMode("register"); setError(""); }}
            >Create account</button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "register" && (
              <div className="field">
                <label className="field-label">Full name</label>
                <input
                  className="field-input"
                  type="text"
                  placeholder="Lokesh Patil"
                  value={form.name}
                  onChange={set("name")}
                  required
                  autoFocus
                />
              </div>
            )}
            <div className="field">
              <label className="field-label">Email address</label>
              <input
                className="field-input"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={set("email")}
                required
                autoFocus={mode === "login"}
              />
            </div>
            <div className="field">
              <label className="field-label">Password</label>
              <input
                className="field-input"
                type="password"
                placeholder={mode === "register" ? "At least 6 characters" : "••••••••"}
                value={form.password}
                onChange={set("password")}
                required
              />
            </div>
            {mode === "register" && (
              <div className="field">
                <label className="field-label">Confirm password</label>
                <input
                  className="field-input"
                  type="password"
                  placeholder="Repeat your password"
                  value={form.confirm}
                  onChange={set("confirm")}
                  required
                />
              </div>
            )}

            {error && <div className="auth-error">{error}</div>}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </button>

            {mode === "login" && (
              <p className="auth-switch">
                Don't have an account?{" "}
                <button type="button" className="link-btn" onClick={() => { setMode("register"); setError(""); }}>
                  Create one free
                </button>
              </p>
            )}
          </form>

          {/* Demo credentials hint */}
          {mode === "login" && (
            <div className="demo-hint">
              <strong>Demo:</strong> Register a new account to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
