# EDU-NEXIS Navigator

An intelligent, multi-agent decision-support platform designed to eliminate student career confusion by matching student profiles against real-world opportunities across seven key domains: Government Jobs, Government Exams, Private Sector Roles, Higher Education, Study Abroad, Scholarships, and Skill-Bridging Courses.

---

## 🛠️ Tech Stack & Microservices Architecture

| Layer / Service | Technology | Key Responsibilities |
| :--- | :--- | :--- |
| **Frontend UI** | React.js, Vite, Tailwind CSS, JavaScript | Interactive student dashboard, profile intake forms, roadmap visualization, and domain explorers. |
| **Core Backend & Gateway** | Java Spring Boot, Spring Security, JWT | Authentication/authorization, API Gateway, primary database transactions, payment gateway integration. |
| **AI & Recommendation Engine** | Python, FastAPI, Pydantic | REST APIs for NLP skill extraction, hybrid matching, constraint filtering, and multi-agent coordination. |
| **AI / NLP & Agents** | spaCy, Sentence Transformers, LangChain / LangGraph, scikit-learn | Profile text parsing, semantic opportunity retrieval, skill-gap analysis, and explainable roadmap generation. |
| **Databases & Vector Storage** | MongoDB, Redis, PGVector / ChromaDB | Persistent user profile storage, token caching, and opportunity vector embeddings for RAG retrieval. |

---

## 📁 Repository Structure

```text
EDU-NEXIS-NAVIGATOR/
├── .gitignore
├── README.md
├── frontend/                     # React.js web client
└── backend/
    ├── python_ai_service/        # FastAPI NLP, RAG & Multi-Agent Microservice (Port 8000)
    │   ├── requirements.txt
    │   ├── data/                 # Domain datasets & opportunity catalogs
    │   └── app/
    │       ├── main.py
    │       ├── api/
    │       ├── core/
    │       ├── models/
    │       └── services/
    └── spring-boot-service/      # Java Spring Boot Core Gateway & DB (Port 8080)

## 🚀 The 7 Opportunity Domains

1. **Government Jobs**
2. **Government Examinations**
3. **Private Sector Roles**
4. **Higher Education Programs**
5. **Study Abroad Opportunities**
6. **Scholarships & Grants**
7. **Skill Bridging Courses**

---

## 🛠️ Quickstart (Python AI Service)

1. **Activate virtual environment:**
   ```powershell
   .\venv\Scripts\Activate.ps1