# ResumeAI — AI Resume Parser & Job Recommendation System

A production-ready, full-stack application that parses resumes, matches candidates to jobs using AI scoring, and provides recruiter analytics.

**Stack:** React.js · Django REST Framework · SQLite · Python AI Modules

---

## Features

| Feature | Description |
|---|---|
| 📄 Resume Parsing | Extract name, email, phone, skills, education, and experience from PDF/DOCX |
| 🤖 Skill Matching | Score candidate skills against job requirements (0–100%) |
| 🎯 ATS Scoring | Weighted ATS score: skills 40%, experience 30%, education 20%, keywords 10% |
| 💼 Job Recommendations | Ranked job list per candidate with match percentage |
| 📊 Analytics Dashboard | Platform-wide stats, top skills, ATS distribution |
| 🔍 Candidate Search | Search and filter all candidates by name, email, or skill |
| 🔄 Job Scraper | Seed + extendable scraper module for job postings |

---

## Project Structure

```
resume_parser_project/
├── backend/
│   ├── config/          # Django settings, URLs, WSGI/ASGI
│   ├── api/             # Models, serializers, views, services, admin
│   ├── ai_engine/       # Parser, matcher, scorer, scraper, skill extractor
│   └── media/resumes/   # Uploaded resume files
├── frontend/
│   └── src/
│       ├── api/         # Axios client
│       ├── services/    # All API calls
│       ├── pages/       # Dashboard, Upload, Profile, Recommendations, Analytics
│       └── components/  # Navbar, ResumeCard, MatchCard, ATSCard, SkillChart
├── requirements.txt
└── .env.example
```

---

## Installation

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Clone and set up backend

```bash
cd resume_parser_project/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r ../../requirements.txt

# Configure environment
cp ../../.env.example ../.env
# Edit .env and set SECRET_KEY

# Run migrations
python manage.py migrate

# (Optional) Create admin user
python manage.py createsuperuser

# Start backend
python manage.py runserver
```

Backend runs at: `http://localhost:8000`

### 2. Set up frontend

```bash
cd resume_parser_project/frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

---

## API Documentation

All responses follow this envelope:
```json
{ "success": true, "data": { ... } }
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload/` | Upload a PDF/DOCX resume |
| `GET`  | `/api/candidates/` | List all candidates |
| `GET`  | `/api/candidate/<id>/` | Single candidate details |
| `GET`  | `/api/jobs/` | List all jobs |
| `POST` | `/api/jobs/scrape/` | Trigger job scraper |
| `GET`  | `/api/recommendations/<candidate_id>/` | Job recommendations for a candidate |
| `GET`  | `/api/analytics/` | Platform-wide statistics |

### Upload Resume — Example

```bash
curl -X POST http://localhost:8000/api/upload/ \
  -F "resume_file=@/path/to/resume.pdf"
```

Response:
```json
{
  "success": true,
  "data": {
    "candidate_id": 1,
    "created": true,
    "parsed_data": {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "9876543210",
      "skills": ["Python", "Django", "SQL", "Machine Learning"],
      "education": "B.Tech Computer Science",
      "experience_years": 3.0
    }
  }
}
```

---

## AI Modules

### `ai_engine/parser.py`
- Extracts text from PDF (pdfplumber) and DOCX (python-docx)
- Uses regex to extract email, phone, name, education, experience years
- Calls `skill_extractor` for skill detection

### `ai_engine/skill_extractor.py`
- Centralised skill taxonomy with 70+ technology skills
- Pattern-based detection with alias support (e.g. "reactjs" → "React")

### `ai_engine/matcher.py`
- `match_score = (matched_skills / required_skills) × 100`
- Returns matched skill list with canonical names

### `ai_engine/scorer.py`
- ATS Score = Skills(40%) + Experience(30%) + Education(20%) + Keywords(10%)
- Education mapping: B.Tech=70, M.Tech=85, PhD=100
- Keyword detection: agile, leadership, communication, etc.

### `ai_engine/scraper.py`
- Ships with 10 realistic seed jobs
- Extensible: override `_fetch_from_api()` to call real job boards

---

## Production Deployment

1. Set `DEBUG=False` in `.env`
2. Add your domain to `ALLOWED_HOSTS`
3. Run `python manage.py collectstatic`
4. Use `gunicorn config.wsgi:application` as the WSGI server
5. Serve static/media via nginx
6. Build React: `npm run build` and serve the `build/` folder

---

## Screenshots

> Upload Resume page → drag-and-drop zone with progress bar  
> Dashboard → stat cards + skill chart + recent candidates  
> Candidate Profile → skills, education, top job match  
> Job Recommendations → filterable ranked list with ATS scores  
> Analytics → platform stats + skill distribution chart  

---

## Extending the System

- **Real job scraping**: Replace `_fetch_from_api()` in `scraper.py` with calls to LinkedIn, Indeed, or Naukri APIs
- **Authentication**: Add DRF token auth and update `permissions.py`
- **LLM parsing**: Swap the regex parser in `parser.py` with an OpenAI/Claude API call for higher accuracy
- **Skills taxonomy**: Add entries to `SKILL_DATABASE` in `skill_extractor.py`

---

## License

MIT — built for educational and production use.
