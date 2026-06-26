import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// ── Stat card ─────────────────────────────────────────────────────────────────
export function StatCard({ icon, label, value, accent }) {
  return (
    <div className="stat-card" style={{ "--accent": accent }}>
      <div className="sc-icon">{icon}</div>
      <div className="sc-value">{value}</div>
      <div className="sc-label">{label}</div>
    </div>
  );
}

// ── Resume card ───────────────────────────────────────────────────────────────
export function ResumeCard({ candidate, onClick }) {
  const navigate = useNavigate();
  const skills = (candidate.skills || []).slice(0, 3);
  const initials = (candidate.name || "?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const handleClick = onClick || (() => navigate(`/candidate/${candidate.id}`));
  return (
    <div className="resume-card" onClick={handleClick}>
      <div className="rc-header">
        <div className="rc-avatar">{initials}</div>
        <div>
          <p className="rc-name">{candidate.name || "—"}</p>
          <p className="rc-email">{candidate.email}</p>
        </div>
      </div>
      <p className="rc-meta">📅 {candidate.experience_years ?? 0} yrs · 📞 {candidate.phone || "N/A"}</p>
      <div className="tag-row">
        {skills.map(s => <span key={s} className="tag">{s}</span>)}
        {candidate.skills?.length > 3 && <span className="tag tag--more">+{candidate.skills.length - 3}</span>}
      </div>
    </div>
  );
}

// ── Match card — expanded with full job details + portal links ────────────────
export function MatchCard({ match }) {
  const { job, score, ats_score, matched_skills } = match;
  const [expanded, setExpanded] = useState(false);
  const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  const badge = score >= 70 ? "Strong match" : score >= 40 ? "Moderate match" : "Low match";
  const badgeClass = score >= 70 ? "badge--green" : score >= 40 ? "badge--amber" : "badge--red";

  const allSkills = job.skills_required || [];
  const matchedSet = new Set((matched_skills || []).map(s => s.toLowerCase()));
  const missingSkills = allSkills.filter(s => !matchedSet.has(s.toLowerCase()));

  return (
    <div className={`match-card ${expanded ? "match-card--open" : ""}`}>
      {/* ── Top row ── */}
      <div className="mc-top" onClick={() => setExpanded(e => !e)}>
        <div className="mc-left">
          <div className="mc-title-row">
            <p className="mc-title">{job.title}</p>
            <span className={`mc-badge ${badgeClass}`}>{badge}</span>
          </div>
          <p className="mc-company">
            🏢 {job.company} &nbsp;·&nbsp; 📍 {job.location}
          </p>
          <div className="mc-meta-row">
            {job.salary && <span className="mc-meta-pill mc-meta-pill--salary">💰 {job.salary}</span>}
            {job.type   && <span className="mc-meta-pill">{job.type}</span>}
            {job.experience && <span className="mc-meta-pill">🕐 {job.experience}</span>}
            {job.posted && <span className="mc-meta-pill mc-meta-pill--muted">🗓 {job.posted}</span>}
          </div>
        </div>
        <div className="mc-right">
          <div className="mc-score" style={{ "--c": color }}>{Math.round(score)}%</div>
          <span className="mc-expand-hint">{expanded ? "▲ Less" : "▼ Details"}</span>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="mc-bar-track">
        <div className="mc-bar-fill" style={{ width: `${score}%`, background: color }} />
      </div>

      {/* ── ATS + matched skills summary (always visible) ── */}
      <div className="mc-footer">
        <span className="mc-ats">ATS <strong>{Math.round(ats_score)}</strong>/100</span>
        <div className="tag-row">
          {(matched_skills || []).slice(0, 5).map(s => (
            <span key={s} className="tag tag--match">✓ {s}</span>
          ))}
          {matched_skills?.length > 5 && (
            <span className="tag tag--more">+{matched_skills.length - 5}</span>
          )}
        </div>
      </div>

      {/* ── Expanded details ── */}
      {expanded && (
        <div className="mc-expanded">
          <hr className="mc-divider" />

          {/* Job description */}
          <div className="mc-section">
            <p className="mc-section-title">About the role</p>
            <p className="mc-description">{job.description}</p>
          </div>

          {/* Skills breakdown */}
          <div className="mc-section">
            <p className="mc-section-title">Skills breakdown</p>
            <div className="skills-breakdown">
              <div>
                <p className="sb-sub">✅ You have ({matched_skills?.length || 0})</p>
                <div className="tag-row" style={{ marginTop: ".4rem" }}>
                  {(matched_skills || []).map(s => (
                    <span key={s} className="tag tag--match">✓ {s}</span>
                  ))}
                </div>
              </div>
              {missingSkills.length > 0 && (
                <div style={{ marginTop: ".75rem" }}>
                  <p className="sb-sub">❌ Missing ({missingSkills.length})</p>
                  <div className="tag-row" style={{ marginTop: ".4rem" }}>
                    {missingSkills.map(s => (
                      <span key={s} className="tag tag--missing">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Apply buttons */}
          <div className="mc-apply-row">
            {job.hiristLink && (
              <a
                href={job.hiristLink}
                target="_blank"
                rel="noreferrer"
                className="apply-btn apply-btn--primary"
                onClick={e => e.stopPropagation()}
              >
                🔗 Apply on LinkedIn
              </a>
            )}
            {job.portalLink && (
              <a
                href={job.portalLink}
                target="_blank"
                rel="noreferrer"
                className="apply-btn apply-btn--secondary"
                onClick={e => e.stopPropagation()}
              >
                🔗 View on LinkedIn
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Skill bar chart ───────────────────────────────────────────────────────────
export function SkillChart({ skills = [] }) {
  if (!skills.length) return <p className="empty-msg">No skill data yet — upload a resume to get started.</p>;
  const max = skills[0]?.count || 1;
  return (
    <div className="skill-chart">
      {skills.map(({ skill, count }) => (
        <div key={skill} className="schart-row">
          <span className="schart-label">{skill}</span>
          <div className="schart-track">
            <div className="schart-fill" style={{ width: `${(count / max) * 100}%` }} />
          </div>
          <span className="schart-count">{count}</span>
        </div>
      ))}
    </div>
  );
}

// ── ATS breakdown bar ─────────────────────────────────────────────────────────
export function ATSBreakdown({ breakdown }) {
  if (!breakdown) return null;
  const items = [
    { label: "Skills", value: breakdown.skills_score, weight: "40%" },
    { label: "Experience", value: breakdown.experience_score, weight: "30%" },
    { label: "Education", value: breakdown.education_score, weight: "20%" },
    { label: "Keywords", value: breakdown.keywords_score, weight: "10%" },
  ];
  return (
    <div className="ats-breakdown">
      {items.map(({ label, value, weight }) => (
        <div key={label} className="ab-row">
          <div className="ab-meta">
            <span>{label}</span>
            <span className="ab-weight">{weight}</span>
          </div>
          <div className="ab-track">
            <div className="ab-fill" style={{ width: `${value}%` }} />
          </div>
          <span className="ab-val">{Math.round(value)}</span>
        </div>
      ))}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, body, action, onAction }) {
  return (
    <div className="empty-state">
      <div className="es-icon">{icon}</div>
      <p className="es-title">{title}</p>
      <p className="es-body">{body}</p>
      {action && <button className="btn-primary" onClick={onAction}>{action}</button>}
    </div>
  );
}

export function Spinner({ text = "Loading…" }) {
  return <div className="spinner">{text}</div>;
}

export function ErrorBanner({ message }) {
  return <div className="error-banner">⚠️ {message}</div>;
}
