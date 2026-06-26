"""
skill_extractor.py — Centralised skill taxonomy and extraction utility.

All skills the system recognises are defined here.
Other modules import `extract_skills()` rather than maintaining their own lists.
"""

import re
from typing import Optional

# ─── Master Skill Database ────────────────────────────────────────────────────
# Each entry: (canonical_name, [alias_patterns])
# Patterns are matched case-insensitively against resume text.

SKILL_DATABASE: list[tuple[str, list[str]]] = [
    # Languages
    ("Python", ["python"]),
    ("Java", ["\\bjava\\b"]),
    ("JavaScript", ["javascript", "js"]),
    ("TypeScript", ["typescript", "ts"]),
    ("C++", ["c\\+\\+"]),
    ("C#", ["c#", "csharp"]),
    ("Go", ["\\bgo\\b", "golang"]),
    ("Rust", ["\\brust\\b"]),
    ("R", ["\\bR\\b", "r programming"]),
    ("Scala", ["scala"]),
    ("Kotlin", ["kotlin"]),
    ("Swift", ["swift"]),
    ("PHP", ["php"]),
    ("Ruby", ["ruby"]),
    ("Shell", ["shell", "bash", "zsh"]),

    # Web Frameworks
    ("Django", ["django"]),
    ("Flask", ["flask"]),
    ("FastAPI", ["fastapi"]),
    ("React", ["react", "react\\.js", "reactjs"]),
    ("Vue.js", ["vue", "vue\\.js", "vuejs"]),
    ("Angular", ["angular"]),
    ("Node.js", ["node\\.js", "nodejs", "node"]),
    ("Express.js", ["express\\.js", "expressjs"]),
    ("Next.js", ["next\\.js", "nextjs"]),
    ("Spring Boot", ["spring boot", "spring"]),

    # Databases
    ("SQL", ["\\bsql\\b"]),
    ("MySQL", ["mysql"]),
    ("PostgreSQL", ["postgresql", "postgres"]),
    ("SQLite", ["sqlite"]),
    ("MongoDB", ["mongodb", "mongo"]),
    ("Redis", ["redis"]),
    ("Cassandra", ["cassandra"]),
    ("Oracle", ["oracle"]),
    ("DynamoDB", ["dynamodb"]),

    # Data & Analytics
    ("Power BI", ["power bi", "powerbi"]),
    ("Tableau", ["tableau"]),
    ("Excel", ["excel", "microsoft excel"]),
    ("Pandas", ["pandas"]),
    ("NumPy", ["numpy"]),
    ("Matplotlib", ["matplotlib"]),
    ("Seaborn", ["seaborn"]),
    ("Plotly", ["plotly"]),

    # Machine Learning / AI
    ("Machine Learning", ["machine learning", "\\bml\\b"]),
    ("Deep Learning", ["deep learning", "\\bdl\\b"]),
    ("NLP", ["nlp", "natural language processing"]),
    ("Computer Vision", ["computer vision", "\\bcv\\b"]),
    ("LangChain", ["langchain"]),
    ("Agentic AI", ["agentic ai", "ai agents", "autonomous agents"]),
    ("TensorFlow", ["tensorflow"]),
    ("PyTorch", ["pytorch"]),
    ("Scikit-learn", ["scikit.learn", "sklearn"]),
    ("Keras", ["keras"]),
    ("Hugging Face", ["hugging face", "huggingface", "transformers"]),
    ("OpenAI", ["openai", "gpt"]),

    # Big Data
    ("Hadoop", ["hadoop"]),
    ("Spark", ["\\bspark\\b", "apache spark", "pyspark"]),
    ("Kafka", ["kafka"]),
    ("Airflow", ["airflow"]),
    ("Hive", ["hive"]),
    ("Flink", ["flink"]),

    # Cloud
    ("AWS", ["aws", "amazon web services"]),
    ("Azure", ["azure", "microsoft azure"]),
    ("GCP", ["gcp", "google cloud"]),
    ("Docker", ["docker"]),
    ("Kubernetes", ["kubernetes", "k8s"]),
    ("Terraform", ["terraform"]),

    # DevOps / Tools
    ("Git", ["\\bgit\\b"]),
    ("CI/CD", ["ci/cd", "cicd", "jenkins", "github actions", "gitlab ci"]),
    ("Linux", ["linux", "unix"]),
    ("REST API", ["rest api", "restful", "rest"]),
    ("GraphQL", ["graphql"]),
    ("Microservices", ["microservices"]),
]


def extract_skills(text: str, skill_db: Optional[list] = None) -> list[str]:
    """
    Scan `text` against the skill database and return a deduplicated list
    of canonical skill names found.

    Args:
        text: Raw resume or job description text.
        skill_db: Override the default SKILL_DATABASE (useful for testing).

    Returns:
        Sorted list of canonical skill names.
    """
    if skill_db is None:
        skill_db = SKILL_DATABASE

    found: set[str] = set()
    text_lower = text.lower()

    for canonical_name, patterns in skill_db:
        for pattern in patterns:
            if re.search(pattern, text_lower, re.IGNORECASE):
                found.add(canonical_name)
                break  # No need to check remaining aliases

    return sorted(found)


def normalise_skills(skills: list[str]) -> list[str]:
    """
    Map a list of raw skill strings (e.g. from a resume) to canonical names.
    Strings that don't match any skill are dropped.
    """
    return extract_skills(" ".join(skills))
