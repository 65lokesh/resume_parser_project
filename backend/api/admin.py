"""
admin.py — Register all models with rich admin configuration.
Accessible at /admin/ after running createsuperuser.
"""

from django.contrib import admin
from .models import Candidate, Job, MatchResult


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "email", "phone", "experience_years", "created_at"]
    search_fields = ["name", "email", "phone"]
    list_filter = ["created_at"]
    readonly_fields = ["created_at"]
    ordering = ["-created_at"]


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ["id", "title", "company", "location", "source", "created_at"]
    search_fields = ["title", "company", "location"]
    list_filter = ["source", "created_at"]
    readonly_fields = ["created_at"]
    ordering = ["-created_at"]


@admin.register(MatchResult)
class MatchResultAdmin(admin.ModelAdmin):
    list_display = ["id", "candidate", "job", "score", "ats_score", "created_at"]
    search_fields = ["candidate__name", "job__title"]
    list_filter = ["created_at"]
    readonly_fields = ["created_at"]
    ordering = ["-score"]
