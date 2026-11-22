from email import message
from typing import List, Optional
from pydantic import BaseModel, Field
from typing import Literal

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

class LogoutResponse(BaseModel):
    message:str
    username:Optional[str] = None

class OpportunityItem(BaseModel):
    id: str = Field(description="Slugified unique ID, e.g., isro-icrb-sc-2026")
    domain_id: Literal[
        "govt_jobs",
        "govt_exams",
        "private_roles",
        "higher_ed",
        "study_abroad",
        "scholarships",
        "skill_courses",
    ]
    domain_label: str = Field(description="Uppercase domain label, e.g., GOVERNMENT JOBS")
    title: str
    organization: str
    min_cgpa: float = Field(default=0.0, description="Minimum CGPA on a 10-point scale (convert % by dividing by 10)")
    max_age: int = Field(default=40, description="Maximum eligible age in years")
    required_skills: List[str] = Field(default_factory=list, description="Lowercase technical/domain skills")
    degree_keywords: List[str] = Field(default_factory=list, description="Lowercase eligible degree/branch keywords")
    criteria_summary: str = Field(description="Short pipe-separated eligibility summary")
    description: str = Field(description="1-2 sentence overview of the opportunity")
    deadline: str = Field(description="Application window or deadline")
    route: str = Field(
        description=(
            "Exact frontend route matching domain_id: "
            "govt_jobs -> '/government?tab=Job', "
            "govt_exams -> '/government?tab=Exam', "
            "private_roles -> '/private-jobs', "
            "higher_ed -> '/higher-education?tab=India', "
            "study_abroad -> '/higher-education?tab=Abroad', "
            "scholarships -> '/scholarships-courses?tab=Scholarship', "
            "skill_courses -> '/scholarships-courses?tab=Course'"
        )
    )


class OpportunityBatch(BaseModel):
    opportunities: List[OpportunityItem]


class AgentDiscoveryRequest(BaseModel):
    degree: Optional[str] = Field(default="B.Tech Computer Science / Information Technology")
    cgpa: Optional[float] = Field(default=8.0)
    age: Optional[int] = Field(default=22)
    skills: List[str] = Field(default_factory=lambda: ["Python", "Java", "SQL", "Algorithms"])
    goal: Optional[str] = Field(default="Software Engineer, Government Technical Officer, or Research Fellowship")

    

