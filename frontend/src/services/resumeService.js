/**
 * services/resumeService.js
 *
 * All API interactions. Falls back to client-side scoring when the
 * backend isn't running, so the UI works standalone for demos.
 */

import apiClient from "../api/axios";

// ── Skills taxonomy (mirrors backend skill_extractor.py) ─────────────────────
const SKILLS = [
  "Python","Django","Flask","FastAPI","React","Vue.js","Angular","Node.js",
  "Next.js","TypeScript","JavaScript","Java","Go","Rust","PHP","Ruby","C++","C#",
  "SQL","MySQL","PostgreSQL","MongoDB","Redis","SQLite","DynamoDB",
  "Power BI","Tableau","Excel","Pandas","NumPy","Matplotlib",
  "Machine Learning","Deep Learning","NLP","Computer Vision","LangChain","Agentic AI",
  "TensorFlow","PyTorch","Scikit-learn","Keras","Hugging Face","OpenAI",
  "Hadoop","Spark","Kafka","Airflow",
  "AWS","Azure","GCP","Docker","Kubernetes","Terraform",
  "Git","CI/CD","Linux","REST API","GraphQL","Microservices",
];

function extractSkillsFromText(text) {
  const lower = text.toLowerCase();
  return SKILLS.filter(s => lower.includes(s.toLowerCase()));
}

function extractEmail(text) {
  const m = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  return m ? m[0] : "";
}

function extractPhone(text) {
  const m = text.match(/(?:\+?\d{1,3}[\s\-]?)?(?:\(?\d{3}\)?[\s\-]?)?\d{3}[\s\-]?\d{4}/);
  return m ? m[0].trim() : "";
}

function extractName(text) {
  for (const line of text.split("\n")) {
    const l = line.trim();
    if (!l || /[@/\\http\d{5}]/.test(l)) continue;
    const words = l.split(" ");
    if (words.length >= 2 && words.length <= 4 && words.every(w => w && w[0] === w[0].toUpperCase()))
      return l;
  }
  return "";
}

function extractExperience(text) {
  const m = text.match(/(\d+\.?\d*)\s*\+?\s*years?\s+(?:of\s+)?experience/i);
  return m ? parseFloat(m[1]) : 0;
}

function extractEducation(text) {
  const m = text.match(/(B\.?Tech|M\.?Tech|B\.?E|B\.?Sc|M\.?Sc|MBA|BCA|MCA|Ph\.?D|Bachelor|Master).{0,150}/i);
  return m ? m[0].trim() : "";
}

function clientSideParse(text) {
  return {
    name: extractName(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    skills: extractSkillsFromText(text),
    education: extractEducation(text),
    experience_years: extractExperience(text),
  };
}

function clientSideMatch(candidateSkills, requiredSkills) {
  const cs = new Set(candidateSkills.map(s => s.toLowerCase()));
  const matched = requiredSkills.filter(s => cs.has(s.toLowerCase()));
  const score = requiredSkills.length
    ? Math.round((matched.length / requiredSkills.length) * 100)
    : 0;
  return { score, matched_skills: matched };
}

function clientSideATS({ skills, requiredSkills, experienceYears, education }) {
  const skillScore = requiredSkills.length
    ? (new Set(skills.map(s=>s.toLowerCase())).size
        ? requiredSkills.filter(r => skills.some(s=>s.toLowerCase()===r.toLowerCase())).length / requiredSkills.length * 100
        : 0)
    : 0;
  const expScore = Math.min(experienceYears / 3 * 100, 100);
  const eduMap = { phd:100, master:85, mtech:85, mba:85, btech:70, bachelor:70, bsc:70, diploma:50 };
  const eduScore = Object.entries(eduMap).find(([k]) => education.toLowerCase().includes(k))?.[1] ?? 10;
  const kws = ["team","communication","leadership","agile","analytical"];
  const kwScore = kws.filter(k => education.toLowerCase().includes(k)).length / kws.length * 100;
  return Math.round(skillScore*0.4 + expScore*0.3 + eduScore*0.2 + kwScore*0.1);
}

// ── PDF text extraction (pdfjs) ───────────────────────────────────────────────
async function extractTextFromPDF(file) {
  const pdfjsLib = window["pdfjs-dist/build/pdf"];
  if (!pdfjsLib) throw new Error("PDF.js not loaded");
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const ab = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
  const pages = await Promise.all(
    Array.from({ length: pdf.numPages }, (_, i) =>
      pdf.getPage(i + 1).then(p => p.getTextContent()).then(c => c.items.map(i=>i.str).join(" "))
    )
  );
  return pages.join("\n");
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function uploadResume(file, onProgress) {
  // Try backend first
  try {
    const formData = new FormData();
    formData.append("resume_file", file);
    const res = await apiClient.post("upload/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: e => e.total && onProgress?.(Math.round(e.loaded/e.total*100)),
    });
    return res.data.data;
  } catch {
    // Fallback: parse in the browser
    onProgress?.(30);
    let text = "";
    if (file.name.endsWith(".pdf")) text = await extractTextFromPDF(file);
    else text = await file.text(); // docx as plain text fallback
    onProgress?.(80);
    const parsed = clientSideParse(text);
    onProgress?.(100);
    return { candidate_id: `local_${Date.now()}`, created: true, parsed_data: parsed };
  }
}

export async function fetchCandidates() {
  try { return (await apiClient.get("candidates/")).data.data; }
  catch { return []; }
}

export async function fetchCandidate(id) {
  try { return (await apiClient.get(`candidate/${id}/`)).data.data; }
  catch { return null; }
}

export async function fetchJobs() {
  try { return (await apiClient.get("jobs/")).data.data; }
  catch { return []; }
}

export async function fetchRecommendations(candidateId, candidate, jobs) {
  try {
    return (await apiClient.get(`recommendations/${candidateId}/`)).data.data;
  } catch {
    // Client-side matching fallback
    if (!candidate || !jobs?.length) return [];
    return jobs.map(job => {
      const { score, matched_skills } = clientSideMatch(
        candidate.skills || [], job.skills_required || []
      );
      const atsScore = clientSideATS({
        skills: candidate.skills || [],
        requiredSkills: job.skills_required || [],
        experienceYears: candidate.experience_years || 0,
        education: candidate.education || "",
      });
      return { id: `${candidateId}-${job.id}`, job, score, ats_score: atsScore, matched_skills };
    }).sort((a, b) => b.score - a.score);
  }
}

export async function fetchAnalytics() {
  try { return (await apiClient.get("analytics/")).data.data; }
  catch { return null; }
}

export async function triggerJobScrape() {
  try { return (await apiClient.post("jobs/scrape/")).data.data; }
  catch { return { new_jobs_added: 0 }; }
}

export { clientSideParse, clientSideMatch, clientSideATS };
