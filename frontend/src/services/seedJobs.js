// src/services/seedJobs.js
const RAPIDAPI_KEY = "b92774c69bmsh550ef7d069c8476p1c5367jsn3fc4494e35c4";

const JOB_QUERIES = [
  "Python Developer India",
  "Data Analyst India",
  "Machine Learning Engineer India",
  "React Developer India",
  "DevOps Engineer India",
  "Data Engineer India",
  "Full Stack Developer India",
  "NLP Engineer India",
];

function normaliseJob(raw, index) {
  const salary = raw.job_min_salary && raw.job_max_salary
    ? `${raw.job_salary_currency || "₹"}${(raw.job_min_salary/100000).toFixed(1)}L – ${(raw.job_max_salary/100000).toFixed(1)}L / year`
    : raw.job_salary_period
    ? `${raw.job_salary_currency || ""} ${raw.job_min_salary || ""} – ${raw.job_max_salary || ""} / ${raw.job_salary_period}`.trim()
    : null;

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
  const desc = (raw.job_description || "").toLowerCase();
  const skills_required = SKILLS.filter(s => desc.includes(s.toLowerCase()));

  const postedDate = raw.job_posted_at_datetime_utc
    ? new Date(raw.job_posted_at_datetime_utc)
    : null;
  const daysAgo = postedDate
    ? Math.floor((Date.now() - postedDate) / 86400000)
    : null;
  const posted = daysAgo === null ? "Recently"
    : daysAgo === 0 ? "Today"
    : daysAgo === 1 ? "Yesterday"
    : `${daysAgo} days ago`;

  return {
    id: raw.job_id || `job_${index}`,
    title: raw.job_title || "Untitled",
    company: raw.employer_name || "Unknown Company",
    location: [raw.job_city, raw.job_state, raw.job_country]
      .filter(Boolean).join(", ") || "India",
    salary,
    type: raw.job_employment_type
      ? raw.job_employment_type.replace(/_/g, " ")
      : "Full-time",
    experience: raw.job_required_experience?.required_experience_in_months
      ? `${Math.round(raw.job_required_experience.required_experience_in_months / 12)}+ years`
      : null,
    description: raw.job_description
      ? raw.job_description.slice(0, 400) + "..."
      : "See full description on job portal.",
    skills_required: skills_required.length > 0 ? skills_required : [],
    portalLink: raw.job_apply_link || raw.job_google_link || "#",  // ← only LinkedIn/direct link
    posted,
    source: raw.job_publisher || "LinkedIn",
    logoUrl: raw.employer_logo || null,
  };
}

const CACHE_KEY = "resumeai_live_jobs";
const CACHE_TTL = 60 * 60 * 1000;

function getCached() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { jobs, fetchedAt } = JSON.parse(raw);
    if (Date.now() - fetchedAt > CACHE_TTL) return null;
    return jobs;
  } catch { return null; }
}

function setCache(jobs) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ jobs, fetchedAt: Date.now() }));
  } catch {}
}

async function fetchQuery(query) {
  const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=1&date_posted=week`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": RAPIDAPI_KEY,
      "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    },
  });
  if (!res.ok) throw new Error(`JSearch API error: ${res.status}`);
  const data = await res.json();
  return data.data || [];
}

export async function fetchLiveJobs() {
  const cached = getCached();
  if (cached) {
    console.log(`[JobFetcher] Using cached jobs (${cached.length})`);
    return cached;
  }

  console.log("[JobFetcher] Fetching live jobs from JSearch...");

  const seen = new Set();
  const jobs = [];

  for (let i = 0; i < JOB_QUERIES.length; i += 2) {
    const batch = JOB_QUERIES.slice(i, i + 2);
    const results = await Promise.allSettled(batch.map(fetchQuery));
    results.forEach(r => {
      if (r.status === "fulfilled") {
        r.value.forEach((raw) => {
          if (!seen.has(raw.job_id)) {
            seen.add(raw.job_id);
            jobs.push(normaliseJob(raw, jobs.length));
          }
        });
      }
    });
    if (i + 2 < JOB_QUERIES.length) {
      await new Promise(r => setTimeout(r, 300));
    }
  }

  console.log(`[JobFetcher] Fetched ${jobs.length} live jobs`);
  setCache(jobs);
  return jobs;
}

export const SEED_JOBS = [
  { id: "fallback_j1", title: "Data Analyst", company: "Analytics Corp", location: "Bangalore, Karnataka", salary: "₹6L – ₹10L / year", type: "Full-time", experience: "2+ years", description: "Analyse large datasets and build dashboards.", skills_required: ["SQL","Power BI","Excel","Python","Tableau"], portalLink: "https://www.linkedin.com/jobs/search/?keywords=Data+Analyst&location=Bangalore", posted: "2 days ago" },
  { id: "fallback_j2", title: "Backend Python Developer", company: "TechStartup Pvt Ltd", location: "Mumbai, Maharashtra", salary: "₹10L – ₹18L / year", type: "Full-time", experience: "3+ years", description: "Build scalable REST APIs using Django and DRF.", skills_required: ["Python","Django","REST API","PostgreSQL","Docker"], portalLink: "https://www.linkedin.com/jobs/search/?keywords=Backend+Python+Developer&location=Mumbai", posted: "1 day ago" },
  { id: "fallback_j3", title: "Machine Learning Engineer", company: "AI Solutions Ltd", location: "Hyderabad, Telangana", salary: "₹15L – ₹28L / year", type: "Full-time", experience: "3+ years", description: "Design and deploy ML models for production.", skills_required: ["Python","Machine Learning","Deep Learning","TensorFlow","PyTorch","NLP"], portalLink: "https://www.linkedin.com/jobs/search/?keywords=Machine+Learning+Engineer&location=Hyderabad", posted: "3 days ago" },
];