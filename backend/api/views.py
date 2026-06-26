"""
views.py — Thin API views.

Pattern: receive request → call service → return response.
No business logic lives here.
"""

import logging

from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.request import Request
from rest_framework.response import Response

from .serializers import (
    CandidateSerializer,
    CandidateUploadSerializer,
    JobSerializer,
    MatchResultSerializer,
    AnalyticsSerializer,
)
from . import services

logger = logging.getLogger("api")


def _error(message: str, code: int = 400) -> Response:
    """Standardised error response helper."""
    return Response({"success": False, "error": message}, status=code)


def _ok(data, code: int = 200) -> Response:
    """Standardised success response helper."""
    return Response({"success": True, "data": data}, status=code)


# ─── Resume Upload ─────────────────────────────────────────────────────────────

@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def upload_resume(request: Request) -> Response:
    """
    POST /api/upload/
    Accepts a resume file (PDF or DOCX), parses it, stores the candidate,
    and returns the extracted data.
    """
    serializer = CandidateUploadSerializer(data=request.data)
    if not serializer.is_valid():
        return _error(serializer.errors)

    resume_file = serializer.validated_data["resume_file"]

    try:
        result = services.process_resume_upload(resume_file)
    except ValueError as exc:
        logger.warning("Upload rejected: %s", exc)
        return _error(str(exc))
    except Exception as exc:
        logger.exception("Unexpected upload error: %s", exc)
        return _error("An unexpected error occurred during processing.", 500)

    return _ok(result, code=201)


# ─── Candidate Endpoints ───────────────────────────────────────────────────────

@api_view(["GET"])
def list_candidates(request: Request) -> Response:
    """GET /api/candidates/ — List all candidates."""
    candidates = services.list_candidates()
    serializer = CandidateSerializer(candidates, many=True)
    return _ok(serializer.data)


@api_view(["GET"])
def candidate_detail(request: Request, candidate_id: int) -> Response:
    """GET /api/candidate/<id>/ — Single candidate details."""
    try:
        candidate = services.get_candidate(candidate_id)
    except ValueError as exc:
        return _error(str(exc), 404)

    serializer = CandidateSerializer(candidate)
    return _ok(serializer.data)


# ─── Job Endpoints ─────────────────────────────────────────────────────────────

@api_view(["GET"])
def list_jobs(request: Request) -> Response:
    """GET /api/jobs/ — List all jobs."""
    jobs = services.list_jobs()
    serializer = JobSerializer(jobs, many=True)
    return _ok(serializer.data)


@api_view(["POST"])
def scrape_jobs(request: Request) -> Response:
    """
    POST /api/jobs/scrape/
    Triggers the job scraper and persists new postings.
    """
    try:
        new_jobs = services.run_job_scraper()
    except ValueError as exc:
        return _error(str(exc))
    except Exception as exc:
        logger.exception("Scraper error: %s", exc)
        return _error("Scraper failed unexpectedly.", 500)

    return _ok({"new_jobs_added": len(new_jobs), "jobs": new_jobs}, 201)


# ─── Recommendations ──────────────────────────────────────────────────────────

@api_view(["GET"])
def recommendations(request: Request, candidate_id: int) -> Response:
    """
    GET /api/recommendations/<candidate_id>/
    Returns ranked job recommendations for a candidate.
    """
    try:
        matches = services.get_recommendations(candidate_id)
    except ValueError as exc:
        return _error(str(exc), 404)

    serializer = MatchResultSerializer(matches, many=True)
    return _ok(serializer.data)


# ─── Analytics ────────────────────────────────────────────────────────────────

@api_view(["GET"])
def analytics(request: Request) -> Response:
    """GET /api/analytics/ — Platform-wide statistics."""
    data = services.get_analytics()
    serializer = AnalyticsSerializer(data)
    return _ok(serializer.data)
