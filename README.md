# EDU-NEXIS Navigator

**AI-Powered Career & Opportunity Discovery Platform across 7 Domains**  
*(Government Jobs, Government Examinations, Private Sector Roles, Higher Education in India, Study Abroad, Scholarships & Grants, and Skill Bridging Courses)*

---

## 1. System Prerequisites & Required Software

To run this project on any new laptop, install the following tools first:

| Requirement | Recommended Version | Purpose |
| :--- | :--- | :--- |
| **Python** | `3.11+` (with `pip` & `venv`) | Runs the FastAPI AI & Recommendation Microservice (`port 8000`) |
| **Node.js & npm** | `Node 18+ LTS` / `npm 9+` | Runs the React + Vite Frontend (`port 5173`) |
| **Java JDK** | `JDK 17` or `JDK 21` | Runs the Spring Boot User & Auth Microservice (`port 8080`) |
| **Maven** | `3.9+` (or included `mvnw.cmd`) | Builds and runs the Spring Boot backend |
| **MySQL Server** | `8.0+` | Stores user accounts and authentication data (`userservice_db`) |
| **Git** | Latest | Version control and repository cloning |

### Recommended VS Code Extensions
- **Python** (`ms-python.python`) & **Pylance** (`ms-python.vscode-pylance`)
- **Extension Pack for Java** (`vscjava.vscode-java-pack`)
- **Spring Boot Extension Pack** (`vmware.vscode-boot-dev-pack`)
- **ES7+ React/Redux/React-Native snippets** (`dsznajder.es7-react-js-snippets`)

---

## 2. Project Architecture

```text
EDU-NEXIS-NAVIGATOR-main/
├── backend/
│   ├── python_ai_service/       # FastAPI AI Matching, Skill-Gap & Recommendation Engine (Port 8000)
│   │   ├── app/main.py
│   │   ├── data/opportunities.json
│   │   └── requirements.txt
│   └── spring_boot_service/     # Spring Boot JWT Auth & User Profile Service (Port 8080)
│       └── Userservice/
├── frontend/
│   └── Edu-Nexis frontend/      # React + Vite 7-Domain Explorer Dashboard (Port 5173)
├── start_app.bat                # One-click Windows launcher (Starts AI Backend + React Frontend)
├── start_backend.bat            # Starts Python FastAPI AI Microservice on Port 8000
└── start_frontend.bat           # Starts React Vite Dev Server on Port 5173