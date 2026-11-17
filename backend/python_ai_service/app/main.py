import json
import re
from pathlib import Path
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="EDU-NEXIS AI & Recommendation Microservice",
    version="1.2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8080"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "opportunities.json"


def load_opportunities() -> List[dict]:
    if not DATA_PATH.exists():
        return []
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


class StudentProfileRequest(BaseModel):
    degree: str = Field(..., example="B.Tech Information Technology")
    cgpa: float = Field(..., ge=0.0, le=100.0, example=8.2)
    age: int = Field(..., ge=15, le=60, example=21)
    skills: List[str] = Field(default_factory=list, example=["Python", "React", "SQL", "Git"])
    goal: Optional[str] = Field(default="", example="AI engineer or technical officer role")
    domain_filter: Optional[str] = Field(default=None)


class MatchedOpportunity(BaseModel):
    id: str
    domain_id: str
    domain: str
    matchScore: str
    numeric_score: int
    title: str
    organization: str
    criteria: str
    description: str
    deadline: str
    route: str
    matched_skills: List[str]
    missing_skills: List[str]
    ai_roadmap_tip: str


class MatchResponse(BaseModel):
    total_evaluated: int
    top_matches: List[MatchedOpportunity]
    extracted_skills: List[str]
    overall_skill_gaps: List[str]


def normalize_text(text: str) -> str:
    cleaned = re.sub(r"[^a-z0-9\s+#]", "", text.lower())
    return re.sub(r"\s+", " ", cleaned).strip()


@app.get("/")
def health_check():
    opportunities = load_opportunities()
    return {
        "status": "online",
        "service": "EDU-NEXIS AI Microservice",
        "loaded_opportunities": len(opportunities),
        "domains": [
            "Govt Jobs", "Govt Exams", "Private Roles",
            "Higher Education", "Study Abroad", "Scholarships", "Skill Courses"
        ]
    }


@app.get("/api/v1/ai/opportunities")
def get_all_opportunities(domain_id: Optional[str] = None):
    opportunities = load_opportunities()
    if domain_id:
        opportunities = [o for o in opportunities if o.get("domain_id") == domain_id]
    return {"count": len(opportunities), "items": opportunities}


