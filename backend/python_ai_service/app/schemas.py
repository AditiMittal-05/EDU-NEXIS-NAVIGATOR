from typing import List, Optional
from pydantic import BaseModel, Field


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

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=2, example="ayush")
    email: str = Field(..., example="developerayush014@gmail.com")
    password: str = Field(..., min_length=6, example="devAyush@123")


class RegisterResponse(BaseModel):
    message: str
    username: str
    email: str
    mongo_id: Optional[str] = None

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=2, example="ayush")
    password: str = Field(..., min_length=4, example="devAyush@123")


class LoginResponse(BaseModel):
    token: str
    type: str = "Bearer"
    username: str

class UserProfileResponse(BaseModel):
    username: str
    email: str
    registered_at: Optional[str] = None
    last_login_at: Optional[str] = None