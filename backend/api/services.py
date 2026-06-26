"""
services.py — Business-logic layer.

Views call these functions; they never contain logic themselves.
All AI-engine calls are centralised here so they are easy to swap,
test, or cache independently.
"""

import logging
from collections import Counter
from typing import Any

from django.db.models import Avg

from .models import Candidate, Job, MatchResult
from ai_engine.parser import ResumeParser
from ai_engine.matcher import SkillMatcher
from ai_engine.scorer import ATSScorer
from ai_engine.scraper import JobScraper

logger = logging.getLogger("api")

# ─── Resume Upload Service ────────────────────────────────────────────────────

def process_resume_upload(resume_file) -> dict[str, Any]:
    """
    1. Save the uploaded file.
    2. Parse it with the AI engine.
    3. Create or update the Candidate record.
    4. Compute match results against all existing jobs.
    5. Return a structured response.
    """
    try:
        parser = ResumeParser()
        parsed = parser.parse(resume_file)
    except Exception as exc:
        logger.error("Resume parsing failed: %s", exc)
        raise ValueError(f"Could not parse resume: {exc}") from exc

    email = parsed.get("email", "")
    if not email:
        raise ValueError("No email address found in the resume. Please check the document.")

    # Upsert the candidate
    candidate, created = Candidate.objects.update_or_create(
        email=email,
        defaults={
            "name": parsed.get("name", ""),
            "phone": parsed.get("phone", ""),
            "skills": parsed.get("skills", []),
            "education": parsed.get("education", ""),
            "experience_years": parsed.get("experience_years", 0),
            "resume_file": resume_file,
        },
    )

    # Compute matches against every job in the database
    _compute_matches_for_candidate(candidate)

    return {
        "candidate_id": candidate.id,
        "created": created,
        "parsed_data": parsed,
    }


def _compute_matches_for_candidate(candidate: Candidate) -> None:
    """Regenerate MatchResult rows for the given candidate vs all jobs."""
    matcher = SkillMatcher()
    scorer = ATSScorer()

    for job in Job.objects.all():
        match = matcher.match(candidate.skills, job.skills_required)
        ats = scorer.score(
            skills=candidate.skills,
            required_skills=job.skills_required,
            experience_years=candidate.experience_years,
            education=candidate.education,
            description=job.description,
        )
        MatchResult.objects.update_or_create(
            candidate=candidate,
            job=job,
            defaults={
                "score": match["score"],
                "ats_score": ats["ats_score"],
                "matched_skills": match["matched_skills"],
            },
        )


# ─── Candidate Services ───────────────────────────────────────────────────────

def get_candidate(candidate_id: int) -> Candidate:
    """Fetch a single candidate or raise a clear error."""
    try:
        return Candidate.objects.get(pk=candidate_id)
    except Candidate.DoesNotExist:
        raise ValueError(f"Candidate with id={candidate_id} not found.")


def list_candidates() -> list[Candidate]:
    return list(Candidate.objects.all())


# ─── Job Services ─────────────────────────────────────────────────────────────

def list_jobs() -> list[Job]:
    return list(Job.objects.all())


def run_job_scraper() -> list[dict]:
    """
    Trigger the scraper and persist any new jobs.
    Returns a list of newly created job dicts.
    """
    try:
        scraper = JobScraper()
        raw_jobs = scraper.fetch()
    except Exception as exc:
        logger.error("Job scraper failed: %s", exc)
        raise ValueError(f"Scraper error: {exc}") from exc

    created_jobs = []
    for job_data in raw_jobs:
        job, created = Job.objects.get_or_create(
            title=job_data["title"],
            company=job_data["company"],
            defaults={
                "description": job_data.get("description", ""),
                "skills_required": job_data.get("skills", []),
                "location": job_data.get("location", ""),
                "source": job_data.get("source", "scraper"),
            },
        )
        if created:
            created_jobs.append(job_data)

    # Recompute matches for ALL candidates against new jobs
    for candidate in Candidate.objects.all():
        _compute_matches_for_candidate(candidate)

    return created_jobs


# ─── Recommendation Services ──────────────────────────────────────────────────

def get_recommendations(candidate_id: int) -> list[MatchResult]:
    """Return top job matches for a candidate, ordered by score descending."""
    candidate = get_candidate(candidate_id)
    return list(
        MatchResult.objects.filter(candidate=candidate)
        .select_related("job")
        .order_by("-score")
    )


# ─── Analytics Services ───────────────────────────────────────────────────────

def get_analytics() -> dict[str, Any]:
    """Aggregate platform-wide statistics."""
    total_resumes = Candidate.objects.count()
    total_jobs = Job.objects.count()

    avg_ats = MatchResult.objects.aggregate(avg=Avg("ats_score"))["avg"] or 0

    # Count skill occurrences across all candidates
    skill_counter: Counter = Counter()
    for candidate in Candidate.objects.all():
        skill_counter.update(candidate.skills)

    top_skills = [
        {"skill": skill, "count": count}
        for skill, count in skill_counter.most_common(10)
    ]

    return {
        "total_resumes": total_resumes,
        "total_jobs": total_jobs,
        "average_ats_score": round(avg_ats, 2),
        "top_skills": top_skills,
    }
