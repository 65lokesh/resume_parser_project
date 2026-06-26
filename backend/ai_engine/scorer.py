"""
scorer.py — ATS (Applicant Tracking System) Score Generator.

Computes a weighted ATS score for a candidate against a job description.

Weights:
    Skills      → 40 %
    Experience  → 30 %
    Education   → 20 %
    Keywords    → 10 %
"""

import logging
import re
from typing import Any

from .skill_extractor import extract_skills

logger = logging.getLogger("ai_engine")

# Degree tiers map to a 0–100 education score
_EDUCATION_TIERS = [
    (r"ph\.?d|doctorate", 100),
    (r"m\.?tech|m\.?sc|m\.?e\b|mba|mca|master", 85),
    (r"b\.?tech|b\.?e\b|b\.?sc|bca|b\.?com|bachelor", 70),
    (r"diploma|associate", 50),
    (r"12th|hsc|higher secondary", 35),
    (r"10th|ssc|matriculation", 20),
]

# Common ATS keywords employers look for
_ATS_KEYWORDS = [
    "team player", "leadership", "communication", "problem.solving",
    "analytical", "detail.oriented", "project management", "agile",
    "scrum", "collaborative", "innovative", "results.driven",
    "deadline", "stakeholder", "cross.functional",
]


class ATSScorer:
    """
    Calculates a weighted ATS score (0–100) for a candidate–job pair.

    Usage:
        scorer = ATSScorer()
        result = scorer.score(
            skills=["Python", "SQL"],
            required_skills=["Python", "Django", "SQL"],
            experience_years=3,
            education="B.Tech Computer Science",
            description="Looking for a team player with strong communication..."
        )
        # → {"ats_score": 72.5, "breakdown": {...}}
    """

    # Component weights (must sum to 100)
    WEIGHT_SKILLS = 40
    WEIGHT_EXPERIENCE = 30
    WEIGHT_EDUCATION = 20
    WEIGHT_KEYWORDS = 10

    def score(
        self,
        skills: list[str],
        required_skills: list[str],
        experience_years: float,
        education: str,
        description: str,
    ) -> dict[str, Any]:
        """
        Compute the ATS score and return a full breakdown.

        Returns:
            {
                "ats_score": float,    # overall 0–100
                "breakdown": {
                    "skills_score": float,
                    "experience_score": float,
                    "education_score": float,
                    "keywords_score": float,
                }
            }
        """
        skills_score = self._score_skills(skills, required_skills)
        experience_score = self._score_experience(experience_years, description)
        education_score = self._score_education(education)
        keywords_score = self._score_keywords(
            " ".join(skills) + " " + education, description
        )

        ats_score = (
            skills_score * (self.WEIGHT_SKILLS / 100)
            + experience_score * (self.WEIGHT_EXPERIENCE / 100)
            + education_score * (self.WEIGHT_EDUCATION / 100)
            + keywords_score * (self.WEIGHT_KEYWORDS / 100)
        )

        return {
            "ats_score": round(ats_score, 2),
            "breakdown": {
                "skills_score": round(skills_score, 2),
                "experience_score": round(experience_score, 2),
                "education_score": round(education_score, 2),
                "keywords_score": round(keywords_score, 2),
            },
        }

    # ─── Component Scorers ────────────────────────────────────────────────────

    def _score_skills(self, candidate_skills: list[str], required_skills: list[str]) -> float:
        """Percentage of required skills the candidate possesses."""
        if not required_skills:
            return 0.0
        candidate_lower = {s.lower() for s in candidate_skills}
        matched = sum(1 for s in required_skills if s.lower() in candidate_lower)
        return (matched / len(required_skills)) * 100

    def _score_experience(self, experience_years: float, description: str) -> float:
        """
        Extract the required experience from the job description and
        score the candidate proportionally.
        """
        # Try to find "X years" requirement in description
        match = re.search(
            r"(\d+\.?\d*)\s*\+?\s*years?\s+(?:of\s+)?experience",
            description,
            re.IGNORECASE,
        )
        required_years = float(match.group(1)) if match else 3.0  # default 3 years

        if experience_years >= required_years:
            return 100.0
        if required_years == 0:
            return 100.0
        return min((experience_years / required_years) * 100, 100.0)

    def _score_education(self, education: str) -> float:
        """Map the candidate's highest degree to a 0–100 score."""
        text = education.lower()
        for pattern, score in _EDUCATION_TIERS:
            if re.search(pattern, text, re.IGNORECASE):
                return float(score)
        return 10.0  # Some education mentioned but unrecognised

    def _score_keywords(self, candidate_text: str, job_description: str) -> float:
        """Score soft-skill / ATS keyword overlap between candidate and job."""
        if not job_description.strip():
            return 50.0  # No description to compare against → neutral score

        jd_lower = job_description.lower()
        candidate_lower = candidate_text.lower()

        # Only score keywords that appear in the job description
        relevant = [kw for kw in _ATS_KEYWORDS if re.search(kw, jd_lower)]
        if not relevant:
            return 50.0

        matched = sum(1 for kw in relevant if re.search(kw, candidate_lower))
        return (matched / len(relevant)) * 100
