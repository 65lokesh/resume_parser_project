"""
api/urls.py — All API URL patterns.
Mounted under /api/ in config/urls.py.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Resume
    path("upload/", views.upload_resume, name="upload-resume"),

    # Candidates
    path("candidates/", views.list_candidates, name="candidate-list"),
    path("candidate/<int:candidate_id>/", views.candidate_detail, name="candidate-detail"),

    # Jobs
    path("jobs/", views.list_jobs, name="job-list"),
    path("jobs/scrape/", views.scrape_jobs, name="job-scrape"),

    # Recommendations
    path("recommendations/<int:candidate_id>/", views.recommendations, name="recommendations"),

    # Analytics
    path("analytics/", views.analytics, name="analytics"),
]
