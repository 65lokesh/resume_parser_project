"""
scraper.py — Job Scraping module.

In production, replace `_fetch_from_api()` with real HTTP calls to
job boards (LinkedIn, Indeed, Naukri, etc.) using their APIs or
respectful HTML scraping with requests + BeautifulSoup.

For now, the module ships a realistic seed dataset so the system
works out of the box without external dependencies.
"""

import logging
from typing import Any

logger = logging.getLogger("ai_engine")

# ─── Seed Job Dataset ─────────────────────────────────────────────────────────
# Replace or supplement with real API calls in production.

_SEED_JOBS: list[dict[str, Any]] = [
    {
        "title": "Data Analyst",
        "company": "Analytics Corp",
        "description": (
            "Looking for a Data Analyst with 2+ years experience. "
            "Must be a team player with strong communication and analytical skills. "
            "Agile environment, deadline-driven role."
        ),
        "skills": ["SQL", "Power BI", "Excel", "Python", "Tableau"],
        "location": "Bangalore, India",
        "source": "scraper",
    },
    {
        "title": "Backend Python Developer",
        "company": "TechStartup Pvt Ltd",
        "description": (
            "We need a backend developer with 3+ years experience in Python and Django. "
            "Strong REST API design skills required. "
            "Collaborative, cross-functional team. Problem-solving mindset essential."
        ),
        "skills": ["Python", "Django", "REST API", "PostgreSQL", "Docker"],
        "location": "Mumbai, India",
        "source": "scraper",
    },
    {
        "title": "Machine Learning Engineer",
        "company": "AI Solutions Ltd",
        "description": (
            "ML Engineer position requiring 3+ years of hands-on experience. "
            "Looking for an innovative, results-driven individual. "
            "Stakeholder communication required. Agile/scrum workflow."
        ),
        "skills": ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "NLP"],
        "location": "Hyderabad, India",
        "source": "scraper",
    },
    {
        "title": "Full Stack Developer",
        "company": "WebAgency Global",
        "description": (
            "Full-stack role with 4+ years experience. "
            "Detail-oriented developer needed for cross-functional projects."
        ),
        "skills": ["React", "Node.js", "Python", "MongoDB", "Docker", "AWS"],
        "location": "Pune, India",
        "source": "scraper",
    },
    {
        "title": "Data Engineer",
        "company": "DataFlow Inc",
        "description": (
            "Data Engineer with 3+ years of big data experience. "
            "Strong project management skills required."
        ),
        "skills": ["Python", "Spark", "Hadoop", "SQL", "Kafka", "AWS", "Airflow"],
        "location": "Chennai, India",
        "source": "scraper",
    },
    {
        "title": "React Frontend Developer",
        "company": "UIcraft Technologies",
        "description": (
            "Frontend developer with 2+ years React experience. "
            "Collaborative team environment, agile methodology."
        ),
        "skills": ["React", "JavaScript", "TypeScript", "CSS", "Node.js", "Git"],
        "location": "Delhi, India",
        "source": "scraper",
    },
    {
        "title": "DevOps Engineer",
        "company": "CloudOps Solutions",
        "description": (
            "DevOps engineer with 4+ years of experience in CI/CD pipelines. "
            "Leadership and communication skills valued."
        ),
        "skills": ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD", "Linux", "Python"],
        "location": "Bangalore, India",
        "source": "scraper",
    },
    {
        "title": "NLP Research Engineer",
        "company": "LangTech AI",
        "description": (
            "NLP engineer to work on large language model pipelines. "
            "2+ years experience. Innovative environment, PhD preferred."
        ),
        "skills": ["Python", "NLP", "LangChain", "Hugging Face", "Machine Learning", "PyTorch"],
        "location": "Remote",
        "source": "scraper",
    },
    {
        "title": "BI Developer",
        "company": "InsightData Corp",
        "description": (
            "BI Developer with strong dashboard skills and 3+ years experience. "
            "Stakeholder-facing role requiring excellent communication."
        ),
        "skills": ["Power BI", "Tableau", "SQL", "Excel", "Azure"],
        "location": "Mumbai, India",
        "source": "scraper",
    },
    {
        "title": "Cloud Solutions Architect",
        "company": "NimboTech",
        "description": (
            "Architect with 6+ years of cloud experience. "
            "Leadership and cross-functional collaboration required."
        ),
        "skills": ["AWS", "Azure", "GCP", "Kubernetes", "Terraform", "Python", "Microservices"],
        "location": "Bangalore, India",
        "source": "scraper",
    },
]


class JobScraper:
    """
    Fetches job listings and normalises them into a standard schema.

    Production extension:
        Override `_fetch_from_api()` with HTTP calls to real job boards.
    """

    def fetch(self) -> list[dict[str, Any]]:
        """
        Return a list of normalised job dicts ready for persistence.

        Each dict has keys: title, company, description, skills, location, source.
        """
        try:
            raw_jobs = self._fetch_from_api()
        except Exception as exc:
            logger.error("Scraper fetch failed: %s", exc)
            raise

        return [self._normalise(job) for job in raw_jobs]

    def _fetch_from_api(self) -> list[dict[str, Any]]:
        """
        Placeholder for real API/scraping calls.
        Returns the seed dataset.

        Production: use requests.get() to job board APIs here.
        """
        logger.info("Using seed job dataset (%d jobs)", len(_SEED_JOBS))
        return _SEED_JOBS

    def _normalise(self, raw: dict[str, Any]) -> dict[str, Any]:
        """Ensure every job dict has a consistent shape."""
        return {
            "title": raw.get("title", "Untitled"),
            "company": raw.get("company", "Unknown"),
            "description": raw.get("description", ""),
            "skills": raw.get("skills", []),
            "location": raw.get("location", ""),
            "source": raw.get("source", "scraper"),
        }
