/**
 * context/UserDataContext.js
 *
 * Per-user persistent storage for resumes, job matches, and activity.
 * Every entry is prefixed with the userId so users never see each other's data.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

const UserDataContext = createContext(null);

function userKey(userId, key) {
  return `resumeai_${userId}_${key}`;
}

export function UserDataProvider({ children }) {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [matches, setMatches] = useState([]);
  const [uploadHistory, setUploadHistory] = useState([]);

  // ── Load user data when user changes ─────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setCandidates([]);
      setJobs([]);
      setMatches([]);
      setUploadHistory([]);
      return;
    }
    const load = (key, setter) => {
      try {
        const raw = localStorage.getItem(userKey(user.id, key));
        setter(raw ? JSON.parse(raw) : []);
      } catch { setter([]); }
    };
    load("candidates", setCandidates);
    load("jobs", setJobs);
    load("matches", setMatches);
    load("uploadHistory", setUploadHistory);
  }, [user?.id]);

  const save = useCallback((key, value) => {
    if (!user) return;
    localStorage.setItem(userKey(user.id, key), JSON.stringify(value));
  }, [user]);

  // ── Exposed actions ──────────────────────────────────────────────────────────
  const addCandidate = useCallback((candidate) => {
    setCandidates(prev => {
      // Upsert by email
      const existing = prev.findIndex(c => c.email === candidate.email);
      const next = existing >= 0
        ? prev.map((c, i) => i === existing ? { ...c, ...candidate } : c)
        : [...prev, candidate];
      save("candidates", next);
      return next;
    });
  }, [save]);

  const addUploadToHistory = useCallback((entry) => {
    setUploadHistory(prev => {
      const next = [entry, ...prev].slice(0, 20); // keep last 20
      save("uploadHistory", next);
      return next;
    });
  }, [save]);

  const seedJobs = useCallback((jobList) => {
    setJobs(prev => {
      if (prev.length >= jobList.length) return prev; // already seeded
      save("jobs", jobList);
      return jobList;
    });
  }, [save]);

  const saveMatches = useCallback((newMatches) => {
    setMatches(prev => {
      // Merge by candidateId+jobId
      const map = new Map(prev.map(m => [`${m.candidateId}-${m.jobId}`, m]));
      newMatches.forEach(m => map.set(`${m.candidateId}-${m.jobId}`, m));
      const next = Array.from(map.values());
      save("matches", next);
      return next;
    });
  }, [save]);

  const analytics = React.useMemo(() => {
    const totalResumes = candidates.length;
    const totalJobs = jobs.length;
    const avgAts = matches.length
      ? Math.round(matches.reduce((s, m) => s + m.atsScore, 0) / matches.length)
      : 0;
    const skillCounter = {};
    candidates.forEach(c => (c.skills || []).forEach(s => {
      skillCounter[s] = (skillCounter[s] || 0) + 1;
    }));
    const topSkills = Object.entries(skillCounter)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));
    return { totalResumes, totalJobs, avgAts, topSkills };
  }, [candidates, jobs, matches]);

  return (
    <UserDataContext.Provider value={{
      candidates, jobs, matches, uploadHistory,
      addCandidate, addUploadToHistory, seedJobs, saveMatches, analytics,
    }}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error("useUserData must be inside <UserDataProvider>");
  return ctx;
}
