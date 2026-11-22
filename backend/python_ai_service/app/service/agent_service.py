import json
import re

import httpx

from app.repository import load_opportunities, save_opportunities
from concurrent.futures import ThreadPoolExecutor
from typing import List, Optional
from typing_extensions import TypedDict

from app.config import TAVILY_API_KEY
from app.llm_provider import chat_completion
from app.repository import (
    load_opportunities,
    save_opportunities,
    upsert_opportunities_to_mongo,
)
from app.schemas import AgentDiscoveryRequest, OpportunityBatch


def run_discovery_agent() -> dict:
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
        save_opportunities(updated_items)
    else:
        updated_items = existing_items

    return {
        "agent_status": "completed",
        "newly_discovered": len(newly_added),
        "total_opportunities": len(updated_items),
        "added_titles": [item["title"] for item in newly_added],
    }

ROUTE_BY_DOMAIN = {
    "govt_jobs": "/government?tab=Job",
    "govt_exams": "/government?tab=Exam",
    "private_roles": "/private-jobs",
    "higher_ed": "/higher-education?tab=India",
    "study_abroad": "/higher-education?tab=Abroad",
    "scholarships": "/scholarships-courses?tab=Scholarship",
    "skill_courses": "/scholarships-courses?tab=Course",
}

class AgentState(TypedDict):
    profile: dict
    search_queries: List[str]
    raw_web_content: str
    extracted_opportunities: List[dict]


# ==============================================================================
# STAGE 1: Query Generator (LLM)
# ==============================================================================
def _generate_queries(profile: dict) -> List[str]:
    prompt = f"""
    You are an academic and career opportunity research agent in India (current year: 2026).
    Generate 5 targeted web search queries to discover active 2026-2027 opportunities for a candidate with:
    - Degree & Major: {profile['degree']}
    - Skills: {', '.join(profile['skills'])}
    - Career Goal: {profile['goal']}

    Cover these streams across the 5 queries:
    1. Indian Government Technical Jobs (ISRO ICRB, DRDO RAC, BARC OCES, NIC, GATE PSU recruitment 2026 2027)
    2. Government Competitive Examinations (GATE 2027, UPSC ESE, SSC CGL, UGC NET)
    3. Private Sector Software & AI Engineering Roles / University Grad Hiring India 2026 2027
    4. Higher Education & Study Abroad Programs (M.Tech IITs, MS abroad, DAAD, Erasmus Mundus)
    5. National & International Scholarships / Industry Skill Certifications (PMRF, AICTE, Google/AWS certs)

    Output ONLY the 5 search queries, one per line, without numbering or bullet symbols.
    """
    resp = chat_completion([{"role": "user", "content": prompt}], temperature=0.2)
    queries = [q.strip("-•12345. ").strip() for q in resp.splitlines() if q.strip()]
    return queries[:5]


# ==============================================================================
# STAGE 2: Parallel Web Search & Markdown Crawler (Tavily REST API)
# ==============================================================================
def _crawl_web_parallel(queries: List[str]) -> str:
    if not TAVILY_API_KEY or "YOUR_" in TAVILY_API_KEY:
        raise ValueError("Valid TAVILY_API_KEY not configured in app/config.py.")

    def _search_single(query: str) -> str:
        try:
            with httpx.Client(timeout=20.0) as client:
                res = client.post(
                    "https://api.tavily.com/search",
                    json={
                        "api_key": TAVILY_API_KEY,
                        "query": query,
                        "search_depth": "advanced",
                        "max_results": 2,
                    },
                )
                res.raise_for_status()
                data = res.json()
                chunks = []
                for r in data.get("results", []):
                    chunks.append(
                        f"Source URL: {r.get('url', '')}\n"
                        f"Title: {r.get('title', '')}\n"
                        f"Content: {r.get('content', '')}\n---"
                    )
                return "\n".join(chunks)
        except Exception:
            return ""

    with ThreadPoolExecutor(max_workers=5) as executor:
        results = list(executor.map(_search_single, queries))

    return "\n".join(r for r in results if r)


