import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUserData } from "../context/UserDataContext";
import { StatCard, ResumeCard, SkillChart, EmptyState } from "../components/index.jsx";
import { SEED_JOBS } from "../services/seedJobs";

export default function Dashboard() {
  const { user } = useAuth();
  const { candidates, analytics, seedJobs, uploadHistory } = useUserData();
  const navigate = useNavigate();

  // Seed jobs for this user on first load
  useEffect(() => { seedJobs(SEED_JOBS); }, [seedJobs]);

  const recent = candidates.slice(0, 4);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="page">
      {/* Welcome banner */}
      <div className="welcome-banner">
        <div>
          <p className="welcome-greeting">{greeting}, {user?.name?.split(" ")[0]} 👋</p>
          <h1 className="page-title">Your Dashboard</h1>
        </div>
        <button className="btn-primary" onClick={() => navigate("/upload")}>
          + Upload Resume
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon="📄" label="Resumes uploaded" value={analytics.totalResumes} accent="#6366f1" />
        <StatCard icon="💼" label="Jobs available" value={analytics.totalJobs || SEED_JOBS.length} accent="#0ea5e9" />
        <StatCard icon="🎯" label="Avg ATS score" value={analytics.avgAts || "—"} accent="#10b981" />
        <StatCard icon="⚡" label="Top skill" value={analytics.topSkills[0]?.skill || "—"} accent="#f59e0b" />
      </div>

      <div className="dash-grid">
        {/* Recent candidates */}
        <section className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Recent resumes</h2>
            {candidates.length > 4 && (
              <button className="link-btn" onClick={() => navigate("/candidates")}>
                View all →
              </button>
            )}
          </div>
          {recent.length === 0
            ? <EmptyState icon="📄" title="No resumes yet" body="Upload your first resume to get started." action="Upload now" onAction={() => navigate("/upload")} />
            : <div className="card-grid">{recent.map(c => <ResumeCard key={c.id} candidate={c} onClick={() => navigate(`/candidate/${c.id}`)} />)}</div>
          }
        </section>

        {/* Skill chart */}
        <section className="panel">
          <h2 className="panel-title">Skills detected</h2>
          <SkillChart skills={analytics.topSkills} />
        </section>
      </div>

      {/* Upload history */}
      {uploadHistory.length > 0 && (
        <section className="panel">
          <h2 className="panel-title">Upload history</h2>
          <div className="history-list">
            {uploadHistory.slice(0, 5).map((h, i) => (
              <div key={i} className="history-row">
                <span className="history-icon">📄</span>
                <span className="history-file">{h.fileName}</span>
                <span className="history-name">{h.name}</span>
                <span className="history-date">{new Date(h.at).toLocaleDateString()}</span>
                <span className="history-skills">{(h.skills || []).length} skills</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
