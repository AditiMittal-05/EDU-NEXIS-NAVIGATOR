from typing import Optional
from fastapi import APIRouter, HTTPException
from app.config import SUPPORTED_DOMAINS
from app.repository import load_opportunities
from app.schemas import MatchResponse, StudentProfileRequest
from app.service.agent_service import run_discovery_agent
from app.service.matching_service import evaluate_student_matches

router = APIRouter()


from typing import Optional
from fastapi import APIRouter, Body, HTTPException
from app.config import SUPPORTED_DOMAINS
from app.repository import load_opportunities
from app.schemas import AgentDiscoveryRequest, MatchResponse, StudentProfileRequest
from app.service.agent_service import run_discovery_agent
from app.service.matching_service import evaluate_student_matches

router = APIRouter()


@router.get("/")
def health_check():
    opportunities = load_opportunities()
    return {
        "status": "online",
        "service": "EDU-NEXIS AI Microservice",
        "loaded_opportunities": len(opportunities),
        "domains": SUPPORTED_DOMAINS,
    }


@router.get("/api/v1/ai/opportunities")
def get_all_opportunities(domain_id: Optional[str] = None):
    opportunities = load_opportunities()
    if domain_id:
        opportunities = [o for o in opportunities if o.get("domain_id") == domain_id]
    return {"count": len(opportunities), "items": opportunities}


@router.post("/api/v1/ai/agent/refresh")
def trigger_opportunity_discovery_agent(
    seed_profile: Optional[AgentDiscoveryRequest] = Body(default=None),
):
    """
    Autonomous LangGraph + Tavily Opportunity Ingestion Agent:
    Generates targeted queries from student profile, crawls live notifications,
    extracts structured OpportunityItem records via LLM, deduplicates,
    and saves into opportunities.json + MongoDB.
    """
    return run_discovery_agent(seed_profile)


@router.post("/api/v1/ai/match", response_model=MatchResponse)
def match_opportunities(profile: StudentProfileRequest):
    opportunities = load_opportunities()
    if not opportunities:
        raise HTTPException(status_code=500, detail="Opportunities dataset not found.")

    return evaluate_student_matches(profile, opportunities)