"""
parser.py — Resume Parser AI module.

Extracts structured information from PDF and DOCX resume files.
Returns a standardised JSON-serialisable dict.

Supported formats: .pdf, .docx
"""

import io
import logging
import os
import re
from typing import Any

import pdfplumber
from docx import Document

from .skill_extractor import extract_skills

logger = logging.getLogger("ai_engine")


class ResumeParser:
    """
    Parses a resume file and returns structured candidate data.

    Usage:
        parser = ResumeParser()
        data = parser.parse(django_file_object)
    """

    # ─── Public API ───────────────────────────────────────────────────────────

    def parse(self, resume_file) -> dict[str, Any]:
        """
        Main entry point. Dispatches to the correct sub-parser based on
        the file extension and returns a structured dict.
        """
        ext = os.path.splitext(resume_file.name)[1].lower()

        if ext == ".pdf":
            text = self._extract_text_from_pdf(resume_file)
        elif ext == ".docx":
            text = self._extract_text_from_docx(resume_file)
        else:
            raise ValueError(f"Unsupported file type: {ext}")

        if not text.strip():
            raise ValueError("Could not extract any text from the resume.")

        return self._parse_text(text)

    # ─── Text Extraction ──────────────────────────────────────────────────────

    def _extract_text_from_pdf(self, resume_file) -> str:
        """Extract all text from a PDF file using pdfplumber."""
        try:
            file_bytes = resume_file.read()
            text_parts = []
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
            return "\n".join(text_parts)
        except Exception as exc:
            logger.error("PDF extraction failed: %s", exc)
            raise ValueError(f"Failed to read PDF: {exc}") from exc

    def _extract_text_from_docx(self, resume_file) -> str:
        """Extract all paragraph text from a DOCX file."""
        try:
            file_bytes = resume_file.read()
            doc = Document(io.BytesIO(file_bytes))
            return "\n".join(para.text for para in doc.paragraphs if para.text.strip())
        except Exception as exc:
            logger.error("DOCX extraction failed: %s", exc)
            raise ValueError(f"Failed to read DOCX: {exc}") from exc

    # ─── Field Extraction ─────────────────────────────────────────────────────

    def _parse_text(self, text: str) -> dict[str, Any]:
        """Orchestrate all field extractors against the raw text."""
        return {
            "name": self._extract_name(text),
            "email": self._extract_email(text),
            "phone": self._extract_phone(text),
            "skills": extract_skills(text),
            "education": self._extract_education(text),
            "experience_years": self._extract_experience_years(text),
        }

    def _extract_email(self, text: str) -> str:
        """Return the first email address found, or empty string."""
        pattern = r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
        match = re.search(pattern, text)
        return match.group(0) if match else ""

    def _extract_phone(self, text: str) -> str:
        """
        Return the first phone number found.
        Handles formats: +91-9999999999, (123) 456-7890, 1234567890, etc.
        """
        pattern = r"(?:\+?\d{1,3}[\s\-]?)?(?:\(?\d{3}\)?[\s\-]?)?\d{3}[\s\-]?\d{4}"
        match = re.search(pattern, text)
        return match.group(0).strip() if match else ""

    def _extract_name(self, text: str) -> str:
        """
        Heuristic: the candidate's name is usually the first non-empty line
        of the resume, consisting of 2–4 capitalised words.
        """
        for line in text.split("\n"):
            line = line.strip()
            if not line:
                continue
            # Skip lines that look like contact info
            if re.search(r"[@|/\\|http|www|\d{5}]", line):
                continue
            words = line.split()
            if 2 <= len(words) <= 4 and all(w[0].isupper() for w in words if w):
                return line
        return ""

    def _extract_education(self, text: str) -> str:
        """
        Look for common degree keywords and return the surrounding context
        (up to 300 characters) as the education summary.
        """
        patterns = [
            r"(B\.?Tech|M\.?Tech|B\.?E|B\.?Sc|M\.?Sc|MBA|BCA|MCA|Ph\.?D|Bachelor|Master|B\.?Com|M\.?Com)"
            r".{0,200}"
        ]
        matches = []
        for pattern in patterns:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                matches.append(match.group(0).strip())
        return "; ".join(matches[:3]) if matches else ""

    def _extract_experience_years(self, text: str) -> float:
        """
        Parse statements like "5 years of experience" or "3+ years".
        Returns 0.0 if nothing is found.
        """
        patterns = [
            r"(\d+\.?\d*)\s*\+?\s*years?\s+(?:of\s+)?experience",
            r"experience\s+(?:of\s+)?(\d+\.?\d*)\s*\+?\s*years?",
            r"(\d+\.?\d*)\s*\+?\s*yrs?\s+(?:of\s+)?experience",
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return float(match.group(1))
        return 0.0