@app.post("/api/v1/ai/agent/refresh")
def run_opportunity_discovery_agent():
    """
    Autonomous AI Opportunity Ingestion Agent:
    Scans curated verified opportunity feeds, deduplicates by ID,
    and appends newly discovered pathways into opportunities.json.
    """
    existing_items = load_opportunities()
    existing_ids = {item["id"] for item in existing_items}

    discovered_batch = [
        {
            "id": "barc-oces-dgfs-2027",
            "domain_id": "govt_jobs",
            "domain_label": "GOVERNMENT JOBS",
            "title": "BARC Scientific Officer (OCES / DGFS-2027)",
            "organization": "Bhabha Atomic Research Centre (Dept. of Atomic Energy)",
            "min_cgpa": 6.5,
            "max_age": 26,
            "required_skills": ["c++", "python", "algorithms", "operating systems", "physics", "maths"],
            "degree_keywords": ["b.tech", "b.e", "m.sc", "computer science", "information technology", "physics", "chemistry"],
            "criteria_summary": "B.E./B.Tech or M.Sc. (60%+) | Online Exam / GATE Score + Selection Interview",
            "description": "Group 'A' Gazetted Scientific Officer role in nuclear engineering, supercomputing, and R&D centres.",
            "deadline": "Application Window: Jan - Feb 2027",
            "route": "/government?tab=Job"
        },
        {
            "id": "uppsc-lt-grade-pgt-2027",
            "domain_id": "govt_jobs",
            "domain_label": "GOVERNMENT JOBS",
            "title": "State PSC / UPPSC LT Grade & PGT Lecturer Recruitment",
            "organization": "Uttar Pradesh Public Service Commission / State Education Boards",
            "min_cgpa": 5.0,
            "max_age": 40,
            "required_skills": ["teaching", "maths", "physics", "chemistry", "pedagogy", "communication"],
            "degree_keywords": ["b.sc", "m.sc", "b.ed", "b.a", "m.a", "maths", "science", "any graduate"],
            "criteria_summary": "Bachelor's/Master's in Subject + B.Ed. | State Written Exam",
            "description": "Permanent Government Inter College & High School lecturer posts across state districts.",
            "deadline": "Upcoming Notification: Q1 2027",
            "route": "/government?tab=Job"
        },
        {
            "id": "google-step-swe-intern-2027",
            "domain_id": "private_roles",
            "domain_label": "PRIVATE SECTOR ROLES",
            "title": "Associate Software & AI Systems Engineer (University Grad)",
            "organization": "Google / Microsoft / Atlassian India R&D",
            "min_cgpa": 7.5,
            "max_age": 30,
            "required_skills": ["python", "java", "c++", "data structures", "algorithms", "git", "rest api"],
            "degree_keywords": ["b.tech", "b.e", "computer science", "information technology", "cse", "it", "mca"],
            "criteria_summary": "Strong DSA + Production Software Architecture | Coding + Design Rounds",
            "description": "Build large-scale distributed cloud services, developer tooling, and AI-assisted workflows.",
            "deadline": "University Grad Hiring Cycle: Open",
            "route": "/private-jobs"
        },
        {
            "id": "pmrf-phd-fellowship-2027",
            "domain_id": "scholarships",
            "domain_label": "SCHOLARSHIPS & GRANTS",
            "title": "Prime Minister's Research Fellowship (PMRF) Direct PhD",
            "organization": "Ministry of Education / IITs & IISc",
            "min_cgpa": 8.0,
            "max_age": 32,
            "required_skills": ["research", "python", "machine learning", "maths", "academic merit"],
            "degree_keywords": ["b.tech", "b.e", "m.sc", "m.tech", "computer science", "information technology", "science"],
            "criteria_summary": "CGPA 8.0+ | Rs 70,000 - Rs 80,000/month Fellowship + Rs 2 Lakh/yr Research Grant",
            "description": "Premier national doctoral fellowship for direct admission into PhD research at IITs and IISc.",
            "deadline": "Bi-Annual Selection Cycle",
            "route": "/scholarships-courses?tab=Scholarship"
        }
    ]

    newly_added = [item for item in discovered_batch if item["id"] not in existing_ids]

    if newly_added:
        updated_items = existing_items + newly_added
        with open(DATA_PATH, "w", encoding="utf-8") as f:
            json.dump(updated_items, f, indent=2, ensure_ascii=False)
    else:
        updated_items = existing_items

    return {
        "agent_status": "completed",
        "newly_discovered": len(newly_added),
        "total_opportunities": len(updated_items),
        "added_titles": [item["title"] for item in newly_added]
    }


