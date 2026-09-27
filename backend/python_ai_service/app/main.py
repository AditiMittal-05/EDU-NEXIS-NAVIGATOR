from fastapi import FastAPI

app = FastAPI(title="EDU-NEXIS AI & Recommendation Microservice")

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "EDU-NEXIS AI Microservice",
        "domains": [
            "Govt Jobs", "Govt Exams", "Private Roles",
            "Higher Education", "Study Abroad", "Scholarships", "Skill Courses"
        ]
    }
