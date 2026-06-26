"""
matcher.py — Skill Matching module.

Computes how well a candidate's skills overlap with a job's requirements.

Formula:
    match_score = (matched_skills / total_required_skills) * 100
"""

import logging
from typing import Any

logger = logging.getLogger("ai_engine")


class SkillMatcher:
    """
    Compares two skill lists and returns a match percentage
    together with the specific skills that overlapped.

    Usage:
        matcher = SkillMatcher()
        result = matcher.match(["Python", "SQL"], ["Python", "Django", "SQL"])
        # → {"score": 66.67, "matched_skills": ["Python", "SQL"]}
    """

    def match(
        self,
        candidate_skills: list[str],
        required_skills: list[str],
    ) -> dict[str, Any]:
        """
        Args:
            candidate_skills: Skills extracted from the candidate's resume.
            required_skills:  Skills listed in the job posting.

        Returns:
            {
                "score": float,            # 0–100
                "matched_skills": list[str]
            }
        """
        if not required_skills:
            logger.warning("Job has no required skills; defaulting score to 0.")
            return {"score": 0.0, "matched_skills": []}

        # Normalise to lowercase sets for comparison
        candidate_set = {s.lower() for s in candidate_skills}
        required_set = {s.lower() for s in required_skills}

        matched_lower = candidate_set & required_set

        # Preserve original casing from required_skills for readability
        matched_skills = [
            s for s in required_skills if s.lower() in matched_lower
        ]

        score = (len(matched_skills) / len(required_skills)) * 100

        return {
            "score": round(score, 2),
            "matched_skills": matched_skills,
        }
