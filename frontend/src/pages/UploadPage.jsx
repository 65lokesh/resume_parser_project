import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserData } from "../context/UserDataContext";
import { uploadResume } from "../services/resumeService";
import { clientSideMatch, clientSideATS } from "../services/resumeService";
import { fetchLiveJobs, SEED_JOBS } from "../services/seedJobs";

export default function UploadPage() {
  const navigate = useNavigate();
  const { addCandidate, addUploadToHistory, saveMatches, jobs } = useUserData();
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle"); // idle|uploading|success|error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  

  // Load pdf.js dynamically
  useEffect(() => {
    if (!window["pdfjs-dist/build/pdf"]) {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      document.head.appendChild(s);
    }
  }, []);

  const validate = (f) => {
    if (!f.name.match(/\.(pdf|docx)$/i)) { setErrorMsg("Only PDF and DOCX files are accepted."); return false; }
    if (f.size > 10 * 1024 * 1024) { setErrorMsg("File must be under 10 MB."); return false; }
    setErrorMsg(""); return true;
  };

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f && validate(f)) setFile(f);
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setStatus("uploading"); setProgress(0);
    try {
      const data = await uploadResume(file, setProgress);
      const parsed = data.parsed_data;

      // Build candidate record for local storage
      const candidate = {
        id: data.candidate_id || `c_${Date.now()}`,
        ...parsed,
        resumeFileName: file.name,
        uploadedAt: new Date().toISOString(),
      };
      addCandidate(candidate);

      // Compute matches against seed jobs
      const jobsToMatch = jobs.length > 0 ? jobs : SEED_JOBS; 
      const newMatches = SEED_JOBS.map(job => {
        const { score, matched_skills } = clientSideMatch(parsed.skills || [], job.skills_required);
        const atsScore = clientSideATS({
          skills: parsed.skills || [],
          requiredSkills: job.skills_required,
          experienceYears: parsed.experience_years || 0,
          education: parsed.education || "",
        });
        return { candidateId: candidate.id, jobId: job.id, job, score, ats_score: atsScore, matched_skills, atsScore };
      });
      saveMatches(newMatches);

      // Log to history
      addUploadToHistory({
        fileName: file.name,
        name: parsed.name,
        email: parsed.email,
        skills: parsed.skills,
        at: new Date().toISOString(),
        candidateId: candidate.id,
      });

      setResult({ candidate, matches: newMatches });
      setStatus("success");
    } catch (err) {
      setErrorMsg(err.message || "Upload failed.");
      setStatus("error");
    }
  };

  if (status === "success" && result) {
    const top = [...result.matches].sort((a, b) => b.score - a.score).slice(0, 3);
    return (
      <div className="page">
        <div className="success-wrap">
          <div className="success-check">✅</div>
          <h1 className="page-title">Resume parsed!</h1>
          <div className="parsed-grid">
            <InfoRow label="Name" val={result.candidate.name} />
            <InfoRow label="Email" val={result.candidate.email} />
            <InfoRow label="Phone" val={result.candidate.phone} />
            <InfoRow label="Experience" val={`${result.candidate.experience_years} years`} />
            <InfoRow label="Education" val={result.candidate.education} />
            <InfoRow label="Skills detected" val={(result.candidate.skills || []).join(", ") || "—"} wide />
          </div>

          <h2 className="section-title" style={{ marginTop: "2rem" }}>Top job matches</h2>
          {top.map(m => (
            <div key={m.jobId} className="mini-match">
              <div>
                <p className="mm-title">{m.job.title} — {m.job.company}</p>
                <div className="tag-row">
                  {m.matched_skills.slice(0, 4).map(s => <span key={s} className="tag tag--match">✓ {s}</span>)}
                </div>
              </div>
              <div className="mm-score">{Math.round(m.score)}%</div>
            </div>
          ))}

          <div className="success-actions">
            <button className="btn-primary" onClick={() => navigate(`/candidate/${result.candidate.id}`)}>View profile</button>
            <button className="btn-secondary" onClick={() => navigate("/recommendations")}>See all matches</button>
            <button className="btn-ghost" onClick={() => { setFile(null); setStatus("idle"); setResult(null); }}>Upload another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">Upload resume</h1>
      <p className="page-sub">PDF or DOCX · Max 10 MB · Parsed instantly</p>

      <div
        className={`drop-zone ${drag ? "dz--active" : ""} ${file ? "dz--ready" : ""}`}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        onClick={() => document.getElementById("fi").click()}
      >
        <input id="fi" type="file" accept=".pdf,.docx" style={{ display:"none" }}
          onChange={e => { const f = e.target.files[0]; if (f && validate(f)) setFile(f); }} />
        {file ? (
          <>
            <div className="dz-file-icon">📄</div>
            <p className="dz-file-name">{file.name}</p>
            <p className="dz-file-size">{(file.size / 1024).toFixed(0)} KB</p>
          </>
        ) : (
          <>
            <div className="dz-icon">☁️</div>
            <p className="dz-main">Drag & drop your resume here</p>
            <p className="dz-sub">or click to browse</p>
          </>
        )}
      </div>

      {errorMsg && <div className="error-banner">⚠️ {errorMsg}</div>}

      {status === "uploading" && (
        <div className="progress-wrap">
          <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
          <p className="progress-label">{progress}% — parsing resume…</p>
        </div>
      )}

      {file && status !== "uploading" && (
        <div className="upload-actions">
          <button className="btn-primary btn-lg" onClick={handleUpload}>Parse & upload</button>
          <button className="btn-ghost" onClick={() => { setFile(null); setErrorMsg(""); }}>Remove</button>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, val, wide }) {
  return (
    <div className={`info-row ${wide ? "info-row--wide" : ""}`}>
      <span className="ir-label">{label}</span>
      <span className="ir-val">{val || "—"}</span>
    </div>
  );
}
