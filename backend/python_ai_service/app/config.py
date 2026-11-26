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

PYTHON_AUTH_BASE_URL = os.getenv("PYTHON_AUTH_BASE_URL", "http://localhost:8080")
# MongoDB Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "edunexis_db")

# ==============================================================================
# PLUGGABLE LLM & WEB SEARCH CONFIGURATION
# Change these values (or set environment variables) to switch LLM providers
# ==============================================================================

# Supported options: "nvidia" | "openai" | "ollama" | "custom"
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "nvidia")

# --- OPTION A: NVIDIA AI Endpoints (build.nvidia.com) [Default] ---
LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://integrate.api.nvidia.com/v1")
LLM_MODEL = os.getenv("LLM_MODEL", "nvidia/nemotron-3-nano-30b-a3b")

# --- OPTION B: OpenAI ---
# LLM_PROVIDER = "openai"
# LLM_API_KEY = os.getenv("OPENAI_API_KEY", "sk-YOUR_OPENAI_KEY")
# LLM_BASE_URL = "https://api.openai.com/v1"
# LLM_MODEL = "gpt-4o-mini"

# --- OPTION C: Google Gemini (via OpenAI-compatible endpoint) ---
# LLM_PROVIDER = "custom"
# LLM_API_KEY = os.getenv("GEMINI_API_KEY", "AIza-YOUR_GEMINI_KEY")
# LLM_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"
# LLM_MODEL = "gemini-2.5-flash"

# --- OPTION D: Local Ollama (Free / Offline) ---
# LLM_PROVIDER = "ollama"
# LLM_API_KEY = "ollama"
# LLM_BASE_URL = "http://localhost:11434/v1"
# LLM_MODEL = "llama3.1"

# Web Crawler / AI Search API (Tavily)
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "tvly-YOUR_TAVILY_API_KEY_HERE")