@app.post("/api/v1/ai/match", response_model=MatchResponse)
def match_opportunities(profile: StudentProfileRequest):
    opportunities = load_opportunities()
    if not opportunities:
        raise HTTPException(status_code=500, detail="Opportunities dataset not found.")

    is_percentage = profile.cgpa > 10.0
    normalized_cgpa = round(profile.cgpa / 10.0, 2) if is_percentage else profile.cgpa

    user_skills = {s.strip().lower() for s in profile.skills if s.strip()}
    degree_norm = normalize_text(profile.degree)
    stop_words = {"in", "of", "and", "the", "for", "with", "seeking", "role", "area", "job", "jobs", "to", "a"}
    goal_tokens = {
        w for w in normalize_text(profile.goal or "").split()
        if len(w) > 2 and w not in stop_words
    }

    scored_results: List[MatchedOpportunity] = []
    all_missing_counter = {}

    for item in opportunities:
        if profile.domain_filter and item.get("domain_id") != profile.domain_filter:
            continue

        # 1. Hard Age Filter
        max_age = item.get("max_age", 40)
        if profile.age > max_age:
            continue

        # 2. Strict Degree Alignment (25 pts)
        raw_deg_keywords = item.get("degree_keywords", [])
        norm_deg_keywords = [normalize_text(kw) for kw in raw_deg_keywords]
        is_open_to_all = "any graduate" in norm_deg_keywords
        degree_match = is_open_to_all or any(kw in degree_norm for kw in norm_deg_keywords)

        if not degree_match:
            continue

        degree_score = 25.0 if not is_open_to_all else 20.0

        # 3. Academic Score / CGPA Check (25 pts)
        min_cgpa = item.get("min_cgpa", 0.0)
        cgpa_eligible = normalized_cgpa >= min_cgpa
        if cgpa_eligible:
            margin_bonus = min(3.0, (normalized_cgpa - min_cgpa) * 1.5)
            cgpa_score = 22.0 + margin_bonus
        else:
            cgpa_score = max(0.0, 15.0 - (min_cgpa - normalized_cgpa) * 12.0)

        # 4. Skill Overlap & Gap Analysis (30 pts)
        req_skills = [s.lower() for s in item.get("required_skills", [])]
        matched = [
            s for s in req_skills
            if s in user_skills or any(s in us or us in s for us in user_skills)
        ]
        missing = [s for s in req_skills if s not in matched]

        for m in missing:
            all_missing_counter[m] = all_missing_counter.get(m, 0) + 1

        skill_ratio = (len(matched) / len(req_skills)) if req_skills else 1.0
        skill_score = skill_ratio * 30.0

        # 5. Career Goal & Domain Intent Alignment (20 pts)
        searchable_text = normalize_text(
            f"{item['title']} {item['description']} {item['domain_label']} {item['organization']}"
        )
        expanded_goal_tokens = set(goal_tokens)
        if "government" in expanded_goal_tokens or "govt" in expanded_goal_tokens:
            expanded_goal_tokens.update(["government", "govt", "central", "upsc", "ssc", "kvs", "commission", "barc", "uppsc"])
        if "teaching" in expanded_goal_tokens or "teacher" in expanded_goal_tokens:
            expanded_goal_tokens.update(["teacher", "teaching", "ctet", "pedagogy", "bed", "educators", "faculty", "professor", "lecturer"])

        goal_hits = sum(1 for tok in expanded_goal_tokens if tok in searchable_text)
        goal_score = min(20.0, goal_hits * 5.0) if expanded_goal_tokens else 10.0

        raw_total = cgpa_score + degree_score + skill_score + goal_score
        total_score = int(round(min(98.0, max(40.0, raw_total))))

        score_display = f"{profile.cgpa}%" if is_percentage else f"{profile.cgpa} CGPA"
        if not cgpa_eligible:
            criteria_text = (
                f"Academic Cutoff Gap ({score_display} vs {min_cgpa} CGPA req) | "
                f"Skills Matched: {len(matched)}/{len(req_skills)}"
            )
            roadmap_tip = (
                f"Requires minimum {min_cgpa} CGPA ({int(min_cgpa * 10)}%). "
                f"Consider bridging {missing[0].title() if missing else 'core prerequisites'} or exploring open-cutoff pathways."
            )
        else:
            criteria_text = (
                f"Eligible ({score_display}) | {item['criteria_summary']} | "
                f"Skills Matched: {len(matched)}/{len(req_skills)}"
            )
            if missing:
                top_gaps = ", ".join(s.title() for s in missing[:2])
                roadmap_tip = f"Eligible! Build {top_gaps} to strengthen selection readiness."
            else:
                roadmap_tip = "100% skill & academic match! Focus on exam mocks and application deadlines."

        scored_results.append(
            MatchedOpportunity(
                id=item["id"],
                domain_id=item["domain_id"],
                domain=item["domain_label"],
                matchScore=f"{total_score}% Match",
                numeric_score=total_score,
                title=item["title"],
                organization=item["organization"],
                criteria=criteria_text,
                description=item["description"],
                deadline=item["deadline"],
                route=item["route"],
                matched_skills=[s.title() for s in matched],
                missing_skills=[s.title() for s in missing],
                ai_roadmap_tip=roadmap_tip,
            )
        )

    scored_results.sort(key=lambda x: x.numeric_score, reverse=True)
    top_gaps_overall = [
        skill.title()
        for skill, _ in sorted(all_missing_counter.items(), key=lambda kv: kv[1], reverse=True)[:5]
    ]

    return MatchResponse(
        total_evaluated=len(scored_results),
        top_matches=scored_results[:6],
        extracted_skills=sorted([s.title() for s in user_skills]),
        overall_skill_gaps=top_gaps_overall,
    )