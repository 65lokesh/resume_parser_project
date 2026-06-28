import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "./LandingPage.css";

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(null); // null | "login" | "register"
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

  if (mode) {
    return (
      <div className="lp-modal-overlay" onClick={() => setMode(null)}>
        <div className="lp-modal" onClick={e => e.stopPropagation()}>
          <button className="lp-modal-close" onClick={() => setMode(null)}>✕</button>
          <div className="lp-modal-brand">
            <span className="lp-modal-logo">⚡</span>
            <span className="lp-modal-logo-name">ResumeAI</span>
          </div>
          <div className="lp-modal-tabs">
            <button
              className={`lp-modal-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => { setMode("login"); setError(""); }}
            >Sign in</button>
            <button
              className={`lp-modal-tab ${mode === "register" ? "active" : ""}`}
              onClick={() => { setMode("register"); setError(""); }}
            >Create account</button>
          </div>
          <form className="lp-modal-form" onSubmit={handleSubmit}>
            {mode === "register" && (
              <div className="lp-field">
                <label>Full name</label>
                <input type="text" placeholder="Lokesh Patil" value={form.name} onChange={set("name")} required autoFocus />
              </div>
            )}
            <div className="lp-field">
              <label>Email address</label>
              <input type="email" placeholder="you@gmail.com" value={form.email} onChange={set("email")} required autoFocus={mode === "login"} />
            </div>
            <div className="lp-field">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={form.password} onChange={set("password")} required />
            </div>
            {mode === "register" && (
              <div className="lp-field">
                <label>Confirm password</label>
                <input type="password" placeholder="••••••••" value={form.confirm} onChange={set("confirm")} required />
              </div>
            )}
            {error && <div className="lp-error">{error}</div>}
            <button className="lp-modal-submit" type="submit" disabled={loading}>
              {loading ? "Please wait…" : mode === "login" ? "Sign in →" : "Get started free →"}
            </button>
          </form>
          <p className="lp-modal-switch">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button type="button" className="lp-link" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
              {mode === "login" ? "Create one free" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lp-root">
      {/* ── Navbar ── */}
      <nav className="lp-nav">
        <div className="lp-nav-brand">
          <span className="lp-nav-logo">⚡</span>
          <span className="lp-nav-name">ResumeAI</span>
        </div>
        <div className="lp-nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#stats">Results</a>
        </div>
        <div className="lp-nav-actions">
          <button className="lp-btn-ghost" onClick={() => setMode("login")}>SIGN IN</button>
          <button className="lp-btn-dark" onClick={() => setMode("register")}>JOIN NOW</button>
        </div>
      </nav>

      {/* ── Ticker ── */}
      <div className="lp-ticker">
        <div className="lp-ticker-track">
          {["Python Developer · Google · 2 min ago","Data Analyst · Microsoft · 5 min ago","ML Engineer · OpenAI · 8 min ago","React Developer · Meta · 12 min ago","DevOps Engineer · Amazon · 15 min ago","NLP Engineer · Anthropic · 18 min ago","Full Stack Dev · Flipkart · 22 min ago","Data Engineer · Zomato · 25 min ago"].map((item, i) => (
            <span key={i} className="lp-ticker-item">📋 {item}</span>
          ))}
          {/* Duplicate for seamless loop */}
          {["Python Developer · Google · 2 min ago","Data Analyst · Microsoft · 5 min ago","ML Engineer · OpenAI · 8 min ago","React Developer · Meta · 12 min ago","DevOps Engineer · Amazon · 15 min ago","NLP Engineer · Anthropic · 18 min ago","Full Stack Dev · Flipkart · 22 min ago","Data Engineer · Zomato · 25 min ago"].map((item, i) => (
            <span key={`d${i}`} className="lp-ticker-item">📋 {item}</span>
          ))}
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="lp-hero">
        <div className="lp-hero-left">
          <div className="lp-hero-badges">
            <span className="lp-badge">🏆 #1 AI Resume Platform</span>
            <span className="lp-badge">⭐ 4.8/5.0 · 10K+ users</span>
          </div>
          <h1 className="lp-hero-title">
            No More Solo<br />Job Hunting.<br />
            <span className="lp-hero-accent">Do it with AI.</span>
          </h1>
          <p className="lp-hero-sub">
            Upload your resume once. Get AI-matched to the best jobs,
            instant ATS scores, skill gap analysis, and a personal
            analytics dashboard — in less than 1 minute.
          </p>
          <div className="lp-hero-actions">
            <button className="lp-btn-primary" onClick={() => setMode("register")}>
              TRY FOR FREE →
            </button>
            <button className="lp-btn-outline" onClick={() => setMode("login")}>
              Sign in
            </button>
          </div>
          <div className="lp-hero-trust">
            <div className="lp-trust-avatars">
              {["L","R","A","S","M"].map(l => <span key={l} className="lp-trust-av">{l}</span>)}
            </div>
            <p>Joined by <strong>10,000+</strong> job seekers this month</p>
          </div>
        </div>

        {/* ── Demo video / animated preview ── */}
        <div className="lp-hero-right">
          <div className="lp-demo-window">
            <div className="lp-demo-titlebar">
              <span className="lp-dot lp-dot--red" />
              <span className="lp-dot lp-dot--yellow" />
              <span className="lp-dot lp-dot--green" />
              <span className="lp-demo-url">resumeai.app/dashboard</span>
            </div>
            <div className="lp-demo-content">
              {/* Animated mock dashboard */}
              <div className="lp-mock-header">
                <div className="lp-mock-greeting">Good morning, Lokesh 👋</div>
                <div className="lp-mock-stats">
                  <div className="lp-mock-stat"><span className="lp-mock-n">3</span><span className="lp-mock-l">Resumes</span></div>
                  <div className="lp-mock-stat"><span className="lp-mock-n">10</span><span className="lp-mock-l">Jobs</span></div>
                  <div className="lp-mock-stat"><span className="lp-mock-n">87</span><span className="lp-mock-l">ATS Score</span></div>
                </div>
              </div>
              <div className="lp-mock-jobs">
                {[
                  { title: "ML Engineer", company: "Google", score: 95, color: "#10b981" },
                  { title: "Data Analyst", company: "Microsoft", score: 88, color: "#10b981" },
                  { title: "Python Dev", company: "Amazon", score: 72, color: "#f59e0b" },
                ].map((j, i) => (
                  <div key={i} className="lp-mock-job" style={{ animationDelay: `${i * 0.3}s` }}>
                    <div className="lp-mock-job-info">
                      <p className="lp-mock-job-title">{j.title}</p>
                      <p className="lp-mock-job-co">{j.company}</p>
                    </div>
                    <div className="lp-mock-job-score" style={{ color: j.color, borderColor: j.color }}>
                      {j.score}%
                    </div>
                  </div>
                ))}
              </div>
              <div className="lp-mock-upload">
                <div className="lp-mock-upload-icon">📄</div>
                <div className="lp-mock-upload-text">
                  <p>Resume parsed in <strong>2.3s</strong></p>
                  <div className="lp-mock-progress"><div className="lp-mock-progress-fill" /></div>
                </div>
              </div>
            </div>
          </div>
          {/* Floating cards */}
          <div className="lp-float-card lp-float-card--tl">
            <span>🎯</span> ATS Score: <strong>92/100</strong>
          </div>
          <div className="lp-float-card lp-float-card--br">
            <span>✅</span> 6 skills matched
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="lp-stats" id="stats">
        <div className="lp-stat-item"><h2>10,000+</h2><p>Resumes parsed</p></div>
        <div className="lp-stat-item"><h2>94%</h2><p>Match accuracy</p></div>
        <div className="lp-stat-item"><h2>3x</h2><p>Faster job search</p></div>
        <div className="lp-stat-item"><h2>80%</h2><p>Time saved</p></div>
      </section>

      {/* ── Features ── */}
      <section className="lp-features" id="features">
        <h2 className="lp-section-title">REAL RESULTS, NOT JUST PROMISES</h2>
        <div className="lp-features-grid">
          {[
            { icon: "🤖", title: "AI Resume Parsing", desc: "Upload PDF or DOCX. Extract name, skills, experience, education instantly." },
            { icon: "🎯", title: "ATS Scoring", desc: "Know your score before applying. Skills 40%, Experience 30%, Education 20%." },
            { icon: "💼", title: "Job Matching", desc: "Match against 10,000+ real jobs. See exactly why you're a fit." },
            { icon: "📊", title: "Analytics Dashboard", desc: "Track your skills, scores, and progress over time." },
            { icon: "🔗", title: "Direct Apply Links", desc: "One click to apply on LinkedIn, Indeed, and more." },
            { icon: "🔒", title: "Your Data is Private", desc: "Each account is fully isolated. Only you see your data." },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="lp-feature-card">
              <div className="lp-feature-icon">{icon}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="lp-how" id="how">
        <h2 className="lp-section-title">HOW IT WORKS</h2>
        <div className="lp-steps">
          {[
            { n: "01", title: "Upload Resume", desc: "Drop your PDF or DOCX. Parsed in seconds." },
            { n: "02", title: "Get ATS Score", desc: "See your weighted score across skills, experience, education." },
            { n: "03", title: "View Matches", desc: "Browse ranked jobs matched to your exact skill set." },
            { n: "04", title: "Apply Directly", desc: "Click to apply on LinkedIn or job portals instantly." },
          ].map(({ n, title, desc }) => (
            <div key={n} className="lp-step">
              <div className="lp-step-num">{n}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lp-cta">
        <h2>ACCESS THE LARGEST JOB HUB!</h2>
        <div className="lp-cta-stats">
          <div><strong>400,000+</strong><span>Jobs added today</span></div>
          <div><strong>8,000,000+</strong><span>Total jobs tracked</span></div>
        </div>
        <button className="lp-btn-primary lp-btn-xl" onClick={() => setMode("register")}>
          Find My Matches →
        </button>
        <p className="lp-cta-sub">Free to use · No credit card required</p>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-brand">
          <span>⚡</span> ResumeAI
        </div>
        <p>© 2026 ResumeAI · Built for job seekers, by developers.</p>
      </footer>
    </div>
  );
}