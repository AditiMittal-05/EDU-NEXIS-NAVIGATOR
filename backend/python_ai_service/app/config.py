from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "opportunities.json"

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:8080",
]

SUPPORTED_DOMAINS = [
    "Govt Jobs",
    "Govt Exams",
    "Private Roles",
    "Higher Education",
    "Study Abroad",
    "Scholarships",
    "Skill Courses",
]

# Spring Boot UserService Configuration
SPRING_AUTH_BASE_URL = os.getenv("SPRING_AUTH_BASE_URL", "http://localhost:8080")

# MongoDB Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "edunexis_db")