# ==============================================================================
# STAGE 3: Structured Extraction + Deterministic Filter (Pydantic + LLM)
# ==============================================================================
def _extract_structured_opportunities(raw_web_content: str, profile: dict) -> List[dict]:
    if not raw_web_content.strip():
        return []

    schema_json = json.dumps(OpportunityBatch.model_json_schema(), indent=2)
    prompt = f"""
    Extract real, verifiable career, exam, education, and scholarship opportunities from the crawled web content below.
    Return ONLY valid JSON conforming strictly to this JSON Schema:
    {schema_json}

    Rules:
    - Normalize percentages to a 10-point CGPA scale (e.g., 60% -> 6.0, 65% -> 6.5). If unspecified, use 0.0.
    - If max_age is unspecified, use 35 for govt roles and 45 for general roles/courses.
    - Ensure `required_skills` and `degree_keywords` are lowercase lists.
    - Do NOT invent fake deadlines or organizations not grounded in the provided text.

    Crawled Web Content:
    {raw_web_content[:18000]}
    """
    raw_json_text = chat_completion(
        [{"role": "user", "content": prompt}],
        temperature=0.0,
        json_mode=True,
    )

    # Strip markdown code fences if a provider wraps the JSON
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw_json_text.strip())
    batch = OpportunityBatch.model_validate_json(cleaned)

    user_cgpa = float(profile.get("cgpa") or 0.0)
    if user_cgpa > 10.0:
        user_cgpa = round(user_cgpa / 10.0, 2)
    user_age = int(profile.get("age") or 22)

    valid_items = []
    for item in batch.opportunities:
        if item.min_cgpa <= user_cgpa and item.max_age >= user_age:
            record = item.model_dump()
            record["route"] = ROUTE_BY_DOMAIN.get(record["domain_id"], record["route"])
            valid_items.append(record)

    return valid_items


def _fallback_curated_batch() -> List[dict]:
    return [
        {
            "id": "barc-oces-dgfs-2027",
            "domain_id": "govt_jobs",
            "domain_label": "GOVERNMENT JOBS",
            "title": "BARC Scientific Officer (OCES / DGFS-2027)",
            "organization": "Bhabha Atomic Research Centre (Dept. of Atomic Energy)",
            "min_cgpa": 6.5,
            "max_age": 26,
            "required_skills": ["c++", "python", "algorithms", "operating systems", "physics", "maths"],
            "degree_keywords": ["b.tech", "b.e", "m.sc", "computer science", "information technology", "physics"],
            "criteria_summary": "B.E./B.Tech or M.Sc. (60%+) | Online Exam / GATE Score + Selection Interview",
            "description": "Group 'A' Gazetted Scientific Officer role in nuclear engineering, supercomputing, and R&D centres.",
            "deadline": "Application Window: Jan - Feb 2027",
            "route": "/government?tab=Job",
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
            "degree_keywords": ["b.tech", "b.e", "m.sc", "m.tech", "computer science", "information technology"],
            "criteria_summary": "CGPA 8.0+ | Rs 70,000 - Rs 80,000/month Fellowship + Rs 2 Lakh/yr Research Grant",
            "description": "Premier national doctoral fellowship for direct admission into PhD research at IITs and IISc.",
            "deadline": "Bi-Annual Selection Cycle",
            "route": "/scholarships-courses?tab=Scholarship",
        },
    ]


def run_discovery_agent(seed_profile: Optional[AgentDiscoveryRequest] = None) -> dict:
    existing_items = load_opportunities()
    existing_ids = {item["id"] for item in existing_items}

    profile_dict = (
        seed_profile.model_dump()
        if seed_profile
        else AgentDiscoveryRequest().model_dump()
    )

    mode_used = "agentic_live_web_research"
    try:
        queries = _generate_queries(profile_dict)
        raw_web = _crawl_web_parallel(queries)
        discovered_batch = _extract_structured_opportunities(raw_web, profile_dict)
        if not discovered_batch:
            discovered_batch = _fallback_curated_batch()
            mode_used = "curated_fallback_empty_crawl"
    except Exception as exc:
        discovered_batch = _fallback_curated_batch()
        mode_used = f"curated_fallback ({str(exc)})"

    newly_added = [item for item in discovered_batch if item["id"] not in existing_ids]

    if newly_added:
        updated_items = existing_items + newly_added
        save_opportunities(updated_items)
    else:
        updated_items = existing_items

    try:
        upsert_opportunities_to_mongo(updated_items)
    except Exception:
        pass

    return {
        "agent_status": "completed",
        "pipeline_mode": mode_used,
        "newly_discovered": len(newly_added),
        "total_opportunities": len(updated_items),
        "added_titles": [item["title"] for item in newly_added],
    }