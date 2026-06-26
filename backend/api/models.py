"""
Database models for the Resume Parser & Job Recommendation System.

Three core models:
  - Candidate  : parsed resume data
  - Job        : scraped / manually entered jobs
  - MatchResult: AI-generated match between a candidate and a job
"""

from django.db import models


class Candidate(models.Model):
    """Stores every candidate whose resume has been uploaded and parsed."""

    name = models.CharField(max_length=255, blank=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30, blank=True)

    # Stored as a JSON list, e.g. ["Python", "Django", "SQL"]
    skills = models.JSONField(default=list)

    education = models.TextField(blank=True)
    experience_years = models.FloatField(default=0.0)
    resume_file = models.FileField(upload_to="resumes/")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.name} <{self.email}>"


class Job(models.Model):
    """Represents a job posting, either scraped or entered manually."""

    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    # Stored as a JSON list, e.g. ["Python", "SQL", "Power BI"]
    skills_required = models.JSONField(default=list)

    location = models.CharField(max_length=255, blank=True)
    source = models.CharField(max_length=100, default="manual")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.title} @ {self.company}"


class MatchResult(models.Model):
    """Records the AI-computed compatibility between a candidate and a job."""

    candidate = models.ForeignKey(
        Candidate, on_delete=models.CASCADE, related_name="match_results"
    )
    job = models.ForeignKey(
        Job, on_delete=models.CASCADE, related_name="match_results"
    )

    # Skill-overlap score (0–100)
    score = models.FloatField(default=0.0)

    # ATS weighted score (0–100)
    ats_score = models.FloatField(default=0.0)

    # JSON list of skills present in both candidate and job requirement
    matched_skills = models.JSONField(default=list)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("candidate", "job")
        ordering = ["-score"]

    def __str__(self) -> str:
        return f"{self.candidate.name} → {self.job.title} ({self.score:.0f}%)"
