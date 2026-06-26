"""
Serializers for the Resume Parser API.
All public-facing data shapes are defined here.
"""

from rest_framework import serializers
from .models import Candidate, Job, MatchResult


# ─── Candidate ────────────────────────────────────────────────────────────────

class CandidateSerializer(serializers.ModelSerializer):
    """Full candidate representation (used for GET /candidates/ and GET /candidate/<id>/)."""

    class Meta:
        model = Candidate
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "skills",
            "education",
            "experience_years",
            "resume_file",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class CandidateUploadSerializer(serializers.ModelSerializer):
    """
    Minimal write-only serializer used when a resume is uploaded.
    Only the file is required from the client; everything else is
    populated by the AI parser.
    """

    resume_file = serializers.FileField()

    class Meta:
        model = Candidate
        fields = ["resume_file"]

    def validate_resume_file(self, value):
        """Reject files that are not PDF or DOCX."""
        import os

        ext = os.path.splitext(value.name)[1].lower()
        if ext not in [".pdf", ".docx"]:
            raise serializers.ValidationError(
                "Only PDF and DOCX files are accepted."
            )
        if value.size > 10 * 1024 * 1024:  # 10 MB
            raise serializers.ValidationError("File size must not exceed 10 MB.")
        return value


# ─── Job ──────────────────────────────────────────────────────────────────────

class JobSerializer(serializers.ModelSerializer):
    """Full job representation."""

    class Meta:
        model = Job
        fields = [
            "id",
            "title",
            "company",
            "description",
            "skills_required",
            "location",
            "source",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


# ─── MatchResult ──────────────────────────────────────────────────────────────

class MatchResultSerializer(serializers.ModelSerializer):
    """Embeds job details inside the match result for convenience."""

    job = JobSerializer(read_only=True)

    class Meta:
        model = MatchResult
        fields = ["id", "job", "score", "ats_score", "matched_skills", "created_at"]
        read_only_fields = fields


# ─── Analytics ────────────────────────────────────────────────────────────────

class AnalyticsSerializer(serializers.Serializer):
    """Shape for the analytics endpoint response (not backed by a model)."""

    total_resumes = serializers.IntegerField()
    total_jobs = serializers.IntegerField()
    average_ats_score = serializers.FloatField()
    top_skills = serializers.ListField(child=serializers.DictField())
