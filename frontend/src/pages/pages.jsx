// ── CandidatesPage ────────────────────────────────────────────────────────────
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "../context/UserDataContext";
import { ResumeCard, EmptyState } from "../components/index.jsx";

export function CandidatesPage() {
  const { candidates } = useUserData();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const filtered = candidates.filter(c =>
    [c.name, c.email, ...(c.skills || [])].some(v => v?.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="page">
      <h1 className="page-title">Candidates ({candidates.length})</h1>
      <input className="search-input" placeholder="Search by name, email, or skill…" value={q} onChange={e => setQ(e.target.value)} />
      {filtered.length === 0
        ? <EmptyState icon="👥" title="No candidates yet" body="Upload a resume to see it here." action="Upload resume" onAction={() => navigate("/upload")} />
        : <div className="card-grid card-grid--3">{filtered.map(c => <ResumeCard key={c.id} candidate={c} onClick={() => navigate(`/candidate/${c.id}`)} />)}</div>
      }
    </div>
  );
}

// ── CandidateProfile ──────────────────────────────────────────────────────────
import { useParams, Link } from "react-router-dom";
import { MatchCard } from "../components/index.jsx";

export function CandidateProfile() {
  const { id } = useParams();
  const { candidates, matches } = useUserData();
  const navigate = useNavigate();

  const candidate = candidates.find(c => c.id === id);
  const candidateMatches = matches
    .filter(m => m.candidateId === id)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  if (!candidate) return (
    <div className="page">
      <div className="error-banner">Candidate not found.</div>
      <Link to="/candidates" className="link-btn" style={{ marginTop: "1rem", display:"block" }}>← Back to candidates</Link>
    </div>
  );

  const initials = candidate.name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() || "?";
  const topAts = candidateMatches[0]?.ats_score;

  return (
    <div className="page">
      <div className="page-header-row">
        <button className="back-btn" onClick={() => navigate("/candidates")}>← Candidates</button>
        <button className="btn-primary" onClick={() => navigate("/recommendations")}>View all matches</button>
      </div>

      {/* Profile hero */}
      <div className="profile-hero">
        <div className="ph-avatar">{initials}</div>
        <div className="ph-info">
          <h1 className="ph-name">{candidate.name || "Unknown"}</h1>
          <p className="ph-email">{candidate.email}</p>
          <p className="ph-meta">📞 {candidate.phone || "N/A"} · 📅 {candidate.experience_years} yrs experience</p>
        </div>
        {topAts !== undefined && (
          <div className="ph-ats">
            <span className="ph-ats-n">{Math.round(topAts)}</span>
            <span className="ph-ats-l">Best ATS score</span>
          </div>
        )}
      </div>

      <div className="profile-grid">
        <section className="panel">
          <h2 className="panel-title">Skills ({candidate.skills?.length || 0})</h2>
          <div className="tag-row tag-row--wrap">
            {(candidate.skills || []).length > 0
              ? candidate.skills.map(s => <span key={s} className="tag tag--skill">{s}</span>)
              : <p className="empty-msg">No skills detected.</p>
            }
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title">Education</h2>
          <p className="body-text">{candidate.education || "Not specified."}</p>
        </section>

        <section className="panel panel--full">
          <h2 className="panel-title">Top job matches</h2>
          {candidateMatches.length === 0
            ? <p className="empty-msg">No matches computed yet.</p>
            : candidateMatches.map(m => <MatchCard key={`${m.candidateId}-${m.jobId}`} match={m} />)
          }
        </section>
      </div>
    </div>
  );
}

// ── RecommendationsPage ───────────────────────────────────────────────────────
export function RecommendationsPage() {
  const { candidates, matches } = useUserData();
  const navigate = useNavigate();
  const [selectedCandidateId, setSelectedCandidateId] = useState(candidates[0]?.id || "");
  const [filter, setFilter] = useState("all");

  const candidateMatches = matches
    .filter(m => m.candidateId === selectedCandidateId)
    .sort((a, b) => b.score - a.score);

  const filtered = candidateMatches.filter(m =>
    filter === "high" ? m.score >= 70
    : filter === "medium" ? m.score >= 40 && m.score < 70
    : filter === "low" ? m.score < 40
    : true
  );

  if (candidates.length === 0) return (
    <div className="page">
      <h1 className="page-title">Job matches</h1>
      <div style={{ marginTop: "2rem" }}>
        <EmptyState icon="💼" title="Upload a resume first" body="Once you upload a resume, we'll match you to the best available jobs." action="Upload resume" onAction={() => navigate("/upload")} />
      </div>
    </div>
  );

  return (
    <div className="page">
      <h1 className="page-title">Job matches</h1>

      {candidates.length > 1 && (
        <div className="field" style={{ maxWidth: 360, marginBottom: "1rem" }}>
          <label className="field-label">Select candidate</label>
          <select className="field-select" value={selectedCandidateId} onChange={e => setSelectedCandidateId(e.target.value)}>
            {candidates.map(c => <option key={c.id} value={c.id}>{c.name || c.email}</option>)}
          </select>
        </div>
      )}

      <div className="filter-bar">
        {[
          { k:"all", l:`All (${candidateMatches.length})` },
          { k:"high", l:`Strong (${candidateMatches.filter(m=>m.score>=70).length})` },
          { k:"medium", l:`Moderate (${candidateMatches.filter(m=>m.score>=40&&m.score<70).length})` },
          { k:"low", l:`Low (${candidateMatches.filter(m=>m.score<40).length})` },
        ].map(({ k, l }) => (
          <button key={k} className={`filter-btn ${filter===k ? "filter-btn--active" : ""}`} onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>

      {filtered.length === 0
        ? <EmptyState icon="🔍" title="No matches here" body="Try a different filter." />
        : <div className="match-list">{filtered.map(m => <MatchCard key={`${m.candidateId}-${m.jobId}`} match={m} />)}</div>
      }
    </div>
  );
}

// ── AnalyticsPage ─────────────────────────────────────────────────────────────
import { StatCard, SkillChart } from "../components/index.jsx";
import { SEED_JOBS } from "../services/seedJobs";

export function AnalyticsPage() {
  const { analytics, candidates, matches } = useUserData();

  const scoreDistribution = [
    { label: "Strong (≥70)", count: matches.filter(m=>m.score>=70).length, color: "#10b981" },
    { label: "Moderate (40–69)", count: matches.filter(m=>m.score>=40&&m.score<70).length, color: "#f59e0b" },
    { label: "Low (<40)", count: matches.filter(m=>m.score<40).length, color: "#ef4444" },
  ];

  return (
    <div className="page">
      <h1 className="page-title">Analytics</h1>

      <div className="stats-grid">
        <StatCard icon="📄" label="Resumes uploaded" value={analytics.totalResumes} accent="#6366f1" />
        <StatCard icon="💼" label="Jobs tracked" value={SEED_JOBS.length} accent="#0ea5e9" />
        <StatCard icon="🎯" label="Avg ATS score" value={analytics.avgAts || "—"} accent="#10b981" />
        <StatCard icon="🔗" label="Matches computed" value={matches.length} accent="#a855f7" />
      </div>

      <div className="dash-grid">
        <section className="panel">
          <h2 className="panel-title">Top skills across candidates</h2>
          <SkillChart skills={analytics.topSkills} />
        </section>

        <section className="panel">
          <h2 className="panel-title">Match score distribution</h2>
          {matches.length === 0
            ? <p className="empty-msg">No match data yet.</p>
            : scoreDistribution.map(({ label, count, color }) => (
                <div key={label} className="dist-row">
                  <span className="dist-dot" style={{ background: color }} />
                  <span className="dist-label">{label}</span>
                  <div className="dist-track">
                    <div className="dist-fill" style={{ width: `${matches.length ? count/matches.length*100 : 0}%`, background: color }} />
                  </div>
                  <span className="dist-count">{count}</span>
                </div>
              ))
          }
        </section>
      </div>

      {candidates.length > 0 && (
        <section className="panel">
          <h2 className="panel-title">Candidate overview</h2>
          <table className="cand-table">
            <thead><tr><th>Name</th><th>Email</th><th>Skills</th><th>Experience</th><th>Best match</th></tr></thead>
            <tbody>
              {candidates.map(c => {
                const best = matches.filter(m=>m.candidateId===c.id).sort((a,b)=>b.score-a.score)[0];
                return (
                  <tr key={c.id}>
                    <td>{c.name || "—"}</td>
                    <td className="td-muted">{c.email}</td>
                    <td><span className="tag">{(c.skills||[]).length} skills</span></td>
                    <td>{c.experience_years} yrs</td>
                    <td>{best ? <span style={{ color: best.score>=70?"#10b981":best.score>=40?"#f59e0b":"#ef4444", fontWeight:600 }}>{Math.round(best.score)}%</span> : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
